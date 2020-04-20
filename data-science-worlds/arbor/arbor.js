/**
 * Created by tim on 9/26/16.


 ==========================================================================
 reTree.js in reTree.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

/**
 * Where's the data and everything?
 *
 * The ANALYSIS holds the whole set of cases.
 * Each NODE holds filters that let it decide which cases apply.
 *
 * The arbor.attsInBaum array holds one complete list of attributes
 *
 * About events:
 * "treeChange" is dispatched from here (see its eventHandler) and handled in TreePanelView.handleTreeChange().
 * That is, the model informs the view via an event.
 *
 */

/**
 * 001z notes
 * goals:
 * * Set it so that a click on the root's title strip brings up the dependent split edit
 * * incorporate confusion matrix / double tree
 */

/**
 *
 * @type {{analysis: null, treePanelView: null, attsInBaum: Array, focusNode: null, focusSplit: null, windowWidth: null, state: {}, dependentVariableBoolean: [string], informalDVBoolean: string, informalDVBooleanReversed: string, dependentVariableSplit: null, iFrameDescription: {version: string, name: string, title: string, dimensions: {width: number, height: number}, preventDataContextReorg: boolean}, initialize: arbor.initialize, refreshBaum: arbor.refreshBaum, emitTreeData: arbor.emitTreeData, handleTreeChange: arbor.handleTreeChange, freshState: arbor.freshState, getAndRestoreModel: arbor.getAndRestoreModel, doBaumRestoration: arbor.doBaumRestoration, parseState: arbor.parseState, restoreTree: arbor.restoreTree, restoreNode: arbor.restoreNode, restoreSplit: arbor.restoreSplit, resizeWindow: arbor.resizeWindow, repopulate: arbor.repopulate, redisplay: arbor.redisplay, setDependentVariableByName: arbor.setDependentVariableByName, changeToNewDependentVariable: arbor.changeToNewDependentVariable, changeCurrentSplitTypeUsingMenu: arbor.changeCurrentSplitTypeUsingMenu, setFocusNode: arbor.setFocusNode, setFocusSplit: arbor.setFocusSplit, changeFocusSplitValues: arbor.changeFocusSplitValues, swapFocusSplit: arbor.swapFocusSplit, changeAttributeConfiguration: arbor.changeAttributeConfiguration, displayAttributeConfiguration: arbor.displayAttributeConfiguration, fixDependentVariableMechanisms: arbor.fixDependentVariableMechanisms, gotDataContextList: arbor.gotDataContextList, gotCollectionList: arbor.gotCollectionList, gotAttributeList: arbor.gotAttributeList, getAttributeByName: arbor.getAttributeByName, changeDataContext: arbor.changeDataContext, changeCollection: arbor.changeCollection, changeTreeTypeUsingMenu: arbor.changeTreeTypeUsingMenu, setTreeTypeByString: arbor.setTreeTypeByString, forceChangeFocusAttribute: arbor.forceChangeFocusAttribute, displayStatus: arbor.displayStatus, displayResults: arbor.displayResults, assembleAttributeAndCategoryNames: arbor.assembleAttributeAndCategoryNames, dispatchTreeEvent: arbor.dispatchTreeEvent}}
 */

