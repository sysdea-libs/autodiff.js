function test (fn, args, delta) {
  var diffed_fn = AutoDiff.instrument(fn);
  var params = diffed_fn.params;

  delta = delta || 1;

  LOG('##########################')
  LOG(fn);
  LOG(diffed_fn);

  LOG(fn.name + "(" + args.join(", ") + ") => " + JSON.stringify(fn.apply(null, args)));

  var forward_res = AutoDiff.forward(diffed_fn, args);

  var i = 0;
  for (var k in forward_res) {
    LOG("∂/∂" + k + " " + fn.name + "(" + args.map(function (a, j) {
      if (j == i) {
        return "{" + params[j] + "=" + a + "}";
      } else {
        return a;
      }
    }).join(", ") + ") => " + forward_res[k]);
    ++i;
  }

  LOG('');

  var reverse_res = AutoDiff.reverse(diffed_fn, args);

  bench(fn, args);

  LOG('');
}

function xcubed (x) {
  return Math.pow(x, 3);
}
function exp (n) {
  return Math.pow(Math.E, n);
}
function xtoy (x, y) {
  return Math.pow(x, y);
}
function negx (x) {
  return -Math.sqrt(x);
}
function xtimesy (x, y) {
  return Math.pow(x, 2) * y;
}
function xymul (x, y) {
  return x*2 + y*3;
}
function xdif(x) {
  return (x+1)/(x-1);
}
function wikifn(x,y) {
  return x*y + Math.sin(x);
}
function xty (x, y) {
  x *= y*3;
  return x;
}
function tan(x) {
  return Math.tan(x);
}
function messy(x, y, z, w, t) {
  return Math.pow(x, z) + Math.pow(y, x - w) + t/y;
}

test(xcubed, [4]);
test(xtoy, [2,3]);
test(xtimesy, [3, 4]);
test(xymul, [10, 15]);
test(xdif, [3]);
test(negx, [3]);
test(wikifn, [0, 1]);
test(exp, [3]);
test(xty, [2,3]);
test(tan, [5.6]);
test(messy, [0.5, 0.9, 0.3, 0.8, 1.5])

var neq = function (a, b) {
  return a.toPrecision(8) != b.toPrecision(8);
};

// function verify(f, wrt) {
//   var diffed_fn = AutoDiff.instrument(f);

//   var ks = [];

//   for (var k in wrt) {
//     ks.push(k);
//   };

//   var start = +new Date();

//   for (var i = 0; i < 5000; ++i) {
//     var args = ks.map(function () {
//       return Math.random();
//     });
//     var f_res = AutoDiff.forward(diffed_fn, args);
//     var r_res = AutoDiff.reverse(diffed_fn, args);
//     var t_res = {};
//     ks.map(function (k) {
//       t_res[k] = wrt[k].apply(null, args);
//     })
//     ks.map(function (k) {
//       if (neq(f_res[k], t_res[k]) || neq(r_res[k], t_res[k])) {
//         console.log("mismatch!", f_res, r_res, t_res);
//       }
//     })
//   }

//   console.log("Verified " + f.name + " in " + (+new Date - start) + "ms");
// }

function bench(fn, n_args) {
  var start = +new Date();
  for (var i = 0; i < 100; ++i) {
    var diffed_fn = AutoDiff.instrument(fn)
  }
  var end = +new Date();
  LOG("Instrumented: " + (end-start)/100 + "ms");

  var start = +new Date();
  for (var i = 0; i < 1000; ++i) {
    AutoDiff.forward(diffed_fn, n_args.map(function (n) {
      return Math.random() * n;
    }));
  }
  var end = +new Date();
  LOG("Forward: " + (end-start)/1000 + "ms");

  var start = +new Date();
  for (var i = 0; i < 1000; ++i) {
    AutoDiff.reverse(diffed_fn, n_args.map(function (n) {
      return Math.random() * n;
    }));
  }
  var end = +new Date();
  LOG("Reverse: " + (end-start)/1000 + "ms");
}

// verify(xcubed, {
//   x: function (x) { return 3 * Math.pow(x, 2); }
// });

// verify(exp, {
//   n: function (n) { return Math.exp(n); }
// });

// verify(messy, {
//   x: function (x, y) {
//     return 3 * Math.pow(x, 2) + Math.pow(y, x - 2) * Math.log(y) + 1/y;
//   },
//   y: function (x, y) {
//     return ((x - 2) * Math.pow(y, x) - x * y) / Math.pow(y, 3);
//   }
// });
