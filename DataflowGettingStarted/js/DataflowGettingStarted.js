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
    ACTIVE_CONNECTION_STATE = 'active',
    RECORDING_DURATION = 60,
    RECORDING_INTERVAL = 1;

// Update constants with optional query param values
window.location.search.substr(1).split("&").forEach(function (pair) {
  var keyValue = pair.split("=");
  var value = parseInt(keyValue[1], 10);
  if (!isNaN(value)) {
    switch (keyValue[0]) {
      case "duration": RECORDING_DURATION = value; break;
      case "interval": RECORDING_INTERVAL = value; break;
    }
  }
});

var replaceConstants = function (s) {
  return s.replace("RECORDING_DURATION", RECORDING_DURATION).replace("RECORDING_INTERVAL", RECORDING_INTERVAL);
};

var div = React.DOM.div,
    p = React.DOM.p,
    span = React.DOM.span,
    h1 = React.DOM.h1,
    ol = React.DOM.ol,
    li = React.DOM.li,
    button = React.DOM.button,
    input = React.DOM.input,
    strong = React.DOM.strong,
    em = React.DOM.em;

var RecordingCountdown = React.createFactory(React.createClass({
  getInitialState: function () {
    return {
      countdown: RECORDING_DURATION
    };
  },

  componentDidMount: function () {
    this.interval = setInterval(this.countdown.bind(this), 1000);
  },

  countdown: function () {
    var countdown = Math.max(0, this.state.countdown - 1);
    if (countdown === 0) {
      clearInterval(this.interval);
    }
    this.setState({countdown: countdown});
  },

  render: function () {
    if (this.state.countdown > 0) {
      return div({className: "countdown-active"}, "Stop in " + this.state.countdown);
    }
    return div({className: "countdown-done"}, "Stop recording!");
  }
}));

var pages = [
  {
    info: div({},
      h1({}, "Welcome to Dataflow!"),
      p({}, "This activity will teach you:"),
      ol({},
        li({}, "How to set up a flow diagram for a new experiment."),
        li({}, "How to export your data to CODAP for analysis.")
      ),
      p({}, "You will need:"),
      ol({},
        li({}, "A Raspberry Pi (RPi) controller that has been pre-authorized by Concord Consortium. ", strong({}, "Plug it in now!")),
        li({}, "At least one working sensor. (But leave that unplugged for now!)")
      ),
      p({}, "See our documentation for more information."),
      p({}, "First step:")
    ),
    postInfo: div({},
      p({}, "Select your RPi from the list when you are ready to begin."),
      p({}, em({}, "Note: If this is your first time using Dataflow, you will need to enter the name of your Pi. Ask your teacher for help!"))
    )
  },
  {
    info: div({},
      p({}, "Next steps:")
    )
  },
  {
    info: div({},
      p({}, "Final steps:")
    )
  }
];

