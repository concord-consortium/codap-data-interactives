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
});
