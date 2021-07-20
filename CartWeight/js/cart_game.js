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

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function( iCommand, callback) {
      switch( iCommand.operation) {
      
      case 'saveState':
        callback(cartGame.model.saveState()
        );
        break;
      
      case 'restoreState':
        callback(cartGame.model.restoreState( iCommand.args && iCommand.args.state));
        break;
      
      default:
        callback({ success: false });
      }

    }, "codap-game", window.parent);

    this.model = new CartModel(this.codapPhone, this.doAppCommand);
    this.view = new CartView(this.model);

    this.model.initialize();
    this.view.initialize();

};
