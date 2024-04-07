class LogicalCircuitUI {
  #uniqueClass;
  #core = new LogicalCircuitCore();
  #jsonUI = {};

  #default = {
    "width": 800,
    "height": 600,
    "font": "24px sans-serif",
    "lineWidth": 2,
    "strokeStyle": "black",
    "fillStyle": "black",
    "cursor": "default",
    "bezierConnector": false,
    "showOperatorType": false,
    "interactive": false
  };

  #toolbar;
  #canvas;

  constructor(container, options) {
    this.#uniqueClass = "LogicalCircuitUI_Container_" + new Date().getTime() + "_" + parseInt(Math.random() * 1000);

    try {
      options.width;
    } catch (exception) {
      options = {};
    }
    options.width = isNaN(options.width) || options.width < 0 ? this.#default.width : options.width;
    options.height = isNaN(options.height) || options.height < 0 ? this.#default.height : options.height;

    container.classList.add("LogicalCircuitUI_Container");
    container.classList.add(this.#uniqueClass);
    container.style.width = (options.width + 2) + "px";

    this.#toolbar = new LogicalCircuitToolbar(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, options);
    this.#canvas = new LogicalCircuitCanvas(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, options);

    if (options.bezierConnector) {
      this.setBezierConnector(true);
    }
    if (options.showOperatorType) {
      this.setShowOperatorType(true);
    }
  }

  getJSON() {
    return this.#core.getJSON();
  }

  getJSONUI() {
    return JSON.parse(JSON.stringify(this.#jsonUI));
  }

  setSimplifier(simplifier) {
    this.#core.setSimplifier(simplifier);
    this.#toolbar.setSimplifierVisible(!!simplifier);
  }

  setBezierConnector(bezierConnector) {
    this.#canvas.setBezierConnector(!!bezierConnector);
  }

  setShowOperatorType(showOperatorType) {
    this.#canvas.setShowOperatorType(!!showOperatorType);
  }
}