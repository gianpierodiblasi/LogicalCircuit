class LogicalCircuitToolbar {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #history;
  #onChangeListener = [];
  #onChangeUIListener = [];
  #canvas
  #reorganizer;

  #addedElementPosition = {
    "top": 15,
    "left": 15
  };

  constructor(container, uniqueClass, core, jsonUI, def, history, onChangeListener, onChangeUIListener) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;
    this.#history = history;
    this.#onChangeListener = onChangeListener;
    this.#onChangeUIListener = onChangeUIListener;

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    toolbar.style.width = (this.#default.width + 2) + "px";
    container.append(toolbar);

    this.#addButtons(toolbar, "\u{21B6}", null, "UNDO", null, () => this.#undo(), null, null, "small", true, true);
    this.#addButtons(toolbar, "\u{21B7}", null, "REDO", null, () => this.#redo(), null, null, "small", true, true);
    this.#addButtons(toolbar, "\u{1F5D1}", null, "CLEAR", null, () => this.#clear(), null, "Divide_On_Right", "small", true, true);
    this.#addButtonsAndText(toolbar);
    this.#addButtons(toolbar, "OR", null, null, null, () => this.#add("OR"), () => this.#add("NOR"), null, "medium", false, true);
    this.#addButtons(toolbar, "AND", null, null, null, () => this.#add("AND"), () => this.#add("NAND"), null, "medium", false, true);
    this.#addButtons(toolbar, "XOR", null, null, null, () => this.#add("XOR"), () => this.#add("NXOR"), null, "medium", false, true);
    this.#addButtons(toolbar, "NOT", null, null, null, () => this.#add("NOT"), null, "Divide_On_Right", "medium", false, true);
    this.#addButtons(toolbar, "SIMPLIFY", "REORGANIZE", null, null, () => this.#simplify(), () => this.#reorganize(), null, "large", true, false);
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
    this.#history.index--;

    this.#core.setJSON(JSON.parse(this.#history.array[this.#history.index].json));
    Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
    Object.assign(this.#jsonUI, JSON.parse(this.#history.array[this.#history.index].jsonUI));

    this.setJSONUI();
    this.#canvas.setJSONUI();

    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #redo() {
    this.#history.index++;

    this.#core.setJSON(JSON.parse(this.#history.array[this.#history.index].json));
    Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
    Object.assign(this.#jsonUI, JSON.parse(this.#history.array[this.#history.index].jsonUI));

    this.setJSONUI();
    this.#canvas.setJSONUI();

    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #clear() {
    if (confirm("Do you really want to clear the current logical circuit?")) {
      this.#history.index = 0;
      this.#history.array = [{
          "json": "{}",
          "jsonUI": "{}"
        }];

      this.#core.clear();
      Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);

      this.setJSONUI();
      this.#canvas.setJSONUI();

      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());
    }
  }

  #addInput(name) {
    this.#core.addInput(name);
    this.#addPosition(name);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.setInteractiveValue(name, false);
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #addOutput(name) {
    this.#core.addOutput(name);
    this.#addPosition(name);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.draw();
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #add(type) {
    var name = this.#core["add" + type]();
    this.#addPosition(name);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.draw();
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #addPosition(name) {
    this.#jsonUI[name] = {
      "top": this.#addedElementPosition.top,
      "left": this.#addedElementPosition.left
    };
  }

  #simplify() {
    if (confirm("Do you really want to simplify the current logical circuit?") && this.#core.simplify()) {
      var json = this.#core.getJSON();
      Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
      Object.keys(json).filter(name => this.#core.getType(name) === "IN").forEach((name, index, array) => this.#canvas.assignPosition(name, index, array, this.#addedElementPosition.left));
      Object.keys(json).filter(name => this.#core.getType(name) === "NOT").forEach((name, index, array) => this.#canvas.assignPosition(name, index, array, this.#default.width / 5));
      Object.keys(json).filter(name => this.#core.getType(name) === "AND").forEach((name, index, array) => this.#canvas.assignPosition(name, index, array, 2 * this.#default.width / 5));
      Object.keys(json).filter(name => this.#core.getType(name) === "OR").forEach((name, index, array) => this.#canvas.assignPosition(name, index, array, 3 * this.#default.width / 5));
      Object.keys(json).filter(name => this.#core.getType(name) === "OUT").forEach((name, index, array) => this.#canvas.assignPosition(name, index, array, 4 * this.#default.width / 5));

      try {
        this.#canvas.draw();

        var edges = [];
        Object.keys(this.#jsonUI).filter(property => this.#core.getType(property) !== "IN").forEach(property => this.#core.getFrom(property).forEach(name => edges.push({"from": name, "to": property})));
        var jsonUI = this.#reorganizer(this.#canvas.getSymbolSize(), edges, this.#default.width, this.#default.height);

        Object.assign(this.#jsonUI, jsonUI);
        this.#canvas.draw();
      } catch (exception) {
      }

      this.#incHistory();
      this.resetButtons();
      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());
    }
  }

  #reorganize() {
    if (confirm("Do you really want to reorganize the current logical circuit?")) {
      try {
        var edges = [];
        Object.keys(this.#jsonUI).filter(property => this.#core.getType(property) !== "IN").forEach(property => this.#core.getFrom(property).forEach(name => edges.push({"from": name, "to": property})));
        var jsonUI = this.#reorganizer(this.#canvas.getSymbolSize(), edges, this.#default.width, this.#default.height);

        Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
        Object.assign(this.#jsonUI, jsonUI);

        this.#incHistory();
        this.resetButtons();
        this.#canvas.draw();
        this.#onChangeListener.forEach(listener => listener());
        this.#onChangeUIListener.forEach(listener => listener());
      } catch (exception) {
      }
    }
  }

  #incHistory() {
    this.#history.array.splice(this.#history.index + 1);

    this.#history.index++;
    this.#history.array.push({
      "json": JSON.stringify(this.#core.getJSON()),
      "jsonUI": JSON.stringify(this.#jsonUI)
    });
  }

  setCanvas(canvas) {
    this.#canvas = canvas;
  }

  setJSONUI() {
    this.resetButtons();
    this.#resetText();
  }

  resetButtons() {
    var disabled = this.#core.isEmpty() || !this.#core.isValid();

    document.querySelector("." + this.#uniqueClass + " button.UNDO").disabled = this.#history.index === 0;
    document.querySelector("." + this.#uniqueClass + " button.REDO").disabled = this.#history.index === this.#history.array.length - 1;
    document.querySelector("." + this.#uniqueClass + " button.CLEAR").disabled = this.#core.isEmpty();
    document.querySelector("." + this.#uniqueClass + " button.SIMPLIFY").disabled = disabled;
    document.querySelector("." + this.#uniqueClass + " button.REORGANIZE").disabled = disabled;
  }

  #resetText() {
    document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value = "";
    document.querySelector("." + this.#uniqueClass + " button.IN").disabled = true;
    document.querySelector("." + this.#uniqueClass + " button.OUT").disabled = true;
  }

  setSimplifierVisible(visible) {
    document.querySelector("." + this.#uniqueClass + " .SIMPLIFY").style.visibility = visible ? "visible" : "hidden";
  }

  setReorganizer(reorganizer) {
    this.#reorganizer = reorganizer;
    document.querySelector("." + this.#uniqueClass + " .REORGANIZE").style.visibility = !!reorganizer ? "visible" : "hidden";
  }
}