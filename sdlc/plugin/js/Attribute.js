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

  constructor(iRecord, iAttributeAssignment, attributeMap) {
    if (iAttributeAssignment) {
      if (iAttributeAssignment.displayMe == null) iAttributeAssignment.displayMe = true;
    } else {
      iAttributeAssignment = {displayMe: false};
    }
    if (!iRecord) {iRecord = {};}
    this.name = iRecord.name;
    // Starting position in the data string. Value comes from codebook.
    this.startPos = (iRecord.startPos != null)?Number(iRecord.startPos):undefined;
    // Width in characters in the data string. Value comes from codebook
    this.width = iRecord.width;
    // Whether categorical or numeric. Codebook value can be overridden
    this.format = iAttributeAssignment.format || iRecord.format;
    // If categorical, mapping of numeric codes to string values.
    this.categories = iAttributeAssignment.categories || iRecord.categories;
    // Attributes are grouped
    this.groupNumber = iAttributeAssignment.group;
    // Description of attribute
    this.description = iAttributeAssignment.description || iRecord.description;
    // no longer used
    this.chosen = iAttributeAssignment.defCheck;
    // can't be changed
    this.readonly = iAttributeAssignment.readonly;

    this.displayMe = iAttributeAssignment.displayMe; //Boolean(iRecord.defshow);
    this.hasCheckbox = this.displayMe;
    // if the order of attribute is important we can convey the order of categories to CODAP
    this.hasCategoryMap = iAttributeAssignment.hasCategoryMap;
    // remapping of numeric codes to be applied before mapping to a category string
    this.rangeMap = iAttributeAssignment.rangeMap;
    this.multirangeMap = iAttributeAssignment.multirangeMap;

    // title is the CODAP attribute string
    this.title = iAttributeAssignment.title || iRecord.labl;
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

    this.originalAttr = iAttributeAssignment.originalAttr;
    this.attributeMap = attributeMap;
  }

  getRawValue(dataObject) {
    return dataObject[this.name];
  }

  isRecode() {
    return (this.rangeMap || this.multirangeMap);
  }

  getAttributesRawValue (attributeName, dataString) {
    if (this.startPos != null) {
      return this.getRawValue(dataString);
    }
    else {
      let attribute = this.attributeMap && this.attributeMap[attributeName];
      return attribute && attribute.getRawValue(dataString);
    }
  }
  recodeValue(dataString) {
    let result = null;
    let originalAttr = this.originalAttr;
    let found = null;
    if (this.multirangeMap) {
      if (!Array.isArray(originalAttr)) {originalAttr = [originalAttr];}
      let rawValues = this.originalAttr.map(function (name) {
        return this.getAttributesRawValue(name, dataString);
      }.bind(this));
      found = this.multirangeMap.find(function (constraint) {
        return originalAttr.reduce(function(prior, attrName, attrIx) {
          let value = rawValues[attrIx];
          let test = constraint.range[attrName];
          if (!(value && value.trim().length)) {
            return false;
          }
          if (test) {
            return prior && (test.from <= value && test.to >= value);
          } else {
            return prior;
          }
        }, true);
      });
    }
    else if (this.rangeMap) {
      let rawValue = this.getAttributesRawValue(originalAttr, dataString);
      if (rawValue.trim()) {
        found = this.rangeMap.find(function(range) {
          return (range.from<=rawValue && range.to >= rawValue);
        });
      }
    }
    if (found) {
      result = found.recodeTo;
    }
    return result;
  }

  decodeValue(dataString) {
    let result;
    let rawValue;
    if (this.isRecode()) {
      rawValue = this.recodeValue(dataString);
    } else {
      rawValue = this.getRawValue(dataString);
    }

    if (rawValue == null) {
      result = '';
    } else if (this.format === 'categorical' && this.categories) {
      result = this.categories[Number(rawValue)];
      if (result == null) {result = rawValue;}
    } else {
      result = rawValue;
    }
    return result;
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

export {Attribute};
