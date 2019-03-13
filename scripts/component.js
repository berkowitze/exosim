const compHeight = 20;
const slideWidth = 100;
const buttonWidth = 60;
const HEIGHT_MARGIN = 8;
const sliderCircleRadius = 5;

function Component(box, width, height=1) {
    this.box = box;
    this.width = width;
    this.drawIt = true;

    this.xStart = box.x0 + sliderCircleRadius;
    this.yStart = box.y0 + this.ident * (box.compHeight + box.heightMargin);

    this.xEnd = this.xStart + width;
    this.yEnd = this.yStart + (box.compHeight * height);
    box.y1 = Math.max(box.y1, this.yEnd);

    this.pointIn = function(mouseX, mouseY) {
        return (mouseX >= this.xStart && mouseX <= this.xEnd &&
                mouseY >= this.yStart && mouseY <= this.yEnd);
    };
}

function Slider({label, minVal, maxVal, val, callback}) {
    this.label = label;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.len = maxVal - minVal;
    this.val = val;
    this.callback = callback;
    this.doneOnRelease = true;

    this.init = function(box) {
        Component.call(this, box, slideWidth);
    };

    this.draw = function() {
        fill(90);
        rect(this.box.x0,
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
    };

    this.updateVal = function(mouseX) {
        let x;
        if (mouseX <= this.xStart) {
            x = this.xStart;
        } else if (mouseX >= this.xEnd) {
            x = this.xEnd;
        } else {
            x = mouseX;
        }

        const frac = (x - this.xStart) / (this.xEnd - this.xStart);
        this.val = this.minVal + frac * (this.maxVal - this.minVal);
        this.callback(this.val);
        return this;
    };

    this.setTo = function(newV) {
        this.val = newV;
        this.callback(this.val);
    };

    this.decrement = function() {
        const newV = this.val - this.len / 30;
        this.val = newV >= this.minVal ? newV : this.minVal;
        this.callback(this.val);
    };

    this.increment = function() {
        const newV = this.val + this.len / 30;
        this.val = newV <= this.maxVal ? newV : this.maxVal;
        this.callback(this.val);
    };
}

function Options({label, callback, options, initIndex}) {
    this.label = label;
    this.callback = callback;
    this.options = options;
    this.val = initIndex;

    this.init = function(box) {
        Component.call(this, box, slideWidth*2 - 10);
        this.optWidth = this.width / this.options.length;
    };

    this.draw = function() {
        fill(100);
        rect(this.box.x0, this.yStart, this.width, compHeight, 5);
        fill(150);
        rect(this.box.x0 + this.val * this.optWidth,
             this.yStart,
             this.optWidth,
             compHeight,
             5);
        fill(255);
        textAlign(CENTER, CENTER);
        for (let i = 0; i < this.options.length; i++) {
            text(this.options[i],
                 this.box.x0 + i * this.optWidth,
                 this.yStart,
                 this.optWidth,
                 compHeight);
        }
    };

    this.updateVal = function(x) {
        this.val = int((x - this.xStart) / this.width * this.options.length);
        this.callback(this.val);
    };
}

function Button({label, callback, val=false}) {
    this.label = label;
    this.callback = callback;
    this.val = val;
    this.doneOnRelease = true;

    this.init = function(box) {
        Component.call(this, box, buttonWidth);
    };

    this.draw = function() {
        if (this.val) {
            fill(180);
        }
        else {
            fill(90);
        }
        rect(this.box.x0, this.yStart, buttonWidth, compHeight, 5);

        textAlign(LEFT, CENTER);
        fill(255);
        textSize(12);
        text(this.label, this.xEnd + 10, this.yStart + compHeight / 2);
        textAlign(CENTER, CENTER);
    };

    this.updateVal = function() {
        this.val = !this.val;
        this.callback(this.val);
        return null;
    };

    this.toggle = this.updateVal;
}

function Input(label) {
    this.label = label;
    this.val = [];
    this.border = false;
    this.doneOnRelease = false;

    this.init = function(box) {
        Component.call(this, box, slideWidth);
    };

    this.draw = function() {
        fill(200);
        if (this.border) {
            stroke(0, 50, 200);
        }
        else {
            noStroke();
        }
        rect(this.box.x0,
             this.yStart,
             slideWidth + (2 * sliderCircleRadius),
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
        
        text(txt, this.box.x0 + 4, this.yStart + this.box.compHeight / 2);

        textAlign(CENTER, CENTER);
        textSize(12);
    };

    this.updateVal = function() {
        this.border = true;
        return this;
    };

    this.backspace = function() {
        if (this.val.length) {
            this.val.pop();
        }
    };

    this.keyPress = function(key) {
        this.val.push(key);
    };

    this.clear = function() {
        this.val = [];
    };

    INPUTS.push(this);
}

function TextBox(txt) { // input is a list of strings one element per row
    this.text = txt;
    this.doneOnRelease = true;
    this.init = function(box) {
        Component.call(this, box, slideWidth + 50, this.text.length);
    };

    this.updateVal = function(){};
    this.draw = function() {
        fill(255);
        textAlign(LEFT, TOP);
        textSize(12);
        text(this.text.join('\n'), this.box.x0 + 4, this.yStart + this.box.compHeight / 2,
             this.width, this.yEnd - this.yStart);
        textAlign(CENTER, CENTER);
    };
}

function ComponentBox({xStart, yStart, components,
                       componentHeight=compHeight,
                       heightMargin=HEIGHT_MARGIN,
                       showing=false}) {
    this.compHeight = componentHeight;
    this.x0 = xStart;
    this.y0 = yStart;
    this.heightMargin = heightMargin;
    this.components = components;
    this.showing = showing;

    for (let i = 0; i < components.length; i++) {
        components[i].ident = i;
    }
    this.y1 = 0;
    components.map(comp => comp.init(this));

    this.x1 = this.components.map(comp => comp.xEnd).max();
    this.bg = rect(this.x0, this.y0, (this.x1 - this.x0), (this.y1 - this.y0));
    this.draw = function() {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i].drawIt) {
                this.components[i].draw();
            }
        }
    };

}