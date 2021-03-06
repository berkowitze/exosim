class Model {
  constructor(objects) {
    this.time = 0;
    this.objects = objects;
    this.updateMomentum();
    this.origin = new PointObject(zero3);
    this.graphs = objects
                  .filter(obj => obj instanceof Star)
                  .map(star => new OcclusionGraph(star, this));
  }

  addObject(object) {
    if (object instanceof Star) {
      this.graphs.push(new OcclusionGraph(object, this));
    }
    this.objects.push(object);
  }

  removeObject(object) {
    let pIndex = model.objects.indexOf(object);
    if (pIndex >= 0) {
      model.objects.splice(pIndex, 1);
    }

    if (object instanceof Star) {
      let gIndex = -1;
      for (let i = 0; i < this.graphs.length; i++) {
        let graph = this.graphs[i];
        if (graph.star == object) {
          gIndex = i;
          break;
        }
      }
      if (gIndex == -1) {
        return;
      }
      model.graphs.splice(gIndex, 1);
    }

    if (this.origin == object) {
      this.origin = new PointObject(zero3);
    }
  }


  updateMomentum() {
    let momentum = zero3;
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      momentum = momentum.plus(obj.momentum());
    }
    this.momentum = momentum;
  }

  update(dt) {
    for (let graph of model.graphs) {
      graph.update();
    }
    let forces = [];
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let force = new Vector3(0, 0, 0);
      for (let j = 0; j < this.objects.length; j++) {
        if (i === j) {
          continue;
        }
        let from = this.objects[j];
        force = force.plus(obj.force(from));
      }
      forces.push(force);
    }

    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      let force = forces[i];
      obj.update(force, dt);
    }

    this.time += dt;

  }

  updateRungeKutta(dt) {
    accels = [];
    for (var i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      accel = new Vector3(0, 0, 0);
      for (var j = 0; j < this.objects.length; j++) {
        if (i == j) {
          continue;
        }
        other = this.objects[j];
        tmp = -G * other.mass / Math.pow(obj.dist(other), 3);

        k1 = obj.position.sub(other.position).scale(tmp);

        tmp_vel = obj.velocity.plus(k1.scale(dt/2));
        tmp_pos = obj.position.plus(tmp_vel.scale(dt/2));
        k2 = tmp_pos.sub(other.position).scale(tmp);

        tmp_vel = obj.velocity.plus(k2.scale(dt/2));
        tmp_pos = obj.position.plus(tmp_vel.scale(dt/2));
        k3 = tmp_pos.sub(other.position).scale(tmp);

        tmp_vel = obj.velocity.plus(k3.scale(dt));
        tmp_pos = obj.position.plus(tmp_vel.scale(dt));
        k4 = tmp_pos.sub(other.position).scale(tmp);

        a = k2.plus(k3).scale(2).plus(k1).plus(k4).scale(1/6);
        accel = accel.plus(a);
      }
      accels.push(accel);
    }

    for (i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      accel = accels[i];
      obj.update(accel, DT);
    }

    this.time += dt;
  }

  compareScale(a, b) {
    return a.perspectiveScale - b.perspectiveScale;
  }

  getHoveredObjects() { // todo rewrite this using CelObj methods
    let scaledMouse = new Vector3(mxScaled, myScaled, 0);
    return this.objects.concat().sort(function(a, b) {
      let d1 = a.position.dist(scaledMouse);
      let d2 = b.position.dist(scaledMouse);
      return d1 - d2;
    }).filter(obj => obj.mouseIn(7));
  }

  draw() {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      obj.project(this.origin.position);
    }
    this.objects.sort(this.compareScale);

    for (let j = 0; j < this.objects.length; j++) {
      let obj = this.objects[j];
      obj.draw();
    }
  }

  clear() {
    this.objects = [];
    this.origin = new PointObject(zero3);
    this.graphs = [];
  }
}
