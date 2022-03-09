import React from 'react';

import "./dropdown-select.css";

export class DropdownSelect extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.props.handleBranchSelect.bind(this);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label className="dropdownLabel">
          Select branch:
        </label>
        <select className="dropdownSelect" value={this.props.branchSelected} onChange={this.handleChange}>
          <option value="latest">latest</option>
          <option value="staging">staging</option>
          <option value="stable">stable</option>
          <option value="branch">branch</option>
        </select>
      </form>
    );
  }
}
