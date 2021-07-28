function FargoView()
{
	this.eventDispatcher = new EventDispatcher();
	this.lastTurn = -1;
	this.numCars = 0;
	this.numFlats = 0;
	this.numProfit = 0;
	this.numMoney = 0;
}

FargoView.prototype.updateTurnNumber = function( iTurn)
{
  document.getElementById("turn").innerHTML = "Turn " + iTurn + "/" + FargoSettings.turnsPerGame;
}

FargoView.prototype.updateProfit = function( iProfit)
{
  var tSrc = '',
      tVisible = true;
	if (iProfit < 0)
    tSrc = "img/deficit.png";
  else if( iProfit > 0)
    tSrc = "img/profit.png";
  else
    tVisible = false;

  document.getElementById("moneyChangeImage").src = tSrc;
	document.getElementById("numProfit").innerHTML = KCPCommon.formatCurrency( iProfit);
  KCPCommon.setElementVisibility( "moneyChangeImage", tVisible);
}

FargoView.prototype.updateFeedback = function()
{
  document.getElementById("numCars").innerHTML = this.numCars;
	document.getElementById("numFlats").innerHTML = this.numFlats;
  this.updateProfit( this.numProfit);
  document.getElementById("numMoney").innerHTML = KCPCommon.formatCurrency( this.numMoney);
}

FargoView.prototype.drawCars = function(numCustomers, numFlats)
{
	this.currentDrawCarsJob = new DrawCarsJob(numCustomers, numFlats, this.carPaper, this);
	this.currentDrawCarsJob.start();
}

FargoView.prototype.initialize = function()
{
	var carCanvasElement = document.getElementById("carCanvas");

	this.carPaper = new Raphael(carCanvasElement, carCanvasElement.clientWidth, carCanvasElement.clientHeight);
}

FargoView.prototype.update = function(updateEvent)
{
	this.carPaper.clear();
	
	this.numCars = updateEvent.currentNumCustomers;
	this.numFlats = updateEvent.currentNumFlats;
	this.numProfit = Math.round(updateEvent.profit * 100) / 100;
	this.numMoney = Math.round(updateEvent.money * 100) / 100;
	
	currentState = updateEvent.currentState;
	if (currentState == "welcome")
	{
    KCPCommon.setElementVisibility("welcome_panel", true);
    KCPCommon.setElementVisibility("control_panel", false);
    KCPCommon.setElementVisibility("control_cover", false);
    KCPCommon.setElementVisibility("gamebox", false);
    KCPCommon.setElementVisibility("resultsbox", false);
    KCPCommon.setElementVisibility("storybox", true);
    KCPCommon.setElementVisibility("zeroCustomers", false);
	} else if( currentState == "gameEnded")
  {
    KCPCommon.setElementVisibility("resultsbox", true);
    KCPCommon.setElementVisibility("control_cover", true);
    KCPCommon.setElementVisibility("storybox", false);
    this.updateResultsBox(updateEvent);
    document.getElementById("game_button" ).innerHTML = "New Game";
    KCPCommon.setElementVisibility("zeroCustomers", false);
  }
  else if (currentState == "playing")
	{
    KCPCommon.setElementVisibility("welcome_panel", false);
    KCPCommon.setElementVisibility("resultsbox", false);
    KCPCommon.setElementVisibility("control_cover", false);
    KCPCommon.setElementVisibility("storybox", false);
    KCPCommon.setElementVisibility("control_panel", true);
    KCPCommon.setElementVisibility("gamebox", true);
    KCPCommon.setElementVisibility("outercontrols", true);

		if (updateEvent.turnNumber == 0)
			this.updateFeedback();

    document.getElementById("game_button" ).innerHTML = "End Game";
    KCPCommon.setElementVisibility("zeroCustomers", (updateEvent.turnNumber > 0) && (updateEvent.currentNumCustomers === 0));

	} else
	{
		// error
	}
	
	// update price text box
	document.getElementById("price_input_box").value = KCPCommon.formatCurrency( updateEvent.price);
	
	// update next turn
	var nextTurn = updateEvent.turnNumber + 1;
	this.updateTurnNumber( nextTurn);
	
	if (this.lastTurn != updateEvent.turnNumber
		&& updateEvent.turnNumber > 0)
	{
		this.drawCars(updateEvent.currentNumCustomers, updateEvent.currentNumFlats);
	}
	this.lastTurn = updateEvent.turnNumber;

  // Update the game number
  document.getElementById("gameNum" ).innerHTML = updateEvent.gameNumber;
}

