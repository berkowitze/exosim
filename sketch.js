var t = 0;
counter = 0;
square = function(x) {return x * x;};
SF = 3.0; // scale factor

function Vector3(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.length = Math.sqrt(square(x) + square(y) + square(z));

  this.dot = function(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  };

  this.dist = function(other) {
    return Math.sqrt(square(this.x - other.x) + 
                square(this.y - other.y) +
                square(this.z - other.z));
  };

  this.plus = function(other) {
    return new Vector3(this.x + other.x,
                       this.y + other.y,
                       this.z + other.z);
  };

  this.sub = function(other) {
    return new Vector3(this.x - other.x,
                       this.y - other.y,
                       this.z - other.z);
  };

  this.scale = function(scale) {
    return new Vector3(scale * this.x,
                       scale * this.y,
                       scale * this.z);
  };

  this.normalize = function() {
    return new Vector3(this.x / this.length,
                       this.y / this.length,
                       this.z / this.length);
  };
}
var zero3 = new Vector3(0, 0, 0);

function CelObj({color=null, radius, density,
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

  this.name = name;
  // console.log(this.velocity);
  // console.log(this.position);
  // console.log('done');

  this.updateMassAndVolume = function() {
    this.volume = 4/3 * PI * Math.pow(this.radius, 3);
    this.mass = this.volume * this.density;
  };

  this.force = function(other) {
    scale = other.mass / square(this.dist(other));
    f = this.position.sub(other.position).normalize().scale(scale * 0.1);
    return f;
  };

  this.dist = function(other) {
    return this.position.dist(other.position);
  };

  this.draw = function() {
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

  this.updateMassAndVolume();

}

function Model(objects) {
  this.objects = objects;

  this.update = function(dt) {
    // console.log('updating');
    dt = 0.08;
    forces = [];
    for (var i = 0; i < objects.length; i++) {
      obj = objects[i];
      force = new Vector3(0, 0, 0);
      for (var j = 0; j < objects.length; j++) {
        if (i == j) {
          continue;
        }
        from = objects[j];
        force = force.plus(obj.force(from)).scale(-0.5);
        // force = zero3;
      }
      forces.push(force);
    }

    for (i = 0; i < objects.length; i++) {
      obj = objects[i];
      force = forces[i];
      obj.update(force, dt);
    }
  };
}

function setup() {
  // start = millis();
  // b1 = color(255);
  // b2 = color(0);
  // c1 = color(204, 102, 0);
  // c2 = color(0, 102, 153);
  // create a canvas the same size the window
  createCanvas(window.innerWidth, window.innerHeight);

  colors = [color(172, 128, 255),
            color(166, 226, 44),
            color(104, 216, 239),
            color(253, 150, 33),
            color(249, 36,  114),
            color(231, 219, 116)];
  mars = new CelObj({radius: 50, // 1 is real scale
                     density: 10,
                     initVelocity: new Vector3(50, 0, 0), 
                     position: new Vector3(0, 708, 0), // 70800 is real scale
                     name: 'Mars'
                 });
  p2 = new CelObj({radius: 10,
                   density: 5,
                   initVelocity: new Vector3(-50, 0, 0),
                   position: new Vector3(0, -500, 0),
                   name: 'hi'
                 });
  
  star = new CelObj({color: 'orange',
                     radius: 203,
                     density: 1});
  planets = [mars, p2];
  // p3 = new CelObj({color: 'yellow',
  //                  radius: 10,
  //                  density: 10,
  //                  velocity: new Vector3(0, 100, 0), 
  //                  position: new Vector3(0, -100, 0)
  //                });

  objects = planets.concat(star);
  model = new Model(objects);
}

function draw() {
  translate(window.innerWidth / 2, window.innerHeight / 2);
  background(0, 0, 0);
  noStroke();
  t += 1;
  fill(255);
  text('Not to scale', 0, window.innerHeight / 2 - 20);
  fill(0);
  // var obj;
  // objects.update();
  for (var i = 0; i < objects.length; i++) {
    obj = objects[i];
    obj.draw();
  }
  model.update();

}

function popup(x, y) {
  fill(255,255,255);
  rect(x,y, 100, 100);
}