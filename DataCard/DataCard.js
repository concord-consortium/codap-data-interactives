/* jshint indent: false, strict: false, quotmark: false, browser: true, devel: true */
/* globals iframePhone */
var DataCard = {

  codapPhone: null,
  context: null,

  logMessage: function (message) {
    console.log(message);
  },

  logResult: function (result) {
    this.logMessage('result: ' + (result && JSON.stringify(result)));
  },

  connect: function () {
    // Invoke the JavaScript interface
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function () {
    }, "data-interactive", window.parent);


    this.codapPhone.call({
      action: 'create',
      what: {
        type: 'interactiveFrame'
      },
      values: {
        title: 'Data Card',
        version: '0.1',
        dimensions: {
          width: 400,
          height: 200
        }
      }
    }, function (result) {
      this.logResult(result);
      if (result && result.success) {
        this.addContext(this.logResult.bind(this));
      }
    }.bind(this));
  },

  addContext: function (callback) {
    this.codapPhone.call({
      action: 'create',
      what: {
        type: 'dataContext'
      },
      values: {
        identifier: "DataCard",
        title: "Data Card",
        description: "Displays individual items in a set of data, one item at a time.",
      }
    }, callback);
  },

  addCase: function (callback) {

    var createCase = function () {
      this.codapPhone.call({
        action: 'createCase',
        args: {
          collection: "Trials",
          parent: this.openRoundID,
          values: [this.trialNum, this.guess, this.result]
        }
      });
      callback();
    }.bind(this);

    if (!this.openRoundID) {
      // Start a new Games case if we don't have one open
      this.codapPhone.call({
        action: 'openCase',
        args: {
          collection: "Games",
          values: [this.gameNum, this.trialNum]
        }
      }, function (result) {
        if (result.success) {
          this.openRoundID = result.caseID;
          createCase();
        } else {
          console.log("DataCard: Error calling 'openCase'"); // alert the user? Bail?
        }
      }.bind(this));
    } else {
      this.codapPhone.call({
        action: 'updateCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [this.gameNum, this.trialNum]
        }
      }, createCase);
    }
  },

  addGame: function () {
    if (this.openRoundID) {
      this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Games",
          caseID: this.openRoundID,
          values: [this.gameNum, this.trialNum]
        }
      });
      // Since we are assuming closeCase will succeed, immediately forget the previously open round.
      this.openRoundID = null;
    }
  },

  doSubmit: function() {
    var tCollName = document.forms.form1.collName.value;
    var tRows = document.getElementById("card").rows,
        tRowIndex = 1,
        tCase = {};
    for( tRowIndex = 1; tRowIndex < tRows.length; tRowIndex++) {
        var tRow = tRows[ tRowIndex];
        tCase[ tRow.cells[0].innerHTML.trim()] = tRow.cells[1].innerHTML.trim();
    }
    console.log( tCollName);
    console.log( tCase);
  }
};

DataCard.connect();

