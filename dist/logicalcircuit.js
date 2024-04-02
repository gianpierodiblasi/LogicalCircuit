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
    return this.#add(name, {"type": "OUT", "from": ""});
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
    if (this.#json[name] && Array.isArray(this.#json[name].from)) {
      this.#json[name].from.push("");
    }
  }

  decConnector(name) {
    if (this.#json[name] && Array.isArray(this.#json[name].from) && this.#json[name].type !== "NOT" && this.#json[name].from.length > 2) {
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
    if (!Array.isArray(this.#json[end])) {
      this.#json[end].from = start;
    } else if (0 <= index && index < this.#json[end].from.length) {
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
    if (!Array.isArray(this.#json[name])) {
      this.#json[name].from = "";
    } else if (0 <= index && index < this.#json[name].from.length) {
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
          this.#json[property].from = this.#json[property].from === name ? "" : this.#json[property].from;
          break;
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
          return "";
        case "OUT":
          return this.#json[name].from;
        default:
          return this.#json[name].from.slice();
      }
    } else {
      return "";
    }
  }

  isNameValid(name) {
    return typeof name === 'string' ? /[a-zA-Z]+[a-zA-Z0-9]*/g.test(name) : false;
  }

  isNameAlreadyUsed(name) {
    return !!this.#json[name];
  }
}

class LogicalCircuitUI {
  #logicalCircuit = new LogicalCircuit();
  #jsonUI = {};

  #canvas;
  #ctx;

  #knobPath = {};
  #knobCenter = {};
  #symbolPath = {};
  #symbolSize = {};

  #defaultFont = "24px sans-serif";
  #defaultLineWidth = 2;
  #defaultStrokeStyle = "black";

  #trashFont = "48px sans-serif";
  #trashText = "\u{1F5D1}";
  #trashLeft = 35;
  #trashTop = 20;
  #trashLineWidth = 80;
  #trashRadius1 = 40;
  #trashRadius2 = 120;
  #trashGradients = [
    {"pos": 0, "color": "rgba(0,0,0,0)"},
    {"pos": 0.5, "color": "rgba(0,0,0,0)"},
    {"pos": 1, "color": "rgba(0,0,0,0.3)"}
  ];

  #knobRadius = 5;
  #notRadius = 7;

  #inputGap = 20;
  #inputHeight = 40;
  #outputGap = 20;
  #outputHeight = 40;

  #operatorRadiusLeft = 20;
  #operatorLineWidth = 30;
  #operator1Height = 20;
  #xorGap = 12;
//
//  #currentEvent;
//  #pressedEvent;
//
//  #onMouse = {"object": null, "reference": "", "index": -1};
//  #onKnob = {"object": null, "reference": "", "index": -1, pressed: false};
//  #onArrow = {"direction": "", selected: false};
//  #onSymbol = {"pressed": false, "offsetX": 0, "offsetY": 0};
//
  constructor(container, options) {
    try {
      options.width;
    } catch (exception) {
      options = {};
    }

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    container.append(toolbar);

//      this.#addButtonAndText(toolbar, "IN", (event, name) => this.addInput(name, 15, 15));
//      this.#addButtonAndText(toolbar, "OUT", (event, name) => this.addOutput(name, 15, 15));
//      this.#addButton(toolbar, "OR");
//      this.#addButton(toolbar, "NOR");
//      this.#addButton(toolbar, "AND");
//      this.#addButton(toolbar, "NAND");
//      this.#addButton(toolbar, "XOR");
//      this.#addButton(toolbar, "NXOR");
//      this.#addButton(toolbar, "NOT");
//      this.#addButton(toolbar, "CLEAR", (event) => this.clear());
//
    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = isNaN(options.width) || options.width < 0 ? 800 : options.width;
    this.#canvas.height = isNaN(options.height) || options.height < 0 ? 600 : options.height;
//    this.#canvas.onmousemove = (event) => this.#onMouseMove(event);
//    this.#canvas.onmousedown = (event) => this.#onMouseDown(event);
//    this.#canvas.onmouseup = (event) => this.#onMouseUp(event);
    container.append(this.#canvas);

    this.#ctx = this.#canvas.getContext('2d');
    this.#ctx.font = this.#defaultFont;
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = this.#defaultLineWidth;
    this.#ctx.lineJoin = "round";
    this.#draw();
  }

  setJSONs(json, jsonUI) {
    this.#logicalCircuit.setJSON(json);
    this.#jsonUI = JSON.parse(JSON.stringify(jsonUI));
    this.#draw();
  }

  getJSON() {
    return this.#logicalCircuit.getJSON();
  }

  getJSONUI() {
    return JSON.parse(JSON.stringify(this.#jsonUI));
  }

//  getJavaScriptExpression() {
//    return this.#logicalCircuit.getJavaScriptExpression();
//  }
//
//  isValid() {
//    return this.#logicalCircuit.isValid();
//  }
//
//  #addButtonAndText(toolbar, label, listener) {
//    var div = document.createElement("div");
//    div.classList.add("LogicalCircuitUI_TextContainer");
//    toolbar.append(div);
//
//    var text = document.createElement("input");
//    text.type = "text";
//    div.append(text);
//
//    text.oninput = (event) => {
//      var name = this.#logicalCircuit.purgeName(text.value);
//      button.disabled = !name || this.#logicalCircuit.isNameAlreadyUsed(name);
//    };
//
//    var button = document.createElement("button");
//    button.textContent = label;
//    button.disabled = true;
//    button.onclick = (event) => listener(event, text.value);
//    div.append(button);
//
//  }
//
//  #addButton(toolbar, label, listener) {
//    var button = document.createElement("button");
//    button.textContent = label;
//    button.onclick = listener ? listener : (event) => this["add" + label](15, 15);
//    toolbar.append(button);
//  }
//
//  addInput(name, top, left) {
//    var added = this.#logicalCircuit.addInput(name);
//    if (added) {
//      this.#addPosition(this.#logicalCircuit.inputs, name, top, left);
//      this.#draw();
//    }
//    return added;
//  }
//
//  addOutput(name, top, left) {
//    var added = this.#logicalCircuit.addOutput(name);
//    if (added) {
//      this.#addPosition(this.#logicalCircuit.outputs, name, top, left);
//      this.#draw();
//    }
//    return added;
//  }
//
//  addOR(top, left) {
//    var name = this.#logicalCircuit.addOR();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addNOR(top, left) {
//    var name = this.#logicalCircuit.addNOR();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addAND(top, left) {
//    var name = this.#logicalCircuit.addAND();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addNAND(top, left) {
//    var name = this.#logicalCircuit.addNAND();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addXOR(top, left) {
//    var name = this.#logicalCircuit.addXOR();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addNXOR(top, left) {
//    var name = this.#logicalCircuit.addNXOR();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  addNOT(top, left) {
//    var name = this.#logicalCircuit.addNOT();
//    this.#addPosition(this.#logicalCircuit.operators, name, top, left);
//    this.#draw();
//    return name;
//  }
//
//  remove(name) {
//    this.#logicalCircuit.remove(name);
//    this.#draw();
//  }
//
//  clear() {
//    this.#logicalCircuit.clear();
//    this.#draw();
//  }
//
//  #addPosition(array, name, top, left) {
//    var found = array.find(input => input.name === name);
//    found.top = isNaN(top) || top < 0 || top > this.#canvas.height ? 10 : top;
//    found.left = isNaN(left) || left < 0 || left > this.#canvas.width ? 10 : left;
//  }

  #draw() {
    this.#canvas.style.cursor = "default";
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#drawTrash();

    for (var property in this.#jsonUI) {
      var type = this.#logicalCircuit.getType(property);

      switch (type) {
        case "IN":
          this.#drawInput(property);
          break;
        case "OUT":
          this.#drawOutput(property);
          break;
        default:
          this.#drawOperator(property, type);
          break;
      }
    }

    for (var property in this.#jsonUI) {
      var type = this.#logicalCircuit.getType(property);

      switch (type) {
        case "IN":
          break;
        case "OUT":
          this.#drawConnector(this.#logicalCircuit.getFrom(property), property, -1);
          break;
        default:
          this.#logicalCircuit.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
          break;
      }
    }
//
//    this.#drawOnMouse();
//    this.#drawOnKnob();
  }

  #drawTrash() {
    this.#ctx.font = this.#trashFont;
    this.#ctx.fillText(this.#trashText, this.#canvas.width - this.#trashLeft, this.#canvas.height - this.#trashTop);
    this.#ctx.font = this.#defaultFont;

    var radialGradient = this.#ctx.createRadialGradient(this.#canvas.width, this.#canvas.height, this.#trashRadius1, this.#canvas.width, this.#canvas.height, this.#trashRadius2);
    this.#trashGradients.forEach(gradient => radialGradient.addColorStop(gradient.pos, gradient.color));

    this.#ctx.lineWidth = this.#trashLineWidth;
    this.#ctx.strokeStyle = radialGradient;
    this.#ctx.beginPath();
    this.#ctx.arc(this.#canvas.width, this.#canvas.height, this.#trashLineWidth, 0, 2 * Math.PI);
    this.#ctx.stroke();
    this.#ctx.lineWidth = this.#defaultLineWidth;
    this.#ctx.strokeStyle = this.#defaultStrokeStyle;
  }

  #drawInput(name) {
    var width = this.#ctx.measureText(name).width + this.#inputGap;
    var centerTop = this.#jsonUI[name].top + this.#inputHeight / 2;

    this.#knobCenter[name] = {
      "left": this.#jsonUI[name].left + width + this.#knobRadius,
      "top": centerTop
    };

    this.#drawText(name, width, this.#inputHeight, this.#inputGap);
    this.#drawKnob(name);
  }

  #drawOutput(name) {
    var width = this.#ctx.measureText(name).width + this.#outputGap;
    var centerTop = this.#jsonUI[name].top + this.#outputHeight / 2;

    this.#knobCenter[name] = {
      "left": this.#jsonUI[name].left - this.#knobRadius,
      "top": centerTop
    };

    this.#drawText(name, width, this.#outputHeight, this.#outputGap);
    this.#drawKnob(name);
  }

  #drawText(name, width, height, gap) {
    this.#symbolSize[name] = {
      "width": width,
      "height": height
    };

    this.#symbolPath[name] = new Path2D();
    this.#symbolPath[name].rect(this.#jsonUI[name].left, this.#jsonUI[name].top, width, height);
    this.#ctx.stroke(this.#symbolPath[name]);
    this.#ctx.fillText(name, this.#jsonUI[name].left + gap / 2, this.#knobCenter[name].top);
  }

  #drawOperator(name, type) {
    var from = this.#logicalCircuit.getFrom(name);

    this.#symbolPath[name] = new Path2D();

    switch (type) {
      case "OR":
      case "AND":
      case "NOR":
      case "NAND":
      case "XOR":
      case "NXOR":
        var radiusTop = this.#operator1Height * from.length / 2;
        var width = this.#jsonUI[name].left + this.#operatorLineWidth;
        var height = this.#jsonUI[name].top + this.#operator1Height * from.length;
        var centerTop = this.#jsonUI[name].top + radiusTop;

        switch (type) {
          case "OR":
          case "AND":
          case "XOR":
            this.#knobCenter[name + "*output"] = {
              "left": width + this.#operatorRadiusLeft + this.#knobRadius,
              "top": centerTop
            };
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            this.#knobCenter[name + "*output"] = {
              "left": width + this.#operatorRadiusLeft + 2 * this.#notRadius + this.#knobRadius,
              "top": centerTop
            };
            break;
        }

        var incAngle = Math.PI / (from.length + 1);
        for (var index = 0; index < from.length; index++) {
          switch (type) {
            case "OR":
            case "NOR":
              var angle = incAngle * (index + 1) - Math.PI / 2;
              this.#knobCenter[name + "*" + index] = {
                "left": this.#jsonUI[name].left + (this.#operatorRadiusLeft - this.#knobRadius) * Math.cos(angle),
                "top": centerTop + (radiusTop - this.#knobRadius) * Math.sin(angle)
              };
              break;
            case "AND":
            case "NAND":
              this.#knobCenter[name + "*" + index] = {
                "left": this.#jsonUI[name].left - this.#knobRadius,
                "top": this.#jsonUI[name].top + this.#operator1Height / 2 + this.#operator1Height * index
              };
              break;
            case "XOR":
            case "NXOR":
              var angle = incAngle * (index + 1) - Math.PI / 2;
              this.#knobCenter[name + "*" + index] = {
                "left": this.#jsonUI[name].left + (this.#operatorRadiusLeft - this.#knobRadius) * Math.cos(angle) - this.#xorGap,
                "top": centerTop + (radiusTop - this.#knobRadius) * Math.sin(angle)
              };
              break;
          }

          this.#drawKnob(name + "*" + index);
        }

        this.#symbolPath[name].moveTo(width, height);
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
        switch (type) {
          case "OR":
          case "NOR":
            this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operatorRadiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
            this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
            this.#symbolPath[name].ellipse(width, centerTop, this.#operatorRadiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);
            break;
          case "AND":
          case "NAND":
            this.#symbolPath[name].lineTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
            this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
            this.#symbolPath[name].ellipse(width, centerTop, this.#operatorRadiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);
            break;
          case "XOR":
          case "NXOR":
            this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operatorRadiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
            this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
            this.#symbolPath[name].ellipse(width, centerTop, this.#operatorRadiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);

            var ellipse = new Path2D();
            ellipse.ellipse(this.#jsonUI[name].left - this.#xorGap, centerTop, this.#operatorRadiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
            this.#symbolPath[name].addPath(ellipse);
            break;
        }

        switch (type) {
          case "OR":
          case "AND":
          case "XOR":
            this.#symbolSize[name] = {
              "width": this.#operatorLineWidth + this.#operatorRadiusLeft,
              "height": this.#operator1Height * from.length
            };
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            var arc = new Path2D();
            arc.arc(width + this.#operatorRadiusLeft + this.#notRadius, centerTop, this.#notRadius, 0, 2 * Math.PI);
            this.#symbolPath[name].addPath(arc);

            this.#symbolSize[name] = {
              "width": this.#operatorLineWidth + this.#operatorRadiusLeft + 2 * this.#notRadius,
              "height": this.#operator1Height * from.length
            };
            break;
        }
        break;
      case "NOT":
        var width = this.#jsonUI[name].left + this.#operatorLineWidth + this.#operatorRadiusLeft;
        var height = this.#jsonUI[name].top + 2 * this.#operator1Height;
        var centerTop = this.#jsonUI[name].top + this.#operator1Height;

        this.#knobCenter[name + "*output"] = {
          "left": width + 2 * this.#notRadius + this.#knobRadius,
          "top": centerTop
        };

        this.#knobCenter[name + "*0"] = {
          "left": this.#jsonUI[name].left - this.#knobRadius,
          "top": centerTop
        };

        this.#drawKnob(name + "*0");

        this.#symbolPath[name].moveTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, centerTop);
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
        this.#symbolPath[name].closePath();

        var arc = new Path2D();
        arc.arc(width + this.#notRadius, centerTop, this.#notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);

        this.#symbolSize[name] = {
          "width": this.#operatorLineWidth + this.#operatorRadiusLeft + 2 * this.#notRadius,
          "height": 2 * this.#operator1Height
        };
        break;
    }

    this.#drawKnob(name + "*output");
    this.#ctx.stroke(this.#symbolPath[name]);
  }

  #drawKnob(name) {
    this.#knobPath[name] = new Path2D();
    this.#knobPath[name].moveTo(this.#knobCenter[name].left, this.#knobCenter[name].top - this.#knobRadius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left + this.#knobRadius, this.#knobCenter[name].top);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left, this.#knobCenter[name].top + this.#knobRadius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left - this.#knobRadius, this.#knobCenter[name].top);
    this.#knobPath[name].closePath();
    this.#ctx.stroke(this.#knobPath[name]);
  }

  #drawConnector(startName, endName, endIndex) {
    if (startName) {
      var startCenter = this.#knobCenter[startName] ? this.#knobCenter[startName] : this.#knobCenter[startName + "*output"];
      var endCenter = endIndex === -1 ? this.#knobCenter[endName] : this.#knobCenter[endName + "*" + endIndex];
      
      this.#knobPath[endName + "*" + endIndex + "*connector"] = new Path2D();
      this.#knobPath[endName + "*" + endIndex + "*connector"].moveTo(startCenter.left, startCenter.top);
      this.#knobPath[endName + "*" + endIndex + "*connector"].lineTo(endCenter.left, endCenter.top);

      this.#ctx.stroke(this.#knobPath[endName + "*" + endIndex + "*connector"]);
    }
  }
