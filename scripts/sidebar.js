function makeSidebarComponents() {
    return [
        hideButton = new Button({
            label: 'Hide Sidebar [h]',
            callback: function (checked) {
                hideSidebar = checked;
                this.label = checked ? 'Show Sidebar [h]' : 'Hide Sidebar [h]';
                for (let i = 1; i < this.box.components.length; i++) {
                    this.box.components[i].drawIt = !this.box.components[i].drawIt;
                }
            },
            val: hideSidebar
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
            label: 'Scale Factor [\u2191 \u2193]'
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
        trailsButton = new Button({
            label: 'Show trails [t]',
            callback: function (checked) {
                this.val = showTrails = (checked && model.objects.length <= 20);
            },
            val: showTrails
        }),
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
            label: 'Create a Planet',
            callback: function (checked) {
                planetCreator.showing = checked;
            },
            val: planetCreatorShowing
        })
    ];
}