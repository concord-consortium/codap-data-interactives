// ==========================================================================
//
//  Author:   Doug Martin, adapted from DataCard by jsandoe
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
/* jshint strict: false */
/*global console:true,iframePhone:true,React:true, ReactDOM:true */

var STARTING_CONNECTION_STATE = 'initialized',
    TIMEDOUT_CONNECTION_STATE = 'timed-out',
    ACTIVE_CONNECTION_STATE = 'active';

var dataManager = Object.create({

  state: null,

  init: function () {
    this.listeners = [];
    this.state = {
      title: "Case Generator",
      version: "0.1",
      dimensions: {
        width: 350,
        height: 200
      },

      wizardStep: 'start',
      numAttributes: 4,
      numCases: 10,
      useParentCase: true
    };
    this.batchNumber = 1;
    return this;
  },

  register: function (listener) {
    this.listeners = this.listeners || [];
    this.listeners.push(listener);
    listener.setState(this.state);
  },

  unregister: function (listener) {
    this.listeners = this.listeners || [];
    var ix = this.listeners.indexOf(listener);
    if (ix >= 0) {
      this.listeners.splice(ix, 1);
    }
    dispatcher.destroy();
  },

  notify: function () {
    this.listeners.forEach(function (listener) {
      listener.setState(this.state);
    }.bind(this));
  },

  setInteractiveFrame: function (frameData) {
    if (frameData.dimensions) {
      this.state.dimensions = frameData.dimensions;
    }
    if (frameData.title) {
      this.state.title = frameData.title;
    }
    if (frameData.savedState) {
      Object.assign(this.state, frameData.savedState);
    }
    dispatcher.sendRequest({
      action: 'update',
      resource: 'interactiveFrame',
      values: {
        title: this.state.title,
        version: this.state.version,
        preventBringToFront: false,
        dimensions: this.state.dimensions
      }
    });
  },

  getPersistentState: function () {
    var state = this.state;
    return {
      wizardStep: state.wizardStep,
      numAttributes: state.numAttributes,
      numCases: state.numCases,
      useParentCase: state.useParentCase
    };
  },

  isDataContextMissing: function (callback) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[CaseGenerator]'
    }, {}, function (req, result) {
      callback(!result || !result.success);
    });
  },

  createDataContext: function (handler) {
    var collections = [{
          name: 'GeneratedCases',
          title: 'Generated Cases'
        }];
    if (this.state.useParentCase) {
      collections.push({
        name: "GeneratedValues",
        title: "Generated Values",
        parent: "GeneratedCases"
      });
    }
    dispatcher.sendRequest({
      action: 'create',
      resource: 'dataContext',
      values: {
        name: 'CaseGenerator',
        title: 'Case Generator',
        collections: collections
      }
    }, {}, handler);
  },

  createAttributes: function (numAttributes, handler) {
    var self = this;
    if (this.state.useParentCase) {
      dispatcher.sendRequest({
        action: 'create',
        resource: 'dataContext[CaseGenerator].collection[GeneratedCases].attribute',
        values: [{
          name: "batch",
          title: "batch"
        }]
      }, {}, function () {
        dispatcher.sendRequest({
          action: 'create',
          resource: 'dataContext[CaseGenerator].collection[GeneratedValues].attribute',
          values: self.attributes
        }, {}, handler);
      });
    }
    else {
      dispatcher.sendRequest({
        action: 'create',
        resource: 'dataContext[CaseGenerator].collection[GeneratedCases].attribute',
        values: this.getAttributesArray()
      }, {}, handler);
    }
  },

  createCases: function (numCases, handler) {
    var cases = [],
        attributes = this.getAttributesArray(),
        numAttributes = attributes.length,
        i, j, attribute, values;
    for (i = 0; i < numCases; i++) {
      values = {};
      for (j = 0; j < numAttributes; j++) {
        attribute = attributes[j];
        values[attribute.name] = Math.round(Math.random() * 100);
      }
      cases.push({
        values: values
      });
    }
    if (this.state.useParentCase) {
      dispatcher.sendRequest({
        action: 'create',
        resource: 'dataContext[CaseGenerator].collection[GeneratedCases].case',
        values: [{
          values: {
            batch: this.batchNumber++
          }
        }]
      }, {}, function (request, response) {
        if (response.success) {
          var parent = response.values[0].id;
          for (i = 0; i < cases.length; i++) {
            cases[i].parent = parent;
          }
          dispatcher.sendRequest({
            action: 'create',
            resource: 'dataContext[CaseGenerator].collection[GeneratedValues].case',
            values: cases
          }, {}, handler);
        }
      });
    }
    else {
      dispatcher.sendRequest({
        action: 'create',
        resource: 'dataContext[CaseGenerator].collection[GeneratedCases].case',
        values: cases
      }, {}, handler);
    }
  },

  getAttributesArray: function () {
    var attributes = [],
        i;
    for (i = 0; i < this.state.numAttributes; i++) {
      attributes.push({
        name: "attr" + (i + 1),
        title: "attribute" + (i + 1)
      });
    }
    return attributes;
  },

  setState: function (newState) {
    var self = this;
    Object.keys(newState).forEach(function (key) {
      self.state[key] = newState[key];
    });

    if ((self.state.wizardStep === "promptForNumCases") && (this.state.numCases > 0)) {

      dataManager.isDataContextMissing(function (missing) {
        if (missing) {
          dataManager.createDataContext(function () {
            dataManager.createAttributes(self.state.numAttributes, function () {
              self.notify();
            });
          });
        }
        else {
          self.notify();
        }
      });
    }
    else {
      this.notify();
    }
  },

  getState: function () {
    return this.state;
  }

}).init();

