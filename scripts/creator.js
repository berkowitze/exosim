function createPlanetComponents() {
    return [
        redSlider = new Slider({
            minVal: 0,
            maxVal: 255,
            val: red,
            callback: function (newV) {
                red = newV;
            },
            label: 'Red'
        }),
        greenSlider = new Slider({
            minVal: 0,
            maxVal: 255,
            val: green,
            callback: function (newV) {
                green = newV;
            },
            label: 'Green'
        }),
        blueSlider = new Slider({
            minVal: 0,
            maxVal: 255,
            val: blue,
            callback: function (newV) {
                blue = newV;
            },
            label: 'Blue'
        }),
        nameInput = new Input('Planet name'),
        radiusSlider = new Slider({
            minVal: newObjectRadiusScales.Planet[0],
            maxVal: newObjectRadiusScales.Planet[2],
            val: newObjectRadiusScales.Planet[1],
            callback: function (newV) {
                newObjectRadius = newV;
            },
            label: 'Planet radius'
        }),
        densitySlider = new Slider({
            minVal: newObjectDensityScales.Planet[0],
            maxVal: newObjectDensityScales.Planet[2],
            val: newObjectDensityScales.Planet[1],
            callback: function (newV) {
                newObjectDensity = newV;
            },
            label: 'Planet density'
        }),
        new Options({
            label: '',
            callback: function (newV) {
                creating = this.options[newV];
                createButton.label = 'Create a ' + creating;
                densitySlider.label = creating + ' density';
                radiusSlider.label = creating + ' radius';
                nameInput.label = creating + ' name';
                creationText.text = creationTextOptions[creating];

                densitySlider.updateBounds(newObjectDensityScales[creating][0],
                                           newObjectDensityScales[creating][2]);
                radiusSlider.updateBounds(newObjectRadiusScales[creating][0],
                                           newObjectRadiusScales[creating][2]);

            },
            options: ['Star', 'Planet', 'Moon'],
            initIndex: 1
        }),
        new Button({
            label: 'Reset',
            callback: function (checked) {
                if (!checked) {
                    return;
                }
                red = 125;
                green = 125;
                blue = 125;
                redSlider.val = 125;
                greenSlider.val = 125;
                blueSlider.val = 125;
                nameInput.clear();
                inputSelected = null;
                this.toggle();
            }
        }),
        creationText = new TextBox(creationTextOptions.Planet)
    ];
}