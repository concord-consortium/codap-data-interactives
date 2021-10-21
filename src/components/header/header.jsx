import React from 'react';
import PropTypes from 'prop-types';
import { NavigationTabs } from "./navigation";
import { DropdownSelect } from "./dropdown-select";
import { SearchPanel } from "./search-panel";

import "./header.css"

export class Header extends React.Component {
  render() {
    return (
      <div className="header">
        {this.renderHeaderTitle()}
        <NavigationTabs plugins={this.props.plugins}
                        categories={this.props.categories}
                        categorySelected={this.props.categorySelected}
                        handleCategorySelect={this.props.handleCategorySelect} />
      </div>
    );
  }

  renderHeaderTitle() {
    return (
      <div className="headerTitle">
        <div className="headerLeft">
        <a href="https://codap.concord.org/" title="CODAP Project" target="_blank" rel="noopener noreferrer">
          <img src="https://codap.concord.org/wp-content/themes/cc/img/codap-logo.png" className="codap-logo" alt="Common Online Data Analysis Program" />
        </a>
        </div>
        <div className="headerCenter">
          <span className="title">CODAP Data Interactive Plugins</span>
        </div>
        <div className="headerRight">
          <SearchPanel handleSearch={this.props.onSearch} searchString={this.props.searchString}/>
          <DropdownSelect branchSelected={this.props.branchSelected} handleBranchSelect={this.props.onBranchSelect}/>
        </div>
      </div>

    )
  }
}
Header.propTypes = {
  plugins: PropTypes.array,
  categories: PropTypes.any,
  categorySelected: PropTypes.string,
  onCategorySelect: PropTypes.func,
  onSearch: PropTypes.func,
  searchString: PropTypes.string,
  branchSelected: PropTypes.string,
  onBranchSelect: PropTypes.func
}
