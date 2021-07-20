/**
 * Created by tim on 1/7/16.
 */

/**
 * A  manager class responsible for communicating with the CODAP environment
 * @constructor
 */
arbor.codapConnector = {
    gameCaseID: 0,
    gameNumber: 0,

    /**
     * Emit a "tree" case.
     * @param iValues   the case values
     */
    createClassificationTreeItem: function (iValues) {
        pluginHelper.createItems(
            iValues,
            arbor.constants.kClassTreeDataSetName
        ); // no callback.
    },

    createRegressionTreeItem : function(iValues ) {
        pluginHelper.createItems(
            iValues,
            arbor.constants.kRegressTreeDataSetName
        )
    }

};


/**
 * String needed by codapHelper to initialize a data context
 * @type {{name: string, title: string, description: string, collections: [null]}}
 */
arbor.codapConnector.classificationTreesDataContextSetupString = {
    name: arbor.constants.kClassTreeDataSetName,
    title : arbor.constants.kClassTreeDataSetTitle,
    description : 'records of classification trees',
    collections: [  // fist, simple: one collection
        /*
                {
                    name: arbor.constants.kRecordsGameCollectionName,
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "some games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNumber", type: 'categorical'},
                        {name: "outcome", type: 'categorical'}
                    ],
                    childAttrName: "patient"
                },

        {
            name: arbor.constants.kRecordsPatientsCollectionName,
            //  parent: arbor.constants.kRecordsGameCollectionName,
            labels: {
                singleCase: "patient",
                pluralCase: "patientsAtbaum",
                setOfCasesWithArticle: "a population"
            },
            // The child collection specification:
            attrs: [
                {name: "name", type: 'categorical'},
                {name: "sex", type: 'categorical'},
                {name: "age", type: 'numeric', precision: 1},
                {name: "id", type: 'categorical', hidden : true}
            ],
            childAttrName: "record"
        },
*/
        {
            name: arbor.constants.kClassTreeCollectionName,
            //  parent: arbor.constants.kRecordsPatientsCollectionName,
            labels: {
                singleCase: "tree",
                pluralCase: "trees",
                setOfCasesWithArticle: "our trees"
            },
            // The (child) collection specification:
            attrs: [
                {name: "predict", type: 'categorical', description: 'what are we predicting?'},
                {name: "N", type: 'numeric', precision : 0, description : 'total number of cases'},
                {name: "nodes", type: 'numeric', precision : 0, description : 'total number of nodes'},
                {name: "depth", type: 'numeric', precision : 0, description : 'dpth of tree'},
                {name: "base", title : "base rate", type: 'numeric', precision: 3, description : 'base rate'},
                {name: "TP", type: 'numeric', precision: 0, description : 'number of true positives'},
                {name: "FN", type: 'numeric', precision: 0, description : 'number of false negatives'},
                {name: "FP", type: 'numeric', precision: 0, description : 'number of false positives'},
                {name: "TN", type: 'numeric', precision: 0, description : 'number of true negatives'},
                {name: "sens", type: 'numeric', precision: 3, editable : true,
                    description : 'sensitivity (calculated): the proportion of positive cases that are diagnosed positive',
                    formula : "TP/(TP + FN)"},
                {name: "state", type: 'categorical', description: "save state for this tree", editable : true, hidden: true}
                /*
                {name: "specificity", type: 'numeric', precision: 3, description : 'proportion of negative cases that are diagnosed negative'},
                {name: "PPV", type: 'numeric', precision: 3, description : 'proportion of positive diagnoses that are actually positive'},
                {name: "NPV", type: 'numeric', precision: 3, description : 'proportion of negative diagnoses that are actually negative'},
                 */
            ]
        }
    ]   //  end of collections
};

arbor.codapConnector.regressionTreesDataContextSetupString = {
    name: arbor.constants.kRegressTreeDataSetName,
    title: arbor.constants.kRegressTreeDataSetTitle,
    description: 'records of regression trees',
    collections: [
        {
            name: arbor.constants.kRegressTreeCollectionName,
            labels: {
                singleCase: "tree",
                pluralCase: "trees",
                setOfCasesWithArticle: "our trees"
            },

            attrs: [
                {name: "predict", type: 'categorical', description: 'what are we predicting?'},
                {name: "N", type: 'numeric', precision : 0, description : 'total number of cases'},
                {name: "nodes", type: 'numeric', precision : 0, description : 'total number of nodes'},
                {name: "depth", type: 'numeric', precision : 0, description : 'depth of tree'},

                {name: "sumSSD", type: 'numeric', precision: 3, description : 'total (normalized) sum of the sum of squares of deviation'},

                {name: "state", type: 'categorical', description: "save state for this tree", editable : true, hidden: true}
            ]
        }
    ]   //  end of collections
};