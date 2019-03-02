planets = OUR_SOLAR_SYSTEM;
// planets = [];
star = SUN;

function Model(planets, star) {
  this.planets = planets;
  // TODO(izzy): consider making an array of stars so we can have binaries/trinaries
  this.star = star;
  this.objects = planets.concat(star);

  this.minRadius = this.objects
                   .map(obj => obj.radius).min();
  this.maxRadius = this.objects
                   .map(obj => obj.radius).max();

  this.updateMomentum = function() {
    momentum = zero3;
    for (var i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      momentum = momentum.plus(obj.momentum());
    }
    this.momentum = momentum;
  };

  this.zeroMomentum = function() {
    planetMomentum = zero3;
    for (i = 0; i < this.objects.length; i++) {
      planet = this.objects[i];
      planetMomentum = planetMomentum.plus(planet.momentum());
    }
    dv = planetMomentum.scale(-1/this.star.mass);
    this.star.velocity = dv;
  };

  this.updateMomentum();

  this.update = function(DT) {
    forces = [];
    for (var i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      force = new Vector3(0, 0, 0);
      for (var j = 0; j < this.objects.length; j++) {
        if (i == j) {
          continue;
        }
        from = this.objects[j];
        force = force.plus(obj.force(from));
      }
      forces.push(force);
    }

    for (i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      force = forces[i];
      obj.update(force, DT);
    }
  };

  function compareScale(a,blue) {
    return a.perspectiveScale - blue.perspectiveScale;
  }

  this.shiftToZero = function() {
    var dp = this.star.position;
    this.star.position = zero3;
    for (var i = 0; i < this.planets.length; i++) {
      var p = this.planets[i];
      p.position = p.position.sub(dp);
    }
  };

  this.removePlanet = function(planet) {
    var pIndex = model.planets.indexOf(planet);
    if (pIndex < 0) {
      return;
    }
    model.planets.splice(pIndex, 1);

    var oIndex = model.objects.indexOf(planet);
    if (oIndex < 0) {
      return;
    }
    model.objects.splice(oIndex, 1);
  };

  this.draw = function() {

    if (DRAW_PERSPECTIVE) {
      for (var i = 0; i < this.objects.length; i++) {
        obj = this.objects[i];
        obj.project();
      }
      this.objects.sort(compareScale);
    }

    for (var j = 0; j < this.objects.length; j++) {
      obj = this.objects[j];
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
  time = 0;
  w = window.innerWidth;
  h = window.innerHeight;
  createCanvas(w, h);
  componentClicked = null;
  planetClicked = null;
  inputSelected = null;
  red = green = blue = 125;
  newPlanetDrawRadius = 5;

  sidebarComponents = makeSidebarComponents();

  planetCreatorComponents = createPlanetComponents();

  sizeDependentSetup();

  model = new Model(planets, star);
}

function keyPressed() {
  if (inputSelected != null && keyCode == BACKSPACE) {
    inputSelected.backspace();
    return;
  }
  if (keyCode == LEFT_ARROW) {
    timeSlider.decrement();
  }
  else if (keyCode == RIGHT_ARROW) {
    timeSlider.increment();
  }
  else if (keyCode == UP_ARROW) {
    scaleSlider.decrement();
  }
  else if (keyCode == DOWN_ARROW) {
    scaleSlider.increment();
  }
}

function componentPress() {
  for (var i = 0; i < componentBoxes.length; i++) {
    var box = componentBoxes[i];
    if (!box.showing) {
      continue;
    }
    for (var j = 0; j < box.components.length; j++) {
      var component = box.components[j];
      if (component.mouseIn()) {
        for (var k = 0; k < INPUTS.length; k++) {
          var inp = INPUTS[k];
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
  for (var j = 0; j < planets.length; j++) {
    if (planets[j].mouseIn()) {
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
  var dragging = square(mouseX - newPlanetX) + square(mouseY - newPlanetY) < 
                 square(newPlanetDrawRadius) * 1.3;
  if (dragging) {
    model.shiftToZero();
  }
  return dragging;
}

function createNewPlanet() {
  var c = color(redSlider.val, greenSlider.val, blueSlider.val);
  var name = nameInput.val.join('');
  var density = newPlanetDensity;
  var radius = newPlanetRadius;
  var pos = new Vector3((mouseX - w/2) * SF, (mouseY - h/2) * SF, 0);
  var velMag = Math.sqrt(G * star.mass / pos.dist(star.position));
  var newPlanet = new CelObj({
    radius: radius,
    density: density,
    velocityMagnitude: velMag,
    distanceFromSun: pos.dist(star.position),
    color: c,
    angle: Math.atan2(pos.y, pos.x),
    name: name != '' ? name : '[Unnamed]',
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
    for (var k = 0; k < INPUTS.length; k++) {
      var inp = INPUTS[k];
      if (inp === componentClicked) {
        inputSelected = inp;
        continue;
      }
      inp.border = false;
    }
    return;
  }
  for (var i = 0; i < INPUTS.length; i++) {
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
  for (var j = 0; j < planets.length; j++) {
    if (planets[j].mouseIn()) {
      planets[j].setOnOrbit(star);
      return false;
    }
  }
  return false;
}

function interfacePreUpdate() {
  if (ecliptic != 0 && showTrails) {
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
  text((time / 3.154e7).toFixed(3) + ' years', 13, h - 20);
}

function overlays() {
  timeOverlay();
  trashUpdate();

  for (var i = 0; i < componentBoxes.length; i++) {
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
    model.update(DT);
    time += DT;
  }

  overlays();
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}
