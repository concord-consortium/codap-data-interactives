// ==========================================================================
//
//  Author:   jsandoe
//
//  Copyright (c) 2019 by The Concord Consortium, Inc. All rights reserved.
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

/*global topojson:true */

let merc = (function () {
  const TILE_SIZE = 256;
  const pixelOrigin_ = {x: TILE_SIZE / 2, y: TILE_SIZE / 2};
  const pixelsPerLonDegree_ = TILE_SIZE / 360;
  const pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);

  function _bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
  }

  function _degreesToRadians(deg) {
    return deg * (Math.PI / 180);
  }

  function _radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
  }

  function fromLatLngToPoint(latLng/*, opt_point*/) {
    let point = {x: null, y: null};
    let origin = pixelOrigin_;

    point.x = origin.x + latLng.lng * pixelsPerLonDegree_;

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    let siny = _bound(Math.sin(_degreesToRadians(latLng.lat)), -0.9999, 0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -pixelsPerLonRadian_;

    return point;
  }

  function fromPointToLatLng(point) {
    let origin = pixelOrigin_;
    let lng = (point.x - origin.x) / pixelsPerLonDegree_;
    let latRadians = (point.y - origin.y) / -pixelsPerLonRadian_;
    let lat = _radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);

    return {lat: lat, lng: lng};
  }

  return {
    fromLatLngToPoint: fromLatLngToPoint,
    fromPointToLatLng: fromPointToLatLng
  };
}());

let kGeometryTypes = {
  Point:true,
  MultiPoint:true,
  LineString:true,
  MultiLineString:true,
  Polygon:true,
  MultiPolygon:true,
  GeometryCollection:true
};

function renderGeoJSONToSVG(geojson) {
  let refLng = null;
  let bBox = {
    xMin: Number.MAX_VALUE,
    yMin: Number.MAX_VALUE,
    xMax: -Number.MAX_VALUE,
    yMax: -Number.MAX_VALUE
  };

  function adjustBBox(pt) {
    bBox.xMin = Math.min(pt.x, bBox.xMin);
    bBox.yMin = Math.min(pt.y, bBox.yMin);
    bBox.xMax = Math.max(pt.x, bBox.xMax);
    bBox.yMax = Math.max(pt.y, bBox.yMax);
  }

  function latLongToXY(coord) {
    return merc.fromLatLngToPoint(adjustForAntimeridian({lat: coord[1], lng: coord[0]}));
  }

  function renderPoint(coord) {
    if (coord) {
      return '<circle r="3" cx="' + coord[0] + '" cy="' + coord[1] + '" />';
    }
  }
  function renderLine(coords) {
    let start = coords.shift();
    let pathDef = 'M' + start.x + ',' + start.y + ' L' + coords.map(function (pt/*, ix*/){
      return pt.x + ' ' + pt.y + ' ';
    }).join();
    return '<path stroke-width="1" stroke="blue" d="' + pathDef + '" />';
  }
  function renderPolygon(coords) {
    let pathDefs = coords.map(function (linearRing) {
      let start = linearRing.shift();
      return 'M' + start.x + ',' + start.y + ' L' + linearRing.map(
          function (pt/*, ix*/) {
            return pt.x + ' ' + pt.y + ' ';
          }).join();
    }).join();
    return '<path stroke-width="0" fill="blue" d="' + pathDefs + '"/>';
  }
  function adjustForAntimeridian(coord) {
    if (!coord) {
      return;
    }
    if (refLng === null) {
      refLng = coord.lng;
    } else if (Math.abs(coord.lng - refLng)>180) {
      coord.lng += (refLng>=0?360:-360);
    }
    return coord;
  }
  let renderers = {
    Point: function (geojson) {
      let coord = latLongToXY(geojson.coordinates);
      adjustBBox(coord);
      return renderPoint(coord);
    },
    MultiPoint: function (geojson) {
      let coords = geojson.coordinates;
      let dots = coords.map(function (coord) {
        let xyCoord = latLongToXY(coord);
        adjustBBox(coord);
        return renderPoint(xyCoord);
      });
      return dots.join('');
    },
    LineString: function (geojson) {
      let coords = geojson.coordinates;
      let xys = coords.map(function(coord) {
        let xy = latLongToXY(coord);
        adjustBBox(xy);
        return xy;
      });
      return renderLine(xys);
    },
    MultiLineString: function (geojson) {
      let lines = geojson.coordinates;
      return lines.map(function (line) {
        return renderers.LineString({coordinates: line});
      }).join('');
    },
    Polygon: function (geojson) {
      let coords = geojson.coordinates;
      let xys = coords.map(function(lineString) {
        return lineString.map(function(coord) {
          let xy = latLongToXY(coord);
          adjustBBox(xy);
          return xy;
        });
      });
      return renderPolygon(xys);
    },
    MultiPolygon: function(geojson) {
      let polygons = geojson.coordinates;
      return polygons.map(function (polygon) {
        return renderers.Polygon({coordinates: polygon});
      }).join('');
    },
    GeometryCollection: function (geojson) {
      let geometries = geojson.geometries;
      geometries.map(function(geometry) {
        let fn = renderers[geometry.type];
        if (!fn) {
          console.log("Unknown type: " + geometry.type);
        }
        return fn(geometry);
      }).join('');
    },
    Feature: function (geojson) {
      let geometry = geojson.geometry;
      let fn = renderers[geometry.type];
      if (!fn) {
        console.log("Unknown type: " + geometry.type);
      }
      return fn(geometry);
    },
    FeatureCollection: function (geojson) {
      let features = geojson.features;
      let svg = features.map(function (feature) {
        return renderers.Feature(feature);
      }).join();
      return svg.join('');
    }
  };
  if (!geojson) {
    return;
  }
  let fn = renderers[geojson.type];
  if (!fn) {
    console.log("Unknown type: " + geojson.type);
    return;
  }
  let svg = fn(geojson);
  let imgW = bBox.xMax-bBox.xMin;
  let imgH = bBox.yMax-bBox.yMin;
  let delta = (imgW - imgH) / 2;
  let x,y,w,h;
  // image is taller than wide
  if (delta < 0) {
    x = bBox.xMin + delta;
    y = bBox.yMin;
    w = imgW - (delta * 2);
    h = imgH;
  } else {
    // image is wider than tall
    x = bBox.xMin;
    y = bBox.yMin - delta;
    w = imgW;
    h = imgH + (delta * 2);
  }
  return '<?xml version="1.0" encoding="UTF-8" ?>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" ' +
      'viewBox="' + [x, y, w, h].join(' ') + '">' + svg + "</svg>";

}

  // function convertSVGtoPNG(svgText) {
  //   let svg = new Rsvg(svgText);
  //   let rendering = new Buffer(svg.render({
  //     format: 'png',
  //     width: svg.width,
  //     height: svg.height
  //   }).data);
  //   return rendering;
  // }

