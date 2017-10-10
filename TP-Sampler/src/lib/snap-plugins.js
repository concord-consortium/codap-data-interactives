define(['./snap.svg-min'], function (Snap) {

  Snap.plugin(function (Snap, Element) {

    Element.prototype.pause = function () {
      var anims = this.inAnim();
      for (var i = 0; i < anims.length; i ++) {
        anims[i].mina.pause();
      }
    };

    Element.prototype.resume = function () {
      var anims = this.inAnim();
      for (var i = 0; i < anims.length; i ++) {
        this.animate({ dummy: 0 } ,1);
        anims[i].mina.resume();
      }
    };

  });

  return Snap;
});
