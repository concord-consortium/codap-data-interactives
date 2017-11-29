/*global $, codapInterface, Promise, DrawingTool */
$(function () {
  var kPluginConfig = window.codapPluginConfig || {},
      kPluginName = "DrawTool",
      kPluginVersion = "0.1",
      kDeployVersion = kPluginConfig.buildNumber,
      kFullVersion = kPluginVersion + (kDeployVersion ? " (" + kDeployVersion + ")" : ""),

      kDefaultCanvasWidth = 480,
      kDefaultCanvasHeight = 360,
      kDrawToolExtraWidth = 60,   // tool bar, scroll bar, etc.
      kDrawToolExtraHeight = 30,  // scroll bar, etc.
      kDefaultComponentWidth = kDefaultCanvasWidth + kDrawToolExtraWidth,
      kDefaultComponentHeight = kDefaultCanvasHeight + kDrawToolExtraHeight;

  /*
   * Initialize DrawingTool
   */
  var drawingTool = new DrawingTool("#drawing-tool", {
    width: kDefaultCanvasWidth,
    height: kDefaultCanvasHeight,
    parseSVG: true
  });

  var interfaceConfig = {
    name: kPluginName,
    dimensions: {width: kDefaultComponentWidth, height: kDefaultComponentHeight},
    version: kFullVersion,
    customInteractiveStateHandler: true
  };

  /*
   * Set up our relationship with CODAP
   */
  // Initialize the codapInterface: we tell it our name, dimensions, version...
  codapInterface
    .init(interfaceConfig)
    .then(function (initialState) {
      if (initialState) {
        drawingTool.load(JSON.stringify(initialState), function() {}, true);
      }
      // that's all we need, so return a resolved promise.
      return Promise.resolve(initialState);
    }).catch(function (msg) {
      // handle errors
      console.log(msg);
    });
  
  function updateInteractiveFrame() {
    var frameValues = {
          preventBringToFront: false,
          dimensions: {
            width: drawingTool.canvas.getWidth() + kDrawToolExtraWidth,
            height: drawingTool.canvas.getHeight() + kDrawToolExtraHeight
          }
        };
    codapInterface.sendRequest({ action: 'update', resource: 'interactiveFrame',
                                  values: frameValues });
  }

  codapInterface.on('update', 'backgroundImage', function(args) {
    var bgDataURL = args.values.image;
    drawingTool.setBackgroundImage(bgDataURL, 'resizeCanvasToBackground', updateInteractiveFrame);
    return ({ success: true });
  });

  codapInterface.on('get', 'interactiveState', function () {
    var jsonState = drawingTool.save(),
        state = jsonState && JSON.parse(jsonState);
    return ({success: true, values: state });
  });

  $('#camera').on('click', function () {
    var img = drawingTool.canvas.toDataURL();
    codapInterface.sendRequest({
      action: 'notify',
      resource: 'interactiveFrame',
      values: {
        image: img
      }
    });
  });

  // Support dropping an image file into the draw tool.
  $('.container').on('dragover', function (ev) {
    ev.preventDefault();
    var oev = ev.originalEvent;
    oev.dataTransfer.dropEffect = 'all';
  });

  $('.container').on('drop', function (ev) {
    function readToDataURI (file, callback) {
      function handleAbnormalRead() {
        console.log("Failed to read file: " + file.name);
      }
      function handleRead() {
        callback(reader.result);
      }
      var reader = new FileReader();
      if (file) {
        reader.onabort = handleAbnormalRead;
        reader.onerror = handleAbnormalRead;
        reader.onload = handleRead;
        reader.readAsDataURL(file);
      }
    }
    function setBackground(dataURI) {
      drawingTool.setBackgroundImage(dataURI, 'resizeCanvasToBackground',
          updateInteractiveFrame);
    }
    ev.preventDefault();
    var mimeTypes = ['image/png','image/gif', 'image/jpeg', 'image/svg+xml']
    var oev = ev.originalEvent;
    var tDataTransfer = oev.dataTransfer;
    var tFiles = tDataTransfer && tDataTransfer.files;
    if( tFiles && (tFiles.length > 0) && mimeTypes.includes(tFiles[0].type)) {
      console.log('drop: got file -- ' + tFiles[0].name);
      readToDataURI(tFiles[0], setBackground);
    } else {
      console.log('drop of non-file or not file of type: [' + mimeTypes.join() + ']')
    }
  });
});
