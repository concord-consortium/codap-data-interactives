/*global codapInterface:true*/
const helper = new CodapPluginHelper(codapInterface);
const moveRecorder = new PluginMovesRecorder(helper);
/**
 * Replicates the csound scale function.
 * Scales a number between zero and one to the given range.
 * Note the inversion of max and min in the argument list.
 **/
function scale(v, max, min) {
    return (v * (max - min)) + min;
}

/**
 * Replicates csound expcurve function.
 * @param x
 * @param y
 * @returns {number}
 */
function expcurve(x,y) {
    return (Math.exp(x * Math.log(y)) - 1) / (y-1)
}

function flattenGroupedArrays (data) {
    if (Array.isArray(data)) {
        return data;
    } else {
        return Object.values(data).flatMap(flattenGroupedArrays);
    }
}

function hashMapById (array) {
    return array.reduce((result, item) => {
        result[item.id] = item;
        return result;
    }, {});
}

const PLAY_TOGGLE_IDLE = false;
const PLAY_TOGGLE_PLAYING = true;

const kAttributeMappedProperties = [
    'time',
    'pitch'//,
    // 'duration',
    // 'loudness',
    // 'stereo'
];

const trackingGlobalName = 'sonificationTracker';
const minDur = 0.02;
const maxDur = 0.5;
const durRange = maxDur - minDur;

const minPitchMIDI = 55;
const maxPitchMIDI = 110;
const pitchMIDIRange = maxPitchMIDI - minPitchMIDI;

const FOCUS_MODE = 'Focus';
const CONTRAST_MODE = 'Contrast';
const CONNECT_MODE = 'Connect';

const UNSELECT_VALUE = 'NULL';

