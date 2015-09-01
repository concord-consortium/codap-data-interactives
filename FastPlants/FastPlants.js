/**
 * Created by William Finzer on 8/15/15.
 */

var FastPlants = {

  codapPhone: null,
  rand: new KCPCommon.randomNormal(),

  lightEffect: false,
  noisyGrowth: false,
  shrinkage: false,

  plantID: 'A',
  observer: '',
  light: '',
  daysToFlower: null,
  observers: null,
  observerNum: 0,

  currentPlantCaseID: null,

  dayNum: 0,
  plantHeight: 0,
  flowers: null,
  leaves: 0,

  initialize: function () {
    this.observers = ['Mark', 'Mary', 'Angelo', 'Kayla', 'Denice', 'Monica', 'Len', 'Sid', 'Carey', 'Sue'];

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(
        function (iCmd, iCallback) {
          iCallback();
        }, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "Fast Plants",
        dimensions: {width: 400, height: 250},
        collections: [
          {
            name: "Plants",
            attrs: [
              {name: "PlantID", type: 'nominal'},
              {name: "Observer", type: 'nominal'},
              {
                name: "Light", type: 'nominal',
                colormap: {
                  "Sun": 'green',
                  "Shade": 'brown'
                }
              },
              {name: "DaysToFlower", type: 'numeric', precision: 0}
            ],
            childAttrName: "Measurements",
          },
          {
            name: "Measurements",
            attrs: [
              {name: "Day", type: 'numeric', precision: 0, defaultMin: 0, defaultMax: 22},
              {name: "Height", type: 'numeric', precision: 1, defaultMin: 0, defaultMax: 50},
              {
                name: "Flowers", type: 'nominal',
                colormap: {
                  "No": 'green',
                  "Yes": 'orange'
                }
              },
              {name: "NumLeaves", type: 'numeric', precision: 0}
            ],
            defaults: {
              xAttr: "Day",
              yAttr: "Height"
            }
          }
        ]
      }
    }, function () {
      console.log("Finished initGame");
    }.bind(this));
  },

  growPlants: function () {
    document.forms.form1.grow.disabled = true;
    this.lightEffect = document.forms.form1.lightEffect.checked;
    this.noisyGrowth = document.forms.form1.noisyGrowth.checked;
    this.shrinkage = document.forms.form1.shrinkage.checked;

    var kMaxDays = 20,
        tNumPlants = Number(document.forms.form1.numPlants.value),
        tPlant = 0;

    var growOnePlant = function () {

      var choice = function (iShade, iSun) {
        return (this.lightEffect && this.light === "Shade" ? iShade : iSun);
      }.bind(this);

      this.light = Math.random() < 0.5 ? "Sun" : "Shade";
      var tMaxHeight = 40 + this.rand.nextGaussian() * 3 + choice(6, 0),
          tMaxGrowth = 0.5 + this.rand.nextGaussian() * 0.1 + choice(0, 0.05),
          tMiddleDay = 10 + this.rand.nextGaussian() + choice(1, -1);
      this.plantHeight = 0;
      this.leaves = 0;
      this.observer = this.observers[this.observerNum];
      this.daysToFlower = Math.round(tMiddleDay + Math.random() * 6 - 3) + choice(2, 0);

      var updatePlant = function () {
        this.codapPhone.call({
          action: 'updateCase',
          args: {
            collection: "Plants",
            caseID: this.currentPlantCaseID,
            values: [
              this.plantID,
              this.observer,
              this.light,
              this.daysToFlower
            ]
          }
        }, function () {
          console.log("Finished updating parent case");
        });
      }.bind(this);

      var addNextCase = function () {
        if (this.dayNum < kMaxDays) {
          var tPrevHeight = this.plantHeight;
          this.plantHeight = tMaxHeight / (1 + Math.exp(-tMaxGrowth * (this.dayNum - tMiddleDay)));
          if( this.noisyGrowth)
            this.plantHeight = Math.max(tPrevHeight, this.plantHeight + this.rand.nextGaussian() * 2);
          if( this.shrinkage && this.dayNum > kMaxDays - 3) {
            this.plantHeight += Math.min( 0, this.rand.nextGaussian() * 0.5 - 0.5);
          }
          this.flowers = this.dayNum + 1 < this.daysToFlower ? "No" : "Yes";
          if( this.plantHeight < 0.5)
            this.leaves = 0;
          else if( this.leaves === 0)
            this.leaves = 2;
          else if( this.dayNum < 1.5 * tMiddleDay) {
            this.leaves += ((Math.random() < choice(0.7, 0.4)) ? 1 : 2);
            if( this.lightEffect && this.light === "Sun" && Math.random() < 0.5)
              this.leaves += 1;
          }
          this.codapPhone.call({
                action: 'createCase',
                args: {
                  collection: "Measurements",
                  parent: this.currentPlantCaseID,
                  values: [
                    ++this.dayNum,
                    this.plantHeight,
                    this.flowers,
                    this.leaves
                  ]
                }
              },
              addNextCase);
        }
        else {
          updatePlant;

          this.codapPhone.call({
                action: 'closeCase',
                args: {
                  collection: "Plants",
                  caseID: this.currentPlantCaseID,
                  values: [
                    this.plantID,
                    this.observer,
                    this.light,
                    this.daysToFlower
                  ]
                }
              },
              function () {
                this.dayNum = 0;
                this.flowers = "No"
                this.plantID = String.fromCharCode(this.plantID.charCodeAt() + 1);
                tPlant++;
                this.observerNum = (this.observerNum + 1) % this.observers.length;
                growOnePlant();
              }.bind(this));
        }
      }.bind(this);

      if (tPlant < tNumPlants) {
        this.codapPhone.call({
          action: 'openCase',
          args: {
            collection: "Plants",
            values: [
              this.plantID,
              this.observer,
              this.light,
              this.daysToFlower
            ]
          }
        }, function (result) {
          if (result.success) {
            this.currentPlantCaseID = result.caseID;

            addNextCase();

          } else {
            console.log("FastPlants: Error calling 'openCase'");
          }
        }.bind(this));
      }
      else {
        document.forms.form1.grow.disabled = false;
      }
    }.bind(this);
    growOnePlant();
  }
};


FastPlants.initialize();

