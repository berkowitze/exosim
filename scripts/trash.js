function drawTrash(xStart, yStart, baseWidth, color) {
  noFill();
  stroke(color);
  strokeWeight(2);

  baseHeight = 4 * baseWidth / 3;
  lidOverlap = baseWidth / 15;
  lidHeight = baseHeight / 10;
  handleHeight = lidHeight * 4/5;
  handleWidth = baseWidth/3;
  handleStart = xStart + (baseWidth / 3);
  stripeHeight = baseHeight * 6/10;
  stripeWidth = baseWidth / 15;
  stripeY = yStart + baseHeight / 5;
  stripesX = xStart + baseWidth / 5;
  stripeSep = baseWidth / 3.75;

  rect(xStart, yStart, baseWidth, baseHeight, 0, 0, 4, 4);
  rect(xStart - lidOverlap, yStart - lidHeight,
       baseWidth + 2*lidOverlap, lidHeight, 2);
  rect(handleStart, yStart - lidHeight - handleHeight,
       handleWidth, handleHeight, 3);
  strokeWeight(1);
  rect(stripesX, stripeY, stripeWidth, stripeHeight, 3);
  rect(stripesX + stripeSep, stripeY, stripeWidth, stripeHeight, 3);
  rect(stripesX + 2*stripeSep, stripeY, stripeWidth, stripeHeight, 3);
  noStroke();
  fill(0);
}

function trashUpdate() {
  if (planetClicked != null) {
    var trashX = w - 50;
    var trashY = h - 50;
    var minX = trashX - 20;
    var minY = trashY - 20;
    var maxX = trashX + 30;
    var maxY = trashY + 32;
    if (mouseX >= minX && mouseX <= maxX &&
        mouseY >= minY && mouseY <= maxY) {
      trashColor = color(255, 72, 49);
      trashHover = true;
    }
    else {
      trashColor = color(255, 255, 255);
      trashHover = false;
    }
    drawTrash(trashX, trashY, 20, trashColor);
  }
  else {
    trashHover = false;
  }
}