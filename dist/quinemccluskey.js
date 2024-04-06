class ProductTerm {
  static identity = new ProductTerm(0, 0, []);

  value;
  mask;
  numLiterals;
  variableNames;
  numVars;
  coverCount;

  constructor(var1, var2, var3) {
    this.value = var1;
    this.mask = var2;
    this.numLiterals = this.countBits(var2);
    this.variableNames = var3;
    this.numVars = var3.length;
    this.coverCount = 0;
  }

  getValue() {
    return this.value;
  }

  getMask() {
    return this.mask;
  }

  getVariableNames() {
    return this.variableNames;
  }

  getNumLiterals() {
    return this.numLiterals;
  }

  isMinterm() {
    return this.numLiterals === this.numVars;
  }

  incrementCoverCount() {
    ++this.coverCount;
  }

  getCoverCount() {
    return this.coverCount;
  }

  compareTo(var1) {
    return this.coverCount - var1.coverCount;
  }

  reduces(var1) {
    if (var1.mask === this.mask) {
      if (this.mask === 0) {
        return identity;
      }

      var var2 = var1.value & this.mask ^ this.value & this.mask;
      if (1 === this.countBits(var2)) {
        return new ProductTerm(~var2 & this.value, ~var2 & this.mask, this.variableNames);
      }
    }

    return null;
  }

  equals(var1) {
    return this.value === var1.getValue() && this.mask === var1.getMask();
  }

  covers(var1) {
    return (this.value & this.mask) === (var1.getValue() & this.mask);
  }

  ptString() {
    if (this.mask === 0) {
      return "1";
    } else {
      var var1 = "";

      for (var var2 = 0; var2 < this.numVars; ++var2) {
        if ((this.mask & 1 << var2) !== 0) {
          var1 += this.variableNames[var2];
          if ((this.value & 1 << var2) === 0) {
            var1 += '\'';
          }
        }
      }

      return var1;
    }
  }

  toString() {
    return this.ptString();
  }

  countBits(var0) {
    var var1 = 0;

    for (var var2 = 0; var2 < 32; ++var2) {
      if ((var0 & 1 << var2) !== 0) {
        ++var1;
      }
    }

    return var1;
  }
}

class PrimeImplicant extends ProductTerm {
  coversArray = [];

  constructor(var1) {
    super(var1.getValue(), var1.getMask(), var1.getVariableNames());
  }

  addCover(var1) {
    if (!var1.isMinterm()) {
      throw "Attempt to add " + var1.toString() + " to the list of minterms covered by prime implicant " + super.toString() + ", but " + var1.toString() + " is not a minterm.";
    } else if (!this.covers(var1)) {
      throw "Attempt to add " + var1.toString() + " to the list of minterms covered by prime implicant " + super.toString() + ", but " + var1.toString() + " is not covered by " + super.toString();
    } else {
      this.coversArray.push(var1);
    }
  }

  getCount() {
    return this.coversArray.length;
  }

  compareTo(var1) {
    return var1.coversArray.length - this.coversArray.length;
  }

  toString() {
    var var1 = "[ " + super.toString() + ": ";

    for (var var2 = 0; var2 < this.coversArray.length; ++var2) {
      var1 += this.coversArray.elementAt(var2);
      if (var2 < this.coversArray.length - 1) {
        var1 += ", ";
      }
    }

    var1 += " ]";
    return var1;
  }
}

class TruthTable {
  LP = '(';
  RP = ')';
  AND = '*';
  OR = '+';
  XOR = '^';
  NOT = '\'';
  ZERO = '0';
  ONE = '1';
  numVars = 0;
  numRows = 0;
  numMinterms = 0;
  variableNames = null;
  namesReversed;
  normalized = "Not Given";
  theTable = null;
  mintermMask;
  minterms = null;

