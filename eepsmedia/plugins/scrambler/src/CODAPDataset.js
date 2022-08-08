/**
 * In-plugin representation of a CODAP dataset.
 * Takes care of all dataset operations including communication with CODAP.
 *
 * Importantly, has a `structure` member that mimics the `values` field in a "get data context" call,
 * that is, it contains `collections`, each of which has an array of attributes.
 *
 * In addition, each collection has a `cases` field containing data.
 */
class CODAPDataset {

    structure = null;
    datasetName = null;

    constructor(iName) {
        this.datasetName = iName;
    }

    /**
     * Get the structure of this dataset from CODAP and store it in `this.structure`.
     * We use this for everything, including storing the data.
     *
     * Called from `scrambler.retrieveAllDataFromCODAP()`
     *
     * @returns {Promise<void>}
     */
    async loadStructureFromCODAP() {
        if (this.datasetName) {
            const theMessage = {
                action: "get",
                resource: `dataContext[${this.datasetName}]`,
            }
            const getDatasetResult = await codapInterface.sendRequest(theMessage);
            this.structure = getDatasetResult.values;
        } else {
            scrambler.doAlert("Dang!", "Can't load a structure without a dataset name", "error");
        }
    }

    /**
     * Return a structure with information about which attribute (names) are suitable for scrambling.
     *
     * Such an attribute
     * * must be in the last (leaf) collection
     * * must _not_ have a formula
     *
     * @param iCheck        a name we might pass in to see if it's one of them
     * @returns {{array: *[], check: boolean, hasFormula: boolean}}
     */
    possibleScrambleAttributeNames(iCheck) {
        const lastCollection = this.structure.collections[this.structure.collections.length - 1];
        let formula = false;

        let out = [];
        lastCollection.attrs.forEach(attr => {
            if (!attr.formula) {    //  can't scramble a formula attribute....
                out.push(attr.name);
            } else if (attr.name === iCheck) {  //  has a formula AND it's the one we're checking
                formula = true;
            }
        })

        return {
            array: out,
            check: out.includes(iCheck),
            hasFormula: formula,
        };
    }

    /**
     * Get a list of all attribute names in all collections
     *
     * @returns {*[]}
     */
    allAttributeNames() {
        let out = [];
        this.structure.collections.forEach((c) => {
            c.attrs.forEach((a) => {
                out.push(a.name);
            })
        })
        return out;
    }


    /**
     * Scrambles the indicated attribute's values. Called from `scrambler.doScramble()`.
     *
     * This is typically called on the cloned dataset, `scrambler.scrambledDataset` (in CODAP, titled "scrambled_whatever"),
     * after which the results (with computed measures) are collected.
     *
     * Note that this attribute must be in the "last", most leafy collection.
     *
     * At the end, the scrambled values have been pushed into the scrambled dataset _in CODAP_.
     * There, any measures get automatically recalculated (the whole point, right?)
     * and are ready to be retrieved and made into measures.
     *
     * @param iAttName  the name of the attribute to be scrambled
     * @returns {Promise<void>}
     */
    async scrambleInPlace(iAttName) {
        const nCollections = this.structure.collections.length;
        const lastCollection = this.structure.collections[nCollections - 1];

        const theCases = lastCollection.cases;      //  remember, a `CODAPDataset` case this `cases` member.
        let valueArray = [];        //  array that just holds the values of this attribute, one per case

        //  put the values in the array...
        theCases.forEach(aCase => {
            valueArray.push(aCase.values[iAttName]);
        })

        valueArray.scramble();      //  ... and scramble them

        //  construct a request to CODAP to push these values into this dataset

        const theResource = `dataContext[${this.datasetName}].collection[${lastCollection.name}].case`;

        //  construct a "values" array (`theValues`) for an update.case message
        let theValues = [];

        for (let i = 0; i < valueArray.length; i++) {
            const thisCase = lastCollection.cases[i];
            const oneValuesObject = {};
            oneValuesObject[iAttName] = valueArray[i];
            theValues.push({
                id: thisCase.id,        //      for this to be an update request, we need the caseIDs of the cases
                values: oneValuesObject,
            })
        }

        try {
            const updateScrambleResult = await codapInterface.sendRequest({
                action: "update",
                resource: theResource,
                values: theValues,
            });
        } catch (msg) {
            scrambler.doAlert("oops!", `Error updating a scramble! ${msg}`, "error");
        }
    }

