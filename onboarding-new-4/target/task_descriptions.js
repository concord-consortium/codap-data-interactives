(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [hasMouse ? {
    key: 'ToggleToCaseCard', label: 'Switch from table to case card view of the data to make more space on the screen', url: './resources/videos/CaseCard.mp4',
    operation: 'toggle table to card', type: 'DG.CaseTable',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Now you have a lot more space on the screen.  You can see the range of values for each of the attributes on the case card.  You can also \u201Cscroll\u201D through the cases using the right and left arrows at the top of the card. To get back to the card with the range of values, click on the circle between the arrows at the top of the card.'
      )
    )
  } : {},
  //4.2 - Need to redo actions
  {
    key: 'AddAverageGNPHoriz', label: 'Create a graph and drag \"Average GNP per person\" to the horizontal axis', url: './resources/videos/4creategraphhoriz.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    //constraints: [{property: 'attributeName', value:'Average GNP per Person'}],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Well done! \u201CAverage GNP per Person\u201D is one way to measure how much wealth there is in a country. What do you notice about the graph?'
      )
    )
  }, {
    key: 'AddAvgLifeExpectVertical', label: 'Drag \"Average Life Expectancy\" to the vertical axis of your graph.', url: './resources/videos/AddLifeExp.mp4',
    operation: 'attributeChange', type: 'DG.GraphView',
    constraints: [{ property: 'attributeName', value: 'Average Life Expectancy' }],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Now that you have two attributes on the graph, what do you notice? Do countries that have a high value on one attribute generally have a high value on the other?'
      )
    )
  }, {
    key: 'CreateMap', label: 'Create a map.', url: './resources/videos/CreateMap.mp4',
    operation: 'create', type: 'map',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great, you\u2019ve opened a map.  Now you can put an attribute on it.'
      ),
      React.createElement(
        'p',
        null,
        'The colors are all the same because you haven\u2019t dragged data onto the map yet. You will add data from an attribute next.'
      )
    )
  }, {
    key: 'SelectTopCountries', label: 'Drag on the graph to select nine or more countries that have both high average GNP and high life expectancy.', url: './resources/videos/SelectCountriesonGraph.mp4',
    operation: 'selectCases', type: ['DG.GraphView'],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Great! Notice that both the points you selected and the countries on the map that they correspond to are highlighted. This happens because the graph and the map are linked. Do you notice any geographical pattern of the highlighted countries?'
      )
    )
  }, {
    key: 'HideUnselectedPoints', label: 'Hide all of the points except the ones you’ve selected', url: './resources/videos/HideCasesonGraph.mp4',
    operation: 'hideUnselected', type: '',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Now the only points you can see are the ones you\u2019ve selected. This action of looking at only a subset of the points is called \u201Cfiltering.\u201D Try using filtering in your exploration of other datasets. To get all of the points to be visible again, go back to the \u201Ceyeball\u201D menu and choose \u201CShow all cases.\u201D'
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
      'Switched to case card view'
    ),
    React.createElement(
      'li',
      null,
      'Created a graph with an attribute on the horizontal axis'
    ),
    React.createElement(
      'li',
      null,
      'Created a map'
    ),
    React.createElement(
      'li',
      null,
      'Added an attribute to the vertical axis'
    ),
    React.createElement(
      'li',
      null,
      'Selected countries on a graph'
    ),
    React.createElement(
      'li',
      null,
      'Hid unselected points'
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
    ' with just those six skills!'
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
