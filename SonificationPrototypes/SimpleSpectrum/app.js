const plugin = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();
const moveRecorder = new PluginMovesRecorder(plugin);

const SimpleSpectrum = {
    playButton: null,
    pitchSlider: null,
    pitchCurve: dtm.data(0.1,50).line(1000).expc(20).expc(20),
    panSlider: null,

    size: null,
    sizeWhenOrdered: 2048,
    real: null,
    imag: null,
    selected: [],

    actx: null,
    normalize: false,
    synth: {
        wave: null,
        osc: null,
        gain: null,
        pan: null,
        frequency: null
    },

    init() {
        let self = SimpleSpectrum;

        self.size = this.sizeWhenOrdered;
        self.real = new Float32Array(self.size);
        self.imag = new Float32Array(self.size);

        self.real[self.size-1] = 0.0;

        self.actx = new (window.AudioContext || window.webkitAudioContext)();

        self.playButton = new Nexus.Toggle('#play-toggle', {
            size: [40, 20],
            state: false
        });

        self.playButton.on('change', function (v) {
            if (v) {
                self.play();
            } else {
                self.stop();
            }
        });

        self.pitchSlider = new Nexus.Slider('#pitch-slider', {
            size: [120, 20],
            mode: 'absolute',
            min: 0,
            max: 1,
            step: 0,
            value: 0.5
        });

        self.pitchSlider.on('change', function (v) {
            self.synth.frequency = self.pitchCurve.phase(v * .999).get(0);

            if (self.synth.osc) {
                self.synth.osc.frequency.setValueAtTime(self.synth.frequency, self.actx.currentTime);
            }
        });

        self.panSlider = new Nexus.Slider('#pan-slider', {
            size: [120, 20],
            mode: 'absolute',
            min: -1,
            max: 1,
            step: 0,
            value: 0
        });

        self.panSlider.on('change', v => {
            self.synth.pan.pan.setValueAtTime(v, self.actx.currentTime);
        });

        self.synth.frequency = self.pitchCurve.phase(.5).get(0);
    },

    play() {
        let self = SimpleSpectrum;
        let now = self.actx.currentTime;

        self.synth.osc = self.actx.createOscillator();
        self.synth.gain = self.actx.createGain();
        self.synth.pan = self.actx.createStereoPanner();

        self.synth.osc.connect(self.synth.gain);
        self.synth.gain.connect(self.synth.pan);
        self.synth.pan.connect(self.actx.destination);

        self.filterBySelection();
        self.synth.osc.frequency.setValueAtTime(self.synth.frequency, now);

        self.synth.gain.gain.setValueAtTime(0., now);
        self.synth.gain.gain.linearRampToValueAtTime(.05, now+0.1);

        self.synth.osc.start(now);
    },

    stop() {
        let self = SimpleSpectrum;
        let now = self.actx.currentTime;
        self.synth.osc.stop(now);
    },

    // TODO: not needed?
    setNewCoefs(coefs) {
        let self = SimpleSpectrum;
        self.size = coefs.length + 1;

        // TODO: bad assumption with the range
        app.normalizedCoefs = dtm.data(coefs).filter(function (v) {
            return !(Number.isNaN(v));
        }).range(0.1,1);

        self.real = app.normalizedCoefs().prepend(0).get();
        self.imag = new Float32Array(self.size);
        self.resetPeriodicWave(self.real);
    },

    setNewCoefsByPosition(coefs, binIndices) {
        let self = SimpleSpectrum;
        self.size = self.sizeWhenOrdered + 1; // +1 for DC at index=0
        self.real = new Float32Array(self.size);
        self.imag = new Float32Array(self.size);

        // TODO: bad assumption with the range
        app.normalizedCoefs = dtm.data(coefs).filter(function (v) {
            return !(Number.isNaN(v));
        }).range(0.1,1).logc(10);

        app.normalizedCoefs.eachv(function (v, i) {
            if (v > self.real[binIndices[i]]) {
                self.real[binIndices[i]] = v;
            }
        });

        // self.resetPeriodicWave(self.real);
        self.filterBySelection();
    },

    filterBySelection() {
        let self = SimpleSpectrum;
        let real = new Float32Array(self.size);
        self.selected.forEach(function (caseID) {
            let index = app.caseIDs.indexOf(caseID);

            if (app.normalizedCoefs.get(index) > real[app.binIndices[index]]) {
                real[app.binIndices[index]] = app.normalizedCoefs.get(index);
            }
        });
        self.resetPeriodicWave(real);

        // TODO: return real-val array rather than calling resetPeriodicWave implicitly
    },

    resetPeriodicWave(real) {
        let self = SimpleSpectrum;
        if (self.synth.osc) {
            let wave = self.actx.createPeriodicWave(real, self.imag, {
                disableNormalization: !self.normalize
            });
            self.synth.osc.setPeriodicWave(wave);
        }
    }
};

