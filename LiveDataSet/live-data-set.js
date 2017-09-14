// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2017 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
/*global $:true, Papa:true, codapInterface:true, Promise:true*/
$(function () {
  // constants
  var kDefaultUpdateInterval=5; // minutes
  var kAttrPrefix = 'attr_';

  // persistent state
  var myState = {
    attrs: [],
    csvURL: null,
    dataSetName: null,
    firstLineIsHeader: null,
    lastFetch: null,
    stats: {},
    step: null,
    updateInterval: null
  };

  // transient state
  var dataSet;
  var updateTimer;

  function handleDataLoad(data) {
    try {
      var result = Papa.parse(data, {skipEmptyLines:true});
      dataSet = result.data;
      setStats(myState.csvURL, dataSet);
      myState.lastFetch = new Date();
      if (myState.dataSetName) {
        populateDataSet(dataSet, myState.firstLineIsHeader);
        render();
      } else {
        setStep('#load-step');
      }
    } catch (ex) {
      displayError(ex);
    }
  }

  function getName(url) {
    var name = url && url.replace(/[^\/]*\//g, '').replace(/\.[^.]*$/, '');
    logMessage("extracted name: " + name + " from url: " + url);
    return name;
  }

  function setStats(url, data) {
    var cols = data.reduce(
        function (sum, row) {return Math.max(sum, row.length);}, 0);
    var rows = data.length;
    myState.stats = {cols: cols, rows: rows};
    $('#data-set-name').val(getName(url));
  }

  function setStep(st) {
    myState.step = st;
    render();
  }

  function fetchDataAndSetUpdateTimer () {
    var timeout = (myState.updateInterval || kDefaultUpdateInterval) * 60 * 1000;
    if (myState.step === '#run-step') {
      fetchCSVData(myState.csvURL);
    }
    console.log('timeout: ' + myState.step);
    updateTimer = window.setTimeout(fetchDataAndSetUpdateTimer, timeout);
  }

  function fetchCSVData(csvURL) {
    $.ajax(csvURL, {
      success: handleDataLoad,
      error: function(jqXHR) {
        displayError('Error: ' + jqXHR.statusText);
      }
    });
  }

  function createAndPopulateDataSet(dataSetName, firstLineIsHeader) {
    myState.dataSetName = dataSetName;
    myState.firstLineIsHeader = firstLineIsHeader;
    createDataSet(dataSetName, firstLineIsHeader, dataSet).then(function (rslt) {
      var dataSetName = rslt && rslt.success && rslt.values.name;
      if (dataSetName !== null && dataSetName !== undefined) {
        createCaseTable(dataSetName);
      } else {
        return Promise.reject('Error creating case table');
      }
    }).then(function () {
      populateDataSet(dataSet, firstLineIsHeader);
    }).then(function (){
      setStep('#run-step');
    }).then(null,
        function (err) {
          displayError(err);
        }
    );
  }

  function createDataSet(name, firstLineIsHeader, dataSet) {
    function nameAttrs(cols, firstLine) {
      var attrs = [];
      var ix;
      for (ix = 0; ix < cols; ix++) {
        if (firstLine[ix] !== null && firstLine[ix] !== undefined) {
          attrs[ix] = firstLine[ix];
        } else {
          attrs[ix] = kAttrPrefix + ix;
        }
      }
      myState.attrs = attrs;
      return attrs;
    }
    var req = {
      action: 'create',
      resource: 'dataContext',
      values: {
        name: name,
        collections: [{
          name: name, attrs: []
        }]
      }
    };
    myState.attrs = nameAttrs(myState.stats.cols, firstLineIsHeader && dataSet[0]? dataSet[0]: []);
    req.values.collections[0].attrs = myState.attrs.map(function (attr) { return {name: attr};});
    return codapInterface.sendRequest(req);
  }

  function cleanDataSet(dataSetName) {
    var getDataSetReq = {
      action: 'get',
      resource: 'dataContext[' + dataSetName + ']'
    };
    var deleteCasesReq = {
      action: 'delete',
      resource: null
    };
    return codapInterface.sendRequest(getDataSetReq)
        .then(function (rslt) {
          var context = rslt.values;
          var collectionID = context && (context.collections[0].id);
          if (collectionID) {
            deleteCasesReq.resource = 'dataContext[' +
                dataSetName + '].collection[' + collectionID + '].allCases';
            return codapInterface.sendRequest(deleteCasesReq);
          } else {
            return Promise.reject('Context error');
          }
        });
  }

  function populateDataSet(dataSet, firstLineIsHeader) {
    var attrs = myState.attrs;
    var req = {
      action: 'create',
      resource: 'dataContext[' + myState.dataSetName + '].item',
      values: []
    };
    dataSet.forEach(function (row, ix) {
      if ( !(ix === 0 && firstLineIsHeader) && row.length>0) {
        var item = {};
        row.forEach(function (v, ix) {
          var key = attrs[ix];
          item[key] = v;
        });
        req.values.push(item);
      }
    });
    return cleanDataSet(myState.dataSetName).then(function () {
      codapInterface.sendRequest(req);
      displayMessage('Updated data set "' + myState.dataSetName +
          '" from "' + myState.csvURL + '"');
    });
  }

  function createCaseTable(dataSetID) {
    return codapInterface.sendRequest({
      action:'create',
      resource: 'component',
      values: {
        type: 'caseTable',
        dataContext: dataSetID
      }
    });
  }

  function displayError(msg) {
    displayMessage($('<span>').addClass('error-msg').text(msg));
  }

  function displayMessage(msg) {
    $('#message-area').html(msg);
  }

  function logMessage(msg) {
    console.log(msg);
  }

  function render() {
    $('.step').removeClass('active');
    $(myState.step).addClass('active');
    $('.csv-url').text(myState.csvURL||'');
    $('.csv-cols').text(myState.stats && myState.stats.cols||'');
    $('.csv-rows').text(myState.stats && myState.stats.rows||'');
    $('.data-set-name').text(myState.dataSetName);
    $('.first-line-is-header').text(myState.firstLineIsHeader);
    $('.last-fetch').text(myState.lastFetch?myState.lastFetch.toLocaleString():'');
    $('#update-interval').val(myState.updateInterval||kDefaultUpdateInterval);
  }

  $('#source-form').on('submit', function (ev) {
    myState.csvURL = $('#csv-url-entry').val();
    if (myState.csvURL && myState.csvURL.length>0) {
      fetchCSVData(myState.csvURL);
    }
    ev.preventDefault();
    return false;
  });

  $('#load-form').on('submit', function (ev) {
    var dataSetName = $('#data-set-name').val();
    var firstLineIsHeader = $('#csv-first-line-is-header').is(':checked');
    if (dataSetName && dataSetName.length > 0) {
      createAndPopulateDataSet(dataSetName, firstLineIsHeader);
    } else {
      displayError('Please set data set name');
    }
    ev.preventDefault();
    return false;
  });

  $('#run-form').on('submit', function (ev) {
    fetchCSVData(myState.csvURL);
    ev.preventDefault();
    return false;
  });

  $('.restart-button').on('click', function () {
    setStep('#start-step');
  });

  $('#update-interval').on('change', function () {
    myState.updateInterval = $('#update-interval').val();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
    fetchDataAndSetUpdateTimer();
  });

  codapInterface.init({
    name: 'live-data-set',
    title: 'Live Data Set',
    dimensions: {width: 300, height: 180},
    version: '0.1',
    preventDataContextReorg: false
  }).then(function (/*iResult*/) {
    // get interactive state so we can save the sample set index.
    myState = codapInterface.getInteractiveState();
    if (myState.csvURL) {
      fetchCSVData(myState.csvURL);
    } else {
      myState.step = '#start-step';
    }
    render();
    fetchDataAndSetUpdateTimer();
  }, function () {setStep('#no-step');});
});