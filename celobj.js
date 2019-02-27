var DRAW_PERSPECTIVE = true;

function CelObj({radius, density, color=null,
                 position=null, initVelocity=null, name=null}) {
  if (color == null) {
    this.color = colors[counter % colors.length];
    counter += 1;
  }
  else {
    this.color = color;
  }

  this.perspectiveScale = 1;

  this.radius = radius;
  this.density = density;
  this.name = name;

  if (position == null) {
    this.position = zero3;
  } else {
    this.position = position;
  }

  if (initVelocity == null) {
    this.velocity = zero3;
  }
  else {
    this.velocity = initVelocity;
  }

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

  this.project = function() {
    var norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    var inline = norm.scale(this.position.dot(norm));
    this.planar = this.position.sub(inline);
    this.perspectiveScale = FD/(FD+inline.dot(norm));
  };

  this.draw = function(minRadius) {
    fill(this.color);

    if (!DRAW_PERSPECTIVE) {
      this.planar = this.position;
    }

    ellipse(this.planar.x / SF, this.planar.y / SF, this.radius * this.perspectiveScale / SF * planetVisualScale);
    if (this.name != null) {
      fill(255);
      text(this.name, this.planar.x / SF + 15, this.planar.y / SF + 15);
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