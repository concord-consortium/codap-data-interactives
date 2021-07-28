// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines ProximitySettings, the parameters that determine most of the game characteristics
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

var ProximitySettings = {};

ProximitySettings.numGoals = 6; // in a game

ProximitySettings.ballRadius = 8; // pixels
ProximitySettings.ballColor = "#CCCCDD";  // Could be done in css, but a bit cumbersome to combine with raphael

ProximitySettings.goalRadius = 80;  // pixels
ProximitySettings.goalFontSize = 36;
ProximitySettings.goalLabelColor = "#664400";

ProximitySettings.tickInterval = 40;  // milliseconds

ProximitySettings.defaultAcceleration = 40; // pixels per sec per sec

ProximitySettings.ballPositionBorder = 67;	//	ball can't be closer to the edge than this
ProximitySettings.goalPositionBorder = 30;	//	goal can't be closer to the edge than this
ProximitySettings.minimumGoalDistance = 90; //  goal must be at least this far from ball

ProximitySettings.measureFontSize = 14;     // Size of font for measurement
ProximitySettings.measureColor = 'yellow';     // Used throughout measurement tool
ProximitySettings.measureHintTime = 60000;    // ms delay before showing measurement hint

ProximitySettings.putterColor = '#ffff00';     // Used putter

ProximitySettings.roughRect = { x: 100, y: 20, width: 150, height: 200 };
ProximitySettings.roughFrictionFactor = 2;  // factor to slow down by in the 'rough.'
