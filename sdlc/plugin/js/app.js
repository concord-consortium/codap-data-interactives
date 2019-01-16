/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/18/18 9:03 PM
 *
 * Created by Tim Erickson on 8/18/18 9:03 PM
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
/* global: xml2js */

let app = {
  state: null,
  whence: "concord",
  allAttributes: {},     //  object containing all Attributes (a class), keyed by NAME.
  decoder: {},
  ancestries: {},
  map: null,

  freshState: {
    sampleNumber: 1,
    sampleSize: 16,
    selectedYears: [2017],
    selectedStates: [],
    selectedAttributes: ['Sex', 'Age', 'Year', 'State'],
    keepExistingData: false
  },

  initialize: async function () {
    app.years = await app.DBconnect.getDBInfo("getYears");
    app.states = await app.DBconnect.getDBInfo('getStates');
    await app.getAllAttributes();
    await app.CODAPconnect.initialize(null);

    //      Make sure the correct tab panel comes to the front when the text link is clicked

    $('#linkToAttributePanel').click(
      () => {
          $('#tabs').tabs("option", "active", 1);     //  1 is the index of the attribute panel
      });
    $('#chooseStatesDiv').html(app.ui.makeStateListHTML());
    $('#chooseSampleYearsDiv').html(app.ui.makeYearListHTML());

    $('#chooseStatesDiv input').on('change', app.userActions.changeSampleStateCheckbox);
    $('#chooseSampleYearsDiv input').on('change', app.userActions.changeSampleYearsCheckbox);
    $('#chooseAttributeDiv input').on('change', app.userActions.changeAttributeCheckbox);
    app.ui.updateWholeUI();
  },

  updateStateFromDOM: function (logMessage) {
    if (!this.state) {
      // initialize state from CODAP, then update state
    }
    else {
      this.state.selectedYears = app.userActions.getSelectedYears();
      this.state.selectedStates = app.userActions.getSelectedStates();
      this.state.selectedAttributes = app.userActions.getSelectedAttrs();
      if (logMessage) {
        this.CODAPconnect.logAction(logMessage);
      }
    }
    this.ui.updateWholeUI();
  },

  getDataDictionary: function (codebook) {
    const kSpecialNumeric = ['FAMSIZE', 'AGE'];
    let tCbkObject = xml2js(codebook, {}),
        tDescriptions = tCbkObject.elements[1].elements[3];
    return tDescriptions.elements.map(function (iDesc) {
      let tCats = {};
      iDesc.elements.forEach(function (iElement) {
        if (iElement.name === 'catgry') {
          let key = Number(iElement.elements[0].elements[0].text);
          tCats[key] = iElement.elements[1].elements[0].text;
        }
      });
      return {
        name: iDesc.attributes.name,
        startPos: iDesc.elements[0].attributes.StartPos,
        width: Number(iDesc.elements[0].attributes.width),
        labl: iDesc.elements[1].elements[0].text,
        description: iDesc.elements[2].elements[0].cdata,
        format: (Object.keys(tCats).length === 0 || kSpecialNumeric.indexOf(
            iDesc.attributes.name) >= 0) ? 'numeric' : 'categorical',
        categories: tCats
      }
    });
  },

  getPartitionCount: function () {
    let numStates = app.state.selectedStates.length || 1;
    let numYears = app.state.selectedYears.length || 1;
    return numStates * numYears;
  },

  getAllAttributes: async function () {
    let codeBook = await $.ajax('../data/codebook.xml', {dataType: 'text'});
    let dataDictionary = this.getDataDictionary(codeBook);
    app.config.attributeAssignment.forEach(function (configAttr) {
      let codebookDef = dataDictionary.find(function (def) {
        return def.name === configAttr.ipumsName;
      });
      if (codebookDef) {
        let tA = new Attribute(codebookDef, configAttr);
        app.allAttributes[tA.title] = tA;
      }
    });

    $("#chooseAttributeDiv").html(app.ui.makeBasicCheckboxesHTML());
  }

};
