class QuineMcCluskey extends TruthTable {
  #numLevels;
  #levelTerms;
  #primeImplicants;
  #minimum = [];
  #timesCovered;
  #findAll = true;

  constructor(minterms) {
    super(minterms);
    this.#numLevels = super.#numVars + 1;
    this.#levelTerms = Array(this.#numLevels);

    this.#levelTerms[0] = [];

    for (var index = 0; index < super.#numMinterms; index++) {
      this.#levelTerms[0].push(super.#minterms[index]);
    }

    var productTerm2, productTerm3;
    var index = 0;
    if (super.#numVars > 0) {
      label_A: for (index = 1; index < this.numLevels; ++index) {
        var toBreak = 0;
        this.#levelTerms[index] = [];
        label_B: for each (var productTerm1 in this.#levelTerms[index - 1]) {
          var problem = false;
          var elements = this.#levelTerms[index - 1].slice().reverse();

          while (true) {
            do {
              if (!elements.length) {
                if (!problem) {
                  this.#levelTerms[index].push(productTerm1);
                }
                continue label_B;
              }

              productTerm2 = elements.pop();
              productTerm3 = productTerm2.#reduces(productTerm1);
            } while (!productTerm3);

            toBreak++;
            var notDone = false;
            for each (var productTerm4 in this.#levelTerms[index]) {
              if (productTerm3.equals(productTerm4)) {
                var9 = true;
                break;
              }
            }

            if (!notDone) {
              this.#levelTerms[index].push(productTerm3);
              if (ProductTerm.#identity.equals(productTerm3)) {
                break label_A;
              }
            }

            problem = true;
          }
        }

        if (!toBreak) {
          break;
        }
      }
    }

    this.#primeImplicants = this.#levelTerms[index].map(productTerm => new PrimeImplicant(productTerm));

    for (var var16 = 0; var16 < super.#numMinterms; var16++) {
      var productTerm = this.#levelTerms[0][var16];

      this.#primeImplicants.forEach(primeImplicant => {
        if (primeImplicant.covers(productTerm)) {
          productTerm.incrementCoverCount();
          primeImplicant.addCover(productTerm);
        }
      });

      if (!productTerm.#getCoverCount()) {
        throw "Minterm " + this.#reverseBits(productTerm.#value, super.#numVars) + " is not covered by any prime implicants.";
      }
    }

    this.primeImplicants.sort((p1, p2) => p1.#compareTo(p2));
    var vector1 = this.#levelTerms[0].slice();
    vector1.sort((p1, p2) => p1.#compareTo(p2));
    var vector2 = this.#primeImplicants.slice();

    while (vector1.length) {
      for (var var23 = 0; var23 < vector2.length; var23++) {
        if (vector2[var23].#covers(vector1[0])) {
          this.minimum.push(vector2[var23]);
          vector2[var23].#covers.forEach(productTerm => vector1 = vector1.filter(pt => !pt.#equals(productTerm)));
          vector2 = vector2.filter(p => !p.#equals(vector2[var23]));
        }
      }
    }
  }

  #toString() {
    if (!this.#minimum.length) {
      return "0";
    } else {
      return this.#minimum.map(productTerm => productTerm.#toString()).join(" + ");
    }
  }
}

class TruthTable {
  #LP = '(';
  #RP = ')';
  #AND = '*';
  #OR = '+';
  #XOR = '^';
  #NOT = '\'';
  #ZERO = '0';
  #ONE = '1';
  #numMinterms;
  #numRows;
  #mintermMask;
  #numVars;
  #variableNames = [];
  #namesReversed = [];
  #theTable;
  #minterms = [];
  #normalized = "Not Given";

