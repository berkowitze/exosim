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

  function compareScale(a,b) {
    return a.perspectiveScale - b.perspectiveScale;
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

  sidebarComponents = [
    new Button({label: 'Hide Sidebar',
                callback: function(checked) {
                  hideSidebar = checked;
                  this.label = checked?'Show Sidebar':'Hide Sidebar';
                  for (var i = 1; i < this.box.components.length; i++) {
                    this.box.components[i].drawIt = !this.box.components[i].drawIt;
                  }
                },
                val: hideSidebar}),
    new Slider({minVal: DT_MIN_EXP, maxVal: DT_MAX_EXP,
                val: Math.log10(DT),
                callback: function(newV) {DT = Math.pow(10, newV);},
                label: 'Time Scale'}),
    new Slider({minVal: SF_MIN_EXP, maxVal: SF_MAX_EXP,
                val: Math.log10(SF),
                callback: function(newV) {SF = Math.pow(10, newV);},
                label: 'Scale Factor'}),
    new Slider({minVal: 0, maxVal: PI/2,
                val: 0,
                callback: function(newV) {ecliptic = newV;},
                label: 'Ecliptic angle'}),
    new Button({label: 'Show Planet Labels',
                callback: function(checked) {showLabels = checked;},
                val: showLabels}),
    new Button({label: 'Show streaks',
                callback: function(checked) {showStreaks = checked;},
                val: showStreaks}),
    new Button({label: 'Pause',
                callback: function(checked) {paused = checked;},
                val: paused})
  ];
  sidebar = new ComponentBox({xStart: 13, yStart: 13, components: sidebarComponents, showing: true});

  componentBoxes = [sidebar];
  model = new Model(planets, star);
}

function mousePressed() {
  var slider;
  for (var i = 0; i < componentBoxes.length; i++) {
    box = componentBoxes[i];
    if (!box.showing) {
      continue;
    }
    for (var j = 0; j < box.components.length; j++) {
      component = box.components[j];
      if (component.mouseIn()) {
        componentClicked = component.updateVal(mouseX);
        return;
      }
    }
  }
  componentClicked = null;
}

function mouseReleased() {
  componentClicked = null;
}

function draw() {
  background(0, 0, 0);
  if (componentClicked != null) {
    componentClicked = componentClicked.updateVal(mouseX);
  }
  translate(window.innerWidth / 2, window.innerHeight / 2);
  noStroke();
  fill(255);
  // text('Distances to scale, planets drawn ' + planetVisualScale + ' times bigger', -150, window.innerHeight / 2 - 20);
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
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}