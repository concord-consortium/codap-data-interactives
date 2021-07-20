// ==========================================================================
// Project:   GaugeView
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     Reflects internal state of lander by moving needles on gauges and
 *     displaying time, speed, etc. Receives events from model.
 *
 * @fileoverview Defines GaugeView
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function GaugeView( iModel, iElement) {
  var tWidth = iElement.width(),
      tHeight = iElement.height(),
      this_ = this;

  function handleUpdate() {
    this_.handleUpdate();
  }

  this.model = iModel;
  this.element = iElement;
  this.model.eventDispatcher.addEventListener('update', handleUpdate);
  this.model.eventDispatcher.addEventListener('stateChange', this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener('setupChange', this.handleSetupChange, this);
  this.paper = new Raphael(iElement[0], tWidth, tHeight);
  with( this.layout) {
    this.craft = this.paper.text( topTextX, 2 * fontSize / 3, this.model.craft)
      .attr({ fill: kBlue, 'font-size': fontSize, 'text-anchor': 'start' });
    this.pilot = this.paper.text( topTextX, 5 * fontSize / 3, this.model.pilot)
      .attr({ fill: kGreen, 'font-size': fontSize, 'text-anchor': 'start' });
    this.paper.text( timeX, timeY, 'Time:')
      .attr({ fill: kBlue, 'font-size': fontSize, 'text-anchor': 'start' });
    this.time = this.paper.text( timeValueX, timeY - 2, this.model.total_time)
      .attr({ fill: valueFontColor, 'font-size': valueFontSize, 'text-anchor': 'start', 'font-weight': 'bold' });
    this.paper.text( centerSpeedX, centerSpeedY - fontSize, 'Speed')
      .attr({ fill: kBlue, 'font-size': fontSize });
    this.velocity = this.paper.text( centerSpeedX, centerSpeedY + valueFontSize, this.model.velocity)
      .attr({ fill: valueFontColor, 'font-size': valueFontSize, 'font-weight': 'bold' });
    this.paper.text( centerFuelX, fuelLabelY, 'Fuel')
      .attr({ fill: kBlue, 'font-size': fontSize });
    this.fuel = this.paper.text( centerFuelX, fuelY, this.model.fuel_remaining)
      .attr({ fill: valueFontColor, 'font-size': valueFontSize, 'font-weight': 'bold' });
    this.speedArrow = this.paper.path('M-4.691,0.363 C-4.786,-3.884 0.253,-5 0.253,-5 L-32,0.146 L0.151,5.379 C0.151,5.379 -4.6,4.449 -4.691,0.363 z')
      .attr({ fill: '#EF0017', 'stroke-width': 0 });
    this.fuelArrow = this.speedArrow.clone();
    this.handleUpdate();
  }
}

GaugeView.prototype.layout = {
  kBlue: '#84FFFF',
  kGreen: '#C5FF86',
  topTextX: 7,
  fontSize: 12,
  timeX: 27, timeY: 42,
  timeValueX: 60,
  valueFontSize: 18,
  valueFontColor: 'white',
  centerSpeedX: 107,
  centerSpeedY: 101,
  centerFuelX: 32,
  centerFuelY: 135,
  fuelLabelY: 100,
  fuelY: 145,
  arrowWidth: 32,
  arrowHeight: 10,
  maxSpeed: 40
}

GaugeView.prototype.handleUpdate = function() {

  function round( iValue) {
    return (iValue !== null) ? Math.round( 10 * iValue) / 10 : '';
  }

  var tTime = round( this.model.total_time),
      tSpeed = round( this.model.velocity),
      tFuel = (this.model.fuel_remaining !== null) ? Math.round( this.model.fuel_remaining) : '',
      tAngle, tTransform, tColor;
  this.time.attr('text', tTime);
  this.velocity.attr('text', tSpeed);
  this.fuel.attr({ text: tFuel });
  if( tSpeed !== '') {
    tAngle = tSpeed / this.layout.maxSpeed * 360;
    tTransform = 't' + (this.layout.centerSpeedX + 16) + ' ' + this.layout.centerSpeedY + 's1.1r' + tAngle + 't-16 0';
    this.speedArrow.transform( tTransform);
    this.speedArrow.show();
  }
  else
    this.speedArrow.hide();
  if( tFuel !== '') {
    tColor = (tFuel < 10) ? 'red' : 'white';
    this.fuel.attr('fill', tColor);
    tAngle = 32 + tFuel / 100 * 116;
    tTransform = 't' + (this.layout.centerFuelX + 16) + ' ' + this.layout.centerFuelY +
                 's0.7r' + tAngle + 't-16 0';
    this.fuelArrow.transform( tTransform);
    this.fuelArrow.show();
  }
  else
    this.fuelArrow.hide();
};

/**
 * Toggle visibility based on whether we are active or not
 * @param iEvent
 */
GaugeView.prototype.handleStateChange = function( iEvent) {
  switch( iEvent.newState) {
    case 'active':
      this.element.toggle( true);
      break;
    case 'inactive':
      this.element.toggle( false);
      break;
  }
};

/**
 * Make sure the craft and pilot names are in synch
 */
GaugeView.prototype.handleSetupChange = function() {
  this.craft.attr('text', this.model.craft);
  this.pilot.attr('text', this.model.pilot);
};

