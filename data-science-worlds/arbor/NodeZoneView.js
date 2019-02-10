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
 * Every NodeZoneView has ONE node and (optionally) TWO subtrees (in array this.subNodeZones).
 *
 * @param iNode     the root node (model) of this zoneView
 * @param iParent   the parent zoneView (view) of this zoneView. If this is the top one, the parent is the TreePanelView
 * @constructor
 */
NodeZoneView = function (iNode, iParent) {
    this.myNode = iNode;        //  model
    this.nodeBoxLocation = {x: 0, y: 0};   //  x, y, width, height, xc, yc ... for the NodeBoxView

    this.myPanel = iParent.myPanel; //  is the panel for the root view, everybody gets this from the TreePanelView.
    //  this.myParentZoneView = iParent;
    this.myLocation = {x: 0, y: 0};   //      my coordinates in the parent view. Possibly redundant. Set in moveTo().

    //  make the subNodeZones.
    this.subNodeZones = [];     //  begin empty.

    if (this.myParentZoneView === this.myPanel) {
        this.myParentZoneView = null;       //      we are the top NodeZoneView
    }

    this.paper = Snap(100, 100);  // to be reset

    this.myBoxView = new NodeBoxView(iNode, this);  //  create, not draw

    this.leaf = (this.myNode.branches.length === 0 && arbor.options.showLeaves()) ? new Leaf({node: this.myNode}) : null;          //  our leaf

    //  this.myPanel.nodeSet.push(this.myBoxView.paper);

    this.myNode.branches.forEach(function (iChildNode) {
        //  makes a view of a subtree, as a NodeZoneView. Create, not draw!
        this.subNodeZones.push(new NodeZoneView(iChildNode, this));        //  we're maintaining the view tree
    }.bind(this))
};

NodeZoneView.prototype.moveTo = function (iLoc) {
    this.myLocation = iLoc;
    this.paper.attr(iLoc);
};

/**
 * Calculate the width and height of this NodeZoneView, including its "padding"
 *
 * @returns {*}
 */
NodeZoneView.prototype.calculateZoneSize = function () {

    /*
        if (this.zoneViewDimensions.width !== 0) {    //  since we're recursive, we may already have calculated this.
            return this.zoneViewDimensions;
        }
    */

    const tPad = arbor.constants.treeObjectPadding;
    let out = {
        width: 0,    //  left and right edges
        height: 0    //  top and bottom
    };

    const tNodeContentsSize = this.myBoxView.boxDimensions;    //  has {width: www; height: hhh}

    out.height = tNodeContentsSize.height;
    out.width = tNodeContentsSize.width;

    /**
     * The recursion happens here...first if we're a "leaf," add the overall leaf size.
     */
    if (this.subNodeZones.length === 0) {
        //  out.width += tNodeContentsSize.width;

        if (arbor.options.showLeaves()) {
            out.height += tPad + arbor.constants.leafNodeHeight;
            const tLeafDimensions = this.leaf.refreshLeaf();
            if (tLeafDimensions.width > out.width) {
                out.width = tLeafDimensions.width
            }
        }
    } else {
        let tMaxBranchHeight = 0;
        this.subNodeZones.forEach(function (iSubZone) {
            const tTreeSize = iSubZone.calculateZoneSize();
            out.width += tTreeSize.width;    //  add width of each branch
            tMaxBranchHeight = tTreeSize.height > tMaxBranchHeight ? tTreeSize.height : tMaxBranchHeight;
        });
        out.height += tMaxBranchHeight + tPad + arbor.constants.treeLineLabelHeight;
        out.width += tPad;  //  the ONE space between the branches
    }


    out.height += tPad;     //  extra space only at the bottom
    return out;
};

NodeZoneView.prototype.adjustZonePaperSize = function () {

};

/**
 * Redraw this entire "Zone", recursively creating subNodeZones and asking them to redraw.
 * Everything is drawn in the coordinates of this Zone.
 *
 * Note: Recursive. We use this very routine to draw subZones.
 *
 * @param iLoc   object with x, y. Coordinates of x, y in parent's system
 */
