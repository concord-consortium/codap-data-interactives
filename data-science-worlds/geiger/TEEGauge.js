/*
 ==========================================================================
 TEEGauge.js

 Reusable class of strip gauges.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
 * Created by tim on 10/4/15.
 */

/**
 * Set basic values
 * @constructor
 */
var Gauge = function () {
    var min = 0;
    var max = 0;
    var value = 0;
    var label = "Value: ";

    var wholeSVG = null;    //  the SVG containing this gauge
    var backgroundRect = null;
    var gaugeRect = null;
    var gaugeText = null;
};

/**
 * Set values specific to this gauge. Construct the svg objects.
 * @param theID     the entity ID
 * @param label     the text label to appear in the gauge
 * @param min       min value
 * @param max       max value
 */
Gauge.prototype.setup = function (theID, label, min, max) {
    this.wholeSVG = document.getElementById(theID);

    this.min = min;
    this.max = max;
    this.label = label;

    this.backgroundRect = document.createElementNS(svgNS, "rect");
    this.gaugeRect = document.createElementNS(svgNS, "rect");
    this.gaugeRect.setAttribute("width", this.wholeSVG.getAttribute("width"));
    this.gaugeRect.setAttribute("height", this.wholeSVG.getAttribute("height"));
    this.gaugeRect.setAttribute("x", "0");
    this.gaugeRect.setAttribute("y", "0");
    this.gaugeRect.setAttribute("fill", "#777777");
    this.backgroundRect.setAttribute("width", this.wholeSVG.getAttribute("width"));
    this.backgroundRect.setAttribute("height", this.wholeSVG.getAttribute("height"));
    this.backgroundRect.setAttribute("x", "0");
    this.backgroundRect.setAttribute("y", "0");
    this.gaugeRect.setAttribute("fill", "darkblue");

    this.wholeSVG.appendChild(this.backgroundRect);
    this.wholeSVG.appendChild(this.gaugeRect);

    this.gaugeText = document.createElementNS(svgNS, "text");
    this.gaugeText.textContent = "foo";
    this.gaugeText.setAttribute("y", "20");
    this.gaugeText.setAttribute("x", "4");
    this.gaugeText.setAttribute("fill", "white");
    this.gaugeText.setAttribute("font-family", "Verdana");

    this.wholeSVG.appendChild(this.gaugeText);
};

/**
 * Update the value displayed (called from outside)
 * @param val
 */
Gauge.prototype.update = function (val) {
    this.value = val;
    this.drawGauge();
};

/**
 * Draw the current gauge (also called by update( val ) )
 */
Gauge.prototype.drawGauge = function () {

    var tValue = this.value;
    tValue = Math.min( this.max, tValue);
    tValue = Math.max( this.min, tValue );

    var tFrac = tValue / this.max;
    if (tFrac > 1) tFrac = 1;

    var tRGBColorString = "rgb(" + Math.floor(255.0 * tFrac) + ", " +
        Math.floor(255.0 * (1 - tFrac)) + ", 100)";

    this.gaugeRect.setAttribute("fill", tRGBColorString);

    tWidthNumber = Number(this.wholeSVG.getAttribute("width")) * tFrac;

    this.gaugeRect.setAttribute("width", tWidthNumber.toString());

    var tLabel = this.label + ": " + this.value;
    this.gaugeText.textContent = tLabel;

    var tXofTheText = 6;
    if (tFrac < 0.5) {
        tXofTheText = tWidthNumber + 6;
        this.gaugeText.setAttribute("text-anchor", "start");
    } else {
        tXofTheText = tWidthNumber - 6;
        this.gaugeText.setAttribute("text-anchor", "end");
    }
    this.gaugeText.setAttribute("x", tXofTheText.toString());

};
