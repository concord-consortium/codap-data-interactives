const plugin = new CodapPluginHelper(codapInterface);

const app = new Vue({
    el: '#app',
    data: {
        dimensions: {
            width: 200,
            height: 210
        },
        contexts: null,
        focusedContext: null, // TODO: This should not be used
        replayingFromRecord: false, // TODO: duplicate with "replaying"?
        recording: false,
        replaying: false,
        updateTable: true,
        interpolate: false,
        histTableValueList: [],

        updateFormulaIncoming: false,
        incomingSortByAttr: null,

        firstItem: null
    },
    methods: {
        initPlugin() {
            plugin.init('Data Moves Sequencer', this.dimensions)
                .then(this.onGetData)
                .then(this.setupTables)
                .then(_ => {
                    // Monitor the CODAP server log
                    codapInterface.sendRequest({
                        action: "register",
                        resource: "logMessageMonitor",
                        values: {
                            message: "*"
                        }
                    });
                });

            codapInterface.on('*', notice => {
                if (!plugin.checkNoticeIdentity(notice)) {
                    return null;
                }

                if (notice.resource === 'documentChangeNotice') {
                    plugin.queryAllData().then(this.onGetData);
                } else if (notice.resource.includes('dataContextChangeNotice')) {
                    let contextName = notice.resource.split('[').pop().split(']')[0];
                    let operation = notice.values.operation;

                    if (operation === 'selectCases') {
                        if (contextName === DATAMOVES_DATA.name && this.replaying) {
                            plugin.getSelectedItems(contextName).then(this.playbackHistory);
                        } else {
                            if (contextName === this.focusedContext && this.recording) {
                                if (notice.values.result.cases && notice.values.result.cases.length) {
                                    // TODO: Bad assumption.
                                    let collection = notice.values.result.cases[0].collection.name;

                                    plugin.getSelectedItems(contextName).then(cases => {
                                        this.onItemsSelected(contextName, collection, cases);
                                    });
                                }
                            }
                        }
                    } else if (['moveAttribute', 'createCollection', 'deleteCollection'].includes(operation)) {
                        plugin.queryDataForContext(contextName).then(this.onGetData);

                        if (contextName !== DATAMOVES_DATA.name && this.recording && !this.replayingFromRecord) {
                            plugin.queryAttributeCollections(contextName).then(attrCollections => {
                                this.onAttributeMoved(contextName, attrCollections);
                            });
                        }
                    } else if (operation === 'updateAttributes') {
                        // Look for the change of formula in attribute?

                        if (contextName !== DATAMOVES_DATA.name && this.recording && !this.replayingFromRecord && this.updateFormulaIncoming) {
                            this.onFormulaEdited(contextName, notice.values.result.attrs);
                            this.updateFormulaIncoming = false;
                        }
                    } else if (operation === 'moveCases') {
                        if (contextName !== DATAMOVES_DATA.name && this.recording && !this.replayingFromRecord && this.incomingSortByAttr) {
                            let name = this.incomingSortByAttr.name;

                            Object.entries(plugin.structure[contextName]).some(entry => {
                                let collection = entry[0];
                                let attributes = entry[1];

                                if (attributes.includes(name)) {
                                    // TODO: 3-step super hack
                                    this.incomingSortByAttr['context'] = contextName;
                                    this.incomingSortByAttr['collection'] = collection;
                                }
                            });
                        }

                        // TODO: Only query the changed context.
                        plugin.queryDataForContext(contextName).then(this.onGetData);
                    } else if (operation === 'createCases') {
                        plugin.waitForCaseUpdatesFinished().then(_ => {
                            plugin.queryDataForContext(contextName).then(this.onGetData);
                        });
                    } else {
                        // TODO: Only query the changed context.
                        plugin.queryDataForContext(contextName).then(this.onGetData);
                    }
                }

                if (notice.resource === 'logMessageNotice') {
                    console.log(notice.values);
                    console.log(notice.values.message);

                    // TODO: This ordered trick may break in the future.

                    if (notice.values.message.includes('attributeEditFormula')) {
                        this.updateFormulaIncoming = true;
                    } else if (notice.values.message.includes('sort cases by attribute')) {
                        // TODO: Hardcoded hack
                        let idAttrName = notice.values.message.slice(25);
                        let id = parseInt(idAttrName.split(' ')[0]);
                        let name = idAttrName.split(' ')[1].slice(2,-2);

                        this.incomingSortByAttr = {
                            ID: id,
                            name: name
                        };
                    } else if (notice.values.message.includes('plotAxisAttributeChange')) {
                        let state = JSON.parse(notice.values.message.slice(25));
                        this.onPlotAxisChange(state);
                    }

                    // // JSON.parse requires the keys wrapped in quotes.
                    // let logMessage = null;
                    // eval(`logMessage = {${notice.values.message}}`);
                    //
                    // let operation = Object.keys(logMessage)[0];
                    // if (operation === 'attributeEditFormula') {
                    //     this.onFormulaEdited(logMessage.collection, collection.name, collection.formula);
                    // }
                }
            });
        },
        setupUI() {
            let recordToggle = new Nexus.Toggle('#record-toggle', {
                size: [30, 15],
                state: this.recording
            });

            recordToggle.on('change', v => {
                this.recording = v;
                this.updateControlTable();
            });

            let replayToggle = new Nexus.Toggle('#replay-toggle', {
                size: [30, 15],
                state: this.replaying
            });

            replayToggle.on('change', v => {
                this.replaying = v;
                this.updateControlTable();
            });

            let updateTableToggle = new Nexus.Toggle('#update-toggle', {
                size: [30, 15],
                state: this.updateTable
            });

            updateTableToggle.on('change', v => {
                this.updateTable = v;

                if (v) {
                    this.dispatchQueueToTable();
                }
            });

            let interpolateToggle = new Nexus.Toggle('#interpolate-toggle', {
                size: [30, 15],
                state: this.interpolate
            });

            interpolateToggle.on('change', v => {
                this.interpolate = v;
                this.updateControlTable();
            });

            let duplicateButton = new Nexus.Button('#duplicate-button', {
                size: [15, 15],
                mode: 'impulse'
            });

            duplicateButton.on('change', v => {
                if (v) {
                    this.duplicateSelections();
                }
            });

            let deleteButton = new Nexus.Button('#delete-button', {
                size: [15, 15],
                mode: 'impulse'
            });

            deleteButton.on('change', v => {
                if (v) {
                    this.deleteSelections();
                }
            });
        },
        onGetData() {
            this.contexts = plugin.getContexts();

            if (this.contexts) {
                let filteredContexts = this.contexts.slice(); // Duplicate the list.
                filteredContexts.splice(filteredContexts.indexOf(DATAMOVES_DATA.name), 1);
                filteredContexts = filteredContexts.filter(context => {
                    return ![DATAMOVES_DATA.name, DATAMOVES_CONTROLS_DATA.name].includes(context);
                });

                // TODO: Not good. There shouldn't be "focused" context at all.
                if (filteredContexts.length) {
                    this.focusedContext = filteredContexts[0];
                }
            }

            // TODO: 3-step super hack
            if (this.incomingSortByAttr) {
                this.onSortByAttribute(this.incomingSortByAttr);
            }
        },
        setupTables() {
            if (plugin.getContexts() && plugin.getContexts().includes(DATAMOVES_DATA.name)) {
                this.firstItem = plugin.items[DATAMOVES_CONTROLS_DATA.name][0].itemID;
            } else {
                let dmTable = codapInterface.sendRequest({
                    action: 'create',
                    resource: 'dataContext',
                    values: {
                        name: DATAMOVES_DATA.name,
                        title: DATAMOVES_DATA.name,
                        collections: DATAMOVES_DATA.getCollections(),
                    }
                }).then(_ => {
                    // Open the table.
                    // codapInterface.sendRequest({
                    //     action: 'create',
                    //     resource: 'component',
                    //     values: {
                    //         type: 'caseTable',
                    //         dataContext: DATAMOVES_DATA.name
                    //     }
                    // });
                });

                let dmControlsTable = codapInterface.sendRequest({
                    action: 'create',
                    resource: 'dataContext',
                    values: {
                        name: DATAMOVES_CONTROLS_DATA.name,
                        title: DATAMOVES_CONTROLS_DATA.name,
                        collections: DATAMOVES_CONTROLS_DATA.getCollections(),
                    }
                }).then(_ => {
                    return codapInterface.sendRequest({
                        action: 'create',
                        resource: `dataContext[${DATAMOVES_CONTROLS_DATA.name}].item`,
                        values: {
                            'Record': this.recording,
                            'Replay': this.replaying,
                            'Interpolate': this.interpolate
                        }
                    }).then(result => {
                        this.firstItem = result.itemIDs[0];
                    });
                });

                return Promise.all([dmTable, dmControlsTable]);
            }
        },
        updateControlTable() {
            codapInterface.sendRequest({
                action: 'update',
                resource: `dataContext[${DATAMOVES_CONTROLS_DATA.name}].item[${this.firstItem}]`,
                values: {
                    'Record': this.recording,
                    'Replay': this.replaying,
                    'Interpolate': this.interpolate
                }
            });
        },
        queueRecordItems(values) {
            this.histTableValueList.push(values);
        },
        dispatchQueueToTable() {
            let valueList = this.histTableValueList.slice();
            this.histTableValueList = [];

            Promise.all(valueList.map(values => {
                return codapInterface.sendRequest({
                    action: 'create',
                    resource: `dataContext[${DATAMOVES_DATA.name}].item`,
                    values: values
                });
            })).then(console.log);
        },
        playbackHistory(recordedCases) {
            let types = new Set(recordedCases.map(c => c.values.Type));
            let time = new Set(recordedCases.map(c => c.values.Time));

            console.log(types, time);

            // Prevent simultaneous playback of multiple events
            // if (types.size > 1 || time.size > 1) {
            //     return null;
            // }

            // TODO: Maybe allow multiple types, but be careful about simultaneous playbacks.
            if (types.has('Select')) {
                this.playbackSelections(recordedCases);
            } else if (types.has('Move')) {
                this.playbackMovesFlat(recordedCases);
            } else if (types.has('Sort')) {
                this.sortItems(recordedCases);
            } else if (types.has('Formula')) {
                this.editFormula(recordedCases);
            }
        },
        playbackSelections(recordedCases) {
            codapInterface.sendRequest({
                action: 'create',
                resource: `dataContext[${this.focusedContext}].selectionList`,
                values: recordedCases.map(c => c.values.ID)
            }).then(console.log);
        },
        playbackMovesFlat(recordedCases) {
            // TODO: Check the context to work on.
            this.replayingFromRecord = true;

            plugin.queryAttributeCollections(this.focusedContext).then(attrCollections => {
                console.log('source state:', attrCollections);
                console.log('target state:', recordedCases);

                let attrList = [];
                attrCollections.forEach(coll => {
                    Object.entries(coll).forEach(entry => {
                        let coll = entry[0];
                        let attrs = entry[1].map(attr => {
                            attr['collection'] = coll;
                            return attr;
                        });
                        attrList = attrList.concat(attrs);
                    });
                });
                console.log('attributes:', attrList);

                let sourceState = attrCollections.map(coll => {
                    let entry = Object.entries(coll)[0];
                    let collName = entry[0];
                    let attrs = entry[1];

                    attrs = attrs.map(attr => {
                        return {
                            id: attr.id,
                            name: attr.name,
                            collection: attr.collection
                        };
                    });

                    let res = {};
                    res[collName] = attrs;

                    return res;
                });

                let targetColls = Array.from(new Set(recordedCases.reverse().map(c => c.values.Collection)));
                let targetState = targetColls.map(coll => {
                    let res = {};
                    res[coll] = [];
                    return res;
                });

                recordedCases.forEach(c => {
                    let coll = c.values.Collection;
                    let attr = attrList.find(attr => attr.id === c.values.ID).name;
                    targetState[targetColls.indexOf(coll)][coll].push({
                        id: c.values.ID,
                        name: attr,
                        collection: coll
                    });
                });

                // Do nothing if the source and target states are identical.
                if (JSON.stringify(sourceState) === JSON.stringify(targetState)) {
                    console.log('The source and target states are identical.');
                    this.replayingFromRecord = false;
                    return null;
                } else if (targetState.length === 0) {
                    console.log('Replay table selection is not valid.');
                    this.replayingFromRecord = false;
                    return null;
                } else {
                    console.log('src vs tgt:', sourceState, targetState);
                }


                let tempMoveAttrQueue = [];
                for (let i = 0; i < sourceState.length-1; i++) {
                    // Assumes the original leaf collection (e.g., "Cases")
                    let targetColl = Object.keys(sourceState[sourceState.length-1])[0];

                    Object.entries(sourceState[i]).forEach(entry => {
                        let srcColl = entry[0];
                        let srcAttrs = entry[1];

                        srcAttrs.forEach(attr => {
                            tempMoveAttrQueue.push({
                                attr: attr.name,
                                srcColl: srcColl,
                                tgtColl: targetColl,
                            });
                        });
                    });
                }

                if (tempMoveAttrQueue.length) {
                    let recursiveMove = new Promise(resolve => {
                        let moveAttrSync = (queueIdx) => {
                            let attr = tempMoveAttrQueue[queueIdx].attr;
                            let srcColl = tempMoveAttrQueue[queueIdx].srcColl;
                            let tgtColl = tempMoveAttrQueue[queueIdx].tgtColl;

                            codapInterface.sendRequest({
                                action: 'update',
                                resource: `dataContext[${this.focusedContext}].collection[${srcColl}].attributeLocation[${attr}]`,
                                values: {
                                    collection: tgtColl,
                                    position: 0
                                }
                            }).then(_ => {
                                if (queueIdx < tempMoveAttrQueue.length-1) {
                                    moveAttrSync(++queueIdx);
                                } else {
                                    resolve();
                                }
                            });
                        };
                        moveAttrSync(0);
                    });

                    recursiveMove.then(_ => {
                        let assumedNewColls = targetColls.slice();
                        let srcColl = assumedNewColls.splice(-1,1)[0];

                        let createColls = assumedNewColls.reverse().map(coll => {
                            return codapInterface.sendRequest({
                                action: 'create',
                                resource: `dataContext[${this.focusedContext}].collection`,
                                values: [{
                                    parent: 'ROOT',
                                    name: coll,
                                    title: coll
                                }]
                            });
                        });

                        Promise.all(createColls).then(_ => {
                            let moveAttrQueue = recordedCases.filter(c => {
                                return c.values.Collection !== srcColl;
                            }).map(c => {
                                let attrName = attrList.find(attr => {
                                    return attr.id === c.values.ID;
                                }).name;

                                return {
                                    attr: attrName,
                                    tgtColl: c.values.Collection
                                }
                            });

                            if (moveAttrQueue.length) {
                                let recursiveMove = new Promise(resolve => {
                                    let moveAttrSync = (queueIdx) => {
                                        let attr = moveAttrQueue[queueIdx].attr;
                                        let tgtColl = moveAttrQueue[queueIdx].tgtColl;

                                        codapInterface.sendRequest({
                                            action: 'update',
                                            resource: `dataContext[${this.focusedContext}].collection[${srcColl}].attributeLocation[${attr}]`,
                                            values: {
                                                collection: tgtColl,
                                                position: 0
                                            }
                                        }).then(_ => {
                                            if (queueIdx < moveAttrQueue.length-1) {
                                                moveAttrSync(++queueIdx);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    };
                                    moveAttrSync(0);
                                });

                                recursiveMove.then(_ => {
                                    this.replayingFromRecord = false;
                                    console.log('done moving!!!');

                                    plugin.prevDeleteNotice = null; // TODO: !!!
                                });
                            } else {
                                this.replayingFromRecord = false;
                                console.log('nothing to move');

                                plugin.prevDeleteNotice = null; // TODO: !!!
                            }
                        });
                    });

                } else {

                    let assumedNewColls = targetColls.slice();
                    let srcColl = assumedNewColls.splice(-1,1)[0];

                    let createColls = assumedNewColls.reverse().map(coll => {
                        return codapInterface.sendRequest({
                            action: 'create',
                            resource: `dataContext[${this.focusedContext}].collection`,
                            values: [{
                                parent: 'ROOT',
                                name: coll,
                                title: coll
                            }]
                        });
                    });

                    Promise.all(createColls).then(_ => {
                        let moveAttrQueue = recordedCases.filter(c => {
                            return c.values.Collection !== srcColl;
                        }).map(c => {
                            let attrName = attrList.find(attr => {
                                return attr.id === c.values.ID;
                            }).name;

                            return {
                                attr: attrName,
                                tgtColl: c.values.Collection
                            }
                        });

                        if (moveAttrQueue.length) {
                            let recursiveMove = new Promise(resolve => {
                                let moveAttrSync = (queueIdx) => {
                                    let attr = moveAttrQueue[queueIdx].attr;
                                    let tgtColl = moveAttrQueue[queueIdx].tgtColl;

                                    codapInterface.sendRequest({
                                        action: 'update',
                                        resource: `dataContext[${this.focusedContext}].collection[${srcColl}].attributeLocation[${attr}]`,
                                        values: {
                                            collection: tgtColl,
                                            position: 0
                                        }
                                    }).then(_ => {
                                        if (queueIdx < moveAttrQueue.length-1) {
                                            moveAttrSync(++queueIdx);
                                        } else {
                                            resolve();
                                        }
                                    });
                                };
                                moveAttrSync(0);
                            });

                            recursiveMove.then(_ => {
                                this.replayingFromRecord = false;
                                console.log('done moving');

                                plugin.prevDeleteNotice = null; // TODO: !!!
                            });
                        } else {
                            this.replayingFromRecord = false;
                            console.log('nothing to move');

                            plugin.prevDeleteNotice = null; // TODO: !!!
                        }
                    });

                }

                // let record = {};
                // cases.reverse().map(c => c.values).forEach(c => {
                //     if (record.hasOwnProperty(c.Collection)) {
                //         record[c.Collection].unshift(c.ID);
                //     } else {
                //         record[c.Collection] = [c.ID];
                //     }
                // });
                // let current = {};
                // attrCollections.forEach(collection => {
                //     Object.entries(collection).forEach(entry => {
                //         let coll = entry[0];
                //         let attrs = entry[1];
                //         current[coll] = attrs.map(attr => attr.id);
                //     })
                // });
                // console.log(current, record);
                // console.log(Object.keys(current), Object.keys(record));

                // function diff(src, target) {
                //     let inserted = [];
                //     target.forEach((v,i) => {
                //         if (src.indexOf(v) === -1) {
                //             inserted.push({
                //                 name: v,
                //                 pos: i
                //             });
                //         }
                //     });
                //
                //     let removed = [];
                //     src.forEach((v,i) => {
                //         if (target.indexOf(v) === -1) {
                //             removed.push({
                //                 name: v,
                //                 pos: i
                //             });
                //         }
                //     });
                //
                //     return {
                //         inserted: inserted,
                //         removed: removed
                //     }
                // }
                //
                // let diffs = diff(Object.keys(current), Object.keys(record));
                // let inserted = diffs['inserted'];
                // let removed = diffs['removed'];
                // if (inserted.length) {
                //     inserted.forEach(movedColl => {
                //         if (movedColl.pos === 0) {
                //             codapInterface.sendRequest({
                //                 action: 'create',
                //                 resource: `dataContext[${this.focusedContext}].collection`,
                //                 values: [
                //                     {
                //                         parent: 'ROOT',
                //                         name: movedColl.name,
                //                         title: movedColl.name
                //                     }
                //                 ]
                //             }).then(_ => {
                //                 // let srcColl = attributes.find(coll => {
                //                 //     return Object.values(coll)[0].some(v => v.id === record[movedColl.name][0]);
                //                 // });
                //                 // let srcCollName = Object.keys(srcColl)[0];
                //                 // let attrName = Object.values(srcColl)[0].find(v => v.id === record[movedColl.name][0]).name;
                //                 //
                //                 // codapInterface.sendRequest({
                //                 //     action: 'update',
                //                 //     resource: `dataContext[${this.focusedContext}].collection[${srcCollName}].attributeLocation[${attrName}]`,
                //                 //     values: {
                //                 //         collection: movedColl.name,
                //                 //         position: 0
                //                 //     }
                //                 // })
                //             });
                //         } else {
                //             codapInterface.sendRequest({
                //                 action: 'create',
                //                 resource: `dataContext[${this.focusedContext}].collection`,
                //                 values: [
                //                     {
                //                         parent: Object.keys(current)[movedColl.pos],
                //                         name: movedColl.name,
                //                         title: movedColl.name
                //                     }
                //                 ]
                //             }).then(_ => {
                //                 // let attrList = [];
                //                 // attributes.forEach(coll => {
                //                 //     attrList.concat(Object.values(coll))
                //                 // });
                //                 // let attrName = attrList.find(v => v.id === record[movedColl.name][0]);
                //                 // console.log(attributes, record[movedColl.name][0], attrName);
                //             });
                //         }
                //     });
                // }
            });
        },
        playbackMovesMinimal(recordedCases) {

        },
        duplicateSelections() {
            plugin.getSelectedItems(DATAMOVES_DATA.name).then(selectedCases => {
                let dateTime = new Date();

                selectedCases.forEach(c => {
                    c.values.Time = dateTime;
                    this.queueRecordItems(c.values);
                });

                if (this.updateTable) {
                    this.dispatchQueueToTable();
                }
            });
        },
        deleteSelections() {
            plugin.getSelectedCases(DATAMOVES_DATA.name).then(selectedCases => {
                let deleted = [];

                selectedCases.forEach(c => {
                    if (!deleted.includes(c.id)) {
                        codapInterface.sendRequest({
                            action: 'delete',
                            resource: `dataContext[${DATAMOVES_DATA.name}].collection[${c.collection}].caseByID[${c.id}]`
                        });
                        c.deleted.push(c.id);
                    }
                });
            });
        },
        onItemsSelected(context, collection, cases) {
            let dateTime = new Date();

            cases.forEach(c => {
                this.queueRecordItems({
                    Time: dateTime,
                    ID: c.id,
                    Type: 'Select',
                    Context: context,
                    Collection: collection
                });
            });

            if (this.updateTable) {
                this.dispatchQueueToTable();
            }
        },
        onAttributeMoved(context, attrCollections) {
            console.log('onAttributeMoved:', attrCollections);

            let dateTime = new Date();

            attrCollections.forEach(collection => {
                Object.entries(collection).forEach(entry => {
                    let coll = entry[0];
                    let attrs = entry[1];
                    attrs.forEach(attr => {
                        this.queueRecordItems({
                            Time: dateTime,
                            ID: attr.id,
                            Type: 'Move',
                            Attribute: attr.name,
                            Collection: coll,
                            Context: context
                        });
                    });
                });
            });

            if (this.updateTable) {
                this.dispatchQueueToTable();
            }
        },
        onFormulaEdited(context, attributes) {
            let dateTime = new Date();

            attributes.forEach(attr => {
                this.queueRecordItems({
                    Time: dateTime,
                    ID: attr.id,
                    Type: 'Formula',
                    Context: context,
                    Attribute: attr.name,
                    Formula: attr.formula
                });
            });

            if (this.updateTable) {
                this.dispatchQueueToTable();
            }
        },
        onSortByAttribute(attrData) {
            let dateTime = new Date();

            // Guess the sort direction.
            let firstLast = plugin.data[attrData.context][attrData.collection].map(c => c.values[attrData.name])
                .filter(c => c !== '');

            let ascending = firstLast[0] <= firstLast[firstLast.length-1];

            this.queueRecordItems({
                Time: dateTime,
                ID: attrData.ID,
                Type: 'Sort',
                Context: attrData.context,
                Collection: attrData.collection,
                Attribute: attrData.name,
                Direction: ascending ? 'Ascending' : 'Descending'
            });

            if (this.updateTable) {
                this.dispatchQueueToTable();
            }

            this.incomingSortByAttr = null;
        },
        sortItems(recordedCases) {
            recordedCases.forEach(c => {
                let context = c.values.Context;
                let attribute = c.values.Attribute;
                let ascending = c.values.Direction === 'Ascending';

                let sortedItems = plugin.items[context].slice();

                sortedItems.sort((a,b) => {
                    if (a.values[attribute] < b.values[attribute]) {
                        return ascending ? -1 : 1;
                    } else if (a.values[attribute] > b.values[attribute]) {
                        return ascending ? 1 : -1;
                    } else {
                        return 0;
                    }
                });

                codapInterface.sendRequest({
                    action: 'delete',
                    resource: `dataContext[${context}].allCases`
                }).then(_ => {
                    return codapInterface.sendRequest({
                        action: 'create',
                        resource: `dataContext[${context}].item`,
                        values: sortedItems.map(item => item.values)
                    });
                });
            });
        },
        onPlotAxisChange(state) {
            let dateTime = new Date();

            this.queueRecordItems({
                Time: dateTime,
                // ID: attrData.ID,
                Type: 'Plot',
                // Context: attrData.context,
                // Collection: attrData.collection,
                Attribute: state.attribute,
                Direction: state.orientation
            });

            if (this.updateTable) {
                this.dispatchQueueToTable();
            }
        },
        editFormula(recordedCases) {
            recordedCases.forEach(c => {
                let context = c.values.Context;
                let attribute = c.values.Attribute;
                let formula = c.values.Formula;
                let attrData = null;

                codapInterface.sendRequest({
                    action: 'get',
                    resource: `dataContext[${context}].attribute[${attribute}]`
                }).then(result => {
                    attrData = result.values;
                    attrData.formula = formula;

                    let collection = null;
                    Object.entries(plugin.data[context]).some(entry => {
                        let collName = entry[0];
                        let cases = entry[1];

                        if (Object.keys(cases[0].values).includes(attribute)) {
                            collection = collName;
                            return true;
                        } else {
                            return false;
                        }
                    });

                    // Note: Update attribute needs the collection specified.
                    return codapInterface.sendRequest({
                        action: 'update',
                        resource: `dataContext[${context}].collection[${collection}].attribute[${attribute}]`,
                        values: attrData
                    }).then(console.log);
                });
            });
        },
        openInfoPage() {
            plugin.openSharedInfoPage();
        }
    },
    mounted() {
        this.initPlugin();
        this.setupUI();
    }
});