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
  var kDefaultUpdateInterval = 5; // minutes

  // persistent state
  var myState = null;

  var DataSetManager = function () {
    var kAttrPrefix = 'attr_';

    /**
     * {{
     *  id: {number}
     *  attrs: {[{string}]},
     *  csvURL: {string},
     *  dataSetName: {string},
     *  firstLineIsHeader: {boolean},
     *  indexAttribute: {string},
     *  lineCount: {number},
     *  rowHashes: {[{string}]},
     *  lastFetch: {Date},
     *  stats: {},
     *  step: {'#start-step'||'#load-step'||'#run-step'||'#no-step'},
     *  updateInterval: {number}
     * }}
     */
    var pState;
    var dataSet;
    var updateTimer;

    function hash(str) {
      var hash = 5381, i = str.length;

      while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);// eslint-disable-line no-bitwise
      }

      /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
       * integers. Since we want the results to be always positive, convert the
       * signed int to an unsigned by doing an unsigned bitshift. */
      return hash >>> 0; // eslint-disable-line no-bitwise
    }

    function inferDataSetNameFromURL(url) {
      var name = url && url.replace(/[^\/]*\//g, '').replace(/\.[^.]*$/, '');
      logMessage("extracted name: " + name + " from url: " + url);
      return name;
    }

    function normalizeDataSetName(name) {
      return name.replace(/\./g, '_').replace(/ /g, '_');
    }

    return {
      init: function (st) {
        pState = st || {};
      },

      getName: function() {
        return pState.dataSetName;
      },

      handleDataLoad: function (data) {
        try {
          var result = Papa.parse(data, {skipEmptyLines: true, comment: '#'});
          dataSet = result.data;
          this.setStats(pState.csvURL, dataSet);
          pState.lastFetch = new Date();
          if (pState.step === '#run-step') {
            this.populateDataSet(dataSet, pState.firstLineIsHeader)
                .then(null, function (msg) {
                  displayError(msg);
                });
            if (this === getCurrentDataSetManager()) {
              render(pState);
            }
          } else {
            this.setStep('#load-step');
          }
        } catch (ex) {
          displayError(ex);
        }
      },

      setStats: function (url, data) {
        var cols = data.reduce(function (sum, row) {
          return Math.max(sum, row.length);
        }, 0);
        var rows = data.length;
        pState.stats = {cols: cols, rows: rows};
        pState.dataSetName = inferDataSetNameFromURL(url);
        // render(pState);
      },

      setStep: function setStep(st) {
        pState.step = st;
        render(pState);
      },

      fetchDataAndSetUpdateTimer: function fetchDataAndSetUpdateTimer() {
        var timeout = (pState.updateInterval || kDefaultUpdateInterval) * 60 * 1000;
        if (pState.step === '#run-step') {
          this.fetchCSVData();
        }
        console.log('timeout: ' + pState.step + ', dataSet: ' + pState.dataSetName);
        updateTimer = window.setTimeout(this.fetchDataAndSetUpdateTimer.bind(this),
            timeout);
      },

      fetchCSVData: function (csvURL) {
        var url = csvURL || pState.csvURL;
        if (!url) {
          pState.step = '#start-step';
        } else {
          $.ajax(url, {
            header: {
              Accept:'text/csv'
            },
            success: this.handleDataLoad.bind(this),
            error: function (jqXHR) {
              displayError('Error: ' + jqXHR.statusText);
            }
          });
        }
      },

      createAndPopulateDataSet: function (dataSetName, firstLineIsHeader) {
        pState.dataSetName = normalizeDataSetName(dataSetName);
        pState.firstLineIsHeader = firstLineIsHeader;
        this.createDataSet(pState.dataSetName, firstLineIsHeader, dataSet).then(
            function (rslt) {
              var dataSetName = rslt && rslt.success && rslt.values.name;
              if (dataSetName !== null && dataSetName !== undefined) {
                this.createCaseTable(dataSetName);
              } else {
                return Promise.reject('Error creating case table');
              }
            }.bind(this)).then(function () {
          return this.populateDataSet(dataSet, firstLineIsHeader);
        }.bind(this)).then(function () {
          return this.setStep('#run-step');
        }.bind(this)).then(null, function (err) {
          displayError(err);
        });
      },

      createDataSet: function (name, firstLineIsHeader, dataSet) {
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
          return attrs;
        }

        var req = {
          action: 'create', resource: 'dataContext', values: {
            name: name, collections: [{
              name: name, attrs: []
            }]
          }
        };
        pState.attrs = nameAttrs(pState.stats.cols,
            firstLineIsHeader && dataSet[0] ? dataSet[0] : []);
        req.values.collections[0].attrs = pState.attrs.map(function (attr) {
          return {name: attr};
        });
        // generate random name for indexAttribute and add it to collection
        pState.indexAttribute = "index" + Math.round(Math.random() * 99999999);
        req.values.collections[0].attrs.push(
            {name: pState.indexAttribute, hidden: true});
        return codapInterface.sendRequest(req);
      },

      createItems: function (items) {
        var req = {
          action: 'create',
          resource: 'dataContext[' + pState.dataSetName + '].item',
          values: items
        };
        if (items && (items.length > 0)) {
          displayMessage('Updated data set "' + pState.dataSetName + '" from "' + pState.csvURL + '"');
          return codapInterface.sendRequest(req);
        } else {
          return Promise.resolve({success: true});
        }
      },

      populateDataSet: function populateDataSet(dataSet, firstLineIsHeader) {

        function makeItem(row, rowHash, pState) {
          var item = {};
          var attrs = pState.attrs;
          row.forEach(function (cell, ix) {
            item[attrs[ix]] = cell;
          });
          pState.rowHashes[pState.lineCount] = rowHash;
          item[pState.indexAttribute] = pState.lineCount++;
          return item;
        }

        // 1. create map of row hashes to array of row keys;
        if (!dataSet) {
          return;
        }
        var rowHashMap = {};
        var deleteRowRequests = [];
        var itemsToAdd = [];
        if (!pState.rowHashes) {
          pState.rowHashes = [];
          pState.lineCount = 0;
        }
        pState.rowHashes.forEach(function (rowHash, ix) {
          if (!rowHashMap[rowHash]) {
            rowHashMap[rowHash] = [];
          }
          rowHashMap[rowHash].push(ix);
        });
        //console.log('rowHashes: ' + JSON.stringify(pState.rowHashes));

        // 2. for each row in dataSet
        // 2a.  compute hash.
        // 2b.  if hash exists in map, pop from map and, if map entry is empty, remove it
        // 2c.  if hash not in map, it is a new row: add to new row array
        dataSet.forEach(function (row, ix) {
          try {
            if (!(ix === 0 && firstLineIsHeader) && row.length > 0) {
              var h = hash(JSON.stringify(row));
              if (rowHashMap[h]) {
                rowHashMap[h].pop(h);
                if (rowHashMap[h].length === 0) {
                  delete rowHashMap[h];
                }
              } else {
                itemsToAdd.push(makeItem(row, h, pState));
              }
            }
          } catch (ex) {
            console.warn(ex);
          }
        });
        // 3. for each map entry, prepare delete/itemBySearch request
        Object.keys(rowHashMap).forEach(function (key) {
          rowHashMap[key].forEach(function (rowID) {
            //console.log("deleting row " + rowID + "with hash " + key);
            delete pState.rowHashes[rowID];
            deleteRowRequests.push({
              action: 'delete',
              resource: 'dataContext[' + pState.dataSetName + '].itemSearch[' + pState.indexAttribute + '==' + rowID + ']'
            });
          });
        });
        return codapInterface.sendRequest(deleteRowRequests).then(
            this.createItems(itemsToAdd));
      },
      createCaseTable: function (dataSetID) {
        return codapInterface.sendRequest({
          action: 'create', resource: 'component', values: {
            type: 'caseTable', dataContext: dataSetID
          }
        });
      },
      setCSVURL: function (url) {
        pState.csvURL = url;
        if (pState.csvURL && pState.csvURL.length > 0) {
          getCurrentDataSetManager().fetchCSVData(pState.csvURL);
        }
      },
      setUpdateInterval: function (interval) {
        pState.updateInterval = interval;
        if (updateTimer) {
          clearTimeout(updateTimer);
        }
        this.fetchDataAndSetUpdateTimer();
      }
    };
  };

  var dataSetManagers = [];

  function getCurrentDataSetManager() {
    var currentIndex = myState.currentIndex || 0;
    var currentDSM = dataSetManagers[currentIndex];
    if (!currentDSM) {
      currentDSM = new DataSetManager();
      if (!myState.dataSets[currentIndex]) {myState.dataSets[currentIndex] = {id:currentIndex};}
      currentDSM.init(myState.dataSets[currentIndex]);
      dataSetManagers.push(currentDSM);
    }
    return currentDSM;
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

  function render(state) {
    $('.step').removeClass('active');
    $(state.step).addClass('active');
    $('.csv-url').text(state.csvURL || '');
    $('.csv-cols').text(state.stats && state.stats.cols || '');
    $('.csv-rows').text(state.stats && state.stats.rows || '');
    $('.data-set-name.selected').text(state.dataSetName);
    $('#data-set-name').val(state.dataSetName);
    $('.first-line-is-header').text(state.firstLineIsHeader);
    $('.last-fetch').text(
        state.lastFetch ? state.lastFetch.toLocaleString() : '');
    $('#update-interval').val(state.updateInterval || kDefaultUpdateInterval);
  }

  function renderTabs(activeTab, dataSets) {
    var $lastTab = $('#new-tab', '.tab-bar');
    $('.tab.data-set-name', '.tab-bar').remove();
    dataSets.forEach(function (dataSet, ix) {
      addTab(ix, $lastTab, dataSet.dataSetName, activeTab === ix);
    });
  }

  function addTab(index, $lastTab, name, doSelect) {
    if (doSelect) {
      $('.tab.selected').removeClass('selected');
    }
    var $newChild = $('<div>').addClass('tab data-set-name').prop('id', 'tab-'+index);
    if (doSelect) {
      $newChild.addClass('selected');
    }
    if (name) {
      $newChild.text(name);
    }
    $newChild.insertBefore($lastTab);
  }

  $('#source-form').on('submit', function (ev) {
    getCurrentDataSetManager().setCSVURL($('#csv-url-entry').val());
    ev.preventDefault();
    return false;
  });

  $('#load-form').on('submit', function (ev) {
    var dataSetName = $('#data-set-name').val();
    var firstLineIsHeader = $('#csv-first-line-is-header').is(':checked');
    if (dataSetName && dataSetName.length > 0) {
      getCurrentDataSetManager().createAndPopulateDataSet(dataSetName, firstLineIsHeader);
    } else {
      displayError('Please set data set name');
    }
    ev.preventDefault();
    return false;
  });

  $('#run-form').on('submit', function (ev) {
    getCurrentDataSetManager().fetchDataAndSetUpdateTimer();
    ev.preventDefault();
    return false;
  });

  $('.restart-button').on('click', function () {
    getCurrentDataSetManager().setStep('#start-step');
  });

  $('#update-interval').on('change', function () {
    var interval = $('#update-interval').val();
    if (!isNaN(interval)) {
      getCurrentDataSetManager().setUpdateInterval(interval);
    } else {
      displayError("Interval must be a number(minutes)");
    }
  });

  $('#new-tab').on('click', function () {
    var $this = $(this);
    myState.currentIndex = myState.dataSets.length;
    getCurrentDataSetManager().setStep('#start-step');
    addTab(myState.currentIndex, $this, 'new', true);
  });

  $('.tab-bar').on('click', '.tab.data-set-name', function (ev) {
    var $this = $(this);
    $('.tab.selected').removeClass('selected');
    $this.addClass('selected');
    var id = $this[0].id;
    myState.currentIndex = Number(id.replace(/tab-/, ''));
    render(myState.dataSets[myState.currentIndex]);
  });


  // converts from initial, one-source version to multisource.
  function convertState(st) {
    var key;
    var oldState = {};
    var dataSets = [oldState];
    if (!st.dataSets) {
      for (key in st) {
        if (st.hasOwnProperty(key)) {
          oldState[key] = st[key];
          delete st[key];
        }
      }
      st.currentIndex = 0;
      st.dataSets = dataSets;
      st.version = 1.0;
    }
    return (st);
  }

  function initializeApplication(state) {
    console.log(JSON.stringify(state));
    dataSetManagers = state.dataSets.map(function (dataSet) {
      var dsm = new DataSetManager();
      dsm.init(dataSet);
      return dsm;
    });
    var dataSetManager = getCurrentDataSetManager();
    dataSetManager.fetchCSVData();
    renderTabs(myState.currentIndex, myState.dataSets);
    render(state.dataSets[state.currentIndex]);
    dataSetManagers.forEach(function (dataSetManager) {
      dataSetManager.fetchDataAndSetUpdateTimer();
    });
  }

  codapInterface.init({
    name: 'live-data-set',
    title: 'Live Data Set',
    dimensions: {width: 300, height: 240},
    version: '1.0',
    preventDataContextReorg: false
  }).then(function (/*iResult*/) {
    // get interactive state so we can save the sample set index.
    myState = codapInterface.getInteractiveState();
    myState = convertState(myState);
    initializeApplication(myState);
  }, function () {
    dataSetManagers = [new DataSetManager({step: '#no-step'})];
  });
});