  constructor(var1) {
    this.numMinterms = var1.length;
    if (this.numMinterms === 0) {
      this.numVars = 0;
      this.numRows = 0;
      this.variableNames = [];
      this.namesReversed = this.variableNames;
      this.normalized = "";
      this.theTable = [];
      this.mintermMask = 0;
      this.minterms = [];
    } else {
      var1.sort((a, b) => a - b);
      var var2 = var1[this.numMinterms - 1];
      if (var2 < 0) {
        var2 = 0;
      }

      var var3 = this.leftBit(var2);
      if (var3 < 0) {
        var3 = 0;
      }

      this.numRows = Math.pow(2, var3 + 1);
      this.mintermMask = this.numRows - 1;
      this.numVars = Math.ceil(Math.log(this.numRows) / Math.log(2));
      this.variableNames = Array(this.numVars);

      var var4;
      for (var4 = 0; var4 < this.numVars; ++var4) {
        this.variableNames[var4] = String.fromCharCode(65 + var4);
      }

      this.namesReversed = Array(this.numVars);

      for (var4 = 0; var4 < this.numVars; ++var4) {
        this.namesReversed[var4] = this.variableNames[this.numVars - var4 - 1];
      }

      this.theTable = Array(this.numRows).fill(false);
      this.minterms = Array(this.numMinterms);

      for (var4 = 0; var4 < this.numMinterms; ++var4) {
        this.theTable[var1[var4]] = true;
        this.minterms[var4] = new ProductTerm(this.reverseBits(var1[var4], this.numVars), this.mintermMask, this.variableNames);
      }
    }
  }

  getNumVars() {
    return this.numVars;
  }

  getNumRows() {
    return this.numRows;
  }

  getNumMinterms() {
    return this.numMinterms;
  }

  getVars() {
    return this.variableNames.slice();
  }

  expString() {
    return this.normalized;
  }

  getTruthValues() {
    return this.theTable;
  }

  getMinterms() {
    return this.minterms;
  }

  leftBit(var0) {
    for (var var1 = 31; var1 >= 0; --var1) {
      if ((var0 & 1 << var1) !== 0) {
        return var1;
      }
    }

    return -1;
  }

  reverseBits(var0, var1) {
    var var2 = 1 << var1 - 1;
    var var3 = 1;
    var var4 = var0 & ~(Math.pow(2, var1) - 1);

    for (var var5 = 0; var5 < var1; ++var5) {
      if ((var0 & var2) !== 0) {
        var4 |= var3;
      }

      var2 >>= 1;
      var3 <<= 1;
    }

    return var4;
  }

  sopString() {
    var var1 = "";

    for (var var2 = 0; var2 < this.numMinterms; ++var2) {
      var1 += this.minterms[var2].toString();
      if (var2 < this.numMinterms - 1) {
        var1 += " + ";
      }
    }

    return var1;
  }

  toString() {
    var1 = "[";

    for (var var2 = 0; var2 < this.minterms.length; ++var2) {
      var1 += this.reverseBits(this.minterms[var2].value, this.numVars) + ",";
    }

    if (this.minterms.length === 0) {
      var1 += ']';
    } else {
      var1 = var1.substring(0, var1.length - 1) + ']';
    }

    return var1;
  }
}

class Minimize extends TruthTable {
  numLevels;
  levelTerms;
  primeImplicants;
  minimum;
  timesCovered;
  findAll;

  constructor(var1) {
    super(var1);
    this.numLevels = super.numVars + 1;
    this.levelTerms = Array(this.numLevels);
    this.findAll = true;
    this.initialize();
  }

