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
- *setSimplifier(simplifier)*: sets a function able to simplify the logical circuit; the function has to respect the following constraints:
  - it has to provide a SOP (Sum Of Products) logical expression
  - it has to be of the following type (numberOfProperties: NUMBER, minterms: \[NUMBER\]) => STRING
  - the output has to be a string representing the simplified logical circuit
  - the output string has to use:
    - capital letters for properties
    - AND, OR and NOT for logical operators
  - input:
    - simplifier: the simplifier (FUNCTION)
  - output: NOTHING
- *computeExpressions(parameters)*: returns a JSON object representing the computation of the JavaScript expressions of the logical circuits; the JSON is returned if and only if this object represents a set of valid logical circuits
  - input:
    - parameters: the input parameters (JSON)
  - output: the JSON object representing the JavaScript expressions of the logical circuits, an empty JSON if this object does not represent a set of valid logical circuits (JSON)
- *computeExpression(name, parameters)*: returns a boolean representing the computation of the JavaScript expressions of a logical circuit; the boolean is returned if and only if this object represents a set of valid logical circuits
  - input:
    - name: the output node (STRING)
    - parameters: the input parameters (JSON)
  - output: the boolean representing the JavaScript expressions of a logical circuit, an empty value if this object does not represent a set of valid logical circuits (BOOLEAN)
- *getJavaScriptExpressions()*: returns a JSON object representing the JavaScript expressions of the logical circuits; the JSON is returned if and only if this object represents a set of valid logical circuits
  - input: NOTHING
  - output: the JSON object representing the JavaScript expressions of the logical circuits, an empty JSON if this object does not represent a set of valid logical circuits (JSON)
- *getJavaScriptExpression(name)*: returns a string representing the JavaScript expression of a logical circuit; the expression is returned if and only if this object represents a set of valid logical circuits
  - input:
    - name: the output node (STRING)
  - output: the string representing the JavaScript expression of a logical circuit, an empty string if this object does not represent a set of valid logical circuits (JSON)
- *isValid()*: checks if this object represents a set of valid logical circuits
  - input: NOTHING
  - output: true if this object represents a set of valid logical circuits, false otherwise (BOOLEAN)
- *addInput(name)*: adds an input node
  - input:
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the name is not valid or is already used (BOOLEAN)
- *addOutput(name)*: adds an output node
  - input:
    - name: the node name (STRING)
  - output: true if the node is added, false otherwise; a node is not added if and only if the name is not valid or is already used (BOOLEAN)
- *add\<Operator>()*: adds an operator node (an operator is always added)
  - input: NOTHING
  - output: the unique name assigned to the operator (STRING)
- *incConnector(name)*: increments the number of connectors in an operator
  - input:
    - name: the operator name (STRING)
  - output: NOTHING
- *decConnector(name)*: decrements the number of connectors in an operator
  - input:
    - name: the operator name (STRING)
  - output: NOTHING
- *isNameValid(name)*: an utility method to check if a name is valid as input/output parameter; to be valid a name:
  - has to respect the following regular expression
    ```javascript
    /^[a-z]+[a-z0-9_]*$/i
    ```
  - cannot be one of the following blacklist words: OR, NOR, AND, NAND, XOR, NXOR, NOT (case insensitive)
  - cannot be a JavaScript reserved word (case insensitive)
  - input:
    - name: the name (STRING)
  - output: true if the name is valid, false otherwise (BOOLEAN)
- *isNameAlreadyUsed(name)*: an utility method to check if a name is already used
  - input:
    - name: the name (STRING)
  - output: true if the name is already used, false otherwise (BOOLEAN)
- *addBlackListWord(name)*: adds a new word in the blacklist
  - input:
    - name: the name (STRING)
  - output: (NOTHING)