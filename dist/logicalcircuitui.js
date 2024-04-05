/* global dagre */

class LogicalCircuitUI {
  #logicalCircuit = new LogicalCircuit();
  #jsonUI = {};
  #interactive = {};

  #uniqueClass;
  #canvas;
  #ctx;
  #onChangeListener = [];
  #onChangeUIListener = [];

  #knobPath = {};
  #knobCenter = {};
  #symbolPath = {};
  #symbolSize = {};
  #connectorPath = {};
  #interactivePath = {};
  #currentEvent;

  #default = {
    "width": 800,
    "height": 600,
    "font": "24px sans-serif",
    "lineWidth": 2,
    "strokeStyle": "black",
    "cursor": "default",
    "bezierConnector": false,
    "showOperatorType": false,
    "interactive": false
  };

  #cursor = {
    "grab": "grab",
    "pointer": "pointer",
    "notAllowed": "not-allowed",
    "grabbing": "grabbing"
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
    "height": 40,
    "ONStyle": "green",
    "OFFStyle": "gray",
    "circleStyle": "white"
  };

  #operator = {
    "radiusLeft": 20,
    "lineWidth": 30,
    "oneHeight": 20,
    "xorGap": 12,
    "notRadius": 7,
    "font": "9px sans-serif"
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
    "canDoStrokeStyle": "green",
    "cannotDoStrokeStyle": "orange",
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
    "selected": false,
    "name": "",
    "direction": "",
    "font": "14px sans-serif",
    "up": "-", //"\u{02191}",
    "down": "+", // "\u{02193}",
    "max": 6,
    "canDoStrokeStyle": "white",
    "cannotDoStrokeStyle": "gray"
  };

  #onInteractive = {
    "selected": false
  }

  constructor(container, options) {
    try {
      options.width;
    } catch (exception) {
      options = {};
    }
    options.width = isNaN(options.width) || options.width < 0 ? this.#default.width : options.width;
    options.height = isNaN(options.height) || options.height < 0 ? this.#default.height : options.height;

    this.#uniqueClass = "LogicalCircuitUI_Container_" + new Date().getTime() + "_" + parseInt(Math.random() * 1000);
    container.classList.add("LogicalCircuitUI_Container");
    container.classList.add(this.#uniqueClass);
    container.style.width = (options.width + 2) + "px";

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    toolbar.style.width = (options.width + 2) + "px";
    container.append(toolbar);

    var toolbarLeft = document.createElement("div");
    toolbarLeft.classList.add("LogicalCircuitUI_Toolbar_Left");
    toolbar.append(toolbarLeft);

    var toolbarCenter = document.createElement("div");
    toolbarCenter.classList.add("LogicalCircuitUI_Toolbar_Center");
    toolbar.append(toolbarCenter);

    var toolbarRight = document.createElement("div");
    toolbarRight.classList.add("LogicalCircuitUI_Toolbar_Right");
    toolbar.append(toolbarRight);

    this.#addButtonsAndText(toolbarLeft);
    this.#addButtons(toolbarLeft, "OR", () => this.#add("OR"), () => this.#add("NOR"));
    this.#addButtons(toolbarLeft, "AND", () => this.#add("AND"), () => this.#add("NAND"));
    this.#addButtons(toolbarLeft, "XOR", () => this.#add("XOR"), () => this.#add("NXOR"));
    this.#addButtons(toolbarLeft, "NOT", () => this.#add("NOT"));

    if (QuineMcCluskey) {
      this.#addButtons(toolbarCenter, "SIMPLIFY (POS)", () => this.#simplify(true));
      this.#addButtons(toolbarCenter, "SIMPLIFY (SOP)", () => this.#simplify(false));
    }

    if (dagre.graphlib.Graph) {
      this.#addButtons(toolbarCenter, "TIDY UP", () => this.#tidyUp(false));
    }

    this.#addButtons(toolbarRight, "CLEAR", () => this.#clear());

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = options.width;
    this.#canvas.height = options.height;
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

    if (options.bezierConnector) {
      this.setBezierConnector(true);
    }
    if (options.showOperatorType) {
      this.setShowOperatorType(true);
    }
    if (options.interactive) {
      this.setInteractive(true);
    }
  }

  setJSONs(json, jsonUI) {
    this.#logicalCircuit.setJSON(json);
    this.#jsonUI = JSON.parse(JSON.stringify(jsonUI));
    this.setInteractive(this.#default.interactive);

    this.#resetText();
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

  computeExpressions(parameters) {
    return this.#logicalCircuit.computeExpressions(parameters);
  }

  computeExpression(name, parameters) {
    return this.#logicalCircuit.computeExpression(name, parameters);
  }

  getJavaScriptExpressions() {
    return this.#logicalCircuit.getJavaScriptExpressions();
  }

  getJavaScriptExpression(name) {
    return this.#logicalCircuit.getJavaScriptExpression(name);
  }

  isValid() {
    return this.#logicalCircuit.isValid();
  }

  #addButtonsAndText(toolbar) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_TextContainer");
    toolbar.append(div);

    var text = document.createElement("input");
    text.type = "text";
    text.classList.add("IN-OUT");
    text.oninput = (event) => {
      var disabled = !this.#logicalCircuit.isNameValid(text.value) || this.#logicalCircuit.isNameAlreadyUsed(text.value);
      buttonIN.disabled = disabled;
      buttonOUT.disabled = disabled;
    };
    div.append(text);

    var buttonIN = this.#createButton(div, "IN", true);
    var buttonOUT = this.#createButton(div, "OUT", true);

    buttonIN.onclick = (event) => this.#addInput(text.value);
    buttonOUT.onclick = (event) => this.#addOutput(text.value);
  }

  #addButtons(toolbar, label, listener, listenerN) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_ButtonContainer");
    toolbar.append(div);

    if (listener) {
      this.#createButton(div, label, false).onclick = (event) => listener(label);
    }
    if (listenerN) {
      this.#createButton(div, "N" + label, false).onclick = (event) => listenerN(label);
    }
  }

  #createButton(div, label, disabled) {
    var button = document.createElement("button");
    button.textContent = label;
    button.classList.add(label.replace(" ", "-"));
    button.disabled = disabled;
    div.append(button);
    return button;
  }

  #addInput(name) {
    if (this.#logicalCircuit.addInput(name)) {
      this.#addPosition(name);

      if (this.#default.interactive) {
        this.#interactive[name] = false;
      }

      this.#resetText();
      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());

      this.#draw();
    }
  }

  #addOutput(name) {
    if (this.#logicalCircuit.addOutput(name)) {
      this.#addPosition(name);

      this.#resetText();
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

  #simplify(isMaxterm) {
    if (confirm("Do you really want to simplify the current logical circuit?") && this.#logicalCircuit.simplify(isMaxterm)) {
      this.#jsonUI = {};
      this.#resetText();

      try {
        var g = new dagre.graphlib.Graph();
        Object.keys(this.getJSON()).forEach(name => this.#addPosition(name));

        this.setInteractive(this.#default.interactive);
        this.#onChangeListener.forEach(listener => listener());

        this.#tidyUp(true);
      } catch (exception) {
        var json = this.getJSON();

        Object.keys(json).filter(name => this.#logicalCircuit.getType(name) === "IN").forEach((name, index, array) => this.#assignPosition(name, index, array, this.#addedElementPosition.left));
        Object.keys(json).filter(name => this.#logicalCircuit.getType(name) === "NOT").forEach((name, index, array) => this.#assignPosition(name, index, array, this.#canvas.width / 5));
        Object.keys(json).filter(name => this.#logicalCircuit.getType(name) === "AND").forEach((name, index, array) => this.#assignPosition(name, index, array, 2 * this.#canvas.width / 5));
        Object.keys(json).filter(name => this.#logicalCircuit.getType(name) === "OR").forEach((name, index, array) => this.#assignPosition(name, index, array, 3 * this.#canvas.width / 5));
        Object.keys(json).filter(name => this.#logicalCircuit.getType(name) === "OUT").forEach((name, index, array) => this.#assignPosition(name, index, array, 4 * this.#canvas.width / 5));

        this.setInteractive(this.#default.interactive);
        this.#onChangeListener.forEach(listener => listener());
        this.#onChangeUIListener.forEach(listener => listener());
        this.#draw();
      }
    }
  }

  #assignPosition(name, index, array, offset) {
    this.#jsonUI[name] = {
      "top": (index + 1) * this.#canvas.height / (array.length + 1) - this.#text.height,
      "left": offset
    };
  }

  #tidyUp(doNotAsk) {
    if (doNotAsk || confirm("Do you really want to tidy up the current logical circuit?")) {

      var g = new dagre.graphlib.Graph();
      g.setGraph({
        "rankdir": "LR",
        "marginx": 20,
        "marginy": 20
      });
      g.setDefaultEdgeLabel(() => {
        return {};
      });

      for (var property in this.#jsonUI) {
        g.setNode(property, {width: this.#symbolSize[property].width, height: this.#symbolSize[property].height});

        switch (this.#logicalCircuit.getType(property)) {
          case "IN":
            break;
          case "OUT":
            g.setEdge(this.#logicalCircuit.getFrom(property)[0], property);
            break;
          default:
            this.#logicalCircuit.getFrom(property).forEach(name => g.setEdge(name, property));
            break;
        }
      }

      dagre.layout(g);
      var graph = g.graph();
      var scale = graph.width > this.#canvas.width || graph.height > this.#canvas.height ? Math.min(this.#canvas.width / graph.width, this.#canvas.height, graph.height) : 1;

      g.nodes().forEach(v => {
        var node = g.node(v);
        this.#jsonUI[v].left = node.x * scale - node.width / 2;
        this.#jsonUI[v].top = node.y * scale - node.height / 2;
      });

      this.#onChangeUIListener.forEach(listener => listener());
      this.#draw();
    }
  }

  #clear() {
    if (confirm("Do you really want to clear the current logical circuit?")) {
      this.#logicalCircuit.clear();
      this.#jsonUI = {};

      this.#resetText();
      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());

      this.#draw();
    }
  }

  #resetText() {
    document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value = "";
    document.querySelector("." + this.#uniqueClass + " button.IN").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.OUT").disabled = true;
  }

  setBezierConnector(bezierConnector) {
    this.#default.bezierConnector = !!bezierConnector;
    this.#draw();
  }

  setShowOperatorType(showOperatorType) {
    this.#default.showOperatorType = !!showOperatorType;
    this.#draw();
  }

  setInteractive(interactive) {
    this.#default.interactive = !!interactive;
    this.#onInteractive.selected = false;

    this.#interactive = {};

    if (interactive) {
      for (var property in this.#jsonUI) {
        if (this.#logicalCircuit.getType(property) === "IN") {
          this.#interactive[property] = false;
        }
      }
    }

    this.#draw();
  }

  addOnChangeListener(listener) {
    this.#onChangeListener.push(listener);
  }

  addOnChangeUIListener(listener) {
    this.#onChangeUIListener.push(listener);
  }

  addBlackListWord(name) {
    this.#logicalCircuit.addBlackListWord(name);
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
    var width = this.#ctx.measureText(name).width + this.#text.gap + (this.#default.interactive ? this.#text.gap : 0);
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

    if (this.#default.interactive) {
      var style;
      if (suffix === "exit") {
        style = this.#interactive[name] ? this.#text.ONStyle : this.#text.OFFStyle;
      } else if (this.isValid()) {
        style = this.computeExpression(name, this.#interactive) ? this.#text.ONStyle : this.#text.OFFStyle;
      } else {
        style = this.#text.circleStyle;
      }

      var radius = this.#text.gap / 2 - 2;
      var arcTop = style === this.#text.ONStyle ? this.#jsonUI[name].top + 2 + radius + 2 : this.#jsonUI[name].top + this.#text.height - 2 - radius - 2;

      var path = new Path2D();
      path.roundRect(this.#jsonUI[name].left + width - this.#text.gap - 2, this.#jsonUI[name].top + 2, this.#text.gap, this.#text.height - 4, this.#text.gap / 2);
      if (suffix === "exit") {
        this.#interactivePath[name] = path;
      }

      this.#ctx.fillStyle = style;
      this.#ctx.fill(path);
      this.#ctx.fillStyle = this.#text.circleStyle;
      this.#ctx.beginPath();
      this.#ctx.arc(this.#jsonUI[name].left + width - this.#text.gap / 2 - 2, arcTop, radius, 0, 2 * Math.PI);
      this.#ctx.fill();
      this.#ctx.fillStyle = this.#default.strokeStyle;
    }

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

    this.#drawOperatorType(name, type);
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

  #drawOperatorType(name, type) {
    if (this.#default.showOperatorType) {
      this.#ctx.font = this.#operator.font;

      var left;
      switch (type) {
        case "OR":
        case "XOR":
          left = this.#operator.radiusLeft + (this.#symbolSize[name].width - this.#operator.radiusLeft - this.#ctx.measureText(type).width) / 2;
          break;
        case "AND":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 2;
          break;
        case "NOR":
        case "NXOR":
          left = this.#operator.radiusLeft + (this.#symbolSize[name].width - this.#operator.radiusLeft - this.#ctx.measureText(type).width) / 2 - this.#operator.notRadius;
          break;
        case "NAND":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 2 - this.#operator.notRadius;
          break;
        case "NOT":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 4;
          break;
      }

      this.#ctx.fillText(type, this.#jsonUI[name].left + left, this.#jsonUI[name].top + this.#symbolSize[name].height / 2);
      this.#ctx.font = this.#default.font;
    }
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

      if (this.#default.bezierConnector) {
        var cp1 = {
          "left": this.#knobCenter[startName + "*exit"].left + (this.#knobCenter[endName + "*" + endIndex].left - this.#knobCenter[startName + "*exit"].left) / 2,
          "top": this.#knobCenter[startName + "*exit"].top
        };

        var cp2 = {
          "left": cp1.left,
          "top": this.#knobCenter[endName + "*" + endIndex].top
        };

        this.#connectorPath[endName + "*" + endIndex].bezierCurveTo(cp1.left, cp1.top, cp2.left, cp2.top, this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      } else {
        this.#connectorPath[endName + "*" + endIndex].lineTo(this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      }

      this.#ctx.stroke(this.#connectorPath[endName + "*" + endIndex]);
    }
  }

  #drawOnMouse() {
    if (!this.#onMouse.name) {
    } else {
      var type = this.#logicalCircuit.getType(this.#onMouse.name);
      if (this.#onMouse.referencePath !== "symbolPath") {
      } else if (this.#default.interactive && type === "IN") {
        this.#onInteractive.selected = this.#ctx.isPointInPath(this.#interactivePath[this.#onMouse.name], this.#currentEvent.offsetX, this.#currentEvent.offsetY);
        this.#canvas.style.cursor = this.#onInteractive.selected ? this.#cursor.pointer : this.#cursor.grab;
      } else if (!["IN", "OUT", "NOT"].includes(type)) {
        this.#drawArrow();
      } else {
        this.#canvas.style.cursor = this.#cursor.grab;
      }

      this.#drawPath();
    }
  }

  #drawArrow() {
    var arrowLeft = this.#jsonUI[this.#onMouse.name].left + 3 * this.#symbolSize[this.#onMouse.name].width / 5;
    switch (this.#logicalCircuit.getType(this.#onMouse.name)) {
      case "OR":
      case "AND":
      case "XOR":
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        arrowLeft -= this.#operator.notRadius;
        break;
    }

    var fromLength = this.#logicalCircuit.getFrom(this.#onMouse.name).length;
    var arrowUP = this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 4;
    var arrowDOWN = this.#jsonUI[this.#onMouse.name].top + 3 * this.#symbolSize[this.#onMouse.name].height / 4;

    this.#ctx.font = this.#onArrow.font;
    var wUP = this.#ctx.measureText(this.#onArrow.up).width;
    var wDOWN = this.#ctx.measureText(this.#onArrow.down).width;
    var width = Math.max(wUP, wDOWN);

    var totPath = new Path2D();

    var path = new Path2D();
    this.#ctx.fillStyle = fromLength > 2 ? this.#onArrow.canDoStrokeStyle : this.#onArrow.cannotDoStrokeStyle;
    path.rect(arrowLeft - 2, this.#jsonUI[this.#onMouse.name].top + 3, width + 4, this.#symbolSize[this.#onMouse.name].height / 2 - 3);
    totPath.addPath(path);
    this.#ctx.fill(path);
    this.#ctx.stroke(path);
    path = new Path2D();
    this.#ctx.fillStyle = fromLength < this.#onArrow.max ? this.#onArrow.canDoStrokeStyle : this.#onArrow.cannotDoStrokeStyle;
    path.rect(arrowLeft - 2, this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 2, width + 4, this.#symbolSize[this.#onMouse.name].height / 2 - 3);
    totPath.addPath(path);
    this.#ctx.fill(path);
    this.#ctx.stroke(path);

    this.#ctx.fillStyle = this.#default.strokeStyle;
    this.#ctx.fillText(this.#onArrow.up, arrowLeft + (width - wUP) / 2, arrowUP);
    this.#ctx.fillText(this.#onArrow.down, arrowLeft + (width - wDOWN) / 2, arrowDOWN);
    this.#ctx.font = this.#default.font;

    this.#onArrow.selected = this.#ctx.isPointInPath(totPath, this.#currentEvent.offsetX, this.#currentEvent.offsetY);
    this.#onArrow.name = this.#onMouse.name;
    this.#onArrow.direction = this.#currentEvent.offsetY < this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 2 ? "UP" : "DOWN";

    if (!this.#onArrow.selected) {
      this.#canvas.style.cursor = this.#cursor.grab;
    } else if (this.#onArrow.direction === "UP" && fromLength > 2) {
      this.#canvas.style.cursor = this.#cursor.pointer;
    } else if (this.#onArrow.direction === "DOWN" && fromLength < this.#onArrow.max) {
      this.#canvas.style.cursor = this.#cursor.pointer;
    } else {
      this.#canvas.style.cursor = this.#cursor.notAllowed;
    }
  }

  #drawPath() {
    this.#ctx.lineWidth = this.#onMouse.lineWidth;

    if (this.#onSymbol.pressed) {
      this.#canvas.style.cursor = this.#cursor.grabbing;
      this.#ctx.strokeStyle = this.#intersects(this.#canvas.width, this.#canvas.height, this.#trash.lineWidth, this.#jsonUI[this.#onMouse.name].left, this.#jsonUI[this.#onMouse.name].top, this.#symbolSize[this.#onMouse.name].width, this.#symbolSize[this.#onMouse.name].height) ? this.#trash.strokeStyle : this.#onMouse.strokeStyle;
    } else {
      this.#ctx.strokeStyle = this.#onMouse.referencePath === "connectorPath" ? this.#trash.strokeStyle : this.#onMouse.strokeStyle;
    }
    this.#ctx.stroke(this.#getPath(this.#onMouse.referencePath, this.#onMouse.referenceName));

    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.strokeStyle = this.#default.strokeStyle;
  }

  #drawOnKnob() {
    if (this.#onKnob.pressed) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(this.#onKnob.event.offsetX, this.#onKnob.event.offsetY);

      if (this.#default.bezierConnector) {
        var cp1 = {
          "left": this.#onKnob.event.offsetX + (this.#currentEvent.offsetX - this.#onKnob.event.offsetX) / 2,
          "top": this.#onKnob.event.offsetY
        };

        var cp2 = {
          "left": cp1.left,
          "top": this.#currentEvent.offsetY
        };

        this.#ctx.bezierCurveTo(cp1.left, cp1.top, cp2.left, cp2.top, this.#currentEvent.offsetX, this.#currentEvent.offsetY);
      } else {
        this.#ctx.lineTo(this.#currentEvent.offsetX, this.#currentEvent.offsetY);
      }

      this.#ctx.stroke();

      if (this.#onKnob.name) {
        this.#ctx.lineWidth = this.#onKnob.lineWidth;
        this.#ctx.strokeStyle = this.#isConnectionValid(this.#onMouse.name, this.#onMouse.index, this.#onKnob.name, this.#onKnob.index) ? this.#onKnob.canDoStrokeStyle : this.#onKnob.cannotDoStrokeStyle;
        this.#ctx.stroke(this.#knobPath[this.#onKnob.referenceName]);
        this.#ctx.lineWidth = this.#default.lineWidth;
        this.#ctx.strokeStyle = this.#default.strokeStyle;
      }
    }
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

  #isConnectionValid(startName, startIndex, endName, endIndex) {
    var startType = this.#logicalCircuit.getType(startName);
    var endType = this.#logicalCircuit.getType(endName);

    if (startType === "IN" && endType === "IN") {
      return false;
    } else if (startType === "IN" && endType === "OUT") {
      return this.#logicalCircuit.isConnectionValid(startName, endName);
    } else if (startType === "IN") {
      return endIndex === -1 ? false : this.#logicalCircuit.isConnectionValid(startName, endName);
    } else if (startType === "OUT" && endType === "IN") {
      return this.#logicalCircuit.isConnectionValid(endName, startName);
    } else if (startType === "OUT" && endType === "OUT") {
      return false;
    } else if (startType === "OUT") {
      return endIndex !== -1 ? false : this.#logicalCircuit.isConnectionValid(endName, startName);
    } else if (endType === "IN") {
      return startIndex === -1 ? false : this.#logicalCircuit.isConnectionValid(endName, startName);
    } else if (endType === "OUT") {
      return startIndex !== -1 ? false : this.#logicalCircuit.isConnectionValid(startName, endName);
    } else if (startIndex === -1 && endIndex === -1) {
      return false;
    } else if (startIndex !== -1 && endIndex !== -1) {
      return false;
    } else if (startIndex === -1) {
      return this.#logicalCircuit.isConnectionValid(startName, endName);
    } else if (endIndex === -1) {
      return this.#logicalCircuit.isConnectionValid(endName, startName);
    } else {
      return false;
    }
  }

  #onMouseMove(event) {
    this.#currentEvent = event;

    var dist = Math.sqrt(Math.pow(event.offsetX - this.#canvas.width, 2) + Math.pow(event.offsetY - this.#canvas.height, 2));
    this.#canvas.setAttribute('title', dist < this.#trash.radius2 ? "To trash an element move and release it here" : "");

    if (this.#onSymbol.pressed) {
      this.#jsonUI[this.#onMouse.name].top = event.offsetY - this.#onSymbol.offsetTop;
      this.#jsonUI[this.#onMouse.name].left = event.offsetX - this.#onSymbol.offsetLeft;

      this.#onChangeUIListener.forEach(listener => listener());
    } else if (this.#onKnob.pressed) {
      this.#findKnob(event);
    } else {
      this.#findPath(event);
    }

    this.#draw();
  }

  #findKnob(event) {
    this.#onKnob.name = "";

    for (var property in this.#jsonUI) {
      switch (this.#logicalCircuit.getType(property)) {
        case "IN":
          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onKnob.name = property;
            this.#onKnob.index = -1;
            this.#onKnob.referenceName = property + "*exit";
          }
          break;
        case "OUT":
          this.#logicalCircuit.getFrom(property).forEach((element, index) => {
            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onKnob.name = property;
              this.#onKnob.index = index;
              this.#onKnob.referenceName = property + "*" + index;
            }
          });
          break;
        default:
          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onKnob.name = property;
            this.#onKnob.index = -1;
            this.#onKnob.referenceName = property + "*exit";
          }

          this.#logicalCircuit.getFrom(property).forEach((element, index) => {
            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onKnob.name = property;
              this.#onKnob.index = index;
              this.#onKnob.referenceName = property + "*" + index;
            }
          });
          break;
      }
    }
  }

  #findPath(event) {
    this.#onMouse.name = "";

    for (var property in this.#jsonUI) {
      switch (this.#logicalCircuit.getType(property)) {
        case "IN":
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = -1;
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
            this.#onMouse.referenceName = property + "*0";
          }
          break;
        default:
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = -1;
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

      if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#symbolPath[property], event.offsetX, event.offsetY)) {
        this.#onMouse.name = property;
        this.#onMouse.referencePath = "symbolPath";
        this.#onMouse.referenceName = property;
      }
    }
  }

  #onMouseDown(event) {
    if (!this.#onMouse.name) {
      return;
    }

    switch (this.#onMouse.referencePath) {
      case "knobPath":
        this.#onKnob.pressed = true;
        this.#onKnob.event = event;
        break;
      case "symbolPath":
        if (this.#onArrow.selected) {
          var fromLength = this.#logicalCircuit.getFrom(this.#onArrow.name).length;

          switch (this.#onArrow.direction) {
            case "UP":
              if (fromLength > 2) {
                this.#logicalCircuit.decConnector(this.#onArrow.name);
                this.#jsonUI[this.#onArrow.name].top += this.#operator.oneHeight / 2;

                this.#onChangeListener.forEach(listener => listener());
                this.#onChangeUIListener.forEach(listener => listener());
              }
              break;
            case "DOWN":
              if (fromLength < this.#onArrow.max) {
                this.#logicalCircuit.incConnector(this.#onArrow.name);
                this.#jsonUI[this.#onArrow.name].top -= this.#operator.oneHeight / 2;

                this.#onChangeListener.forEach(listener => listener());
                this.#onChangeUIListener.forEach(listener => listener());
              }
              break;
          }

          this.#draw();
        } else if (this.#onInteractive.selected) {
          this.#interactive[this.#onMouse.name] = !this.#interactive[this.#onMouse.name];
          this.#draw();
        } else {
          this.#onSymbol.pressed = true;
          this.#onSymbol.offsetLeft = event.offsetX - this.#jsonUI[this.#onMouse.name].left;
          this.#onSymbol.offsetTop = event.offsetY - this.#jsonUI[this.#onMouse.name].top;
          this.#canvas.style.cursor = this.#cursor.grabbing;
        }
        break;
      case "connectorPath":
        this.#logicalCircuit.removeConnection(this.#onMouse.name, this.#onMouse.index);
        this.#onMouse.name = "";

        this.#onChangeListener.forEach(listener => listener());
        this.#onChangeUIListener.forEach(listener => listener());

        this.#draw();
        break;
    }
  }

  #onMouseUp(event) {
    if (this.#onMouse.name && this.#onSymbol.pressed &&
            this.#intersects(this.#canvas.width, this.#canvas.height, this.#trash.lineWidth, this.#jsonUI[this.#onMouse.name].left, this.#jsonUI[this.#onMouse.name].top, this.#symbolSize[this.#onMouse.name].width, this.#symbolSize[this.#onMouse.name].height)) {
      this.#logicalCircuit.remove(this.#onMouse.name);
      delete this.#jsonUI[this.#onMouse.name];

      this.#onMouse.name = "";

      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());
    } else if (this.#onKnob.pressed && this.#onKnob.name &&
            this.#isConnectionValid(this.#onMouse.name, this.#onMouse.index, this.#onKnob.name, this.#onKnob.index)) {

      var startType = this.#logicalCircuit.getType(this.#onMouse.name);
      var endType = this.#logicalCircuit.getType(this.#onKnob.name);

      if (startType === "IN") {
        this.#logicalCircuit.addConnection(this.#onMouse.name, this.#onKnob.name, this.#onKnob.index);
      } else if (endType === "IN") {
        this.#logicalCircuit.addConnection(this.#onKnob.name, this.#onMouse.name, this.#onMouse.index);
      } else if (startType === "OUT") {
        this.#logicalCircuit.addConnection(this.#onKnob.name, this.#onMouse.name, 0);
      } else if (endType === "OUT") {
        this.#logicalCircuit.addConnection(this.#onMouse.name, this.#onKnob.name, 0);
      } else if (this.#onMouse.index === -1) {
        this.#logicalCircuit.addConnection(this.#onMouse.name, this.#onKnob.name, this.#onKnob.index);
      } else if (this.#onKnob.index === -1) {
        this.#logicalCircuit.addConnection(this.#onKnob.name, this.#onMouse.name, this.#onMouse.index);
      }

      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());
    }

    this.#onKnob.pressed = false;
    this.#onSymbol.pressed = false;
    this.#onArrow.selected = false;
    this.#draw();
  }
}