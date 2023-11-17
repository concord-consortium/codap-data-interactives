/**
 * Wrapper for codapInterface (which wraps iframe-phone) with specialized functions for sonification plugins.
 */
export default class CodapPluginHelper {
    constructor(codapInterface) {
        this.codapInterface = codapInterface;

        this.prevNotice = null;
        this.prevDeleteNotice = null;

        // TODO: collections are unordered.
        this.data = null;
        this.contextTitles = null;
        /*
        * @property {
        *           name:string,
        *           collections: [
        *               { name:string, attrs:[{name:string,type:string|null}]}
        *           ]
        *       }
        */
        this.contextStructures = null;
        /*
         * The top level of the structure object is keyed by context name. The
         * second level is keyed by collection name and its values are an array
         * of attribute names. e.g.:
         *    {
         *      context1: {
         *        collectionA: [attr1, attr2, attr3],
         *        collectionB: [attr4, attr5]
         *      },
         *      context2: {
         *        collectionC: [attr6, attr7],
         *        collectionD: [attr8, attr9, attr10]
         *      }
         *    }
         *
         */
        this.structure = null;

        this.globals = null;

        this.tree = null;

        this.items = null;
        this.itemAttributes = null;

        this.attrValueRanges = null;

        this.queryInProgress = false;

        this.createCasesTimer = null;
        this.createCasesResolve = null;
        this.caseTimerDuration = 1000;

        // The documentAnnotator is used to create graphs in CODAP.
        // The normal CODAP API does not have sufficient control of graph
        // configuration to configure adornments, so we use the Document API
        this.documentAnnotator = null;
    }

    async init(name, dimensions={width:200,height:100}, version) {
        this.name = name;

        // Initialize connection to CODAP. If CODAP is restoring a document, then
        // this step will return its saved state. If plugin is being added to
        // an existing document, then there will be no saved state.
        let savedState = await this.codapInterface.init({
                name: name,
                title: name,
                version: version ? version : '',
                preventDataContextReorg: false,
            });

            let pluginState = savedState ? savedState : this.codapInterface.getInteractiveState();
            let hasState = false;

            if (Object.keys(pluginState).includes('ID')) {
                hasState = true;
            }

            // set up document listener
            this.on('document', null, (msg) => { this.handleNewDocumentNotification(msg); });

        // prepare to update plugin properties
        let updateRequest = {
                    action: "update",
                    resource: "interactiveFrame",
                    values: {
                        subscribeToDocuments: true,
            }
        };

        // we only want to configure the plugin dimensions if we are a new plugin
        if (!hasState) {
            updateRequest.values.dimensions = {
                            width: dimensions.width,
                            height: dimensions.height + 25
                };
                    }
        await this.codapInterface.sendRequest(updateRequest);

        // initialize data cache
        await this.queryAllData();

        // get the plugin id so the plugin can select itself.
        await this.getPluginID();

        return this.codapInterface.getInteractiveState();
    }

    getPluginID() {
        if (this.pluginID) {
            return Promise.resolve(this.pluginID);
        } else {
            return this.codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'})
                .then(result => {
                    if (result.success) {
                        this.pluginID = result.values.id;
                        return Promise.resolve(this.pluginID);
                    }
                    else return Promise.reject('Plugin id fetch failed');
                })
        }
    }

    updateState(state) {
        this.codapInterface.updateInteractiveState(state);
    }

    // TODO: Hopefully this can retire soon with the fix to the notificationManager.
    checkNoticeIdentity(notice) {
        let res = true;

        if (notice.resource === 'undoChangeNotice') {
            this.prevNotice = this.prevDeleteNotice = null;
            this.prevNotices = [];
            return res;
        }

        if (this.prevDeleteNotice && notice.resource.includes('dataContextChangeNotice')) {
            // This is for checking repeated interleaving duplicates (e.g., deleteCollection & moveAttribute)
            res = false;
        } else if (this.prevNotice) {
            res = JSON.stringify(notice) !== JSON.stringify(this.prevNotice);
            this.prevDeleteNotice = null;
        }

        // Some nasty code for special-case nasty behaviors.
        if (notice.resource.includes('dataContextChangeNotice')) {
            switch (notice.values.operation) {
                case 'deleteCollection':
                    // For interleaving duplicates.
                    this.prevDeleteNotice = notice;
                    this.prevNotice = res ? notice : null;
                    break;
                case 'createCollection':
                case 'moveAttribute':
                    // This can repeat 3 or more times...
                    this.prevNotice = notice;
                    break;
                case 'createCases':
                    // This can repeat so many times, often for every row.
                    if (this.createCasesTimer) {
                        clearTimeout(this.createCasesTimer);
                    }
                    this.createCasesTimer = setTimeout(() => {
                        if (this.createCasesResolve) {
                            this.createCasesResolve();
                            this.createCasesResolve = null;
                        }
                    }, this.caseTimerDuration);
                    break;
                default:
                    // Only check up to 1 duplicate, since the same documentChangeNotice can repeat multiple times regardless of the actual contents.
                    this.prevNotice = res ? notice : null;
                    break;
            }
        }

        return res; // True if the notification is not a duplicate.
    }

