// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

var ContextSelector = React.createClass({
  render: function () {
    var options =
        this.props.contexts.map(function (name) {
          return (
              <option key={name} > {name} </option>
          );
        });
    return <select id="context-selector" >
        {options} </select>

  }
});

var ContextMenu = React.createClass({
  render: function () {
    return <section id="context-selector">
      <label>Context:&nbsp;
        <ContextSelector contexts={this.props.contexts} />
      </label >
    </section>
  }
});

var AttrList = React.createClass({
  render: function () {
    var items = this.props.attrs.map(function (item) {
      return <div key={item.name} className="attr">{item.title}</div>
    });
    return <div className="attr-list">{items}</div>
  }
});

var CaseDisplay = React.createClass ({
  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      return <div className="attr-value" key={attr.name}> {myCase.values[attr.name]} </div>;
    });
    return <div className="case">{values}</div>;
  }
});

var CaseList = React.createClass({
  render: function () {
    var caseIndex = this.props.collection.currentCaseIndex || 0;
    var myCase = this.props.collection.cases[caseIndex];
    var caseView = <CaseDisplay key={myCase.id} attrs={this.props.collection.attrs} myCase={myCase}/>;
    return <div className="case-container"> {caseView} </div>;
  }
});

var CaseNavControl = React.createClass({
  symbol: {
    left: '<',
    right: '>'
  },
  handleClick(ev) {
    this.props.onNavigation && this.props.onNavigation(this.props.action);
  },
  render: function () {
    return <div className="control" onClick={this.handleClick}>{this.symbol[this.props.action]}</div>
  }
});

var DataCard = React.createClass({
  moveCard: function (direction) {
    console.log('moveCard: direction: ' + direction);
    this.props.onNavigation && this.props.onNavigation(this.props.collection.name, direction);
  },
  render: function () {
    return <section className="card-section">
      <div className="collection-name">{this.props.collection.title}</div>
      <div className="card-deck">
        <div className="left-ctls">
          <CaseNavControl action="left" onNavigation={this.moveCard} />
        </div>
        <div className="attr-container">
          <AttrList attrs={this.props.collection.attrs} />
        </div>
        <div className="case-frame">
          <CaseList collection={this.props.collection} />
        </div>
        <div className="right-ctls">
          <CaseNavControl action="right"  onNavigation={this.moveCard}/>
          <div className="control ctl-add-case">+</div>
        </div>
      </div>
    </section>
  }
});

