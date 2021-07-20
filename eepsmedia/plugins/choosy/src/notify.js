const notify = {
    /**
     * Ask to be notified about changes in attributes and selections
     * @returns {Promise<void>}
     */
    setUpNotifications: async function () {

        //  receive notifications about doc changes, especially number of datasets
        //  (user has added or deleted a dataset)
        const tResource = `documentChangeNotice`;
        codapInterface.on(
            'notify',
            tResource,
            //  'updateAttribute',
            notify.handleDocumentChangeNotice
        );

        //  register to receive notifications about changes to the data context (including selection)
        const theCurrentDSName = choosy.getNameOfCurrentDataset();
        const sResource = `dataContextChangeNotice[${theCurrentDSName}]`;
        codapInterface.on(
            'notify',
            sResource,
            //'selectCases',
            notify.handleDataContextChangeNotice
        );
        console.log(`˜  notifications on [${sResource}] and [${tResource}]`);
    },

    nHandled : 0,

    handleDataContextChangeNotice: function (iMessage) {
        this.nHandled++;
        if (this.nHandled % 50 === 0) {
            console.log(`fyi     ${this.nHandled} notifications handled. `)
        }

        const theValues = iMessage.values;

        console.log(`˜  handleDataContextChangeNotice operation ${this.nHandled}: ${theValues.operation}`);
        switch (theValues.operation) {
            case `selectCases`:
            case `updateCases`:
                const theSelectedCases = (theValues.result.cases) ? theValues.result.cases : [];
                choosy.handlers.handleSelectionChangeFromCODAP();
                break;

            case `updateCollection`:
            case `createCollection`:
            case `deleteCollection`:
            case `moveAttribute`:
            case `deleteAttributes` :
            case `createAttributes` :
            case `updateAttributes`:
                choosy_ui.update();     //  which reads the database structure (colls, atts) from CODAP
                break;
                //  todo: alter when JS fixes the bug about not issuing notifications for plugin-initiated changes.

            case `updateDataContext`:       //  includes renaming dataset, so we have to redo the menu
                choosy.setUpDatasets();
                choosy_ui.update();

            case 'createCases':
            case 'createItems':
                break;

            default:
                console.log(`?  handleDataContextChangeNotice unhandled operation: ${theValues.operation}`);
                break;
        }
    },

    handleDocumentChangeNotice: function (iMessage) {
        this.nHandled++;
        if (this.nHandled % 50 === 0) {
            console.log(`fyi     ${this.nHandled} notifications handled. `)
        }
        const theValues = iMessage.values;
        //  console.log(`handleDocumentChange operation: ${theValues.operation}`);
        choosy.setUpDatasets();
    },

}