

getColor = (function() {
  let counter = 0;
  return function() {
    let col = colors[counter % colors.length];
    counter += 1;
    return col;
  };
})();

function CelObj({radius, density,
                 velocityMagnitude=null, distanceFromSun=null,
                 color=null, angle=null, name=null, isStar=false}) {
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
  this.isStar = isStar;
  
  let T = (angle == null) ? (Math.random() * 2 * Math.PI) : angle;

  if (distanceFromSun == null) {
    this.position = zero3;
  }
  else {
    let D = distanceFromSun;
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
    let scale = -G * other.mass / square(this.dist(other));
    return this.position.sub(other.position).normalized().scale(scale);
  };

  this.dist = function(other) {
    return this.position.dist(other.position);
  };

  this.project = function() {
    let norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    let cameraPosition = norm.scale(-FD);
    let inline = norm.scale(this.position.dot(norm));
    this.perspectiveScale = FD/(FD+inline.dot(norm));

    var c = this.position.sub(cameraPosition); // vector from camera to object
    let fromCam = c.dot(norm);
    this.planar = cameraPosition.plus(c.scale(FD/fromCam));
  };

  this.occlusion = function(other) {
    let norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    let diff = other.position.sub(this.position);
    let inlineCoeff = norm.dot(diff);

    // check to make sure that other is in front of this
    if (inlineCoeff < 0) {
      let inline = norm.scale(inlineCoeff);
      let d = diff.sub(inline).length;
      let intersection = circleOverlap(this.radius, other.radius, d);
      return intersection/(sq(this.radius)*PI);
    }
    else {
      return 0;
    }
  };

  this.draw = function(visualScale) {
    if (showTrails && !isStar) {
      this.drawTrail();
    }

    fill(this.color);

    if (!DRAW_PERSPECTIVE) {
      this.planar = this.position;
    }

    // TODO(izzy): this should be replaced by a visual cone.
    // right now the effective field of view is 180 degrees which gives strange effects
    if (DRAW_PERSPECTIVE && this.perspectiveScale < 0) { return; } // don't draw planets behind the camera

    visualScale = this.isStar ? starVisualScale : planetVisualScale;

    ellipse(this.planar.x / SF, this.planar.y / SF, this.radius * this.perspectiveScale / SF * visualScale);
    if (this.name != null && showLabels && !this.isStar) {
      fill(255);
      text(this.name, this.planar.x / SF + 15, this.planar.y / SF + 15);
    }
  };

  this.drawTrail = function() {
    let lastPos = this.last100.toArray();
    for (let i = 0; i < lastPos.length; i++) {
        let lp = lastPos[i];
        let col = 200 - i*2;
        fill(col);
        let planetRadius = this.radius / SF * planetVisualScale;
        ellipse(lp.x / SF, lp.y / SF, planetRadius * (127 - i) / 200);
    }
  };

  this.setDensity = function(newDensity) {
    this.density = newDensity;
    this.updateMassAndVolume();
  };

  this.setRadius = function(newRadius) {
    this.radius = newRadius;
    this.updateMassAndVolume();
  };


  this.update = function(force, DT) {
    let len = this.last100.insertFront(this.position);
    if (len > 127) {
      this.last100.pop();
    }

    let dv = force.scale(DT);
    this.velocity = this.velocity.plus(dv);
    let dx = this.velocity.scale(DT);
    this.position = this.position.plus(dx);
  };

  this.updatePosition = function(mx, my) {
    this.position = new Vector3((mx - w/2) * SF, (my - h/2) * SF, 0);
  };

  this.momentum = function() {
    return this.velocity.scale(this.mass);
  };

  this.pointIn = function(mouseX, mouseY) {
    let x = this.planar.x / SF;
    let y = this.planar.y / SF;
    let visualScale = this.isStar ? starVisualScale : planetVisualScale;
    let r = this.radius * this.perspectiveScale / SF * visualScale;
    return (square(mouseX - w/2 - x) + square(mouseY - h/2 - y)) < 1.3*square(r);
  };

  this.setOnOrbit = function(star) {
    let velMag = Math.sqrt(G * star.mass / this.position.dist(star.position));
    let angleAt = Math.atan2(this.position.y, this.position.x);

    this.velocity = new Vector3(-Math.sin(angleAt) * velMag, Math.cos(angleAt) * velMag, 0);
  };

  this.updateMassAndVolume();

}