var DataCardApplication = React.createClass({
  moveCard: function (collectionName, direction) {
    var newIx = null;
    var collectionIx = this.data.collections.findIndex(function (collection) {
      return collection.name === collectionName;
    });
    var collection = (collectionIx >= 0) && this.data.collections[collectionIx];
    console.log('moveCard. ' + JSON.stringify({
          collection: collectionName,
          direction: direction,
          ix: collectionIx,
          length: collection.cases.length,
          currentCaseIndex: collection.currentCaseIndex
        }));

    if (collection) {
      if (direction === 'left' && collection.currentCaseIndex > 0) {
        newIx = collection.currentCaseIndex - 1;
      } else if (direction === 'right' && (collection.currentCaseIndex + 1) < collection.cases.length) {
        newIx = collection.currentCaseIndex + 1;
      }
      if (newIx !== null) {
        this.data.collections[collectionIx].currentCaseIndex = newIx;
        this.setState(this.data);
      }
    }
  },
  data: {
    contexts: ['BartStations', 'BartRoutes', 'BartArrivals'],
    currentContext: 'BartStations',
    collections: [
      {
        currentCaseIndex: 0,
        name: 'cities',
        title: 'Cities',
        attrs: [
          { name: 'state', title: 'State'},
          { name: 'county', title: 'County'},
          { name: 'city', title: 'City'}
        ],
        cases: [
          {
            id: 2,
            values: {
              state: 'California',
              county: 'Alameda',
              city: 'Oakland'
            }
          },
          {
            id: 3,
            values: {
              state: 'California',
              county: 'San Francisco',
              city: 'San Francisco'
            }
          },
          {
            id: 4,
            values: {
              state: 'California',
              county: 'Alameda',
              city: 'Berkeley'
            }
          },
          {
            id: 5,
            values: {
              state: 'California',
              county: 'Alameda',
              city: 'San Leandro'
            }
          },
          {
            id: 6,
            values: {
              state: 'California',
              county: 'Alameda',
              city: 'Castro Valley'
            }
          },
          {
            id: 7,
            values: {
              state: 'California',
              county: 'San Mateo',
              city: 'Colma'
            }
          },
          {
            id: 8,
            values: {
              state: 'California',
              county: 'Contra Costa',
              city: 'Concord'
            }
          }
        ]
      },
      {
        currentCaseIndex: 0,
        name: 'stations',
        title: 'Stations',
        attrs: [
          { name: 'station_name', title: 'Station Name'},
          { name: 'abbreviation', title: 'Station Abbreviation'},
          { name: 'street_address', title: 'Address'},
          { name: 'latitude', title: 'Latitude'},
          { name: 'longitude', title: 'Longitude'}
        ],
        cases: [
          {
            id: 102,
            parent: 2,
            values: {
              station_name: '12th St. Oakland City Center',
              abbreviation: '12TH',
              street_address: '1245 Broadway',
              latitude: 37.80,
              longitude: -122.27
            }
          },
          {
            id: 103,
            parent: 2,
            values: {
              station_name: '19th St. Oakland',
              abbreviation: '19TH',
              street_address: '1900 Broadway',
              latitude: 37.76,
              longitude: -122.42
            }
          },
          {
            id: 104,
            parent: 3,
            values: {
              station_name: 'Coliseum/Oakland Airport',
              abbreviation: 'COLS',
              street_address: '7200 San Leandro St.',
              latitude: 37.75,
              longitude: -122.13
            }
          },
          {
            id: 105,
            parent: 3,
            values: {
              station_name: '16th St. Mission',
              abbreviation: '16TH',
              street_address: '2000 Mission Street',
              latitude: 37.76,
              longitude: -122.42
            }
          },
          {
            id: 106,
            parent: 3,
            values: {
              station_name: '24th St. Mission',
              abbreviation: '24TH',
              street_address: '2800 Mission Street',
              latitude: 37.75,
              longitude: -122.42
            }
          },
          {
            id: 107,
            parent: 3,
            values: {
              station_name: 'Balboa Park',
              abbreviation: 'BALB',
              street_address: '401 Geneva Avenue',
              latitude: 37.72,
              longitude: -122.45
            }
          },
          {
            id: 108,
            parent: 3,
            values: {
              station_name: 'Civic Center/UN Plaza',
              abbreviation: 'CIVC',
              street_address: '1150 Market Street',
              latitude: 37.77,
              longitude: -122.41
            }
          },
          {
            id: 109,
            parent: 4,
            values: {
              station_name: 'Ashby',
              abbreviation: 'ASHB',
              street_address: '3100 Adeline Street',
              latitude: 37.85,
              longitude: -122.27
            }
          },
          {
            id: 110,
            parent: 5,
            values: {
              station_name: 'Bay Fair',
              abbreviation: 'BAYF',
              street_address: '15242 Hesperian Blvd.',
              latitude: 37.69,
              longitude: -122.13
            }
          },
          {
            id: 111,
            parent: 6,
            values: {
              station_name: 'Castro Valley',
              abbreviation: 'CAST',
              street_address: '3301 Norbridge Dr.',
              latitude: 37.69,
              longitude: -122.07
            }
          },
          {
            id: 112,
            parent: 7,
            values: {
              station_name: 'Colma',
              abbreviation: 'COLM',
              street_address: '365 D Street',
              latitude: 37.68,
              longitude: -122.46
            }
          },
          {
            id: 113,
            parent: 8,
            values: {
              station_name: 'Concord',
              abbreviation: 'CONC',
              street_address: '1451 Oakland Avenue',
              latitude: 37.97,
              longitude: -122.03
            }
          }
        ]
      }
    ]
  },
  getInitialState() {
    return this.data;
  },
  render: function () {
    var cards = this.state.collections.map(function (collection){
      return <DataCard key={collection.name} collection={collection} onNavigation={this.moveCard} />
    }.bind(this));
    return <div>
      <ContextMenu contexts={this.state.contexts} />
      {cards}
    </div>
  }
});

ReactDOM.render(<DataCardApplication />,
    document.getElementById('container'));
