exp10 = n => Math.pow(10,n);
sign = x => Math.sign(x);
sin = x => Math.sin(x);
cos = x => Math.cos(x);
Array.prototype.min = function() {
  return this.reduce((x, y) => Math.min(x, y), Infinity);
};
Array.prototype.max = function() {
  return this.reduce((x, y) => Math.max(x, y), -Infinity);
};

function scaleToRange(num, in_min, in_max, out_min, out_max) {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
