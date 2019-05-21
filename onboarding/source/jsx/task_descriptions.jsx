hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [
    hasMouse ?
        {
          key: 'Drag', label: 'Drag this data file into CODAP', url: './resources/DragCSV.mp4',
          operation: 'dataContextCountChanged',
          feedback: <div>
            <p>You've got data! It appears in a <em>case table</em>.</p>
            <p>Each row in the table represents a <em>case</em> and each column
              represents an <em>attribute</em>.</p>
            <p>This data set contains data about mammals. Each case represents a different
              mammal. The attributes provide information about lifespan, height, and so on.</p>
          </div>
        } :
        {
          key: 'MakeTable', label: 'Make a table showing Mammals data', url: './resources/MakeTable.mp4',
          feedback: <div>
            <p>You made a <em>case table</em> showing the pre-loaded data.</p>
            <p>Each row in the table represents a <em>case</em> and each column
              represents an <em>attribute</em>.</p>
            <p>This data set contains data about mammals. Each case represents a different
              mammal. The attributes provide information about lifespan, height, and so on.</p>
          </div>
        },
    {
      key: 'MakeGraph', label: 'Make a graph', url: './resources/MakeGraph.mp4',
      feedback: <div>
        <p>Very nice graph! Each point represents one of the cases in your data set.</p>
        <p>The points are scattered randomly for the moment because you haven't yet
          specified how they should be arranged.</p>
      </div>,
      alt_feedback: <div>
        <p>Very nice graph!</p>
        <p>There are no points in it because you haven't yet dragged any
          data in yet.</p>
      </div>
    },
    {
      key: 'MoveComponent', label: 'Move a table or graph', url: './resources/MoveGraph.mp4',
      operation: 'move', type: ['DG.GraphView', 'DG.TableView'],
      feedback: <div>
        <p>You <em>moved</em> that component by clicking and dragging on its title bar!</p>
        <p>You can also <em>resize</em> a component by dragging an edge or lower corner.</p>
      </div>
    },
/*
    {
      key: 'selectCases', label: 'Select some cases by …', url: 'movie url',
      operation: 'selectCases', type: '',
      feedback: <div>
        <p>You selected some cases!</p>
      </div>
    },
*/

    {
      key: 'AssignAttribute', label: 'Drag an attribute to a graph\'s axis', url: './resources/DragAttribute.mp4',
      feedback: <div>
        <p>Way to go! You dragged an attribute from the case table to a graph axis.</p>
        <p>Now the points have arranged themselves along the axis according to their attribute values.</p>
        <p>You can replace this attribute with another one, or drag an attribute to the other graph
          axis to make a scatter plot.</p>
      </div>
    },
    {
      key: 'SecondAttribute', label: 'Drag a 2nd attribute to a graph\'s axis', url: './resources/Drag2ndAttribute.mp4',
      feedback: <div>
        <p>Alright! You dragged a second attribute to a graph.</p>
        <p>Your graph is <em>bivariate</em> meaning you have displayed two attributes on a single graph.</p>
        <p>You can replace either attribute with a different attribute, or drag an attribute to the
          middle of the graph to create a legend for the points.</p>
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
  taskExists: function (iKey) {
    return this.descriptions.find(function (iDesc) {
      return iKey === iDesc.key;
    });
  }
};

allAccomplishedFeedback = <div>
  <p>Congratulations! You've done the following:</p>
  <ul>
    <li>Dragged data into CODAP</li>
    <li>Made a graph</li>
    <li>Moved a component</li>
    <li>Plotted an attribute on a graph axis</li>
    <li>Made a graph show values for two attributes</li>
  </ul>
  <p>You can do a <em>lot</em> with just those five skills!</p>
  <p>For more information about how to work with CODAP, visit
    the <a href="https://codap.concord.org/help/" target="_blank">CODAP Help</a> page. </p>
  <button onClick={this.startOver}>Start Over</button>
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