const app = new Vue({
    el: '#app',
    data: {
        name: 'Sonify',
        version: 'v0.3.0',
        dim: {
            width: 285,
            height: 385
        },
        loading: true,
        // state managed by CODAP
        state: {
            focusedContext: "",
            focusedCollection: "",
            pitchAttribute: "",
            pitchAttrIsDate: false,
            pitchAttrIsDescending: false,
            timeAttribute: "",
            timeAttrIsDate: false,
            timeAttrIsDescending: false,
            durationAttribute: "",
            durationAttrIsDate: false,
            durationAttrIsDescending: false,
            loudnessAttribute: "",
            loudnessAttrIsDate: false,
            loudnessAttrIsDescending: false,
            stereoAttribute: "",
            stereoAttrIsDate: false,
            stereoAttrIsDescending: false,
            connectByCollIds: null,
            playbackSpeed: 0.5,
            loop: false,
            selectionMode: FOCUS_MODE,
        },
        data: null,
        contexts: null, // array of context names
        collections: null,
        attributes: null,

        connectByAvailable: true,

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

        csdFiles: ['StableGrains.csd'],
        selectedCsd: null,
        csoundReady: false,

        synchronized: false,

        playToggle: null,
        playing: false,

        speedSlider: null,
        loopToggle: null,
        userMessage: 'Select a dataset, pitch and time and click Play',
        timerId: null,
        phase: 0,
        cycleEndTimerId: null,
        selectionModes: [FOCUS_MODE, CONNECT_MODE],
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
                    this.setUserMessage('Playing sounds');
                    this.play();
                } else {
                    this.setUserMessage("Stopping play");
                    this.resetPlay();
                }
            });

            this.loopToggle = new Nexus.Toggle('#loop-toggle', {
                size: [40, 20],
                state: this.state.loop,
            });

            this.loopToggle.on('change', v => {
                this.state.loop = v;

                this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);

                if (this.playing) {
                    const phase = csound.RequestChannel('phase');
                    let gkfreq = expcurve(this.state.playbackSpeed, 50);
                    gkfreq = expcurve(gkfreq, 50);
                    gkfreq = scale(gkfreq, 5, 0.05);
                    const remainingPlaybackTime = (1 - phase) / gkfreq * 1000;

                    if (this.state.loop) {
                        this.cycleEndTimerId = setTimeout(() => this.triggerNotes(0), remainingPlaybackTime);
                    } else {
                        this.cycleEndTimerId = setTimeout(() => {
                            this.resetPlay();
                        }, remainingPlaybackTime);
                    }
                }
            });

            this.speedSlider = new Nexus.Slider('#speed-slider', {
                size: [200, 20],
                mode: 'absolute',
                value: this.state.playbackSpeed
            });

            this.speedSlider.on('release', (/*v*/) => {
                this.state.playbackSpeed = this.speedSlider._value.value;

                if (this.csoundReady) {
                    csound.SetChannel('playbackSpeed', this.state.playbackSpeed);

                    if (this.playing) {
                        this.phase = csound.RequestChannel('phase');
                        this.stopNotes();
                        this.play();
                    }
                }
            });
        },
        setUserMessage(msg) {
            this.userMessage = msg;
        },
        logMessage(msg) {
            this.setUserMessage(`log: ${msg}`);
            console.log(`MicroRhythm: ${msg}`);
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

            helper.on('dragDrop[attribute]', 'dragstart', (/*data*/) => {
                document.querySelectorAll('.drop-area').forEach(el => {
                    el.style.outline = '3px solid #ffff00';
                })
            });

            helper.on('dragDrop[attribute]', 'dragend', (/*data*/) => {
                document.querySelectorAll('.drop-area').forEach(el => {
                    el.style.outline = '3px solid transparent';
                    el.style.backgroundColor = 'transparent';
                })
            });
        },
        /**
         * Updates the CODAP Global Value with the current time offset within
         * the current score.
         */
        updateTracker() {
            if (this.timeAttrRange) {
                let cyclePos = 0;
                try {
                    cyclePos = csound.RequestChannel('phase') || 0;
                } catch (ex) {
                    console.warn("CSound phase undefined. Assuming 0.")
                }
                // For obscure reasons CODAP Time is measured in seconds,
                // not milliseconds. Normally this adjustment is automatic.
                // In order for the sonification tracker to align with the
                // data we need to take this obscurity into account
                const timeAdj = this.state.timeAttrIsDate? 1000: 1;

                // Except in the CONNECT mode, the note events (time offsets)
                // are slightly compressed to end the last note event at time=1.
                const modeAdj = this.state.selectionMode === CONNECT_MODE ? 1 : (this.timeAttrRange.len - 1) / this.timeAttrRange.len;

                const dataTime = scale(cyclePos / modeAdj, this.timeAttrRange.max / timeAdj,
                    this.timeAttrRange.min / timeAdj);
                helper.setGlobal(trackingGlobalName, dataTime);
            }
        },
        resetPitchTimeMaps() {
            this.state.pitchAttribute = this.state.timeAttribute = null;
            this.state.pitchAttrRange = this.timeAttrRange = null;
        },
        onContextFocused() {
            this.collections = helper.getCollectionsForContext(this.state.focusedContext);
            this.attributes = helper.getAttributesForContext(this.state.focusedContext);

            this.resetPitchTimeMaps();
        },
        getAttributeType(context, attrName) {
          let attributes = helper.getAttributesForContext(context);
          return attributes && attributes.find((attr) => attrName === attr.name);
        },
        setIfDateTimeAttribute(type) {
            let contextName = this.state.focusedContext;
            let attrName = this.state[`${type}Attribute`];
            let attrType = this.getAttributeType(attrName);
            let values = helper.getAttrValuesForContext(contextName, attrName) || [];
            // an attribute is a Date attribute if attribute type is 'date' or
            // all of its values are Date objects or date strings
            let isDateAttribute = attrType === 'date' || !values.some((x) => {
                    let isDate = (x instanceof Date) ||
                        ((typeof x === 'string') && !isNaN(new Date(x).valueOf()) &&
                            (isNaN(x))) ;
                    return !isDate;
                });
            this.state[`${type}AttrIsDate`] = isDateAttribute;
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
                this.setIfDateTimeAttribute(type);
                this[`${type}AttrRange`] = this.calcRange(this.state[`${type}Attribute`], this.state[`${type}AttrIsDate`], this.state[`${type}AttrIsDescending`]);
                this.updateTracker();
            }

            this.reselectCases();
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
            helper.selectSelf();
        },
        onSelectionModeSelectedByUI() {
            if (this.state.selectionMode === CONTRAST_MODE) {
                this.getSelectedItems = helper.getStrictlySelectedItems.bind(helper);
            } else {
                this.getSelectedItems = helper.getSelectedItems.bind(helper);
            }
            this.reselectCases();
        },
        onPitchAttributeSelectedByUI() {
            this.setUserMessage(this.state.pitchAttribute?"Pitch attribute selected...":"Please select attribute for pitch");
            this.processMappedAttribute('pitch');
            this.recordToMoveRecorder('pitch');

            if (this.playing) {
                this.phase = csound.RequestChannel('phase');
                this.stopNotes();
                this.play();
            }
        },
        onTimeAttributeSelectedByUI() {
            this.setUserMessage(this.state.timeAttribute?"Time attribute selected...":"Please select attribute for time");
            this.processMappedAttribute('time');
            this.recordToMoveRecorder('time');

            if (this.playing) {
                this.phase = csound.RequestChannel('phase');
                this.stopNotes();
                this.play();
            }
        },
        onDurationAttributeSelectedByUI() {
            this.setUserMessage(this.state.durationAttribute?"Duration attribute selected...":"Please select attribute for duration");
            this.processMappedAttribute('duration');
            this.recordToMoveRecorder('duration');
        },
        onLoudnessAttributeSelectedByUI() {
            this.setUserMessage(this.state.loudnessAttribute?"Loudness attribute selected...":"Please select attribute for loudness");
            this.processMappedAttribute('loudness');
            this.recordToMoveRecorder('loudness');
        },
        onStereoAttributeSelectedByUI() {
            this.setUserMessage(this.state.stereoAttribute?"Stereo attribute selected...":"Please select attribute for stereo");
            this.processMappedAttribute('stereo');
            this.recordToMoveRecorder('stereo');
        },
        onConnectByCollectionSelectedByUI() {
            this.setUserMessage(this.state.focusedCollection?"ConnectBy collection selected...":"Please select collection for grouping");

            if (this.state.focusedCollection === UNSELECT_VALUE) {
                this.state.selectionMode = FOCUS_MODE
            } else {
                this.state.selectionMode = CONNECT_MODE
                const context = helper.data[this.state.focusedContext];
                const collection = context?.[this.state.focusedCollection];
                this.state.connectByCollIds = collection?.map(c => c.id);
            }

            this.onSelectionModeSelectedByUI()
        },

        checkIfGlobal(attr) {
            return this.globals.some(g => g.name === attr);
        },

        reselectCases() {
            this.getSelectedItems(this.state.focusedContext).then(this.onItemsSelected);
        },

        onGetData() {
            this.contexts = helper.getContexts();
            if (this.contexts && this.contexts.length === 1) {
                this.state.focusedContext = this.state.focusedContext ||
                    this.contexts[0];
            }

            if (this.state.focusedContext) {
                helper.getAttributeNamesForContext(this.state.focusedContext).then((attrs) => {
                    this.attributes = attrs;
                    this.reselectCases();
                    kAttributeMappedProperties.forEach(p => {
                        if (this[p + 'AttrRange']) {
                            this.processMappedAttribute(p);
                        }
                    })
                });

                // Re-populate the collections dropdown.
                const collections = helper.getCollectionsForContext(this.state.focusedContext);


                // Filter out the collections with the size of items (the leaf nodes).
                const itemsLength = helper.items[this.state.focusedContext].length;
                this.collections = collections.filter((collection) => helper.data[this.state.focusedContext][collection]?.length !== itemsLength);

                // Do not show the "connect by" dropdown UI if there are not hierarchies / collections.
                this.connectByAvailable = !!this.collections?.length;
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
            let attrValues = attribute?
                helper.getAttrValuesForContext(this.state.focusedContext, attribute): [];

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
                    return {len:0, min:0, max:0};
                }
            } else {
                return {len:0, min:0, max:0};
            }
        },

        prepMapping(args) {
            let param = args['param'];
            let items = args['items'];

            if (this[`${param}AttrRange`]) {
                let range = this[`${param}AttrRange`].max - this[`${param}AttrRange`].min;

                if (range === 0) {
                    this[`${param}Array`] = items.map(c => ({ id: c.id, val: 0.5 }));
                } else {
                    if (this.checkIfGlobal(this.state[`${param}Attribute`])) {
                        let global = this.globals.find(g => g.name === this.state[`${param}Attribute`]);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        this[`${param}Array`] = items.map(c => ({ id: c.id, val: value }));
                    } else {
                        this[`${param}Array`] = items.map(c => {
                            let value = this.state[`${param}AttrIsDate`] ? Date.parse(c.values[this.state[`${param}Attribute`]]) : c.values[this.state[`${param}Attribute`]];
                            value = isNaN(parseFloat(value)) ? NaN : (value-this[`${param}AttrRange`].min)/range;
                            return { id: c.id, val: value };
                        });
                    }
                }
            }
        },

        onItemsSelected(items) {
            const { selectionMode, timeAttrIsDate, timeAttribute } = this.state;

            // TODO: Does this only include all the leaf nodes or also the grouping nodes? Double check.
            const allItems = helper.getItemsForContext(this.state.focusedContext);

            let connectedCasesById
            let selectedItemIdsSet

            if (selectionMode === CONNECT_MODE) {
                const context = helper.data[this.state.focusedContext];
                const flattenedGroupedCases = flattenGroupedArrays(context);
                connectedCasesById = hashMapById(flattenedGroupedCases);
                selectedItemIdsSet = new Set(items.map(item => item.id));

                if (timeAttrIsDate) {
                    allItems.sort((a, b) => Date.parse(a.values[timeAttribute]) - Date.parse(b.values[timeAttribute]));
                } else {
                    allItems.sort((a, b) => a.values[timeAttribute] - b.values[timeAttribute]);
                }
            }

            if (this.timeAttrRange) {
                let range = this.timeAttrRange.max - this.timeAttrRange.min;

                if (range === 0) {
                    if (selectionMode === CONTRAST_MODE) {
                        const idItemMap = allItems.reduce((acc, curr) => (acc[curr.id] = { id: curr.id, val: 0, sel: false }, acc), {});
                        items.forEach(c => idItemMap[c.id].sel = true);
                        this.timeArray = Object.values(idItemMap);
                    } else {
                        this.timeArray = items.map(c => ({ id: c.id, val: 0 }));
                    }
                } else {
                    if (this.checkIfGlobal(timeAttribute)) {
                        let global = this.globals.find(g => g.name === timeAttribute);
                        let value = (global.value > 1) ? 1 : ((global.value < 0) ? 0 : global.value);

                        if (selectionMode === CONTRAST_MODE) {
                            const idItemMap = allItems.reduce((acc, curr) => (acc[curr.id] = { id: curr.id, val: value, sel: false }, acc), {});
                            items.forEach(c => idItemMap[c.id].sel = true);
                            this.timeArray = Object.values(idItemMap);
                        } else {
                            this.timeArray = items.map(c => ({ id: c.id, val: value }));
                        }
                    } else {
                        if (selectionMode === CONTRAST_MODE) {
                            const idItemMap = allItems.reduce((acc, curr) => {
                                const value = this.state.timeAttrIsDate ? Date.parse(curr.values[timeAttribute]) : curr.values[timeAttribute];
                                // The last event's time offset should be `(1 - event duration)`.
                                const valueScaled = isNaN(parseFloat(value)) ? NaN : (value-this.timeAttrRange.min)/range * ((this.timeAttrRange.len-1)/this.timeAttrRange.len);
                                acc[curr.id] = { id: curr.id, val: valueScaled, sel: false };
                                return acc;
                            }, {});

                            items.forEach(c => idItemMap[c.id].sel = true);
                            this.timeArray = Object.values(idItemMap);
                        } else if (selectionMode === CONNECT_MODE) {
                            this.timeArray = allItems.map(c => {
                                let value = timeAttrIsDate ? Date.parse(c.values[timeAttribute]) : c.values[timeAttribute];
                                // The last event's time offset should be 1.
                                value = isNaN(parseFloat(value)) ? NaN : (value-this.timeAttrRange.min)/range;
                                const parent = connectedCasesById?.[c.id].parent;
                                const selected = selectedItemIdsSet.has(c.id);
                                return { id: c.id, val: value, parent, selected };
                            });
                        } else {
                            this.timeArray = items.map(c => {
                                let value = timeAttrIsDate ? Date.parse(c.values[timeAttribute]) : c.values[timeAttribute];
                                value = isNaN(parseFloat(value)) ? NaN : (value-this.timeAttrRange.min)/range * ((this.timeAttrRange.len-1)/this.timeAttrRange.len);
                                return { id: c.id, val: value };
                            });
                        }
                    }
                }
            }

            // ['pitch', 'duration', 'loudness', 'stereo'].forEach(param => this.prepMapping({ param: param, items: CONTRAST_MODE ? allItems : items }));
            this.prepMapping({
                param: 'pitch',
                items: [CONTRAST_MODE, CONNECT_MODE].includes(selectionMode) ? allItems : items,
            });

            if (this.playing) {
                this.phase = csound.RequestChannel('phase');
                this.stopNotes();
                this.play();
            }
        },
        stopNotes() {
            csound.Event('e');
        },
        /**
         * Sets sound play and related state to its initial condition:
         *   * sound is stopped
         *   * the UI Play toggle is stopped
         *   * the phase and tracking global are at their minimum value
         */
        resetPlay() {
            if (this.playToggle.state !== PLAY_TOGGLE_IDLE) this.playToggle.state = PLAY_TOGGLE_IDLE;
            this.stop();
            this.phase = 0;
            let timeAdj = this.state.timeAttrIsDate? 1000: 1;
            let trackerMin = this.timeAttrRange? this.timeAttrRange.min/timeAdj: 0;
            helper.setGlobal(trackingGlobalName, trackerMin);
        },
        triggerNotes(phase) {
            const { playbackSpeed, loop, selectionMode } = this.state;
            const pitchTimeArrayLengthsMatch = this.pitchArray.length === this.timeArray.length;

            let gkfreq = expcurve(playbackSpeed, 50);
            gkfreq = expcurve(gkfreq, 50);
            gkfreq = scale(gkfreq, 5, 0.05);

            const remainingPlaybackTime = (1 - phase) / gkfreq;

            if (loop) {
                this.cycleEndTimerId = setTimeout(() => this.triggerNotes(0), remainingPlaybackTime * 1000);
            } else {
                this.cycleEndTimerId = setTimeout(() => {
                    this.resetPlay();
                }, remainingPlaybackTime * 1000);
            }

            if (!pitchTimeArrayLengthsMatch) {
                console.warn(`pitch not rendered: [pitchArray length, timeArray length]: [${[this.pitchArray.length, this.timeArray.length].join()}]`);
            }

            if (selectionMode === CONNECT_MODE) {
                const pitchArrayById = this.pitchArray.reduce((res, v) => (res[v.id] = v, res), {});
                this.state.connectByCollIds.forEach(id => {
                    const timeArrayForGroup = this.timeArray.filter(v => v.parent === id);

                    for (let i = 0; i < timeArrayForGroup.length - 1; i++) {
                        const startTime = (timeArrayForGroup[i].val - phase) / gkfreq;
                        const endTime = (timeArrayForGroup[i+1].val - phase) / gkfreq;
                        const timeDelta = endTime - startTime;
                        const startPitch = pitchArrayById[timeArrayForGroup[i].id]?.val ?? 0.5;
                        const endPitch = pitchArrayById[timeArrayForGroup[i+1].id]?.val ?? 0.5;
                        // const loudness = 0.5;

                        const unmute = timeArrayForGroup[i].selected ? 1 : 0;

                        // The last event of the group should not "hold" the note
                        // as there might be other groups (voices) that would play
                        // past the endTime, resulting in an incorrectly held note.
                        const hold = (i === timeArrayForGroup.length - 2) ? timeDelta : -1;

                        if (![startTime, timeDelta, startPitch, endPitch].some(isNaN)) {
                            csound.Event(`i 4.${id} ${startTime} ${hold} ${unmute} ${startPitch} ${endPitch} ${timeDelta}`);
                        }
                    }
                });
            } else {
                this.timeArray.forEach((d,i) => {
                    const pitch = pitchTimeArrayLengthsMatch ? this.pitchArray[i].val : 0.5;
                    // let duration = this.durationArray.length === this.timeArray.length ? this.durationArray[i].val : 0.5;
                    // let loudness = this.loudnessArray.length === this.timeArray.length ? this.loudnessArray[i].val * 0.95 + 0.05 : 0.5;
                    // let stereo = this.stereoArray.length === this.timeArray.length ? this.stereoArray[i].val : 0.5;

                    const loudness = 0.5;
                    const duration = 0.2;

                    if (d.val >= phase && ![d.val,pitch].some(isNaN)) {
                        if (selectionMode === CONTRAST_MODE) {
                            const instr = d.sel ? 3 : 2;
                            csound.Event(`i${instr} ${(d.val - phase) / gkfreq} ${duration} ${pitch} ${loudness}`);
                        } else if (selectionMode === FOCUS_MODE) {
                            csound.Event(`i2 ${(d.val - phase) / gkfreq} ${duration} ${pitch} ${loudness}`);
                        }
                    }
                });
            }
        },
        setupSound() {
            this.stop();

            return csound.PlayCsd(this.selectedCsd).then(() => {
                this.playing = true;
                this.startTime = Date.now();
                csound.SetChannel('playbackSpeed', this.state.playbackSpeed);
                csound.SetChannel('click', this.state.loop ? 1 : 0); // Loop is now also mapped to click on/off.
                csound.Event(`i1 0 -1 ${this.phase}`)

                this.timerId = setInterval(() => {
                    this.updateTracker();
                }, 33); // 30 FPS

                if (this.timeArray.length !== 0) {
                    this.triggerNotes(this.phase);
                }
            });
        },
        play() {
            if (!this.csoundReady) {
                if (this.playToggle.state === PLAY_TOGGLE_PLAYING) this.playToggle.state = PLAY_TOGGLE_IDLE;
                this.setUserMessage('Play aborted: csound not ready.');
                return null;
            }

            if (!this.state.pitchAttribute || !this.state.timeAttribute) {
                if (this.playToggle.state === PLAY_TOGGLE_PLAYING) this.playToggle.state = PLAY_TOGGLE_IDLE;
                this.setUserMessage("Please set an attribute for time and pitch");
                return null;
            }

            if (CSOUND_AUDIO_CONTEXT.state !== 'running') {
                return CSOUND_AUDIO_CONTEXT.resume().then(this.setupSound);
            } else {
                return this.setupSound();
            }
        },
        stop() {
            if (!this.csoundReady) {
                return null;
            }

            this.timerId && clearInterval(this.timerId);
            csound.Stop();
            csound.Csound.reset(); // Ensure the playback position, etc. are reset.
            this.playing = false;

            this.cycleEndTimerId && clearTimeout(this.cycleEndTimerId);
            this.cycleEndTimerId = null;
        },
        openInfoPage() {
            this.setUserMessage('Opening Info Page');
            helper.openSharedInfoPage();
        },
        restoreSavedState(state) {
            Object.keys(state).forEach(key => {
                this.state[key] = state[key];
            });
            if (this.state.playbackSpeed != null) {
                this.speedSlider.value = this.state.playbackSpeed;
            }
            if (this.state.loop != null) {
                this.loopToggle.state = this.state.loop;
            }
            helper.queryAllData().then(this.onGetData).then(() =>{
                if (this.state.focusedContext) {
                    this.attributes = helper.getAttributesForContext(this.state.focusedContext);
                }
                kAttributeMappedProperties.forEach( (p) => {
                    if (this.state[p + 'Attribute']) {this.processMappedAttribute(p);}
                })
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
                        this.getSelectedItems(contextName).then(items => {
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
                    helper.queryDataForContext(contextName);
                } else if (operation === 'updateDataContext') {
                    helper.queryContextList()
                        .then(() => {this.contexts = helper.getContexts();});
                } else if (operation === 'updateAttributes') {
                    this.resetPlay();
                    this.onGetData();
                } else {
                    if (operation === 'selectCases') {
                        if (contextName === this.state.focusedContext) {
                            this.getSelectedItems(this.state.focusedContext).then(this.onItemsSelected);
                        }
                    } else if (['createCases', 'deleteCases', 'updateCases', 'createCollection', 'deleteCollection', 'moveAttribute'].includes(operation)) {
                        if (contextName === this.state.focusedContext) {
                            helper.queryDataForContext(contextName).then(this.onGetData);
                        }
                    }
                }

                // else if (notice.values.operation === 'updateCases' || notice.values.operation === 'dependentCases') {
                //     helper.queryAllData().then(this.onGetData);
                // }
            // } else if (notice.resource === 'component' && notice.values.type === 'DG.SliderView') {
                //helper.queryGlobalValues().then(this.onGetGlobals);
            // } else if (notice.resource === 'undoChangeNotice') {
                //helper.queryGlobalValues().then(this.onGetGlobals);
            // } else if (notice.resource === 'logMessageNotice') {
                // if (notice.values.message.startsWith('plugin')) {
                //     let values = JSON.parse(notice.values.message.slice(8));
                //
                //     if (values.name === 'Transport') {
                //         playToggle.state = values.values.play;
                //         speedSlider.value = values.values.speed;
                //     }
                // }
            // } else {
                //console.log(`Unhandled notice: ${notice.resource}`)
            }
        },
        createGraph() {
            let timeAttr = this.state.timeAttribute;
            let pitchAttr = this.state.pitchAttribute;
            if (timeAttr && pitchAttr) {
                // create the graph object
                helper.createGraph(this.state.focusedContext,
                    this.state.timeAttribute, this.state.pitchAttribute).then(
                    result => {
                        if (result.success) {
                            let graphId = result.values.id;
                            console.log(`created graph: graph id: ${graphId}`)
                            helper.annotateDocument((doc) => {
                                let graph = doc.components.find(component => component.id === graphId);
                                let componentStorage = graph.componentStorage;
                                let adornments = componentStorage.plotModels[0].plotModelStorage.adornments;
                                adornments.plottedValue = {
                                        "isVisible": true,
                                        "adornmentKey": "plottedValue",
                                        "expression": trackingGlobalName
                                    };
                                adornments.connectingLine = {isVisible: true};

                                return doc;
                            })
                        } else {
                            console.warn(
                                `create graph failure: ${result.values? 
                                    result.values.error: 'unknown error'}`);
                        }
                    });
            }
        },
        getContextTitle(contextName) {
          return helper.getContextTitle(contextName);
        }
    },
    mounted() {
        this.setupDrag();
        this.setupUI();

        helper.init(this.name, this.dim, this.version)
            // .then(helper.monitorLogMessages.bind(helper))
            .then((state) => {
                if (state) {
                    this.restoreSavedState(state);
                } else {
                    this.onGetData();
                }
            }).then(
                () => helper.guaranteeGlobal(trackingGlobalName).then(() => this.updateTracker())
            );

        codapInterface.on('notify', '*', this.handleCODAPNotice)

        this.selectedCsd = this.csdFiles[0];

        if ([CONTRAST_MODE, CONNECT_MODE].includes(this.state.selectionMode)) {
            this.getSelectedItems = helper.getStrictlySelectedItems.bind(helper);
        } else {
            this.getSelectedItems = helper.getSelectedItems.bind(helper);
        }
    },
    getSelectedItems: null,
    computed: {
        isPlayable: function() {
            let playable=!!(this.state.timeAttribute && this.state.pitchAttribute);
            console.log(`playable = ${playable}`);
            return playable;
        }
    }
});

function moduleDidLoad() {
    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

    app.csoundReady = true;
    // app.play();
}
