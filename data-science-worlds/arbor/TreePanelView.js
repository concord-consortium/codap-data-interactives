/**
 * Created by tim on 9/26/16.


 ==========================================================================
 TreeView.js in make-a-tree.

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
 * This is a view that contains ALL of the views of the arbor display.
 * That is, it has
 *
 *      * a NodeZoneView (for the tree itself)
 *      * the corral
 **
 * @param iTreePanelDOMName, iCorralDOMName  the ID in the html for this region in the DOM
 * @constructor
 */
TreePanelView = function ( ) {
    this.myPanel = this;            //  we are the top of the hierarchy
    this.lastMouseDownNodeView = null;
    this.dependentVariableView = null;      //      this is a CorralAttView, one of the corralAttViews[]
    this.rootNodeZoneView = null;           //      the top NodeZoneView for this tree


    /**
     * The paper for the entire TreePanelView.
     * @type {*|*|*|*|*}
     */
    this.panelPaper = new Snap(document.getElementById(arbor.constants.kTreePanelDOMName));

    //  create (but do not draw) the root NodeZoneView.

    this.rootNodeZoneView = new NodeZoneView(arbor.state.tree.rootNode, this);

    this.treeBackground = this.panelPaper
        .rect(0, 0, 10, 10)
        .attr({"fill" : arbor.constants.panelBackgroundColor, "id" : "treeBackground"});     //      will be a rectangle for the background

    this.draggingAttribute = null;
    this.dragSVGPaper = Snap(10, 10);

    this.panelPaper.mouseup(function (e) {
        this.dragSVGPaper.remove();     //  remove it from the DOM
    }.bind(this));
};


TreePanelView.prototype.createDragSVGPaper = function (iAttInBaum, iWhere) {
    var tLabelHeight = arbor.constants.nodeHeightInCorral;
    var tLabel = iAttInBaum.attributeName;
    var tPaper = Snap(20, tLabelHeight).attr({x: iWhere.x, y: iWhere.y});
    var tBG = tPaper.rect(0, 0, 20, tLabelHeight).attr({fill: "#cde"});

    var tTX = tPaper.text(0, 0, tLabel);
    var tBBox = tTX.getBBox();

    var tGap = (tLabelHeight - tBBox.height) / 2;

    tPaper.attr({width: tBBox.width + 2 * tGap});
    tBG.attr({width: tPaper.attr("width")});
    tTX.attr({
        x: tGap,
        y: tLabelHeight - tGap
    });

    tPaper.drag(this.doDrag, null, null, this, this, this);

    return tPaper;
};


/**
 * redraws the tree in the view GIVEN a completely updated set of model data (Trees, Nodes, AttInBaums)
 */
TreePanelView.prototype.redrawEntirePanel = function (  ) {

    this.panelPaper.clear();
    this.treeBackground = this.panelPaper.rect().attr({fill : arbor.constants.panelBackgroundColor});

    const tPad = arbor.constants.treeObjectPadding;
    console.log("Redrawing TreePanelView to " + Math.round(arbor.windowWidth) + " px");

    if (arbor.state.tree) {    //  if not, there is no root node, and we display only the background

        const rootZoneSize = this.rootNodeZoneView.redrawEntireZone({x : 0, y: 0} ); //  draw; not yet positioned.
        this.panelPaper.append(this.rootNodeZoneView.paper);

        /**
         * Note that the next call is to a NodeZoneView, NOT the TreePanelView.
         * In particular, this is the main NodeZoneView, the "root" view, if you will.
         */
        this.rootNodeZoneView.redrawEntireZone({
            x: arbor.windowWidth / 2 - rootZoneSize.width / 2,
            y: tPad
        });

        this.treeBackground.attr({height: rootZoneSize.height, id : "tree-background-rect"});

        arbor.displayResults(arbor.state.tree.resultString());    //  strip at the bottom

        //  this.refreshCorral(rootZoneSize.height);

        //  resize the panel

/*
        var tViewWidth = rootZoneSize.width + 2 * tPad;
        if (tViewWidth < arbor.windowWidth) tViewWidth = arbor.windowWidth;
*/
        var tViewHeight = rootZoneSize.height + 2 * tPad;   //  in the panel view, yes, above and below,

        this.panelPaper.attr({
            width: arbor.windowWidth,
            height: tViewHeight
        });

        this.treeBackground.attr({
            width: arbor.windowWidth,
            height: tViewHeight
        });

    } else {

    }

};

TreePanelView.prototype.startDrag = function (iAtt, paper, event) {
    this.draggingAttribute = iAtt;
    var tWhere = {x: event.offsetX, y: event.offsetY};
    this.dragSVGPaper = this.createDragSVGPaper(this.draggingAttribute, tWhere);
    this.panelPaper.append(this.dragSVGPaper);

};

TreePanelView.prototype.stopDrag = function (paper, event) {
    console.log("stopDrag " + event.offsetX + " " + event.offsetY);
    this.draggingAttribute = null;
    this.dragSVGPaper.undrag();
    this.dragSVGPaper.clear();
    this.dragSVGPaper = null;
};

TreePanelView.prototype.doDrag = function (dx, dy, x, y, event) {
    var tWhere = {x: event.offsetX, y: event.offsetY};
    this.dragSVGPaper.attr(tWhere);

 //   console.log("doDrag " + event.offsetX + " " + event.offsetY);
};