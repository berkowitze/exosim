let time = 0;

// let SF = 541169500; // scale factor
SF = 341169500;
const SF_MIN_EXP = 5;
const SF_MAX_EXP = 12;

let DT = 250; // time step
const DT_MIN_EXP = 0;
const DT_MAX_EXP = 6;

let newObjectRadiusScales = {
    Planet: [0.1e6, 5e6, 120e6],
    Moon: [6200, 1.73e6, 5e6],
    Star: [1.7e8, 6.9551e8, 50e8]
};

let newObjectRadius = newObjectRadiusScales.Planet[1];

let newObjectDensityScales = {
    Planet: [500, 3000, 10000],
    Moon: [300, 2000, 5000],
    Star: [100, 1400, 14000]
};

let newObjectDensity = newObjectDensityScales.Planet[1];

let FD = 4e13; // focal distance (camera distance to origin in meters)

let objectScale = 8;
const OBJ_SCALE_MIN = 1;
const OBJ_SCALE_MAX = 50;

const G = 6.674e-11;
const SEC_PER_YEAR = 31557600;
let INPUTS = [];
let ecliptic = 0;
let creating = "Planet";
let draggingOnto = null;

// initial variables
const zero3 = new Vector3(0, 0, 0);

let showLabels = true;
let showTrails = false;
let paused = false;
let hideEverything = false;
let planetCreatorShowing = false;
let draggingNewObject = false;
let trashHover = false;

const DRAW_PERSPECTIVE = true;

// global declarations
let sidebarComponents, planetCreatorComponents;
let planetCreator, sidebar;

let componentClicked = null;

let w, h, newPlanetX, newPlanetY, componentBoxes;
let blueSlider, redSlider, greenSlider, nameInput;
let blue, red, green;

let hideButton, timeSlider, fullscreenButton, pauseButton, trailsButton,
    labelsButton, eclipticSlider, scaleSlider;

let planetClicked, inputSelected;
let model;

let newObjectDrawRadius;

const colors = [[172, 128, 255],
                [166, 226, 44],
                [104, 216, 239],
                [253, 150, 33],
                [249, 36,  114],
                [231, 219, 116]];

getColor = (function() {
    let counter = 0;
    return function() {
        let col = colors[counter % colors.length];
        counter += 1;
        return col;
    };
})();

cube = x => x*x*x;

let creationTextOptions = {
    Moon: ['Drag the moon onto its', 'orbiting planet when ready!'],
    Planet: ['Drag the planet onto its',
             'orbiting star when ready!'],
    Star: ['Drag the star into place', 'when you\'re ready!']
};