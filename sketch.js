var t = 0;
counter = 0;
square = function(x) {return x * x;};
SF = 3.0; // scale factor
var dt = 0.1;

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
    scale = other.mass / square(this.dist(other));
    f = this.position.sub(other.position).normalized().scale(scale * -0.01);
    return f;
  };

  this.dist = function(other) {
    return this.position.dist(other.position);
  };

  this.draw = function(minRadius) {
    fill(this.color);
    ellipse(this.position.x / SF, this.position.y / SF, this.radius / SF);
    if (this.name != null) {
      fill(255);
      text(this.name, this.position.x / SF + 20, this.position.y / SF + 20);
    }
  };

  this.setDensity = function(newDensity) {
    this.density = newDensity;
    this.updateMassAndVolume();
  };

  this.setRadius = function(newRadius) {
    this.radius = radius;
    this.updateMassAndVolume();
  };

  this.update = function(force, dt) {
    dv = force.scale(dt);
    this.velocity = this.velocity.plus(dv);
    dx = this.velocity.scale(dt);
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
    for (i = 0; i < this.planets.length; i++) {
      planet = this.planets[i];
      planetMomentum = planetMomentum.plus(planet.momentum());
    }
    dv = planetMomentum.scale(1/this.star.mass);
    this.star.velocity = this.star.velocity.sub(dv);
  };

  this.zeroMomentum();
  this.updateMomentum();

  this.update = function(dt) {
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
      obj.update(force, dt);
    }
  };

  this.draw = function() {
    for (var i = 0; i < this.objects.length; i++) {
      obj = this.objects[i];
      obj.draw(this.minRadius);
    }
  };
}

function setup() {
  timeSlider = createSlider(0.001, 1.1, dt, 0.001);
  timeSlider.position(50, 7);
  timeSlider.style('width', '80px');
  timeSlider.id('timeSlider');
  timeSlider.changed(function(e) {
    dt = Number(e.target.value);
  });

  scaleSlider = createSlider(0.5, 200, SF, 0.2);
  scaleSlider.position(50, 34);
  scaleSlider.style('width', '80px');
  scaleSlider.changed(function(e) {
    SF = Number(e.target.value);
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

  mars = new CelObj({radius: 45, // 1 is real scale
                     density: 4,
                     initVelocity: new Vector3(60, 0, 0), 
                     position: new Vector3(0, 500, 0), // 70800 is real scale
                     name: 'Mars'
                 });
  p2 = new CelObj({radius: 10,
                   density: 4,
                   initVelocity: new Vector3(-55, 15, 0),
                   position: new Vector3(0, -600, 0),
                   name: 'Other planet'
                 });
  
  star = new CelObj({color: 'orange',
                     radius: 203,
                     density: 5});
  planets = [mars, p2];
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
  text('Not to scale', 0, window.innerHeight / 2 - 20);
  text('Scale', -window.innerWidth / 2 + 15, -window.innerHeight / 2 + 47);
  text('Time', -window.innerWidth / 2 + 15, -window.innerHeight / 2 + 20);
  fill(0);
  model.draw();
  model.update(dt);
}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}