  initialize() {
    this.levelTerms[0] = [];

    for (var var1 = 0; var1 < super.numMinterms; ++var1) {
      this.levelTerms[0].push(super.minterms[var1]);
    }

    var var13 = null;
    var var2 = null;
    var var3 = null;
    var var4 = 0;
    if (super.numVars > 0) {
      label126: for (var4 = 1; var4 < this.numLevels; ++var4) {
        var var5 = 0;
        this.levelTerms[var4] = [];
        var var6 = this.levelTerms[var4 - 1].slice().reverse();

        label123: while (var6.length) {
          var var13 = var6.pop();
          var var7 = false;
          var var8 = this.levelTerms[var4 - 1].slice().reverse();

          while (true) {
            do {
              if (!var8.length) {
                if (!var7) {
                  this.levelTerms[var4].push(var13);
                  console.log("Unable to reduce " + var13.toString() + " in pass " + var4.toString());
                }
                continue label123;
              }

              var2 = var8.pop();
              var3 = var2.reduces(var13);
            } while (var3 === null);

            ++var5;
            console.log("(" + var2.toString() + " + " + var13.toString() + ") can be replaced with " + var3.toString() + " in pass " + var4.toString() + ": ");
            var var9 = false;
            var var10 = this.levelTerms[var4].slice().reverse();

            while (var10.length) {
              if (var3.equals(var10.pop())) {
                console.log("Not done. (Already included.)");
                var9 = true;
                break;
              }
            }

            if (!var9) {
              console.log("Done.");
              this.levelTerms[var4].push(var3);
              if (ProductTerm.identity.equals(var3)) {
                console.log("Expression reduces to identity.");
                break label126;
              }
            }

            var7 = true;
          }
        }

        if (var5 === 0) {
          break;
        }
      }
    }

    this.primeImplicants = [];
    var var14 = this.levelTerms[var4].slice().reverse();

    while (var14.length) {
      this.primeImplicants.push(new PrimeImplicant(var14.pop()));
    }

    var var15 = Array(super.numMinterms);

    for (var var16 = 0; var16 < super.numMinterms; ++var16) {
      var var18 = this.levelTerms[0][var16];
      var var20 = this.primeImplicants.slice().reverse();

      while (var20.length) {
        var var22 = var20.pop();
        if (var22.covers(var18)) {
          var18.incrementCoverCount();
          var22.addCover(var18);
        }
      }

      if (var18.getCoverCount() === 0) {
        throw "Minterm " + this.reverseBits(var18.value, super.numVars) + " is not covered by any prime implicants.";
      }

      console.log("Minterm " + this.reverseBits(var18.value, super.numVars) + " is covered by " + var18.getCoverCount() + " prime implicant" + (var18.getCoverCount() !== 1 ? "s." : "."));
    }

    this.primeImplicants.sort((p1, p2 => p1.compareTo(p2)));
    var var17 = this.levelTerms[0].slice();
    var17.sort((p1, p2) => p1.compareTo(p2));
    var var19 = this.primeImplicants.slice();
    this.minimum = [];

    while (var17.length > 0) {
      var var21 = var17[0];

      for (var var23 = 0; var23 < var19.length; ++var23) {
        var var11 = var19[var23];
        if (var11.covers(var21)) {
          this.minimum.push(var11);
          var14 = var11.covers.slice().reverse();

          while (var14.length) {
            var var12 = var14.pop();
            var17 = var17.filter(el => !el.equals(var12));
          }

          var19 = var19.filter(el => !el.equals(var11));
        }
      }
    }
  }

  priString() {
    if (this.primeImplicants.length === 0) {
      return "none";
    } else {
      var var1 = "";

      for (var var2 = 0; var2 < this.primeImplicants.length; ++var2) {
        var1 += this.primeImplicants.elementAt(var2).toString();
        if (var2 < this.primeImplicants.length - 1) {
          var1 += ", ";
        }
      }

      return new String(var1);
    }
  }

  toString() {
    if (this.minimum.length === 0) {
      return "0";
    } else {
      var var1 = "";

      for (var var2 = 0; var2 < this.minimum.length; ++var2) {
        var var3 = this.minimum[var2];
        var1 += var3.ptString();
        if (var2 < this.minimum.length - 1) {
          var1 += " + ";
        }
      }

      return new String(var1);
    }
  }
}