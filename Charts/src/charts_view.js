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
  contextCountHandler: function(sender, args){
    console.log(args.name);
    addContextDOM(args.name);
  }
}
function addContextDOM(context){
  var $unList = $("<ul>", {'id': 'context', 'class':'view-context-list'});
  $unList.css("background-color", 'lightblue');
  $unList.hover(
    function(){ $(this).css("background-color", "white"); },
    function(){ $(this).css("background-color", "lightblue"); }
  );
  $unList.text(context);
  $('#contextList').append($unList);

}
