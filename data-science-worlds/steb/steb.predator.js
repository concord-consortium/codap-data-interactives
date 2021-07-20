/**
 * Created by tim on 5/10/16.


 ==========================================================================
 Predator.js in data-science-games.

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

/* global steb, console */

/**
 * Singleton embodying the automated predator's behavior
 *
 * @type {{where: null, state: string, targetView: null, waitTime: null, memory: Array, newGame: steb.predator.newGame, update: steb.predator.update, interestedInMeal: steb.predator.interestedInMeal, findTarget: steb.predator.findTarget, releaseTarget: steb.predator.releaseTarget, targetProbability: steb.predator.targetProbability}}
 */
steb.predator = {
    where : null,           //  location
    state : "waiting",      //  looking, stalking, eating

    targetView : null,
    waitTime : null,        //  ongoing timer. gets decremented as time passes.
    memory : [],

    /**
     * Start the predator
     */
    newGame : function() {
        this.waitTime = steb.constants.predatorWaitTime;
        this.targetView = null;
        this.state = "waiting";
    },

    /**
     * Time has passed for the predator.
     * @param dt
     */
    update: function (dt) {
        this.waitTime -= dt;        //  decrement waitTime

        if (this.waitTime <= 0) {   //  we are at the end of the current phase. Change state and act accordingly.
            switch (this.state) {

                case "waiting":
                    this.state = "looking";
                    this.waitTime = steb.constants.predatorLookTime;
                    break;

                case "looking":
                    this.findTarget();      //  gets a random stebber VIEW
                    var tCaptureProbability = this.targetProbability(this.targetView.stebber);  //  find probablility

                    if (tCaptureProbability > Math.random()) {      //  beat the probability. We will eat it (in a bit)
                        //  console.log( "Gonna eat " + this.targetView.stebber + ". Prob = " + tCaptureProbability.toFixed(3));
                        steb.manager.activateTargetReticuleOn(this.targetView, true);   //  turn on the red box
                        this.state = "stalking";
                        this.waitTime = steb.constants.predatorStalkTime;
                    } else {
                        //  console.log( "Pass on   " + this.targetView.stebber + ". Prob = " + tCaptureProbability.toFixed(3));
                        this.releaseTarget();   //  give up on this Stebber
                        steb.score.loss();      //  lose points
                        this.waitTime = steb.constants.predatorLookTime;    //  reset the clock
                    }
                    break;

                case "stalking":    //  done stalking, now we eat!
                    steb.manager.autoPredatorCatchesStebberView(this.targetView);  //  actually eat.
                    steb.manager.activateTargetReticuleOn( this.targetView, false );    //  deactivate the reticule
                    this.state = "waiting";
                    this.waitTime = steb.constants.predatorWaitTime;    //  reset clock for this state.

                    this.releaseTarget();   //  redundant? todo: decide if this is necessary.
                    break;

            }       //      end switch on state
        }
    },

    /**
     * Get a random target
     */
    findTarget : function() {
        this.targetView = steb.manager.findRandomStebberView( );
    },

    /**
     * Set the target view to null.
     */
    releaseTarget : function() {
        this.targetView = null;
    },

    /**
     * Calculate the target probabilty.
     * @param iTarget   the Stebber associated with the target view
     * @returns {number}    probability
     */
    targetProbability : function(iTarget ) {

        var tDBG = iTarget.colorDistanceToBackground;
        var tDCrud = iTarget.colorDistanceToCrud;

        //  console.log("predator.targetProbability" + iTarget.toString() + " dBG: " + tDBG + " dCrud: " + tDCrud);

        var tColorDistance = tDBG;
        //if (tDCrud) {         //  todo: figure out how to deal with there being no crud at all. But note tDCrud can be zero.
            if (tDCrud < tColorDistance) {tColorDistance = tDCrud;}
        //}
        //  tColorDistance is now the SMALLER of the distance to BG and to Crud

        tColorDistance *= steb.color.predatorVisionDenominator; //  todo: not clear if this is right.

        //  now we convert that distance to a probability. It's a linear function based on
        //  the two key values here. See steb.js for the definitions of these constants.

        var oProb = (tColorDistance - steb.constants.invisibilityDistance) * steb.constants.captureSlope;

        //      testing!

        var tProbAtOne = 0.33;
        var factor = 1 - tProbAtOne;    //  like, 2/3
        var depress = Math.pow(factor, tColorDistance);     //  like, 2/3 ^4 for color distance of 4

        oProb = 1 - depress;

        return oProb;
    }

};