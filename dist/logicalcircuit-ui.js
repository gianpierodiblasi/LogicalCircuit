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

  #history = {
    index: -1,
    array: []
  };

  #onChangeListener = [];
  #onChangeUIListener = [];

  #canvas;
  #toolbar;

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

    this.#canvas = new LogicalCircuitCanvas(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#onChangeListener, this.#onChangeUIListener, options);
    this.#toolbar = new LogicalCircuitToolbar(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#onChangeListener, this.#onChangeUIListener, this.#canvas, options);

    this.setBezierConnector(options.bezierConnector);
    this.setShowOperatorType(options.showOperatorType);
    this.setInteractive(options.interactive);
  }

  setJSONs(json, jsonUI) {
    this.#core.setJSON(json);
    Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
    Object.assign(this.#jsonUI, jsonUI);

    this.#toolbar.setJSONUI();
    this.#canvas.setJSONUI();

    this.#history.index = -1;
    this.#history.array = [];
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
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

  setReorganizer(reorganizer) {
    this.#toolbar.setReorganize(reorganizer);
  }

  computeExpressions(parameters) {
    return this.#core.computeExpressions(parameters);
  }

  computeExpression(name, parameters) {
    return this.#core.computeExpression(name, parameters);
  }

  getJavaScriptExpressions() {
    return this.#core.getJavaScriptExpressions();
  }

  getJavaScriptExpression(name) {
    return this.#core.getJavaScriptExpression(name);
  }

  isValid() {
    return this.#core.isValid();
  }

  setBezierConnector(bezierConnector) {
    this.#canvas.setBezierConnector(!!bezierConnector);
  }

  setShowOperatorType(showOperatorType) {
    this.#canvas.setShowOperatorType(!!showOperatorType);
  }

  setInteractive(interactive) {
    this.#canvas.setInteractive(!!interactive);
  }

  addOnChangeListener(listener) {
    this.#onChangeListener.push(listener);
  }

  addOnChangeUIListener(listener) {
    this.#onChangeUIListener.push(listener);
  }

  addBlackListWord(name) {
    this.#core.addBlackListWord(name);
  }
}