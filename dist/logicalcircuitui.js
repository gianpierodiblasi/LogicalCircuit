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
    "pressed": false,
    "name": "",
    "index": -1,
    "referenceName": "",
    event: null,
    "lineWidth": 3,
    "radius": 5
  };

  #onSymbol = {
    "pressed": false,
    "name": "",
    "offsetLeft": 0,
    "offsetTop": 0
  };

  #onArrow = {
    "pressed": false,
    "name": "",
    "direction": ""
  };

  #currentEvent;

  #onChangeListener = [];
  #onChangeUIListener = [];

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

    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());

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

      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());

      this.#draw();
    }
  }

  #addOutput(name) {
    if (this.#logicalCircuit.addOutput(name)) {
      this.#addPosition(name);

      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());

      this.#draw();
    }
  }

  #add(type) {
    var name = this.#logicalCircuit["add" + type]();
    this.#addPosition(name);

    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());

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

    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());

    this.#draw();
  }

  addOnChangeListener(listener) {
    this.#onChangeListener.push(listener);
  }

  addOnChangeUIListener(listener) {
    this.#onChangeUIListener.push(listener);
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

    for (var property in this.#jsonUI) {
      var type = this.#logicalCircuit.getType(property);

      switch (type) {
        case "IN":
          break;
        case "OUT":
          this.#drawConnector(this.#logicalCircuit.getFrom(property)[0], property, 0);
          break;
        default:
          this.#logicalCircuit.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
          break;
      }
    }

    this.#drawOnMouse();
    this.#drawOnKnob();
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

  #drawConnector(startName, endName, endIndex) {
    if (startName) {
      this.#connectorPath[endName + "*" + endIndex] = new Path2D();
      this.#connectorPath[endName + "*" + endIndex].moveTo(this.#knobCenter[startName + "*exit"].left, this.#knobCenter[startName + "*exit"].top);
      this.#connectorPath[endName + "*" + endIndex].lineTo(this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      this.#ctx.stroke(this.#connectorPath[endName + "*" + endIndex]);
    }
  }

  #drawOnMouse() {

  }

  #drawOnKnob() {
//    if (this.#onKnob.event) {
//      this.#ctx.beginPath();
//      this.#ctx.moveTo(this.#onKnob.event.offsetX, this.#onKnob.event.offsetY);
//      this.#ctx.lineTo(this.#currentEvent.offsetX, this.#currentEvent.offsetY);
//      this.#ctx.stroke();
//
//      if (this.#onKnob.name) {
//        this.#ctx.lineWidth = this.#onKnobLineWidth;
////        this.#ctx.strokeStyle = this.#isConnectionValid(this.#onMouse.name, this.#onMouse.reference, this.#onKnob.name, this.#onKnob.reference) ? "green" : "orange";
//        this.#ctx.stroke(this.#knobPath[this.#onKnob.referenceName]);
//        this.#ctx.lineWidth = this.#defaultLineWidth;
//        this.#ctx.strokeStyle = this.#defaultStrokeStyle;
//      }
//    }
  }

  #intersects(cx, cy, radius, rx, ry, rw, rh) {
    var testX = cx;
    var testY = cy;

    if (cx < rx) {
      testX = rx;
    } else if (cx > rx + rw) {
      testX = rx + rw;
    }
    if (cy < ry) {
      testY = ry;
    } else if (cy > ry + rh) {
      testY = ry + rh;
    }

    var distX = cx - testX;
    var distY = cy - testY;
    var distance = Math.sqrt((distX * distX) + (distY * distY));

    return distance <= radius;
  }

  #getPath(referencePath, referenceName) {
    switch (referencePath) {
      case "symbolPath":
        return this.#symbolPath[referenceName];
      case "knobPath":
        return this.#knobPath[referenceName];
      case "connectorPath":
        return this.#connectorPath[referenceName];
    }
  }

  #onMouseMove(event) {
    this.#currentEvent = event;

