# LogicalCircuit
An extension to perform logical operations.

**This Extension is provided as-is and without warranty or support. It is not part of the PTC product suite and there is no PTC support.**

## Description
This extension provides a widget to perform logical operations.

## Properties
- debugMode - BOOLEAN (default = false): if set to true it sends to the browser's JS console a set of information useful for debugging the widget
- operation - STRING (default = 'OR'): The logical operation (options: OR, NOR, AND, NAND, XOR, NXOR, NOT)
- numberOfOperands - INTEGER (default = 2): The operands number
- operand, operand1, ..., operand\<numberOfOperands\> - BOOLEAN (no default value): dynamic properties based on the value of operation and numberOfOperands, they are the operands
- output - BOOLEAN (default = false): The output
- autoEvaluate - BOOLEAN (default = false): true to automatically evaluate output when a new operand value is set
## Services
- Evaluate: service to execute the operation

## Events
- Evaluated: event to notify the operation has been executed
  
## Donate
If you would like to support the development of this and/or other extensions, consider making a [donation](https://www.paypal.com/donate/?business=HCDX9BAEYDF4C&no_recurring=0&currency_code=EUR).
