/*
==========================================================================

 * Created by tim on 9/22/18.
 
 
 ==========================================================================
universeView in 4color

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

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

univ.telescopeView = {

    thePaper: null,

    experimentSize: 3,

    selectedPoint: null,

    possiblePoint: null,

    latestResult: null,

    theArray: [],

    initialize: function (iDOMobject) {
        this.thePaper = new Snap(iDOMobject);
        this.theArray = this.makeUniformArray("K");

        const tArray = this.paintArrayAt(this.theArray, [6, 2], this.experimentSize, "Y");
        this.drawArray(tArray);
    },

    makeUniformArray: function (iFill) {
        let out = [];

        for (let r = 0; r < univ.state.size; r++) {
            out[r] = [];
            for (let c = 0; c < univ.state.size; c++) {
                out[r][c] = iFill;
            }
        }

        return out;
    },

    pinColRow: function (iPoint, iSize) {
        if (iPoint[1] >= univ.state.size - iSize) iPoint[1] = univ.state.size - iSize;
        if (iPoint[0] >= univ.state.size - iSize) iPoint[0] = univ.state.size - iSize;

        return iPoint;
    },

    paintArrayAt: function (iArray, iPoint, iSize, iFill) {
        iPoint = this.pinColRow(iPoint, this.experimentSize)
        for (let r = 0; r < iSize; r++) {
            for (let c = 0; c < iSize; c++) {
                iArray[c + iPoint[0]][r + iPoint[1]] = iFill;              //  note column is the first index, because it's x.
            }
        }
        return iArray;
    },


    prepareArray: function () {
        let tArray = this.makeUniformArray("K");
        if (this.possiblePoint) {
            tArray = this.paintArrayAt(tArray, this.possiblePoint, this.experimentSize, "Y");
        }
        if (this.selectedPoint) {
            tArray = this.paintArrayAt(tArray, this.selectedPoint, this.experimentSize, "R");
        }
        return tArray;
    },

    drawArray: function (iArray) {
        const w = this.thePaper.attr("width");
        const h = this.thePaper.attr("height");
        const wh = w < h ? w : h;   //  smaller of the two, so everything fits
        const box = wh / univ.state.size;

        for (let row = 0; row < univ.state.size; row++) {
            for (let col = 0; col < univ.state.size; col++) {
                const tx = col * box + 1;
                const ty = row * box + 1;
                const theLetter = iArray[col][row];
                const tColor = theLetter ? univ.colors[theLetter] : "black";

                let tr = this.thePaper.rect(tx, ty, box - 2, box - 2).attr({"fill": tColor});

                //  set up the handlers for mouse over and mouse up

                tr.mouseover(e => {
                    this.possiblePoint = [col, row];
                    const tA = this.prepareArray();
                    this.drawArray(tA);
                }).mouseup(e => {
                    this.selectedPoint = [col, row];
                    const tA = this.prepareArray();
                    this.drawArray(tA);

                    //  when pointing changes, blank the latest result display
                    this.latestResult = null;
                    univ.ui.update();

                });
            }
        }
    },

    displayTelescopeLocation() {
        const tTelescopeLocationText = document.getElementById("telescopeLocationText");
        if (this.selectedPoint) {
            tTelescopeLocationText.innerHTML = "Upper left at col = " +
                this.selectedPoint[0] + ", row = " + this.selectedPoint[1];
        } else {
            tTelescopeLocationText.innerHTML = "Click in the grid to point";
        }
    },

    displayLatestResult: function () {
        const tLatestResultText = document.getElementById("latestResultText");
        if (this.latestResult) {
            tLatestResultText.innerHTML = JSON.stringify(this.latestResult.data);
        } else {
            tLatestResultText.innerHTML = "click <b>collect data</b> to get a new result";
        }
    }
};