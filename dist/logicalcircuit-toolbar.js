class LogicalCircuitToolbar {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #history;
  #messages;
  #DnD;
  #onChangeListener = [];
  #onChangeUIListener = [];
  #canvas
  #reorganizer;

  #addedElementPosition = {
    "top": 15,
    "left": 15
  };

  constructor(container, uniqueClass, core, jsonUI, def, history, messages, DnD, onChangeListener, onChangeUIListener) {
    this.#uniqueClass = uniqueClass;
    this.#core = core;
    this.#jsonUI = jsonUI;
    this.#default = def;
    this.#history = history;
    this.#messages = messages;
    this.#DnD = DnD;
    this.#onChangeListener = onChangeListener;
    this.#onChangeUIListener = onChangeUIListener;

    var toolbar = document.createElement("div");
    toolbar.classList.add("LogicalCircuitUI_Toolbar");
    toolbar.style.width = (this.#default.width + 2) + "px";
    container.append(toolbar);

    this.#addButtons(toolbar, "\u{21B6}", null, this.#messages.undoTooltip, null, "UNDO", null, () => this.#undo(), null, null, "small", true, true, false);
    this.#addButtons(toolbar, "\u{21B7}", null, this.#messages.redoTooltip, null, "REDO", null, () => this.#redo(), null, null, "small", true, true, false);
    this.#addButtons(toolbar, "\u{1F5D1}", null, this.#messages.clearTooltip, null, "CLEAR", null, () => this.#clear(), null, "Divide_On_Right", "small", true, true, false);
    this.#addButtonsAndText(toolbar);
    this.#addTwinButtons(toolbar, "OR");
    this.#addTwinButtons(toolbar, "AND");
    this.#addTwinButtons(toolbar, "XOR");
    this.#addButtons(toolbar, "NOT", null, this.#messages.dndTooltip, null, "NOT", null, () => this.#add("NOT"), null, "Divide_On_Right", "medium", false, true, true);
    this.#addButtons(toolbar, this.#messages.simplifyLabel, this.#messages.reorganizeLabel, null, null, "SIMPLIFY", "REORGANIZE", () => this.#simplify(), () => this.#reorganize(), null, "large", true, false, false);
  }

  #addTwinButtons(toolbar, label) {
    this.#addButtons(toolbar, label, "N" + label, this.#messages.dndTooltip, this.#messages.dndTooltip, label, "N" + label, () => this.#add(label), () => this.#add("N" + label), null, "medium", false, true, true);
  }

  #addButtons(toolbar, label1, label2, tooltip1, tooltip2, classId1, classId2, listener1, listener2, otherClass, size, disabled, visible, draggable) {
    var div = document.createElement("div");
    div.classList.add("LogicalCircuitUI_Toolbar_ButtonContainer");
    if (otherClass) {
      div.classList.add(otherClass);
    }
    toolbar.append(div);

    if (listener1) {
      this.#createButton(div, label1, tooltip1, classId1, size, disabled, visible, draggable).onclick = (event) => listener1();
    }
    if (listener2) {
      this.#createButton(div, label2, tooltip2, classId2, size, disabled, visible, draggable).onclick = (event) => listener2();
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
      buttonIN.setAttribute("draggable", !disabled);
      buttonOUT.disabled = disabled;
      buttonOUT.setAttribute("draggable", !disabled);
    };
    div.append(text);

    var buttonIN = this.#createButton(div, "IN", this.#messages.dndTooltip, "IN", "medium", true, true, false);
    var buttonOUT = this.#createButton(div, "OUT", this.#messages.dndTooltip, "OUT", "medium", true, true, false);

    buttonIN.onclick = (event) => this.#addInput(text.value);
    buttonOUT.onclick = (event) => this.#addOutput(text.value);
  }

  #createButton(div, label, tooltip, classId, size, disabled, visible, draggable) {
    var button = document.createElement("button");
    button.textContent = label;
    button.title = tooltip ? tooltip : "";
    button.classList.add(classId);
    button.classList.add(size);
    button.disabled = disabled;
    button.style.visibility = visible ? "visible" : "hidden";
    button.setAttribute("draggable", draggable);

    button.ondragstart = (event) => this.#ondragstart(event, classId);
    button.ondragend = (event) => this.#ondragend(event);

    div.append(button);
    return button;
  }

  #ondragstart(event, classId) {
    uniqueDragAndDropKeyLogicalCircuitUI = this.#uniqueClass;
    this.#DnD.classId = classId;
    this.#DnD.droppable = false;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setDragImage(this.#canvas.getCanvasForDnD(classId, document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value), 5, 5);
  }

  #ondragend(event) {
    if (this.#DnD.droppable && !this.#DnD.inTrash) {
      switch (this.#DnD.classId) {
        case "IN":
          this.#addInput(document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value, this.#DnD.left, this.#DnD.top);
          break;
        case "OUT":
          this.#addOutput(document.querySelector("." + this.#uniqueClass + " input.IN-OUT").value, this.#DnD.left, this.#DnD.top);
          break;
        default:
          this.#add(this.#DnD.classId, this.#DnD.left, this.#DnD.top);
          break;
      }
    }

    uniqueDragAndDropKeyLogicalCircuitUI = "";
    this.#DnD.classId = "";
    this.#DnD.droppable = false;
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
    if (confirm(this.#messages.clearMessage)) {
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

  #addInput(name, left, top) {
    this.#core.addInput(name);
    this.#addPosition(name, left, top);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.setInteractiveValue(name, false);
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #addOutput(name, left, top) {
    this.#core.addOutput(name);
    this.#addPosition(name, left, top);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.draw();
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #add(type, left, top) {
    var name = this.#core["add" + type]();
    this.#addPosition(name, left, top);

    this.#incHistory();
    this.setJSONUI();
    this.#canvas.draw();
    this.#onChangeListener.forEach(listener => listener());
    this.#onChangeUIListener.forEach(listener => listener());
  }

  #addPosition(name, left, top) {
    this.#jsonUI[name] = {
      "top": top ? top : this.#addedElementPosition.top,
      "left": left ? left : this.#addedElementPosition.left
    };
  }

  #simplify() {
    if (confirm(this.#messages.simplifyMessage) && this.#core.simplify()) {
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
    if (confirm(this.#messages.reorganizeMessage)) {
      try {
        var edges = [];
        Object.keys(this.#jsonUI).filter(property => this.#core.getType(property) !== "IN").forEach(property => this.#core.getFrom(property).forEach(name => edges.push({"from": name, "to": property})));
        var jsonUI = this.#reorganizer(this.#canvas.getSymbolSize(), edges, this.#default.width, this.#default.height);

        Object.keys(this.#jsonUI).forEach(property => delete this.#jsonUI[property]);
        Object.assign(this.#jsonUI, jsonUI);

        this.#incHistory();
        this.resetButtons();
        this.#canvas.draw();
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
    document.querySelector("." + this.#uniqueClass + " button.SIMPLIFY").style.visibility = visible ? "visible" : "hidden";
  }

  setReorganizer(reorganizer) {
    this.#reorganizer = reorganizer;
    document.querySelector("." + this.#uniqueClass + " button.REORGANIZE").style.visibility = !!reorganizer ? "visible" : "hidden";
  }
}