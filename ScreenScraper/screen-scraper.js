/*global $:true, iframePhone:true*/
$(document).ready(function () {
  var tableID = 0;
  var connection;
  // var connectionState = 'unstarted';
  var $dropRegion = $('.drop-region');
  var interactiveFrame = {
    name: 'TableDrop',
    dimensions: {x: 480, y: 640},
    preventDataContextReorg: false,
    preventBringToFront: false
  };

  // a euro number is...
  //                     + optional sign value
  //                     |     + either grouped whole number using dots or spaces for grouping
  //                     |     |                            + or ungrouped whole number
  //                     |     |                            |       + followed optionally by a comma decimal separator
  //                     |     |                            |       |   +git and either decimal digits or
  //                     v     v                            v       v   v        v grouped decimal digits
  var kIsEuroNumberRE = /^[-+]?(([0-9]{1,3}([. ][0-9]{3})*)|([0-9]*))(,(([0-9]*)|([0-9]{3}[. ])[0-9]{1,3}))?$/;
  // a grouped number is...
  //                        + optional sign value
  //                        |     + a grouped whole number using commas or spaces for grouping
  //                        |     |                           + followed optionally by a dot decimal separator
  //                        |     |                           |   +git and either decimal digits or
  //                        v     v                           v   v        v grouped decimal digits
  var kIsGroupedNumberRE = /^[-+]?([0-9]{1,3}([, ][0-9]{3})*)(\.(([0-9]*)|([0-9]{3}[. ])[0-9]{1,3}))?$/

  function isEuroNumber(v) {
    if (typeof v !== 'string') {
      return false;
    }
    return kIsEuroNumberRE.test(v);
  }

  function convertEuroNumber(str) {
    if (typeof str !== 'string') {
      return false;
    }
    return str.replace(/[. ]/g, '').replace(/,/, '.');
  }

  function isGroupedNumber(v) {
    if (typeof v !== 'string') {
      return false;
    }
    return kIsGroupedNumberRE.test(v);
  }

  /**
   * Convert a number that has commas to group  triplets of digits.
   */
  function convertGroupedNumber(str) {
    if (typeof str !== 'string') {
      return false;
    }
    return str.replace(/[, ]/g, '');
  }

  function sendRequest(request, callback) {
    connection.call(request, callback);
  }

  function init() {
    function handleCODAPRequest(/*request, callback*/) {
    }

    connection = new iframePhone.IframePhoneRpcEndpoint(
        handleCODAPRequest, "data-interactive", window.parent);
    // connectionState = 'initialized';
    sendRequest({
      "action": "update",
      "resource": "interactiveFrame",
      "values": interactiveFrame
    }, function (/*reply*/) { });
  }

  function handleRemove(ev) {
    var parentEl = ev.target.parentNode.parentNode;
    $(parentEl).remove();
  }

  function handleSend(ev) {
    function treatFirstRowAsHeader(/*firstRow*/) {
      var hasHeader = $('.first-line-header', parentEl).is(':checked');
      console.log('hasHeader: ' + hasHeader);
      return hasHeader;
//      return $('th', firstRow).length > 0;
    }

    function rowLength($row) {
      var $cols = $('th,td', $row);
      return $cols.length;
    }
    /**
     * Returns table stats object:
     *   numRows {number}
     *   maxCols {number}
     *   headerRows {[number]} Array of row indices of header rows
     *   rowLengthCounts {[number]} sparse array of counts of row lengths
     */
    function getTableStats($rows) {
      var stats = {
        numRows: 0,
        maxCols: 0,
        headerRows: [],
        rowLengthCounts: [],
        preponderantLength: 0
      }
      stats.numRows = $rows.length;
      $rows.each(function (ix, $row) {
        var len = rowLength($row);
        if (stats.rowLengthCounts[len]) {
          stats.rowLengthCounts[len]++;
        } else {
          stats.rowLengthCounts[len] = 1;
        }
        stats.maxCols = Math.max(stats.maxCols, len);
        if ($('th', $row).length === len) {
          stats.headerRows.push(ix);
        }
      });
      var maxCount = 0;
      stats.rowLengthCounts.forEach(function (count, ix) {
        if (maxCount < count) {
          maxCount = count;
          stats.preponderantLength = ix;
        }
      });
      console.log('stats: ' + JSON.stringify(stats));
      return stats;
    }

    function inferAttributeHeaderRowIndex (stats, $rows) {
      var sel = stats.headerRows.find(function (rowIx) {
        return rowLength($rows[rowIx]) === stats.maxCols;
      });
      if ((sel === undefined) && stats.maxCols !== stats.preponderantLength) {
        sel = stats.headerRows.find(function (rowIx) {
          return rowLength($rows[rowIx]) === stats.preponderantLength;
        });
      }
      if (sel !== undefined) {
        return sel;
      } else {
        return 0;
      }
    }

    function getAttributeDefinitions($headerRow, attrCount) {
      function makeUnique(name) {
        var newName = name;
        var ix = 1;
        while (names[newName]) {
          newName = name + ix;
          ix++;
        }
        names[newName] = true;
        return newName;
      }
      // we assume the first row is either all th or all td.
      var names = {};
      var attrs = [], ix, attrName;
      var $cols = $headerRow && $('th,td', $headerRow);
      for (ix = 0; ix < attrCount; ix += 1) {
        if ($cols && $cols[ix]) {
          attrName = makeUnique($($cols[ix]).text()) || 'attr' + ix;
        } else {
          attrName = 'attr' + ix;
        }
        attrs.push( {
          name: attrName,
          editable: true
        });
      }
      return attrs;
    }

    function updateTableName(name) {
      var match = /^.*_([0-9]+)$/.exec(name);
      var ext = match && match[1];
      if (match) {
        return name.replace(RegExp(ext + '$'), '' + (Number(ext) + 1));
      } else {
        return name + '_1';
      }
    }
    // --- --- begin handleSend --- ---
    var parentEl = ev.target.parentNode.parentNode;
    var $srcTable = $('table', ev.target.parentNode.parentNode);
    var $rows = $('tr', $srcTable);
    var stats = getTableStats($rows);
    var headerRowIndex = treatFirstRowAsHeader()? inferAttributeHeaderRowIndex(stats, $rows): null;
    var $headerRow = headerRowIndex !== null && $rows[headerRowIndex];
    // var headerNames;
    var contextName = $('.table-title', parentEl).val() || 'DropTarget';
    var attrs = getAttributeDefinitions($headerRow, stats.maxCols);
    sendRequest({
      action: 'create',
      resource: 'dataContext',
      values: {
        name: contextName,
        collections: [{
          name: contextName,
          attrs: attrs
        }]
      }
    }, function () {
      var cases = [];
      $rows.each(function (ix, row) {
        if (treatFirstRowAsHeader() && (stats.headerRows.indexOf(ix) >= 0 || (ix === headerRowIndex))) {
          return;
        }
        var values = {};
        $('td,th', row).each(function(ix, cell) {
          var value = $(cell).text().trim();
          if ($('.eu-numbers-checkbox', parentEl).is(':checked')) {
            if (isEuroNumber(value)) {
              value = convertEuroNumber(value);
            }
          }
          else if (isGroupedNumber(value)) {
            value = convertGroupedNumber(value);
          }
          values[attrs[ix].name] = value;
        });
        cases.push ({values: values});
      });
      sendRequest({
        action: 'create',
        resource: 'dataContext[' + contextName + '].collection[' + contextName + '].case',
        values: cases
      }, function () {
        $('.table-title', parentEl).val(updateTableName(contextName));
        sendRequest({
          action: 'create',
          resource: 'component',
          values: {
            type: 'caseTable'
          }
        })
      });
    });

//    $(parentEl).remove();
  }

  /**
   * Replicate cells with colspans and rowspans>1.
   * Values will be copied.
   * @param $table
   */
  function normalizeTable(ix, table) {
    var $table = $(table);
    $table.find('th[colspan], td[colspan]').each(function() {
      var $cell = $(this);
      var count = parseInt($cell.attr('colspan')) - 1;
      $cell.removeAttr('colspan');
      while (count > 0) {
        $cell.after($cell.clone());
        count--;
      }
    });
    $table.find('th[rowspan], td[rowspan]').each(function() {
      var $cell = $(this);
      var $row = $cell.parent();
      var count = parseInt($cell.attr('rowspan')) - 1;
      var index = $cell[0].cellIndex;
      $cell.removeAttr('rowspan');
      while (count > 0) {
        $row = $row.next();
        $row.find('td:nth-child(' + (index) + '), th:nth-child(' + (index) + ')')
            .after($cell.clone());
        count--;
      }
    });
  }

  function formatTables(data, target) {

    function formatTable(ix, el) {
      function makeTableHeader(targetEl/*, ix*/) {
        var titleEl = $('<input>')
            .addClass('table-title')
            .val('Table' + (++tableID));
        var removeButton = $('<button>')
            .addClass('remove-button')
            .text('Remove');
        var sendButton = $('<button>')
            .addClass('send-button')
            .text('Transfer');
        var euNumbersOption = $('<label>').text('Convert Euro Numbers').append(
            $('<input>').attr({type: 'checkbox'})
                .addClass('eu-numbers-checkbox'));
        var headerLineOption = $('<label>').text('First Line is Header').append(
            $('<input>')
                .attr({type: 'checkbox', checked: 'checked'})
                .addClass('first-line-header'));
        var tableHeader =  $('<div>')
            .addClass('table-header')
            .append(titleEl)
            .append(removeButton)
            .append(sendButton)
            .append(euNumbersOption)
            .append(headerLineOption);

        tableHeader.appendTo(targetEl);
        $(removeButton).on('click', handleRemove);
        $(sendButton).on('click', handleSend);
      }

      function formatRow(ix, el) {
        function formatCell(ix, el) {
          var txt = $(el).text();
          if (el.tagName === 'TD') {
            $('<td>').text(txt).appendTo(newRow);
          } else if (el.tagName === 'TH') {
            $('<th>').text(txt).appendTo(newRow);
          }
        } /* end formatCell */

        var newRow = $('<tr>');
        $('td,th', el).each(formatCell);
        newRow.appendTo(newTable);
      } /* end formatRow */

      var tableContainer = $('<div>').prop('id', 'table-' + ix).addClass('table-container').appendTo(target);
      var newTable = $('<table>');
      $('tr', el).each(formatRow);
      makeTableHeader(tableContainer, ix);
      $(newTable).appendTo(tableContainer);
    } /* end formatTable */

    var tables = $('table', $('<div>' + data + '</div>'));
    if (tables.length > 0) {
      target.html('<div>Found ' + tables.length + ' table(s)</div>');
    } else {
      target.html('<div>Found no tables in dropped item</div>');
    }
    tables.each(normalizeTable);
    tables.each(formatTable);
  }

  $dropRegion.on('dragenter', function (ev) {
    var originalEvent = ev.originalEvent;
    originalEvent.preventDefault();
    return true;
  });
  $dropRegion.on('dragleave', function (/*ev*/) {
//    var originalEvent = ev.originalEvent;
//    originalEvent.preventDefault();
  });
  $dropRegion.on('dragover', function (ev) {
    var originalEvent = ev.originalEvent;
    originalEvent.preventDefault();
    originalEvent.dataTransfer.dropEffect = 'copy';
    return true;
  });

  $dropRegion.on('drop paste', function (ev) {
    var originalEvent = ev.originalEvent;
    var dataTransfer = originalEvent.clipboardData || originalEvent.dataTransfer;
    console.log('drop or paste: types=' + dataTransfer.types.join());
    var data;

    var uriList = dataTransfer.getData('text/uri-list');
    if (uriList && uriList.length>0) {
      console.log('URI: ' + uriList);
      uriList = uriList.split(/\r\n/);

      $.get(uriList, {type:'text/html'}).then(function (data) {
        formatTables(data, $('.output-region'));
      });
    } else if (dataTransfer.types.indexOf('text/html')>=0) {
      data = dataTransfer.getData('text/html');
//    var data1 = dataTransfer.getData('text');
//    console.log('dropped text: ' + data1);
      formatTables(data, $('.output-region'));
    }
    originalEvent.preventDefault();
  });

  init();
});