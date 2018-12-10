

AttributeSplit = function( iAtt ) {
    //  this.theAttribute = iAtt;   //  must not save this in state or it will be circular!
    this.attName = iAtt.attributeName; //  always use the attribute name to find the attribute
    this.categories = iAtt.categories;  //  live copy of the attribute's categories (array of strings)

    this.oneBoolean = "true";       //  a Boolean expression that is true if a case (called "c") belongs in the "Left" value.
    this.oneMissingBoolean = this.makeMissingFilter(this.attName);

    this.cutpoint = null;       //  if continuous, the numeric value separating left values from right
    this.operator = "<";        //  if countinuous, the operator expressing which values are "left" relative to the cutpoint
    this.leftCategories = [];   //  if categorical, the (text) category values that define the "left" output

    this.leftLabel = "low";     //  text representing the "Left" value
    this.rightLabel = "high";   //  text for the "right" value

    this.isCategorical = iAtt.guessCategorical();  //  a guess the user can override

    this.ppv = -1;
    this.npv = -1;

    this.attColor = iAtt.attributeColor;

    this.makeInitialSplitParameters( );      //  determine what "left" is for the attribute   // todo: move to AttInBaum??
};

//  todo: should we find out how the user has assigned the branches for this split? (And how??)
//  todo: should this method require that the data not be missing? (or do we put all the missing in the right this way?)

AttributeSplit.prototype.updateSplitStats = function( iCases ) {

    var truePos = 0, trueNeg = 0, falsePos = 0, falseNeg = 0;
    iCases.forEach( function(aCase) {
        var c = aCase.values;       //  we need "c" because it appears in the oneBoolean string.

        if (eval(this.oneBoolean)) {    //  we're in the left branch, i.e., test (+)
            if (eval(arbor.dependentVariableBoolean)) {
                truePos += 1;
            } else {
                falsePos += 1;      //      a false alarm
            }
        } else {    //  we're in the right branch
            if (eval(arbor.dependentVariableBoolean)) {
                falseNeg += 1;      //      a miss
            } else {
                trueNeg += 1;
            }
        }
    }.bind(this));

    this.ppv = truePos / (truePos + falsePos);
    this.npv = trueNeg / (trueNeg + falseNeg);
};


/**
 * Make an array of the category names associated with one of the two sides, left or right.
 *
 * @param iLorR     Which categories? "L" or "R"?
 * @returns {Array}
 */
AttributeSplit.prototype.getListOfCategories = function(iLorR) {
    var tArray = [];

    //  now make tArray equal to either the left or right categories.
    if (iLorR[0] === "l" || iLorR[0] === "L") {
        tArray = this.leftCategories;
    } else {
        this.categories.forEach( function(c) {    //  look at ALL the attribute's categories
            if (this.leftCategories.indexOf(c) < 0) {
                tArray.push(c);
            }
        }.bind(this))
    }
    return tArray;
};


AttributeSplit.prototype.swapLandR = function() {
    this.leftCategories = this.getListOfCategories("R");
    var tOldLeftLabel = this.leftLabel;
    this.leftLabel = this.rightLabel;
    this.rightLabel = tOldLeftLabel;

    this.operator = AttributeSplit.operatorOpposites[this.operator];
    //  cutPoint stays the same, of course :)

    this.oneBoolean = this.isCategorical ?
        this.constructCategoricalFilter("L") :
        this.setCutPoint(this.cutpoint, this.operator);

};

/**
 * Set the cut point and operator for a continuous variable (making it binary)
 * returns an expression to become the oneBoolean property.
 * @param iValue
 * @param iOperator
 */
AttributeSplit.prototype.setCutPoint = function(iValue, iOperator ) {
    this.cutpoint = iValue;
    this.operator = iOperator;
    return "c." + this.attName + " " + this.operator + " " + this.cutpoint; //  e.g., "c.foo < 42"

};


/**
 * Called by our constructor
 * note that the split is already identified as categorical or not
 *  Make default assignments for left and right cases and labels.
 *  Finally, construct the this.oneBoolean member, which we will use to sort the cases.
 */
