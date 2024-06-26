planets = OUR_SOLAR_SYSTEM;
star = SUN;

function windowResized() {
  w = windowWidth;
  h = windowHeight;
  sizeDependentSetup();
  resizeCanvas(w, h);
}

function sizeDependentSetup() {
  // wrote this so resize works
  sidebar = new ComponentBox({
    xStart: 13,
    yStart: 13,
    components: sidebarComponents,
    showing: sidebar == null ? true : sidebar.showing,
  });

  planetCreator = new ComponentBox({
    xStart: w - 200,
    yStart: 13,
    components: planetCreatorComponents,
    showing: planetCreator == null ? false : planetCreator.showing,
  });

  newPlanetX = w - 150;
  newPlanetY = planetCreator.yEnd + 20;

  componentBoxes = [sidebar, planetCreator];
}

function setup() {
  w = window.innerWidth;
  h = window.innerHeight;
  createCanvas(w, h);

  planetClicked = null;
  inputSelected = null;
  red = green = blue = 125;

  sidebarComponents = makeSidebarComponents();

  planetCreatorComponents = createPlanetComponents();

  sizeDependentSetup();

  model1 = new Model(KEPLER89);
  model2 = new Model(OUR_SOLAR_SYSTEM);
  // model3 = new Model(KEPLER47);
  model = model1;
  // model.origin = earth;

  // new OcclusionGraph(KEP89, model);
}

function keyPressed() {
  if (inputSelected != null && keyCode === BACKSPACE) {
    inputSelected.backspace();
    return;
  }
  switch (keyCode) {
    case LEFT_ARROW:
      timeSlider.decrement();
      break;
    case RIGHT_ARROW:
      timeSlider.increment();
      break;
    case UP_ARROW:
      scaleSlider.decrement();
      break;
    case DOWN_ARROW:
      scaleSlider.increment();
  }
}

function componentPress() {
  for (let i = 0; i < componentBoxes.length; i++) {
    let box = componentBoxes[i];
    if (!box.showing) {
      continue;
    }
    for (let i = 0; i < box.components.length; i++) {
      let component = box.components[i];
      if (component.pointIn(mouseX, mouseY)) {
        for (let j = 0; j < INPUTS.length; j++) {
          let inp = INPUTS[j];
          if (inp === component) {
            continue;
          }
          inp.border = false;
        }
        componentClicked = component.updateVal(mouseX);
        return true;
      }
    }
  }
  componentClicked = null;
  return false;
}

function celObjPress(model) {
  let revObjs = model.objects.concat().reverse();
  for (let j = 0; j < revObjs.length; j++) {
    if (revObjs[j].mouseIn(7)) {
      if (mouseButton == RIGHT) {
        model.origin = revObjs[j];
        return false;
      } else if (mouseButton == LEFT) {
        model.origin = new PointObject(zero3);
        planetClicked = revObjs[j];
        eclipticSlider.setTo(0);
        return true;
      } else {
        return false;
      }
    }
  }
  planetClicked = null;
  return false;
}

function keyTyped() {
  if (inputSelected != null) {
    inputSelected.keyPress(key);
    return;
  }
  switch (key) {
    case " ":
      pauseButton.toggle();
      break;
    case "h":
      hideButton.toggle();
      break;
    case "w":
      eclipticSlider.decrement();
      break;
    case "s":
      eclipticSlider.increment();
      break;
    case "m":
      let audio = $("audio").get(0);
      audio.muted = !audio.muted;
      break;
    // case 't':
    //   trailsButton.toggle();
    //   break;
    case "l":
      labelsButton.toggle();
      break;
    case "f":
      fullscreenButton.toggle();
      break;
  }
}

function newPlanetPress() {
  if (!planetCreator) {
    return false;
  }
  return (
    square(mouseX - newPlanetX) + square(mouseY - newPlanetY) <
    square(newObjectDrawRadius) * 1.3
  );
}

function sc() {
  const op = model.origin.position;

  mxScaled = SF * (mouseX - w / 2) + op.x;
  myScaled = SF * (mouseY - h / 2) + op.y;
}

function createNewObject(orbiting = null) {
  const density = newObjectDensity;
  const radius = newObjectRadius;
  const nameInp = nameInput.val.join("");
  const name = nameInp !== "" ? nameInp : "[Unnamed]";
  const c = color(redSlider.val, greenSlider.val, blueSlider.val);
  const pos = new Vector3(mxScaled, myScaled, 0);

  let newObj;
  if (orbiting == null) {
    newObj = new Star({
      radius: radius,
      density: density,
      color: c,
      name: name,
      position: pos,
    });
  } else {
    opts = {
      orbiting: orbiting,
      radius: radius,
      density: density,
      distanceFromOrbiter: pos.dist(orbiting.position),
      angle: Math.atan2(
        pos.y - orbiting.position.y,
        pos.x - orbiting.position.x
      ),
      color: c,
      name: name,
    };
    if (creating === "Planet") {
      newObj = new Planet(opts);
    } else {
      newObj = new Moon(opts);
    }
  }
  model.addObject(newObj);
  if (model.objects.length > 20 && showTrails) {
    trailsButton.toggle();
  }
  draggingOnto = null;
  draggingNewObject = false;
}

