var Instrumenter = (function () {

  var bin_map = {
    '+': 'add',
    '-': 'sub',
    '*': 'mul',
    '/': 'div',
    '<': 'lt',
    '<=': 'lte',
    '>': 'gt',
    '>=': 'gte',
    '==': 'eq',
    '===': 'eq'
  };

  var unary_map = {
    '-': 'neg'
  };

  var assign_rewrite = {
    '+=': '+',
    '-=': '-',
    '*=': '*',
    '/=': '/'
  };

  function call_member (o, name, args) {
    return {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: o,
        property: {
          type: "Identifier",
          name: name
        }
      },
      arguments: args
    }
  }

  function binary_assignment (left, op, right) {
    return {
      type: 'AssignmentExpression',
      operator: '=',
      left: left,
      right: {
        type: 'BinaryExpression',
        left: left,
        right: right,
        operator: op
      }
    }
  };

  var Instrumenter = {};

  Instrumenter._instrument_ast = function (ast) {
    estraverse.replace(ast, {
      enter: function (node, parent) {
        // Rewrite x + y to x.add(y)
        if (node.type == 'BinaryExpression') {
          return call_member(node.left, bin_map[node.operator], [node.right]);
        }

        // Canonicalise ++x to x = x + 1
        // No support for x++, yet
        if (node.type == 'UpdateExpression') {
          if (node.prefix == true) {
            if (node.operator == '++') {
              return binary_assignment(node.argument, '+', { type: 'Literal', value: 1 });
            } else if (node.operator == '--') {
              return binary_assignment(node.argument, '-', { type: 'Literal', value: 1 });
            }
          }
          throw "Only prefix ++/-- are allowed."
        }

        // Rewrite -x to x.neg()
        if (node.type == 'UnaryExpression') {
          return call_member(node.argument, unary_map[node.operator], []);
        }

        // Rewrite Math.pow(x, y) to x.pow(y)
        // Canonicalise Math.sqrt(x) to x.pow(0.5)
        if (node.type == 'CallExpression' && node.callee.type == 'MemberExpression' && node.callee.object.name == 'Math') {
          node.callee.object = node.arguments[0];
          if (node.callee.property.name == 'sqrt') {
            node.callee.property.name = 'pow';
            node.arguments = [{ type: 'Literal', value: 0.5 }];
          } else {
            node.arguments.splice(0, 1);
          }
          return node;
        }

        // Rewrite Math.<x> to this.<x>
        if (node.type == 'MemberExpression' && node.object.name == "Math") {
          this.skip();
          node.object.name = "this";
          return node;
        }

        // Rewrite compound assignments to simple assignments (x +=3 to x = x + 3)
        if (node.type == 'AssignmentExpression') {
          if (assign_rewrite[node.operator]) {
            return binary_assignment(node.left, assign_rewrite[node.operator], node.right);
          } else {
            throw "Unrecognised assignment operator: " + node.operator;
          }
        }

        // Rewrite 5 to this(5)
        if (node.type == 'Literal') {
          this.skip();
          return {
            type: "NewExpression",
            callee: { type: "ThisExpression" },
            arguments: [node]
          }
        }
      }
    });
    return ast;
  };

  Instrumenter._instrument = function (parsed) {
    var diffed = Instrumenter._instrument_ast(parsed);
    var fn_decl = diffed.body[0];
    var params = fn_decl.params.map(function(p) { return p.name });

    var body = escodegen.generate({type: "Program", body: fn_decl.body.body});

    var nfn = new Function(params, body);

    nfn.params = params;
    nfn.body = body;

    return nfn;
  };

  Instrumenter.instrument_fn = function (fn) {
    return this._instrument(esprima.parse(fn.toString()));
  };

  Instrumenter.instrument_str = function (str) {
    return this._instrument(esprima.parse(str));
  };

  Instrumenter.instrument_ast = function (ast) {
    return this._instrument(ast);
  }

  return Instrumenter;
}());