    /**
     * Get values from the top n–1 collections of the `iSource` dataset.
     *
     * We do this by recursively looking into the collections' `cases`
     * and constructing _items_ for emission to CODAP.
     *
     * Called on the "scrambled" dataset.
     *
     * @param iSource  a `CODAPDataset`. The source dataset, specifically, the "scrambled" dataset.
     * @returns theItems    an array of objects suitable for export to CODAP as items
     */
    async makeMeasuresFrom(iSource) {
        await iSource.retrieveAllDataFromCODAP();   //  now `iSource`, which is local,  has the (recently) scrambled data.

        const nCollections = iSource.structure.collections.length;
        const lastCollectionLevel = nCollections - 2;   //   so if there are 3 levels, this is 1, that is, the second level.

        //  just in case. This should never fire!
        if (nCollections <= 1) {
            const theAlertText = `You're using ${nCollections} level(s) of collection. 
                You need at least two.
                Make a measure and drag it leftwards!`;
            scrambler.doAlert("Watch out!", theAlertText);
            return null;
        }

        //  make CODAP-ready item(s) from the scrambled collection
        const theItems = iSource.scrapeCollections(0, lastCollectionLevel);
        return theItems;
    }

    /**
     * The beginning of a recursive dance to get items from collections.
     * We start with the highest-level collection (this is called with `iLevel == 0`),
     * and find all its cases.
     *
     * Then, for each case at this top level,
     * we call `dataFromCase()` (where the recursion really happens) to get
     * an array of all the items that contain this case's data
     * plus the data of all its children.
     *
     * @param iLevel    the level we're starting at (should be 0)
     * @param zLevel    the bottom level we're collecting from (one above the "leaf" level)
     * @returns {*[]}   array of items
     */
    scrapeCollections(iLevel, zLevel) {

        const thisCollection = this.structure.collections[iLevel];
        let theItems = [];

        thisCollection.cases.forEach(aCase => {
            const newData = this.dataFromCase(aCase, iLevel, zLevel);   //  an array of objects
            theItems = theItems.concat(newData);    //  put those items into the `theItems` array
        });

        return theItems;
    }

    /**
     * The recursive heart of getting data from nested collections.
     *
     * @param iCase     the (CODAP) case object we're getting data from
     * @param iLevel    what level of the hierarchy we're in
     * @param zLevel    the bottom level we're digging towards
     * @returns {*[]}   an array of objects, each of which is the `{att: val, …}` data for the case and its children
     */
    dataFromCase(iCase, iLevel, zLevel) {
        if (iLevel === zLevel) {
            let leafValues = iCase.values;  //  an object containing attribute names and values as returned by CODAP

            //  now we add two more attributes, one for the iteration and one for the scrambled attribute name
            leafValues[myStrings.sIterationAttName] = scrambler.state.iteration;
            leafValues[myStrings.sScrambledAttName] = scrambler.state.scrambleAttributeName;

            //  end recursion here.
            return [leafValues];  //  array of a single object
        } else {
            //  recursion continues...

            let childrenData = [];  //  this will be an array of `{att: val, …}` (data) objects for all our children

            //  loop over the `children` array, which contains `caseID`s.
            iCase.children.forEach(childID => {
                const theChildCase = this.findCaseAtLevel(childID, iLevel + 1); //  get that case
                const dataFromBelow = this.dataFromCase(theChildCase, iLevel + 1, zLevel);  //  recurse!

                //  dataFromBelow is an array of sets of data.
                dataFromBelow.forEach(oneDataObject => {
                    //  make a case-data object consisting of what we just retrieved plus the data from THIS case.
                    const thisData = Object.assign(oneDataObject, iCase.values);
                    childrenData.push(thisData);    //  stick it in the array.
                })
            })
            return childrenData;
        }
    }

    /**
     * Get the case information (which includes the ID; `values`,
     * which is the data; and `children` which is the child IDs).
     *
     * We use the data stored in `this.structure`. No need to go back to CODAP.
     *
     * @param iCaseID   the caseID of the one we seek
     * @param iLevel    the level, which tells us which collection to look for it in
     * @returns {*}     the found case itself
     */
    findCaseAtLevel(iCaseID, iLevel) {
        const theCollection = this.structure.collections[iLevel];
        const theCase = theCollection.cases.find(aCase => aCase.id === iCaseID);
        return theCase;
    }


