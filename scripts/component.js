// var component_count = 0;
var compHeight = 20;
var slideWidth = 100;
var buttonWidth = 60;
var HEIGHT_MARGIN = 8;
var sliderCircleRadius = 5;

function Component(box, width) {
    this.box = box;
    this.width = width;
    this.drawIt = true;

    this.xStart = box.x0 + sliderCircleRadius;
    this.yStart = box.y0 + this.ident * (box.compHeight + box.heightMargin);
    console.log(box);
    console.log(this);

    this.xEnd = this.xStart + width;
    this.yEnd = this.yStart + box.compHeight;

    this.mouseIn = function() {
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
        textAlign(LEFT, CENTER);
        text(this.label, this.xEnd + 10, this.yStart + this.box.compHeight / 2);
        textAlign(CENTER, CENTER);
    };

    this.updateVal = function(mouseX) {
        if (mouseX <= this.xStart || mouseX >= this.xEnd) {
            return;
        }

        frac = (mouseX - this.xStart) / (this.xEnd - this.xStart);
        this.val = this.minVal + frac * (this.maxVal - this.minVal);
        this.callback(this.val);
        return this;
    };
}

function Button({label, callback, val=false}) {
    this.label = label;
    this.callback = callback;
    this.val = val;

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
        text(this.label, this.xEnd + 10, this.yStart + compHeight / 2);
        textAlign(CENTER, CENTER);
    };

    this.updateVal = function() {
        this.val = !this.val;
        this.callback(this.val);
        return null;
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

    for (var i = 0; i < components.length; i++) {
        components[i].ident = i;
    }

    components.map(comp => comp.init(this));

    this.draw = function() {
        for (var i = 0; i < this.components.length; i++) {
            if (this.components[i].drawIt) {
                this.components[i].draw();
            }
        }
    };

}