AttributeSplit.prototype.makeInitialSplitParameters = function( ) {

    //  we need the attribute, but we only have its name.
    var tAtt = arbor.getAttributeByName(this.attName);

    if (this.isCategorical) {
        this.leftCategories[0] = this.categories[0];
        this.leftLabel = this.categories[0];
        this.rightLabel = (this.categories.length === 2) ? this.categories[1] : "others";
        this.oneBoolean = this.constructCategoricalFilter("L");
    } else {
        var tCutPoint = (tAtt.sum / (tAtt.caseCount - tAtt.missingCount));
        tCutPoint = Number(tCutPoint.toPrecision(5));
        this.oneBoolean = this.setCutPoint( tCutPoint, "<" );     //  also sets oneBoolean
    }
    //  console.log("Initial classification, set split for " + this.attName + " oneBoolean: " + this.oneBoolean );
};

AttributeSplit.prototype.makeMissingFilter = function( iName ) {
    return ("c." + iName + "===''");
};

/**
 * Make the oneBoolean for a categorical attribute
 *
 * @param iLorR     "L" or "R" for left or right
 * @returns {string}    the string containing the Boolean expression
 */
AttributeSplit.prototype.constructCategoricalFilter = function(iLorR) {
    var tArray = this.getListOfCategories(iLorR);   //  get the list of category names
    var tClauses = [];      //  temporary array of stuff like (c.Sex === "F")
    tArray.forEach( function(categoryName) {
        tClauses.push('String(c.' + this.attName + ') === "' + String(categoryName) + '"');    //  coerce both to String
    }.bind(this));

    var out = (tClauses.length > 0) ? "(" + tClauses.join(" || ") + ")" : "false";  //  put them all together with OR (||)
    return out;
};

/**
 * Switch the named category from left to right or vice versa
 * @param iCat
 */
AttributeSplit.prototype.switchCategory = function(iCat) {
    var ix = this.leftCategories.indexOf(iCat);
    if (ix  < 0) {
        this.leftCategories.push(iCat);
    } else {
        this.leftCategories.splice(ix,1);       //      remove one element at ix.
    }

    this.oneBoolean = this.constructCategoricalFilter("L");    //  make sure our filter is correct!

    arbor.dispatchTreeEvent(new Event("changeTree"));   //  results in a redraw of the tree VIEW.
};



/**
 * Utility to reverse the sense of a continuous "cutpoint" expression.
 * useful for code or just for informational and clarity purposes in the attribute configuration section.
 * @param iUseC         prepend "c." to the variable name (c.Sex as opposed to Sex)? Needed if it will be code.
 * @returns {string}    the expression
 */
AttributeSplit.prototype.reverseContinuousExpression = function(iUseC) {
    return  (iUseC ? "c." : "" ) + this.attName + " " + AttributeSplit.operatorOpposites[this.operator] + " " + this.cutpoint;
};

/**
 * String representation of a split
 *
 * @returns {string}
 */
AttributeSplit.prototype.toString = function() {
    var out = this.isCategorical ? "Categorical" : "Continuous";
    out += " split for " + this.attName;

    return out;
};

AttributeSplit.prototype.branchDescription = function( iLorR ) {
    var out = "";

    if (this.isCategorical) {
        var theCategories = this.getListOfCategories(iLorR);
        switch (theCategories.length) {
            case 0:
                out = "no categories";
                break;
            case 1:
                out = this.attName + " is " + theCategories[0];
                break;
            case 2:
                out = this.attName + " is " + theCategories[0] + " or " + theCategories[1];
                break;
            default:
                out = this.attName + " is " + theCategories[0] + " or " + (theCategories.length - 1) + " more categories";
                break;
        }
    } else {    //  must be numerical/continuous
        switch(iLorR) {
            case "L":
                out = this.attName + " " + this.operator + " " + this.cutpoint;
                break;
            case "R":
                out = this.attName +  " " + AttributeSplit.operatorOpposites[this.operator] +  " " + this.cutpoint;
                break;
            default:
                alert('LorR is ' + iLorR + " in AttributeSplit.branchDescription()");
                break;
        }
    }
    return out;
};

AttributeSplit.prototype.justLikeMe = function() {
    var anyAtt = arbor.attsInBaum[0];
    var out = Object.assign(new AttributeSplit(anyAtt),this);   //  shallow copy, but pointing at the attInBaum
    out.leftCategories = this.leftCategories.slice(0);  //  deep copy of this one array
    out.categories = this.categories.slice(0);  //  deep copy of this other array

    return out;
};

AttributeSplit.operatorOpposites = {
    '>' : '<=',
    '<' : '>=',
    ">=" : "<",
    "<=" : ">",
    "===" : "!=="
};