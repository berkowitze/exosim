function makeSidebarComponents() {
    return [
        hideButton = new Button({
            label: 'Hide everything [h]',
            callback: function (checked) {
                hideEverything = checked;
            },
            val: hideEverything
        }),
        new Button({
            label: 'Clear solar system',
            callback: function(checked) {
                this.val = false;
                model.clear();
            }
        }),
        new Options({
            label: 'Solar system',
            options: ['Sun', 'Kepler 89'],//, 'Kepler 47'],
            initIndex: 1,
            callback: function(newV) {
                switch (newV) {
                    case 0:
                        model = model2;
                        break;
                    case 1:
                        model = model1;
                        break;
                    case 2:
                        model = model3;
                        break;
                }
            }
        }),
        timeSlider = new Slider({
            minVal: DT_MIN_EXP,
            maxVal: DT_MAX_EXP,
            val: Math.log10(DT),
            callback: function (newV) {
                DT = Math.pow(10, newV);
            },
            label: 'Time Scale [\u2190 \u2192]'
        }),

        scaleSlider = new Slider({
            minVal: SF_MIN_EXP,
            maxVal: SF_MAX_EXP,
            val: Math.log10(SF),
            callback: function (newV) {
                SF = Math.pow(10, newV);
            },
            label: 'Zoom [\u2191 \u2193]'
        }),
        visSlider = new Slider({
            minVal: OBJ_SCALE_MIN,
            maxVal: OBJ_SCALE_MAX,
            val: objectScale,
            callback: function(newV) {
                objectScale = newV;
                this.label = `Visual Scale (${Number(objectScale).toFixed(0)})`;
            },
            label: `Visual Scale (${Number(objectScale).toFixed(0)})`
        }),
        eclipticSlider = new Slider({
            minVal: 0,
            maxVal: Math.PI / 2,
            val: 0,
            callback: function (newV) {
                ecliptic = -newV;
            },
            label: 'Ecliptic angle [s w]'
        }),
        labelsButton = new Button({
            label: 'Show Planet Labels [l]',
            callback: function (checked) {
                showLabels = checked;
            },
            val: showLabels
        }),
        // trailsButton = new Button({
        //     label: 'Show trails [t]',
        //     callback: function (checked) {
        //         this.val = showTrails = (checked && model.objects.length <= 20);
        //     },
        //     val: showTrails
        // }),
        pauseButton = new Button({
            label: 'Pause [space]',
            callback: function (checked) {
                paused = checked;
            },
            val: paused
        }),
        fullscreenButton = new Button({
            label: 'Fullscreen [f]',
            callback: function (checked) {
                fullscreen(checked);
            },
            val: false
        }),
        new Button({
            label: 'Show brightness graphs',
            callback: function(checked) {
                if (checked) { scienceMode = 'occlusion'; }
                else { scienceMode = False; }
            },
            val: scienceMode
        }),
        new Button({
            label: 'Show TTV graphs',
            callback: function(checked) {
                if (checked) { scienceMode = 'TTV'; }
                else { scienceMode = False; }
            },
            val: scienceMode
        }),
        createButton = new Button({
            label: 'Create a Planet',
            callback: function (checked) {
                planetCreator.showing = checked;
            },
            val: planetCreatorShowing
        })
    ];
}