    /**
     * Ask CODAP for all cases in all collections, calling `getAllCasesInCollection()`.
     * The data get stored in the `structure` member.
     *
     * @returns {Promise<void>}
     */
    async retrieveAllDataFromCODAP() {
        await this.loadStructureFromCODAP();    //  now `this.structure` is set

        const thePromises = [];

        try {
            this.structure.collections.forEach(coll => {
                try {
                    thePromises.push(this.getAllCasesInCollection(coll));
                } catch (msg) {
                    console.log(`trouble getting all cases in "${coll}: ${msg}`);
                }
            })
        } catch (msg) {
            scrambler.doAlert("Dang!", `No structure: ${msg}`, "error");
        }

        await Promise.all(thePromises);     //  await the data from all collections
    }


    /**
     * Retrieve all case data from the collection and stuff it into the collection's (new) `cases` member.
     *
     *  Called from `retrieveAllDataFromCODAP()`
     *
     * @param iCollection   a collection from the `structure.collections` array.
     * @returns {Promise<void>}
     */
    async getAllCasesInCollection(iCollection) {
        // first, figure out how many cases there are
        //  so we can make a loop for getting the cases
        const tMessage = {
            action: "get",
            resource: `dataContext[${this.datasetName}].collection[${iCollection.name}].caseCount`,
        }

        const theCountResult = await codapInterface.sendRequest(tMessage);

        //  set up for an array of requests, one per case (we'll do them by index)
        const theRequests = [];

        for (let i = 0; i < theCountResult.values; i++) {
            const cMessage = {
                action: "get",
                resource: `dataContext[${this.datasetName}].collection[${iCollection.name}].caseByIndex[${i}]`,
            }
            theRequests.push(cMessage);     //  add to the array of requests
        }

        const theCaseResults = await codapInterface.sendRequest(theRequests);
        //  this is an array of results; we check each one to see if it's a success.
        //  if any fail, we declare this a failure...

        const theCases = [];
        let casesAreOK = true;

        for (let i = 0; i < theCountResult.values; i++) {
            if (theCaseResults[i].success) {
                theCases.push(theCaseResults[i].values.case);
            } else {
                casesAreOK = false;
            }
        }

        if (casesAreOK) {
            //  recall that `iCollection` is a collection in the `structure.collections` array.
            iCollection.cases = theCases;   //  here is where the case data gets stored into the `structure` member.
        } else {
            scrambler.doAlert("Dang!", `Error getting cases from collection [${iCollection.name}]`, "error");
        }
    }

    /**
     * Have CODAP make a dataset without any data, based on the structure of `this`.
     *
     * Called by `makeNewMeasuresDataset()` and `makeNewScrambledDataset()`
     *
     * @returns {Promise<void>}
     */
    async emitDatasetStructureOnly() {

        //  okay, now make a new one...
        //  we'll loop over the collections and use their info to build the request

        const theCollections = [];
        for (let collectionLevel = 0; collectionLevel < this.structure.collections.length; collectionLevel++) {

            const inputColl = this.structure.collections[collectionLevel];

            //  identify the parent, if any (we'll need its name)
            const parentColl = collectionLevel > 0 ? this.structure.collections[collectionLevel - 1] : null;
            const theAttrs = [];

            //  each collection contains info on its attributes.
            inputColl.attrs.forEach(attr => {
                const thisAttr = Object.assign({}, attr);
                //  now get rid of the (old dataset's) ids!
                delete thisAttr.id;
                delete thisAttr.guid;
                delete thisAttr.cid;
                theAttrs.push(thisAttr);
            })

            //  now we make `outputColl`, which is what we'll send to CODAP...
            const outputColl = {
                name: inputColl.name,
                title: inputColl.title,
                attrs: theAttrs,
            }

            //  fix the parent to be the (string) value of the parent collection's name
            if (parentColl) {
                outputColl.parent = parentColl.name;
            }

            //  put what we have built into the array ...
            theCollections.push(outputColl);
        }

        const theValues = {
            name: this.datasetName,
            title: this.datasetName,
            collections: theCollections,    //  ... which is what we send to CODAP
        }

        //  finally, send the request
        await codapInterface.sendRequest({
            action: "create",
            resource: `dataContext`,
            values: theValues,
        })

    }

