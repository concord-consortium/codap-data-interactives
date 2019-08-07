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
    //  this.subNodeZones = [];     //  begin empty.

    if (this.myParentZoneView === this.myPanel) {
        this.myParentZoneView = null;       //      we are the top NodeZoneView
    }

    this.paper = Snap(100, 100).attr({"id" : "initial-NZV-" + iNode.arborNodeID});  // to be reset

    //  this.myBoxView = new NodeBoxView(this.myNode, this);  //  create, not draw

    //  this.leaf = (this.myNode.branches.length === 0 && arbor.options.showLeaves()) ? new Leaf({node: this.myNode}) : null;          //  our leaf

    //  this.myPanel.nodeSet.push(this.myBoxView.paper);

    this.myNode.branches.forEach(function (iBranchZone) {
        //  makes a view of a subtree, as a NodeZoneView. Create, not draw!
        const tSubZoneView = new NodeZoneView(iBranchZone, this);
        this.paper.append(tSubZoneView.paper);
        //  this.subNodeZones.push(tSubZoneView);        //  we're maintaining the view tree
    }.bind(this));

    this.redrawEntireZone();
};

NodeZoneView.prototype.moveTo = function (iLoc) {
    this.myLocation = iLoc;
    this.paper.attr(iLoc);
};


/**
 * Redraw this entire "Zone", recursively creating subNodeZones and asking them to redraw.
 * Everything is drawn in the coordinates of this Zone.
 *
 * Note: Recursive. We use this very routine to draw subZones.
 *
 * @param iLoc   object with x, y. Coordinates of x, y in parent's system
 */
NodeZoneView.prototype.redrawEntireZone = function ( ) {  //  object with x, y

    let currentTotalHeight = 0;   //  we will accumulate these as we add elements
    let currentTotalWidth = 0;
    let tCurrentX = 0;
    let tCurrentY = 0;

    this.paper.attr({"id" : this.myNode.LoR + "-NodeZV-" + this.myNode.arborNodeID});      //  in the coordinates of the parent
    this.paper.clear();

    this.myBoxView = new NodeBoxView(this.myNode, this);  //  create, not draw
    this.leaf = (this.myNode.branches.length === 0 && arbor.options.showLeaves()) ? new Leaf({node: this.myNode}) : null;          //  our leaf

    const boxPaper = this.myBoxView.paper;         //  this NodeBoxView was created in the constructor; this call adjusts its size
    this.paper.append(boxPaper);    //  attach it, but it's not yet in the right place.

    //  we need to know the width of this entire ZoneView in order to place the NodeBoxView.
    currentTotalHeight = Number(boxPaper.attr("height"));
    currentTotalWidth = Number(boxPaper.attr("width"));
    let topsOfSubZoneBoxes = {};

    //  in addition to the node itself, you need subNodeZones

    tCurrentX = 0;
    tCurrentY = currentTotalHeight;

    switch (this.myNode.branches.length) {
        case 2:
            tCurrentY += arbor.constants.treeLineLabelHeight + arbor.constants.treeObjectPadding;    //  top of subZoneViews

            this.myNode.branches.forEach(function (iBranch) {
                const tSubZoneView = new NodeZoneView( iBranch, this );
                this.paper.append(tSubZoneView.paper);

                const subZoneSize = tSubZoneView.getZoneViewSize();   //  now they have good widths
                currentTotalHeight = (tCurrentY + subZoneSize.height > currentTotalHeight)
                    ? tCurrentY + subZoneSize.height : currentTotalHeight;
                currentTotalWidth = (tCurrentX + subZoneSize.width > currentTotalWidth)
                    ? tCurrentX + subZoneSize.width : currentTotalWidth;

                tSubZoneView.paper.attr({
                    x : tCurrentX,
                    y : tCurrentY,
                    id : "NodeZV-for-Node-" + iBranch.arborNodeID
                });

                topsOfSubZoneBoxes[iBranch.LoR] = { x : tCurrentX + subZoneSize.width / 2, y : tCurrentY}; //  centered on top of new zone;

                tCurrentX += subZoneSize.width + arbor.constants.treeObjectPadding;
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

    //  center the node box at the top of this NodeZoneView

    const nodeBoxX = Number(this.paper.attr("width")) / 2 - Number(boxPaper.attr("width")) / 2;
    this.myBoxView.paper.attr({ x : nodeBoxX });

    //  add the lines and text

    this.myNode.branches.forEach(b => {
        const x1 = nodeBoxX + ((b.LoR === "L") ?
            Number(boxPaper.attr("width")) / 3 :
            2 * Number(boxPaper.attr("width")) / 3);
        const y1 = Number(boxPaper.attr("height"));
        const x2 = topsOfSubZoneBoxes[b.LoR].x;
        const y2 = topsOfSubZoneBoxes[b.LoR].y;

        const aLine = this.paper.line(x1, y1 - 8, x2, y2 + 8).attr({
            strokeWidth: 10,
            stroke: (b.onTrace ? arbor.constants.onTraceColor : "white")
        });

        const maskRect = this.paper.rect(0, Number(boxPaper.attr("height")), arbor.windowWidth, y2 - y1).attr({fill : "#fff"});
        const tText = this.paper.text(x2, y2 - 4, b.relevantParentSplitLabel);
        const newTextHalfWidth = tText.getBBox().width / 2;
        tText.attr({ x : x2 - newTextHalfWidth});

        const theLineGroup = this.paper.g(aLine, tText).attr({ mask : maskRect });

        const tBranchDescription = this.myNode.attributeSplit.branchDescription(b.LoR);
        theLineGroup.append(Snap.parse("<title>" + tBranchDescription + "</title>"));

    });

};

NodeZoneView.prototype.getZoneViewSize = function() {
    return ({
        width: Number(this.paper.attr("width")),
        height: Number(this.paper.attr("height"))
    })
};