function mousePressed() {
  if (!hideEverything && componentPress()) {
    for (let i = 0; i < INPUTS.length; i++) {
      let inp = INPUTS[i];
      if (inp === componentClicked) {
        inputSelected = inp;
        continue;
      }
      inp.border = false;
    }
    return;
  }
  for (let i = 0; i < INPUTS.length; i++) {
    INPUTS[i].border = false;
  }
  inputSelected = null;
  if (draggingNewObject) {
    return;
  }
  if (celObjPress(model)) {
    return;
  }
  if (newPlanetPress()) {
    draggingNewObject = true;
  }
}

function mouseReleased() {
  if (draggingNewObject && draggingOnto == null) {
    if (creating === "Star") {
      createNewObject();
      return;
    }
    let hoveredObjs = model.getHoveredObjects();
    if (hoveredObjs.length !== 0) {
      if (hoveredObjs[0].canBeOrbitedBy(creating)) {
        draggingOnto = hoveredObjs[0];
        model.origin = draggingOnto;
        SF = (draggingOnto.radius * 500) / w;
      }
    } else {
      draggingOnto = null;
    }
    if (draggingOnto == null) {
      draggingNewObject = false;
    }
    return;
  } else if (draggingNewObject) {
    // runs when new object has valid orbiter and is placed
    createNewObject(draggingOnto);
  }

  if (componentClicked != null && componentClicked.doneOnRelease) {
    componentClicked = null;
  }
  if (planetClicked != null && trashHover) {
    model.removeObject(planetClicked);
  }
  planetClicked = null;
}

function mouseWheel(event) {
  if (Number.isInteger(event.delta)) {
    return false;
  }

  let newSF = Math.log10(SF + event.delta * 1e8);
  if (
    isNaN(newSF) ||
    newSF < scaleSlider.minVal ||
    newSF > scaleSlider.maxVal
  ) {
    return false;
  }
  scaleSlider.setTo(newSF);
  return false;
}

function interfacePreUpdate() {
  if (ecliptic !== 0 && showTrails) {
    trailsButton.toggle();
  }
  if (draggingNewObject) {
    eclipticSlider.setTo(0);
  }
  background(0, 0, 0);
  if (componentClicked != null) {
    componentClicked = componentClicked.updateVal(mouseX);
  }
  if (planetClicked != null) {
    planetClicked.updatePosition(mouseX, mouseY);
  }
}

function timeOverlay() {
  fill(255);
  textAlign(LEFT, CENTER);
  text((model.time / SEC_PER_YEAR).toFixed(3) + " years", 13, h - 20);
}

function overlays() {
  timeOverlay();
  trashUpdate();

  for (let i = 0; i < componentBoxes.length; i++) {
    if (componentBoxes[i].showing) {
      componentBoxes[i].draw();
    }
  }
  if (planetCreator.showing) {
    fill(color(red, green, blue));
    newObjectDrawRadius = map(
      newObjectRadius,
      radiusSlider.minVal,
      radiusSlider.maxVal,
      5,
      30
    );
    if (!draggingNewObject) {
      ellipse(newPlanetX, newPlanetY, newObjectDrawRadius);
    } else {
      ellipse(mouseX, mouseY, newObjectDrawRadius);
      if (draggingOnto) {
        noFill();
        stroke(255);
        let m = new Vector3(mxScaled, myScaled, 0);
        let r = m.dist(model.origin.position) / SF;
        ellipse(w / 2, h / 2, r * 2, r * 2);
        fill(255);
        noStroke();
      }
    }
  }
}

function science() {
  if (scienceMode == "TTV") {
    drawTTVGraphs();
  } else {
    for (let i = 0; i < model.graphs.length; i++) {
      let graph = model.graphs[i];
      if (scienceMode == "occlusion") {
        graph.bigplot(i);
      } else {
        graph.miniplot(i);
      }
    }
  }
}

function drawTTVGraphs() {
  for (let i = 0; i < model.objects.length; i++) {
    if (model.objects[i] instanceof Star) {
      var j = 0;
      model.objects[i].transitTimeGraphs.forEach(function (graph) {
        graph.plot(j);
        j = j + 1;
      });
    }
  }
}

function draw() {
  sc();

  interfacePreUpdate();
  translate(w / 2, h / 2);

  noStroke();
  fill(0);
  model.draw();
  translate(-w / 2, -h / 2);

  if (!paused) {
    // model.updateRungeKutta(DT);
    model.update(DT);
  }

  if (!hideEverything) {
    overlays();
    science();
  }
}
