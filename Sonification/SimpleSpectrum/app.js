/**
 * Created by Takahiko Tsuchiya on 7/11/18.
 */

let SimpleSpectrum = {
    pluginDim: [350, 230],

    playButton: null,
    pitchSlider: null,
    pitchCurve: dtm.data(0.1,50).line(1000).expc(20).expc(20),

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
        frequency: null
    },

    init: function () {
        let self = SimpleSpectrum;

        self.size = 128;
        self.real = new Float32Array(self.size);
        self.imag = new Float32Array(self.size);

        self.real[self.size-1] = 0.0;

        self.actx = new (window.AudioContext || window.webkitAudioContext)();

        self.playButton = new Nexus.Toggle('#play-toggle', {
            size: [40, 20],
            state: true
        });

        self.pitchSlider = new Nexus.Slider('#pitch-slider', {
            size: [120, 20],
            mode: 'absolute',
            min: 0,
            max: 1,
            step: 0,
            value: 0.5
        });

        self.playButton.on('change', function (v) {
            if (v) {
                self.play();
            } else {
                self.stop();
            }
        });

        self.pitchSlider.on('change', function (v) {
            self.synth.frequency = self.pitchCurve.phase(v * .999).get(0);

            if (self.synth.osc) {
                self.synth.osc.frequency.setValueAtTime(self.synth.frequency, self.actx.currentTime);
            }
        });

        self.synth.frequency = self.pitchCurve.phase(.5).get(0);
        self.play();

        codapInterface.init({
            name: 'Simple Spectrum',
            dimensions: {
                width: self.pluginDim[0],
                height: self.pluginDim[1]
            },
            title: 'Simple Spectrum',
            version: '1.0'
        }).then(function () {
            self.queryDataContext();
        });

        codapInterface.on('notify', '*', function (notice) {
            console.log(notice);
            if (notice.resource === 'documentChangeNotice') {
                self.queryDataContext();
            } else if (notice.resource.includes('dataContextChangeNotice')) {
                if (notice.values.operation === 'selectCases') {
                    codapInterface.sendRequest({
                        action: 'get',
                        resource: 'dataContext[' + app.dataCtx + '].selectionList'
                    }).then(function (result) {
                        self.selected = result.values.map(function (c) {
                            return c.caseID;
                        });

                        self.filterBySelection();
                    });
                } else if (notice.values.operation === 'updateCases') {
                    notice.values.result.cases.forEach(function (c) {
                        app.allCases[app.caseIDs.indexOf(c.id)].case = c;
                    });
                    app.updateBinIndices();
                    self.filterBySelection();
                }
            } else if (notice.resource === 'component') {
                if (notice.values.operation === 'create' && notice.values.type === 'graph') {
                    app.graphID = notice.values.id;
                } else if (notice.values.operation === 'attributeChange') {
                    codapInterface.sendRequest({
                        action: 'get',
                        resource: 'component[' + app.graphID + ']'
                    }).then(function (result) {
                        if (result.values.hasOwnProperty('yAttributeName')) {
                            app.graphAttrs['yAttr'] = result.values.yAttributeName;

                            if (app.followGraph) {
                                app.magAttr = app.graphAttrs['yAttr'];
                                app.onMagAttrSelection();
                            }
                        }

                        if (result.values.hasOwnProperty('xAttributeName')) {
                            app.graphAttrs['xAttr'] = result.values.xAttributeName;

                            if (app.followGraph) {
                                app.orderAttr = app.graphAttrs['xAttr'];
                                app.onOrderAttrSelection();
                            }
                        }
                    });
                }
            }
        });
    },

    queryDataContext: function () {
        codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
        }).then(function (result) {
            app.dataCtxList = result.values.map(function (dataCtx) {
                return dataCtx.name;
            });

            if (app.dataCtxList.length !== 0) {
                app.dataCtx = app.dataCtxList[0];
                app.onDataCtxSelection();
            }
        });
    },

    play: function () {
        let self = SimpleSpectrum;
        let now = self.actx.currentTime;

        self.synth.osc = self.actx.createOscillator();
        self.synth.gain = self.actx.createGain();
        self.synth.osc.connect(self.synth.gain);
        self.synth.gain.connect(self.actx.destination);

        self.filterBySelection();
        self.synth.osc.frequency.setValueAtTime(self.synth.frequency, now);

        self.synth.gain.gain.setValueAtTime(0., now);
        self.synth.gain.gain.linearRampToValueAtTime(.05, now+0.1);

        self.synth.osc.start(now);
    },

    stop: function () {
        let self = SimpleSpectrum;
        let now = self.actx.currentTime;
        self.synth.osc.stop(now);
    },

    // TODO: not needed?
    setNewCoefs: function (coefs) {
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

    setNewCoefsByPosition: function (coefs, binIndices) {
        let self = SimpleSpectrum;
        self.size = self.sizeWhenOrdered + 1; // +1 for DC at index=0
        self.real = new Float32Array(self.size);
        self.imag = new Float32Array(self.size);

        // TODO: bad assumption with the range
        app.normalizedCoefs = dtm.data(coefs).filter(function (v) {
            return !(Number.isNaN(v));
        }).range(0.1,1);

        app.normalizedCoefs.eachv(function (v, i) {
            if (v > self.real[binIndices[i]]) {
                self.real[binIndices[i]] = v;
            }
        });

        // self.resetPeriodicWave(self.real);
        self.filterBySelection();
    },

    filterBySelection: function () {
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

    resetPeriodicWave: function (real) {
        let self = SimpleSpectrum;
        if (self.synth.osc) {
            let wave = self.actx.createPeriodicWave(real, self.imag, {
                disableNormalization: !self.normalize
            });
            self.synth.osc.setPeriodicWave(wave);
        }
    }
};

let app = new Vue({
    el: '#app',
    data: {
        dataCtx: '',
        dataCtxList: [],
        collection: '',
        collectionList: [],
        allCases: [],
        caseIDs: [],
        attrList: [],
        followGraph: true,
        graphID: null,
        graphAttrs: {},
        magAttr: '',
        orderAttr: '',
        orderedIDs: [],
        binIndices: [1,2],
        normalizedCoefs: []
    },
    methods: {
        onDataCtxSelection: function () {
            codapInterface.sendRequest({
                action: 'get',
                resource: 'dataContext[' + app.dataCtx + '].collectionList'
            }).then(function (result) {
                app.collectionList = result.values.map(function (collection) {
                    return collection.name;
                });
                if (app.collectionList.length !== 0) {
                    app.collection = app.collectionList[0];
                    app.onCollectionSelection();
                }
            });
        },
        onCollectionSelection: function () {
            codapInterface.sendRequest({
                action: 'get',
                resource: 'dataContext[' + app.dataCtx + '].collection[' + app.collection + '].attributeList'
            }).then(function (result) {
                app.attrList = result.values.map(function (attr) {
                    return attr.name;
                });
            });

            app.getAllCases();
        },
        onMagAttrSelection: function () {
            // SimpleSpectrum.setNewCoefs(app.allCases.map(function (c) {
            //     return c.case.values[app.magAttr];
            // }));

            SimpleSpectrum.setNewCoefsByPosition(app.allCases.map(function (c) {
                return parseFloat(c.case.values[app.magAttr]);
            }), app.binIndices);
        },
        onOrderAttrSelection: function () {
            if (app.orderAttr === 'Default') {
                app.getAllCases().then(function () {
                    app.onMagAttrSelection();
                });
            } else {
                app.updateBinIndices();
            }
        },
        updateBinIndices: function () {
            let positionBy = dtm.data(app.allCases.map(function (c) {
                return parseFloat(c.case.values[app.orderAttr]);
            })).filter(function (v) {
                return !(Number.isNaN(v));
            });

            // TODO: bad assumption
            if (positionBy.get('min') > 0) {
                positionBy.range(0,.95,0,positionBy.get('max'));
            } else {
                positionBy.range(0,.95);
            }

            // Increment all by 1 for DC
            app.binIndices = dtm.range(SimpleSpectrum.sizeWhenOrdered)
                .phase(positionBy,'step').add(1).get();

            SimpleSpectrum.setNewCoefsByPosition(app.allCases.map(function (c) {
                return parseFloat(c.case.values[app.magAttr]);
            }), app.binIndices);
        },
        onFollowGraphToggle: function () {
            if (app.followGraph) {
                if (app.graphAttrs.hasOwnProperty('yAttr')) {
                    app.magAttr = app.graphAttrs['yAttr'];
                    app.onMagAttrSelection();
                }

                if (app.graphAttrs.hasOwnProperty('xAttr')) {
                    app.orderAttr = app.graphAttrs['xAttr'];
                    app.onOrderAttrSelection();
                }
            }
        },
        getAllCases: function () {
            return codapInterface.sendRequest({
                action: 'get',
                resource: 'dataContext[' + app.dataCtx + '].collection[' + app.collection + '].allCases'
            }).then(function (result) {
                app.allCases = result.values.cases;
                app.caseIDs = app.allCases.map(function (c) {
                    return c.case.id;
                });
                // app.binIndices = dtm.range(app.allCases.length)
                //     .add(1).get(); // increment all to skip DC
                app.binIndices = dtm.range(SimpleSpectrum.sizeWhenOrdered)
                    .add(1).get();
            });
        }
    },
    mounted: SimpleSpectrum.init
});