"use strict";

function FargoModel()
{
  this.eventDispatcher = new EventDispatcher();

  // "welcome" or "playing" or "gameEnded"
  this.currentState = "welcome";

  // DG vars
  this.openGameCase = null;

  // game vars
  this.gameNumber = 0;
  this.turnNumber = 0;
  this.isSelling = true;
  this.price = 0;
  this.money = 0;
  this.income = 0;
  this.totalCustomers = 0;
  this.totalFlats = 0;
  this.totalRevenue = 0;

  // turn vars
  this.currentNumCustomers = 0;
  this.currentNumFlats = 0;
  this.profit = 0;
  this.moneyGained = 0;
  this.moneyLost = 0;
  this.turnFinished = true;

  this.timeoutID = null;
}

FargoModel.prototype.initialize = async function()
{
  let interactiveState = codapInterface.getInteractiveState();

  // Create the dataset if it doesn't already exist
  const iResult = await codapInterface.sendRequest({
    action: 'get',
    resource: 'dataContextList'
  });
  if (iResult.success && !iResult.values.some(ds => [ds.name, ds.title].includes("Games/Turns"))) {
    await codapHelper.createDataset({
      name: "Games/Turns",
      collections: [
        {
          name: "Games",
          title: "Games",
          attrs: [
            {name: "game", type: 'numeric', precision: 0, defaultMin: 1, defaultMax: 5, description: "game number"},
            {name: "lastPrice", type: 'numeric', precision: 2, defaultMin: 0, defaultMax: 1, description: "premium price on last turn of game"},
            {name: "endBalance", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 3500, description: "dollars available at end of game"},
            {name: "totalCust", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 5000, description: "how many customers bought insurance altogether"},
            {name: "totalFlats", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 20, description: "how many flats there were altogether"}
          ],
          defaults: {
            xAttr: "lastPrice",
            yAttr: "endBalance"
          }
        },
        {
          name: "Turns",
          title: "Turns",
          parent: "Games",
          attrs: [
            {name: "turn", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 10, description: "which of the 10 turns that make up a game"},
            {name: "balance", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 1000, description: "dollars available at end of turn"},
            {name: "price", type: 'numeric', precision: 2, defaultMin: 0, defaultMax: 1, description: "price of a policy"},
            {name: "customers", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 1000, description: "how many policies sold in this turn"},
            {name: "revenue", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 500, description: "total amount taken in during this turn"},
            {name: "flats", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 10, description: "number of customers who had a flat"},
            {name: "payout", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 500, description: "amount paid to cover flat tires"},
            {name: "do", type: 'categorical', description: "was this turn a 'watch' or a 'sell'"}
          ],
          labels: {
            singleCase: "turn",
            pluralCase: "turns",
            singleCaseWithArticle: "a turn",
            setOfCases: "game",
            setOfCasesWithArticle: "a game"
          },
          defaults: {
            xAttr: "turn",
            yAttr: "balance"
          }
        }
      ],
      type: 'DG.GameContext',
    });
  }

  notificatons.registerForDocumentChanges();
  if (interactiveState) {
    this.restoreGameState(interactiveState);
  }
};

FargoModel.prototype.openNewGameCase = async function()
{
  // Open a new Game case, if necessary
  if( !this.openGameCase) {
    await codapInterface.sendRequest({
      action: 'create',
      resource: "dataContext[Games/Turns].collection[Games].case",
      values: [
        {
          values: {
            game: this.gameNumber,
            lastPrice: 0,
            endBalance: 0,
            totalCust: 0,
            totalFlats: 0
          }
        }
      ]
    }).then(function(iResult) {
      if(iResult.success) {
        this.openGameCase = iResult.values[0].id;
        console.log("openGameCase ID is " + iResult.values[0].id);
      } else {
        console.log("Fargo: Error creating new game case");
      }
    }.bind(this));
  }
};

