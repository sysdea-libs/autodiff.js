var Dual = (function () {

  // First order Dual
  function Dual(a, b) {
    this.a = a;
    this.b = b || 0;
  }

  // Unaries 
  Dual.prototype.neg = function () {
    return new Dual(-this.a, -this.b);
  };

  // Comparisons
  Dual.prototype.gt = function (y) {
    return this.a > y.a;
  };
  Dual.prototype.gte = function (y) {
    return this.a >= y.a;
  };
  Dual.prototype.lt = function (y) {
    return this.a < y.a;
  };
  Dual.prototype.lte = function (y) {
    return this.a <= y.a;
  };
  Dual.prototype.eq = function (y) {
    return this.a == y.a;
  };

  // Arithmetic
  Dual.prototype.add = function(y) {
    return new Dual(this.a + y.a, this.b + y.b);
  };
  Dual.prototype.sub = function(y) {
    return new Dual(this.a - y.a, this.b - y.b);
  };
  Dual.prototype.mul = function(y) {
    return new Dual(this.a * y.a, this.a * y.b + y.a * this.b);
  };
  Dual.prototype.div = function(y) {
    return new Dual(this.a / y.a, (y.a * this.b - this.a * y.b) / (y.a * y.a));
  };
  Dual.prototype.pow = function (p) {
    if (p.b == 0) {
      return new Dual(Math.pow(this.a, p.a), this.b * p.a * Math.pow(this.a, p.a - 1));
    }
    if (this.b == 0) {
      return new Dual(Math.pow(this.a, p.a), p.b * Math.pow(this.a, p.a) * Math.log(this.a));
    }
    throw "Cannot have both number and exponent as non-constant"
  };

  // Math Functions
  Dual.prototype.sin = function () {
    return new Dual(Math.sin(this.a), this.b * Math.cos(this.a));
  };
  Dual.prototype.cos = function () {
    return new Dual(Math.cos(this.a), -this.b * Math.sin(this.a));
  };
  Dual.prototype.tan = function () {
    return new Dual(Math.tan(this.a), this.b / (Math.cos(this.a) * Math.cos(this.a)));
  };
  Dual.prototype.asin = function () {
    return new Dual(Math.asin(this.a), this.b / Math.sqrt(1 - this.a * this.a));
  };
  Dual.prototype.acos = function () {
    return new Dual(Math.acos(this.a), -this.b / Math.sqrt(1 - this.a * this.a));
  };
  Dual.prototype.atan = function () {
    return new Dual(Math.atan(this.a), this.b / (1 + this.a * this.a));
  };
  Dual.prototype.log = function () {
    return new Dual(Math.log(this.a), this.b / this.a);
  };
  Dual.prototype.exp = function () {
    return new Dual(Math.exp(this.a), this.b * Math.exp(this.a));
  };
  Dual.prototype.abs = function () {
    var b;
    if (this.a > 0) {
      b = 1;
    } else if (this.a < 0) {
      b = -1;
    } else {
      b = NaN;
    }
    return new Dual(Math.abs(this.a), this.b * b);
  };
  Dual.prototype.max = function () {
    var args = Array.prototype.slice.call(arguments);

    var ret = this;
    for (var i = 0; i < args.length; ++i) {
      if (args[i].a > ret.a) {
        ret = args[i];
      }
    }
    return ret;
  };
  Dual.prototype.min = function () {
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
  Dual.PI = new Dual(Math.PI);
  Dual.E = new Dual(Math.E);
  Dual.LOG2E = new Dual(Math.LOG2E);
  Dual.LN2 = new Dual(Math.LN2);
  Dual.LN10 = new Dual(Math.LN10);
  Dual.LOG10E = new Dual(Math.LOG10E);
  Dual.SQRT2 = new Dual(Math.SQRT2);
  Dual.SQRT1_2 = new Dual(Math.SQRT1_2);

  return Dual;
}());