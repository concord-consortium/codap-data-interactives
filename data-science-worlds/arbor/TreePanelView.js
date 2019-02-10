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
 * @param iDOMName  the ID in the html for this region in the DOM
 * @constructor
 */
TreePanelView = function (iDOMName) {
    this.myPanel = this;            //  we are the top of the hierarchy
    this.w = 200;
    this.h = 200;
    this.lastMouseDownNodeView = null;
    this.dependentVariableView = null;      //      this is a CorralAttView, one of the corralViews[]
    this.rootNodeZoneView = null;           //      the top NodeZoneView for this tree

    this.corralViews = [];

    this.corralHeight = arbor.constants.corralHeight;

    /**
     * The paper for the entire TreePanelView.
     * @type {*|*|*|*|*}
     */
    this.panelPaper = new Snap(document.getElementById(iDOMName));

    //  create (but do not draw) the root NodeZoneView.

    this.rootNodeZoneView = new NodeZoneView(arbor.state.tree.rootNode, this);

    //  Okay, so the "corral" is just a region (not a paper) with this background rectangle:

    this.corralBackgroundRect = this.panelPaper.rect(0, 0, 100, this.corralHeight).attr(
        {fill: arbor.constants.corralBackgroundColor}
    );

    this.treeBackground = this.panelPaper
        .rect(0, 0, this.panelPaper.attr("width"), this.panelPaper.attr("height"))
        .attr({"fill" : "yellow", "id" : "treeBackground"});     //      will be a rectangle for the background

    this.equalsSignText = this.panelPaper.text(0, 0, arbor.constants.leftArrowCode).attr({fill: "white", fontSize: 20});

    this.draggingAttribute = null;
    this.dragSVGPaper = Snap(10, 10);

    this.setUpToDrawTreePanelView();

    this.panelPaper.mouseup(function (e) {
        this.dragSVGPaper.remove();     //  remove it from the DOM
    }.bind(this));
};

TreePanelView.prototype.setUpToDrawTreePanelView = function () {

    this.panelPaper.attr({
        width: window.innerWidth,
        height: window.innerHeight
    });

    this.w = Number(this.panelPaper.attr("width")) - 44;
    this.h = Number(this.panelPaper.attr("height"));

    //  console.log("Setting up. Window width is " + window.innerWidth);

    //  the corralBackgroundRect contains the attribute names (CorralAttViews)
    //  this is just drawn, not created as a paper

    this.corralBackgroundRect.attr({width: this.w});
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


TreePanelView.prototype.freshTreeView = function () {

    this.addAllAttributesToTreePanelView(arbor.attsInBaum);    //  this puts the CorralAttViews in the Corral.
    if (!arbor.state.dependentVariableName) {
        arbor.setDependentVariableByName(this.corralViews[0].labelText); //  just fix the model
    }

    //  this.redrawEntirePanel();
};

/**
 *
 * @param iAttList  a list of AttInBaum
 */
TreePanelView.prototype.addAllAttributesToTreePanelView = function (iAttList) {

    iAttList.forEach(function (a) {
        this.addAttributeToCorral(a);
    }.bind(this));
};

/**
 *
 * @param iAttribute    the attInBaum
 */
TreePanelView.prototype.addAttributeToCorral = function (iAttribute) {
    var tCorralAttView = new CorralAttView(iAttribute, this);
    this.panelPaper.append(tCorralAttView.paper);   //  subviews of paper, not corral itself
    this.corralViews.push(tCorralAttView);
};

TreePanelView.prototype.refreshCorral = function (iStartingY) {

    //  pick the dependent variable from the model
    const tDependentVariableName = arbor.state.dependentVariableSplit.attName;
    this.dependentVariableView = this.corralViews.reduce(
        function (acc, val) {
            return ((tDependentVariableName === val.attInBaum.attributeName) ? val : acc);
        });

    this.corralViews.forEach(function (corV) {
        corV.setLabelTextAndSize();
    });

    const tPad = arbor.constants.treeObjectPadding;
    let x = tPad;
    let tCorralY = iStartingY + tPad;

    //  display the dependent variable first

    if (this.dependentVariableView) {
        this.dependentVariableView.moveTo(x, tCorralY);
        x += this.dependentVariableView.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width

        this.equalsSignText.animate({x: x, y: tCorralY + 15}, 500);
        x += this.equalsSignText.getBBox().width + tPad;

        //  then loop over the others

        const tIndentation = x;   //  to the right of the equals sign, we indent the atts to here.

        this.corralHeight = arbor.constants.corralHeight;

        this.corralViews.forEach(function (corV) {
            if (corV !== this.dependentVariableView) {      //  except for the dependent one
                corV.moveTo(x, tCorralY);
                const tPaperWidth = Number(this.panelPaper.attr("width"));
                const tAttributeWidth = corV.label.getBBox().width + 2 * tPad;
                x += tAttributeWidth + tPad; //  should be able to set and use the paper's width
                if (x > tPaperWidth - tAttributeWidth) {
                    x = tIndentation;
                    const tYIncrement = arbor.constants.nodeHeightInCorral + tPad;
                    tCorralY += tYIncrement;
                    this.corralHeight += tYIncrement;
                    //  this.corralBackgroundRect.attr({height: this.corralHeight});
                    this.setUpToDrawTreePanelView();
                    //  console.log("corral height now " + this.corralHeight);
                }
            }
        }.bind(this));
    }

    this.corralBackgroundRect.attr({
        y: iStartingY,
        height: this.corralHeight
    });

    // this.corralMinimumWidth = (this.corralMinimumWidth > x) ? this.corralMinimumWidth : x;
};

/**
 * Where was the last place the mouse went down?
 * i.e., where are we dragging FROM?
 *
 * @param iCorralView
 */
TreePanelView.prototype.setLastMouseDownNodeView = function (iCorralView) {
    if (iCorralView !== this.dependentVariableView) {
        this.lastMouseDownNodeView = iCorralView;
    }
};

/**
 * redraws the tree in the view GIVEN a completely updated set of model data (Trees, Nodes, AttInBaums)
 */
TreePanelView.prototype.redrawEntirePanel = function () {

    const tPad = arbor.constants.treeObjectPadding;
    console.log("Redrawing TreePanelView");

    if (arbor.state.tree) {    //  if not, there is no root node, and we display only the background

        this.panelPaper.clear();

        const rootZoneSize = this.rootNodeZoneView.redrawEntireZone( ); //  draw; not yet positioned.
        this.panelPaper.append(this.rootNodeZoneView.paper);

        /**
         * Note that the next call is to a NodeZoneView, NOT the TreePanelView.
         * In particular, this is the main NodeZoneView, the "root" view, if you will.
         */
        this.rootNodeZoneView.redrawEntireZone({
            x: Number(this.panelPaper.attr("width")) / 2 - rootZoneSize.width / 2,
            y: tPad});

        this.treeBackground.attr({height: rootZoneSize.height});

        arbor.displayResults(arbor.state.tree.resultString());    //  strip at the bottom

        this.refreshCorral(rootZoneSize.height);

        //  resize the panel

        var tViewWidth = rootZoneSize.width + 2 * tPad;
        if (tViewWidth < this.w) tViewWidth = this.w;
        var tViewHeight = rootZoneSize.height + this.corralHeight + 2 * tPad;

        this.panelPaper.attr({
            width: tViewWidth,
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

    console.log("doDrag " + event.offsetX + " " + event.offsetY);
};