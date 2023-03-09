(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [hasMouse ?
  // Need to make specific to chosen attribute
  {
    key: 'HideForested', label: 'Hide the attribute “Forested Area”', url: './resources/videos/HideAttribute.mp4',
    operation: 'hideAttribute', type: '',
    requiresSpecialHandling: true,
    //constraints: [ {property: 'attrIDs', value: 22}],
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'The datasets you\u2019ll be working with have a lot of attributes and you may want to focus on just a few.'
      ),
      React.createElement(
        'p',
        null,
        'You can hide any attribute you don\u2019t want to focus on.'
      )
    )
  } : {}, {
    key: 'UnhideAttribute', label: 'Get “Forested Area” to show up again', url: './resources/videos/ShowAttribute.mp4',
    operation: 'unhideAttributes', type: '',
    constraints: [{ property: 'attrIDs', value: 22 }],
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'No matter how many attributes you\u2019ve hidden,  you can get them all to show up again using the Eyeball menu.'
      )
    )
  }, {
    key: 'MakeGraph', label: 'Create a graph', url: './resources/videos/CreateGraph.mp4',
    operation: 'create', type: ['DG.GraphView'],
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great, you have a graph!  The data points are scattered because nothing has been added to the axes yet. Next you will explore what happens when you add an attribute.'
      )
    )
  },
  // Need to make specific to chosen attribute and axis
  {
    key: 'AddDoctors', label: 'Drag "Total Count of Medical Doctors” onto the horizontal axis.',
    url: './resources/videos/GraphHorizontal.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    //constraints: [{property: 'attributeName', value:'Total Count of Medical Doctors'}],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You can see the distribution of \u201CTotal Count of Medical Doctors\u201D  for all countries. But maybe the distribution is different for different regions. How could you use the categorical variable \u201CRegion\u201D to find out?'
      )
    )
  },
  // Need to make specific to chosen attribute and axis
  {
    key: 'AddRegionVertical', label: 'Graph “Region” on the vertical axis', url: './resources/videos/GraphVertical.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    //constraints: [ {property: 'attributeName', value: 'Region'}],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'How do the regions of the world compare in terms of number of doctors? Do some appear to be generally higher or lower?'
      )
    )
  },
  //
  {
    key: 'ToggleMean', label: 'Add the mean to each distribution to help compare them', url: './resources/videos/MeanRegion.mp4',
    operation: 'togglePlottedMean', type: 'DG.GraphView',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'How does adding the mean help you compare the distributions for each region? Are the means for some regions higher or lower than the others?'
      )
    )
  }, {
    key: 'ToggleMedian', label: 'Add the median to each distribution to help compare them', url: './resources/videos/MedianRegion.mp4',
    operation: 'togglePlottedMedian', type: 'DG.GraphView',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'How does adding the median line help you compare the distributions of doctors in different regions?  Do the medians show you the same patterns as the means did?'
      )
    )
  }, {
    key: 'RemoveRegion', label: 'Remove “Region” from the vertical axis to create a single distribution again', url: './resources/videos/RemoveVertical.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    constraints: [{ property: 'attributeName', value: 'Remove Y: Region' }],
    prereq: 'AddRegionVertical',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You can always remove an attribute from an axis by clicking on the attribute name and choosing \u201Cremove X or Y.\u201D'
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
      'Hidden attributes'
    ),
    React.createElement(
      'li',
      null,
      'Unhid attributes'
    ),
    React.createElement(
      'li',
      null,
      'Created a graph'
    ),
    React.createElement(
      'li',
      null,
      'Graphed a numerical attribute on the horizontal axis'
    ),
    React.createElement(
      'li',
      null,
      'Graphed a categorical attribute on the vertical axis'
    ),
    React.createElement(
      'li',
      null,
      'Added mean to a distribution'
    ),
    React.createElement(
      'li',
      null,
      'Added median to a distribution'
    ),
    React.createElement(
      'li',
      null,
      'Removed an attribute from the vertical axis'
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
    ' with just those skills!'
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
