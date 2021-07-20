/**
 * Created by evangelineireland on 9/4/14.
 */

//DG = window.parent.DG;

var PerformanceHarness = {

  codapPhone: null,

  trialNum: 0,
  gameNum: 0,
  startTime: null,


  initialize: function () {

    //Invoke the Javascript interface

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(
      function (iCmd, iCallback) { iCallback(); }, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "Performance Harness",
        dimensions: { width: 400, height: 250 },
        collections: [
          {
            name: "Tests",
            attrs: [
              { name: "test", type: 'numeric', precision: 0 },
              { name: "iterations", type: 'numeric', precision: 0 },
              { name: "totalTime", type: 'numeric', precision: 0 },
              { name: "avgRate", type: 'numeric', precision: 2 },
              { name: "delay", type: 'numeric', precision: 0}
            ],
            childAttrName: "events",
            defaults: {
              xAttr: "test",
              yAttr: "avgRate"
            }
          },
          {
            name: "Events",
            attrs: [
              { name: "trial", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 100 },
              { name: "randNum", type: 'numeric', precision: 2 },
              { name: "rate", type: 'numeric', precision: 2, defaultMin: 0, defaultMax: 60 },
              { name: "choice", type: 'nominal',
              colormap: { red: null, green: null }},
              { name: "signal", type: 'numeric', precision: 3, defaultMin: -1, defaultMax: 1 }
            ],
            defaults: {
              xAttr: "trial",
              yAttr: "rate"
            }
          }
        ]
      }
    }, function () {
      this.setupNewTest();
    }.bind(this));
  },

  setupNewTest: function () {
    console.log("In setupNewTest");
  },

  runTest: function () {
    var tNumTrials = Number(document.forms.form1.numTrials.value),
      tDelay = Number(document.forms.form1.delay.value),
      tProfile = document.forms.form1.profile.checked,
      tIndex = 0,
      tTime = Date.now(),
      this_ = this,
      result,
      openTestID;

    var updateTests = function () {
      this.codapPhone.call({
        action: 'updateCase',
        args: {
          collection: "Test",
          caseID: this.openTestID,
          values: [
            this.gameNum,
            this.trialNum,
            tTotalTime,
            this.trialNum * 1000 / tTotalTime,
            tDelay
          ]
        }
      }, function () {
        console.log("Updating parent case");
      });
    }.bind(this);

    var addNextCase = function () {
      var tNow = Date.now(),
        tRate = 1000 / (tNow - tTime),
        tChoice = (Math.random() < 1 / 3) ? 'red' : 'green',
        tSignal = Math.sin(2 * Math.PI * (tNow - this_.startTime) / 2000 - (this_.gameNum / 10) * 2 * Math.PI);

      tTime = tNow;

      document.forms.form1.run.disabled = true;
      if (tIndex < tNumTrials) {
        // If a delay is specified, set the timer for the next call


        window.setTimeout(addNextCase, tDelay);

        this.codapPhone.call({
          action: 'createCase',
          args: {
            collection: "Events",
            parent: this.openTestID,
            values: [
              ++this_.trialNum,
              Math.random(),
              tRate,
              tChoice,
              tSignal
            ]
          }
        });
        tIndex++;
      }
      else {
        var tTotalTime = Date.now() - this_.startTime;

        updateTests;

        this.codapPhone.call({
          action: 'closeCase',
          args: {
            collection: "Tests",
            caseID: this.openTestID,
            values: [
              this_.gameNum,
              this_.trialNum,
              tTotalTime,
              this_.trialNum * 1000 / tTotalTime,
              tDelay
            ]
          }
        });
        this.trialNum = 0;
        var time = Date.now() - this_.startTime;
        this.openTestID = null;
        document.getElementById('time').innerHTML = time;
        document.getElementById('rate').innerHTML = Math.round(10000 * tNumTrials / time) / 10;
        if (tProfile)
          console.profileEnd();
        document.forms.form1.run.disabled = false;
      }
    }.bind(this);

    if (tProfile)
      console.profile("Creating Cases");
    this.startTime = Date.now();


    this.codapPhone.call({
      action: 'openCase',
      args: {
        collection: "Tests",
        values: [ ++this.gameNum ]
      }
    }, function (result) {
      if (result.success) {
        this.openTestID = result.caseID;

        addNextCase();

      } else {
        console.log("PerformanceHarness: Error calling 'openCase'");
      }
    }.bind(this));


    // If a delay is specified, then we just call addNextCase() once, and the
    // internal timing mechanism will handle the additional calls.
    // If no delay is specified, then we loop here until we have enough cases.

  }
};


PerformanceHarness.initialize();

