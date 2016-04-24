/* jshint indent: false, strict: false, quotmark: false, browser: true, devel: true */
/* globals iframePhone */
$(function () {

  var Logger = {
    logMessage: function (message) {
      console.log(message);
    }
  };

  var DataCard = {

    /**
     * Provides a communication channel to CODAP.
     *
     * @type {iframePhone.IframePhoneRpcEndpoint}
     */
    codapPhone: null,

    /**
     *
     */
    context: null,

    collectionName: $('collName').val(),

    logResult: function (result) {
      Logger.logMessage('result: ' + (result && JSON.stringify(result)));
    },

    connect: function () {
      // Invoke the JavaScript interface
      this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function () {
      }, "data-interactive", window.parent);


      this.updateFrame();
      this.addContext();
      this.addCollection();
    },

    updateFrame: function () {
      var kMaxWidth = 400, kMinHeight = 400;

      this.codapPhone.call({
        action: 'get',
        what: { resource: 'doc.interactiveFrame'}
      }, function (result) {
        this.logResult(result);
        if (!result || !result.success){
          return;
        }

        var width = Math.min(kMaxWidth,
            (result.values.dimensions && result.values.dimensions.width) || 999);
        var height = Math.max(kMinHeight,
            (result.values.dimensions && result.values.dimensions.height) || 0);
          this.codapPhone.call({
            action: 'update',
            what: { resource: 'doc.interactiveFrame'},
            values: {
              title: 'Data Card',
              version: '0.1',
              dimensions: {
                width: width,
                height: height
              }
            }
          }, this.logResult)
      }.bind(this));
    },

    addContext: function () {
      this.codapPhone.call({
        action: 'create',
        what: {
          resource: 'doc.dataContext'
        },
        values: {
          name: "DataCard",
          title: "Data Card",
          description: "Displays individual items in a set of data, one item at a time."
        }
      }, this.logResult);
    },

    addCollection: function () {
      var attrNames = $('#card tr td:first-of-type')
          .map(function () {
            return $(this).text();
          })
          .get()
          .map(function (name) {
            return {'name': name.trim()};
          });
      this.codapPhone.call({
        action: 'create',
        what: {
          resource: 'doc.dataContext[DataCard].collection'
        },
        values: {
          name: 'DataCards',
          title: this.collectionName,
          description: "",
          attributes: attrNames
        }
      }, this.logResult);
    },

    addCase: function (iCase) {
      this.codapPhone.call({
            action: 'create',
            what: {
              resource: 'doc.dataContext[DataCard].collection[DataCards].case'
            },
            values: {
              values: iCase
            }
          },
          this.logResult
      );
    },
    displayCollectionTitle: function () {
      this.codapPhone.call({
        action: 'get',
        what: { resource: 'doc.dataContext[DataCard].collection[DataCards]'}
      }, function (result) {
        this.logResult(result);
        if (!result || !result.success) { return; }
        $('#collName').val(result.values.title);
      }.bind(this))
    },
    changeCollectionTitle: function (name) {
      this.collectionName = name;
      this.codapPhone.call({
        action: 'update',
        what: {
          resource: 'doc.dataContext[DataCard].collection[DataCards]'
        },
        values: {
          title: name
        }
      }, function(result) {
        this.logResult(result);
        this.displayCollectionTitle();
      }.bind(this));
    }
  };

  // handle DOM events
  $('#collName').on('blur', DataCard, function (ev) {
    var collName = $('#collName').val();
    DataCard.changeCollectionTitle(collName);
  });
  $('#send-card').on('click', DataCard, function (ev) {
    var tCase = {};
    $('#card tbody tr').each(function (index, row) {
      tCase[$('td:first-of-type', row).text().trim()]
          = $('td:last-of-type input', row).val().trim();
    });
    ev.data.addCase(tCase);
  });

  DataCard.connect();

});
