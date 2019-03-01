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

    for (var i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      obj.draw();
    }
  };
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  componentClicked = null;
  planetClicked = null;
  inputSelected = null;
  red = 125;
  green = 125;
  blue = 125;
  newPlanetDrawRadius = 5;

  sidebarComponents = [
    hideButton = new Button({label: 'Hide Sidebar [h]',
                callback: function(checked) {
                  hideSidebar = checked;
                  this.label = checked?'Show Sidebar [h]':'Hide Sidebar [h]';
                  for (var i = 1; i < this.box.components.length; i++) {
                    this.box.components[i].drawIt = !this.box.components[i].drawIt;
                  }
                },
                val: hideSidebar}),
    timeSlider = new Slider({minVal: DT_MIN_EXP, maxVal: DT_MAX_EXP,
                val: Math.log10(DT),
                callback: function(newV) {DT = Math.pow(10, newV);},
                label: 'Time Scale [\u2190 \u2192]'}),
    scaleSlider = new Slider({minVal: SF_MIN_EXP, maxVal: SF_MAX_EXP,
                val: Math.log10(SF),
                callback: function(newV) {SF = Math.pow(10, newV);},
                label: 'Scale Factor [\u2191 \u2193]'}),
    eclipticSlider = new Slider({minVal: 0, maxVal: PI/2,
                val: 0,
                callback: function(newV) {ecliptic = newV;},
                label: 'Ecliptic angle [s w]'}),
    labelsButton = new Button({label: 'Show Planet Labels [l]',
                callback: function(checked) {showLabels = checked;},
                val: showLabels}),
    trailsButton = new Button({label: 'Show trails [t]',
                callback: function(checked) {
                  if (model.planets.length > 20) {
                    this.val = false;
                    showTrails = false;
                    return;
                  }
                  showTrails = checked;
                },
                val: showTrails}),
    pauseButton = new Button({label: 'Pause [space]',
                callback: function(checked) {paused = checked;},
                val: paused}),
    new Button({label: 'Create a Planet',
                callback: function(checked) {planetCreator = checked; colorPicker.showing = checked;},
                val: planetCreator})
  ];
  sidebar = new ComponentBox({xStart: 13, yStart: 13,
                              components: sidebarComponents, showing: true});

  colorPickerComponents = [
    redSlider = new Slider({minVal: 0, maxVal: 255, val: red,
                callback: function(newV) {red = newV;},
                label: 'Red'}),
    greenSlider = new Slider({minVal: 0, maxVal: 255, val: green,
                callback: function(newV) {green = newV;},
                label: 'Green'}),
    blueSlider = new Slider({minVal: 0, maxVal: 255, val: blue,
                callback: function(newV) {blue = newV;},
                label: 'Blue'}),
    nameInput = new Input('Planet name'),
    new Slider({minVal: newPlanetMinRadius, maxVal: newPlanetMaxRadius,
                val: newPlanetRadius,
                callback: function(newV) {newPlanetRadius = newV;},
                label: 'Planet radius'}),
    new Slider({minVal: newPlanetMinDensity, maxVal: newPlanetMaxDensity,
                val: newPlanetDensity,
                callback: function(newV) {newPlanetDensity = newV;},
                label: 'Planet density'}),
    new Button({label: 'Reset',
                callback: function(checked) {
                  if (!checked) {
                    return;
                  }
                  red = 125;
                  green = 125;
                  blue = 125;
                  redSlider.val = 125;
                  greenSlider.val = 125;
                  blueSlider.val = 125;
                  nameInput.clear();
                  inputSelected = null;
                  this.toggle();
                }
              }),
    new Text(['Drag the planet into place', 'when you\'re ready!'])
  ];

  colorPicker = new ComponentBox({xStart: window.innerWidth - 200, yStart: 13,
                                  components: colorPickerComponents});

  componentBoxes = [sidebar, colorPicker];
  newPlanetX = window.innerWidth - 150;
  newPlanetY = colorPickerComponents[colorPickerComponents.length-1].yEnd + 30;
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
  var pos = new Vector3((mouseX - window.innerWidth/2) * SF,
                        (mouseY - window.innerHeight/2) * SF,
                        0);
  var velMag = Math.sqrt(G * star.mass / pos.dist(star.position));
  var newPlanet = new CelObj({
    radius: radius,
    density: density,
    velocityMagnitude: velMag,
    distanceFromSun: pos.dist(star.position),
    color: c,
    angle: Math.atan2(pos.y, pos.x),
    name: name ? name != '' : '[Unnamed]',
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

function drawTrash(xStart, yStart, baseWidth, color) {
  noFill();
  stroke(color);
  strokeWeight(2);

  baseHeight = 4 * baseWidth / 3;
  lidOverlap = baseWidth / 15;
  lidHeight = baseHeight / 10;
  handleHeight = lidHeight * 4/5;
  handleWidth = baseWidth/3;
  handleStart = xStart + (baseWidth / 3);
  stripeHeight = baseHeight * 6/10;
  stripeWidth = baseWidth / 15;
  stripeY = yStart + baseHeight / 5;
  stripesX = xStart + baseWidth / 5;
  stripeSep = baseWidth / 3.75;

  rect(xStart, yStart, baseWidth, baseHeight, 0, 0, 4, 4);
  rect(xStart - lidOverlap, yStart - lidHeight,
       baseWidth + 2*lidOverlap, lidHeight, 2);
  rect(handleStart, yStart - lidHeight - handleHeight,
       handleWidth, handleHeight, 3);
  strokeWeight(1);
  rect(stripesX, stripeY, stripeWidth, stripeHeight, 3);
  rect(stripesX + stripeSep, stripeY, stripeWidth, stripeHeight, 3);
  rect(stripesX + 2*stripeSep, stripeY, stripeWidth, stripeHeight, 3);
  noStroke();
  fill(0);
}

function draw() {
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
  translate(window.innerWidth / 2, window.innerHeight / 2);
  noStroke();
  fill(0);
  model.draw();
  if (!paused) {
    model.update(DT);
  }
  translate(-window.innerWidth / 2, -window.innerHeight / 2);
  if (planetClicked != null) {
    var trashX = window.innerWidth - 50;
    var trashY = window.innerHeight - 50;
    var minX = trashX - 20;
    var minY = trashY - 20;
    var maxX = trashX + 30;
    var maxY = trashY + 32;
    if (mouseX >= minX && mouseX <= maxX &&
        mouseY >= minY && mouseY <= maxY) {
      trashColor = color(255, 72, 49);
      trashHover = true;
    }
    else {
      trashColor = color(255, 255, 255);
      trashHover = false;
    }
    drawTrash(trashX, trashY, 20, trashColor);
  }
  else {
    trashHover = false;
  }
  for (var i = 0; i < componentBoxes.length; i++) {
    if (componentBoxes[i].showing) {
      componentBoxes[i].draw();
    }
  }
  if (planetCreator) {
    fill(color(red, green, blue));
    newPlanetDrawRadius = scaleToRange(newPlanetRadius, newPlanetMinRadius,
                                           newPlanetMaxRadius, 5, 30);
    if (!draggingNewPlanet) {
      ellipse(newPlanetX, newPlanetY, newPlanetDrawRadius);
    }
    else {
      ellipse(mouseX, mouseY, newPlanetDrawRadius);
    }
    colorPicker.showing = true;
  }
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}
