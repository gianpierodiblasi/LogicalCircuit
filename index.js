var json1 = {
  "x": {"type": "IN"},
  "y": {"type": "IN"},
  "o1": {"type": "AND", "from": ["x", "y"]},
  "o2": {"type": "OR", "from": ["x", "y"]},
  "o12": {"type": "XOR", "from": ["o1", "o2"]},
  "out1": {"type": "OUT", "from": ["o12"]}
};

var jsonUI1 = {
  "x": {"top": 10, "left": 10},
  "y": {"top": 100, "left": 10},
  "o1": {"top": 10, "left": 100},
  "o2": {"top": 100, "left": 100},
  "o12": {"top": 55, "left": 200},
  "out1": {"top": 55, "left": 300}
};

var json2 = {
  "x": {"type": "IN"},
  "yy": {"type": "IN"},
  "aaa": {"type": "IN"},
  "bbbb": {"type": "IN"},
  "o1": {"type": "AND", "from": ["x", "yy"]},
  "o11": {"type": "AND", "from": ["x", "yy", "bbbb"]},
  "o2": {"type": "OR", "from": ["aaa", "bbbb", "x"]},
  "o22": {"type": "OR", "from": ["bbbb", "x"]},
  "o3": {"type": "NOT", "from": ["o2"]},
  "o4": {"type": "OR", "from": ["o1", "o3"]},
  "out1": {"type": "OUT", "from": ["o4"]},
  "output2": {"type": "OUT", "from": ["o22"]}
};

var jsonUI2 = {
  "x": {"top": 10, "left": 10},
  "yy": {"top": 100, "left": 10},
  "aaa": {"top": 200, "left": 10},
  "bbbb": {"top": 300, "left": 10},
  "o1": {"top": 10, "left": 200},
  "o11": {"top": 100, "left": 200},
  "o2": {"top": 200, "left": 230},
  "o22": {"top": 300, "left": 230},
  "o3": {"top": 400, "left": 200},
  "o4": {"top": 500, "left": 200},
  "out1": {"top": 200, "left": 400},
  "output2": {"top": 400, "left": 400}
};

window.onload = (event) => {
  var logicalCircuitUI = new LogicalCircuitUI(document.querySelector("#container"), {});
  document.querySelector("#load1").onclick = () => logicalCircuitUI.setJSONs(json1, jsonUI1);
  document.querySelector("#load2").onclick = () => logicalCircuitUI.setJSONs(json2, jsonUI2);
  document.querySelector("#bezier").onchange = (event) => logicalCircuitUI.setBezierConnector(event.srcElement.checked);
  document.querySelector("#type").onchange = (event) => logicalCircuitUI.setShowOperatorType(event.srcElement.checked);
  document.querySelector("#interactive").onchange = (event) => logicalCircuitUI.setInteractive(event.srcElement.checked);
  logicalCircuitUI.addOnChangeListener(() => {
    var div = document.querySelector("#expressions");
    div.textContent = "";
    if (logicalCircuitUI.isValid()) {
      var expressions = logicalCircuitUI.getJavaScriptExpressions();
      for (var key in expressions) {
        var row = document.createElement("div");
        row.textContent = key + " = " + expressions[key];
        div.append(row);
      }
    }
  });
};