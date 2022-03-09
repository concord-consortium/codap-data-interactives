import React from 'react';
import dataInteractiveList from "./data_interactive_map.json";
import { Header } from "./components/header/header";
import { CardList } from "./components/card-list/card-list";
import { Footer } from "./components/footer/footer";
import { isDevMode } from "./utils/util";

/**
 *
 * @param plugin {
 *      {description: string},
 *      {title: string},
 *      {aegis: string}
 *    }
 * @param searchString {string}
 * @return {boolean}
 */
function pluginSearch(plugin, searchString) {
  searchString = searchString.toLowerCase();
  return (plugin.description && plugin.description.toLowerCase().includes(searchString)) ||
      (plugin.title && plugin.title.toLowerCase().includes(searchString)) ||
      (plugin.aegis && plugin.aegis.toLowerCase().includes(searchString));
}

export default class App extends React.PureComponent {
  constructor() {
    super();
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleBranchSelect = this.handleBranchSelect.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.state = {
      dataInteractives: dataInteractiveList.data_interactives,
      categories: dataInteractiveList.categories,
      categorySelected: "Partners",
      branchSelected: isDevMode() ? "staging" : "latest",
      searchString: ''
    };
  }

  render() {
    const codapBaseUrl = "https://codap.concord.org";
    const plugins = this.state.dataInteractives;
    const categories = this.state.categories;
    const categorySelected = this.state.categorySelected;
    const branchSelected = this.state.branchSelected;
    const searchString = this.state.searchString;
    let path;
    switch (branchSelected) {
      case "latest":
        path = "/releases/latest/"
        break;
      case "staging":
        path = "/releases/staging/"
        break;
      case "stable":
        path = "/app/"
        break;
      case "branch":
        path = "/~jsandoe/build/"
        break;
    }
    const url = codapBaseUrl+path;
    let tabIndex = categories.findIndex(entry => entry.category === categorySelected);

    return (
      <div className="App">
        <Header plugins={plugins}
                categories={categories}
                categorySelected={categorySelected}
                branchSelected={branchSelected}
                onCategorySelect={this.handleCategorySelect}
                onBranchSelect={this.handleBranchSelect}
                onSearch= {this.handleSearch}
                searchString = {searchString}
        />
        <CardList plugins={plugins} categorySelected={categorySelected} url={url} tabIndex={tabIndex}/>
        <Footer />
      </div>
    );
  }

  handleCategorySelect(category) {
    this.setState({ categorySelected: category });
  }

  handleBranchSelect(event) {
    this.setState({ branchSelected: event.target.value});
  }

  handleSearch (searchString) {
    let found = false;
    this.setState({searchString: searchString});
    this.state.dataInteractives.forEach(plugin => {
      let ix = plugin.categories.indexOf('Search');
      if (ix >= 0) {
        plugin.categories.splice(ix, 1);
      }
    });
    if (searchString.length >= 3) {
      this.state.dataInteractives.forEach(plugin => {
        if (pluginSearch(plugin, searchString)) {
          plugin.categories.push('Search');
          found = true;
        }
      });
    }
    if (found && this.state.categorySelected !== 'Search') {
      this.priorSelected = this.state.categorySelected;
      this.setState({categorySelected: 'Search'})
    } else if (!found && this.state.categorySelected === 'Search') {
      this.setState({categorySelected: this.priorSelected});
      this.priorSelected = null;
    }
  }
}

