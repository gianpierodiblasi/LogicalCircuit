class LogicalCircuitUI {
  #logicalCircuit = new LogicalCircuit();
  #jsonUI = {};

  #canvas;
  #ctx;

  #knobPath = {};
  #knobCenter = {};
  #symbolPath = {};
  #symbolSize = {};
  #connectorPath = {};

  #defaultFont = "24px sans-serif";
  #defaultLineWidth = 2;
  #defaultStrokeStyle = "black";
  #defaultCursor = "default";

  #addTop = 15;
  #addLeft = 15;

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

  #onMouseLineWidth = 3;

  #knobRadius = 5;
  #notRadius = 7;

  #textGap = 20;
  #textHeight = 40;

  #operatorRadiusLeft = 20;
  #operatorLineWidth = 30;
  #operator1Height = 20;
  #xorGap = 12;

  constructor(container, options) {
    try {
      options.width;
    } catch (exception) {
      options = {};
    }

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    container.append(toolbar);

    this.#addButtonAndText(toolbar, "IN", (name) => this.#addInput(name));
    this.#addButtonAndText(toolbar, "OUT", (name) => this.#addOutput(name));
    this.#addButton(toolbar, "OR", () => this.#add("OR"));
    this.#addButton(toolbar, "NOR", () => this.#add("NOR"));
    this.#addButton(toolbar, "AND", () => this.#add("AND"));
    this.#addButton(toolbar, "NAND", () => this.#add("NAND"));
    this.#addButton(toolbar, "XOR", () => this.#add("XOR"));
    this.#addButton(toolbar, "NXOR", () => this.#add("NXOR"));
    this.#addButton(toolbar, "NOT", () => this.#add("NOT"));
    this.#addButton(toolbar, "CLEAR", () => this.#clear());

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = isNaN(options.width) || options.width < 0 ? 800 : options.width;
    this.#canvas.height = isNaN(options.height) || options.height < 0 ? 600 : options.height;
    this.#canvas.onmousemove = (event) => this.#onMouseMove(event);
    this.#canvas.onmousedown = (event) => this.#onMouseDown(event);
    this.#canvas.onmouseup = (event) => this.#onMouseUp(event);
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

  getJavaScriptExpressions() {
    return this.#logicalCircuit.getJavaScriptExpressions();
  }

  isValid() {
    return this.#logicalCircuit.isValid();
  }

  #addButtonAndText(toolbar, label, listener) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_TextContainer");
    toolbar.append(div);

    var text = document.createElement("input");
    text.type = "text";
    text.oninput = (event) => button.disabled = !this.#logicalCircuit.isNameValid(text.value) || this.#logicalCircuit.isNameAlreadyUsed(text.value);
    div.append(text);

    var button = document.createElement("button");
    button.textContent = label;
    button.disabled = true;
    button.onclick = (event) => {
      listener(text.value);
      text.value = "";
      button.disabled = true;
    };
    div.append(button);
  }

  #addButton(toolbar, label, listener) {
    var button = document.createElement("button");
    button.textContent = label;
    button.onclick = (event) => listener(label);
    toolbar.append(button);
  }

  #addInput(name) {
    if (this.#logicalCircuit.addInput(name)) {
      this.#addPosition(name);
      this.#draw();
    }
  }

  #addOutput(name) {
    if (this.#logicalCircuit.addOutput(name)) {
      this.#addPosition(name);
      this.#draw();
    }
  }

  #add(type) {
    var name = this.#logicalCircuit["add" + type]();
    this.#addPosition(name);
    this.#draw();
  }

  #remove(name) {
    if (this.#jsonUI[name]) {
      this.#logicalCircuit.remove(name);
      delete this.#jsonUI[name];
      this.#draw();
    }
  }

  #clear() {
    this.#logicalCircuit.clear();
    this.#jsonUI = {};
    this.#draw();
  }

  #addPosition(name) {
    this.#jsonUI[name] = {
      "top": this.#addTop,
      "left": this.#addLeft
    };
  }

  #draw() {
    this.#canvas.style.cursor = this.#defaultCursor;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#drawTrash();

    for (var property in this.#jsonUI) {
      var type = this.#logicalCircuit.getType(property);

      switch (type) {
        case "IN":
          this.#drawText(property, "exit");
          break;
        case "OUT":
          this.#drawText(property, "enter*0");
          break;
        default:
//          this.#drawOperator(property, type);
          break;
      }
    }
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

  #drawText(name, suffix) {
    var width = this.#ctx.measureText(name).width + this.#textGap;
    var centerTop = this.#jsonUI[name].top + this.#textHeight / 2;

    this.#knobCenter[name + "*" + suffix] = {
      "left": this.#jsonUI[name].left - this.#knobRadius,
      "top": centerTop
    };
    this.#drawKnob(name + "*" + suffix);

    this.#symbolSize[name] = {
      "width": width,
      "height": this.#textHeight
    };
    this.#symbolPath[name] = new Path2D();
    this.#symbolPath[name].rect(this.#jsonUI[name].left, this.#jsonUI[name].top, width, this.#textHeight);
    this.#ctx.stroke(this.#symbolPath[name]);

    this.#ctx.fillText(name, this.#jsonUI[name].left + this.#textGap / 2, this.#knobCenter[name + "*" + suffix].top);
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

  #onMouseMove(event) {

  }

  #onMouseDown(event) {

  }

  #onMouseUp(event) {

  }
}