AU = 1.496e11;

class SolarSystem {
  constructor(objects) {
    this.objects = objects;
  }
}

SUN = new Star({color: 'orange',
                radius: 695.508e6,
                density: 1410,
                name: 'Sun',
});

mercury = new Planet({
  orbiting: SUN,
  radius: 2.4395e6,
  density: 5472,
  velocityMagnitude: 47400,
  distanceFromOrbiter: 57.9e9,
  name: 'Mercury'
});

venus = new Planet({
  orbiting: SUN,
  radius: 6.052e6,
  density: 5234,
  velocityMagnitude: 35000,
  distanceFromOrbiter: 108.2e9,
  name: 'Venus'
});

earth = new Planet({
  orbiting: SUN,
  radius: 6.378e6,
  density: 5514,
  distanceFromOrbiter: 149.6e9,
  velocityMagnitude: 29800,
  name: 'Earth'
});

moon = new Moon({
  orbiting: earth,
  radius: 1.7371e6,
  density: 3344,
  distanceFromOrbiter: 3.78e8,
  name: 'Moon',
});

mars = new Planet({
  orbiting: SUN,
  radius: 3.396e6,
  density: 3933,
  distanceFromOrbiter: 227.9e9,
  velocityMagnitude: 24100,
  name: 'Mars'
});

jupiter = new Planet({
  orbiting: SUN,
  radius: 71.492e6,
  density: 1326,
  distanceFromOrbiter: 778.6e9,
  velocityMagnitude: 13100,
  name: 'Jupiter'
});

saturn = new Planet({
  orbiting: SUN,
  radius: 60.28e6,
  density: 687,
  distanceFromOrbiter: 1433.5e9,
  velocityMagnitude: 9700,
  name: 'Saturn'
});

uranus = new Planet({
  orbiting: SUN,
  radius: 25.559e6,
  density: 1271,
  distanceFromOrbiter: 2872.5e9,
  velocityMagnitude: 6800,
  name: 'Uranus'
});

neptune = new Planet({
  orbiting: SUN,
  radius: 24.764e6,
  density: 1638,
  distanceFromOrbiter: 4495.1e9,
  velocityMagnitude: 5400,
  name: 'Neptune'
});

pluto = new Planet({
  orbiting: SUN,
  radius: 1.185e6,
  density: 2095,
  distanceFromOrbiter: 5906.4e9,
  velocityMagnitude: 4700,
  name: 'Pluto'
});

OUR_SOLAR_SYSTEM = [
  SUN,
  mercury,
  venus,
  earth,
  //moon,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto
];

KEP89 = new Star({
  color: 'orange',
  radius: 1.61 * SUN.radius,
  mass: 1.25 * SUN.mass,
  name: 'Kepler-89'
});

KEP89B = new Planet({
  orbiting: KEP89,
  radius: 0.13 * jupiter.radius,
  mass: 8 * earth.mass,
  distanceFromOrbiter: 0.05 * AU,
  name: 'Kepler-89b'
});

KEP89C = new Planet({
  orbiting: KEP89,
  radius: 0.31 * jupiter.radius,
  mass: 9 * earth.mass,
  distanceFromOrbiter: 0.099 * AU,
  name: 'Kepler-89c'
});

KEP89D = new Planet({
  orbiting: KEP89,
  radius: 0.83 * jupiter.radius,
  mass: 0.33 * jupiter.mass,
  distanceFromOrbiter: 0.165 * AU,
  name: 'Kepler-89d'
});

KEP89E = new Planet({
  orbiting: KEP89,
  radius: 0.49 * jupiter.radius,
  mass: 13.5 * earth.mass,
  distanceFromOrbiter: 0.298 * AU,
  name: 'Kepler-89e'
});

KEPLER89 = [
  KEP89,
  KEP89B,
  KEP89C,
  KEP89D,
  KEP89E,
];