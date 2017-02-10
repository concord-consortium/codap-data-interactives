// ==========================================================================
//
//  Author:   Noah Paessel, adapted from CollaborationService by Doug Martin
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
/*global console:true,iframePhone:true,React:true, ReactDOM:true, firebase:true */

var STATE_STARTING = 'initialized',
    POLLING_INTERVAL = 10000,
    STEP_GET_DATA="getData",
    STEP_READY="ready";

var WIZARD_STEPS = [
  STEP_GET_DATA,
  STEP_READY
];
var dataManager = Object.create({
  lastHash: "",
  state: null,
  init: function () {
    this.listeners = [];
    this.collaborationContexts = {};
    this.state = {
      title: "Sheet Service",
      version: "0.1",
      dimensions: {
        width: 300,
        height: 200
      },
      wizardStep: 'getData',
      googleDocId: "1MvggTC120l680AWiu3bl7ThHCiDC2WIqEuRZjydOS3U",
      range: "A:B",
      googleState: STATE_STARTING,
      connected: false,
      rows: [],
      indexColumn: 0,
      columnNames: []
    };
    return this;
  },

  getPersistentState: function () {
    var state = this.state;
    return {
      wizardStep: state.wizardStep,
      googleDocId: state.googleDocId,
      range: state.range,
      indexColumn: state.indexColumn
    };
  },

  setPersistentState: function(state) {
    this.updateStateProperty('wizardStep', state.wizardStep);
    this.updateStateProperty('googleDocId', state.googleDocId);
    this.updateStateProperty('range', state.range);
    this.updateStateProperty('indexColumn', state.indexColumn);
  },

  register: function (listener) {
    this.listeners = this.listeners || [];
    this.listeners.push(listener);
    listener.setState(this.state);
  },

  notify: function() {
    var hash = JSON.stringify(this.state);
    if(this.lastHash != hash) {
      this.listeners.forEach(function (listener) {
        listener.setState(this.state);
      }.bind(this));
      this.lastHash = hash;
      console.log(hash)
    };
  },

  getState: function () {
    return this.state;
  },

  updateStateProperty: function (property, value, skipNotify) {
    this.state[property] = value;
    if (!skipNotify) {
      this.notify();
    }
  },

  setConnectionState: function (googleState) {
    this.updateStateProperty('googleState', googleState);
  },

  setWizardStep: function (wizardStep) {
    if (wizardStep === 'promptForGroupname') {
      this.getOrGenerateCollaborationKey();
    }
    else if ((wizardStep === 'promptForUsername') || (wizardStep === 'showActiveUsers')) {
      if (wizardStep === 'showActiveUsers') {
        this.initializeCollaboration();
      }
    }
    this.updateStateProperty('wizardStep', wizardStep);
  },


  setConnected: function (connected) {
    this.updateStateProperty('connected', connected);
  },


}).init();


// Client ID and API key from the Developer Console
var CLIENT_ID = '976953547401-38erll1421901bs0m00c77lr19sj5km7.apps.googleusercontent.com';
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var dispatcher = Object.create({
  initClient: function () {
    var self = this;
    gapi.client.init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(self.updateSigninStatus);

      // Handle the initial sign-in state
      self.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

    });
  },


  init: function () {
    this.connection = codapConnector.init(dataManager);
    return this;
  }
}).init();

var div = React.DOM.div,
    form = React.DOM.form,
    button = React.DOM.button,
    label = React.DOM.button,
    input = React.DOM.input;

var WizardStepView = React.createFactory(React.createClass({
  render: function () {
    return div({className: 'wizard-step'},
      this.props.children,
      div({className: 'nav-buttons'},
        this.props.back ? button({onClick: this.props.back}, '<< Back') : null,
        this.props.forward ? button({onClick: this.props.forward, className: 'next-button', disabled: !!this.props.disableForward}, 'Next >>') : null,
        this.props.done ? button({onClick: this.props.done, className: 'done-button'}, 'Done') : null
      )
    );
  }
}));

