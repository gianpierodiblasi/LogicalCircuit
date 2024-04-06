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
  - it has to be of the following type (minterms: \[INTEGER\]) => STRING
  - the output has to be a string representing the simplified logical circuit
  - the output string has to use (example: ```(A AND NOT B) OR (NOT A AND B)```):
    - capital letters for properties (in the sequence order: A, B, C,...)
    - AND, OR and NOT for logical operators
  - input:
    - simplifier: the simplifier (FUNCTION)
  - output: NOTHING
- *simplify()*: simplifies the logical circuit
  - input: NOTHING
  - output: true if the simplification has been performed, false otherwise (BOOLEAN)
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
    - index: the index in the *from* array of the node (INTEGER)
  - output: NOTHING
- *remove(name)*: removes a node
  - input:
    - name: the node name (STRING)
  - output: NOTHING
- *clear()*: clears the logical circuit
  - input: NOTHING
  - output: NOTHING
- *getType(name)*: returns the *type* of a node
  - input:
    - name: the name of the node (STRING)
  - output: the *type* of the node, an empty string if there is no node with this name (STRING)
- *getFrom(name)*: returns the *from* array of a node
  - input:
    - name: the name of the node (STRING)
  - output: the *from* array of the node, an empty array if there is no node with this name or the node is an input node (ARRAY)
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

## How To Use
The API has no dependencies, so in order to use the API it is necessary only to reference the JS and CSS files available in the dist folder; for the JS files it is possible:

- reference all the not versioned files logicalcircuit-*.js
- reference only the bundled file logicalcircuit-bundle-\<version\>.js
- reference only the bundled and minified file logicalcircuit-bundle-min-\<version\>.js

In order to show the behavior of:
- the simplify method an implementation of the [Quine–McCluskey algorithm](https://en.wikipedia.org/wiki/Quine-McCluskey_algorithm) is provided
- the tidy up functionality a reference to the [dagre](https://github.com/dagrejs/dagre) library is provided

Open the demo [here](https://gianpierodiblasi.github.io/LogicalCircuit/) and its source code for an example.

## Dependencies
- dagre.js (optional) - [link](https://github.com/dagrejs/dagre)

## Donate
If you would like to support the development of this and/or other projects, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).