FargoModel.prototype.addTurnCase = async function()
{
  // Variables that remain undefined will be handled as empty in DG
  var action = "Watch";
  if( this.isSelling) {
    action = "Sell";
  }

  var values = {
    turn: this.turnNumber,
    balance: this.money,
    price: this.price,
    customers: this.currentNumCustomers,
    revenue: this.moneyGained,
    flats: this.currentNumFlats,
    payout: this.moneyLost,
    do: action
  };

  if (this.turnNumber === 1) {
    // Update the auto-created first turn case
    var iResult = await codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContext[Games/Turns].collection[Games].caseByID[' + this.openGameCase + ']'
    });
    if (iResult.success) {
      var idOfFirstTurnCase = iResult.values.case.children[0];
      await codapInterface.sendRequest({
        action: 'update',
        resource: "dataContext[Games/Turns].collection[Turns].caseByID[" + idOfFirstTurnCase + "]",
        values: {
          values: values
        }
      });
    } else {
      console.log("Fargo: Error finding existing turn case");
    }
  } else {
    // Create a new Turn case
    await codapInterface.sendRequest({
      action: "create",
      resource: "dataContext[Games/Turns].collection[Turns].case",
      values: [
        {
          parent: this.openGameCase,
          values: values
        }
      ]
    });
  }
};

FargoModel.prototype.addGameCase = async function()
{
  var iResult = await codapInterface.sendRequest({
    action: 'update',
    resource: `dataContext[Games/Turns].collection[Games].caseByID[${this.openGameCase}]`,
    values: {
      values: {
        game: this.gameNumber,
        lastPrice: this.price,
        endBalance: this.money,
        totalCust: this.totalCustomers,
        totalFlats: this.totalFlats
      }
    }
  });
  if(!iResult.success) {
    console.log("Fargo: Error updating game case");
  }

  this.openGameCase = null;
};

FargoModel.prototype.resetGame = function()
{
  this.profit = 0;
  this.currentNumCustomers = 0;
  this.currentNumFlats = 0;
};

FargoModel.prototype.updateView = function()
{
  var e = new Event("onFargoModelUpdated");
  e.currentState = this.currentState;
  e.gameNumber = this.gameNumber;
  e.turnNumber = this.turnNumber;
  e.isSelling = this.isSelling;
  e.price = Math.round(this.price * 100) / 100;
  e.profit = this.profit;
  e.money = this.money;
  e.currentNumCustomers = this.currentNumCustomers;
  e.currentNumFlats = this.currentNumFlats;
  e.totalFlats = this.totalFlats;
  e.income = this.income;
  e.totalCustomers = this.totalCustomers;
  e.totalRevenue = this.totalRevenue;

  this.eventDispatcher.dispatchEvent(e);
};

FargoModel.prototype.incrementPrice = function()
{
  var this_ = this;
  this.price += 0.01;
  this.updateView();

  this.endPriceChange();
  this.timeoutID = setTimeout( function() {
      this_.continuePriceChange( 0.01);
    },
    500);
};

FargoModel.prototype.decrementPrice = function()
{
  var this_ = this;
  this.price -= 0.01;
  if(this.price < 0)
    this.price = 0;
  this.updateView();

  this.endPriceChange();
  this.timeoutID = setTimeout( function() {
      this_.continuePriceChange( -0.01);
    },
    500);
};

FargoModel.prototype.endPriceChange = function()
{
  if( this.timeoutID !== null) {
    clearTimeout( this.timeoutID);
    this.timeoutID = null;
  }
};

FargoModel.prototype.continuePriceChange = function( iIncrement) {
  var this_ = this;
  this.price += iIncrement;
  if(this.price < 0)
    this.price = 0;
  this.updateView();

  this.timeoutID = setTimeout( function() {
      this_.continuePriceChange( iIncrement);
    },
    100);
};

FargoModel.prototype.playGame = async function()
{
  this.gameNumber++;

  await this.openNewGameCase();

  if (this.gameNumber === 1)
  {
    this.setIsSelling(false);
  } else
  {
    this.setIsSelling(this.isSelling);
  }

  this.moneyGained = 0;
  this.moneyLost = 0;
  this.totalCustomers = 0;
  this.totalFlats = 0;
  this.totalRevenue = 0;

  this.currentState = "playing";
  this.money = 0;
  this.currentNumCustomers = 0;
  this.currentNumFlats = 0;
  this.profit = 0;
  this.turnNumber = 0;
  this.updateView();
  this.updateInteractiveState();
};

