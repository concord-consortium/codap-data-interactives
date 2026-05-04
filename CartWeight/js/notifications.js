"use strict";
let notificatons = {

    documentSubscriberIndex: null,

    /**
     * Register for doc change events.
     *
     * Why? If the user creates a graph, we want to set default attributes.
     */
    registerForDocumentChanges : function() {
        const tResource = `component`;
        this.documentSubscriberIndex = codapInterface.on(
            'notify',
            tResource,
            notificatons.handleDocumentChangeNotice
        );
    },

    /**
     * We have detected that the document has changed.
     * If the change is creation of a graph, we want to place attributes on x and y
     *
     * @param iMessage
     */
    handleDocumentChangeNotice : async function (iMessage) {
        var tValues = iMessage.values;
        if (tValues.operation === 'create' && tValues.type === 'graph') {
            var graphID = tValues.id;
            // Without the setTimeout the graph gets confused about extents
            setTimeout(async () => {
                await codapInterface.sendRequest({
                    action: "update",
                    resource: `component[${graphID}]`,
                    values: {
                        xAttributeName: 'bricks',
                        yAttributeName: 'weight'
                    }
                });
            });
        }
    },

};