    waitForCaseUpdatesFinished() {
        return new Promise(resolve => {
            this.createCasesResolve = resolve;
        });
    }

    // adapted from https://codepen.io/eanbowman/pen/jxqKjJ
    async queryDone() {
        const timeout = 10000;
        let start = Date.now();
        return new Promise(waitForDone.bind(this))
        function waitForDone(resolve, reject) {
            if  (this.queryInProgress === false)
                resolve(this.queryInProgress);
            else if (timeout && (Date.now() - start) >= timeout)
                reject(new Error("timeout"));
            else
                setTimeout(waitForDone.bind(this, resolve, reject), 30);
        }
    }

    async queryAllData() {
        // console.log('Querying all data');

        if (this.queryInProgress) {
            await this.queryDone();
        }
        this.queryInProgress = true;
        this.data = {};
        this.contextTitles = {};
        this.contextStructures = {};
        await this.queryContextList();
        await this.queryCollectionList();
        await this.queryAllCases();
        this.fillStructure();
        let result = await this.queryAllItemsSync();
        this.calcAttrValueRanges();
        this.queryInProgress = false;
        this.prevNotice = null;
        this.prevDeleteNotice = null;
        return result;
    }

    async queryDataForContext(context) {
        //console.log('Querying data for context:', context);

        if (this.queryInProgress) {
            await this.queryDone();
        }
        this.queryInProgress = true;
        this.data[context] = {};
        await this.queryCollectionList(context);
        await this.queryAllCases(context);
        this.fillStructure(context);
        let result = await this.queryAllItemsSync(context);
        this.calcAttrValueRanges(context);
        this.queryInProgress = false;
        this.prevNotice = null;
        this.prevDeleteNotice = null;
        return result;
    }

