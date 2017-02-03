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
    if (this.props.feedbackText === '') {
      return null;
    }
    else {
      return (
          <div className="App-feedback" onMouseDown={this.props.handleFeedbackExit}>
            <img src="./resources/x.png" className="App-feedback-close"/>
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
        tUrl = window.location.href.replace(/\/[^\/]*$/, "") + "/resources/cars.csv";
    dt.setData("text/uri-list", tUrl);
  }

  render() {
    return (
        <span className="App-link">
          <img src={'./resources/text-icon.png'} alt="link" width={50} onDragStart={this.handleDragStart}/>
        </span>
    )
  }
}

var taskDescriptions = {
  descriptions: [
    {
      key: 'Drag', label: 'Drag this data file into CODAP', url: './resources/DragCSV.mp4',
      feedback: <div>
        <p>You've got data!</p>
        <p>The case table displays your data. Each row is a 'case' and each column
          represents an attribute.</p>
        <p>Another way to get data into CODAP is to use the <em>Import</em> command in
          the <img src={'./resources/hamburger.png'} alt="menu"
                   className="App-glyph"/> menu.</p>
      </div>
    },
    {
      key: 'MakeGraph', label: 'Make a graph', url: './resources/MakeGraph.mp4',
      feedback: <div>
        <p>Very nice graph! Each point represents one of the cases in your data set.</p>
        <p>Of course it will make a bit more sense when you drag an attribute from a case table
          to one of its axes.</p>
      </div>,
      alt_feedback: <div>
        <p>Very nice graph!</p>
        <p>There are no points in it because you haven't yet dragged any
          data in.</p>
      </div>
    },
    {
      key: 'MoveComponent', label: 'Move a table or graph', url: './resources/MoveGraph.mp4',
      feedback: <div>
        <p>You moved that component using its title bar!</p>
        <p>You can also resize a component by dragging an edge or lower corner.</p>
      </div>
    },
    {
      key: 'AssignAttribute', label: 'Drag an attribute to graph\'s axis', url: './resources/DragAttribute.mp4',
      feedback: <div>
        <p>Way to go! You dragged an attribute from the case table to a graph axis.</p>
        <p>Now the points have arranged themselves along the axis according to their attribute values.</p>
        <p>You can replace this attribute with another one, or drag an attribute to the other graph axis.</p>
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
  render() {
    let checkBoxes = taskDescriptions.descriptions.map(function (iAction, iIndex) {
      let tIcon = iIndex === 0 ? <DraggableLink/> : '', // Special case the data file checkbox
          tChecked = this.props.accomplished.indexOf(iAction.key) >= 0;
      return (
          <div key={iAction.key}>
            <input type="checkbox" disabled name={iAction.key} checked={tChecked}
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
      feedbackText: ''
    }
    ;
    this.handleHelpClick = this.handleHelpClick.bind(this);
    this.handleMovieEnded = this.handleMovieEnded.bind(this);
    this.handleCodapNotification = this.handleCodapNotification.bind(this);
    this.handleFeedbackExit = this.handleFeedbackExit.bind(this);

    codapInterface.on(/notify/, /documentChangeNotice/, this.handleCodapNotification);
    codapInterface.on(/notify/, /component/, this.handleCodapNotification);

  }

  handleCodapNotification(iRequest) {

    let isAccomplished = function (iKey) {
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
        }.bind(this);

    let tFeedback = '';
    switch (iRequest.values.operation) {
      case 'dataContextCountChanged':
        handleAccomplishment('Drag');
        break;
      case 'create':
        handleAccomplishment('MakeGraph', !isAccomplished('Drag'));
        break;
      case 'move':
        handleAccomplishment('MoveComponent');
        break;
      case 'attributeChange':
        handleAccomplishment('AssignAttribute');
        break;
    }
    return {success: true};
  }

  handleHelpClick(movieURL) {
    this.setState({movieURL: movieURL});
  }

  addAccomplishment(iKey) {
    let accomplished = this.state.accomplished.slice(),
        index = accomplished.indexOf(iKey);
    if (index < 0)
      accomplished.push(iKey);
    this.setState({accomplished: accomplished})
  }

  handleMovieEnded() {
    setTimeout(function () {
      this.setState({movieURL: ''});
    }.bind(this), 2000);
  }

  handleFeedbackExit() {

    let tText = '',
        allAccomplished = function () {
          return taskDescriptions.descriptions.every(function (iDesc) {
            return this.state.accomplished.indexOf(iDesc.key) >= 0;
          }.bind(this))
        }.bind(this);

    if (allAccomplished()) {
      tText = <div>
        <p>Congratulations! You've mastered the basics!</p>
        <p>For more information about how to work with CODAP, visit the
          <a href="https://codap.concord.org/help/" target="_blank"> CODAP Help</a> page. </p>
      </div>
    }
    this.setState({feedbackText: tText});
  }

  render() {
    this.taskList =
        <TaskList
            accomplished={this.state.accomplished}
            handleHelpClick={this.handleHelpClick}
        />

    return (
        <div className="App">
          <HelpWelcomeArea movieURL={this.state.movieURL} handleEnded={this.handleMovieEnded}/>
          <p className="App-intro">
            Here are some CODAP basics.
          </p>
          {this.taskList}
          <Feedback
              feedbackText={this.state.feedbackText}
              handleFeedbackExit={this.handleFeedbackExit}
          />
        </div>
    );
  }
}

codapInterface.init({
  title: "Tutorial",
  version: "0.1",
  dimensions: {
    width: 400,
    height: 500
  }
}).catch(function (msg) {
  console.log(msg);
});

ReactDOM.render(<TutorialView />,
    document.getElementById('container'));

