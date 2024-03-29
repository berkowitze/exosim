class Transit {
  constructor(startTime, star, planet) {
    this.startTime = startTime;
    this.endTime = null;
    this.star = star;
    this.planet = planet;
    this.ended = false;
  }

  complete(endTime) {
    this.ended = true;
    this.endTime = endTime;
    this.duration = (this.endTime - this.startTime);
  }
}

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
     * force between this object and another CelObj divided by this objects mass
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

  draw(scale = objectSolarScale) {
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
            this.radius * this.perspectiveScale / SF * scale * 2);
    if (this.name != null && showLabels) {
      this.drawLabel();
    }
  }

  update(force, DT) {
    /**
     * update this object given a force acting on it and a timestep
     * updates velocity and position
     */
    let dv = force.scale(DT);
    this.velocity = this.velocity.plus(dv);
    let dx = this.velocity.scale(DT);
    this.position = this.position.plus(dx);
  }

  updatePosition(mx, my) { // used to set position by mouse coordinate
    this.position = new Vector3((mx - w/2) * SF, (my - h/2) * SF, 0);
  }

  mouseIn(pixelTolerance=0) {
    let tolerance = pixelTolerance * SF;
    return (square(mxScaled - this.position.x) +
            square(myScaled - this.position.y)
            ) < square(this.radius*objectSolarScale + tolerance);
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
    let velDir = new Vector3(-Math.sin(angle), Math.cos(angle), 0).normalized();
    let velocity = velDir.scale(velMag).plus(orbiting.velocity);
    super({radius, density, mass, velocity, position, color, name});
    // this.trail = new Deque(128);
  }

  draw() {
    // if (showTrails) {
    //   this.drawTrail();
    // }
    super.draw(objectPlanetScale);
  }

  // drawTrail() {
  //   let lastPos = this.trail.toArray();
  //   for (let i = 2; i < lastPos.length; i += 3) {
  //       let lp = lastPos[i];
  //       let col = 200 - i*2;
  //       fill(col);
  //       let drawRadius = this.radius / SF * objectScale;
  //       ellipse(lp.x / SF, lp.y / SF, drawRadius * (127 - i) / 200);
  //   }
  // }

  update(force, DT) {
    // let len = this.trail.insertFront(this.position);
    // if (len > 127) {
    //   this.trail.pop();
    // }
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

  canBeOrbitedBy(t) {
    return t === "Moon";
  }

  drawLabel() {
    if (draggingNewObject && (this === draggingOnto || this.mouseIn(7))) {
      fill('#47b8e0');
    }
    else {
      fill(255);
    }
    const offset = 10;
    textAlign(CENTER, CENTER);
    text(this.name, this.planar.x / SF + offset, this.planar.y / SF + offset);
  }
}

class Moon extends Orbiter {
  constructor(args) {
    super(args);
  }

  canBeOrbitedBy() {
    return false;
  }

  drawLabel() {
    if (draggingNewObject && (this === draggingOnto || this.mouseIn(7))) {
      fill('#47b8e0');
    }
    else {
      fill(255);
    }
    const offset = -12;
    textAlign(CENTER, CENTER);
    text(this.name, this.planar.x / SF + offset, this.planar.y / SF + offset);
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

    this.transitTimeGraphs = new Map(); // map of object -> Graph
    this.currentTransits = new Map(); // map of object -> Transit
  }

  canBeOrbitedBy(t) {
    return t === "Planet";
  }

  occlusion(other) {
    /**
     * fraction of star occluded by another CelObj (circle intersection)
     * does not work for other being a Star (treats it like a planet)
     */

    let overlap;
    if (!this.transitTimeGraphs.has(other)) {
      this.transitTimeGraphs.set(other, new Graph(other.name + ' transit duration', 256, other.color));
    }

    if (this.perspectiveScale < other.perspectiveScale) {
      const d = this.planar.sub(other.planar).length;
      const intersection = circleOverlap(this.radius * this.perspectiveScale, other.radius * other.perspectiveScale, d);
      overlap = intersection / (sq(this.radius) * PI);
    }
    else {
      overlap = 0.0;
    }

    if (overlap == 0 && this.currentTransits.has(other)) {
      // console.log('Ending transit');
      this.currentTransits.get(other).complete(model.time);
      this.transitTimeGraphs.get(other).addVal(this.currentTransits.get(other).duration);
      this.currentTransits.delete(other);
    }
    else if (overlap > 0 && !(this.currentTransits.has(other))) {
      // console.log('Starting transit');
      this.currentTransits.set(other, new Transit(model.time, this, other));
    }

    return overlap;
  }

  drawLabel() {
    if (draggingNewObject && (this === draggingOnto || this.mouseIn(7))) {
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
