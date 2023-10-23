const plugin = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();

const canvas = {
    dimensions: {
        width: 215 * 4,
        height: 80 * 4
    },
    renderer: null,
    stage: null,
    graphics: null,
    lines: [],

    lineStyle: {
        default: {
            width: 10,
            alpha: 0.4
        },
        highlight: {
            width: 4,
            alpha: 0.7
        }
    },

    draw() {
        this.renderer.render(this.stage);
    }
};

// Source: http://bl.ocks.org/aaizemberg/78bd3dade9593896a59d
function colores_google(n) {
    let colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    let str = colores_g[n % colores_g.length];
    let red = parseInt(str.slice(1,3), 16);
    let green = parseInt(str.slice(3,5), 16);
    let blue = parseInt(str.slice(5,7), 16);
    return red*65536 + green*256 + blue;
}

const app = new Vue({
    el: '#app',
    data: {
        dimensions: {
            width: 230,
            height: 80 + 80
        },
        contexts: null,
        collections: null,
        attributes: null,
        focusedContext: null,
        groupCollection: null,
        pitchAttribute: null,
        globals: [],

        dsp: {
            fs: 44100,
            nfft: 1024,
            coefs: 20
        },
        tableOffset: 101,

        groupCollNames: null,
        groupCollItems: null,
        attrValueRanges: null
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
                if (this.contexts && this.contexts.includes(data.context.name) && this.focusedContext !== data.context.name) {
                    this.focusedContext = data.context.name;
                    this.onContextFocused();
                }

                els.forEach(el => {
                    if (this.attributes && this.attributes.includes(data.attribute.name)) {
                        if (el.id.startsWith('group')) {
                            this.groupCollection = data.collection.name;
                            this.onGroupCollChanged();
                        } else if (el.id.startsWith('pitch')) {
                            this.pitchAttribute = data.attribute.name;
                            this.onPitchAttrChanged();
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

        onGetData() {
            this.contexts = plugin.getContexts();

            if (this.groupCollection) {
                this.onGroupCollChanged();
            }
        },

        onGetGlobals() {
            this.globals = plugin.globals;
        },

        checkIfGlobal(attr) {
            return this.globals.some(g => g.name === attr);
        },

        onContextFocused() {
            this.collections = plugin.getCollectionsForContext(this.focusedContext);
            this.attributes = plugin.getAttributesForContext(this.focusedContext);
        },

        onGroupCollChanged() {
            let coefs = this.dsp.coefs;
            let nfft = this.dsp.nfft;
            let fs = this.dsp.fs;

            canvas.graphics.clear();
            canvas.lines = [];

            let h = dtm.data(300,8000).freqtomel().line(coefs).meltofreq()
                .mult(nfft/fs).floor().app(nfft);

            let context = this.focusedContext;
            let collection = this.groupCollection;

            this.groupCollItems = plugin.data[context][collection].map(c => {
                // TODO: item.id should be item.caseID
                return c.children.map(childCaseID => plugin.items[context].find(item => item.id === childCaseID));
            });

            this.groupCollItems.forEach((items, idx) => {
                // let itemsNormalized = items.map(item => item.values)
                //     .map(item => {
                //         let res = {};
                //         Object.entries(item).forEach(entry => {
                //             let attr = entry[0];
                //             let val = entry[1];
                //             let ranges = plugin.attrValueRanges[context][attr];
                //
                //             if (ranges.type === 'numeric') {
                //                 if (val === '') {
                //                     res[attr] = NaN;
                //                 } else {
                //                     let min = ranges.min;
                //                     let max = ranges.max;
                //                     res[attr] = (val-min)/(max-min);
                //                 }
                //             } else {
                //                 // res[attr] = val;
                //                 res[attr] = ranges.categories.indexOf(val) / (ranges.categories.length-1);
                //             }
                //         });
                //
                //         return res;
                //     });
                //
                // let itemAvg = itemsNormalized.map(item => Object.values(item).map(attr => isNaN(parseFloat(attr)) ? 0 : attr))
                //     .reduce((p,c) => p.map((v,i) => v + c[i]))
                //     .map(attr => attr / itemsNormalized.length);

                let categoricalAttrs = [];
                let numericAttrs = [];

                Object.entries(plugin.attrValueRanges[context]).forEach(entry => {
                    let attr = entry[0];
                    let ranges = entry[1];

                    if (ranges.type === 'numeric') {
                        numericAttrs.push(attr);
                    } else {
                        categoricalAttrs.push(attr);
                    }
                });

                let interleavedAttrMap;

                if (numericAttrs.length >= categoricalAttrs.length) {
                    interleavedAttrMap = numericAttrs.map((v,i) => i<categoricalAttrs.length ? [v,categoricalAttrs[i]] : [v]);
                } else {
                    interleavedAttrMap = categoricalAttrs.map((v,i) => i<numericAttrs.length ? [numericAttrs[i],v] : [v]);
                }

                interleavedAttrMap = interleavedAttrMap.flat();

                // [{ type, value }, { etc. }]
                let itemsNormalized = items.map(item => item.values)
                    .map(item => {
                        let res = [];
                        Object.entries(item).forEach(entry => {
                            let thing = {};

                            let attr = entry[0];
                            let val = entry[1];
                            let ranges = plugin.attrValueRanges[context][attr];

                            thing['type'] = ranges.type;

                            if (ranges.type === 'numeric') {
                                if (val === '') {
                                    thing['value'] = 0;
                                } else {
                                    let min = ranges.min;
                                    let max = ranges.max;
                                    thing['value'] = (val-min)/(max-min);
                                }
                                if (isNaN(parseFloat(thing['value']))) {
                                    thing['value'] = 0;
                                }
                            } else {
                                thing['value'] = ranges.categories.indexOf(val) / (ranges.categories.length-1);
                            }

                            res[interleavedAttrMap.indexOf(attr)] = thing;
                        });

                        return res;
                    });

                let itemAvg = itemsNormalized
                    .reduce((p,c) => p.map((obj,i) => {
                        obj.value = obj.value + c[i].value;
                        return obj;
                    })).map(summed => {
                        if (summed.type === 'numeric') {
                            summed.value = summed.value / itemsNormalized.length;
                        } else {
                            summed.value = Math.round(summed.value / itemsNormalized.length * 10);
                        }
                        return summed;
                    }).map(averaged => {
                        if (averaged.type === 'numeric') {
                            return [averaged.value];
                        } else {
                            return Array(...Array(averaged.value)).map(v => 0);
                        }
                    }).flat();

                let env = dtm.data(itemAvg)
                    .idct().powof(10)
                    .mapv((v,i) => i===0 ? 0 : v)
                    // .stretch(2, 'zeros')
                    // .app(dtm.data(0).rep(10)).shuffle()
                    // .prep(0)
                    .app(dtm.data(0).rep(Math.ceil(itemAvg.length/3)))
                    .cos(h().fitsum(nfft)).step(nfft)
                    .expc(40)
                    // .expc(10)
                    .range(0,1)
                    .get();

                csound.CreateTable(idx + this.tableOffset, env);

                let graphics = canvas.graphics;
                graphics.lineStyle(canvas.lineStyle.default.width, colores_google(idx), canvas.lineStyle.default.alpha);
                graphics.moveTo(0.05 * canvas.dimensions.width, canvas.dimensions.height * 9.95);
                let path = Array.from(env.slice(0,env.length/2)).map((v,i) => {
                    let x = i/(app.dsp.nfft/2-1) * .9 + 0.05;
                    let y = (1-v) * 0.9 + 0.05;
                    return {
                        x: x*(canvas.dimensions.width-1),
                        y: y*(canvas.dimensions.height-1)
                    };
                });

                path.forEach(point => graphics.lineTo(point.x, point.y));
                canvas.lines[idx] = {
                    color: graphics.lineColor,
                    alpha: graphics.lineAlpha,
                    width: graphics.lineWidth,
                    path: path
                };
            });

            canvas.draw();
        },

        onPitchAttrChanged() {
            // this.pitchAttrRange = this.calcRange(this.pitchAttribute, this.pitchAttrIsDate, this.pitchAttrIsDescending);
        },

        redrawLines() {
            canvas.graphics.clear();
            canvas.lines.forEach(line => {
                canvas.graphics.lineStyle(canvas.lineStyle.default.width, line.color, canvas.lineStyle.default.alpha);
                canvas.graphics.moveTo(0.05, canvas.dimensions.height * 9.95);
                line.path.forEach(point => canvas.graphics.lineTo(point.x, point.y));
            });
        },

        onItemsSelected(items) {
            let range = null;
            let global = null;

            if (this.checkIfGlobal(this.pitchAttribute)) {
                range = {
                    type: 'numeric',
                    length: 1,
                    min: 0,
                    max: 1
                };
                global = this.globals.find(g => g.name === this.pitchAttribute);
            } else {
                range = plugin.attrValueRanges[this.focusedContext][this.pitchAttribute];
            }

            this.redrawLines();
            let graphics = canvas.graphics;

            if (range.type === 'numeric') {
                items.forEach(item => {
                    let val = null;

                    if (global) {
                        val = global.value;
                    } else {
                        val = item.values[this.pitchAttribute];
                    }
                    let table = -1;
                    this.groupCollItems.some((collItems, idx) => {
                        table = collItems.findIndex(collItem => collItem.itemID === item.itemID) !== -1 ? idx : -1;
                        return table !== -1;
                    });

                    if (val !== '' && table !== -1) {
                        val = (val-range.min)/(range.max-range.min);
                        let tableNumNormalized = this.groupCollItems.length>1 ? table/(this.groupCollItems.length-1) : 0;
                        csound.Event(`i1 0 3 ${val} ${table + this.tableOffset} ${tableNumNormalized}`);

                        let line = canvas.lines[table];
                        graphics.lineStyle(canvas.lineStyle.highlight.width, line.color, canvas.lineStyle.highlight.alpha);
                        graphics.moveTo(0.05 * canvas.dimensions.width, canvas.dimensions.height * 9.95);
                        line.path.forEach(point => graphics.lineTo(point.x, point.y));
                    }
                });
            }
            canvas.draw();
        },

        openInfoPage() {
            plugin.openSharedInfoPage();
        }
    },
    mounted() {
        plugin.init('Robot Voices', this.dimensions).then(this.onGetData);

        this.setupDrag();

        codapInterface.on('notify', '*', notice => {
            if (!plugin.checkNoticeIdentity(notice)) {
                return null;
            }

            if (notice.resource === 'documentChangeNotice') {
                plugin.queryAllData().then(this.onGetData);
            } else if (notice.resource.includes('dataContextChangeNotice')) {
                if (notice.values.operation === 'selectCases') {
                    let contextName = notice.resource.split('[').pop().split(']')[0];

                    if (contextName === this.focusedContext) {
                        plugin.getSelectedItems(contextName).then(this.onItemsSelected);
                    }
                } else {
                    plugin.queryAllData().then(this.onGetData);
                }
            } else if (notice.resource === 'component' && notice.values.type === 'slider') {
                plugin.queryGlobalValues().then(this.onGetGlobals);
            } else if (notice.resource === 'undoChangeNotice') {
                plugin.queryGlobalValues().then(this.onGetGlobals);
            }
        });

        canvas.renderer = PIXI.autoDetectRenderer(canvas.dimensions.width, canvas.dimensions.height, {
            view: this.$refs.canvas,
            backgroundColor: 0xFFFFFF,
            antialias: true
        });

        canvas.stage = new PIXI.Container();
        canvas.graphics = new PIXI.Graphics();
        canvas.stage.addChild(canvas.graphics);
        canvas.draw();
    }
});

function moduleDidLoad() {
    window.createTableCallbacks = {};
    csound.Csound.setMessageCallback(message => {
        let message_trunc = message.replace(/\[m/g, '');
        console.log(message_trunc);

        Object.keys(window.createTableCallbacks).forEach(key => {
            window.createTableCallbacks[key](message_trunc);
        });
    });

    csound.Play();

    csound.CompileOrc(`
        ksmps = 200
        
        zakinit 2, 1
        giverbchL = 1
        giverbchR = 2
        turnon "VERB"

        instr 1
        ; kvib oscil 5 * scale(p4,2,.1), 5
        kvib oscil 5 * scale(p4,2,.1), scale(p6, 8, 3)
        asig vco2 0.2, cpsmidinn((scale(p4,100,40))) + kvib
        iFftSize = ${app.dsp.nfft}
        iHopSize = ${app.dsp.nfft/4}
        fsrc pvsanal asig, iFftSize, iHopSize, iFftSize, 1
        fmask pvsmaska fsrc, p5, 1
        aout pvsynth fmask
        aout = aout * madsr(p3/2,0,1,p3/2)
        aout butterlp aout, 5000
        asigL, asigR pan2 aout, scale(p6, 0.9, 0.1)
        outs asigL, asigR
                
        iverbsend = 0.3
        zawm asigL * iverbsend, giverbchL
        zawm asigR * iverbsend, giverbchR
        endin
        
        instr +VERB
        asigL zar giverbchL
        asigR zar giverbchR
        zacl giverbchL, giverbchR
        
        denorm asigL, asigR
        asigL, asigR reverbsc asigL, asigR, .8, sr/2
        
        outs asigL, asigR
        endin
    `);

    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);
}