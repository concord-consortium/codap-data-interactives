// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2020 by The Concord Consortium, Inc. All rights reserved.
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

const kGeonamesService = 'https://secure.geonames.org/search'
const kMinQueryInterval = 800;
const kDefaultMaxRows = 5;
const kMinNameLength = 3;

const kPlaceholderText = 'city, state';

const kClassGeoNameInput = 'geo-name-select';
const kClassSelectList = 'selection-list';
const kClassSelectOption = 'selector-option';
const kClassHidden = 'hidden';

class GeonameSearch {
  myGeonamesUser;
  selectionHandler;

  inputEl = null; // the selection text element
  selectionListEl = null; // the initially hidden selection list element

  placeList = [];
  selectedPlace;

  queryInProgress = false;
  timer = null;


  /**
   * Formats and ends a query to geonames.org.
   * @param searchString {string} free form city, state
   * @param [maxRows] {number} number of results
   * @return {Promise<Uint8Array|BigInt64Array|{latitude: *, name: string, longitude: *}[]|Float64Array|Int8Array|Float32Array|Int32Array|Uint32Array|Uint8ClampedArray|BigUint64Array|Int16Array|Uint16Array>}
   */
  async geoNameSearch(searchString, maxRows) {
    const userClause = `username=${this.myGeonamesUser}`;
    const countryClause = 'country=US';
    const maxRowsClause = `maxRows=${maxRows || kDefaultMaxRows}`;
    const featureClassClause = 'featureClass=P'; // populated places
    const languageClause = 'lang=en';
    const typeClause = 'type=json';
    const nameRequiredClause = 'isNameRequired=true';

    let nameClause = `q=${searchString}`;
    let url = `${kGeonamesService}?${[userClause, countryClause, maxRowsClause, featureClassClause, languageClause, typeClause, nameRequiredClause, nameClause].join(
        '&')}`;
    let response = await fetch(url);
    if (response.ok) {
      let data = await response.json();
      if (data.totalResultsCount > 0) {
        console.log(JSON.stringify(data));
        return data.geonames.map(function (place) {
          return {
            name: `${place.name}, ${place.adminCode1}`,
            latitude: place.lat,
            longitude: place.lng
          };
        });
      }
    }
  }

  /**
   * Populates the selector list with place names.
   *
   * Creates elements if they don't exist. Hides them if they are unneeded
   * for current list.
   * @param containerEl {Element} The element that will contain the option list.
   * @param placeList {[Object]} A list of objects. The name property of each
   * object should be displayed.
   */
  populateGeoNameSelector(containerEl, placeList) {
    let optionEls = containerEl.querySelectorAll('.selector-option');
    containerEl.classList.remove(kClassHidden);
    let optionEl;
    optionEls.forEach(function (el) {
      el.classList.add(kClassHidden);
    });
    placeList.forEach(function (place, ix) {
      if (optionEls && optionEls[ix]) {
        optionEl = optionEls[ix];
        optionEl.classList.remove(kClassHidden);
      } else {
        optionEl = document.createElement('div');
        optionEl.classList.add(kClassSelectOption);
        containerEl.append(optionEl);
      }
      optionEl.innerText = place.name;
      optionEl.setAttribute('dataIx', ix);
    });
  }

  /**
   * Fetch selection list of candidate places.
   * @return {Promise<void>}
   */
  async autoComplete() {
    let thisQuery = this.inputEl.value;
    try {
      this.queryInProgress = true;
      let placeList = await this.geoNameSearch(thisQuery);
      this.placeList = placeList || [];
      this.populateGeoNameSelector(this.selectionListEl, this.placeList);
    } finally {
      this.queryInProgress = false;
    }
  }

  /**
   * Constructs the class.
   * @param attachmentEl {Element}
   * @param geonamesUser {String}
   * @param selectionEventHandler {function} Callback
   */
  constructor(attachmentEl, geonamesUser, selectionEventHandler) {
    let _this = this;

    function handleTimeout(/*ev*/) {
      _this.timer = null;
      _this.autoComplete();
    }

    /**
     * Handle a change to the text input.
     *
     * @param ev
     */
    function handleKeyDown(ev) {
      if (ev.key === 'Enter') {
        _this.autoComplete();
      }
      let value = this.value;
      _this.selectedPlace = null;
      if (value.length >= kMinNameLength) {
        if (_this.timer) {
          clearTimeout(_this.timer);
        }
        _this.timer = setTimeout(handleTimeout, kMinQueryInterval);
      }
    }

    function handlePlaceNameSelection(ev) {
      let target = ev.target;
      if (target.classList.contains('selector-option')) {
        _this.inputEl.value = target.innerText;
        _this.selectedPlace = _this.placeList[Number(target.attributes.dataix.value)];
        _this.selectionHandler(_this.selectedPlace);
      }
      this.classList.add(kClassHidden);
    }

    this.selectionHandler = selectionEventHandler;
    this.myGeonamesUser = geonamesUser;

    // create the input element and selection menu as children of the
    // attachmentElement
    let el = document.createElement('input');
    el.classList.add(kClassGeoNameInput);
    el.setAttribute('type', 'text');
    el.setAttribute('placeholder', kPlaceholderText);
    el.addEventListener('keydown', handleKeyDown);
    this.inputEl = el;
    attachmentEl.append(el);
    el = document.createElement('div');
    el.classList.add(kClassSelectList);
    el.classList.add(kClassHidden);
    el.addEventListener('click', handlePlaceNameSelection)
    this.selectionListEl = el;
    attachmentEl.append(el);
  }
}

export {
  GeonameSearch
}