function formatAsDataURI(png, mime) {
  return 'data:' + mime + ';base64,' + btoa(png);
}

function injectThumbnailInGeojsonFeature(feature) {
  if (!feature) {
    return;
  }
  // GeoJSON does not require any particular top-level type, but we need
  // to add a property so, we wrap 'naked' geoJSON in a Feature type.
  if (kGeometryTypes[feature.type]) {
    feature = {
      type: 'Feature',
      properties: {},
      geometry: feature
    };
  }
  let svg = renderGeoJSONToSVG(feature);
  // console.log(svg);
  // let png = svg && convertSVGtoPNG(svg);
  // let dataURI = png && formatAsDataURI(png, 'image/png');
  let dataURI = svg && formatAsDataURI(svg, 'image/svg+xml');
  if (dataURI) {
    if (!feature.properties) { feature.properties = {}; }
    feature.properties.THUMB = dataURI;
  }

  return feature;
}

function visitProperties(obj, fn, depth) {
  if (depth===undefined) {
    depth = 5;
  }
  if (depth < 0) return;

  let retval = fn(obj);

  if (!retval && (typeof obj === 'object')) {
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        retval = visitProperties(obj[p], fn, depth-1);
        if (retval) { break; }
      }
    }
  }
  return retval;
}


function convertTopoJSONToGeoJSON(topo) {
  let collection = visitProperties(topo, function (obj) {
    if (obj && obj.type === 'GeometryCollection') { return obj; }
  });
  if (collection) {
    return topojson.feature(topo, collection);
  }
}

function prepareGeoJSONObject(geojsonDoc, url) {
  try {

    let geoJSONObject = (typeof geojsonDoc === 'string')?
        geojsonDoc.parse(geojsonDoc):geojsonDoc;

    if (geoJSONObject.type === 'Topology') {
      geoJSONObject = convertTopoJSONToGeoJSON(geoJSONObject);
    }
    return geoJSONObject;
  } catch (ex) {
    console.warn('Error preparing geoJSON Document: ' + url);
  }
}

function isPropertyAKey(geoJSONObject, propertyName) {
  let values = {};
  return !geoJSONObject.features.some(function (feature) {
    let value = feature.properties[propertyName];
    if (value === null || value === undefined) {
      return true;
    } else if (values[value]) {
      return true;
    } else {
      values[value] = true;
      return false;
    }
  });
}

