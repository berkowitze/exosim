const regularComponentWidth = 100;
const compHeight = 20;
const slideWidth = 100;
const buttonWidth = 60;
const HEIGHT_MARGIN = 8;
const sliderCircleRadius = 5;

class Component {
  constructor(width, height=1) {
    this.width = width;
    this.drawIt = true;
    this.height = height;
  }

  placeInBox(box, id) { // must be called before draw
    this.box = box;
    this.ident = id;

    this.xStart = box.xStart + sliderCircleRadius;
    this.yStart = box.yStart + this.ident * (box.compHeight + box.heightMargin);

    this.xEnd = this.xStart + this.width;
    this.yEnd = this.yStart + (box.compHeight * this.height);

    box.xEnd = Math.max(box.xEnd, this.xEnd);
    box.yEnd = Math.max(box.yEnd, this.yEnd);   
  }

  pointIn(x, y) {
    return (x >= this.xStart && x <= this.xEnd &&
      y >= this.yStart && y <= this.yEnd);
  }
}

class Slider extends Component {
  constructor({label, minVal, maxVal, val, callback}) {
    super(slideWidth);
    this.label = label;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.len = maxVal - minVal;
    this.val = val;
    this.callback = callback;
    this.doneOnRelease = true;
  }

  draw() {
    fill(90);
    rect(this.box.xStart,
     this.yStart,
     slideWidth + (2 * sliderCircleRadius),
     this.box.compHeight,
     5);

    fill(colors[3]);
    ellipse(this.xStart + slideWidth * ((this.val - this.minVal) / this.len),
      this.yStart + this.box.compHeight/2,
      sliderCircleRadius * 2);

    fill(255);
    textSize(12);
    textAlign(LEFT, CENTER);
    text(this.label, this.xEnd + 10, this.yStart + this.box.compHeight / 2);
    textAlign(CENTER, CENTER);
  }

  updateVal(mouseX) {
    let x;
    if (mouseX <= this.xStart) {
      x = this.xStart;
    } else if (mouseX >= this.xEnd) {
      x = this.xEnd;
    } else {
      x = mouseX;
    }

    let newVal = map(x, this.xStart, this.xEnd, this.minVal, this.maxVal);
    this.setTo(newVal);
    this.callback(this.val);
    return this;
  }

  updateBounds(newMin, newMax) {
    const newVal = map(this.val, this.minVal, this.maxVal, newMin, newMax);

    this.val = newVal;
    this.minVal = newMin;
    this.maxVal = newMax;
    this.len = newMax - newMin;
    this.setTo(newVal);
  }

  setTo(newVal) {
    this.val = newVal;
    this.callback(this.val);
  }

  decrement() {
    const newVCand = this.val - this.len / 30;
    const newVal = newVCand >= this.minVal ? newVCand : this.minVal;
    this.setTo(newVal);
  }

  increment() {
    const newVCand = this.val + this.len / 30;
    const newVal = newVCand <= this.maxVal ? newVCand : this.maxVal;
    this.setTo(newVal);
  }
}

class Options extends Component {
  constructor({label, callback, options, initIndex}) {
    super(slideWidth + 85);
    this.label = label;
    this.callback = callback;
    this.options = options;
    this.optWidth = this.width / this.options.length;
    this.val = initIndex;
  }

  draw() {
    fill(90);
    rect(this.box.xStart, this.yStart, this.width, compHeight, 5);
    fill(150);
    rect(this.box.xStart + this.val * this.optWidth,
         this.yStart,
         this.optWidth,
         compHeight,
         5);
    fill(255);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.options.length; i++) {
      text(this.options[i],
       this.box.xStart + i * this.optWidth,
       this.yStart,
       this.optWidth,
       compHeight);
    }
  }

  updateVal(x) {
    this.val = int((x - this.xStart) / this.width * this.options.length);
    this.callback(this.val);
  }
}

class Button extends Component {
  constructor({label, callback, val=false}) {
    super(buttonWidth);
    this.label = label;
    this.callback = callback;
    this.val = val;
    this.doneOnRelease = true;
    this.toggle = this.updateVal;
  }

  draw() {
    if (this.val) {
      fill(180);
    }
    else {
      fill(90);
    }
    rect(this.box.xStart, this.yStart, buttonWidth, compHeight, 5);

    textAlign(LEFT, CENTER);
    fill(255);
    textSize(12);
    text(this.label, this.xEnd + 10, this.yStart + compHeight / 2);
    textAlign(CENTER, CENTER);
  }

  updateVal() {
    this.val = !this.val;
    this.callback(this.val);
    return null;
  }

 off() {
    this.val = false;
    return null;
  }
}

class Input extends Component {
  constructor(label) {
    super(regularComponentWidth);
    this.label = label;
    this.val = [];
    this.border = false;
    this.doneOnRelease = false;
    INPUTS.push(this);
  }

  draw() {
    fill(180);
    if (this.border) {
      stroke(0, 50, 200);
    }
    else {
      noStroke();
    }
    rect(this.box.xStart,
         this.yStart,
         this.width + (2 * sliderCircleRadius),
         this.box.compHeight,
         5);
    noStroke();
    fill(100);
    textSize(14);
    textAlign(LEFT, CENTER);
    const txt = !this.val.length ? this.label : this.val.join('');
    if (!this.val.length) {
      fill(100);
    }
    else {
      fill(0);
    }

    text(txt, this.box.xStart + 5, this.yStart + this.box.compHeight / 2);

    textAlign(CENTER, CENTER);
    textSize(12);
  }

  updateVal() {
    this.border = true;
    return this;
  }

  backspace() {
    if (this.val.length) {
      this.val.pop();
    }
  }

  keyPress(key) {
    this.val.push(key);
  }

  clear() {
    this.val = [];
  }
}

class TextBox extends Component {
  constructor(txt) {
    super(slideWidth + 50, txt.length);
    this.text = txt;
    this.doneOnRelease = true;
  }

  updateVal() {}

  draw() {
    fill(255);
    textAlign(LEFT, TOP);
    textSize(12);
    text(this.text.join('\n'),
         this.box.xStart + 4,
         this.yStart + this.box.compHeight / 2,
         this.width, this.yEnd - this.yStart);
    textAlign(CENTER, CENTER);
  }
}

class ComponentBox {
 constructor({xStart, yStart, components,
              componentHeight=compHeight,
              heightMargin=HEIGHT_MARGIN,
              showing=true, bgColor=null}) {
    this.compHeight = componentHeight;
    this.xStart = xStart;
    this.yStart = yStart;
    this.heightMargin = heightMargin;
    this.components = components;
    this.showing = showing;
    this.bgColor = bgColor;

    this.xEnd = xStart; // updated in loop below
    this.yEnd = yStart; // updated in loop below
    for (let i = 0; i < components.length; i++) {
      components[i].placeInBox(this, i);
    }

    this.width = this.xEnd - this.xStart;
    this.height = this.yEnd - this.yStart;

  }

  draw() {
    if (this.bgColor != null) {
      fill(this.bgColor);
      rect(this.xStart, this.yStart, this.width, this.height, 3);
    }
    for (let i = 0; i < this.components.length; i++) {
      if (this.components[i].drawIt) {
        this.components[i].draw();
      }
    }
  }
}
