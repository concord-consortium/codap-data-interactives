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

var merc = (function () {
  var TILE_SIZE = 256;
  var pixelOrigin_ = {x: TILE_SIZE / 2, y: TILE_SIZE / 2};
  var pixelsPerLonDegree_ = TILE_SIZE / 360;
  var pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);

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
    var point = {x: null, y: null};
    var origin = pixelOrigin_;

    point.x = origin.x + latLng.lng * pixelsPerLonDegree_;

    // Truncating to 0.9999 effectively limits latitude to 89.189. This is
    // about a third of a tile past the edge of the world tile.
    var siny = _bound(Math.sin(_degreesToRadians(latLng.lat)), -0.9999, 0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -pixelsPerLonRadian_;

    return point;
  }

  function fromPointToLatLng(point) {
    var origin = pixelOrigin_;
    var lng = (point.x - origin.x) / pixelsPerLonDegree_;
    var latRadians = (point.y - origin.y) / -pixelsPerLonRadian_;
    var lat = _radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);

    return {lat: lat, lng: lng};
  }

  return {
    fromLatLngToPoint: fromLatLngToPoint,
    fromPointToLatLng: fromPointToLatLng
  };
}());

var kGeometryTypes = {
  Point:true,
  MultiPoint:true,
  LineString:true,
  MultiLineString:true,
  Polygon:true,
  MultiPolygon:true,
  GeometryCollection:true
};

function renderGeoJSONToSVG(geojson) {
  var refLng = null;
  var bBox = {
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
    var start = coords.shift();
    var pathDef = 'M' + start.x + ',' + start.y + ' L' + coords.map(function (pt/*, ix*/){
      return pt.x + ' ' + pt.y + ' ';
    }).join();
    return '<path stroke-width="1" stroke="blue" d="' + pathDef + '" />';
  }
  function renderPolygon(coords) {
    var pathDef = coords.map(function (linearRing) {
      var start = linearRing.shift();
      var pathDef = 'M' + start.x + ',' + start.y + ' L' + linearRing.map(function (pt/*, ix*/){
        return pt.x + ' ' + pt.y + ' ';
      }).join();
      return pathDef;
    }).join();
    var svg = '<path stroke-width="0" fill="blue" d="' + pathDef + '"/>';
    return svg;
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
  var renderers = {
    Point: function (geojson) {
      var coord = latLongToXY(geojson.coordinates);
      adjustBBox(coord);
      return renderPoint(coord);
    },
    MultiPoint: function (geojson) {
      var coords = geojson.coordinates;
      var dots = coords.map(function (coord) {
        var xyCoord = latLongToXY(coord);
        adjustBBox(coord);
        return renderPoint(xyCoord);
      });
      return dots.join('');
    },
    LineString: function (geojson) {
      var coords = geojson.coordinates;
      var xys = coords.map(function(coord) {
        var xy = latLongToXY(coord);
        adjustBBox(xy);
        return xy;
      });
      var svg = renderLine(xys);
      return svg;
    },
    MultiLineString: function (geojson) {
      var lines = geojson.coordinates;
      var svg = lines.map(function (line) {
        return renderers.LineString({coordinates: line });
      }).join('');
      return svg;
    },
    Polygon: function (geojson) {
      var coords = geojson.coordinates;
      var xys = coords.map(function(lineString) {
        return lineString.map(function(coord) {
          var xy = latLongToXY(coord);
          adjustBBox(xy);
          return xy;
        });
      });
      var svg = renderPolygon(xys);
      return svg;
    },
    MultiPolygon: function(geojson) {
      var polygons = geojson.coordinates;
      var svg = polygons.map(function (polygon) {
        return renderers.Polygon({coordinates: polygon });
      }).join('');
      return svg;
    },
    GeometryCollection: function (geojson) {
      var geometries = geojson.geometries;
      geometries.map(function(geometry) {
        var fn = renderers[geometry.type];
        if (!fn) {
          console.log("Unknown type: " + geometry.type);
        }
        return fn(geometry);
      }).join('');
    },
    Feature: function (geojson) {
      var geometry = geojson.geometry;
      var fn = renderers[geometry.type];
      if (!fn) {
        console.log("Unknown type: " + geometry.type);
      }
      return fn(geometry);
    },
    FeatureCollection: function (geojson) {
      var features = geojson.features;
      var svg = features.map(function (feature) {
        return renderers.Feature(feature);
      }).join();
      return svg.join('');
    }
  };
  if (!geojson) {
    return;
  }
  var fn = renderers[geojson.type];
  if (!fn) {
    console.log("Unknown type: " + geojson.type);
    return;
  }
  var svg = fn(geojson);
  var imgW = bBox.xMax-bBox.xMin;
  var imgH = bBox.yMax-bBox.yMin;
  var delta = (imgW - imgH) / 2;
  var x,y,w,h;
  if (delta < 0) {
    x = bBox.xMin - delta;
    y = bBox.yMin;
    w = imgW + (delta * 2);
    h = imgH;
  } else {
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
  //   var svg = new Rsvg(svgText);
  //   var rendering = new Buffer(svg.render({
  //     format: 'png',
  //     width: svg.width,
  //     height: svg.height
  //   }).data);
  //   return rendering;
  // }

function formatAsDataURI(png, mime) {
  var out = 'data:' + mime + ';base64,' + btoa(png);
  return out;
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
  var svg = renderGeoJSONToSVG(feature);
  // console.log(svg);
  // var png = svg && convertSVGtoPNG(svg);
  // var dataURI = png && formatAsDataURI(png, 'image/png');
  var dataURI = svg && formatAsDataURI(svg, 'image/svg+xml');
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

  var retval = fn(obj);

  if (!retval && (typeof obj === 'object')) {
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        retval = visitProperties(obj[p], fn, depth-1);
        if (retval) { break; }
      }
    }
  }
  return retval;
}


function convertTopoJSONToGeoJSON(topo) {
  var collection = visitProperties(topo, function (obj) {
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
  var values = {};
  return !geoJSONObject.features.some(function (feature) {
    var value = feature.properties[propertyName];
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
  var hasShapeData = false;
  var hasPointData = false;

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
 * @param geoJSONObject
 * @param url
 * @return {{featureKeys: Array, dataset: {collections: Array, meta: {source: *, createDate: Date}, name: string}}}
 */
function defineDataset(geoJSONObject, url, datasetName, collectionName, createKeySubcollection) {
  var hasShapeData = false;
  var hasPointData = false;

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