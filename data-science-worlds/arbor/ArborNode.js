//      Node class

/**
 * Model class for the nodes in the tree. The view is called NodeBoxView.
 *
 * It has a unique ID (nodeID) to facilitate restoration from save
 * It holds its parent's ID as well.
 * It has a member (LorR) that tells if it's a "left" or "right" node.
 *
 * If it happens to be the root node, parentID is null, and LorR is "root"
 *
 * It has an array of branches. If it is empty, this is a terminal node.
 * If it is not empty, the array should have two elements, one for each descendant node.
 * If it has branches, this.attributeSplit holds an "Split" (Class AttributeSplit) that specifies
 *      how the cases are split between its two branches.
 *
 * The "filterArray" is an array of Boolean expressions (as text) that, when ANDed, select the cases that apply to this node.
 * These Booleans come from the "Splits" that come higher in the tree.
 *
 * The "missingArray" is a similar array, but that when ORed, tell whether a case is missing from this node.
 *
 *
 * @param iParent   the parent node (though we will save the ID. Why? Avoid circularity.)
 * @param iLoR      "L" or "R" -- is this a "left" or "right" node?
 * @constructor
 */
Node = function (iParent, iLoR) {
    this.baumNodeID = arbor.state.latestNodeID++;
    this.parentID = (iParent ? iParent.baumNodeID : null);  //  parent NODE (model). NULL if this is the root.
    this.LoR = iLoR;        //  "L" or "R" (or "root")

    this.attributeSplit = null;      //  how the descendants of this node get split or otherwise configured.

    this.onTrace = false;       //  are we in the path of a (single, CODAP) selected case?

    this.stopSign = arbor.constants.diagnosisNone;   //  (iLoR === "R" ? arbor.constants.diagnosisMinus : arbor.constants.diagnosisPlus);

    this.numerator = 0;
    this.denominator = 0;
    this.mean = 0;          //  mean value; if categorical, proportion positive (pos = 1, neg = 0)
    this.ssdev = 0;       //  mean squared deviation from that mean. If categorical, use  (pos = 1, neg = 0) = p(1-p)/n

    //  label texts

    this.relevantParentSplitLabel = "input";

    this.filterArray = [];
    this.missingArray = [];
    this.branches = [];     //  the array of sub-Nodes

    console.log("New " + this.LoR + " node id: " + this.baumNodeID + " type: " + this.stopSign);

};

/**
 * Given the (unique, integer) id of a node, returns the node if it is an eventual descendant of this node,
 * or null if it is not.
 *
 * Used (circuitously) to find the parent node. I know. See this.parentNode().
 *
 * @param id
 * @returns {*}
 */
Node.prototype.findNodeDownstream = function (id) {
    var out = null;

    if (id) {
        if (this.baumNodeID === id) {
            out = this;
        } else {
            this.branches.forEach(function (b) {
                var tNode = b.findNodeDownstream(id);
                if (tNode) {
                    out = tNode;
                }
            })
        }
    }

    return out;
};

/**
 * [currently] circuitous way to find the parent node:
 * (if we restored, we have its node ID, but not the node itself)
 *
 * Ask the tree to find the node by ID.
 * That will ask the root node to find it in its descendants.
 */
Node.prototype.parentNode = function () {
    return arbor.state.tree.nodeFromID(this.parentID);
};

/**
 * Called from this.populateNode()
 * and NodeBoxView.redrawMe() (maybe just to get the parent's color)
 * @param iParent       the parent NODE (not just the ID)
 * @returns {null|*}
 */
Node.prototype.parentSplit = function (iParent) {
    return (iParent ? iParent.attributeSplit : arbor.state.dependentVariableSplit);
};

/**
 * Called when the user drops an attribute in a node.
 * The NodeBoxView sends the data from the "mouse down place" to this (mouse up) node.
 * @param iAttribute    the AttInBaum that branches at this node
 */
Node.prototype.branchThisNode = function (iAttribute) {
    this.attributeSplit = iAttribute.getSplit();    //  gets the latest split

    arbor.focusSplit = this.attributeSplit;

    this.branches = [];     //  reset

    //  here is where we make the new nodes and constrict their Booleans.
    //  we add each of the (two) branches separately. Left first.

    var tNewNode = new Node(this, "L"); //
    this.branches.push(tNewNode);     //  array holds the LEFT branch

    var uNewNode = new Node(this, "R"); //
    this.branches.push(uNewNode);     //  array now holds LEFT and RIGHT branches

    /*
        var tEvent = new Event("changeTree");
        tEvent.why = "node branching";
        arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.
    */
};

