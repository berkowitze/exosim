getColor = (function() {
  let counter = 0;
  return function() {
    let col = colors[counter % colors.length];
    counter += 1;
    return col;
  };
})();

cube = x => x*x*x;

class CelObj {
  constructor({radius, density, velocity, position,
               color=null, name=null}) {
    if (color == null) {
      this.color = getColor();
    }
    else {
      this.color = color;
    }

    this.radius = radius;
    this.density = density;
    this.volume = 4/3 * Math.PI * cube(this.radius);
    this.mass = this.volume * this.density;

    this.position = position;
    this.velocity = velocity;

    this.name = name;

    this.project();
  }

  force(other) {
    let scale = -G * other.mass / square(this.dist(other));
    return this.position.sub(other.position).normalized().scale(scale);
  }

  dist(other) {
    return this.position.dist(other.position);
  }

  momentum() {
    return this.velocity.scale(this.mass);
  }

  project() {
    let norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    let cameraPosition = norm.scale(-FD);
    let inline = norm.scale(this.position.dot(norm));
    this.perspectiveScale = FD/(FD+inline.dot(norm));

    var c = this.position.sub(cameraPosition); // vector from camera to object
    let fromCam = c.dot(norm);
    this.planar = cameraPosition.plus(c.scale(FD/fromCam));
  }

  occlusion(other) {
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
  }

  draw() {
    if (!DRAW_PERSPECTIVE) {
      this.planar = this.position;
    }

    // TODO(izzy): this should be replaced by a visual cone.
    // right now the effective field of view is 180 degrees which gives strange effects
    if (DRAW_PERSPECTIVE && this.perspectiveScale < 0) {
      return;  // don't draw planets behind the camera
    }

    fill(this.color);
    ellipse(this.planar.x / SF,
            this.planar.y / SF,
            this.radius * this.perspectiveScale / SF * this.scale);
    if (this.name != null && showLabels) {
      if (draggingNewObject && (this === draggingOnto || this.pointIn(mouseX, mouseY))) {
        fill('#3adde0');
      }
      else {
        fill(255);
      }
      text(this.name, this.planar.x / SF + 15, this.planar.y / SF + 15);
    }
  }

  update(force, DT) {
    let dv = force.scale(DT);
    let dx = this.velocity.scale(DT);
    this.velocity = this.velocity.plus(dv);
    this.position = this.position.plus(dx);
  }

  updatePosition(mx, my) { // what does this do/where is it used
    this.position = new Vector3((mx - w/2) * SF, (my - h/2) * SF, 0);
  }

  pointIn(x, y, tolerance=0) {
    let xP = this.planar.x / SF;
    let yP = this.planar.y / SF;
    let r = this.radius * this.perspectiveScale / SF * this.scale;
    console.log({x, y, tolerance, xP, yP, r});
    return (square(x - w/2 - xP) + square(y - h/2 - yP)) < square(r + tolerance);
  }


  setDensity(newDensity) {
    this.density = newDensity;
    this.updateMassAndVolume();
  }

  setRadius(newRadius) {
    this.radius = newRadius;
    this.updateMassAndVolume();
  }

}

class Orbiter extends CelObj {
  constructor({orbiting, distanceFromOrbiter, radius, density,
               angle=null, color=null, name=null}) {
    if (angle == null) {
      angle = Math.random() * 2*Math.PI;
    }
    let position = new Vector3(orbiting.position.x + Math.cos(angle)*distanceFromOrbiter,
                               orbiting.position.y + Math.sin(angle)*distanceFromOrbiter,
                               0);
    const velMag = Math.sqrt(G * orbiting.mass / position.dist(orbiting.position));
    let velocity = new Vector3(velMag * -Math.sin(angle),
                               velMag * Math.cos(angle),
                               0);
    super({
      radius: radius,
      density: density,
      velocity: velocity,
      position: position,
      color: color,
      name: name
    });
    this.trail = new Deque(128);
  }

  draw() {
    if (showTrails) {
      this.drawTrail();
    }
    super.draw();
  }

  drawTrail() {
    let lastPos = this.trail.toArray();
    for (let i = 0; i < lastPos.length; i++) {
        let lp = lastPos[i];
        let col = 200 - i*2;
        fill(col);
        let drawRadius = this.radius / SF * this.scale;
        ellipse(lp.x / SF, lp.y / SF, drawRadius * (127 - i) / 200);
    }
  }

  update(force, DT) {
    let len = this.trail.insertFront(this.position);
    if (len > 127) {
      this.trail.pop();
    }
    super.update(force, DT);
  }

  setOnOrbit(oribiting) {
    let velMag = Math.sqrt(G * orbiting.mass / this.position.dist(orbiting.position));
    let angleAt = Math.atan2(this.position.y, this.position.x);

    this.velocity = new Vector3(-Math.sin(angleAt) * velMag,
                                Math.cos(angleAt) * velMag,
                                0);
  }
}

class Planet extends Orbiter {
  constructor(args) {
    super(args);
    this.scale = planetVisualScale;
  }

  canBeOrbitedBy(t) {
    return t == "Moon";
  }
}

class Moon extends Orbiter {
  constructor(args) {
    super(args);
    this.scale = moonVisualScale;
  }

  canBeOrbitedBy(t) {
    return false;
  }
}

class Star extends CelObj {
  constructor({radius, density, velocity=null, position=null,
               color=null, name=null}) {
    if (position == null) {
      position = zero3;
    }
    if (velocity == null) {
      velocity = zero3;
    }
    super({radius, density, velocity, position,
           color, name});
    this.scale = starVisualScale;
  }

  canBeOrbitedBy(t) {
    return t == "Planet";
  }

}
