let connect;

/**
 * Singleton responsible for communicating with CODAP
 *
 * @type {{deleteDatasetOnCODAP: ((function(*): Promise<void>)|*), getSuitableDatasetName: (function(*): Promise<*>), allowReorg: ((function(): Promise<void>)|*), datasetExistsOnCODAP: (function(*): Promise<boolean>), iFrameDescriptor: {name: string, title: string, version: string, dimensions: {width: number, height: number}}, deleteCasesOnCODAPinCODAPDataset: ((function(*): Promise<void>)|*), showTable: connect.showTable, showScrambled: connect.showScrambled, initialize: ((function(): Promise<void>)|*)}}
 */
connect = {

    /**
     * Initialize the connection to CODAP
     *
     * @returns {Promise<void>}
     */
    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await this.allowReorg();
        notificatons.registerForDocumentChanges();
        notificatons.registerForAttributeDrops();
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `scrambler.constants`
     */
    iFrameDescriptor: {
        name: scrambler.constants.pluginName,
        title: scrambler.constants.pluginName,
        version: scrambler.constants.version,
        dimensions: scrambler.constants.dimensions,      //      dimensions,
    },

    /**
     * Find a dataset that is not _scrambled or _measures, preferably the one we pass in!
     *
     * If that doesn't exist, pick the first one in the list.
     *
     * @param iName     Default name, typically the one we have been using all along or restored from save
     * @returns {Promise<*>}
     */
    getSuitableDatasetName : async function(iName) {
        let tDSNameList = [];
        const tMessage = {
            action: "get",
            resource: "dataContextList"
        };
        const tListResult = await codapInterface.sendRequest(tMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                const theName = ds.name
                //  measures and scrambled datasets are unsuitable
                if (theName.startsWith(scrambler.constants.measuresPrefix) || theName.startsWith(scrambler.constants.scrambledPrefix)) {

                } else {
                    tDSNameList.push(theName);
                }
            });
        }
        return (tDSNameList.includes(iName)) ? iName : tDSNameList[0];
    },

    /**
     * Does the named dataset already exist in CODAP's list of data contexts?
     * @param iName
     * @returns {Promise<void>}
     */
    datasetExistsOnCODAP: async function (iName) {
        let out = false;

        const existMessage = {
            action: "get",
            resource: `dataContextList`,
        }
        const tListResult = await codapInterface.sendRequest(existMessage);
        if (tListResult.success) {
            tListResult.values.forEach((ds) => {
                if (ds.name === iName) {
                    out = true;
                }
            })
        }
        return out;
    },

    /**
     * Ask CODAP to delete the named dataset
     * @param iName     the name
     * @returns {Promise<void>}
     */
    deleteDatasetOnCODAP : async function(iName) {
        if (iName) {
            const tDeleteMessage = {
                action: "delete",
                resource: `dataContext[${iName}]`,
            }
            const dResult = await codapInterface.sendRequest(tDeleteMessage);
            console.log(`    deleting [${iName}]: (${dResult.success ? "success" : "failure"})`);
        } else {
            console.log(`    no dataset name passed in to delete!`);
        }
    },

    /**
     * Empty a dataset so it has a structure, but no cases.
     *
     * @param iDS
     * @returns {Promise<void>}
     */
    deleteCasesOnCODAPinCODAPDataset : async function(iDS) {
        const tCollName = iDS.structure.collections[0].name;
        const tResource = `dataContext[${iDS.datasetName}].collection[${tCollName}].allCases`;
        const dResult = await codapInterface.sendRequest({
            action : "delete",
            resource : tResource,
        })
        console.log(`    flushing [${iDS.datasetName}]: (${dResult.success ? "success" : "failure"})`);

    },

    /**
     * Kludge to ensure that a dataset is reorg-able.
     *
     * @returns {Promise<void>}
     */
    allowReorg: async function () {
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        codapInterface.sendRequest(tMutabilityMessage);
    },

    /**
     * Quick method to make the scrambled dataset's table appear.
     * Called in response to the button push
     */
    showScrambled : function() {
        this.showTable(scrambler.scrambledDataset.datasetName);
    },

    /**
     * Show the table for the named dataset
     * @param iName     dataset name
     */
    showTable: function (iName) {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": iName,
            }
        });
    },

    /**
     * Get a list of selected case IDs.
     * todo: delete if unused
     *
     * @param iCases
     * @returns {Promise<[]>}
     */
/*    getCODAPSelectedCaseIDs: async function () {
        const theMeasuresName = "";     //  todo: put in actual name
        const selectionListResource = `dataContext[${theMeasuresName}].selectionList`;
        //  now get all the currently selected caseIDs.
        const gMessage = {
            "action": "get", "resource": selectionListResource
        }
        const getSelectionResult = await codapInterface.sendRequest(gMessage);

        //  the result has the ID but also the collection ID and name,
        //  so we collect just the caseID in `oldIDs`
        let oldIDs = [];
        if (getSelectionResult.success) {

            //  construct an array of the currently-selected cases.
            //  NOTE that `val`
            getSelectionResult.values.forEach(val => {
                oldIDs.push(val.caseID)
            })
        }
        return oldIDs;
    },*/

}