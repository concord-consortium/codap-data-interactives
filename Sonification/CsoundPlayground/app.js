const plugin = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();
const audioFiles = new AudioFileManager();

// String.trimStart polyfill for Safari
(w=>{
    const String=w.String, Proto=String.prototype;

    ((o,p)=>{
        if(p in o?o[p]?false:true:true){
            const r=/^\s+/;
            o[p]=o.trimLeft||function(){
                return this.replace(r,'')
            }
        }
    })(Proto,'trimStart');

})(window);

function moduleDidLoad() {
    // csound.Csound.setOption('-d');
    csound.Play();

    // Aliases
    let cs = csound;
    cs.compile = CsInterface.compile;
    cs.event = (code) => {
        if (!code.split(' ').includes('NaN')) {
            csound.Event(code);
        }
    };
    cs.table = cs.createTable = csound.CreateTable;
    cs.set = cs.channel = cs.setChannel = csound.SetChannel;
    cs.halt = app.halt;
    window.cs = cs;
    window.print = app.print;

    // Globals
    // TODO: This somehow does not work with PlayCsd().
    window.createTableCallbacks = {};

    window.addEventListener('message', e => {
        // console.log(e.data);
    });

    csound.Csound.setMessageCallback(message => {
        let message_trunc = message.replace(/\[m/g, '');
        console.log(message_trunc);

        app.print(message_trunc);

        for (let key in window.createTableCallbacks) {
            window.createTableCallbacks[key](message);
        }

        if (message.indexOf('new alloc') !== -1) {
            let instrName = message.split(/\s+/)[4].slice(0,-1);
            if (instrName !== 'KillAll' && app.instrs.indexOf(instrName) === -1) {
                app.instrs.push(instrName);
            } else if (instrName === 'KillAll') {

                if (app.haltResolver) {
                    app.haltResolver();
                    app.haltResolver = null;
                }
            }
        }
        else if (message.includes('error:')) {
            alert(message_trunc);
        }
    });

    app.running = true;

    let loadingScreen = document.getElementsByClassName('loading-screen');
    loadingScreen[0].parentNode.removeChild(loadingScreen[0]);
}

const CsInterface = {
    selectionCallback: null,

    compile(orc, sco) {
        if (!orc) {
            orc = '';
        }
        if (!sco) {
            sco = '';
        }
        csound.CompileOrc(orc);
        csound.Event(sco);
    },

    loadAttrSetsToTables(offset) {
        if (typeof(offset) === 'undefined') {
            offset = 1;
        }
        let promises = data.attrList.map(function (attr, attrIdx) {
            let attrSet = data.getAttrSet(attr);
            if (attrSet.every(v => !isNaN(parseFloat(v)))) {
                return csound.CreateTable(attrIdx+offset, attrSet);
            } else {
                return csound.CreateTable(attrIdx+offset, new Float32Array(attrSet.length));
            }
        });

        return Promise.all(promises);
    },

    loadNormalizedAttrSetsToTables(offset) {
        if (typeof(offset) === 'undefined') {
            offset = 1;
        }
        let promises = data.attrList.map(function (attr, attrIdx) {
            let attrSet = data.getNormalizedAttrSet(attr);
            if (attrSet.every(v => !isNaN(parseFloat(v)))) {
                return csound.CreateTable(attrIdx+offset, attrSet);
            } else {
                return csound.CreateTable(attrIdx+offset, new Float32Array(attrSet.length));
            }
        });

        return Promise.all(promises);
    },

    loadCasesToTables(offset) {
        if (typeof(offset) === 'undefined') {
            offset = 1;
        }
        let promises =  data.allCases.map(function (c, caseIdx) {
            let table = data.attrList.map(function (attr) {
                let val = c.case.values[attr];
                return !isNaN(parseFloat(val)) ? val : 0.0;
            });

            return csound.CreateTable(caseIdx+offset, table);
        });

        return Promise.all(promises);
    },

    loadNormalizedCasesToTables(offset) {
        if (typeof(offset) === 'undefined') {
            offset = 1;
        }
        let promises =  data.normalizedCases.map(function (c, caseIdx) {
            let table = data.attrList.map(function (attr) {
                let val = c.case.values[attr];
                return !isNaN(parseFloat(val)) ? val : 0.0;
            });

            return csound.CreateTable(caseIdx+offset, table);
        });

        return Promise.all(promises);
    }
};

// TODO: Get rid of this.
const Query = {
    getDataContextList() {
        return codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
        }).then(function (result) {
            data.contextList = result.values.map(function (dataCtx) {
                return dataCtx.name;
            });
        });
    },

    getCollectionList() {
        return codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + data.context + '].collectionList'
        }).then(function (result) {
            data.collectionList = result.values.map(function (collection) {
                return collection.name;
            });
        })
    },

    getAttrList() {
        return codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + data.context + '].collection[' + data.collection + '].attributeList'
        }).then(function (result) {
            data.attrList = result.values.map(function (attr) {
                return attr.name;
            });
        });
    },

    getAllCases() {
        return codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + data.context + '].collection[' + data.collection + '].allCases'
        }).then(function (result) {
            data.allCases = result.values.cases;
            data.caseIDs = data.allCases.map(function (c) {
                return c.case.id;
            });
            data.normalizeAllCases();
        });
    },

    getSelections() {
        return codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + data.context + '].selectionList'
        }).then(function (result) {
            data.prevSelectedIDs = data.selectedIDs;

            data.selectedIDs = result.values.map(function (c) {
                return c.caseID;
            });
        });
    }
};