var dispatcher = Object.create({ // jshint ignore:line

    init: function () {
      this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
      this.connectionState = STARTING_CONNECTION_STATE;
      this.sendRequest({
        "action": "get",
        "resource": "interactiveFrame"
      });
      window.onunload = this.destroy.bind(this);

      return this;
    },

    destroy: function () {
      this.connection.disconnect();
    },

    handleCODAPRequest: function (request, callback) {
      function getResourceType(resourceSelector) {
        return resourceSelector && resourceSelector.match(/^[^[]*/)[0];
      }
      var resourceType = getResourceType(request.resource);
      var success = false;
      var values = null;
      switch (resourceType) {
        case 'interactiveState':
          if (request.action === 'get') {
            success = true;
            values = dataManager.getPersistentState();
          }
          break;
        default:
          console.log('Unsupported request from CODAP to DI: ' +
              JSON.stringify(request));      }
      callback({success: success, values: values});
    },

    sendRequest: function (request, handlingOptions, handler) {
      handler = handler || this.handleResponse.bind(this);
      this.connection.call(request, function (response) {
        handler(request, response, handlingOptions);
      }.bind(this));
    },

    parseResourceSelector: function (iResource) {
      var selectorRE = /([A-Za-z0-9_-]+)\[([^\]]+)]/;
      var result = {};
      var selectors = iResource.split('.');
      selectors.forEach(function (selector) {
        var resourceType, resourceName;
        var match = selectorRE.exec(selector);
        if (selectorRE.test(selector)) {
          resourceType = match[1];
          resourceName = match[2];
          result[resourceType] = resourceName;
          result.type = resourceType;
        } else {
          result.type = selector;
        }
      });

      return result;
    },

    handleResponse: function (request, result, handlingOptions) {
      function handleOneResponse(iRequest, iResult, iResourceType) {
        if (!iResult.success) {
          console.log('Request to CODAP Failed: ' + JSON.stringify(request));
        } else if (request.action === 'get') {
          switch (iResourceType) {
            case 'interactiveFrame':
              dataManager.setInteractiveFrame(iResult.values);
              if (iResult.values.savedState) {
                dataManager.setState(iResult.values.savedState);
              }
              break;
          }
        }
      }
      var resourceObj;
      var STARTING_CONNECTION_STATE = this.connectionState;

      if (!result) {
        console.log('Request to CODAP timed out: ' + JSON.stringify(request));
        this.connectionState = TIMEDOUT_CONNECTION_STATE;
      } else if (Array.isArray(result)) {
        this.connectionState = ACTIVE_CONNECTION_STATE;
        request.forEach(function (rq, rqix) {
          resourceObj  = this.parseResourceSelector(rq.resource);
          handleOneResponse(rq, result[rqix], resourceObj.type);
        }.bind(this));
      } else {
        this.connectionState = ACTIVE_CONNECTION_STATE;
        resourceObj  = this.parseResourceSelector(request.resource);
        handleOneResponse(request, result, resourceObj.type);
      }
      if (STARTING_CONNECTION_STATE !== this.connectionState) {
        dataManager.setState({connectionState: this.connectionState});
      }
    }
  }).init();

