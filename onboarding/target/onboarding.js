(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// ==========================================================================
//  
//  Author:   wfinzer
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

/**
 * Shows either a welcome, a help movie, or feedback
 */
class HelpWelcomeArea extends React.Component {
  render() {
    let tResult = '';
    switch (this.props.whichFeedback) {
      case 'welcome':
        tResult = React.createElement(
          'div',
          { className: 'App-header-welcome' },
          React.createElement('img', { src: './resources/codap_logo.png', className: 'App-logo', alt: 'logo' }),
          React.createElement(
            'h2',
            null,
            'Welcome to CODAP'
          )
        );
        break;
      case 'movie':
        tResult = React.createElement(
          'div',
          { className: 'App-header-movie' },
          React.createElement(
            'video',
            { id: 'movieVideo', className: 'App-movie', autoPlay: true, onEnded: this.props.handleEnded },
            React.createElement('source', { src: this.props.movieURL, type: 'video/mp4' })
          )
        );
        break;
      case 'feedback':
        tResult = React.createElement(
          'div',
          { className: 'App-header-feedback' },
          this.props.feedbackText
        );
        break;
      default:
        tResult = React.createElement('div', { className: 'App-header-empty' });
    }
    return tResult;
  }
}

class HelpLink extends React.Component {

  constructor(props) {
    super(props);
    this.handleHelpClick = this.handleHelpClick.bind(this);
  }

  handleHelpClick() {
    this.props.handleHelpClick(this.props.helpURL);
  }

  render() {
    return React.createElement(
      'scan',
      { className: 'App-help', onClick: this.handleHelpClick },
      'Show me.'
    );
  }
}

/**
 * Shows an icon that can be dragged into CODAP to import data
 */
class DraggableLink extends React.Component {
  constructor(props) {
    super(props);
    this.handleDragStart = this.handleDragStart.bind(this);
  }

  handleDragStart(event) {
    let dt = event.dataTransfer,
        tUrl = window.location.href.replace(/\/[^\/]*$/, "") + "/resources/mammals.csv";
    let ix;
    for (let i = 0; i < dt.items.length; i++) {
      if (dt.items[i].kind === 'file') {
        ix = i;
      }
    }
    if (ix != null) {
      dt.items.remove(ix);
    }
    dt.setData('text/uri-list', tUrl);
    dt.setData('text', tUrl);
    dt.effectAllowed = 'all';
  }

  render() {
    return React.createElement(
      'span',
      { className: 'App-link' },
      React.createElement('img', { src: './resources/text-icon.png', alt: 'link', width: 50,
        onDragStart: this.handleDragStart, draggable: true
      })
    );
  }
}

/**
 * Shows the list of tasks as checkbox items, checking the ones that have so far been completed.
 */
class TaskList extends React.Component {

  disableClick() {
    return false;
  }

  render() {
    let checkBoxes = taskDescriptions.descriptions.map(function (iAction, iIndex) {
      let tIcon = iAction.key === 'Drag' ? React.createElement(DraggableLink, null) : '',
          // Special case the data file checkbox
      tChecked = this.props.accomplished.indexOf(iAction.key) >= 0;
      return React.createElement(
        'div',
        { key: iAction.key },
        React.createElement('input', { className: 'App-checkbox', type: 'checkbox', onClick: function () {
            return false;
          }, name: iAction.key, checked: tChecked
        }),
        tIcon,
        iAction.label,
        ' ',
        React.createElement(HelpLink, { helpURL: iAction.url,
          handleHelpClick: this.props.handleHelpClick }),
        ' ',
        React.createElement('br', null)
      );
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'App-list' },
      checkBoxes
    );
  }
}

class TutorialView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accomplished: [],
      codapPresent: false,
      whichFeedback: 'welcome',
      movieURL: '',
      feedbackText: '',
      allAccomplished: false,
      onboardingComplete: false
    };
    this.handleHelpClick = this.handleHelpClick.bind(this);
    this.handleCodapNotification = this.handleCodapNotification.bind(this);
    this.handleInfoClick = this.handleInfoClick.bind(this);
    this.handleOtherNotification = this.handleOtherNotification.bind(this);

    codapInterface.on('notify', 'documentChangeNotice', this.handleCodapNotification);
    codapInterface.on('notify', 'component', this.handleCodapNotification);
    codapInterface.on('notify', '*', this.handleOtherNotification);
  }

  allAccomplished() {
    return taskDescriptions.descriptions.every(function (iDesc) {
      return this.state.accomplished.indexOf(iDesc.key) >= 0;
    }.bind(this));
  }

  isAccomplished(iKey) {
    return this.state.accomplished.some(function (iAccomplishment) {
      return iAccomplishment === iKey;
    });
  }

  handleAccomplishment(iAccomplishment, iQualifier) {
    if (taskDescriptions.taskExists(iAccomplishment) && !this.isAccomplished(iAccomplishment)) {
      this.addAccomplishment(iAccomplishment);
      let tFeedback = taskDescriptions.getFeedbackFor(iAccomplishment, iQualifier, this.allAccomplished());
      if (this.state.whichFeedback === 'feedback') {
        this.setState({
          feedbackText: '',
          whichFeedback: ''
        });
        setTimeout(function () {
          this.setState({
            feedbackText: tFeedback,
            whichFeedback: 'feedback'
          });
        }.bind(this), 0);
      } else {
        this.setState({
          feedbackText: tFeedback,
          whichFeedback: 'feedback'
        });
      }
    }
  }

  handleOtherNotification(iNotification) {
    // Is the operation and type in the task descriptions. If so, we can treat it generically
    let tTask = taskDescriptions.descriptions.find(function (iDescription) {
      return iDescription.operation === iNotification.values.operation && !iDescription.requiresSpecialHandling && (!iDescription.prereq || this.isAccomplished(iDescription.prereq) && (!iDescription.constraints || iDescription.constraints.some(function (iConstraint) {
        let isBool = typeof iConstraint.value === 'boolean',
            tNotificationHasResult = Boolean(iNotification.values.result),
            tNotificationValue;
        if (tNotificationHasResult) {
          tNotificationValue = isBool ? Boolean(iNotification.values.result[iConstraint.property]) : iNotification.values.result[iConstraint.property];
        } else {
          tNotificationValue = iNotification.values[iConstraint.property];
        }
        return tNotificationValue === iConstraint.value;
      })));
    }.bind(this));
    if (tTask) {
      this.handleAccomplishment(tTask.key);
    }
    return { success: true };
  }

  handleCodapNotification(iNotification) {

    let tHandled = false,
        handleAttributeChange = function () {
      // If there is a graph with two or more attributes then 'SecondAttribute' else 'AssignAttribute'
      // Note that dropping a legend attribute doesn't trigger this notification!
      codapInterface.sendRequest({
        action: 'get',
        resource: 'componentList'
      }).then(function (iResult) {
        if (iResult.success && iResult.values.length > 1) {
          let tGraphRequestList = [];
          iResult.values.forEach(function (iComponent) {
            if (iComponent.type === 'graph') {
              tGraphRequestList.push({
                action: 'get',
                resource: 'component[' + iComponent.id + ']'
              });
            }
          });
          if (tGraphRequestList.length > 0) {
            codapInterface.sendRequest(tGraphRequestList).then(function (iResults) {
              let maxAttrsFound = 0;
              iResults.forEach(function (iResult) {
                let numAttrsFound = 0;
                ['xAttributeName', 'yAttributeName', 'y2AttributeName', 'legendAttributeName'].forEach(function (iKey) {
                  if (iResult.values[iKey]) numAttrsFound++;
                });
                maxAttrsFound = Math.max(maxAttrsFound, numAttrsFound);
              });
              switch (maxAttrsFound) {
                case 1:
                  if (taskDescriptions.taskExists('AssignAttribute')) this.handleAccomplishment('AssignAttribute');
                  break;
                case 2:
                  if (taskDescriptions.taskExists('MakeScatterplot')) this.handleAccomplishment('MakeScatterplot');
                // fallthrough deliberate
                case 3:
                  this.handleAccomplishment('SecondAttribute');
                  break;
              }
            }.bind(this));
          }
        }
      }.bind(this));
    }.bind(this),
        handleLegendAttributeChange = function () {
      if (iNotification.values.type === 'DG.GraphModel' && iNotification.values.attributeName === 'Sex') this.handleAccomplishment('MakeLegend');
    }.bind(this),
        handleDataContextCountChanged = function () {
      codapInterface.sendRequest({
        action: 'get',
        resource: 'dataContextList'
      }).then(function (iResult) {
        if (iResult.success && iResult.values.length > 1) {
          let tName = iResult.values[0].name;
          codapInterface.sendRequest({
            action: 'delete',
            resource: 'dataContext[' + tName + ']'
          });
        }
      });
      this.handleAccomplishment('Drag');
    }.bind(this);

    switch (iNotification.values.operation) {
      case 'dataContextCountChanged':
        handleDataContextCountChanged();
        break;
      case 'create':
        if (iNotification.values.type === 'graph') this.handleAccomplishment('MakeGraph', !this.isAccomplished('Drag'));else if (iNotification.values.type === 'caseTable', !this.isAccomplished('Drag')) this.handleAccomplishment('MakeTable');
        break;
      case 'move':
        if (iNotification.values.type === 'DG.GraphView' || iNotification.values.type === 'DG.TableView') this.handleAccomplishment('MoveComponent');
        break;
      case 'attributeChange':
        handleAttributeChange();
        break;
      /*
            case 'legendAttributeChange':
              handleLegendAttributeChange();
      */
    }
    return { success: true };
  }

  handleHelpClick(movieURL) {
    this.setState({ movieURL: '', whichFeedback: '' });
    setTimeout(function () {
      this.setState({ movieURL: movieURL, whichFeedback: 'movie' });
    }.bind(this), 10);
    codapInterface.sendRequest({
      action: 'notify',
      resource: 'logMessage',
      values: {
        formatStr: "User clicked ShowMe for %@",
        replaceArgs: [movieURL]
      }
    });
  }

  addAccomplishment(iKey) {
    let accomplished = this.state.accomplished.slice(),
        index = accomplished.indexOf(iKey);
    if (index < 0) accomplished.push(iKey);
    this.setState({ accomplished: accomplished });
  }

  startOver() {
    window.parent.location.reload();
  }

  handleInfoClick() {
    this.setState({
      feedbackText: infoFeedback,
      whichFeedback: 'feedback'
    });
  }

  render() {
    let tHelp = this.state.whichFeedback === '' ? '' : React.createElement(HelpWelcomeArea, {
      movieURL: this.state.movieURL,
      feedbackText: this.state.feedbackText,
      whichFeedback: this.state.whichFeedback
    });
    this.taskList = React.createElement(TaskList, {
      accomplished: this.state.accomplished,
      handleHelpClick: this.handleHelpClick
    });

    return React.createElement(
      'div',
      { className: 'App' },
      tHelp,
      React.createElement(
        'p',
        { className: 'App-intro' },
        'Figure out how to accomplish each of these basic CODAP tasks:'
      ),
      React.createElement(
        'div',
        { className: 'App-taskarea' },
        this.taskList
      ),
      React.createElement('img', { src: './resources/infoIcon.png', className: 'App-info',
        onClick: this.handleInfoClick })
    );
  }
}

function getStarted() {

  codapInterface.init({
    title: "Getting started with CODAP",
    version: "1.02",
    dimensions: {
      width: 400,
      height: 550
    },
    preventDataContextReorg: false
  }).catch(function (msg) {
    console.log(msg);
  });

  if (!hasMouse) {
    codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContextFromURL',
      values: {
        URL: window.location.href.replace(/\/[^\/]*$/, "") + "/resources/mammals.csv"
      }
    }).then(function (iResult) {
      console.log('Created data context from URL');
    });
  }

  ReactDOM.render(React.createElement(TutorialView, null), document.getElementById('container'));
}

getStarted();

},{}]},{},[1]);
