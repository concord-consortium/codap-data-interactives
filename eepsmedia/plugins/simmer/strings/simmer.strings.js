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
        this.setButtonNames();
        //  this.setupCODAPDataset();
    },

    setStaticStrings: async function () {

        //  substitute all the static strings in the UI (by `id`)
        const theStaticStrings = DG.plugins.simmer.staticStrings;
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

    setButtonNames : async function() {

    },

}