function determineAttributeSet(geoJSONObject) {
  let hasShapeData = false;
  let hasPointData = false;

  // identify all feature properties
  let featureProperties = {};
  if (geoJSONObject.features) {
    geoJSONObject.features.forEach(function (feature) {
      if (feature.geometry && feature.geometry.type === 'Point') {
        hasPointData = true;
      } else {
        hasShapeData = true;
      }
      Object.keys(feature.properties).forEach(function (key) {
        featureProperties[key] = true;
      });
    });
  }

  let attributeNames = [];
  Object.keys(featureProperties).forEach(function (propertyName) {
    attributeNames.push(propertyName);
  });
  if (hasShapeData) {
    attributeNames.push('boundary');
  }
  if (hasPointData) {
    attributeNames.push('latitude');
    attributeNames.push('longitude');
  }
  return attributeNames;
}

/**
 * Analyzes a geoJSON object and computes: a dataset object definition that will
 * contain the geoJSON features and a list of feature keys. These are keys that
 * are defined and unique for every feature and can be used to identify the feature.
 *
 * @param geoJSONObject {object}
 * @param url {string}
 * @param datasetName {string}
 * @param collectionName {string}
 * @param createKeySubcollection {boolean}
 * @return {{featureKeys: Array, dataset: {collections: Array, metadata: {source: *, createDate: Date}, name: string}}}
 */
function defineDataset(geoJSONObject, url, datasetName, collectionName, createKeySubcollection) {
  let hasShapeData = false;
  let hasPointData = false;

  // identify all feature properties
  let featureProperties = {};
  if (geoJSONObject.features) {
    geoJSONObject.features.forEach(function (feature) {
      if (feature.geometry && feature.geometry.type === 'Point') {
        hasPointData = true;
      } else {
        hasShapeData = true;
      }
      Object.keys(feature.properties).forEach(function (key) {
        featureProperties[key] = true;
      });
    });
  }

  let featureKeys = [];
  // identify properties that have unique non-null values for each feature
  if (createKeySubcollection) {
    Object.keys(featureProperties).forEach(function (property) {
      if (isPropertyAKey(geoJSONObject, property)) {
        featureKeys.push(property);
      }
    });
  }

  // create data context structure
  let context = {
    name: datasetName || 'data',
    metadata: {
      source: url,
      importDate: new Date()
    },
    collections: []
  };
  let parentCollection = {name: collectionName || 'boundaries', attrs: []};
  Object.keys(featureProperties).forEach(function (propertyName) {
    parentCollection.attrs.push({name: propertyName});
  });
  if (hasShapeData) {
    parentCollection.attrs.push({name: 'boundary', type: 'boundary'});
  }
  if (hasPointData) {
    parentCollection.attrs.push({name: 'latitude'});
    parentCollection.attrs.push({name: 'longitude'});
  }
  context.collections.push(parentCollection);
  if (featureKeys.length) {
    let childCollection = {
      name: 'keys', parent: 'boundaries', attrs: [{name: 'type'}, {name: 'key'}]
    };
    context.collections.push(childCollection);
  }
  return {featureKeys: featureKeys, dataset: context};
}
function createItemList (feature, featureKeys) {
  let type = feature.geometry && feature.geometry.type;
  let itemTemplate = {};
  let items = [];
  if (type === 'Point') {
    let point = feature.geometry.coordinates;
    itemTemplate = Object.assign({latitude: point[1], longitude: point[0]},
        feature.properties);
  } else {
    // create parent case
    itemTemplate = Object.assign({
      boundary: JSON.stringify(
          injectThumbnailInGeojsonFeature(feature.geometry))
    }, feature.properties);
  }
  if (featureKeys && featureKeys.length) {
    featureKeys.forEach(function (key) {
      items.push(Object.assign({}, itemTemplate,
          {type: key, key: feature.properties[key]}));
    });
    if (feature.id) {
      items.push(
          Object.assign({}, itemTemplate, {type: 'id', key: feature.id}));
    } else if (featureKeys.length === 0) {
      // if there are otherwise no keys, we make one up...
      items.push(itemTemplate);
    }
  } else {
    items.push(itemTemplate);
  }
  return items;
}

function createItems(geoJSONObject, featureKeys) {
  let items = [];
  if (geoJSONObject.features) {
    geoJSONObject.features.forEach(function (feature) {
      let itemList = this.createItemList(feature, featureKeys);
      items = items.concat(itemList);
    }.bind(this));
  }
  return items;
}

function getNumRows(geoJSONObject) {
  if (geoJSONObject.features) {
    return geoJSONObject.features.length;
  } else {
    return 0;
  }
}

export {
  createItems,
  createItemList,
  defineDataset,
  determineAttributeSet,
  getNumRows,
  prepareGeoJSONObject,
};
