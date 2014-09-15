// ==========================================================================
// Project:   Cart Weight
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global CartModel, CartView, DataGamesAPI */

/**
 * @fileoverview Defines CartGame, the top-level controller for the Cart Weight game
 * @author bfinzer@kcptech.com (William Finzer, Kirk Swenson)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
  Constructor for the CartGame class.
 */
function CartGame() {
}

// Singleton global instance
var cartGame = new CartGame();
var codapPhone=null;

/**
  Initialize the Cart Weight game.
  Called from 'onload' handler in index.html.
 */
CartGame.prototype.initializeGame = function() {

    //this.dataGamesAPI = new DataGamesAPI();
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function() {}, "codap-game", window.parent);
    this.model = new CartModel(this.codapPhone, this.doAppCommand);
    this.view = new CartView(this.model);

    this.model.initialize();
    this.view.initialize();

};

/**
  Handler for callbacks from DG application.
 */
CartGame.prototype.doAppCommand = function( iCommand) {
  switch( iCommand.operation) {
  
  case 'saveState':
    return cartGame.model.saveState();
  
  case 'restoreState':
    return cartGame.model.restoreState( iCommand.args && iCommand.args.state);
  
  default:
  }

  return { success: false };
};

