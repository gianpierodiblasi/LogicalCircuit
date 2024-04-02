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

  #default = {
    "font": "24px sans-serif",
    "lineWidth": 2,
    "strokeStyle": "black",
    "cursor": "default"
  };

  #cursor = {
    "move": "move",
    "pointer": "pointer"
  }

  #addedElementPosition = {
    "top": 15,
    "left": 15
  };

  #trash = {
    "font": "48px sans-serif",
    "text": "\u{1F5D1}",
    "strokeStyle": "red",
    "left": 35,
    "top": 20,
    "lineWidth": 80,
    "radius1": 40,
    "radius2": 120,
    "gradients": [
      {"pos": 0, "color": "rgba(0,0,0,0)"},
      {"pos": 0.5, "color": "rgba(0,0,0,0)"},
      {"pos": 1, "color": "rgba(0,0,0,0.3)"}
    ]
  };

  #text = {
    "gap": 20,
    "height": 40
  };

  #operator = {
    "radiusLeft": 20,
    "lineWidth": 30,
    "oneHeight": 20,
    "xorGap": 12,
    "notRadius": 7
  };

  #onMouse = {
    "name": "",
    "index": -1,
    "referencePath": "",
    "referenceName": "",
    "lineWidth": 3,
    "strokeStyle": "green"
  };

  #onKnob = {
    "lineWidth": 3,
    "radius": 5
  };

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
    this.#ctx.font = this.#default.font;
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.lineJoin = "round";
    this.#draw();
  }

  setJSONs(json, jsonUI) {
    this.#logicalCircuit.setJSON(json);
    this.#jsonUI = JSON.parse(JSON.stringify(jsonUI));

    document.querySelector(".LogicalCircuitUI_Toolbar input.IN").value = "";
    document.querySelector(".LogicalCircuitUI_Toolbar button.IN").disabled = true;
    document.querySelector(".LogicalCircuitUI_Toolbar input.OUT").value = "";
    document.querySelector(".LogicalCircuitUI_Toolbar button.OUT").disabled = true;

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
    text.classList.add(label);
    text.oninput = (event) => button.disabled = !this.#logicalCircuit.isNameValid(text.value) || this.#logicalCircuit.isNameAlreadyUsed(text.value);
    div.append(text);

    var button = document.createElement("button");
    button.textContent = label;
    button.classList.add(label);
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
    button.classList.add(label);
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

  #addPosition(name) {
    this.#jsonUI[name] = {
      "top": this.#addedElementPosition.top,
      "left": this.#addedElementPosition.left
    };
  }

  #clear() {
    this.#logicalCircuit.clear();
    this.#jsonUI = {};

    document.querySelector(".LogicalCircuitUI_Toolbar input.IN").value = "";
    document.querySelector(".LogicalCircuitUI_Toolbar button.IN").disabled = true;
    document.querySelector(".LogicalCircuitUI_Toolbar input.OUT").value = "";
    document.querySelector(".LogicalCircuitUI_Toolbar button.OUT").disabled = true;

    this.#draw();
  }

  #draw() {
    this.#canvas.style.cursor = this.#default.cursor;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#drawTrash();

    for (var property in this.#jsonUI) {
      var type = this.#logicalCircuit.getType(property);

      switch (type) {
        case "IN":
          this.#drawText(property, "exit");
          break;
        case "OUT":
          this.#drawText(property, "0");
          break;
        default:
          this.#drawOperator(property, type);
          break;
      }
    }
  }

  #drawTrash() {
    this.#ctx.font = this.#trash.font;
    this.#ctx.fillText(this.#trash.text, this.#canvas.width - this.#trash.left, this.#canvas.height - this.#trash.top);
    this.#ctx.font = this.#default.font;

    var radialGradient = this.#ctx.createRadialGradient(this.#canvas.width, this.#canvas.height, this.#trash.radius1, this.#canvas.width, this.#canvas.height, this.#trash.radius2);
    this.#trash.gradients.forEach(gradient => radialGradient.addColorStop(gradient.pos, gradient.color));

    this.#ctx.lineWidth = this.#trash.lineWidth;
    this.#ctx.strokeStyle = radialGradient;
    this.#ctx.beginPath();
    this.#ctx.arc(this.#canvas.width, this.#canvas.height, this.#trash.lineWidth, 0, 2 * Math.PI);
    this.#ctx.stroke();
    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.strokeStyle = this.#default.strokeStyle;
  }

  #drawText(name, suffix) {
    var width = this.#ctx.measureText(name).width + this.#text.gap;
    var centerTop = this.#jsonUI[name].top + this.#text.height / 2;

    this.#knobCenter[name + "*" + suffix] = {
      "left": this.#jsonUI[name].left + (suffix === "exit" ? width + this.#onKnob.radius : -this.#onKnob.radius),
      "top": centerTop
    };
    this.#drawKnob(name + "*" + suffix);

    this.#symbolSize[name] = {
      "width": width,
      "height": this.#text.height
    };
    this.#symbolPath[name] = new Path2D();
    this.#symbolPath[name].rect(this.#jsonUI[name].left, this.#jsonUI[name].top, width, this.#text.height);
    this.#ctx.stroke(this.#symbolPath[name]);

    this.#ctx.fillText(name, this.#jsonUI[name].left + this.#text.gap / 2, this.#knobCenter[name + "*" + suffix].top);
  }

  #drawOperator(name, type) {
    this.#symbolPath[name] = new Path2D();
    var from = this.#logicalCircuit.getFrom(name);

    var radiusTop = this.#operator.oneHeight * from.length / 2;
    var width = this.#jsonUI[name].left + this.#operator.lineWidth + (type === "NOT" ? this.#operator.radiusLeft : 0);
    var height = this.#jsonUI[name].top + this.#operator.oneHeight * (type === "NOT" ? 2 : from.length);
    var centerTop = this.#jsonUI[name].top + (type === "NOT" ? this.#operator.oneHeight : radiusTop);

    this.#setExitKnobCenter(name, type, width, centerTop);
    this.#setKnobCenter(name, type, from, centerTop, radiusTop);
    this.#setSymbolSize(name, type, from, width, centerTop);
    this.#setSymbolPath(name, type, width, height, centerTop, radiusTop);
  }

  #setExitKnobCenter(name, type, width, centerTop) {
    switch (type) {
      case "OR":
      case "AND":
      case "XOR":
        this.#knobCenter[name + "*exit"] = {
          "left": width + this.#operator.radiusLeft + this.#onKnob.radius,
          "top": centerTop
        };
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        this.#knobCenter[name + "*exit"] = {
          "left": width + this.#operator.radiusLeft + 2 * this.#operator.notRadius + this.#onKnob.radius,
          "top": centerTop
        };
        break;
      case "NOT":
        this.#knobCenter[name + "*exit"] = {
          "left": width + 2 * this.#operator.notRadius + this.#onKnob.radius,
          "top": centerTop
        };
        break;
    }

    this.#drawKnob(name + "*exit");
  }

  #setKnobCenter(name, type, from, centerTop, radiusTop) {
    var incAngle = Math.PI / (from.length + 1);
    for (var index = 0; index < from.length; index++) {
      switch (type) {
        case "OR":
        case "NOR":
          var angle = incAngle * (index + 1) - Math.PI / 2;
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left + (this.#operator.radiusLeft - this.#onKnob.radius) * Math.cos(angle),
            "top": centerTop + (radiusTop - this.#onKnob.radius) * Math.sin(angle)
          };
          break;
        case "AND":
        case "NAND":
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left - this.#onKnob.radius,
            "top": this.#jsonUI[name].top + this.#operator.oneHeight / 2 + this.#operator.oneHeight * index
          };
          break;
        case "XOR":
        case "NXOR":
          var angle = incAngle * (index + 1) - Math.PI / 2;
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left + (this.#operator.radiusLeft - this.#onKnob.radius) * Math.cos(angle) - this.#operator.xorGap,
            "top": centerTop + (radiusTop - this.#onKnob.radius) * Math.sin(angle)
          };
          break;
        case "NOT":
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left - this.#onKnob.radius,
            "top": centerTop
          };
          break;
      }

      this.#drawKnob(name + "*" + index);
    }
  }

  #setSymbolSize(name, type, from, width, centerTop) {
    switch (type) {
      case "OR":
      case "AND":
      case "XOR":
        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft,
          "height": this.#operator.oneHeight * from.length
        };
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        var arc = new Path2D();
        arc.arc(width + this.#operator.radiusLeft + this.#operator.notRadius, centerTop, this.#operator.notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);

        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius,
          "height": this.#operator.oneHeight * from.length
        };
        break;
      case "NOT":
        var arc = new Path2D();
        arc.arc(width + this.#operator.notRadius, centerTop, this.#operator.notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);

        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius,
          "height": 2 * this.#operator.oneHeight
        };
        break;
    }
  }

  #setSymbolPath(name, type, width, height, centerTop, radiusTop) {
    if (type !== "NOT") {
      this.#symbolPath[name].moveTo(width, height);
      this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
    }
    
    switch (type) {
      case "OR":
      case "NOR":
        this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].ellipse(width, centerTop, this.#operator.radiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);
        break;
      case "AND":
      case "NAND":
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].ellipse(width, centerTop, this.#operator.radiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);
        break;
      case "XOR":
      case "NXOR":
        this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].ellipse(width, centerTop, this.#operator.radiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);

        var ellipse = new Path2D();
        ellipse.ellipse(this.#jsonUI[name].left - this.#operator.xorGap, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].addPath(ellipse);
        break;
      case "NOT":
        this.#symbolPath[name].moveTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, centerTop);
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
        this.#symbolPath[name].closePath();
        break;
    }

    this.#ctx.stroke(this.#symbolPath[name]);
  }

  #drawKnob(name) {
    this.#knobPath[name] = new Path2D();
    this.#knobPath[name].moveTo(this.#knobCenter[name].left, this.#knobCenter[name].top - this.#onKnob.radius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left + this.#onKnob.radius, this.#knobCenter[name].top);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left, this.#knobCenter[name].top + this.#onKnob.radius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left - this.#onKnob.radius, this.#knobCenter[name].top);
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