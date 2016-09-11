// ==========================================================================
//
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
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
/* jshint strict: false */
/*global console:true,iframePhone:true,React:true, ReactDOM:true */

/**
 * WebServiceFetchFilter: this is an example implementation of a CODAP
 * Data Interactive. It fetches data from a web service, provides controls to
 * permit the user to filter the data according to their needs and interests
 * and presents the data set to CODAP. It responds to manipulations of the data
 * on the CODAP side.
 */

/**
 * This is the interface to the web service.
 */
var webServiceInterface = Object.create({
  init: function (baseUrl) {},
  destroy: function () {},
  fetch: function (path, queryParams, callback) {},
  post: function (path, queryParam, data, callback) {},
  put: function (path, queryParam, data, callback) {}
});

var codapInterface = Object.create({
  connection: new iframePhone.IframePhoneRpcEndpoint(
      this.handleCODAPRequest, "data-interactive", window.parent),
  connectionState: 'init', // ['init', 'active', 'closed']
  init: function () {},
  destroy: function () {},
  handleCODAPRequest: function () {},
  sendRequest: function (message, callBack) {},
  handleResponse: function (request, response) {}
});

/**
 *
 * @type {Object}
 */
var dataManager = Object.create({
  stationsURL: 'http://xmountwashington.appspot.com/mmNew.php',
  reportsURL: 'http://xmountwashington.appspot.com/mhNew.php?startTime=%@&station=%@&version=2',
  stationDataSetDefinition: {
    name: 'stations',
    collections: [
      {
        name: 'stations',
        attrs: [
          { name: 'station', title: 'station code'},
          { name: 'latitude'},
          { name: 'longitude'}
        ]
      }
    ]
  },
  reportDataSetDefinition: {
    name: 'reports',
    collections: [
      {
        name: 'stations',
        attrs: [
          { name: 'station', title: 'station code'}
        ]
      },
      {
        name: 'reports',
        parent: 'stations',
        attrs: [
          { name: 'Date', title: 'date'},
          { name: 'RH', title: 'humidity'},
          { name: 'Temperature', title: "temp"},
          { name: 'LoggerVoltage', title: 'voltage'},
          { name: 'LoggerT', title: 'logger t'},
          { name: 'WindSpeed', title: 'windspeed'},
          { name: 'WindDirection', title: 'direction'}
        ]
      }
    ]
  },
  codapRequests: {
    initStations: {action: 'create', resource: 'dataContext', values: this.stationDataSetDefinition},
    initReports: {action: 'create', resource: 'dataContext', values: this.reportDataSetDefinition},
    createStations: {action: 'create', resource: 'dataContext[stations].collection[stations].cases'}
  },
  init: function (webServiceInterface, codapInterface, appState) {
    
  }
});

/**
 *
 * @type {Object}
 */
var appState = Object.create({
  stationsList: [],
  selectedStationsList: [],
  startDate: null,
  startTime: null,
  endDate: null,
  endTime: null
});

var WebServiceAppView = React.createClass({
  getInitialState: function () {
    return appState;
  },
  componentDidMount: function () {

  },
  componentDidUnmount: function () {

  },
  render: function () {
    var stationList = this.state.stationsList
    return <form><ol className="station-list">{stationList}</ol></form>
  }
});

webServiceInterface.init();
codapInterface.init();
ReactDOM.render(<WebServiceAppView />,
    document.getElementById('container'));
