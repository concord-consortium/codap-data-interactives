const helper = new CodapPluginHelper(codapInterface);
const moveRecorder = new PluginMovesRecorder(helper);

const kAttributeMappedProperties = [
    'time',
    'pitch',
    'duration',
    'loudness',
    'stereo'
];
const app = new Vue({
    el: '#app',
    data: {
        name: 'Micro Rhythm',
        dim: {
            width: 325,
            height: 215
        },
        loading: true,
        // state managed by CODAP
        state: {
            focusedContext: null,
            pitchAttribute: null,
            pitchAttrIsDate: false,
            pitchAttrIsDescending: false,
            timeAttribute: null,
            timeAttrIsDate: false,
            timeAttrIsDescending: false,
            durationAttribute: null,
            durationAttrIsDate: false,
            durationAttrIsDescending: false,
            loudnessAttribute: null,
            loudnessAttrIsDate: false,
            loudnessAttrIsDescending: false,
            stereoAttribute: null,
            stereoAttrIsDate: false,
            stereoAttrIsDescending: false,
        },
        data: null,
        contexts: null, // array of context names
        collections: null,
        attributes: null,
        focusedCollection: null,
        prevSelectedIDs: [],
        globals: [],

        pitchAttrRange: null,
        pitchArray: [],

        timeAttrRange: null,
        timeArray: [],

        durationAttrRange: null,
        durationArray: [],

        loudnessAttrRange: null,
        loudnessArray: [],

        stereoAttrRange: null,
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
        userMessage: '',
    },
    watch: {
        state: {
            handler(newState/*, oldState*/) {
                helper.updateState(newState)
            },
            deep: true
        }
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
        setUserMessage(msg) {
            this.userMessage = msg;
        },
        logMessage(msg) {
            this.setUserMessage(`log: ${msg}`);
            console.log(`Microrhythm: ${msg}`);
        },
        setupDrag() {
            function findElementsUnder(pos) {
                if (pos) {
                    return document.elementsFromPoint(pos.x, pos.y)
                        .filter(el => el.classList.contains('drop-area'));
                }
            }
            helper.on('dragDrop[attribute]', 'dragenter', (data) => {
                let els = findElementsUnder(data.values.position);
                if (els) {
                    els.forEach(el => {
                        el.style.backgroundColor = 'rgba(255,255,0,0.5)';
                    });
                }
            });

            helper.on('dragDrop[attribute]', 'dragleave', (data) => {
                let els = findElementsUnder(data.values.position);
                if (els) {
                    els.forEach(el => {
                        el.style.backgroundColor = 'transparent';
                    });
                }
            });

            helper.on('dragDrop[attribute]', 'drag', (data) => {
                document.querySelectorAll('.drop-area').forEach(el => {
                    el.style.backgroundColor = 'transparent';
                })
                let els = findElementsUnder(data.values.position);
                els.forEach(el => {
                    el.style.backgroundColor = 'rgba(255,255,0,0.5)';
                });
            });

            helper.on('dragDrop[attribute]', 'drop', (data) => {
                let els = findElementsUnder(data.values.position);
                if (this.contexts && this.contexts.includes(data.values.context.name) && this.state.focusedContext !== data.values.context.name) {
                    this.state.focusedContext = data.values.context.name;
                    this.onContextFocused();
                }

                els.forEach(el => {
                    if (this.attributes && this.attributes.includes(data.values.attribute.name)) {
                        if (el.id.startsWith('pitch')) {
                            this.state.pitchAttribute = data.values.attribute.name;
                            this.onPitchAttributeSelectedByUI();
                        } else if (el.id.startsWith('time')) {
                            this.state.timeAttribute = data.values.attribute.name;
                            this.onTimeAttributeSelectedByUI();
                        } else if (el.id.startsWith('duration')) {
                            this.state.durationAttribute = data.values.attribute.name;
                            this.onDurationAttributeSelectedByUI();
                        } else if (el.id.startsWith('loudness')) {
                            this.state.loudnessAttribute = data.values.attribute.name;
                            this.onLoudnessAttributeSelectedByUI();
                        } else if (el.id.startsWith('stereo')) {
                            this.state.stereoAttribute = data.values.attribute.name;
                            this.onStereoAttributeSelectedByUI();
                        }
                    }
                });
            });

            helper.on('dragDrop[attribute]', 'dragstart', (data) => {
                document.querySelectorAll('.drop-area').forEach(el => {
                    el.style.outline = '3px solid #ffff00';
                })
            });

            helper.on('dragDrop[attribute]', 'dragend', (data) => {
                document.querySelectorAll('.drop-area').forEach(el => {
                    el.style.outline = '3px solid transparent';
                    el.style.backgroundColor = 'transparent';
                })
            });
        },
        resetPitchTimeMaps() {
            this.state.pitchAttribute = this.state.timeAttribute = null;
            this.state.pitchAttrRange = this.timeAttrRange = null;
        },
        onContextFocused() {
            // this.attributes = null;
            this.attributes = helper.getAttributesForContext(this.state.focusedContext);

            // this.resetPitchTimeMaps();
        },
        /**
         * @param type {string} pitch, time, loudness, or stereo
         **/
        processMappedAttribute(type) {
            if (this.checkIfGlobal(this.state[`${type}Attribute`])) {
                this[`${type}AttrRange`] = {
                    len: 1,
                    min: 0,
                    max: 1
                };
            } else {
                this[`${type}AttrRange`] = this.calcRange(this.state[`${type}Attribute`], this.state[`${type}AttrIsDate`], this.state[`${type}AttrIsDescending`]);
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
                Context: this.state.focusedContext,
                Attribute: this.state[`${param}Attribute`],
                Parameter: param.charAt(0).toUpperCase() + param.slice(1),
                Direction: this.state[`${param}AttrIsDescending`] ? 'Descending' : 'Ascending',
                'Attr Type': this.state[`${param}AttrIsDate`] ? 'date': 'numeric'
            });
        },
        onBackgroundSelect() {
            console.log('onBackgroundSelect');
          helper.selectSelf();
        },
        onPitchAttributeSelectedByUI() {
            this.setUserMessage("Pitch selected...");
            this.processMappedAttribute('pitch');
            this.recordToMoveRecorder('pitch');
        },
        onTimeAttributeSelectedByUI() {
            this.setUserMessage("Time selected...");
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
            helper.getSelectedItems(this.state.focusedContext).then(this.onItemsSelected);
        },
        onCsdFileSelected() {

        },
        onGetData() {
            this.contexts = helper.getContexts();
            if (this.contexts && this.contexts.length === 1) {
                this.state.focusedContext = this.state.focusedContext ||
                    this.contexts[0];
            }

            if (this.state.focusedContext) {
                this.attributes = helper.getAttributesForContext(this.state.focusedContext);

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
            // let attrValues = helper.getAttributeValues(this.state.focusedContext, this.focusedCollection, attribute);
            let attrValues = helper.getAttrValuesForContext(this.state.focusedContext, attribute);

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
                    if (this.checkIfGlobal(this.state[`${param}Attribute`])) {
                        let global = this.globals.find(g => g.name === this.state[`${param}Attribute`]);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        this[`${param}Array`] = items.map(c => {
                            return {
                                id: c.id,
                                val: value
                            }
                        })
                    } else {
                        this[`${param}Array`] = items.map(c => {
                            let value = this.state[`${param}AttrIsDate`] ? Date.parse(c.values[this.state[`${param}Attribute`]]) : c.values[this.state[`${param}Attribute`]];

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
                    if (this.checkIfGlobal(this.state.timeAttribute)) {
                        let global = this.globals.find(g => g.name === this.state.timeAttribute);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        this.timeArray = items.map(c => {
                            return {
                                id: c.id,
                                val: value
                            }
                        })
                    } else {
                        this.timeArray = items.map(c => {
                            let value = this.state.timeAttrIsDate ? Date.parse(c.values[this.state.timeAttribute]) : c.values[this.state.timeAttribute];
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
                this.logMessage('Play aborted: csound not ready.');
                return null;
            }

            if (!this.state.pitchAttribute || !this.state.timeAttribute) {
                this.setUserMessage("Please set an attribute for time and pitch");
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
            this.setUserMessage('Opening Info Page');
            helper.openSharedInfoPage();
        },
        restoreSavedState(state) {
            Object.keys(state).forEach(key => {
                this.state[key] = state[key];
                if (key === 'focusedContext') {
                    this.onContextFocused();
                    helper.queryAllData().then(this.onGetData).then(() =>{
                        if (kAttributeMappedProperties.includes(key)) {
                            this.processMappedAttribute(key);
                        }
                    });
                }
            });
        },
        handleCODAPNotice(notice) {
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
                                        this.state[`${type}Attribute`] = values.Attribute;
                                        this.state[`${type}AttrIsDescending`] = values.Direction === 'Descending';
                                        this.state[`${type}AttrIsDate`] = values['Attr Type'] === 'date';
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
                        if (contextName === this.state.focusedContext) {
                            helper.getSelectedItems(this.state.focusedContext).then(this.onItemsSelected);
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
        }
    },
    mounted() {
        this.setupDrag();
        this.setupUI();

        helper.init(this.name, this.dim)
            // .then(helper.monitorLogMessages.bind(helper))
            .then((state) => {
                if (state) {
                    this.restoreSavedState(state);
                }
                this.onGetData();
            });

        codapInterface.on('notify', '*', this.handleCODAPNotice);

        this.selectedCsd = this.csdFiles[0];
    }
});

function moduleDidLoad() {
    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

    app.csoundReady = true;
    // app.play();
}
