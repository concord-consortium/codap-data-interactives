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
      case 'allAccomplished':
        tResult = React.createElement(
          'div',
          { className: 'App-header-completed' },
          this.props.feedbackText
        );
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
    //codapInterface.on('notify', 'component', this.handleCodapNotification);
    codapInterface.on('notify', '*', this.handleCodapNotification);

    //codapInterface.on('notify', '*', this.handleOtherNotification);
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
    console.log('tTask1 =', tTask);
    if (tTask) {
      this.handleAccomplishment(tTask.key);
    }
    return { success: true };
  }

  handleCodapNotification(iNotification) {

    let tTask = taskDescriptions.descriptions.find(function (iDescription) {
      //console.log('Really here.');
      //console.log('iDescription.operation', iDescription.operation);
      //console.log('iNotification.values.operation', iNotification.values.operation);
      console.log('iDescription.requiresSpecialHandling', iDescription.requiresSpecialHandling);
      console.log('iDescription prereq =', this.isAccomplished(iDescription.prereq));
      //console.log('iNotification.values.result', iNotification.values.result);
      return iDescription.operation === iNotification.values.operation && !iDescription.requiresSpecialHandling && (!iDescription.prereq || this.isAccomplished(iDescription.prereq) && (!iDescription.constraints || iDescription.constraints.some(function (iConstraint) {
        //console.log('In here.')
        let isBool = typeof iConstraint.value === 'boolean',
            tNotificationHasResult = Boolean(iNotification.values.result),
            tNotificationValue;
        if (tNotificationHasResult) {
          //console.log('Here.');
          tNotificationValue = isBool ? Boolean(iNotification.values.result[iConstraint.property]) : iNotification.values.result[iConstraint.property];
        } else {
          //console.log('Actually, here.');
          tNotificationValue = iNotification.values[iConstraint.property];
        }
        // console.log('tNotificationValue', tNotificationValue);
        //console.log('iConstraint.value', iConstraint.value);
        return tNotificationValue === iConstraint.value;
      })));
    }.bind(this));
    console.log('tTask2 =', tTask);
    if (tTask) {
      this.handleAccomplishment(tTask.key);
      console.log('Doing accomplishment', tTask.key);
      return { success: true };
    } else {

      let tHandled = false,
          handleAttributeChange = function () {
        console.log('iNotification.values', iNotification.values);
        codapInterface.sendRequest({
          action: 'get',
          resource: 'component[' + iNotification.values.id + ']' }).then(function (iResult) {
          let maxAttrsFound = 0;
          let numAttrsFound = 0;
          ['xAttributeName', 'yAttributeName', 'y2AttributeName', 'legendAttributeName'].forEach(function (iKey) {
            if (iResult.values[iKey]) numAttrsFound++;
          });
          maxAttrsFound = Math.max(maxAttrsFound, numAttrsFound);

          if (maxAttrsFound = 1) {
            let attributeName = iNotification.values.attributeName;
            let attributeAxis = iNotification.values.axisOrientation;
            if (attributeName === 'Share of Income Owned by Top 1%' && attributeAxis === 'horizontal') this.handleAccomplishment('CreateIncomeGraph');else if (attributeName === 'Average GNP per Person' && attributeAxis === 'vertical') this.handleAccomplishment('AddAvgGNPVertical');
          };
        }.bind(this));
      }.bind(this),
          handleHideAttribute = function () {
        //Get ID of notification component
        console.log('iNotification.attrID', iNotification.values.result.attrIDs[0]);
        if (iNotification.values.operation === 'hideAttributes' && iNotification.values.result.attrIDs[0] == 22) this.handleAccomplishment('HideForested');
      }.bind(this),
          handleLegendAttributeChange = function () {
        let tTask = taskDescriptions.descriptions.find(function (iDescription) {
          if (this.isAccomplished(iDescription.prereq)) this.handleAccomplishment('ChangeMapLegend');
        }.bind(this));
        if (iNotification.values.type === 'DG.MapModel' && iNotification.values.attributeName === 'Average Life Expectancy') {
          this.handleAccomplishment('AddLifeExpectancy');
        };
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
      }.bind(this),


      // handleToggleMinimizeMap = function () {
      //   //let tTask = taskDescriptions.descriptions.find(function (iDescription) {
      //   if (this.isAccomplished( 'MinimizeMap'))
      //     this.handleAccomplishment('RestoreMap');
      //   //  }.bind(this));
      //     this.handleAccomplishment('MinimizeMap');
      // }.bind(this),

      handleSelectCases = function () {
        var isDone = false;
        var multiple = false;
        function triggerCheckbox() {
          this.handleAccomplishment('SelectCountries');
        }
        let triggerCheckboxThis = triggerCheckbox.bind(this);

        codapInterface.sendRequest({
          action: 'get',
          resource: 'dataContextList'
        }).then(function (iResult) {
          if (iResult.success && iResult.values.length > 0) {
            let tName = iResult.values[0].name;
            codapInterface.sendRequest({
              action: 'get',
              resource: 'dataContext[' + tName + '].selectionList'
            }).then(function (iResultTwo) {
              //var isDone = false;
              //console.log('isDone (0) = ' + isDone)
              if (iResultTwo.success && iResultTwo.values.length > 3) {
                console.log("Done!");
                multiple = true;
                triggerCheckboxThis();
                //console.log('Now here')
              }
            });
          }
          isDone = multiple;
        });
        console.log('here --> isDone = ' + isDone);
        console.log('here --> multiple = ' + multiple);

        //  this.handleAccomplishment('SelectCountries');
      }.bind(this);

      //handleMakeMap = function() {
      //  if iNotification.values.type === 'map', !this.isAccomplished('Drag'))
      //    this.handleAccomplishment('MakeMap');
      //}.bind(this);

      //Add operations here to allow them to be handled by the handlers above!

      switch (iNotification.values.operation) {
        case 'dataContextCountChanged':
          handleDataContextCountChanged();
          break;
        case 'create':
          // if (iNotification.values.type === 'graph')
          //   this.handleAccomplishment('MakeGraph', !this.isAccomplished('Drag'));
          // else if (iNotification.values.type === 'caseTable', !this.isAccomplished('Drag'))
          //   this.handleAccomplishment('MakeTable');
          if (iNotification.values.type === 'map') this.handleAccomplishment('MakeMap');
          break;
        case 'move':
          if (iNotification.values.type === 'DG.MapView') this.handleAccomplishment('MoveMap');
          break;
        case 'hideAttributes':
          handleHideAttribute();
          break;
        case 'attributeChange':
          handleAttributeChange();
          break;
        case 'legendAttributeChange':
          handleLegendAttributeChange();
          break;
        case 'toggle minimize component':
          if (iNotification.values.type === 'DG.MapView') handleToggleMinimizeMap();
          break;
        case 'selectCases':
          handleSelectCases();
          break;
      }
      return { success: true };
    }
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
      )
    );
  }
}

function getStarted() {

  codapInterface.init({
    title: "Getting started with CODAP",
    version: "1.05",
    dimensions: {
      width: 410,
      height: 625
    },
    preventDataContextReorg: false
  }).catch(function (msg) {
    console.log(msg);
  });

  //Load dataset
  //    codapInterface.sendRequest({
  //      action: 'create',
  //      resource: 'dataContextFromURL',
  //      values: {
  //        URL: window.location.href.replace(/\/[^\/]*$/, "") + "/resources/UN-dataset.csv"
  //      }
  //    }).then(function (iResult) {
  //      console.log('Created data context from URL');
  //    });


  ReactDOM.render(React.createElement(TutorialView, null), document.getElementById('container'));
}

getStarted();

},{}]},{},[1]);
