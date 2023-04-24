let DG = {
    plugins : null,
};

let simmerStrings = {};

simmer.strings = {

    language: null,

    initialize: function () {
        this.setLanguage(localizePlugin.figureOutLanguage('en'));
    },

    setLanguage: function (iLang) {
        //  this.attributeNameToEnglish = [];
        this.language = iLang;
        DG.plugins = simmerStrings[iLang];
        this.setStaticStrings();
        this.setToolTipTexts();
        //  this.setupCODAPDataset();
    },

    setStaticStrings: async function () {

        //  substitute all the static strings in the UI (by `id`)
        const theStaticStrings = DG.plugins.simmer.staticStrings;
        for (const theID in theStaticStrings) {
            if (theStaticStrings.hasOwnProperty(theID)) {
                const theValue = theStaticStrings[theID];
                try {
                    document.getElementById(theID).textContent = theValue;
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }

    },

    setToolTipTexts : async function() {
        const theToolTips = DG.plugins.simmer.toolTips;
        for (const theID in theToolTips) {
            if (theToolTips.hasOwnProperty(theID)) {
                const theValue = theToolTips[theID];
                try {
                    document.getElementById(theID).title = theValue;
                } catch (msg) {
                    console.log(msg + ` on ID = ${theID}`);
                }
            }
        }
    },

}