var topics = [
  {
    name: "Dataflow/SelectPi",
    page: 0,
    checkbox: "Select the Raspberry Pi you are using",
    popUpTitle : "Select your Raspberry Pi",
    popUp: div({},
      p({}, "Great! You have connected to your Raspberry Pi controller. Make sure it is plugged in and turned on any time you want to run an experiment or view the data from a previous experiment."),
      p({}, strong({}, "Next: Click on 'New Diagram' to create a new flow diagram."))
    )
  },
  {
    name: "Dataflow/CreateDiagram",
    page: 1,
    checkbox: "Create a new Diagram",
    popUp: div({},
      p({}, "This is a flow diagram. It uses a visual programming language to allow you to control the sensors and actuators in your experiment."),
      p({}, strong({}, "Click on 'Save' to name your diagram now.")),
      p({}, strong({}, "Next: Choose a sensor and plug it in to one of the USB ports on your Raspberry Pi controller."))
    )
  },
  {
    name: "Dataflow/ConnectSensor",
    page: 1,
    checkbox: "Connect a Sensor",
    popUp: div({},
      p({}, "You added a sensor to your diagram!"),
      p({}, "Any sensors or actuators plugged in to your Raspberry Pi will be automatically detected and added as a new block to your flow diagram. You can create connections to other blocks to change its behavior."),
      p({}, strong({}, "Next: Click on 'Add Plot'."))
    )
  },
  {
    name: "Dataflow/AddPlot",
    page: 1,
    checkbox: "Add a Plot",
    popUp: div({},
      p({}, "Plots let you see live data from sensors. Add more blocks to your diagram by plugging in more sensors. Add a relay block or set up different functions to control your experiment."),
      p({}, strong({}, "Next: drag and drop a connector from your sensor block to the plot block to link them."))
    )
  },
  {
    name: "Dataflow/ConnectBlock",
    page: 1,
    checkbox: "Connect the Plot",
    popUp: div({},
      p({}, "Now that the two blocks are connected, you can see that this plot is now graphing the data from your sensor. ", strong({}, "Please note that while you can see this reading, data is NOT being recorded yet."), " Make sure your experiment is in place, and your diagram is correct set up before you start recording data."),
      p({}, strong({}, "Next: Click on 'Start Recording Data!"))
    )
  },
  {
    name: "Dataflow/StartRecordingData",
    page: 1,
    checkbox: "Start recording data",
    popUp: div({},
      p({}, "When you click on the button to start recording data, Dataflow will ask you how frequently it should record (in seconds). For a short experiment, set this to collect every 1 second, but with an experiment lasting several days, consider taking a reading every hour (3600 seconds). For this activity, make sure to collect data frequently so that we don't have to wait for it!"),
      p({}, strong({}, replaceConstants("For this activity, set it to RECORDING_INTERVAL.")))
    )
  },
  {
    name: "Dataflow/SetUpdateRate",
    page: 1,
    checkbox: "Set up data collection",
    popUp: div({},
      p({}, "Data is now being saved to your Raspberry Pi!"),
      p({}, span({}, "Next: In ", strong({}, replaceConstants("RECORDING_DURATION seconds")), span({}, " click 'Stop Recording Data' so that we can explore the data."))),
      RecordingCountdown({})
    )
  },
  {
    name: "Dataflow/StopRecordingData",
    page: 1,
    checkbox: "Stop recording data",
    popUp: div({},
      p({}, "Data collection is now paused. You can start recording data again at any time."),
      p({}, strong({}, "Next: Click on 'View Recorded Data'."))
    )
  },
  {
    name: "Dataflow/ViewRecordedData",
    page: 2,
    checkbox: "View recorded data",
    popUp: div({},
      p({}, "This is where you can see all of your recorded data and choose what to export to CODAP for analysis."),
      p({}, strong({}, "Next: Click on 'Select Interval' to highlight the data you want."))
    )
  },
  {
    name: "Dataflow/StartSelectDataToExport",
    page: 2,
    checkbox: "Select data to export",
    popUp: div({},
      p({}, "Now you click anywhere on the graph to select the range of data you want to analyze. This might be all of the data you have collected, or it might be a single run of an experiment."),
      p({}, strong({}, "Next: Click on 'Explore Data in CODAP!'"))
    )
  },
  {
    name: "Dataflow/ExportDataToCODAP",
    page: 2,
    checkbox: "Export to CODAP",
    popUp: div({},
      p({}, "You're done! Now that your data is in CODAP, you can analyze it just like any other dataset. You can save this document for later, or you can choose to export the data again."),
      p({}, "To learn more about what you can do in CODAP, try our Getting Started with CODAP guide!")
    )
  }
];

var dataManager = Object.create({

  state: null,

  init: function () {
    var tester = window.location.search.indexOf("tester") !== -1;
    this.listeners = [];
    this.attributes = [];
    this.state = {
      title: "Getting Started with Dataflow",
      version: "0.1",
      dimensions: {
        width: tester? 300 : 550,
        height: tester ? 500 : 450
      },
      connectionState: STARTING_CONNECTION_STATE,
      tester: tester,
      currentTopicIndex: 0,
      showPopup: false
    };
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
    return {
    };
  },

  currentTopic: function () {
    return topics[this.state.currentTopicIndex];
  },

  nextTopic: function () {
    return topics[this.state.currentTopicIndex + 1];
  },

  logMessageNotice: function (values) {
    var currentTopic = this.currentTopic();

    // the testing only cares about advancing the current topic
    if (this.state.tester) {
      if (values.topic === currentTopic.name) {
        currentTopic.logged = true;
        this.setState({
          currentTopicIndex: this.getNextTopicIndex()
        });
      }
      return;
    }

    // when not showing a popup only check the current topic
    if (!this.state.showPopup) {
      if (values.topic === currentTopic.name) {
        currentTopic.logged = true;
        this.setState({
          showPopup: true
        });
      }
      return;
    }

    // if showing popup and next topic comes in replace the popup with the next topic
    var nextTopic = this.nextTopic();
    if (values.topic === nextTopic.name) {
      currentTopic.logged = true;
      nextTopic.logged = true;
      this.setState({
        currentTopicIndex: this.getNextTopicIndex()
      });
    }
  },

  popupClosed: function () {
    this.setState({
      showPopup: false,
      currentTopicIndex: this.getNextTopicIndex()
    });
  },

  getNextTopicIndex: function () {
    return Math.min(topics.length - 1, this.state.currentTopicIndex + 1);
  },

  setState: function (newState) {
    var self = this;
    Object.keys(newState).forEach(function (key) {
      self.state[key] = newState[key];
    });

    this.notify();
  },

  getState: function () {
    return this.state;
  }

}).init();

