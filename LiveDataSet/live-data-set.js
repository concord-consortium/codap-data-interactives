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
    indexAttribute: null,
    lineCount: 0,
    rowHashes: null,
    lastFetch: null,
    stats: {},
    step: null,
    updateInterval: null
  };

  /**
   * From git://github.com/darkskyapp/string-hash.git
   * @param str
   * @return {number}
   */
  function hash(str) {
    var hash = 5381,
        i    = str.length;

    while(i) {
      hash = (hash * 33) ^ str.charCodeAt(--i);// eslint-disable-line no-bitwise
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0; // eslint-disable-line no-bitwise
  }
  // transient state
  var dataSet;
  var updateTimer;

  function handleDataLoad(data) {
    try {
      var result = Papa.parse(data, {skipEmptyLines:true,comment:'#'});
      dataSet = result.data;
      setStats(myState.csvURL, dataSet);
      myState.lastFetch = new Date();
      if (myState.dataSetName) {
        populateDataSet(dataSet, myState.firstLineIsHeader)
            .then(null, function (msg) {
              displayError(msg);
            });
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
    myState.dataSetName = normalize(dataSetName);
    myState.firstLineIsHeader = firstLineIsHeader;
    createDataSet(myState.dataSetName, firstLineIsHeader, dataSet).then(function (rslt) {
      var dataSetName = rslt && rslt.success && rslt.values.name;
      if (dataSetName !== null && dataSetName !== undefined) {
        createCaseTable(dataSetName);
      } else {
        return Promise.reject('Error creating case table');
      }
    }).then(function () {
      return populateDataSet(dataSet, firstLineIsHeader);
    }).then(function (){
      return setStep('#run-step');
    }).then(null,
        function (err) {
          displayError(err);
        }
    );
  }

  function normalize(name) {
    return name.replace(/\./g, '_').replace(/ /g, '_');
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
    // generate random name for indexAttribute and add it to collection
    myState.indexAttribute = "index" + Math.round(Math.random() * 99999999);
    req.values.collections[0].attrs.push({name: myState.indexAttribute, hidden:true});
    return codapInterface.sendRequest(req);
  }

  function createItems(items) {
    var req = {
      action: 'create',
      resource: 'dataContext[' + myState.dataSetName + '].item',
      values: items
    };
    if (items && (items.length > 0)) {
      displayMessage('Updated data set "' + myState.dataSetName + '" from "' + myState.csvURL + '"');
      return codapInterface.sendRequest(req);
    } else {
      return Promise.resolve({success:true});
    }
  }

  function populateDataSet(dataSet, firstLineIsHeader) {

    function makeItem (row, rowHash) {
      var item = {};
      var attrs = myState.attrs;
      row.forEach(function (cell, ix) {
        item[attrs[ix]] = cell;
      });
      myState.rowHashes[myState.lineCount] = rowHash;
      item[myState.indexAttribute] = myState.lineCount++;
      return item;
    }

    // 1. create map of row hashes to array of row keys;
    if (!dataSet) { return; }
    var rowHashMap = {};
    var deleteRowRequests = [];
    var itemsToAdd = [];
    if (!myState.rowHashes) {myState.rowHashes = []; myState.lineCount = 0; }
    myState.rowHashes.forEach(function(rowHash, ix) {
      if (!rowHashMap[rowHash]) {
        rowHashMap[rowHash] = [];
      }
      rowHashMap[rowHash].push(ix);
    });
    // 2. for each row in dataSet
    // 2a.  compute hash.
    // 2b.  if hash exists in map, pop from map and, if map entry is empty, remove it
    // 2c.  if hash not in map, it is a new row: add to new row array
    dataSet.forEach(function (row, ix) {
      try {
        if ( !(ix === 0 && firstLineIsHeader) && row.length>0) {
          var h = hash(JSON.stringify(row));
          if (rowHashMap[h]) {
            rowHashMap[h].pop(h);
            if (rowHashMap[h].length === 0) {
              delete rowHashMap[h];
            }
          } else {
            itemsToAdd.push(makeItem(row, h));
          }
        }
      } catch(ex){
        console.warn(ex);
      }
    });
    // 3. for each map entry, prepare delete/itemBySearch request
    Object.keys(rowHashMap).forEach(function (key) {
      rowHashMap[key].forEach(function (rowID) {
        delete myState.rowHashes[rowID];
        deleteRowRequests.push({
          action: 'delete',
          resource: 'dataContext[' + myState.dataSetName + '].itemSearch[' +
            myState.indexAttribute + '==' + rowID + ']'
        });
      });
    });
    return codapInterface.sendRequest(deleteRowRequests).then(createItems(itemsToAdd));
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
    console.warn(msg);
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
