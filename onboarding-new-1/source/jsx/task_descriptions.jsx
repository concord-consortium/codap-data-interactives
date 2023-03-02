hasMouse = !('ontouchstart' in window);

taskDescriptions = {
  descriptions: [
    hasMouse ?
      {
        key: 'MakeMap', label: 'Create a map.', url: './resources/videos/CreateMap.mp4',
        operation: 'create', type: 'map',
        requiresSpecialHandling: true,
        feedback: <div>
        <p>Great, you’ve opened a map.  Now you can put an attribute on it.</p>
        <p>The colors are all the same because you haven’t dragged data onto the map yet. You will add data from an attribute next.</p>
      </div>
      } :
    {
    },
    {
      key: 'AddLifeExpectancy', label: 'Drag the attribute "Average Life Expectancy" onto the map', url: './resources/videos/DragAttributeMap.mp4',
      operation: 'legendAttributeChange', type: 'DG.MapModel',
      constraints: [{property: 'attributeName', value:'Average Life Expectancy'}],
      requiresSpecialHandling: true,
      feedback: <div>
            <p>Well done. You dragged “Average Life Expectancy” from the table to the map.</p>
            <p>Now the countries on the map are colored according to the values of “Average Life Expectancy.”</p>
            <p>Countries with a high value are darker and those with a low value are lighter. Later you will select lighter or darker portions on the map using the legend at the bottom.</p>

            <p>Take a look at the legend. Which areas of the map have high values for Average Life Expectancy?</p> 

          </div>
    },
    {
      key: 'MoveMap', label: 'Move the map', url: './resources/videos/MoveMap.mp4',
      operation: 'move', type: 'DG.MapView',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>You can always move a map (or a graph or a table) to make more space on the screen.</p>
      </div>
    },
   //* Chad, Andee and Traci would like to delete Minimize the Map and Restore the Map. I commented these out for now. -NS
   //*    {
   //*     key: 'MinimizeMap', label: 'Minimize the map', url: './resources/videos/MinimizeMap.mp4',
   //*     operation: 'toggle minimize component', type: 'DG.MapView',
   //*    requiresSpecialHandling: true,
   //*    feedback: <div>
   //*    <p>Now you have a lot more space.</p>
   //* <p>You can restore the map to its original size by clicking on the “minus” sign again.</p>
   //*   </div>
   //*    },
  //* Issues here – operation already captured? {also bug — need to reposition the map after restoring size}
   //*    { 
   //*      key: 'RestoreMap', label: 'Restore the map to its full size', url: './resources/videos/RestoreMap.mp4',
   //*      operation: 'toggle minimize component', type: 'DG.MapView',
    //*     prereq: 'MinimizeMap',
    //*     requiresSpecialHandling: true,
   //*      feedback:
    //*     <div> 
     //*      <p>Now you have your map back.</p>
   //*	<p>You can always minimize or restore any CODAP object (called a “tile”).  There is a list of all 
   //*	of your tiles under “tiles” in the upper right of your screen.</p>
     //*    </div>
     //*  },
    //Issues here – differentiating whether user has selected the top-most bin of an arbitrarily selected attribute
    {
      key: 'SelectCountries', label: 'Click on the colored legend bars to select a subset of countries. Try selecting the countries with higher values of the attribute (darker colors).', url: './resources/videos/SelectDarkColorsOnMap.mp4',
      operation: 'selectCases', type: '',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Well done! You selected a set of countries that have similar life expectancy and highlighted them on the map. When you select a country, notice that the corresponding row highlights in the table. </p>
        <p>How do you think you could select countries that have different values? For example, which countries have relatively low life expectancies?</p>
        </div>
    },
    //Issues here — a) not triggering this at the same time as the first, b) etermining whether user has added a new attribute rather than dragging the old one again
    {
      key: 'ChangeMapLegend', label: 'Color the map by a different attribute.', url: './resources/videos/ColorMap2ndAttribute.mp4',
      operation: 'legendAttributeChange', type: 'DG.MapModel',
      prereq: 'AddLifeExpectancy',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Wonderful! You dragged a different attribute from the table to the map.</p>
	<p>You can drag any of the attributes in your table to the map to create a different map display in CODAP.</p>
	<p>To find the full name and more information about any attribute, you can hover over its name at the top of the column in the table.</p>
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
    <li>Created a map</li>
    <li>Dragged an attribute onto the map</li>
    <li>Moved the map</li>
    <li>Selected attributes with higher values on a map</li>
    <li>Colored the map by a different attribute</li>
  </ul>
  <p>You can do a <em>lot</em> with just those seven skills!</p>
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
