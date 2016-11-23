$(function () {

  function isSuccess(obj) {
    if (!obj) { return false;}
    var rslt = true;
    if (!Array.isArray(obj)) obj = [obj];
    rslt = !obj.some(function (o) {
      return (!(o.success))
    });
    return rslt;
  }
  var codapPhone = new iframePhone.IframePhoneRpcEndpoint(function () {
  }, "data-interactive", window.parent);
  var seq = 0;
  var successes = 0;

  function send(test) {
    try {
      var parsedMessages = test;

      if (!Array.isArray(parsedMessages)) {
        parsedMessages = [parsedMessages];
      }

      var compareObj = function(obj1, obj2) {
        var ret = {},rett;
        for(var i in obj1) {
          rett = {};
          if (typeof obj1[i] === 'object'){
            rett = compareObj (obj1[i], obj2[i]) ;
            if (!$.isEmptyObject(rett) ){
              ret[i]= rett
            }
          }else{
            if(!obj2 || !obj2.hasOwnProperty(i) || obj1[i] !== obj2[i]) {
              ret[i] = obj1[i];
            }
          }
        }
        return ret;
      };

      function logComment(id, comment) {
        if (comment) {
          $('<div>').prop('id', 'r' + id).addClass('di-comment').text('#' + id +
                  ' Test: ' + comment)
              .appendTo('#receivedMessage');
        }
      }

      function sendOneMessage(msgNum) {
        if (msgNum >= parsedMessages.length) { return; }
        var id = ++seq;
        var parsedMessage = parsedMessages[msgNum].message;
        var expected = parsedMessages[msgNum].expect;
        var testName = parsedMessages[msgNum].name;
        console.log('Message: ' + JSON.stringify(parsedMessage));
        logComment(id, testName);
        $('<div>')
            .prop('id', 'r' + id)
            .addClass('di-req')
            .text('#' + id + ' Request: ' + JSON.stringify(parsedMessage, null, '  '))
            .appendTo('#receivedMessage');
        if (expected) {
          $('<div>')
              .addClass('di-expect')
              .text('#' + id + ' Expect: ' + JSON.stringify(expected), null, '  ')
              .appendTo('#receivedMessage');
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
          var respEl = $('<div>')
              .addClass('di-resp').addClass(failClass)
              .text('#' + id + ' Response: ' + JSON.stringify(result, null, '  '))
              .appendTo('#receivedMessage');
          $('#receivedMessage')[0].scrollTop = $('#receivedMessage')[0].scrollHeight;
          $('#success').text(successes);
//              console.log('Reply: ' + JSON.stringify(result));
          sendOneMessage(msgNum+1);
        });
        $('#sentMessages').text(seq);
      }
      sendOneMessage(0);
    } catch (e) {
      $('#receivedMessage').prepend($('<div>').text('' + (++seq) + ': ' + e));
    }
  }

  $.get('./tests.json', function (data) {
    var $testSection = $("#ctl");
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
  })
});
