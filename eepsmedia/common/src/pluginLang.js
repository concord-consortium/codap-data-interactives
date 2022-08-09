/*
==========================================================================

 * Created by tim on 11/8/21.
 
 
 ==========================================================================
pluginLang in common

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/

/**
 * A singleton global with language (internationalization) utilities
 *
 * Mostly, call `pluginLang.figureOutLanguage('en', theLanguages)` to get the two-letter code to use.
 *
 * @type {{figureOutLanguage: (function(*, *): *)}}
 */
const pluginLang = {

    /**
     * Get a two-letter language code from a variety of sources.
     *
     * @param iDefaultLanguage  the default laguage in case none of the following work
     * @param iSupportedLanguages an array of two-letter codes for the languages the plugin supports
     * @returns {*}     resulting two-letter code
     */
    figureOutLanguage:  function (iDefaultLanguage, iSupportedLanguages) {

        let lOut = iDefaultLanguage;

        //  find the user's favorite language that's actually in our list

        const userLanguages = Array.from(navigator.languages).reverse();
        const pluginLanguages = iSupportedLanguages;

        userLanguages.forEach((L) => {
            console.log(`user has lang ${L}`);
            const twoLetter = L.slice(0, 2).toLowerCase();
            if (pluginLanguages.includes(twoLetter)) {
                if (lOut !== twoLetter) {
                    lOut = twoLetter;
                    console.log(`    change lang to ${lOut} from user preferences`);
                }
            }
        })

        lOut = this.getLangFromURL() || lOut;   //  lang from URL has priority

        return lOut;
    },

    /**
     * Finds the two-letter code in a `lang` URL parameter if it exists. Returns `null` if none.
     * @returns {null}
     */
    getLangFromURL : function() {
        const params = new URLSearchParams(document.location.search.substring(1));
        const langParam = params.get("lang");

        if (langParam) {
            console.log(`Got language ${langParam} from input parameters`);
        } else {
            console.log(`no "lang" parameter in URL`);
        }
        return langParam;
    },

    pluralize: function (iSingular = "noun", iArticle = "") {
        const specialNouns = [
            "fish", "deer", "series", "offspring", "sheep", "bison", "cod",
        ]

        let thePlural = iSingular;
        const theLength = thePlural.length;
        const lower = iSingular.toLocaleLowerCase();

        if (!specialNouns.includes(lower)) {
            const lastOne = lower.slice(-1);
            const lastTwo = lower.slice(-2);

            if (lower.slice(-5) === "craft") {
                thePlural = iSingular;
            } else if (thePlural === "man") {   //  todo: do that slice thing so frogman -> frogmen
                thePlural = "men";
            } else if (thePlural === 'woman') {
                thePlural = 'women';
            } else if (thePlural === 'child') {
                thePlural = 'children';
            } else if (thePlural === 'radius') {
                thePlural = 'radii';
            } else if (thePlural === 'die') {
                thePlural = 'dice';
                /*
                            } else if (lastTwo === 'um') {
                                thePlural = thePlural.slice(0, theLength - 2) + "a";
                            } else if (lastTwo === 'us') {
                                thePlural = thePlural.slice(0,theLength-2) + "i";
                */
            } else if (lastTwo === 'zz') {
                thePlural = thePlural + "es";
            } else if (lastOne === 's') {
                thePlural = thePlural + "es";
            } else if (lastOne === 'z') {
                thePlural = thePlural + "zes";
            } else if (lastOne === 'y' &&
                lastTwo === 'ly' || lastTwo === 'ty' || lastTwo === 'dy' || lastTwo === 'cy' ||
                lastTwo === 'fy' || lastTwo === 'gy' || lastTwo === 'zy' || lastTwo === 'ry' ||
                lastTwo === 'my' || lastTwo === 'ny' || lastTwo === 'py' || lastTwo === 'sy') {
                thePlural = thePlural.slice(0, theLength - 1) + "ies";
            } else {
                thePlural = thePlural + "s";
            }
        }

        return thePlural;
    },

}


