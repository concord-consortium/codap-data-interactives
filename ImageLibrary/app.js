/* globals React, ReactDOM */

var div = React.DOM.div,
    iframe = React.DOM.iframe,
    img = React.DOM.img,
    button = React.DOM.button,
    component, App, CODAP, ImageLibrary;

component = function (spec) {
  return React.createFactory(React.createClass(spec));
};

App = component({
  displayName: "App",

  render: function () {
    return div({},
      CODAP({}),
      ImageLibrary({})
    );
  }
});

CODAP = component({
  displayName: "CODAP",

  getInitialState: function () {
    return {
      src: "",
      error: ""
    };
  },

  componentWillMount: function () {
    var query = window.location.search.substr(1),
        parts = query.split("&"),
        src = null,
        srcParts = [],
        i, pair;

    for (i = 0; i < parts.length; i++) {
      pair = parts[i].split("=");
      if (pair[0] === "codap") {
        src = decodeURIComponent(pair[1]);
      }
      else {
        srcParts.push(decodeURIComponent(parts[i]));
      }
    }

    if (src === null) {
      this.setState({error: "Missing codap parameter"});
    }
    else {
      srcParts.push("componentMode=yes", "exportFilesViaPostMessage=yes");
      src += src.indexOf("?") === -1 ? "?" : "&";
      src += srcParts.join("&");
      this.setState({src: src});
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return ((this.state.src !== nextState.src) || (this.state.error !== nextState.error));
  },

  render: function () {
    return div({id: "codap"},
      this.state.error ? div({}, this.state.error) : iframe({src: this.state.src})
    );
  }
});

ImageLibrary = component({
  displayName: "ImageLibrary",

  getInitialState: function () {
    return {
      images: [],
      error: ""
    };
  },

  componentWillMount: function () {
    if (window.addEventListener) {
      window.addEventListener("message", this.handleMessage, false);
    }
    else if (window.attachEvent) {
      window.attachEvent("onmessage", this.handleMessage);
    }
    else {
      this.setState({error: "ERROR: unable to setup snapshot event listeners"});
    }
  },

  handleMessage: function (event) {
    if (event.data && (event.data.action === "exportFile") && (event.data.mimetype === "image/png")) {
      this.setState({
        images: this.state.images.concat(event.data.data)
      });
    }
  },

  clearImages: function () {
    if (confirm("Are you sure you want to clear all the graph snapshots?")) {
      this.setState({images: []});
    }
  },

  render: function () {
    var images, i;

    if (this.state.images.length > 0) {
      images = [];
      for (i = 0; i < this.state.images.length; i++) {
        images.push(img({key: i, src: "data:image/png;base64," + this.state.images[i]}));
      }
      return div({id: "imageLibrary"},
        div({}, "You can now drag any of the graph snapshots below directly into a Google Doc"),
        div({}, button({onClick: this.clearImages}, "Clear Snapshots")),
        div({id: "images"}, images)
      );
    }
    else if (this.state.error.length > 0) {
      return div({id: "imageLibrary"}, div({}, this.state.error));
    }
    else {
      return div({id: "imageLibrary"}, div({}, "Select any graph to the left and then click on the camera icon to capture a snapshot of the graph"));
    }
  }
});

ReactDOM.render(App({}), document.getElementById("app"));