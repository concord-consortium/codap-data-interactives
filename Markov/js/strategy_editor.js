// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines StrategyEditor - Brings up an interface with which user can set a strategy
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iStrategy - Owned by MarkovModel
 * @param iCallback - Method to call when user closes strategy editor
 * @constructor
 */
function StrategyEditor( iStrategy, iCallback)
{
  var this_ = this,
      tTileArea = document.getElementById( 'strategy_tiles');

  function close() {
    KCPCommon.setElementVisibility('cover', false)
    KCPCommon.setElementVisibility('strategy_dialog', false)
    this_.paper.clear();
    this_.paper.remove();
    this_.paper = null;
    this_.callback.call();
    var logAction = function(){
        MarkovGame.model.codapPhone.call({
            action:'logAction',
            args: {formatStr: "backToGame:" }
        });
    }.bind(this);
      logAction();
  }

  function clearStrategy() {
    KCPCommon.keys( iStrategy ).forEach( function( iKey) {
      iStrategy[ iKey].move = '';
      iStrategy[ iKey].weight = 2;
    });
    this_.forEachTile( function( iTile) {
      iTile.moveBorder.attr({ x: iTile.QM.tile.attr('x'), y: iTile.QM.tile.attr('y')});
      iTile.rect.attr('fill', this_.kNormalFill);
      iTile.numWeights.attr('text', iTile.strat.weight);
      while( iTile.weights.length > iTile.strat.weight) {
        iTile.weights.pop().remove();
      }
      while( iTile.weights.length < iTile.strat.weight) {
        iTile.weights.push( iTile.weights[0].clone().transform('...t' + ((1 + iTile.weights.length * 8)) + ' 0'));
      }
    });
      var logAction = function(){
          MarkovGame.model.codapPhone.call({
              action:'logAction',
              args: {formatStr: "clearStrategy:" }
          });
      }.bind(this);
      logAction();
    /*MarkovGame.model.dgApi.doCommand("logAction",
                                          {
                                            formatStr: "clearStrategy:"
                                          });*/
  }

  this.strategy = iStrategy;
  this.callback = iCallback;
  this.hint = $('#hint');
  this.hint.toggle(false);
  this.draggedWeight = null;
  this.dragOverTile = null;

  this.kNormalFill = '#555466';
  this.kHoverFill = '#AAAA84';
  this.kStratFill = '#9DBB95';
  this.kTranslucent = 'rgba(0,0,0,0.001)'

  KCPCommon.setElementVisibility('strategy_dialog', true)
  KCPCommon.setElementVisibility('cover', true)
  document.getElementById('back_to_game' ).onclick = close;
  document.getElementById('strat_clear' ).onclick = clearStrategy;

  this.paper = new Raphael( tTileArea, tTileArea.clientWidth, tTileArea.clientHeight);
  this.setupTiles();
}

StrategyEditor.prototype.forEachTile = function( iFunction) {
  for( var row = 0; row < 3; row++) {
    for( var col = 0; col < 3; col++) {
      var tTile = this.tiles[ row][ col];
      if( iFunction.call( this, tTile) === false)
        return;
    }
  }
}

/**
 * There are nine tiles, one for each possible pair of Markov's previous two moves.
 */
