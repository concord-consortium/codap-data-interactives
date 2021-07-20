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

var POLLING_INTERVAL = 10000,
    STEP_GET_DATA="getData",
    STEP_READY="ready";

var WIZARD_STEPS = [STEP_GET_DATA, STEP_READY ];

var dataManager = Object.create({
  lastHash: "",
  state: null,
  init: function () {
    this.listeners = [];
    this.collaborationContexts = {};
    this.state = {
      title: "Json Service",
      version: "0.1",
      dimensions: {
        width: 300,
        height: 200
      },
      wizardStep: STEP_GET_DATA,
      connected: false,
      url: "",
      rows: [],
      columnNames: []
    };
    return this;
  },

  getPersistentState: function () {
    var state = this.state;
    return {
      wizardStep: state.wizardStep,
      url: state.url
    };
  },

  setPersistentState: function(state) {
    this.updateStateProperty('wizardStep', state.wizardStep);
    this.updateStateProperty('url', state.url);
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
    this.updateStateProperty('wizardStep', wizardStep);
  },


  setConnected: function (connected) {
    this.updateStateProperty('connected', connected);
  },


}).init();


codapConnector.init(dataManager)

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

  loadData: function(response) {
    var values = null;
    try {
      values = JSON.parse(response);
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
      this.requestData();
    }
    catch (exp) {
      this.failData(exp);
    }
  },

  failData: function(response) {
    this.error(response);
    this.backOff();
    this.timeout = null;
    this.requestData();
  },

  backOff: function() {
    var pollingInterval = this.state.pollingInterval * 2;
    this.setState({pollingInterval: pollingInterval});
  },

  backOn: function() {
    var pollingInterval = Math.max(POLLING_INTERVAL, this.state.pollingInterval / 2);
    this.setState({pollingInterval: pollingInterval});
  },

  requestData: function() {
    var url = dataManager.state.url;
    if(!(url && url.length > 1)) { return; }
    if (this.timeout) { return; }
    var request = function() {
      $.ajax({
        url: url,
        success: this.loadData,
        error: this.failData
      });
    };
    this.timeout = setTimeout(request.bind(this), this.state.pollingInterval);
  },

  // this method is dynamically invoked based on wizard step name.
  getDataCard: function () {
    var urlChangedF = function(evt) { dataManager.updateStateProperty('url', evt.target.value) };
    return div({},
      div({className: 'formRow'},
        div({}, "CORS Enabled URL:"),
        input(
          {
            type: "text",
            ref: "url",
            value: this.state.url,
            width: 70,
            onChange: urlChangedF
          })
      )
    );
  },

  readyCard: function (){
    this.requestData();
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
      renderCardFunc()
    );
  }
}));

ReactDOM.render(SheetsView({}), document.getElementById('container'));

