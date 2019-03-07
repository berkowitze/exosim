planets = OUR_SOLAR_SYSTEM;
// planets = [];
star = SUN;

function Model(planets, star) {
  this.planets = planets;
  // TODO(izzy): consider making an array of stars so we can have binaries/trinaries
  this.star = star;
  this.objects = planets.concat(star);

  this.updateMomentum = function() {
    let momentum = zero3;
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      momentum = momentum.plus(obj.momentum());
    }
    this.momentum = momentum;
  };

  this.zeroMomentum = function() {
    let planetMomentum = zero3;
    for (let i = 0; i < this.objects.length; i++) {
      let planet = this.objects[i];
      planetMomentum = planetMomentum.plus(planet.momentum());
    }
    this.star.velocity = planetMomentum.scale(-1 / this.star.mass);
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

  function compareScale(a,blue) {
    return a.perspectiveScale - blue.perspectiveScale;
  }

  this.shiftToZero = function() {
    let dp = this.star.position;
    this.star.position = zero3;
    for (let i = 0; i < this.planets.length; i++) {
      let p = this.planets[i];
      p.position = p.position.sub(dp);
    }
  };

  this.removePlanet = function(planet) {
    let pIndex = model.planets.indexOf(planet);
    if (pIndex < 0) {
      return;
    }
    model.planets.splice(pIndex, 1);

    let oIndex = model.objects.indexOf(planet);
    if (oIndex < 0) {
      return;
    }
    model.objects.splice(oIndex, 1);
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

  model = new Model(planets, star);
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

function planetPress() {
  for (let j = 0; j < planets.length; j++) {
    if (planets[j].pointIn(mouseX, mouseY)) {
      planetClicked = planets[j];
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
  if (dragging) {
    model.shiftToZero();
  }
  return dragging;
}

function createNewPlanet() {
  let c = color(redSlider.val, greenSlider.val, blueSlider.val);
  let name = nameInput.val.join('');
  let density = newPlanetDensity;
  let radius = newPlanetRadius;
  let pos = new Vector3((mouseX - w/2) * SF, (mouseY - h/2) * SF, 0);
  let velMag = Math.sqrt(G * star.mass / pos.dist(star.position));
  let newPlanet = new CelObj({
    radius: radius,
    density: density,
    velocityMagnitude: velMag,
    distanceFromSun: pos.dist(star.position),
    color: c,
    angle: Math.atan2(pos.y, pos.x),
    name: name !== '' ? name : '[Unnamed]',
    isStar: false
  });
  model.planets.push(newPlanet);
  model.objects.push(newPlanet);
  draggingNewPlanet = false;
  if (model.planets.length > 20 && showTrails) {
    trailsButton.toggle();
  }
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
  if (planetPress()) {
    return;
  }
  draggingNewPlanet = newPlanetPress();
}

function mouseReleased() {
  if (draggingNewPlanet) {
    createNewPlanet();
    return;
  }
  if (componentClicked != null && componentClicked.doneOnRelease) {
    componentClicked = null;
  }
  if (planetClicked != null && trashHover) {
    model.removePlanet(planetClicked);
  }
  planetClicked = null;
}

function doubleClicked() {
  for (let i = 0; i < planets.length; i++) {
    if (planets[i].pointIn(mouseX, mouseY)) {
      planets[i].setOnOrbit(star);
      return false;
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
  if (draggingNewPlanet) {
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
    if (!draggingNewPlanet) {
      ellipse(newPlanetX, newPlanetY, newPlanetDrawRadius);
    }
    else {
      ellipse(mouseX, mouseY, newPlanetDrawRadius);
    }
  }
}

function draw() {
  interfacePreUpdate();

  translate(w/2, h/2);
  noStroke();
  fill(0);
  model.draw();
  translate(-w/2, -h/2);

  if (!paused) {
    // model.updateRungeKutta(DT);
    model.update(DT);
    time += DT;
  }

  overlays();
}

