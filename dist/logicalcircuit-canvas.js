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
//          this.#drawOperator(property, type);
          break;
      }
    });
//
//    for (var property in this.#jsonUI) {
//      var type = this.#core.getType(property);
//
//      switch (type) {
//        case "IN":
//          break;
//        case "OUT":
//          this.#drawConnector(this.#core.getFrom(property)[0], property, 0);
//          break;
//        default:
//          this.#core.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
//          break;
//      }
//    }
//
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

  #drawKnob(name) {
    this.#knobPath[name] = new Path2D();
    this.#knobPath[name].moveTo(this.#knobCenter[name].left, this.#knobCenter[name].top - this.#onKnob.radius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left + this.#onKnob.radius, this.#knobCenter[name].top);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left, this.#knobCenter[name].top + this.#onKnob.radius);
    this.#knobPath[name].lineTo(this.#knobCenter[name].left - this.#onKnob.radius, this.#knobCenter[name].top);
    this.#knobPath[name].closePath();
    this.#ctx.stroke(this.#knobPath[name]);
  }
}