
let DG = {
    plugins : null,
};

let lottiStringSources = {};


lotti.strings = {

    attributeNameToEnglish : [],

    language: null,

    initialize: function () {
        this.setLanguage(localizePlugin.figureOutLanguage('en'));
    },

    setLanguage: function (iLang) {
        this.attributeNameToEnglish = [];
        this.language = iLang;
        DG.plugins = lottiStringSources[iLang];
        this.setStaticStrings();
        this.setupCODAPDataset();
    },

    setupCODAPDataset: function () {
        this.setAttributeNameTranslations();
    },

    setStaticStrings: async function () {

        //  substitute all the static strings in the UI (by `id`)
        const theStaticStrings = DG.plugins.lotti.staticStrings;
        for (const theID in theStaticStrings) {
            if (theStaticStrings.hasOwnProperty(theID)) {
                const theValue = theStaticStrings[theID];
                try {
                    document.getElementById(theID).innerHTML = theValue;
                    //  console.log(`Set string for ${theID} in ${iLang}`);
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }

    },

    setAttributeNameTranslations: function () {
        let theLocalizedStrings = DG.plugins.lotti.attributeNames;

        for (const key in theLocalizedStrings) {
            const localName = theLocalizedStrings[key];
            this.attributeNameToEnglish[localName] = key;
        }
    },

    /**
     * Translate a single turn (object) to the local language.
     *
     * @param iValues
     * @returns {*|{}}
     */
    translateTurnToLocalLanguage: function (iValues) {
        out = {};
        for (const a in iValues) {
            if (iValues.hasOwnProperty(a)) {
                const index = DG.plugins.lotti.attributeNames[a];
                if (index) {
                    out[index] = iValues[a];
                } else {
                    out[a] = iValues[a];
                }
            }
        }
        return out;
    },

}