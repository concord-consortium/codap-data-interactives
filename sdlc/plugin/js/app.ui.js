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
/* global app */

app.ui = {
  init: function () {
    function setEventHandler (selector, event, handler) {
      const elements = document.querySelectorAll(selector);
      if (!elements) { return; }
      elements.forEach(function (el) {
        el.addEventListener(event, handler);
      });
    }

    function findAncestorElementWithClass(el, myClass) {
      while (el !== null && el.parentElement !== el) {
        if (el.classList.contains(myClass)) {
          return el;
        }
        el = el.parentElement;
      }
    }

    function toggleClass(el, myClass) {
      let isOpen = el.classList.contains(myClass);
      if (isOpen) {
        el.classList.remove(myClass);
      } else {
        el.classList.add(myClass);
      }
    }

    function togglePopUp(el) {
      toggleClass(el, 'wx-open');
    }

    function togglePopOver(el) {
      toggleClass(el, 'wx-open');
    }

    function toggleDescriptions(el) {
      toggleClass(el, 'show-descriptions');
    };

    setEventHandler('.wx-dropdown-indicator', 'click', function (ev) {
      let dropdownGroup = findAncestorElementWithClass(this, 'wx-dropdown-group');
      let sectionEl = findAncestorElementWithClass(this, 'wx-dropdown');
      let isClosed = sectionEl.classList.contains('wx-up');
      let dropDowns = (dropdownGroup||document).querySelectorAll('.wx-dropdown.wx-down');
      if (dropDowns) {
        dropDowns.forEach(function (el) {
          el.classList.remove('wx-down');
          el.classList.add('wx-up');
        })
      }
      if (isClosed) {
        sectionEl.classList.remove('wx-up');
        sectionEl.classList.add('wx-down');
      }
    });

    setEventHandler('.wx-pop-up-anchor,#wx-info-close-button', 'click', function (ev) {
      let parentEl = findAncestorElementWithClass(this, 'wx-pop-up');
      togglePopUp(parentEl);
    });

    setEventHandler('.wx-pop-over-anchor', 'click', function (ev) {
      let parentEl = findAncestorElementWithClass(this, 'wx-pop-over');
      togglePopOver(parentEl);
    });

    setEventHandler('.show-attr-description-checkbox', 'click', function (ev) {
      let parentEl = findAncestorElementWithClass(this, 'attributeCheckboxes');
      toggleDescriptions(parentEl);
    });

  },

  updateWholeUI: function () {
    console.log('updating ui');
    app.ui.refreshAttributeCheckboxes();
    app.ui.refreshStateCheckboxes();
    app.ui.refreshYearCheckboxes();
    app.ui.refreshSampleSummary();
    app.ui.refreshText();
    app.ui.refreshLog();
  },

  refreshLog: function () {
    let activityLog = app.state.activityLog;
    let tabContentNode = $('#log .wx-dropdown-body');
    let tableRows = activityLog && activityLog.map(function (logEntry) {
      return $('<tr>').append($('<td>').text(logEntry.time)).append($('<td>').text(logEntry.message));
    });
    let table = $('<table>').append(tableRows);
    tabContentNode.empty().append(table);
  },

  refreshText: function () {
    $('#sampleSizeInput').val(app.state.requestedSampleSize || 1000);
    $('#keepExistingDataCheckbox')[0].checked = app.state.keepExistingData;
  },

  /**
   * Expects an array of attr names. Returns true if they are all selected.
   * @param dependents
   */
  checkDependentSelected: function (dependents) {
    let selectedAttributes = app.state && app.state.selectedAttributes;
    if (!selectedAttributes) {
      return false;
    }
    return dependents.every(function (dep) {
      return (selectedAttributes.includes(dep));
    });
  },

  refreshAttributeCheckboxes: function () {
    let activeAttributes = app.state.selectedAttributes;
    $('#chooseAttributeDiv .select-item').prop('checked', false);
    if (activeAttributes) {
      activeAttributes.forEach(function (attrName) {
        $('#attr-' + attrName).prop('checked', true);
      });
    }

    Object.values(app.allAttributes).forEach(function (attr) {
      if (attr.formulaDependents) {
        let $el = $('#' + attr.checkboxID);
        if (!this.checkDependentSelected(attr.formulaDependents.split(','))) {
          $el.prop('checked', false);
          $el.prop('disabled', true);
        } else {
          $el.prop('disabled', false);
        }
      }
    }.bind(this));
  },

  refreshStateCheckboxes: function () {
    let activeStateCodes = app.state.selectedStates;
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
    let activeYears = app.state.selectedYears;
    $('#sampleYears .select-item').prop('checked', false);
    if (activeYears) {
      activeYears.forEach(function (year) {
        $('#year-' + year).prop('checked', true);
      });
    }
  },

  toggleAttributeGroupOpen : function(iGroupIndex) {
      app.config.attributeGroups[iGroupIndex].open = !app.attributeGroups[iGroupIndex].open;
      app.ui.updateWholeUI();
  },

  /**
   *
   * @param status {'inactive', 'retrieving', 'transferring', 'success', 'failure'}
   * @param message
   */
  displayStatus: function (status, message) {
    let el = document.querySelector('.wx-summary');
    let statusClass = {
          inactive: '',
          retrieving: 'wx-transfer-in-progress',
          transferring: 'wx-transfer-in-progress',
          success: 'wx-transfer-success',
          failure: 'wx-transfer-failure'
        }[status]||'';
    el.classList.remove(
        'wx-transfer-in-progress',
        'wx-transfer-success',
        'wx-transfer-failure');
    el.classList.add(statusClass);
    $('#status').text(message);
  },

  makeStateListHTML: function () {
    let out = '<div><label><input type="checkbox" id="state-all" class="select-all" checked="checked" />all states</label></div>';
    let stateAttribute = app.allAttributes.State;
    if (app.states) {
      app.states.forEach(function (state) {
        let id = 'state-' + state.state_code;
        let name = stateAttribute.categories[state.state_code];
        out += '<div><label><input type="checkbox" id="' + id + '" class="select-item"/>' + name + '</label></div>';
      });
    }
    return out;
  },

  makeYearListHTML: function () {
    function availablePresetsHTML(year) {
      let avail = app.presetStates && app.presetStates.find(function (st) {return st.yr === Number(year);});
      if (avail) {
        return '<span class="presets-count">(' + avail.avail + ')</span>';
      } else {
        return '';
      }
    }
    let out = '';
    let checked = '';
    if (app.years) {
      app.years.forEach(function (year) {
        let id = 'year-' + year.year;
        out += '<div><label><input type="checkbox" id="' + id + '" class="select-item"'
            + checked + '/>' + year.year + '</label>' /*+ availablePresetsHTML(year.year) */+ '</div>';
        checked = '';
      });
    }
    return out;
  },

  makeBasicCheckboxesHTML: function () {
    let out = "";

    app.config.attributeGroups.forEach( (g)=>{
      out += '    <div class="wx-dropdown wx-up">\n';
      out += '      <div class="wx-section-header-line wx-dropdown-header">';
      out += `        <span class="wx-section-title">${g.title}</span>`;
      out += '        <span class="wx-selection-count"></span>';
      out += '        <span class="wx-user-selection"></span>';
      out += '        <span class="wx-dropdown-indicator"></span>';
      out += '      </div>';
      out += '      <div class="wx-dropdown-body">';
      out += this.makeOneGroupOfCheckboxesHTML(g);
      out += '      </div>';
      out += '    </div>';
    });

    return out;
  },

  makeOneGroupOfCheckboxesHTML: function (iGroupObject) {
    let out = "";

    out += '<table class="attributeCheckboxes">\n';
    out += '<thead><tr><th>&nbsp;</th><th>Attribute</th>' +
        '<th><label><input type="checkbox" class="show-attr-description-checkbox" />Show descriptions</label></th></tr></thead>';
    for (let attName in app.allAttributes) {
      if (app.allAttributes.hasOwnProperty(attName)) {
        const tAtt = app.allAttributes[attName];    //  the attribute
        // noinspection EqualityComparisonWithCoercionJS
        if (tAtt.groupNumber == iGroupObject.number) {     //  not === because one may be a string
          if (tAtt.displayMe) {
            tAtt.hasCheckbox = true;        //  redundant
            out += '<tr>';
            out += '<td><input class="select-item" type ="checkbox" id = "' +
                tAtt.checkboxID + '" ></td>\n';
            out += '<td colspan="2"><span class="attNameBold">'
                + tAtt.title + ' </span>';
            out += '<span class="attr-description">' + tAtt.description + '</span></div>\n';
            out += "</tr>\n";
          }
        }
      }
    }
    out += "</table>\n";
    return out;
  },


  refreshSampleSummary: function () {
    function makeList(array) {
      let rtn = '';
      if (array && array.length > 0) {
        let length = array.length;
        if (length === 1) {
          rtn = array[0];
        } else if (length === 2) {
          rtn = `${array[0]} and ${array[1]}`;
        } else {
          rtn = array.join(', ');
        }
      }
      return rtn;
    }
    // const tSampleSize = app.userActions.getSelectedSampleSize();
    // const tNumPartitions = app.getPartitionCount();
    // const tSurveys = app.state.selectedYears
    //     .map(function (year) {return (year % 10)?'acs':'census';})
    //     .reduce(function (acc, survey) { acc[survey] = true; return acc; }, {});
    // const surveyMap = {
    //   acs: ' from the <a href=\'https://www.census.gov/programs-surveys/acs\' target=\'_blank\'>American Community Survey</a>.',
    //   census: ' from decennial census data.',
    //   'acs,census': ' from decennial census data and the <a href=\'https://www.census.gov/programs-surveys/acs\' target=\'_blank\'>American Community Survey</a>.',
    //   'none': '.'
    // };


    // let out = "";
    const stateAttr = app.allAttributes.State;
    let states = app.state.selectedStates.map(function (st) { return stateAttr.categories[Number(st)]; });

    let statesLength = states.length || '&nbsp;';
    if (states.length === 0) {
      states = ['all'];
    }

    let years = app.state.selectedYears;
    let attrs = app.state.selectedAttributes;

    let attrCountEl = document.querySelector('#attribute-section .wx-selection-count');
    let attrListEl = document.querySelector('#attribute-section .wx-user-selection');
    let statesCountEl = document.querySelector('#states-section .wx-selection-count');
    let statesListEl = document.querySelector('#states-section .wx-user-selection');
    let yearsCountEl = document.querySelector('#years-section .wx-selection-count');
    let yearsListEl = document.querySelector('#years-section .wx-user-selection');

    if (attrCountEl && attrs) attrCountEl.innerHTML = attrs.length;
    if (attrListEl && attrs) attrListEl.innerHTML = makeList(attrs);
    if (statesCountEl && states) statesCountEl.innerHTML = statesLength;
    if (statesListEl && states) statesListEl.innerHTML = makeList(states);
    if (yearsCountEl && years) yearsCountEl.innerHTML = years.length;
    if (yearsListEl && years) yearsListEl.innerHTML = makeList(years);
    let subsectionCountEls = document.querySelectorAll(
        '#chooseAttributeDiv .wx-selection-count');
    function findAncestorElementWithClass(el, myClass) {
      while (el !== null && el.parentElement !== el) {
        if (el.classList.contains(myClass)) {
          return el;
        }
        el = el.parentElement;
      }
    }

    subsectionCountEls.forEach(function (el) {
      let parentEl = findAncestorElementWithClass(el, 'wx-dropdown');
      let checkedEls = parentEl.querySelectorAll('.select-item:checked');
      el.innerHTML = checkedEls.length;
    });
  }
};
