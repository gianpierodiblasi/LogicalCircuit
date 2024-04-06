class LogicalCircuitCore {
  #json = {};
  #simplifier;

  #blackListNames = [
    "OR", "NOR", "AND", "NAND", "XOR", "NXOR", "NOT",
    "BREAK", "CASE", "CATCH", "CLASS", "CONST", "CONTINUE", "DEBUGGER", "DEFAULT", "DELETE", "DO", "ELSE", "EXPORT", "EXTENDS", "FALSE", "FINALLY", "FOR", "FUNCTION", "IF", "IMPORT", "IN", "INSTANCEOF", "NEW", "NULL", "RETURN", "SUPER", "SWITCH", "THIS", "THROW", "TRUE", "TRY", "TYPEOF", "VAR", "VOID", "WHILE", "WITH",
    "LET", "STATIC", "YIELD", "AWAIT", "ENUM",
    "IMPLEMENTS", "INTERFACE", "PACKAGE", "PRIVATE", "PROTECTED", "PUBLIC", "ABSTRACT", "BOOLEAN", "BYTE", "CHAR", "DOUBLE", "FINAL", "FLOAT", "GOTO", "INT", "LONG", "NATIVE", "SHORT", "SYNCHRONIZED", "THROWS", "TRANSIENT", "VOLATILE", "ARGUMENTS", "AS", "ASYNC", "EVAL", "FROM", "GET", "OF", "SET"
  ];

  #operatorTypes = ["OR", "NOR", "AND", "NAND", "XOR", "NXOR", "NOT"];
  #operatorSymbols = {
    "OR": "||",
    "AND": "&&",
    "XOR": "+",
    "NOR": "||",
    "NAND": "&&",
    "NXOR": "+"
  };
  #comparatorSymbols = {
    "OR": "",
    "AND": "",
    "XOR": "===1",
    "NOR": "",
    "NAND": "",
    "NXOR": "!==1"
  };

  constructor() {
  }

  setJSON(json) {
    this.#json = JSON.parse(JSON.stringify(json));
  }

  getJSON() {
    return JSON.parse(JSON.stringify(this.#json));
  }

  setSimplifier(simplifier) {
    this.#simplifier = simplifier;
  }

  computeExpressions(parameters) {
    var expressions = {};
    if (this.isValid()) {
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.computeExpression(name, parameters));
    }
    return expressions;
  }

  computeExpression(name, parameters) {
    var result;
    if (this.isValid() && this.#json[name] && this.#json[name].type === "OUT") {
      var toEval = Object.keys(parameters).reduce((acc, property) => acc + "var " + property + " = " + parameters[property] + ";\n", "");
      toEval += "result = " + this.getJavaScriptExpression(name) + ";";
      eval(toEval);
    }
    return result;
  }

  getJavaScriptExpressions() {
    var expressions = {};
    if (this.isValid()) {
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.#buildExpression(this.#json[name].from[0], false));
    }
    return expressions;
  }

  getJavaScriptExpression(name) {
    return this.isValid() && this.#json[name] && this.#json[name].type === "OUT" ? this.#buildExpression(this.#json[name].from[0], false) : "";
  }

  #buildExpression(name, needBrackets) {
    if (this.#json[name].type === "IN") {
      return name;
    } else if (this.#json[name].type === "NOT") {
      return "!" + this.#buildExpression(this.#json[name].from[0], true);
    } else {
      var array = this.#json[name].from.map(element => this.#buildExpression(element, true));

      switch (this.#json[name].type) {
        case "OR":
        case "AND":
        case "XOR":
        case "NXOR":
          return (needBrackets ? "(" : "") + array.join(this.#operatorSymbols[this.#json[name].type]) + this.#comparatorSymbols[this.#json[name].type] + (needBrackets ? ")" : "");
        case "NOR":
        case "NAND":
          return "!(" + array.join(this.#operatorSymbols[this.#json[name].type]) + ")";
      }
    }
  }

  isValid() {
    return Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").reduce((acc, name) => acc && this.#isConnected(name), true);
  }

  #isConnected(name) {
    var connected = true;
    this.#json[name].from.forEach(element => {
      connected &= !!element;
      if (connected && this.#json[element].type !== "IN") {
        connected &= !!this.#isConnected(element);
      }
    });
    return !!connected;
  }

  addInput(name) {
    return this.#add(name, {"type": "IN"});
  }

  addOutput(name) {
    return this.#add(name, {"type": "OUT", "from": [""]});
  }

  addOR() {
    return this.#addOperator("OR", ["", ""]);
  }

  addNOR() {
    return this.#addOperator("NOR", ["", ""]);
  }

  addAND() {
    return this.#addOperator("AND", ["", ""]);
  }

  addNAND() {
    return this.#addOperator("NAND", ["", ""]);
  }

  addXOR() {
    return this.#addOperator("XOR", ["", ""]);
  }

  addNXOR() {
    return this.#addOperator("NXOR", ["", ""]);
  }

  addNOT() {
    return this.#addOperator("NOT", [""]);
  }

  #addOperator(operator, from) {
    var name = this.#getUniqueName();
    this.#add(name, {"type": operator, "from": from});
    return name;
  }

  #add(name, json) {
    if (this.isNameValid(name) && !this.isNameAlreadyUsed(name)) {
      this.#json[name] = json;
      return true;
    } else {
      return false;
    }
  }

  #getUniqueName() {
    return "LogicalCircuitOperator_" + new Date().getTime() + "_" + parseInt(Math.random() * 1000);
  }

  incConnector(name) {
    if (this.#json[name] && !["IN", "OUT", "NOT"].includes(this.#json[name].type)) {
      this.#json[name].from.push("");
    }
  }

  decConnector(name) {
    if (this.#json[name] && !["IN", "OUT", "NOT"].includes(this.#json[name].type) && this.#json[name].from.length > 2) {
      var index = this.#json[name].from.indexOf("");
      if (index !== -1) {
        this.#json[name].from.splice(index, 1);
      } else {
        this.#json[name].from.pop();
      }
    }
  }

  isNameValid(name) {
    return typeof name === 'string' && /^[a-z]+[a-z0-9_]*$/i.test(name) && !this.#blackListNames.includes(name.toUpperCase());
  }

  isNameAlreadyUsed(name) {
    return !!this.#json[name];
  }

  addBlackListWord(name) {
    if (name) {
      this.#blackListNames.push(name.toUpperCase());
    }
  }
}