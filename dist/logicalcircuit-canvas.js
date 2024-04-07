class LogicalCircuitCanvas {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;

  #canvas;
  #ctx;

  constructor(container, uniqueClass, core, jsonUI, def, options) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = options.width;
    this.#canvas.height = options.height;
//    this.#canvas.onmousemove = (event) => this.#onMouseMove(event);
//    this.#canvas.onmousedown = (event) => this.#onMouseDown(event);
//    this.#canvas.onmouseup = (event) => this.#onMouseUp(event);
    container.append(this.#canvas);

    this.#ctx = this.#canvas.getContext('2d');
    this.#ctx.font = this.#default.font;
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.lineJoin = "round";
//    this.#draw();
  }
  
  setBezierConnector(bezierConnector) {
    this.#default.bezierConnector = bezierConnector;
//    this.#draw();
  }

  setShowOperatorType(showOperatorType) {
    this.#default.showOperatorType = showOperatorType;
//    this.#draw();
  }
}