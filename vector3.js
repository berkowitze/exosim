function Vector3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.length = Math.sqrt(square(x) + square(y) + square(z));

  this.dot = function(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  };

  this.dist = function(other) {
    return Math.sqrt(square(this.x - other.x) + 
                     square(this.y - other.y) +
                     square(this.z - other.z));
  };

  this.plus = function(other) {
    return new Vector3(this.x + other.x,
                       this.y + other.y,
                       this.z + other.z);
  };

  this.sub = function(other) {
    return new Vector3(this.x - other.x,
                       this.y - other.y,
                       this.z - other.z);
  };

  this.scale = function(scale) {
    return new Vector3(scale * this.x,
                       scale * this.y,
                       scale * this.z);
  };

  this.normalized = function() {
    return new Vector3(this.x / this.length,
                       this.y / this.length,
                       this.z / this.length);
  };
}