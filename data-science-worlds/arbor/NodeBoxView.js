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


NodeBoxView = function (iNode, iZoneView) {
    this.myNode = iNode;
    this.myZoneView = iZoneView;        //  the view I am embedded in

    //  We watch this event for changes from the model,
    //  e.g., changes in number or text.
    arbor.eventDispatcher.addEventListener("changeNode", this.handleNodeChange, this);

    var tPad = arbor.constants.treeObjectPadding;
    this.kStripeHeight = 20;

    this.stripes = [];  //  the box is made up of a variable number of "Stripes"

    this.paper = new Snap(133, 133);

    //  the tool tip
    this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));

    //  handlers

    this.paper.mousedown(function (iEvent) {
        this.myZoneView.myPanel.lastMouseDownNodeView = this;
    }.bind(this));

    //  handle mouseUp events in the NodeBoxView

    this.paper.mouseup(function (iEvent) {

        const tMouseDownPlace = arbor.corralView.lastMouseDownNodeView;

        if (tMouseDownPlace) {
            if (this === tMouseDownPlace) {     //  it's a click
                if (iEvent.shiftKey || iEvent.altKey || iEvent.ctrlKey) {
                    this.myNode.stubThisNode();
                }
            }
            //  it's not a click, we've dragged in from somewhere else...

            //  dragged in from the corral, so we branch the node by that attribute
            else if (tMouseDownPlace instanceof CorralAttView) {
                console.log("Dragged into " + this.myNode + " from " + tMouseDownPlace.labelText);
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
    this.getNodeBoxViewSize();
    //  this.redrawNodeBoxView();
};

/**
 * Find the size of an entire NodeBoxView. This includes the "padding" outside the text.
 * Note that that is only in width!
 * The main thing here is to find the maximum lengths of the strings (and icons) we display,
 * in order to find the width.
 *
 */
NodeBoxView.prototype.getNodeBoxViewSize = function () {

    console.log("Get size for box id: "
        + this.myNode.arborNodeID + " w: "
        + this.paper.attr("width") + " h: "
        + this.paper.attr("height"));
    return {
        width : this.paper.attr("width"),
        height : this.paper.attr("height")
    };
};

NodeBoxView.prototype.adjustPaperSize = function() {

    //  find the maximum width of the stripes

    var tMaxWidthStripe = this.stripes.reduce(function (a, v) {
        var vCurrentWidth = v.minimumWidth();
        var aCurrentWidth = a.minimumWidth();

        return (vCurrentWidth > aCurrentWidth) ? v : a;
    });

    this.paper.attr({
        height : this.kStripeHeight * this.stripes.length,
        width : tMaxWidthStripe.minimumWidth()
    });
};

NodeBoxView.prototype.redrawNodeBoxView = function () {

    //      console.log("Redraw node box: " + this.myNode.arborNodeID);
    let tStripe = null;
    this.paper.clear(); //  nothing on this paper
    this.stripes = [];  //  fresh set of stripes

    //  The tool tip for the box itself
    this.paper.append(Snap.parse("<title>" + this.myNode.longDescription() + "</title>"));

    //  various useful constants

    const tNoCases = (this.myNode.denominator === 0);
    const tParent = this.myNode.parentNode();     //  null if this is the root.
    const tParSplit = this.myNode.parentSplit(tParent);  //  the parent's Split. If root, this is the dependant variable split

    let tDataBackgroundColor = (this.myNode === arbor.focusNode) ? "yellow" : "white";
    if (this.myNode.onTrace) {
        tDataBackgroundColor = arbor.constants.onTraceColor;
    }
    const tDataTextColor = "#474";

    let tText;

    this.makeRootStripe();      //  make root node stripe

    if (tNoCases) {
        const tStripe = new Stripe(this, {text: "no cases", textColor: "#696", bgColor: tDataBackgroundColor}, null);
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

    this.adjustPaperSize();   //  update this.paper's dimensions based on the new text in stripes

    const tArgs = {
        height: this.kStripeHeight,
        width: this.paper.attr("width"),      //  this includes padding
        x: 0,
        y: 0
    };

    this.stripes.forEach(function (s) {
        s.resizeStripe(tArgs);
        this.paper.append(s.paper);
        tArgs.y += this.kStripeHeight;
    }.bind(this));

    return ({
        width : Number(this.paper.attr("width")),
        height : Number(this.paper.attr("height"))
    })
};

NodeBoxView.prototype.makeRootStripe = function () {
    var tText;

    if (this.isRoot()) {   //  this is a root node

        if (arbor.state.treeType === "classification") {
            tText = "Predict " + arbor.state.dependentVariableSplit.attName + " = " + arbor.state.dependentVariableSplit.leftLabel;
        } else {
            tText = "Predict " + arbor.constants.kMu + "(" + arbor.state.dependentVariableSplit.attName + ")";
        }

        const tStripe = new Stripe(
            this,
            {text: tText, textColor: "white", bgColor: arbor.state.dependentVariableSplit.attColor},
            "dependent-variable"
        );
        this.stripes.push(tStripe);
    }
};


NodeBoxView.prototype.makeClassificationDataStripes = function ( iColors ) {
    let tText = "";
    let tProportion = (this.myNode.denominator === 0) ? "null" : this.myNode.numerator / this.myNode.denominator;
    let tStripe = null;
    let tProportionText = (this.myNode.denominator !== 0) ? "p = " + tProportion.newFixed(4) : "n/a";

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

    }
};

NodeBoxView.prototype.makeRegressionDataStripes = function ( iColors ) {
    let tText = "";
    let tStripe = null;
    let tMeanText = arbor.state.dependentVariableSplit.isCategorical ?
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


