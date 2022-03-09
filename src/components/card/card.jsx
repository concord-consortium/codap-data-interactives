import React from "react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import logo from "./codap.ico";

import "./card.css"
import PropTypes from "prop-types";

function getURLRoot() {
  let urlRoot = window.location.origin+window.location.pathname;
  return urlRoot.replace(/index.html$/, '').replace(/\/build\//, '');
}

export class Card extends React.PureComponent{
  copyToClipboard() {
    navigator.clipboard.writeText(this.cleanPath());
  }

  render(){
    let cardClassNames = `card`
    return (
      <div className={cardClassNames}>
        {this.renderPluginTitleAndDescription()}
        <div className="embeddableLink" onClick={() => this.copyToClipboard()}>
          copy link to clipboard
          <span role={"img"} aria-label={"Image of a clipboard"}>&#x1F4CB;</span>
        </div>
    </div>
    );
  }

  renderPluginTitleAndDescription() {
    let { plugin, url } = this.props;
    let pluginPath = "";
    if (plugin.path.match(/^http/i)) {
      pluginPath = plugin.path;
    }
    else {
      pluginPath = getURLRoot()+plugin.path;
    }
    if (url.match(/^https/i) && !pluginPath.match(/^https/i)) {
      pluginPath=pluginPath.replace(/http/i,'https');
    }

    if (pluginPath.match(/^https/i) && !url.match(/^https/i)) {
      url=url.replace(/http/i,'https');
    }

    return (
      <div >
        <div title={"Open in CODAP"}>
          <a href={`${url}?di=${pluginPath}`} className="pluginTitle"
             target="_blank" rel="noopener noreferrer">
            <img src={logo}  alt={"CODAP Logo"}/>&nbsp;
            {plugin.title}
          </a>
        </div>
        <p className="pluginDescription">{this.renderHTML(plugin.description)}</p>

      </div>
    );
  }

  renderHTML(description) {
    return parse(DOMPurify.sanitize(description || ""));
  }

  cleanPath() {
    const { plugin } = this.props;
    let path = '';
    let url="https://codap.concord.org/app/"

    if (plugin.path.match(/^http/i)) {
      path = plugin.path;
    }
    else {
      path = getURLRoot() + plugin.path;
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

Card.propTypes = {
  plugin: PropTypes.object,
  project: PropTypes.object,
  url: PropTypes.string
}
