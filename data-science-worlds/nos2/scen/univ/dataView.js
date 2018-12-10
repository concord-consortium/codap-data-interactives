/*
==========================================================================

 * Created by tim on 9/25/18.
 
 
 ==========================================================================
dataView in nos2

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


univ.dataView = {

    thePaper : null,
    results : [],
    theArray : [],
    gridLeft : 0,       //  left edge of the 12 x 12 grid
    gridRight : 100,    //  the right edge of the 12 x 12 grid
    box : 10,           //  size of one cell.
    plaqueGridGap : 3,

    selectionOnly : false,

    colors: {
        "R": "tomato",
        "B": "dodgerblue",
        "O": "orange",
        "G": "green",
        "K": "lightgray",
        "Y": "yellow"
    },

    initialize : function(iDOMobject) {
        this.thePaper = new Snap(iDOMobject);

        this.theArray = this.makeUniformArray("K");
        this.drawArray(this.theArray);

        const outerSVGText = this.thePaper.toString();
        const innerSVGText = this.thePaper.innerSVG();
    },

    clearResults : function() {
        this.results = [];
    },

    redraw : async function() {
        let theDisplayedResults = [];   //  array of Result objects

        let tDataDisplayChoice = $('input[name=dataDisplayChoice]:checked').val();

        const allResults = await univ.CODAPconnect.getAllCasesAsResultsWithSelection(univ.constants.kUnivDataSetName);

        if (tDataDisplayChoice === "selection") {
            allResults.forEach( r => {
                if (r.selected) {
                    theDisplayedResults.push(r)
                }
            });

            //  const selectedData = await univ.CODAPconnect.getSelectedCases(univ.constants.kUnivDataSetName);
            //  theDisplayedResults = univ.convertSelectedCasesToResults(selectedData);
        } else {
            //  const allData = await univ.CODAPconnect.getAllCases(univ.constants.kUnivDataSetName);
            //  theDisplayedResults = univ.convertAllCasesToResults(allData);

            theDisplayedResults = allResults;
        }

        univ.dataView.displaySomeResults(theDisplayedResults);
    },
/*
    addResult : function(iResult) {
        this.results.push(iResult);
    },

*/
    displaySomeResults : function( iResults ) {

        iResults.sort( (a,b) => { return a.data.row - b.data.row}); //  sort results by row
        this.results = iResults;
        this.thePaper.clear();
        this.drawArray(this.makeUniformArray("K"));

        let plaqueLevels = { left: 1, right : 1};
        this.results.forEach( r => {
            const pq = r.plaque();

            let plaqueX = null;
            let plaqueY = null;
            let lineStartX = 0;
            let lineStartY = 0;

            if (r.data.col < 6 ) {
                plaqueX  = univ.dataView.gridLeft - univ.dataView.plaqueGridGap - pq.attr("width");
                plaqueY = plaqueLevels.left;
                plaqueLevels.left += this.box;
                lineStartX = univ.dataView.gridLeft - univ.dataView.plaqueGridGap;
                lineStartY = plaqueY + pq.attr("height")/2;
            } else {
                plaqueX = univ.dataView.gridRight + univ.dataView.plaqueGridGap;
                plaqueY = plaqueLevels.right
                plaqueLevels.right += this.box;
                lineStartX = univ.dataView.gridRight + univ.dataView.plaqueGridGap;
                lineStartY = plaqueY + pq.attr("height")/2;
            }

            //  draw the plaque
            this.thePaper.append(pq.attr({ x: plaqueX, y : plaqueY }));

            //  draw the shaded box in the grid
            const rectX = this.gridLeft + (r.data.col * this.box) + 1;
            const rectY = (r.data.row * this.box) + 1;
            const rectW = (Number(r.data.dim) * this.box) - 2;
            const theColor = r.selected ? univ.colors.selected : univ.colors.unselected;
            const theObservation = this.thePaper.rect(rectX, rectY, rectW, rectW).attr({fill : theColor, "fill-opacity" : 0.4});
            theObservation.click( e => r.toggleSelection() );   //  note the function call!

            const lineEndX = rectX + rectW/2;
            const lineEndY = rectY + rectW/2;

            //  finally, on top, draw the line connecting the plaque to the middle of the shaded box
            this.thePaper.line( lineStartX, lineStartY, lineEndX, lineEndY).attr({ stroke : "black"});
        })

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

    drawArray : function(iArray) {
        const w = Number(this.thePaper.attr("width"));
        const h = Number(this.thePaper.attr("height"));
        const wh = w < h ? w : h;   //  smaller of the two, so everything fits
        this.box = wh/univ.state.size;

        //  assume w > h for this view.

        this.gridLeft = (w - h) / 2;
        this.gridRight = this.gridLeft + h;

        for (let row=0; row < univ.state.size; row++) {
            for (let col=0; col < univ.state.size; col++) {
                const tx = col * this.box + 1;
                const ty = row * this.box + 1;
                const theLetter = iArray[col][row];
                const tColor =  theLetter ? this.colors[theLetter] : "black";

                let tr = this.thePaper.rect(this.gridLeft + tx, ty, this.box - 2, this.box - 2).attr({"fill" : tColor});
                tr.mouseup( e => {
                    console.log("Mouse up in " + JSON.stringify([col, row]));
                    univ.ui.update();

                });
            }
        }
    },

};