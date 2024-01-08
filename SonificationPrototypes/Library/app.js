const helper = new CodapPluginHelper(codapInterface);

const app = new Vue({
    el: '#app',
    data: {
        dimensions: {
            width: 180,
            height: 300
        },
        plugins: null
    },
    methods: {
        // dragstart(plugin, event) {
        //     let url = this.getPluginURL(plugin);
        //     event.dataTransfer.setData('text', url);
        //     event.dataTransfer.setData('url', url);
        // },
        getPluginURL(plugin) {
            let location = window.location.pathname;
            let path = location.split('/').slice(0,-2).concat(plugin.location,'index.html').join('/');
            return window.location.origin + path;
        },
        openPlugin(pluginData) {
            helper.openPlugin(pluginData);
        },
        openInfoPage() {
            helper.openSharedInfoPage();
        }
    },
    mounted() {
        this.plugins = PLUGIN_LIST;
        this.dimensions.height = PLUGIN_LIST.length * 20 + 100;

        helper.init('Sonification Library', this.dimensions);
    }
});