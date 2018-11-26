/*
==========================================================================

 * Created by tim on 9/25/18.
 
 
 ==========================================================================
Result in nos2

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

/**
 * This is a class to hold the result of one observation, locally to this app
 * DO NOT CONFUSE THIS with a record in the `results` table of the nos2 database,
 * even though the two things have  1-1 correspondence!
 */
class Result {

    constructor( iData, iExtras = null ) {
        this.data = iData;    //  the colors, plus col, row, dim

        if (iExtras) {
            this.epoch = iExtras.epoch;
            this.teamID = iExtras.teamID;
            this.source = iExtras.source;
            this.dbid = iExtras.dbid;
            this.selected = iExtras.selected;
            this.caseID = iExtras.caseID;       //  the ID from CODAP
        } else {
            this.epoch = univ.state.epoch;
            this.teamID = univ.state.teamID;
            this.source = univ.constants.kLocalSourceString;
            this.dbid = 0;
            this.selected = false;
            this.caseID = 0;       //  the ID from CODAP
        }

    }

    toCODAPValuesObject() {
        let out = this.data;
        out.dbid = this.dbid;
        out.epoch = this.epoch;
        out.teamID = this.teamID;
        out.source = this.source;

        return out;
    }

    toString() {
        return (this.data.O + "O " + this.data.R + "R " + this.data.G + "G " + this.data.B + "B");
    }

    plaque() {
        let theColor = this.selected ? univ.colors.selected : univ.colors.unselected;
        let paper = Snap(80, 22);
        let bgRect = paper.rect(0, 0,
            paper.attr("width"),
            paper.attr("height")).attr({
            fill: theColor,
            stroke: "#567" ,
            "stroke-width": "3"
        });

        //  capture clicks on the plaque

        //  bgRect.click( e => {
        paper.click( e => {
           console.log("Click in plaque");
           this.toggleSelection( );
        });

        //  draw the text

        let theText = paper.text(3, 18, this.toString());
        theText.addClass("plaqueText");

        return paper;
    }

    toggleSelection() {
        console.log("toggling result caseID = " + this.caseID);
        const theCaseID = this.caseID;
        if (this.selected) {
            univ.CODAPconnect.deselectTheseCases( univ.constants.kUnivDataSetName, [theCaseID] );
        } else {
            univ.CODAPconnect.selectTheseCases( univ.constants.kUnivDataSetName, [theCaseID] );
        }
    }
}

Result.resultFromCODAPValues = function(iValues) {
    let theData = iValues;
    out = new Result(theData, {
        dbid : iValues.dbid,
        epoch : iValues.epoch,
        teamID : iValues.teamID,
        source : iValues.source,
        selected : iValues.selected,
        caseID : iValues.caseID,
    });

    return out;
};

