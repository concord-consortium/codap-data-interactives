/**
 * The NotificationManager is created at startup and handles notifications from CODAP that must be received and
 * handled regardless of which components have been created and initialized.
 */
import {Store} from "./store";
import codapInterface from "./lib/CodapInterface";
import {action} from "mobx";

export default class NotificationManager {

  store: Store

  constructor(iStore: Store) {
    this.store = iStore;
    this.handleDataContextChange = this.handleDataContextChange.bind(this)
    this.handleInternalChanges = this.handleInternalChanges.bind(this)
    codapInterface.on('notify', '*', 'dataContextCountChanged', this.handleDataContextChange);
    codapInterface.on('notify', '*', 'titleChange', this.handleDataContextChange);
    codapInterface.on('notify', '*', 'edit formula', this.handleInternalChanges);
    codapInterface.on('notify', '*', 'updateAttributes', this.handleInternalChanges);
    codapInterface.on('notify', '*', 'updateCases', this.handleInternalChanges);
    codapInterface.on('notify', '*', 'dependentCases', this.handleInternalChanges);
    codapInterface.on('notify', '*', 'createCollection', this.handleInternalChanges);
    codapInterface.on('notify', '*', 'deleteCollection', this.handleInternalChanges);
  }

  async handleDataContextChange(/*iNotification: CODAP_Notification*/) {
    action(async () => {
      await this.store.updateSourceDatasets()
    })()
  }

  async handleInternalChanges(/*iNotification: CODAP_Notification*/) {
    action(async () => {
      await this.store.checkForRandomnessAndMeasures()
    })()
  }

}

