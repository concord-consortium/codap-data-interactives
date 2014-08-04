
var GuessMyNumber = {

  controller: window.parent.DG.currGameController,
  
  absRangeMax: 101,
  
  gameNum: 0,
  secret: null,
  trialNum: 0,
  guess: null,
  result: null,
  
  currRangeMin: 0,
  currRangeMax: this.absRangeMax,
  
  chooseNumber: function() {
    this.secret = Math.floor(Math.random() * this.absRangeMax);
  },
  
  initGame: function() {

    // Invoke the JavaScript interface
    this.controller.doCommand( {
      action: 'initGame',
      args: {
        name: "Guess My Number",
        dimensions: { width: 400, height: 250 },
        collections: [
          {
            name: "Rounds",
            attrs: [  { name: "game", type: 'numeric', description: "The game number", precision: 0 },
                      { name: "guesses", type: 'numeric', description: "The number of guesses", precision: 0 }
                  ],
            childAttrName: "round"
          },
          {
            name: "Guesses",
            attrs: [  { name: "trial", type: 'numeric', description: "The trial number", precision: 0 },
                      { name: "guess", type: 'numeric', description: "The number guessed", precision: 0 },
                      { name: "result", type: 'nominal', description: "The result of the trial" }
                    ],
            defaults: {
              xAttr: "trial",
              yAttr: "guess"
            }
          }
        ]
      }
    });

    this.setupNewGame();
  },

  addCase: function() {
    var result;
    if( !this.openRoundID) {
      // Start a new Rounds case if we don't have one open
      result = this.controller.doCommand({
                            action: 'openCase',
                            args: {
                              collection: "Rounds",
                              values: [ this.gameNum, this.trialNum ]
                            }
                          });
      if( result.success)
        this.openRoundID = result.caseID;
      else
        console.log("GuessMyNumber: Error calling 'openCase'"); // alert the user? Bail?
    }
    else {
      result = this.controller.doCommand({
                            action: 'updateCase',
                            args: {
                              collection: "Rounds",
                              caseID: this.openRoundID,
                              values: [ this.gameNum, this.trialNum ]
                            }
                          });
    }

    this.controller.doCommand( {
      action: 'createCase',
      args: {
        collection: "Guesses",
        parent: this.openRoundID,
        values: [ this.trialNum, this.guess, this.result ]
      }
    });
  },
  
  addGame: function() {
    if( this.openRoundID) {
      this.controller.doCommand({
        action: 'closeCase',
        args: {
          collection: "Rounds",
          caseID: this.openRoundID,
          values: [ this.gameNum, this.trialNum ]
        }
      });
      this.openRoundID = null;
    }
  },

  setupNewGame: function() {
    this.gameNum++;
    
    this.chooseNumber();
    this.trialNum = 0;
    this.currRangeMin = 0;
    this.currRangeMax = this.absRangeMax;
  },
  
  processGuess: function( iGuess) {

    this.trialNum++;
    this.guess = iGuess;
  
    if (Number(iGuess) === this.secret) {
      this.result = "Got it!";
    }
    else if (iGuess < this.secret) {
      this.result = "Too low";
      this.currRangeMin = Math.max( this.currRangeMin, iGuess + 1);
    }
    else if (iGuess > this.secret) {
      this.result = "Too high";
      this.currRangeMax = Math.min( this.currRangeMax, iGuess - 1);
    }
    else
      this.result = "Guess again";

    this.addCase();
    
    return this.result;
  },

  userGuess: function(){
    var guess = Number(document.forms.form1.num.value);
  
    this.processGuess( guess);
    alert( this.result);

    if (guess === this.secret) {
      this.addGame();
      this.setupNewGame();
    }
  },
  
  autoGuess: function() {
    
    do {
      var currRange = this.currRangeMax - this.currRangeMin;
      var guess = this.currRangeMin + Math.floor(Math.random() * currRange);
      this.processGuess( guess);
      
    } while( this.guess !== this.secret);
    
    this.addGame();
    this.setupNewGame();
  }
};


GuessMyNumber.initGame();
GuessMyNumber.chooseNumber();

