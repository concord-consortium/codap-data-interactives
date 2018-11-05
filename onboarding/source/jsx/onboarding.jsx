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
 * Shows either a welcome or a help movie
 */
class HelpWelcomeArea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.movieURL === '') {
      return (
          <div className="App-header-welcome">
            <img src={'./resources/codap_logo.png'} className="App-logo" alt="logo"/>
            <h2>Welcome to CODAP</h2>
          </div>
      )
    }
    else {
      return (
          <div className="App-header-movie">
            <video id="movieVideo" className="App-movie" autoPlay onEnded={this.props.handleEnded}>
              <source src={this.props.movieURL} type="video/mp4"/>
            </video>
          </div>
      )
    }
  }
}

class Feedback extends React.Component {

  render() {
    if (!this.props.showingInfoText && (this.props.feedbackText === '' || this.props.onboardingComplete)) {
      return null;
    }
    else {
      let tCheckbox =
          <img src="./resources/x.png" className="App-feedback-close"
               onMouseDown={this.props.handleFeedbackExit}/>;
      return (
          <div className="App-feedback">
            {tCheckbox}
            {this.props.feedbackText}
          </div>
      )
    }
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
    return (
        <scan className="App-help" onClick={this.handleHelpClick}>Show me</scan>
    )
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
    dt.setData("text/uri-list", tUrl);
    dt.setData('text', tUrl);
    dt.effectAllowed = 'all';
  }

  render() {
    return (
        <span className="App-link">
          <img src={'./resources/text-icon.png'} alt="link" width={50}
               onDragStart={this.handleDragStart} draggable={true}
          />
        </span>
    )
  }
}

let hasMouse = !('ontouchstart' in window);

let taskDescriptions = {
  descriptions: [
    hasMouse ?
        {
          key: 'Drag', label: 'Drag this data file into CODAP', url: './resources/DragCSV.mp4',
          feedback: <div>
            <p>You've got data! It appears in a <em>case table</em>.</p>
            <p>Each row in the table represents a <em>case</em> and each column
              represents an <em>attribute</em>.</p>
            <p>This data set contains data about mammals. Each case represents a different
              mammal. The attributes provide information about lifespan, height, and so on.</p>
          </div>
        } :
        {
          key: 'MakeTable', label: 'Make a table showing Mammals data', url: './resources/MakeTable.mp4',
          feedback: <div>
            <p>You made a <em>case table</em> showing the pre-loaded data.</p>
            <p>Each row in the table represents a <em>case</em> and each column
              represents an <em>attribute</em>.</p>
            <p>This data set contains data about mammals. Each case represents a different
              mammal. The attributes provide information about lifespan, height, and so on.</p>
          </div>
        },
    {
      key: 'MakeGraph', label: 'Make a graph', url: './resources/MakeGraph.mp4',
      feedback: <div>
        <p>Very nice graph! Each point represents one of the cases in your data set.</p>
        <p>The points are scattered randomly for the moment because you haven't yet
          specified how they should be arranged.</p>
      </div>,
      alt_feedback: <div>
        <p>Very nice graph!</p>
        <p>There are no points in it because you haven't yet dragged any
          data in yet.</p>
      </div>
    },
    {
      key: 'MoveComponent', label: 'Move a table or graph', url: './resources/MoveGraph.mp4',
      feedback: <div>
        <p>You <em>moved</em> that component by clicking and dragging on its title bar!</p>
        <p>You can also <em>resize</em> a component by dragging an edge or lower corner.</p>
      </div>
    },
    {
      key: 'AssignAttribute', label: 'Drag an attribute to a graph\'s axis', url: './resources/DragAttribute.mp4',
      feedback: <div>
        <p>Way to go! You dragged an attribute from the case table to a graph axis.</p>
        <p>Now the points have arranged themselves along the axis according to their attribute values.</p>
        <p>You can replace this attribute with another one, or drag an attribute to the other graph
          axis to make a scatter plot.</p>
      </div>
    },
    {
      key: 'SecondAttribute', label: 'Drag a 2nd attribute to a graph\'s axis', url: './resources/Drag2ndAttribute.mp4',
      feedback: <div>
        <p>Alright! You dragged a second attribute to a graph.</p>
        <p>You graph is <em>bivariate</em> meaning you have displayed two attributes on a single graph.</p>
        <p>You can replace either attribute with a different attribute, or drag an attribute to the
          middle of the graph to create a legend for the points.</p>
      </div>
    }
  ],
  getFeedbackFor: function (iKey, iUseAltFeedback) {
    let tDesc = this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
    return iUseAltFeedback ? tDesc.alt_feedback : tDesc.feedback;
  }
};

