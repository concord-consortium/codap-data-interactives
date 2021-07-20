/**
 * Created by tim on 7/8/16.


 ==========================================================================
 steb.colorBoxView.js in data-science-games.

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

/* global steb, Snap */

steb.colorBoxView = {

    bgColor : null,
    crudColor : null,
    paper : null,
    bgBox : null,
    crudCircle : null,
    bgText : null,
    crudText : null,


    initialize : function( ) {
        this.paper = new Snap(document.getElementById("colorBoxView"));    //    create the underlying svg "paper"

        var tW = this.paper.node.clientWidth;
        var tH = this.paper.node.clientHeight;
        var crudRadius = tH > 60 ? 20 : tH / 3;

        this.bgBox = this.paper.rect( 0, 0, tW, tH).attr({fill : "red", strokeWidth : 4, stroke : "black"});
        this.crudCircle = this.paper.circle( tW/2, tH/2, crudRadius).attr({fill : "orange"});
    },

    newGame : function( ) {
        this.setColors( steb.model.trueBackgroundColor, steb.model.meanCrudColor);
    },

    setColors : function( iBG, iCrud )  {
        if (iCrud) {
            this.crudColor = iCrud;
            var tCrudColor = steb.makeColorString( this.crudColor );
            //  this.crudText.node.innerHTML = "Crud: " + iCrud.toString();
            this.crudCircle.attr({fill : tCrudColor});
        } else {
            //  this.crudText.node.innerHTML = "no crud this time";
        }

        this.bgColor = iBG;
        var tBGColor = steb.makeColorString( this.bgColor );
        //  this.bgText.node.innerHTML = "BG: " + iBG.toString();
        this.bgBox.attr({fill : tBGColor});
    }
};