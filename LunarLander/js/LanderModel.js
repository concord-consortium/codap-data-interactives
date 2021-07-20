// ==========================================================================
// Project:   LanderModel
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global Event, EventDispatcher, LunarSettings */

/**
 *     One of these for each lander. Responsible for posting landing attempt
 *     and flight record cases to DG. Holds onto state for lander during ascent
 *     and computes new state for each tick.
 *
 * @fileoverview Defines LanderModel
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 * Set up properties and their defaults
 * @param iSide - left or right
 * @param iDgAPI
 * @constructor
 */
function LanderModel( iSide, codapPhone) {
  this.eventDispatcher = new EventDispatcher();
  this.side = iSide;
  this.codapPhone = codapPhone;
  this.landerState = 'inactive';  // inactive, active
  this.openGameCase = null; // ID of DG case for a landing attempt
  this.kGravity = 1;
  this.kPreviousGameCaseClosed = true;

  // landing attempt properties
  this.attempt_num = 0;
  this.craft = LunarSettings.defaultNames[ this.side].craft;
  this.pilot = LunarSettings.defaultNames[ this.side].pilot;
  this.keyTop = LunarSettings.defaultNames[ this.side].keyTop;
  this.keyBottom = LunarSettings.defaultNames[ this.side].keyBottom;
  this.topColor = LunarSettings.defaultNames[ this.side].topColor;
  this.bottomColor = LunarSettings.defaultNames[ this.side].bottomColor;
  this.initProperties();
}

LanderModel.prototype.kWorldTop = 360;

/**
 * In preparation for a fresh landing attempt
 */
LanderModel.prototype.initProperties = function() {
  this.total_time = 0;
  this.impact = null;
  this.fuel_remaining = 100;
  this.altitude = this.kWorldTop;
  this.velocity = 0;
  this.thrust = '';
  this.thrustState = 'none';  // top, bottom, none
  this.lastUpdateTime = null;

  this._thrust = 0;
  this._timeSinceRecord = 0;
  this.aborted = false;
  if (this.openGameCase) {
    this.endFlight();
  }
};

/**
 * Notifies views
 * @param {Event}
 */
