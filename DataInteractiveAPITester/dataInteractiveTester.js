/*global $:true, codapInterface:true, Promise:true */
$(function () {
  // var kTrianglePointsRight = '\u25B6';
  // var kTrianglePointsDown = '\u25BC';
  var kResourceTypeSelector = '.di-resource-type-list .di-item';
  var kActionSelector = '.di-action-list .di-item';
  var kTemplateSelector = '.di-template-list .di-item';

  var interactiveState = null;

  // var stats = {
  //   seq: 0,
  //   successes: 0
  // }

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
      'attributeLocation',
      'case',
      'item',
      'global',
      'selectionList',
      'undoChangeNotice',
      'formulaEngine',
      'logMessage',
      'logMessageMonitor'
    ];

  var templates = [];
  var templateMap = {};

  // /**
  //  * Connection to CODAP.
  //  */
  // var codapPhone = new iframePhone.IframePhoneRpcEndpoint(function (iRequest, callback) {
  //   logMessage('notify', ' ', iRequest);
  //   callback({success: true});
  // }, "data-interactive", window.parent);

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
   * Form a log message
   * @param type {'comment'||'req'||'resp'||'expect'||'notice''}
   * @param id {number} sequence number of user action. CODAP initiated actions
   *                    have id 0
   * @param message {string}
   * @returns {null|jQuery} Element for insertion.
   */
  function logMessage(type, id, message, isError) {
    if (message === null || message === undefined) {
      return;
    }

    if (type === 'notify' && notifyFilterIsActive()) {
      interactiveState.history.push({type: type, id: id, message: message});
      return;
    }

    var lookupLongType={
      comment: 'Comment',
      req: 'Request',
      expect: 'Expect',
      resp: 'Response',
      notify: 'Notify',
      err: 'Error',
      error: 'Error'
    }

    var myClass = 'di-' + type;
    var $expandEl = $('<span>')
        .addClass('di-expand-toggle')
        .text(' ');
    var $idEl = $('<span>')
        .text(( id || '' ) + ' ');
    var $typeEl = $('<span>')
        .addClass('di-message-type')
        .text(lookupLongType[type] + ': ');
    var domID = (id !== null && id !== undefined)? 'r' + id: undefined;
    var messageStr = (typeof message === 'string')?message:JSON.stringify(message, null, "  ");
    var $messageEl = $('<span>')
        .addClass('di-log-message')
        .text(messageStr);
    var $entryEl = $('<div>')
        .append($expandEl)
        .append($idEl)
        .append($typeEl)
        .append($messageEl);
    var $messageLog = $('#message-log');

    $entryEl.addClass(myClass)
        .addClass('di-log-line')
        .addClass('di-toggle-closed');

    if (isError) {
      $entryEl.addClass('di-fail');
    }

    if (domID) {
      $entryEl.prop('id', domID);
    }

    if (type === 'req') {
      $entryEl.prepend(
          $('<button>')
              .addClass('di-copy-button')
              .prop('title', 'copy to message prep')
              .text('copy')
      );
    }

    $entryEl.appendTo($messageLog);

    $messageLog[0].scrollTop = $messageLog[0].scrollHeight;

    interactiveState.history.push({type: type, id: id, message: message});

    return $entryEl;
  }

  /**
   * Compare two objects.
   *
   * Returns the portions of expected that vary from result.
   * If expected matches the pattern %.*%, then any value for the property is
   * considered a match.
   *
   * @param expected
   * @param result
   * @returns {{}}
   */
  function compareObj(expected, result) {
    var ret = {},variance, key;
    for(key in expected) {
      if (expected.hasOwnProperty(key)) {
        variance = {};
        if (typeof expected[key] === 'object'){
          variance = compareObj (expected[key], result[key]) ;
          if (!$.isEmptyObject(variance) ){
            ret[key]= variance
          }
        } else {
          if(
              !result || // result exists, ...
              !result.hasOwnProperty(key) || // has the sought property...
                                             // and matches value...
              (!/^%.*%$/.test(expected[key]) && (expected[key] !== result[key]
            ))) {
            ret[key] = expected[key];
          }
        }
      }
    }
    return ret;
  }

  function logComment(id, comment) {
    logMessage('comment', id, comment);
  }

  function sendNextTest(parsedMessages, msgNum) {
    if (msgNum >= parsedMessages.length) { return; }
    var id = ++interactiveState.stats.seq;

    var parsedMessage = parsedMessages[msgNum];
    var message = parsedMessage.message || parsedMessage;
    var expected = parsedMessage.expect;
    var testName = parsedMessage.name;
    console.log('Message: ' + JSON.stringify(message));
    logComment(id, testName);
    logMessage('req', id, message);
    if (expected) {
      logMessage('expect', id, expected);
    }
    codapInterface.sendRequest(message, function (result) {
      var isError = false;
      var diff;
      if (result && expected) {
        diff = compareObj(expected, result);
        if ($.isEmptyObject(diff)) {
          interactiveState.stats.successes++;
        } else {
          isError = true;
        }
      } else if (isSuccess(result)) {
        interactiveState.stats.successes++;
      } else {
        isError = true;
      }
      logMessage('resp', id, result, isError);
      $('#success').text('' + interactiveState.stats.successes);
//              console.log('Reply: ' + JSON.stringify(result));
      sendNextTest(parsedMessages, msgNum+1);
    });
    $('#sentMessages').text('' + interactiveState.stats.seq);
  }

  /**
   * Initiate a test by sending a request ot CODAP.
   * @param test {object}
   */
  function sendTest(test) {
    try {
      var parsedMessages = test;

      if (!Array.isArray(parsedMessages)) {
        parsedMessages = [parsedMessages];
      }

      sendNextTest(parsedMessages, 0);
    } catch (e) {
      logMessage('err', null, '' + (interactiveState.stats.seq) + ': ' + e);
      throw e;
    }
  }

  /**
   * Sends a plain message to CODAP.
   * @param message
   * @return {Promise}
   */
  function sendMessage(message) {
    return new Promise(function (resolve, reject) {
      codapInterface.sendRequest(message, function (reply) {
        if (!reply) {
          reject('Request timeout');
        }
        if (reply.success) {
          resolve(reply)
        } else {
          var error_message = (reply.values && reply.values.error) || "unknown error";
          reject(error_message);
        }
      });
    });
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

  function selectAction (/*actionName*/) {
    // if resource type is selected, display selected templates
    displaySelectedTemplates();
  }

  function selectTemplate(el) {
    var $el = $(el);
    $('.di-message-area').text($el.find('.di-template-text').text());
  }

  function isConstructionMode() {
    return $('#construction-mode-checkbox').is(':checked');
  }

  function displaySelectedTemplates() {
    function getTemplateMessage(template) {
      var ret;
      if (isConstructionMode()) {
        ret = Object.assign({}, template);
        delete ret.action;
        delete ret.resourceType;
      } else if (template.message) {
        ret = template.message;
      } else {
        ret = template;
      }
      return ret;
    }
    var resourceType = $(kResourceTypeSelector + '.di-selected').text();
    var action = $(kActionSelector + '.di-selected').text();
    var actionMap = templateMap[resourceType];
    var templateList;
    // console.log('displaySelectedTemplates: resourceType/action: ' + resourceType + '/' + action);
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
      var message = getTemplateMessage(template);
      if (template.name) {
        $('<div>').addClass('di-template-name').text(template.name).appendTo($div);
      }
      $('<div>').addClass('di-template-text').text(JSON.stringify(message, null, '  ')).appendTo($div);
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
  function makeTemplateSelector(resourceTypes, actions) {
    var $templateLabel = $('<div>').addClass('di-label').text('templates');
    var $templateSelector = $('<div>').addClass('di-request-builder');
    var $actionList = $('<div>').addClass('di-action-list').addClass('di-request-builder-item');
    var $resourceTypeList = $('<div>').addClass('di-resource-type-list').addClass('di-request-builder-item');
    var $templateList = $('<div>').addClass('di-template-list').addClass('di-request-builder-item');
    var $constructionModeCheckbox = $('<label>')
        .append($('<input>').prop({id:'construction-mode-checkbox', type: 'checkbox'}))
        .append($('<span>').text(' Test construction mode'));

    resourceTypes.forEach(function(resourceType) {
      $('<div>').addClass('di-item').text(resourceType).appendTo($resourceTypeList);
    });

    actions.forEach(function(actionName) {
      $('<div>').addClass('di-item').text(actionName).appendTo($actionList);
    });

    $templateSelector.append($resourceTypeList).append($actionList).append($templateList);

    return $templateLabel.after($templateSelector).after($constructionModeCheckbox);
  }

  function characterPositionToLineAndCol(str, pos) {
    var rows = 1;
    var cols = 0;
    var ix;
    for (ix = 0; ix < pos; ix += 1) {
      if (str[ix] === undefined) {
        break;
      } else if (str[ix] === '\n') {
        rows++;
        cols = 0;
      }
      cols++;
    }
    return 'row: ' + rows + " col: " + cols;
  }

  function makeRequestBuilderSection($el, resourceTypes, actions/*, templates*/) {
    var $templateSelectorSection = makeTemplateSelector(resourceTypes, actions).appendTo($el);
    /*var $editAreaLabel = */$('<div>').addClass('di-label').text('message prep').appendTo($el);
    /*var $editArea = */$('<div>').addClass('di-message-area').prop('contentEditable', true).appendTo($el);
    var $sendButton = $('<div>')
        .append($('<button>')
            .addClass('di-send-button')
            .prop('title', 'send to CODAP')
            .text('send')
        ).appendTo($el);

    $templateSelectorSection.on('click', '.di-request-builder-item .di-item', function (/*ev*/) {
      var $this = $(this);
      var $parent = $(this.parentElement);
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
      var message = $('.di-message-area').text();
      var messageObj;
      if (message && message.length > 0) {
        // parse
        try {
          messageObj = JSON.parse(message);
          sendTest(messageObj);
        } catch (ex) {
          var match = ex.message.match(/^.*in JSON at position ([0-9]+)/)
          if (match) {
            logMessage('error', interactiveState.stats.seq, 'JSON Parse error at or before ' +
                characterPositionToLineAndCol(message, match[1]))
          } else {
            logMessage('error', interactiveState.stats.seq, ex.toString());
          }
        }
      }
    });
  }

  var resourceMap = {
          attributeList: 'attribute',
          allCases: 'case',
          caseByIndex: 'case',
          caseByID: 'case',
          caseCount: 'case',
          caseSearch: 'case',
          caseFormulaSearch: 'case',
          collectionList: 'collection',
          componentList: 'component',
          dataContextFromURL: 'dataContext',
          dataContextList: 'dataContext',
          globalList: 'global',
          itemByCaseID: 'item',
          itemByID: 'item',
          itemCount: 'item',
          itemSearch: 'item'
        };

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
      var resourceName = resource
          .replace(/\[[^\]]*]/g, '') // remove qualifiers
          .replace(/.*\./, '');  // remove leading elements
      template.action = message.action;
      template.resourceType = resourceMap[resourceName] || resourceName;
      // console.log('resourceName, type: ' + [resourceName, template.resourceType].join());
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
  }

  function clearMessageLog() {
    codapInterface.getInteractiveState().history = [];
    interactiveState.stats.seq = 0;
    interactiveState.stats.successes = 0;
    $('#message-log').empty();
    $('#success').text('' + interactiveState.stats.successes);
    $('#sentMessages').text('' + interactiveState.stats.seq);
  }

  function extractNames(values) {
    return values.map(function(value) {return value.name;});
  }

  function resetCODAP() {
    sendMessage({
      action: 'get',
      resource: 'dataContextList'
    }).then (function (result) {
      var names = (result && result.success)? extractNames(result.values): null;
      var msg = names.map(function(name) {
        return {action: 'delete', resource: 'dataContext[' + name + ']'};
      });
      return sendMessage(msg);
    }).then(function () {
      return sendMessage({
        action: 'get',
        resource: 'componentList'
      })
    }).then(function (result) {
      var names = (result && result.success)? extractNames(result.values): null;
      var msg = names.map(function(name) {
        return {action: 'delete', resource: 'component[' + name + ']'};
      });
      return sendMessage(msg);
    });
  }

  function captureRequests() {
    return interactiveState.history &&
        interactiveState.history.filter &&
        interactiveState.history.filter(function (item) {
      return item.type === 'req';
    }) || [];
  }

  function makeRecordingName(recordings) {
    var ix = 1;
    var baseName = 'recording';
    var name = baseName + ix;
    while (recordings.find(function (recording) {return name === recording.name;})) {
      ix ++;
      name = baseName + ix;
    }
    return name;
  }

  function makeRecordingView(name, count, index) {
    var $recordingList = $('#recordings');
    // <div class="di-recording" data-recordIx="{num}" ><input value="{name}" /><button>replay</button></div>
    var $input = $('<input>').prop('value', name);
    var $count = $('<span>').text(' ' + count + ((count === 1)?' message':' messages'));
    var $replayButton = $('<button>').text('replay').addClass('replay-button');
    var $deleteButton = $('<button>').text('delete').addClass('delete-button');
    var $div = $('<div>')
        .addClass('di-recording')
        .data('recordIndex', index)
        .append($input)
        .append($count)
        .append($replayButton)
        .append($deleteButton);

    $recordingList.append($div);
  }

  function saveRecord() {
    if (!interactiveState.recordings) { interactiveState.recordings = []; }
    var name = makeRecordingName(interactiveState.recordings);
    var recording = {
      name: name,
      data: captureRequests()
    };
    interactiveState.recordings.push(recording);
    makeRecordingView(name, recording.data.length, interactiveState.recordings.length - 1);
  }

  function removeNotifyFilter() {
    $('#filter-button').removeClass('filter-active');
    regenerateLog();
  }

  function addNotifyFilter() {
    $('#filter-button').addClass('filter-active');
    regenerateLog();
  }

  function notifyFilterIsActive() {
    return interactiveState.config.filterNotifications; // $('#filter-button').hasClass('filter-active');
  }

  function toggleNotifyFilter() {
    var wasActive = interactiveState.config.filterNotifications; //$filterButton.hasClass('filter-active');
    interactiveState.config.filterNotifications = !interactiveState.config.filterNotifications;
    if (wasActive) {
      removeNotifyFilter();
    } else {
      addNotifyFilter();
    }
  }
  /**
   * Replay a recording
   */
  function replayRecording(recording) {
    sendTest(recording.data);
  }

  function regenerateLog () {
    var priorHistory = interactiveState.history;
    // clearMessageLog();
    $('#message-log').empty();
    priorHistory.forEach(function (item) {
      logMessage(item.type, item.id, item.message,
          item.type === 'resp' && !item.message.success);
    });
  }

  // request template repository
  $.get('./resources/tests.json', function (data) {
    var $testSection = $("#ctl");

    templates = data;

    classifyTemplateData(templates);

    templateMap = makeTemplateMap(templates);

    makeRequestBuilderSection($testSection, resourceTypes, actions/*, templates*/);

    // makeTemplateTable($testSection, templates);
  })

  $('#message-log').on('click', '.di-expand-toggle', function () {
    var $this = $(this);
    var $div = $this.parent('div');
    var $messageLog = $('#message-log');
    var divIsClosed = $div.hasClass('di-toggle-closed');

    $('.di-toggle-open').removeClass('di-toggle-open').addClass('di-toggle-closed')
    if (divIsClosed) {
      // $this.text(kTrianglePointsDown);
      $div.removeClass('di-toggle-closed').addClass('di-toggle-open');
    }
    if ($div.is(':last-of-type')) {
      $messageLog[0].scrollTop = $div[0].offsetTop;
    }
  });

  $('#message-log').on('click', '.di-copy-button', function () {
    var $this = $(this);
    var $parent = $this.parent('div');
    var message = $parent.find('.di-log-message').text();
    $('.di-message-area').text(message);
  })

  $('#clear-log-button').on('click', clearMessageLog);

  $('#reset-codap-button').on('click', resetCODAP);

  $('#record-button').on('click', saveRecord);

  $('#filter-button').on('click', toggleNotifyFilter);

  $('#recordings').on('click', '.replay-button', function () {
    var $parent = $(this.parentElement);
    var recordIndex = $parent.data('recordIndex');
    if (recordIndex !== undefined && recordIndex !== null) {
      replayRecording(interactiveState.recordings[recordIndex]);
    } else {
      console.log('Can\'t find recording: ' + $parent.find('input').val());
    }
  })

  $('#recordings').on('click', '.delete-button', function () {
    var $parent = $(this.parentElement);
    var recordIndex = $parent.data('recordIndex');
    if (recordIndex !== undefined && recordIndex !== null) {
      interactiveState.recordings.splice(recordIndex, 1);
      $parent.remove();
    } else {
      console.log('Can\'t find recording: ' + $parent.find('input').val());
    }
  })

  codapInterface.init({
    name: 'CODAP API Tester',
    title: 'CODAP API Tester',
    version: 'v0.3(#' + window.codapPluginConfig.buildNumber + ')',
    dimensions: { height: 640, width: 430},
    preventBringToFront: false
  }).then(function () {
    var priorHistory = [];
    interactiveState = codapInterface.getInteractiveState();
    if (!interactiveState.stats) {
      interactiveState.stats = { seq: 0, successes: 0};
    }
    // stats = interactiveState.stats;
    if (interactiveState.history) {
      priorHistory = interactiveState.history;
    }
    interactiveState.history = [];
    priorHistory.forEach(function (item) {
      logMessage(item.type, item.id, item.message,
          item.type === 'resp' && !item.message.success);
    });

    if (!interactiveState.recordings) {
      interactiveState.recordings = [];
    }
    interactiveState.recordings.forEach(function (recording, ix) {
      makeRecordingView(recording.name, recording.data.length, ix);
    });

    if (!interactiveState.config) {
      interactiveState.config = {
        filterNotifications: true
      }
    }
    if (interactiveState.config.filterNotifications) {
      addNotifyFilter();
    }
  });

  codapInterface.on('notify', '*', function (notice) {
    logMessage('notify', 0, notice);
  });
});
