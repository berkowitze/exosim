square = x => x*x;
exp10 = x => Math.pow(10,x);

var t = 0;
var counter = 0; // for selecting different colors

var SF = 1e9; // scale factor
var SF_MIN_EXP = 5;
var SF_MAX_EXP = 12;

var DT = 1e5; // timestep
var DT_MIN_EXP = 3;
var DT_MAX_EXP = 8;

var FD = 4e11; // forcal distance

var planetVisualScale = 1e4; //1000.0; // visual scale for planets to make them more seeable
var starVisualScale = 1e2; // 10.0;
var G = 6.674e-11;

var ecliptic = 0;

var zero3 = new Vector3(0, 0, 0);

function CelObj({radius, density, color=null,
                 position=null, initVelocity=null, name=null}) {
  if (color == null) {
    this.color = colors[counter % colors.length];
    counter += 1;
  }
  else {
    this.color = color;
  }

  this.radius = radius;
  this.density = density;
  this.name = name;

  if (position == null) {
    this.position = zero3;
  } else {
    this.position = position;
  }

  if (initVelocity == null) {
    this.velocity = zero3;
  }
  else {
    this.velocity = initVelocity;
  }

  this.updateMassAndVolume = function() {
    this.volume = 4/3 * PI * Math.pow(this.radius, 3);
    this.mass = this.volume * this.density;
  };

  this.force = function(other) {
    scale = -G * other.mass / square(this.dist(other));
    f = this.position.sub(other.position).normalized().scale(scale);
    return f;
  };

  this.dist = function(other) {
    return this.position.dist(other.position);
  };

  this.project = function(ecliptic) {

  }

  this.draw = function(minRadius) {
    fill(this.color);

    var norm = new Vector3(0, Math.sin(ecliptic), Math.cos(ecliptic));
    var inline = norm.scale(this.position.dot(norm));
    var planar =  this.position.sub(inline);
    var perspectiveScale = FD/(FD+inline.dot(norm));
    console.log(perspectiveScale);

    ellipse(planar.x / SF, planar.y / SF, this.radius * perspectiveScale / SF * planetVisualScale);
    if (this.name != null) {
      fill(255);
      text(this.name, this.position.x / SF + 15, this.position.y / SF + 15);
    }
  };


  this.starDraw = function() {
    fill(this.color);
    ellipse(this.position.x / SF, this.position.y / SF, this.radius / SF * starVisualScale);
  };

  this.setDensity = function(newDensity) {
    this.density = newDensity;
    this.updateMassAndVolume();
  };

  this.setRadius = function(newRadius) {
    this.radius = radius;
    this.updateMassAndVolume();
  };

  this.update = function(force, DT) {
    dv = force.scale(DT);
    this.velocity = this.velocity.plus(dv);
    dx = this.velocity.scale(DT);
    this.position = this.position.plus(dx);
  };

  this.momentum = function() {
    return this.velocity.scale(this.mass);
  };

  this.updateMassAndVolume();

}

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
  timeSlider = createSlider(DT_MIN_EXP, DT_MAX_EXP, Math.log10(DT), 0.1);
  timeSlider.position(50, 7);
  timeSlider.style('width', '80px');
  timeSlider.id('timeSlider');
  timeSlider.changed(function(e) {
    DT = Math.pow(10, Number(e.target.value));
  });

  scaleSlider = createSlider(SF_MIN_EXP, SF_MAX_EXP, Math.log10(SF), 0.1);
  scaleSlider.position(50, 34);
  scaleSlider.style('width', '80px');
  scaleSlider.changed(function(e) {
    SF = Math.pow(10, Number(e.target.value));
  });

  eclipticSlider = createSlider(0, PI/2, ecliptic, 0.01);
  eclipticSlider.position(50, 61);
  eclipticSlider.style('width', '80px');
  eclipticSlider.changed(function(e) {
    ecliptic = Number(e.target.value);
  });
  // start = millis();
  // create a canvas the same size the window
  createCanvas(window.innerWidth, window.innerHeight);

  colors = [color(172, 128, 255),
            color(166, 226, 44),
            color(104, 216, 239),
            color(253, 150, 33),
            color(249, 36,  114),
            color(231, 219, 116)];

  mars = new CelObj({radius: 3.389e6, // 1 is real scale
                     density: 4000,
                     initVelocity: new Vector3(24100, 0, 0), 
                     position: new Vector3(0, 227.9e9, 0),
                     name: 'Mars'
                 });
  // p2 = new CelObj({radius: 10,
  //                  density: 4,
  //                  initVelocity: new Vector3(-55, 15, 0),
  //                  position: new Vector3(0, -600, 0),
  //                  name: 'Other planet'
  //                });
  
  star = new CelObj({color: 'orange',
                     radius: 695.508e6,
                     density: 1410,
                     name: 'Star'});
  planets = [mars];
  // p3 = new CelObj({color: 'yellow',
  //                  radius: 10,
  //                  density: 10,
  //                  velocity: new Vector3(0, 100, 0), 
  //                  position: new Vector3(0, -100, 0)
  //                });

  model = new Model(planets, star);
}

function draw() {
  translate(window.innerWidth / 2, window.innerHeight / 2);
  background(0, 0, 0);
  noStroke();
  t += 1;
  fill(255);
  text('Distances to scale, planets drawn ' + planetVisualScale + ' times bigger.' + ' Stars drawn ' + starVisualScale + ' times bigger.', -230, window.innerHeight / 2 - 20);
  text('Scale', -window.innerWidth / 2 + 15, -window.innerHeight / 2 + 47);
  text('Time', -window.innerWidth / 2 + 15, -window.innerHeight / 2 + 20);
  fill(0);
  model.draw();
  model.update(DT);
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}