/**
 * Remove all branches from this node
 * Remove its "split"
 */
Node.prototype.stubThisNode = function () {
    this.branches = [];
    this.attributeSplit = null;
    console.log("Node.prototype.stubThisNode, set to change tree.");

    arbor.eventDispatcher.dispatchEvent("changeNode");

    var tEvent = new Event("changeTree");
    tEvent.why = "node stubbing";
    arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.
};

Node.prototype.traceCaseInTree = function (c) {
    var tIsCaseInThisNode = false;
    var tSignOfTerminalNode = null;

    if (this.branches.length === 0) {       //  we are a terminal node
        var tWholeFilter = this.filterArray.join(" && ");
        tIsCaseInThisNode = (eval(tWholeFilter));
        if (tIsCaseInThisNode) {
            tSignOfTerminalNode = this.stopSign;
        }
    } else {
        this.branches.forEach(function (n) {
            var tBranchTraceResult = n.traceCaseInTree(c);
            if (tBranchTraceResult.inThisNode) {     //  doing it this way (not = ||) ensures traversal of entire tree
                tIsCaseInThisNode = true;
                tSignOfTerminalNode = tBranchTraceResult.terminalNodeSign;
            }
        });
 //       console.log('Tracing case, non-terminal node: ' + JSON.stringify(c));
    }
    this.onTrace = tIsCaseInThisNode;
    return {
        inThisNode : tIsCaseInThisNode,
        terminalNodeSign : tSignOfTerminalNode
    };
};

/**
 * Clear the onTrace flag for the entire tree
 */
Node.prototype.clearTrace = function() {
    this.onTrace = false;
    this.branches.forEach( function(n) {
        n.clearTrace();
    })
};


Node.prototype.findNodeStats = function () {

    var tCases = arbor.state.tree.casesByFilter(this.filterArray, this.missingArray);
    var N = tCases.length;

    var theSplit = arbor.state.dependentVariableSplit;

    if (theSplit) {

        var filter = arbor.state.dependentVariableSplit.oneBoolean;
        this.numerator = this.numberOfCasesWhere(tCases, filter);
        this.denominator = N;

        var sum = 0;
        var tDependentVarName = theSplit.attName;     //  dependent variable name

        tCases.forEach(function (aCase) {
            var c = aCase.values;
            if (theSplit.isCategorical) {
                sum += eval(filter) ? 1 : 0;
            } else {
                sum += Number(c[tDependentVarName]);    //  because it might be encoded as a string
            }
        }.bind(this));

        this.mean = sum / N;

        var sse = 0;

        tCases.forEach(function (aCase) {
            var c = aCase.values;
            var val = theSplit.isCategorical ? (eval(filter) ? 1 : 0) : c[tDependentVarName];
            sse += (val - sum / N) * (val - sum / N);       //      (value - mean)**2
        });

        this.ssdev = sse;

    } else {
        console.log("calculating findNodeStats without split");
    }
};

/**
 * Redo all the data for this node, and its subnodes.
 * This means getting its Boolean right and then getting the right cases from the parent
 */
Node.prototype.populateNode = function () {

    var tParent = this.parentNode();
    var tParentSplit = this.parentSplit(tParent);

    this.filterArray = tParent ? tParent.filterArray.slice(0) : [];     //  clone the array
    this.missingArray = tParent ? tParent.missingArray.slice(0) : [];     //  clone the array
    this.missingArray.push(tParentSplit.oneMissingBoolean);

    switch (this.LoR) {
        case "L":
            this.relevantParentSplitLabel = tParentSplit.leftLabel;
            this.filterArray.push(tParentSplit.oneBoolean);
            break;
        case "R":
            this.relevantParentSplitLabel = tParentSplit.rightLabel;
            this.filterArray.push("!(" + tParentSplit.oneBoolean + ")");  //  reverse the Boolean
            break;
        default:

            if (!this.relevantParentSplitLabel) {   //  it may have been given one before
                this.relevantParentSplitLabel = "root";
            }

            this.filterArray = ["true"];
            this.missingArray = ["c." + tParentSplit.attName + "===''"];   //  is the root variable missing??
            break;
    }

    this.branches.forEach(function (b) {
        b.populateNode();
    });

    this.findNodeStats();

    arbor.eventDispatcher.dispatchEvent("changeNode");
};