NodeZoneView.prototype.redrawEntireZone = function (iLoc) {  //  object with x, y

    let currentTotalHeight = 0;   //  we will accumulate these as we add elements
    let currentTotalWidth = 0;

    this.paper.attr(iLoc);      //  in the coordinates of the parent
    this.paper.clear();
    //  this.background = this.paper.rect().attr({fill:"yellow"});    //  we will resize this of course

    //  calculate various dimensions we need for drawing

    //  let tLeftX = inThisSpace.x;

    const boxSize = this.myBoxView.redrawNodeBoxView();         //  this NodeBoxView was created in the constructor; this call adjusts its size
    this.paper.append(this.myBoxView.paper);    //  attach it, but it's not yet in the right place.
    //  we need to know the width of this entire ZoneView in order to place the NodeBoxView.

    currentTotalHeight = boxSize.height;
    currentTotalWidth = boxSize.width;

    //  in addition to the node itself, you need subNodeZones

    tCurrentX = 0;
    tCurrentY = currentTotalHeight;

    switch (this.myNode.branches.length) {
        case 2:
            tCurrentY += arbor.constants.treeLineLabelHeight + tPad;    //  top of subZoneViews

            this.subNodeZones.forEach(function (iSubZoneView) {
                this.paper.append(iSubZoneView.paper);
                const zoneSize = iSubZoneView.redrawEntireZone({x: tCurrentX, y: tCurrentY});   //  now they have good widths
                currentTotalHeight = (tCurrentY + zoneSize.height > currentTotalHeight)
                    ? tCurrentY + zoneSize.height : currentTotalHeight;
                currentTotalWidth = (tCurrentX + zoneSize.width > currentTotalWidth)
                    ? tCurrentX + zoneSize.width : currentTotalWidth;

                tCurrentX += zoneSize.width + arbor.constants.treeObjectPadding;
            }.bind(this));

            break;

        case 0:     //  update and position the leaf
            tCurrentY +=  arbor.constants.treeObjectPadding;     //  top of leaf

            if (arbor.options.showLeaves()) {
                this.paper.append(this.leaf.paper);
                const tLeafDimensions = this.leaf.refreshLeaf();
                //  todo: make a leaf move-to method
                this.leaf.paper.attr({
                    x: currentTotalWidth / 2 - tLeafDimensions.width / 2,
                    y: tCurrentY
                });
                currentTotalHeight = tCurrentY + tLeafDimensions.height;   //  todo: need padding??
            }
            break;
    }

    //  Those contents limit the extent of this zone view; we resize our paper

    this.paper.attr({
        "height" : currentTotalHeight,
        "width" : currentTotalWidth
    });

    //  Draw line from our root nodeView up to parent if it exists.

/*
    if (this.myParentZoneView) {    //  we are not the top treeView in the hierarchy
        const tParentNodeBoxLoc = this.myParentZoneView.nodeBoxLocation;

        const tLine = this.paper.line(
            this.nodeBoxLocation.xc, this.nodeBoxLocation.yc, tParentNodeBoxLoc.xc, tParentNodeBoxLoc.yc).attr({
            strokeWidth: 10,
            stroke: (this.myNode.onTrace ? arbor.constants.onTraceColor : "white")
        });

        const tText = this.paper.text(0, 0, this.myNode.relevantParentSplitLabel);

        const tTX = this.nodeBoxLocation.xc - tText.getBBox().width / 2;
        const tTY = this.nodeBoxLocation.yc - 10;
        tText.attr({x: tTX, y: tTY});


        const theLineGroup = this.paper.g(tLine, tText);
        const tBranchDescription = this.myNode.parentNode().attributeSplit.branchDescription(this.myNode.LoR);

        theLineGroup.append(Snap.parse("<title>" + tBranchDescription + "</title>"));

        this.myPanel.lineSet.push(theLineGroup);

    }

*/

    //  center the node box at the top of this NodeZoneView

    const nodeBoxX = this.paper.attr("width") / 2 - boxSize.width / 2;
    this.myBoxView.paper.attr({ x : nodeBoxX });

    return ({
        width: Number(this.paper.attr("width")),
        height: Number(this.paper.attr("height"))
    })

};

