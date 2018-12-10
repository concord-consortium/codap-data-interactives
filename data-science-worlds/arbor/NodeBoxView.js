/**
 * Created by tim on 9/26/16.


 ==========================================================================
 NodeBoxView.js in "Baum."

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


NodeBoxView = function (iNode, iMyTreeView) {
    this.myNode = iNode;
    this.myTreeView = iMyTreeView;

    //  We watch this event for changes from the model,
    //  e.g., changes in number or text.
    arbor.eventDispatcher.addEventListener("changeNode", this.handleNodeChange, this);

    var tPad = arbor.constants.treeObjectPadding;
    this.kStripeHeight = 20;

    this.stripes = [];  //  the box is made up of a variable number of "stripes"

    this.boxDimensions = {
        x: 0, y: 0,
        width: 0,
        height: 0
    };

    this.paper = new Snap(133, 133);

    //  the tool tip
    this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));

    //  handlers

    this.paper.mousedown(function (iEvent) {
        this.myTreeView.myPanel.lastMouseDownNodeView = this;
    }.bind(this));

    //  handle mouseUp events in the NodeBoxView

    this.paper.mouseup(function (iEvent) {

        var tMouseDownPlace = this.myTreeView.myPanel.lastMouseDownNodeView;

        if (tMouseDownPlace) {
            if (this === tMouseDownPlace) {     //  it's a click
                if (iEvent.shiftKey || iEvent.altKey || iEvent.ctrlKey) {
                    this.myNode.stubThisNode();
                }
            }
            //  it's not a click, we've dragged in from somewhere else...

            //  dragged in from the corral, so we branch the node by that attribute
            else if (tMouseDownPlace instanceof CorralAttView) {
                this.myNode.branchThisNode(tMouseDownPlace.attInBaum);
            }

            //  dragged in from another node, so we branch it by THAT node's attribute, if it exists
            else if (tMouseDownPlace instanceof NodeBoxView) {
                if (tMouseDownPlace.myNode.attributeSplit) {
                    var tName = tMouseDownPlace.myNode.attributeSplit.attName;
                    var tAtt = arbor.getAttributeByName(tName);
                    this.myNode.branchThisNode(tAtt);
                }
            }
        }

        arbor.setFocusNode(this.myNode);

    }.bind(this));

};

/**
 * Event handler for the "changeNode" event
 *
 * @param iEvent
 */
NodeBoxView.prototype.handleNodeChange = function (iEvent) {
    console.log("changeNode event");
    this.calculateNodeBoxViewSize();
    //  this.redrawMe();
};

/**
 * Find the size of an entire NodeBoxView. This includes the "padding" outside the text.
 * Note that that is only in width!
 * The main thing here is to find the maximum lengths of the strings (and icons) we display,
 * in order to find the width.
 *
 * This method sets this.boxDimensions.
 */
NodeBoxView.prototype.calculateNodeBoxViewSize = function () {
    var tPad = arbor.constants.treeObjectPadding;

    //  find the maximum width

    var tMaxWidthStripe = this.stripes.reduce(function (a, v) {
        var vCurrentWidth = v.minimumWidth();
        var aCurrentWidth = a.minimumWidth();

        return (vCurrentWidth > aCurrentWidth) ? v : a;
    });

    var tBoxWidth = tMaxWidthStripe.minimumWidth();


    this.boxDimensions = {
        width: tBoxWidth,
        height: this.kStripeHeight * this.stripes.length
    };
};

NodeBoxView.prototype.redrawMe = function () {

    var tStripe = null;
    this.paper.clear(); //  nothing on this paper
    this.stripes = [];  //  fresh set of stripes

    var tPad = arbor.constants.treeObjectPadding;

    //  The tool tip for the box itself
    this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));

    //  this.paper.circle(100, 60, 50).attr({fill: "cornflowerblue"});

    //  various useful constants

    var tNoCases = (this.myNode.denominator === 0);
    var tParent = this.myNode.parentNode();     //  null if this is the root.
    var tParSplit = this.myNode.parentSplit(tParent);  //  the parent's Split. If root, this is the dependant variable split

    var tDataBackgroundColor = (this.myNode === arbor.focusNode) ? "yellow" : "white";
    if (this.myNode.onTrace) {
        tDataBackgroundColor = arbor.constants.onTraceColor;
    }
    var tDataTextColor = "#474";


    var tText;

    this.makeRootStripe();      //  make root node stripe

    if (tNoCases) {
        tStripe = new Stripe(this, {text: "no cases", textColor: "#696", bgColor: tDataBackgroundColor}, null);
        this.stripes.push(tStripe);
    } else {

        //  data stripes

        if (arbor.state.treeType === "classification") {
            this.makeClassificationDataStripes( {text : tDataTextColor, bg : tDataBackgroundColor });
        } else {    //  this is a regression tree
            this.makeRegressionDataStripes( {text : tDataTextColor, bg : tDataBackgroundColor });
        }

        //  make stripe for the name of the branching variable, if any

        if (this.myNode.branches.length > 0) {
            this.makeBranchingStripe();
        }
    }

    this.calculateNodeBoxViewSize();   //  update the dimensions based on the new text

    var tXPos = 0;  //  left align

    var tArgs = {
        height: this.kStripeHeight,
        width: this.boxDimensions.width,      //  this includes padding
        x: tXPos,
        y: 0
    };

    this.stripes.forEach(function (s) {
        s.resize(tArgs);
        this.paper.append(s.paper);
        tArgs.y += this.kStripeHeight;
    }.bind(this));


    this.paper.attr(this.boxDimensions);

};

