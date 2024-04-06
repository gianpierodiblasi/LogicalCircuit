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

    for (var var2 = 0; var2 < this.coversArray.size(); ++var2) {
      var1 += this.coversArray.elementAt(var2);
      if (var2 < this.coversArray.length - 1) {
        var1 += ", ";
      }
    }

    var1 += " ]";
    return var1;
  }
}

