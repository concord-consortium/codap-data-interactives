import codapInterface from "./CodapInterface";

export interface EntityInfo {
  name: string,
  title: string,
  id: number
}
export const kEmptyEntityInfo = {name: '', title: '', id: 0}

export function initializePlugin(pluginName: string, version: string, dimensions: { width: number, height: number },
                                 iRestoreStateHandler: (arg0: any) => void) {
  const interfaceConfig = {
    name: pluginName,
    version: version,
    dimensions: dimensions,
    preventDataContextReorg: false,
    preventBringToFront: true,
    cannotClose: true
  };
  return codapInterface.init(interfaceConfig, iRestoreStateHandler);
}

export const dataSetString = (contextName: string) => `dataContext[${contextName}]`;

/**
 * Return the names of datasets that pass the given filter
 * @param iFilter
 */
export async function getDatasetInfoWithFilter(iFilter: (value: any) => boolean): Promise<EntityInfo[]> {
  const tDatasetInfoArray: EntityInfo[] = [],
    tContextListResult: any = await codapInterface.sendRequest({
      "action": "get",
      "resource": "dataContextList"
    }).catch((reason) => {
      console.log('unable to get datacontext list because ' + reason);
    });
  if (!(tContextListResult && tContextListResult.success))
    return []
  else {
    for (let tIndex = 0; tIndex < tContextListResult.values.length; tIndex++) {
      let aValue = tContextListResult.values[tIndex]
      if (iFilter(aValue))
        tDatasetInfoArray.push(
          {
            title: aValue.title,
            name: aValue.name,
            id: aValue.id,
          });
    }
  }
  return tDatasetInfoArray
}

export async function getAllDatasetIds() {
  const datasetInfoArray = await getDatasetInfoWithFilter(() => true)
  return datasetInfoArray.map((dsInfo) => dsInfo.id)
}

export async function getAllDatasetNames() {
  const datasetInfoArray = await getDatasetInfoWithFilter(() => true)
  return datasetInfoArray.map((dsInfo) => dsInfo.name)
}

export async function datasetByIdExists(id: number) {
  const allDatasetNames = await getAllDatasetIds()
  return allDatasetNames.indexOf(id) >= 0
}

export async function datasetByNameExists(name: string) {
  const allDatasetNames = await getAllDatasetNames()
  return allDatasetNames.indexOf(name) >= 0
}

export async function getDatasetInfoById(id: number): Promise<any> {
  const tResult: any = await codapInterface.sendRequest({
    "action": "get",
    "resource": dataSetString(id.toString())
  }).catch((reason) => {
    console.log('unable to get datacontext ' + reason);
  });
  if (!(tResult && tResult.success)) {
    return null
  }
  return tResult.values
}

export async function getDatasetInfoByName(name: string): Promise<any> {
  const tResult: any = await codapInterface.sendRequest({
    "action": "get",
    "resource": dataSetString(name.toString())
  }).catch((reason) => {
    console.log('unable to get datacontext ' + reason);
  });
  if (!(tResult && tResult.success)) {
    return null
  }
  return tResult.values
}

/**
 * Find the case table or case card corresponding to the given dataset
 * @param iDatasetInfo
 */
export async function guaranteeTableOrCardIsVisibleFor(iDatasetInfo: EntityInfo) {
  if (iDatasetInfo.name !== '' && iDatasetInfo.title !== '') {
    const cardID = await getComponentByTypeAndTitleOrName(
      'caseCard', iDatasetInfo.title, iDatasetInfo.name),
      tFoundCard = cardID >= 0,
      tableID = await getComponentByTypeAndTitleOrName(
        'caseTable', iDatasetInfo.title, iDatasetInfo.name),
      tFoundTable = tableID >= 0
    if (!(tFoundCard || tFoundTable)) {
      await codapInterface.sendRequest({
        action: 'create',
        resource: `component`,
        values: {
          type: 'caseTable',
          name: iDatasetInfo.name,
          title: iDatasetInfo.title,
          dataContext: iDatasetInfo.name
        }
      })
    }
  }
}

export async function getComponentByTypeAndTitleOrName(iType: string, iTitle: string, iName:string): Promise<number> {
  const tListResult: any = await codapInterface.sendRequest(
    {
      action: 'get',
      resource: `componentList`
    }
  )
    .catch(() => {
      console.log('Error getting component list')
    });
  // console.log(`tListResult = ${JSON.stringify(tListResult)}`)
  let tID = -1;
  if (tListResult.success) {
    let tFoundValue = tListResult.values.find((iValue: any) => {
      return iValue.type === iType && (iValue.title === iTitle || iValue.name === iName);
    });
    if (tFoundValue)
      tID = tFoundValue.id;
  }
  return tID;
}

export async function getParentLevelAttributeNames(iDatasetInfo: EntityInfo): Promise<any> {
  const returnedInfo:{parentCollectionName:string, attrNames:string[]} = { parentCollectionName: '', attrNames: []},
    tResult: any = await codapInterface.sendRequest({
    "action": "get",
    "resource": dataSetString(iDatasetInfo.name)
  }).catch((reason) => {
    console.log('unable to get datacontext ' + reason);
  })
  if (tResult && tResult.success) {
    const collections = tResult.values.collections
    if (collections.length > 1) {
      const parentCollection = collections[0]
      returnedInfo.parentCollectionName = parentCollection.name
      parentCollection.attrs.forEach((attr: any) => {
        returnedInfo.attrNames.push(attr.name)
      })
    }
  }
  return returnedInfo
}

export async function numberOfCasesInCollection(datasetName:string, collectionName:string): Promise<number> {
  const tResult: any = await codapInterface.sendRequest({
    "action": "get",
    "resource": `${dataSetString(datasetName)}.collection[${collectionName}].caseCount`
  }).catch((reason) => {
    console.log('unable to get datacontext ' + reason);
  })
  if (tResult && tResult.success) {
    return tResult.values
  }
  return 0
}

export async function getAllAttributeNames(datasetName:string): Promise<string[]> {
  const attributeNames:string[] = []
  const getDatasetResult: any = await codapInterface.sendRequest({
    "action": "get",
    "resource": dataSetString(datasetName)
  }).catch((reason) => {
    console.log('unable to get datacontext ' + reason);
  })
  if (getDatasetResult && getDatasetResult.success) {
    const collections = getDatasetResult.values.collections
    collections.forEach((collection: any) => {
      collection.attrs.forEach((attr: any) => {
        attributeNames.push(attr.name)
      })
    })
  }
  return attributeNames
}