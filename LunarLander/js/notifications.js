"use strict";
let notificatons = {

    documentSubscriberIndex: null,

    registerForDocumentChanges : function() {
        const tResource = `component`;
        this.documentSubscriberIndex = codapInterface.on(
            'notify',
            tResource,
            notificatons.handleDocumentChangeNotice
        );
    },

    handleDocumentChangeNotice : async function (iMessage) {
        var tValues = iMessage.values;
        if (tValues.operation === 'create' && tValues.type === 'graph') {
            var graphID = tValues.id;
            setTimeout(async () => {
                await codapInterface.sendRequest({
                    action: "update",
                    resource: `component[${graphID}]`,
                    values: {
                        xAttributeName: 'time',
                        yAttributeName: 'altitude'
                    }
                });
            });
        }
    },

};
