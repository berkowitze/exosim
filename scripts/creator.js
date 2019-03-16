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
        new Slider({
            minVal: newPlanetMinRadius,
            maxVal: newPlanetMaxRadius,
            val: newPlanetRadius,
            callback: function (newV) {
                newPlanetRadius = newV;
            },
            label: 'Planet radius'
        }),
        new Slider({
            minVal: newPlanetMinDensity,
            maxVal: newPlanetMaxDensity,
            val: newPlanetDensity,
            callback: function (newV) {
                newPlanetDensity = newV;
            },
            label: 'Planet density'
        }),
        new Options({
            label: '',
            callback: function (newV) {
                creating = this.options[newV];
                creationText.text[0] = 'Drag the ' + creating.toLowerCase() + ' into place';
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
        creationText = new TextBox(['Drag the planet into place',
                                    'when you\'re ready!'])
    ];
}