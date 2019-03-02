var SF = 541169500; // scale factor
var SF_MIN_EXP = 5;
var SF_MAX_EXP = 12;

var DT = 5e3; // timestep
var DT_MIN_EXP = 0;
var DT_MAX_EXP = 6;

var newPlanetRadius = 2e6;
var newPlanetMinRadius = 0.1e6;
var newPlanetMaxRadius = 120e6;

var newPlanetDensity = 3000;
var newPlanetMinDensity = 500;
var newPlanetMaxDensity = 10000;

var FD = 4e11; // forcal distance

var planetVisualScale = 1e3; //1000.0; // visual scale for planets to make them more seeable
var starVisualScale = 1e1; // 10.0;
var G = 6.674e-11;

var ecliptic = 0;

var zero3 = new Vector3(0, 0, 0);

var showLabels = true;
var paused = false;
var hideSidebar = false;
var planetCreator = false;
var showTrails = true;
var draggingNewPlanet = false;
var trashHover = false;

colors = [[172, 128, 255],
          [166, 226, 44],
          [104, 216, 239],
          [253, 150, 33],
          [249, 36,  114],
          [231, 219, 116]];