/**
 * Shows the list of tasks as checkbox items, checking the ones that have so far been completed.
 */
class TaskList extends React.Component {

  disableClick() {
    return false;
  }

  render() {
    let checkBoxes = taskDescriptions.descriptions.map(function (iAction, iIndex) {
      let tIcon = (iIndex === 0 && hasMouse) ? <DraggableLink/> : '', // Special case the data file checkbox
          tChecked = this.props.accomplished.indexOf(iAction.key) >= 0;
      return (
          <div key={iAction.key}>
            <input type="checkbox" onClick={function () {
              return false;
            }} name={iAction.key} checked={tChecked}
            />{tIcon}
            {iAction.label} <HelpLink helpURL={iAction.url}
                                      handleHelpClick={this.props.handleHelpClick}/> <br/>
          </div>
      );
    }.bind(this));
    return (
        <div className="App-list">
          {checkBoxes}
        </div>
    );
  }
}

class TutorialView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accomplished: [],
      codapPresent: false,
      movieURL: '',
      feedbackText: '',
      allAccomplished: false
    };
    this.handleHelpClick = this.handleHelpClick.bind(this);
    this.handleCodapNotification = this.handleCodapNotification.bind(this);
    this.handleFeedbackExit = this.handleFeedbackExit.bind(this);
    this.handleInfoClick = this.handleInfoClick.bind(this);

    codapInterface.on('notify', 'documentChangeNotice', this.handleCodapNotification);
    codapInterface.on('notify', 'component', this.handleCodapNotification);

  }

  handleCodapNotification(iNotification) {

    let handleAttributeChange = function () {
          // If there is a graph with two or more attributes then 'SecondAttribute' else 'AssignAttribute'
          // Note that dropping a legend attribute doesn't trigger this notification!
          codapInterface.sendRequest({
            action: 'get',
            resource: 'componentList'
          }).then( function( iResult) {
            if( iResult.success && iResult.values.length > 1) {
              let tGraphRequestList = [];
              iResult.values.forEach( function( iComponent) {
                if( iComponent.type === 'graph') {
                  tGraphRequestList.push( {
                    action: 'get',
                    resource: 'component[' + iComponent.id + ']'
                  })
                }
              });
              if( tGraphRequestList.length > 0) {
                codapInterface.sendRequest( tGraphRequestList).then( function( iResults) {
                  let maxAttrsFound = 0;
                  iResults.forEach( function( iResult) {
                    let numAttrsFound = 0;
                    ['xAttributeName', 'yAttributeName', 'y2AttributeName', 'legendAttributeName'].forEach(
                        function( iKey) {
                          if( iResult.values[ iKey])
                            numAttrsFound++;
                        }
                    );
                    maxAttrsFound = Math.max( maxAttrsFound, numAttrsFound);
                  });
                  switch( maxAttrsFound) {
                    case 1:
                      handleAccomplishment( 'AssignAttribute');
                      break;
                    case 2:
                    case 3:
                      handleAccomplishment( 'SecondAttribute');
                      break;
                  }
                })
              }
            }
          })
        }.bind(this),

        isAccomplished = function (iKey) {
          return this.state.accomplished.some(function (iAccomplishment) {
            return iAccomplishment === iKey;
          });
        }.bind(this),

        handleAccomplishment = function (iAccomplishment, iQualifier) {
          if (!isAccomplished(iAccomplishment)) {
            this.addAccomplishment(iAccomplishment);
            tFeedback = taskDescriptions.getFeedbackFor(iAccomplishment, iQualifier);
            this.setState({feedbackText: tFeedback})
          }
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
          handleAccomplishment('Drag');
        }.bind(this);

    let tFeedback = '';
    switch (iNotification.values.operation) {
      case 'dataContextCountChanged':
        handleDataContextCountChanged();
        break;
      case 'create':
        if (iNotification.values.type === 'graph')
          handleAccomplishment('MakeGraph', !isAccomplished('Drag'));
        else if (iNotification.values.type === 'table')
          handleAccomplishment('MakeTable');
        break;
      case 'move':
        if (iNotification.values.type === 'DG.GraphView' || iNotification.values.type === 'DG.TableView')
          handleAccomplishment('MoveComponent');
        break;
      case 'attributeChange':
        handleAttributeChange();
        break;
    }
    return {success: true};
  }

  handleHelpClick(movieURL) {
    this.setState({movieURL: ''});
    setTimeout(function () {
      this.setState({movieURL: movieURL});
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
    if (index < 0)
      accomplished.push(iKey);
    this.setState({accomplished: accomplished})
  }

  startOver() {
    window.parent.location.reload();
  }

  handleFeedbackExit() {

    let tText = '',
        tAllAccomplished = false,
        tOnboardingComplete = this.state.allAccomplished,
        allAccomplished = function () {
          return taskDescriptions.descriptions.every(function (iDesc) {
            return this.state.accomplished.indexOf(iDesc.key) >= 0;
          }.bind(this))
        }.bind(this);

    if (allAccomplished()) {
      tAllAccomplished = true;
      tText = <div>
        <p>Congratulations! You've done the following:</p>
        <ul>
          <li>Dragged data into CODAP</li>
          <li>Made a graph</li>
          <li>Moved a component</li>
          <li>Plotted an attribute on a graph axis</li>
          <li>Made a graph show values for two attributes</li>
        </ul>
        <p>You can do a <em>lot</em> with just those five skills!</p>
        <p>For more information about how to work with CODAP, visit the
          <a href="https://codap.concord.org/help/" target="_blank">CODAP Help</a> page. </p>
        <button onClick={this.startOver}>Start Over</button>
      </div>
    }
    this.setState({
      allAccomplished: tAllAccomplished,
      feedbackText: tText,
      onboardingComplete: tOnboardingComplete
    });
  }

  handleInfoClick() {
    let tFeedback =
        <div>
          <p>This onboarding plugin for CODAP was created to help new CODAP users get started
            using CODAP. It lives in CODAP as an iFrame. Certain user actions cause CODAP to
            notify the plugin. The plugin responds by providing feedback to the user.</p>
          <p>The open source code is at<br/>
            <a href="https://github.com/concord-consortium/codap-data-interactives/tree/master/onboarding"
               target="_blank">
              CODAP's data interactive GitHub repository</a>. </p>
          <p>This plugin makes use of the CODAP data interactive plugin API whose documentation is at<br/>
            <a href="https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API" target="_blank">
              CODAP Data Interactive API</a>.</p>
        </div>
    this.setState({
      feedbackText: tFeedback,
      showingInfoText: true
    });
    // We want the showingInfoText property to become false after the feedback is shown.
    // Using a timeout to do so seems bizarre and we should try to find a more straightforward way.
    setTimeout(function() {
      this.state.showingInfoText = false;
    }.bind( this), 100);
  }

  render() {
    this.taskList =
        <TaskList
            accomplished={this.state.accomplished}
            handleHelpClick={this.handleHelpClick}
        />

    return (
        <div className="App">
          <HelpWelcomeArea movieURL={this.state.movieURL}/>
          <p className="App-intro">
            Figure out how to accomplish each of these basic CODAP tasks:
          </p>
          {this.taskList}
          <Feedback
              feedbackText={this.state.feedbackText}
              allAccomplished={this.state.allAccomplished}
              handleFeedbackExit={this.handleFeedbackExit}
              onboardingComplete={this.state.onboardingComplete}
              showingInfoText={this.state.showingInfoText}
          />
          <img src="./resources/infoIcon.png" className="App-info"
               onClick={this.handleInfoClick}/>
        </div>
    );
  }
}

function getStarted() {

  /*
    window.onmousemove = function() {
      hasMouse = true;
    }
  */

  codapInterface.init({
    title: "Getting started with CODAP",
    version: "1.01",
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

  ReactDOM.render(<TutorialView/>,
      document.getElementById('container'));

}

getStarted();
