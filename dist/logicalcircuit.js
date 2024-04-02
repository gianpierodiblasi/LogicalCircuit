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

//  getJavaScriptExpression() {
//    if (!this.isValid()) {
//      return false;
//    } else {
//
//    }
//  }
//
//  isValid() {
//
//  }

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
    if (this.#json[name] && this.#json[name].type !== "OUT" && this.#json[name].from) {
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

  addConnection(startName, isStartSource, startIndex, endName, isEndSource, endIndex) {
    if (!this.isConnectionValid(startName, isStartSource, endName, isEndSource)) {
    } else if (isStartSource) {
      this.#privateAddConnection(startName, endName, endIndex);
    } else if (isEndSource) {
      this.#privateAddConnection(endName, startName, startIndex);
    }
  }

  #privateAddConnection(start, end, index) {
    if (0 <= index && index < this.#json[end].from.length) {
      this.#json[end].from[index] = start;
    }
  }

  isConnectionValid(startName, isStartSource, endName, isEndSource) {
    return startName !== endName && !!(isStartSource ^ isEndSource) && !this.#isLoop(startName, isStartSource, endName, isEndSource);
  }

  #isLoop(startName, isStartSource, endName, isEndSource) {
    if (!isStartSource && isEndSource) {
      return this.#areConnected(startName, endName);
    } else if (isStartSource && !isEndSource) {
      return this.#areConnected(endName, startName);
    } else {
      return false;
    }
  }

  #areConnected(startName, endName) {
    var operators = Object.keys(this.#json).filter(name => this.#operatorTypes.includes(this.#json[name].type) && this.#json[name].from.includes(startName));
    if (operators.includes(endName)) {
      return true;
    } else {
      var connected = false;
      operators.forEach(name => connected |= this.#areConnected(name, endName));
      return connected;
    }
  }

  removeConnection(name, index) {
    if (0 <= index && index < this.#json[name].from.length) {
      this.#json[name].from[index] = "";
    }
  }

  remove(name) {
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

