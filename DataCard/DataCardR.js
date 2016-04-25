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
var data = {
  contexts: ['BartStations', 'BartRoutes', 'BartArrivals'],
  collections: [
    {
      name: 'Cities',
      attrs: [
        { name: 'state', title: 'State'},
        { name: 'county', title: 'County'},
        { name: 'city', title: 'City'}
      ],
      cases: [
        {
          id: 1,
          values: {
            state: 'California',
            county: 'Alameda',
            city: 'Berkeley'
          }
        },
        {
          id: 2,
          values: {
            state: 'California',
            county: 'Alameda',
            city: 'Oakland'
          }
        }
      ]
    },
    {
      name: 'Stations',
      attrs: [
        { name: 'station_name', title: 'Station Name'},
        { name: 'abbreviation', title: 'Station Abbreviation'},
        { name: 'street_address', title: 'Address'},
        { name: 'latitude', title: 'Latitude'},
        { name: 'longitude', title: 'Longitude'}
      ],
      cases: [
        {
          id: 3,
          values: {
            station_name: 'Fruitvale',
            abbreviation: 'FRVL',
            street_address: '3401 East 12th Street',
            latitude: 37.77,
            longitude: -122.22
          }
        },
        {
          id: 4,
          values: {
            station_name: 'Lake Merritt',
            abbreviation: 'LAKE',
            street_address: '800 Madison Street',
            latitude: 37.80,
            longitude: -122.27
          }
        }
      ]
    }
  ]
};

var ContextSelector = React.createClass({
  render: function () {
    var options =
        this.props.data.map(function (name) {
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
        <ContextSelector data={this.props.data} />
      </label >
    </section>
  }
});

var AttrList = React.createClass({
  render: function () {
    var items = this.props.data.map(function (item) {
      return <div key={item.name} className="attr">{item.title}</div>
    });
    return <div className="attr-list">{items}</div>
  }
});

var CaseDisplay = React.createClass ({
  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      return <div className="attr-value" key={attr.name}> {myCase.values[attr.name]} </div>
    });
    return <div className="case">{values}</div>
  }
});

var CaseList = React.createClass({
  render: function () {
    var cases = this.props.data.cases.map(function (myCase) {
      return <CaseDisplay key={myCase.id} attrs={this.props.data.attrs} myCase={myCase}/>
    }.bind(this));
    return <div className="case-container"> {cases} </div>
  }
});

var DataCard = React.createClass({
  render: function () {
    return <section className="card-section">
      <div className="collection-name">{this.props.data.name}</div>
      <div className="card-deck">
        <div className="left-ctls">
          <div className="control ctl-move-left">&lt;</div>
        </div>
        <div className="attr-container">
          <AttrList data={this.props.data.attrs} />
        </div>
        <div className="case-frame">
          <CaseList data={this.props.data} />
        </div>
        <div className="right-ctls">
          <div className="control ctl-move-right">&gt;</div>
          <div className="control ctl-add-case">+</div>
        </div>
      </div>
    </section>
  }
});

var DataCardApplication = React.createClass({
  render: function () {
    return <div>
      <ContextMenu data={this.props.data.contexts} />
      <DataCard data={this.props.data.collections[0]} />
      <DataCard data={this.props.data.collections[1]} />
    </div>

  }
});
ReactDOM.render(<DataCardApplication data={data} />,
    document.getElementById('container'));
