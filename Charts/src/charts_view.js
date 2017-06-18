var ChartView = function(){
  this.contextCountChange = new Event(this);

  this.init(); //why initialize here???

};

ChartView.prototype = {
  init: function(){
    this.setUpHandlers()
  }

  setUpHandlers: function() {
    
  }
}
