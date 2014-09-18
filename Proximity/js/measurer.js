// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Measurer, the behavior of the tool with which the user measures distance
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper {Raphael paper}
 * @param iBall {Ball}
 * @param iGoal {Goal}
 * @constructor
 */
function Measurer( iPaper, iBall, iGoal ) {
  var tVerb = ('createTouch' in document) ? 'Touch' : 'Click';
  this.instructions = tVerb + " and drag";
  this.hint = tVerb + " the ruler to measure distance";
  this.hintTimeout = null;
  this.paper = iPaper;
  this.ball = iBall;
  this.goal = iGoal;
  this.line = this.paper.path("")
    .attr({ stroke: ProximitySettings.measureColor, "stroke-width": 2 });
  this.measureText = this.paper.text( 0, 0, "")
    .attr({ fill: ProximitySettings.measureColor, "font-size": ProximitySettings.measureFontSize });
  this.initMeasureMechanism();
}

/**
 * Set up the appearance and mechanism of the measurement process
 */
Measurer.prototype.initMeasureMechanism = function() {
  var this_ = this,
      tStartX, tStartY, tCurrX, tCurrY, tDist;

  /**
   * Especially, specify the method to call when the measurement ruler icon is clicked
   */
  function initMeasureButton() {

    function enterMeasureMode() {
      this_.clearHintTimeout();
      this_.selectMeasureButton( true);
      this_.measureInstructions.attr("text", this_.instructions)
        .show();
      this_.measureCover.show();
    }

    var tXExtent = 48, tYExtent = 20;
    this_.measureButton = this_.paper.image( '../Proximity/img/ruler.png', 0, 0, tXExtent, tYExtent)
      .attr({ title: "Click to measure", cursor: 'pointer' })
      .click( enterMeasureMode);
    this_.measureInstructions = this_.paper.text( tXExtent + 5, tYExtent / 2, '')
      .attr({ fill: ProximitySettings.measureColor,
                'font-size': ProximitySettings.measureFontSize, 'text-anchor': 'start' })
      .hide();

  }

  /**
   * We're in measurement mode and the mouse has gone down
   * @param iX
   * @param iY
   * @param iEvent
   */
  function measureStart( iX, iY, iEvent) {
    this_.line.show();
    this_.measureText.show();

    // Snap inside the ball if the mousepoint is close enough
    if( this_.ball.containsPoint( iX, iY, 1.5 /*scale*/)) {
      iX = this_.ball.xx;
      iY = this_.ball.yy;
    }
    tStartX = iX;
    tStartY = iY;
    this_.line.attr({ path: "", "stroke-opacity": 1 });
    this_.measureText.attr({ text: "", "fill-opacity": 1 });
  }

  /**
   * We're dragging and the mouse has moved. Display the new distance and new line.
   * @param iDX
   * @param iDY
   * @param iX
   * @param iY
   * @param iEvent
   */
  function measureMove( iDX, iDY, iX, iY, iEvent) {
    if( this_.ball.containsPoint( iX, iY)) {
      iX = this_.ball.xx;
      iY = this_.ball.yy;
    }
    var tPathString = "M" + tStartX + "," + tStartY + "," + iX + "," + iY,
        tDX = iX - tStartX,
        tDY = iY - tStartY,
        tMidX = (iX + tStartX) / 2,
        tMidY = (iY + tStartY) / 2,
        tTheta = Math.atan2( iY - tStartY, iX - tStartX ),
        tTextX = tMidX + 20 * Math.sin( tTheta),
        tTextY = tMidY - 20 * Math.cos( tTheta);
    tDist = Math.round( 10 * Math.sqrt( tDX * tDX + tDY * tDY)) / 10;
    this_.line.attr( "path", tPathString);
    this_.measureText.attr({ text: tDist, x: tTextX, y: tTextY })
  }

  /**
   * The user has ended measurement, so put things back to normal mode and log the measurement
   * @param iEvent
   */
  function measureEnd( iEvent) {

    function animationEnd() {
      this_.line.hide();
      this_.measureText.hide();
    }

    this_.line.animate({ "stroke-opacity": 0 }, 1000, "<>", animationEnd)
    this_.selectMeasureButton( false);
    this_.measureInstructions.hide();
    this_.measureText.animate({ "fill-opacity": 0 }, 1000, "<>")
    this_.measureCover.hide();
    var logAction = function(){
        ProximityGame.codapPhone.call({ action: "logAction",
            args: {
                formatStr: "Measurement: %@",
                replaceArgs: [ tDist ]
            }
        });

    }.bind(this);
      logAction();
    this_.startHintTimeout();
  }

  // Body of initMeasureMechanism
  initMeasureButton();
  this.measureCover = this.paper.rect( 0, 0, this.paper.width, this.paper.height)
    .attr({ fill: "rgba(0,0,0,0.001)", cursor: "crosshair"})
    .drag( measureMove, measureStart, measureEnd)
    .hide();

  this.startHintTimeout();
};

/**
 * Set the appearance of the ruler based on whether it is to appear selected or not
 * @param iSelect {Boolean}
 */
Measurer.prototype.selectMeasureButton = function( iSelect) {
  var tSrc = iSelect ? '../Proximity/img/ruler_selected.png' : '../Proximity/img/ruler.png';
  this.measureButton.attr( "src", tSrc);
}

/**
 * Set the timer to show the hint after measureHintTime
 */
Measurer.prototype.startHintTimeout = function() {
  var this_ = this;

  function showHint() {
    this_.measureInstructions.attr('text', this_.hint)
      .show();
  }

  if( this.hintTimeout)
    this.clearHintTimeout();
  this.hintTimeout = setTimeout( showHint, ProximitySettings.measureHintTime);
}

/**
 * Prevent the measurement hint from appearing
 */
Measurer.prototype.clearHintTimeout = function() {
  this.measureInstructions.hide();
  if( this.hintTimeout)
    clearTimeout( this.hintTimeout);
  this.hintTimeout = null;
}