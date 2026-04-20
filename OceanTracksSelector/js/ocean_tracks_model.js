"use strict";

var OceanTracksModel = {

    kDatasetName: "Ocean Tracks",
    trackArray: {},

    initialize: async function () {
        var savedState = await codapInterface.init({
            name: "Ocean Tracks",
            title: "Ocean Tracks Track Selector",
            version: "2.0",
            dimensions: {width: 250, height: 400}
        });

        // Check if dataset already exists before creating
        var iResult = await codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
        });
        if (iResult.success && !iResult.values.some(
                function (ds) {
                    return [ds.name, ds.title].includes(OceanTracksModel.kDatasetName);
                })) {
            await codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext',
                values: {
                name: OceanTracksModel.kDatasetName,
                title: OceanTracksModel.kDatasetName,
                collections: [
                    {
                        name: "Track",
                        attrs: [
                            {name: "id", type: 'categorical', description: "The Database ID"},
                            {name: "animal_id", type: 'nominal', description: "Human Readable Track Name"},
                            {name: "species_id", type: 'nominal', description: "Human Readable Species Name"}
                        ],
                        labels: {
                            singleCase: "Track",
                            pluralCase: "Tracks",
                            singleCaseWithArticle: "a track",
                            setOfCases: "track",
                            setOfCasesWithArticle: "a track"
                        }
                    },
                    {
                        name: "Samples",
                        parent: "Track",
                        attrs: [
                            {name: "Datestamp", type: 'date', description: "Sample Date"},
                            {name: "latitude", type: 'numeric', description: "Sample Latitude", precision: 6},
                            {name: "longitude", type: 'numeric', description: "Sample Longitude", precision: 6},
                            {name: "Depth", type: 'numeric', description: "Sample Depth (m)", precision: 1},
                            {name: "Temp", type: 'numeric', description: "Sample Temp (C)", precision: 1},
                            {name: "Days", type: 'numeric', description: "Sample Days in Unix", precision: 6},
                            {name: "Curviness", type: 'numeric', description: "Sample Curviness Ratio", precision: 2},
                            {name: "Chl", type: 'numeric', description: "Sample Chlorophyl", precision: 1}
                        ],
                        labels: {
                            singleCase: "sample",
                            pluralCase: "samples",
                            singleCaseWithArticle: "a sample",
                            setOfCases: "sample",
                            setOfCasesWithArticle: "a sample"
                        }
                    }
                ]
            }});
        }

        await codapInterface.sendRequest({
            action: 'create',
            resource: 'component',
            values: {
                type: 'caseTable',
                dataContext: OceanTracksModel.kDatasetName
            }
        });

        notifications.registerForDocumentChanges();

        // Restore previously selected tracks if reopening a saved document
        if (savedState && savedState.tracks) {
            this.restoreState(savedState.tracks);
        }
    },

    loadTracks: async function (trackIdList) {
        for (var i = 0; i < trackIdList.length; i++) {
            await this.loadTrack(trackIdList[i]);
        }
    },

    loadTrack: async function (trackId) {
        disableCheckbox(trackId);

        var response = await fetch("./data/trackJson/" + trackId + ".json");
        var j = await response.json();

        if (!j || j.length === 0) {
            enableCheckbox(trackId);
            return;
        }

        // Create parent Track case
        var trackValues = {
            id: j[0].track_id,
            animal_id: j[0].animal_id,
            species_id: j[0].species
        };

        var result = await codapInterface.sendRequest({
            action: 'create',
            resource: "dataContext[Ocean Tracks].collection[Track].case",
            values: [{values: trackValues}]
        });

        if (result.success) {
            var parentCaseID = result.values[0].id;

            // Store track info
            this.trackArray[trackId] = {
                id: trackId,
                caseID: parentCaseID,
                loaded: true
            };

            // Build sample cases
            var sampleValues = [];
            for (var i = 0; i < j.length; i++) {
                var depth = parseFloat(j[i].depth) === -999 ? null : parseFloat(j[i].depth);
                var temperature = parseFloat(j[i].temperature) === -999 ? null : parseFloat(j[i].temperature);
                var curviness = parseFloat(j[i].curviness) === -999 ? null : parseFloat(j[i].curviness);
                var chl = parseFloat(j[i].chl) === -999 ? null : parseFloat(j[i].chl);

                sampleValues.push({
                    parent: parentCaseID,
                    values: {
                        Datestamp: new Date(j[i].ds * 1000).toISOString(),
                        latitude: parseFloat(j[i].latitude),
                        longitude: parseFloat(j[i].longitude),
                        Depth: depth,
                        Temp: temperature,
                        Days: i,
                        Curviness: curviness,
                        Chl: chl
                    }
                });
            }

            await codapInterface.sendRequest({
                action: 'create',
                resource: "dataContext[Ocean Tracks].collection[Samples].case",
                values: sampleValues
            });

            this.updateSavedState();
        }

        enableCheckbox(trackId);
    },

    deleteTrack: async function (trackId) {
        var track = this.trackArray[trackId];
        if (!track || !track.loaded) return;

        await codapInterface.sendRequest({
            action: 'delete',
            resource: "dataContext[Ocean Tracks].collection[Track].caseByID[" + track.caseID + "]"
        });

        track.loaded = false;
        this.updateSavedState();
    },

    updateSavedState: function () {
        var tracks = [];
        var keys = Object.keys(this.trackArray);
        for (var i = 0; i < keys.length; i++) {
            var track = this.trackArray[keys[i]];
            if (track.loaded) {
                tracks.push([track.id, track.caseID]);
            }
        }
        codapInterface.updateInteractiveState({tracks: tracks});
    },

    clearData: async function () {
        await codapInterface.sendRequest({
            action: 'delete',
            resource: "dataContext[Ocean Tracks].collection[Track].allCases"
        });

        this.trackArray = {};
        this.updateSavedState();

        // Uncheck all checkboxes
        $('#trackSelectForm').find('.trackCB').each(function (j, obj) {
            obj.checked = false;
        });
    },

    restoreState: function (tracks) {
        for (var i = 0; i < tracks.length; i++) {
            var val = tracks[i];
            this.trackArray[val[0]] = {
                id: val[0],
                caseID: val[1],
                loaded: true
            };
            selectCheckbox(val[0]);
        }
    }

};
