class LogicalCircuit {
  #json = {};

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
    "NOR": "||",
    "NAND": "&&"
  };

  constructor() {
  }

  setJSON(json) {
    this.#json = JSON.parse(JSON.stringify(json));
  }

  getJSON() {
    return JSON.parse(JSON.stringify(this.#json));
  }

  simplify() {
    if (this.isValid()) {
      var inputs = Object.keys(this.#json).filter(name => this.#json[name].type === "IN");

      var newJSON = {};
      var passed = true;
      inputs.forEach(input => newJSON[input] = {"type": "IN"});

      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => {
        var minterms = this.#getMinTerms(name, inputs);
        var implicants = this.#combine(minterms);
        var mintermsOccurrences = this.#getMintermsOccurrences(minterms, implicants);
        var essentials = this.#getEssentials(implicants, mintermsOccurrences);

        newJSON[name] = {"type": "OUT", "from": [this.#getSimplified(newJSON, inputs, essentials)]};
        passed &= this.#testSimplified(name, newJSON, inputs);
      });

      if (passed) {
        this.#json = newJSON;
      }
      return !!passed;
    } else {
      return false;
    }
  }

  #getMinTerms(name, inputs) {
    var minterms = {};
    for (var index = 0; index < Math.pow(2, inputs.length); index++) {
      var parameters = {};
      var binary = index.toString(2).padStart(inputs.length, "0");
      inputs.forEach((input, idx) => parameters[input] = !!parseInt(binary[idx]));

      if (this.computeExpression(name, parameters)) {
        minterms["" + index] = binary;
      }
    }
    return minterms;
  }

  #combine(minterms) {
    var implicants = {};
    var atLestOneCombined = false;

    Object.keys(minterms).forEach(m1 => {
      var combined = false;
      Object.keys(minterms).forEach(m2 => {
        var count = 0;
        var newTerm = minterms[m1];
        for (var index = 0; index < newTerm.length; index++) {
          if (newTerm[index] !== minterms[m2][index]) {
            newTerm = newTerm.substring(0, index) + "-" + newTerm.substring(index + 1);
            count++;
          }
        }

        if (count === 1) {
          combined = true;
          atLestOneCombined = true;
          if (!Object.keys(implicants).some(key => implicants[key] === newTerm)) {
            implicants[m1 + "," + m2] = newTerm;
          }
        }
      });

      if (!combined) {
        implicants[m1] = minterms[m1];
      }
    });

    return atLestOneCombined ? this.#combine(implicants) : implicants;
  }

  #getMintermsOccurrences(minterms, implicants) {
    var mintermsOccurrences = {};
    Object.keys(minterms).forEach(minterm => mintermsOccurrences[minterm] = Object.keys(implicants).flatMap(implicant => implicant.split(",")).filter(element => element === minterm).length);
    return mintermsOccurrences;
  }

  #getEssentials(implicants, mintermsOccurrences) {
    var essentials = {};
    var found = true;
    while (found) {
      found = false;
      Object.keys(mintermsOccurrences).filter(occurrence => mintermsOccurrences[occurrence] === 1).forEach(occurrence => {
        found = true;
        delete mintermsOccurrences[occurrence];

        Object.keys(implicants).filter(implicant => implicant.split(",").includes(occurrence)).forEach(implicant => {
          essentials[implicant] = implicants[implicant];
          delete implicants[implicant];
        });
      });
    }
    return essentials;
  }

  #getSimplified(newJSON, inputs, essentials) {
    var uniqueName = this.#getUniqueName();
    newJSON[uniqueName] = {"type": "OR", "from": []};

    Object.keys(essentials).forEach(im => {
      var uniqueNameAND = this.#getUniqueName();
      newJSON[uniqueNameAND] = {"type": "AND", "from": []};

      for (var index = 0; index < essentials[im].length; index++) {
        switch (essentials[im][index]) {
          case "0":
            var uniqueNameNOT = this.#getUniqueName();
            newJSON[uniqueNameNOT] = {"type": "NOT", "from": [inputs[index]]};
            newJSON[uniqueNameAND].from.push(uniqueNameNOT);
            break;
          case "1":
            newJSON[uniqueNameAND].from.push(inputs[index]);
            break;
          case "-":
            break;
        }
      }

      newJSON[uniqueName].from.push(uniqueNameAND);
    });


    return uniqueName;
  }

  #testSimplified(name, newJSON, inputs) {
    var oldJSON = this.#json;

    var passed = true;
    for (var index = 0; index < Math.pow(2, inputs.length); index++) {
      var parameters = {};
      var binary = index.toString(2).padStart(inputs.length, "0");
      inputs.forEach((input, idx) => parameters[input] = !!parseInt(binary[idx]));

      var oldT = this.computeExpression(name, parameters);
      this.#json = newJSON;
      var newT = this.computeExpression(name, parameters);
      this.#json = oldJSON;
      passed &= oldT === newT;
    }
    return !!passed;
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

    if (this.isValid()) {
      var toEval = "";
      var expressions = this.getJavaScriptExpression(name);
      if (expressions.xor) {
        toEval = "var xor = " + expressions.xor + ";\n";
      }
      for (var property in parameters) {
        toEval += "var " + property + " = " + parameters[property] + ";\n";
      }
      toEval += "result = " + expressions[name] + ";";
      eval(toEval);
    }

    return result;
  }

  getJavaScriptExpressions() {
    var expressions = {};

    if (this.isValid()) {
      if (Object.keys(this.#json).some(name => ["XOR", "NXOR"].includes(this.#json[name].type))) {
        expressions.xor = "(...a)=>a.filter(e=>e).length==1";
      }

      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.#buildExpression(this.#json[name].from[0], false));
    }

    return expressions;
  }

  getJavaScriptExpression(name) {
    var expressions = {};

    if (this.isValid() && this.#json[name] && this.#json[name].type === "OUT") {
      if (Object.keys(this.#json).some(name => ["XOR", "NXOR"].includes(this.#json[name].type))) {
        expressions.xor = "(...a)=>a.filter(e=>e).length==1";
      }

      expressions[name] = this.#buildExpression(this.#json[name].from[0], false);
    }

    return expressions;
  }

  #buildExpression(name, needBrackets) {
    if (this.#json[name].type === "IN") {
      return name;
    } else if (this.#json[name].type === "NOT") {
      return "!" + this.#buildExpression(this.#json[name].from[0], true);
    } else {
      var array = [];
      switch (this.#json[name].type) {
        case "OR":
        case "AND":
        case "NOR":
        case "NAND":
          this.#json[name].from.forEach(element => array.push(this.#buildExpression(element, true)));
          break;
        case "XOR":
        case "NXOR":
          this.#json[name].from.forEach(element => array.push(this.#buildExpression(element, false)));
          break;
      }

      switch (this.#json[name].type) {
        case "OR":
        case "AND":
          return (needBrackets ? "(" : "") + array.join(this.#operatorSymbols[this.#json[name].type]) + (needBrackets ? ")" : "");
        case "NOR":
        case "NAND":
          return "!(" + array.join(this.#operatorSymbols[this.#json[name].type]) + ")";
        case "XOR":
          return "xor(" + array.join(",") + ")";
        case "NXOR":
          return "!xor(" + array.join(",") + ")";
      }
    }
  }

  isValid() {
    var valid = true;
    Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => valid &= this.#isConnected(name));
    return !!valid;
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
    return "LogicalCircuit_Operator_" + new Date().getTime() + "_" + parseInt(Math.random() * 1000);
  }

  incConnector(name) {
    if (this.#json[name] && this.#json[name].type !== "OUT" && this.#json[name].type !== "NOT" && this.#json[name].from) {
      this.#json[name].from.push("");
    }
  }

  decConnector(name) {
    if (this.#json[name] && this.#json[name].type !== "OUT" && this.#json[name].type !== "NOT" && this.#json[name].from && this.#json[name].from.length > 2) {
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
    if (operators.includes(startName)) {
      return true;
    } else {
      var connected = false;
      operators.forEach(name => connected |= this.#areConnected(startName, name));
      return connected;
    }
  }

  removeConnection(name, index) {
    if (this.#json[name] && 0 <= index && index < this.#json[name].from.length) {
      this.#json[name].from[index] = "";
    }
  }

  remove(name) {
    if (this.#json[name]) {
      delete this.#json[name];

      for (var property in this.#json) {
        switch (this.#json[property].type) {
          case "IN":
            break;
          case "OUT":
          default:
            this.#json[property].from = this.#json[property].from.map(element => element === name ? "" : element);
            break;
        }
      }
    }
  }

  clear() {
    this.#json = {};
  }

  getType(name) {
    return this.#json[name] ? this.#json[name].type : "";
  }

  getFrom(name) {
    if (this.#json[name]) {
      switch (this.#json[name].type) {
        case "IN":
          return [];
        case "OUT":
        default:
          return this.#json[name].from.slice();
      }
    } else {
      return [];
    }
  }

  isNameValid(name) {
    return typeof name === 'string' ? /^[a-z]+[a-z0-9_]*$/i.test(name) && !this.#blackListNames.includes(name.toUpperCase()) : false;
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