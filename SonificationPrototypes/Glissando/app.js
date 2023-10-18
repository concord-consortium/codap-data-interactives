const plugin = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();
const moveRecorder = new PluginMovesRecorder(plugin);

const orc = `
instr 1
idur = (1-p4) * 4.9 + 0.1
ip1 = p5
ip2 = p6
il1 = p7
il2 = p8

apitch = linseg:a(ip1, idur, ip2)
; afreq = cpsmidinn:a(scale(kpitch,100,60))
afreq = powoftwo((apitch * 40 + 60 - 69) / 12) * 440 
aamp = linseg:a(il1, idur, il2)

asig = oscil:a(aamp * 0.05, afreq)
outs asig, asig
endin
`;

const app = new Vue({
    el: '#app',
    data: {
        name: 'Glissando',
        dimensions: {
            width: 300,
            height: 250
        },

        csoundReady: false,
        playing: false,
        voices: {
            current: [],
            previous: [],
            toTurnOn: [],
            toTurnOff: []
        },

        contexts: null,
        context: null,
        attributes: null,

        pitchAttr: null,
        selectedPitchAttr: null,
        prevPitchAttr: null,
        selectedLoudnessAttr: null,
        loudnessAttr: null,
        prevLoudnessAttr: null,

        globals: [],

        speedSlider: null
    },
    methods: {
        setup() {
            plugin.init('Glissando', this.dimensions).then(this.onGetData);

            codapInterface.on('notify', '*', notice => {
                if (!plugin.checkNoticeIdentity(notice)) {
                    return null;
                }

                if (notice.resource === 'documentChangeNotice') {
                    plugin.queryAllData().then(this.onGetData);
                } else if (notice.resource.includes('dataContextChangeNotice')) {
                    let context = notice.resource.split('[').pop().split(']')[0];
                    let operation = notice.values.operation;

                    if (context === DATAMOVES_DATA.name) {
                        if (operation === 'selectCases' && plugin.items[DATAMOVES_CONTROLS_DATA.name][0].values['Replay']) {
                            plugin.getSelectedItems(context).then(items => {
                                items.forEach(item => {
                                    let values = item.values;

                                    if (values.ID === plugin.ID) {
                                        let type = values.Parameter && values.Parameter.toLowerCase();
                                        if (type) {
                                            if (type === 'pitch') {
                                                this.onPitchAttrSelectedByUI(values.Attribute);
                                            } else {
                                                this.onLoudnessAttrSelectedByUI(values.Attribute);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    } else if (context === DATAMOVES_CONTROLS_DATA) {

                    } else {
                        if (operation === 'selectCases') {
                            plugin.getSelectedItems(context).then(this.onItemsSelected);
                        } else {
                            plugin.queryAllData().then(this.onGetData);
                        }
                    }
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
                if (this.contexts && this.contexts.includes(data.context.name) && this.context !== data.context.name) {
                    this.context = data.context.name;
                    this.onContextSelectedByUI();
                }

                els.forEach(el => {
                    if (this.attributes && this.attributes.includes(data.attribute.name)) {
                        switch (el.id) {
                            case 'pitchAttr':
                                this.onPitchAttrSelectedByUI(data.attribute.name);
                                break;
                            case 'loudnessAttr':
                                this.onLoudnessAttrSelectedByUI(data.attribute.name);
                                break;
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
        setupUI() {
            this.speedSlider = new Nexus.Slider('#speed-slider', {
                value: 0.5
            });

            let playToggle = new Nexus.Toggle('#play-toggle', {
                size: [40, 20],
                state: this.playing
            });

            playToggle.on('change', v => {
                if (v) {
                    this.play();
                } else {
                    this.stop();
                }
                this.playing = v;
            });
        },
        onGetData() {
            this.contexts = plugin.getContexts();

            if (this.context) {
                this.attributes = plugin.getAttributesForContext(this.context);
            }
        },
        onItemsSelected(items) {
            this.voices.current = items;
            this.voices.toTurnOn = this.voices.current.filter(v => !this.voices.previous.includes(v.caseID));
            this.voices.toTurnOff = this.voices.previous.filter(v => !this.voices.current.includes(v.caseID));
            this.voices.previous = this.voices.current;

            if (!this.playing) {
                return null;
            }

            // itemID -> caseID: https://www.pivotaltracker.com/story/show/163986392
            this.voices.toTurnOff.forEach(v => {
                csound.Event(`i -1.${v.caseID} 0 1`);
            });

            this.voices.toTurnOn.forEach(v => {
                csound.Event(`i 1.${v.caseID} 0 -1 ${this.speedSlider.value} ${this.normalizeParams(v, [
                    this.pitchAttr,
                    this.pitchAttr,
                    this.loudnessAttr,
                    this.loudnessAttr
                ]).join(' ')}`);
            });
        },
        onContextSelectedByUI() {
            this.attributes = plugin.getAttributesForContext(this.context);
        },
        normalizeAttr(item, attr) {
            let range = plugin.attrValueRanges[this.context][attr];
            let raw = item.values[attr];
            return range.max === range.min ? 0.5 : (raw-range.min)/(range.max-range.min);
        },
        normalizeParams(item, attrs) {
            return attrs.map(attr => {
                return this.normalizeAttr(item, attr);
            });
        },
        startInterpolation(params) {
            if (!this.playing) {
                return null;
            }

            this.voices.current.forEach(item => {
                csound.Event(`i 1.${item.caseID} 0 -1 ${this.speedSlider.value} ${this.normalizeParams(item, params).join(' ')}`);
            });
        },
        onPitchAttrSelectedByUI(attr) {
            this.prevPitchAttr = this.prevPitchAttr ? this.pitchAttr : attr;
            this.selectedPitchAttr = this.pitchAttr = attr;
            this.startInterpolation([
                this.prevPitchAttr,
                this.pitchAttr,
                this.loudnessAttr,
                this.loudnessAttr
            ]);
            this.recordToMoveRecorder('pitch');
        },
        onLoudnessAttrSelectedByUI(attr) {
            this.prevLoudnessAttr = this.prevLoudnessAttr ? this.loudnessAttr : attr;
            this.selectedLoudnessAttr = this.loudnessAttr = attr;
            this.startInterpolation([
                this.pitchAttr,
                this.pitchAttr,
                this.prevLoudnessAttr,
                this.loudnessAttr
            ]);
            this.recordToMoveRecorder('loudness');
        },
        recordToMoveRecorder(param) {
            if (!(plugin.items[DATAMOVES_CONTROLS_DATA.name] && plugin.items[DATAMOVES_CONTROLS_DATA.name][0].values['Record'])) {
                return null;
            }

            moveRecorder.record({
                Plugin: this.name,
                ID: plugin.ID, // TODO: Proper plugin ID
                Type: 'Mapping',
                Context: this.context,
                Attribute: this[`${param}Attr`],
                Parameter: param.charAt(0).toUpperCase() + param.slice(1)
            })
        },
        play() {
            if (!this.csoundReady) {
                return null;
            }

            if (CSOUND_AUDIO_CONTEXT.state !== 'running') {
                CSOUND_AUDIO_CONTEXT.resume().then(async _ => {
                    await this.stop();
                    csound.Play();
                    csound.CompileOrc(orc);
                });
            } else {
                csound.Play();
                csound.CompileOrc(orc);
            }
        },
        stop() {
            return new Promise(resolve => {
                csound.Stop();
                csound.Csound.compileOrc("nchnls=2\n0dbfs=1\nksamps=1");
                csound.Start();
                // csound.Play();
                // csound.CompileOrc(orc);
                resolve();
            });
        },

        openInfoPage() {
            plugin.openSharedInfoPage();
        }
    },
    mounted() {
        this.setup();
        this.setupDrag();
        this.setupUI();
    }
});

function moduleDidLoad() {
    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);

    // TODO: CreateTable does not work with PlayCsd...
    // csound.PlayCsd('glissando.csd').then(_ => {
    //     let val = new Float32Array(4);
    //     csound.CreateTable(1, val).then(console.log);
    //     csound.Event(`i1 0 100 0`);
    // });

    window.createTableCallbacks = {};

    csound.Csound.setMessageCallback(message => {
        let message_trunc = message.replace(/\[m/g, '');
        console.log(message_trunc);

        Object.keys(window.createTableCallbacks).forEach(key => {
            window.createTableCallbacks[key](message);
        });
    });

    app.csoundReady = true;
}