//
//  #drawOnMouse() {
//    if (!this.#onMouse.object) {
//    } else {
//      if (this.#onMouse.reference !== "symbolPath") {
//      } else if (this.#logicalCircuit.operators.find(operator => operator === this.#onMouse.object) && this.#onMouse.object.type !== "NOT") {
//        var arrowX;
//        switch (this.#onMouse.object.type) {
//          case "OR":
//          case "AND":
//          case "XOR":
//            arrowX = this.#onMouse.object.left + 3 * this.#onMouse.object.symbolSize.width / 5;
//            break;
//          case "NOR":
//          case "NAND":
//          case "NXOR":
//            arrowX = this.#onMouse.object.left + 3 * this.#onMouse.object.symbolSize.width / 5 - this.#notRadius;
//        }
//
//        var arrowUP = this.#onMouse.object.top + this.#onMouse.object.symbolSize.height / 4;
//        var arrowDOWN = this.#onMouse.object.top + 3 * this.#onMouse.object.symbolSize.height / 4;
//
//        this.#ctx.font = "12px sans-serif";
//        var width = this.#ctx.measureText("\u{02191}").width;
//        this.#ctx.fillStyle = this.#onMouse.object.from.length > 2 ? "black" : "red";
//        this.#ctx.fillText("\u{02191}", arrowX, arrowUP);
//        this.#ctx.fillStyle = this.#onMouse.object.from.length < 6 ? "black" : "red";
//        this.#ctx.fillText("\u{02193}", arrowX, arrowDOWN);
//        this.#ctx.fillStyle = "black";
//        this.#ctx.font = "24px sans-serif";
//
//        var path = new Path2D();
//        path.rect(arrowX - 2, this.#onMouse.object.top + 3, width + 4, this.#onMouse.object.symbolSize.height - 6);
//        this.#ctx.stroke(path);
//
//        this.#onArrow.selected = this.#ctx.isPointInPath(path, this.#currentEvent.offsetX, this.#currentEvent.offsetY);
//        this.#onArrow.direction = this.#currentEvent.offsetY < this.#onMouse.object.top + this.#onMouse.object.symbolSize.height / 2 ? "UP" : "DOWN";
//        this.#canvas.style.cursor = this.#onArrow.selected ? "pointer" : "move";
//      } else {
//        this.#canvas.style.cursor = "move";
//      }
//
//      this.#ctx.lineWidth = 4;
//
//      if (this.#onSymbol.pressed) {
//        this.#ctx.strokeStyle = this.#intersects(this.#canvas.width, this.#canvas.height, 80, this.#onMouse.object.left, this.#onMouse.object.top, this.#onMouse.object.symbolSize.width, this.#onMouse.object.symbolSize.height) ? "red" : "green";
//      } else {
//        this.#ctx.strokeStyle = ["fromKnobConnectorPath", "knobConnectorPath"].includes(this.#onMouse.reference) ? "red" : "green";
//      }
//      this.#ctx.stroke(this.#onMouse.index === -1 ? this.#onMouse.object[this.#onMouse.reference] : this.#onMouse.object[this.#onMouse.reference][this.#onMouse.index]);
//
//      this.#ctx.lineWidth = 2;
//      this.#ctx.strokeStyle = "black";
//    }
//  }
//
//  #intersects(cx, cy, radius, rx, ry, rw, rh) {
//    var testX = cx;
//    var testY = cy;
//
//    if (cx < rx) {
//      testX = rx;
//    } else if (cx > rx + rw) {
//      testX = rx + rw;
//    }
//    if (cy < ry) {
//      testY = ry;
//    } else if (cy > ry + rh) {
//      testY = ry + rh;
//    }
//
//    var distX = cx - testX;
//    var distY = cy - testY;
//    var distance = Math.sqrt((distX * distX) + (distY * distY));
//
//    return distance <= radius;
//  }
//
//  #drawOnKnob() {
//    if (this.#onKnob.pressed) {
//      this.#ctx.beginPath();
//      this.#ctx.moveTo(this.#pressedEvent.offsetX, this.#pressedEvent.offsetY);
//      this.#ctx.lineTo(this.#currentEvent.offsetX, this.#currentEvent.offsetY);
//      this.#ctx.stroke();
//
//      if (this.#onKnob.object) {
//        this.#ctx.lineWidth = 4;
//        this.#ctx.strokeStyle = this.#isConnectionValid(this.#onMouse.object, this.#onMouse.reference, this.#onKnob.object, this.#onKnob.reference) ? "green" : "orange";
//        this.#ctx.stroke(this.#onKnob.index === -1 ? this.#onKnob.object[this.#onKnob.reference] : this.#onKnob.object[this.#onKnob.reference][this.#onKnob.index]);
//        this.#ctx.lineWidth = 2;
//        this.#ctx.strokeStyle = "black";
//      }
//    }
//  }
//
//  #isConnectionValid(objStart, refStart, objEnd, refEnd) {
//    var isSource = {
//      "start": this.#isSource(objStart, refStart),
//      "end": this.#isSource(objEnd, refEnd),
//    };
//    return this.#logicalCircuit.isConnectionValid(objStart.name, isSource.start, objEnd.name, isSource.end);
//  }
//
//  #addConnection(objStart, refStart, indexStart, objEnd, refEnd, indexEnd) {
//    var isSource = {
//      "start": this.#isSource(objStart, refStart),
//      "end": this.#isSource(objEnd, refEnd),
//    };
//    this.#logicalCircuit.addConnection(objStart.name, isSource.start, indexStart, objEnd.name, isSource.end, indexEnd);
//  }
//
//  #removeConnection(obj, ref, index) {
//    this.#logicalCircuit.removeConnection(obj.name, index);
//
//    if (index === -1) {
//      obj[ref] = null;
//    } else {
//      obj[ref][index] = null;
//    }
//  }
//
//  #isSource(obj, ref) {
//    if (ref === "knobPath") {
//      return !!this.#logicalCircuit.inputs.find(input => input.name === obj.name);
//    } else if (ref === "fromKnobPath") {
//      return false;
//    } else if (ref === "outputKnobPath") {
//      return true;
//    }
//  }
//
//  #onMouseMove(event) {
//    this.#currentEvent = event;
//
//    if (this.#onSymbol.pressed) {
//      this.#onMouse.object.top = event.offsetY - this.#onSymbol.offsetY;
//      this.#onMouse.object.left = event.offsetX - this.#onSymbol.offsetX;
//    } else if (this.#onKnob.pressed) {
//      this.#onKnob = {"object": null, "reference": "", "index": -1, pressed: true};
//
//      this.#logicalCircuit.inputs.forEach(input => {
//        if (!this.#onKnob.object && this.#ctx.isPointInPath(input.knobPath, event.offsetX, event.offsetY)) {
//          this.#onKnob.object = input;
//          this.#onKnob.reference = "knobPath";
//        }
//      });
//
//      this.#logicalCircuit.operators.forEach(operator => {
//        if (!this.#onKnob.object && this.#ctx.isPointInPath(operator.outputKnobPath, event.offsetX, event.offsetY)) {
//          this.#onKnob.object = operator;
//          this.#onKnob.reference = "outputKnobPath";
//        }
//
//        operator.fromKnobPath.forEach((path, index) => {
//          if (!this.#onKnob.object && this.#ctx.isPointInPath(path, event.offsetX, event.offsetY)) {
//            this.#onKnob.object = operator;
//            this.#onKnob.reference = "fromKnobPath";
//            this.#onKnob.index = index;
//          }
//        });
//      });
//
//      this.#logicalCircuit.outputs.forEach(output => {
//        if (!this.#onKnob.object && this.#ctx.isPointInPath(output.knobPath, event.offsetX, event.offsetY)) {
//          this.#onKnob.object = output;
//          this.#onKnob.reference = "knobPath";
//        }
//      });
//    } else {
//      this.#onMouse = {"object": null, "reference": "", "index": -1};
//
//      this.#logicalCircuit.inputs.forEach(input => {
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(input.knobPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = input;
//          this.#onMouse.reference = "knobPath";
//        }
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(input.symbolPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = input;
//          this.#onMouse.reference = "symbolPath";
//        }
//      });
//
//      this.#logicalCircuit.operators.forEach(operator => {
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(operator.outputKnobPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = operator;
//          this.#onMouse.reference = "outputKnobPath";
//        }
//
//        operator.fromKnobPath.forEach((path, index) => {
//          if (!this.#onMouse.object && this.#ctx.isPointInPath(path, event.offsetX, event.offsetY)) {
//            this.#onMouse.object = operator;
//            this.#onMouse.reference = "fromKnobPath";
//            this.#onMouse.index = index;
//          }
//        });
//
//        operator.fromKnobConnectorPath.forEach((path, index) => {
//          if (!this.#onMouse.object && path && this.#ctx.isPointInStroke(path, event.offsetX, event.offsetY)) {
//            this.#onMouse.object = operator;
//            this.#onMouse.reference = "fromKnobConnectorPath";
//            this.#onMouse.index = index;
//          }
//        });
//
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(this.#symbolPath[name], event.offsetX, event.offsetY)) {
//          this.#onMouse.object = operator;
//          this.#onMouse.reference = "symbolPath";
//        }
//      });
//
//      this.#logicalCircuit.outputs.forEach(output => {
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(output.knobPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = output;
//          this.#onMouse.reference = "knobPath";
//        }
//        if (!this.#onMouse.object && output.knobConnectorPath && this.#ctx.isPointInStroke(output.knobConnectorPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = output;
//          this.#onMouse.reference = "knobConnectorPath";
//        }
//        if (!this.#onMouse.object && this.#ctx.isPointInPath(output.symbolPath, event.offsetX, event.offsetY)) {
//          this.#onMouse.object = output;
//          this.#onMouse.reference = "symbolPath";
//        }
//      });
//    }
//
//    this.#draw();
//  }
//
//  #onMouseDown(event) {
//    if (!this.#onMouse.object) {
//      return;
//    }
//
//    switch (this.#onMouse.reference) {
//      case "knobPath":
//      case "fromKnobPath":
//      case "outputKnobPath":
//        this.#onKnob.pressed = true;
//        this.#pressedEvent = event;
//        break;
//      case "symbolPath":
//        if (this.#onArrow.selected) {
//          switch (this.#onArrow.direction) {
//            case "UP":
//              if (this.#onMouse.object.from.length > 2) {
//                this.#logicalCircuit.decOperatorInput(this.#onMouse.object.name);
//                this.#onMouse.object.top += this.#operator1Height / 2;
//              }
//              break;
//            case "DOWN":
//              if (this.#onMouse.object.from.length < 6) {
//                this.#logicalCircuit.incOperatorInput(this.#onMouse.object.name);
//                this.#onMouse.object.top -= this.#operator1Height / 2;
//              }
//              break;
//          }
//
//          this.#draw();
//        } else {
//          this.#onSymbol.pressed = true;
//          this.#onSymbol.offsetX = event.offsetX - this.#onMouse.object.left;
//          this.#onSymbol.offsetY = event.offsetY - this.#onMouse.object.top;
//        }
//        break;
//      case "fromKnobConnectorPath":
//      case "knobConnectorPath":
//        this.#removeConnection(this.#onMouse.object, this.#onMouse.reference, this.#onMouse.index);
//        this.#onMouse = {"object": null, "reference": "", "index": -1};
//        this.#draw();
//        break;
//    }
//  }
//
//  #onMouseUp(event) {
//    if (this.#onMouse.object && this.#onSymbol.pressed &&
//            this.#intersects(this.#canvas.width, this.#canvas.height, 80, this.#onMouse.object.left, this.#onMouse.object.top, this.#onMouse.object.symbolSize.width, this.#onMouse.object.symbolSize.height)) {
//      this.remove(this.#onMouse.object.name);
//    } else if (this.#onKnob.pressed && this.#onKnob.object &&
//            this.#isConnectionValid(this.#onMouse.object, this.#onMouse.reference, this.#onKnob.object, this.#onKnob.reference)) {
//      this.#addConnection(this.#onMouse.object, this.#onMouse.reference, this.#onMouse.index, this.#onKnob.object, this.#onKnob.reference, this.#onKnob.index);
//    }
//
//    this.#onSymbol.pressed = false;
//    this.#onKnob.pressed = false;
//    this.#draw();
//  }
}