FargoView.prototype.updateResultsBox = function(updateEvent)
{
  function formatMoney( iAmount) {
    return KCPCommon.formatCurrency( iAmount);
  }

  document.getElementById("result_gameNumber").innerHTML = updateEvent.gameNumber;
  document.getElementById("result_customers").innerHTML = updateEvent.totalCustomers;
  document.getElementById("result_revenue").innerHTML = formatMoney( updateEvent.totalRevenue);
  document.getElementById("result_flats").innerHTML = updateEvent.totalFlats;
  document.getElementById("result_flatsCost").innerHTML = formatMoney( updateEvent.totalFlats * FargoSettings.tireCost);
  document.getElementById("result_endingBalance").innerHTML = formatMoney( updateEvent.money);
	document.getElementById("result_lastPrice").innerHTML = formatMoney(updateEvent.price);

  this.updateFeedback();
  this.updateTurnNumber( updateEvent.turnNumber);
}

// handles the asynchronous drawing of the cars
function DrawCarsJob(numCustomers, numFlats, carPaper, view)
{
	this.numCustomers = numCustomers;
  this.carsProcessed = 0;
	this.numFlats = numFlats;
	this.carPaper = carPaper;
	this.view = view;
	
	this.done = false;

  this.kCarWidth = 30;
  this.kCarHeight = 10;
  this.kNumLanes = Math.floor( this.carPaper.height / (this.kCarHeight + 4));

  this.rtCar = carPaper.image( 'img/car_rt.png', -this.kCarWidth, 0, this.kCarWidth, this.kCarHeight);
  this.lftCar = carPaper.image( 'img/car_lft.png', this.carPaper.width, 0, this.kCarWidth, this.kCarHeight);

	this.flats = new Array();
  var flatNum;
	for (var i=0; i<numFlats; i++)
	{
		do
		{
			flatNum = Math.round(Math.random() * numCustomers);
			
		} while(this.flats.indexOf(flatNum) != -1);
		this.flats.push(flatNum);
	}
}

DrawCarsJob.prototype.start = function()
{
	this.carPaper.clear();
	doDrawCarsJobIteration(this);
}

DrawCarsJob.prototype.finish = function()
{
  this.view.updateFeedback();

	var e = new Event("onFinishTurn");
  this.carsProcessed = 0;

	this.view.eventDispatcher.dispatchEvent(e);
}

function doDrawCarsJobIteration(job)
{
  var kRtFlatSrc = "img/car_flat_rt.png",
      kLftFlatSrc = "img/car_flat_lft.png";

  function removeCar() {
    this.remove();
  }

  function handleRightFacingFlat() {
    this.attr({ src: kRtFlatSrc })
      .transform('s2');
  }

  function handleLeftFacingFlat() {
    this.attr({ src: kLftFlatSrc })
      .transform('s2');
  }

  if( job.carsProcessed < job.numCustomers) {
    for( var i = 0; (i < job.kNumLanes) && (job.carsProcessed < job.numCustomers); i++) {
      var tIsFlat = job.flats.indexOf( job.carsProcessed) !== -1,
          tFlatCorrection = tIsFlat ? Math.random() : 0,
          tFaceRight = (i >= job.kNumLanes / 2),
          tLane = i % (job.kNumLanes / 2),
          tLaneWidth = (job.carPaper.height - 10) / job.kNumLanes,
          tY = (tFaceRight ? job.carPaper.height / 2 + 5 : 0) + (tLane + 0.2) * tLaneWidth,
          tStop = tFaceRight ? (1 - tFlatCorrection) * job.carPaper.width :
                                -job.kCarWidth + tFlatCorrection * job.carPaper.width,
          tCar = tFaceRight ? job.rtCar : job.lftCar,
          tCompletion = (tIsFlat) ? (tFaceRight ? handleRightFacingFlat : handleLeftFacingFlat) : removeCar;
       tCar.clone()
            .attr( { y: tY })
            .animate( {x: tStop }, 1000 + 1000 * Math.random(), tCompletion)
            .toBack();
      job.carsProcessed++;
    }
    setTimeout(function() { doDrawCarsJobIteration(job); }, 35);
  }
  else {
    job.finish();
  }
}
