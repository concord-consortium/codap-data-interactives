/*
==========================================================================

 * Created by tim on 2019-02-10.
 
 
 ==========================================================================
CorralView in concord-plugins

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


CorralView = function ( ) {

    this.corralPaper = new Snap(document.getElementById(arbor.constants.kCorralDOMName));
    this.corralAttViews = [];
    this.corralHeight = arbor.constants.corralHeight;

    this.corralBackgroundRect = this.corralPaper.rect();    //  this appends the rect to the paper

    this.addAllAttributesToCorralView(arbor.attsInBaum);

};


/**
 *
 * @param iAttList  a list of AttInBaum
 */
CorralView.prototype.addAllAttributesToCorralView = function (iAttList) {

    if (!arbor.state.dependentVariableName) {           //  just in case
        arbor.setDependentVariableByName(this.corralAttViews[0].labelText); //  just fix the model
    }

    this.corralAttViews = [];

    iAttList.forEach(function (a) {
        this.addAttributeToCorral(a);
    }.bind(this));
};

/**
 *
 * @param iAttribute    the attInBaum
 */
CorralView.prototype.addAttributeToCorral = function (iAttribute) {
    var tCorralAttView = new CorralAttView(iAttribute, this);
    this.corralPaper.append(tCorralAttView.paper);   //  subviews of paper, not corral itself
    this.corralAttViews.push(tCorralAttView);
};


/**
 * Where was the last place the mouse went down?
 * i.e., where are we dragging FROM?
 * Only works for non-dependent CorralAttViews, handled here in CorralView
 *
 * @param iCorralView
 */
CorralView.prototype.setLastMouseDownNodeView = function (iCorralAttView) {
    if (iCorralAttView !== this.dependentVariableView) {
        this.lastMouseDownNodeView = iCorralAttView;
    }
};


CorralView.prototype.refreshCorral = function (  ) {

    console.log("Redrawing Corral to " + Math.round(arbor.windowWidth) + " px");

    this.corralPaper.clear();
    this.corralPaper = new Snap(document.getElementById(arbor.constants.kCorralDOMName));

    this.corralBackgroundRect = this.corralPaper.rect().attr({fill : arbor.constants.corralBackgroundColor});
    this.equalsSignText = this.corralPaper.text(0, 0, arbor.constants.leftArrowCode).attr({fill: "white", fontSize: 20});

    this.addAllAttributesToCorralView(arbor.attsInBaum);

    //  pick the dependent variable from the model
    const tDependentVariableName = arbor.state.dependentVariableSplit.attName;
    this.dependentVariableView = this.corralAttViews.reduce(
        function (acc, val) {
            return ((tDependentVariableName === val.attInBaum.attributeName) ? val : acc);
        });

    this.corralAttViews.forEach(function (corV) {
        corV.setLabelTextAndSize();
    });

    const tPad = arbor.constants.treeObjectPadding;
    let x = tPad;
    let tCorralY = tPad;

    //  display the dependent variable first

    if (this.dependentVariableView) {
        this.dependentVariableView.moveTo(x, tCorralY);
        x += this.dependentVariableView.label.getBBox().width + 3 * tPad; //  should be able to set and use the paper's width

        this.equalsSignText.animate({x: x, y: tCorralY + 15}, 500);
        x += this.equalsSignText.getBBox().width + tPad;

        //  then loop over the others

        const tIndentation = x;   //  to the right of the equals sign, we indent the atts to here.

        this.corralHeight = arbor.constants.corralHeight;

        this.corralAttViews.forEach(function (corV) {
            if (corV !== this.dependentVariableView) {      //  except for the dependent one
                corV.moveTo(x, tCorralY);
                const tAttributeWidth = corV.label.getBBox().width + 2 * tPad;
                x += tAttributeWidth + tPad; //  should be able to set and use the paper's width

                //  wrap the attributes if there are too many for one line...

                if (x > arbor.windowWidth - tAttributeWidth) {
                    x = tIndentation;
                    const tYIncrement = arbor.constants.nodeHeightInCorral + tPad;
                    tCorralY += tYIncrement;
                    this.corralHeight += tYIncrement;
                    //  this.corralBackgroundRect.attr({height: this.corralHeight});
                    //  this.setUpToDrawTreePanelView();
                    //  console.log("corral height now " + this.corralHeight);
                }
            }
        }.bind(this));
    }

    this.corralBackgroundRect.attr({
        height: this.corralHeight,
        width : arbor.windowWidth
    });

    // this.corralMinimumWidth = (this.corralMinimumWidth > x) ? this.corralMinimumWidth : x;
};

