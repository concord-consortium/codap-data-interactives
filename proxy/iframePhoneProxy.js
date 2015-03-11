
function Tester() {
  function origin() {
    return document.location.href.match(/(.*?\/\/.*?)\//)[1];
  }

  return Object.create({
    parentEndpoint: null,
    results: null,
    sequence: null,
    seqIndex: 0,
    sendCommand: function () {
      var ix = this.seqIndex++,
        testCase = this.sequence[ix];
      this.parentEndpoint.call(testCase.call, this.recvResults);
    },
    recvResults: function () {

    },
    /**
     * Runs a sequential test. Executes each command in the sequence defined
     * in test.sequence. When results return, evaluate, and then issue the next
     * command until done. Log errors.
     * @param test
     */
    run: function (test) {
      // make a parent endpoint
      this.parentEndpoint = new iframePhone.IframePhoneRpcEndpoint(
          function (iMsg, iCallback) {}, 'codap-game', window.parent,
          origin());
      this.sequence = test.sequence;
      this.seqIndex = 0;
      // initialize
      this.results = {
        commandCount: 0, errors: [], errorCount: 0
      };
      this.sendCommand();
    }
  })
}