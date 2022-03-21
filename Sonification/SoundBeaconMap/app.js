const plugin = new CodapPluginHelper(codapInterface);
const audioFiles = new AudioFileManager();

const app = new Vue({
    el: '#app',
    data: {
        dimensions: {
            width: 400,
            height: 400
        },

        latNames: ['latitude', 'lat'],
        lonNames: ['longitude', 'lon', 'long', 'lng'],

        map: null,
        circleLayerGroup: null,
        marker: null,

        csoundReady: false,
        useSamples: false,
        audioFiles: {},

        focusedContext: null,
        selectedItems: null
    },
    methods: {
        init() {
            plugin.init('Sound Beacons', this.dimensions).then(this.onGetData);

            codapInterface.on('notify', '*', notice => {
                if (!plugin.checkNoticeIdentity(notice)) {
                    return null; // Don't do anything for duplicate notices.
                }

                if (notice.resource === 'documentChangeNotice') {
                    plugin.queryAllData().then(this.onGetData);
                } else if (notice.resource.includes('dataContextChangeNotice')) {
                    let contextName = notice.resource.split('[').pop().split(']')[0];

                    if (notice.values.operation === 'selectCases') {
                        this.onItemsSelected(contextName);
                    } else {
                        plugin.queryAllData().then(this.onGetData);
                    }
                }
            });
        },

        configureDrop() {
            // Drop area should have a physical presence.
            // this.$el.style.width = this.dimensions.width + 'px';
            // this.$el.style.height = this.dimensions.height + 'px';

            this.$el.addEventListener('dragover', event => {
                event.preventDefault();
                return false;
            }, false);

            this.$el.addEventListener('drop', event => {
                event.preventDefault();

                this.halt();
                audioFiles.removeFiles();
                audioFiles.addDataTransferFiles(event.dataTransfer.files);
                this.useSamples = true;
            });
        },

        setupMap() {
            // Map dimension
            // this.$refs.map.style.width = this.dimensions.width + 'px';
            // this.$refs.map.style.height = this.dimensions.height + 'px';

            let osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            let osmAttrib = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
            let osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
            this.map = L.map('map').setView(new L.LatLng(39.08, -120.0435), 11).addLayer(osm);

            this.marker = new L.marker([39.08, -120.0435], {
                draggable: true,
                autoPan: false,
            }).addTo(this.map);

            this.marker.on('drag', this.updateDistance);
        },

        onGetData() {

        },

        onItemsSelected(context) {
            this.focusedContext = context;
            let eventQueue = [];

            this.recompile().then(_ => {
                plugin.getSelectedItems(context).then(items => {
                    if (this.circleLayerGroup) {
                        this.map.removeLayer(this.circleLayerGroup);
                    }

                    this.circleLayerGroup = L.layerGroup();

                    this.selectedItems = items;
                    this.updateDistance();

                    items.forEach(item => {
                        if (this.hasCoordinate(item)) {
                            // TODO: Hardcoded bits
                            let range = plugin.attrValueRanges[context]['Water_Temp'];
                            let mod = (item.values['Water_Temp']-range.min)/(range.max-range.min);
                            let voice = plugin.attrValueRanges[context]['Station'].categories.indexOf(item.values['Station']);
                            let noteNum = [60,67,74,81][voice];

                            eventQueue.push(`i1 0 5 ${voice} ${mod} ${noteNum}`);

                            // Draw circles
                            let circle = L.circle(this.getCoordinate(item), {
                                color: 'blue',
                                fillColor: 'blue',
                                fillOpacity: 0.5,
                                radius: 500 * mod + 250
                            });

                            this.circleLayerGroup.addLayer(circle);
                        }
                    });

                    eventQueue.forEach(csound.Event);
                    this.map.addLayer(this.circleLayerGroup);
                });
            });
        },

        hasCoordinate(item) {
            if (!item || !item.values) {
                return false;
            }

            let hasLat = Object.keys(item.values).some(attr => {
                return this.latNames.includes(attr.toLowerCase()) && !isNaN(parseFloat(item.values[attr]));
            });
            let hasLon = Object.keys(item.values).some(attr => {
                return this.lonNames.includes(attr.toLowerCase()) && !isNaN(parseFloat(item.values[attr]));
            });
            return hasLat && hasLon;
        },

        getCoordinate(item) {
            let result = [];

            Object.entries(item.values).forEach(entry => {
                let key = entry[0];
                let value = entry[1];

                if (this.latNames.includes(key.toLowerCase())) {
                    result[0] = parseFloat(value);
                }
                if (this.lonNames.includes(key.toLowerCase())) {
                    result[1] = parseFloat(value);
                }
            });

            if (result[0] && result[1]) {
                return result;
            } else {
                return null;
            }
        },

        getNormalizedCoordXY(lat, lon) {
            let bounds = this.map.getBounds();

            let north = bounds.getNorth();
            let south = bounds.getSouth();
            let west = bounds.getWest();
            let east = bounds.getEast();

            let normalizedLat = (lat-south)/(north-south);
            let normalizedLon = (lon-west)/(east-west);

            return [normalizedLon, normalizedLat];
        },

        getMarkerDistance(x, y) {
            let markerCoord = this.marker.getLatLng();
            let markerLat = markerCoord.lat;
            let markerLon = markerCoord.lng;
            let [markerX, markerY] = this.getNormalizedCoordXY(markerLat, markerLon);

            // return Math.sqrt(Math.pow(x-markerX,2)+Math.pow(y-markerY,2)) / Math.sqrt(2);
            return Math.sqrt(Math.pow(x-markerX,2)+Math.pow(y-markerY,2));
        },

        clip(input) {
            return Math.min(Math.max(input, 0), 1);
        },

        updateDistance() {
            if (this.selectedItems && this.selectedItems.length) {
                this.selectedItems.forEach(item => {
                    if (this.hasCoordinate(item)) {
                        let [lat, lon] = this.getCoordinate(item);
                        let [x, y] = this.getNormalizedCoordXY(lat, lon);
                        let dist = this.getMarkerDistance(x, y);
                        let amp = this.clip(1-dist);

                        // TODO: Hardcoded bits
                        let contextName = this.focusedContext;
                        if (contextName) {
                            let voice = plugin.attrValueRanges[contextName]['Station'].categories.indexOf(item.values['Station']);

                            csound.SetChannel(`gain_${voice}`, amp);
                        }
                    }
                });
            }
        },

        compileSynthesizer() {
            csound.CompileOrc(`
                instr 1
                SgainChannel sprintf "gain_%d", p4
                kgain chnget SgainChannel
                kgain = expcurve(kgain, 10)
                kgain = expcurve(kgain, 10)
                aenv = madsr(0.5,0,1,0.5)
                alfo = oscil(1,scale(logcurve(p5,10),8,0.5))
                asig oscil kgain * aenv * alfo, cpsmidinn(p6)
                outs asig, asig
                endin
            `);
        },

        compileSamplePlayer() {
            csound.CompileOrc(`
                instr 1
                p3 = ftlen(100)/44100 * 3
                asig tablei phasor:a(44100/ftlen(100+p4)), 100+p4, 1
                
                SgainChannel sprintf "gain_%d", p4
                kgain chnget SgainChannel
                kgain = expcurve(kgain, 10)
                kgain = expcurve(kgain, 10)
                asig *= kgain * 1.5
                
                adel delayr 1/cpsmidinn(p6)
                delayw asig + adel * (logcurve(p5,10) * 0.98)
                outs adel, adel
                endin
            `);
        },

        halt() {
            csound.Stop();
            csound.Csound.compileOrc("nchnls=2\n0dbfs=1\n");
            csound.Start();
        },

        recompile() {
            this.halt();

            if (this.useSamples) {
                let promises = Object.values(audioFiles.buffers)
                    .map((buffer, i) => {
                        return csound.CreateTable(i+100, buffer.getChannelData(0));
                    });
                return Promise.all(promises).then(this.compileSamplePlayer);
            } else {
                this.compileSynthesizer();
                return Promise.resolve();
            }
        }
    },
    mounted() {
        this.init();
        this.configureDrop();
    }
});

function moduleDidLoad() {
    app.setupMap(); // Defer the map loading until the WASM Csound finishes loading.

    window.createTableCallbacks = {};
    csound.Csound.setMessageCallback(message => {
        let message_trunc = message.replace(/\[m/g, '');
        console.log(message_trunc);

        Object.keys(window.createTableCallbacks).forEach(key => {
            window.createTableCallbacks[key](message_trunc);
        });
    });

    csound.Play(); // TODO: Autoplay policy
    app.csoundReady = true;
    app.compileSynthesizer();
}