// TODO: Simplify!
const data = {
    context: '',
    contextList: [],
    collection: '',
    collectionList: [],
    attrList: [],
    allCases: [],
    normalizedCases: [],
    caseIDs: [],
    selectedIDs: [],
    prevSelectedIDs: [],

    normalizeAllCases() {
        data.normalizedCases = JSON.parse(JSON.stringify(data.allCases));
        data.attrList.forEach(attr => {
            let col = data.getAttrSet(attr);
            if (col.every(v => !isNaN(parseFloat(v)))) {
                let min = Math.min(...col);
                let max = Math.max(...col);
                col.forEach((v,i) => {
                    data.normalizedCases[i].case.values[attr] = (v-min) / (max-min);
                });
            }
        });
    },

    getAttrList() {
        return this.attrList;
    },

    getAttrSet(key) {
        if (isNaN(parseInt(key))) {
            return data.allCases.map((case_) => {
                return case_.case.values[key];
            });
        } else {
            return data.allCases.map((case_) => {
                return case_.case.values[data.attrList[key]];
            });
        }
    },

    getNormalizedAttrSet(key) {
        if (isNaN(parseInt(key))) {
            return data.normalizedCases.map((case_) => {
                return case_.case.values[key];
            });
        } else {
            return data.normalizedCases.map((case_) => {
                return case_.case.values[data.attrList[key]];
            });
        }
    },

    getSelectedCases() {
        return data.selectedIDs.map(function (id) {
            return data.allCases.find(function (c) {
                return c.case.id === id;
            });
        }).filter(c => !!c);
    },

    getNormalizedSelectedCases() {
        return data.selectedIDs.map(function (id) {
            return data.normalizedCases.find(function (c) {
                return c.case.id === id;
            });
        }).filter(c => !!c);
    },

    getSelectedCaseIndices() {
        return data.selectedIDs.map(function (id) {
            let res = data.allCases.find(function (c) {
                return c.case.id === id;
            });

            return res ? res.caseIndex : null;
        }).filter(c => !!c);
    },

    getSelectedValues(...keys) {
        let cases = data.getSelectedCases();
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return cases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    },

    getNormalizedSelectedValues(...keys) {
        let cases = data.getNormalizedSelectedCases();
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return cases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    },

    getValues(...keys) {
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return data.allCases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    },

    getNormalizedValues(...keys) {
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return data.normalizedCases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    },

    getSelectedOrAllValues(...keys) {
        let cases = data.selectedIDs.length !== 0 ? data.getSelectedCases() : data.allCases;
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return cases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    },

    getNormalizedSelectedOrAllValues(...keys) {
        let cases = data.selectedIDs.length !== 0 ? data.getNormalizedSelectedCases() : data.normalizedCases;
        let attrs = keys.length !== 0 ? keys : data.attrList;
        return cases.map(function (c) {
            return attrs.map(function (key) {
                let attr = Number.isInteger(key) ? data.attrList[key] : key;
                return c.case.values[attr];
            });
        }).filter(c => !!c);
    }
};

