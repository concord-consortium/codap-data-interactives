import * as NORMA from "./norma.js";

/*  global codapInterface       */

/**
 * Set up handlers, e.g., event handlers
 */

export function initialize() {

    //  note: these subscriptions must happen BEFORE `connect.initialize()` so that the `.on` there does not
    //  override our handlers.

    codapInterface.on('update', 'interactiveState', "", restorePluginFromStore);
    codapInterface.on('get', 'interactiveState', "", getPluginState);

    document.getElementById("sampleButton").addEventListener('click', pressSampleButton);
}

function getPluginState() {
    return {
        success: true,
        values: {
            store: NORMA.state,
        }
    };
}

export function restorePluginFromStore(iStorage) {
    if (iStorage) {
        NORMA.state = iStorage.store;
    }
}

/**
 *  handler for our initial button
 */
function pressSampleButton() {
    NORMA.generateSamples();
}
