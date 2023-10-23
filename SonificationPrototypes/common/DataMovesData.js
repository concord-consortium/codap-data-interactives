const DATAMOVES_DATA = {
    name: 'Data Moves',

    // Note: Child collections first.
    collections: [{
        name: 'Moves',
        title: 'Moves',
        attrs: ['ID', 'Context', 'Collection', 'Attribute', 'Formula', 'Direction', 'Plugin', 'Parameter', 'Attr Type']
    }, {
        name: 'Timestamps',
        title: 'Timestamps',
        attrs: ['Time', 'Type', 'Notes']
    }],

    getCollections() {
        return this.collections.map(collection => {
            collection.attrs = collection.attrs.map(attr => {
                return this.attributes.find(attrData => attrData.name === attr);
            });

            return collection;
        });
    },

    attributes: [{
        name: 'Time',
        type: 'date',
        editable: true
    }, {
        name: 'Type',
        type: 'nominal',
        editable: true
    }, {
        name: 'Notes',
        type: 'nominal',
        editable: true
    }, {
        name: 'ID',
        type: 'numeric',
        editable: false
    }, {
        name: 'Context',
        type: 'nominal',
        editable: true
    }, {
        name: 'Collection',
        type: 'nominal',
        editable: true
    }, {
        name: 'Attribute',
        type: 'nominal',
        editable: true
    }, {
        name: 'Formula',
        type: 'nominal',
        editable: true
    }, {
        name: 'Direction',
        type: 'nominal',
        editable: true
    }, {
        name: 'Plugin',
        type: 'nominal',
        editable: true
    }, {
        name: 'Parameter',
        type: 'nominal',
        editable: true
    }, {
        name: 'Attr Type',
        type: 'nominal',
        editable: true
    }]
};

const DATAMOVES_CONTROLS_DATA = {
    name: 'DM Controls',

    collections: [{
        name: 'DM Controls',
        title: 'DM Controls',
        attrs: ['Record', 'Replay', 'Interpolate']
    }],

    getCollections() {
        return this.collections.map(collection => {
            collection.attrs = collection.attrs.map(attr => {
                return this.attributes.find(attrData => attrData.name === attr);
            });

            return collection;
        });
    },

    attributes: [{
        name: 'Record',
        type: 'nominal',
        editable: true
    }, {
        name: 'Replay',
        type: 'nominal',
        editable: true
    }, {
        name: 'Interpolate',
        type: 'nominal',
        editable: true
    }]
};