const app = new Vue({
    el: '#app',

    data: {
        dimensions: {
            width: 400,
            height: 400
        },
        editor: null,
        orcEditor: null,
        scoEditor: null,
        running: false,
        instrs: [],
        haltResolver: null,
        commands: [
            'Load all attribute sets to Csound tables',
            'Load normalized attribute sets to Csound tables',
            'Load all cases to Csound tables',
            'Load normalized cases to Csound tables'
        ],
        selectedCommand: '',
        csoundLog: [],

        selectedCases: null,
        selectedItems: null,

        attrValueRanges: null,
        codapEventHandler: null,

        audioFiles: {}
    },

    methods: {
        eval() {
            if (!this.running) {
                csound.Play();
                this.running = true;
            }

            if (CSOUND_AUDIO_CONTEXT.state !== 'running') {
                CSOUND_AUDIO_CONTEXT.resume().then(_ => {
                    this.halt().then(_ => {
                        eval(this.editor.getValue());
                    });
                });
            } else {
                eval(this.editor.getValue());
            }

            // TODO: Flash screen
        },
        evalSelected() {
            if (!this.running) {
                csound.Play();
                this.running = true;
            }
            eval(this.editor.getSelection());
        },
        halt(include, exclude) {
            // csound.Stop();
            // this.running = false;

            // this.instrs = [];

            let instrs = app.instrs;

            if (include) {
                if (Array.isArray(include)) {
                    instrs = include;
                } else {
                    instrs = [include];
                }
            }

            if (exclude) {
                if (!Array.isArray(exclude)) {
                    exclude = [exclude];
                }
                instrs = instrs.filter(function (instr) {
                    return exclude.indexOf(instr) === -1;
                });
            }

            return new Promise(function (resolve) {
                if (!!include && !!exclude) {
                    csound.Stop();
                    csound.Csound.compileOrc("nchnls=2\n0dbfs=1\n");
                    csound.Start();
                    resolve();
                } else {
                    let orc = "instr +KillAll\n";
                    instrs.forEach(instr => {
                        if (isNaN(parseInt(instr))) {
                            orc += `turnoff2 "${instr}", 0, 0\n`
                        } else {
                            orc += `turnoff2 ${instr}, 0, 0\n`
                        }
                    });
                    orc += "turnoff\n";
                    orc += "endin";

                    csound.CompileOrc(orc);
                    csound.Event(`i "KillAll" 0 1`);
                    app.haltResolver = resolve;
                }
            });
        },
        execute() {
            switch(app.commands.indexOf(app.selectedCommand)) {
                default:
                    break;
                case 0:
                    CsInterface.loadAttrSetsToTables();
                    break;
                case 1:
                    CsInterface.loadNormalizedAttrSetsToTables();
                    break;
                case 2:
                    CsInterface.loadCasesToTables();
                    break;
                case 3:
                    CsInterface.loadNormalizedCasesToTables();
                    break;
            }
        },
        openFile(event) {
            let file = event.target.files[0];
            let reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = e => {
                this.editor.setValue(e.target.result);
            };
        },
        initEditor() {
            const editorOptions = {
                lineNumbers: true,
                lineWrapping: true,
                tabSize: 2,
                indentUnit: 2,
                keyMap: 'sublime',
                autoCloseBrackets: true,
                matchBrackets: true,
                continueComments: 'Enter',
                viewportMargin: Infinity
            };

            this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), editorOptions);
            this.editor.setOption('extraKeys', {
                'Cmd-Enter': this.eval,
                'Shift-Enter': this.evalSelected,
                'Cmd-.': () => { this.halt() },
                'Ctrl-C': () => { this.halt() },
                'Cmd-Backspace': 'deleteLine',
                'Cmd-Alt-D': 'duplicateLine'
            });

            // Editor cache
            let prevSessionCode = sessionStorage.getItem('csCode');
            if (prevSessionCode) {
                this.editor.setValue(prevSessionCode);
            }

            window.addEventListener('beforeunload', () => {
                sessionStorage.setItem('csCode', this.editor.getValue());
            });
        },

        initNamespace() {
            window.codap = this.codapEventHandler;

            // TODO: Not working.
            window.codap.data = plugin.data;
            window.codap.items = plugin.items;

            window.attr = data.getAttrSet;
            window.nattr = data.getNormalizedAttrSet;
            window.sel = this.getSelection;
            window.sel2 = this.getSelectionMatrix;
            window.nsel = this.getNormalizedSelection;
            window.nsel2 = this.getNormalizedSelectionMatrix;
            window.onSelection = this.onSelection;
        },

        calcAttrValueRanges(items) {
            this.attrValueRanges = {};

            Object.keys(items).forEach(context => {
                this.attrValueRanges[context] = {};
                let attrs = plugin.getAttributesForContext(context);

                attrs.forEach(attr => {
                    let attrValues = plugin.getAttrValuesForContext(context, attr);

                    // let filteredAttrValues = attrValues && attrValues.map(parseFloat).filter(v => !Number.isNaN(v));

                    let filteredAttrValues = attrValues && attrValues.map(val => {
                        // if (typeof(val) === 'number') {
                        //     return parseFloat(val);
                        // } else {
                        //     return Date.parse(val);
                        // }
                        return parseFloat(val);
                    }).filter(v => !Number.isNaN(v));

                    if (filteredAttrValues.length) {
                        this.attrValueRanges[context][attr] = {
                            type: 'numeric', // TODO: How about dates?
                            length: filteredAttrValues.length,
                            min: Math.min(...filteredAttrValues),
                            max: Math.max(...filteredAttrValues)
                        };
                    } else {
                        filteredAttrValues = attrValues.filter(val => val !== '');

                        this.attrValueRanges[context][attr] = {
                            type: 'categorical',
                            length: filteredAttrValues.length,
                            categories: Array.from(new Set(filteredAttrValues))
                        };
                    }
                });
            });
        },

        onGetData(result) {
            if (result) {
                this.calcAttrValueRanges(result.items);
            }
        },

        getSelection(attr) {
            return this.selectedItems.map(item => {
                return item.values[attr];
            });
        },

        getNormalizedSelection(attr) {
            if (this.attrValueRanges && this.attrValueRanges[this.selectedContext][attr].type === 'numeric') {
                let min = this.attrValueRanges[this.selectedContext][attr].min;
                let max = this.attrValueRanges[this.selectedContext][attr].max;

                return this.selectedItems.map(item => item.values[attr])
                    .map(parseFloat).filter(v => !Number.isNaN(v))
                    .map(v => (v-min)/(max-min));
            } else {
                return null;
            }
        },

        getSelectionMatrix(...attrs) {
            return this.selectedItems.map(item => {
                let res = {};
                attrs.forEach(attr => {
                    res[attr] = item.values[attr];
                });
                return res;
            });
        },

        getNormalizedSelectionMatrix(...attrs) {
            return this.selectedItems.map((item) => {
                let res = {};
                attrs.forEach(attr => {
                    let val = item.values[attr];

                    if (this.attrValueRanges && this.attrValueRanges[this.selectedContext][attr].type === 'numeric') {
                        if (val === '') {
                            res[attr] = NaN;
                        } else {
                            let min = this.attrValueRanges[this.selectedContext][attr].min;
                            let max = this.attrValueRanges[this.selectedContext][attr].max;
                            res[attr] = (val-min)/(max-min);
                        }
                    } else {
                        res[attr] = val;
                    }
                });
                return res;
            });
        },

        onSelection(callback) {
            this.selectionCallback = callback;
        },

        openInfoPage() {
            plugin.openSharedInfoPage();
        },

        openManual() {
            return codapInterface.sendRequest({
                action: 'create',
                resource: 'component',
                values: {
                    type: 'webView',
                    name: 'Csound Manual',
                    title: 'Csound Manual',
                    URL: 'https://csound.com/docs/manual/index.html',
                    dimensions: {
                        width:400,
                        height:600
                    },
                    position: 'top'
                }
            }).then(console.log);
        },

        print(message) {
            if (typeof(message) === 'undefined') {
                return null;
            }

            if (message.constructor.name === 'Float32Array') {
                message = Array.from(message);
            }

            this.csoundLog.push(message);
            if (this.csoundLog.length > 5) {
                this.csoundLog.shift();
            }
        },
        selectionCallback: null,
        selectedContext: null
    },

    mounted() {
        // General
        this.codapEventHandler = {
            on: (eventType, callback) => {
                switch (eventType) {
                    case 'selection':
                    case 'select':
                    case 'sel':
                        this.selectionCallback = callback;
                        break;
                    default:
                        break;
                }
            },

            global: (name) => {
                let res = plugin.globals.find(g => g.name === name);
                return res ? res.value : null;
            }
        };

        this.initNamespace();

        // Codemirror
        this.initEditor();

        // CODAP
        plugin.init('Csound Playground', this.dimensions).then(this.onGetData);

        codapInterface.on('notify', '*', notice => {
            if (!plugin.checkNoticeIdentity(notice)) {
                return null; // Don't do anything for duplicate notices.
            }

            if (notice.resource === 'documentChangeNotice') {

                plugin.queryAllData().then(this.onGetData);

            } else if (notice.resource.includes('dataContextChangeNotice')) {
                if (notice.values.operation === 'selectCases') {
                    let contextName = notice.resource.split('[').pop().split(']')[0];

                    plugin.getSelectedCases(contextName).then(cases => {
                        let depth = 0;

                        // console.log(cases);

                        let traverse = (node, depth) => {
                            let match = cases.find(c => c.id === node.parent);
                            return match ? traverse(match, ++depth) : depth;
                        };

                        if (cases.length) {
                            depth = traverse(cases[cases.length-1], 1);


                        }

                        // console.log(depth);

                        let parents = [];
                        let currentDepth = 1;
                        let res = [];

                        cases.forEach(c => {
                            if (c.children.length) {
                                res.push([c.children.length]);
                                if (parents.indexOf(c.id) === -1) {
                                    parents.push(c.id);
                                }

                                if (parents.indexOf(c.parent) !== -1) {

                                }
                            }
                        });
                        // console.log(res);
                    });

                    plugin.getSelectedItems(contextName).then(items => {
                        this.selectedItems = items;
                        this.selectedContext = contextName;
                        let attrs = plugin.getAttributesForContext(contextName);
                        let args = [this.getNormalizedSelectionMatrix(...attrs), this.getSelectionMatrix(...attrs), this.attrValueRanges[contextName]];
                        this.selectionCallback && this.selectionCallback(...args);
                    });

                } else {
                    plugin.queryAllData().then(this.onGetData);
                }
                // else if (notice.values.operation === 'moveAttribute') {
                //     Query.getAttrList();
                // } else if (['moveCases', 'createCases', 'deleteCases', 'updateCases'].indexOf(notice.values.operation) !== -1) {
                //     Query.getAllCases();
                //     Query.getAttrList();
                // } else if (notice.values.operation === 'createCollection' || notice.values.operation === 'deleteCollection') {
                //     Query.getCollectionList();
                // }
            } else if (notice.resource === 'undoChangeNotice') {
                plugin.queryGlobalValues();
            }
        });

        dragHandler.on('dragstart', (data, els) => {
            els.forEach(el => {
                el.style.outline = '3px solid rgba(0,255,255,0.5)';
            });
        });

        dragHandler.on('dragend', (data, els) => {
            els.forEach(el => {
                el.style.outline = 'transparent';
            });
        });

        dragHandler.on('drop', data => {
            let doc = this.editor.getDoc();
            let cursor = doc.getCursor();
            let pos = {
                line: cursor.line,
                ch: cursor.ch
            };

            let replaceWith = null;

            let line = doc.getLine(pos.line);
            if (pos.ch !== 0 && pos.ch !== line.length-1) {
                let surrounding = doc.getRange({
                    line: pos.line,
                    ch: pos.ch - 1
                }, {
                    line: pos.line,
                    ch: pos.ch + 1
                });

                if (surrounding === `''` || surrounding === `""`) {
                    replaceWith = data.text;
                } else {
                    replaceWith = `'${data.text}'`;
                }
            } else {
                replaceWith = `'${data.text}'`;
            }
            doc.replaceRange(replaceWith, pos);
        });

        // Drop area should have physical presence.
        // this.$el.style.width = this.dimensions.width + 'px';
        // this.$el.style.height = this.dimensions.height + 'px';

        let actx = new (window.AudioContext || window.webkitAudioContext)();

        this.$el.addEventListener('dragover', event => {
            event.preventDefault();
            return false;
        }, false);

        this.$el.addEventListener('drop', event => {
            event.preventDefault();

            console.log(event);
            console.log(event.dataTransfer.getData('URL'));

            audioFiles.addDataTransferFiles(event.dataTransfer.files);

            Array.from(event.dataTransfer.files).forEach(file => {
                let name = file.name;
                let type = file.type.split('/')[0];

                if (type === 'audio') {
                    let reader = new FileReader();
                    reader.readAsArrayBuffer(file);
                    reader.onload = e => {
                        let arrayBuffer = e.target.result;
                        actx.decodeAudioData(arrayBuffer, buffer => {
                            for (let i = 0; i < buffer.numberOfChannels; i++ ) {
                                let res = buffer.getChannelData(i);
                                csound.CreateTable(i + 100, res);
                            }

                            this.audioFiles[name] = buffer;
                        });
                    };
                }
            });
        });
    }
});
