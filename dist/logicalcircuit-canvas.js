class LogicalCircuitCanvas {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #history;
  #onChangeListener = [];
  #onChangeUIListener = [];

  #canvas;
  #ctx;

  #onInteractive = {
    "selected": false
  }
  #interactive = {};
  #interactivePath = {};

  #knobPath = {};
  #knobCenter = {};
  #symbolPath = {};
  #symbolSize = {};
  #connectorPath = {};

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

  constructor(container, uniqueClass, core, jsonUI, def, history, onChangeListener, onChangeUIListener) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;
    this.#history = history;
    this.#onChangeListener = onChangeListener;
    this.#onChangeUIListener = onChangeUIListener;

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = this.#default.width;
    this.#canvas.height = this.#default.height;
//    this.#canvas.onmousemove = (event) => this.#onMouseMove(event);
//    this.#canvas.onmousedown = (event) => this.#onMouseDown(event);
//    this.#canvas.onmouseup = (event) => this.#onMouseUp(event);
    container.append(this.#canvas);

    this.#ctx = this.#canvas.getContext('2d');
    this.#ctx.font = this.#default.font;
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.lineJoin = "round";
    this.#draw();
  }

  setJSONUI() {
    this.setInteractive(this.#default.interactive);
  }

  setBezierConnector(bezierConnector) {
    this.#default.bezierConnector = bezierConnector;
    this.#draw();
  }

  setShowOperatorType(showOperatorType) {
    this.#default.showOperatorType = showOperatorType;
    this.#draw();
  }

  setInteractive(interactive) {
    this.#default.interactive = !!interactive;
    this.#onInteractive.selected = false;

    this.#interactive = {};

    if (interactive) {
      Object.keys(this.#jsonUI).forEach(property => {
        if (this.#core.getType(property) === "IN") {
          this.#interactive[property] = false;
        }
      });
    }

    this.#draw();
  }

  getSymbolSize() {
    return JSON.parse(JSON.stringify(this.#symbolSize));
  }

  #draw() {
    this.#canvas.style.cursor = this.#default.cursor;
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#drawTrash();

    Object.keys(this.#jsonUI).forEach(property => {
      var type = this.#core.getType(property);

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
    });

    Object.keys(this.#jsonUI).forEach(property => {
      switch (this.#core.getType(property)) {
        case "IN":
          break;
        case "OUT":
          this.#drawConnector(this.#core.getFrom(property)[0], property, 0);
          break;
        default:
          this.#core.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
          break;
      }
    });

//    this.#drawOnMouse();
//    this.#drawOnKnob();
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
      } else if (this.#core.isValid()) {
        style = this.#core.computeExpression(name, this.#interactive) ? this.#text.ONStyle : this.#text.OFFStyle;
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
    var from = this.#core.getFrom(name);

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
        this.#symbolPath[name].quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, this.#jsonUI[name].top, width + this.#operator.radiusLeft, centerTop);
        this.#symbolPath[name].quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, height, width, height);
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
}