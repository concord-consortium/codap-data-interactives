(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [hasMouse ? {
    key: 'MakeMap', label: 'Create a map.', url: './resources/videos/CreateMap.mp4',
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
  } : {}, {
    key: 'AddLifeExpectancy', label: 'Drag the attribute "Average Life Expectancy" onto the map', url: './resources/videos/DragAttributeMap.mp4',
    operation: 'legendAttributeChange', type: 'DG.MapModel',
    constraints: [{ property: 'attributeName', value: 'Average Life Expectancy' }],
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Well done. You dragged \u201CAverage Life Expectancy\u201D from the table to the map.'
      ),
      React.createElement(
        'p',
        null,
        'Now the countries on the map are colored according to the values of \u201CAverage Life Expectancy.\u201D'
      ),
      React.createElement(
        'p',
        null,
        'Countries with a high value are darker and those with a low value are lighter. Later you will select lighter or darker portions on the map using the legend at the bottom.'
      ),
      React.createElement(
        'p',
        null,
        'Take a look at the legend. Which areas of the map have high values for Average Life Expectancy?'
      )
    )
  }, {
    key: 'MoveMap', label: 'Move the map', url: './resources/videos/MoveMap.mp4',
    operation: 'move', type: 'DG.MapView',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'You can always move a map (or a graph or a table) to make more space on the screen.'
      )
    )
  },
  //* Chad, Andee and Traci would like to delete Minimize the Map and Restore the Map. I commented these out for now. -NS
  //*    {
  //*     key: 'MinimizeMap', label: 'Minimize the map', url: './resources/videos/MinimizeMap.mp4',
  //*     operation: 'toggle minimize component', type: 'DG.MapView',
  //*    requiresSpecialHandling: true,
  //*    feedback: <div>
  //*    <p>Now you have a lot more space.</p>
  //* <p>You can restore the map to its original size by clicking on the “minus” sign again.</p>
  //*   </div>
  //*    },
  //* Issues here – operation already captured? {also bug — need to reposition the map after restoring size}
  //*    { 
  //*      key: 'RestoreMap', label: 'Restore the map to its full size', url: './resources/videos/RestoreMap.mp4',
  //*      operation: 'toggle minimize component', type: 'DG.MapView',
  //*     prereq: 'MinimizeMap',
  //*     requiresSpecialHandling: true,
  //*      feedback:
  //*     <div> 
  //*      <p>Now you have your map back.</p>
  //*	<p>You can always minimize or restore any CODAP object (called a “tile”).  There is a list of all 
  //*	of your tiles under “tiles” in the upper right of your screen.</p>
  //*    </div>
  //*  },
  //Issues here – differentiating whether user has selected the top-most bin of an arbitrarily selected attribute
  {
    key: 'SelectCountries', label: 'Click on the colored legend bars to select a subset of countries. Try selecting the countries with higher values of the attribute (darker colors).', url: './resources/videos/SelectDarkColorsOnMap.mp4',
    operation: 'selectCases', type: '',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Well done! You selected a set of countries that have similar life expectancy and highlighted them on the map. When you select a country, notice that the corresponding row highlights in the table. '
      ),
      React.createElement(
        'p',
        null,
        'How do you think you could select countries that have different values? For example, which countries have relatively low life expectancies?'
      )
    )
  },
  //Issues here — a) not triggering this at the same time as the first, b) etermining whether user has added a new attribute rather than dragging the old one again
  {
    key: 'ChangeMapLegend', label: 'Color the map by a different attribute.', url: './resources/videos/ColorMap2ndAttribute.mp4',
    operation: 'legendAttributeChange', type: 'DG.MapModel',
    prereq: 'AddLifeExpectancy',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        'Wonderful! You dragged a different attribute from the table to the map.'
      ),
      React.createElement(
        'p',
        null,
        'You can drag any of the attributes in your table to the map to create a different map display in CODAP.'
      ),
      React.createElement(
        'p',
        null,
        'To find the full name and more information about any attribute, you can hover over its name at the top of the column in the table.'
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
      'Created a map'
    ),
    React.createElement(
      'li',
      null,
      'Dragged an attribute onto the map'
    ),
    React.createElement(
      'li',
      null,
      'Moved the map'
    ),
    React.createElement(
      'li',
      null,
      'Selected attributes with higher values on a map'
    ),
    React.createElement(
      'li',
      null,
      'Colored the map by a different attribute'
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

},{}]},{},[1]);
