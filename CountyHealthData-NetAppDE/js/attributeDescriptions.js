import { attributes } from './attributeConfig.js';

// Build a name-to-description map from attributeConfig.js
const nameToDescription = {};
attributes.forEach(attr => {
  if (attr.name && attr.description) {
    nameToDescription[attr.name] = attr.description;
  }
});

export { nameToDescription }; 