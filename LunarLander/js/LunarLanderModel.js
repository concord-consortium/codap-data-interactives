// ==========================================================================
// Project:   LunarLanderModel
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global Event, EventDispatcher, KCPCommon, LanderModel, LunarSettings */

/**
 *     This is the model layer for the game as a whole. It keeps track of the landers
 *     and the state with respect to whether a descent is in progress or not.
 *
 * @fileoverview Defines LunarLanderModel
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 * Build the model layer and init the game with DG.
 * @param dgAPI
 * @constructor
 */
function LunarLanderModel( codapPhone, iDoAppCommandFunc) {
  var this_ = this;
  /**
   * If neither lander is active, change state and notify
   */
  function handleFlightEnded() {
    var landed=0;
    var numLanders=0;

    //Check to see how many landers are active
    for (i=0;i<this_.landers.length; i++ ) {
      if ((this_.landers[i].landerState === 'pending') || (this_.landers[i].landerState === 'descending')) {
        ++numLanders;
      }
    }
    //Check to see how many landers have landed
    for (i=0;i<numLanders; i++){
      if (this_.landers[i].landerState === 'pending') {
        ++landed;
      }
    }
    //If all active landers have landed, change all landerState to active, and gameState to waiting
    if (landed===numLanders) {
      for (i=0; i<numLanders; i++){
        this_.landers[i].landerState = 'active';
      }
        this_.changeState('waiting');
    }
  }

  this.codapPhone = codapPhone;
  this.doAppCommandFunc = iDoAppCommandFunc;
  this.eventDispatcher = new EventDispatcher();

  this.landers = [];
  KCPCommon.keys( LunarSettings.defaultNames).forEach( function( iName) {
    this.landers.push( new LanderModel( iName, this.codapPhone));
  }.bind( this));

  this.landers.forEach( function( iLander) {
    iLander.eventDispatcher.addEventListener('flightEnded', handleFlightEnded);
  }.bind( this));

  this.gameState = 'welcome'; // one of welcome, waiting, descending, setup
}

/**
 * Let DG know about Lunar Lander
 */
LunarLanderModel.prototype.initGame = function() {
  this.codapPhone.call({
    action:'initGame',
    args:{
        name: "Lunar Lander",
        version:"3.0",
        dimensions:{width: 341, height:529},
        collections: [
            {
                name: "Landing Attempts",
                attrs: [
                    {name: "attempt_num", type: "numeric", precision: 0, defaultMin: 0, defaultMax: 3, description: "attempt number for this lander"},
                    {name: "craft", type: "nominal", description: "name of lander"},
                    {name: "pilot", type: "nominal", description: "name of pilot"},
                    {name: "side", type: "nominal", description: "left or right"},
                    {name: "total_time", type: "numeric", precision: 2, defaultMin: 10, defaultMax: 30, description: "how long the landing lasted in seconds"},
                    {name: "impact", type: "numeric", precision: 2, defaultMin: 0, defaultMax: 70, description: "final velocity of lander"},
                    {name: "fuel_remaining", type: "numeric", precision: 2, defaultMin: 0, defaultMax: 100, description: "fuel remaining after landing"}
                ],
                childAttrName: "flight_record",
                defaults: {
                    xAttr: "attempt_num",
                    yAttr: "impact"
                }
            },
            {
                name: "Flight Record",
                attrs: [
                    {name: "time", type: "numeric", precision: 2, defaultMin: 0, defaultMax: 30, description: "seconds since beginning of attempt"},
                    {name: "altitude", type: "numeric", precision: 1, defaultMin: 0, defaultMax: 360, description: "distance above the lunar surface"},
                    {name: "velocity", type: "numeric", precision: 2, defaultMin: 0, defaultMax: 30, description: "velocity of lander"},
                    {name: "fuel", type: "numeric", defaultMin: 0, defaultMax: 100, precision: 2, description: "fuel left"},
                    {name: "thrust", type: "nominal", description: "TD+/- turn on or off down thruster, TU+/- turn on or off the up thruster"}
                ],
                labels: {
                    singleCase: "measurement",
                    pluralCase: "measurements",
                    singleCaseWithArticle: "a measurement",
                    setOfCases: "flight record",
                    setOfCasesWithArticle: "a flight record"
                },
                defaults: {
                    xAttr: "time",
                    yAttr: "altitude"
                }
            }
        ]
    } //doCommandFunc: this.doAppCommandFunc
    },function(){console.log("Initializing game.")});
};

/**
 * Called once at the beginning after the welcome
 */
LunarLanderModel.prototype.getStarted = function() {
  this.changeState( 'waiting');
  this.landers[0].setState('active');
  this.landers[1].setState('inactive');
};

LunarLanderModel.prototype.changeState = function( iState) {
  var tEvent = new Event('stateChange');
  tEvent.oldState = this.gameState;
  tEvent.newState = iState;
  this.gameState = iState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

LunarLanderModel.prototype.startDescent = function() {
  this.changeState('descending');
  this.landers.forEach( function( iLander) {
    if(iLander.landerState !== 'inactive')
      iLander.startDescent();
  });
};

LunarLanderModel.prototype.abort = function() {
  this.changeState('waiting');
  this.landers.forEach( function( iLander) {
    if(iLander.landerState !== 'inactive')
      iLander.abort();
  });
};

LunarLanderModel.prototype.toggleLanders = function() {
  var t2ndLander = this.landers[1],
      tNewState = (t2ndLander.landerState === 'inactive') ? 'active' : 'inactive';
  t2ndLander.setState( tNewState);
};

LunarLanderModel.prototype.prepareForSetup = function() {
  this.landers.forEach( function( iLander) {
    iLander.reset();
  });
  this.changeState('setup');
};

/**
  Saves the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @returns  {Object}    { success: {Boolean}, state: {Object} }
 */
LunarLanderModel.prototype.saveGameState = function() {
  var landers = [];
  this.landers.forEach( function( iLander) {
                          landers.push( iLander.saveLanderState());
                        });
  return {
            success: true,
            state: {
              landers: landers
            }
          };
};

/**
  Restores the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @param    {Object}    iState -- The state as saved previously by saveGameState().
 */
LunarLanderModel.prototype.restoreGameState = function( iState) {
  var restoredLanders = iState && iState.landers;
  if( restoredLanders) {
    // Should we match on left/right instead of relying on index?
    this.landers.forEach( function( iLander, iIndex) {
                            iLander.restoreLanderState( restoredLanders[ iIndex]);
                          });
    this.changeState('waiting');
  }
  return { success: true };
};

