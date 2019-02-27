function CelObj({radius, density,
                 // position=null, initVelocity=null,
                 velocityMagnitude=null, distanceFromSun=null,
                 color=null, angle=null, name=null}) {
  if (color == null) {
    c = colors[counter % colors.length];
    this.color = c;
    counter += 1;
  }
  else {
    this.color = color;
  }

  this.radius = radius;
  this.density = density;
  this.name = name;
  T = (angle == null) ? (Math.random() * 2 * Math.PI) : angle;

  if (distanceFromSun == null) {
    this.position = zero3;
  }
  else {
    D = distanceFromSun;
    this.position = new Vector3(D*Math.cos(T), D*Math.sin(T), 0);
  }

  if (velocityMagnitude == null) {
    this.velocity = zero3;
  }
  else {
    console.log(T);
    this.velocity = new Vector3(-velocityMagnitude * Math.sin(T),
                                velocityMagnitude  * Math.cos(T),
                                0);
  }
  console.log(this.velocity);
  console.log(this.position);

  this.updateMassAndVolume = function() {
    this.volume = 4/3 * Math.PI * Math.pow(this.radius, 3);
    this.mass = this.volume * this.density;
  };

  this.force = function(other) {
    scale = -G * other.mass / square(this.dist(other));
    f = this.position.sub(other.position).normalized().scale(scale);
    return f;
  };

  this.dist = function(other) {
    return this.position.dist(other.position);
  };

  this.draw = function(minRadius) {
    fill(this.color);

    var norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    var inline = norm.scale(this.position.dot(norm));
    var planar =  this.position.sub(inline);
    var perspectiveScale = FD/(FD+inline.dot(norm));

    ellipse(planar.x / SF, planar.y / SF, this.radius * perspectiveScale / SF * planetVisualScale);
    if (this.name != null) {
      fill(255);
      text(this.name, this.position.x / SF + 15, this.position.y / SF + 15);
    }
  };


  this.starDraw = function() {
    fill(this.color);
    ellipse(this.position.x / SF, this.position.y / SF, this.radius / SF * starVisualScale);
  };

  this.setDensity = function(newDensity) {
    this.density = newDensity;
    this.updateMassAndVolume();
  };

  this.setRadius = function(newRadius) {
    this.radius = radius;
    this.updateMassAndVolume();
  };

  this.update = function(force, DT) {
    dv = force.scale(DT);
    this.velocity = this.velocity.plus(dv);
    dx = this.velocity.scale(DT);
    this.position = this.position.plus(dx);
  };

  this.momentum = function() {
    return this.velocity.scale(this.mass);
  };

  this.updateMassAndVolume();

}