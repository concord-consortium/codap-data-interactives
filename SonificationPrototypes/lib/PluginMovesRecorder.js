class PluginMovesRecorder {
    constructor(pluginHelper) {
        this.pluginHelper = pluginHelper;
        this.codapInterface = pluginHelper.codapInterface;
        this.histContextName = 'Data Moves';
    }

    record(data) {
        if (this.pluginHelper.data && Object.keys(this.pluginHelper.data).includes(this.histContextName)) {
            data['Time'] = new Date();

            return codapInterface.sendRequest({
                action: 'create',
                resource: `dataContext[${this.histContextName}].item`,
                values: data
            });
        }
    }
}