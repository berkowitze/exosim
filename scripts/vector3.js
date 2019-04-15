square = x => x*x;

class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.length = Math.sqrt(square(x) + square(y) + square(z));
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  dist(other) {
    return Math.sqrt(square(this.x - other.x) + 
                     square(this.y - other.y) +
                     square(this.z - other.z));
  }

  plus(other) {
    return new Vector3(this.x + other.x,
                       this.y + other.y,
                       this.z + other.z);
  }

  sub(other) {
    return new Vector3(this.x - other.x,
                       this.y - other.y,
                       this.z - other.z);
  }

  mul(other) {
    return new Vector3(this.x * other.x,
                       this.y * other.y,
                       this.z * other.z);
  }

  scale(scale) {
    return new Vector3(scale * this.x,
                       scale * this.y,
                       scale * this.z);
  }

  normalized() {
    return new Vector3(this.x / this.length,
                       this.y / this.length,
                       this.z / this.length);
  }

  plusEq(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
  }

  subEq(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
  }
}