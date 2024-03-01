hasMouse =  !('ontouchstart' in window);
onboarding1 = false;

taskDescriptions = {
  descriptions: [{
    key: 'MakeScatterplot', label: tr("~onboarding2.make.scatterplot.task"),
    url: './resources/' + resourceDir() + "MakeScatterplot.mp4",
    operation: 'attributeChange', type: '',
    requiresSpecialHandling: true,
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.make.scatterplot.success.message")
      )
    )
  }, {
    key: 'SelectCases', label: tr("~onboarding2.select.cases.task"),
    url: './resources/' + resourceDir() + "SelectCases.mp4",
    operation: 'selectCases',
    constraints: [{ property: 'cases', value: true }],
    prereq: 'MakeScatterplot',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.select.cases.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding2.select.cases.success.message2")
      )
    )
  }, {
    key: 'HideUnselected', label: tr("~onboarding2.hide.unselected.task"),
    url: './resources/' + resourceDir() + "HideUnselected.mp4",
    operation: 'hideUnselected', type: '',
    prereq: 'SelectCases',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.hide.unselected.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding2.hide.unselected.success.message2")
      )
    )
  }, {
    key: 'Deselect', label: tr("~onboarding2.deselect.task"),
    url: './resources/' + resourceDir() + "Deselect.mp4",
    operation: 'selectCases',
    constraints: [{ property: 'cases', value: false }],
    prereq: 'HideUnselected',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.deselect.success.message")
      )
    )
  }, {
    key: 'Rescale', label: tr("~onboarding2.rescale.task"),
    url: './resources/' + resourceDir() + "Rescale.mp4",
    operation: 'rescaleGraph', type: '',
    prereq: 'HideUnselected',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.rescale.success.message")
      )
    )
  }, {
    key: 'MakeLegend', label: tr("~onboarding2.add.legend.task"),
    url: './resources/' + resourceDir() + "MakeLegend.mp4",
    operation: 'legendAttributeChange', type: 'DG.GraphModel',
    constraints: [{ property: 'attributeName', value: tr("~legend.attribute") }],
    prereq: 'MakeScatterplot',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding2.add.legend.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding2.add.legend.success.message2")
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
    tr("~onboarding2.all.success.message1")
  ),
  React.createElement(
    'ul',
    null,
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message2")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message3")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message4")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message5")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message6")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding2.all.success.message7")
    )
  ),
  React.createElement(
    'p',
    null,
    tr("~onboarding2.all.success.message8")
  )
);

infoFeedback = React.createElement(
  'div',
  null,
  React.createElement(
    'p',
    null,
    tr("~onboarding1.info.message1")
  ),
  React.createElement(
    'p',
    null,
    tr("~onboarding1.info.message2"),
    React.createElement('br', null),
    React.createElement(
      'a',
      { href: 'https://github.com/concord-consortium/codap-data-interactives/tree/master/onboarding',
        target: '_blank' },
      tr("~onboarding1.info.message3")
    ),
    '. '
  ),
  React.createElement(
    'p',
    null,
    tr("~onboarding1.info.message4"),
    React.createElement('br', null),
    React.createElement(
      'a',
      { href: 'https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API',
        target: '_blank' },
      tr("~onboarding1.info.message5")
    ),
    '.'
  )
);