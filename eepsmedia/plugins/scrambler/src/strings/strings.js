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

scramblerStrings = (function () {
    const stringIDPrefix = 'DG.plugin.Scrambler.';
    return {
        fetchStrings: async function () {
            const resp = await fetch('./src/strings/strings.json')
            if (resp.ok) {
                return await resp.json();
            } else {
                console.log(`Fetch of ./src/strings/strings.json failed: ${resp.statusText}`)
                return {};
            }
        },
        initializeStrings: async function (iLang = "en") {

            const allStrings = await this.fetchStrings();
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
                    name: myStrings.name,
                    title: myStrings.name,
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
                `scrambledDataButtonName`).title = myStrings.shShowScrambledButtonHelpText;
        },

        languages: ['en', 'es', 'de'],

        // en: {
        //     name: "English",
        //     flags: ["🇬🇧", "🇺🇸", "🇳🇿", "🇨🇦"],
        //
        //     staticStrings: {
        //         scramblerTitle: `scrambler`,
        //         cantScrambleStripe: `Fix that to proceed.`,
        //         howManyLabel: `how many?`,
        //         scrambledDataButtonName: `show scrambled`,   //  show scrambled [data]
        //     },
        //
        //     sScramble: `scramble`,
        //     sNoAttribute: `no attribute :(`,
        //     sIterationAttName: `batch`,
        //     sIterationAttDescription: `Which "run" of data. Increases every time you scramble.`,
        //     sScrambledAttName: `scrambled att`,
        //     sScrambledAttDescription: `Which attribute was scrambled.`,
        //
        //     sNoDataset: `Find a dataset and drag the attribute here that you want to scramble!`,
        //     sNoScrambleAttribute: `What attribute do you want to scramble? Drag it in here. `,
        //
        //     shShowScrambledButtonHelpText: `Show one scrambled dataset`,
        //
        //     sfScrambledAttribute: (tAttName) => {
        //         return `scramble <code>${tAttName}</code>`;
        //     },
        //
        //     sfOKtoScramble: (tAttName, tDSTitle) => {
        //         return `OK to scramble "${tAttName}" in dataset "${tDSTitle}"`
        //     },
        //
        //     sfNoMeasure: (tDSTitle) => {
        //         return `Your dataset, "${tDSTitle}," needs a measure,
        //         which is probably an attribute with a formula.
        //         Drag that attribute to the left so you have something to collect!`
        //     },
        //
        //     sfFormulaProblem: (tAttName, lastCollName, suchAs) => {
        //         return `Scrambling ${tAttName} won't work because it has a formula.
        //                 Drag in a different attribute from the last collection (${lastCollName}), such as ${suchAs}.`
        //     },
        //
        //     sfNotALeafProblem: (tAttName, lastCollName, suchAs) => {
        //         return `Scrambling ${tAttName} won't work because it's not in the last collection (${lastCollName}).
        //                 Drop an attribute here from ${lastCollName}, such as ${suchAs}.`
        //     }
        //
        //
        // },
        //
        // es: {
        //     name: "Español",
        //     flags: ["🇲🇽", "🇪🇸", "🇨🇷"],
        //
        //     staticStrings: {
        //         scramblerTitle: `mezcladora`,  //  scrambler
        //         cantScrambleStripe: `Arreglar eso para continuar`,  //  `Fix that to proceed.`,
        //         howManyLabel: `cuántos?`, //  `how many?`,
        //         scrambledDataButtonName: `muestre lo mezclado`,   //  show scrambled [data]
        //     },
        //
        //     sScramble: `mezclar`,      //  `scramble`,
        //     sNoAttribute: `sin atributo :(`,
        //     sIterationAttName: `lote`,     //          batch
        //     sIterationAttDescription: `Cuál "lote" de datos. Se aumenta cada mezclado.`,   //  `Which "run" of data. Increases every time you scramble.`,
        //     sScrambledAttName: `atr mezclado`,     //  `scrambled att`, (the name of the scrambled att)
        //     sScrambledAttDescription: `Qué atributo fue mezclado.`,
        //
        //     sNoDataset: `¡Busque un conjunto de datos y arrastre el atributo aquí que desea mezclar!`,
        //     sNoScrambleAttribute: `¿Qué atributo desea mezclar? Arrástrelo aquí. `,
        //
        //     shShowScrambledButtonHelpText: `Muestre un conjunto de datos mezclado`,
        //
        //     sfScrambledAttribute: (tAttName) => {
        //         return `mezcle <code>${tAttName}</code>`
        //     },
        //
        //     sfOKtoScramble: (tAttName, tDSTitle) => {
        //         return `Está bien mezclar "${tAttName}" en el conjunto de datos "${tDSTitle}"`
        //     },
        //
        //     sfNoMeasure: (tDSTitle) => {
        //         return `Su conjunto de datos, "${tDSTitle}," necesita una medida,
        //         probablemente un atributo con fórmula.
        //         Arrastre eso atributo a la izquierda para obtener algo de acumular!`
        //     },
        //
        //     sfFormulaProblem: (tAttName, lastCollName, suchAs) => {
        //         return `Mezclar ${tAttName} no funcionará porque tiene una fórmula.
        //                 Arrastre un atributo diferente hasta la última colección (${lastCollName}), por ejemplo ${suchAs}.`
        //     },
        //
        //     sfNotALeafProblem: (tAttName, lastCollName, suchAs) => {
        //         return `Mezclar ${tAttName} no funcionará porque no está en la última colleción (${lastCollName}).
        //                 Ponga un atributo aquí de la colección ${lastCollName}, por ejemplo ${suchAs}.`
        //     }
        // },
        //
        // de: {
        //     name: "Deutsch", flags: ["🇩🇪", "🇦🇹"],
        //
        //     staticStrings: {
        //         scramblerTitle: `Mischmaschine`,   //  scrambler
        //         cantScrambleStripe: `Dies ändern, um weiter zu machen.`, // `Fix that to proceed.`,
        //         howManyLabel: `Wie häufig?`,      //  how many
        //         scrambledDataButtonName: `Mischungen anzeigen`,   //  show scrambled [data]
        //     },
        //
        //     sScramble: `Mischen`,   //  `scramble`,
        //     sNoAttribute: `ein Merkmal fehlt :(`,   //``no attribute :(`,
        //     sIterationAttName: `Durchgang`,    //`batch`,
        //     sIterationAttDescription: `Anzahl der "Durchgänge". Erhöht sich jedes Mal, wenn gemischt wird.`, //  `Which "run" of data. Increases every time you scramble.`,
        //     sScrambledAttName: `Gemischtes Merkmal`,      //  scrambled att
        //     sScrambledAttDescription: `Merkmal, welches gemischt wurde.`, //   `Which attribute was scrambled.`,
        //
        //     sNoDataset: `Wählen Sie einen Datensatz und ziehen Sie das Merkmal hierher, welches gemischt werden soll!`, //  `Find a dataset and drag the attribute here that you want to scramble!`,
        //     sNoScrambleAttribute: `Welches Merkmal soll gemischt werden? Hierher ziehen!`, //  `What attribute do you want to scramble? Drag it in here. `,
        //
        //     shShowScrambledButtonHelpText: `einen vermischten Datensatz anzeigen`,
        //
        //     sfScrambledAttribute: (tAttName) => {
        //         return `<code>${tAttName}</code> mischen`;
        //     },
        //
        //     sfOKtoScramble: (tAttName, tDSTitle) => {
        //         return `<span><code>${tAttName}</code> im Datensatz "${tDSTitle}" kann gemischt werden.</span>`
        //         //  return  `OK to scramble "${tAttName}" in dataset "${tDSTitle}"`
        //     },
        //
        //     sfNoMeasure: (tDSTitle) => {
        //         return `Zuerst muss im Datensatz "${tDSTitle}" etwas geändert werden.
        //     Wahrscheinlich benötigen Sie zuerst ein Merkmal mit einer Formel.
        //     Ziehen Sie ein Merkmal nach links, um etwas zum Sammeln zu haben.`
        //         /*
        //                     return `Your dataset, "${tDSTitle}," needs a measure,
        //                         which is probably an attribute with a formula.
        //                         Drag that attribute to the left so you have something to collect!`
        //         */
        //     },
        //
        //     sfFormulaProblem: (tAttName, lastCollName, suchAs) => {
        //         return `<span>Das Mischen von <code>${tAttName}</code> wird nicht funktionieren,
        //         weil es eine Formel beinhaltet.
        //         Ziehen Sie ein anderes Merkmal
        //         aus der unteren Tabellenebene (${lastCollName}) hier hinein, z.B. <code>${suchAs}</code>.</span>`
        //
        //         /*
        //                     return `Scrambling ${tAttName} won't work because it has a formula.
        //                                 Drag in a different attribute from the last collection (${lastCollName}),
        //                                 such as ${suchAs}.`
        //         */
        //     },
        //
        //     sfNotALeafProblem: (tAttName, lastCollName, suchAs) => {
        //         return `<span>Das Mischen von <code>${tAttName}</code> wird nicht funktionieren,
        //                 weil es sich nicht in der unteren Tabellenebene (${lastCollName}) befindet.
        //                 Ziehen Sie ein Merkmal aus ${lastCollName} hierher, wie <code>${suchAs}</code>.</span>`
        //         /*
        //                     return `Scrambling ${tAttName} won't work because it's not in the last collection (${lastCollName}).
        //                                 Drop an attribute here from ${lastCollName}, such as ${suchAs}.`
        //         */
        //     }
        //
        //
        // },
    }
}());
