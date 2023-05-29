hasMouse = true;  // This is a kludge to prevent loading of Mammals on touch devices

taskDescriptions = {
  descriptions: [
    {
      key: 'MakeGraph', label: 'Create a graph.', url: './resources/videos/DF_Tutorial_1_1.mp4',
      operation: 'create', type: 'graph',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Great, you have a graph! The data points are scattered because nothing has been added to the axis yet.</p>
      </div>
    },
    
    // Make specific to named attribute (and horizontal axis)
    // do we include    "axisOrientation": "horizontal"  in constraints?
    {
      key: 'AddHeight', label: 'Drag "Height (cm)” onto the horizontal axis.',
      url: './resources/videos/DF_Tutorial_1_2.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      //constraints: [{property: 'attributeName', value:'Height'}],
      requiresSpecialHandling: true,
      feedback: <div>
            <p>That’s a good start!  Dragging an attribute to an axis structures the data points so they become ordered on the graph.  You can also click on an attribute on the graph to replace it with another. </p>
          </div>
    },
    
    {
      key: 'MakeLegend', label:'Drag “Height (cm)” to the middle of the graph to color the points in the graph.',
      url: './resources/videos/DF_Tutorial_1_3.mp4',
      operation: 'legendAttributeChange', type: 'DG.GraphModel',
      requiresSpecialHandling: true,
      //constraints: [ {property: 'attributeName', value: 'Height (cm)'}],
      prereq: 'AddHeight',
      feedback: <div>
        <p>Nice job. You’ll notice that the points are colored according to the values of “Height.”</p>
      </div>
    },
    
    // Select any point on the graph 
    // I don't know if the constraints line should be here or not.
    {
      key: 'SelectAnyPoint', label: 'Select a point on the graph', url: './resources/videos/DF_Tutorial_1_4.mp4',
      operation: 'selectCases', type:'DG.GraphView',
      //constraints: [{property: '[selectCases]', value:''}],
      prereq: 'MakeGraph',
      requiresSpecialHandling: true,
      feedback: <div>
        <p>Nice! Notice that the table and graph are <em>linked</em>: the table scrolls to the relevant row for the point you selected in the graph, and highlights it for you. Or, if you select a row in the table, the corresponding point on the graph is also selected.</p>
      </div>
    },
    
    // Display the mean
    // Should this have a prerequisite of MakeGraph ?
    {
      key: 'ToggleMean', label: 'Display the mean', url: './resources/videos/DF_Tutorial_1_5.mp4',
      operation: 'togglePlottedMean', type: 'DG.GraphView',
      feedback: <div>
        <p>Nice work!  It’s a good idea to explore the palette buttons to discover handy features including mean and median.</p>
      </div>
    },

    // Add and remove Gender from vertical axis
    {
      key: 'AddRemoveGenderVertical', label: 'Drag Gender to the vertical axis and then remove it again', url: './resources/videos/DF_Tutorial_1_6.mp4',
      operation: 'attributeChange', type: 'DG.GraphView',
      constraints: [{property: 'attributeName', value:'Remove Y: Gender'}],
      requiresSpecialHandling: true,
      feedback: <div>
        <p>If you have displayed the mean or median, adding a non-numerical attribute to the y axis displays the mean for all the categories - handy for comparisons. When you remove the attribute, the overall mean returns to the display.</p>
      </div>
    },
    
    // Make a histogram (requires 2 steps/buttons)
    // the first step is binning the points
    // Does this need the prereqs of MakeGraph and AddHeight ?
    //{
    //  key: 'BinPoints', label: 'Make a histogram in 2 steps. Open the palette to find and select Group into Bins', url: './resources/videos/DF_Tutorial_1.5a.mp4',
    //  operation: 'toggle show as BinnedPlot', type: 'DG.GraphView',
      //requiresSpecialHandling: true,
      //prereq: 'MakeGraph', 'AddHeight',
    //  feedback: <div>
    //    <p>Great!  You are halfway to a histogram!.</p>
    //  </div>
    //},
    
        // Make a histogram part 2
        // I included the prereq of the above, BinPoints, is that OK/correct ?
    {
      key: 'MakeHistogram', label: 'Make a histogram in 2 steps: First, open the palette to find and select \'Group Into Bins\'. Then open it again and select \'Fuse Dots Into Bars\'', url: './resources/videos/DF_Tutorial_1_7.mp4',
      operation: 'toggle between histogram and dots', type: 'DG.GraphView',
      //requiresSpecialHandling: true,
      //prereq: 'BinPoints',
      feedback: <div>
        <p>Notice that the values in a histogram are continuous and that the bars touch each other for that reason. Specific data points are hidden, but the frequency of each range of points and the shape of the distribution become clear. The vertical axis is automagically labeled Count.
        </p>
      </div>
    },

    {
      key: 'MinimizeTable', label: 'Minimize the table', url: './resources/videos/DF_Tutorial_1_8a.mp4',
      operation: 'toggle minimize component', type: 'DG.TableView',
      requiresSpecialHandling: true,
      feedback: <div>
      <p>Now you have more space. Minimizing the table gives you more room for graphs or maps.</p>
       </div>
      },
    {
      key: 'ExpandTable', label: 'Expand the table again', url: './resources/videos/DF_Tutorial_1_8b.mp4',
      operation: 'toggle minimize component', type: 'DG.TableView',
      requiresSpecialHandling: true,
      //prereq: 'MinimizeTable',
      feedback: <div>
      <p>Now you can work with the table again.</p>
      <p>You can always minimize or restore any CODAP object (called a “tile”). There is a list of all of your tiles under “tiles” in the upper right of your screen.</p>
        </div>
      },
      {
        key: 'ReturnDotPlot', label: 'Open the palette on the graph and click “Points” to return to a dot plot', url: './resources/videos/DF_Tutorial_1_9.mp4',
        operation: 'toggle show as DotPlot', type: 'DG.GraphView',
        //requiresSpecialHandling: true,
        //prereq: 'MinimizeTable',
        feedback: <div>
        <p>Well done! Now you can see the individuals in each of the four classes again.</p>
        </div>
      },
    
        // Group the data using hierarchical table move
        // Note there are multiple notifications so this may not be possible?
        // First there are a couple of "dragdnd" operations
        // then there is a CreateCollection operation. 
        // Below I used the latter.
    {
      key: 'GroupByClass', label: 'In the table, drag the attribute Class all the way to the left. When the left edge turns yellow, drop the attribute. ', url: './resources/videos/DF_Tutorial_1_10.mp4',
      operation: 'createCollection', type: 'DG.TableView',
      constraints: [{property: 'attributeName', value:'Class'}],
      //requiresSpecialHandling: true,
      feedback: <div>
        <p>You've just grouped the data into the four different classes (cores) of students. Try selecting a class in the table and notice what happens in the graph!</p>
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
    <li>Created a graph</li>
    <li>Graphed a numerical attribute onto the horizontal axis</li>
    <li>Colored the points in the graph</li>
    <li>Selected a point to highlight it in both graph and table</li>
    <li>Displayed the mean</li>
    <li>Graphed a categorical attribute onto the vertical axis</li>
    <li>Made a histogram</li>
    <li>Minimized and restored a tile</li>
    <li>Made a histogram back into a dot plot</li>
    <li>Grouped the data into classes</li>
    <li>Selected a class to highlight the data in both table and graph  </li>
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

    tracingFeedback =
    <div>
      <p>Here!</p>
    </div>;
