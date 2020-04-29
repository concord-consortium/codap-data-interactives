/*
==========================================================================

 * Created by tim on 11/29/17.
 
 
 ==========================================================================
ConfusionMatrix in pluginsLocal

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

var ConfusionMatrix = function ( iDOMid) {
    this.paper = Snap(document.getElementById( iDOMid ));

    this.TP = 20;
    this.FP = 5;
    this.TN = 10;
    this.FN = 3;

    this.cellHeight = 40;
    this.cellWidth = 40;


    this.zerothColumnStart = this.cellHeight;
    this.firstColumnStart = 2 * this.cellHeight;
    this.secondColumnStart = this.firstColumnStart + this.cellWidth;
    this.zerothRowStart = 2 * this.cellHeight;
    this.firstRowStart = 3 * this.cellHeight;
    this.secondRowStart = this.firstRowStart + this.cellHeight;

    this.cells = {
        TP : { x : this.firstColumnStart, y : this.firstRowStart, width : this.cellWidth, height : this.cellHeight },
        FP : { x : this.secondColumnStart, y : this.firstRowStart, width : this.cellWidth, height : this.cellHeight },
        TN : { x : this.secondColumnStart, y : this.secondRowStart, width : this.cellWidth, height : this.cellHeight },
        FN : { x : this.firstColumnStart, y : this.secondRowStart, width : this.cellWidth, height : this.cellHeight },
    };

    this.cellBGRects = {
        TP: this.paper.rect(this.firstColumnStart + 1, this.firstRowStart - this.cellHeight + 1, this.cellWidth - 2, this.cellHeight - 2, 2, 2),
        FP: this.paper.rect(this.secondColumnStart + 1, this.firstRowStart - this.cellHeight + 1, this.cellWidth - 2, this.cellHeight - 2, 2, 2),
        TN: this.paper.rect(this.secondColumnStart + 1, this.secondRowStart - this.cellHeight + 1, this.cellWidth - 2, this.cellHeight - 2, 2, 2),
        FN: this.paper.rect(this.firstColumnStart + 1, this.secondRowStart - this.cellHeight + 1, this.cellWidth - 2, this.cellHeight - 2, 2, 2)
    };

    this.headings = {
        ActualP : this.paper.text( this.firstColumnStart, this.zerothRowStart, "Pos!"),
        ActualN : this.paper.text( this.secondColumnStart, this.zerothRowStart, "Neg!"),
        DiagP : this.paper.text( this.zerothColumnStart, this.firstRowStart, "Pos?"),
        DiagN : this.paper.text( this.zerothColumnStart, this.secondRowStart, "Pos?"),
    };

    this.labels = {
        TP: this.paper.text(this.firstColumnStart, this.firstRowStart, this.TP.toString()),
        FP: this.paper.text(this.secondColumnStart, this.firstRowStart, this.FP.toString()),
        TN: this.paper.text(this.secondColumnStart, this.secondRowStart, this.TN.toString()),
        FN: this.paper.text(this.firstColumnStart, this.secondRowStart, this.FN.toString())
    };

    this.truthLabel = this.paper.text(50, 20, "actual");
    this.diagnosisLabel = this.paper.text(20, 90, "diagnosis").transform("rotate(-90 20 90)");

    this.resize();
};

ConfusionMatrix.prototype.resize = function (iSize) {
    this.refreshLabel( this.TP, "TP");
    this.refreshLabel( this.FP, "FP");
    this.refreshLabel( this.TN, "TN");
    this.refreshLabel( this.FN, "FN");

    var tHeadingSize = this.headings.ActualP.getBBox();

    this.headings.ActualP.attr({
        x : this.firstColumnStart + this.cellWidth/2 - tHeadingSize.width/2
        });
    this.headings.ActualN.attr({
        x : this.secondColumnStart + this.cellWidth/2 - tHeadingSize.width/2
    });
    this.headings.DiagP.attr({
        x : this.zerothColumnStart + this.cellHeight/2 - tHeadingSize.width/2,
        y : this.firstRowStart - (this.cellHeight - tHeadingSize.height)
    });
    this.headings.DiagN.attr({
        x : this.zerothColumnStart + this.cellHeight/2 - tHeadingSize.width/2,
        y : this.secondRowStart - (this.cellHeight - tHeadingSize.height)
    });
};

ConfusionMatrix.prototype.refreshLabel = function( iVal, iWhich ) {
    var tBG = this.cellBGRects[iWhich];
    var tLabel = this.labels[iWhich];
    var tCell = this.cells[iWhich];

    tLabel.attr({text : iVal.toString()});

    var textSize = tLabel.getBBox();

    tBG.attr({
        fill : "#eee"
    });

    tLabel.attr({
        x : tCell.x + tCell.width/2 - textSize.width/2,     //  center it
        y : tCell.y - (tCell.height - textSize.height)    //  vertical bump
    });
};