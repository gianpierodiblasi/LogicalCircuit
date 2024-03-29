# LogicalCircuit
A JavaScript API to (visually) manage logical circuits.

## Description
This API provides two classes to (visually) manage logical circuits; a demo is available [here](https://gianpierodiblasi.github.io/LogicalCircuit/).

### LogicalCircuit
The *LogicalCircuit* class can be used to manage a logical circuit; the following JSON describes the structure used by the class to manage the circuit.
```json
{
  "inputs": [{
    "name": "x"
  }, {
    "name": "y"
  }],
  "operators": [{
    "name": "1",
    "type": "AND",
    "from": ["x", "y"]
  }, {
    "name": "2",
    "type": "OR",
    "from": ["x", "y"]
  }, {
    "name": "12",
    "type": "XOR",
    "from": ["1", "2"]
  }],
  "outputs": [{
    "name": "out1",
    "from": "12"
  }]
}
```
**Notes:**
- the *inputs* array represents the input parameters, the *operators* array represents the circuit and finally the *output* array represents the output parameters
- the *name* properties have to be unique in the structure and for each *from* value there must be exist a corresponding *name* property
- the managed operators are OR, NOR, AND, NAND, XOR, NXOR, NOT

#### constructor
The constructor can be used to create a new *LogicalCircuit* as follows:
```javascript
var logicalCircuit = new LogicalCircuit();
```

#### methods
- *load(circuit)*: loads a circuit, no check is done on the correctness of the JSON object
  - input
    - circuit: the circuit, represented by a JSON as described above (JSON)
  - output: NOTHING
- *addInput(name)*: adds an input node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- *addOutput(name)*: adds an output node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- *add\<Operator>()*: adds an operator node (an operator is always added)
  - input: NOTHING
  - output: the unique name assigned to the operator (STRING)
- *purgeName(name)*: an utility method to purge a name
  - input:
    - name: the name (STRING)
  - output: the purged name (STRING)
- *isNameAlreadyUsed(name)*: an utility method to check if a name is already used
  - input:
    - name: the name (STRING)
  - output: true if the name is already used, false otherwise (BOOLEAN)
- *remove(name)*: removes a node
  - input
    - name: the node name (STRING)
  - output: NOTHING
- *clear()*: clears the logical circuit
  - input: NOTHING
  - output: NOTHING

### LogicalCircuitUI
The *LogicalCircuitUI* class can be used to visually manage a logical circuit; it uses an enhanced JSON structure.
```json
{
  "inputs": [{
    "name": "x",
    "top": 10,
    "left": 10,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "knobPath": Path2D,
    "knobCenter": {"x": 115, "y": 30}
  }, {
    "name": "y",
    "top": 100,
    "left": 10,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "knobPath": Path2D,
    "knobCenter": {"x": 115, "y": 120}
  }],
  "operators": [{
    "name": "1",
    "type": "AND",
    "from": ["x", "y"],
    "top": 10,
    "left": 100,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "fromKnobPath": [Path2D, Path2D],
    "fromKnobCenter": [{"x": 0, "y": 0}, {"x": 0, "y": 0}],
    "outputKnobPath": Path2D,
    "outputKnobCenter": {"x": 0, "y": 0}
  }, {
    "name": "2",
    "type": "OR",
    "from": ["x", "y"],
    "top": 100,
    "left": 100,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "fromKnobPath": [Path2D, Path2D],
    "fromKnobCenter": [{"x": 0, "y": 0}, {"x": 0, "y": 0}],
    "fromKnobConnectorPath": [Path2D, Path2D],
    "outputKnobPath": Path2D,
    "outputKnobCenter": {"x": 0, "y": 0}
  }, {
    "name": "12",
    "type": "XOR",
    "from": ["1", "2"],
    "top": 10,
    "left": 200,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "fromKnobPath": [Path2D, Path2D],
    "fromKnobCenter": [{"x": 0, "y": 0}, {"x": 0, "y": 0}],
    "fromKnobConnectorPath": [Path2D, Path2D],
    "outputKnobPath": Path2D,
    "outputKnobCenter": {"x": 0, "y": 0}
  }],
  "outputs": [{
    "name": "out1",
    "from": "12",
    "top": 10,
    "left": 300,
    "symbolPath": Path2D,
    "symbolSize": {"width": 100, "height": 40},
    "knobPath": Path2D,
    "knobCenter": {"x": 295, "y": 30},
    "knobConnectorPath": Path2D
  }]
}
```
**Notes:**
- the *(top, left)* parameters represent the position of the logical operator
- the *symbolPath* parameter is the Path2D object representing the node
- the *symbolSize* parameter is the size of the *symbolPath* containing rectangle
- the *knobPath*, *fromKnobPath* and *outputKnobPath* parameters are the Path2Ds of the knobs used to connect the nodes
- the *knobCenter*, *fromKnobCenter* and *outputKnobCenter* parameters are the centers of the knobs used to connect the nodes
- the *fromKnobConnectorPath* and *knobConnectorPath* parameters are the Path2Ds of the lines used to connect the nodes

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
  "showToolbar": false, // true to show a toolbar to manage the circuit, false otherwise (default: false)
}
```
#### methods
- *load(circuit)*: loads a circuit, no check is done on the correctness of the JSON object
  - input
    - circuit: the circuit, represented by a JSON as described above; the properties *\*Path*, *\*Size* and *\*Center* are not considered (JSON)
  - output: NOTHING
- *addInput(name, top, left)*: adds an input node
  - input
    - name: the node name (STRING)
    - top: the top coordinate of the node (NUMBER)
    - left: the left coordinate of the node (NUMBER)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- *addOutput(name, top, left)*: adds an output node
  - input
    - name: the node name (STRING)
    - top: the top coordinate of the node (NUMBER)
    - left: the left coordinate of the node (NUMBER)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- *add\<Operator>(top, left)*: adds an operator node (an operator is always added)
  - input:
    - top: the top coordinate of the node (NUMBER)
    - left: the left coordinate of the node (NUMBER)
  - output: the unique name assigned to the operator (STRING)
- *remove(name)*: removes a node
  - input
    - name: the node name (STRING)
  - output: NOTHING
- *clear()*: clears the logical circuit
  - input: NOTHING
  - output: NOTHING

## How To Use
The API has no dependencies, so in order to use the API it is necessary only reference the JS and CSS files available in the dist folder (open the demo [here](https://gianpierodiblasi.github.io/LogicalCircuit/) for an example).

## Donate
If you would like to support the development of this and/or other projects, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
