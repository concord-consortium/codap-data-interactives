hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [
    hasMouse ?
    // Need to make specific to chosen attribute
      {
        key: 'HideForested', label: 'Hide the attribute “Forested Area”', url: './resources/videos/HideAttribute.mp4',
        operation: 'hideAttribute', type: '',
        requiresSpecialHandling: true,
        //constraints: [ {property: 'attrIDs', value: 22}],
        feedback: <div>
            <p>The datasets you’ll be working with have a lot of attributes and you may want to focus on just a few.</p>
            <p>You can hide any attribute you don’t want to focus on.</p>
          </div>
      } :
    {
    },
    {
      key: 'UnhideAttribute', label: 'Get “Forested Area” to show up again', url: './resources/videos/ShowAttribute.mp4',
      operation: 'unhideAttributes', type: '',
      constraints: [ {property: 'attrIDs', value: 22}],
      feedback: <div>
            <p>No matter how many attributes you’ve hidden,  you can get them all to show up again using the Eyeball menu.</p>
          </div>
    },
    {
      key: 'MakeGraph', label: 'Create a graph', url: './resources/videos/CreateGraph.mp4',
      operation: 'create', type: ['DG.GraphView'],
      feedback: <div>
        <p>Great, you have a graph!  The data points are scattered because nothing has been added to the axes yet. Next you will explore what happens when you add an attribute.</p>
      </div>,
    },
      // Need to make specific to chosen attribute and axis
    {
      key: 'AddDoctors', label: 'Drag "Total Count of Medical Doctors” onto the horizontal axis.',
      url: './resources/videos/GraphHorizontal.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      //constraints: [{property: 'attributeName', value:'Total Count of Medical Doctors'}],
      requiresSpecialHandling: true,
      feedback: <div>
        <p>You can see the distribution of “Total Count of Medical Doctors”  for all countries. But maybe the distribution is different for different regions. How could you use the categorical variable “Region” to find out?</p>
      </div>
    },
    // Need to make specific to chosen attribute and axis
    {
      key: 'AddRegionVertical', label: 'Graph “Region” on the vertical axis', url: './resources/videos/GraphVertical.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      //constraints: [ {property: 'attributeName', value: 'Region'}],
      requiresSpecialHandling: true,
      feedback: <div>
        <p>How do the regions of the world compare in terms of number of doctors? Do some appear to be generally higher or lower?</p>
      </div>
    },
    //
    {
      key: 'ToggleMean', label: 'Add the mean to each distribution to help compare them', url: './resources/videos/MeanRegion.mp4',
      operation: 'togglePlottedMean', type: 'DG.GraphView',
      feedback: <div>
        <p>How does adding the mean help you compare the distributions for each region? Are the means for some regions higher or lower than the others?</p>
      </div>
    },
    {
      key: 'ToggleMedian', label: 'Add the median to each distribution to help compare them', url: './resources/videos/MedianRegion.mp4',
      operation: 'togglePlottedMedian', type: 'DG.GraphView',
      feedback: <div>
        <p>How does adding the median line help you compare the distributions of doctors in different regions?  Do the medians show you the same patterns as the means did?</p>
      </div>
    },
    {
      key: 'RemoveRegion', label: 'Remove “Region” from the vertical axis to create a single distribution again', url: './resources/videos/RemoveVertical.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      constraints: [{property: 'attributeName', value: 'Remove Y: Region'}],
      prereq: 'AddRegionVertical',
      feedback: <div>
        <p>You can always remove an attribute from an axis by clicking on the attribute name and choosing “remove X or Y.”</p>
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
    <li>Hidden attributes</li>
    <li>Unhid attributes</li>
    <li>Created a graph</li>
    <li>Graphed a numerical attribute on the horizontal axis</li>
    <li>Graphed a categorical attribute on the vertical axis</li>
    <li>Added mean to a distribution</li>
    <li>Added median to a distribution</li>
    <li>Removed an attribute from the vertical axis</li>
  </ul>
  <p>You can do a <em>lot</em> with just those skills!</p>
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
