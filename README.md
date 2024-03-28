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
- addInput(name): adds an input node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- addOutput(name): adds an output node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)
- add<Operator>(name): adds an operator node
  - input
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the (trimmed) name is empty or the name is already used by another input, operator or output node (BOOLEAN)

### LogicalCircuitUI
The *LogicalCircuitUI* class can be used to visually manage a logical circuit; it uses an enhanced JSON structure.
```json
{
  "inputs": [{
    "name": "x",
    "top": 10,
    "left": 10
  }, {
    "name": "y",
    "top": 100,
    "left": 10
  }],
  "operators": [{
    "name": "1",
    "type": "AND",
    "from": ["x", "y"],
    "top": 10,
    "left": 100
  }, {
    "name": "2",
    "type": "OR",
    "from": ["x", "y"],
    "top": 100,
    "left": 100
  }, {
    "name": "12",
    "type": "XOR",
    "from": ["1", "2"],
    "top": 10,
    "left": 200
  }],
  "outputs": [{
    "name": "out1",
    "from": "12",
    "top": 10,
    "left": 300
  }]
}
```
**Notes:**
- the *(top, left)* parameters represent the position of the logical operator

## Donate
If you would like to support the development of this and/or other projects, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
