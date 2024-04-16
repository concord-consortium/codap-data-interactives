/**
 * These utilities might be used by more than one component
 */

import React from "react";
import {SelectBox} from "devextreme-react/select-box";
import {action} from "mobx";
import codapInterface from "./lib/CodapInterface";
import {collectMeasuresDatasetParams} from "./types-and-constants";
import {
  datasetByNameExists,
  EntityInfo, getAllAttributeNames, getAllDatasetNames,
  getDatasetInfoByName, getParentLevelAttributeNames,
  guaranteeTableOrCardIsVisibleFor, numberOfCasesInCollection
} from "./lib/codap-helper";
import {Store} from "./store";

export function choicesMenu(iPrompt: string, iPlaceHolder: string, iHint: string,
                            iChoices: string[], iValue: string, iNoDataText: string, iCallback: (choice: string) => void) {
  return (
    <div className='sq-choice'>
      <span>{iPrompt}:</span>
      <SelectBox
        dataSource={iChoices}
        placeholder={iPlaceHolder}
        hint={iHint}
        value={iValue}
        noDataText={iNoDataText}
        style={{display: 'inline-block'}}
        onValueChange={action(async (e) => iCallback(e))}
        width={'100%'}
      >
      </SelectBox>
    </div>
  )
}

/**
 * First make sure there is a "Collected Measures" dataset. If not, create one.
 * Gather the names of the attributes at the parent level in the chosen dataset.
 * Make sure these attribute names are present at the child level of the "Collected Measures" dataset.
 * If the parent level of the chosen dataset has multiple cases, make sure there is an attribute "Sample"
 * in the "Collected Measures" dataset.
 * @return {Promise<boolean>}
 */
export async function guaranteeMeasuresDataset(entityInfo: EntityInfo): Promise<void> {
  const params = collectMeasuresDatasetParams,
    alreadyExists = await datasetByNameExists(params.name)
  if (!alreadyExists) {
    const tCreateResult: any = await codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext',
      values: {
        name: params.name,
        title: params.title,
        collections: [
          {
            name: params.collectionName,
            title: params.collectionTitle,
            attrs: [
              {name: 'Sample', description: 'Sample number'}
            ]
          }]
      }
    }).catch((reason) => {
      console.log('unable to create datacontext ' + reason);
    })
    if (tCreateResult && tCreateResult.success) {
      entityInfo.id = tCreateResult.values.id
      entityInfo.name = tCreateResult.values.name
      entityInfo.title = tCreateResult.values.title
    }
  }
  if (!entityInfo.id) {
    const theInfo = await getDatasetInfoByName(params.name)
    if (theInfo) {
      entityInfo.id = theInfo.id
      entityInfo.name = theInfo.name
      entityInfo.title = theInfo.title
    }
  }
  guaranteeTableOrCardIsVisibleFor(entityInfo)
}

export async function createAttributesInCollectedMeasuresDataset(theStore: Store) {
  const theParams = collectMeasuresDatasetParams,
    parentInfo = await getParentLevelAttributeNames(theStore.chosenSourceDataset as EntityInfo),
    existingAttrNames = await getAllAttributeNames(theParams.name),
    attrsToAdd = parentInfo.attrNames.filter((iName: string) => {
      return !existingAttrNames.includes(iName)
    })
  if (attrsToAdd.length > 0) {
    const createAttrsResult: any = await codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${theParams.name}].collection[${theParams.collectionName}].attribute`,
        values: attrsToAdd.map((iName: string) => {
          return {name: iName}
        })
      }
    ).catch((reason) => {
      console.log('unable to create attributes because ' + reason);
    })
  }
  const chosenDatasetName = theStore.chosenSourceDataset ? theStore.chosenSourceDataset.name : '',
    chosenParentCollectionName = parentInfo.parentCollectionName
  const getCasesResult: any = await codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${chosenDatasetName}].collection[${chosenParentCollectionName}].caseFormulaSearch[true]`
  }).catch((reason) => {
    console.log('unable to get case because ' + reason);
  })
  if (getCasesResult && getCasesResult.success) {
    const measuresCollectedSoFar = await numberOfCasesInCollection(
        theParams.name, theParams.collectionName),
      items = getCasesResult.values.map((iCase: any) => {
        const anItem = iCase.values
        anItem.Sample = measuresCollectedSoFar + 1
        return anItem
      })
    const createCaseResult = await codapInterface.sendRequest({
      action: 'create',
      resource: `dataContext[${theParams.name}].item`,
      values: items
    }).catch((reason) => {
      console.log('unable to create case because ' + reason);
    })
  }
}

export async function dataContextHasRandomFormula(name: string): Promise<boolean> {
  let foundRandomFormula = false
  const dataContextResult: any = await codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${name}]`
  }).catch((reason) => {
    console.log('unable to get data context because ' + reason);
  })
  if (dataContextResult && dataContextResult.success) {
    const tCollections = dataContextResult.values.collections
    if (tCollections) {
      tCollections.forEach((iCollection: any) => {
        if (iCollection.attrs) {
          iCollection.attrs.forEach((iAttr: any) => {
            if (iAttr.formula && iAttr.formula.includes('random')) {
              foundRandomFormula = true
            }
          })
        }
      })
    }
  }
  return foundRandomFormula
}

export async function dataContextHasParentCollection(name: string): Promise<boolean> {
  let foundParentCollection = false
  const dataContextResult: any = await codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${name}]`
  }).catch((reason) => {
    console.log('unable to get data context because ' + reason);
  })
  if (dataContextResult && dataContextResult.success) {
    const tCollections = dataContextResult.values.collections
    foundParentCollection = tCollections && tCollections.length > 1
  }
  return foundParentCollection
}
