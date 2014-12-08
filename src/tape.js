var Tape = (function () {
  function Tape(a, left, op, right) {
    this.a = a;
    this.left = left || null;
    this.opfn = op || null;
    this.right = right || null;
  };

  function negop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, -delta, rs);
  };
  function sinop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, Math.cos(tape.left.a) * delta, rs);
  };
  function cosop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, -Math.sin(tape.left.a) * delta, rs);
  };
  function tanop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta / Math.pow(Math.cos(tape.left.a), 2), rs);
  };
  function asinop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta/Math.sqrt(1 - Math.pow(tape.left.a, 2)), rs);
  };
  function acosop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, -delta/Math.sqrt(1 - Math.pow(tape.left.a, 2)), rs);
  };
  function atanop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta/(1 + Math.pow(tape.left.a, 2)), rs);
  };
  function logop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta/tape.left.a, rs);
  };
  function expop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta * Math.exp(tape.left.a), rs);
  };
  function absop(tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta * (tape.left.a >= 0 ? 1 : -1), rs);
  };

  function addop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta, rs);
    if (tape.right.opfn)
      tape.right.opfn(tape.right, delta, rs);
  };
  function subop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta, rs);
    if (tape.right.opfn)
      tape.right.opfn(tape.right, -delta, rs);
  };
  function mulop (tape, delta, rs) {
    if (tape.left.opfn)
      tape.left.opfn(tape.left, tape.right.a * delta, rs);
    if (tape.right.opfn)
      tape.right.opfn(tape.right, tape.left.a * delta, rs);
  };
  function divop (tape, delta, rs) {
    var y = tape.right.a;
    if (tape.left.opfn)
      tape.left.opfn(tape.left, delta / y, rs);
    if (tape.right.opfn)
      tape.right.opfn(tape.right, -tape.left.a * delta / Math.pow(y, 2), rs);
  };
  function powop (tape, delta, rs) {
    var x = tape.left.a;
    var y = tape.right.a;
    if (tape.left.opfn)
      tape.left.opfn(tape.left, y * Math.pow(x, y - 1) * delta, rs);
    if (tape.right.opfn)
      tape.right.opfn(tape.right, Math.log(x) * Math.pow(x, y) * delta, rs);
  };

  function varop (tape, delta, rs) {
    if (!rs[tape.left]) {
      rs[tape.left] = delta;
    } else {
      rs[tape.left] += delta;
    }
  };
  
  Tape.Variable = function (v, name) {
    return new Tape(v, name, varop, null);
  }

  // Unaries
  Tape.prototype.neg = function () {
    if (!this.left) {
      this.a = -this.a;
      return this;
    }
    return new Tape(-this.a, this, negop, null);
  };

  // Comparisons
  Tape.prototype.gt = function (y) {
    return this.a > y.a;
  };
  Tape.prototype.gte = function (y) {
    return this.a >= y.a;
  };
  Tape.prototype.lt = function (y) {
    return this.a < y.a;
  };
  Tape.prototype.lte = function (y) {
    return this.a <= y.a;
  };
  Tape.prototype.eq = function (y) {
    return this.a == y.a;
  };

  // Arithmetic
  Tape.prototype.add = function (y) {
    if (!this.left && !y.left) {
      this.a = this.a + y.a;
      return this;
    }
    return new Tape(this.a + y.a, this, addop, y);
  };
  Tape.prototype.sub = function (y) {
    if (!this.left && !y.left) {
      this.a = this.a - y.a;
      return this;
    }
    return new Tape(this.a - y.a, this, subop, y);
  };
  Tape.prototype.mul = function (y) {
    if (!this.left && !y.left) {
      this.a = this.a * y.a;
      return this;
    }
    return new Tape(this.a * y.a, this, mulop, y);
  };
  Tape.prototype.div = function (y) {
    if (!this.left && !y.left) {
      this.a = this.a / y.a;
      return this;
    }
    return new Tape(this.a / y.a, this, divop, y);
  };
  Tape.prototype.pow = function (y) {
    if (!this.left && !y.left) {
      this.a = Math.pow(this.a, y.a);
      return this;
    }
    return new Tape(Math.pow(this.a, y.a), this, powop, y);
  };

  // Math Functions

  var op_map = {
    sin: sinop,
    cos: cosop,
    tan: tanop,
    asin: asinop,
    acos: acosop,
    atan: atanop,
    log: logop,
    exp: expop,
    abs: absop
  };

  ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'exp', 'abs'].forEach(function (f) {
    Tape.prototype[f] = function () {
      if (!this.left) {
        this.a = Math[f](this.a);
        return this;
      }
      return new Tape(Math[f](this.a), this, op_map[f], null);
    };
  });

  Tape.prototype.max = function () {
    var args = Array.prototype.slice.call(arguments);

    var ret = this;
    for (var i = 0; i < args.length; ++i) {
      if (args[i].a > ret.a) {
        ret = args[i];
      }
    }
    return ret;
  };
  Tape.prototype.min = function () {
    var args = Array.prototype.slice.call(arguments);

    var ret = this;
    for (var i = 0; i < args.length; ++i) {
      if (args[i].a < ret.a) {
        ret = args[i];
      }
    }
    return ret;
  };

  // Cache some Constants
  Tape.PI = new Tape(Math.PI);
  Tape.E = new Tape(Math.E);
  Tape.LOG2E = new Tape(Math.LOG2E);
  Tape.LN2 = new Tape(Math.LN2);
  Tape.LN10 = new Tape(Math.LN10);
  Tape.LOG10E = new Tape(Math.LOG10E);
  Tape.SQRT2 = new Tape(Math.SQRT2);
  Tape.SQRT1_2 = new Tape(Math.SQRT1_2);

  return Tape;
}());