    async queryContextList() {
        let contextNames = [];
        let result = await this.codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
        });
        result.values.forEach(context => {
            this.data[context.name] = {};
            contextNames.push(context.name);
            this.contextTitles[context.name] = context.title || context.name;
        });
        return contextNames;
    }

    async queryCollectionList(context) {
        let contexts = context ? [context] : Object.keys(this.data);

        // This await syntax from: https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
        await Promise.all(
            contexts.map(async context => {
                try {
                    let result = await this.codapInterface.sendRequest({
                        action: 'get', resource: `dataContext[${context}]`
                    });
                    if (result.success) {
                        this.contextStructures[context] = result.values;
                        result.values.collections.forEach(collection => {
                            this.data[context][collection.name] = {};
                        });
                    } else {
                        console.warn(`Error while fetching context info: ${context}: ${result}`);
                    }
                } catch (e) {
                    console.warn(`Error while fetching context info: ${context}: ${e}`);
                }
            })
        )
    }

    queryAllCases(context) {
        let contexts = context ? [context] : Object.keys(this.data);

        return Promise.all(contexts.map(context => {
            return Object.keys(this.data[context]).map(collection => {
                return this.codapInterface.sendRequest({
                    action: 'get',
                    resource: `dataContext[${context}].collection[${collection}].allCases`
                }).then(result => {
                    this.data[context][collection] = result.values.cases.map(c => c.case);
                });
            }).reduce((a,b) => a.concat(b), []);
        }).reduce((a,b) => a.concat(b), []));
    }

    // Asynchronous getItem can time out in Chrome as of Sep 17, 2018. Have to synchronize?
    queryAllItemsAsync() {
        this.items = {};

        return Promise.all(Object.keys(this.data).map(context => {
            this.items[context] = [];

            return Object.values(this.data[context]).map(cases => {
                return cases.map((c,i) => {
                    return this.codapInterface.sendRequest({
                        action: 'get',
                        resource: `dataContext[${context}].itemByCaseID[${c.id}]`
                    }).then(result => {
                        if (result.success) {
                            this.items[context][i] = {
                                values: result.values.values,
                                id: c.id, // Case ID
                                itemID: result.values.id
                            };
                        } else {
                            // Fallback for when hierarchical formula breaks the itemByCaseID API.
                            let collections = this.getCollectionsForContext(context);
                            let itemParts = collections.map(collection => {
                                // For a parent case, use its values together with children cases to reconstruct the item.
                                return this.data[context][collection].find(pc => pc.id === c.id || pc.children.includes(c.id));
                            }).filter(pc => typeof(pc) !== 'undefined').map(pc => pc.values);

                            let item = Object.assign({}, ...itemParts);

                            this.items[context][i] = {
                                values: item,
                                id: c.id,
                                // itemID: null // Item ID not available!
                                itemID: i // TODO: Fishy
                            }
                        }
                    });
                });
            }).reduce((a,b) => a.concat(b), []);
        }).reduce((a,b) => a.concat(b), [])).then(() => {
            this.itemAttributes = {};

            Object.keys(this.items).forEach(context => {
                if (this.items[context].length) {
                    this.itemAttributes[context] = Object.keys(this.items[context][0].values);
                }
            });

            // this.itemAttrInfo = {};
            // Object.keys(this.itemAttributes).forEach(context => {
            //     this.itemAttrInfo[context] = {};
            //
            //     this.item
            // })
        });
    }

    queryAllItemsSync(context) {
        return new Promise(resolve => {
            let contexts = context ? [context] : Object.keys(this.data);

            if (!context) {
                this.items = {};
            }

            let queryList = contexts.map(context => {
                this.items[context] = [];

                return Object.values(this.data[context]).map(cases => {
                    return cases.map((c,i) => {
                        return {
                            context: context,
                            caseID: c.id,
                            caseIndex: i
                        };
                    });
                }).reduce((a,b) => a.concat(b), []);
            }).reduce((a,b) => a.concat(b), []);

            if (queryList.length) {
                let getItemRecursive = queryIndex => {
                    let context = queryList[queryIndex].context;
                    let caseID = queryList[queryIndex].caseID;
                    let caseIndex = queryList[queryIndex].caseIndex; // Note: Different from CODAP's case index.

                    this.codapInterface.sendRequest({
                        action: 'get',
                        resource: `dataContext[${context}].itemByCaseID[${caseID}]`
                    }).then(result => {
                        if (result.success) {
                            this.items[context][caseIndex] = {
                                values: result.values.values,
                                id: caseID, // TODO: remove this.
                                caseID: caseID,
                                itemID: result.values.id // https://www.pivotaltracker.com/story/show/163986392
                            };
                        } else {
                            // Fallback for when hierarchical formula breaks the itemByCaseID API.
                            let collections = this.getCollectionsForContext(context);
                            let itemParts = collections.map(collection => {
                                // For a parent case, use its values together with children cases to reconstruct the item.
                                return this.data[context][collection].find(pc => pc.id === caseID || pc.children.includes(caseID));
                            }).filter(pc => typeof(pc) !== 'undefined').map(pc => pc.values);

                            let item = Object.assign({}, ...itemParts);

                            this.items[context][caseIndex] = {
                                values: item,
                                id: caseID, // TODO: remove this.
                                caseID: caseID,
                                // itemID: null // Item ID not available!
                                itemID: caseIndex // TODO: Fishy
                            }
                        }

                        if (queryList.length === ++queryIndex) {
                            this.itemAttributes = {};

                            Object.keys(this.items).forEach(context => {
                                if (this.items[context].length) {
                                    this.itemAttributes[context] = Object.keys(this.items[context][0].values);
                                }
                            });

                            resolve({
                                data: this.data,
                                items: this.items
                            });
                        } else {
                            getItemRecursive(queryIndex);
                        }
                    });
                };

                getItemRecursive(0);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * Sets a structure property of this object either for a single
     * dataContext or all dataContexts. Uses the data property of this object.
     *
     * The structure object is described where it is declared, above.
     *
     * @param context {string|null} the name of a dataContext or null
     */
    fillStructure(context) {
        let contexts = context ? [context] : Object.keys(this.data);

        if (contexts.length !== 0) {
            if (!context) {
                this.structure = {};
            }

            contexts.forEach(context => {
                this.structure[context] = {};

                let collections = Object.keys(this.data[context]);

                if (collections.length !== 0) {
                    collections.forEach(collection => {
                        let cases = this.data[context][collection];

                        if (cases.length !== 0) {
                            this.structure[context][collection] = Object.keys(cases[0].values);
                        }
                    });
                }
            });
        }
    }

    calcAttrValueRanges(context) {
        if (context) {
            this.attrValueRanges[context] = {};
        } else {
            this.attrValueRanges = {};
        }

        let contexts = context ? [context] : Object.keys(this.items);

        contexts.forEach(context => {
            this.attrValueRanges[context] = {};
            let attrs = this.getAttributesForContext(context);

            if (!attrs) {
                return null;
            }

            attrs.forEach(attr => {
                let attrValues = this.getAttrValuesForContext(context, attr);

                let filteredAttrValues = attrValues && attrValues.map(val => {
                    // if (typeof(val) === 'number') {
                    //     return parseFloat(val);
                    // }
                    // TODO: Sometimes parses strings in a wrong way
                    // else {
                    //     return Date.parse(val);
                    // }

                    return parseFloat(val);
                }).filter(v => !Number.isNaN(v));

                if (filteredAttrValues.length) {
                    this.attrValueRanges[context][attr] = {
                        type: 'numeric', // TODO: How about dates?
                        length: filteredAttrValues.length,
                        min: Math.min(...filteredAttrValues),
                        max: Math.max(...filteredAttrValues)
                    };
                } else {
                    filteredAttrValues = attrValues.filter(val => val !== '');

                    this.attrValueRanges[context][attr] = {
                        type: 'categorical',
                        length: filteredAttrValues.length,
                        categories: Array.from(new Set(filteredAttrValues))
                    };
                }
            });
        });

        return this.attrValueRanges;
    }

    getContexts() {
        return this.structure ? Object.keys(this.structure) : null;
    }

    // TODO: Should be a list of object including ID, name, collection, etc.
    getCollectionsForContext(context) {
        return (this.structure && this.structure[context]) ? Object.keys(this.structure[context]) : null;
    }

    getAttributesForCollection(context, collection) {
        return this.structure ? this.structure[context][collection] : null;
    }

    getSelectedCases(context) {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: `dataContext[${context}].selectionList`
        }).then(result => {
            let collections = Array.from(new Set(result.values.map(v => v.collectionName)));
            return result.values.map(v => {
                let _case = this.data[context][v.collectionName].find(c => c.id === v.caseID);
                _case.collection = v.collectionName;
                _case.depth = collections.indexOf(v.collectionName);
                return _case;
            });
        });
    }

    getAttributeValues(context, collection, attribute) {
        return (this.data && Object.keys(this.data).length) ? this.data[context][collection].map(c => c.values[attribute]) : null;
    }

    getAttributeDefsForContext(contextName) {
        let contextDef = this.contextStructures && this.contextStructures[contextName];
        if (contextDef) {
            return contextDef.collections.flatMap(col => col.attrs);
        }
    }

    getAttributesForContext(contextName) {
        return this.itemAttributes ? this.itemAttributes[contextName] : null;
    }

    getAttributeNamesForContext(contextName) {
        let attrDefs = this.getAttributeDefsForContext(contextName);
        return attrDefs && attrDefs.map(def => def.name);
    }

    getItemsForContext(context) {
        return this.items && this.items[context];
    }

    getContextTitle(context) {
        return this.contextTitles && this.contextTitles[context] ;
    }

    getAttrValuesForContext(context, attribute) {
        return (this.items && this.items[context] && Object.keys(this.items).length) ? this.items[context].map(c => c.values[attribute]) : null;
    }

    /**
     * Returns the items corresponding to the cases selected by the user.
     * If noneSelectedMeansAllSelected, then if no cases are selected,
     * all the case are returned as "selected."
     */
    async getSelectedItems(context, noneSelectedMeansAllSelected) {
        let selectedItems;
        let result = await this.codapInterface.sendRequest({
                action: 'get',
                resource: `dataContext[${context}].selectionList`
            });
        if (result.success) {
            let caseIDs = result.values.map(v => v.caseID);
            if (caseIDs.length) {
                selectedItems = caseIDs
                    .map(id => {
                        // item.id is actually the case ID.
                        return this.items[context]
                            .find(item => item && item.id === id)
                    });
            } else if (noneSelectedMeansAllSelected) {
                selectedItems = this.items[context];
            }
        }
        if (!selectedItems) selectedItems=[];
        return selectedItems.filter(item => typeof(item) !== 'undefined');
    }

    queryAttributeCollections(context) {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: `dataContext[${context}].collectionList`
        }).then(result => {
            return Promise.all(result.values.map(collection => {
                return this.codapInterface.sendRequest({
                    action: 'get',
                    resource: `dataContext[${context}].collection[${collection.name}].attributeList`
                }).then(result => {
                    let res = {};
                    res[collection.name] = result.values;
                    return res;
                });
            }));
        });
    }

    queryGlobalValues() {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: 'globalList'
        }).then(result => {
            this.globals = result.values?result.values.filter(variable => {
                return ['US_state_boundaries', 'country_boundaries', 'US_county_boundaries', 'US_congressional_boundaries', 'US_puma_boundaries'].indexOf(variable.name) === -1;
            }):[];
        });
    }

    guaranteeGlobal(name) {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: `global[${name}]`
        }).then (result => {
            if (!result.success) {
                return this.codapInterface.sendRequest({
                    action: 'create',
                    resource: 'global',
                    values: {
                        name: name,
                        value: 0
                    }
                });
            } else {
                return result;
            }
        })
    }

    setGlobal(name, value) {
        return this.codapInterface.sendRequest({
            action: 'update',
            resource: `global[${name}]`,
            values: {
                value: value
            }
        });
    }

    /**
     * Initiates the "get document" process.
     *
     * The get/document API call causes the document to be set, not in the
     * reply, but in a subsequent notification. We set, in this call the
     * annotationHandler that will be called by this.handleNewDocumentNotification()
     * upon receipt of a notification. The handler will be invoked once.
     * The annotationHandler should return a new version of the document.
     * If it does so, this will be sent as an update to CODAP.
     */
    annotateDocument(annotationHandler) {
        if (this.documentAnnotator && annotationHandler) {
            console.warn(`Unexpected overwrite of CodapPluginHandler.documentHandler`)
        }
        this.documentAnnotator = annotationHandler;
        this.codapInterface.sendRequest(
            {
                action: 'get',
                resource: `document`
            });

    }

    handleNewDocumentNotification(msg) {
        if (this.documentAnnotator && msg && msg.values) {
            let doc = this.documentAnnotator(msg.values.state);
            this.documentAnnotator = null;
            if (doc) {
                this.codapInterface.sendRequest({
                    action: 'update',
                    resource: 'document',
                    values: doc
                })
            }
        }
    }

    openSharedInfoPage(dimensions={width:400,height:600}, title, directory, file='info.md') {
        let location = window.location.pathname;
        let origin = window.location.origin;

        if (!title) {
            title = `${this.name} Info`;
        }

        if (!directory) {
            directory = '.';
        }

        let path = location
            .split('/')
            .slice(0,-1)
            .concat('info-plugin','info.html')
            .join('/');

        return this.codapInterface.sendRequest({
            action: 'create',
            resource: 'component',
            values: {
                type: 'webView',
                name: title,
                title: title,
                URL: `${origin}${path}?dir=${directory}&file=${file}`,
                dimensions: dimensions,
                position: {right:0}
            }
        })
        .then((rslt) => {
            if (rslt && rslt.success) {
                let id = rslt.values.id;
                if (id) {
                    this.codapInterface.sendRequest({
                        action: "notify",
                        resource: `component[${id}]`,
                        values: {
                            request: "select"
                        }
                    })
                }
            }
        });
    }

    openPlugin(plugin) {
        let location = window.location.pathname;
        let origin = window.location.origin;
        let path = location.split('/').slice(0,-2).concat(plugin.location,'index.html').join('/');
        let url = `${origin}${path}`;

        return this.codapInterface.sendRequest({
            action: 'create',
            resource: 'component',
            values: {
                type: 'game',
                name: plugin.name,
                URL: url,
                title: plugin.name,
                cannotClose: false
            }
        });
    }

    /**
     * Creates a simple scatter-plot graph component in CODAP with no adornments.
     */
    createGraph(dataContext, xAxis, yAxis) {
        return this.codapInterface.sendRequest({
            action: 'create',
            resource: 'component',
            values: {
                type: 'graph',
                dataContext: dataContext,
                xAttributeName: xAxis,
                yAttributeName: yAxis
            }
        })
    }

    selectSelf() {
        if (this.pluginID) {
            return this.codapInterface.sendRequest({
                action: 'notify',
                resource: `component[${this.pluginID}]`,
                values: {
                    request: 'select'
                }
            });
        } else {
            console.log('No Plugin ID');
        }
    }

    on(resource, operation, handler) {
        this.codapInterface.on('notify', resource, operation, handler )
    }
}
