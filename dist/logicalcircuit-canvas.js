class LogicalCircuitCanvas {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #onChangeListener = [];
  #onChangeUIListener = [];

  #canvas;
  #ctx;

  constructor(container, uniqueClass, core, jsonUI, def, onChangeListener, onChangeUIListener, options) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;
    this.#onChangeListener = onChangeListener;
    this.#onChangeUIListener = onChangeUIListener;

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

  setJSONUI() {
    this.setInteractive(this.#default.interactive);
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

  setInteractive(interactive) {
    this.#default.interactive = !!interactive;
//    this.#onInteractive.selected = false;
//
//    this.#interactive = {};
//
//    if (interactive) {
//      for (var property in this.#jsonUI) {
//        if (this.#core.getType(property) === "IN") {
//          this.#interactive[property] = false;
//        }
//      }
//    }
//
//    this.#draw();
  }
}