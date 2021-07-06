import React from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

import "./card.css"

export class Card extends React.PureComponent{
  render(){
    let cardClassNames = `card`
    return (
      <div className={cardClassNames}>
        {this.renderPluginTitleAndDescription()}
        <a className="embeddableLink" href={this.cleanPath()} target="_blank" rel="noopener noreferrer">
          Embeddable Link
        </a>
    </div>
    );
  }

  renderPluginTitleAndDescription() {
    let { plugin, url } = this.props;
    let pluginPath = "";
    let urlRoot = window.location.origin+window.location.pathname;
    if (plugin.path.match(/^http/i)) {
      pluginPath = plugin.path;
    }
    else {
      urlRoot=urlRoot.replace(/index.html$/, '');
      pluginPath = urlRoot+plugin.path;
    }
    if (url.match(/^https/i) && !pluginPath.match(/^https/i)) {
      pluginPath=pluginPath.replace(/http/i,'https');
    }

    if (pluginPath.match(/^https/i) && !url.match(/^https/i)) {
      url=url.replace(/http/i,'https');
    }

    return (
      <a href={`${url}?di=${pluginPath}`} className="pluginTitle" target="_blank" rel="noopener noreferrer">
        {plugin.title}
        <p className="pluginDescription">{this.renderHTML(plugin.description)}</p>
      </a>
    );
  }
  renderHTML(description) {
    return parse(DOMPurify.sanitize(description || ""));
  }

  cleanPath() {
    const { plugin } = this.props;
    let path = '';
    let url_root=window.location.origin+window.location.pathname;
    let url="https://codap.concord.org/app/"

    if (plugin.path.match(/^http/i)) {
      path = plugin.path;
    }
    else {
      url_root = url_root.replace(/index.html$/, '');
      path = url_root + plugin.path;
    }

    if (url.match(/^https/i) && !path.match(/^https/i)) {
      path = path.replace(/http/i, 'https');
    }

    if (path.match(/^https/i) && !url.match(/^https/i)) {
      url = url.replace(/http/i, 'https');
    }
    return path;
  }
}

