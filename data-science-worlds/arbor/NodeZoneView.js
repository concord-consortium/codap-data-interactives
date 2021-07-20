/**
 * Created by tim on 9/26/16.


 ==========================================================================
 NodeZoneView.js in Baum.

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
 * A NodeZoneView is the rectangular area the nodes appear in.
 * a NodeBoxView is the image for the node itself.
 *
 * NOTE that the NodeBoxView gets redrawn in the constructor.
 *
 * Every tree has ONE node and (optionally) TWO subtrees (in array this.subNodeZones).
 *
 * @param iNode     the root node (model) of this zoneView
 * @param iParent   the parent zoneView (view) of this zoneView
 * @constructor
 */
NodeZoneView = function (iNode, iParent) {
    this.myNode = iNode;

    this.myPanel = iParent.myPanel; //  is the panel for the root view, everybody gets this from me.
    this.myParentZoneView = iParent;

    //  make the subNodeZones.
    this.subNodeZones = [];     //  begin empty.

    if (this.myParentZoneView === this.myPanel) {
        this.myParentZoneView = null;       //      we are the top tree
    }

    this.nodeBoxLocation = {};   //  x, y, width, height, xc, yc ...
    this.paper = this.myPanel.rootPaper;        //     points to the TreePanelView's "rootPaper"    // was     Snap(5, 5);        //  tiny, but it exists
    this.zoneViewDimensions = {width: 0, height: 0};

    this.background = this.paper.rect().attr({fill:"yellow"});    //  we will resize this of course

    //  make this ZoneView's "root" nodeView

    this.myBoxView = new NodeBoxView(iNode, this);
    this.myBoxView.redrawMe();
    this.paper.append(this.myBoxView.paper);

    this.leaf = (this.myNode.branches.length === 0 && arbor.options.showLeaves()) ? new Leaf({node: this.myNode}) : null;          //  our leaf

    //  push this zone into the set of nodeZoneViews in the ur-parent Panel

    this.myPanel.nodeSet.push(this.myBoxView.paper);

    this.myNode.branches.forEach(function (iChildNode) {
        var tTreeView = new NodeZoneView(iChildNode, this); //  makes a view of a subtree, as a NodeZoneView
        this.subNodeZones.push(tTreeView);        //  we're maintaining the view tree
    }.bind(this))
};


/**
 * Calculate the width and height of this NodeZoneView, including its "padding"
 *
 * @returns {*}
 */
NodeZoneView.prototype.calculateZoneSize = function () {

    if (this.zoneViewDimensions.width !== 0) {    //  since we're recursive, we may already have calculated this.
        return this.zoneViewDimensions;
    }

    var tPad = arbor.constants.treeObjectPadding;
    var out = {
        width: 2 * tPad,    //  left and right edges
        height: 2 * tPad    //  top and bottom
    };

    var tNodeContentsSize = this.myBoxView.boxDimensions;    //  has {width: www; height: hhh}

    out.height += tNodeContentsSize.height;

    /**
     * The recursion happens here...first if we're a "leaf," add the overall leaf size.
     */
    if (this.subNodeZones.length === 0) {
        out.width += tNodeContentsSize.width;
        if (arbor.options.showLeaves()) {
            out.height += tPad + arbor.constants.leafNodeHeight;
            var tLeafDimensions = this.leaf.refreshLeaf();
            if (tLeafDimensions.width > out.width) {
                out.width = tLeafDimensions.width
            }
        }
    } else {
        var tMaxBranchHeight = 0;
        this.subNodeZones.forEach(function (iSubZone) {
            var tTreeSize = iSubZone.calculateZoneSize();
            out.width += tTreeSize.width;    //  add width of each branch
            tMaxBranchHeight = tTreeSize.height > tMaxBranchHeight ? tTreeSize.height : tMaxBranchHeight;
        });
        out.height += tPad + tMaxBranchHeight;
        out.width += tPad;  //  the space between the branches
    }

    return out;
};

/**
 * Redraw this entire "Zone", recursively creating subNodeZones and asking them to redraw.
 * Everything is drawn in the coordinates of this Zone.
 *
 * Note: Recursive. We use this very routine to draw subZones.
 *
 * @param inThisSpace   object with x, y, width, height.
 */
