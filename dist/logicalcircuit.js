class LogicalCircuit {
  #json = {};

  #operatorTypes = ["OR", "NOR", "AND", "NAND", "XOR", "NXOR", "NOT"];

  constructor() {
  }

  setJSON(json) {
    this.#json = JSON.parse(JSON.stringify(json));
  }

  getJSON() {
    return JSON.parse(JSON.stringify(this.#json));
  }

  getJavaScriptExpressions() {
    var expressions = {};

    if (this.isValid()) {
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.#computeExpression(this.#json[name].from[0]));
    }

    return expressions;
  }

  #computeExpression(name) {
    if (this.#json[name].type === "IN") {
      return name;
    } else if (this.#json[name].type === "NOT") {
      return "!" + this.#computeExpression(this.#json[name].from[0]);
    } else {
      var array = [];
      this.#json[name].from.forEach(element => array.push(this.#computeExpression(element)));

      switch (this.#json[name].type) {
        case "OR":
          return "(" + array.join("||") + ")";
        case "AND":
          return "(" + array.join("&&") + ")";
        case "NOR":
          return "!(" + array.join("||") + ")";
        case "NAND":
          return "!(" + array.join("&&") + ")";
        case "XOR":
          return "([" + array.join(",") + "].filter(el=>el).length===1)";
          break;
        case "NXOR":
          return "!([" + array.join(",") + "].filter(el=>el).length===1)";
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
    return "LogicalCircuit_Operator_" + new Date().getTime();
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
    return typeof name === 'string' ? /^[a-z]+[a-z0-9_]*$/i.test(name) : false;
  }

  isNameAlreadyUsed(name) {
    return !!this.#json[name];
  }
}