mercury = new CelObj({
  radius: 2.4395e6,
  density: 5472,
  velocityMagnitude: 47400,
  distanceFromSun: 57.9e9,
  name: 'Mercury'
});

venus = new CelObj({
  radius: 6.052e6,
  density: 5234,
  velocityMagnitude: 35000,
  distanceFromSun: 108.2e9,
  name: 'Venus'
});

earth = new CelObj({
  radius: 6.378e6,
  density: 5514,
  distanceFromSun: 149.6e9,
  velocityMagnitude: 29800,
  name: 'Earth'
});

mars = new CelObj({
  radius: 3.396e6,
  density: 3933,
  distanceFromSun: 227.9e9,
  velocityMagnitude: 24100,
  name: 'Mars'
});

jupiter = new CelObj({
  radius: 71.492e6,
  density: 1326,
  distanceFromSun: 778.6e9,
  velocityMagnitude: 13100,
  name: 'Jupiter'
});

saturn = new CelObj({
  radius: 60.28e6,
  density: 687,
  distanceFromSun: 1433.5e9,
  velocityMagnitude: 9700,
  name: 'Saturn'
});

uranus = new CelObj({
  radius: 25.559e6,
  density: 1271,
  distanceFromSun: 2872.5e9,
  velocityMagnitude: 6800,
  name: 'Uranus'
});

neptune = new CelObj({
  radius: 24.764e6,
  density: 1638,
  distanceFromSun: 4495.1e9,
  velocityMagnitude: 5400,
  name: 'Neptune'
});

pluto = new CelObj({
  radius: 1.185e6,
  density: 2095,
  distanceFromSun: 5906.4e9,
  velocityMagnitude: 4700,
  name: 'Pluto'
});
  
SUN = new CelObj({color: 'orange',
                  radius: 695.508e6,
                  density: 1410,
                  name: 'Star'});

OUR_SOLAR_SYSTEM = [
  mercury,
  venus,
  earth,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
  pluto
];
