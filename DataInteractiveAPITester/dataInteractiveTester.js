$(function () {
  var kTrianglePointsRight = '\u25B6';
  var kTrianglePointsDown = '\u25BC';

  var seq = 0;
  var successes = 0;

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
      'undoFrame'
    ];

  function isSuccess(obj) {
    if (!obj) { return false;}
    var rslt = true;
    if (!Array.isArray(obj)) obj = [obj];
    rslt = !obj.some(function (o) {
      return (!(o.success))
    });
    return rslt;
  }

  var codapPhone = new iframePhone.IframePhoneRpcEndpoint(function (iRequest, callback) {
    logMessage('notify', ' ', iRequest);
    callback({success: true});
  }, "data-interactive", window.parent);


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
    var expandEl = $('<span>').addClass('expandToggle').text(kTrianglePointsRight);
    var idEl = $('<span>').text((id|'') + ' ');
    var typeEl = $('<span>').addClass('messageType').text(lookupLongType[type] + ': ');
    var domID = (id !== null && id !== undefined)? 'r' + id: undefined;
    var messageEl = $('<span>').addClass('log-message').text(JSON.stringify(message, null, "  "));
    var el = $('<div>').append(expandEl).append(idEl).append(typeEl).append(messageEl);
    el.addClass(myClass).addClass('di-log-line').addClass('toggleClosed');
    if (domID) el.prop('id', domID);
    el.appendTo('#message-log');
    return el;
  }

  var compareObj = function(obj1, obj2) {
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
        var id = ++seq;
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
              successes++;
            } else {
              failClass = 'fail';
            }
          } else if (isSuccess(result)) {
            successes++;
          } else {
            failClass = 'fail'
          }
          var respEl = logMessage('resp', id, result);
          $('#message-log')[0].scrollTop = $('#message-log')[0].scrollHeight;
          $('#success').text(successes);
//              console.log('Reply: ' + JSON.stringify(result));
          sendOneMessage(msgNum+1);
        });
        $('#sentMessages').text(seq);
      }
      sendOneMessage(0);
    } catch (e) {
      logMessage('err', null, '' + (++seq) + ': ' + e);
      throw e;
    }
  }

  function makeRequestBuilder(resourceTypes, actions) {
    var $requestBuilder = $('<div>').addClass('di-request-builder')
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


  $.get('./tests.json', function (data) {
    var $testSection = $("#ctl");

    var $table = $('<table id="test-table">');

    makeRequestBuilder(resourceTypes, actions).appendTo($testSection);

    $('.di-request-builder').on('click', '.di-request-builder-item .di-item', function (ev) {
      $('.di-request-builder').find('.di-selected').removeClass('di-selected');
      $(this).addClass('di-selected');
    });


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
              .addClass('toggleClosed')
              .text( messageString)
      ).appendTo($row);
      $row.appendTo($table);
    })
    $table.appendTo($testSection);

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
        $row.find('.di-test-message-field').removeClass('toggleClosed').addClass('toggleOpen');
      } else {
        $this.text('open');
        $row.find('.di-test-message-field').removeClass('toggleOpen').addClass('toggleClosed');
      }
    });

    $('#message-log').on('click', '.expandToggle', function () {
      var $this = $(this);
      var text = $this.text();
      var $div = $this.parent('div');

      if ($div.hasClass('toggleClosed')) {
        $this.text(kTrianglePointsDown);
        $div.removeClass('toggleClosed').addClass('toggleOpen');
      } else {
        $this.text(kTrianglePointsRight);
        $div.removeClass('toggleOpen').addClass('toggleClosed');
      }
    });
  })
});
