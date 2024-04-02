# LogicalCircuit
A JavaScript API to (visually) manage logical circuits.

## Description
This API provides two classes to (visually) manage logical circuits; a demo is available [here](https://gianpierodiblasi.github.io/LogicalCircuit/).

### LogicalCircuit
The *LogicalCircuit* class can be used to manage a logical circuit; the following JSON describes the structure used by the class to manage the circuit.
```json
{
  "x": {"type": "IN"},
  "y": {"type": "IN"},
  "o1": {"type": "AND", "from": ["x", "y"]},
  "o2": {"type": "OR", "from": ["x", "y"]},
  "o12": {"type": "XOR", "from": ["o1", "o2"]},
  "out1": {"type": "OUT", "from": ["o12"]}
}
```
**Notes:**
- the "IN" *type* represents the input parameters, the "OUT" *type* represents the output parameters and the other *type*s represent the logical operators
- for each value in the *from* arrays there must be exist a corresponding property
- the managed operators are OR, NOR, AND, NAND, XOR, NXOR, NOT
- the *from* array of a property with *type* = "OUT" have to contain one and only one element
- the *from* array of a property with *type* = "NOT" have to contain one and only one element
- the *from* array of other operators have to contain at least two elements

#### constructor
The constructor can be used to create a new *LogicalCircuit* as follows:
```javascript
var logicalCircuit = new LogicalCircuit();
```

#### methods
- *setJSON(json)*: sets the JSON object describing the structure used by the class to manage the circuit; no check is done on the correctness of the JSON object
  - input
    - json: the JSON object, as described above (JSON)
  - output: NOTHING
- *getJSON()*: returns the JSON object describing the structure used by the class to manage the circuit
  - input : NOTHING
  - output: the JSON object, as described above (JSON)
- *addInput(name)*: adds an input node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the name is not valid or is already used (BOOLEAN)
- *addOutput(name)*: adds an output node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the name is not valid or is already used (BOOLEAN)
- *add\<Operator>()*: adds an operator node (an operator is always added)
  - input: NOTHING
  - output: the unique name assigned to the operator (STRING)
- *incConnector(name)*: increments the number of connectors in an operator
  - input
    - name: the operator name (STRING)
  - output: NOTHING
- *decConnector(name)*: decrements the number of connectors in an operator
  - input
    - name: the operator name (STRING)
  - output: NOTHING
- *addConnection(startName, endName, endIndex)*: adds a new connection; the connection is added if and only if it is valid connection
  - input:
    - startName: the name of the starting node, that is the information exits from this node (STRING)
    - endName: the name of the ending node, that is the information enters in this node (STRING)
    - endIndex: the index in the *from* array of the ending node (INTEGER)
  - output: NOTHING
- *isConnectionValid(startName, endName)*: checks if a connection is valid
  - input:
    - startName: the name of the starting node (STRING)
    - endName: the name of the ending node (STRING)
  - output: true if the connection is valid, false othewise (BOOLEAN)
- *removeConnection(name, index)*: removes a connection
    - name: the name of the node (STRING)
    - index: the index of the node; used to indentify the input position if necessary (INTEGER)
  - output: NOTHING
- *remove(name)*: removes a node
  - input
    - name: the node name (STRING)
  - output: NOTHING
- *clear()*: clears the logical circuit
  - input: NOTHING
  - output: NOTHING
- *getType(name)*: returns the type of a node
  - input:
    - name: the name of the node (STRING)
  - output: the type of the node, an empty string if there is no node with this name (STRING)
- *getFrom(name)*: returns the from property of a node
  - input:
    - name: the name of the node (STRING)
  - output: the from property of the node, an empty array if there is no node with this name or the node is an input node (STRING)
- *isNameValid(name)*: an utility method to check if a name is valid as input/output parameter; to be valid a name has to respect the following regular expression
    ```javascript
    /^[a-z]+[a-z0-9_]*$/i
    ```
  - input:
    - name: the name (STRING)
  - output: true if the name is valid, false otherwise (BOOLEAN)
- *isNameAlreadyUsed(name)*: an utility method to check if a name is already used
  - input:
    - name: the name (STRING)
  - output: true if the name is already used, false otherwise (BOOLEAN)
### LogicalCircuitUI
The *LogicalCircuitUI* class can be used to visually manage a logical circuit; the following JSON describes the structure used by the class to visually manage the circuit.
```json
{
  "x": {"top": 10, "left": 10},
  "y": {"top": 100, "left": 10},
  "o1": {"top": 10, "left": 100},
  "o2": {"top": 100, "left": 100},
  "o12": {"top": 55, "left": 200},
  "out1": {"top": 55, "left": 300}
}
```
**Notes:**
- the *(top, left)* parameters represent the position of the logical operator

#### constructor
The constructor can be used to create a new *LogicalCircuitUI* as follows:
```javascript
var logicalCircuitUI = new LogicalCircuitUI(container, options);
```
where:
- *container* is the (div) element where to add the UI
- *options* is a JSON with the following structure:
```json
{
  "width": 800, // the canvas width (default: 800)
  "height": 600, // the canvas height (default: 600)
}
```
#### methods
- *setJSONs(json, jsonUI)*: sets the JSON objects describing the structure (visual and not) used by the class to manage the circuit; no check is done on the correctness of the JSON objects
  - input
    - json: the JSON object, as described above (JSON)
    - jsonUI: the JSON object, as described above (JSON)
  - output: NOTHING
- *getJSON()*: returns the JSON object describing the structure used by the class to manage the circuit
  - input : NOTHING
  - output: the JSON object, as described above (JSON)
- *getJSONUI()*: returns the JSON object describing the visual structure used by the class to manage the circuit
  - input : NOTHING
  - output: the JSON object, as described above (JSON)

## How To Use
The API has no dependencies, so in order to use the API it is necessary only reference the JS and CSS files available in the dist folder (open the demo [here](https://gianpierodiblasi.github.io/LogicalCircuit/) for an example).

## Donate
If you would like to support the development of this and/or other projects, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