FargoModel.prototype.doTurn = function()
{
  if( this.isSelling)
    this.currentNumCustomers = this.howManyCustomers(this.price);
  else
    this.currentNumCustomers = FargoSettings.baseNumberOfCars;

  this.currentNumFlats = this.howManyFlats(this.currentNumCustomers);

  if (this.isSelling)
  {
    // calculate the money
    this.moneyGained = this.currentNumCustomers * this.price;
    this.totalRevenue += this.moneyGained;
    this.moneyLost = this.currentNumFlats * FargoSettings.tireCost;
    this.profit = this.moneyGained - this.moneyLost;
    this.money += this.profit;

    this.totalCustomers += this.currentNumCustomers;
    this.totalFlats += this.currentNumFlats;
  } else
  {
    this.moneyGained = 0;
    this.moneyLost = 0;
    this.profit = 0;
  }

  this.turnFinished = false;
};
//finishTurn is called within the model as game is finish, and also called by an html Event Handler at every turn
FargoModel.prototype.finishTurn = function()
{
  this.turnFinished = true;
  this.addTurnCase();
};

FargoModel.prototype.watch = function()
{
  this.setIsSelling( false);
  this.playTurn();
};

FargoModel.prototype.sell = function()
{
  this.setIsSelling( true);
  this.playTurn();
};

FargoModel.prototype.playTurn = function()
{
  if (this.turnFinished)
  {
    this.turnNumber++;
    this.doTurn();

    if (this.turnNumber === FargoSettings.turnsPerGame)
    {
      // done with game
      this.finishTurn();
      this.turnNumber = 0;
      this.endGame();
      this.resetGame();
    }

    this.setIsSelling(this.isSelling);

    this.updateView();
  }
};

FargoModel.prototype.endGame = function()
{
  this.addGameCase();
  this.currentState = 'gameEnded';
};

FargoModel.prototype.autoplayGame = function()
{
  if (this.turnFinished)
  {
    this.setIsSelling( true);
    for (var i = this.turnNumber; i<FargoSettings.turnsPerGame; i++)
    {
      this.turnNumber++;
      this.doTurn();
      this.finishTurn();
    }
    this.turnNumber = 0;

    this.endGame();

    this.updateView();
  }
};

FargoModel.prototype.handleGameButton = function()
{
  if( this.openGameCase) {
    // We end the game
    this.endGame();
    this.updateView();
  }
  else {
    // We start a new game
    this.playGame();
  }
};

FargoModel.prototype.setIsSelling = function(value)
{
  this.isSelling = value;

  if (this.turnFinished)
  {
    this.updateView();
  }
};

FargoModel.prototype.setPrice = function(value)
{
  // convert value into float
  value = value.replace('$', '');
  this.price = parseFloat(value);
  if (!this.price
    || this.price < 0)
  {
    this.price = 0;
  }

  this.setIsSelling(this.isSelling);

  if (this.turnFinished)
  {
    this.updateView();
  }
};

FargoModel.prototype.howManyCustomers = function(price)
{
  var numCustomers = Math.round(-FargoSettings.baseNumberOfCars * price + FargoSettings.baseNumberOfCars);

  if (numCustomers < 0)
  {
    numCustomers = 0;
  }

  return numCustomers;
};

FargoModel.prototype.howManyFlats = function(numCustomers)
{
  var numFlats = 0;
  for (var i = 0; i<numCustomers; i++)
  {
    if (Math.random() < FargoSettings.baseEventProb)
    {
      numFlats++;
    }
  }
  return numFlats;
};

/**
 * Push the current state to codapInterface for automatic save/restore.
 */
FargoModel.prototype.updateInteractiveState = function() {
  var currentInteractiveState = {
    gameNumber: this.gameNumber,
    price: this.price
  };
  codapInterface.updateInteractiveState(currentInteractiveState);
};

/**
  Restores the game state for the game.
  @param    {Object}    iState -- The state as saved previously by updateInteractiveState().
 */
FargoModel.prototype.restoreGameState = function( iState) {
  if( iState) {
    if( iState.gameNumber)
      this.gameNumber = iState.gameNumber;
    if( iState.price)
      this.price = iState.price;
    if (this.gameNumber > 0) {
      this.currentState = 'gameEnded';
    }
  }
  return { success: true };
};
