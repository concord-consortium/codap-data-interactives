(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [hasMouse ? {
    key: 'Drag', label: 'Drag this data file into CODAP', url: './resources/DragCSV.mp4',
    operation: 'dataContextCountChanged',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You\'ve got data! It appears in a ',
        React.createElement(
          'em',
          null,
          'case table'
        ),
        '.'
      ),
      React.createElement(
        'p',
        null,
        'Each row in the table represents a ',
        React.createElement(
          'em',
          null,
          'case'
        ),
        ' and each column represents an ',
        React.createElement(
          'em',
          null,
          'attribute'
        ),
        '.'
      ),
      React.createElement(
        'p',
        null,
        'This data set contains data about mammals. Each case represents a different mammal. The attributes provide information about lifespan, height, and so on.'
      )
    )
  } : {
    key: 'MakeTable', label: 'Make a table showing Mammals data', url: './resources/MakeTable.mp4',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You made a ',
        React.createElement(
          'em',
          null,
          'case table'
        ),
        ' showing the pre-loaded data.'
      ),
      React.createElement(
        'p',
        null,
        'Each row in the table represents a ',
        React.createElement(
          'em',
          null,
          'case'
        ),
        ' and each column represents an ',
        React.createElement(
          'em',
          null,
          'attribute'
        ),
        '.'
      ),
      React.createElement(
        'p',
        null,
        'This data set contains data about mammals. Each case represents a different mammal. The attributes provide information about lifespan, height, and so on.'
      )
    )
  }, {
    key: 'MakeGraph', label: 'Make a graph', url: './resources/MakeGraph.mp4',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Very nice graph! Each point represents one of the cases in your data set.'
      ),
      React.createElement(
        'p',
        null,
        'The points are scattered randomly for the moment because you haven\'t yet specified how they should be arranged.'
      )
    ),
    alt_feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Very nice graph!'
      ),
      React.createElement(
        'p',
        null,
        'There are no points in it because you haven\'t yet dragged any data in yet.'
      )
    )
  }, {
    key: 'MoveComponent', label: 'Move a table or graph', url: './resources/MoveGraph.mp4',
    operation: 'move', type: ['DG.GraphView', 'DG.TableView'],
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You ',
        React.createElement(
          'em',
          null,
          'moved'
        ),
        ' that component by clicking and dragging on its title bar!'
      ),
      React.createElement(
        'p',
        null,
        'You can also ',
        React.createElement(
          'em',
          null,
          'resize'
        ),
        ' a component by dragging an edge or lower corner.'
      )
    )
  },
  /*
      {
        key: 'selectCases', label: 'Select some cases by …', url: 'movie url',
        operation: 'selectCases', type: '',
        feedback: <div>
          <p>You selected some cases!</p>
        </div>
      },
  */

  {
    key: 'AssignAttribute', label: 'Drag an attribute to a graph\'s axis', url: './resources/DragAttribute.mp4',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Way to go! You dragged an attribute from the case table to a graph axis.'
      ),
      React.createElement(
        'p',
        null,
        'Now the points have arranged themselves along the axis according to their attribute values.'
      ),
      React.createElement(
        'p',
        null,
        'You can replace this attribute with another one, or drag an attribute to the other graph axis to make a scatter plot.'
      )
    )
  }, {
    key: 'SecondAttribute', label: 'Drag a 2nd attribute to a graph\'s axis', url: './resources/Drag2ndAttribute.mp4',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Alright! You dragged a second attribute to a graph.'
      ),
      React.createElement(
        'p',
        null,
        'Your graph is ',
        React.createElement(
          'em',
          null,
          'bivariate'
        ),
        ' meaning you have displayed two attributes on a single graph.'
      ),
      React.createElement(
        'p',
        null,
        'You can replace either attribute with a different attribute, or drag an attribute to the middle of the graph to create a legend for the points.'
      )
    )
  }],
  getFeedbackFor: function (iKey, iUseAltFeedback, iAllAccomplished) {
    let tDesc = this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
    let tFeedback = iUseAltFeedback ? tDesc.alt_feedback : tDesc.feedback;
    if (iAllAccomplished) {
      tFeedback = React.createElement(
        'div',
        null,
        tFeedback,
        allAccomplishedFeedback
      );
    }
    return tFeedback;
  },
  taskExists: function (iKey) {
    return this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
  }
};

allAccomplishedFeedback = React.createElement(
  'div',
  null,
  React.createElement(
    'p',
    null,
    'Congratulations! You\'ve done the following:'
  ),
  React.createElement(
    'ul',
    null,
    React.createElement(
      'li',
      null,
      'Dragged data into CODAP'
    ),
    React.createElement(
      'li',
      null,
      'Made a graph'
    ),
    React.createElement(
      'li',
      null,
      'Moved a component'
    ),
    React.createElement(
      'li',
      null,
      'Plotted an attribute on a graph axis'
    ),
    React.createElement(
      'li',
      null,
      'Made a graph show values for two attributes'
    )
  ),
  React.createElement(
    'p',
    null,
    'You can do a ',
    React.createElement(
      'em',
      null,
      'lot'
    ),
    ' with just those five skills!'
  ),
  React.createElement(
    'p',
    null,
    'For more information about how to work with CODAP, visit the ',
    React.createElement(
      'a',
      { href: 'https://codap.concord.org/help/', target: '_blank' },
      'CODAP Help'
    ),
    ' page. '
  ),
  React.createElement(
    'button',
    { onClick: this.startOver },
    'Start Over'
  )
);

infoFeedback = React.createElement(
  'div',
  null,
  React.createElement(
    'p',
    null,
    'This onboarding plugin for CODAP was created to help new CODAP users get started using CODAP. It lives in CODAP as an iFrame. Certain user actions cause CODAP to notify the plugin. The plugin responds by providing feedback to the user.'
  ),
  React.createElement(
    'p',
    null,
    'The open source code is at',
    React.createElement('br', null),
    React.createElement(
      'a',
      { href: 'https://github.com/concord-consortium/codap-data-interactives/tree/master/onboarding',
        target: '_blank' },
      'CODAP\'s data interactive GitHub repository'
    ),
    '. '
  ),
  React.createElement(
    'p',
    null,
    'This plugin makes use of the CODAP data interactive plugin API whose documentation is at',
    React.createElement('br', null),
    React.createElement(
      'a',
      { href: 'https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API',
        target: '_blank' },
      'CODAP Data Interactive API'
    ),
    '.'
  )
);

},{}]},{},[1]);
