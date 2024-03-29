class LogicalCircuit {
  #structure = {
    "inputs": [],
    "operators": [],
    "outputs": []
  }

  constructor() {
  }

  get inputs() {
    return this.#structure.inputs;
  }

  get operators() {
    return this.#structure.operators;
  }

  get outputs() {
    return this.#structure.outputs;
  }

  addInput(name) {
    name = this.purgeName(name);
    if (!name || this.isNameAlreadyUsed(name)) {
      return false;
    } else {
      this.#structure.inputs.push({"name": name});
      return true;
    }
  }

  addOutput(name) {
    name = this.purgeName(name);
    if (!name || this.isNameAlreadyUsed(name)) {
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

  clear() {
    this.#structure.inputs = [];
    this.#structure.operators = [];
    this.#structure.outputs = [];
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

  purgeName(name) {
    name = name === 0 ? "0" : name;
    name = name ? "" + name : "";
    return name.trim();
  }

  isNameAlreadyUsed(name) {
    return !!this.#structure.inputs.find(input => input.name === name) ||
            !!this.#structure.operators.find(operator => operator.name === name) ||
            !!this.#structure.outputs.find(output => output.name === name);
  }
}

class LogicalCircuitUI {
  #logicalCircuit;
  #canvas;
  #ctx;

  #knobRadius = 5;
  #notRadius = 7;

  #inputGap = 20;
  #inputHeight = 40;
  #outputGap = 20;
  #outputHeight = 40;

  #operatorRadiusX = 20;
  #operatorLineWidth = 30;
  #operator1Height = 20;
  #xorGap = 12;

  constructor(container, options) {
    this.#logicalCircuit = new LogicalCircuit();

    try {
      options.showToolbar;
    } catch (exception) {
      options = {};
    }

    if (options.showToolbar) {
      var toolbar = document.createElement("div");
      toolbar.classList.add("LogicalCircuitUI_Toolbar");
      container.append(toolbar);

      this.#addButtonAndText(toolbar, "IN", (event, name) => this.addInput(name, 15, 15));
      this.#addButtonAndText(toolbar, "OUT", (event, name) => this.addOutput(name, 15, 15));
      this.#addButton(toolbar, "OR");
      this.#addButton(toolbar, "NOR");
      this.#addButton(toolbar, "AND");
      this.#addButton(toolbar, "NAND");
      this.#addButton(toolbar, "XOR");
      this.#addButton(toolbar, "NXOR");
      this.#addButton(toolbar, "NOT");
      this.#addButton(toolbar, "CLEAR", (event) => this.clear());
    }

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = isNaN(options.width) || options.width < 0 ? 800 : options.width;
    this.#canvas.height = isNaN(options.height) || options.height < 0 ? 600 : options.height;
    container.append(this.#canvas);

    this.#ctx = this.#canvas.getContext('2d');
    this.#ctx.font = "24px sans-serif";
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = 2;
    this.#ctx.lineJoin = "round";
    this.#draw();
  }

  #addButtonAndText(toolbar, label, listener) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_TextContainer");
    toolbar.append(div);

    var text = document.createElement("input");
    text.type = "text";
    div.append(text);

    text.oninput = (event) => {
      var name = this.#logicalCircuit.purgeName(text.value);
      button.disabled = !name || this.#logicalCircuit.isNameAlreadyUsed(name);
    };

    var button = document.createElement("button");
    button.textContent = label;
    button.disabled = true;
    button.onclick = (event) => listener(event, text.value);
    div.append(button);

  }

  #addButton(toolbar, label, listener) {
    var button = document.createElement("button");
    button.textContent = label;
    button.onclick = listener ? listener : (event) => this["add" + label](15, 15);
    toolbar.append(button);
  }

  addInput(name, top, left) {
    var added = this.#logicalCircuit.addInput(name);
    if (added) {
      this.#addPosition(this.#logicalCircuit.inputs, name, top, left);
      this.#draw();
    }
    return added;
  }

  addOutput(name, top, left) {
    var added = this.#logicalCircuit.addOutput(name);
    if (added) {
      this.#addPosition(this.#logicalCircuit.outputs, name, top, left);
      this.#draw();
    }
    return added;
  }

  addOR(top, left) {
    var name = this.#logicalCircuit.addOR();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addNOR(top, left) {
    var name = this.#logicalCircuit.addNOR();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addAND(top, left) {
    var name = this.#logicalCircuit.addAND();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addNAND(top, left) {
    var name = this.#logicalCircuit.addNAND();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addXOR(top, left) {
    var name = this.#logicalCircuit.addXOR();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addNXOR(top, left) {
    var name = this.#logicalCircuit.addNXOR();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  addNOT(top, left) {
    var name = this.#logicalCircuit.addNOT();
    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
    this.#draw();
    return name;
  }

  clear() {
    this.#logicalCircuit.clear();
    this.#draw();
  }

  #addPosition(array, name, top, left) {
    var found = array.find(input => input.name === name);
    found.top = isNaN(top) || top < 0 || top > this.#canvas.height ? 10 : top;
    found.left = isNaN(left) || left < 0 || left > this.#canvas.width ? 10 : left;
  }

  #draw() {
    this.#canvas.style.cursor = "default";
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#drawTrash();

    this.#logicalCircuit.inputs.forEach(input => this.#drawInput(input));
    this.#logicalCircuit.outputs.forEach(output => this.#drawOutput(output));
    this.#logicalCircuit.operators.forEach(operator => this.#drawOperator(operator));
  }

  #drawTrash() {
    this.#ctx.font = "48px sans-serif";
    this.#ctx.fillText("\u{1F5D1}", this.#canvas.width - 35, this.#canvas.height - 20);
    this.#ctx.font = "24px sans-serif";

    var gradient = this.#ctx.createRadialGradient(this.#canvas.width, this.#canvas.height, 40, this.#canvas.width, this.#canvas.height, 120);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.5, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.3)");

    this.#ctx.lineWidth = 80;
    this.#ctx.strokeStyle = gradient;
    this.#ctx.beginPath();
    this.#ctx.arc(this.#canvas.width, this.#canvas.height, 80, 0, 2 * Math.PI);
    this.#ctx.stroke();
    this.#ctx.lineWidth = 2;
    this.#ctx.strokeStyle = "black";
  }

  #drawInput(input) {
    var width = this.#ctx.measureText(input.name).width + this.#inputGap;
    var centerTop = input.top + this.#inputHeight / 2;

    input.knobCenter = {
      "x": input.left + width + this.#knobRadius,
      "y": centerTop
    };

    this.#drawText(input, width, this.#inputHeight, this.#inputGap);
    this.#drawKnob(input, "knobPath", "knobCenter");
  }

  #drawOutput(output) {
    var width = this.#ctx.measureText(output.name).width + this.#outputGap;
    var centerTop = output.top + this.#outputHeight / 2;

    output.knobCenter = {
      "x": output.left - this.#knobRadius,
      "y": centerTop
    };

    this.#drawText(output, width, this.#outputHeight, this.#outputGap);
    this.#drawKnob(output, "knobPath", "knobCenter");
  }

  #drawText(node, width, height, gap) {
    node.symbolPath = new Path2D();
    node.symbolPath.rect(node.left, node.top, width, height);
    node.symbolSize = {
      "width": width,
      "height": height
    };
    this.#ctx.stroke(node.symbolPath);
    this.#ctx.fillText(node.name, node.left + gap / 2, node.knobCenter.y);
  }

  #drawOperator(operator) {
    operator.symbolPath = new Path2D();
    operator.fromKnobPath = [];
    operator.fromKnobCenter = [];
    operator.outputKnobPath = new Path2D();

    switch (operator.type) {
      case "OR":
      case "AND":
      case "NOR":
      case "NAND":
      case "XOR":
      case "NXOR":
        var radiusY = this.#operator1Height * operator.from.length / 2;
        var width = operator.left + this.#operatorLineWidth;
        var height = operator.top + this.#operator1Height * operator.from.length;
        var centerTop = operator.top + radiusY;

        switch (operator.type) {
          case "OR":
          case "AND":
          case "XOR":
            operator.outputKnobCenter = {
              "x": width + this.#operatorRadiusX + this.#knobRadius,
              "y": centerTop
            };
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            operator.outputKnobCenter = {
              "x": width + this.#operatorRadiusX + 2 * this.#notRadius + this.#knobRadius,
              "y": centerTop
            };
            break;
        }

        var incAngle = Math.PI / (operator.from.length + 1);
        for (var index = 0; index < operator.from.length; index++) {
          switch (operator.type) {
            case "OR":
            case "NOR":
            case "XOR":
            case "NXOR":
              var angle = incAngle * (index + 1) - Math.PI / 2;
              operator.fromKnobCenter.push({
                "x": operator.left + (this.#operatorRadiusX - this.#knobRadius) * Math.cos(angle),
                "y": centerTop + (radiusY - this.#knobRadius) * Math.sin(angle),
              });
              break;
            case "AND":
            case "NAND":
              operator.fromKnobCenter.push({
                "x": operator.left - this.#knobRadius,
                "y": operator.top + this.#operator1Height / 2 + this.#operator1Height * index
              });
              break;
          }

          operator.fromKnobPath.push(this.#drawKnob(null, null, operator.fromKnobCenter[index]));
        }

        operator.symbolPath.moveTo(width, height);
        operator.symbolPath.lineTo(operator.left, height);
        switch (operator.type) {
          case "OR":
          case "NOR":
            operator.symbolPath.ellipse(operator.left, centerTop, this.#operatorRadiusX, radiusY, 0, Math.PI / 2, -Math.PI / 2, true);
            operator.symbolPath.lineTo(width, operator.top);
            operator.symbolPath.ellipse(width, centerTop, this.#operatorRadiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2);
            break;
          case "AND":
          case "NAND":
            operator.symbolPath.lineTo(operator.left, operator.top);
            operator.symbolPath.lineTo(width, operator.top);
            operator.symbolPath.ellipse(width, centerTop, this.#operatorRadiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2);
            break;
          case "XOR":
          case "NXOR":
            operator.symbolPath.ellipse(operator.left, centerTop, this.#operatorRadiusX, radiusY, 0, Math.PI / 2, -Math.PI / 2, true);
            operator.symbolPath.lineTo(width, operator.top);
            operator.symbolPath.ellipse(width, centerTop, this.#operatorRadiusX, radiusY, 0, -Math.PI / 2, Math.PI / 2);

            var ellipse = new Path2D();
            ellipse.ellipse(operator.left - this.#xorGap, centerTop, this.#operatorRadiusX, radiusY, 0, Math.PI / 2, -Math.PI / 2, true);
            operator.symbolPath.addPath(ellipse);
            break;
        }

        switch (operator.type) {
          case "OR":
          case "AND":
          case "XOR":
            operator.symbolSize = {
              "width": this.#operatorLineWidth + this.#operatorRadiusX,
              "height": this.operator1Height * operator.from.length
            };
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            var arc = new Path2D();
            arc.arc(width + this.#operatorRadiusX + this.#notRadius, centerTop, this.#notRadius, 0, 2 * Math.PI);
            operator.symbolPath.addPath(arc);

            operator.symbolSize = {
              "width": this.#operatorLineWidth + this.#operatorRadiusX + 2 * this.#notRadius,
              "height": this.operator1Height * operator.from.length
            };
            break;
        }
        break;
      case "NOT":
        var width = operator.left + this.#operatorLineWidth + this.#operatorRadiusX;
        var height = operator.top + 2 * this.#operator1Height;
        var centerTop = operator.top + this.#operator1Height;

        operator.outputKnobCenter = {
          "x": width + 2 * this.#notRadius + this.#knobRadius,
          "y": centerTop
        };

        operator.fromKnobCenter.push({
          "x": operator.left - this.#knobRadius,
          "y": centerTop
        });

        operator.fromKnobPath.push(this.#drawKnob(null, null, operator.fromKnobCenter[0]));

        operator.symbolPath.moveTo(operator.left, operator.top);
        operator.symbolPath.lineTo(width, centerTop);
        operator.symbolPath.lineTo(operator.left, height);
        operator.symbolPath.closePath();

        var arc = new Path2D();
        arc.arc(width + this.#notRadius, centerTop, this.#notRadius, 0, 2 * Math.PI);
        operator.symbolPath.addPath(arc);

        operator.symbolSize = {
          "width": this.#operatorLineWidth + this.#operatorRadiusX + 2 * this.#notRadius,
          "height": 2 * this.#operator1Height
        };
        break;
    }

    this.#drawKnob(operator, "outputKnobPath", "outputKnobCenter");
    this.#ctx.stroke(operator.symbolPath);
  }

  #drawKnob(node, knobPath, knobCenter) {
    if (node) {
      node[knobPath] = new Path2D();
      node[knobPath].moveTo(node[knobCenter].x, node[knobCenter].y - this.#knobRadius);
      node[knobPath].lineTo(node[knobCenter].x + this.#knobRadius, node[knobCenter].y);
      node[knobPath].lineTo(node[knobCenter].x, node[knobCenter].y + this.#knobRadius);
      node[knobPath].lineTo(node[knobCenter].x - this.#knobRadius, node[knobCenter].y);
      node[knobPath].closePath();
      this.#ctx.stroke(node[knobPath]);
    } else {
      var path = new Path2D();
      path.moveTo(knobCenter.x, knobCenter.y - this.#knobRadius);
      path.lineTo(knobCenter.x + this.#knobRadius, knobCenter.y);
      path.lineTo(knobCenter.x, knobCenter.y + this.#knobRadius);
      path.lineTo(knobCenter.x - this.#knobRadius, knobCenter.y);
      path.closePath();
      this.#ctx.stroke(path);
      return path;
    }

  }
}