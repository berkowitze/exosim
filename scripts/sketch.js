planets = OUR_SOLAR_SYSTEM;
// planets = [];
star = SUN;

function Model(objects) {
  this.objects = objects;

  this.updateMomentum = function() {
    let momentum = zero3;
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      momentum = momentum.plus(obj.momentum());
    }
    this.momentum = momentum;
  };

  this.updateMomentum();

  this.update = function(DT) {
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
      obj.update(force, DT);
    }
  };

  this.updateRungeKutta = function(DT) {
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

        tmp_vel = obj.velocity.plus(k1.scale(DT/2));
        tmp_pos = obj.position.plus(tmp_vel.scale(DT/2));
        k2 = tmp_pos.sub(other.position).scale(tmp);

        tmp_vel = obj.velocity.plus(k2.scale(DT/2));
        tmp_pos = obj.position.plus(tmp_vel.scale(DT/2));
        k3 = tmp_pos.sub(other.position).scale(tmp);

        tmp_vel = obj.velocity.plus(k3.scale(DT));
        tmp_pos = obj.position.plus(tmp_vel.scale(DT));
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
  };

  function compareScale(a,b) {
    return a.perspectiveScale - b.perspectiveScale;
  }

  this.removeObject = function(object) {
    let pIndex = model.objects.indexOf(object);
    if (pIndex < 0) {
      return;
    }
    model.objects.splice(pIndex, 1);

    let oIndex = model.objects.indexOf(object);
    if (oIndex < 0) {
      return;
    }
    model.objects.splice(oIndex, 1);
  };

  this.getHoveredObjects = function(x, y) {
    let scaledMouse = new Vector3(x, y, 0).sub(new Vector3(w/2, h/2, 0)).scale(SF);
    return this.objects.concat().sort(function(a, b) {
      let d1 = a.position.dist(scaledMouse);
      let d2 = b.position.dist(scaledMouse);
      return d1 - d2;
    }).filter(obj => obj.position.dist(scaledMouse) / SF < 20);
    
  };

  this.draw = function() {

    if (DRAW_PERSPECTIVE) {
      for (let i = 0; i < this.objects.length; i++) {
        let obj = this.objects[i];
        obj.project();
      }
      this.objects.sort(compareScale);
    }

    for (let j = 0; j < this.objects.length; j++) {
      let obj = this.objects[j];
      obj.draw();
    }
  };
}

function windowResized() {
  w = windowWidth;
  h = windowHeight;
  sizeDependentSetup();
  resizeCanvas(w, h);
}

function sizeDependentSetup() { // wrote this so resize works
  sidebar = new ComponentBox(
    {
      xStart: 13,
      yStart: 13,
      components: sidebarComponents,
      showing: sidebar == null ? true : sidebar.showing
    }
  );

  planetCreator = new ComponentBox(
    {
      xStart: w - 200,
      yStart: 13,
      components: planetCreatorComponents,
      showing: planetCreator == null ? false : planetCreator.showing
    }
  );

  newPlanetX = w - 150;
  newPlanetY = planetCreator.y1 + 30;

  componentBoxes = [sidebar, planetCreator];
}

function setup() {
  w = window.innerWidth;
  h = window.innerHeight;

  planetClicked = null;
  inputSelected = null;
  createCanvas(w, h);
  red = green = blue = 125;

  sidebarComponents = makeSidebarComponents();

  planetCreatorComponents = createPlanetComponents();

  sizeDependentSetup();

  model = new Model(planets.concat(star));
}

function keyPressed() {
  if (inputSelected != null && keyCode === BACKSPACE) {
    inputSelected.backspace();
    return;
  }
  switch (keyCode) {
    case LEFT_ARROW:
      timeSlider.decrement();
      break;
    case RIGHT_ARROW:
      timeSlider.increment();
      break;
    case UP_ARROW:
      scaleSlider.decrement();
      break;
    case DOWN_ARROW:
      scaleSlider.increment();
  }
}

