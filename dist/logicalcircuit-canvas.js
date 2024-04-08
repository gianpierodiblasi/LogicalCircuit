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

  }
}