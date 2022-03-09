hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [
    {
      key: 'MakeScatterplot', label: 'Make a scatterplot of height vs age.',
      url: './resources/MakeScatterplot.mp4',
      operation: 'attributeChange', type: '',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Great scatterplot! Hopefully you have <em>height</em> on the vertical axis
          and <em>age</em> on the horizontal axis.</p>
      </div>
    },
    {
      key: 'SelectCases', label: 'Drag a selection rectangle around a subset of the points.',
      url: './resources/SelectCases.mp4',
      operation: 'selectCases',
      constraints: [ {property: 'cases', value: true}],
      prereq: 'MakeScatterplot',
      feedback: <div>
        <p>OK. Cases are selected.</p>
        <p>These are the ones we want to look at more closely.</p>
      </div>
    },
    {
      key: 'HideUnselected', label: 'Hide the unselected cases.',
      url: './resources/HideUnselected.mp4',
      operation: 'hideUnselected', type: '',
      prereq: 'SelectCases',
      feedback: <div>
        <p>That very nicely got those other cases out of the way.</p>
        <p>It\'s possible that the graph needs rescaling.</p>
      </div>
    },
    {
      key: 'Deselect', label: 'Deselect all cases, including the ones in the table.',
      url: './resources/Deselect.mp4',
      operation: 'selectCases',
      constraints: [ {property: 'cases', value: false}],
      prereq: 'HideUnselected',
      feedback: <div>
        <p>Selection is important, but so is <em>deselection!</em></p>
      </div>
    },
    {
      key: 'Rescale', label: 'Rescale the graph.',
      url: './resources/Rescale.mp4',
      operation: 'rescaleGraph', type: '',
      prereq: 'HideUnselected',
      feedback: <div>
        <p>You pressed the graph's <em>Rescale</em> button so that all the points are visible and
        spread out as much as possible.</p>
      </div>
    },
    {
      key: 'MakeLegend', label: 'Add Sex as a legend to the scatterplot.',
      url: './resources/MakeLegend.mp4',
      operation: 'legendAttributeChange', type: 'DG.GraphModel',
      constraints: [ {property: 'attributeName', value: 'Sex'}],
      prereq: 'MakeScatterplot',
      feedback: <div>
        <p>Legendary! Notice that the points are nicely colored according to the scheme laid out in the legend.</p>
        <p>Pro tip: You can select all the points in one category by clicking on the legend key.</p>
      </div>
    }
  ],
  getFeedbackFor: function (iKey, iUseAltFeedback, iAllAccomplished) {
    let tDesc = this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
    let tFeedback = iUseAltFeedback ? tDesc.alt_feedback : tDesc.feedback;
    if( iAllAccomplished) {
      tFeedback = <div>
        { tFeedback }
        { allAccomplishedFeedback}
      </div>;
    }
    return tFeedback;
  },
  taskExists: function(iKey) {
    return this.descriptions.find( function(iDesc) {
      return iKey === iDesc.key;
    });
  }
};

allAccomplishedFeedback = <div>
  <p>Congratulations! You've done the following:</p>
  <ul>
    <li>Made a scatterplot</li>
    <li>Used <em>marquee selection</em> to select some useful cases</li>
    <li>Gotten cases you don/'t want to be bothered with by hiding them</li>
    <li>Rescaled the scatterplot to spread the points out</li>
    <li>Added a legend variable to the graph</li>
    <li>Deselected cases so that none are selected</li>
  </ul>
  <p>These are useful CODAP skills!</p>
</div>;

infoFeedback =
    <div>
      <p>This onboarding plugin for CODAP was created to help new CODAP users get started
        using CODAP. It lives in CODAP as an iFrame. Certain user actions cause CODAP to
        notify the plugin. The plugin responds by providing feedback to the user.</p>
      <p>The open source code is at<br/>
        <a href="https://github.com/concord-consortium/codap-data-interactives/tree/master/onboarding"
           target="_blank">
          CODAP's data interactive GitHub repository</a>. </p>
      <p>This plugin makes use of the CODAP data interactive plugin API whose documentation is at<br/>
        <a href="https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API"
           target="_blank">
          CODAP Data Interactive API</a>.</p>
    </div>;
