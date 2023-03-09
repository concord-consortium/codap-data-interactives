const bEvents = {

    register : function() {
        simmer.workspace.addChangeListener(bEvents.myBlocklyEventHandler);
    },

    restore : function(iState) {
        Blockly.serialization.workspaces.load(iState.blocklyWorkspace, simmer.workspace);
    },

    myBlocklyEventHandler : function(event) {
       console.log(`    ∫   blockly event ${event.type}`);
        simmer.state.blocklyWorkspace = Blockly.serialization.workspaces.save(simmer.workspace);
        codapInterface.updateInteractiveState(simmer.state);

        switch (event.type) {
            case `var_create`:
            case `var_delete`:
                simmer.updateVariableStrip();
                break;

            case `create`:
                console.log(`    ∫   create: ${event.json.type}`);
                switch (event.json.type) {
                    case `procedures_defnoreturn`:
                        const newFunctionName = event.json.fields.NAME;
                        const newFunctionID = event.json.id;
                        console.log(`    ∫       new function: ${newFunctionName}`);
                        simmer.makeAutoFunctionCallBlock(newFunctionName, newFunctionID);
                        break;

                }
                break;
        }
    },


}