Node.prototype.numberOfCasesWhere = function (iCases, iBoolean) {
    var out = 0;
    iCases.forEach(function (aCase) {
        var c = aCase.values;
        if (eval(iBoolean)) {
            out += 1;
        }
    });
    return out;
};

Node.prototype.flipStopType = function () {
    this.stopSign = (this.stopSign === arbor.constants.diagnosisPlus) ? arbor.constants.diagnosisMinus : arbor.constants.diagnosisPlus;
    console.log("Switching node to " + this.stopSign);

    //arbor.eventDispatcher.dispatchEvent("changeNode");       //  todo: figure out why we make this call!
    var tEvent = new Event("changeTree");
    tEvent.why="flipping node plus-minus";
    arbor.dispatchTreeEvent(tEvent);
};


/*
What is the depth of this node?
 */
Node.prototype.depth = function () {
    var tParent = this.parentNode();
    return (tParent) ? 1 + tParent.depth() : 0;
};

/*
How deep is the tree below this node?
 */
Node.prototype.depthDownFromHere = function () {
    if (this.branches.length === 0) {
        return 0;
    } else {
        var Ldepth = this.branches[0].depthDownFromHere() + 1;
        var Rdepth = this.branches[1].depthDownFromHere() + 1;
        return (Ldepth > Rdepth) ? Ldepth : Rdepth;
    }
};

Node.prototype.branchCount = function () {
    return this.branches.length;
};

Node.prototype.leafCount = function () {
    var oLeafCount = 0;
    if (this.branches.length > 0) {
        this.branches.forEach(function (iBranch) {
            oLeafCount += iBranch.leafCount();
        }.bind(this));
    } else {
        oLeafCount = 1;
    }

    return oLeafCount;
};

Node.prototype.descendantCount = function () {
    var oLeafCount = 0;
    if (this.branches.length > 0) {
        this.branches.forEach(function (iBranch) {
            oLeafCount += (1 + iBranch.descendantCount());
        }.bind(this));
    } else {
        oLeafCount = 0;
    }

    return oLeafCount;
};

/**
 * Result counts in the form {plusNumerator: , minusNumerator: , etc. }
 */
Node.prototype.getResultCounts = function () {
    var tOut = {
        sampleSize: 0,
        plusNumerator: null,    //  number in this node (and descendants) that are truly POSITIVE
        plusDenominator: null,  //  number in this node ... that are diagnosed positive
        minusNumerator: null,
        minusDenominator: null,

        ssdFraction: null,
        sumOfSquaresOfDeviationsOfLeaves: 0
    };

    tOut.sampleSize = this.denominator;

    if (arbor.state.tree.rootNode.ssdev) {
        tOut.ssdFraction = this.ssdev / arbor.state.tree.rootNode.ssdev;
    }

    if (this.branches.length === 0) {       //  terminal node
        tOut.sumOfSquaresOfDeviationsOfLeaves = tOut.ssdFraction;

        if (this.stopSign === arbor.constants.diagnosisPlus) {
            tOut.plusNumerator = this.numerator;
            tOut.plusDenominator = this.denominator;
            tOut.minusDenominator = 0;
            tOut.minusNumerator = 0;
        } else if (this.stopSign === arbor.constants.diagnosisMinus) {
            tOut.minusNumerator = this.numerator;
            tOut.minusDenominator = this.denominator;
            tOut.plusDenominator = 0;
            tOut.plusNumerator = 0;
        } else if (this.stopSign === arbor.constants.diagnosisNone) {
            tOut.minusNumerator = 0;
            tOut.minusDenominator = 0;
            tOut.plusDenominator = 0;
            tOut.plusNumerator = 0;
        } else {
            alert(
                "Node.getResultCounts() unexpected data, neither "
                + arbor.constants.diagnosisPlus + ", "
                + arbor.constants.diagnosisMinus + ", nor "
                + arbor.constants.diagnosisNone
            );
        }
    } else {
        this.branches.forEach(function (ixBranchNode) {
            var tRC = ixBranchNode.getResultCounts();
            tOut.sumOfSquaresOfDeviationsOfLeaves += tRC.sumOfSquaresOfDeviationsOfLeaves;

            if (tRC.plusDenominator) {
                tOut.plusDenominator += tRC.plusDenominator;
                tOut.plusNumerator += tRC.plusNumerator;
            }
            if (tRC.minusDenominator) {
                tOut.minusDenominator += tRC.minusDenominator;
                tOut.minusNumerator += tRC.minusNumerator;
            }
        })
    }

    tOut.TP = tOut.plusNumerator;
    tOut.FP = tOut.plusDenominator - tOut.plusNumerator;
    tOut.FN = tOut.minusNumerator;
    tOut.TN = tOut.minusDenominator - tOut.minusNumerator;

    tOut.sensitivity = tOut.TP / (tOut.TP + tOut.FN);
    tOut.specificity = tOut.TN / (tOut.TN + tOut.FP);
    tOut.PPV = tOut.TP / (tOut.TP + tOut.FP);
    tOut.NPV = tOut.TN / (tOut.TN + tOut.FN);

    return tOut;
};

