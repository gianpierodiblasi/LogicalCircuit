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

  simplify() {
    if (!this.#simplifier || !this.isValid()) {
      return false;
    } else {
      var newJSON = {};
      Object.keys(this.#json).filter(name => this.#json[name].type === "IN").forEach(input => newJSON[input] = {"type": "IN"});

      var canSimplify = true;
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => {
        var inputs = [];
        this.#findInputs(name, inputs);

        var minterms = [];
        for (var index = 0; index < Math.pow(2, inputs.length); index++) {
          var parameters = {};
          var binary = index.toString(2).padStart(inputs.length, "0");
          inputs.forEach((input, idx) => parameters[input] = !!parseInt(binary[idx]));

          if (this.computeExpression(name, parameters)) {
            minterms.push(index);
          }
        }

        newJSON[name] = {"type": "OUT", "from": []};
        try {
          var expression = this.#simplifier(minterms);
          this.#getSimplified(newJSON, name, inputs, expression);
        } catch (exception) {
          canSimplify = false;
        }
      });

      if (canSimplify) {
        this.#json = newJSON;
      }
      return canSimplify;
    }
  }

  #findInputs(name, array) {
    if (this.#json[name].type === "IN") {
      if (!array.includes(name)) {
        array.push(name);
      }
    } else if (this.#json[name].type === "NOT") {
      this.#findInputs(this.#json[name].from[0], array);
    } else {
      this.#json[name].from.forEach(element => this.#findInputs(element, array));
    }
  }

  #getSimplified(newJSON, name, inputs, expression) {
    expression = expression.split(" OR ");

    if (expression.length === 1) {
      this.#getSimplifiedSubExpression(newJSON, name, inputs, expression[0]);
    } else {
      var uniqueName = this.#getUniqueName("OR");
      newJSON[uniqueName] = {"type": "OR", "from": []};
      expression.forEach(subExpression => this.#getSimplifiedSubExpression(newJSON, uniqueName, inputs, subExpression));
      newJSON[name].from.push(uniqueName);
    }
  }

  #getSimplifiedSubExpression(newJSON, uniqueName, inputs, subExpression) {
    subExpression = subExpression.replace("(", "").replace(")", "").split(" AND ");
    if (subExpression.length === 1) {
      this.#getSimplifiedElement(newJSON, uniqueName, inputs, subExpression[0]);
    } else {
      var uniqueNameSub = this.#getUniqueName("AND");
      newJSON[uniqueNameSub] = {"type": "AND", "from": []};
      subExpression.forEach(element => this.#getSimplifiedElement(newJSON, uniqueNameSub, inputs, element));
      newJSON[uniqueName].from.push(uniqueNameSub);
    }
  }

  #getSimplifiedElement(newJSON, uniqueName, inputs, element) {
    if (element.startsWith("NOT ")) {
      var uniqueNameNOT = this.#getUniqueName("NOT");
      newJSON[uniqueNameNOT] = {"type": "NOT", "from": [inputs[element.charCodeAt(4) - 65]]};
      newJSON[uniqueName].from.push(uniqueNameNOT);
    } else {
      newJSON[uniqueName].from.push(inputs[element.charCodeAt(0) - 65]);
    }
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
    var name = this.#getUniqueName(operator);
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

  #getUniqueName(operator) {
    return "$_" + operator.padEnd(4, "_") + new Date().getTime() + "_" + parseInt(Math.random() * 10000).toFixed(0).padStart(4, "0");
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

  addConnection(startName, endName, endIndex) {
    if (this.isConnectionValid(startName, endName) && 0 <= endIndex && endIndex < this.#json[endName].from.length) {
      this.#json[endName].from[endIndex] = startName;
    }
  }

  isConnectionValid(startName, endName) {
    if (startName === endName || !this.#json[startName] || !this.#json[endName]) {
      return false;
    } else if (this.#json[startName].type === "IN") {
      return this.#json[endName].type !== "IN";
    } else if (this.#json[startName].type === "OUT") {
      return false;
    } else if (this.#json[endName].type === "IN") {
      return false;
    } else if (this.#json[endName].type === "OUT") {
      return true;
    } else {
      return !this.#areConnected(startName, endName);
    }
  }

  #areConnected(startName, endName) {
    var operators = Object.keys(this.#json).filter(name => this.#operatorTypes.includes(this.#json[name].type) && this.#json[name].from.includes(endName));
    return operators.includes(startName) || operators.reduce((acc, name) => acc || this.#areConnected(startName, name), false);
  }

  removeConnection(name, index) {
    if (this.#json[name] && this.#json[name].from && 0 <= index && index < this.#json[name].from.length) {
      this.#json[name].from[index] = "";
    }
  }

  remove(name) {
    if (this.#json[name]) {
      delete this.#json[name];
      Object.keys(this.#json).filter(property => this.#json[property].type !== "IN").forEach(property => this.#json[property].from = this.#json[property].from.map(element => element === name ? "" : element));
    }
  }

  clear() {
    this.#json = {};
  }

  getType(name) {
    return this.#json[name] ? this.#json[name].type : "";
  }

  getFrom(name) {
    return this.#json[name] && this.#json[name].type !== "IN" ? this.#json[name].from.slice() : [];
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