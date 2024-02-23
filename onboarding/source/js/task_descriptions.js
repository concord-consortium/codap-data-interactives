hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [hasMouse ? {
    key: 'Drag', label: tr("~onboarding1.drag.task"), url: './resources/'+tr("~onboarding1.drag.movie.filename"),
    operation: 'dataContextCountChanged',
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.success.message2")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.success.message3")
      )
    )
  } : {
    key: 'MakeTable', label: tr("~onboarding1.make.table.task"), url: './resources/' + tr("~onboarding1.make.table.movie.filename"),
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.table.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.table.success.message2")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.table.success.message3")
      )
    )
  }, {
    key: 'MakeGraph', label: tr("~onboarding1.graph.task"), url: './resources/' + tr("~onboarding1.graph.movie.filename"),
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.graph.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.graph.success.message2")
      )
    ),
    alt_feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.graph.success.alt.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.make.graph.success.alt.message2")
      )
    )
  }, {
    key: 'MoveComponent', label: tr("~onboarding1.move.table.task"), url: './resources/' + tr("~onboarding1.move.table.movie.filename"),
    operation: 'move', type: ['DG.GraphView', 'DG.TableView'],
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr( "~onboarding1.move.graph.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.move.graph.success.message2")
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
    key: 'AssignAttribute', label: tr("~onboarding1.drag.attribute.task"), url: './resources/' + tr("~onboarding1.drag.attribute.movie.filename"),
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.attribute.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.attribute.success.message2")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.attribute.success.message3")
      )
    )
  }, {
    key: 'SecondAttribute', label: tr("~onboarding1.drag.second.attribute.task"), url: './resources/' + tr("~onboarding1.drag.second.attribute.movie.filename"),
    feedback: React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.second.attribute.success.message1")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.second.attribute.success.message2")
      ),
      React.createElement(
        'p',
        null,
        tr("~onboarding1.drag.second.attribute.success.message3")
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
    tr("~onboarding1.all.success.message1")
  ),
  React.createElement(
    'ul',
    null,
    React.createElement(
      'li',
      null,
      tr("~onboarding1.all.success.message2")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding1.all.success.message3")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding1.all.success.message4")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding1.all.success.message5")
    ),
    React.createElement(
      'li',
      null,
      tr("~onboarding1.all.success.message6")
    )
  ),
  React.createElement(
    'p',
    null,
    tr("~onboarding1.all.success.message7")
  ),
  React.createElement(
    'p',
    null,
    tr("~onboarding1.all.success.message8"),
    React.createElement(
      'a',
      { href: 'https://codap.concord.org/help/', target: '_blank' },
      tr("~onboarding1.all.success.message9")
    ),
    tr("~onboarding1.all.success.message10")
  ),
  React.createElement(
    'button',
    { onClick: () => window.parent.location.reload() },
    tr("~onboarding1.all.success.start.over.button")
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