var SheetsView = React.createFactory(React.createClass({
  getInitialState: function () {
    return dataManager.getState();
  },

  getInitialState: function () {
    var state = dataManager.getState();
    state.pollingInterval = POLLING_INTERVAL;
    return state;
  },

  componentDidMount: function () {
    dataManager.register(this);
  },

  stepForward: function () {
    this.nextWizardStep("forward");
  },

  stepBack: function () {
    this.nextWizardStep("backward");
  },

  onLastStep: function() {
    var lastIndex = WIZARD_STEPS.length -1;
    return this.state.wizardStep == WIZARD_STEPS[lastIndex];
  },

  nextWizardStep: function (direction) {
    var currentIndex = WIZARD_STEPS.indexOf(this.state.wizardStep) || 0;
    var newIndex = direction === "forward" ? currentIndex + 1 : Math.max(0, currentIndex - 1);
    var newStep = WIZARD_STEPS[newIndex];

      dataManager.setWizardStep(newStep, false);
  },

  validDocId: function() {
    return true;
  },

  validRange: function() {
    return true;
  },


  error: function(response) {
    console.log("error");
    console.log(response);
  },

  loadSheetData: function(response) {
    var values = JSON.parse(response);
    var rows = [];
    var columnNames = [];
    if (values && values.length > 1) {
      columnNames = values[0];
      rows = values.slice(1);
      dataManager.updateStateProperty('rows', rows, true);
      dataManager.updateStateProperty('columnNames', columnNames);
    }
    if (this.state.pollingInterval > POLLING_INTERVAL) { this.backOn(); }
    this.timeout = null;
    this.requestSheetData();
  },

  failSheetData: function(response) {
    this.error(response);
    this.backOff();
    this.timeout = null;
    this.requestSheetData();
  },

  backOff: function() {
    var pollingInterval = this.state.pollingInterval * 2;
    this.setState({pollingInterval: pollingInterval});
  },

  backOn: function() {
    var pollingInterval = Math.max(POLLING_INTERVAL, this.state.pollingInterval / 2);
    this.setState({pollingInterval: pollingInterval});
  },

  requestSheetData: function() {
    var url = "https://staff.concord.org/~emcelroy/dset-app/data.php"
    if (this.timeout) { return; }
    var request = function() {
      $.ajax({
        url: url,
        success: this.loadSheetData,
        error: this.failSheetData
      });
    };
    this.timeout = setTimeout(request.bind(this), this.state.pollingInterval);
  },

  // this method is dynamically invoked based on wizard step name.
  getDataCard: function () {
    var docChangedF         = function(evt) { dataManager.updateStateProperty('googleDocId', evt.target.value) };
    var rangeChangedF       = function(evt) { dataManager.updateStateProperty('range', evt.target.value) };
    // var indexColumnChangedF = function(evt) { dataManager.updateStateProperty('indexColumn', evt.target.value) };
    return div({},
      div({className: 'formRow'},
        label({}, "document ID:"),
        input(
          {
            type: "text",
            ref: "googleDocId",
            value: this.state.googleDocId,
            onChange: docChangedF
          })
      ),
      div({className: 'formRow'},
        label({}, "Value Range:"),
        input(
          {
            type: "text",
            ref: "range",
            value: this.state.range,
            onChange: rangeChangedF
          })
      )
    );
  },

  readyCard: function (){
    this.requestSheetData();
    var intervalSeconds = Math.round(this.state.pollingInterval / 1000);
    return div({}, "Now polling your json rows into CODAP every " + intervalSeconds + " seconds.");
  },

  render: function () {
    var wizardStep = this.state.wizardStep;

    var renderFunctionName = wizardStep + "Card";
    var renderCardFunc = this[renderFunctionName];
    var disableForward = (!(this.validDocId() && this.validRange()));
    var forward = this.onLastStep() ? null : this.stepForward;

    return WizardStepView({
        forward: forward,
        back: this.stepBack,
        disableForward: disableForward
      },
      div({className: 'techinfo'}, wizardStep),
      renderCardFunc()
    );
  }
}));

ReactDOM.render(SheetsView({}), document.getElementById('container'));