var div = React.DOM.div,
    form = React.DOM.form,
    button = React.DOM.button,
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

var GenerateCasesAppView = React.createFactory(React.createClass({
  getInitialState: function () {
    return dataManager.getState();
  },

  componentDidMount: function () {
    dataManager.register(this);
  },

  componentWillUnmount: function () {
    dataManager.unregister(this);
  },

  stepForward: function () {
    this.nextWizardStep("forward");
  },

  stepBack: function () {
    this.nextWizardStep("backward");
  },

  nextWizardStep: function (direction, _currentStep) {
    var wizardSteps = ["start", "promptForNumAttributes", "promptForNumCases"],
        currentStep = _currentStep || this.state.wizardStep,
        currentIndex = wizardSteps.indexOf(currentStep) || 0,
        newIndex = direction === "forward" ? Math.min(wizardSteps.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1),
        newStep = wizardSteps[newIndex];

    dataManager.setState({wizardStep: newStep});
  },

  renderStartStep: function () {
    return div({},
      div({}, "This data interactive helper enables you to generate cases."),
      div({}, "Use the buttons below to navigate through the steps to generate cases.")
    );
  },

  trim: function (s) {
    return s.replace(/^\s+|\s+$/g, "");
  },

  numAttributesChanged: function () {
    var numAttributes = this.trim(this.refs.numAttributes.value);
    if (numAttributes === '') {
      dataManager.setState({numAttributes: numAttributes});
    }
    else {
      numAttributes = parseInt(numAttributes, 10);
      if (!isNaN(numAttributes)) {
        dataManager.setState({numAttributes: numAttributes});
      }
    }
  },

  useParentCaseChanged: function () {
    dataManager.setState({useParentCase: this.refs.useParentCase.checked});
  },

  renderPromptForNumAttributesStep: function () {
    return div({className: 'wizard-step'},
      form({},
        div({}, "Number of attributes per case:"),
        div({}, input({type: "text", ref: "numAttributes", value: this.state.numAttributes, onChange: this.numAttributesChanged})),
        div({},
          input({type: "checkbox", ref: "useParentCase", checked: this.state.useParentCase, onChange: this.useParentCaseChanged}),
          "Use parent case?"
        )
      )
    );
  },

  numCasesChanged: function () {
    var numCases = this.trim(this.refs.numCases.value);
    if (numCases === '') {
      dataManager.setState({numCases: numCases});
    }
    else {
      numCases = parseInt(numCases, 10);
      if (!isNaN(numCases)) {
        dataManager.setState({numCases: numCases});
      }
    }
  },

  submitCreateCases: function (e) {
    e.preventDefault();
    dataManager.createCases(this.state.numCases);
  },

  renderPromptForNumCasesStep: function () {
    return div({className: 'wizard-step'},
      form({onSubmit: this.submitCreateCases},
        div({}, "Number of cases to generate"),
        div({}, input({type: "text", ref: "numCases", value: this.state.numCases, onChange: this.numCasesChanged})),
        div({}, input({type: "submit", disabled: this.state.numCases < 0, value: "Create Cases"}))
      )
    );
  },

  componentDidUpdate: function () {
    if (this.refs.numAttributes) {
      this.refs.numAttributes.focus();
    }
    else if (this.refs.numCases) {
      this.refs.numCases.focus();
    }
  },

  render: function () {
    var wizardStep = this.state.wizardStep;
    if (this.state.connectionState === STARTING_CONNECTION_STATE) {
      return div({}, "Waiting to connect with CODAP...");
    }
    else if ((this.state.connectionState === TIMEDOUT_CONNECTION_STATE) && (window.location.search.indexOf('testOutsideOfCODAP') === -1)) {
      return div({}, "Could not connect with CODAP!");
    }
    else if (wizardStep === "promptForNumAttributes") {
      return WizardStepView({forward: this.stepForward, back: this.stepBack, disableForward: this.state.numAttributes < 1},
        this.renderPromptForNumAttributesStep({})
      );
    }
    else if (wizardStep === "promptForNumCases") {
      return this.renderPromptForNumCasesStep({});
    }
    else /* start step */ {
      return WizardStepView({forward: this.stepForward},
        this.renderStartStep({})
      );
    }
  }
}));

ReactDOM.render(GenerateCasesAppView({}), document.getElementById('container'));

