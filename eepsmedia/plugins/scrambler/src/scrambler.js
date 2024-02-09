/**
 * `scrambler` is the global singleton at the root of the scrambler logic.
 *
 * Important notes about design:
 *
 * The user has a CODAP dataset they want to scramble.
 * For the most part, we let CODAP itself take care of that.
 * Nevertheless, in order to scramble, we have to read everything in at some point and
 * manipulate the contents, eventually emitting various CODAP datasets.
 *
 * For this reason, there is a separate class, `CODAPDataset`,
 * that we use for the _internal_ representation of a CODAP dataset.
 * Various methods in that class read and write parts of the dataset,
 * based on the CODAP Plugin API.
 *
 * * `scrambler.sourceDataset` is a reflection of the user's original dataset.
 * We will call this the "source dataset."
 * * `scrambler.scrambledDataset` is made from the "source," but its data gets scrambled.
 * * `scrambler.measuresDataset` gets scraped from the "scrambled" dataset.
 *
 * Scrambling, in this model, depends on the hierarchical structure of the source dataset.
 *
 * @type {{doScramble: ((function(*): Promise<null>)|*), setSourceDataset: (function(*): Promise<null>), showProgress: scrambler.showProgress, refreshAllData: ((function(): Promise<void>)|*), openHelp: ((function(): Promise<void>)|*), doAlert: scrambler.doAlert, matchUItoState: scrambler.matchUItoState, datasetExists: boolean, handleBigRefresh: ((function(): Promise<void>)|*), scrattributeExists: boolean, strings: null, state: {}, constants: {scrambledPrefix: string, defaultState: {scrambleAttributeName: null, dirtyMeasures: boolean, lastDatasetName: null, iteration: number, numberOfScrambles: number, lang: string}, measuresPrefix: string, pluginName: string, scrambleSetName: string, version: string, dimensions: {width: number, height: number}}, setUpLocalScrambledDataset: (function(): Promise<*>), measuresDataset: null, copeWithAttributeDrop: ((function(*, *): Promise<void>)|*), setUpLocalMeasuresDataset: (function(): Promise<*>), currentlyScrambling: boolean, refreshScramblerStatus: scrambler.refreshScramblerStatus, refreshUIDisplay: scrambler.refreshUIDisplay, changeLanguage: ((function(): Promise<void>)|*), scrattributeIsLeaf: boolean, currentlyDraggingAnAttribute: boolean, scrambledDataset: null, pickAFlag: (function(): *), handleUIChoice: scrambler.handleUIChoice, handleSourceDatasetChange: ((function(*): Promise<void>)|*), sourceDataset: null, datasetHasMeasure: boolean, nDatasets: number, initialize: ((function(): Promise<void>)|*)}}
 */

let myStrings = null;