var arbor = {

    analysis: null,        //      connects to CODAP
    treePanelView: null,
    attsInBaum: [],         //  the array of all the attributes in the tree

    focusNode: null,       //  currently-selected node

    windowWidth: null,

    state: {},             //  for save and restore

    dependentVariableBoolean: ["true"],
    informalDVBoolean: "all",
    informalDVBooleanReversed: "none",
    dependentVariableSplit: null,

    iFrameDescription: {
        version : '001x',
        name : 'arbor',
        title : 'diagnostic tree',
        dimensions : {width: 500, height: 555},
        preventDataContextReorg : false
    },

    /**
     * Start up. Called from HTML.
     */
    initialize: function () {

        focusSplitMgr.showHideAttributeConfigurationSection("hide");

        this.eventDispatcher = new EventDispatcher();
        arbor.eventDispatcher.addEventListener(
            "changeTree",
            this.handleTreeChange,
            this
        );

        //  register to receive notifications about selection
        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + arbor.constants.kClassTreeDataSetName + ']',
            'selectCases',
            arbor.selectionManager.processCodapSelectionOfTreeCase
        );

        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + arbor.constants.kRegressTreeDataSetName + ']',
            'selectCases',
            arbor.selectionManager.processCodapSelectionOfTreeCase
        );


        codapInterface.init(this.iFrameDescription, null)
            .then(this.getAndRestoreModel.bind(this))   //  includes getInteractiveState
            .then(this.getAndRestoreViews.bind(this))   //
            .then(function () {

                //  now initialize the "output" data context(s)

                var tInitDatasetPromises = [
                    pluginHelper.initDataSet(arbor.codapConnector.regressionTreesDataContextSetupString),
                    pluginHelper.initDataSet(arbor.codapConnector.classificationTreesDataContextSetupString)
                ];

                Promise.all(tInitDatasetPromises)
                    .then(function () {
                        //  other post-dataset initialization goes here
                    });


            }.bind(this));
    },

    getAndRestoreViews: function () {
        return new Promise(function (resolve, reject) {
            this.windowWidth = window.innerWidth;
            window.addEventListener("resize", this.resizeWindow);
            this.treePanelView = new TreePanelView("treePaper");  //  the main view.
            this.treePanelView.freshTreeView();

            arbor.redisplay();
            resolve();
        }.bind(arbor));
    },

    /**
     * User (or someone) has asked to refresh the tree,
     * probably because of new data or a change in what we're pointing at
     * @param iWhat
     */
    refreshBaum: function (iWhat) {
        switch (iWhat) {
            case 'all':
                codapInterface.updateInteractiveState(arbor.state);
                this.initialize();
                break;

            case 'data':
                codapInterface.updateInteractiveState(arbor.state);
                this.getAndRestoreModel()
                    .then(this.getAndRestoreViews.bind(this));
                break;

            case 'views':
                this.getAndRestoreViews();
                break;

            default:
                alert('Huh. Trying to refresh something unexpected. arbor.refreshBaum(' + iWhat + ")");
                break;
        }
    },

    /**
     * Send a new case to the regression or classification tree records,
     * depending on the current type of tree.
     */
    emitTreeData: function () {
        var tRes = arbor.state.tree.rootNode.getResultCounts();
        var tSumSSD = tRes.sumOfSquaresOfDeviationsOfLeaves;

        var N = tRes.FP + tRes.TP + tRes.FN + tRes.TN;
        var tNodes = arbor.state.tree.numberOfNodes();
        var tDepth = arbor.state.tree.depth();

        var tStateAsString = JSON.stringify(arbor.state);
        var tValues = {
            predict: arbor.informalDVBoolean,    //  the infomal expression of what is being predicted.
            N: N,
            base: (tRes.TP + tRes.FN) / N,
            state: tStateAsString,
            nodes: tNodes,
            depth: tDepth
        };

        if (arbor.state.treeType === "regression") {
            tValues.sumSSD = tSumSSD;
            arbor.codapConnector.createRegressionTreeItem(tValues);

        } else {
            tValues.TP = tRes.TP;
            tValues.TN = tRes.TN;
            tValues.FP = tRes.FP;
            tValues.FN = tRes.FN;
            arbor.codapConnector.createClassificationTreeItem(tValues);
        }
    },

    /**
     * Event handler: the model has made a change to the tree.
     * Repopulate the nodes and redraw it.
     * @param iEvent
     */
    handleTreeChange: function (iEvent) {
        if (typeof iEvent.why !== 'undefined') {
            console.log("changeTree event -- " + iEvent.why);
        }
        this.repopulate();
        this.redisplay();
    },


    /**
     * A good State for a NEW, FRESH run of the tree,
     * given that all of the data exist.
     *
     * So this routine creates a default tree (model), dependent variable, and initial node.
     *
     * @returns {{foo: number, latestNodeID: number, dependentVariableName: null, tree: null}}
     */
    freshState: function () {

        return {
            foo: 42,
            treeType: "classification",
            latestNodeID: 42,
            dependentVariableName: null,
            dependentVariableSplit: null,
            tree: null
        }
    },

    /**
     * Creates the "analysis" which holds all the data contexts, etc.
     * Then fills it.
     * Note the use of a promise(!) because getting these things is asynchronous.
     */
    getAndRestoreModel: function () {
        return new Promise(function (resolve, reject) {
            if (!this.analysis) {
                this.analysis = new Analysis(arbor);     //  the global, arbor, is the "host" for the analysis
            }

            this.analysis.getStructureAndData().then(
                function () {
                    arbor.assembleAttributeAndCategoryNames();   //  we have the cases, collect the names
                    this.attsInBaum.forEach(function (a) {
                        a.latestSplit = new AttributeSplit(a);  //  set all defaults
                    });

                    /* FIRST call to getInteractiveState */

                    arbor.state = codapInterface.getInteractiveState();

                    if (jQuery.isEmptyObject(arbor.state)) {
                        codapInterface.updateInteractiveState(arbor.freshState());
                        console.log("getting a fresh state");
                    }
                    console.log("arbor.state is " + JSON.stringify(arbor.state).length + " chars");

                    arbor.doBaumRestoration(arbor.state);   //  restore the arbor data. Still all model.
                    arbor.repopulate();

                    //  register to receive notifications about selection in the data

                    codapInterface.on(
                        'notify',
                        'dataContextChangeNotice[' + arbor.analysis.currentDataContextName + ']',
                        'selectCases',
                        arbor.selectionManager.processCodapSelectionOfDataCase
                    );

                    resolve();

                }.bind(this))
        }.bind(this))
    },

    /**
     * restore the state from the argument, which may be an object or merely JSON (e.g., on selection)
     * @param iState
     */
    doBaumRestoration: function (iState) {

        //  node numbering

        if (isNaN(iState.latestNodeID)) {
            this.state.latestNodeID = 42;
        }

        //  tree type

        this.setTreeTypeByString(iState.treeType);

        //  tree (after node numbering so the root node gets a good number)

        if (this.state.tree) {
            this.state.tree = this.restoreTree(iState.tree);
        } else {
            this.state.tree = new Tree();
        }

        //  dependent variable

        var dvn = iState.dependentVariableName;
        var tAtt = this.attsInBaum.reduce(function (acc, val) {
            return ((val.attributeName === dvn) ? val : acc);
        });

        var tSavedSplit = iState.dependentVariableSplit;

        this.setDependentVariableByName(tAtt.attributeName);

        this.state.dependentVariableSplit = Object.assign(this.state.dependentVariableSplit, tSavedSplit);

    },

    parseState: function (iStateJSON) {
        var out = JSON.parse(iStateJSON);     //  out is now an object, not just text
        out.tree = this.restoreTree(out.tree); //  restore the tree object so that it is actual Tree

        return out;
    },

    /**
     * Makes an empty, initial tree and a clean display
     */
    restoreTree: function (iTree) {
        //  var outTree = new Tree();

        var outTree = Object.assign(new Tree(), iTree);     //  now it's labeled as a tree.

        //  fix the root node
        outTree.rootNode = this.restoreNode(outTree.rootNode);
        return outTree;
    },

    restoreNode: function (iNode) {
        var outNode = Object.assign(new Node(), iNode);

        //  fix its split, if any
        var tSplit = outNode.attributeSplit;

        if (tSplit) {
            outNode.attributeSplit = this.restoreSplit(tSplit);
        }

        //  fix its descendants

        var tBranches = [];
        outNode.branches.forEach(function (subNode) {
            subNode = this.restoreNode(subNode);
            tBranches.push(subNode);
        }.bind(this));

        outNode.branches = tBranches;

        return outNode;
    },

    restoreSplit: function (iSplit) {
        var tAttName = iSplit.attName;
        var tAtt = this.getAttributeByName(tAttName);
        return outSplit = Object.assign(new AttributeSplit(tAtt), iSplit);
    },


    /**
     * Handles window resize. Notice that it redraws the tree; doesn't make a brand new one.
     * @param iEvent
     */
    resizeWindow: function (iEvent) {
        this.windowWidth = window.innerWidth;
        arbor.treePanelView.drawTreePanelViewSetup();
        arbor.treePanelView.redrawEntireZone();
    },


    /**
     * Something has changed, like in the attribute configuration.
     * We need to repopulate the tree WITHOUT reconstructing it,
     * That is, we believe that the allocation of attributes to nodes should be preserved.
     */
    repopulate: function () {
        console.log("   repopulate begins");
        this.state.tree.populateTree();               //  count up how many are in what bin throughout the tree, leaving structure intact
        console.log("       populated with " + this.analysis.cases.length + " cases");
        focusSplitMgr.theSplit.updateSplitStats(this.analysis.cases);    //  update these stats based on all cases
        console.log("       splitStats updated");
        console.log("   repopulate ends");
    },

    redisplay: function () {
        console.log("Redisplay ------------------------");
        this.fixDependentVariableMechanisms();  //  sets appropriate label text
        focusSplitMgr.displayAttributeConfiguration();   //  the HTML on the main page
        this.treePanelView.redrawEntireZone();
    },

    setDependentVariableByName: function (iAttName) {

        //  which attribute (attInBaum) corresponds to this name?
        var theAttribute = this.attsInBaum.reduce(function (acc, val) {
            return ((iAttName === val.attributeName) ? val : acc);
        });

        return this.setDependentVariableByAttInBaum(theAttribute);
    },

    setDependentVariableByAttInBaum: function (theAttribute) {
        //  make a new split
        this.state.dependentVariableName = theAttribute.attributeName;    //  for saving

        this.state.dependentVariableSplit = theAttribute.getSplit();  //  makes a default
        focusSplitMgr.setFocusSplit(this.state.dependentVariableSplit);

        return theAttribute;    //  in case we need one.

    },

    /**
     * Called from the TreePanelView, because this is from the view.
     * DO NOT CALL DIRECTLY (or the view won't get moved)
     * @param iAttributeName    an AttInBaum's NAME
     */
    changeToNewDependentVariable: function (iAttributeName) {
        this.setDependentVariableByName(iAttributeName);
        var tEvent = new Event("changeTree");
        tEvent.why = "new dependent variable";
        arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.

        //  this.treePanelView.makeDependentVariable(theAttribute);
    },

    /**
     * Set which node we are focusing on in the display.
     * If this node hosts a split, display the appropriate attribute-split stuff in the conficuation section
     *
     * @param iNode
     */
    setFocusNode: function (iNode) {
        this.focusNode = iNode;

        if (this.focusNode) {

            //  clear any "trace" flags in the nodes

            arbor.state.tree.clearTrace();

            //  set focusSplit:

            var tSplit = this.state.dependentVariableSplit;

            if (this.focusNode.attributeSplit) {
                tSplit = this.focusNode.attributeSplit;
            } else if (this.focusNode.parent) {
                tSplit = this.focusNode.parent.attributeSplit
            }

            focusSplitMgr.setFocusSplit(tSplit);

            var tEvent = new Event("changeTree");
            tEvent.why = "set focus on a node";
            arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.

            //  trigger the selection of the cases in that node

            arbor.selectionManager.selectCasesInNode(this.focusNode);

        }
    },


    /**
     * Make sure all the various values associated with the dependent variable are set correctly,
     * especially the Boolean expression; we use it to test cases
     */

    fixDependentVariableMechanisms: function () {
        this.dependentVariableBoolean = this.state.dependentVariableSplit.oneBoolean;

        this.informalDVBoolean = this.state.dependentVariableSplit.attName + " = " +
            this.state.dependentVariableSplit.leftLabel;

        this.informalDVBooleanReversed = this.state.dependentVariableSplit.attName + " = " +
            this.state.dependentVariableSplit.rightLabel;

        this.state.tree.rootNode.valueInLabel = "predicting " + this.informalDVBoolean;
        //  console.log("fixDependentVariableMechanisms: " + this.informalDVBoolean);
    },


    /**
     * When CODAP gives us the list of DCs (in Analysis), we are informed and make a menu.
     * @param iList
     */
    gotDataContextList: function (iList) {

        var dcm = $("#dataContextMenu");
        dcm.empty().append(this.analysis.makeOptionsList(iList));
        dcm.val(iList[0].name); //  set the UI to the first item by default
        this.changeDataContext();   //  make sure the analysis knows
    },

    /**
     * When CODAP gives us the list of collections (in Analysis), we are informed and make a menu.
     * @param iList
     */
    gotCollectionList: function (iList) {
        var collm = $("#collectionMenu");
        collm.empty().append(this.analysis.makeOptionsList(iList));
        collm.val(iList[0].name);  //  first item by default
        this.changeCollection();  //  make sure analysis knows
    },

    /**
     * Called when we successfully get the attribute list from CODAP
     * @param iList     a list of the attributes. We need theAttribute.name
     */
    gotAttributeList: function (iList) {

        console.log("gotAttributeList: [ " + TEEUtils.getListOfOneFieldInArrayOfObjects(iList, "name").join(" | ") + " ]");

        //  make the whole AttsInBaum thing

        this.attsInBaum = [];           //      new attribute list whenever we change collection? Correct? maybe not.
    },

    gotOneAttribute: function( iValues ) {
        console.log("   >>> got " + iValues.name );

        if (iValues.name.length > 0) {
            var tNewAttInBaum = new AttInBaum( iValues );
            var tColorIndex = iValues.id % arbor.constants.attributeColors.length;
            tNewAttInBaum.attributeColor = arbor.constants.attributeColors[ tColorIndex ];
            this.attsInBaum.push( tNewAttInBaum );

            if (iValues._categoryMap){
                iValues._categoryMap.__order.forEach(function(v) {
                    tNewAttInBaum.considerValue(v, true);
                })
            }

            if (iValues.isDependent) {
                this.setDependentVariableByAttInBaum(tNewAttInBaum);
            }
        }
    },

    /**
     * Get the attribute (AttInBaum by name. Used by AttributeSplit.makeInitialSplitParameters();
     * @param iName
     * @returns {*}
     */
    getAttributeByName: function (iName) {

        return this.attsInBaum.reduce(function (acc, val) {
            return ( iName === val.attributeName ? val : acc);
        })
    },

    /**
     * Make sure the analysis knows which one we will focus on.
     * User could choose a different DC.
     */
    changeDataContext: function () {
        this.analysis.specifyCurrentDataContext($("#dataContextMenu").find('option:selected').val());
    },

    changeCollection: function () {
        this.analysis.specifyCurrentCollection($("#collectionMenu").find('option:selected').val());
    },

    changeTreeTypeUsingMenu: function () {
        var tType = $("#treeTypeMenu").find('option:selected').val();
        this.setTreeTypeByString(tType);
        this.redisplay();
    },

    setTreeTypeByString: function (iType) {
        this.state.treeType = iType;
        $("#treeTypeMenu").val(this.state.treeType);
        console.log("Changing tree type to " + this.state.treeType);
    },

