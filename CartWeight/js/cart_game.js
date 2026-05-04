"use strict";
// ==========================================================================
// Project:   Cart Weight
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global CartModel, CartView */

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

/**
  Initialize the Cart Weight game.
  Called from 'onload' handler in index.html.
 */
CartGame.prototype.initializeGame = async function() {

    console.log("CartWeight: initializeGame started");
    try {
      this.model = new CartModel();
      console.log("CartWeight: model created");
      this.view = new CartView(this.model);
      this.view.initialize();
      console.log("CartWeight: view initialized, listeners registered");
    } catch(e) {
      console.error("CartWeight: error during model/view setup:", e);
    }

    try {
      await codapInterface.init({
        name: "Cart Weight",
        title: "Cart Weight",
        version: "2.1",
        dimensions: { width: 289, height: 382 }
      }, null);
      console.log("CartWeight: codapInterface.init resolved");
    } catch(e) {
      console.error("CartWeight: codapInterface.init failed:", e);
    }

    try {
      await this.model.initialize();
      console.log("CartWeight: model.initialize completed");
    } catch(e) {
      console.error("CartWeight: model.initialize failed:", e);
    }

};
