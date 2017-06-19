var ChartView = function(model){
  this.model = model;
  // this.changeContextCountEvent = new Event(this);

  this.init();
};
ChartView.prototype = {
  init: function(){
    this.createChildren()
    .setupHandlers()
    .enable();
  },
  createChildren: function(){
    return this;
  },
  setupHandlers: function(){
    this.contextHandler = this.contextCountHandler.bind(this);
    return this;
  },
  enable: function(){
    this.model.changeContextCountEvent.attach(this.contextHandler);
    return this;
  },
  // this.handler = this.contextCountHandler.bind(this);
  contextCountHandler: function(){
    console.log("in the view handler");
  }
}