NodeZoneView.prototype.redrawEntireZone = function (inThisSpace) {  //  object with x, y, width, height

    //  this.paper.clear();
    this.background = this.paper.rect().attr({fill:"yellow"});    //  we will resize this of course

    //  calculate various dimensions we need for drawing

    var tLeftX = inThisSpace.x;

    var tPad = arbor.constants.treeObjectPadding;
    this.zoneViewDimensions = this.calculateZoneSize();         //  can do this since the subNodeZones exist now
    var tCurrentY = inThisSpace.y;

    //  set up important members

    this.nodeBoxLocation = this.myBoxView.boxDimensions;   //  sets height and width
    this.nodeBoxLocation.x = tLeftX + (this.zoneViewDimensions.width / 2 - this.nodeBoxLocation.width / 2);
    this.nodeBoxLocation.y = tCurrentY;
    this.nodeBoxLocation.xc = this.nodeBoxLocation.x + this.nodeBoxLocation.width / 2;
    this.nodeBoxLocation.yc = this.nodeBoxLocation.y + arbor.constants.connectorLineLowerOffset;

    //  move the node to where it belongs

    this.myBoxView.moveTo(this.nodeBoxLocation);

    //  in addition to the node itself, you need subNodeZones

    switch (this.myNode.branches.length) {
        case 2:
            tCurrentY += this.nodeBoxLocation.height + tPad + arbor.constants.treeLineLabelHeight;

            var tCurrentX = tLeftX + tPad;  //  start on the left edge of the first subtree

            this.subNodeZones.forEach(function (iSubZoneView) {
                var tSizeOfThisSubZone = iSubZoneView.calculateZoneSize();
                var tSpace = {
                    x: tCurrentX,
                    y: tCurrentY,
                    width: tSizeOfThisSubZone.width,
                    height: this.zoneViewDimensions.height - (tCurrentY) + tPad
                };

                iSubZoneView.redrawEntireZone(tSpace);       //  includes the node view

                tCurrentX += tPad + tSizeOfThisSubZone.width;

            }.bind(this));

            break;

        case 0:     //  update and position the leaf
            if (arbor.options.showLeaves()) {
                tCurrentY += this.nodeBoxLocation.height + tPad;
                this.paper.append(this.leaf.paper);
                var tLeafDimensions = this.leaf.refreshLeaf();
                this.leaf.paper.attr({
                    x: tLeftX + (this.zoneViewDimensions.width / 2 - tLeafDimensions.width / 2),
                    y: tCurrentY
                });
            }
            break;

    }

    //  Draw line from our root nodeView up to parent if it exists.

    if (this.myParentZoneView) {    //  we are not the top treeView in the hierarchy
        var tParentNodeBoxLoc = this.myParentZoneView.nodeBoxLocation;

        var tLine = this.paper.line(
            this.nodeBoxLocation.xc, this.nodeBoxLocation.yc, tParentNodeBoxLoc.xc, tParentNodeBoxLoc.yc).attr({
            strokeWidth: 10,
            stroke: (this.myNode.onTrace ? arbor.constants.onTraceColor : "white")
        });

        var tVerticalCenters = (this.nodeBoxLocation.yc - tParentNodeBoxLoc.yc);
        var tVerticalGapBetweenBoxes = tVerticalCenters - this.nodeBoxLocation.height/2 - tParentNodeBoxLoc.height/2;
        var tVerticalCenterOfLabel = tParentNodeBoxLoc.height/2 + tVerticalGapBetweenBoxes/2;

        var tTextFudge = tVerticalCenterOfLabel / tVerticalCenters;  //  adjusts the vertical position of the label

        var tText = this.paper.text(0, 0, this.myNode.relevantParentSplitLabel);

        //  var tTX = (tTextFudge) * this.nodeBoxLocation.xc + (1 - tTextFudge) * tParentNodeBoxLoc.xc - tText.getBBox().width / 2;
        var tTX = this.nodeBoxLocation.xc - tText.getBBox().width / 2;
        var tTY = this.nodeBoxLocation.yc - 10; //(tTextFudge) * this.nodeBoxLocation.yc + (1 - tTextFudge) * tParentNodeBoxLoc.yc + tText.getBBox().height / 2;
        tText.attr({x: tTX, y: tTY });


        var theLineGroup = this.paper.g(tLine, tText);
        var tBranchDescription = this.myNode.parentNode().attributeSplit.branchDescription(this.myNode.LoR);

        theLineGroup.append(Snap.parse("<title>" + tBranchDescription + "</title>"));

        this.myPanel.lineSet.push(theLineGroup);

    }

};

