CorralAttView = function (iAtt, iPanel) {
    this.attInBaum = iAtt;
    this.labelText = this.attInBaum.attributeTitle;
    this.panel = iPanel;
    this.w = arbor.constants.attrWidth;
    this.h = arbor.constants.attrHeight;

    this.where = {x: 0, y: 0};

    this.paper = new Snap(this.w, this.h);
    this.theGroup = this.paper.g();

    //  create background rectangle

    this.backShape = this.paper.rect(
        0, 0, this.w, this.h, arbor.constants.corralCornerRadius, arbor.constants.corralCornerRadius              //      newly added round corners
    ).attr({fill: this.attInBaum.attributeColor});
    //  create label
    this.label = this.paper.text(arbor.constants.treeObjectPadding, 12, this.labelText).attr({fill : "#eee"});

    this.label.node.setAttribute("class", "noselect");  //  this is that css thing

    this.theGroup.add( this.backShape, this.label);

    //  new handlers using group

    function movehandler(dx, dy, x, y, event) {
        this.panel.doDrag(dx, dy, x, y, event);
        console.log("move! (CorralAttView)");
    }

    function starthandler(x, y, event) {
        this.panel.setLastMouseDownNodeView( this );
        console.log("theGroup.mousedown in " + this.labelText + " event: " + JSON.stringify(event));
        this.panel.startDrag(this.attInBaum, this.paper, event);
    }

    function endhandler( object ) {
        console.log("end! " + JSON.stringify(object));
    }

    this.theGroup.drag( movehandler, starthandler, endhandler, this, this, this );


    //  this.paper.node.setAttribute("draggable" , "true");
    //  this.paper.node.setAttribute("ondragstart", "console.log('....drag start....')");


/*
    this.theGroup.mousedown( function (e) {
        this.panel.setLastMouseDownNodeView( this );
        console.log("theGroup.mousedown in " + this.labelText + " event: " + JSON.stringify(e));
        this.panel.startDrag(this.attInBaum, this.paper, e);
    }.bind(this));

*/
    //  create selection rect in front

/*
    this.selectShape = this.paper.rect(0, 0, this.w, this.h).attr({
        fill: "transparent"
    }).mousedown(function (e) {
        this.panel.setLastMouseDownNodeView( this );
        console.log("selectShape.mousedown in " + this.labelText + " event: " + JSON.stringify(e));
        this.panel.startDrag(this.attInBaum, this.paper, e);
    }.bind(this));
*/


    this.theGroup.click( function(e) {
        //  are we the DV? If so, focus on the DV split
        console.log("group.click in " + this.labelText + " event: " + JSON.stringify(e));

        if (this === this.panel.dependentVariableView) {
            focusSplitMgr.setFocusSplit( arbor.state.dependentVariableSplit);
            focusSplitMgr.showHideAttributeConfigurationSection();
            arbor.redisplay();
        }
    }.bind(this));

    this.theGroup.dblclick( function(e) {
        console.log("theGroup.double click in " + this.labelText);
        arbor.setDependentVariableByName( this.labelText );
        arbor.repopulate();
        arbor.redisplay();
    }.bind(this));

};

/*
CorralAttView.prototype.showSelection = function (iSelected) {
    this.coloredShape.attr({fill: iSelected ? arbor.constants.selectedAttributeColor : arbor.constants.attributeColor});
};
*/

CorralAttView.prototype.setLabelTextAndSize = function() {
    var tLabel = this.labelText;
    if (this.attInBaum === arbor.state.dependentVariableSplit.attInBaum) {
        tLabel += " = " + arbor.state.dependentVariableSplit.leftLabel;
    }
    this.label.attr("text", tLabel);
    var tNewWidth = this.label.getBBox().width;     //  may have changed due to change in labels and dependent-variable assignment
    tNewWidth += 2 * arbor.constants.treeObjectPadding;
    this.paper.attr({width: tNewWidth});
    this.backShape.attr({width: tNewWidth});
};

CorralAttView.prototype.moveTo = function (iX, iY) {
    this.where = {x: iX, y: iY};
    this.paper.attr(this.where, 400);
};

CorralAttView.prototype.slideTo = function (iX, iY) {
    this.where = {x: iX, y: iY};
    this.paper.animate(this.where, 400);
};
