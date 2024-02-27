### To get started

- npm install
- npm run build

### Translations
These plugins are localizable using the [CODAP Getting Started Project on POEditor](https://poeditor.com/projects/view?id=683807). To translate these into another language, add that language on POEditor and the use `npm run strings:pull` to download the latest changes across all language translations.

The getting started plugin at index.html is not deployable in the usual way that plugins in this codap-data-interactives directory are because it relies on same-origin for the drag of the data file into CODAP.

It is normally deployed to the codap.concord.org/plugins server.