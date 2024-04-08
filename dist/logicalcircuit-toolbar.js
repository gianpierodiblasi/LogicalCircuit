class LogicalCircuitToolbar {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #history;
  #onChangeListener = [];
  #onChangeUIListener = [];

  constructor(container, uniqueClass, core, jsonUI, def, history, onChangeListener, onChangeUIListener, options) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;
    this.#history = history;
    this.#onChangeListener = onChangeListener;
    this.#onChangeUIListener = onChangeUIListener;

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    toolbar.style.width = (options.width + 2) + "px";
    container.append(toolbar);

    this.#addButtons(toolbar, "\u{21B6}", null, "UNDO", null, () => this.#undo(), null, null, "small", true, true);
    this.#addButtons(toolbar, "\u{21B7}", null, "REDO", null, () => this.#redo(), null, null, "small", true, true);
    this.#addButtons(toolbar, "\u{1F5D1}", null, "CLEAR", null, () => this.#clear(), null, "Divide_On_Right", "small", true, true);
    this.#addButtonsAndText(toolbar);
    this.#addButtons(toolbar, "OR", null, null, null, () => this.#add("OR"), () => this.#add("NOR"), null, "medium", false, true);
    this.#addButtons(toolbar, "AND", null, null, null, () => this.#add("AND"), () => this.#add("NAND"), null, "medium", false, true);
    this.#addButtons(toolbar, "XOR", null, null, null, () => this.#add("XOR"), () => this.#add("NXOR"), null, "medium", false, true);
    this.#addButtons(toolbar, "NOT", null, null, null, () => this.#add("NOT"), null, "Divide_On_Right", "medium", false, true);
    this.#addButtons(toolbar, "SIMPLIFY", "TIDY UP", null, null, () => this.#simplify(), () => this.#tidyUp(false), null, "large", true, false);
  }

  #addButtons(toolbar, label1, label2, tooltip1, tooltip2, listener1, listener2, otherClass, size, disabled, visible) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_Toolbar_ButtonContainer");
    if (otherClass) {
      div.classList.add(otherClass);
    }
    toolbar.append(div);

    if (listener1) {
      this.#createButton(div, label1, tooltip1, size, disabled, visible).onclick = (event) => listener1();
    }
    if (listener2) {
      var label = label2 ? label2 : label1 ? "N" + label1 : null;
      var tooltip = tooltip2 ? tooltip2 : tooltip1 ? "N" + tooltip1 : null;
      this.#createButton(div, label, tooltip, size, disabled, visible).onclick = (event) => listener2();
    }
  }

  #addButtonsAndText(toolbar) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_Toolbar_TextContainer");
    div.classList.add("Divide_On_Right");
    toolbar.append(div);

    var text = document.createElement("input");
    text.type = "text";
    text.classList.add("IN-OUT");
    text.oninput = (event) => {
      var disabled = !this.#core.isNameValid(text.value) || this.#core.isNameAlreadyUsed(text.value);
      buttonIN.disabled = disabled;
      buttonOUT.disabled = disabled;
    };
    div.append(text);

    var buttonIN = this.#createButton(div, "IN", null, "medium", true, true);
    var buttonOUT = this.#createButton(div, "OUT", null, "medium", true, true);

    buttonIN.onclick = (event) => this.#addInput(text.value);
    buttonOUT.onclick = (event) => this.#addOutput(text.value);
  }

  #createButton(div, label, tooltip, size, disabled, visible) {
    var button = document.createElement("button");
    button.textContent = label;
    if (tooltip) {
      button.title = tooltip;
    }
    button.classList.add(tooltip ? tooltip.replace(" ", "-") : label.replace(" ", "-"));
    button.classList.add(size);
    button.disabled = disabled;
    button.style.visibility = visible ? "visible" : "hidden";
    div.append(button);
    return button;
  }

  #undo() {

  }

  #redo() {

  }

  #clear() {

  }

  #addInput(name) {

  }

  #addOutput(name) {

  }

  #add(type) {

  }

  #simplify() {
//    if (confirm("Do you really want to simplify the current logical circuit?") && this.#core.simplify()) {
//      Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
//      this.#resetButtons();
//      this.#resetText();

//      try {
//        var g = new dagre.graphlib.Graph();
//        Object.keys(this.getJSON()).forEach(name => this.#addPosition(name));
//
//        this.setInteractive(this.#default.interactive);
//        this.#onChangeListener.forEach(listener => listener());
//
//        this.#tidyUp(true);
//      } catch (exception) {
//        var json = this.getJSON();
//
//        Object.keys(json).filter(name => this.#core.getType(name) === "IN").forEach((name, index, array) => this.#assignPosition(name, index, array, this.#addedElementPosition.left));
//        Object.keys(json).filter(name => this.#core.getType(name) === "NOT").forEach((name, index, array) => this.#assignPosition(name, index, array, this.#canvas.width / 5));
//        Object.keys(json).filter(name => this.#core.getType(name) === "AND").forEach((name, index, array) => this.#assignPosition(name, index, array, 2 * this.#canvas.width / 5));
//        Object.keys(json).filter(name => this.#core.getType(name) === "OR").forEach((name, index, array) => this.#assignPosition(name, index, array, 3 * this.#canvas.width / 5));
//        Object.keys(json).filter(name => this.#core.getType(name) === "OUT").forEach((name, index, array) => this.#assignPosition(name, index, array, 4 * this.#canvas.width / 5));
//
//        this.setInteractive(this.#default.interactive);
//        this.#onChangeListener.forEach(listener => listener());
//        this.#onChangeUIListener.forEach(listener => listener());
//        this.#draw();
//      }
//    }
  }

  #tidyUp(doNotAsk) {

  }

  setJSONUI() {
    this.#resetButtons();
    this.#resetText();
  }

  #resetButtons() {
    var disabled = this.#core.isEmpty() || !this.#core.isValid();

    document.querySelector("." + this.#uniqueClass + " button.UNDO").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.REDO").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.CLEAR").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.SIMPLIFY").disabled = disabled;
    document.querySelector("." + this.#uniqueClass + " button.TIDY-UP").disabled = disabled;
  }

  #resetText() {
    document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value = "";
    document.querySelector("." + this.#uniqueClass + " button.IN").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.OUT").disabled = true;
  }

  setSimplifierVisible(visible) {
    document.querySelector("." + this.#uniqueClass + " .SIMPLIFY").style.visibility = visible ? "visible" : "hidden";
  }
}