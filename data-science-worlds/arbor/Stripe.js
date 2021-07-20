Stripe = function (iParent, iTextParams, iRole) {

    this.parent = iParent;      //  the node box view we are embedded in
    this.sText = iTextParams.text;
    this.sBGColor = iTextParams.bgColor;
    this.sTextColor = iTextParams.textColor;
    this.iconClickHandler = null;
    this.role = iRole;
    this.centeredText = false;


    this.paper = Snap(100, 100);
    this.bgShape = iRole === "terminal" ?
        this.paper.circle(0, 0, 40).attr({fill : this.sBGColor }) :
        this.paper.rect(0, 0, 40, 40).attr({fill: this.sBGColor});

    this.sLabel = this.paper.text(arbor.constants.treeObjectPadding, 15.5, this.sText).attr({fill: this.sTextColor});

    //  Define the button image. Will be resized and positioned later

    this.leftButtonImage = null;
    this.rightButtonImage = null;

    var tVariableName = "";
    if (this.parent.myNode.attributeSplit) {
        tVariableName = this.parent.myNode.attributeSplit.attName;
    }

    var toolTipTexts = {
        "plusMinus": "change the diagnosis in this 'leaf' node from + to – or vice versa",
        "leftRight": "swap the labels for " + this.sText,
        "trash": "remove the children of this node (get rid of " + this.sText + " here)",
        "configure" : "configure this attribute: " + tVariableName,
        "dependent": "change positive diagnoses to negative and vice versa"
    };

    switch (this.role) {
        case "terminal":
            this.leftButtonImage = this.paper.image(arbor.constants.buttonImageFilenames.plusMinus, 0, 0, 32, 32)
                .append(Snap.parse("<title>" + toolTipTexts.plusMinus + "</title>"))
                .mousedown(
                    function (iEvent) {
                        this.parent.myNode.flipStopType();
                        this.parent.myTreeView.myPanel.lastMouseDownNodeView = null;
                    }.bind(this)
                );
            this.centeredText = true;
            this.rightButtonImage = null;
            break;

        case "data":
            this.leftButtonImage = null;
            this.rightButtonImage = null;
            break;

        case "branching":

            this.leftButtonImage = this.paper.image(arbor.constants.buttonImageFilenames.configure, 0, 0, 32, 32)
                .append(Snap.parse("<title>" + toolTipTexts.configure + "</title>"))
                .mousedown(
                    function (iEvent) {
                        arbor.setFocusNode(this.parent.myNode);
                        focusSplitMgr.showHideAttributeConfigurationSection(true);   //  arbor.swapFocusSplit();              //  actually do the swap
                    }.bind(this)
                );
            this.rightButtonImage = this.paper.image(arbor.constants.buttonImageFilenames.trash, 0, 0, 32, 32)
                .append(Snap.parse("<title>" + toolTipTexts.trash + "</title>"))
                .mousedown(
                    function (iEvent) {
                        this.parent.myNode.stubThisNode();              //  actually do the trash
                    }.bind(this)
                );
            this.centeredText = true;
            break;

        case "dependent-variable":
/*
            this.leftButtonImage = this.paper.image(arbor.constants.buttonImageFilenames.leftRight, 0, 0, 32, 32)
                .append(Snap.parse("<title>" + toolTipTexts.dependent + "</title>"))
                .mousedown(
                    function (iEvent) {
                        arbor.setFocusSplit(arbor.state.dependentVariableSplit);
                        arbor.swapFocusSplit();              //  actually do the swap
                    }.bind(this)
                )
*/
            this.rightButtonImage = null;
            break;

        case null:
            break;

        default:
            alert('Unexpected role: [' + this.role + '] in Stripe.js');
            break;
    }

    if (this.leftButtonImage) {
        //  set visibility handlers in the parent for the button image

        this.parent.paper.mouseover(function (e) {
            this.leftButtonImage.attr({"visibility": "visible"});
        }.bind(this));

        this.parent.paper.mouseout(function (e) {
            this.leftButtonImage.attr({"visibility": "hidden"});
        }.bind(this));
    }

    if (this.rightButtonImage) {
        //  set visibility handlers in the parent for the button image

        this.parent.paper.mouseover(function (e) {
            this.rightButtonImage.attr({"visibility": "visible"});
        }.bind(this));

        this.parent.paper.mouseout(function (e) {
            this.rightButtonImage.attr({"visibility": "hidden"});
        }.bind(this));
    }
};

Stripe.prototype.resize = function (iSize) {
    this.paper.attr(iSize);
    this.bgShape.attr({width: iSize.width, height: iSize.height});


    if (this.leftButtonImage) {
        this.sLabel.attr({"x" : arbor.constants.treeObjectPadding + iSize.height});
        this.leftButtonImage.attr({
            x: 0,
            y: 0,
            width: iSize.height,   //  yes, use the height (of the stripe) for the width as well.
            height: iSize.height,
            visibility: "hidden"
        })
    }

    if (this.rightButtonImage) {

        var textStart = iSize.width / 2 + this.sLabel.getBBox().width / 2 + arbor.constants.treeObjectPadding;
        this.rightButtonImage.attr({
            x: textStart, //  because the height is the width of the icon
            y: 0,
            width: iSize.height,   //  yes, use the height (of the stripe) for the width as well.
            height: iSize.height,
            visibility: "hidden"
        })
    }

    if (this.centeredText) {
        var textWidth = this.sLabel.getBBox().width;
        var tLeft = iSize.width / 2 - textWidth / 2;
        this.sLabel.attr("x", tLeft);
    }

};

Stripe.prototype.minimumWidth = function () {
    var out = this.leftButtonImage ? 20 : 0;        //  todo: get 20 from somewhere else!
    return out + this.sLabel.getBBox().width + 2 * arbor.constants.treeObjectPadding;
};
