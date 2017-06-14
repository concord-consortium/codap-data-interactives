var info = {
  graph : ['bar', 'pie', 'doughnut','line', 'radar', 'polarArea','bubble', 'scales'],
  getGraphsList: function(){
    var charts = document.getElementById('select-chart');
    charts.innerHTML = "";
    info.graph.forEach(function (g) {
      charts.innerHTML += '<option value="' + g + '">' + g + "</option>";
    });
  }
};
var selected;

// initialize the codapInterface
codapInterface.init({
    name: 'Graphs',
    dimensions: {width: 700, height: 500},
    title: 'Graphs',
    version: '0.1',
}).then(function(iResult){
  selected = codapInterface.getInteractiveState();
  if(!selected.graph){
    console.log("hre");
    selected.graph = "bar";
  }
  if(!selected.data || !selected.attributeList){
    selected.data = [];
    selected.attributeList = [];
    initChart();
  }
  else{
    chart.draw();
  }
  // loadInitialSettings();
});

// pulll intiail data from CodapInterface
function getInitialData(){
  var contextUI = document.getElementById('contextList');
  contextUI.innerHTML = "";
  //get list of dataContext from CODAP
  getData().then(function(contextList){
    //for each context populate attributes
    contextList.forEach(function(context){
      addContextToList(context.name);
      getData(context.name).then(function(collectionList){
        populateContextFromCollectionList(collectionList, context.name);
      });
    });
  });
}
function addContextToList(context){
  var contextUI = document.getElementById('contextList');
  var newItem = document.createElement('ul');
  newItem.className = context;
  newItem.id = context;
  newItem.appendChild(document.createTextNode(context));
  newItem.onclick= function(){
    $(newItem).children().toggle("fast"); //switches display from none to initial
  };
  addContextListeners(context);
  contextUI.appendChild(newItem);
}
function addContextListeners(context){
  codapInterface.on('dataContextChangeNotice['+context+']', 'createCollection',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'deleteCollection',
    function(){deleteCollection(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'moveAttribute',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'createAttributes',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'updateAttributes',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'deleteAttributes',
    function(){updateContextAttribtueList(context)});
}
function populateContextFromCollectionList(collectionList, context){
  var count = 0;
  var total = collectionList.length;
  collectionList.forEach(function(collection){
    var color = "rgba(70, 130, 170, "+ (.75-(count/total))+")";
    count+=1;
    getData(context, collection.name).then(function(attributeList){
      attributeList.forEach(function(attribute){
        // addAttributesToContext(attribute.name, collection.name, context);
        addAttributesToContext(attribute.name, collection.name, context, color);
      });
    });
  });
}
function addAttributesToContext(attribute, collection, context, color){
  var attributeList = document.getElementById(context);
  var newItem = document.createElement('li');
  if (selected.context == context){
    newItem.className = collection;
  }else{
    newItem.className = collection +' hidden';
  }
  newItem.id = attribute;
  newItem.appendChild(document.createTextNode(attribute));
  newItem.onclick = function(event){
    event.stopPropagation();
    getData(context, collection, attribute).then(
      function(caseList){
        populateData(caseList, attribute);
        getNewColors();
        chart.draw();
    });
    codapInterface.on('dataContextChangeNotice['+context+']', 'updateCases', function(){
      getData(context, collection, attribute).then(
        function(caseList){
          populateData(caseList, attribute);
          chart.draw();
      });
    });
    selected.context = context;
    selected.collection = collection;
    selected.attribute = attribute;
  }
  if(arguments.length == 4){
    newItem.style.backgroundColor = color;
    $(newItem).mouseenter(function() {
    $(this).css("background", "white");
}).mouseleave(function() {
     $(this).css("background", color);
});
  }
  attributeList.appendChild(newItem);
}
function getData(context, collection, attribute){
  var src = "";
  switch (arguments.length){
    case 1:
      src = 'dataContext[' + context +'].collectionList';
      break;
    case 2:
      src = 'dataContext[' + context +'].collection[' + collection + '].attributeList';
      break;
    case 3:
      src = 'dataContext[' + context +'].collection['+ collection + '].caseSearch['
                                                              + attribute +' != \'\']';
      break;
    default:
      src = 'dataContextList';
  }  return new Promise(function(resolve, reject){
      codapInterface.sendRequest({
        action: 'get',
        resource: src,
      }, function(result) {
        if (result && result.success) {
          resolve(result.values);
        } else {
          resolve([]);
        }
      });
    });
}

function populateData(cases, attribute){
  var attMembers = [];
  var attCount = [];

  cases.forEach(function(val){
    var att = val.values[attribute];
    var contains = false, index = 0;
    for(i = 0; i < attMembers.length; i++){
      if (att == attMembers[i]){
        contains = true;
        index = i;
      }
    }
    if (contains){
      attCount[index] += 1;
    }
    else {
      attCount.push(1);
      attMembers.push(att);
    }
  });
  selected.attributeList = attMembers;
  selected.data = attCount;
}
function getNewColors(){
  var colors = [];
  var backgroundColor = [];
  for (var i = 0; i < selected.data.length; i++) {
    var r = Math.floor( 200 * Math.random()) + 55;
    var g = Math.floor( 200 * Math.random()) + 55;
    var b = Math.floor( 200 * Math.random()) + 55;
    colors.push('rgba('+r+','+g+ ',' +b+ ',1)');
    backgroundColor.push('rgba('+(r-40)+ ','+(g-40)+ ',' +(b-40)+ ',.8)')
  }
  selected.colors = colors;
  selected.backgroundColor = backgroundColor;
}
function listenToChanges(){
	codapInterface.on('documentChangeNotice', 'dataContextCountChanged', updateDataContext);
  var info = document.getElementById('info');
  var modal = document.getElementById('authorinfo');
  info.onclick = function(){
    $(modal).fadeIn("fast");
  };
  var close = document.getElementById('close-author');
  close.onclick = function(){
    $(modal).fadeOut("fast");
  };

}

/*
  Change listeners
*/
function updateDataContext(){
  getData().then(function(contextList){
    contextList.forEach(function(context){
      if($('#contextList').children("#"+context.name).length == 0){
        addContextToList(context.name);
        getData(context.name).then(function(collectionList){
          populateContextFromCollectionList(collectionList, context.name);
        });
      }
    });
  });
}

function updateContextAttribtueList(context){
  getData(context).then(function(collectionList){
    var contextUI = document.getElementById(context);
    $('#'+context).empty();
    contextUI.appendChild(document.createTextNode(context));
    populateContextFromCollectionList(collectionList, context);
  }, function(error){

  });
}
function deleteCollection(context){
  getData(context).then(function(collectionList){
    var toDelete = $("#"+context).children();
    var newList = collectionList.map(function(col){ return col.title})
    for (var i = 0; i < toDelete.length; i++) {
      var coll = $(toDelete[i]).attr('class').split(' ')[0];
      if(!newList.includes(coll.toString())){
        $('.'+coll.toString()).slideUp("slow", function(){$(this).remove()});
      }
    }
  });
}
