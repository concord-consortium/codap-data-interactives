/**
 * Wrapper for codapInterface (which wraps iframe-phone) with specialized functions for sonification plugins.
 */
class CodapPluginHelper {
    constructor(codapInterface) {
        this.codapInterface = codapInterface;

        this.prevNotice = null;
        this.prevDeleteNotice = null;

        // TODO: collections are unordered.
        this.data = null;
        this.structure = null;

        this.globals = null;

        // this.lists = {
        //     context: null,
        //     collection: null,
        //     attribute: null,
        // };
        // this.focused = {
        //     context: null,
        //     collection: null
        // };

        this.tree = null;

        this.items = null;
        this.itemAttributes = null;
        // this.itemAttrInfo = null;

        this.attrValueRanges = null;

        this.queryInProgress = false;

        this.createCasesTimer = null;
        // this.createCasesPromise = null; // Somehow reusing the same promise can result in multiple resolve calls.
        this.createCasesResolve = null;
        this.caseTimerDuration = 1000;
    }

    init(name, dimensions={width:200,height:100}, version) {
        this.name = name;

        return this.codapInterface.init({
            name: name,
            title: name,
            version: version ? version : '',
            preventDataContextReorg: false,
        })
        .then(savedState => {
            let pluginState = savedState ? savedState : this.codapInterface.getInteractiveState();
            let hasState = false;

            if (Object.keys(pluginState).includes('ID')) {
                this.ID = pluginState.ID;
                hasState = true;
            } else {
                // pluginState['ID'] = `${name}-${new Date().getTime()}`;
                this.ID = pluginState.ID = new Date().getTime();
            }

            if (!hasState) {
                return this.codapInterface.sendRequest({
                    action: "update",
                    resource: "interactiveFrame",
                    values: {
                        dimensions: {
                            width: dimensions.width,
                            height: dimensions.height + 25
                        }
                    }
                }).then(() => this.queryAllData());
            } else {
                return this.queryAllData();
            }
            // Allow the attributes to move.
        })
        .then( () => {return this.getPluginID(); })
        .then(id=> {this.pluginID = id;})
        .then(() => Promise.resolve(this.codapInterface.getInteractiveState()))
    }

    getPluginID() {
        if (this.pluginID) {
            return Promise.resolve(this.pluginID);
        } else {
            return this.codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'})
                .then(result => {
                    if (result.success) return Promise.resolve(result.values.id);
                    else return Promise.reject('Plugin id fetch failed');
                })
        }
    }

    updateState(state) {
        this.codapInterface.updateInteractiveState(state);
    }

    // monitorLogMessages(bool) {
    //     if (typeof(bool) !== 'boolean') {
    //         bool = true;
    //     }
    //
    //     if (bool) {
    //         return this.codapInterface.sendRequest({
    //             action: "register",
    //             resource: "logMessageMonitor",
    //             values: {
    //                 message: "*"
    //             }
    //         });
    //
    //         // TODO: Register with a unique client ID.
    //     } else {
    //         // TODO: Unregister with the set ID.
    //     }
    // }

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

    queryAllData() {
        console.log('Querying all data');

        return new Promise((resolve) => {
            if (this.queryInProgress) {
                resolve(null);
            } else {
                this.queryInProgress = true;
                this.data = {};
                this.queryContextList().then(() => {
                    this.queryCollectionList().then(() => {
                        this.queryAllCases().then(() => {
                            this.fillStructure();
                            // this.queryAllItemsSync().then(resolve);
                            this.queryAllItemsSync().then(result => {
                                this.calcAttrValueRanges();
                                resolve(result);
                            });
                            this.queryInProgress = false;
                            this.prevNotice = null;
                            this.prevDeleteNotice = null;
                        });
                    });
                });
            }
        });
    }

    queryDataForContext(context) {
        console.log('Querying data for context:', context);

        return new Promise((resolve) => {
            if (this.queryInProgress) {
                resolve(null);
            } else {
                this.queryInProgress = true;
                this.data[context] = {};
                this.queryCollectionList(context).then(() => {
                    this.queryAllCases(context).then(() => {
                        this.fillStructure(context);
                        this.queryAllItemsSync(context).then(result => {
                            this.calcAttrValueRanges(context);
                            resolve(result);
                        });
                        this.queryInProgress = false;
                        this.prevNotice = null;
                        this.prevDeleteNotice = null;
                    });
                });
            }
        });
    }

    queryContextList() {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
        }).then(result => {
            result.values.forEach(context => {
                this.data[context.name] = {};
            });
        });
    }

    queryCollectionList(context) {
        let contexts = context ? [context] : Object.keys(this.data);

        return Promise.all(contexts.map(context => {
            return this.codapInterface.sendRequest({
                action: 'get',
                resource: `dataContext[${context}].collectionList`
            }).then(result => {
                result.values.forEach(collection => {
                    this.data[context][collection.name] = {};
                });
            });
        }));
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
        return this.structure ? Object.keys(this.structure[context]) : null;
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

    getAttributesForContext(context) {
        return this.itemAttributes ? this.itemAttributes[context] : null;
    }

    getItemsForContext(context) {
        return this.items && this.items[context];
    }

    getAttrValuesForContext(context, attribute) {
        return (this.items && Object.keys(this.items).length) ? this.items[context].map(c => c.values[attribute]) : null;
    }

    getSelectedItems(context) {
        return this.codapInterface.sendRequest({
            action: 'get',
            resource: `dataContext[${context}].selectionList`
        }).then(result => {
            let caseIDs = result.values.map(v => v.caseID);
            let selectedItems;
            if (caseIDs.length) {
                selectedItems = caseIDs
                    .map(id => this.items[context]
                        .find(item => item && item.id === id));// item.id is actually the case ID.
            } else {
                selectedItems = this.items[context];
            }
            return selectedItems
                .filter(item => typeof(item) !== 'undefined');
        });
    }

    getTreeStructure(/*context*/) {
        // let result = {};

        // result[]

        // for (let i = this.data[context].length-1; i > 0; i--) {
        //     this.data[context]
        // }
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

    findCollectionForAttribute() {

    }

    // openInfoPage(dimensions, name, file) {
    //     let location = window.location.pathname;
    //     let directory = location.substring(0, location.lastIndexOf('/'));
    //
    //     if (!dimensions) {
    //         dimensions = {
    //             width: 400,
    //             height: 600
    //         }
    //     }
    //
    //     if (!name) {
    //         name = `${this.name} Info`;
    //     }
    //
    //     if (!file) {
    //         file = 'info.html'
    //     }
    //
    //     return this.codapInterface.sendRequest({
    //         action: 'create',
    //         resource: 'component',
    //         values: {
    //             type: 'webView',
    //             name: name,
    //             title: name,
    //             URL: `${directory}/${file}`,
    //             dimensions: dimensions,
    //             position: 'top'
    //         }
    //     });
    // }

    openSharedInfoPage(dimensions={width:400,height:600}, title, directory, file='info.md') {
        let location = window.location.pathname;
        let origin = window.location.origin;

        if (!title) {
            title = `${this.name} Info`;
        }

        if (!directory) {
            directory = location.split('/').slice(-2,-1)[0];
        }

        let path = location.split('/').slice(0,-2).concat('common','info.html').join('/');

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
