const plugin = new CodapPluginHelper(codapInterface);

const app = new Vue({
    el: '#app',
    data: {
        name: TRANSPORT_DATA.name,
        dimensions: {
            width: 200,
            height: 100
        },

        play: false,
        speed: 0.5,
        firstItem: 0
    },
    methods: {
        setup() {
            if (plugin.getContexts() && plugin.getContexts().includes(this.name)) {
                this.firstItem = plugin.items[this.name][0].itemID;
            } else {
                codapInterface.sendRequest({
                    action: 'create',
                    resource: 'global',
                    values: {
                        name: 'play',
                        value: 'false'
                    }
                });

                // Check any duplicate first.
                codapInterface.sendRequest({
                    action: 'create',
                    resource: 'dataContext',
                    values: {
                        name: this.name,
                        title: this.name,
                        collections: [{
                            name: this.name,
                            title: this.name,
                            attrs: [{
                                name: 'play',
                                editable: true
                            }, {
                                name: 'speed',
                                type: 'numeric',
                                editable: true
                            }]
                        }]
                    }
                }).then(_ => {
                    return codapInterface.sendRequest({
                        action: 'create',
                        resource: `dataContext[${this.name}].item`,
                        values: {
                            play: false,
                            speed: this.speed
                        }
                    }).then(result => {
                        this.firstItem = result.itemIDs[0];
                    });
                });
            }
        },
        updateTable() {
            let values = {
                play: this.play,
                speed: this.speed
            };

            codapInterface.sendRequest({
                action: 'update',
                resource: `dataContext[${this.name}].item[${this.firstItem}]`,
                values: values
            });
        },
        openInfoPage() {
            plugin.openSharedInfoPage();
        }
    },
    mounted() {
        plugin.init(this.name, this.dimensions).then(this.setup);

        let playToggle = new Nexus.Toggle('#play-toggle', {
            state: false
        });

        playToggle.on('change', v => {
            this.play = v;

            // TODO: hmmm
            // Maybe not needed
            codapInterface.sendRequest({
                action: 'update',
                resource: 'global[play]',
                values: {
                    value: v.toString()
                }
            });

            // Global notification for other plugins.
            // Note: Very very ugly.
            // let values = {
            //     name: 'Transport',
            //     values: {
            //         play: playToggle.state,
            //         speed: speedSlider.value
            //     }
            // };
            //
            // codapInterface.sendRequest({
            //     action: 'notify',
            //     resource: 'logMessage',
            //     values: {
            //         formatStr: `plugin: ${JSON.stringify(values)}`,
            //         // replaceArgs: [v.toString()]
            //     }
            // });

            this.updateTable();
        });

        // TODO: BPM, interval, or a normalized value?
        let speedSlider = new Nexus.Slider('#speed-slider', {
            mode: 'absolute',
            value: this.speed
        });

        speedSlider.on('release', _ => {
            this.speed = speedSlider.value;

            // let values = {
            //     name: 'Transport',
            //     values: {
            //         play: playToggle.state,
            //         speed: speedSlider.value
            //     }
            // };
            //
            // codapInterface.sendRequest({
            //     action: 'notify',
            //     resource: 'logMessage',
            //     values: {
            //         formatStr: `plugin: ${JSON.stringify(values)}`,
            //     }
            // });

            this.updateTable();
        });
    }
});