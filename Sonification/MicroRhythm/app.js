const helper = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();
const moveRecorder = new PluginMovesRecorder(helper);

const app = new Vue({
    el: '#app',
    data: {
        name: 'Micro Rhythm',
        dim: {
            width: 325,
            height: 215
        },
        loading: true,

        data: null,
        contexts: null,
        collections: null,
        attributes: null,
        focusedContext: null,
        focusedCollection: null,
        prevSelectedIDs: [],
        globals: [],

        pitchAttribute: null,
        pitchAttrRange: null,
        pitchAttrIsDate: false,
        pitchAttrIsDescending: false,
        pitchArray: [],

        timeAttribute: null,
        timeAttrRange: null,
        timeAttrIsDate: false,
        timeAttrIsDescending: false,
        timeArray: [],

        durationAttribute: null,
        durationAttrRange: null,
        durationAttrIsDate: false,
        durationAttrIsDescending: false,
        durationArray: [],

        loudnessAttribute: null,
        loudnessAttrRange: null,
        loudnessAttrIsDate: false,
        loudnessAttrIsDescending: false,
        loudnessArray: [],

        stereoAttribute: null,
        stereoAttrRange: null,
        stereoAttrIsDate: false,
        stereoAttrIsDescending: false,
        stereoArray: [],

        click: true,

        // TODO: Consolidate into a single file.
        csdFiles: [
            'SinusoidalGrains.csd',
            'SawTooth.csd',
            'PitchedNoise.csd',
            'ContDrums.csd',
            'FMGranular.csd'
        ],
        selectedCsd: null,
        csoundReady: false,

        synchronized: true,

        playToggle: null,
        playing: false,

        speedSlider: null,
        playbackSpeed: 0.5,
    },
    methods: {
        setupUI() {
            this.playToggle = new Nexus.Toggle('#play-toggle', {
                size: [40, 20],
                state: false
            });

            this.playToggle.on('change', v => {
                if (v) {
                    this.play();
                } else {
                    this.stop();
                }
            });

            let clickToggle = new Nexus.Toggle('#click-toggle', {
                size: [40, 20],
                state: true
            });

            clickToggle.on('change', v => {
                this.click = v;
                csound.SetChannel('click', v ? 1 : 0);
            });

            let syncToggle = new Nexus.Toggle('#sync-toggle', {
                size: [40, 20],
                state: this.synchronized
            });

            syncToggle.on('change', v => {
                this.synchronized = v;
            });

            this.speedSlider = new Nexus.Slider('#speed-slider', {
                size: [200, 20],
                mode: 'absolute',
                value: this.playbackSpeed
            });

            this.speedSlider.on('change', v => {
                this.playbackSpeed = v;

                if (this.csoundReady) {
                    csound.SetChannel('playbackSpeed', v);
                }
            });
        },
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
                if (this.contexts && this.contexts.includes(data.context.name) && this.focusedContext !== data.context.name) {
                    this.focusedContext = data.context.name;
                    this.onContextFocused();
                }

                els.forEach(el => {
                    if (this.attributes && this.attributes.includes(data.attribute.name)) {
                        if (el.id.startsWith('pitch')) {
                            this.pitchAttribute = data.attribute.name;
                            this.onPitchAttributeSelectedByUI();
                        } else if (el.id.startsWith('time')) {
                            this.timeAttribute = data.attribute.name;
                            this.onTimeAttributeSelectedByUI();
                        } else if (el.id.startsWith('duration')) {
                            this.durationAttribute = data.attribute.name;
                            this.onDurationAttributeSelectedByUI();
                        } else if (el.id.startsWith('loudness')) {
                            this.loudnessAttribute = data.attribute.name;
                            this.onLoudnessAttributeSelectedByUI();
                        } else if (el.id.startsWith('stereo')) {
                            this.stereoAttribute = data.attribute.name;
                            this.onStereoAttributeSelectedByUI();
                        }
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
        },
        resetPitchTimeMaps() {
            this.pitchAttribute = this.timeAttribute = null;
            this.pitchAttrRange = this.timeAttrRange = null;
        },
        onContextFocused() {
            // this.attributes = null;
            this.attributes = helper.getAttributesForContext(this.focusedContext);

            // this.resetPitchTimeMaps();
        },
        /**
         * @param type {string} pitch, time, loudness, or stereo
         **/
        processMappedAttribute(type) {
            if (this.checkIfGlobal(this[`${type}Attribute`])) {
                this[`${type}AttrRange`] = {
                    len: 1,
                    min: 0,
                    max: 1
                };
            } else {
                this[`${type}AttrRange`] = this.calcRange(this[`${type}Attribute`], this[`${type}AttrIsDate`], this[`${type}AttrIsDescending`]);
            }

            if (this.playing) {
                this.reselectCases();
            }
        },
        recordToMoveRecorder(param) {
            if (!(helper.items[DATAMOVES_CONTROLS_DATA.name] && helper.items[DATAMOVES_CONTROLS_DATA.name][0].values['Record'])) {
                return null;
            }

            moveRecorder.record({
                Plugin: this.name,
                ID: helper.ID, // TODO: Proper plugin ID
                Type: 'Mapping',
                Context: this.focusedContext,
                Attribute: this[`${param}Attribute`],
                Parameter: param.charAt(0).toUpperCase() + param.slice(1),
                Direction: this[`${param}AttrIsDescending`] ? 'Descending' : 'Ascending',
                'Attr Type': this[`${param}AttrIsDate`] ? 'date': 'numeric'
            });
        },
        onBackgroundSelect() {
            console.log('onBackgroundSelect');
          helper.selectSelf();
        },
        onPitchAttributeSelectedByUI() {
            this.processMappedAttribute('pitch');
            this.recordToMoveRecorder('pitch');
        },
        onTimeAttributeSelectedByUI() {
            this.processMappedAttribute('time');
            this.recordToMoveRecorder('time');
        },
        onDurationAttributeSelectedByUI() {
            this.processMappedAttribute('duration');
            this.recordToMoveRecorder('duration');
        },
        onLoudnessAttributeSelectedByUI() {
            this.processMappedAttribute('loudness');
            this.recordToMoveRecorder('loudness');
        },
        onStereoAttributeSelectedByUI() {
            this.processMappedAttribute('stereo');
            this.recordToMoveRecorder('stereo');
        },

        checkIfGlobal(attr) {
            return this.globals.some(g => g.name === attr);
        },

        reselectCases() {
            helper.getSelectedItems(this.focusedContext).then(this.onItemsSelected);
        },
        onCsdFileSelected() {

        },
        onGetData() {
            this.contexts = helper.getContexts();

            if (this.focusedContext) {
                this.attributes = helper.getAttributesForContext(this.focusedContext);

                if (this.playing) {
                    this.reselectCases();
                }
            }
        },
        onGetGlobals() {
            this.globals = helper.globals;

            if (this.playing) {
                this.reselectCases();
            }
        },
        calcRange(attribute, isDateTime, inverted) {
            // let attrValues = helper.getAttributeValues(this.focusedContext, this.focusedCollection, attribute);
            let attrValues = helper.getAttrValuesForContext(this.focusedContext, attribute);

            if (attrValues) {
                if (isDateTime) {
                    attrValues = attrValues.map(Date.parse).filter(v => !Number.isNaN(v));
                } else {
                    attrValues = attrValues.map(parseFloat).filter(v => !Number.isNaN(v));
                }

                if (attrValues.length !== 0) {
                    return {
                        len: attrValues.length,
                        min: inverted ? Math.max(...attrValues) : Math.min(...attrValues),
                        max: inverted ? Math.min(...attrValues) : Math.max(...attrValues)
                    }
                } else {
                    return null;
                }
            }
        },

        prepMapping(args) {
            let param = args['param'];
            let items = args['items'];

            if (this[`${param}AttrRange`]) {
                let range = this[`${param}AttrRange`].max - this[`${param}AttrRange`].min;

                if (range === 0) {
                    this[`${param}Array`] = items.map(c => {
                        return { id: c.id, val: 0.5 };
                    });
                } else {
                    if (this.checkIfGlobal(this[`${param}Attribute`])) {
                        let global = this.globals.find(g => g.name === this[`${param}Attribute`]);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        this[`${param}Array`] = items.map(c => {
                            return {
                                id: c.id,
                                val: value
                            }
                        })
                    } else {
                        this[`${param}Array`] = items.map(c => {
                            let value = this[`${param}AttrIsDate`] ? Date.parse(c.values[this[`${param}Attribute`]]) : c.values[this[`${param}Attribute`]];

                            return {
                                id: c.id,
                                val: isNaN(parseFloat(value)) ? NaN : (value-this[`${param}AttrRange`].min)/range
                            };
                        });
                    }
                }
            }
        },

        onItemsSelected(items) {
            if (this.timeAttrRange) {
                let range = this.timeAttrRange.max - this.timeAttrRange.min;

                if (range === 0) {
                    this.timeArray = items.map(c => {
                        return { id: c.id, val: 0 };
                    });
                } else {
                    if (this.checkIfGlobal(this.timeAttribute)) {
                        let global = this.globals.find(g => g.name === this.timeAttribute);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        this.timeArray = items.map(c => {
                            return {
                                id: c.id,
                                val: value
                            }
                        })
                    } else {
                        this.timeArray = items.map(c => {
                            let value = this.timeAttrIsDate ? Date.parse(c.values[this.timeAttribute]) : c.values[this.timeAttribute];
                            return {
                                id: c.id,
                                val: isNaN(parseFloat(value)) ? NaN : (value-this.timeAttrRange.min)/range * ((this.timeAttrRange.len-1)/this.timeAttrRange.len)
                            }
                        });
                    }
                }
            }

            ['pitch', 'duration', 'loudness', 'stereo'].forEach(param => this.prepMapping({ param: param, items: items }));

            if (this.playing) {
                this.stopNotes(this.prevSelectedIDs);
                this.triggerNotes();
            }

            this.prevSelectedIDs = items.map(c => c.id);
        },
        stopNotes(ids) {
            ids.forEach(id => csound.Event(`i -1.${id} 0 1`));
        },
        triggerNotes() {
            this.timeArray.forEach((d,i) => {
                // let gain = 1-this.timeArray.length/this.timeAttrRange.len;

                let pitch = this.pitchArray.length === this.timeArray.length ? this.pitchArray[i].val : 0.5;
                let duration = this.durationArray.length === this.timeArray.length ? this.durationArray[i].val : 0.5;
                let loudness = this.loudnessArray.length === this.timeArray.length ? this.loudnessArray[i].val * 0.95 + 0.05 : 0.5;
                let stereo = this.stereoArray.length === this.timeArray.length ? this.stereoArray[i].val : 0.5;

                if (![d.val,pitch,duration,loudness,stereo].some(isNaN)) {
                    csound.Event(`i 1.${d.id} 0 -1 ${d.val} ${duration} ${pitch} ${loudness} ${stereo}`);
                }
            });
        },
        play() {
            if (!this.csoundReady) {
                return null;
            }

            if (CSOUND_AUDIO_CONTEXT.state !== 'running') {
                CSOUND_AUDIO_CONTEXT.resume().then(_ => {
                    this.stop();

                    csound.PlayCsd(this.selectedCsd).then(() => {
                        this.playing = true;
                        csound.SetChannel('playbackSpeed', this.playbackSpeed);
                        csound.SetChannel('click', this.click ? 1 : 0);

                        if (this.timeArray.length !== 0) {
                            this.triggerNotes();
                        }
                    });
                });
            } else {
                csound.PlayCsd(this.selectedCsd).then(() => {
                    this.playing = true;
                    csound.SetChannel('playbackSpeed', this.playbackSpeed);
                    csound.SetChannel('click', this.click ? 1 : 0);

                    if (this.timeArray.length !== 0) {
                        this.triggerNotes();
                    }
                });
            }
        },
        stop() {
            if (!this.csoundReady) {
                return null;
            }

            csound.Stop();
            this.playing = false;
        },
        openInfoPage() {
            helper.openSharedInfoPage();
        }
    },
    mounted() {
        this.setupDrag();
        this.setupUI();

        helper.init(this.name, this.dim)
            // .then(helper.monitorLogMessages.bind(helper))
            .then(this.onGetData);

        codapInterface.on('notify', '*', notice => {
            if (!helper.checkNoticeIdentity(notice)) {
                return null;
            }

            if (notice.resource === 'documentChangeNotice') {
                helper.queryAllData().then(this.onGetData);
            } else if (notice.resource.includes('dataContextChangeNotice')) {
                let contextName = notice.resource.split('[').pop().split(']')[0];
                let operation = notice.values.operation;

                if (contextName === TRANSPORT_DATA.name && operation === 'updateCases') {
                    let firstItem = helper.items['Transport'][0].itemID; // TODO: A little hacky.

                    if (this.synchronized) {
                        codapInterface.sendRequest({
                            action: 'get',
                            resource: `dataContext[${TRANSPORT_DATA.name}].item[${firstItem}]`
                        }).then(result => {
                            let values = result.values.values;

                            if (this.playToggle.state !== values.play) {
                                this.playToggle.state = values.play;
                            }
                            if (this.speedSlider.value !== values.speed) {
                                this.speedSlider.value = values.speed;
                            }
                        });
                    }
                } else if (contextName === DATAMOVES_DATA.name) {
                    if (operation === 'selectCases' && helper.items[DATAMOVES_CONTROLS_DATA.name][0].values['Replay']) {
                        helper.getSelectedItems(contextName).then(items => {
                            items.forEach(item => {
                                let values = item.values;
                                if (values.ID === helper.ID) {
                                    let type = values.Parameter && values.Parameter.toLowerCase();
                                    if (type) {
                                        this[`${type}Attribute`] = values.Attribute;
                                        this[`${type}AttrIsDescending`] = values.Direction === 'Descending';
                                        this[`${type}AttrIsDate`] = values['Attr Type'] === 'date';
                                        this.processMappedAttribute(type);
                                    }
                                }
                            });
                        });
                    } else {
                        helper.queryDataForContext(contextName);
                    }
                } else if (contextName === DATAMOVES_CONTROLS_DATA.name) {
                    helper.queryDataForContext(contextName).then();
                } else {
                    if (operation === 'selectCases') {
                        if (contextName === this.focusedContext) {
                            helper.getSelectedItems(this.focusedContext).then(this.onItemsSelected);
                        }
                    } else {
                        helper.queryDataForContext(contextName).then(this.onGetData);
                    }
                }

                // else if (notice.values.operation === 'updateCases' || notice.values.operation === 'dependentCases') {
                //     helper.queryAllData().then(this.onGetData);
                // }
            } else if (notice.resource === 'component' && notice.values.type === 'slider') {
                helper.queryGlobalValues().then(this.onGetGlobals);
            } else if (notice.resource === 'undoChangeNotice') {
                helper.queryGlobalValues().then(this.onGetGlobals);
            } else if (notice.resource === 'logMessageNotice') {
                // if (notice.values.message.startsWith('plugin')) {
                //     let values = JSON.parse(notice.values.message.slice(8));
                //
                //     if (values.name === 'Transport') {
                //         playToggle.state = values.values.play;
                //         speedSlider.value = values.values.speed;
                //     }
                // }
            }
        });

        this.selectedCsd = this.csdFiles[0];
    }
});

function moduleDidLoad() {
    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

    app.csoundReady = true;
    // app.play();
}