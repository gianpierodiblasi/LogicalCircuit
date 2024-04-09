class LogicalCircuitCore {
  #json = {};
  #simplifier;

  #blackListNames = [
    "OR", "NOR", "AND", "NAND", "XOR", "NXOR", "NOT",
    "BREAK", "CASE", "CATCH", "CLASS", "CONST", "CONTINUE", "DEBUGGER", "DEFAULT", "DELETE", "DO", "ELSE", "EXPORT", "EXTENDS", "FALSE", "FINALLY", "FOR", "FUNCTION", "IF", "IMPORT", "IN", "INSTANCEOF", "NEW", "NULL", "RETURN", "SUPER", "SWITCH", "THIS", "THROW", "TRUE", "TRY", "TYPEOF", "VAR", "VOID", "WHILE", "WITH",
    "LET", "STATIC", "YIELD", "AWAIT", "ENUM",
    "IMPLEMENTS", "INTERFACE", "PACKAGE", "PRIVATE", "PROTECTED", "PUBLIC", "ABSTRACT", "BOOLEAN", "BYTE", "CHAR", "DOUBLE", "FINAL", "FLOAT", "GOTO", "INT", "LONG", "NATIVE", "SHORT", "SYNCHRONIZED", "THROWS", "TRANSIENT", "VOLATILE", "ARGUMENTS", "AS", "ASYNC", "EVAL", "FROM", "GET", "OF", "SET"
  ];

  #operatorTypes = ["OR", "NOR", "AND", "NAND", "XOR", "NXOR", "NOT"];
  #operatorSymbols = {
    "OR": "||",
    "AND": "&&",
    "XOR": "+",
    "NOR": "||",
    "NAND": "&&",
    "NXOR": "+"
  };
  #comparatorSymbols = {
    "OR": "",
    "AND": "",
    "XOR": "===1",
    "NOR": "",
    "NAND": "",
    "NXOR": "!==1"
  };

  constructor() {
  }

  setJSON(json) {
    this.#json = JSON.parse(JSON.stringify(json));
  }

  getJSON() {
    return JSON.parse(JSON.stringify(this.#json));
  }

  setSimplifier(simplifier) {
    this.#simplifier = simplifier;
  }

  simplify() {
    if (!this.#simplifier || !this.isValid()) {
      return false;
    } else {
      var newJSON = {};
      Object.keys(this.#json).filter(name => this.#json[name].type === "IN").forEach(input => newJSON[input] = {"type": "IN"});

      var canSimplify = true;
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => {
        var inputs = [];
        this.#findInputs(name, inputs);

        var minterms = [];
        for (var index = 0; index < Math.pow(2, inputs.length); index++) {
          var parameters = {};
          var binary = index.toString(2).padStart(inputs.length, "0");
          inputs.forEach((input, idx) => parameters[input] = !!parseInt(binary[idx]));

          if (this.computeExpression(name, parameters)) {
            minterms.push(index);
          }
        }

        newJSON[name] = {"type": "OUT", "from": []};
        try {
          var expression = this.#simplifier(minterms);
          this.#getSimplified(newJSON, name, inputs, expression);
        } catch (exception) {
          canSimplify = false;
        }
      });

      if (canSimplify) {
        this.#json = newJSON;
      }
      return canSimplify;
    }
  }

  #findInputs(name, array) {
    if (this.#json[name].type === "IN") {
      if (!array.includes(name)) {
        array.push(name);
      }
    } else if (this.#json[name].type === "NOT") {
      this.#findInputs(this.#json[name].from[0], array);
    } else {
      this.#json[name].from.forEach(element => this.#findInputs(element, array));
    }
  }

  #getSimplified(newJSON, name, inputs, expression) {
    expression = expression.split(" OR ");

    if (expression.length === 1) {
      this.#getSimplifiedSubExpression(newJSON, name, inputs, expression[0]);
    } else {
      var uniqueName = this.#getUniqueName("OR");
      newJSON[uniqueName] = {"type": "OR", "from": []};
      expression.forEach(subExpression => this.#getSimplifiedSubExpression(newJSON, uniqueName, inputs, subExpression));
      newJSON[name].from.push(uniqueName);
    }
  }

  #getSimplifiedSubExpression(newJSON, uniqueName, inputs, subExpression) {
    subExpression = subExpression.replace("(", "").replace(")", "").split(" AND ");
    if (subExpression.length === 1) {
      this.#getSimplifiedElement(newJSON, uniqueName, inputs, subExpression[0]);
    } else {
      var uniqueNameSub = this.#getUniqueName("AND");
      newJSON[uniqueNameSub] = {"type": "AND", "from": []};
      subExpression.forEach(element => this.#getSimplifiedElement(newJSON, uniqueNameSub, inputs, element));
      newJSON[uniqueName].from.push(uniqueNameSub);
    }
  }

  #getSimplifiedElement(newJSON, uniqueName, inputs, element) {
    if (element.startsWith("NOT ")) {
      var uniqueNameNOT = this.#getUniqueName("NOT");
      newJSON[uniqueNameNOT] = {"type": "NOT", "from": [inputs[element.charCodeAt(4) - 65]]};
      newJSON[uniqueName].from.push(uniqueNameNOT);
    } else {
      newJSON[uniqueName].from.push(inputs[element.charCodeAt(0) - 65]);
    }
  }

  computeExpressions(parameters) {
    var expressions = {};
    if (this.isValid()) {
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.computeExpression(name, parameters));
    }
    return expressions;
  }

  computeExpression(name, parameters) {
    var result;
    if (this.isValid() && this.#json[name] && this.#json[name].type === "OUT") {
      var toEval = Object.keys(parameters).reduce((acc, property) => acc + "var " + property + " = " + parameters[property] + ";\n", "");
      toEval += "result = " + this.getJavaScriptExpression(name) + ";";
      eval(toEval);
    }
    return result;
  }

  getJavaScriptExpressions() {
    var expressions = {};
    if (this.isValid()) {
      Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").forEach(name => expressions[name] = this.#buildExpression(this.#json[name].from[0], false));
    }
    return expressions;
  }

  getJavaScriptExpression(name) {
    return this.isValid() && this.#json[name] && this.#json[name].type === "OUT" ? this.#buildExpression(this.#json[name].from[0], false) : "";
  }

  #buildExpression(name, needBrackets) {
    if (this.#json[name].type === "IN") {
      return name;
    } else if (this.#json[name].type === "NOT") {
      return "!" + this.#buildExpression(this.#json[name].from[0], true);
    } else {
      var array = this.#json[name].from.map(element => this.#buildExpression(element, true));

      switch (this.#json[name].type) {
        case "OR":
        case "AND":
        case "XOR":
        case "NXOR":
          return (needBrackets ? "(" : "") + array.join(this.#operatorSymbols[this.#json[name].type]) + this.#comparatorSymbols[this.#json[name].type] + (needBrackets ? ")" : "");
        case "NOR":
        case "NAND":
          return "!(" + array.join(this.#operatorSymbols[this.#json[name].type]) + ")";
      }
    }
  }

  isValid() {
    return Object.keys(this.#json).filter(name => this.#json[name].type === "OUT").reduce((acc, name) => acc && this.#isConnected(name), true);
  }

  #isConnected(name) {
    var connected = true;
    this.#json[name].from.forEach(element => {
      connected &= !!element;
      if (connected && this.#json[element].type !== "IN") {
        connected &= !!this.#isConnected(element);
      }
    });
    return !!connected;
  }

  isEmpty() {
    return !Object.keys(this.#json).length;
  }

  addInput(name) {
    return this.#add(name, {"type": "IN"});
  }

  addOutput(name) {
    return this.#add(name, {"type": "OUT", "from": [""]});
  }

  addOR() {
    return this.#addOperator("OR", ["", ""]);
  }

  addNOR() {
    return this.#addOperator("NOR", ["", ""]);
  }

  addAND() {
    return this.#addOperator("AND", ["", ""]);
  }

  addNAND() {
    return this.#addOperator("NAND", ["", ""]);
  }

  addXOR() {
    return this.#addOperator("XOR", ["", ""]);
  }

  addNXOR() {
    return this.#addOperator("NXOR", ["", ""]);
  }

  addNOT() {
    return this.#addOperator("NOT", [""]);
  }

  #addOperator(operator, from) {
    var name = this.#getUniqueName(operator);
    this.#add(name, {"type": operator, "from": from}, true);
    return name;
  }

  #add(name, json, skip) {
    if (skip) {
      this.#json[name] = json;
      return true;
    } else if (this.isNameValid(name) && !this.isNameAlreadyUsed(name)) {
      this.#json[name] = json;
      return true;
    } else {
      return false;
    }
  }

  #getUniqueName(operator) {
    return "$_" + operator.padEnd(5, "_") + new Date().getTime() + "_" + parseInt(Math.random() * 10000).toFixed(0).padStart(4, "0");
  }

  incConnector(name) {
    if (this.#json[name] && !["IN", "OUT", "NOT"].includes(this.#json[name].type)) {
      this.#json[name].from.push("");
    }
  }

  decConnector(name) {
    if (this.#json[name] && !["IN", "OUT", "NOT"].includes(this.#json[name].type) && this.#json[name].from.length > 2) {
      var index = this.#json[name].from.indexOf("");
      if (index !== -1) {
        this.#json[name].from.splice(index, 1);
      } else {
        this.#json[name].from.pop();
      }
    }
  }

  addConnection(startName, endName, endIndex) {
    if (this.isConnectionValid(startName, endName) && 0 <= endIndex && endIndex < this.#json[endName].from.length) {
      this.#json[endName].from[endIndex] = startName;
    }
  }

  isConnectionValid(startName, endName) {
    if (startName === endName || !this.#json[startName] || !this.#json[endName]) {
      return false;
    } else if (this.#json[startName].type === "IN") {
      return this.#json[endName].type !== "IN";
    } else if (this.#json[startName].type === "OUT") {
      return false;
    } else if (this.#json[endName].type === "IN") {
      return false;
    } else if (this.#json[endName].type === "OUT") {
      return true;
    } else {
      return !this.#areConnected(startName, endName);
    }
  }

  #areConnected(startName, endName) {
    var operators = Object.keys(this.#json).filter(name => this.#operatorTypes.includes(this.#json[name].type) && this.#json[name].from.includes(endName));
    return operators.includes(startName) || operators.reduce((acc, name) => acc || this.#areConnected(startName, name), false);
  }

  removeConnection(name, index) {
    if (this.#json[name] && this.#json[name].from && 0 <= index && index < this.#json[name].from.length) {
      this.#json[name].from[index] = "";
    }
  }

  remove(name) {
    if (this.#json[name]) {
      delete this.#json[name];
      Object.keys(this.#json).filter(property => this.#json[property].type !== "IN").forEach(property => this.#json[property].from = this.#json[property].from.map(element => element === name ? "" : element));
    }
  }

  clear() {
    this.#json = {};
  }

  getType(name) {
    return this.#json[name] ? this.#json[name].type : "";
  }

  getFrom(name) {
    return this.#json[name] && this.#json[name].type !== "IN" ? this.#json[name].from.slice() : [];
  }

  isNameValid(name) {
    return typeof name === 'string' && /^[a-z]+[a-z0-9_]*$/i.test(name) && !this.#blackListNames.includes(name.toUpperCase());
  }

  isNameAlreadyUsed(name) {
    return !!this.#json[name];
  }

  addBlackListWord(name) {
    if (name) {
      this.#blackListNames.push(name.toUpperCase());
    }
  }
}
var uniqueDragAndDropKeyLogicalCircuitUI = "";

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

  #DnD = {
    "classId": "",
    "droppable": false,
    "inTrash": false,
    "left": 0,
    "top": 0
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
    this.#default.width = isNaN(options.width) || options.width < 0 ? this.#default.width : options.width;
    this.#default.height = isNaN(options.height) || options.height < 0 ? this.#default.height : options.height;

    if (options.lang && this.#messages[options.lang]) {
      this.#messages = this.#messages[options.lang];
    } else if (this.#messages[navigator.language.substring(0, 2)]) {
      this.#messages = this.#messages[navigator.language.substring(0, 2)];
    } else {
      this.#messages = this.#messages["en"];
    }

    container.classList.add("LogicalCircuitUI_Container");
    container.classList.add(this.#uniqueClass);
    container.style.width = (this.#default.width + 2) + "px";

    this.#toolbar = new LogicalCircuitToolbar(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#messages, this.#DnD, this.#onChangeListener, this.#onChangeUIListener);
    this.#canvas = new LogicalCircuitCanvas(container, this.#uniqueClass, this.#core, this.#jsonUI, this.#default, this.#history, this.#messages, this.#DnD, this.#onChangeListener, this.#onChangeUIListener);

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
class LogicalCircuitCanvas {
  #uniqueClass;
  #core;
  #jsonUI;
  #default;
  #history;
  #messages;
  #DnD;
  #onChangeListener = [];
  #onChangeUIListener = [];
  #toolbar;
  #canvas;
  #canvasDnD;
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

  #currentEvent;

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

  #operator = {
    "radiusLeft": 20,
    "lineWidth": 30,
    "oneHeight": 20,
    "xorGap": 12,
    "notRadius": 7,
    "font": "9px sans-serif"
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

  #cursor = {
    "grab": "grab",
    "pointer": "pointer",
    "notAllowed": "not-allowed",
    "grabbing": "grabbing"
  }

  #onMouse = {
    "name": "",
    "index": -1,
    "referencePath": "",
    "referenceName": "",
    "lineWidth": 3,
    "strokeStyle": "green"
  };

  #onSymbol = {
    "pressed": false,
    "name": "",
    "offsetLeft": 0,
    "offsetTop": 0
  };

  #onArrow = {
    "selected": false,
    "name": "",
    "direction": "",
    "font": "14px sans-serif",
    "up": "-", //"\u{02191}",
    "down": "+", // "\u{02193}",
    "max": 6,
    "canDoFillStyle": "white",
    "cannotDoFillStyle": "gray"
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

    this.#canvas = document.createElement("canvas");
    this.#canvas.classList.add("LogicalCircuitUI_Canvas");
    this.#canvas.width = this.#default.width;
    this.#canvas.height = this.#default.height;
    this.#canvas.onmousemove = (event) => this.#onMouseMove(event);
    this.#canvas.onmousedown = (event) => this.#onMouseDown(event);
    this.#canvas.onmouseup = (event) => this.#onMouseUp(event);
    this.#canvas.ondragenter = (event) => this.#ondragenter(event);
    this.#canvas.ondragover = (event) => this.#ondragover(event);
    this.#canvas.ondragleave = (event) => this.#ondragleave(event);
    container.append(this.#canvas);

    this.#ctx = this.#canvas.getContext('2d');
    this.#ctx.font = this.#default.font;
    this.#ctx.textBaseline = "middle";
    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.lineJoin = "round";
    this.draw();

    this.#canvasDnD = document.createElement("canvas");
    this.#canvasDnD.classList.add("LogicalCircuitUI_CanvasDnD");
    container.append(this.#canvasDnD);
  }

  setToolbar(toolbar) {
    this.#toolbar = toolbar;
  }

  setJSONUI() {
    this.setInteractive(this.#default.interactive);
  }

  setBezierConnector(bezierConnector) {
    this.#default.bezierConnector = bezierConnector;
    this.draw();
  }

  setShowOperatorType(showOperatorType) {
    this.#default.showOperatorType = showOperatorType;
    this.draw();
  }

  setInteractive(interactive) {
    this.#default.interactive = !!interactive;
    this.#onInteractive.selected = false;

    this.#interactive = {};
    if (interactive) {
      Object.keys(this.#jsonUI).filter(property => this.#core.getType(property) === "IN").forEach(property => this.#interactive[property] = false);
    }

    this.draw();
  }

  setInteractiveValue(name, value) {
    if (this.#default.interactive) {
      this.#interactive[name] = value;
    }
    this.draw();
  }

  getSymbolSize() {
    Object.keys(this.#symbolSize).filter(property => !this.#jsonUI[property]).forEach(property => delete this.#symbolSize[property]);
    return JSON.parse(JSON.stringify(this.#symbolSize));
  }

  assignPosition(name, index, array, offset) {
    this.#jsonUI[name] = {
      "top": (index + 1) * this.#canvas.height / (array.length + 1) - this.#text.height,
      "left": offset
    };
  }

  draw() {
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
          this.#drawOperator(property, type);
          break;
      }
    });

    Object.keys(this.#jsonUI).forEach(property => {
      switch (this.#core.getType(property)) {
        case "IN":
          break;
        case "OUT":
        default:
          this.#core.getFrom(property).forEach((name, index) => this.#drawConnector(name, property, index));
          break;
      }
    });

    this.#drawOnMouse();
    this.#drawOnKnob();
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
      this.#ctx.fillStyle = this.#default.fillStyle;
    }

    this.#ctx.fillText(name, this.#jsonUI[name].left + this.#text.gap / 2, this.#knobCenter[name + "*" + suffix].top);
  }

  #drawOperator(name, type) {
    this.#symbolPath[name] = new Path2D();
    var from = this.#core.getFrom(name);

    var radiusTop = this.#operator.oneHeight * from.length / 2;
    var width = this.#jsonUI[name].left + this.#operator.lineWidth + (type === "NOT" ? this.#operator.radiusLeft : 0);
    var height = this.#jsonUI[name].top + this.#operator.oneHeight * (type === "NOT" ? 2 : from.length);
    var centerTop = this.#jsonUI[name].top + (type === "NOT" ? this.#operator.oneHeight : radiusTop);

    this.#setExitKnobCenter(name, type, width, centerTop);
    this.#setKnobCenter(name, type, from, centerTop, radiusTop);
    this.#setSymbolSize(name, type, from, width, centerTop);
    this.#setSymbolPath(name, type, width, height, centerTop, radiusTop);

    this.#drawOperatorType(name, type);
  }

  #setExitKnobCenter(name, type, width, centerTop) {
    switch (type) {
      case "OR":
      case "AND":
      case "XOR":
        this.#knobCenter[name + "*exit"] = {
          "left": width + this.#operator.radiusLeft + this.#onKnob.radius,
          "top": centerTop
        };
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        this.#knobCenter[name + "*exit"] = {
          "left": width + this.#operator.radiusLeft + 2 * this.#operator.notRadius + this.#onKnob.radius,
          "top": centerTop
        };
        break;
      case "NOT":
        this.#knobCenter[name + "*exit"] = {
          "left": width + 2 * this.#operator.notRadius + this.#onKnob.radius,
          "top": centerTop
        };
        break;
    }

    this.#drawKnob(name + "*exit");
  }

  #setKnobCenter(name, type, from, centerTop, radiusTop) {
    var incAngle = Math.PI / (from.length + 1);
    for (var index = 0; index < from.length; index++) {
      switch (type) {
        case "OR":
        case "NOR":
          var angle = incAngle * (index + 1) - Math.PI / 2;
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left + (this.#operator.radiusLeft - this.#onKnob.radius) * Math.cos(angle),
            "top": centerTop + (radiusTop - this.#onKnob.radius) * Math.sin(angle)
          };
          break;
        case "AND":
        case "NAND":
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left - this.#onKnob.radius,
            "top": this.#jsonUI[name].top + this.#operator.oneHeight / 2 + this.#operator.oneHeight * index
          };
          break;
        case "XOR":
        case "NXOR":
          var angle = incAngle * (index + 1) - Math.PI / 2;
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left + (this.#operator.radiusLeft - this.#onKnob.radius) * Math.cos(angle) - this.#operator.xorGap,
            "top": centerTop + (radiusTop - this.#onKnob.radius) * Math.sin(angle)
          };
          break;
        case "NOT":
          this.#knobCenter[name + "*" + index] = {
            "left": this.#jsonUI[name].left - this.#onKnob.radius,
            "top": centerTop
          };
          break;
      }

      this.#drawKnob(name + "*" + index);
    }
  }

  #setSymbolSize(name, type, from, width, centerTop) {
    switch (type) {
      case "OR":
      case "AND":
      case "XOR":
        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft,
          "height": this.#operator.oneHeight * from.length
        };
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        var arc = new Path2D();
        arc.arc(width + this.#operator.radiusLeft + this.#operator.notRadius, centerTop, this.#operator.notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);

        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius,
          "height": this.#operator.oneHeight * from.length
        };
        break;
      case "NOT":
        var arc = new Path2D();
        arc.arc(width + this.#operator.notRadius, centerTop, this.#operator.notRadius, 0, 2 * Math.PI);
        this.#symbolPath[name].addPath(arc);

        this.#symbolSize[name] = {
          "width": this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius,
          "height": 2 * this.#operator.oneHeight
        };
        break;
    }
  }

  #setSymbolPath(name, type, width, height, centerTop, radiusTop) {
    if (type !== "NOT") {
      this.#symbolPath[name].moveTo(width, height);
      this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
    }

    switch (type) {
      case "OR":
      case "NOR":
        this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, this.#jsonUI[name].top, width + this.#operator.radiusLeft, centerTop);
        this.#symbolPath[name].quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, height, width, height);
        break;
      case "AND":
      case "NAND":
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].ellipse(width, centerTop, this.#operator.radiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);
        break;
      case "XOR":
      case "NXOR":
        this.#symbolPath[name].ellipse(this.#jsonUI[name].left, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].lineTo(width, this.#jsonUI[name].top);
        this.#symbolPath[name].ellipse(width, centerTop, this.#operator.radiusLeft, radiusTop, 0, -Math.PI / 2, Math.PI / 2);

        var ellipse = new Path2D();
        ellipse.ellipse(this.#jsonUI[name].left - this.#operator.xorGap, centerTop, this.#operator.radiusLeft, radiusTop, 0, Math.PI / 2, -Math.PI / 2, true);
        this.#symbolPath[name].addPath(ellipse);
        break;
      case "NOT":
        this.#symbolPath[name].moveTo(this.#jsonUI[name].left, this.#jsonUI[name].top);
        this.#symbolPath[name].lineTo(width, centerTop);
        this.#symbolPath[name].lineTo(this.#jsonUI[name].left, height);
        this.#symbolPath[name].closePath();
        break;
    }

    this.#ctx.stroke(this.#symbolPath[name]);
  }

  #drawOperatorType(name, type) {
    if (this.#default.showOperatorType) {
      this.#ctx.font = this.#operator.font;

      var left;
      switch (type) {
        case "OR":
        case "XOR":
          left = this.#operator.radiusLeft + (this.#symbolSize[name].width - this.#operator.radiusLeft - this.#ctx.measureText(type).width) / 2;
          break;
        case "AND":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 2;
          break;
        case "NOR":
        case "NXOR":
          left = this.#operator.radiusLeft + (this.#symbolSize[name].width - this.#operator.radiusLeft - this.#ctx.measureText(type).width) / 2 - this.#operator.notRadius;
          break;
        case "NAND":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 2 - this.#operator.notRadius;
          break;
        case "NOT":
          left = (this.#symbolSize[name].width - this.#ctx.measureText(type).width) / 4;
          break;
      }

      this.#ctx.fillText(type, this.#jsonUI[name].left + left, this.#jsonUI[name].top + this.#symbolSize[name].height / 2);
      this.#ctx.font = this.#default.font;
    }
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

  #drawConnector(startName, endName, endIndex) {
    if (startName) {
      this.#connectorPath[endName + "*" + endIndex] = new Path2D();
      this.#connectorPath[endName + "*" + endIndex].moveTo(this.#knobCenter[startName + "*exit"].left, this.#knobCenter[startName + "*exit"].top);

      if (this.#default.bezierConnector) {
        var cp1 = {
          "left": this.#knobCenter[startName + "*exit"].left + (this.#knobCenter[endName + "*" + endIndex].left - this.#knobCenter[startName + "*exit"].left) / 2,
          "top": this.#knobCenter[startName + "*exit"].top
        };

        var cp2 = {
          "left": cp1.left,
          "top": this.#knobCenter[endName + "*" + endIndex].top
        };

        this.#connectorPath[endName + "*" + endIndex].bezierCurveTo(cp1.left, cp1.top, cp2.left, cp2.top, this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      } else {
        this.#connectorPath[endName + "*" + endIndex].lineTo(this.#knobCenter[endName + "*" + endIndex].left, this.#knobCenter[endName + "*" + endIndex].top);
      }

      this.#ctx.stroke(this.#connectorPath[endName + "*" + endIndex]);
    }
  }

  #drawOnMouse() {
    if (!this.#onMouse.name) {
    } else {
      var type = this.#core.getType(this.#onMouse.name);
      if (this.#onMouse.referencePath !== "symbolPath") {
      } else if (this.#default.interactive && type === "IN") {
        this.#onInteractive.selected = this.#ctx.isPointInPath(this.#interactivePath[this.#onMouse.name], this.#currentEvent.offsetX, this.#currentEvent.offsetY);
        this.#canvas.style.cursor = this.#onInteractive.selected ? this.#cursor.pointer : this.#cursor.grab;
      } else if (!["IN", "OUT", "NOT"].includes(type)) {
        this.#drawArrow();
      } else {
        this.#canvas.style.cursor = this.#cursor.grab;
      }

      this.#drawPath();
    }
  }

  #drawArrow() {
    var arrowLeft = this.#jsonUI[this.#onMouse.name].left + 3 * this.#symbolSize[this.#onMouse.name].width / 5;
    switch (this.#core.getType(this.#onMouse.name)) {
      case "OR":
      case "AND":
      case "XOR":
        break;
      case "NOR":
      case "NAND":
      case "NXOR":
        arrowLeft -= this.#operator.notRadius;
        break;
    }

    var fromLength = this.#core.getFrom(this.#onMouse.name).length;
    var arrowUP = this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 4;
    var arrowDOWN = this.#jsonUI[this.#onMouse.name].top + 3 * this.#symbolSize[this.#onMouse.name].height / 4;

    this.#ctx.font = this.#onArrow.font;
    var wUP = this.#ctx.measureText(this.#onArrow.up).width;
    var wDOWN = this.#ctx.measureText(this.#onArrow.down).width;
    var width = Math.max(wUP, wDOWN);

    var totPath = new Path2D();

    var path = new Path2D();
    this.#ctx.fillStyle = fromLength > 2 ? this.#onArrow.canDoFillStyle : this.#onArrow.cannotDoFillStyle;
    path.rect(arrowLeft - 2, this.#jsonUI[this.#onMouse.name].top + 3, width + 4, this.#symbolSize[this.#onMouse.name].height / 2 - 3);
    totPath.addPath(path);
    this.#ctx.fill(path);
    this.#ctx.stroke(path);
    path = new Path2D();
    this.#ctx.fillStyle = fromLength < this.#onArrow.max ? this.#onArrow.canDoFillStyle : this.#onArrow.cannotDoFillStyle;
    path.rect(arrowLeft - 2, this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 2, width + 4, this.#symbolSize[this.#onMouse.name].height / 2 - 3);
    totPath.addPath(path);
    this.#ctx.fill(path);
    this.#ctx.stroke(path);

    this.#ctx.fillStyle = this.#default.fillStyle;
    this.#ctx.fillText(this.#onArrow.up, arrowLeft + (width - wUP) / 2, arrowUP);
    this.#ctx.fillText(this.#onArrow.down, arrowLeft + (width - wDOWN) / 2, arrowDOWN);
    this.#ctx.font = this.#default.font;

    this.#onArrow.selected = this.#ctx.isPointInPath(totPath, this.#currentEvent.offsetX, this.#currentEvent.offsetY);
    this.#onArrow.name = this.#onMouse.name;
    this.#onArrow.direction = this.#currentEvent.offsetY < this.#jsonUI[this.#onMouse.name].top + this.#symbolSize[this.#onMouse.name].height / 2 ? "UP" : "DOWN";

    if (!this.#onArrow.selected) {
      this.#canvas.style.cursor = this.#cursor.grab;
    } else if (this.#onArrow.direction === "UP" && fromLength > 2) {
      this.#canvas.style.cursor = this.#cursor.pointer;
    } else if (this.#onArrow.direction === "DOWN" && fromLength < this.#onArrow.max) {
      this.#canvas.style.cursor = this.#cursor.pointer;
    } else {
      this.#canvas.style.cursor = this.#cursor.notAllowed;
    }
  }

  #drawPath() {
    this.#ctx.lineWidth = this.#onMouse.lineWidth;

    if (this.#onSymbol.pressed) {
      this.#canvas.style.cursor = this.#cursor.grabbing;
      this.#ctx.strokeStyle = this.#intersects(this.#canvas.width, this.#canvas.height, this.#trash.lineWidth, this.#jsonUI[this.#onMouse.name].left, this.#jsonUI[this.#onMouse.name].top, this.#symbolSize[this.#onMouse.name].width, this.#symbolSize[this.#onMouse.name].height) ? this.#trash.strokeStyle : this.#onMouse.strokeStyle;
    } else {
      this.#ctx.strokeStyle = this.#onMouse.referencePath === "connectorPath" ? this.#trash.strokeStyle : this.#onMouse.strokeStyle;
    }
    this.#ctx.stroke(this.#getPath(this.#onMouse.referencePath, this.#onMouse.referenceName));

    this.#ctx.lineWidth = this.#default.lineWidth;
    this.#ctx.strokeStyle = this.#default.strokeStyle;
  }

  #intersects(cx, cy, radius, rx, ry, rw, rh) {
    var testX = cx;
    var testY = cy;

    if (cx < rx) {
      testX = rx;
    } else if (cx > rx + rw) {
      testX = rx + rw;
    }
    if (cy < ry) {
      testY = ry;
    } else if (cy > ry + rh) {
      testY = ry + rh;
    }

    var distX = cx - testX;
    var distY = cy - testY;
    var distance = Math.sqrt((distX * distX) + (distY * distY));

    return distance <= radius;
  }

  #getPath(referencePath, referenceName) {
    switch (referencePath) {
      case "symbolPath":
        return this.#symbolPath[referenceName];
      case "knobPath":
        return this.#knobPath[referenceName];
      case "connectorPath":
        return this.#connectorPath[referenceName];
    }
  }

  #drawOnKnob() {
    if (this.#onKnob.pressed) {
      this.#ctx.beginPath();
      this.#ctx.moveTo(this.#onKnob.event.offsetX, this.#onKnob.event.offsetY);

      if (this.#default.bezierConnector) {
        var cp1 = {
          "left": this.#onKnob.event.offsetX + (this.#currentEvent.offsetX - this.#onKnob.event.offsetX) / 2,
          "top": this.#onKnob.event.offsetY
        };

        var cp2 = {
          "left": cp1.left,
          "top": this.#currentEvent.offsetY
        };

        this.#ctx.bezierCurveTo(cp1.left, cp1.top, cp2.left, cp2.top, this.#currentEvent.offsetX, this.#currentEvent.offsetY);
      } else {
        this.#ctx.lineTo(this.#currentEvent.offsetX, this.#currentEvent.offsetY);
      }

      this.#ctx.stroke();

      if (this.#onKnob.name) {
        this.#ctx.lineWidth = this.#onKnob.lineWidth;
        this.#ctx.strokeStyle = this.#isConnectionValid(this.#onMouse.name, this.#onMouse.index, this.#onKnob.name, this.#onKnob.index) ? this.#onKnob.canDoStrokeStyle : this.#onKnob.cannotDoStrokeStyle;
        this.#ctx.stroke(this.#knobPath[this.#onKnob.referenceName]);
        this.#ctx.lineWidth = this.#default.lineWidth;
        this.#ctx.strokeStyle = this.#default.strokeStyle;
      }
    }
  }

  #onMouseMove(event) {
    this.#currentEvent = event;

    var dist = Math.sqrt(Math.pow(event.offsetX - this.#canvas.width, 2) + Math.pow(event.offsetY - this.#canvas.height, 2));
    this.#canvas.setAttribute('title', dist < this.#trash.radius2 ? this.#messages.trashTooltip : "");

    if (this.#onSymbol.pressed) {
      this.#jsonUI[this.#onMouse.name].top = event.offsetY - this.#onSymbol.offsetTop;
      this.#jsonUI[this.#onMouse.name].left = event.offsetX - this.#onSymbol.offsetLeft;
    } else if (this.#onKnob.pressed) {
      this.#findKnob(event);
    } else {
      this.#findPath(event);
    }

    this.draw();
  }

  #findKnob(event) {
    this.#onKnob.name = "";

    Object.keys(this.#jsonUI).forEach(property => {
      switch (this.#core.getType(property)) {
        case "IN":
          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onKnob.name = property;
            this.#onKnob.index = -1;
            this.#onKnob.referenceName = property + "*exit";
          }
          break;
        case "OUT":
          this.#core.getFrom(property).forEach((element, index) => {
            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onKnob.name = property;
              this.#onKnob.index = index;
              this.#onKnob.referenceName = property + "*" + index;
            }
          });
          break;
        default:
          if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onKnob.name = property;
            this.#onKnob.index = -1;
            this.#onKnob.referenceName = property + "*exit";
          }

          this.#core.getFrom(property).forEach((element, index) => {
            if (!this.#onKnob.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onKnob.name = property;
              this.#onKnob.index = index;
              this.#onKnob.referenceName = property + "*" + index;
            }
          });
          break;
      }
    });
  }

  #findPath(event) {
    this.#onMouse.name = "";

    Object.keys(this.#jsonUI).forEach(property => {
      switch (this.#core.getType(property)) {
        case "IN":
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = -1;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*exit";
          }
          break;
        case "OUT":
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*0"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = 0;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*0";
          }
          if (!this.#onMouse.name && this.#core.getFrom(property)[0] && this.#ctx.isPointInStroke(this.#connectorPath[property + "*0"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = 0;
            this.#onMouse.referencePath = "connectorPath";
            this.#onMouse.referenceName = property + "*0";
          }
          break;
        default:
          if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*exit"], event.offsetX, event.offsetY)) {
            this.#onMouse.name = property;
            this.#onMouse.index = -1;
            this.#onMouse.referencePath = "knobPath";
            this.#onMouse.referenceName = property + "*exit";
          }

          this.#core.getFrom(property).forEach((element, index) => {
            if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#knobPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onMouse.name = property;
              this.#onMouse.index = index;
              this.#onMouse.referencePath = "knobPath";
              this.#onMouse.referenceName = property + "*" + index;
            }
            if (!this.#onMouse.name && element && this.#ctx.isPointInStroke(this.#connectorPath[property + "*" + index], event.offsetX, event.offsetY)) {
              this.#onMouse.name = property;
              this.#onMouse.index = index;
              this.#onMouse.referencePath = "connectorPath";
              this.#onMouse.referenceName = property + "*" + index;
            }
          });
          break;
      }

      if (!this.#onMouse.name && this.#ctx.isPointInPath(this.#symbolPath[property], event.offsetX, event.offsetY)) {
        this.#onMouse.name = property;
        this.#onMouse.referencePath = "symbolPath";
        this.#onMouse.referenceName = property;
      }
    });
  }

  #onMouseDown(event) {
    if (!this.#onMouse.name) {
      return;
    }

    switch (this.#onMouse.referencePath) {
      case "knobPath":
        this.#onKnob.pressed = true;
        this.#onKnob.event = event;
        break;
      case "symbolPath":
        if (this.#onArrow.selected) {
          var done = false;
          var fromLength = this.#core.getFrom(this.#onArrow.name).length;

          switch (this.#onArrow.direction) {
            case "UP":
              if (fromLength > 2) {
                done = true;
                this.#core.decConnector(this.#onArrow.name);
                this.#jsonUI[this.#onArrow.name].top += this.#operator.oneHeight / 2;
              }
              break;
            case "DOWN":
              if (fromLength < this.#onArrow.max) {
                done = true;
                this.#core.incConnector(this.#onArrow.name);
                this.#jsonUI[this.#onArrow.name].top -= this.#operator.oneHeight / 2;
              }
              break;
          }

          if (done) {
            this.#incHistory();
            this.#toolbar.resetButtons();
            this.draw();
            this.#onChangeListener.forEach(listener => listener());
            this.#onChangeUIListener.forEach(listener => listener());
          }
        } else if (this.#onInteractive.selected) {
          this.#interactive[this.#onMouse.name] = !this.#interactive[this.#onMouse.name];
          this.draw();
        } else {
          this.#onSymbol.pressed = true;
          this.#onSymbol.offsetLeft = event.offsetX - this.#jsonUI[this.#onMouse.name].left;
          this.#onSymbol.offsetTop = event.offsetY - this.#jsonUI[this.#onMouse.name].top;
          this.#canvas.style.cursor = this.#cursor.grabbing;
        }
        break;
      case "connectorPath":
        this.#core.removeConnection(this.#onMouse.name, this.#onMouse.index);
        this.#onMouse.name = "";

        this.#incHistory();
        this.#toolbar.resetButtons();
        this.draw();
        this.#onChangeListener.forEach(listener => listener());
        this.#onChangeUIListener.forEach(listener => listener());
        break;
    }
  }

  #onMouseUp(event) {
    if (this.#onMouse.name && this.#onSymbol.pressed) {
      var deleted = false;
      if (this.#intersects(this.#canvas.width, this.#canvas.height, this.#trash.lineWidth, this.#jsonUI[this.#onMouse.name].left, this.#jsonUI[this.#onMouse.name].top, this.#symbolSize[this.#onMouse.name].width, this.#symbolSize[this.#onMouse.name].height)) {
        deleted = true;
        this.#core.remove(this.#onMouse.name);
        delete this.#jsonUI[this.#onMouse.name];
        this.#onMouse.name = "";
      }

      this.#incHistory();
      this.#toolbar.resetButtons();
      this.draw();
      if (deleted) {
        this.#onChangeListener.forEach(listener => listener());
      }
      this.#onChangeUIListener.forEach(listener => listener());
    } else if (this.#onKnob.pressed && this.#onKnob.name &&
            this.#isConnectionValid(this.#onMouse.name, this.#onMouse.index, this.#onKnob.name, this.#onKnob.index)) {
      var startType = this.#core.getType(this.#onMouse.name);
      var endType = this.#core.getType(this.#onKnob.name);

      if (startType === "IN") {
        this.#core.addConnection(this.#onMouse.name, this.#onKnob.name, this.#onKnob.index);
      } else if (endType === "IN") {
        this.#core.addConnection(this.#onKnob.name, this.#onMouse.name, this.#onMouse.index);
      } else if (startType === "OUT") {
        this.#core.addConnection(this.#onKnob.name, this.#onMouse.name, 0);
      } else if (endType === "OUT") {
        this.#core.addConnection(this.#onMouse.name, this.#onKnob.name, 0);
      } else if (this.#onMouse.index === -1) {
        this.#core.addConnection(this.#onMouse.name, this.#onKnob.name, this.#onKnob.index);
      } else if (this.#onKnob.index === -1) {
        this.#core.addConnection(this.#onKnob.name, this.#onMouse.name, this.#onMouse.index);
      }

      this.#incHistory();
      this.#toolbar.resetButtons();
      this.draw();
      this.#onChangeListener.forEach(listener => listener());
      this.#onChangeUIListener.forEach(listener => listener());
    }

    this.#onKnob.pressed = false;
    this.#onSymbol.pressed = false;
    this.#onArrow.selected = false;
  }

  #incHistory() {
    this.#history.array.splice(this.#history.index + 1);

    this.#history.index++;
    this.#history.array.push({
      "json": JSON.stringify(this.#core.getJSON()),
      "jsonUI": JSON.stringify(this.#jsonUI)
    });
  }

  #isConnectionValid(startName, startIndex, endName, endIndex) {
    var startType = this.#core.getType(startName);
    var endType = this.#core.getType(endName);

    if (startType === "IN" && endType === "IN") {
      return false;
    } else if (startType === "IN" && endType === "OUT") {
      return this.#core.isConnectionValid(startName, endName);
    } else if (startType === "IN") {
      return endIndex === -1 ? false : this.#core.isConnectionValid(startName, endName);
    } else if (startType === "OUT" && endType === "IN") {
      return this.#core.isConnectionValid(endName, startName);
    } else if (startType === "OUT" && endType === "OUT") {
      return false;
    } else if (startType === "OUT") {
      return endIndex !== -1 ? false : this.#core.isConnectionValid(endName, startName);
    } else if (endType === "IN") {
      return startIndex === -1 ? false : this.#core.isConnectionValid(endName, startName);
    } else if (endType === "OUT") {
      return startIndex !== -1 ? false : this.#core.isConnectionValid(startName, endName);
    } else if (startIndex === -1 && endIndex === -1) {
      return false;
    } else if (startIndex !== -1 && endIndex !== -1) {
      return false;
    } else if (startIndex === -1) {
      return this.#core.isConnectionValid(startName, endName);
    } else if (endIndex === -1) {
      return this.#core.isConnectionValid(endName, startName);
    } else {
      return false;
    }
  }

  #ondragenter(event) {
    this.#checkDroppable(event);
  }

  #ondragover(event) {
    this.#checkDroppable(event);
  }

  #checkDroppable(event) {
    event.preventDefault();

    var dist = Math.sqrt(Math.pow(event.offsetX - this.#canvas.width, 2) + Math.pow(event.offsetY - this.#canvas.height, 2));
    this.#DnD.droppable = uniqueDragAndDropKeyLogicalCircuitUI === this.#uniqueClass;
    this.#DnD.inTrash = dist < this.#trash.radius2;
    this.#DnD.left = event.offsetX;
    this.#DnD.top = event.offsetY;
    event.dataTransfer.dropEffect = this.#DnD.droppable && !this.#DnD.inTrash ? "move" : "none";
  }

  #ondragleave(event) {
    event.preventDefault();
    this.#DnD.droppable = false;
  }

  getCanvasForDnD(type, label) {
    var size;
    var path = new Path2D();
    var ctxDnD = this.#canvasDnD.getContext('2d');

    switch (type) {
      case "IN":
      case "OUT":
        size = {
          "width": this.#ctx.measureText(label).width + this.#text.gap + (this.#default.interactive ? this.#text.gap : 0),
          "height": this.#text.height
        };
        path.rect(0, 0, size.width, this.#text.height);

        this.#canvasDnD.width = size.width + 10;
        this.#canvasDnD.height = size.height + 10;
        ctxDnD.clearRect(0, 0, this.#canvasDnD.width, this.#canvasDnD.height);
        
        ctxDnD.translate(5, 5);
        ctxDnD.lineWidth = this.#default.lineWidth;
        ctxDnD.lineJoin = "round";
        ctxDnD.stroke(path);

        ctxDnD.font = this.#default.font;
        ctxDnD.textBaseline = "middle";
        ctxDnD.fillText(label, this.#text.gap / 2, this.#text.height / 2);
        break;
      default:
        var width = this.#operator.lineWidth + (type === "NOT" ? this.#operator.radiusLeft : 0);

        size = {
          "height": 2 * this.#operator.oneHeight
        };

        switch (type) {
          case "OR":
          case "AND":
          case "XOR":
            size.width = this.#operator.lineWidth + this.#operator.radiusLeft;
            break;
          case "NOR":
          case "NAND":
          case "NXOR":
            var arc = new Path2D();
            arc.arc(width + this.#operator.radiusLeft + this.#operator.notRadius, this.#operator.oneHeight, this.#operator.notRadius, 0, 2 * Math.PI);
            path.addPath(arc);

            size.width = this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius;
            break;
          case "NOT":
            var arc = new Path2D();
            arc.arc(width + this.#operator.notRadius, this.#operator.oneHeight, this.#operator.notRadius, 0, 2 * Math.PI);
            path.addPath(arc);

            size.width = this.#operator.lineWidth + this.#operator.radiusLeft + 2 * this.#operator.notRadius;
            break;
        }

        if (type !== "NOT") {
          path.moveTo(width, size.height);
          path.lineTo(0, size.height);
        }

        switch (type) {
          case "OR":
          case "NOR":
            path.ellipse(0, this.#operator.oneHeight, this.#operator.radiusLeft, this.#operator.oneHeight, 0, Math.PI / 2, -Math.PI / 2, true);
            path.lineTo(width, 0);
            path.quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, 0, width + this.#operator.radiusLeft, this.#operator.oneHeight);
            path.quadraticCurveTo(width + 3 * this.#operator.radiusLeft / 5, size.height, width, size.height);
            break;
          case "AND":
          case "NAND":
            path.lineTo(0, 0);
            path.lineTo(width, 0);
            path.ellipse(width, this.#operator.oneHeight, this.#operator.radiusLeft, this.#operator.oneHeight, 0, -Math.PI / 2, Math.PI / 2);
            break;
          case "XOR":
          case "NXOR":
            path.ellipse(0, this.#operator.oneHeight, this.#operator.radiusLeft, this.#operator.oneHeight, 0, Math.PI / 2, -Math.PI / 2, true);
            path.lineTo(width, 0);
            path.ellipse(width, this.#operator.oneHeight, this.#operator.radiusLeft, this.#operator.oneHeight, 0, -Math.PI / 2, Math.PI / 2);

            var ellipse = new Path2D();
            ellipse.ellipse(0 - this.#operator.xorGap, this.#operator.oneHeight, this.#operator.radiusLeft, this.#operator.oneHeight, 0, Math.PI / 2, -Math.PI / 2, true);
            path.addPath(ellipse);
            break;
          case "NOT":
            path.moveTo(0, 0);
            path.lineTo(width, this.#operator.oneHeight);
            path.lineTo(0, size.height);
            path.closePath();
            break;
        }

        this.#canvasDnD.width = size.width + 10;
        this.#canvasDnD.height = size.height + 10;
        ctxDnD.clearRect(0, 0, this.#canvasDnD.width, this.#canvasDnD.height);

        ctxDnD.lineWidth = this.#default.lineWidth;
        ctxDnD.lineJoin = "round";
        ctxDnD.translate(5, 5);
        ctxDnD.stroke(path);
        break;
    }

    return this.#canvasDnD;
  }
}