//    if (this.#onSymbol.pressed) {
//      this.#jsonUI[this.#onMouse.name].top = event.offsetY - this.#onSymbol.offsetTop;
//      this.#jsonUI[this.#onMouse.name].left = event.offsetX - this.#onSymbol.offsetLeft;
//
//      this.#onChangeUIListener.forEach(listener => listener());
//    } else if (this.#onKnob.pressed) {
//      this.#findKnob(event);
//    } else {
    this.#findPath(event);
//    }

    this.#draw();
  }

  #findKnob(event) {
//    this.#onKnob.name = "";
//
//    for (var property in this.#jsonUI) {
//      switch (this.#logicalCircuit.getType(property)) {
//        case "IN":
//          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
//            this.#onKnob.name = property;
//            this.#onKnob.referenceName = property + "*exit";
//          }
//          break;
//        case "OUT":
//          this.#logicalCircuit.getFrom(property).forEach((element, index) => {
//            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
//              this.#onKnob.name = property;
//              this.#onKnob.index = index;
//              this.#onKnob.referenceName = property + "*" + index;
//            }
//          });
//          break;
//        default:
//          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
//            this.#onKnob.name = property;
//            this.#onKnob.referenceName = property + "*exit";
//          }
//
//          this.#logicalCircuit.getFrom(property).forEach((element, index) => {
//            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
//              this.#onKnob.name = property;
//              this.#onKnob.index = index;
//              this.#onKnob.referenceName = property + "*" + index;
//            }
//          });
//          break;
//      }
//    }
  }

  #findPath(event) {
    this.#onMouse.name = "";

    for (var property in this.#jsonUI) {
      if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#symbolPath[property], event.offsetX, event.offsetY)) {
        this.#onMouse.name = property;
        this.#onMouse.referencePath = "symbolPath";
        this.#onMouse.referenceName = property;
      }

      switch (this.#logicalCircuit.getType(property)) {
        case "IN":
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*exit";
          }
          break;
        case "OUT":
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*0"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = 0;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*0";
          }
          if (!this.#onMouse.name && this.#logicalCircuit.getFrom(property)[0] && this.#ctx.isPointInStroke(this.#connectorPath[property + "*0"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = 0;
            this.#onMouse.referencePath = "connectorPath";
            this.#onMouse.referenceName = property + "*" + 0;
          }
          break;
        default:
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*exit";
          }

          this.#logicalCircuit.getFrom(property).forEach((element, index) => {
            if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onMouse.name = property;
              this.#onMouse.index = index;
              this.#onMouse.referencePath = "knobPath";
              this.#onMouse.referenceName = property + "*" + index;
            }
            if (!this.#onMouse.name && element && this.#ctx.isPointInStroke(this.#connectorPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onMouse.name = property;
              this.#onMouse.index = index;
              this.#onMouse.referencePath = "connectorPath";
              this.#onMouse.referenceName = property + "*" + index;
            }
          });
          break;
      }
    }
  }

  #onMouseDown(event) {
//    if (!this.#onMouse.name) {
//      return;
//    }
//
//    switch (this.#onMouse.referencePath) {
//      case "knobPath":
//        this.#onKnob.event = event;
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
//          this.#onSymbol.offsetLeft = event.offsetX - this.#jsonUI[this.#onMouse.name].left;
//          this.#onSymbol.offsetTop = event.offsetY - this.#jsonUI[this.#onMouse.name].top;
//        }
//        break;
//      case "connectorPath":
//        this.#logicalCircuit.removeConnection(this.#onMouse.name, this.#onMouse.index);
//        this.#onMouse = {"name": "", "index": -1, "referencePath": "", "referenceName": ""};
//        this.#draw();
//        break;
//    }
  }

  #onMouseUp(event) {
    this.#onKnob.pressed = false;
    this.#onSymbol.pressed = false;
    this.#onArrow.pressed = false;
    this.#draw();
  }
}