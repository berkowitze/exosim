var slide_count = 0;
var slide_height = 20;
var slide_width = 100;
var slide_height_margin = 8;
var slider_left_margin = 20;
var slider_circle_radius = 5;
function Slider({label, minVal, maxVal, val, callback}) {
    this.label = label;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.len = maxVal - minVal;
    this.val = val;

    this.ident = slide_count;
    slide_count += 1;

    this.callback = callback;
    this.xStart = slider_left_margin + slider_circle_radius;
    this.xEnd = this.xStart + slide_width;
    this.yStart = slide_height_margin + this.ident * (slide_height + slide_height_margin);
    this.yEnd = this.yStart + slide_height;

    this.draw = function() {
        fill(90);
        rect(slider_left_margin,
             this.yStart,
             slide_width + (2 * slider_circle_radius),
             slide_height,
             5);

        fill(colors[3]);
        ellipse(this.xStart + slide_width * ((this.val - this.minVal) / this.len),
                this.yStart + slide_height / 2,
                slider_circle_radius * 2);

        fill(255);
        textAlign(LEFT, CENTER);
        text(this.label, this.xEnd + 10, this.yStart + slide_height / 2);
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
    };
}