NodeBoxView.prototype.makeRootStripe = function () {
    var tText;
    var tStripe = null;

    if (this.isRoot()) {   //  this is a root node

        if (arbor.state.treeType === "classification") {
            tText = "Predict " + arbor.state.dependentVariableSplit.attName + " = " + arbor.state.dependentVariableSplit.leftLabel;
        } else {
            tText = "Predict " + arbor.constants.kMu + "(" + arbor.state.dependentVariableSplit.attName + ")";
        }

        tStripe = new Stripe(
            this,
            {text: tText, textColor: "white", bgColor: arbor.state.dependentVariableSplit.attColor},
            "dependent-variable"
        );
        this.stripes.push(tStripe);
    }
};


NodeBoxView.prototype.makeClassificationDataStripes = function ( iColors ) {
    var tText = "";
    var tStripe = null;
    var tProportion = (this.myNode.denominator === 0) ? "null" : this.myNode.numerator / this.myNode.denominator;

    var tProportionText = (this.myNode.denominator !== 0) ? "p = " + tProportion.newFixed(4) : "n/a";

    if (arbor.options.usePercentages()) {
        tProportionText = (this.myNode.denominator !== 0) ? "(" + (tProportion * 100).toFixed(1) + "%)" : "n/a";
    }


    if (this.myNode.branches.length > 0) {    //  non-terminal, classification tree

        tText = this.myNode.numerator + " of " + this.myNode.denominator + ", " + tProportionText;

        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg },
            "data"
        );
        this.stripes.push(tStripe);

    } else {            //  this is a terminal node, classification tree
        //  data stripe
        tText = this.myNode.numerator + " of " + this.myNode.denominator;

        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

        tText = tProportionText;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg },
            "data"
        );
        this.stripes.push(tStripe);

        //  classification terminal stripe.

        /*
                        var tText = this.myNode.stopSign === "+" ?
                            arbor.state.dependentVariableSplit.leftLabel :
                            arbor.state.dependentVariableSplit.rightLabel;

                        tStripe = new Stripe(
                            this,
                            {
                                text: tText + " (" + this.myNode.stopSign + ")",
                                textColor: "white",
                                bgColor: this.myNode.stopSign === arbor.constants.diagnosisPlus ? "#333" : "#060"
                            },
                            "terminal"
                        );

                        this.stripes.push(tStripe);


        */


    }
};

NodeBoxView.prototype.makeRegressionDataStripes = function ( iColors ) {
    var tText = "";
    var tStripe = null;
    var tMeanText = arbor.state.dependentVariableSplit.isCategorical ?
        "p = " + this.myNode.mean.newFixed(3) :
        arbor.constants.kMu + " = " + this.myNode.mean.newFixed(3);      //  that's unicode "mu"


    if (this.myNode.branches.length > 0) {    //  put all data on one line
        tText = "N = " + this.myNode.denominator + ", " + tMeanText;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);
    } else {
        //  regression, terminal : two lines:
        tText = "N = " + this.myNode.denominator;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

        tText = tMeanText;
        tStripe = new Stripe(
            this,
            {text: tText, textColor: iColors.text , bgColor: iColors.bg},
            "data"
        );
        this.stripes.push(tStripe);

    }

};

NodeBoxView.prototype.makeBranchingStripe = function() {
    var tStripe = new Stripe(
        this,
        {
            text: this.myNode.attributeSplit.attName + "?",
            textColor: "white",
            bgColor: this.myNode.attributeSplit.attColor
        },
        "branching"
    );
    this.stripes.push(tStripe);
};

NodeBoxView.prototype.isRoot = function () {
    return (this.myNode === arbor.state.tree.rootNode);
};


NodeBoxView.prototype.moveTo = function (iWhere) {    //  e.g., {x : 107, y : 8 }, coordinates in its parent, the tree.

    //  set and record the locations as well.
    this.boxDimensions.x = iWhere.x;
    this.boxDimensions.y = iWhere.y;

    this.paper.attr(iWhere);
};

