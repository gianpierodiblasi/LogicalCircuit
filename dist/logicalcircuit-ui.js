class LogicalCircuitUI {
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

  constructor(container, options) {
    try {
      options.width;
    } catch (exception) {
      options = {};
    }
    options.width = isNaN(options.width) || options.width < 0 ? this.#default.width : options.width;
    options.height = isNaN(options.height) || options.height < 0 ? this.#default.height : options.height;
  }
}