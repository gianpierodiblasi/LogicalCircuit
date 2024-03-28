# LogicalCircuit
A JavaScript API to (visually) manage logical circuits.

## Description
This API provides two classes to (visually) manage logical circuits.

The *LogicalCircuit* class can be used to manage a logicalCircuit; the following JSON describes the structure used by the class to manage the circuit.
```javascript
{
  "inputs": [{
    "name": "x",
  }, {
    "name": "y",
  }],
  "operators": [{
    "name": "1",
    "type": "AND",
    "from": ["x", "y"],
  }, {
    "name": "2",
    "type": "OR",
    "from": ["x", "y"],
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

## Donate
If you would like to support the development of this and/or other projects, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
