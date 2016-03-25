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


      this.codapPhone.call({
          action: 'update',
          what: {
            type: 'interactiveFrame'
          },
          values: {
            title: 'Data Card', version: '0.1', dimensions: {
              width: 400, height: 200
            }
          }
        },
        function (result) {
          this.logResult(result);
          if (result && result.success) {
            this.addContext(this.logResult.bind(this));
          }
        }.bind(this)
      );
    },

    addContext: function () {
      this.codapPhone.call({
        action: 'create',
        what: {
          type: 'dataContext'
        },
        values: {
          identifier: "DataCard",
          title: "Data Card",
          description: "Displays individual items in a set of data, one item at a time."
        }
      }, function (result) {
        this.logResult(result);
        if (result && result.success) {
          this.addCollection();
        }
      }.bind(this));
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
          type: 'collection',
          context: 'DataCard'
        },
        values: {
          identifier: 'DataCards',
          title: this.collectionName,
          description: "",
          attributes: attrNames
        }
      });
    },

    addCase: function (iCase) {
      this.codapPhone.call({
            action: 'create',
            what: {
              type: 'case',
              context: 'DataCard',
              collection: 'DataCards'
            },
            values: {
              values: iCase
            }
          },
          this.logResult
      );
    },
    changeCollectionName: function (name) {
      this.collectionName = name;
      this.codapPhone.call({
        action: 'update',
        what: {
          type: 'collection',
          identifier: 'DataCase'
        },
        values: {
          title: name
        }
      }, this.logResult);
    }
  };

  // handle DOM events
  $('#collName').on('change', DataCard, function (ev) {
    var collName = $('#collName').val();
    DataCard.changeCollectionName(collName);
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