function componentPress() {
  for (let i = 0; i < componentBoxes.length; i++) {
    let box = componentBoxes[i];
    if (!box.showing) {
      continue;
    }
    for (let i = 0; i < box.components.length; i++) {
      let component = box.components[i];
      if (component.pointIn(mouseX, mouseY)) {
        for (let j = 0; j < INPUTS.length; j++) {
          let inp = INPUTS[j];
          if (inp === component) {
            continue;
          }
          inp.border = false;
        }
        componentClicked = component.updateVal(mouseX);
        return true;
      }
    }
  }
  componentClicked = null;
  return false;
}

function celObjPress() {
  let revObjs = model.objects.concat().reverse();
  for (let j = 0; j < revObjs.length; j++) {
    if (revObjs[j].pointIn(mouseX, mouseY)) {
      planetClicked = revObjs[j];
      eclipticSlider.setTo(0);
      return true;
    }
  }
  planetClicked = null;
  return false;
}

function keyTyped() {

  if (inputSelected != null) {
    inputSelected.keyPress(key);
    return;
  }
  switch (key) {
    case ' ':
      pauseButton.toggle();
      break;
    case 'h':
      hideButton.toggle();
      break;
    case 'w':
      eclipticSlider.decrement();
      break;
    case 's':
      eclipticSlider.increment();
      break;
    case 'm':
      $('audio').get(0).muted = !$('audio').get(0).muted;
      break;
    case 't':
      trailsButton.toggle();
      break;
    case 'l':
      labelsButton.toggle();
      break;
    case 'f':
      fullscreenButton.toggle();
      break;
  }
}

function newPlanetPress() {
  if (!planetCreator) {
    return false;
  }
  let dragging = square(mouseX - newPlanetX) + square(mouseY - newPlanetY) <
                 square(newPlanetDrawRadius) * 1.3;
  return dragging;
}

function createNewObject(orbiting=null) {
  let density = newPlanetDensity;
  let radius = newPlanetRadius;
  let nameInp = nameInput.val.join('');
  name = nameInp !== '' ? nameInp : '[Unnamed]';
  let c = color(redSlider.val, greenSlider.val, blueSlider.val);
  let pos = new Vector3((mouseX - w/2) * SF, (mouseY - h/2) * SF, 0);
  console.log(pos);
  // let newObj;
  if (orbiting == null) {
    newObj = new CelObj({
      radius: radius,
      density: density,
      color: c,
      name: name,
      type: 0,
      position: pos
    });
    console.log(newObj.velocity);
    console.log(newObj.position);
  }
  else {
    let velMag = Math.sqrt(G * orbiting.mass / pos.dist(orbiting.position));
    newObj = new CelObj({
      orbiting: orbiting,
      radius: radius,
      density: density,
      velocityMagnitude: velMag,
      distanceFromOrbiter: pos.dist(orbiting.position),
      color: c,
      angle: Math.atan2(pos.y - orbiting.position.y, pos.x - orbiting.position.x),
      name: name,
      type: creating == "Planet" ? 1 : 2
    });
  }
  model.objects.push(newObj);
  if (model.objects.length > 20 && showTrails) {
    trailsButton.toggle();
  }
  draggingOnto = null;
  draggingNewObject = false;
}

function mousePressed() {
  if (componentPress()) {
    for (let i = 0; i < INPUTS.length; i++) {
      let inp = INPUTS[i];
      if (inp === componentClicked) {
        inputSelected = inp;
        continue;
      }
      inp.border = false;
    }
    return;
  }
  for (let i = 0; i < INPUTS.length; i++) {
    INPUTS[i].border = false;
  }
  inputSelected = null;
  if (draggingNewObject) {
    return;
  }
  if (celObjPress()) {
    return;
  }
  if (newPlanetPress()) {
    draggingNewObject = true;
  }
}

