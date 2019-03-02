function drawTrash(xStart, yStart, baseWidth, color) {
  noFill();
  stroke(color);
  strokeWeight(2);

  let baseHeight = baseWidth * 4/3;
  let lidOverlap = baseWidth / 15;
  let lidHeight = baseHeight / 10;
  let handleHeight = lidHeight * 4/5;
  let handleWidth = baseWidth / 3;
  let handleStart = xStart + (baseWidth / 3);
  let stripeHeight = baseHeight * 6/10;
  let stripeWidth = baseWidth / 15;
  let stripeY = yStart + baseHeight / 5;
  let stripesX = xStart + baseWidth / 5;
  let stripeSep = baseWidth / 3.75;

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
  let trashColor;
  if (planetClicked != null) {
    let trashX = w - 50;
    let trashY = h - 50;
    let minX = trashX - 20;
    let minY = trashY - 20;
    let maxX = trashX + 30;
    let maxY = trashY + 32;
    if (mouseX >= minX && mouseX <= maxX &&
        mouseY >= minY && mouseY <= maxY) {
      trashColor = color(255, 72, 49);
      trashHover = true;
    } else {
      trashColor = color(255, 255, 255);
      trashHover = false;
    }
    drawTrash(trashX, trashY, 20, trashColor);
  } else {
    trashHover = false;
  }
}