
import {state} from "./norma.js";

let statusDIV = null;

export function initialize() {
    statusDIV = document.getElementById('status');
    //  theSVG = d3.select("#theSVG");
}

/**
 * Redraw the plugin.
 */
export function redraw() {

    const buttonCountText = ` button count ${state.buttonCount}`;
    const datasetInfo = state.datasetName ? `dataset: ${state.datasetName}` : `no dataset`;

    //  statusDIV.innerHTML = `${buttonCountText}<br>${datasetInfo}<br>&nbsp; `;     //  of course, replace this!

}


