$(function () {
  var kTrianglePointsRight = '\u25B6';
  var kTrianglePointsDown = '\u25BC';
  var kResourceTypeSelector = '.di-resource-type-list .di-item';
  var kActionSelector = '.di-action-list .di-item';
  var kTemplateSelector = '.di-template-list .di-item';

  var stats = {
    seq: 0,
    successes: 0
  }

  var actions = [
      'get',
      'create',
      'update',
      'delete',
      'notify'
    ];
  var resourceTypes = [
      'interactiveFrame',
      'component',
      'dataContext',
      'collection',
      'attribute',
      'case',
      'item',
      'selection',
      'undoChangeNotice'
    ];
  var templates = [];
  var templateMap = {};

  function isSuccess(obj) {
    if (!obj) { return false;}
    var rslt = true;
    if (!Array.isArray(obj)) obj = [obj];
    rslt = !obj.some(function (o) {
      return (!(o.success))
    });
    return rslt;
  }

  /**
   * Connection to CODAP.
   */
  var codapPhone = new iframePhone.IframePhoneRpcEndpoint(function (iRequest, callback) {
    logMessage('notify', ' ', iRequest);
    callback({success: true});
  }, "data-interactive", window.parent);

  /**
   * Form a log message
   * @param type {'comment'||'req'||'resp'||'expect'||'notice''}
   * @param id {number} sequence number of user action. CODAP initiated actions
   *                    have id 0
   * @param message {string}
   * @returns {null|jQuery} Element for insertion.
   */
  function logMessage(type, id, message) {
    if (message === null || message === undefined) {
      return;
    }
    var lookupLongType={
      comment: 'Comment',
      req: 'Request',
      expect: 'Expect',
      resp: 'Response',
      notify: 'Notify'
    }
    var myClass = 'di-' + type;
    var expandEl = $('<span>').addClass('di-expand-toggle').text(kTrianglePointsRight);
    var idEl = $('<span>').text((id|'') + ' ');
    var typeEl = $('<span>').addClass('di-message-type').text(lookupLongType[type] + ': ');
    var domID = (id !== null && id !== undefined)? 'r' + id: undefined;
    var messageEl = $('<span>').addClass('di-log-message').text(JSON.stringify(message, null, "  "));
    var el = $('<div>').append(expandEl).append(idEl).append(typeEl).append(messageEl);
    el.addClass(myClass).addClass('di-log-line').addClass('di-toggle-closed');
    if (domID) el.prop('id', domID);
    el.appendTo('#message-log');
    return el;
  }

  /**
   * Compare two objects.
   *
   * Returns the portions of obj1 that vary from obj2.
   *
   * @param obj1
   * @param obj2
   * @returns {{}}
   */
  function compareObj(obj1, obj2) {
    var ret = {},variance;
    for(var i in obj1) {
      if (obj1.hasOwnProperty(i)) {
        variance = {};
        if (typeof obj1[i] === 'object'){
          variance = compareObj (obj1[i], obj2[i]) ;
          if (!$.isEmptyObject(variance) ){
            ret[i]= variance
          }
        }else{
          if(!obj2 || !obj2.hasOwnProperty(i) || obj1[i] !== obj2[i]) {
            ret[i] = obj1[i];
          }
        }
      }
    }
    return ret;
  };

  /**
   * Initiate a test by sending a request ot CODAP.
   * @param test {object}
   */
  function send(test) {
    try {
      var parsedMessages = test;

      if (!Array.isArray(parsedMessages)) {
        parsedMessages = [parsedMessages];
      }

      function logComment(id, comment) {
        logMessage('comment', id, comment);
      }

      function sendOneMessage(msgNum) {
        if (msgNum >= parsedMessages.length) { return; }
        var id = ++stats.seq;
        var parsedMessage = parsedMessages[msgNum].message;
        var expected = parsedMessages[msgNum].expect;
        var testName = parsedMessages[msgNum].name;
        console.log('Message: ' + JSON.stringify(parsedMessage));
        logComment(id, testName);
        logMessage('req', id, parsedMessage);
        if (expected) {
          logMessage('expect', id, expected);
        }
        codapPhone.call(parsedMessage, function (result) {
          var failClass = '';
          var diff;
          if (result && expected) {
            diff = compareObj(expected, result);
            if ($.isEmptyObject(diff)) {
              stats.successes++;
            } else {
              failClass = 'di-fail';
            }
          } else if (isSuccess(result)) {
            stats.successes++;
          } else {
            failClass = 'di-fail'
          }
          var respEl = logMessage('resp', id, result);
          $('#message-log')[0].scrollTop = $('#message-log')[0].scrollHeight;
          $('#success').text(stats.successes);
//              console.log('Reply: ' + JSON.stringify(result));
          sendOneMessage(msgNum+1);
        });
        $('#sentMessages').text(stats.seq);
      }
      sendOneMessage(0);
    } catch (e) {
      logMessage('err', null, '' + (++stats.seq) + ': ' + e);
      throw e;
    }
  }

  function selectResourceType(resourceTypeName) {
    // disable unsupported actions
    var actionTemplates = templateMap[resourceTypeName];
    $(kActionSelector).each(function (ix, el) {
      var $el = $(el);
      var elText = $el.text();
      $el.removeClass('di-disabled');
      if (!actionTemplates || !actionTemplates[elText]) {
        $el.addClass('di-disabled');
        $el.removeClass('di-selected');
      }
    })

    // display selected templates
    displaySelectedTemplates();
  }

  function selectAction (actionName) {
    // if resource type is selected, display selected templates
    displaySelectedTemplates();
  }

  function selectTemplate(el) {
    var $el = $(el);
    $('.di-message-area').text($el.find('.di-template-text').text());
  }

  function displaySelectedTemplates() {
    var resourceType = $(kResourceTypeSelector + '.di-selected').text();
    var action = $(kActionSelector + '.di-selected').text();
    var actionMap = templateMap[resourceType];
    var templateList;
    console.log('displaySelectedTemplates: resourceType/action: ' + resourceType + '/' + action);
    $(kTemplateSelector).remove();
    if (actionMap) {
      if (action) {
        templateList = actionMap[action];
      } else {
        templateList = [];
        Object.values(actionMap).forEach(function (templateArray) {
          templateList = templateList.concat(templateArray);
        });
      }
    }
    templateList && templateList.forEach(function (template) {
      var $div = $('<div>').addClass('di-item');
      if (template.name) {
        $('<div>').addClass('di-template-name').text(template.name).appendTo($div);
      }
      $('<div>').addClass('di-template-text').text(JSON.stringify(template.message, null, '  ')).appendTo($div);
      $div.appendTo('.di-template-list');
    })
  }

  /**
   * Build request builder section of page.
   *
   * Run once.
   * @param resourceTypes {[string]}
   * @param actions {[string]}
   * @returns {jQuery} Element for insertion.
   */
  function makeRequestBuilder(resourceTypes, actions) {
    var $requestBuilder = $('<div>').addClass('di-request-builder');
    var $actionList = $('<div>').addClass('di-action-list').addClass('di-request-builder-item');
    var $resourceTypeList = $('<div>').addClass('di-resource-type-list').addClass('di-request-builder-item');
    var $templateList = $('<div>').addClass('di-template-list').addClass('di-request-builder-item');

    resourceTypes.forEach(function(resourceType) {
      $('<div>').addClass('di-item').text(resourceType).appendTo($resourceTypeList);
    });

    actions.forEach(function(actionName) {
      $('<div>').addClass('di-item').text(actionName).appendTo($actionList);
    });

    $requestBuilder.append($resourceTypeList).append($actionList).append($templateList);

    return $requestBuilder;
  }

  function makeRequestBuilderSection($el, resourceTypes, actions, templates) {
    var $requestBuilderSection = makeRequestBuilder(resourceTypes, actions).appendTo($el);
    var $editArea = $('<div>').addClass('di-message-area').prop('contentEditable', true).appendTo($el);
    var $sendButton = $('<div>').append($('<button>').addClass('di-send-button').text('send')).appendTo($el);

    $requestBuilderSection.on('click', '.di-request-builder-item .di-item', function (ev) {
      $this = $(this);
      $parent = $(this.parentElement);
      $parent.find('.di-selected').removeClass('di-selected');
      if (!$this.hasClass('di-disabled')) {
        $this.addClass('di-selected');
      }
      if ($parent.hasClass('di-resource-type-list')) {
        selectResourceType($this.text());
      } else if ($parent.hasClass('di-action-list')) {
        selectAction($this.text());
      } else if ($parent.hasClass('di-template-list')) {
        selectTemplate($this)
      }
    });
    $sendButton.on('click', function () {
      var message = $(this.parentElement).text();
      if (message) {

      }
    });
  }

  function makeTemplateTable($el, data) {
    var $table = $('<table id="test-table">');

    $('<tr>')
        .append($('<th>').addClass('di-run-field').text(''))
        .append($('<th>').addClass('di-count-field').text('ct'))
        .append($('<th>').addClass('di-name-field').text('name'))
        .append($('<th>').addClass('di-open-field').text(''))
        .append($('<th>').text(''))
        .appendTo($table);
    data.forEach(function (test, ix) {
      var $row = $('<tr>').attr({id: 'test' + ix}).data('test', test);
      var messageString = (typeof test.message === 'string')?test.message: JSON.stringify(test.message, null, '  ');
      test.count = 0;
      $('<td>')
          .addClass('di-run-field')
          .append($('<button>').addClass('runButton').text('run'))
          .appendTo($row);
      $('<td>')
          .addClass('di-count-field')
          .addClass('count').append(0)
          .appendTo($row);
      $('<td>')
          .addClass('di-name-field')
          .text(test.name).appendTo($row);
      $('<td>')
          .addClass('di-open-field')
          .append($('<button>').addClass('openToggle').text('open'))
          .appendTo($row);
      $('<td>')
          .append($('<div>')
              .addClass('di-test-message-field')
              .attr('contentEditable', true)
              .addClass('di-toggle-closed')
              .text( messageString)
          ).appendTo($row);
      $row.appendTo($table);
    })
    $table.appendTo($el);

    $('#test-table .runButton').on('click', function () {
      console.log('click! ' + $(this).parents('tr').data('test').name);
      var $this = $(this);
      var $row = $this.parents('tr');
      var test = $row.find('.di-test-message-field').text();
      var testData = $row.data('test');
      testData.message = JSON.parse(test);
      testData.count++;
      $row.find('.count').text(testData.count);
      send(testData);
    });

    $('#test-table .openToggle').on('click', function () {
      var $this = $(this);
      var text = $this.text();
      var $row = $this.parents('tr');

      if (text === 'open') {
        $this.text('close');
        $row.find('.di-test-message-field').removeClass('di-toggle-closed').addClass('di-toggle-open');
      } else {
        $this.text('open');
        $row.find('.di-test-message-field').removeClass('di-toggle-open').addClass('di-toggle-closed');
      }
    });

  }

  function classifyTemplateData(templateData) {
    // make sure templates have a message field that is a normal object;
    templateData.filter(function (template) {
      var message = template.message;
      var isMessage = (message && (typeof message === 'object') && !Array.isArray(message));
      if (!isMessage) {
        console.log('Disqualifying template: ' + JSON.stringify(message));
      }
      return isMessage;
    }).forEach( function (template) {
      var message = template.message;
      var resource = message.resource;
      template.action = message.action;
      template.resourceType = resource
          .replace(/\[[^\]]*]/g, '')
          .replace(/.*\./, '')
          .replace(/(List|ByID|ByIndex|Count)$/, '');
    });
  }

  /**
   * Make a map of resourceTypes -> actions -> templates;
   * @param templateData
   */
  function makeTemplateMap(templateData) {
    var map = {};
    templateData.forEach(function (template) {
      var resourceType = template.resourceType;
      var action = template.action;
      if (!resourceType) {
        console.log('empty resource type: ' + JSON.stringify(template));
        return;
      }
      var actions = map[resourceType];
      if (!actions) {
        actions = {};
        map[resourceType] = actions;
      }
      if (!actions[action]) {
        actions[action] = [];
      }
      actions[action].push(template);
    });
    return map;
  };

  // request template repository
  $.get('./tests.json', function (data) {
    var $testSection = $("#ctl");

    templates = data;

    classifyTemplateData(templates);

    templateMap = makeTemplateMap(templates);

    makeRequestBuilderSection($testSection, resourceTypes, actions, templates);

    makeTemplateTable($testSection, templates);
  })

  $('#message-log').on('click', '.di-expand-toggle', function () {
    var $this = $(this);
    var text = $this.text();
    var $div = $this.parent('div');

    if ($div.hasClass('di-toggle-closed')) {
      $this.text(kTrianglePointsDown);
      $div.removeClass('di-toggle-closed').addClass('di-toggle-open');
    } else {
      $this.text(kTrianglePointsRight);
      $div.removeClass('di-toggle-open').addClass('di-toggle-closed');
    }
  });
});