    /**
     * Actually emit items into CODAP.
     * Called from `scrambler.doScramble()` on the _measures_ dataset.
     *
     * @param iAppend
     * @param iValues           the Values
     * @returns {Promise<void>}
     */
    async emitItems(iAppend, iValues) {
        //  todo: use iAppend
        const newItemsMessage = {
            action: "create",
            resource: `dataContext[${this.datasetName}].item`,
            values: iValues,
        }

        try {
            const newScrambledItemsResult = await codapInterface.sendRequest(newItemsMessage);
        } catch (msg) {
            scrambler.doAlert("Hmmm.", `Problem emitting scrambled measures from ${this.datasetName}: ${msg}`)
        }
    }

    async emitCasesFromDataset() {

        let theNextDictionary = null;

        for (let i = 0; i < this.structure.collections.length; i++) {
            const theCollection = this.structure.collections[i];
            theNextDictionary = await this.emitCasesFromCollection(theCollection, theNextDictionary);
        }
    }

    async emitCasesFromCollection(iColl, parentDictionary) {
        const theResource = `dataContext[${this.datasetName}].collection[${iColl.name}].case`;
        const theValues = [];       //  array of key/value pairs
        const theOldIDs = [];

        for (let i = 0; i < iColl.cases.length; i++) {
            const internalCaseData = iColl.cases[i];
            const outputCase = {};
            outputCase["values"] = Object.assign({}, internalCaseData.values);
            if (internalCaseData.parent) {
                const theParentID = parentDictionary[internalCaseData.parent]
                outputCase["parent"] = theParentID;
                internalCaseData.parent = theParentID;
            }
            theValues.push(outputCase);

            theOldIDs[i] = internalCaseData.id;    //  for the dictionary, to be returned
        }

        const theMessage = {
            action: "create",
            resource: theResource,
            values: theValues,
        }

        const theCreateCasesResults = await codapInterface.sendRequest(theMessage);

        /**
         * At this point, we're creating a dictionary to relate the case IDs from the "old" dataset
         * (the one we're holding locally in `this`) to the "new" dataset (the one we're creating in CODAP).
         * The dictionary is of the form { oldID : newID, oldID2 : newID2, ... }
         *
         * This is essential for setting the values for the `parentID`s in the new CODAP dataset.
         *
         * The first time through here -- at the top level -- it doesn't matter. But we return this level's
         * dictionary to the caller (`emitCasesFromDataset()`) for use in the next time through its loop.
         *
         * @type {{}}
         */
        const theIDDictionary = {};

        for (let i = 0; i < theCreateCasesResults.values.length; i++) {
            theIDDictionary[theOldIDs[i]] = theCreateCasesResults.values[i].id;
            iColl.cases[i].id = theCreateCasesResults.values[i].id;
        }

        return theIDDictionary;
    }

    toString() {
        let out = `${this.structure.title} • `;
        out += `${this.structure.collections.length} collection(s)`;
        return out;
    }

    /**
     * Clones the "this" dataset,
     * including the `cases` field in the `collections` if it has been filled
     *
     * Also ensures that the top collection has _no_ `parent` property
     *
     * @returns {CODAPDataset}
     */
    clone(iPrefix) {

        const theNewName = this.structure.title ?
            `${iPrefix}${this.structure.title}` :
            `${iPrefix}${this.datasetName}`;

        let out = new CODAPDataset(theNewName);

        let newCollections = [];
        this.structure.collections.forEach(oneCollection => {
            newCollections.push(Object.assign({}, oneCollection));
        })

        out.structure = {
            name: theNewName,
            title: theNewName,
            collections: newCollections,
        }

        delete out.structure.collections[0].parent;

        return out;
    }


    makeIntoMeasuresDataset() {

        //  define the top-level "iterations" collection

        const scritCollection = {
            name: "iterations",
            attrs: [{
                name: myStrings.sIterationAttName,
                type: "categorical",
                description: myStrings.sIterationAttDescription,
            }, {
                name: myStrings.sScrambledAttName,
                type: "categorical",
                description: myStrings.sScrambledAttDescription,
            }],
        }

        //  define the other collection (which will contain all non-leaf attributes)
        //  we will add them in shortly

        const measuresCollection = {
            name: "measures",
            attrs: [],
        }

        //  get rid of "leaf" collection
        this.structure.collections.pop();

        //  get rid of any formulas
        this.structure.collections.forEach(aCollection => {
            aCollection.attrs.forEach(attr => {
                if (attr.formula) {
                    attr.deletedFormula = attr.formula;
                    delete attr.formula;
                }
                measuresCollection.attrs.push(attr);
            })
        })

        //  make the new structure

        this.structure = {
            collections: [scritCollection, measuresCollection],
            name: this.structure.name,
            title: this.structure.title,
        };
    }

}
