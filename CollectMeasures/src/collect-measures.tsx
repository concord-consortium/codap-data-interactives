// ==========================================================================
//
//  Author:   wfinzer
//
//  Copyright (c) 2021 by The Concord Consortium, Inc. All rights reserved.
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

import React, {Component, ErrorInfo} from 'react';
import {action} from "mobx";
import {observer} from "mobx-react";
import codapInterface from "./lib/CodapInterface";
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.compact.css';
import {dataSetString, EntityInfo, initializePlugin} from './lib/codap-helper';
import {pluginParameters} from "./types-and-constants";
import {choicesMenu, createAttributesInCollectedMeasuresDataset, guaranteeMeasuresDataset} from "./utilities";
import './collect-measures.css';
import {Store} from "./store";
import {NumberBox} from "devextreme-react";
import NotificationManager from "./notification_manager";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faEnvelope} from '@fortawesome/free-solid-svg-icons'

const CollectMeasures = observer(class CollectMeasures extends Component<{}, {
  hasError: boolean,
  isLoaded: boolean,
  showingInfo: boolean,
  collectionInProgress: boolean,
}> {
  ref: React.RefObject<unknown>
  store: Store
  notificationManager: NotificationManager

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      isLoaded: false,
      showingInfo: false,
      collectionInProgress: false,
    }
    this.ref = React.createRef();
    this.store = new Store()
    this.notificationManager = new NotificationManager(this.store)
    this.restorePluginFromStore = this.restorePluginFromStore.bind(this);
    this.getPluginStore = this.getPluginStore.bind(this);
    codapInterface.on('update', 'interactiveState', '', this.restorePluginFromStore);
    codapInterface.on('get', 'interactiveState', '', this.getPluginStore);
  }

  async componentDidMount() {
    await initializePlugin(pluginParameters.name,
      pluginParameters.version, pluginParameters.initialDimensions,
      this.restorePluginFromStore);
    await this.store.initialize()
    this.setState({isLoaded: true})
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  getPluginStore() {
    return {
      success: true,
      values: {
        store: this.store.asJSON(),
      }
    };
  }

  async restorePluginFromStore(iStorage: any) {
    if (iStorage) {
      this.store.fromJSON(iStorage.store);
    }
  }

  async rerandomize() {
    if (this.store.chosenSourceDataset) {
      await codapInterface.sendRequest({
        "action": "update",
        "resource": dataSetString(this.store.chosenSourceDataset.name || ''),
        "values": {
          "rerandomize": true
        }
      }).catch((reason) => {
        console.log('unable to rerandomize because ' + reason);
      });
    }
  }

  async collectMeasuresOnce() {
    await guaranteeMeasuresDataset(this.store.collectMeasuresDataset as EntityInfo)
    await createAttributesInCollectedMeasuresDataset(this.store)
  }

  async repeatedMeasuresCollection() {
    this.setState({collectionInProgress: true})
    let kickStart = true
    let numTimes = this.store.numberOfRepetitions
    while (numTimes > 0 && (this.state.collectionInProgress || kickStart)) {
      kickStart = false
      await this.rerandomize()
      await this.collectMeasuresOnce()
      numTimes--
    }
    this.setState({collectionInProgress: false})
  }

  getAppropriateButton() {
    const this_ = this,
      store = this.store,
      chosenDataSetTitle = store.chosenSourceDataset ? store.chosenSourceDataset.title : ''
    if (this.state.collectionInProgress) {
      return <button onClick={() => {
        this_.setState({collectionInProgress: false})
      }}>
        Stop Collecting Measures
      </button>
    } else {
      return <button
        disabled={!store.chosenHasRandomness || !store.chosenHasMeasures}
        onClick={() => {
          this_.repeatedMeasuresCollection()
        }}>
        {`Re-randomize and Collect Measures ${store.numberOfRepetitions} Times from ${chosenDataSetTitle}`}
      </button>
    }
  }

  rerandomizeNote() {
    if (!this.store.chosenSourceDataset) {
      return <p className='note'>No dataset chosen</p>
    } else if (!this.store.chosenHasRandomness) {
      return <p className='note'>Nothing in dataset to randomize</p>
    } else {
      return null
    }
  }

  collectMeasuresNote() {
    if (!this.store.chosenSourceDataset) {
      return <p className='note'>No dataset chosen</p>
    } else if (!this.store.chosenHasMeasures) {
      return <p className='note'>No measures in dataset to collect</p>
    } else {
      return null
    }
  }

  infoPage() {
    return (
      <div className='cm-info'>
        <h3>About Collect Measures</h3>
        <p>This plugin is useful for creating certain classes of simulations in CODAP.</p>
        <ul>
          <li>There is a dataset with attributes with formulas using random functions.
          </li>
          <li>The dataset has two collections.
          </li>
          <li>The collection on the left has attributes that compute "measures" from the cases in the
            collection on the right.</li>
        </ul>
        <p><b>Example</b>: The collection on the right has 10 cases and one attribute, <b>Face</b>, whose
          formula is <code>randomPick(1,2,3,4,5,6)</code>.
          The collection on the left has one attribute, "Sum", with the formula <code>sum(Face)</code>.
          The plugin collects the sum of the faces of the 10 dice to build up the distribution of sums.
        </p>
        <button onClick={() => this.setState({showingInfo: false})}>Back</button>
      </div>
    )
  }

  render() {
    const this_ = this,
      store = this.store,
      chosenDataSetTitle = store.chosenSourceDataset ? store.chosenSourceDataset.title : ''

    function datasetMenu() {

      async function handleChoice(iChoice: string) {
        store.chosenSourceDataset = store.availableSourceDatasets.find(iInfo => iInfo.title === iChoice)
      }

      const tDatasetChoices: string[] = (store.availableSourceDatasets.map(iInfo => iInfo.title)),
        tPrompt = 'Choose a dataset',
        tHint = 'Choose a dataset to be rerandomized and whose measures will be collected'
      return (
        choicesMenu(tPrompt, 'Choose from',
          tHint, tDatasetChoices, chosenDataSetTitle, 'No datasets to choose from', handleChoice)
      )
    }

    if (this.state.hasError) {
      return <h1>Something went wrong!</h1>
    } else if (!this.state.isLoaded) {
      return <h1>Loading...</h1>
    } else if (this.state.showingInfo) {
      return (
        <div>
          {this.infoPage()}
        </div>
      )
    }
    return (
      <div className="collect-measures">
        <div className='cm-header'>
          <div className='cm-title-with-icon'>
            <h2>Collect Measures</h2>
            <div className='cm-info-icon' onClick={() => this_.setState({showingInfo: true})}>
              <FontAwesomeIcon icon={faCircleInfo}
                               title='Click to get information on how to use this plugin'/>
            </div>
          </div>
          <p>Choose a dataset, typically one that has attributes with formulas that produce random values.</p>
        </div>
        {datasetMenu()}
        <div className='cm-two-buttons'>
          <div>
            <button
              disabled={!store.chosenHasRandomness}
              onClick={() => {
                this_.rerandomize()
              }}>
              {`Re-randomize ${chosenDataSetTitle}`}
            </button>
            {this.rerandomizeNote()}
          </div>
          <div>
            <button
              disabled={!store.chosenHasMeasures}
              onClick={() => {
                this_.collectMeasuresOnce()
              }}>
              {`Collect Measures Once from ${chosenDataSetTitle}`}
            </button>
            {this.collectMeasuresNote()}
          </div>
        </div>
        <div className='cm-number-box'>
          <span>Number of repetitions</span>
          <NumberBox
            height={25}
            width={50}
            defaultValue={store.numberOfRepetitions}
            onValueChanged={async (e) => {
              action(() => {
                store.numberOfRepetitions = e.value
              })()
            }}
          />
        </div>
        {this.getAppropriateButton()}
      </div>
    );
  }

})

export default CollectMeasures;
