/*
==========================================================================

 * Created by tim on 11/30/17.
 
 
 ==========================================================================
Leaf in pluginsLocal

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

Leaf = function (iParams) {

    this.myNode = iParams.node;   //  the (model) node we are attached to

    this.paper = new Snap(100, arbor.constants.leafNodeHeight)
        .click(function (e) {
            this.myNode.flipStopType();
        }.bind(this));

    this.bg = this.paper.rect(0, 0, 100, 20, arbor.constants.leafCornerRadius, arbor.constants.leafCornerRadius)
        .attr({  fill: "yellow"});

    this.leafLabel = this.paper.text(arbor.constants.treeObjectPadding, 10, "foo")
        .attr({
            fill: arbor.constants.leafTextColor
        });

};

Leaf.prototype.setText = function (iText) {
    this.leafLabel.attr({"text": iText});
};

Leaf.prototype.refreshLeaf = function () {
    this.setText(this.myNode.getLeafText());      //  e.g., "well (–)"

    this.setLeafColor();        //  set the color for this leaf
    this.setToolTip();

    var tAtts = this.leafDimensions();

    this.paper.attr(tAtts);
    this.bg.attr(tAtts);
    this.leafLabel.attr({
        y: arbor.constants.leafNodeHeight / 2 + tAtts.labelHeight / 2 - 2    //  -2 is a kludge for the font's space
    });

    return tAtts;   //  so a parent view can center us.
};

Leaf.prototype.leafDimensions = function () {
    var labelSize = this.leafLabel.getBBox();
    var leafWidth = labelSize.width + 2 * arbor.constants.treeObjectPadding;

    return {
        width: leafWidth,
        height: arbor.constants.leafNodeHeight,
        labelHeight: labelSize.height
    }

};

Leaf.prototype.setLeafColor = function () {
    var tColor = "gray";
    switch( this.myNode.stopSign ) {
        case arbor.constants.diagnosisPlus:
            tColor = arbor.constants.leafColorPositive;
            break;
        case arbor.constants.diagnosisMinus:
            tColor = arbor.constants.leafColorNegative;
            break;
        default:
            break;
    }
    this.bg.attr({fill: tColor});

};

Leaf.prototype.setToolTip = function() {

    var tText = "";

    switch( this.myNode.stopSign ) {
        case arbor.constants.diagnosisPlus:
            tText = "Your best guess for these cases: " + arbor.state.dependentVariableSplit.branchDescription("L");
            break;
        case arbor.constants.diagnosisMinus:
            tText = "Your best guess for these cases: " + arbor.state.dependentVariableSplit.branchDescription("R");
            break;
        default:
            tText = "You have not assigned a diagnosis yet. Click to assign!"
            break;
    }

    this.paper.append(
        Snap.parse("<title>" + tText + "</title>"));

};
