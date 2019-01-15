/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 8:16 PM
 *
 * Created by Tim Erickson on 8/21/18 8:16 PM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */


class Attribute {

  constructor(iRecord, iAttributeAssignment) {
    this.name = iRecord.name;
    // Starting position in the data string. Value comes from codebook.
    this.startPos = Number(iRecord.startPos);
    // Width in characters in the data string. Value comes from codebook
    this.width = iRecord.width;
    // Whether categorical or numeric. Codebook value can be overridden
    this.format = (iAttributeAssignment && iAttributeAssignment.format) || iRecord.format;
    // If categorical, mapping of numeric codes to string values.
    this.categories = (iAttributeAssignment && iAttributeAssignment.categories) || iRecord.categories;
    // Attributes are grouped
    this.groupNumber = iAttributeAssignment && iAttributeAssignment.group;
    // Description of attribute
    this.description = (iAttributeAssignment && iAttributeAssignment.description) || iRecord.description;
    // no longer used
    this.chosen = iAttributeAssignment && iAttributeAssignment.defCheck;

    this.displayMe = iAttributeAssignment; //Boolean(iRecord.defshow);
    this.hasCheckbox = this.displayMe;
    // if the order of attribute is important we can convey the order of categories to CODAP
    this.hasCategoryMap = iAttributeAssignment.hasCategoryMap;
    // remapping of numeric codes to be applied before mapping to a category string
    this.rangeMap = (iAttributeAssignment && iAttributeAssignment.rangeMap);

    // title is the CODAP attribute string
    this.title = (iAttributeAssignment && iAttributeAssignment.title) || iRecord.labl;
    if (!this.title) {
      this.title = this.name;
    }
    // the DOM element ID
    this.checkboxID = 'attr-' + this.title;
    // we can create formula based attributes. A formula attribute is derived from
    // values of other attributes as known to CODAP, and not directly from the source data.
    this.formula = iAttributeAssignment.formula;
    // a comma delimited list of attributes that must be present in the document
    // along with this attribute
    this.formulaDependents = iAttributeAssignment.formulaDependents;
  }

  decodeValue(iValue) {
    let startIndex = this.startPos - 1;
    let out = iValue.slice(startIndex, startIndex + this.width);

    if (this.format === 'categorical') {
      let nOut = Number(out);
      if (this.rangeMap) {
        let x = nOut;
        let foundRange = this.rangeMap.find(function (range) {
          return (x >= range.from && x <= range.to);
        });
        if (foundRange !== null && foundRange !== undefined) {
          nOut = foundRange.recodeTo;
        }
      }
      if (this.categories[nOut]) {
        out = this.categories[Number(nOut)];
      }
    }
    return out;
  }

  /**
   * Creates a category map based on the categories listed and assigning colors
   * in order.
   */
  getCategoryMap () {
    const kKellyColors = [
      '#FFB300', '#803E75', '#FF6800', '#A6BDD7', '#C10020', '#CEA262',
      '#817066', '#007D34', '#00538A', '#F13A13', '#53377A', '#FF8E00',
      '#B32851', '#F4C800', '#7F180D', '#93AA00', '#593315', '#232C16',
      '#FF7A5C', '#F6768E'];
    let order = Array.isArray(this.categories)? this.categories: Object.values(this.categories);
    let categoryMap = {};
    let index = 0;
    if (order) {
      order.forEach(function (categoryName) {
        categoryMap[categoryName] = kKellyColors[index++ % kKellyColors.length];
      });
    }
    categoryMap.__order = order;
    return categoryMap;
  }
}