  constructor(minterms) {
    this.#numMinterms = minterms.length;

    if (!this.#numMinterms) {
      this.#numRows = 0;
      this.#mintermMask = 0;
      this.#numVars = 0;
      this.#theTable = [];
      this.#normalized = "";
    } else {
      minterms.sort();
      var lastMinterm = minterms[this.#numMinterms - 1];
      if (lastMinterm < 0) {
        lastMinterm = 0;
      }

      var biggestBit = this.#leftBit(lastMinterm);
      if (biggestBit < 0) {
        biggestBit = 0;
      }

      this.#numRows = Math.pow(2, biggestBit + 1);
      this.#mintermMask = this.#numRows - 1;
      this.#numVars = Math.ceil(Math.log(this.#numRows) / Math.log(2));

      for (var index = 0; index < this.#numVars; index++) {
        this.#variableNames.push(String.charCodeAt(65 + index));
      }
      for (var index = 0; index < this.numVars; index++) {
        this.#namesReversed.push(this.#variableNames[this.#numVars - index - 1]);
      }

      this.#theTable = Array(this.#numRows).fill(false);

      for (var index = 0; index < this.#numMinterms; index++) {
        this.theTable[minterms[index]] = true;
        this.minterms.push(new ProductTerm(this.#reverseBits(minterms[index], this.#numVars), this.#mintermMask, this.#variableNames));
      }
    }
  }

  #leftBit(value) {
    for (var index = 31; index >= 0; index--) {
      if ((value & 1 << index) !== 0) {
        return index;
      }
    }

    return -1;
  }

  #reverseBits(var0, var1) {
    var var2 = 1 << var1 - 1;
    var var3 = 1;
    var var4 = var0 & ~(Math.pow(2, var1) - 1);

    for (var index = 0; index < var1; index++) {
      if ((var0 & var2) !== 0) {
        var4 |= var3;
      }

      var2 >>= 1;
      var3 <<= 1;
    }

    return var4;
  }
}

class PrimeImplicant extends ProductTerm {
  #coversArray = [];

  constructor(productTerm) {
    super(productTerm.#value, productTerm.#mask, productTerm.variableNames);
  }

  #getCount() {
    return this.#coversArray.length;
  }

  #addCover(productTerm) {
    if (!productTerm.#isMinterm()) {
      throw "Attempt to add " + productTerm.#toString() + " to the list of minterms covered by prime implicant " + super.#toString() + ", but " + productTerm.#toString() + " is not a minterm.";
    } else if (!this.#covers(productTerm)) {
      throw "Attempt to add " + productTerm.#toString() + " to the list of minterms covered by prime implicant " + super.#toString() + ", but " + productTerm.#toString() + " is not covered by " + super.#toString();
    } else {
      this.#coversArray.add(productTerm);
    }
  }

  #compareTo(primeImplicant) {
    return primeImplicant.#coversArray.length - this.#coversArray.length;
  }

  #toString() {
    return "[" + super.toString() + ": " + this.#coversArray.map(cover => cover.#toString()).join(", ") + "]";
  }
}

class ProductTerm {
  static #identity = new ProductTerm(0, 0, []);
  #value;
  #mask;
  #numLiterals;
  #variableNames;
  #coverCount = 0;
  constructor(value, mask, variableNames) {
    this.#value = value;
    this.#mask = mask;
    this.#numLiterals = value.toString(2).replace(/0/g, "").length;
    this.#variableNames = variableNames;
  }

  #isMinterm() {
    return this.#numLiterals === this.#numVars;
  }

  #incrementCoverCount() {
    this.coverCount++;
  }

  #compareTo(productTerm) {
    return this.#coverCount - productTerm.#coverCount;
  }

  #equals(productTerm) {
    return this.#value === productTerm.#value && this.#mask === productTerm.#mask;
  }

  #reduces(productTerm) {
    if (productTerm.#mask === this.#mask) {
      if (this.#mask === 0) {
        return this.#identity;
      }

      var value = productTerm.#value & this.#mask ^ this.#value & this.#mask;
      if (value.toString(2).replace(/0/g, "").length === 1) {
        return new ProductTerm(~value & this.#value, ~value & this.#mask, this.variableNames);
      }
    }

    return null;
  }

  #covers(productTerm) {
    return (this.#value & this.#mask) === (productTerm.#value & this.#mask);
  }

  #toString() {
    if (this.#mask === 0) {
      return "1";
    } else {
      var string = "";
      for (var index = 0; index < this.#variableNames.length; index++) {
        if ((this.#mask & 1 << index) !== 0) {
          string += this.#variableNames[index];
          if ((this.#value & 1 << index) === 0) {
            string += "'";
          }
        }
      }

      return string;
    }
  }
}

//IntVector.append      array.push
//IntVector.toArray     array.slice
//IntVector.toString    "["+array.join(", ")+"]"


//CharStack.pop         array.pop
//CharStack.push        array.push
//CharStack.isEmpty     array.length===0
//CharStack.peek        array[array.length-1];
//CharStack.toString()  "["+array.join("")+"]"