const app = new Vue({
    el: '#app',
    data: {
        name: 'Simple Spectrum',
        dimensions: {
            width: 375,
            height: 170
        },
        dataCtx: '',
        dataCtxList: [],
        collection: '',
        collectionList: [],
        allCases: [],
        caseIDs: [],
        // itemIDs: [],
        attrList: [],
        followGraph: false,
        graphID: null,
        graphAttrs: {},

        magAttr: '',
        magAttrIsDescending: false,

        orderAttr: '',
        orderAttrIsDescending: false,

        orderedIDs: [],
        binIndices: [1,2],
        normalizedCoefs: dtm.data(0.5),

        globals: [],
        state: {
            dataCtx: null,
            magAttr: null,
            orderAttr: null
        }
    },
    methods: {
        setupDrag() {
            dragHandler.on('dragenter', (data, els) => {
                els.forEach(el => {
                    el.style.backgroundColor = 'rgba(255,255,0,0.5)';
                });
            });

            dragHandler.on('dragleave', (data, els) => {
                els.forEach(el => {
                    el.style.backgroundColor = 'transparent';
                });
            });

            dragHandler.on('drop', (data, els) => {
                els.forEach(el => {
                    if (this.dataCtx !== data.context.name) {
                        this.dataCtx = data.context.name;
                        this.onDataCtxSelection();
                    }

                    if (el.id === 'mag-drop-area') {
                        this.magAttr = data.text;
                        this.onMagAttrSelection();
                        this.recordToMoveRecorder('mag');
                    } else if (el.id === 'pitch-drop-area') {
                        this.orderAttr = data.text;
                        this.onOrderAttrSelection();
                        this.recordToMoveRecorder('order');
                    }
                });
            });

            dragHandler.on('dragstart', (data, els) => {
                els.forEach(el => {
                    el.style.outline = '3px solid rgba(0,255,255,0.5)';
                });
            });
            dragHandler.on('dragend', (data, els) => {
                els.forEach(el => {
                    el.style.backgroundColor = 'transparent';
                    el.style.outline = '3px solid transparent';
                });
            });

            // dragHandler.on('dragenterframe', console.log);
            // dragHandler.on('dragleaveframe', console.log);
        },
        onGetData(result) {
            if (result) {
                this.dataCtxList = plugin.getContexts();
                if (this.dataCtx) {
                    this.onDataCtxSelection();
                }
                this.updateBinIndices();
                SimpleSpectrum.filterBySelection();
            }
        },
        onGetGlobals() {
            this.globals = plugin.globals;

            this.updateBinIndices();
            SimpleSpectrum.filterBySelection();
        },
        checkIfGlobal(attr) {
            return this.globals.some(g => g.name === attr);
        },

        onDataCtxSelection() {
            this.attrList = plugin.getAttributesForContext(this.dataCtx);
            this.caseIDs = plugin.items[this.dataCtx].map(item => item.id); // TODO: item.caseID
        },
        onMagAttrSelection() {
            if (this.magAttr) {
                if (this.checkIfGlobal(this.magAttr)) {
                    let global = this.globals.find(g => g.name === this.magAttr);
                    SimpleSpectrum.setNewCoefsByPosition(plugin.items[this.dataCtx].map(_ => {
                        return this.magAttrIsDescending ? (1-global.value) : global.value;
                    }), this.binIndices);
                } else {
                    SimpleSpectrum.setNewCoefsByPosition(plugin.items[this.dataCtx].map(item => {
                        let val = parseFloat(item.values[this.magAttr]);
                        return this.magAttrIsDescending ? (1-val) : val;
                    }), this.binIndices);
                }
            }
        },
        onOrderAttrSelection() {
            // if (this.orderAttr === 'Default') {
            //     // this.getAllCases().then(function () {
            //     //     this.onMagAttrSelection();
            //     // });
            // } else {
            //     this.updateBinIndices();
            // }

            this.updateBinIndices();
        },
        updateBinIndices() {
            let positionBy = null;

            if (this.orderAttr) {
                if (this.checkIfGlobal(this.orderAttr)) {
                    let global = this.globals.find(g => g.name === this.orderAttr);

                    positionBy = dtm.data(plugin.items[this.dataCtx].map(_ => {
                        return this.orderAttrIsDescending ? (1-global.value) : global.value;
                    }));
                    this.binIndices = dtm.range(SimpleSpectrum.sizeWhenOrdered)
                        .add(1).phase(positionBy,'step').get();
                } else {
                    // positionBy = dtm.data(plugin.items[this.dataCtx].map(item => {
                    //     return parseFloat(item.values[this.orderAttr]);
                    // })).mapv(function (v) {
                    //     return isNaN(v) ? 0 : v; // -1 (0 later) should be filtered out in playback.
                    // });
                    //     .filter(function (v) {
                    //     return !(Number.isNaN(v));
                    // });

                    let range = plugin.attrValueRanges[this.dataCtx][this.orderAttr];
                    if (range.type === 'numeric') {
                        this.binIndices = plugin.items[this.dataCtx].map(item => {
                            let val = parseFloat(item.values[this.orderAttr]);

                            if (isNaN(val)) {
                                val = -1;
                            } else {
                                // Phase value (0.05-0.95).
                                val = (val-range.min)/(range.max-range.min);
                                if (this.orderAttrIsDescending) {
                                    val = 1 - val;
                                }

                                // Actual index (increment all by 1 for DC).
                                val = Math.round((val*0.9+0.05)*SimpleSpectrum.sizeWhenOrdered)+1;
                            }
                            return val;
                        });
                    } else {
                        this.binIndices = plugin.items[this.dataCtx].map(_ => -1);
                    }

                    // positionBy = dtm.data(plugin.items[this.dataCtx].map(item => {
                    //     return parseFloat(item.values[this.orderAttr]);
                    // })).mapv(function (v) {
                    //     return isNaN(v) ? 0 : v; // -1 (0 later) should be filtered out in playback.
                    // });
                    //
                    // positionBy.range(0,.95); // Phase values.
                }

                // Increment all by 1 for DC
                // this.binIndices = dtm.range(SimpleSpectrum.sizeWhenOrdered)
                //     .add(1).phase(positionBy,'step').get();
            }

            // SimpleSpectrum.setNewCoefsByPosition(plugin.items[this.dataCtx].map(item => {
            //     return parseFloat(item.values[this.magAttr]);
            // }), this.binIndices);

            this.onMagAttrSelection();
        },
        recordToMoveRecorder(param) {
            if (!(plugin.items[DATAMOVES_CONTROLS_DATA.name] && plugin.items[DATAMOVES_CONTROLS_DATA.name][0].values['Record'])) {
                return null;
            }

            moveRecorder.record({
                Plugin: this.name,
                ID: plugin.ID, // TODO: Proper plugin ID
                Type: 'Mapping',
                Context: this.dataCtx,
                Attribute: this[`${param}Attr`],
                Parameter: param.charAt(0).toUpperCase() + param.slice(1)
            });
        },
        openInfoPage() {
            plugin.openSharedInfoPage();
        }
        // getAllCases() {
        //     return codapInterface.sendRequest({
        //         action: 'get',
        //         resource: 'dataContext[' + app.dataCtx + '].collection[' + app.collection + '].allCases'
        //     }).then(function (result) {
        //         app.allCases = result.values.cases;
        //         app.caseIDs = app.allCases.map(function (c) {
        //             return c.case.id;
        //         });
        //         // app.binIndices = dtm.range(app.allCases.length)
        //         //     .add(1).get(); // increment all to skip DC
        //         app.binIndices = dtm.range(SimpleSpectrum.sizeWhenOrdered)
        //             .add(1).get();
        //     });
        // }
    },
    mounted() {
        plugin.init('Simple Spectrum', this.dimensions, '1.01')
            .then(this.onGetData);

        SimpleSpectrum.init();

        this.setupDrag();

        codapInterface.on('notify', '*', notice => {
            if (!plugin.checkNoticeIdentity(notice)) {
                return null;
            }
            let contextName = notice.resource.split('[').pop().split(']')[0];
            let operation = notice.values.operation;

            if (notice.resource === 'documentChangeNotice') {
                if (contextName === DATAMOVES_DATA.name) {
                    plugin.queryAllData(contextName);
                } else {
                    plugin.queryAllData(contextName).then(this.onGetData);
                }
            } else if (notice.resource.includes('dataContextChangeNotice')) {
                if (contextName === DATAMOVES_DATA.name) {
                    if (operation === 'selectCases' && plugin.items[DATAMOVES_CONTROLS_DATA.name][0].values['Replay']) {
                        plugin.getSelectedItems(contextName).then(items => {
                            items.forEach(item => {
                                let values = item.values;

                                if (values.ID === plugin.ID) {
                                    let type = values.Parameter && values.Parameter.toLowerCase();
                                    if (type) {
                                        this.onDataCtxSelection();
                                        this[`${type}Attr`] = values.Attribute;
                                        if (type === 'order') {
                                            this.onOrderAttrSelection();
                                        } else {
                                            this.onMagAttrSelection();
                                        }
                                    }
                                }
                            })
                        });
                    }
                } else {
                    if (notice.values.operation === 'selectCases') {
                        if (this.dataCtx) {
                            codapInterface.sendRequest({
                                action: 'get',
                                resource: 'dataContext[' + this.dataCtx + '].selectionList'
                            }).then(result => {
                                SimpleSpectrum.selected = result.values.map(c => c.caseID);
                                SimpleSpectrum.filterBySelection();
                            });
                        } else if (notice.values.operation === 'dependentCases') {
                            plugin.queryAllData().then(this.onGetData);
                        }
                    } else {
                        // notice.values.result.cases.forEach(c => {
                        //     this.allCases[this.caseIDs.indexOf(c.id)].case = c;
                        // });

                        plugin.queryAllData().then(this.onGetData);
                    }
                    // else if (notice.values.operation === 'updateCases' || notice.values.operation === 'dependentCases') {
                    //     plugin.queryAllData().then(this.onGetData);
                    // }
                }
            }
            // else if (notice.resource === 'component') {
            //     if (notice.values.operation === 'create' && notice.values.type === 'graph') {
            //         this.graphID = notice.values.id;
            //     } else if (notice.values.operation === 'attributeChange') {
            //         // codapInterface.sendRequest({
            //         //     action: 'get',
            //         //     resource: 'component[' + this.graphID + ']'
            //         // }).then(result => {
            //         //     if (result.values.hasOwnProperty('yAttributeName')) {
            //         //         this.graphAttrs['yAttr'] = result.values.yAttributeName;
            //         //
            //         //         if (this.followGraph) {
            //         //             this.magAttr = this.graphAttrs['yAttr'];
            //         //             this.onMagAttrSelection();
            //         //         }
            //         //     }
            //         //
            //         //     if (result.values.hasOwnProperty('xAttributeName')) {
            //         //         this.graphAttrs['xAttr'] = result.values.xAttributeName;
            //         //
            //         //         if (this.followGraph) {
            //         //             this.orderAttr = this.graphAttrs['xAttr'];
            //         //             this.onOrderAttrSelection();
            //         //         }
            //         //     }
            //         // });
            //     }
            // }
            else if (notice.resource === 'component' && notice.values.type === 'slider') {
                plugin.queryGlobalValues().then(this.onGetGlobals);
            } else if (notice.resource === 'undoChangeNotice') {
                plugin.queryGlobalValues().then(this.onGetGlobals);
            }
        });
    }
});