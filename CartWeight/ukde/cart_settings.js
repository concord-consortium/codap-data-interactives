//=========================================================================
// Project:   Cart
// Copyright: ©2016 Concord Consortium
//=========================================================================


/**
 * @fileoverview Defines CartSettings, the parameters that determine most of the game characteristics
 * @author wfinzer@concord.org (William Finzer)
 * @preserve (c) 2016 Concord Consortium
 */

var CartSettings, CartEvents;

function initCartSettings() {
  var tBricksPerLayer = 3,
      tBrickWidth = 30,
      tBrickHGap = 3,
      tPlatformWidth = 130,
      tCartWidth = tBricksPerLayer * (tBrickWidth + tBrickHGap)
          - tBrickHGap;
  CartSettings = {
    numCarts: 5,
    platformColor: '#2c6767',
    wheelColor: '#554433',
    cartColor: '#8D8069',
    cartTextColor: 'ffff00',
    platformTop: 172,
    platformWidth: tPlatformWidth,
    scaleLeft: 150,
    brickWidth: tBrickWidth,
    smallBrickGap: 2,
    brickHeight: 10,
    brickVGap: 3,
    brickHGap: tBrickHGap,
    bricksPerLayer: tBricksPerLayer,
    wheelRadius: 8,
    pillarWidth: 32,
    pillarEmptyHeight: 40,
    pillarFullHeight: 20,
    cartHeight: 24,
    cartWidth: tCartWidth,
    cartGap: (tPlatformWidth - tCartWidth) / 2, // gap between cart and left edge in guessing position
    animationTime: 1000,  // milliseconds
    easing: '<>',
    checkWeight: 'Check Weight',
    newCart: 'New Cart',
    endGame: 'End Game',
    newGame: 'New Game',
    scoreMsg: 'Your score is %@',
    tryAgainMsg: 'Please try again!',
    // UKDE
    ukdeModeHasBeenLogged: false,
    ukdeMode: Math.random() < 0.5 ? 'A' : 'B'
  };

  CartEvents = {
    stateChange: 'stateChange',
    turnStateChange: 'turnStateChange',
    scoreChange: 'scoreChange',
    levelUnlocked: 'levelUnlocked',
    invalidGuess: 'invalidGuess',
    cartChange: 'cartChange',
    ukdeA_failedGamesThresholdPassed: 'ukdeA_failedGamesThresholdPassed'
  };
}

initCartSettings();