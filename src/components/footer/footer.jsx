import React from 'react';
import "./footer.css"

export class Footer extends React.Component {

  render() {
    return (
      <div className="footer">
        <div className="footerLeft">
          {this.renderInfoLinks()}
        </div>
        <div className="footerRight">
          {this.renderCCLogo()}
        </div>
      </div>
    );
  }

  renderCCLogo() {
    return (
      <div id="cc">
        a product of
        <div className="cc-logo">
          <a href="https://concord.org/" title="The Concord Consortium - Revolutionary digital learning for science, math, and engineering"><img src="http://codap.concord.org/_assets/img/cc-logo.png" alt="The Concord Consortium" />
          </a>
        </div>
      </div>
    )
  }

  renderInfoLinks() {
    return (
      <>
        <p>CODAP plugin repository: <a target="blank" href="https://github.com/concord-consortium/codap-data-interactives"> github.com/concord-consortium/codap-data-interactives</a></p>
        <p>CODAP project repository: <a target="blank" href="https://github.com/concord-consortium/codap"> github.com/concord-consortium/codap</a></p>
        <p>To find out more about the CODAP project: <a target="blank" href="https://concord.org/projects/codap"> About CODAP</a></p>
        <p>© Copyright 2021 <a href="https://concord.org/" title="The Concord Consortium - Revolutionary digital learning for science, amth, and engineering">The Concord Consortium</a>. All rights reserved.</p>
      </>
    )
  }
}