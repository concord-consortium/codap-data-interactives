// ==========================================================================
// Project:   Cart
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines CartSettings, the parameters that determine most of the game characteristics
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

var CartSettings = {};

CartSettings.numCarts = 5;
CartSettings.platformColor = '#2c6767';
CartSettings.wheelColor = '#554433';
CartSettings.cartColor = '#8D8069';
CartSettings.cartTextColor = 'ffff00';
CartSettings.platformTop = 172;
CartSettings.platformWidth = 130;
CartSettings.scaleLeft = 150;
CartSettings.brickWidth = 30;
CartSettings.smallBrickGap = 2;
CartSettings.brickHeight = 10;
CartSettings.brickVGap = 3;
CartSettings.brickHGap = 3;
CartSettings.bricksPerLayer = 3;
CartSettings.wheelRadius = 8;
CartSettings.pillarWidth = 32;
CartSettings.pillarEmptyHeight = 40;
CartSettings.pillarFullHeight = 20;
CartSettings.cartHeight = 24;
CartSettings.cartWidth = CartSettings.bricksPerLayer * (CartSettings.brickWidth + CartSettings.brickHGap)
                            - CartSettings.brickHGap;
CartSettings.cartGap = (CartSettings.platformWidth - CartSettings.cartWidth) / 2; // gap between cart and left edge in guessing position
CartSettings.animationTime = 1000;  // milliseconds
CartSettings.easing = '<>';
CartSettings.checkWeight = 'Check Weight';
CartSettings.newCart = 'New Cart';
CartSettings.endGame = 'End Game';
CartSettings.newGame = 'New Game';
