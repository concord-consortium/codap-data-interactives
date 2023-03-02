(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = true; // This is a kludge to prevent loading of Mammals on touch devices

taskDescriptions = {
  descriptions: [{
    key: 'MakeGraph', label: 'Create a graph.', url: './resources/videos/CreateGraph.mp4',
    operation: 'create', type: 'graph',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great, you have a graph!  The data points are scattered because nothing has been added to the axis yet.'
      ),
      React.createElement(
        'p',
        null,
        'The next step is deciding on an attribute to explore.'
      )
    )
  },

  // Make specific to named attribute (and horizontal axis?)
  {
    key: 'AddDoctors', label: 'Drag "Total Count of Medical Doctors” onto the horizontal axis.',
    url: './resources/videos/DragAttributeHoriz.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    constraints: [{ property: 'attributeName', value: 'Total Count of Medical Doctors' }],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'That\u2019s a good start!  It\'s possible to replace the attribute you\'ve graphed with a different one. It\u2019s possible to replace which attribute you\u2019ve graphed on the axis, too.'
      )
    )
  },

  // Make specific to named attribute (and axis / swap)
  {
    key: 'AddInternetUsers', label: 'Change the attribute by dragging “Internet Users” to the horizontal axis.', url: './resources/videos/ChangeAttribute.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    constraints: [{ property: 'attributeName', value: 'Internet Users' }],
    prereq: 'AddDoctors',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great work. In a later step you will drag another attribute into the middle of the graph to get a sense of the relationship between the two attributes.'
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
    key: 'ChangeScale', label: 'Drag the horizontal axis to change the scale. (Can you spread the points out?)', url: './resources/videos/ChangeScale.mp4',
    operation: 'change axis bounds', type: 'DG.GraphView',
    prereq: 'AddInternetUsers',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Notice that you need to hover over the horizontal axis to get a right-facing hand to expand the axis.  You can change the scale on either the horizontal or vertical axis to zoom in or out on the data points.  When you hover over an axis, the hand may face left, right, up or down to show how the axis will change.'
      )
    )
  }, {
    key: 'MakeLegend', label: 'Drag “Urban Living” to the middle of the graph to color the points in the graph.',
    url: './resources/videos/ColorPoints.mp4',
    operation: 'legendAttributeChange', type: 'DG.GraphModel',
    requiresSpecialHandling: true,
    //constraints: [ {property: 'attributeName', value: 'Urban Living'}],
    prereq: 'AssignAttribute',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Nice job. You\u2019ll notice that the points are colored according to the values of \u201CUrban Living.\u201D'
      ),
      React.createElement(
        'p',
        null,
        'Notice where the darker and lighter points are.  Are they clustered in any way? How do they relate to the values of \u201CInternet Users\u201D?'
      )
    )
  },

  // Make specific to graph title change (vs. table)
  {
    key: 'ChangeGraphTitle', label: 'Add a title to your graph!', url: './resources/videos/AddTitle.mp4',
    operation: 'titleChange', type: '',
    //componentType: 'graph',
    //constraints: [ {property: 'to', value: 'NewTitle'}],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Nice work!  It\u2019s a good idea to name your graphs so that you remember what attributes you put on the axes, in case you want to minimize the graph later.'
      )
    )
  }, {
    key: 'DrawTool', label: 'Open your graph in the Draw Tool.', url: './resources/videos/DrawTool.mp4',
    operation: 'create game controller', type: 'DG.WebView',
    //requiresSpecialHandline: true,
    prereq: 'MakeGraph',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great!  You can use this draw tool to add text to your graph or circle points you want to highlight, both of which could be very helpful in a presentation.'
      ),
      React.createElement(
        'p',
        null,
        'This tool works with maps as well.'
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
      'Created a graph'
    ),
    React.createElement(
      'li',
      null,
      'Graphed a numerical attribute onto the horizontal axis'
    ),
    React.createElement(
      'li',
      null,
      'Changed the attribute graphed on the horizontal axis'
    ),
    React.createElement(
      'li',
      null,
      'Colored the points in the graph'
    ),
    React.createElement(
      'li',
      null,
      'Changed the scale on the horizontal axis'
    ),
    React.createElement(
      'li',
      null,
      'Added a title to a graph'
    ),
    React.createElement(
      'li',
      null,
      'Opened a graph in the Draw Tool'
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
    ' with just those seven skills!'
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

tracingFeedback = React.createElement(
  'div',
  null,
  React.createElement(
    'p',
    null,
    'Here!'
  )
);

},{}]},{},[1]);
