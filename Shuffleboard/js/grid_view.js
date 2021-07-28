// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines GridView - Shows the background on which the disks slide
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper {Paper}
 * @param iLayout {Object}
 * @constructor
 */
function GridView( iPaper, iLayout)
{
  this.gamePaper = iPaper;
  this.layout = iLayout;
}

/**
 * Just create the Raphael elements that display the grid
 */
GridView.prototype.initialize = function()
{
  this.gamePaper.image('img/wood.jpg',
                                    this.layout.boardLeft - 1 + this.layout.tileGap, this.layout.boardTop,
                                    500, this.layout.tileHeight);
// Draw and label the grid lines
  for( var i = 0; i < 11; i++) {
    var tX = this.layout.boardLeft + i * (this.layout.tileWidth + this.layout.tileGap);
    this.gamePaper.path('M ' + tX + ' ' + this.layout.boardTop + ' v' + this.layout.tileHeight)
      .attr({ stroke: 'white'});
    if( i < 10)
      this.gamePaper.text( tX, this.layout.boardTop + this.layout.tileHeight + 10, i * 50)
        .attr({ fill: 'yellow', 'font-size': 14});
  }

};

