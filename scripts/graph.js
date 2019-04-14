class OcclusionGraph {
    constructor(star, model) {
        this.storeLast = 256;
        this.star = star;
        this.model = model;
        this.others = model.objects.filter(obj => obj != star);

        this.occlusions = new Deque(this.storeLast);
        
        this.max = 0.0;
        this.height = 30;
        this.width = this.storeLast;
    }

    update() {
        let totalOcclusion = this.others.reduce((a, planet) => this.star.occlusion(planet) + a, 0);

        this.max = Math.max(this.max, totalOcclusion);

        let len = this.occlusions.enqueue(totalOcclusion);
        if (this.occlusions.length > this.storeLast) {
            this.occlusions.dequeue();
        }
    }

    plot(index) {
        let occlusions = this.occlusions.toArray();
        let x = w-this.width - 10;
        let y = h - ((this.height - 10) * (index + 1)) - 30 * index;
        fill(255);
        textAlign(LEFT, TOP);
        text(`${this.star.name} occlusion`, x+3, y-textSize()-3);
        fill(55);
        // rect(x-2, y-2, this.width+4, this.height+4);
        fill(212, 175, 55);
        for (let i = 0; i < occlusions.length; i++) {
            let occlusion = occlusions[i];
            let xc = x + 2*i;
            // console.log(map(occlusion, 0, this.max, 0, this.height));
            let yc = map(occlusion, 0, this.max, 0, this.height) + y;
            if (isNaN(yc)) {
                yc = y;
            }
            ellipse(x + i, yc, 2);
        }
    }

}