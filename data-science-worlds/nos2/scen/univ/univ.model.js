/*
==========================================================================

 * Created by tim on 9/23/18.
 
 
 ==========================================================================
univ.model in univ

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

univ.model = {

    size : 12,

    truth : [],

    initialize : function() {
        this.truth = this.getNewStateTemp();
        console.log(JSON.stringify(this.truth));
    },

    getNewStateTemp : function() {
        let tTruth =  this.makeRandomTruth(this.size);

        tTruth = this.applySymmetry("TB", tTruth, this.size);
        tTruth = this.applySymmetry("LR", tTruth, this.size);
        return tTruth;
    },

    makeRandomTruth : function (iSize) {
        let out = [];

        for (let row=0; row < iSize; row++) {
            out[row] = [];
            for (let col=0; col < iSize; col++) {
                let aColor = TEEUtils.pickRandomItemFrom(["O","B","R","G"]);
                out[row][col] = aColor;
            }
        }
        return out;
    },

    applySymmetry : function(iType, iTruth, iSize) {

        let out = [];
        switch(iType) {
            case "TB":
                for (let col = 0; col < iSize; col++ ) {
                    out[col] = [];
                    for (let row = 0; row < iSize/2; row++ ) {
                        out[col][row] = iTruth[col][row];
                        out[col][iSize - row - 1] = iTruth[col][row];    //  t(0) = t(11)
                    }
                }
                break;
            case "LR":
                out = iTruth;
                for (let col = 0; col < iSize/2; col++ ) {
                    for (let row = 0; row < iSize; row++ ) {
                        out[col][row] = iTruth[col][row];
                        out[iSize - col - 1][row] = iTruth[col][row];    //  t(0) = t(11)
                    }
                }
                break;
        }

        return out;
    },

};