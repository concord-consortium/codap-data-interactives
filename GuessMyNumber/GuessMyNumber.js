/* jshint indent: false, strict: false, quotmark: false, browser: true, devel: true */
/* globals iframePhone */
var GuessMyNumber = {

  codapPhone: null,

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

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function() {}, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "Guess My Number",
        version: "1.1",
        dimensions: { width: 400, height: 250 },
        collections: [
          {
            name: "Games",
            attrs: [
              { name: "game", type: 'numeric', description: "The game number", precision: 0 },
              { name: "guesses", type: 'numeric', description: "The number of guesses", precision: 0 }
            ],
            childAttrName: "Trials",
            labels: {
              singleCase: "game",
              pluralCase: "games",
              singleCaseWithArticle: "a game",
              setOfCases: "match",
              setOfCasesWithArticle: "a match"
            }
          },
          {
            name: "Trials",
            attrs: [
              { name: "trial", type: 'numeric', description: "The trial number", precision: 0 },
              { name: "guess", type: 'numeric', description: "The number guessed", precision: 0 },
              { name: "result", type: 'nominal', description: "The result of the trial" }
            ],
            labels: {
              singleCase: "trial",
              pluralCase: "trials",
              singleCaseWithArticle: "a trial",
              setOfCases: "game",
              setOfCasesWithArticle: "a game"
            },
            defaults: {
              xAttr: "trial",
              yAttr: "guess"
            }
          }
        ]
      }
    }, function() {
      this.setupNewGame();
    }.bind(this));
  },

  addCase: function(callback) {

    var createCase = function() {
      this.codapPhone.call({
        action: 'createCase',
        args: {
          collection: "Trials",
          parent: this.openRoundID,
          values: [ this.trialNum, this.guess, this.result ]
        }
      });
      callback();
    }.bind(this);

    if( ! this.openRoundID ) {
      // Start a new Games case if we don't have one open
      this.codapPhone.call({
          action: 'openCase',
          args: {
            collection: "Games",
            values: [ this.gameNum, this.trialNum ]
          }
        }, function(result) {
          if( result.success) {
            this.openRoundID = result.caseID;
            createCase();
          } else {
            console.log("GuessMyNumber: Error calling 'openCase'"); // alert the user? Bail?
          }
        }.bind(this));
    } else {
      this.codapPhone.call({
        action: 'updateCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [ this.gameNum, this.trialNum ]
        }
      }, createCase);
    }
  },

  addGame: function() {
    if (this.openRoundID) {
      this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [ this.gameNum, this.trialNum ]
        }
      });
      // Since we are assuming closeCase will succeed, immediately forget the previously open round.
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

  processGuess: function(iGuess, callback) {

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
    else {
      this.result = "Guess again";
    }

    this.addCase(callback);
  },

  userGuess: function(){
    var guess = Number(document.forms.form1.num.value);
    document.forms.form1.enter.disabled = true;

    this.processGuess(guess, function() {
      alert(this.result);
      document.forms.form1.enter.disabled = false;

      if (guess === this.secret) {
        this.addGame();
        this.setupNewGame();
      }
    }.bind(this));
  },

  autoGuess: function() {

    var makeNextGuess = function() {
      var currRange = this.currRangeMax - this.currRangeMin;
      var guess = this.currRangeMin + Math.floor(Math.random() * currRange);

      this.processGuess(guess, function() {
        if (this.guess === this.secret) {
          this.addGame();
          this.setupNewGame();
        } else {
          makeNextGuess();
        }
      }.bind(this));

    }.bind(this);

    makeNextGuess();
  }
};

GuessMyNumber.initGame();
GuessMyNumber.chooseNumber();