/**
 * returns the text that goes in the diagnostic "leaf" if this is a terminal node
 *
 * Something like
 *      Malignant (+)
 */
Node.prototype.getLeafText = function() {
    var tText = "";

    switch (this.stopSign) {
        case arbor.constants.diagnosisPlus:
            tText = arbor.state.dependentVariableSplit.leftLabel;
            break;
        case arbor.constants.diagnosisMinus:
            tText = arbor.state.dependentVariableSplit.rightLabel;
            break;
        default:
            break;
    }
    tText += " (" + this.stopSign + ")";

    return tText;
};

Node.prototype.toString = function () {
    var out = "Node with " + this.cases.length + " cases";
    if (this.attributeSplit) {
        out += " split on " + this.attributeSplit.attName;
    }
    return out;
};

Node.prototype.friendlySubsetDescription = function () {
    var out = "";
    var tAllCasesText = "all of the cases";
    var tParent = this.parentNode();
    if (tParent) {
        var tDesc = tParent.friendlySubsetDescription();

        var tNewLabel = (this.LoR === "L") ?
            "(" + tParent.attributeSplit.attName + "&nbsp;=&nbsp;" + tParent.attributeSplit.leftLabel + ")" :
            "(" + tParent.attributeSplit.attName + "&nbsp;=&nbsp;" + tParent.attributeSplit.rightLabel + ")";

        if (tDesc === tAllCasesText) {
            out =  tNewLabel;
        } else {
            out = tDesc + " &&nbsp;" + tNewLabel;
        }
    } else {
        out = tAllCasesText;
    }

    return out;
};

Node.prototype.longDescription = function () {

    var tResultCounts = this.getResultCounts();

    var tDependentClause = arbor.informalDVBoolean;
    var tProportionText = "p(" + tDependentClause + ") = " + this.mean.toFixed(3);
    var tMeanText = "\u03bc(" + arbor.state.dependentVariableSplit.attName + ") = " + this.mean.toFixed(0);
    var tMSDtext = "SSD ratio: " + (tResultCounts.ssdFraction ? (tResultCounts.ssdFraction).toFixed(2) : "N/A");

    var out = "";
    if (!this.parentNode()) {   //  dependent variable only
        out += this.positiveNegativeDescription() + "<br>&mdash;&mdash;<br>";
    }
    out += "This node represents " + this.denominator + " cases. <br>";
    out += "These are " + this.friendlySubsetDescription() + ". <br> ";
    out += "Of these, " + this.numerator + " are (" + tDependentClause + "). ";

    //  out += (arbor.state.dependentVariableSplit.isCategorical ? tProportionText : (tMeanText + " " + tMSDtext));

    if (this.attributeSplit) {
        out +=  "<br>&mdash;&mdash;<br>";
        out += "Then we ask about " + this.attributeSplit.attName;
    }

    return out;
};

Node.prototype.positiveNegativeDescription = function() {
    var tSplit = arbor.state.dependentVariableSplit;

    var out = "In this scenario, <br>";
    out += "'Positive' means " + tSplit.leftLabel + " and 'negative' means " + tSplit.rightLabel + ".";

    return out;
};