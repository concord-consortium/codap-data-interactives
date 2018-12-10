/*
==========================================================================

 * Created by tim on 9/19/18.
 
 
 ==========================================================================
xeno.strings in xeno

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


XS = {

    setBasicStrings: function () {
        $("#trainingRadioButtonLabel").html(xeno.strings.trainingRadioButtonLabel);
        $("#one-by-oneRadioButtonLabel").html(xeno.strings.oneByOneRadioButtonLabel);
        $("#autoRadioButtonLabel").html(xeno.strings.autoRadioButtonLabel);
        $("#maladyMenuLabel").html(xeno.strings.maladyMenuLabel);
        $("#howManyCasesLabel").html(xeno.strings.howManyCasesLabel);
        $("#yourDiagnosisText").html(xeno.strings.yourDiagnosisText);
        $("#howManyCasesAutoLabel").html(xeno.strings.howManyCasesAutoLabel);

        document.getElementById("makeNewCasesButton").value = (xeno.strings.makeNewCasesButtonText);
        document.getElementById("runTreeButton").value = (xeno.strings.runTreeButtonText);
        document.getElementById("diagnoseSickButton").value = xeno.strings.sick;
        document.getElementById("diagnoseWellButton").value = xeno.strings.well;

        xeno.constants.autoResultInitialText = xeno.strings.autoResultDisplay;
    },

    'en': {
        trainingRadioButtonLabel: "training",
        oneByOneRadioButtonLabel: "one by one",
        autoRadioButtonLabel: "auto",
        howManyCasesLabel : "how many cases?",
        maladyMenuLabel : "malady",
        yourDiagnosisText : "your diagnosis:",
        howManyCasesAutoLabel : "how many cases?",
        autoResultDisplay : "Auto-diagnosis results",

        makeNewCasesButtonText : "make new cases",
        runTreeButtonText : "run tree",

        blue : "blue",
        pink : "pink",
        purple : "purple",
        orange : "orange",
        well : "well",
        sick : "sick",
        true : "T",
        false : "F",
        positive : "P",
        negative : "N",
        clinic : "clinic",

        getSingleDiagnosisReport : function(iDiag, iTF, iPN) {
            let out = "";
            if (iTF === xeno.strings.true) {
                out = "Correct! The previous case was "
                    + iDiag + ".<hr>";
            } else {
                out = "Wrong! The previous case was "
                    + iDiag + ".<hr>";
            }
            return out + "<b>Next case:</b>  ";
        },

creatureString : function (iValues) {
            return iValues.hair + "&nbsp;hair, " +
                iValues.eyes + "&nbsp;eyes, " +
                iValues.antennae + "&nbsp;antennae, " +
                iValues.tentacles + "&nbsp;tentacles, " +
                "height:&nbsp;" + iValues.height + ", " +
                "weight:&nbsp;" + iValues.weight;
        },

        dataContextSetupObject : {
            name: xeno.constants.xenoDataSetName,
            title: xeno.constants.xenoDataSetTitle,
            description: 'our creatures',
            collections: [
                {
                    name: xeno.constants.xenoCollectionName,
                    labels: {
                        singleCase: "creature",
                        pluralCase: "creatures",
                        setOfCasesWithArticle: "list of creatures"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: "health", type: 'categorical', description: "actual health",
                            colormap: {
                                "sick": xeno.constants.sickColor,      //  maps to positive
                                "well": xeno.constants.wellColor       //  maps to negative
                            },
                            isDependent: true
                        },

                        /*  Actual creature attributes. The predictors. */
                        {
                            name: "hair", type: 'categorical', description: "hair color",
                            colormap: {
                                "blue": "cornflowerblue",
                                "pink": "hotpink"
                            }
                        },
                        {
                            name: "eyes", type: 'categorical', description: "eye color",
                            colormap: {
                                "purple": "#60a",
                                "orange": "orange"
                            }
                        },
                        {name: "antennae", type: 'categorical', precision: 0, description: "number of antennae"},
                        {name: "tentacles", type: 'categorical', precision: 0, description: "number of tentacles"},
                        {
                            name: "height",
                            type: 'numeric',
                            precision: 2,
                            units: "fribbets",
                            description: "height in fribbets"
                        },
                        {name: "weight", type: 'numeric', precision: 2, units: "lunk", description: "weight in lunk"},

                        /*
                            Various attributes that are NOT predictors
                         */

                        {
                            name: "diagnosis", title: "diagnosis", type: 'categorical',
                            description: "what you thought the health would be, based on the other data"
                        },
                        {
                            name: "analysis", title: "analysis", type: 'categorical',
                            description: "How accurate was the diagnosis? TP = True Positive, FN = False Negative, etc."
                        },
                        {name: "source", type: 'categorical', description: "where did this case come from?"}


                    ]
                }
            ]
        }

    },


    'de': {
        trainingRadioButtonLabel: "Ausbildung",
        oneByOneRadioButtonLabel: "Stück für Stück",
        autoRadioButtonLabel: "automatisch",
        howManyCasesLabel : "Wieviele Fälle?",
        maladyMenuLabel : "Krankheit",
        yourDiagnosisText : "Ihre Diagnose:",
        howManyCasesAutoLabel : "Wieviele Fälle?",
        autoResultDisplay : "Ergebnisanzeige",

        makeNewCasesButtonText : "machen neue Fälle",
        runTreeButtonText : "benutze Baum",

        blue : "blaue",
        pink : "rosa",
        purple : "lila",
        orange : "orange",
        well : "gesund",
        sick : "krank",
        true : "T",
        false : "F",
        positive : "P",
        negative : "N",
        clinic : "Klinik",

        getSingleDiagnosisReport : function(iDiag, iTF, iPN) {
            let out = "";
            if (iTF === xeno.strings.true) {
                out = "Richtig! Der vorherige Fall war "
                    + iDiag + ".<hr>";
            } else {
                out = "Falsch! Der vorherige Fall war "
                    + iDiag + ".<hr>";
            }
            return out + "<b>Nächste Fall:</b>  ";
        },

        creatureString : function (iValues) {
            return iValues.hair + "&nbsp;Haar, " +
                iValues.eyes + "&nbsp;Augen, " +
                iValues.antennae + "&nbsp;Antennen, " +
                iValues.tentacles + "&nbsp;Tentakeln, " +
                "Größe:&nbsp;" + iValues.height + ", " +
                "Gewicht:&nbsp;" + iValues.weight;
        },

        dataContextSetupObject : {
            name: xeno.constants.xenoDataSetName,
            title: "Kreaturen",
            description: 'unsere Kreaturen',
            collections: [
                {
                    name: xeno.constants.xenoCollectionName,
                    labels: {
                        singleCase: "Kreatur",
                        pluralCase: "Kreaturen",
                        setOfCasesWithArticle: "Liste der Kreaturen"
                    },

                    attrs: [ // note how this is an array of objects.
                        {
                            name: "health", type: 'categorical', description: "tatsächliche Gesundheit",
                            title : "Gesundheit",
                            colormap: {
                                "sick": xeno.constants.sickColor,      //  maps to positive
                                "well": xeno.constants.wellColor       //  maps to negative
                            },
                            isDependent: true
                        },

                        /*  Actual creature attributes. The predictors. */
                        {
                            name: "hair", type: 'categorical', description: "Haarfarbe",
                            title : "Haare",
                            colormap: {
                                "blue": "cornflowerblue",
                                "pink": "hotpink"
                            }
                        },
                        {
                            name: "eyes", type: 'categorical', description: "Augenfarbe",
                            title : "Augen",
                            colormap: {
                                "purple": "#60a",
                                "orange": "orange"
                            }
                        },
                        {name: "antennae", title : "Antennen",
                            type: 'categorical', precision: 0, description: "Antennenanzahl"},
                        {name: "tentacles", title : "Tentakeln", type: 'categorical',
                            precision: 0, description: "Tentakelnanzahl"},
                        {
                            name: "height",
                            title : "Größe",
                            type: 'numeric',
                            precision: 2,
                            units: "fribbets",
                            description: "Größe in Fribbeln"
                        },
                        {name: "weight", title : "Gewicht", type: 'numeric', precision: 2, units: "lunk", description: "Gewicht in Lunken"},

                        /*
                            Various attributes that are NOT predictors
                         */

                        {
                            name: "diagnosis", title: "Diagnose", type: 'categorical',
                            description: "was Sie dachten, die Gesundheit wäre, basierend auf den anderen Daten"
                        },
                        {
                            name: "analysis", title: "Analyse", type: 'categorical',
                            description: "Wie genau war die Diagnose? TP = Wahr Positiv, FN = Falsch Negativ, usw."
                        },
                        {name: "source", title : "Quelle", type: 'categorical', description: "Woher kam dieser Fall?"}


                    ]
                }
            ]
        }

    }
};