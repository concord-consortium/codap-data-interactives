// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2016-2017 by The Concord Consortium, Inc. All rights reserved.
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
/*global $:true, codapInterface */
$(function () {

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
    function handleResponse(resp) {
      var values = resp && resp.values;
      var $root = $('#dataset-selection');
      var dataSetName = $root.find('select').val();
      var $label = $('<label>').text('Data Set: ');
      var $selEl = $('<select>');
      if (values) {
        $root.empty();
        values.forEach(function (item, ix) {
          var $option = $('<option>').prop('value', item.name).text(item.title);
          if (dataSetName) {
            if (item.name === dataSetName) {
              $option.prop('selected', true);
            }
          } else if (ix === 0) {
            $option.prop('selected', true);
          }
          $option.appendTo($selEl);
        });

        $selEl.appendTo($label);
        $label.appendTo($root);
        $selEl.on('change', handleDataSetSelection);
        if (!dataSetName) {
          $selEl.change();
        }
      }
    }

    var req = {action: 'get', resource: 'dataContextList'};
    codapInterface.sendRequest(req, handleResponse);
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

  function makeItems(dataSetName) {
    function handleResponse(resp) {
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
      makeStackingTable($(kTargetTableSelector));
      attributes.forEach(function (attr) {
        var itemID = 'item' + itemCtr++;
        $('<div>')
            .addClass('item')
            .prop('id', attr.id)
            .attr('draggable', 'true')
            .text(attr.name)
            .appendTo($srcStack);
      });
    }

    var req = {action: 'get', resource: 'dataContext[' + dataSetName + ']'};
    codapInterface.sendRequest(req, handleResponse);
  }

  function getTableCoordinate($cellEl) {
    var $td = $cellEl.closest('td,th');
    var $tr = $td.closest('tr');
    var col = $td.data('col');
    var row = $tr.data('row');
    return {row: row, col: col};
  }

  function getTableDimensions(/*$tableEl*/) {
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

  // function isLeftmostColumn($tableEl, $cellEl) {
  //   var coord = getTableCoordinate($cellEl);
  //   return(Number(coord.col) === 0);
  // }

  function isBottomRow($tableEl, $cellEl) {
    var coord = getTableCoordinate($cellEl);
    var dimensions = getTableDimensions($tableEl);
    return (coord.row === dimensions.rows - 1);
  }

  function activateColumn($tableEl, ix) {
    $tableEl.find('tr:first th:nth-of-type('+(ix+2)+') input')
        .removeClass('inactive');
  }

  function activateRow($tableEl, ix, droppedItemName) {
    $tableEl.find('tr:nth-of-type('+(ix+2)+') input')
        .removeClass('inactive')
        .val(droppedItemName);

  }

  function updateTable($cellEl, droppedItemName) {
    var $tableEl = $(kTargetTableSelector);
    var coords = getTableCoordinate($cellEl);
    if (isRightmostColumn($tableEl, $cellEl)) {
      makeNewColumn($tableEl, extent);
      activateColumn($tableEl, coords.col);
    }
    if (isBottomRow($tableEl, $cellEl)) {
      makeNewRow($tableEl, extent);
      activateRow($tableEl, coords.row, droppedItemName);
    }
  }

  function handleDataSetSelection() {
    makeItems(getSourceDataSetName());
  }

  function handleDragStart(ev) {
//        console.log('start: ' + this.id);
//        
    var $this = $(this);
    var oev = ev.originalEvent;
    oev.dataTransfer.effectAllowed = 'moveCopy';
    oev.dataTransfer.setData('text/html', this.outerHTML);
    oev.dataTransfer.setData('text', this.id);
    oev.dataTransfer.setData('application/x-codap-attr-' + $this.attr('id'), $this.text())
    $(this).addClass('drag-active');
    $(kTargetTableSelector + ',' + kSrcStackSelector).addClass('drag-in-progress');
  }

  function handleDragEnd() {
    $(this).removeClass('drag-active');
    $(kTargetTableSelector + ',' + kSrcStackSelector).removeClass('drag-in-progress');
  }

  function handleDragEnter(ev) {
//        console.log('enter');
    if ($('.item', this).length === 0) {
      $(this).addClass('over');
    }
    ev.preventDefault();
    ev.stopPropagation();
  }

  function handleDragOver(ev) {
    // if the cell is occupied, it is not now a drag target
    if ($('.item', this).length > 0) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }

  function handleDragLeave() {
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
    var itemID = oev.dataTransfer.getData('text');
    var $item = $('#' + itemID);

    if ($.contains($srcStack[0], this)) {
      target = $srcStack.find('.items');
    } else {
      updateTable($this, $item.text());
    }

    $item.detach().appendTo(target);

    $this.removeClass('over');
    $item.removeClass('drag-active');

    ev.stopPropagation();
    return false;
  }

  function makeDataSetName(originalDataSet) {
    return originalDataSet.name + '_stacked';
  }

  function getOriginalCollectionName(originalDataSet) {
    var numCollections = originalDataSet.collections
        ? originalDataSet.collections.length
        : 0;
    var lastCollection = numCollections &&
        originalDataSet.collections[numCollections - 1];
    return lastCollection.name;
  }

  /**
   * Returns an array of names from a collection of draggable attribute
   * elements.
   * @param $items {$} An array of "item" elements.
   * @returns {[{string}]}
   */
  function makeItemNamesArray($items) {
    var names = [];
    $items.each(function (ix, item) {
      names.push($(item).text());
    });
    return names;
  }

  /**
   * Returns an array of potential values for the "category" attribute we
   * will be creating. In the stacking table this is the zero-th column of
   * the table body. We ignore the last row because it is guaranteed to be
   * empty.
   *
   * @param $table {$} The stacking table jquery element.
   * @returns {[{String}]}
   */
  function makeTypeList($table) {
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

  /**
   * Returns the names of the new stacking attributes we will be creating.
   * In the stacking table, these are the values of the on zero-th elements
   * of the header row.
   *
   * @param $table {$} The stacking table jquery element.
   * @returns {[{String}]}
   */
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

  /**
   * Makes an array of arrays of mappings from the name of the source data set
   * attribute to the new, stacked, data set attribute. The parent array is
   * indexed row in the table body. The child array is indexed by column.
   *
   * @param $table {$} The stacking table jquery element.
   * @param iStackingAttributes
   * @returns {[[{fromAttr: {string}, toAttr: {string}}]]}
   */
  function makeAttributeMappings($table, iStackingAttributes) {
    var rslt = [];
    $table.find('tr').each(function(ix, el1) {
      var typeMapping = [];
      if (ix !== 0) {
        $(el1).find('td').each(function (ix, el2) {
          var $item = $(el2).find('.item');
          if ($item.length > 0) {
            typeMapping.push({
              fromAttr: $item.text(),
              toAttr: iStackingAttributes[ix]
            });
          }
        });
        rslt.push(typeMapping);
      }
    });
    return rslt;
  }

  function handleSubmitStacking(/*ev*/) {
    if (!getSourceDataSetName()) { return; }

    /**
     * Creates a dataContext object for submission to CODAP that will define
     * the structure of the new stacked data set.
     *
     * @param iBasisDefinition {object} The data set definition that of the data
     *          set that forms the basis for this data set.
     * @param iDataSetName
     * @param iParentAttributes
     * @param iChildCollectionName
     * @param iCategoryName
     * @param iStackingAttributes
     * @returns {{name: *, collections: *[]}}
     */
    function createStackedDataSetDefinition(iBasisDefinition, iDataSetName,
        iParentAttributes, iChildCollectionName, iCategoryName,
        iStackingAttributes) {

      function copyAttributeDefinition(attributeDefinition) {
        var cpy = Object.assign({}, attributeDefinition);
        delete cpy.id;
        delete cpy.guid;
        return cpy;
      }

      var dataSetDefinition = {
        name: iDataSetName,
        collections: []
      };
      var lastCollectionIx = iBasisDefinition.collections.length - 1;
      var lastCollection = iBasisDefinition.collections[lastCollectionIx];

      // clone existing collections
      dataSetDefinition.collections = iBasisDefinition.collections.map(
          function (collectionDef, ix) {
            var newCollectionDef = {
              name: collectionDef.name,
              title: collectionDef.title,
              attrs: []
            };
            collectionDef.attrs.forEach(function (attr) {
              if ((ix !== lastCollectionIx)
                  || iParentAttributes.indexOf(attr.name) >= 0) {
                newCollectionDef.attrs.push( copyAttributeDefinition(attr));
              }
            });
            return newCollectionDef;
          });

      dataSetDefinition.collections.push({
        name: iChildCollectionName,
        parent: lastCollection.name,
        attrs: [{name: iCategoryName}]
            .concat(iStackingAttributes.map(function (attrName) {
              return {name: attrName};
            }))
      });

      return dataSetDefinition;
    }


    function copySourceDataSetToStackedDataSet(iStackedDataSetName,
        iCategoryName, iParentCollectionName, iChildCollectionName,
        iParentAttributes, iTypeList, iAttributeMappings) {
      function requestCaseOrCreateTable() {
        if (caseIx < caseCount) {
          codapInterface.sendRequest({
              action: 'get',
              resource: caseResourcePrefix + '.caseByIndex[' + caseIx + ']'
            }, function (resp) {
              if (resp.success) {
                cloneCase(resp.values);
              }
            }
          );
          caseIx += 1;
        } else {
          codapInterface.sendRequest({
            action: 'create',
            resource: 'component',
            values: {
              type: 'caseTable',
              dataContext: iStackedDataSetName
            }
          });
        }

      }

      function cloneCase(v) {
        function createChildren(resp) {
          var parentID = resp.success && resp.values[0].id;
          var childCases = [];
          if (parentID !== null && parentID !== undefined) {
            iTypeList.forEach(function (type, ix) {
              var newCase = {parent:parentID, values: {}};
              var dirty = false;
              newCase.values[iCategoryName] = type;
              iAttributeMappings[ix].forEach(function (mapping) {
                var v = myCase.values[mapping.fromAttr];
                if (v !== null && v !== undefined && v !== '') {
                  newCase.values[mapping.toAttr] = myCase.values[mapping.fromAttr];
                  dirty = true;
                }
              });
              if (dirty) {
                childCases.push(newCase);
              }
            });
            codapInterface.sendRequest({
              action: 'create',
              resource: childResourceSpec,
              values: childCases}, function (/*resp, req*/) {
              requestCaseOrCreateTable();
            });
          }
        }
        var myCase = v.case;
        var parentCase = {values: {}};

        iParentAttributes.forEach(function (attrName) {
          parentCase.values[attrName] = myCase.values[attrName];
        });
        codapInterface.sendRequest({
          action: 'create',
          resource: parentResourceSpec,
          values: parentCase}, createChildren);
      }

      var parentResourceSpec = 'dataContext[' + iStackedDataSetName +
          '].collection[' + iParentCollectionName + '].case';
      var childResourceSpec = 'dataContext[' + iStackedDataSetName +
          '].collection[' + iChildCollectionName + '].case';
      var numCollections = sourceDataSetDefinition.collections
          ? sourceDataSetDefinition.collections.length
          : 0;
      var lastCollection = numCollections &&
          sourceDataSetDefinition.collections[numCollections - 1];
      var caseResourcePrefix = 'dataContext[' + getSourceDataSetName() +
          '].collection[' + lastCollection.name + ']';
      var caseCount;
      var caseIx = 0;

      codapInterface.sendRequest({action: 'get', resource: caseResourcePrefix +
            '.caseCount'}, function (resp) {
            caseCount = resp.values;
            requestCaseOrCreateTable();
          }
      );
    }

    var $stackItems = $(kSrcStackItemsSelector);

    var $targetTable = $(kTargetTableSelector);

    var stackedDataSetName = makeDataSetName(sourceDataSetDefinition);

    // categoryName is the name of the attribute that classifies the stacking
    // attributes
    var categoryName = $targetTable.find('tr th input').val();

    // parent attributes are the unstacked attributes
    var parentCollectionName = getOriginalCollectionName(sourceDataSetDefinition);

    var childCollectionName = categoryName + 's';
    var parentAttributes = makeItemNamesArray($stackItems.find('.item'));
    // typeList is a list of the values of the category attribute
    var typeList = makeTypeList($targetTable);
    // stacking attributes are the new attributes factored by the stacking
    // operation
    var stackingAttributes = makeStackingAttributes($targetTable);
    // we map the original attribute to its stacking attribute
    var attributeMappings = makeAttributeMappings($targetTable,
        stackingAttributes);

    var dataSetDefinition = createStackedDataSetDefinition(
        sourceDataSetDefinition, stackedDataSetName, parentAttributes,
        childCollectionName, categoryName, stackingAttributes);

    codapInterface.sendRequest({
          action: 'create',
          resource: 'dataContext',
          values: dataSetDefinition
        },
        function (resp) {
          console.log('create dataset resp: ' + JSON.stringify(resp));
          copySourceDataSetToStackedDataSet(stackedDataSetName, categoryName,
              parentCollectionName, childCollectionName, parentAttributes,
              typeList, attributeMappings);
        }
    );

  }

  function init() {
    codapInterface.init({
      name: 'TidyData',
      title: window.title,
      version: '0.1',
      dimensions: {width: 600, height: 500},
      preventBringToFront: false
    });

    codapInterface.on('notify', 'documentChangeNotice', function () {
        makeDataSetSelector();
        return {success: true};
      });

    makeDataSetSelector();

    $(kTargetTableSelector + ' .item').attr('draggable', true);
    $(kSrcStackItemsSelector + ' .item').attr('draggable', true);
    $(kTargetTableSelector+','+kSrcStackSelector)
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
});
