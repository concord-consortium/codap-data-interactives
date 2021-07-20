// ==========================================================================
// Project:   SetupView
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     One per lander. Displays during setup. Acts also as controller to
 *     receiver user actions and relay results to lander model.
 *
 * @fileoverview Defines SetupView
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function SetupView( iModel, iElement) {
  this.model = iModel;
  this.element = iElement;
  this.initialized = false;
}

SetupView.prototype.setup = function() {
  var tSide = this.model.side,
      tTopColorMenu = $('#'+ tSide + '_setup_topColor' ),
      tBottomColorMenu = $('#'+ tSide + '_setup_bottomColor' ),
      tShipName = $('#'+ tSide + '_setup_shipName' ),
      tCaptainName = $('#'+ tSide + '_setup_captainName' ),
      tFireTop = $('#'+ tSide + '_setup_fireTop' ),
      tFireBottom = $('#'+ tSide + '_setup_fireBottom' ),
      tColor;
  this.element[0].style.visibility = 'visible';

  if( !this.initialized) {
    ['Silver', 'Blue', 'Green', 'Red', 'Yellow'].forEach( function( iColor) {
      var tOption = '<option value=\"' + iColor.toLowerCase() + '\">' + iColor + '</option>';
      tTopColorMenu.append( tOption);
      tBottomColorMenu.append( tOption);
    });
    this.initialized = true;
  }

  tShipName.val( this.model.craft);
  tShipName.change( function() {
    this.model.setParameter( 'craft', tShipName.val());
  }.bind( this));
  tCaptainName.val( this.model.pilot);
  tCaptainName.change( function() {
    this.model.setParameter( 'pilot', tCaptainName.val());
  }.bind( this));

  tColor = this.model.topColor;
  tColor[0] = tColor[0].toUpperCase();
  tTopColorMenu.val( tColor);
  tTopColorMenu.change( function() {
    this.model.setParameter('topColor', tTopColorMenu.val());
  }.bind( this));

  tColor = this.model.bottomColor;
  tColor[0] = tColor[0].toUpperCase();
  tBottomColorMenu.val( tColor);
  tBottomColorMenu.change( function() {
    this.model.setParameter('bottomColor', tBottomColorMenu.val());
  }.bind( this));

  tFireTop.val( this.model.keyTop.toUpperCase());
  tFireTop.change( function() {
    var tVal = tFireTop.val();
    if( tVal.length > 0)
      this.model.setParameter( 'keyTop', tVal[0].toLowerCase());
  }.bind( this));

  tFireBottom.val( this.model.keyBottom.toUpperCase());
  tFireBottom.change( function() {
    var tVal = tFireBottom.val();
    if( tVal.length > 0)
      this.model.setParameter( 'keyBottom', tVal[0].toLowerCase());
  }.bind( this));
};

SetupView.prototype.exitSetup = function() {
  this.element[0].style.visibility = 'hidden';
};