(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [{
    key: 'MakeScatterplot', label: 'Make a scatterplot of height vs age.',
    url: './resources/MakeScatterplot.mp4',
    operation: 'attributeChange', type: '',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great scatterplot! Hopefully you have ',
        React.createElement(
          'em',
          null,
          'height'
        ),
        ' on the vertical axis and ',
        React.createElement(
          'em',
          null,
          'age'
        ),
        ' on the horizontal axis.'
      )
    )
  }, {
    key: 'SelectCases', label: 'Drag a selection rectangle around a subset of the points.',
    url: './resources/SelectCases.mp4',
    operation: 'selectCases',
    constraints: [{ property: 'cases', value: true }],
    prereq: 'MakeScatterplot',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'OK. Cases are selected.'
      ),
      React.createElement(
        'p',
        null,
        'These are the ones we want to look at more closely.'
      )
    )
  }, {
    key: 'HideUnselected', label: 'Hide the unselected cases.',
    url: './resources/HideUnselected.mp4',
    operation: 'hideUnselected', type: '',
    prereq: 'SelectCases',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'That very nicely got those other cases out of the way.'
      ),
      React.createElement(
        'p',
        null,
        'It\\\'s possible that the graph needs rescaling.'
      )
    )
  }, {
    key: 'Deselect', label: 'Deselect all cases, including the ones in the table.',
    url: './resources/Deselect.mp4',
    operation: 'selectCases',
    constraints: [{ property: 'cases', value: false }],
    prereq: 'HideUnselected',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Selection is important, but so is ',
        React.createElement(
          'em',
          null,
          'deselection!'
        )
      )
    )
  }, {
    key: 'Rescale', label: 'Rescale the graph.',
    url: './resources/Rescale.mp4',
    operation: 'rescaleGraph', type: '',
    prereq: 'HideUnselected',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You pressed the graph\'s ',
        React.createElement(
          'em',
          null,
          'Rescale'
        ),
        ' button so that all the points are visible and spread out as much as possible.'
      )
    )
  }, {
    key: 'MakeLegend', label: 'Add Sex as a legend to the scatterplot.',
    url: './resources/MakeLegend.mp4',
    operation: 'legendAttributeChange', type: 'DG.GraphModel',
    constraints: [{ property: 'attributeName', value: 'Sex' }],
    prereq: 'MakeScatterplot',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Legendary! Notice that the points are nicely colored according to the scheme laid out in the legend.'
      ),
      React.createElement(
        'p',
        null,
        'Pro tip: You can select all the points in one category by clicking on the legend key.'
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
      'Made a scatterplot'
    ),
    React.createElement(
      'li',
      null,
      'Used ',
      React.createElement(
        'em',
        null,
        'marquee selection'
      ),
      ' to select some useful cases'
    ),
    React.createElement(
      'li',
      null,
      'Gotten cases you don/\'t want to be bothered with by hiding them'
    ),
    React.createElement(
      'li',
      null,
      'Rescaled the scatterplot to spread the points out'
    ),
    React.createElement(
      'li',
      null,
      'Added a legend variable to the graph'
    ),
    React.createElement(
      'li',
      null,
      'Deselected cases so that none are selected'
    )
  ),
  React.createElement(
    'p',
    null,
    'These are useful CODAP skills!'
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
