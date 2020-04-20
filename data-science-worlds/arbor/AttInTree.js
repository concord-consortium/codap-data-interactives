/**
 * Created by tim on 12/19/16.


 ==========================================================================
 AttributeProperties.js in gamePrototypes.

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


/**     ------------------------------------------------------
 * AttInBaum
 * Holds relevant properties for a single attribute,
 * so we can use it in the tree.
 * There is one of these for each attribute, and the array of these
 * lives in the global arbor.
 *
 * @param iName     name of the attribute
 * @constructor
 */
AttInBaum = function(iAtt) {
    this.attributeName = iAtt.name;
    this.attributeTitle = iAtt.title;
    this.attributeColor = "gray";       //  you can set the color for its representation

    //  if it's categorical....
    this.categories = [];               //  array of categories

    //  if it's numerical....
    this.minimum = Number.POSITIVE_INFINITY;    //  true at the beginning!
    this.maximum = Number.NEGATIVE_INFINITY;

    this.caseCount = 0;
    this.sum = 0;
    this.numericCount = 0;
    this.nonIntegerNumeric = false;
    this.missingCount = 0;

    this.latestSplit = null;

};



AttInBaum.prototype.saveSplit = function( iSplit )  {
    this.latestSplit = iSplit.justLikeMe();
    console.log("Saved classification, set split for " + this.attributeName + " oneBoolean: " + iSplit.oneBoolean );
};

AttInBaum.prototype.getSplit = function() {
    return this.latestSplit.justLikeMe();   //  return a clone.
};


/**
 * Called for each case by arbor.assembleAttributeAndCategoryNames()
 * This creates the set of categories. All categories are strings.
 * @param iValue    A value for this particular atttribute
 * @param iForced    We're telling you the value exists even if it's not in a case (so not part of case count)
 */
AttInBaum.prototype.considerValue = function( iValue, iForced) {

    if (iValue === undefined) {
        iValue = "";
    }

    iValue = iValue.toString();

    if (!iForced) {
        this.caseCount += 1;
    }

    if (iValue) {
        if (jQuery.isNumeric(iValue)) {
            var tNumericValue = Number(iValue);
            this.numericCount += 1;
            this.minimum = tNumericValue < this.minimum ? tNumericValue : this.minimum;
            this.maximum = tNumericValue > this.maximum ? tNumericValue : this.maximum;
            this.sum += tNumericValue;

            if (tNumericValue % 1 !== 0) {
                this.nonIntegerNumeric = true;
            }
        }

        if (this.categories.indexOf(iValue) < 0) {  //  strings may indeed appear numeric and still be categorical.
            this.categories.push(iValue);       //  add it to the list of categories
        }
    } else {
        this.missingCount += 1;
    }
};



AttInBaum.prototype.guessCategorical = function() {

    var tCategorical;

    if (this.nonIntegerNumeric) {
        tCategorical = false;
    } else if (this.categories.length < 11) {
        tCategorical = true;
    } else if ((this.numericCount + this.missingCount) > 0.90 * this.caseCount) {   //      if it's MOSTLY numeric, call it numeric
        tCategorical = false;
    } else {
        tCategorical = true;
    }
    return tCategorical;
};

/**
 * A string describing this AttInBaum
 *
 * @returns {string}
 */
AttInBaum.prototype.toString = function() {
    var categoryList = "";
        if (this.categories.length < 7) {
            categoryList = "[ " + this.categories.join(", ") + " ]";
        } else {
            categoryList = this.categories.length + " categories";
        }

    var out = "<b>" + this.attributeName + "</b> (" + categoryList + ")";

    if (this.minimum < Number.POSITIVE_INFINITY) {
        out += " range [" + this.minimum + " to " + this.maximum + "] ";
    }

    return out;

};

