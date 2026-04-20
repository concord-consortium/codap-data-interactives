# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing ~98 plugins for [CODAP](http://github.com/concord-consortium/codap) (Common Online Data Analysis Platform). Each plugin is a web application that runs in an iframe and communicates with CODAP via postMessage using the [CODAP Data Interactive Plugin API](https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API).

## Build Commands

**Note:** Node.js 17+ requires the OpenSSL legacy provider for react-scripts 3.4.3:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

**Root-level (Plugin Browser/Index):**
```bash
npm install          # Install dependencies
npm start            # Dev server for plugin browser
npm run build        # Build plugin browser React app
npm test             # Run tests (react-scripts test, runs in watch mode)
npm test -- --watchAll=false   # Run tests once without watch mode
```

**Standard Plugin Build (for CODAP V2 release):**
```bash
<<<<<<< HEAD
npm run std:check                    # Validate git status before build
=======
npm run std:check                    # Validate git status (must be on master, clean tree)
>>>>>>> master
npm run std:increment-build-number   # Increment build number in lib/build-num.txt
npm run std:build                    # Build all standard plugins to target/
```

<<<<<<< HEAD
**Individual Plugin Build (example for a React plugin):**
```bash
cd PluginName
npm install
npm run build
=======
**Individual Plugin Build (for React/TypeScript plugins):**
```bash
cd PluginName && npm install && npm run build
```

**Translations:**
```bash
npm run strings:pull    # Update translations for Importer, TP-Sampler, Scrambler, Testimate
>>>>>>> master
```

## Architecture

### Plugin Types

1. **Standard Plugins** (`isStandard: "true"` in data_interactive_map.json): Built and released with CODAP V2
2. **GitHub Pages Plugins**: Deployed independently to concord-consortium.github.io
3. **External Plugins**: Hosted on third-party servers

### Key Files

- `src/data_interactive_map.json` - Master registry of all plugins (title, path, dimensions, categories, visibility)
- `lib/build-num.txt` - Current build number for standard plugin releases
<<<<<<< HEAD
- `published-plugins.json` - Generated list of standard plugins (created by bin/build)
- `plugins.md` - Auto-generated documentation of all plugins

### Directory Structure

- `src/` - React app for the plugin browser/index page
- `bin/` - Build and deployment scripts
- `Common/` - Shared assets and libraries used by multiple plugins
- `eepsmedia/` - Partner organization plugins (Choosy, Scrambler, Testimate, Simmer)
- `data-science-worlds/` - Collection of data science game plugins
- Individual plugin directories (Importer, Sonify, DayLength, etc.)

### Build Process (bin/build)

The standard build script:
1. Copies **static plugins** directly: TP-Sampler, DrawTool, Importer, NOAA-weather, sdlc/plugin, eepsmedia plugins, Sonify, nhanes
2. Runs `npm install && npm run build` for **built plugins**: onboarding, codap-transformers, story-builder, noaa-codap-plugin
3. Generates `published-plugins.json` from entries with `isStandard: "true"`
4. Creates zip file: `target/codap-data-interactives-{BUILD_NUM}.zip`

### Technology Stack

The codebase is heterogeneous:
- **Plugin Browser**: React 16 + Create React App
- **Modern plugins**: TypeScript + React (DayLength, CollectMeasures, story-builder, codap-transformers)
- **Vue.js**: Sonify
- **Plain JavaScript**: Importer, most static plugins
- **Webpack**: Sonify, Scrambler, Testimate, Purple Air

### Plugin Communication

All plugins use iframe-phone or direct postMessage to communicate with CODAP. The pattern:
```javascript
codapInterface.init({...}).then(() => {
  // Plugin ready
});
```
=======
- `Common/js/build-include.js` - Generated file exposing build number as `window.codapPluginConfig`
- `published-plugins.json` - Generated list of standard plugins (created by bin/build)
- `plugins.md` - Auto-generated documentation of all plugins

### Plugin Registry Schema (data_interactive_map.json)

Each entry in the `data_interactives` array:
```json
{
  "title": "Plugin Name",
  "description": "HTML description",
  "title-string": "DG.plugin.PluginName.title",
  "description-string": "DG.plugin.PluginName.description",
  "width": 400, "height": 600,
  "path": "/PluginDir/index.html",
  "icon": "/path/to/icon.svg",
  "visible": "true",
  "isStandard": "true",
  "categories": ["Tools"]
}
```
Categories: Partners, Portals, Simulators, Generators, Tools, Dev, Search.

### Directory Structure

- `src/` - React 16 app for the plugin browser/index page
- `bin/` - Build scripts: `build`, `check`, `increment-build-number`, `update-strings`
- `Common/` - Shared libraries for root-level plugins (CodapInterface.js, iframe-phone.js, codap_helper.js, csv.js, jQuery, Raphael)
- `eepsmedia/` - Partner plugins (Choosy, Scrambler, Testimate, Simmer) with own shared code in `eepsmedia/common/src/`
- `data-science-worlds/` - Collection of data science game plugins

### Build Process (bin/build)

The standard build script handles three tiers:
1. **Static plugins** (copied as-is via rsync): TP-Sampler, DrawTool, Importer, NOAA-weather, sdlc/plugin, eepsmedia plugins, Sonify, nhanes
2. **Built plugins in this repo**: onboarding (outputs to `target/`)
3. **Built plugins in sibling repos**: `../codap-transformers`, `../story-builder`, `../noaa-codap-plugin` (output to `build/` or `dist/`)
4. **Hidden dirs** (Common, eepsmedia/common) are copied but not listed as plugins
5. Generates `published-plugins.json` by filtering for `isStandard: "true"`
6. Creates `target/codap-data-interactives-{BUILD_NUM}.zip`

### Technology Stack

The codebase is heterogeneous — identify which pattern a plugin uses before modifying it:
- **Plugin Browser**: React 16 + Create React App (react-scripts 3.4.3)
- **TypeScript + React**: DayLength, CollectMeasures — use CRA, each has own `tsconfig.json`
- **ES6 modules, no build step**: Importer — uses `"type": "module"` in package.json, runs directly in browser
- **Vue.js + Webpack**: Sonify
- **Webpack + vanilla JS**: Scrambler, Testimate, Simmer (eepsmedia plugins)
- **Plain JavaScript**: Most static plugins — reference `Common/js/` via script tags

### CODAP Communication Libraries

Two approaches exist — prefer CodapInterface for new code:

1. **CodapInterface.js** (`Common/js/CodapInterface.js`) - Modern, Promise-based:
   ```javascript
   codapInterface.init({name: "MyPlugin", ...}).then(() => { /* ready */ });
   codapInterface.sendRequest({action: "create", resource: "dataContext", ...});
   ```

2. **codap_helper.js** (`Common/js/codap_helper.js`) - Legacy, callback-based:
   ```javascript
   codap_helper.initSim(config);
   codap_helper.createCase(collectionName, values, callback);
   ```

TypeScript plugins (DayLength, CollectMeasures) bundle their own TypeScript versions of CodapInterface in `src/lib/`.

The eepsmedia plugins use their own copy at `eepsmedia/common/src/codapInterface.js`.

### Internationalization

- Translated plugins: Importer, TP-Sampler, Scrambler, Testimate
- Translation keys follow pattern: `DG.plugin.PluginName.key`
- Strings stored in JSON files within each plugin (e.g., `modules/strings.json`)
- Pull updates from translation service via `npm run strings:pull` (root) or `npm run strings:pull` (individual plugin)
- HTML elements use `data-text` attributes for localized content

### Linting

- Root `.eslintrc.json`: ESLint with `eslint:recommended` + `plugin:react/recommended` (ecmaVersion 2017)
- Root `.jshintrc`: JSHint for legacy JavaScript (ES9, browser+jQuery globals, SproutCore globals)
- Plugin browser uses `react-app` ESLint preset (configured in root package.json)
- Some plugins have their own linting configs
>>>>>>> master

## Adding a New Plugin

1. Create a directory for the plugin
2. Add entry to `src/data_interactive_map.json` with title, description, path, width, height, categories
3. Set `isStandard: "true"` if it should be included in CODAP V2 builds
4. If it needs to be built, add to `BUILT_PLUGIN_DIRS` in `bin/build`; otherwise add to `STATIC_PLUGIN_DIRS`
<<<<<<< HEAD
=======
5. For static plugins, include `Common/js/iframe-phone.js` and `Common/js/CodapInterface.js` via script tags
>>>>>>> master

## Branches

- `master` - Main development branch
- `gh-pages` - GitHub Pages deployment (plugin browser + static plugins)
