(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = true; // This is a kludge to prevent loading of Mammals on touch devices

taskDescriptions = {
  descriptions: [{
    key: 'MakeGraph', label: 'Create a graph.', url: './resources/videos/DF_Tutorial_1_1.mp4',
    operation: 'create', type: 'graph',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great, you have a graph! The data points are scattered because nothing has been added to the axis yet.'
      )
    )
  },

  // Make specific to named attribute (and horizontal axis)
  // do we include    "axisOrientation": "horizontal"  in constraints?
  {
    key: 'AddHeight', label: 'Drag "Height (cm)” onto the horizontal axis.',
    url: './resources/videos/DF_Tutorial_1_2.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    //constraints: [{property: 'attributeName', value:'Height'}],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'That\u2019s a good start!  Dragging an attribute to an axis structures the data points so they become ordered on the graph.  You can also click on an attribute on the graph to replace it with another. '
      )
    )
  }, {
    key: 'MakeLegend', label: 'Drag “Height (cm)” to the middle of the graph to color the points in the graph.',
    url: './resources/videos/DF_Tutorial_1_3.mp4',
    operation: 'legendAttributeChange', type: 'DG.GraphModel',
    requiresSpecialHandling: true,
    //constraints: [ {property: 'attributeName', value: 'Height (cm)'}],
    prereq: 'AddHeight',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Nice job. You\u2019ll notice that the points are colored according to the values of \u201CHeight.\u201D'
      )
    )
  },

  // Select any point on the graph 
  // I don't know if the constraints line should be here or not.
  {
    key: 'SelectAnyPoint', label: 'Select a point on the graph', url: './resources/videos/DF_Tutorial_1_4.mp4',
    operation: 'selectCases', type: 'DG.GraphView',
    //constraints: [{property: '[selectCases]', value:''}],
    prereq: 'MakeGraph',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Nice! Notice that the table and graph are ',
        React.createElement(
          'em',
          null,
          'linked'
        ),
        ': the table scrolls to the relevant row for the point you selected in the graph, and highlights it for you. Or, if you select a row in the table, the corresponding point on the graph is also selected.'
      )
    )
  },

  // Display the mean
  // Should this have a prerequisite of MakeGraph ?
  {
    key: 'ToggleMean', label: 'Display the mean', url: './resources/videos/DF_Tutorial_1_5.mp4',
    operation: 'togglePlottedMean', type: 'DG.GraphView',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Nice work!  It\u2019s a good idea to explore the palette buttons to discover handy features including mean and median.'
      )
    )
  },

  // Add and remove Gender from vertical axis
  {
    key: 'AddRemoveGenderVertical', label: 'Drag Gender to the vertical axis and then remove it again', url: './resources/videos/DF_Tutorial_1_6.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    constraints: [{ property: 'attributeName', value: 'Remove Y: Gender' }],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'If you have displayed the mean or median, adding a non-numerical attribute to the y axis displays the mean for all the categories - handy for comparisons. When you remove the attribute, the overall mean returns to the display.'
      )
    )
  },

  // Make a histogram (requires 2 steps/buttons)
  // the first step is binning the points
  // Does this need the prereqs of MakeGraph and AddHeight ?
  //{
  //  key: 'BinPoints', label: 'Make a histogram in 2 steps. Open the palette to find and select Group into Bins', url: './resources/videos/DF_Tutorial_1.5a.mp4',
  //  operation: 'toggle show as BinnedPlot', type: 'DG.GraphView',
  //requiresSpecialHandling: true,
  //prereq: 'MakeGraph', 'AddHeight',
  //  feedback: <div>
  //    <p>Great!  You are halfway to a histogram!.</p>
  //  </div>
  //},

  // Make a histogram part 2
  // I included the prereq of the above, BinPoints, is that OK/correct ?
  {
    key: 'MakeHistogram', label: 'Make a histogram in 2 steps: First, open the palette to find and select \'Group Into Bins\'. Then open it again and select \'Fuse Dots Into Bars\'', url: './resources/videos/DF_Tutorial_1_7.mp4',
    operation: 'toggle between histogram and dots', type: 'DG.GraphView',
    //requiresSpecialHandling: true,
    //prereq: 'BinPoints',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Notice that the values in a histogram are continuous and that the bars touch each other for that reason. Specific data points are hidden, but the frequency of each range of points and the shape of the distribution become clear. The vertical axis is automagically labeled Count.'
      )
    )
  }, {
    key: 'MinimizeTable', label: 'Minimize the table', url: './resources/videos/DF_Tutorial_1_8a.mp4',
    operation: 'toggle minimize component', type: 'DG.TableView',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Now you have more space. Minimizing the table gives you more room for graphs or maps.'
      )
    )
  }, {
    key: 'ExpandTable', label: 'Expand the table again', url: './resources/videos/DF_Tutorial_1_8b.mp4',
    operation: 'toggle minimize component', type: 'DG.TableView',
    requiresSpecialHandling: true,
    //prereq: 'MinimizeTable',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Now you can work with the table again.'
      ),
      React.createElement(
        'p',
        null,
        'You can always minimize or restore any CODAP object (called a \u201Ctile\u201D). There is a list of all of your tiles under \u201Ctiles\u201D in the upper right of your screen.'
      )
    )
  }, {
    key: 'ReturnDotPlot', label: 'Open the palette on the graph and click “Points” to return to a dot plot', url: './resources/videos/DF_Tutorial_1_9.mp4',
    operation: 'toggle show as DotPlot', type: 'DG.GraphView',
    //requiresSpecialHandling: true,
    //prereq: 'MinimizeTable',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Well done! Now you can see the individuals in each of the four classes again.'
      )
    )
  },

  // Group the data using hierarchical table move
  // Note there are multiple notifications so this may not be possible?
  // First there are a couple of "dragdnd" operations
  // then there is a CreateCollection operation. 
  // Below I used the latter.
  {
    key: 'GroupByClass', label: 'In the table, drag the attribute Class all the way to the left. When the left edge turns yellow, drop the attribute. ', url: './resources/videos/DF_Tutorial_1_10.mp4',
    operation: 'createCollection', type: 'DG.TableView',
    constraints: [{ property: 'attributeName', value: 'Class' }],
    //requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You\'ve just grouped the data into the four different classes (cores) of students. Try selecting a class in the table and notice what happens in the graph!'
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
      'Colored the points in the graph'
    ),
    React.createElement(
      'li',
      null,
      'Selected a point to highlight it in both graph and table'
    ),
    React.createElement(
      'li',
      null,
      'Displayed the mean'
    ),
    React.createElement(
      'li',
      null,
      'Graphed a categorical attribute onto the vertical axis'
    ),
    React.createElement(
      'li',
      null,
      'Made a histogram'
    ),
    React.createElement(
      'li',
      null,
      'Minimized and restored a tile'
    ),
    React.createElement(
      'li',
      null,
      'Made a histogram back into a dot plot'
    ),
    React.createElement(
      'li',
      null,
      'Grouped the data into classes'
    ),
    React.createElement(
      'li',
      null,
      'Selected a class to highlight the data in both table and graph  '
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
