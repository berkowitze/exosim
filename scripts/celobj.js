var DRAW_PERSPECTIVE = true;

getColor = (function() {
  var counter = 0;
  return function() {
    col = colors[counter % colors.length];
    counter += 1;
    return col;
  };
})();

function CelObj({radius, density,
                 velocityMagnitude=null, distanceFromSun=null,
                 color=null, angle=null, name=null}) {
  if (color == null) {
    this.color = getColor();
  }
  else {
    this.color = color;
  }

  this.radius = radius;
  this.density = density;
  this.name = name;
  this.last100 = new Deque(100);

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
    this.velocity = new Vector3(-velocityMagnitude * Math.sin(T),
                                velocityMagnitude  * Math.cos(T),
                                0);
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
    if (showStreaks) {
      this.drawStreak();
    }
    fill(this.color);

    if (!DRAW_PERSPECTIVE) {
      this.planar = this.position;
    }

    ellipse(this.planar.x / SF, this.planar.y / SF, this.radius * this.perspectiveScale / SF * planetVisualScale);
    if (this.name != null && showLabels) {
      fill(255);
      text(this.name, this.planar.x / SF + 15, this.planar.y / SF + 15);
    }
  };

  this.drawStreak = function() {
    lastPos = this.last100.toArray();
    for (var i = 0; i < lastPos.length; i++) {
        var lp = lastPos[i];
        var col = 200 - i*2;
        fill(col);
        ellipse(lp.x / SF, lp.y / SF, this.radius / SF * planetVisualScale / 1.3);
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
    len =  this.last100.insertFront(this.position);
    if (len > 127) {
      this.last100.pop();
    }

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