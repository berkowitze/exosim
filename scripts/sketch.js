planets = OUR_SOLAR_SYSTEM;
star = SUN;

exp10 = x => Math.pow(10,x);

function Model(planets, star) {
  this.planets = planets;
  // TODO(izzy): consider making an array of stars so we can have binaries/trinaries
  this.star = star;
  this.objects = planets.concat(star);

  this.minRadius = this.objects
                   .map(obj => obj.radius)
                   .reduce((rad, rst) => Math.min(rad, rst), Infinity);
  this.maxRadius = this.objects
                   .map(obj => obj.radius)
                   .reduce((rad, rst) => Math.max(rad, rst), -Infinity);

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

  // this.zeroMomentum();
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
                callback: function(checked) {showTrails = checked;},
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
    new Slider({minVal: 0, maxVal: 255, val: red,
                callback: function(newV) {red = newV;},
                label: 'Red'}),
    new Slider({minVal: 0, maxVal: 255, val: green,
                callback: function(newV) {green = newV;},
                label: 'Green'}),
    new Slider({minVal: 0, maxVal: 255, val: blue,
                callback: function(newV) {blue = newV;},
                label: 'Blue'}),
    new Input('Planet name'),
    new Text('Drag the planet into place when you\'re ready!')
  ];

  colorPicker = new ComponentBox({xStart: window.innerWidth - 200, yStart: 13,
                                  components: colorPickerComponents});

  componentBoxes = [sidebar, colorPicker];
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
  else if (keyCode == DOWN_ARROW) {
    scaleSlider.decrement();
  }
  else if (keyCode == UP_ARROW) {
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
      ecliptic = 0;
      return;
    }
  }
  planetClicked = null;
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
    case 's':
      eclipticSlider.decrement();
      break;
    case 'w':
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

function mousePressed() {
  if (!componentPress()) {
    planetPress();
  }
  else {
    for (var k = 0; k < INPUTS.length; k++) {
      var inp = INPUTS[k];
      if (inp === componentClicked) {
        inputSelected = inp;
        continue;
      }
      inp.border = false;
    }
  }
}

function mouseReleased() {
  if (componentClicked != null && componentClicked.doneOnRelease) {
    componentClicked = null;
  }
  planetClicked = null;
}

function draw() {
  if (ecliptic != 0 && showTrails) {
    trailsButton.toggle();
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
  fill(255);
  fill(0);
  model.draw();
  if (!paused) {
    model.update(DT);
  }
  translate(-window.innerWidth / 2, -window.innerHeight / 2);
  for (var i = 0; i < componentBoxes.length; i++) {
    if (componentBoxes[i].showing) {
      componentBoxes[i].draw();
    }
  }
  if (planetCreator) {
    fill(color(red, green, blue));
    ellipse(window.innerWidth - 150, colorPickerComponents[colorPickerComponents.length-1].yEnd + 100, 50);
    colorPicker.showing = true;
  }
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}
