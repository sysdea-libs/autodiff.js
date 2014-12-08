# AutoDiff.js

Proof-of-concept forward and reverse mode autodifferentiation using operator rewriting. Currently requires functions to be pure, with only external calls to the Math library functions.

```javascript
function xcubed(x) {
  return Math.pow(x, 3);
}
var dxcubed = AutoDiff.instrument(xcubed);

xcubed(4); // => 64
AutoDiff.forward(dxcubed, [4]); // {x: 48}

function messy(x, y, z, w, t) {
  return Math.pow(x, z) + Math.pow(y, x - w) + t/y;
}
var dmessy = AutoDiff.instrument(messy);

messy(0.5, 0.9, 0.3, 0.8, 1.5); // => 3.5110320604510923

AutoDiff.reverse(dmessy, [0.5, 0.9, 0.3, 0.8, 1.5]);
  /* => { x: 0.3786074801875624,
          y: -2.1958895176612483,
          z: -0.5630104584373838,
          w: 0.10874395762617882,
          t: 1.1111111111111112 } */
```

`forward` and `reverse` have the same API.
