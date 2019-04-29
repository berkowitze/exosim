class Graph {
    constructor(title, storeLast) {
        this.storeLast = storeLast;
        this.vals = new Deque(this.storeLast);

        this.max = 1.0;
        this.min = 1.0;

        this.title = title;
    }

    addVal(val) {
        this.max = Math.max(this.max, val);
        this.min = Math.min(this.min, val);
        this.vals.enqueue(val);
        if (this.vals.length > this.storeLast) {
            this.vals.dequeue();
        }
    }

    plot(index) {
        let vals = this.vals.toArray();

        const plotScale = 0.6;
        const topLeftX = w*(1-plotScale)/2;
        const topLeftY = h*(1-plotScale)/2;
        const plotWidth = w * plotScale;
        const plotHeight = h * plotScale;
        const border = plotHeight * 0.1;

        const textInset = 5;
        const numTicks = 5;

        const plotColor = colors[index];
        
        if (index == 0) {
            // draw the background  of the plot
            fill(90, 90, 90, 100);
            rect(topLeftX, topLeftY, plotWidth, plotHeight, 5);
        }

        // draw the title and the scale along the y axis
        fill(plotColor);
        textAlign(CENTER, TOP);
        text(this.title, topLeftX+plotWidth/2, topLeftY+textInset + index*(textInset +textSize()));
        textAlign(LEFT, TOP);
        for (var i=0; i <= numTicks; i++) {
            let xPos = topLeftX + textInset;
            let yPos = topLeftY + border + textInset + i*(plotHeight-textInset*2 - textSize() - 2*border)/numTicks;
            let val = this.max - i*(this.max - this.min)/numTicks
            text(val.toPrecision(4), xPos, yPos);
        }

        // helpers to get x and y plot coordinates for each data point
        let getxc = i => topLeftX + border + (plotWidth - 2*border) * ( i /vals.length);
        let getyc = o => map(o, this.min, this.max, topLeftY+plotHeight - border, topLeftY + border);

        stroke(plotColor);
        var xcp = getxc(0);
        var ycp = getyc(vals[0]);
        for (let i = 1; i < vals.length; i++) {
            let occlusion = vals[i];
            let xc = getxc(i);
            let yc = getyc(occlusion);
            if (!isNaN(yc)) {
                line(xc, yc, xcp, ycp);
                ycp = yc;
                xcp = xc;
            }
        }
    }
}



class OcclusionGraph {
    constructor(star, model) {
        this.storeLast = 256;
        this.star = star;
        this.model = model;
        
        this.occlusions = new Deque(this.storeLast);
        
        this.max = 1.0;
        this.min = 1.0;
        
        this.height = 30;
        this.width = this.storeLast;

        this.bigGraph = new Graph(`${this.star.name} brightness`, this.storeLast);
    }

    update() {
        let others = model.objects.filter(obj => obj != star);
        let totalOcclusion = 1 - others.reduce((a, planet) => this.star.occlusion(planet) + a, 0);
        this.max = Math.max(this.max, totalOcclusion);
        this.min = Math.min(this.min, totalOcclusion);

        let len = this.occlusions.enqueue(totalOcclusion);
        if (this.occlusions.length > this.storeLast) {
            this.occlusions.dequeue();
        }

        this.bigGraph.addVal(totalOcclusion);
    }

    miniplot(index) {
        let occlusions = this.occlusions.toArray();
        let x = w - this.width - 10;
        let y = h - ((this.height - 10) * (index + 2)) - this.height * index;
        fill(255);
        textAlign(LEFT, TOP);
        text(`${this.star.name} brightness`, x+3, y-textSize()-3);
        fill(212, 175, 55);
        for (let i = 0; i < occlusions.length; i++) {
            let occlusion = occlusions[i];
            let xc = x + 2*i;
            let yc = map(occlusion, this.min, this.max, this.height, 0) + y;
            if (isNaN(yc)) {
                yc = y;
            }
            ellipse(x + i, yc, 2);
        }
    }

    bigplot(index) {
        this.bigGraph.plot(index);
    }
}