"use strict";
let notifications = {

    documentSubscriberIndex: null,

    registerForDocumentChanges: function () {
        const tResource = `component`;
        this.documentSubscriberIndex = codapInterface.on(
            'notify',
            tResource,
            notifications.handleDocumentChangeNotice
        );
    },

    handleDocumentChangeNotice: async function (iMessage) {
    },

};
