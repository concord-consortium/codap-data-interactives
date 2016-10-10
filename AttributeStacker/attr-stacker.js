// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
$(function () {
  var codapInterface = Object.create({
    connection: null,
    connectionState: 'preinit', // ['preinit', 'init', 'active', 'inactive', 'closed']
    requestHandler: null,
    config: null,
    /**
     * Initialize connection.
     *
     * Start connection. Request interactiveFrame to get prior state, if any.
     * Update interactive frame to set name and dimensions.
     *
     * @param config {object} Configuration. Optional properties: title {string},
     *                        version {string}, dimensions {object},
     *                        stateHandler {function}
     */
    init: function (config) {
      function getFrameRespHandler(req, resp) {
        var values = resp && resp.values;
        var stateHandler = this.config && this.config.stateHandler;
        var newFrame = {
          name: config.name,
          title: config.title,
          version: config.version,
          dimensions: config.dimensions,
          preventBringToFront: config.preventBringToFront
        };
        //Object.assign(newFrame, values);
        updateFrameReq.values = newFrame;
        _this.sendRequest(updateFrameReq);

        if (values && values.state && stateHandler ) {
          _this.config.stateHandler(values.state);
        }
      }

      var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
      var updateFrameReq = {action: 'update', resource: 'interactiveFrame'};
      var _this = this;

      this.config = config;
      this.connection = new iframePhone.IframePhoneRpcEndpoint(
          function (codapRequest, callback) {
            this.connectionState = 'active';
            if (this.requestHandler) {
              callback(this.requestHandler.handleCODAPRequest(codapRequest));
            } else {
              callback({success: true});
            }
          }.bind(this), "data-interactive", window.parent
      );
      this.sendRequest(getFrameReq, getFrameRespHandler);
    },

    setRequestHandler: function (handler) {
      this.requestHandler = handler;
    },
    destroy: function () {},
    sendRequest: function (message, callback) {
      switch (this.connectionState) {
        case 'closed': // log the message and ignore
          console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
          break;
        case 'preinit': // warn, but issue request.
          console.warn('sendRequest on not yet initialized CODAP connection: ' + JSON.stringify(message));
        default:
          if (this.connection) {
            this.connection.call(message, function (response) {
              this.handleResponse(message, response, callback)
            }.bind(this));
          } else {
            console.error('sendRequest on non-existent CODAP connection');
          }
      }
    },
    handleResponse: function (request, response, callback) {
      if (response === undefined) {
        console.warn('handleResponse: CODAP request timed out');
      } else {
        this.connectionState = 'active';
      }
      if (callback) {
        callback(request, response);
      }
    }
  });

  var kSrcStackSelector = '#src-stack';
  var kSrcStackItemsSelector = kSrcStackSelector + ' .items';
  var kTargetTableSelector = '#target-table';
  var kDataSetSectionSelector = '#dataset-selection';
  var kDataSetSelector = kDataSetSectionSelector + ' select';
  var kItemSelector = '.item';
  var kDropAreaClass = 'drop-area';
  var kCategoryMessage = 'Enter a name for the category attribute';
  var kColumnHeadMessage = 'Enter a name for this value attribute';
  var kRowHeadMessage = 'Enter a name for this categorical value';

  var extent = {rows: 0, cols: 0};
  var sourceDataSetDefinition;

  function makeNewRow($tableEl, extent) {
    var row = extent.rows++;
    var ix;
    var $rowEl = $('<tr>').data('row', row );
    var el = $('<input>').prop({
      'value': 'type' + row,
      'title': kRowHeadMessage
    }).addClass('inactive');
    $('<th>').append(el).appendTo($rowEl);
    for (ix = 0; ix < extent.cols; ix += 1) {
      el = $('<div>').addClass(kDropAreaClass);
      $('<td>').data('col', ix).append(el).appendTo($rowEl);
    }
    $tableEl.append($rowEl);
  }

  function makeNewColumn($tableEl, extent) {
    var col = extent.cols++;
    var $rows = $tableEl.find('tr');
    var el;
    $rows.each(function(ix, rowEl) {
      if (ix === 0) {
        el = $('<input>').prop({
          'value': 'value' + col,
          'title': kColumnHeadMessage
        }).addClass('inactive');
        el = $('<th>').append(el);
      } else {
        el = $('<div>').addClass(kDropAreaClass);
        el = $('<td>').data('col', col).append(el);
      }
      $(rowEl).append(el);
    });
  }

  function makeDataSetSelector() {
    function handleResponse(req, resp) {
      var values = resp && resp.values;
      var $root = $('#dataset-selection');
      var $label = $('<label>').text('Data Set: ');
      var $selEl = $('<select>');
      if (values) {
        $root.empty();
        values.forEach(function (item, ix) {
          var $option = $('<option>').prop('value', item.name).text(item.title);
          if (ix === 0) {
            $option.prop('selected', true);
          }
          $option.appendTo($selEl);
        });

        $selEl.appendTo($label);
        $label.appendTo($root)
        $selEl.on('change', handleDataSetSelection);
        $selEl.change();
      }
    }

    var req = {action: 'get', resource: 'dataContextList'};
    codapInterface.sendRequest(req, handleResponse)
  }

  function makeItems(dataSetName) {
    function handleResponse(req, resp) {
      var values = resp && resp.values;
      var itemCtr = 0;
      if (!values) {
        return;
      }
      sourceDataSetDefinition = values;
      var numCollections = values.collections?values.collections.length: 0;
      var lastCollection = numCollections && values.collections[numCollections - 1];
      var attributes = lastCollection.attrs;
      var $srcStack = $(kSrcStackItemsSelector);
      $(kItemSelector).remove();
      makeStackingTable($(kTargetTableSelector))
      attributes.forEach(function (attr) {
        var itemID = 'item' + itemCtr++;
        $('<div>')
            .addClass('item')
            .prop('id', itemID)
            .text(attr.name)
            .appendTo($srcStack);
      })
    }

    var req = {action: 'get', resource: 'dataContext[' + dataSetName + ']'};
    codapInterface.sendRequest(req, handleResponse)
  }

  function getTableCoordinate($cellEl) {
    var $td = $cellEl.closest('td,th');
    var $tr = $td.closest('tr');
    var col = $td.data('col');
    var row = $tr.data('row');
    return {row: row, col: col};
  }

  function getTableDimensions($tableEl) {
    return extent;
  }

  function getSourceDataSetName() {
    return $(kDataSetSelector).val();
  }

  function isRightmostColumn($tableEl, $cellEl) {
    var coord = getTableCoordinate($cellEl);
    var dimensions = getTableDimensions($tableEl);
    return (coord.col === dimensions.cols - 1);
  }

  function isLeftmostColumn($tableEl, $cellEl) {
    var coord = getTableCoordinate($cellEl);
    return(Number(coord.col) === 0);
  }

  function isBottomRow($tableEl, $cellEl) {
    var coord = getTableCoordinate($cellEl);
    var dimensions = getTableDimensions($tableEl);
    return (coord.row === dimensions.rows - 1);
  }

  function activateColumn($tableEl, ix) {
    $tableEl.find('tr:first th:nth-of-type('+(ix+2)+') input').removeClass('inactive');
  }

  function activateRow($tableEl, ix, droppedItemName) {
    $tableEl.find('tr:nth-of-type('+(ix+2)+') input').removeClass('inactive').val(droppedItemName);

  }

  function updateTable($cellEl, droppedItemName) {
    var $tableEl = $(kTargetTableSelector);
    var coords = getTableCoordinate($cellEl)
    if (isRightmostColumn($tableEl, $cellEl)) {
      makeNewColumn($tableEl, extent);
      activateColumn($tableEl, coords.col);
    }
    if (isBottomRow($tableEl, $cellEl)) {
      makeNewRow($tableEl, extent);
      activateRow($tableEl, coords.row, droppedItemName);
    }
  }

  function handleDataSetSelection(ev) {
    makeItems(getSourceDataSetName());
  }

  function handleDragStart(ev) {
//        console.log('start: ' + this.id);
    var oev = ev.originalEvent;
    oev.dataTransfer.effectAllowed = 'move';
    oev.dataTransfer.setData('text/html', this.outerHTML);
    $(this).addClass('drag-active');
    $(kTargetTableSelector + ',' + kSrcStackSelector).addClass('drag-in-progress')
  }

  function handleDragEnd(ev) {
    $(this).removeClass('drag-active');
    $(kTargetTableSelector + ',' + kSrcStackSelector).removeClass('drag-in-progress')
  }

  function handleDragEnter(ev) {
//        console.log('enter');
    if ($('.item', this).length === 0) {
      $(this).addClass('over');
    }
    ev.preventDefault();
  }

  function handleDragOver(ev) {
    // if the cell is occupied, it is not now a drag target
    if ($('.item', this).length > 0) {
      return;
    }
    ev.preventDefault();
    return false;
  }

  function handleDragLeave(ev) {
//        console.log('leave');
    $(this).removeClass('over');
  }

  function handleDrop(ev) {
    var $this = $(this);
    // if the cell is occupied, it is not now a drag target
    if ($('.item', this).length > 0) {
      return;
    }
    var oev = ev.originalEvent;
    var target = this;
    var $srcStack = $(kSrcStackSelector);
    var $item = $(oev.dataTransfer.getData('text/html'));

    if ($.contains($srcStack[0], this)) {
      target = $srcStack.find('.items');
    } else {
      updateTable($this, $item.text());
    }

    $('#' + $item[1].id).detach().appendTo(target);

    $this.removeClass('over');
    $item.removeClass('drag-active');

    ev.stopPropagation();
    return false;
  }

  function makeDataSetName(originalDataSet) {
    return originalDataSet.name + '_stacked';
  }

  function getOriginalCollectionName(originalDataSet) {
    var numCollections = originalDataSet.collections? originalDataSet.collections.length: 0;
    var lastCollection = numCollections && originalDataSet.collections[numCollections - 1];
    return lastCollection.name;
  }

  function handleSubmitStacking(ev) {
    if (!getSourceDataSetName()) { return; }

    function makeUnassignedAttributesList($items) {
      var names = [];
      $items.each(function (ix, item) {
        names.push($(item).text());
      });
      return names;
    }

    function makeTypeList($table) {
      // the goal is to return an array of type names, corresponding to the
      //zeroeth cell in the non-header parts of the table.
      var rtn = [];
      $('tr', $table).each(function(ix, row) {
        if (ix !== 0) {
          rtn.push($('td,th input', row).val());
        }
      });
      // remove the last (must be empty row)
      if (rtn.length > 0) { rtn.pop(); }
      return rtn;
    }

    function makeStackingAttributes($table) {
      var result = [];
      var $headerRow = $($table.find('tr')[0]);
      $headerRow.find('th input:not(.inactive)').each(function(ix, el) {
        if (ix !== 0) {
          result.push($(el).val());
        }
      });
      return result;
    }

    function makeAttributeMappings($table, typeList, stackingAttributes) {
      rslt = [];
      $table.find('tr').each(function(ix, el1) {
        var typeMapping = [];
        if (ix !== 0) {
          $(el1).find('td').each(function (ix, el2) {
            var $item = $(el2).find('.item');
            if ($item.length > 0) {
              typeMapping.push({fromAttr: $item.text(), toAttr: stackingAttributes[ix]});
            }
          });
          rslt.push(typeMapping);
        }
      });
      return rslt;
    }

    function createStackedDataSetDefinition(iDataSetName, iParentCollectionName,
        iParentAttributes, iChildCollectionName, iCategoryName, iStackingAttributes) {
      var parentCollection = {
        name: iParentCollectionName,
        attrs: iParentAttributes.map(function (attrName) {return {name: attrName}})
      }

      var childCollection = {
        name: iChildCollectionName,
        parent: iParentCollectionName,
        attrs: []
      }

      var dataSetDefinition = {
        name: iDataSetName,
        collections: [
            parentCollection,
            childCollection
        ]
      };

      childCollection.attrs = [{name: iCategoryName}]
          .concat(iStackingAttributes.map(function (attrName) {
            return {name: attrName};
          }));
      return dataSetDefinition;
    }


    function copySourceDataSetToStackedDataSet() {
      var numCollections = sourceDataSetDefinition.collections?sourceDataSetDefinition.collections.length: 0;
      var lastCollection = numCollections && sourceDataSetDefinition.collections[numCollections - 1];
      var caseResourcePrefix = 'dataContext[' + getSourceDataSetName() + '].collection[' + lastCollection.name + ']';
      var caseCount;
      var caseIx = 0;

      function requestCase() {
        if (caseIx < caseCount) {
          codapInterface.sendRequest({action: 'get', resource: caseResourcePrefix
          + '.caseByIndex[' + caseIx + ']'}, function (req, resp) {
            if (resp.success) {
              cloneCase(resp.values);
            }
          });
          caseIx += 1;
        }
      }

      function cloneCase(v) {
        function createChildren(req, resp) {
          var parentID = resp.success && resp.values[0].id;
          var childCases = [];
          if (parentID !== null && parentID !== undefined) {
            typeList.forEach(function (type, ix) {
              var newCase = {parent:parentID, values: {}};
              newCase.values[categoryName] = type;
              attributeMappings[ix].forEach(function (mapping) {
                newCase.values[mapping.toAttr] = myCase.values[mapping.fromAttr];
              });
              childCases.push(newCase);
            });
            codapInterface.sendRequest({action: 'create', resource: childResourceSpec, values: childCases}, function (req, resp) {
              requestCase();
            });
          }
        }
        var myCase = v.case;
        var parentCase = {values: {}};
        var parentResourceSpec = 'dataContext['+stackedDataSetName+'].collection['+ parentCollectionName + '].case';
        var childResourceSpec = 'dataContext['+stackedDataSetName+'].collection[' + childCollectionName + '].case';

        parentAttributes.forEach(function (attrName) {
          parentCase.values[attrName] = myCase.values[attrName];
        });
        codapInterface.sendRequest({action: 'create', resource: parentResourceSpec, values: parentCase}, createChildren)
      }

      codapInterface.sendRequest({action: 'get', resource: caseResourcePrefix + '.caseCount'},
          function (req, resp) {
            caseCount = resp.values;
            requestCase();
          }
      )
    }

    var $stackItems = $(kSrcStackItemsSelector);

    var $targetTable = $(kTargetTableSelector);

    var stackedDataSetName = makeDataSetName(sourceDataSetDefinition);

    // categoryName is the name of the attribute that classifies the stacking attributes
    var categoryName = $targetTable.find('tr th input').val();
    // parent attributes are the unstacked attributes
    var parentCollectionName = getOriginalCollectionName(sourceDataSetDefinition);
    var childCollectionName = categoryName + 's';
    var parentAttributes = makeUnassignedAttributesList($stackItems.find('.item'));
    // typeList is a list of the values of the category attribute
    var typeList = makeTypeList($targetTable);
    // stacking attributes are the new attributes factored by the stacking operation
    var stackingAttributes = makeStackingAttributes($targetTable);
    // we map the original attribute to its stacking attribute
    var attributeMappings = makeAttributeMappings($targetTable, typeList,
        stackingAttributes);

    var dataSetDefinition = createStackedDataSetDefinition(stackedDataSetName, parentCollectionName,
        parentAttributes, childCollectionName, categoryName, stackingAttributes);

    codapInterface.sendRequest({
          action: 'create',
          resource: 'dataContext',
          values: dataSetDefinition
        },
        function (req, resp) {
          console.log('create dataset resp: ' + JSON.stringify(resp));
          copySourceDataSetToStackedDataSet()
        }
    );

  }

  function makeStackingTable($table) {
    var $categoryInput = $('<input>').prop({type: 'text', value:'category', title: kCategoryMessage});
    var $categoryCell = $('<th>').append($categoryInput);
    var $baseRow = $('<tr>').append($categoryCell);
    $table.empty().append($baseRow);
    extent = {rows: 0, cols: 0};

    makeNewColumn($table, extent);
    makeNewRow($table, extent);

  }
  function init() {
    codapInterface.init({
      name: 'TidyData',
      title: window.title,
      version: '0.1',
      dimensions: {width: 600, height: 500},
      preventBringToFront: false
    });

    makeDataSetSelector();

    $(kTargetTableSelector+','+kSrcStackSelector)
        .attr('draggable', '.item', true)
        .on('dragstart', '.item', handleDragStart)
        .on('dragend', '.item', handleDragEnd);

    $(kTargetTableSelector+','+kSrcStackSelector)
        .on('dragenter', '.' + kDropAreaClass, handleDragEnter)
        .on('dragover', '.' + kDropAreaClass, handleDragOver)
        .on('dragleave', '.' + kDropAreaClass, handleDragLeave)
        .on('drop', '.' + kDropAreaClass, handleDrop);

    $('#submitStackingButton').on('click', handleSubmitStacking);
    makeStackingTable($(kTargetTableSelector));
  }

  init();
})