/*
    /!**
     * For some reason other than the user choosing the attribute in the menu,
     * (e.g., a mouse down in a CorralAttView)
     * we are changing which attribute we are configuring.
     * @param iAttInBaum
     *!/
    forceChangeFocusAttribute: function (iAttInBaum) {
        $("#attributeMenu").val(iAttInBaum.attributeName);    //  force the menu to change
        this.changeFocusAttribute();
    },
*/


    displayStatus: function (iHTML) {
        $("#statusText").html(iHTML);
    },

    displayResults: function (iHTML) {
        $("#resultsText").html(iHTML);
    },

    /**
     * Having read in all the data (into analysis.cases),
     * ponder every value for every attribute.
     * considerValue() will make the complete list of categories for categoricals, and
     * determine the minimum and maximum values for numericals.
     */
    assembleAttributeAndCategoryNames: function () {
        this.attsInBaum.forEach(function (a) {
            a.caseCount = 0;
            a.numericCount = 0;
            a.missingCount = 0;
        });

        //  make sure we have listed all categories

        this.attsInBaum.forEach(function (a) {
            this.analysis.cases.forEach(function (aCase) {
                var c = aCase.values;
                a.considerValue(c[a.attributeName])
            });
        }.bind(this));
    },

    dispatchTreeEvent: function (iEvent) {
        this.eventDispatcher.dispatchEvent(iEvent);
    }

};

