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

  #currentEvent;
  #pressedEvent;

  #onMouse = {"name": "", "index": -1, "referencePath": "", "referenceName": ""};
  #onKnob = {"object": null, "reference": "", "index": -1, pressed: false};
  #onArrow = {"direction": "", selected: false};
  #onSymbol = {"pressed": false, "offsetX": 0, "offsetY": 0};

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
        default:
          this.#logicalCircuit.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
          break;
      }
    }

    this.#drawOnMouse();
    this.#drawOnKnob();
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
      "left": this.#jsonUI[name].left + (suffix === "exit" ? width + this.#knobRadius : -this.#knobRadius),
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
            this.#knobCenter[name + "*exit"] = {
              "left": width + this.#operatorRadiusLeft + this.#knobRadius,
              "top": centerTop
            };
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            this.#knobCenter[name + "*exit"] = {
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
        break;
      case "NOT":
        var width = this.#jsonUI[name].left + this.#operatorLineWidth + this.#operatorRadiusLeft;
        var height = this.#jsonUI[name].top + 2 * this.#operator1Height;
        var centerTop = this.#jsonUI[name].top + this.#operator1Height;

        this.#knobCenter[name + "*exit"] = {
          "left": width + 2 * this.#notRadius + this.#knobRadius,
          "top": centerTop
        };

        this.#knobCenter[name + "*0"] = {
          "left": this.#jsonUI[name].left - this.#knobRadius,
          "top": centerTop
        };
        this.#drawKnob(name + "*0");

        this.#symbolSize[name] = {
          "width": this.#operatorLineWidth + this.#operatorRadiusLeft + 2 * this.#notRadius,
          "height": 2 * this.#operator1Height
        };

        this.#symbolPath[name].moveTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, centerTop);
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
        this.#symbolPath[name].closePath();

        var arc = new Path2D();
        arc.arc(width + this.#notRadius, centerTop, this.#notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);
        break;
    }

    this.#drawKnob(name + "*exit");
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
      this.#connectorPath[endName + "*" + endIndex] = new Path2D();
      this.#connectorPath[endName + "*" + endIndex].moveTo(this.#knobCenter[startName + "*exit"].left, this.#knobCenter[startName + "*exit"].top);
      this.#connectorPath[endName + "*" + endIndex].lineTo(this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      this.#ctx.stroke(this.#connectorPath[endName + "*" + endIndex]);
    }
  }

  #drawOnMouse() {
    if (!this.#onMouse.name) {
    } else {
      this.#ctx.lineWidth = this.#onMouseLineWidth;
//
//      if (this.#onSymbol.pressed) {
//        this.#ctx.strokeStyle = this.#intersects(this.#canvas.width, this.#canvas.height, 80, this.#onMouse.object.left, this.#onMouse.object.top, this.#onMouse.object.symbolSize.width, this.#onMouse.object.symbolSize.height) ? "red" : "green";
//      } else {
//        this.#ctx.strokeStyle = ["fromKnobConnectorPath", "knobConnectorPath"].includes(this.#onMouse.reference) ? "red" : "green";
//      }
      this.#ctx.stroke(this.#getPath(this.#onMouse.referencePath, this.#onMouse.referenceName));

      this.#ctx.lineWidth = this.#defaultLineWidth;
      this.#ctx.strokeStyle = this.#defaultStrokeStyle;
    }
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

  #drawOnKnob() {

  }

  #onMouseMove(event) {
    this.#currentEvent = event;

    if (this.#onSymbol.pressed) {

    } else if (this.#onKnob.pressed) {

    } else {
      this.#onMouse = {"name": "", "index": -1, "referencePath": "", "referenceName": ""};

      for (var property in this.#jsonUI) {
        var type = this.#logicalCircuit.getType(property);

        if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#symbolPath[property], event.offsetX, event.offsetY)) {
          this.#onMouse.name = property;
          this.#onMouse.referencePath = "symbolPath";
          this.#onMouse.referenceName = property;
        }

        switch (type) {
          case "IN":
            if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
              this.#onMouse.name = property;
              this.#onMouse.referencePath = "knobPath";
              this.#onMouse.referenceName = property + "*exit";
            }
            break;
          case "OUT":
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

    this.#draw();
  }

  #onMouseDown(event) {

  }

  #onMouseUp(event) {

  }
}