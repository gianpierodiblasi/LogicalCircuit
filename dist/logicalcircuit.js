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
  #canvas;

  constructor(container, options) {
    this.#logicalCircuit = new LogicalCircuit();
  }

  addInput(name, top, left) {
    var added = this.#logicalCircuit.addInput(name);
    if (added) {
      this.#addPosition(this.#logicalCircuit.#inputs, name, top, left);
      this.#draw();
    }
    return added;
  }

  addOutput(name, top, left) {
    var added = this.#logicalCircuit.addOutput(name);
    if (added) {
      this.#addPosition(this.#logicalCircuit.#output, name, top, left);
      this.#draw();
    }
    return added;
  }

  addOR(top, left) {
    var name = this.#logicalCircuit.addOR();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addNOR(top, left) {
    var name = this.#logicalCircuit.addNOR();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addAND(top, left) {
    var name = this.#logicalCircuit.addAND();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addNAND(top, left) {
    var name = this.#logicalCircuit.addNAND();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addXOR(top, left) {
    var name = this.#logicalCircuit.addXOR();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addNXOR(top, left) {
    var name = this.#logicalCircuit.addNXOR();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  addNOT(top, left) {
    var name = this.#logicalCircuit.addNOT();
    this.#addPosition(this.#logicalCircuit.#operator, name, top, left);
    this.#draw();
    return name;
  }

  #addPosition(array, name, top, left) {
    var found = array.find(input => input.name === name);
    found.top = isNaN(top) || top < 0 || top > this.#canvas.height ? 10 : top;
    found.left = isNaN(left) || left < 0 || left > this.#canvas.width ? 10 : left;
  }

  #draw() {

  }
}