/**
 * Various constants for the tree tool
 *
 * @type {{diagWidth: number, diagHeight: number, nodeWidth: number, nodeHeightInCorral: number, leafNodeHeight: number, fullNodeHeight: number, stopNodeHeight: number, attrWidth: number, attrHeight: number, corralHeight: number, treeObjectPadding: number, leftArrowCode: string, targetCode: string, heavyMinus: string, heavyPlus: string, diagnosisPlus: string, diagnosisMinus: string, nodeValueLabelColor: string, nodeAttributeLabelColor: string, corralBackgroundColor: string, panelBackgroundColor: string, treeBackgroundColors: [*], attributeColors: [*], attributeColor: string, selectedAttributeColor: string, dropLocationColor: string, closeIconURI: string}}
 */
arbor.constants = {
    nodeWidth: 100,
    nodeHeightInCorral: 20,
    connectorLineLowerOffset: 5,
    corralCornerRadius: 4,
    fullNodeHeight: 80,
    stopNodeHeight: 30,

    attrWidth: 80,
    attrHeight: 20,
    corralHeight: 40,
    treeObjectPadding: 8,
    treeLineLabelHeight: 20,

    leafColorPositive: "#484",
    leafColorNegative: "#752",
    leafNodeHeight: 30,
    leafCornerRadius: 15,
    leafTextColor: "#fff",

    //  context specific??
    diagnosisAttributeName: "diagnosis",
    analysisAttributeName: "analysis",

    //  characters
    leftArrowCode: "\u21c7",       //      "\u2190",
    targetCode: "\uD83D\uDF8B",     //  \u{1f78b}",     //  target
    heavyMinus: "\u2796",
    //  but it's always black??
    heavyPlus: "\u2795",
    diagnosisPlus: "+",    //  "+",
    diagnosisMinus: "\u2212",   //  minus
    diagnosisNone: "?",

    kMu: "\u03bc",
    kSigma: "\u03a3",

    onTraceColor: "yellow",

    nodeValueLabelColor: "white",
    nodeAttributeLabelColor: "#88f",

    corralBackgroundColor: "#abc",
    panelBackgroundColor: "#cde",

    attributeColors: ["#55f", "#77f", '#33f', "#369", "#39a", "#69a", "#57a", "#66a", "#66f", "#55e", "#44d", "#55c"],
    attributeColor: "PaleGoldenrod",
    selectedAttributeColor: "goldenrod",
    dropLocationColor: "tan",

    closeIconURI: "art/closeAttributeIcon.png",

    //  kVersion: "001M",       //  version is in the iFrameDesciption member, way up above.
    kName: "arbor",
    kTitle: "Diagnostic Trees",

    kClassTreeDataSetName: "classTrees",
    kClassTreeCollectionName: "classTrees",
    kClassTreeDataSetTitle: "Classification Tree Records",

    kRegressTreeDataSetName: "regressTrees",
    kRegressTreeCollectionName: "regressTrees",
    kRegressTreeDataSetTitle: "Regression Tree Records",

    buttonImageFilenames : {
        "plusMinus": "art/plus-minus.png",
        "leftRight": "art/left-right.png",
        "configure": "art/configure.png",
        "trash": "art/trash.png"
    }


};

arbor.options = {

    usePercentages: function () {
        return document.getElementById("usePercentOption").checked;
    },

    showLeaves: function () {
        return document.getElementById("showDiagnosisLeaves").checked;
    }

}