StrategyEditor.prototype.setupTiles = function() {
  var this_ = this,
      kMapping = { RR: [0, 0], RP: [0, 1], RS: [ 0, 2],
                    PP: [1, 0], PR: [1, 1], PS: [ 1, 2],
                    SS: [2, 0], SR: [2, 1], SP: [ 2, 2] },
      tPaper = this.paper,
      kWidth = 127, kHeight = 70, kGap = 4, kPadding = 3,
      kTinyTileSize = 14,
      kRowGap = 8,  // pixels between rows
      tProtoTile = tPaper.rect(0, 0, kTinyTileSize, kTinyTileSize)
                         .attr({ 'stroke-width': 0 } ),
      tProtoLetter = tPaper.text( 0, 0, '')
        .attr({ fill: 'white'} ),
      tProtoBorder = tProtoTile.clone().attr({'stroke-width': 2, stroke: 'yellow' } ),
      tProtoWeight = tPaper.path('M0 0h20l-5 -15h-10Z')
        .attr({ fill: '0-white-gray' } );

  /**
   * Let there be a 'big' tile, within which is a grid of tiny tiles, 7 wide and 3 high
   * @param iRow
   * @param iCol
   * @param iPrev2
   * @param iTileStrat
   */
  function setupTile( iRow, iCol, iPrev2, iTileStrat) {
    var tLeft = kGap + iCol * (kWidth + kGap),
        tTop = iRow * (kHeight + kGap), tTile = {};

    function textForHint() {
      var tMove = tTile.strat.move,
          tResult = '';
      if( tMove === '') {
        tResult = 'Click R, P, or S for what you would like your move to be when Markov\'s previous 2 moves are ' +
                  iPrev2 + '.';
      }
      else {
            tResult = 'When Markov\'s previous 2 moves are ' + iPrev2 + ', your move will be ' + tMove + '.'
      }
      return tResult;
    }

    function hoverIn() {
      if( !this_.draggedWeight) {
        var tHintLeft = tTile.rect.attr('x') + kWidth + kGap,
            tHintTop = tTile.rect.attr('y') + 30;
        tTile.rect.attr( 'fill', this_.kHoverFill);
        this_.hint.css( { left: tHintLeft, top: tHintTop });
        this_.hint.text( textForHint());
        this_.hint.stop(true, true ).fadeIn( 'fast');
      }
    }

    function hoverOut() {
      if( !this_.draggedWeight) {
        tTile.rect.attr('fill', (tTile.strat.move !== '') ? this_.kStratFill : this_.kNormalFill);
        this_.hint.stop(true, true ).fadeOut( 'fast');
      }
    }

    function clickTile( iEvent, iX, iY) {
      // Transform given window coordinates to paper coordinates. Constants are empirically determined.
      var tPt = { x: iX - 7, y: iY - 26 },
          tKeys = ['QM', 'R', 'P', 'S'];
      tKeys.forEach( function( iKey) {
        var tTiny = tTile[ iKey],
            tMove;
        if( KCPCommon.pointInElement( tPt, tTiny.tile)) {
          tMove = (iKey === 'QM') ? '' : iKey;
          tTile.strat.move = tMove;
          tTile.moveBorder.attr({ x: tTiny.tile.attr('x'), y: tTiny.tile.attr('y')});
          this_.hint.text( textForHint());
          drawMessage();
          var logAction = function(){
                MarkovGame.model.codapPhone.call({
                    action:'logAction',
                    args: {formatStr: "setTile: " + JSON.stringify( { prev2: tTile.prev2, to: tMove }) }
                });
          }.bind(this);
            logAction();
          /*MarkovGame.model.dgApi.doCommand("logAction",
                                 {
                                   formatStr: "setTile: " +
                                           JSON.stringify( { prev2: tTile.prev2, to: tMove })
                                 });*/
        }
      });
    }

    function drawTiny( iGridCol, iChar) {
      return {
        tile: tProtoTile.clone().attr({ x: tLeft + (iGridCol + 1) * kPadding + iGridCol * kTinyTileSize,
                        y: tTop + kPadding,
                        fill: MarkovSettings.kColorMap[ iChar]}),
        char: tProtoLetter.clone().attr({ x: tLeft + (iGridCol + 1) * kPadding + (iGridCol + 0.5) * kTinyTileSize,
                        y: tTop + kPadding + kTinyTileSize / 2,
                        text:  iChar })
      };
    }

    function drawPrev2Tiles() {
      // These are purely information, not interactive
      drawTiny( 0, iPrev2.charAt( 0));
      drawTiny( 1, iPrev2.charAt( 1));
    }

    function drawMoveTiles() {
      // These are clickable to set strategy
      tTile.QM = {
        tile: tPaper.rect( tLeft + 4 * kPadding + 3 * kTinyTileSize, tTop + kPadding, kTinyTileSize, kTinyTileSize)
          .attr({ fill: '#999999', 'stroke-width': 0 }),
        char: tProtoLetter.clone().attr({ x: tLeft + 4 * kPadding + 3.5 * kTinyTileSize,
                                y: tTop + kPadding + kTinyTileSize / 2,
                                text:  '?' })
      };
      tTile.R = drawTiny( 4, 'R');
      tTile.P = drawTiny( 5, 'P');
      tTile.S = drawTiny( 6, 'S');
    }

    function drawWeightRow() {
      var tX = tTile.rect.attr('x') + 2 * kTinyTileSize,
          tY = tTile.rect.attr('y') + kTinyTileSize + kPadding + kRowGap + 20,
          tNumWeights = tTile.strat.weight;
      if( tTile.weights)
        tTile.weights.remove();
      tPaper.setStart();
      for( i = 0; i < tNumWeights; i++) {
        tProtoWeight.clone().attr({ transform: 'T' + (tX + i * 8) + ',' + tY});
      }
      tTile.weights = tPaper.setFinish();

      tTile.numWeights = tPaper.text( tX - 0.5 * kTinyTileSize, tY - 6, tNumWeights)
        .attr({ fill: 'white', 'font-size': 12, 'text-anchor': 'end' });

      tTile.weightsRect = { x: tTile.rect.attr('x'), y: tY - 20,
                            width: tX + (tNumWeights + 1) * 10 - tTile.rect.attr('x'),
                            height: 20};
    }

    function drawMessage() {
      var tMsg = (tTile.strat.move === '') ? iPrev2 + ' is not set' : iPrev2 + '->' + tTile.strat.move;
      if( !tTile.msg) {
      tTile.msg = tPaper.text( tTile.rect.attr('x') + kPadding,
        tTile.rect.attr('y') + kHeight - kPadding - kTinyTileSize / 2,
        tMsg)
        .attr({ 'text-anchor': 'start', fill: 'white', 'font-size': 12});
      }
      else
        tTile.msg.attr('text', tMsg);
    }

    function drawStrategyBorder() {
      var tMove = tTile.strat.move,
          tTiny = (tMove === '') ? tTile.QM : tTile[ tMove];
      tTile.moveBorder = tProtoBorder.clone().attr({ x: tTiny.tile.attr('x'), y: tTiny.tile.attr('y')});
    }

    function dragWtStart( iX, iY) {
      if( tTile.strat.weight > 1) {
        this_.draggedWeight = tTile.weights.pop().toFront();
        this_.dragSavedTransform = this_.draggedWeight.attr('transform');
        this_.draggedWeight.attr('cursor', 'move');
        this_.draggedWeight.animate({ transform: 'T' + (iX - 15) + ',' + (iY - 17) }, 250, '<>');
        tTile.strat.weight--;
        tTile.numWeights.attr('text', tTile.strat.weight);
      }
    }

    function dragWtMove( iDX, iDY, iX, iY, iEvent ) {
      if( this_.draggedWeight) {
        var tSavedTile = this_.dragOverTile,
            // Transform given window coordinates to paper coordinates. Constants are empirically determined.
            tX = iX - 7, tY = iY - 26;
        this_.draggedWeight.attr({ transform: 'T' + (iX - 15) + ',' + (iY - 17) });
        this_.dragOverTile = null;
        this_.forEachTile( function( iTile) {
          if( KCPCommon.pointInElement( { x: tX, y: tY }, iTile.cover)) {
            this_.dragOverTile = iTile;
          }
        });
        if( this_.dragOverTile && (tSavedTile !== this_.dragOverTile)) {
          this_.dragOverTile.rect.attr('fill', this_.kHoverFill);
        }
        else if( tSavedTile === this_.dragOverTile)
          tSavedTile = null;

        if( tSavedTile) {
          tSavedTile.rect.attr('fill', (tSavedTile.strat.move !== '') ?
                                               this_.kStratFill : this_.kNormalFill);
        }
      }
    }

    function dragWtEnd() {
      if( this_.draggedWeight) {
        this_.draggedWeight.attr('cursor', '');
        if( this_.dragOverTile) {
          var tWeightNum = this_.dragOverTile.strat.weight,
              tX = this_.dragOverTile.rect.attr('x') + 2 * kTinyTileSize,
              tY = this_.dragOverTile.rect.attr('y') + kTinyTileSize + kPadding + kRowGap + 20;
          this_.dragOverTile.strat.weight++;
          this_.dragOverTile.weights.push( this_.draggedWeight);
          this_.draggedWeight.animate({ transform: 'T' + (tX + tWeightNum * 8) + ',' + tY}, 200, '<>');
          this_.dragOverTile.weightsCover.toFront();
          this_.dragOverTile.numWeights.attr('text', this_.dragOverTile.strat.weight);
          var logAction = function(){
                MarkovGame.model.codapPhone.call({
                    action:'logAction',
                    args: {formatStr: "dragWeight: " + JSON.stringify( { from: tTile.prev2, to: this_.dragOverTile.prev2 }) }
                });
          }.bind(this);
            logAction();
          /*MarkovGame.model.dgApi.doCommand("logAction",
                                 {
                                   formatStr: "dragWeight: " +
                                              JSON.stringify( { from: tTile.prev2, to: this_.dragOverTile.prev2 })
                                 });*/
        }
        else {
          this_.draggedWeight.animate({ transform: this_.dragSavedTransform }, 200, '<>');
          tTile.strat.weight++;
          tTile.weightsCover.toFront();
          tTile.numWeights.attr('text', tTile.strat.weight);
        }
        this_.draggedWeight = null;
      }
    }

    function hoverWtIn() {
      if( tTile.strat.weight > 1) {
        tTile.weightsCover.attr('cursor', 'move');
      }
    }

    function hoverWtOut() {
      tTile.weightsCover.attr('cursor', 'default');
    }

    // Body of setupTile
    tTile.prev2 = iPrev2;
    tTile.strat = iTileStrat;
    tTile.rect = tPaper.rect( tLeft, tTop, kWidth, kHeight)
                      .attr( {fill: (tTile.strat.move === '') ? this_.kNormalFill : this_.kStratFill,
                              'stroke-width': 0 } );
    drawPrev2Tiles();
    drawMoveTiles();
    drawWeightRow();
    drawMessage();
    drawStrategyBorder();
    tTile.cover = tTile.rect.clone().attr({ fill: this_.kTranslucent })
                    .hover( hoverIn, hoverOut)
                    .click( clickTile);
    tTile.weightsCover = tPaper.rect( 0, 0, 0, 0)
                           .attr( tTile.weightsRect)
                           .attr({ fill: this_.kTranslucent, cursor: 'move', 'stroke-width': 0 })
                           .hover( hoverWtIn, hoverWtOut)
                           .drag( dragWtMove, dragWtStart, dragWtEnd);

    this_.tiles[ iRow] [ iCol] = tTile;
  }

  this.tiles = [ [], [], []]; // 3x3 array
  KCPCommon.forEach( this.strategy, function( iKey, iValue) {
    setupTile( kMapping[iKey][0], kMapping[iKey][1], iKey, iValue);
  });

  tProtoTile.remove();
  tProtoLetter.remove();
  tProtoBorder.remove();
  tProtoWeight.remove();
}