/**
 * These store objects are meant to keep track of all the state need by classes and components that needs to
 * be accessed in more than one file or needs to be saved and restored.
 */
import {action, autorun, makeAutoObservable, runInAction, toJS} from 'mobx'
import {EntityInfo, getDatasetInfoWithFilter, kEmptyEntityInfo} from "./lib/codap-helper";
import {collectMeasuresDatasetParams} from "./types-and-constants";
import {dataContextHasParentCollection, dataContextHasRandomFormula} from "./utilities";

export interface CollectionInfo {
  name: string,
  title: string,
  attrNames: string[]
}

export class Store {
  index: string = ''

  availableSourceDatasets: EntityInfo[] = []
  chosenSourceDataset: EntityInfo | undefined = undefined
  chosenSourceParentCollectionInfo: CollectionInfo | undefined = undefined
  chosenHasRandomness: boolean = false
  chosenHasMeasures: boolean = false
  collectMeasuresDataset: EntityInfo | undefined = undefined
  numberOfRepetitions = 10

  constructor() {
    makeAutoObservable(this,
      {},
      {autoBind: true})
  }

  async initialize() {
    const this_ = this

    if (!this.collectMeasuresDataset) {
      this.collectMeasuresDataset = {... kEmptyEntityInfo}
    }
    await this.updateSourceDatasets()

    autorun(async () => {
      if (this.chosenSourceDataset) {
        await this.checkForRandomnessAndMeasures()
      }
    })
  }

  async updateSourceDatasets() {
    this.availableSourceDatasets = await getDatasetInfoWithFilter(
      (dsInfo: EntityInfo) => {
        return dsInfo.name !== collectMeasuresDatasetParams.name
      });
    if (this.chosenSourceDataset) {
      const indexOfChosen = this.availableSourceDatasets.findIndex(
        (dsInfo) => {
          const chosenName = this.chosenSourceDataset && this.chosenSourceDataset.name
          return dsInfo.name === chosenName
        })
      if (indexOfChosen < 0) {
        action(() => this.chosenSourceDataset = undefined)()
      }
      else {
        action(() => this.chosenSourceDataset = this.availableSourceDatasets[indexOfChosen])()
      }
    }
    if(!this.chosenSourceDataset && this.availableSourceDatasets.length > 0) {
      action(() => this.chosenSourceDataset = this.availableSourceDatasets[0])()
    }
  }

  async checkForRandomnessAndMeasures() {
    const this_ = this
    const name = this_.chosenSourceDataset && this_.chosenSourceDataset.name
    if (name) {
      const hasRandomness = await dataContextHasRandomFormula(name)
      const hasParentCollection = await dataContextHasParentCollection(name)
      action(() => this_.chosenHasRandomness = hasRandomness)()
      action(() => this_.chosenHasMeasures = hasParentCollection)()
    }
  }

  asJSON() {
    return {
      chosenSourceDataset: toJS(this.chosenSourceDataset),
      collectMeasuresDataset: toJS(this.collectMeasuresDataset),
      numberOfRepetitions: this.numberOfRepetitions
    }
  }

  fromJSON(json: any) {
    if (json) {
      runInAction(() => {
        this.chosenSourceDataset = json.chosenSourceDataset
        this.collectMeasuresDataset = json.collectMeasuresDataset
        this.numberOfRepetitions = json.numberOfRepetitions
      })
    }
  }

}