var dispatcher = Object.create({ // jshint ignore:line

    init: function () {
      this.clientId = Math.round(10000000000000 * Math.random());
      this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
      this.connectionState = STARTING_CONNECTION_STATE;
      this.sendRequest({
        "action": "get",
        "resource": "interactiveFrame"
      });
      this.sendRequest({
        "action": "register",
        "resource": "logMessageMonitor",
        "values": {
          "clientId": this.clientId,
          "topicPrefix": "Dataflow/"
        }
      });
      window.onunload = this.destroy.bind(this);

      return this;
    },

    destroy: function () {
      this.sendRequest({
        "action": "unregister",
        "resource": "logMessageMonitor",
        "values": {
          "clientId": this.clientId
        }
      });
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

        case 'logMessageNotice':
          if (request.action === 'notify') {
            success = true;
            dataManager.logMessageNotice(request.values);
          }
          break;

        default:
          console.log('Unsupported request from CODAP to DI: ' + JSON.stringify(request));
      }
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

var DataflowGettingStartedAppView = React.createFactory(React.createClass({
  getInitialState: function () {
    return dataManager.getState();
  },

  componentDidMount: function () {
    dataManager.register(this);
  },

  componentWillUnmount: function () {
    dataManager.unregister(this);
  },

  closePopup: function () {
    dataManager.popupClosed();
  },

  renderPopup: function () {
    var currentTopic = dataManager.currentTopic();
    return div({},
      div({className: "popup-background", onClick: this.closePopup}),
      div({className: "popup"},
        div({className: "popup-titlebar"},
          span({onClick: this.closePopup, className: "popup-titlebar-close"}, "X"),
          span({}, "Completed: " + (currentTopic.popUpTitle || currentTopic.checkbox))
        ),
        div({className: "popup-info"},
          currentTopic.popUp
        )
      )
    );
  },

  renderPage: function () {
    var currentTopic = dataManager.currentTopic();
    var pageTopics = topics.filter(function (topic) {
      return topic.page === currentTopic.page;
    });
    var page = pages[currentTopic.page];
    return div({className: "page"},
      page ? page.info : null,
      pageTopics.map(function (pageTopic) {
        return div({},
          input({type: "checkbox", disabled: true, checked: pageTopic.logged}),
          pageTopic.checkbox
        );
      }),
      page ? page.postInfo : null,
      this.state.showPopup ? this.renderPopup() : null
    );
  },

  renderTester: function () {
    var makeOnClickFn = function (topicName) {
      return function () {
        dispatcher.sendRequest({
          action: 'notify',
          resource: 'logMessage',
          values: {
            topic: topicName,
            formatStr: "Testing " + topicName
          }
        });
      };
    };

    return div({className: "tester"},
      div({className: "tester-info"}, "Click a button to send a log message with the button's topic.  This is doing the same thing as the Dataflow app but it is much easier to test with."),
      topics.map(function (topic) {
        return div({},
          button({onClick: makeOnClickFn(topic.name)}, "Page " + topic.page + ": " + topic.name)
        );
      })
    );
  },

  render: function () {
    if (this.state.connectionState === STARTING_CONNECTION_STATE) {
      return div({}, "Waiting to connect with CODAP...");
    }
    else if ((this.state.connectionState === TIMEDOUT_CONNECTION_STATE) && (window.location.search.indexOf('testOutsideOfCODAP') === -1)) {
      return div({}, "Could not connect with CODAP!");
    }
    else if (this.state.tester) {
      return this.renderTester();
    }
    else {
      return this.renderPage();
    }
  }
}));

ReactDOM.render(DataflowGettingStartedAppView({}), document.getElementById('container'));

