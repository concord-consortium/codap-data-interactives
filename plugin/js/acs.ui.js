/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:10 AM
 *
 * Created by Tim Erickson on 8/21/18 9:10 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */
/* global acs */

acs.ui = {

  updateWholeUI: function () {
    console.log('updating ui');
    acs.ui.refreshAttributeCheckboxes();
    acs.ui.refreshStateCheckboxes();
    acs.ui.refreshYearCheckboxes();
    acs.ui.refreshSampleSummary();
    acs.ui.refreshText();
  },

  getArrayOfChosenAttributes: function () {
    let out = [];
    for (let attName in acs.allAttributes) {
      if (acs.allAttributes.hasOwnProperty(attName)) {
        const tAtt = acs.allAttributes[attName];    //  the attribute
        if (tAtt.chosen) {
          out.push(tAtt);
        }
      }
    }
    return out;
  },

  refreshText: function () {
    const tSampleSize = acs.userActions.getSelectedSampleSize();
    let theGetCasesButtonText = "get " + tSampleSize + ((tSampleSize == 1) ? " person" : " people");
    $("#getCasesButton").text(theGetCasesButtonText);
  },

  refreshAttributeCheckboxes: function () {
    for (let attName in acs.allAttributes) {
      if (acs.allAttributes.hasOwnProperty(attName)) {
        const tAtt = acs.allAttributes[attName];    //  the attribute
        if (tAtt.hasCheckbox) {
          document.getElementById(tAtt.checkboxID).checked = tAtt.chosen;
        }
      }
    }
  },

  refreshStateCheckboxes: function () {
    let activeStateCodes = acs.state.selectedStates;
    $('#states .select-item, #states .select-all').prop('checked', false);
    if (!activeStateCodes || (activeStateCodes.length === 0)) {
      $('#state-all').prop('checked', true);
    } else {
      activeStateCodes.forEach(function (stateCode) {
        $('#state-' + stateCode).prop('checked', true);
      });
    }
  },

  refreshYearCheckboxes: function () {
    let activeYears = acs.state.selectedYears;
    $('#sampleYears .select-item').prop('checked', false);
    if (activeYears) {
      activeYears.forEach(function (year) {
        $('#year-' + year).prop('checked', true)
      });
    }
  },

  toggleAttributeGroupOpen : function(iGroupIndex) {
      acs.attributeGroups[iGroupIndex].open = !acs.attributeGroups[iGroupIndex].open;
      acs.ui.updateWholeUI();
  },

  makeStateListHTML: function () {
    let out = '<div><input type="checkbox" id="state-all" class="select-all" checked="checked" />all states</div>';
    let stateAttribute = acs.allAttributes.STATEFIP;
    acs.states.forEach(function (state) {
      let id = 'state-' + state.state_code;
      let name = stateAttribute.categories[state.state_code];
      out += '<div><input type="checkbox" id="' + id + '" class="select-item"/>' + name + '</div>';
    });
    return out;
  },

  makeYearListHTML: function () {
    let out = '';
    let checked = ' checked="checked"';
    acs.years.forEach(function (year) {
      let id = 'year-' + year.year;
      out += '<div><input type="checkbox" id="' + id + '" class="select-item"' + checked + '/>' + year.year + '</div>';
      checked = '';
    });
    return out;
  },

  makeBasicCheckboxesHTML: function () {
    let out = "";

    acs.attributeGroups.forEach( (g)=>{
      out += "<details>";
      //if (g.open) {
          //  out += "<div>";

          out += this.makeOneGroupOfCheckboxesHTML(g);
          //  out += "</div>";
      //}
      out += "</details>";
    });

    return out;
  },

  makeOneGroupOfCheckboxesHTML: function (iGroupObject) {
    let out = "";
    out += "<summary>" + iGroupObject.title + "</summary>";

    out += "<div class='attributeCheckboxes'>";
    for (let attName in acs.allAttributes) {

      if (acs.allAttributes.hasOwnProperty(attName)) {
        const tAtt = acs.allAttributes[attName];    //  the attribute
        if (tAtt.groupNumber == iGroupObject.number) {     //  not === because one may be a string
          if (tAtt.displayMe) {
            tAtt.hasCheckbox = true;        //  redundant
            out += "<div class='oneAttCheckboxPlusLabel'>";
            out += "<input type = 'checkbox' onchange='acs.userActions.changeAttributeCheckbox(\"" +
                attName + "\")' id = '" + tAtt.checkboxID + "' >\n";
            out += "<label for='" + tAtt.checkboxID + "'><span class='attNameBold'>"
                + tAtt.title + "</span> (" + tAtt.description + ")</label>";
            out += "</div>\n";
          }
        }
      }
    }
    out += "</div>";
    return out;
  },


  refreshSampleSummary: function () {
    const tSampleSize = acs.userActions.getSelectedSampleSize();

    let out = "";
    let aList = [];
    let stateAttr = acs.allAttributes["STATEFIP"];
    let states = acs.state.selectedStates.map(function (st) { return stateAttr.categories[Number(st)]});


    for (let attName in acs.allAttributes) {
      if (acs.allAttributes.hasOwnProperty(attName)) {
        const tAtt = acs.allAttributes[attName];    //  the attribute
        if (tAtt.chosen) {
          aList.push(tAtt.title);
        }
      }
    }

    out = "<p>When you press the button, you will get "
        + (tSampleSize == 1 ? "one random person" : "a random sample of " + tSampleSize + " people")
        + " from the <a href='https://www.census.gov/programs-surveys/acs' target='_blank'>American Community Survey</a>.</p> "
        + "<p>They will be drawn from the following states: <b>" + states.join('</b>, <b>') +
        "</b>, and the following years: <b>" + acs.state.selectedYears.join('</b>, <b>')
        + "</b>.</p>" +
        + "<p>The variables you will get are: "
        + "<b>" + aList.join("</b>, <b>") + "</b>.</p>";

    document.getElementById("sampleSummaryDiv").innerHTML = out;
  }
};