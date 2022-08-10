/*
==========================================================================

 * Created by tim on 10/16/21.
 
 
 ==========================================================================
strings in scrambler

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

stringUtility = (function () {
    const stringIDPrefix = 'DG.plugin.Scrambler.';
    const stringsFileURL = './src/strings/strings.json'
    return {
        strings: null,
        fetchStrings: async function () {
            const resp = await fetch(stringsFileURL);
            if (resp.ok) {
                return await resp.json();
            } else {
                console.log(`Fetch of ${stringsFileURL} failed: ${resp.statusText}`)
                return {};
            }
        },
        initializeStrings: async function (iLang = "en") {

            const allStrings = await this.fetchStrings();
            Object.keys(allStrings).forEach(lang => {
                let baseLang = lang.replace(/-.*/, '');
                if (lang !== baseLang && !allStrings[baseLang]) {
                    allStrings[baseLang] = allStrings[lang];
                }
            })
            let theStrings = allStrings[iLang] || allStrings['en'];     //   scramblerStrings[iLang];
            Object.keys(theStrings)
                    .forEach(key => theStrings[key.replace(stringIDPrefix, '')] = theStrings[key]);

            const staticPrefix = `static.`
            const theStaticStrings = Object.fromEntries(
                Object.entries(theStrings)
                    .filter(entry => entry[0].startsWith(staticPrefix)));

            for (const theID in theStaticStrings) {
                if (theStaticStrings.hasOwnProperty(theID)) {
                    const theValue = theStaticStrings[theID];
                    try {
                        document.getElementById(theID.replace(staticPrefix, '')).innerHTML = theValue;
                        //  console.log(`Set string for ${theID} in ${iLang}`);
                    } catch (msg) {
                        console.log(msg + ` on ID = ${theID}`);
                    }
                }
            }
            this.strings = theStrings;
            return theStrings;
        },

        /**
         * Set some strings on init or language change that only need to be set once
         *
         * This does NOT need to be awaited; the UI change can be delayed with no problem.
         *
         * @returns {Promise<void>}
         */
        setStrings: async function () {
            //  update the title of the plugin
            const tMessage = {
                action: "update", resource: "interactiveFrame", values: {
                    name: this.strings.name,
                    title: this.strings.name,
                }
            }
            try {
                const tChangeTitleResult = await codapInterface.sendRequest(
                    tMessage);
            } catch (msg) {
                alert(`problem changing the title of the plugin: ${msg}`);
            }

            //  various help texts
            document.getElementById(
                `scrambledDataButtonName`).title = this.strings.shShowScrambledButtonHelpText;
        },

        languages: ['en', 'es', 'de'],
        lookupString: function (stringID) {
            return this.strings[stringID] || stringID;
        },
        /**
         * Translates a string by referencing a hash of translated strings.
         * If the lookup fails, the string ID is used.
         * Arguments after the String ID are substituted for substitution tokens in
         * the looked up string.
         * Substitution tokens can have the form "%@" or "%@" followed by a single digit.
         * Substitution parameters with no digit are substituted sequentially.
         * So, tr('%@, %@, %@', 'one', 'two', 'three') returns 'one, two, three'.
         * Substitution parameters followed by a digit are substituted positionally.
         * So, tr('%@1, %@1, %@2', 'baa', 'black sheep') returns 'baa, baa, black sheep'.
         *
         * @param stringID {{string}} a string id
         * @param args an array of strings or variable sequence of strings
         * @returns {string}
         */
        tr: function (stringID, args) {
            function replacer(match) {
                if (match.length===2) {
                    return (args && args[ix++]) || match;
                } else {
                    return (args && args[match[2]-1]) || match;
                }
            }

            if (typeof args === 'string') {
                args = Array.from(arguments).slice(1);
            }

            let s = this.lookupString(stringID);
            let ix = 0;
            return s.replace(/%@[0-9]?/g, replacer);
        }
    }
}());
