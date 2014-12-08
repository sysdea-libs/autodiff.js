var AutoDiff = (function () {
  function instrument(arg) {
    if (typeof arg == 'function') {
      return Instrumenter.instrument_fn(arg);
    } else if (typeof arg == 'string') {
      return Instrumenter.instrument_str(arg);
    } else {
      return Instrumenter.instrument_ast(arg);
    }
  };

  function forward(diffed_fn, args) {
    var params = diffed_fn.params;

    var result_acc = {};

    args.forEach(function (arg, i) {
      result_acc[params[i]] = diffed_fn.apply(Dual, args.map(function (arg, j) {
        return new Dual(arg, i == j ? 1 : 0);
      })).b;
    });

    return result_acc;
  };

  function reverse(diffed_fn, args) {
    var params = diffed_fn.params;

    var result = diffed_fn.apply(Tape, args.map(function (arg, j) {
      return Tape.Variable(arg, params[j]);
    }));

    result_acc = {};
    result.opfn(result, 1, result_acc);
    return result_acc;
  };

  return {
    instrument: instrument,
    forward: forward,
    reverse: reverse
  };
}());
