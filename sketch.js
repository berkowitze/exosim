exp10 = x => Math.pow(10,x);

planets = OUR_SOLAR_SYSTEM;
star = SUN;

var counter = 0; // for selecting different colors

var SF = 1e9; // scale factor
var SF_MIN_EXP = 5;
var SF_MAX_EXP = 12;

var DT = 1e5; // timestep
var DT_MIN_EXP = 3;
var DT_MAX_EXP = 8;

var FD = 4e11; // forcal distance

var planetVisualScale = 1e3; //1000.0; // visual scale for planets to make them more seeable
var starVisualScale = 1e1; // 10.0;
var G = 6.674e-11;

var ecliptic = 0;

var zero3 = new Vector3(0, 0, 0);

function Model(planets, star) {
  this.planets = planets;
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

  this.draw = function() {
    for (var i = 0; i < this.planets.length; i++) {
      planet = this.planets[i];
      planet.draw(this.minRadius);
    }
    this.star.starDraw(this.minRadius);
  };
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  sliderClicked = null;
  sidebar = true;

  sliders = [new Slider({minVal: DT_MIN_EXP, maxVal: DT_MAX_EXP,
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
                         label: 'Ecliptic angle'})];

  model = new Model(planets, star);
}

function drawSidebar() {
  var slider;
  for (var i = 0; i < sliders.length; i++) {
    slider = sliders[i];
    slider.draw();
  }
}

function mousePressed() {
  var slider;
  for (var i = 0; i < sliders.length; i++) {
    slider = sliders[i];
    if (slider.mouseIn()) {
      sliderClicked = slider;
      return;
    }
  }
  sliderClicked = null;
}

function mouseReleased() {
  sliderClicked = null;
}

function draw() {
  background(0, 0, 0);
  if (sliderClicked != null) {
    sliderClicked.updateVal(mouseX);
  }
  if (sidebar) {
    drawSidebar();
    // drawCloseButton();
  } else {
    // drawOpenButton();
  }
  translate(window.innerWidth / 2, window.innerHeight / 2);
  noStroke();
  fill(255);
  text('Distances to scale, planets drawn ' + planetVisualScale + ' times bigger', -150, window.innerHeight / 2 - 20);
  fill(0);
  model.draw();
  model.update(DT);
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}