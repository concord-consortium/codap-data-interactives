/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.model.js in data-science-games.

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
 * Singleton model object
 *
 * @type {{stebbers: Array, elapsed: null, meals: null, lastStebberNumber: null,
 * reproduce: steb.model.reproduce, findParent: steb.model.findParent,
 * update: steb.model.update, newGame: steb.model.newGame,
 * addNewStebberBasedOn: steb.model.addNewStebberBasedOn, removeStebber: steb.model.removeStebber,
 * frightenStebbersFrom: steb.model.frightenStebbersFrom, randomPlace: steb.model.randomPlace,
 * distanceBetween: steb.model.distanceBetween
 * }}
 */

/* global steb, Stebber, Crud, TEEUtils, Snap */

steb.model = {

    stebbers : [],      //  array of Stebbers
    crud : [],          //  array of cruds. IN the CrudView file.
    elapsed : null,
    meals : null,       //  number of meals
    lastStebberNumber : null,
    meanCrudColor : null,
    trueBackgroundColor : null,

    /**
     * Ensure that member variables have plausible values so that other routines don't blow up.
     * ACTUAL values get set in newGame()
     */
    initialize : function() {
        this.elapsed = 0;
        this.meals = 0;
        this.lastStebberNumber = 0;
        this.meanCrudColor = steb.constants.defaultCrudColor;
        this.trueBackgroundColor = steb.constants.defaultBackgroundColor;
    },

    /**
     * Perform reproduction in the Stebber set
     */
    reproduce : function()   {
        var tChildren = [];
        if (steb.options.delayReproduction) {
            if (this.meals % 5 === 0) {
                for (var i = 0; i < 5; i++) {
                    tChildren.push(this.makeBabyStebber());
                }
            }
        } else {
            tChildren.push(this.makeBabyStebber());
        }
        return tChildren;
    },

    /**
     * Make a single baby stebber
     *
     * @returns {*|Stebber}
     */
    makeBabyStebber : function() {
        var tChild, tParent;

        tParent  = this.findParent();
        tChild = (this.addNewStebberBasedOn( tParent ));   //  adds the MODEL
        steb.manager.addViewForChildStebber( tChild );
        return tChild;
    },


    /**
     * Called from reproduce().
     * Find a suitable parent for a new Stebber.
     * @returns {*}     the parent, which is a Stebber
     */
    findParent : function() {
        var oParent = TEEUtils.pickRandomItemFrom( this.stebbers );
        if (steb.options.eldest) {
            var ix = TEEUtils.pickRandomItemFrom([0,0,0,1,1,2,3,4]);
            oParent = this.stebbers[ ix ];
        }
        return oParent;
    },

    /**
     * Update the state of the model, evolving it by idt seconds
     * @param idt   number of seconds to evolve
     */
    update : function ( idt ) {
        this.elapsed += idt;
        this.stebbers.forEach( function(iStebber) {
            iStebber.update(idt);
        });
        this.crud.forEach( function(iCrud) {
            iCrud.update(idt);
        });
    },


    /**
     * Set up the model for a new game
     */
    newGame : function() {

        steb.score.newGame();   //      initialize score object

        this.stebbers = [];     //      fresh array of Stebbers
        this.crud = [];     //      fresh array of Crud
        this.elapsed = 0;       //      elapsed time in seconds
        this.meals = 0;         //      number of meals
        this.lastStebberNumber = 0;

        var i;

        if (steb.options.fixedInitialBG) {
            //  this.trueBackgroundColor = steb.constants.defaultBackgroundColor;
            //  this.meanCrudColor = steb.constants.defaultCrudColor;
        } else {
            this.trueBackgroundColor = this.inventBackgroundColor();
            this.meanCrudColor = steb.options.backgroundCrud ?
                steb.color.mutateColor(this.trueBackgroundColor, [-3, -3, -2, 2, 3, 3]) :
                null;
        }

        //  create a new set of Stebbers.
        if (steb.options.fixedInitialStebbers) {
            this.makeInitialFixedStebbers();
        } else {
            for (i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
                this.addNewStebberBasedOn(null);
            }
        }

        //  create a new set of Crud.
        if (steb.options.backgroundCrud) {
            for (i = 0; i < steb.constants.numberOfCruds; i++) {
                this.crud.push(new Crud());
            }
        }
    },

    /**
     * Come up with a suitable color for the background.
     * @returns {*}
     */
    inventBackgroundColor : function() {
        var oColor = null;
        var tColor = "hsb(" + Math.random() + ", 0.5, 0.7)";
        var tRGB = Snap.getRGB(tColor);
        var tNorm = 15/255;

        oColor = [
            Math.round(tNorm * tRGB.r),
            Math.round(tNorm * tRGB.g),
            Math.round(tNorm * tRGB.b)
        ];

        oColor = steb.color.randomColor( steb.options.extremeBGColor ? [3, 4, 5, 11, 12, 13] : [6,7,8,9] );     //  temp restrict??

        return oColor;
    },

    /**
     * Add a new Stebber to the model.
     * Called from newGame() AND from reproduce()
     *
     * Note: if you pass in null (as this.newGame() does) this adds a Stebber with random properties.
     * Suitable for the beginning of the game.
     *
     * @param iParentStebber    the (optional) parent Stebber (therefore the one on which the new Stebber is based.)
     * @returns {Stebber}
     */
    addNewStebberBasedOn : function( iParentStebber ) {

        var tColor, tWhere = {};
        this.lastStebberNumber += 1;

        if (iParentStebber ) {
            var tMute = steb.options.reducedMutation ?
                steb.constants.stebberColorReducedMutationArray :
                steb.constants.stebberColorMutationArray;
            tColor = steb.options.noMutation ?
                iParentStebber.trueColor :
                steb.color.mutateColor( iParentStebber.trueColor, tMute );
            tWhere.x = iParentStebber.where.x;
            tWhere.y = iParentStebber.where.y;
        } else {    //  beginning of the game, no parent
            tColor = steb.color.randomColor( [1, 2, 3,4,5,6,7,8,9,10,11,12, 13, 14] );
            tWhere = this.randomPlace();
        }

        var tChildStebber = new Stebber( tColor, tWhere, this.lastStebberNumber, iParentStebber.id );
        tChildStebber.setNewSpeedAndHeading();          //  it should immediately diverge from the parent
        this.stebbers.push( tChildStebber );            //  we keep the model Stebber in our array

        return tChildStebber;
    },

    makeInitialFixedStebbers : function() {
        var i, tColor = [], tWhere = {}, tNewStebber;

        for ( i = 0; i < steb.constants.initialNumberOfStebbers; i++) {
            this.lastStebberNumber += 1;
            tColor = steb.constants.fixedStebberColor[i];
            tWhere = this.randomPlace();
            tNewStebber = new Stebber( tColor, tWhere, this.lastStebberNumber, 0 );
            tNewStebber.setNewSpeedAndHeading();          //  it should immediately diverge from the parent
            this.stebbers.push( tNewStebber );            //  we keep the model Stebber in our array
            steb.manager.emitBirthData( tNewStebber );      //  emit original stebbers to Born set.

        }
    },

    selectStebber : function( iSteb, iOnly ) {
        if (iOnly) {
            this.stebbers.forEach( function(iS) {
                iS.selected = false;
            });
        }
        iSteb.selected = true;
    },

    /**
     * Find the  Stebber in question and eliminate it.
     * @param iStebber  the Stebber to be axed
     */
    removeStebber : function( iStebber ) {
        console.log("Eating steb #" + iStebber.id );
        this.meals += 1;
        var tKilledColor = steb.makeColorString( iStebber.trueColor );  //  todo: use in future dataset
        var tIndex = this.stebbers.indexOf( iStebber );
        this.stebbers.splice( tIndex, 1 );
    },

    /**
     * Predation at the point, all Stebbers and Crud run away from it.
     * @param iPoint    the (local) point where predation occurred
     */
    frightenStebbersFrom : function( iPoint ) {
        this.stebbers.forEach( function(iStebber) {
            iStebber.runFrom( iPoint );
        });
        this.crud.forEach( function(iCrud) {
            iCrud.runFrom( iPoint );
        });
    },


    //      location utilities

    randomPlace : function() {
        return {
            x : Math.round(steb.constants.worldViewBoxSize * Math.random()),
            y : Math.round(steb.constants.worldViewBoxSize * Math.random())
        };
    },

    /**
     * Pythagorean distance between the two points. Each point is an object {x : ??, y : ??}
     * @param p1
     * @param p2
     * @returns {number}
     */
    distanceBetween : function( p1, p2 ) {
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var tDistance = Math.sqrt( dx * dx + dy * dy );

        return tDistance;
    }




};