/* global codapInterface, Blockly, pluginHelper   */


const simmer = {

    state: {},
    theVariables: [],
    workspace: null,

    variableState: [],
    strings: null,

    initialize: async function () {
        simmer.strings.initialize();   //  defines `simmer.strings` in the correct language

        const tOptions = {
            toolbox: this.toolbox,
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            }
        }
        this.workspace = Blockly.inject('blocklyDiv', tOptions);
        //  this.workspace.registerButtonCallback("newVariableKey", this.handleNewVariable);
        bEvents.register();

        await simmer.connect.initialize();
        simmer.setUpState();
        simmer.state.shrunken = !simmer.state.shrunken;
        this.shrink();
        this.updateVariableStrip({});
    },

    setUpState: function () {
        simmer.state = codapInterface.getInteractiveState();
        if (Object.keys(simmer.state).length === 0) {
            simmer.state = simmer.constants.freshState;
            codapInterface.updateInteractiveState(simmer.state);

        } else {
            bEvents.restore(simmer.state);
        }
    },

    /**
     * User presses the **Run** button!
     *
     * We retrieve the code from the block workspace and then run it.
     *
     * @returns {Promise<void>}
     */
    run: async function () {

        /**
         * See if two arrays are equal. We do this because we need to see if the
         * set of variables has changed.
         * @param a     one Array
         * @param b     the other Array
         * @returns {false|*}   Boolean, if the two arrays are equal
         */
        function arrayEquality(a, b) {
            const lengthsOK = a.length === b.length;
            const contentsOK = a.every((v, i) => v.name === b[i].name);
            return (lengthsOK && contentsOK);
        }

        simmer.state.simmerRun++;   //  increment the "run number"

        const theOldVariables = this.state.theVariables;
        this.state.theVariables = simmer.constructVariableNameArray();

        if (!arrayEquality(theOldVariables, this.state.theVariables)) {
            //  the variables changed. Nuke the old dataset, make a fresh one.
            simmer.connect.deleteDataset();
            await simmer.connect.createSimmerDataset(this.state.theVariables);
            console.log(`Change in variables! New dataset!`);
        } else {
            if (!await simmer.connect.datasetExists(simmer.constants.dsName)) {
                await simmer.connect.createSimmerDataset(this.state.theVariables);
                console.log(`Had to make a new dataset.`);
            }
            console.log(`NO change in variables! Keep old dataset.`);
        }

        //  actually retrieve the code from Blockly
        let code = Blockly.JavaScript.workspaceToCode(this.workspace);
        console.log(`............................the code: \n${code}............................`);

        //  const executed = Function(`"use strict"; return (${code})`);

        eval(code);             //  dangerous!
        simmer.connect.makeTableAppear();   //  because it's simpler for the user
    },

    openNewVariableModal: function () {
        document.getElementById(`newVariableModal`).style.visibility = "visible";
    },

    closeNewVariableModal: function () {
        document.getElementById(`newVariableModal`).style.visibility = "hidden";
    },

    makeNewVariable: async function () {
        const theName = document.getElementById("newVariableNameBox").value;
        console.log(`handle new variable: ${theName}`);

        if (theName.length === 0) {
            simmer.closeNewVariableModal();     //   no name, no variable
        } else {
            const newVarResult = await this.workspace.createVariable(theName);

            //      make a "set" block appear in the workspace
            const blockSpec = {
                'type': 'variables_set',
                'x': 30 + 100 * Math.random(), 'y': 10 + 20 * Math.random(),
                'fields': {
                    'VAR': {
                        'id': newVarResult.getId(),
                    }
                }
            }

            const newlyCreatedBlock = Blockly.serialization.blocks.append(blockSpec, this.workspace);

            //  this.updateVariableStrip();
            simmer.closeNewVariableModal();
        }
    },

    updateVariableStrip: function (iValues) {
        let currentPills = ``;
        let otherPills = ``;
        const theButton = `
<div id="addVariableButton" onclick="simmer.openNewVariableModal()" 
title="${DG.plugins.simmer.toolTips.addVariableButton}">
<span id="addVariablePlusSign">➕</span>
</div>
`;
        let blocklyVariables = Blockly.getMainWorkspace().getAllVariables();
        const simmerRunPill = `<div class=variablePill>${DG.plugins.simmer.simmerRunName} = ${simmer.state.simmerRun}</div>`;
        currentPills += simmerRunPill;

        blocklyVariables.forEach(thisVar => {
            const theName = thisVar.name;
            if (iValues && iValues[theName]) {
                const theValue = iValues[theName];
                const aPill = `<div class=variablePill>${theName} = ${theValue}</div>`;
                currentPills += aPill;
            } else {
                const aPill = `<div class=variablePill>${theName}</div>`;
                otherPills += aPill;
            }
        });

        const theHTML = `${theButton} ${currentPills} ${otherPills}`;
        document.getElementById(`variableDisplayStrip`).innerHTML = theHTML;
    },

    /**
     * No longer necessary?
     * We do not need to create a new calling block because the default
     * behavior does what we want!
     *
     * @param theName
     * @param theID
     */
    makeAutoFunctionCallBlock : function(theName, theID) {
        console.log(`handle new function: ${theName}`);

        const blockSpec = {
            'type': 'procedures_callnoreturn',
            //  todo: implement Beka's ideas about position....
            'x': 30 + 100 * Math.random(), 'y': 10 + 20 * Math.random(),
            'fields': {
                'VAR': {
                    'id': theID,
                }
            }
        }

        const newlyCreatedBlock = Blockly.serialization.blocks.append(blockSpec, this.workspace);

    },

    shrink: function () {
        simmer.state.shrunken = !simmer.state.shrunken;

        //  hide/unhide  the blockly div

        document.getElementById(`blocklyDiv`).style.display
            = (simmer.state.shrunken) ? "none" : "block";

        //  hide/unhide unnecessary controls

/*
        document.getElementById(`variableDisplayStrip`).style.display
            = (simmer.state.shrunken) ? "none" : "flex";
*/

        //  hide/unhide reminder text

        document.getElementById(`variableChangeReminderText`).style.display
            = (simmer.state.shrunken) ? "none" : "block";

        //  shrink/grow the frame

        simmer.connect.shrinkFrame();

        //  hide/unhide shrink/expand buttons

        document.getElementById("shrinkButton").style.display
            = simmer.state.shrunken ? "none" : "inline";
        document.getElementById("expandButton").style.display
            = simmer.state.shrunken ? "inline" : "none";
    },

    /**
     * Make an array of the names of all the variables currently defined in the Blockly workspace
     * Each element is {"name" : <the name>}.
     */
    constructVariableNameArray: function () {
        const theVariables = Blockly.getMainWorkspace().getAllVariables();
        const tSimmerRunSpecification = { //  the `simmerRun` attribute. It's special!
            "name": DG.plugins.simmer.simmerRunName,
            "type": "categorical",
            "description": DG.plugins.simmer.simmerRunDescription,
        };
        let out = [tSimmerRunSpecification];

        theVariables.forEach((v) => {
            out.push({"name": v.name});
        })
        return out;
    },

    constants: {
        version: '2023i',
        dsName: `simmerDataset`,
        freshState: {
            theVariables: [],
            blocklyWorkspace: {},
            simmerRun: 0,
            shrunken: false,
        }
    },

}