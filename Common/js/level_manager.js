// ==========================================================================
// Project:   JavaScript games
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/*global $, KCPCommon */

/**
 * @fileoverview Defines LevelManager
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 * This class handles creation of a levels panel driven by an object that contains information about those levels.
 * It is used in common by Proximity, Markov, Shuffleboard, and Cart Weight.
 *
 * There must be:
 * An element named 'levels_panel' that contains the entire UI
 * An element named 'levels_table that positions the table itself
 * An element named 'currLevel' whose HTML can be replaced by the name of the current level
 */

/**
 *
 * @param iLevels An array with elements used to specify each of the levels.
 * @param iClickHandlerString A String of the form '<objectReference>.'<handlerName>(##);' where '##' can be
 *          replaced by the level number
 * @param iEnabledHandler A function that takes a level spec and returns whether it is enabled.
 * @constructor
 */
function LevelManager(iLevels, iGameModel, iClickHandlerString, isEnabledHandler, isEnabledFunction) {
  this.levelsArray = iLevels;
  this.gameModel = iGameModel;
  this.clickHandlerString = iClickHandlerString;
  this.isEnabledHandler = isEnabledHandler;
  this.isEnabledFunction = isEnabledFunction;
  this.currLevel = null;
  iLevels.forEach(function (iLevel, iIndex) {
    iLevel.levelNum = iIndex + 1;
  });
}

/**
 *
 * @param iCurrLevel LevelSpec
 */
LevelManager.prototype.configureLevelsPanel = function (iCurrLevel) {
  var this_ = this,
      tIndicatorHTML = '<td class = "indicator ##"></td>';
  this.currLevel = iCurrLevel;
  document.getElementById("currLevel").innerHTML = iCurrLevel.levelName;

  var tTableString = '';

  this.levelsArray.forEach(function (iLevelSpec, iIndex) {
    var tEnabled = this_.isLevelEnabled(iLevelSpec),
        tColor = tEnabled ? "green" : "red",
        tDescription = tEnabled ? iLevelSpec.Description : iLevelSpec.prerequisite.excuse,
        tHoverStyle = tEnabled ? 'level_normal' : '',
        tClickHandlerString = ('onclick="' + this_.clickHandlerString + '"').replace('##', iIndex),
        tRowStyle = this_.isCurrLevel(iLevelSpec) ? 'level_highlight' : '',
        tRowString = ('<tr class="%% @@"' + tClickHandlerString + ' >').replace('%%', tHoverStyle).replace('@@', tRowStyle) +
            '<td>' +
            iLevelSpec.levelName +
            '</td>' +
            tIndicatorHTML.replace('##', tColor) +
            '<td>' +
            tDescription +
            '</td>' +
            '</tr>'
        ;
    tTableString += tRowString;
  });
  $("#levels_table").html(tTableString); // Using JQuery to do this avoids a nasty IE9 incompatibility
  KCPCommon.setElementVisibility("levels_panel", true);
  KCPCommon.setElementVisibility("cover", true);
};

/**
 * For some games, all levels are unlocked
 */
LevelManager.prototype.unlockAll = function () {
  this.levelsArray.forEach(function (iLevel) {
    iLevel.unlocked = true;
  });
};

/**
 * A bottleneck for the things we need to do when we're leaving
 */
LevelManager.prototype.leaveLevelsMode = function () {
  KCPCommon.setElementVisibility("levels_panel", false);
  KCPCommon.setElementVisibility("cover", false);
};

/**
 *
 * @param iName {String} - the name of the level to return
 * @return Level Spec
 */
LevelManager.prototype.getLevelNamed = function (iName) {
  return this.levelsArray.filter(function (iLevelSpec) {
    return iLevelSpec.levelName === iName;
  }).pop();
};

/**
 * Determine if the given level spec describes a level that the user can play
 * @param iLevel Level Spec
 * @return {Boolean}
 */
LevelManager.prototype.isLevelEnabled = function (iLevel) {
  return !iLevel.prerequisite || this.isEnabledFunction.call(this.isEnabledHandler, iLevel);
};

/**
 *
 * @param iLevel
 * @return {Boolean}
 */
LevelManager.prototype.isCurrLevel = function (iLevel) {
  return iLevel === this.currLevel;
};

/**
 *
 * @return {Object}
 */
LevelManager.prototype.getStartingLevel = function () {
  return this.levelsArray.filter(function (iLevelSpec) {
    return iLevelSpec.startingLevel;
  }).pop();
};

/**
 *
 * @return {Object}
 */
LevelManager.prototype.getNextLevel = function (iLevel) {
  var tResult;
  this.levelsArray.forEach(function (aLevel, anIndex) {
    if (aLevel === iLevel && anIndex < this.levelsArray.length - 1) {
      tResult = this.levelsArray[ anIndex + 1];
    }
  }.bind(this));
  return tResult;
};

/**
 Returns an object which saves the lock/unlock state of the levels
 for saving/restoring with the document.
 @returns  {Object}    Map from level name {String} to unlock state {Boolean}.
 */
LevelManager.prototype.getLevelsLockState = function () {
  var levelsMap = {};
  this.levelsArray.forEach(function (iLevel) {
    levelsMap[iLevel.levelName] = iLevel.unlocked;
  });
  return levelsMap;
};

/**
 Sets the lock/unlock state of the levels based on the contents
 of the iLevelsMap argument, which will generally have been
 returned by a previous call to getLevelsLockState() and possibly
 saved with the document in the interim.
 @param    {Object}  iLevelsMap -- Map from level name {String} to unlock state {Boolean}.
 */
LevelManager.prototype.setLevelsLockState = function (iLevelsMap) {
  this.levelsArray.forEach(function (iLevel) {
    var levelUnlocked = iLevelsMap[iLevel.levelName];
    if (levelUnlocked !== undefined)
      iLevel.unlocked = levelUnlocked;
  });
};

