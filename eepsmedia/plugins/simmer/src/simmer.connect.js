simmer.connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        this.setIFrameTitle();
    },

    /**
     * emit ONE case into CODAP
     *
     * @param iVars     array of objects holding name and value of one attribute
     * @returns {Promise<void>}
     */
    codap_emit: async function (iValues) {

        simmer.updateVariableStrip(iValues);

        //  const theValues = this.makeValueObject(iVars);

        try {
            const res = await pluginHelper.createItems(iValues, simmer.constants.dsName);
        } catch (msg) {
            console.log("Problem emitting items of vars: " + JSON.stringify(iValues));
            console.log(msg);
        }
    },

    makeValueObject: function (iValues) {
        let out = {};
        iValues.forEach(att => {
            out[att.name] = att.value;
        })
        out['simmerRun'] = simmer.state.simmerRun;

        return out;
    },

    deleteDataset : function() {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${simmer.constants.dsName}]`,
        })

    },

    createSimmerDataset : async function(iVariables) {
        const dataContextSetupObject = this.makeDataContextSetupObject(iVariables);
        await pluginHelper.initDataSet(dataContextSetupObject);
    },

    datasetExists : async function(iName) {
        const aResult = await codapInterface.sendRequest({
            action : "get",
            resource : `dataContext[${iName}]`,
        })

        return aResult.success;
    },

    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": simmer.constants.dsName,
            }
        })
    },

    setIFrameTitle : function() {
        const message = {
            action : "update",
            resource : "interactiveFrame",
            values : {
                "title" : DG.plugins.simmer.frameTitle,
            }
        }

        try {
            codapInterface.sendRequest(message);
        } catch (msg) {
            alert(`ERROR setting the iFrame's title: ${msg}`);
        }
    },

    /**
     * shrink (or grow) the IFrame to match the current `simmer.shrink` setting
     */
    shrinkFrame: function() {
        codapInterface.sendRequest(
            simmer.state.shrunken ? this.shrinkMessage : this.unShrinkMessage
        )
    },

    /**
     *
     * @returns {{collections: {name: string, attrs: *[]}, name: string, description: string, title: string}}
     */
    makeDataContextSetupObject: function (iVariables) {

        // actual setup object
        return {
            name: simmer.constants.dsName,
            title: DG.plugins.simmer.dsTitle,
            description: DG.plugins.simmer.dsDescription,
            collections: [
                {
                    name: DG.plugins.simmer.collectionName,
                    attrs: iVariables,
                },
            ]
        }
    },

    shrinkMessage : {
        action : "update",
        resource : "interactiveFrame",
        values : {
            dimensions : {
                width : 222,
                height : 80,
            }
        }
    },

    unShrinkMessage : {
        action : "update",
        resource : "interactiveFrame",
        values : {
            dimensions : {
                width : 800,
                height : 555,
            }
        }
    },

    iFrameDescriptor: {
        version: simmer.constants.version,
        name: 'simmer',
        title: "temp title",
        dimensions: {width: 800, height: 555},
        preventDataContextReorg: false
    },

}
