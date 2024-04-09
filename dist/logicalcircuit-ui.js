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
    index: 0,
    array: [{
        "json": "{}",
        "jsonUI": "{}"
      }]
  };

  #onChangeListener = [];
  #onChangeUIListener = [];

  #canvas;
  #toolbar;

  #messages = {
    "en": {
      "simplifyLabel": "Simplify",
      "reorganizeLabel": "Reorganize",
      "dndTooltip": "Click or Drag&Drop to add a new element",
      "trashTooltip": "To trash an element move and release it here",
      "undoTooltip": "Undo",
      "redoTooltip": "Redo",
      "clearTooltip": "Clear",
      "clearMessage": "Do you really want to clear the current logical circuit?",
      "simplifyMessage": "Do you really want to simplify the current logical circuit?",
      "reorganizeMessage": "Do you really want to reorganize the current logical circuit?"
    },
    "it": {
      "simplifyLabel": "Semplifica",
      "reorganizeLabel": "Riorganizza",
      "dndTooltip": "Clicca o Trascina&Rilascia per aggiungere un nuovo elemento",
      "trashTooltip": "Per eliminare un elemento muovilo e rilascialo qui",
      "undoTooltip": "Annulla",
      "redoTooltip": "Ripeti",
      "clearTooltip": "Cancella",
      "clearMessage": "Vuoi realmente cancellare il circuito logico corrente?",
      "simplifyMessage": "Vuoi realmente semplificare il circuito logico corrente?",
      "reorganizeMessage": "Vuoi realmente riorganizzare il circuito logico corrente?"
    }
  };

  constructor(container, options) {
    this.#uniqueClass = "LogicalCircuitUI_Container_" + new Date().getTime() + "_" + parseInt(Math.random() * 1000);

    try {
      options.width;
    } catch (exception) {
      options = {};
    }
    this.#default.width = isNaN(options.width) || options.width < 0 ? this.#default.width : options.width;
    this.#default.height = isNaN(options.height) || options.height < 0 ? this.#default.height : options.height;

    if (options.lang && this.#messages[options.lang]) {
      this.#messages = this.#messages[options.lang];
    } else if (this.#messages[navigator.language]) {
      this.#messages = this.#messages[navigator.language];
    } else {
      this.#messages = this.#messages["en"];
    }

    container.classList.add("LogicalCircuitUI_Container");
    container.classList.add(this.#uniqueClass);
    container.style.width = (this.#default.width + 2) + "px";

    this.#toolbar = new LogicalCircuitToolbar(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#messages, this.#onChangeListener, this.#onChangeUIListener);
    this.#canvas = new LogicalCircuitCanvas(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#messages, this.#onChangeListener, this.#onChangeUIListener);

    this.#toolbar.setCanvas(this.#canvas);
    this.#canvas.setToolbar(this.#toolbar);

    this.setBezierConnector(options.bezierConnector);
    this.setShowOperatorType(options.showOperatorType);
    this.setInteractive(options.interactive);
  }

  setJSONs(json, jsonUI) {
    this.#history.index = 0;
    this.#history.array = [{
        "json": JSON.stringify(json),
        "jsonUI": JSON.stringify(jsonUI)
      }];

    this.#core.setJSON(json);
    Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
    Object.assign(this.#jsonUI, jsonUI);

    this.#toolbar.setJSONUI();
    this.#canvas.setJSONUI();

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
    this.#toolbar.setReorganizer(reorganizer);
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