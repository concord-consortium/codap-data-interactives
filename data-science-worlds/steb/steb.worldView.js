/**
 * Created by tim on 3/23/16.


 ==========================================================================
 worldView.js in data-science-games.

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

/* global steb, Snap, StebberView, CrudView  */

/**
 * Singleton: the large, main view
 *
 * @type {{paper: null, stebberViews: Array, crudViews: Array, backgroundRect: null, update: steb.worldView.update, newGame: steb.worldView.newGame, installStebberViewFor: steb.worldView.installStebberViewFor, removeStebberView: steb.worldView.removeStebberView, installCrudViewFor: steb.worldView.installCrudViewFor, viewBoxCoordsFrom: steb.worldView.viewBoxCoordsFrom, initialize: steb.worldView.initialize, updateDisplayWithCurrentVisionParameters: steb.worldView.updateDisplayWithCurrentVisionParameters, applyPredatorVisionToObject: steb.worldView.applyPredatorVisionToObject, makeBackground: steb.worldView.makeBackground, mutateBackgroundColor: steb.worldView.mutateBackgroundColor, setBackgroundColor: steb.worldView.setBackgroundColor}}
 */
steb.worldView = {
    paper: null,       //          its SVG paper
    stebberViews: [],  //      array of views of the stebbers
    crudViews: [],     //      array of views of the Crud
    backgroundRect: null,  //  the background rectangle
    selectedStrokeColor: "white",   //  color for the stroke of selected Stebbers

    /**
     * Update this view.
     * Do so by updating all the child views -- stebbers and crud
     */
    update: function () {
        this.stebberViews.forEach(function (iSV) {
            iSV.update();
        });

        this.crudViews.forEach(function (iCV) {
            iCV.update();
        });
    },

    /**
     * Start a new game.
     */
    newGame: function () {
        this.paper.clear();         //      remove all its children.
        this.makeBackground();      //      make the background first
        this.stebberViews = [];
        this.crudViews = [];

        //  make StebberViews and install them

        steb.model.stebbers.forEach(function (iStebber) {
            steb.worldView.installStebberViewFor(iStebber);
        });

        //  make CrudViews and install

        steb.model.crud.forEach(function (iCrud) {
            steb.worldView.installCrudViewFor(iCrud);
        });
    },

    /**
     * Make a single Stebber view.
     * Called on new game, and any time you reproduce.
     * @param iStebber  the (model) Stebber
     */
    installStebberViewFor: function (iStebber) {
        var tSV = new StebberView(iStebber);
        tSV.paper.insertAfter(this.backgroundRect);   //  put any new stebbers below any crud, just after bgRect

        tSV.moveTo(iStebber.where);   //  place the view where it actually is on the main paper

        this.stebberViews.push(tSV);  //  add this new view to the array
    },

    /**
     * Remove a Stebber view (because of being eaten)
     * @param iStebberView
     */
    removeStebberView: function (iStebberView) {
        iStebberView.paper.remove();          //  remove it from the view hierarchy
        var tIndex = this.stebberViews.indexOf(iStebberView);
        this.stebberViews.splice(tIndex, 1);      //  remove it from the array
    },

    /**
     * Make a new Crud view and install it.
     * @param iCrud the model Crud
     */
    installCrudViewFor: function (iCrud) {
        var tCrudView = new CrudView(iCrud);
        this.paper.append(tCrudView.paper);     //  actually install the view. Goes on top.
        this.crudViews.push(tCrudView);       //  store it in our extra array
    },

    /**
     * Start up the view machinery
     */
    initialize: function () {
        this.paper = Snap(document.getElementById("stebSnapWorld"));    //    create the underlying svg "paper"

        //  now set this paper's "view box" --  By default "0 0 1000 1000"
        this.paper.attr({
            viewBox: "0 0 " + steb.constants.worldViewBoxSize + " " + steb.constants.worldViewBoxSize
        });

        this.paper.clear();
        this.makeBackground();
        this.installCrudViewFor( new Crud());
    },

    /**
     * Vision parameters have been changed.
     * So change the apparent colors of the background, stebbers, and crud.
     */
    updateDisplayWithCurrentVisionParameters: function () {
        if (steb.manager.playing) {
            this.stebberViews.forEach(function (sv) {
                sv.setMyColor();
            });
            this.crudViews.forEach(function (sv) {
                sv.setMyColor();
            });
            this.setBackgroundColor();
        }
    },


    /**
     * Change the apparent color of a miscellaneous object.
     * Called by StebberView, CrudView, etc.
     * TO make it look cool, we animate the color change.
     * @param iThing        thing whose color we're changing
     * @param iTrueColor    the original, true color of the object
     * @param iTime     Optional: how long it takes to animate the color. We use 0 for new objects (e.g., newborn Stebbers).
     */
    applyPredatorVisionToObject: function (iThing, iTrueColor, iTime) {

        // var tUsePattern = (typeof iThing.pattern !== undefined) && steb.options.useStripes;

        if (typeof iTime === 'undefined') {
            iTime = steb.constants.colorAnimationDuration;
        }
        var tApparentColor = steb.color.getPredatorVisionColor(iTrueColor);
        var tColorString = steb.makeColorString(tApparentColor);

        // if (tUsePattern) {
        //     tColorString = iThing.pattern;
        // }

        iThing.animate({fill: tColorString}, iTime);      //  animate the color change

    },

    //          BACKGROUND

    /**
     * Create the background
     */
    makeBackground: function () {
        this.backgroundRect = this.paper.rect(
            0, 0,
            steb.constants.worldViewBoxSize,        //  full size. Cover the world view.
            steb.constants.worldViewBoxSize);
        this.setBackgroundColor();      //  and give it a color

    },

    /**
     * Change the background color on demand. This is really for debugging.
     */
    mutateBackgroundColor: function () {
        steb.model.trueBackgroundColor = steb.color.mutateColor(steb.model.trueBackgroundColor, [-2, -1, 0, 1, 2]);
        this.setBackgroundColor();
    },

    /**
     * Make and apply the background color string,
     * taking the predator's visual filter into effect
     */
    setBackgroundColor: function () {
        steb.worldView.applyPredatorVisionToObject(this.backgroundRect, steb.model.trueBackgroundColor);
        steb.options.setColorChoiceText();
    },

    setCrudColors: function () {
        this.crudViews.forEach(function (iCrudView) {
            iCrudView.crud.determineColor();        //  change the underlying true color
            iCrudView.setMyColor();     //  change the display
        });
    },

    forceNewBackgroundColor: function () {
        if (!steb.manager.changingColors) {
            steb.manager.changingColors = true;
            steb.manager.emitPopulationData();
        }

        var tColorStringArray = $("#bgColorText").val().split(/[^-\d.]+/);

        steb.model.trueBackgroundColor = [
            Number(tColorStringArray[0]),
            Number(tColorStringArray[1]),
            Number(tColorStringArray[2])
        ];

        this.setBackgroundColor();
        steb.colorBoxView.setColors(steb.model.trueBackgroundColor, steb.model.meanCrudColor);
        steb.CODAPconnect.logMessage("New BG color &@ &@ &@",steb.model.trueBackgroundColor);
    },

    forceNewMeanCrudColor: function () {
        if (!steb.manager.changingColors) {
            steb.manager.changingColors = true;
            steb.manager.emitPopulationData();
        }

        var tColorStringArray = $("#meanCrudColorText").val().split(/[^-\d.]+/);

        steb.model.meanCrudColor = [
            Number(tColorStringArray[0]),
            Number(tColorStringArray[1]),
            Number(tColorStringArray[2])
        ];

        this.setCrudColors();
        steb.colorBoxView.setColors(steb.model.trueBackgroundColor, steb.model.meanCrudColor);
        steb.CODAPconnect.logMessage("New Crud color &@ &@ &@",steb.model.meanCrudColor);
    }

};