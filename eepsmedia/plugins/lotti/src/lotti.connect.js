lotti.connect = {

    initialize: async function () {
        await codapInterface.init(this.iFrameDescriptor, null);

        /*
                const tMutabilityMessage = {
                    "action": "update",
                    "resource": "interactiveFrame",
                    "values": {
                        "preventBringToFront": false,
                        "preventDataContextReorg": false
                    }
                };
                await codapInterface.sendRequest(tMutabilityMessage);
        */
        this.setIFrameTitle();
    },

    setNewDataset : async function() {
        await this.deleteDataset();
        const theDSObject = this.getDataSetupObject();
        await pluginHelper.initDataSet(theDSObject);
    },

    codap_emit : async function(theValues) {
        if (lotti.state.optEmitToCODAP) {
            try {
                const res = await pluginHelper.createItems(theValues, lotti.constants.dsName);
                this.makeTableAppear();
            } catch (msg) {
                console.log("Problem emitting items of vars: " + JSON.stringify(theValues));
                console.log(msg);
            }
        }
    },

    getDataSetupObject: function () {

        const theScenarioStrings = DG.plugins.lotti.scenarioStrings[lotti.scenario.name];

        return {
            name: lotti.constants.dsName,
            title: lotti.scenarioStrings.dsTitle,
            description: lotti.scenarioStrings.dsDescription,
            collections: [
                //  single collection; mazu can reorganize as she sees fit :)
                {
                    name: lotti.constants.collName,
                    title: lotti.scenarioStrings.collTitle,
                    labels: {
                        singleCase: "turn record",
                        pluralCase: "turn records",
                        setOfCasesWithArticle: "game records",
                    },
                    attrs: [
                        {
                            name: DG.plugins.lotti.attributeNames.choice,
                            description: DG.plugins.lotti.attributeDescriptions.choice,
                        },
                        {
                            name: DG.plugins.lotti.attributeNames.result,
                            description: DG.plugins.lotti.attributeDescriptions.result,
                            unit : theScenarioStrings.resultUnitPlural,
                        },
/*
                        {
                            name: DG.plugins.lotti.attributeNames.units,
                            description: DG.plugins.lotti.attributeDescriptions.units,
                        },
*/
                        {name: DG.plugins.lotti.attributeNames.scenario, type: 'categorical',
                            description: DG.plugins.lotti.attributeDescriptions.scenario},
                    ]
                }
            ]
        }

    },

    makeTableAppear: function () {
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "name": lotti.constants.dsName,
            }
        })
    },


    deleteDataset: async function () {
        codapInterface.sendRequest({
            "action": "delete",
            "resource": `dataContext[${lotti.constants.dsName}]`,
        })
    },

    setIFrameTitle : function() {
        const message = {
            action : "update",
            resource : "interactiveFrame",
            values : {
                "title" : DG.plugins.lotti.frameTitle,
            }
        }

        try {
            codapInterface.sendRequest(message);
        } catch (msg) {
            alert(`ERROR setting the iFrame's title: ${msg}`);
        }
    },

    iFrameDescriptor: {
        version: lotti.constants.version,
        name: 'lotti',
        title: 'temp title',
        dimensions: {width: 316, height: 355},
        preventDataContextReorg: false
    },


}