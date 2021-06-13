import React from 'react';
import dataInteractives from "./data_interactive_map.json";
import { Header } from "./components/header/header";
import { CardList } from "./components/card-list/card-list";
import { Footer } from "./components/footer/footer";
import { isDevMode } from "./utils/util";

export default class App extends React.PureComponent {
  constructor() {
    super();
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleBranchSelect = this.handleBranchSelect.bind(this);
    this.state = {
      dataInteractives: dataInteractives.data_interactives,
      categorySelected: "Partners",
      branchSelected: isDevMode() ? "staging" : "latest",
    }
  }

  render() {
    const codapBaseUrl = "https://codap.concord.org";
    const plugins = this.state.dataInteractives;
    const categorySelected = this.state.categorySelected;
    const branchSelected = this.state.branchSelected;
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

    return (
      <div className="App">
        <Header plugins={plugins}
                categorySelected={categorySelected}
                branchSelected={branchSelected}
                handleCategorySelect={this.handleCategorySelect}
                handleBranchSelect={this.handleBranchSelect}
        />
        <CardList plugins={plugins} categorySelected={categorySelected} url={url}/>
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
}

