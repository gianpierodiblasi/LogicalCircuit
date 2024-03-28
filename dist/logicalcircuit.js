class LogicalCircuit {
  #structure = {
    "inputs": [],
    "operators": [],
    "outputs": []
  }

  constructor() {
  }

  addInput(name) {
    name = this.#getName(name);
    if (!name || this.#isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.inputs.push({"name": name});
      return true;
    }
  }

  addOutput(name) {
    name = this.#getName(name);
    if (!name || this.#isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.outputs.push({"name": name});
      return true;
    }
  }

  addOR(name) {
    this.#addOperator(name, "OR", ["", ""]);
  }
  
  addNOR(name) {
    this.#addOperator(name, "NOR", ["", ""]);
  }
  
  addAND(name) {
    this.#addOperator(name, "AND", ["", ""]);
  }
  
  addNAND(name) {
    this.#addOperator(name, "NAND", ["", ""]);
  }
  
  addXOR(name) {
    this.#addOperator(name, "XOR", ["", ""]);
  }
  
  addNXOR(name) {
    this.#addOperator(name, "NXOR", ["", ""]);
  }
  
  addNOT(name) {
    this.#addOperator(name, "NOT", [""]);
  }

  #addOperator(name, operator, from) {
    name = this.#getName(name);
    if (!name || this.#isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.operators.push({
        "name": name,
        "type": operator,
        "from": from
      });
      return true;
    }
  }

  #getName(name) {
    name = name === 0 ? "0" : name;
    name = name ? "" + name : "";
    return name.trim();
  }

  #isNameAlreadyUsed(name) {
    return !!this.#structure.inputs.find(input => input.name === name) ||
            !!this.#structure.operators.find(operator => operator.name === name) ||
            !!this.#structure.outputs.find(output => output.name === name);
  }
}

class LogicalCircuitUI {
  constructor() {

  }
}