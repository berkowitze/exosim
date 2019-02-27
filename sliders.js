var component_count = 0;
var comp_height = 20;
var slide_width = 100;
var button_width = 60;
var comp_height_margin = 8;
var comp_left_margin = 20;
var slider_circle_radius = 5;
function Slider({label, minVal, maxVal, val, callback}) {
    this.label = label;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.len = maxVal - minVal;
    this.val = val;

    this.ident = component_count;
    component_count += 1;

    this.callback = callback;
    this.xStart = comp_left_margin + slider_circle_radius;
    this.xEnd = this.xStart + slide_width;
    this.yStart = comp_height_margin + this.ident * (comp_height + comp_height_margin);
    this.yEnd = this.yStart + comp_height;

    this.draw = function() {
        fill(90);
        rect(comp_left_margin,
             this.yStart,
             slide_width + (2 * slider_circle_radius),
             comp_height,
             5);

        fill(colors[3]);
        ellipse(this.xStart + slide_width * ((this.val - this.minVal) / this.len),
                this.yStart + comp_height / 2,
                slider_circle_radius * 2);

        fill(255);
        textAlign(LEFT, CENTER);
        text(this.label, this.xEnd + 10, this.yStart + comp_height / 2);
        textAlign(CENTER, CENTER);
    };

    this.mouseIn = function() {
        return (mouseX >= this.xStart && mouseX <= this.xEnd &&
                mouseY >= this.yStart && mouseY <= this.yEnd);
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
    this.ident = component_count;
    component_count += 1;
    this.val = val;

    this.xStart = comp_left_margin + slider_circle_radius;
    this.xEnd = this.xStart + button_width;
    this.yStart = comp_height_margin + this.ident * (comp_height + comp_height_margin);
    this.yEnd = this.yStart + comp_height;

    this.draw = function() {
        if (this.val) {
            fill(180);
        }
        else {
            fill(90);
        }
        rect(comp_left_margin, this.yStart, button_width, comp_height, 5);

        textAlign(LEFT, CENTER);
        fill(255);
        text(this.label, this.xEnd + 10, this.yStart + comp_height / 2);
        textAlign(CENTER, CENTER);
    };

    this.mouseIn = function() {
        return (mouseX >= this.xStart && mouseX <= this.xEnd &&
                mouseY >= this.yStart && mouseY <= this.yEnd);
    };

    this.updateVal = function() {
        this.val = !this.val;
        this.callback(this.val);
        return null;
    };
}