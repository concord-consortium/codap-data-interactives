/**
 * Created by tim on 5/9/16.


 ==========================================================================
 etaCas.score.js in data-science-games.

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

/**
 * Singleton with many small methods for updating the score
 * @type {{evolutionPoints: null, pointsPerCrud: number, pointsPerMeal: number, pointsPerMiss: number, pointsPerSecond: number, startingPoints: number, predatorEnergy: null, startingPredatorEnergy: number, energyPerMeal: number, energyPerLoss: number, energyPerVisionChange: number, winningScore: number, newGame: steb.score.newGame, meal: steb.score.meal, loss: steb.score.loss, crud: steb.score.crud, clickInWorld: steb.score.clickInWorld, checkEnd: steb.score.checkEnd}}
 */

/* global steb */

steb.score = {

    pointsPerCrud : -8,
    pointsPerMeal : 1,
    pointsPerMiss : -1,
    pointsPerSecond : -0.016,

    predatorPoints : null,
    energyPerMeal : 5,
    energyPerLoss : -1,
    energyPerVisionChange : -50,


    newGame : function() {
        this.predatorPoints = steb.constants.initialScore;
    },

    /**
     * Stebber gets eaten. Yum!
     */
    meal : function() {
        this.predatorPoints += this.energyPerMeal;
        this.checkEnd();
    },

    /**
     * Lost lock on a Stebber
     */
    loss : function() {
        this.predatorPoints += this.energyPerLoss;
        this.checkEnd();
    },

    /**
     * user clicks on Crud
     */
    crud : function() {
        this.predatorPoints += this.pointsPerCrud;
        this.checkEnd();
    },

    /**
     * User clicks but misses everything
     */
    clickInWorld : function() {
        this.predatorPoints += this.pointsPerMiss;
        this.checkEnd();
    },

    /**
     * Check to see if the game is over after we updated the score
     */
    checkEnd : function( )  {
        if (steb.manager.checkForWin) {
            var tScore = steb.score.predatorPoints;

            if (tScore >= steb.constants.winningScore) {        //  todo: change to an option
                steb.manager.endGame("win");
            } else if (tScore <= 0) {
                steb.manager.endGame("loss");
            }
        }
    }
};