LanderModel.prototype.setState = function( iState) {
  var tEvent = new Event('stateChange');
  tEvent.oldState = this.landerState;
  tEvent.newState = iState;
  this.landerState = iState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Notifies views
 * @param {Event}
 */
LanderModel.prototype.broadcastUpdate = function() {
  this.eventDispatcher.dispatchEvent( new Event('update'));
};

/**
 * Begin a new landing attempt.
 */
LanderModel.prototype.startDescent = function( iState) {
  var this_ = this;

  function tick() {
    if( this_.landerState !== 'descending')
      return;

    var tNow = new Date().getTime(),
        tDelta = (this_.lastUpdateTime === null) ? 0 : (tNow - this_.lastUpdateTime) / 1000,
        tAcc = this_.kGravity;
    this_.total_time += tDelta;
    if( this_.fuel_remaining > 0) {
      tAcc += this_._thrust;
    }
    else {
      this_.fuel_remaining = 0;
      this_.thrust = '';
      this_._thrust = 0;
    }

    this_.altitude -= this_.velocity * tDelta + 0.5 * tAcc * tDelta * tDelta;
    this_.velocity += tAcc * tDelta;
    this_.altitude = Math.max( 0, this_.altitude);

    this_.fuel_remaining -= Math.abs(this_._thrust) * tDelta;

    this_.lastUpdateTime = tNow;
    if( this_.altitude > 0)
      setTimeout( tick, LunarSettings.kTickInterval);

    this_.broadcastUpdate();
    if( (tNow - this_._timeSinceRecord > 500) || (this_.altitude <= 0)) {
      this_.addFlightRecordCase();
      this_._timeSinceRecord = tNow;
    }

    if( this_.altitude <= 0)
      this_.endFlight();
  }

    this.attempt_num++;
    this.initProperties();
    this.openNewGameCase();
    this.setState('descending');
    tick();

};

/**
 * If we don't already have an open game case, open one now.
 */
LanderModel.prototype.openNewGameCase = function()
{
  if( !this.openGameCase) {
    this.codapPhone.call({
        action:'openCase',
        args: {
            collection: "Landing Attempts",
            values:[this.attempt_num, this.craft, this.pilot, this.side, '', '', '']
        }
    }, function(result){
        if(result.success){
            this.openGameCase=result.caseID;
            this.kPreviousGameCaseClosed=false;
            console.log('kPreviousGameCaseClosed is '+this.kPreviousGameCaseClosed);
            console.log("I have caseID "+result.caseID);
        } else {
            console.log("Lunar Lander: Error calling 'openCase'");
        }
    }.bind(this));
  }
};

/**
 * If we don't already have an open game case, open one now.
 */
LanderModel.prototype.addFlightRecordCase = function()
{
  var createCase = function(){
      this.codapPhone.call({
          action:"createCase",
          args:{
              collection: "Flight Record",
              parent: this.openGameCase,
              values:[
                      this.total_time,
                      this.altitude,
                      this.velocity,
                      this.fuel_remaining,
                      this.thrust
                  ]
          }
      });
  }.bind(this);
  if (this.openGameCase!==null) {
    createCase();
  } else {
    console.log("Lunar Lander: Error no caseID");
  }

  this.thrust = '';  // Only shows once per keydown and keyup
};

/**
 * End the flight
 */
LanderModel.prototype.abort = function()
{
  this.aborted = true;
  this.endFlight();
};

/**
 * Give DG the completed landing attempt case info. Notify that the flight ended
 */
LanderModel.prototype.endFlight = function()
{
  if(this.aborted)
  {
    this.total_time = null;
    this.velocity = null;
    this.fuel_remaining = null;
    this.broadcastUpdate();
  }
  if (this.openGameCase!==null) {
    this.codapPhone.call({
      action: 'closeCase',
      args: {
        collection: "Landing Attempts",
        caseID: this.openGameCase,
        values: [
          this.attempt_num,
          this.craft,
          this.pilot,
          this.side,
          this.total_time,
          this.velocity,
          this.fuel_remaining
        ]
      }
    }, function(){
      this.kPreviousGameCaseClosed=true;
      console.log('kPreviousGameCaseClosed is '+this.kPreviousGameCaseClosed);
    });
  } else {
    console.log("Lunar Lander: Error no caseID");
  }

  this.openGameCase = null;

  this.setState('pending');
  this.thrustState = 'none';
  this.broadcastUpdate();
  this.eventDispatcher.dispatchEvent( new Event('flightEnded'));
};

/**
 * Called by view or controller if user is firing a rocket but we're not yet descending.
 */
LanderModel.prototype.requestDescent = function() {
  this.eventDispatcher.dispatchEvent( new Event('requestDescent'));
};


/**
 * Called by controller when a thrust key goes down
 * @param iWhich - either 'top' or 'bottom'
 */
LanderModel.prototype.beginThrust = function( iWhich) {
  this.thrustState = iWhich;
  if( iWhich === 'top') {
    this.thrust = 'TD+';
    this._thrust = 5;
  }
  else if( iWhich === 'bottom') {
    this.thrust = 'TU+';
    this._thrust = -10;
  }
};

/**
 * Called by controller when a thrust key goes up
 * @param iWhich - either 'top' or 'bottom'
 */
LanderModel.prototype.endThrust = function( iWhich) {
  this.thrustState = 'none';
  if( iWhich === 'top') {
    this.thrust = 'TD-';
  }
  else if( iWhich === 'bottom') {
    this.thrust = 'TU-';
  }
  this._thrust = 0;
};

/**
 * Set the parameter and notify
 * @param iVal
 */
LanderModel.prototype.setParameter = function( iProp, iVal) {
  this[iProp] = iVal;
  this.eventDispatcher.dispatchEvent( new Event('setupChange'));
};

/**
 * Move the lander to starting position with starting values
 */
LanderModel.prototype.reset = function() {
  this.initProperties();
  this.broadcastUpdate();
};

/**
  Utility method for copying properties that should be saved/restored.
  Only properties that are defined in the source will be copied.
  @param    {Object}    iFrom -- Object to copy properties from
  @param    {Object}    iTo -- Object to copy properties to
 */
LanderModel.prototype.copyState = function( iFrom, iTo) {
  var stateProps = ['landerState', 'attempt_num', 'craft', 'pilot', 'side',
                    'topColor', 'bottomColor', 'keyTop', 'keyBottom'];
  stateProps.forEach( function( iPropName) {
                        if( iFrom[ iPropName] !== undefined)
                          iTo[ iPropName] = iFrom[ iPropName];
                      });
};

/**
  Returns an object which contains a copy of all of the properties 
  of this lander which should be saved/restored with the document.
  @returns  {Object}  An object containing the relvant lander properties
 */
LanderModel.prototype.saveLanderState = function() {
  var state = {};
  this.copyState( this, state);
  return state;
};

/**
  Copies the lander properties from iState to this lander.
  @param    {Object}  iState -- The restored lander state
 */
LanderModel.prototype.restoreLanderState = function( iState) {
  if( iState)
    this.copyState( iState, this);
    
  this.setState( this.landerState);
  this.eventDispatcher.dispatchEvent( new Event('setupChange'));
};

