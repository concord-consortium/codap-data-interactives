import codapInterface from "./CodapInterface";

export async function initializePlugin(pluginName: string, version: string, dimensions: {width: number, height: number}) {
  const interfaceConfig = {
    name: pluginName,
    version: version,
    dimensions: dimensions
  };
  await codapInterface.init(interfaceConfig);
}

const dataSetString = (contextName: string) => `dataContext[${contextName}]`;