function mouseReleased() {
  if (draggingNewObject && draggingOnto == null) {
    if (creating == "Star") {
      createNewObject();
      return;
    }
    let hoveredObjs = model.getHoveredObjects(mouseX, mouseY);
    draggingOnto = hoveredObjs.length == 0 ? null : hoveredObjs[0];
    if (draggingOnto != null) {
      switch (creating) {
        case "Planet":
          if (draggingOnto.isPlanet || draggingOnto.isMoon) {
            draggingOnto = null; // dragged planet onto other planet/moon
          }
          break;
        case "Moon":
          if (draggingOnto.isStar || draggingOnto.isMoon) {
            draggingOnto = null; // dragged moon onto other moon/star
          }
          break;
      }
    }
    if (draggingOnto == null) {
      draggingNewObject = false;
    }
    else {
      // runs when new object is dropped onto valid object to orbit
    }
    return;
  }
  else if (draggingNewObject) { // runs when new object has valid orbiter and is placed
    createNewObject(draggingOnto);
  }

  if (componentClicked != null && componentClicked.doneOnRelease) {
    componentClicked = null;
  }
  if (planetClicked != null && trashHover) {
    model.removeObject(planetClicked);
  }
  planetClicked = null;
}

function doubleClicked() { // TODO: make this reset orbit around its orbiter/set vel to 0 for star
  for (let i = 0; i < planets.length; i++) {
    if (planets[i].pointIn(mouseX, mouseY)) {
      // planets[i].setOnOrbit(planets[i].orbiting);
      // TODO : This is broken
      break;
    }
  }
  return false;
}

function mouseWheel(event) {
  if (Number.isInteger(event.delta)) {
    return false;
  }

  let newSF = Math.log10(SF + event.delta * 1e8);
  if (isNaN(newSF) || newSF < scaleSlider.minVal || newSF > scaleSlider.maxVal) {
    return false;
  }
  scaleSlider.setTo(newSF);
  return false;
}

function interfacePreUpdate() {
  if (ecliptic !== 0 && showTrails) {
    trailsButton.toggle();
  }
  if (draggingNewObject) {
    eclipticSlider.setTo(0);
  }
  background(0, 0, 0);
  if (componentClicked != null) {
    componentClicked = componentClicked.updateVal(mouseX);
  }
  if (planetClicked != null) {
    planetClicked.updatePosition(mouseX, mouseY);
  }
}

function timeOverlay() {
  fill(255);
  textAlign(LEFT, CENTER);
  text((time / SEC_PER_YEAR).toFixed(3) + ' years', 13, h - 20);
}

function overlays() {
  timeOverlay();
  trashUpdate();

  for (let i = 0; i < componentBoxes.length; i++) {
    if (componentBoxes[i].showing) {
      componentBoxes[i].draw();
    }
  }
  if (planetCreator.showing) {
    fill(color(red, green, blue));
    newPlanetDrawRadius = scaleToRange(newPlanetRadius, newPlanetMinRadius,
                                       newPlanetMaxRadius, 5, 30);
    if (!draggingNewObject) {
      ellipse(newPlanetX, newPlanetY, newPlanetDrawRadius);
    }
    else {
      ellipse(mouseX, mouseY, newPlanetDrawRadius);
      if (draggingOnto) {
        noFill();
        stroke(255);
        r = new Vector3(mouseX-w/2, mouseY-h/2, 0).dist(draggingOnto.position.scale(1/SF));
        ellipse(w/2 + draggingOnto.position.x / SF, h/2 + draggingOnto.position.y / SF, r*2, r*2);
        fill(255);
        noStroke();
      }
    }
  }
}

function draw() {
  interfacePreUpdate();
  // earthPos = ecliptic == 0 ? earth.position.scale(-1/SF) : earth.planar.scale(-1/SF);
  translate(w/2, h/2);
  // translate(earthPos.x, earthPos.y);
  noStroke();
  fill(0);
  model.draw();
  translate(-w/2, -h/2);
  // translate(-earthPos.x, -earthPos.y);

  if (!paused) {
    // model.updateRungeKutta(DT);
    model.update(DT);
    time += DT;
  }

  overlays();
}

