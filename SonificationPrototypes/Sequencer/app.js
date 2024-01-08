/**
 * Created by Takahiko Tsuchiya on 8/21/18.
 */

const helper = new CodapPluginHelper(codapInterface);
const dragHandler = new CodapDragHandler();

const app = new Vue({
    el: '#app',
    data: {
        dim: {
            width: 230,
            height: 145
        },

        helper: null,
        data: null,
        contextList: [],
        collectionList: [],
        selectedContext: null,
        selectedCollection: null,

        sequencer: {
            ticker: null,
            speed: dtm.data(0.5).expc(50,0,1).expc(50,0,1).range(0.1,25,0,1).get(0),
            offset: 0,
            active: false
        },

        controls: {
            speedSlider: null,
            phaseSlider: null
        }
    },
    methods: {
         getAllData() {
            this.data = {};

            this.getContextList().then(_ => {
                this.getCollectionList().then(_ => {
                    this.getAllCases().then(_ => {
                        this.fillLists();
                        this.selectLastCollection();
                    });
                });
            });
        },

        fillLists() {
            this.contextList = Object.keys(this.data);
            if (this.contextList.length !== 0) {
                this.collectionList = Object.keys(this.data[this.contextList[0]]);
            }
        },

        onContextSelected() {
            this.collectionList = Object.keys(this.data[this.selectedContext]);
        },

        selectFirstCollection() {
            this.selectedContext = this.contextList[0];
            this.selectedCollection = this.collectionList[0];
        },

        selectLastCollection() {
            this.selectedContext = this.contextList[0];
            this.selectedCollection = this.collectionList[this.collectionList.length-1];
        },

        getContextList() {
            return codapInterface.sendRequest({
                action: 'get',
                resource: 'dataContextList'
            }).then(result => {
                result.values.forEach(context => {
                    this.data[context.name] = {};
                });
            });
        },

        getCollectionList() {
            return Promise.all(Object.keys(this.data).map(context => {
                return codapInterface.sendRequest({
                    action: 'get',
                    resource: `dataContext[${context}].collectionList`
                }).then(result => {
                    result.values.forEach(collection => {
                        this.data[context][collection.name] = {};
                    });
                });
            }));
        },

        getAllCases() {
            return Promise.all(Object.keys(this.data).map((context) => {
                return Object.keys(this.data[context]).map(collection => {
                    return codapInterface.sendRequest({
                        action: 'get',
                        resource: `dataContext[${context}].collection[${collection}].allCases`
                    }).then(result => {
                        this.data[context][collection] = result.values.cases.map(c => c.case);
                    });
                });
            }).reduce((a,b) => a.concat(b), []));
        },

        start() {
            let offset = this.sequencer.offset;

            this.sendSelect();

            this.sequencer.ticker = dtm.music().play().every(1/this.sequencer.speed).rep().amp(0).each((m,i) => {
                let len = this.data[this.selectedContext][this.selectedCollection].length;
                this.controls.phaseSlider.value = ((i+offset)%len)/(len-1);
            });
        },

        stop() {
            if (this.sequencer.ticker) {
                this.sequencer.ticker.stop();
                this.sequencer.ticker = null;
            }
        },

        rewind() {
            this.controls.phaseSlider.value = 0;
        },

        sendSelect() {
            let values = [this.data[this.selectedContext][this.selectedCollection][this.sequencer.offset].id];

            codapInterface.sendRequest({
                action: 'create',
                resource: `dataContext[${this.selectedContext}].selectionList`,
                values: values
            });
        },

        selectAll(bool) {
            let values = bool ? this.data[this.selectedContext][this.selectedCollection].map(c => c.id) : [];

            codapInterface.sendRequest({
                action: 'create',
                resource: `dataContext[${this.selectedContext}].selectionList`,
                values: values
            });
        },

        openInfoPage() {
            helper.openSharedInfoPage();
        }
    },
    mounted() {
        codapInterface.init({
            name: 'Case Sequencer',
            title: 'Case Sequencer',
            version: '1.0',
            dimensions: {
                width: this.dim.width,
                height: this.dim.height + 25
            }
        }).then(this.getAllData);

        codapInterface.on('notify', '*', notice => {
            if (!helper.checkNoticeIdentity(notice)) {
                return null; // Don't do anything for duplicate notices.
            }

            if (notice.resource === 'documentChangeNotice') {
                this.getAllData();

                // this.helper.getAllData();
            } else if (notice.resource.includes('dataContextChangeNotice')) {
                if (notice.values.operation !== 'selectCases') {
                    this.getAllData();
                }
            }
        });

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
                if (el.id === 'context-menu') {
                    this.selectedContext = data.context.name;
                    this.onContextSelected();
                } else if (el.id === 'collection-menu') {
                    this.selectedContext = data.context.name;
                    this.onContextSelected();
                    this.selectedCollection = data.collection.name;
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

        this.controls.speedSlider = new Nexus.Slider('#speed-slider', {
            size: [120, 20],
            mode: 'absolute',
            min: 0,
            max: 1,
            step: 0,
            value: 0.5
        });

        this.controls.speedSlider.on('change', v => {
            this.sequencer.speed = dtm.data(v).expc(50,0,1).expc(50,0,1).range(0.1,25,0,1).get(0);
            console.log(this.sequencer.speed);

            if (this.sequencer.ticker) {
                this.sequencer.ticker.every(1 / this.sequencer.speed);
            }
        });

        this.controls.phaseSlider = new Nexus.Slider('#phase-slider', {
            size: [120, 20],
            mode: 'absolute',
            min: 0,
            max: 1,
            step: 0,
            value: 0
        });

        this.controls.phaseSlider.on('change', v => {
            let offset = Math.round((this.data[this.selectedContext][this.selectedCollection].length-1) * v);
            if (this.sequencer.offset !== offset) {
                this.sequencer.offset = offset;

                this.sendSelect();
            }
        });

        this.controls.selectAllToggle = new Nexus.Toggle('#select-all-toggle', {
            size: [40, 20]
        });

        this.controls.selectAllToggle.on('change', v => {
            this.selectAll(v);
        });
    }
});