arbor.selectionManager = {
    processCodapSelectionOfTreeCase: function (iCommand, iCallback) {
        var tResourceString = iCommand.resource;

        console.log("processing tree selection with " + tResourceString);
        var tCases = (iCommand.values.result.cases) ? pluginHelper.arrayify(iCommand.values.result.cases) : [];
        console.log("Selection! " + tCases.length + " cases.");

        //  if we have ONE tree selected, display the tree!
        if (tCases.length === 1) {
            var theStateJSON = tCases[0].values.state;
            var theState = arbor.parseState(theStateJSON);
            arbor.doBaumRestoration(theState);

            arbor.repopulate();
            arbor.redisplay();
        }
    },

    processCodapSelectionOfDataCase: function(iCommand, iCallback) {
        var tResourceString = iCommand.resource;
        var tContext = arbor.analysis.currentDataContextName;

        //  is this event from the data context we're looking at?

        if (tResourceString === "dataContextChangeNotice[" + tContext + "]") {

            //  and it was a select cases, right?

            if (iCommand.values.operation === "selectCases") {
                console.log("Select cases, whew! " + tResourceString);

                var tCases = (iCommand.values.result.cases) ? pluginHelper.arrayify(iCommand.values.result.cases) : [];

                //  highlight the trace in the tree only if N=1

                if (tCases.length === 1) {
                    var theCaseValues = tCases[0].values;
                    arbor.setFocusNode(null);              //      eliminate the "node" focus
                    arbor.state.tree.traceCaseInTree(theCaseValues);

                } else {
                    arbor.state.tree.clearTrace();
                }
               // arbor.repopulate();
                arbor.redisplay();
            }
        }
    },


    selectCasesInNode: function (iNode) {
        var tCases = arbor.state.tree.casesByFilter(iNode.filterArray, iNode.missingArray);

        var ids = [];

        tCases.forEach(function (c) {
            ids.push(c.id);
        });

        var tArg = {
            "action": "create",
            "resource": "dataContext[" + arbor.analysis.currentDataContextName + "].selectionList",
            "values": ids
        };

        var result = codapInterface.sendRequest(tArg);

    }
}