const scrambler = {
    sourceDataset: null,        //      a CODAPDataset.
    scrambledDataset: null,     //      a CODAPDataset.
    measuresDataset: null,      //      a CODAPDataset.

    nDatasets: 0,
    currentlyScrambling: false,
    currentlyDraggingAnAttribute: false,
    
    datasetExists: false,
    datasetHasMeasure: false,
    scrattributeExists: false,
    scrattributeIsLeaf: false,

    state: {},

    strings: null,

    /**
     * Called from the HTML. Starts everything rolling.
     *
     * @returns {Promise<void>}
     */
    initialize: async function () {
        await connect.initialize();     //  set up connection to CODAP

        this.state = await codapInterface.getInteractiveState();    //  get stored state of any

        //  but what if there is none? Make a new one...
        if (Object.keys(this.state).length === 0) {
            Object.assign(this.state, this.constants.defaultState);
            await codapInterface.updateInteractiveState(this.state);    //  store this
            console.log(`No interactive state retrieved. Got a new one...: 
            ${JSON.stringify(this.state)}`);
        }

        //  set up the language
        this.state.lang = pluginLang.figureOutLanguage('en', stringUtility.languages);
        myStrings = await stringUtility.initializeStrings(this.state.lang);
        stringUtility.setStrings();

        await this.refreshAllData();
    },

    refreshScramblerStatus: function () {
        let theHTML = ``;

        if (this.datasetExists) {
            const tDSTitle = this.sourceDataset.structure.title;
            const tAttName = scrambler.state.scrambleAttributeName;

            const attReport = (this.scrattributeExists)
                ? stringUtility.tr('sfScrambledAttribute', tAttName) //    `${scrambler.strings.sScramble} ${tAttName}`
                : stringUtility.tr('sNoAttribute');

            document.getElementById("attributeReport").innerHTML = attReport;

            if (this.datasetHasMeasure) {
                if (this.scrattributeExists) {
                    if (this.scrattributeIsLeaf) {
                        theHTML = stringUtility.tr('sfOKtoScramble', tAttName, tDSTitle); //   `OK to scramble "${tAttName}" in dataset "${tDSTitle}"`;
                    } else {
                        const possibles = scrambler.sourceDataset.possibleScrambleAttributeNames(tAttName); //  this is an object
                        const suchAs = (possibles.array.length == 1)    //  possibles.array is the list of suitable attributes
                            ? `${possibles.array[0]}`
                            : `${possibles.array[0]}</code> ${stringUtility.tr('sOr')} <code>${possibles.array[1]}`;
                        const colls = scrambler.sourceDataset.structure.collections;
                        const lastCollName = colls[colls.length - 1].name;
                        if (possibles.hasFormula) { //  remember: if it has a formula it will not be listed among the leaves
                            theHTML = stringUtility.tr('sfFormulaProblem', tAttName, lastCollName, suchAs);
                        } else {
                            theHTML = stringUtility.tr('sfNotALeafProblem', tAttName, lastCollName, suchAs);
                        }
                    }

                } else {
                    theHTML = stringUtility.tr('sNoScrambleAttribute');
                }
            } else {
                theHTML = stringUtility.tr('sfNoMeasure', tDSTitle);
            }
        } else {
            theHTML = stringUtility.tr('sNoDataset');
        }

        document.getElementById(`scramblerStatus`).innerHTML = theHTML;
    },

    /**
     * Refresh all the data, including wiping the scrambled and measures CODAPDatasets.
     *
     * @returns {Promise<void>}
     */
    refreshAllData: async function () {
        //  find a dataset (probably the last one)
        const tName = await connect.getSuitableDatasetName(this.state.lastDatasetName);
        console.log(`connect suggests using ${tName} as the dataset name`);
        this.iteration = 0;

        //  eliminate derived datasets
        if (this.measuresDataset) {
            await connect.deleteDatasetOnCODAP(this.measuresDataset.datasetName);
            this.measuresDataset = null;
        }
        if (this.scrambledDataset) {
            await connect.deleteDatasetOnCODAP(this.scrambledDataset.datasetName);
            this.scrambledDataset = null;
        }

        //  if a suitable name was found, connect to it.
        if (tName) {
            await this.setSourceDataset(tName);
            if (this.sourceDataset) {
                if (await connect.datasetExistsOnCODAP(tName)) {
                    //  this.dirtyMeasures = false;
                    console.log(`Dataset ${this.sourceDataset.datasetName} already exists. Whew.`)
                }
            }
        }
        this.refreshUIDisplay();
    },


    /**
     * Makes a `CODAPDataset` filled with the information from the CODAP dataset of the given name.
     * This thing will be the root of the scrambling we do.
     *
     * Also sets a good value for the scrambling attribute.
     *
     * Note: we load up the structure of the source dataset here, but not its contents.
     * That's not necessary; we only have to do that when we scramble.
     *
     * @param iName     the name of the dataset
     * @returns {Promise<void>}
     */
    setSourceDataset: async function (iName) {

        this.sourceDataset = await new CODAPDataset(iName);     //  make the source dataset object!

        await notificatons.registerForDatasetChanges(iName);
        await this.sourceDataset.loadStructureFromCODAP();      //  get the "structure" part

        if (this.sourceDataset) {
            this.datasetExists = true;
            this.state.lastDatasetName = this.sourceDataset.datasetName;    //  for restoring
            this.datasetHasMeasure = (this.sourceDataset.structure.collections.length > 1);

            //  cope with the scramble attribute
            const tScrambleName = scrambler.state.scrambleAttributeName;
            this.scrattributeExists = (this.sourceDataset.allAttributeNames().includes(tScrambleName));
            this.scrattributeIsLeaf = this.sourceDataset.possibleScrambleAttributeNames(tScrambleName).check;
            console.log(`SetSourceDataset: ${iName} with ${scrambler.state.scrambleAttributeName}`)
        } else {
            //  something went wrong; set everything to null and bail
            this.state.lastDatasetName = null;    //  for restoring
            this.datasetExists = false;
            this.datasetHasMeasure = false;
            this.scrattributeExists = false;
            this.scrattributeIsLeaf = false;

            scrambler.state.scrambleAttributeName = null;
            console.log(`SetSourceDataset: WE HAVE NO SOURCE!`)
        }

        return this.sourceDataset;
    },

    /**
     * Handler when user clicks the big refresh arrow.
     * (Big refresh arrow removed in 1.4, but let;s leave this here.
     * ...warning: it might break the Measures dataset)
     */
    handleBigRefresh: async function () {
        this.refreshAllData();
        this.dirtyMeasures = true;

        if (this.measuresDataset) {
            await connect.deleteDatasetOnCODAP(this.measuresDataset.datasetName);
            //  this.measuresDataset = null;
            this.state.iteration = 0;
        }

    },

    /**
     * Notification handler called in response to an attribute drop
     *
     * @param iDataset      name of the dataset the attribute was in
     * @param iAttribute    name of the attriute
     * @returns {Promise<void>}
     */
    copeWithAttributeDrop: async function (iDataset, iAttribute) {
        console.log(`Scramble ${iAttribute} in ${iDataset}`);
        this.state.scrambleAttributeName = iAttribute;      //  it has to exist, we just dropped it!

        if (!this.sourceDataset || (iDataset != this.sourceDataset.datasetName)) {
            //  changing the dataset
            scrambler.state.dirtyMeasures = true;
        }

        await scrambler.setSourceDataset(iDataset);
        this.refreshUIDisplay();
    },

    /**
     * Read the controls on the screen and set internal values, i.e., `state` appropriately.
     *
     */
    handleUIChoice: function () {
        this.state.numberOfScrambles = Number(document.getElementById("howManyBox").value) || this.state.numberOfScrambles || 42;
        // this.state.scrambleAttributeName = document.getElementById("attributeMenu").value || null;

        this.refreshUIDisplay();
    },

    /**
     * Handles the notification that the user has chosen something from the dataset menu.
     *
     * @param theMenu       the menu (DOM object) that the user selected from
     * @returns {Promise<void>}
     */
    handleSourceDatasetChange: async function (theMenu) {
        const theName = theMenu.value;
        scrambler.setSourceDataset(theName);
    },

    /**
     * Set up the "Scrambled" dataset, ensuring that if it exists already and
     * the data are not "dirty," it's just emptied, not deleted.
     *
     * Clone the "source" dataset to make a new one, which will get scrambled.
     * Note: it doesn't get scrambled in this method!
     * (called from `doScramble()`)
     *
     * @returns {Promise<*>}    of the "internal" scrambled CODAPDataset
     */
    setUpLocalScrambledDataset: async function () {

        let theScrambledOne = this.sourceDataset.clone(
            stringUtility.tr(scrambler.constants.scrambledPrefixStringID));

        if (await connect.datasetExistsOnCODAP(theScrambledOne.datasetName)) {
            if (scrambler.state.dirtyMeasures) {
                await connect.deleteDatasetOnCODAP(theScrambledOne.datasetName);
                await theScrambledOne.emitDatasetStructureOnly();
            } else {
                await connect.deleteCasesOnCODAPinCODAPDataset(theScrambledOne);
            }
        } else {
            await theScrambledOne.emitDatasetStructureOnly();
        }

        await theScrambledOne.emitCasesFromDataset();
        await theScrambledOne.retrieveAllDataFromCODAP(); //  redo to get IDs right
        console.log(`cloned to get [${theScrambledOne.datasetName}] for scrambling`);

        return theScrambledOne;
    },

    /**
     * Makes a new "measures" dataset if necessary. If the dataset already exists,
     * get an "internal" object with its information.
     * If not, make a fresh one with the right structure (but no data).
     * (called from `doScramble()`)
     *
     * @returns {Promise<*>}    of a CODAPDataset, which is the Measures dataset
     */
    setUpLocalMeasuresDataset: async function () {

        let theMeasures = this.sourceDataset.clone(stringUtility.tr(scrambler.constants.measuresPrefixStringID));
        theMeasures.makeIntoMeasuresDataset();     //  strips out the "leaf" collection

        if (await connect.datasetExistsOnCODAP(theMeasures.datasetName)) {
            if (scrambler.state.dirtyMeasures) {
                //  empty the whole measures dataset
                await connect.deleteDatasetOnCODAP(theMeasures.datasetName);
                await theMeasures.emitDatasetStructureOnly();   //  emit structure into CODAP, creates new dataset
                console.log(`    [${theMeasures.datasetName}] created anew`);
            } else {
                //  not dirty? Get all the old measures into the existing structure, keyed by the name (`theMeasures.datasetName`)
                await theMeasures.retrieveAllDataFromCODAP();   //  get the existing data and put it into the local variable
                console.log(`    [${theMeasures.datasetName}] already exists`);
            }
        } else {
            await theMeasures.emitDatasetStructureOnly();   //  emit structure into CODAP, creates new dataset
        }

        return theMeasures;
    },

    /**
     * Sets UI values for the scramble attribute and the number of scrambles to match the `state`.
     */
    matchUItoState: function () {
        document.getElementById("howManyBox").value = Number(scrambler.state.numberOfScrambles);
        document.getElementById("attributeMenu").value = scrambler.state.scrambleAttributeName;
    },

    /**
     * Handle the command to actually do a scramble
     * @param  iReps    the number of repetitions if it is *not* the number in the box (i.e., ONE.)
     * @returns {Promise<null>}
     */
    doScramble: async function (iReps) {

        this.currentlyScrambling = true;    //  flag to keep other things from happening

        this.refreshUIDisplay();    //  this hides the scramble buttons, etc.

        const nReps = iReps ? iReps : scrambler.state.numberOfScrambles;
        const sAttribute = scrambler.state.scrambleAttributeName;  //  name of the attribute to scramble
        scrambler.state.iteration++;

        await codapInterface.updateInteractiveState(this.state);    //  force storage

        console.log(`*** going to scramble. State: ${JSON.stringify(scrambler.state)}`);

        //  Get the very latest data from CODAP and put it in `sourceDataset`.
        //  (The user might have changed values in CODAP, and we want tto scramble THOSE.)
        await this.sourceDataset.retrieveAllDataFromCODAP();

        //  Vital three lines! This sets up the two derived datasets for this process.
        this.scrambledDataset = await this.setUpLocalScrambledDataset();
        this.measuresDataset = await this.setUpLocalMeasuresDataset();
        scrambler.state.dirtyMeasures = false;

        let newItems = [];  //  these will be items for the measures dataset.

        //  actual scramble here
        for (let i = 0; i < nReps; i++) {
            await this.scrambledDataset.scrambleInPlace(sAttribute);
            const oneRepItems = await this.measuresDataset.makeMeasuresFrom(this.scrambledDataset);
            if (oneRepItems) {
                newItems = newItems.concat(oneRepItems);
            } else {
                return null;
            }
            this.showProgress(i, nReps);
        }

        //  we have been updating the scrambled dataset every iteration,
        //  but we don;t update the measures until now.
        await this.measuresDataset.emitItems(true, newItems);

        connect.showTable(this.measuresDataset.datasetName);    //  must show measures table
        this.showProgress(-1, -1);      //  stop showing progress
        this.currentlyScrambling = false;           //  turn off that flag
        this.refreshUIDisplay();                    //  and reset the display
    },

    /**
     * Display progress text showing how many scrambles have been done out of how many.
     *
     * Called from `scramble.doScramble()`.
     *
     * @param howMany   which scramble we're on
     * @param outOf     how many scrambles we're doing
     */
    showProgress: function (howMany, outOf) {
        theProgressBox = document.getElementById("progress");
        theProgressBox.innerHTML = howMany > 0 ? `${howMany}/${outOf}` : "";
    },
    /**
     * Set the values in the UI (menu choices, number in a box) to match the state.
     * Also sets the text on the scramble button to **42x** or whatever.
     * Also sets visibility of some of the UI <div>s.
     */
    refreshUIDisplay: function () {
        console.log(`    refreshing UI display`);
        //  set the number of scrambles in the box
        document.getElementById("howManyButton").innerHTML = this.state.numberOfScrambles + "x";

        const buttons = document.getElementById("scramble-buttons-stripe-element");
        const progress = document.getElementById("progress");
        const showScrambled = document.getElementById("showScrambledDIV");

        //  visibility; shows appropriate message if scrambling is impossible

        buttons.style.display = this.currentlyScrambling ? "none" : "flex";
        progress.style.display = this.currentlyScrambling ? "flex" : "none";

        const canScramble = this.scrattributeExists && this.scrattributeIsLeaf && this.datasetExists && this.datasetHasMeasure;
        const canDoScrambleStripe = document.getElementById("how-many-stripe");
        const cantDoScrambleStripe = document.getElementById("cantScrambleStripe");

        canDoScrambleStripe.style.display = canScramble ? "flex" : "none";
        cantDoScrambleStripe.style.display = canScramble ? "none" : "flex";
        showScrambled.style.display = canScramble ? "flex" : "none";

       // document.getElementById("languageControl").innerHTML = scrambler.pickAFlag();        //  theFlag;

        this.refreshScramblerStatus();
    },

    /**
     * Open the relevant help html (by language) in a new tab.
     *
     * @returns {Promise<void>}
     */
    openHelp: async function () {
        //  const theURL = `help/help.${scrambler.state.lang}.html`;
        const theURL = `https://codap.xyz/guides/scrambler/`;
        const response = await fetch(theURL);

        if (response.status === 200) {
            window.open(theURL, `_blank`);
        } else if (response.status === 404) {
            window.open(`help/help.en.html`, `_blank`);     //  default to English
            console.log(`No help file for ${scrambler.state.lang}, defaulting to English.`)
        }
    },

    /**
     * Present an alert box. Originally to wrap sweetalert, but the plugin's footprint is too small!
     *
     * @param iTitle
     * @param iText     text of the alert
     * @param iIcon
     */
    doAlert: function (iTitle, iText, iIcon = 'info') {
        alert(iText);
    },

    constants: {
        pluginName: "scrambler",
        version: "1.7",
        dimensions: {height: 200, width: 366},      //      dimensions,
        defaultState: {
            lastDatasetName: null,
            scrambleAttributeName: null,
            numberOfScrambles: 10,
            dirtyMeasures: false,
            iteration: 0,
            lang: `en`,
        },
        measuresPrefixStringID: "sMeasureDatasetPrefix",
        scrambledPrefixStringID: "sScrambledDatasetPrefix",
        scrambleSetName: "scrset",

    },
}

/**
 * Scramble the values in the array. Defined at the bottom of `scrambler.js`.
 */
Array.prototype.scramble = function () {
    const N = this.length;

    for (let i = 0; i < N; i++) {
        const other = Math.floor(Math.random() * N);
        const temp = this[i];
        this[i] = this[other];
        this[other] = temp;
    }
};
