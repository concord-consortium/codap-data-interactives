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

univ.universeView = {

    thePaper : null,

    initialize : function(iDOMobject) {
        this.thePaper = new Snap(iDOMobject);

        const outerSVGText = this.thePaper.toString();
        const innerSVGText = this.thePaper.innerSVG();

        //  univ.debugText.innerHTML = "foo";

    },


    initializeForCreator : function() {
        this.drawArray( univ.model.truth);       //  todo, this is temporary. Where does it really belong?
    },

    initializeForPlayer : function() {
        this.drawArray( univ.model.truth);       //  todo, this is temporary. Where does it really belong?
    },

    setTruth : function(t) {
        this.truth = t;
    },



    drawArray : function(iArray) {
        const w = this.thePaper.attr("width");
        const h = this.thePaper.attr("height");
        const wh = w < h ? w : h;   //  smaller of the two, so everything fits
        const box = wh/univ.state.size;

        for (let row=0; row < univ.model.size; row++) {
            for (let col=0; col < univ.model.size; col++) {
                const tx = col * box + 1;
                const ty = row * box + 1;
                const theLetter = iArray[col][row];
                const tColor =  theLetter ? univ.colors[theLetter] : "black";

                this.thePaper.rect(tx, ty, box-2, box-2).attr({"fill" : tColor});
            }
        }
    }
};