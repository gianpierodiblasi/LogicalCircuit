class LogicalCircuit {
  #structure = {
    "inputs": [],
    "operators": [],
    "outputs": []
  }

  constructor() {
  }

  addInput(name) {
    name = this.#purgeName(name);
    if (!name || this.#isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.inputs.push({"name": name});
      return true;
    }
  }

  addOutput(name) {
    name = this.#purgeName(name);
    if (!name || this.#isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.outputs.push({"name": name});
      return true;
    }
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

  #getUniqueName() {
    return "LogicalCircuit_Operator_" + new Date().getTime();
  }

  #addOperator(operator, from) {
    var name = this.#getUniqueName();
    this.#structure.operators.push({
      "name": name,
      "type": operator,
      "from": from
    });
    return name;
  }

  #purgeName(name) {
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
  #logicalCircuit;

  constructor() {
    this.#logicalCircuit = new LogicalCircuit();
  }

  addInput(name, top, left) {
    var added = this.#logicalCircuit.addInput(name);

  }

  addOutput(name, top, left) {

  }

  addOR(top, left) {

  }

  addNOR(top, left) {

  }

  addAND(top, left) {

  }

  addNAND(top, left) {

  }

  addXOR(top, left) {

  }

  addNXOR(top, left) {

  }

  addNOT(top, left) {

  }
}