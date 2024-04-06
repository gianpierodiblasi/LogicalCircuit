# LogicalCircuit
A JavaScript API to (visually) manage logical circuits.

## Description
This API provides two classes to (visually) manage logical circuits; a demo is available [here](https://gianpierodiblasi.github.io/LogicalCircuit/). Other utility classes are available, but they should not be directly used.

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
  - input:
    - json: the JSON object, as described above (JSON)
  - output: NOTHING
- *getJSON()*: returns the JSON object describing the structure used by the class to manage the circuit
  - input: NOTHING
  - output: the JSON object, as described above (JSON)