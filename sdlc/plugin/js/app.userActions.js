/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:07 AM
 *
 * Created by Tim Erickson on 8/21/18 9:07 AM
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

app.userActions = {

  pressGetCasesButton : async function() {
    try {
      console.log("get cases!");
      let oData = [];
      app.ui.displayStatus('Fetching data...');
      let tData = await app.DBconnect.getCasesFromDB(app.state.selectedAttributes,
        app.state.selectedStates, app.state.selectedYears);

      //  okay, tData is an Array of objects whose keys are the variable names.
      //  now we have to translate names and values...
      app.ui.displayStatus('Formatting data...');

      tData.forEach( c => {
          //  c is a case object
        let sampleData = c.sample_data;
        let o = { sample : app.state.sampleNumber };
        app.state.selectedAttributes.forEach(function (attrTitle) {
          let attr = app.allAttributes[attrTitle];
          o[attr.title] = attr.decodeValue(sampleData);
        });
        oData.push(o);
      });

      //     make sure the case table is showing

      app.ui.displayStatus('Opening case table...');
      await app.CODAPconnect.makeCaseTableAppear();

      // console.log("the cases: " + JSON.stringify(oData));

      app.ui.displayStatus('Sending data to codap...');
      if (!app.state.keepExistingData) {
        await app.CODAPconnect.deleteAllCases();
      }
      await app.CODAPconnect.saveCasesToCODAP( oData );
      app.ui.displayStatus('');
      app.state.sampleNumber++;
    } catch (ex) {
      console.log(ex);
      app.ui.displayStatus('Error...');
    }
  },

  changeAttributeCheckbox : function(iAttName) {
    // const tAtt = app.allAttributes[iAttName];
    //
    // tAtt.chosen = !tAtt.chosen;
    app.updateStateFromDOM('Attribute selection changed.');
  },

  changeSampleYearsCheckbox : function (/*event*/) {
    app.updateStateFromDOM('Sample years changed.');
  },

  changeSampleStateCheckbox : function (/*event*/) {
    // record change of status for selected states and potentially toggle 'all' option
    if ($(this).hasClass('select-all')) {
      $('#chooseStatesDiv .select-item').prop('checked', false);
    }
    // noinspection JSJQueryEfficiency
    let $itemBoxes = $('#chooseStatesDiv .select-item');
    let $allBox = $('#chooseStatesDiv .select-all');
    if ($itemBoxes.filter(':checked').length > 0) {
      $allBox.prop('checked',false);
    } else {
      $allBox.prop('checked', true);
    }
    app.updateStateFromDOM('sample state changed');
  },

  getSelectedAttrs: function () {
    let rslt = [];
    $('#chooseAttributeDiv .select-item:checked').each(function (ix, el) {
      rslt.push(el.id.replace('attr-', ''));
    });
    return rslt;
  },

  getSelectedYears: function () {
    let rslt = [];
    $('#chooseSampleYearsDiv .select-item:checked').each(function (ix, el) {
      rslt.push(el.id.replace('year-', ''));
    });
    return rslt;
  },

  getSelectedStates: function () {
    let rslt = [];
    $('#chooseStatesDiv .select-item:checked').each(function (ix, el) {
      rslt.push(el.id.replace('state-', ''));
    });
    return rslt;
  },

  getSelectedSampleSize: function () {
    let requestedSize = $("#sampleSizeInput")[0].value;
    let numPartitions = app.getPartitionCount();
    let constrainedSize = Math.max(app.constants.kMinCases, Math.min(app.constants.kMaxCases, requestedSize));
    let partitionSize = Math.round(constrainedSize/numPartitions) || 1;
    return partitionSize * numPartitions;
  },

  getKeepExistingDataOption: function () {
    app.state.keepExistingData = $('#keepExistingDataCheckbox').is(':checked');
  }
};