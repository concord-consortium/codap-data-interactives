import * as CONNECT from "./connect.js";
import * as HANDLERS from "./handlers.js";
import * as UI from "./ui.js";

/*  global TEEUtils, localize */

export let state = {};
let sampleNumber = 0;
let attName = "foo_bar_baz";

export async function initialize() {
    console.log(`initializing Norman`);
    await HANDLERS.initialize();        //  initialize event handlers

    state.lang = localize.figureOutLanguage('en');
    await localize.initialize(state.lang);

    await CONNECT.initialize();        //  initialize the connection with CODAP
    UI.initialize();
    state = {...constants.defaultState, ...state};   //  have all fields from default!
    cycle();
}

export async function generateSamples() {
    state.clickNumber++;

    const theMean = Number(document.getElementById("popMean").value);
    const theSD = Number(document.getElementById("popSD").value);
    const howManySamples = Number(document.getElementById("numSamples").value);
    const sampleSize = Number(document.getElementById("sampleSize").value);

    const theAttName = document.getElementById("attName").value;
    const thePopName = document.getElementById("popName").value;

    if (theAttName !== state.attName || thePopName !== state.popName) {
        await CONNECT.destroyDataset();
        await CONNECT.makeFreshDataset();
    }

    console.log(`click ${state.clickNumber} generating sample ${sampleNumber} N(${theMean}, ${theSD})`);

    let theValues = [];

    for (let sample = 0; sample < howManySamples; sample++) {
        sampleNumber++;

        for (let item = 0; item < sampleSize; item++) {
            const aValue = TEEUtils.randomNormal(theMean, theSD);
            const theItem = {
                sample: sampleNumber,
                popMean: theMean,
                popSD: theSD,
            };
            theItem[theAttName] = aValue;

            theValues.push(theItem);
        }
    }

    CONNECT.emitData(theValues);

    cycle();
}

/**
 * Generally update the plugin because of a change.
 * Especially, redraw the UI.
 */
export function cycle() {
    UI.redraw();
}

/**
 * Any extra processing when you read the plugin state from a saved file goes here.
 */
function restoreState() {

}


/**
 * User has specified a CODAP dataset to use,
 * so we record that,
 * register our interest in changes,
 * and call `refreshData()` to get a copy of al the data.
 *
 * @param iName
 * @returns {Promise<void>}
 */
async function setDataset(iName) {
    state.datasetName = iName;
    console.log(`dataset changed to ${state.datasetName}`);
    HANDLERS.registerForCaseChanges(state.datasetName);

    refreshData();
}

/**
 * Ask CONNECT to get us a copy of all items in the current dataset.
 * We also translate that array of Items into an array of Values,
 * that is, just the values, not the other stuff in the API such as itemID.
 *
 * @returns {Promise<void>}
 */
async function refreshData() {
    state.allItems = await CONNECT.getAllItems(state.datasetName);
    state.allValues = [];
    state.allItems.forEach(item => {
        state.allValues.push(item.values);
    });
    cycle();
}

export const constants = {
    pluginName: `norma`,
    version: `2026a`,
    dimensions: {height: 366, width: 333},
    kDatasetName: "normal_samples",

    defaultState: {
        attName: "foo",
        popName: "bar",
        clickNumber: 0,
        lang: `en`,
        allItems: [],
        allValues: [],
        datasetName: null,     //  the name of the dataset we're working with
    }
};
