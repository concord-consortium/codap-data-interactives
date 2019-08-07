/**
 * Created by tim on 9/26/16.


 ==========================================================================
 DiagnosisView.js in make-a-tree.

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

DiagnosisView = function (iSign, iPanel) {
    this.data = {};
    this.data.sign = iSign;     //      arbor.constants.diagnosisPlus, ...Minus
    this.labelText = this.data.sign === arbor.constants.diagnosisPlus
        ? arbor.constants.heavyPlus
        : arbor.constants.heavyMinus;
    this.panel = iPanel;
    this.w = arbor.constants.diagWidth;
    this.h = arbor.constants.diagHeight;

    this.where = {x: 0, y: 0};

    this.paper = new Snap(this.w, this.h);

    //  create background rectangle

    this.backShape = this.paper.rect(
        0, 0, this.w, this.h
    ).attr({fill: iSign === arbor.constants.diagnosisPlus ? "green" : "red"});

    //  create label

    this.label = this.paper.text(arbor.constants.treeObjectPadding - 4, 17, this.labelText).attr({
        fill : "white"
    });
    this.label.node.setAttribute("class", "noselect");  //  this is that css thing

    //  create selection rect in front

    this.selectShape = this.paper.rect(0, 0, this.w, this.h).attr({
        fill: "transparent"
    }).mousedown(function () {
        this.panel.lastMouseDownNodeView = this;
        console.log("down in [" + this.labelText + "]");
    }.bind(this));
};


DiagnosisView.prototype.moveTo = function (iX, iY) {
    this.where = {x: iX, y: iY};
    this.paper.attr(this.where);
};
