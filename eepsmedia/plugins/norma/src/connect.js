/**
 *  communicates with CODAP
 */

/* global localize, codapInterface, pluginHelper */

import * as HANDLERS from "./handlers.js";
import * as NORMA from "./norma.js";

let theDSD;

export async function initialize() {

    await codapInterface.init(
        getIFrameDescriptor(),
        HANDLERS.restorePluginFromStore         //  restores the state, if any
    );
    await allowReorg();
    await renameIFrame(localize.getString("frameTitle"));  //  localize the frame title
    await makeFreshDataset();

}

export async function makeFreshDataset() {
    theDSD = getDatasetDescriptor();
    NORMA.state.attName = theDSD.collections[1].attrs[0].name;
    NORMA.state.popName = theDSD.collections[1].name;
    await pluginHelper.initDataSet(theDSD);     //  open the output dataset
}

export async function destroyDataset() {
    await codapInterface.sendRequest({
        action : "delete",
        resource : `dataContext[${theDSD.name}]`,
    });
    console.log(`deleted [${theDSD.name}]`);
}


export async function emitData(iValues) {
    const theMessage = {
        action: "create",
        resource: `dataContext[${theDSD.name}].item`,
        values: iValues
    };

    try {
        await codapInterface.sendRequest(theMessage);
    } catch (err) {
        alert(`Error creating CODAP items: ${err}`);
    }

    makeCaseTableAppear(theDSD.name, localize.getString("outputDatasetTitle"));
}

export async function getAllItems(iDSName) {
    let out = null;

    const theMessage = {
        action : "get",
        resource : `dataContext[${iDSName}].itemSearch[*]`
    };

    try {
        const result = await codapInterface.sendRequest(theMessage);
        if (result.success) {
            return result.values;
        }
    } catch(err) {
        alert(`ERROR getting items: ${err}`);
    }

    return out;
}

async function makeCaseTableAppear(contextName, title) {
    const theMessage = {
        action: "create",
        resource: "component",
        values: {
            type: 'caseTable',
            dataContext: contextName,
            title: title,
            cannotClose: true
        }
    };
    await codapInterface.sendRequest(theMessage);
}



async function renameIFrame(iName) {
    const theMessage = {
        action: "update",
        resource: "interactiveFrame",
        values: {
            title: iName,
        }
    };
    await codapInterface.sendRequest(theMessage);
}


/**
 * Kludge to ensure that a dataset is reorg-able.
 *
 * @returns {Promise<void>}
 */
async function allowReorg() {
    const tMutabilityMessage = {
        "action": "update",
        "resource": "interactiveFrame",
        "values": {
            "preventBringToFront": false,
            "preventDataContextReorg": false
        }
    };

    codapInterface.sendRequest(tMutabilityMessage);
}

function getDatasetDescriptor() {

    const theAttName = document.getElementById("attName").value;
    const thePopName = document.getElementById("popName").value;
    console.log(`making dataset with [${theAttName}] in ${thePopName}`);

    return {
        name : NORMA.constants.kDatasetName,
        title : localize.getString("outputDatasetTitle"),
        collections : [
            {
                name: NORMA.constants.kDatasetName,
                title: localize.getString("dataTopCollectionTitle"),
                attrs: [
                    { name : localize.getString("attributeNames.sample"), type : "numeric"},
                    { name : localize.getString("attributeNames.popMean"), type : "numeric"},
                    { name : localize.getString("attributeNames.popSD"), type : "numeric"}
                ]
            },

            {
                parent : NORMA.constants.kDatasetName,
                name: thePopName,
                title : thePopName,
                attrs: [
                    //  {name : "value", title : theAttName}
                    {name : theAttName, title : theAttName}
                ]
            }
        ]
    };
}

/**
 * Constant descriptor for the iFrame.
 * Find and edit the values in `templ8.constants`
 */
function getIFrameDescriptor() {
    return {
        name: NORMA.constants.pluginName,
        title: localize.getString("frameTitle"),
        version: NORMA.constants.version,
        dimensions: NORMA.constants.dimensions,      //      dimensions,
    };
}