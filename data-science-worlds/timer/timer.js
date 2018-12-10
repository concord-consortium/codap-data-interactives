/*
==========================================================================

 * Created by tim on 6/12/18.
 
 
 ==========================================================================
timer in timer

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


let timer = {

    startTime : null,
    waiting : true,
    setNumber : 0,
    sequenceNumber : 1,
    previousTime : null,

    initialize : async function() {
        window.onkeydown = (e) => this.doKeyDown(e);
        window.focus();

        await timer.connect.initialize();
        timer.ui.initialize();
    },

    updateAll : function() {
        timer.ui.update();
    },

    doKeyDown : function(e) {
        console.log(e.key + " " + e.keyCode);
        if (e.keyCode >= 48 && e.keyCode <= 57) {   //  digit
            this.doDataButton(e.key);
        } else if (e.keyCode >= 65 && e.keyCode <= 90) {   //  lc letter
            this.doDataButton(e.key);
        }
    },

    doNewSetButton : function () {
        this.waiting = true;
        console.log("waiting to start a new set...");
        this.updateAll();
    },

    doDataButton : async function(iKey) {
        let tDt = null;
        if (this.waiting) {
            this.waiting = false;
            this.startTime = new Date();
            this.setNumber++;
            this.sequenceNumber = 1;
            this.previousTime = null;
            console.log("Starting group " + this.setNumber);
        }
        let now = new Date();

        let elapsed = now.getTime() - this.startTime.getTime();

        if (this.previousTime) {
            tDt = now.getTime() - this.previousTime.getTime();
        }

        this.previousTime = now;

        let tValues = {
            set : this.setNumber,
            seq : this.sequenceNumber,
            time : elapsed / 1000.0,
            dt : tDt === null ? null : tDt  / 1000.0,
            what : iKey,
            when : now.CODAPDateTimeString()
        };

        this.sequenceNumber++;

        try {
            await timer.connect.emitTimerItems(tValues);
            await this.updateAll();
        }
        catch(msg) {
            console.log("problem in doDataButton(): " + msg);
        }
    },

    constants : {
        version : "000a",

        kTimerDataSetName : "Times",
        kTimerDataSetTitle : "Times",
        kTimerCollectionName : "Times"

    }
};