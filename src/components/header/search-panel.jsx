import React from 'react';

import "./search-panel.css";
import PropTypes from "prop-types";

export class SearchPanel extends React.Component {
  constructor() {
    super();
    this.state = {value: ''};
  }

  handleClear(/*ev*/) {
    this.props.onSearch('');
  }

  handleChange(ev) {
    let searchString = ev.target.value;
    this.props.onSearch(searchString);
  }

  render() {
    let placeholder='search for...';
    let value = /*this.state.value*/this.props.searchString;

    return (
        <div className='search-panel' >
          <input type={'text'} placeholder={placeholder} onChange={ev => this.handleChange(ev)} value={value} />
          <button className={'search-panel-clear'} onClick={ev => this.handleClear(ev)}>&#x24E7;</button>
        </div>
    )
  }
}

SearchPanel.propTypes = {
  onSearch: PropTypes.func,
  searchString: PropTypes.string,
}
