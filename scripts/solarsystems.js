SUN = new CelObj({color: 'orange',
                  radius: 695.508e6,
                  density: 1410,
                  name: 'Star',
                  type: 0
});

mercury = new CelObj({
  orbiting: SUN,
  radius: 2.4395e6,
  density: 5472,
  velocityMagnitude: 47400,
  distanceFromOrbiter: 57.9e9,
  name: 'Mercury'
});

venus = new CelObj({
  orbiting: SUN,
  radius: 6.052e6,
  density: 5234,
  velocityMagnitude: 35000,
  distanceFromOrbiter: 108.2e9,
  name: 'Venus'
});

earth = new CelObj({
  orbiting: SUN,
  radius: 6.378e6,
  density: 5514,
  distanceFromOrbiter: 149.6e9,
  velocityMagnitude: 29800,
  name: 'Earth'
});

moon = new CelObj({
  orbiting: earth,
  radius: 1.7371e6,
  density: 3344,
  distanceFromOrbiter: 3.78e8,
  name: 'Moon',
  type: 2
});

mars = new CelObj({
  orbiting: SUN,
  radius: 3.396e6,
  density: 3933,
  distanceFromOrbiter: 227.9e9,
  velocityMagnitude: 24100,
  name: 'Mars'
});

jupiter = new CelObj({
  orbiting: SUN,
  radius: 71.492e6,
  density: 1326,
  distanceFromOrbiter: 778.6e9,
  velocityMagnitude: 13100,
  name: 'Jupiter'
});

saturn = new CelObj({
  orbiting: SUN,
  radius: 60.28e6,
  density: 687,
  distanceFromOrbiter: 1433.5e9,
  velocityMagnitude: 9700,
  name: 'Saturn'
});

uranus = new CelObj({
  orbiting: SUN,
  radius: 25.559e6,
  density: 1271,
  distanceFromOrbiter: 2872.5e9,
  velocityMagnitude: 6800,
  name: 'Uranus'
});

neptune = new CelObj({
  orbiting: SUN,
  radius: 24.764e6,
  density: 1638,
  distanceFromOrbiter: 4495.1e9,
  velocityMagnitude: 5400,
  name: 'Neptune'
});

pluto = new CelObj({
  orbiting: SUN,
  radius: 1.185e6,
  density: 2095,
  distanceFromOrbiter: 5906.4e9,
  velocityMagnitude: 4700,
  name: 'Pluto'
});

OUR_SOLAR_SYSTEM = [
  mercury,
  venus,
  earth,
  moon,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto
];
