class PointObject {
  constructor(position) {
    this.position = position;
  }
}


class CelObj extends PointObject {
  /**
   * celestial object base class - you should not instantiate this
   * directly but rather use Planet, Star, or Moon
   * @param radius - radius of object
   * @param velocity - velocity of object (Vector3)
   * @param position - position of object (Vector3)
   * @param mass - mass of object
   * @param density - density of object
   * @param color - color of object (acceptable by p5.fill, null default)
   * @param name - name of object (null default)
   * must provide either mass or density
   */
  constructor({radius, velocity, position,
               mass=null, density=null,
               color=null, name=null}) {
    super(position);
    if ((density == null && mass == null) ||
        (density != null && mass != null)) {
      throw new Error('Must give either mass or density to CelObj');
    }
    if (density == null) {
      density = mass / (4.0/3.0 * Math.PI * cube(radius));
    }
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


    this.velocity = velocity;

    this.name = name;
  }

  force(other) {
    /**
     * force between this object and another CelObj
     * @type {number}
     */
    let forceMag = -G * other.mass / square(this.dist(other));
    let forceDir = this.position.sub(other.position).normalized();
    return forceDir.scale(forceMag);
  }

  dist(other) {
    /**
     * distance from this object to another CelObj
     */
    return this.position.dist(other.position);
  }

  momentum() {
    /**
     * this objects momentum (m * v)
     */
    return this.velocity.scale(this.mass);
  }

  project(origin) {
    /**
     * sets projection (perspectiveScale and planar) based on
     * position and ecliptic angle
     * @type {Vector3}
     */
    let focalPlaneNorm = new Vector3(0, sin(ecliptic), -cos(ecliptic)); // points toward the camera
    let cameraDirection = focalPlaneNorm.scale(-1); // points in the direction the camera is looking
    let cameraPosition = focalPlaneNorm.scale(FD); // global position of the camera
    let relativePosition = this.position.sub(origin);

    let cameraToObject = relativePosition.sub(cameraPosition);
    let vecToFocalPlaneThroughObject = cameraToObject.scale(FD/cameraToObject.dot(cameraDirection));
     // 3D coordinates in focal plane
    let planar3d = cameraPosition.plus(vecToFocalPlaneThroughObject);

    let planarPositiveYAxis = new Vector3(0, cos(ecliptic), sin(ecliptic));
    let ySign = sign(planarPositiveYAxis.dot(relativePosition));

    // find how far back we've pushed the object onto the focal plane so we can rescale accordingly
    this.perspectiveScale = vecToFocalPlaneThroughObject.length/cameraToObject.length;
    // and take the 3D projected coordinates and convert them into 2D pixel coordinates in the focal plane
    this.planar = new Vector3(planar3d.x, sqrt(sq(planar3d.y) + sq(planar3d.z)) * ySign, 0);
  }

  occlusion(other) {
    /**
     * how much this object is occluded by another CelObj (circle intersection)
     * @type {Vector3}
     */
    const focalPlaneNorm = new Vector3(0, Math.sin(ecliptic), -Math.cos(ecliptic));
    const diff = other.position.sub(this.position);
    const inlineCoeff = focalPlaneNorm.dot(diff);

    // check to make sure that other is in front of this
    if (inlineCoeff >= 0) {
      const inline = focalPlaneNorm.scale(inlineCoeff);
      const d = diff.sub(inline).length;
      const intersection = circleOverlap(this.radius, other.radius, d);
      return intersection/(sq(this.radius)*PI);
    }
    else {
      return 0;
    }
  }

  draw() {
    /**
     * draw this CelObj
     */
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
            this.radius * this.perspectiveScale / SF * objectScale);
    if (this.name != null && showLabels) {
      if (draggingNewObject && (this === draggingOnto || this.pointIn(mouseX, mouseY))) {
        fill('#47b8e0');
      }
      else {
        fill(255);
      }
      const offset = 12;
      textAlign(CENTER, CENTER);
      text(this.name, this.planar.x / SF + offset, this.planar.y / SF + offset);
    }
  }

  update(force, DT) {
    /**
     * update this object given a force acting on it and a timestep
     * updates velocity and position
     */
    let dv = force.scale(DT);
    let dx = this.velocity.scale(DT);
    this.velocity = this.velocity.plus(dv);
    this.position = this.position.plus(dx);
  }

  updatePosition(mx, my) { // used to set position by mouse coordinate
    this.position = new Vector3((mx - w/2) * SF, (my - h/2) * SF, 0);
  }

  pointIn(x, y, tolerance=0) {
    let xP = this.planar.x / SF;
    let yP = this.planar.y / SF;
    let r = this.radius * this.perspectiveScale / SF * objectScale;
    return (square(x - w/2 - xP) + square(y - h/2 - yP)) < square(r + tolerance);
  }

}

class Orbiter extends CelObj {
  constructor({orbiting, distanceFromOrbiter, radius, density=null, mass=null,
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
                               0).plus(orbiting.velocity);
    super({radius, density, mass, velocity, position, color, name});
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
    for (let i = 2; i < lastPos.length; i += 3) {
        let lp = lastPos[i];
        let col = 200 - i*2;
        fill(col);
        let drawRadius = this.radius / SF * objectScale;
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
  }

  static canBeOrbitedBy(t) {
    return t === "Moon";
  }
}

class Moon extends Orbiter {
  constructor(args) {
    super(args);
  }

  static canBeOrbitedBy() {
    return false;
  }
}

class Star extends CelObj {
  constructor({radius, density=null, mass=null, velocity=null, position=null,
               color=null, name=null}) {
    if (position == null) {
      position = zero3;
    }
    if (velocity == null) {
      velocity = zero3;
    }
    super({radius, density, velocity, mass, position, color, name});
  }

  static canBeOrbitedBy(t) {
    return t === "Planet";
  }

}
