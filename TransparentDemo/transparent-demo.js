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
$(function (){

  var codap= new iframePhone.IframePhoneRpcEndpoint(iframePhoneHandler,
      "data-interactive", document.getElementById("codapIFrame"));

  var componentCoordinates = [];
  var kBufferWidth = 10;
  var inIframe = false;
  var messageTemplates = {
    createCalculator: {
      action: 'create', resource: 'component',
      values: {
        name: 'calculator', type: 'calculator'
      }
    },
    createData: {
      action: 'create', resource: 'dataContext[Samples].collection[Sample].case',
      values:[
        { values: { Name: 'Joe', Height: 72, Weight: 180}},
        { values: { Name: 'Jill', Height: 66, Weight: 120}},
        { values: { Name: 'Jose', Height: 78, Weight: 220}},
        { values: { Name: 'Prisha', Height: 60, Weight: 105}}
      ]
    },
    createDataSet: {
      action: 'create', resource: 'dataContext',
      values: {
        name: 'Samples', title: 'Samples',
        collections: [ {
          name: 'Sample', title: 'A sample',
          labels: { singleCase: 'sample', pluralCase: 'samples'},
          attrs: [
            { name: 'Name' },
            { name: 'Height', type: 'numeric', precision: 0 },
            { name: 'Weight', type: 'numeric', precision: 0 }
          ]
        }]
      }
    },
    createGraph: {
      action: 'create', resource: 'component',
      values: {
        type: 'graph', name: 'HeightWeightGraph',
        dimensions: { width: 240, height: 240},
        position: 'bottom',
        dataContext: 'Samples',
        xAttributeName: 'Name', yAttributeName: 'Height'
      }
    },
    createSlider: {
      action: 'create', resource: 'component',
      values:{
        name: 'slider', type: 'slider',
        lowerBound: -10, upperBound: 10,
        dimensions: { height: 100, width: 300},
        position: { left: 0, top: 50},
        value: 0
      }
    },
    createTable: {
      action: 'create', resource: 'component',
      values: {
        type: 'caseTable', name: 'HeightWeightTable',
        dimensions: { width: 240, height: 240},
        position: 'bottom',
        dataContext: 'Samples'
      }
    },
    createTester: {
      action: 'create', resource: 'component',
      values: {
        type: 'game', name: 'name-gameview',
        URL: 'http://localhost/~jsandoe/codap-data-interactives/DataInteractiveAPITester/',
        dimensions: { width: 400, height: 300}
      }
    },
    getComponentList: {action: 'get', resource: 'componentList'},
    getComponent: {action: 'get', resource: 'component'}
  };

  function iframePhoneHandler(command, callback) {
    var success = false;
    if (command && (command.message == 'codap-present')) {
      setupCODAP();
      success = true;
    }
    callback({success: success});
  }

  function resizeIFrame() {
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    document.getElementById("codapIFrame").style.height = height;
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
    return componentCoordinates.every(function (rect) {
      return isInRect(pt, rect);
    });
  }

  function setupCODAP() {
    var done = function () {
      resizeIFrame();
      window.onresize = function (e) {
        resizeIFrame();
      };
      document.getElementById("app").style.display = "block";
    };

    sendMessage(messageTemplates.createDataSet).then(function (reply) {
      return sendMessage(messageTemplates.createData)
    }).then(done).catch(function (msg) {console.log(msg)});
  }

  function updatePointerManager() {
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
        var $overlayLayer = $('.pointer-manager');
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
              top: values.position.top,
              width: values.dimensions.width,
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
  
  function sendMessageLogResult(message) {
    sendMessage(message).then(function (result) {
      console.log(JSON.stringify(result));
      updatePointerManager();
    }).catch(function(e){
      console.warn(e);
    });
  }

  $('#addSliderButton').on('click', function () {
    sendMessageLogResult(messageTemplates.createSlider);
  });

  $('#addCalculatorButton').on('click', function () {
    sendMessageLogResult(messageTemplates.createCalculator);
  });

  $('#addTesterButton').on('click', function () {
    sendMessageLogResult(messageTemplates.createTester);
  });

  function addGraph() {
    sendMessage(messageTemplates.createGraph).then(function (result) {
      return sendMessage({
        action: 'get',
        resource: 'component[HeightWeightGraph]'
      })
    }).then(function (result) {
      console.log(JSON.stringify(result));
    });
  }

  function addTable() {
    sendMessage(messageTemplates.createTable).then(function (result) {
      return sendMessage({
        action: 'get',
        resource: 'component[HeightWeightTable]'
      })
    }).then(function (result) {
      console.log(JSON.stringify(result));
    });
  }

  var personNumber = 5;
  function addSample() {
    sendMessage({
      action: 'create',
      resource: 'dataContext[Samples].collection[Sample].case',
      values:[
        {
          values: {
            Name: 'Person #' + (personNumber++),
            Height: 48 + Math.round(Math.random() * 36),
            Weight: 80 + Math.round(Math.random() * 200)
          }
        }
      ]
    });
  }

  $('#setGraphSelectionCheckbox').on('click', function (e) {
    var allow = e.target.checked;
    document.getElementById("codapIFrame").style.pointerEvents = allow ? 'auto' : 'none';
  });

  function makeElementName (el) {
    var tag = el.nodeName? el.nodeName.toLowerCase():'unknown';
    var id = el.id? ('#' + el.id): '';
    var classes = el.className? ('.' + el.className.split(/ +/).join('.')): '';
    return tag + id + classes;
  }

  function activateCODAPLayer() {
    console.log('activateCODAPLayer');
    $('#codapIFrame')
        .removeClass('no-pointer-events')
        .addClass('pointer-events');
  }
  function activateAppLayer() {
    console.log('activateAppLayer');
    $('#codapIFrame')
        .removeClass('pointer-events')
        .addClass('no-pointer-events');
  }

  $('.pointer-manager').on('mouseleave', '.overlay', function (ev) {
    if (isInComponentRectangles({x:ev.pageX, y:ev.pageY})) {
      activateCODAPLayer();
    } else {
      activateAppLayer();
    }
  });
});
