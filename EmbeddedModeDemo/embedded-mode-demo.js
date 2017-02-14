// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2017 by The Concord Consortium, Inc. All rights reserved.
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

  var codap = new iframePhone.IframePhoneRpcEndpoint(iframePhoneHandler,
      "data-interactive", document.getElementById("codapIFrame")),

      // The coordinates of all CODAP components.
      componentCoordinates = [],
      // width of the border surrounding each component.
      kBufferWidth = 10,
      inIframe = false,
      inMoveOrResize = false,
      dataContextList = [],

      messageTemplates = {
        createGraph: {
          action: 'create', resource: 'component',
          values: {
            type: 'graph', name: 'Combinations',
            dimensions: {width: 240, height: 240},
            position: 'bottom',
            dataContext: 'Sampler',
            xAttributeName: 'combinations'
          }
        },
        createTable: {
          action: 'create', resource: 'component',
          values: {
            type: 'caseTable', name: 'results',
            dimensions: {width: 470, height: 240},
            position: 'bottom',
            dataContext: 'Sampler'
          }
        },
        clearData: {
          action: 'delete', resource: 'dataContext[Sampler].allCases',
        },
        getComponentList: {action: 'get', resource: 'componentList'},
        getComponent: {action: 'get', resource: 'component'},
        getDataContextList: {action: 'get', resource: 'dataContextList'}
      };

  function iframePhoneHandler(notice, callback) {
    var success = false;
    var values = notice && notice.values;
    var operation = values && values.operation;
    if (!notice) {
      return
    }
    if (notice.message == 'codap-present') {
      setupCODAP();
      success = true;
    } else {
      if (notice.action === 'notify' && notice.resource === 'component') {
        if (operation === 'move' || operation === 'resize') {
          updatePointerMgtLayer();
          inMoveOrResize = false;
        }
        if (operation === 'beginMoveOrResize') {
          inMoveOrResize = true;
          activateCODAPLayer();
        }
      }
    }
    callback({success: success});
  }

  function sendMessage(message) {
    return new Promise(function (resolve, reject) {
      codap.call(message, function (reply) {
        if (!reply) {
          reject('Request timeout');
        }
        else {
          resolve(reply);
        }
      });
    });
  }

  function positionRandomly(dims) {
    var wHeight = window.innerHeight, wWidth = window.innerWidth;
    var aHeight = wHeight - dims.height, aWidth = wWidth - dims.width;
    return {left: Math.random() * aWidth, top: Math.random() * aHeight};
  }

  /**
   *
   * @param pt {{x: {number}, y: {number}}}
   * @param rect {{left: {number}, top: {number}, width:{number}, height:{number}}}
   * @return boolean
   */
  function isInRect(pt, rect) {
    return ((pt.x >= rect.left) && (pt.x <= rect.left + rect.width )) &&
        ((pt.y >= rect.top) && (pt.y <= rect.top + rect.height));
  }

  function isInComponentRectangles(pt) {
    return componentCoordinates.some(function (rect) {
      return isInRect(pt, rect);
    });
  }

  function setupCODAP() {
    document.getElementById("app").style.display = "block";
    setTimeout(function () {
      updatePointerMgtLayer();
      sendMessage(messageTemplates.getDataContextList)
          .then(function (result) {
            if( result.success && result.values) {
              result.values.forEach( function( iContext) {
                dataContextList.push( iContext);
              });
            }
          });
    }, 2000);
  }

// We find the location of all components and recreate buffer regions
  function updatePointerMgtLayer() {
    sendMessage(messageTemplates.getComponentList)
        .then(function (result) {
          var gets;

          if (result.success) {
            // values look like this:
            // { "id" : 57, "name": "string", "title" : "string", "type" : "game" }
            gets = result.values && result.values.map(function (componentInfo) {
                  var msg = Object.assign({}, messageTemplates.getComponent,
                      {resource: 'component[' + componentInfo.id + ']'});
                  return msg;
                });
            return sendMessage(gets);
          } else {
            console.log('componentList get failed');
          }
          return sendMessage(gets)
        })
        .then(function (results) {
          var $overlayLayer = $('.pointer-manager'),
              $iFrameLayer = $('#codapIFrame'),
              top = $iFrameLayer[0].offsetTop;
          // expect an array of results
          // result values vary but include dimensions and position properties
          $overlayLayer.empty();
          componentCoordinates = [];
          results.map(function (result) {
            var values = result && result.values;
            if (result && result.success && values && values.position) {
              componentCoordinates.push({
                id: values.id,
                left: values.position.left,
                top: values.position.top + top,
                width: values.dimensions.width + 50,
                height: values.dimensions.height
              })
            }
          });
          componentCoordinates.forEach(function (rect) {
            function makeOverlay(x, y, w, h) {
              return $('<div>').addClass('overlay pointer-events').css({
                left: x + 'px',
                top: y + 'px',
                width: w + 'px',
                height: h + 'px',
              })
            }

            // top
            $overlayLayer.append(makeOverlay(
                rect.left, rect.top - kBufferWidth,
                rect.width, kBufferWidth));
            // bottom
            $overlayLayer.append(makeOverlay(
                rect.left, rect.top + rect.height,
                rect.width, kBufferWidth));
            // left
            $overlayLayer.append(makeOverlay(
                rect.left - kBufferWidth, rect.top - kBufferWidth,
                kBufferWidth, rect.height + 2 * kBufferWidth));
            // right
            $overlayLayer.append(makeOverlay(
                rect.left + rect.width, rect.top - kBufferWidth,
                kBufferWidth, rect.height + 2 * kBufferWidth));
          });
        }).catch(function (msg) {
      console.log(msg);
    });
  }

  function sendMessageAndLogResult(message) {
    sendMessage(message).then(function (result) {
      console.log(JSON.stringify(result));
      updatePointerMgtLayer();
    }).catch(function (e) {
      console.warn(e);
    });
  }

  function activateCODAPLayer() {
    console.log('activateCODAPLayer');
    $('.monitor').addClass('in-codap');
    $('#codapIFrame')
        .removeClass('no-pointer-events')
        .addClass('pointer-events');
  }

  function activateAppLayer() {
    $('.monitor').removeClass('in-codap');
    console.log('activateAppLayer');
    $('#codapIFrame')
        .removeClass('pointer-events')
        .addClass('no-pointer-events');
  }

// button handlers
  $('#clearDataButton').on('click', function () {
    var template = messageTemplates.clearData;
    var msg = Object.assign({}, template)
    sendMessageAndLogResult(msg);
  });

  $('#addGraphButton').on('click', function () {
    var template = messageTemplates.createGraph;
    sendMessageAndLogResult(template);
  });

  $('#addTableButton').on('click', function () {
    var template = messageTemplates.createTable;
    var msg = Object.assign({}, template)
    // msg.values.position = positionRandomly(template.values.dimensions);
    sendMessageAndLogResult(msg);
  });

// handler to manage the transition between the main page and CODAP
  $('.pointer-manager').on('mouseleave', '.overlay', function (ev) {
    if (inMoveOrResize) {
      return;
    }
    if (isInComponentRectangles({x: ev.pageX, y: ev.pageY})) {
      activateCODAPLayer();
    } else {
      activateAppLayer();
    }
  });
})
;
