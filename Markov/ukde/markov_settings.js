// ==========================================================================
// Project:   Cart
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines MarkovSettings, the parameters that determine most of the game characteristics
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

var MarkovSettings = {
  endGame: 'End Game',
  newGame: 'New Game',
  kAnimTime: 1000,       // milliseconds
  kTotalStepsDown: 6,
  kTotalStepsUp: 20,
  kColorMap: { R: 'red', P: 'blue', S: 'green'},
  kInitialMessage: 'Rock, paper, or scissors?',
  // UKDE
  ukdeMode: Math.random() < 0.5 ? 'A' : 'B',
  ukdeBTooManyMoves: 45 // If more than this many moves, user doesn't go on to next level
};
