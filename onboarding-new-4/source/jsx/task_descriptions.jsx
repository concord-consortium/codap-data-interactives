hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [
    hasMouse ?
      {
        key: 'ToggleToCaseCard', label: 'Switch from table to case card view of the data to make more space on the screen', url: './resources/videos/CaseCard.mp4',
        operation: 'toggle table to card', type: 'DG.CaseTable',
        feedback: <div>
            <p>Now you have a lot more space on the screen.  You can see the range of values for each of the attributes on the case card.  You can also “scroll” through the cases using the right and left arrows at the top of the card. To get back to the card with the range of values, click on the circle between the arrows at the top of the card.</p>
          </div>
      } :
    {
    },
    //4.2 - Need to redo actions
    {
      key: 'AddAverageGNPHoriz', label: 'Create a graph and drag \"Average GNP per person\" to the horizontal axis', url: './resources/videos/4creategraphhoriz.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      //constraints: [{property: 'attributeName', value:'Average GNP per Person'}],
      requiresSpecialHandling: true,
      feedback: <div>
            <p>Well done! “Average GNP per Person” is one way to measure how much wealth there is in a country. What do you notice about the graph?</p>
          </div>
    },
    {
      key: 'AddAvgLifeExpectVertical', label: 'Drag \"Average Life Expectancy\" to the vertical axis of your graph.', url: './resources/videos/AddLifeExp.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      constraints: [{property: 'attributeName', value:'Average Life Expectancy'}],
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Now that you have two attributes on the graph, what do you notice? Do countries that have a high value on one attribute generally have a high value on the other?</p>
      </div>
    },
    {
      key: 'CreateMap', label: 'Create a map.', url: './resources/videos/CreateMap.mp4',
      operation: 'create', type: 'map',
      requiresSpecialHandling: true,
      feedback: <div>
      <p>Great, you’ve opened a map.  Now you can put an attribute on it.</p>
      <p>The colors are all the same because you haven’t dragged data onto the map yet. You will add data from an attribute next.</p>
    </div>
  },

    { 
      key: 'SelectTopCountries', label: 'Drag on the graph to select nine or more countries that have both high average GNP and high life expectancy.', url: './resources/videos/SelectCountriesonGraph.mp4',
      operation: 'selectCases', type: ['DG.GraphView'],
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Great! Notice that both the points you selected and the countries on the map that they correspond to are highlighted. This happens because the graph and the map are linked. Do you notice any geographical pattern of the highlighted countries?</p>
      </div>
    },
    {
      key: 'HideUnselectedPoints', label: 'Hide all of the points except the ones you’ve selected', url: './resources/videos/HideCasesonGraph.mp4',
      operation: 'hideUnselected', type: '',
      feedback: <div>
        <p>Now the only points you can see are the ones you’ve selected. This action of looking at only a subset of the points is called “filtering.” Try using filtering in your exploration of other datasets.
To get all of the points to be visible again, go back to the “eyeball” menu and choose “Show all cases.”
</p>
      </div>
    },
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
  taskExists: function (iKey) {
    return this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
  }
};

allAccomplishedFeedback = <div>
  <p>Congratulations! You've done the following:</p>
  <ul>
    <li>Switched to case card view</li>
    <li>Created a graph with an attribute on the horizontal axis</li>
    <li>Created a map</li>
    <li>Added an attribute to the vertical axis</li>
    <li>Selected countries on a graph</li>
    <li>Hid unselected points</li>
  </ul>
  <p>You can do a <em>lot</em> with just those six skills!</p>
  <p>For more information about how to work with CODAP, visit
    the <a href="https://codap.concord.org/help/" target="_blank">CODAP Help</a> page. </p>
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
