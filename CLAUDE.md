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
npm run std:check                    # Validate git status (must be on master, clean tree)
npm run std:increment-build-number   # Increment build number in lib/build-num.txt
npm run std:build                    # Build all standard plugins to target/
```

**Individual Plugin Build (for React/TypeScript plugins):**
```bash
cd PluginName && npm install && npm run build
```

**Translations:**
```bash
npm run strings:pull    # Update translations for Importer, TP-Sampler
```

## Architecture

### Plugin Types

1. **Standard Plugins** (`isStandard: "true"` in data_interactive_map.json): Built and released with CODAP V2
2. **GitHub Pages Plugins**: Deployed independently to concord-consortium.github.io
3. **External Plugins**: Hosted on third-party servers

### Key Files

- `src/data_interactive_map.json` - Master registry of all plugins (title, path, dimensions, categories, visibility)
- `lib/build-num.txt` - Current build number for standard plugin releases
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
- `eepsmedia/` - Tombstone only. These partner plugins (Choosy, Scrambler, Testimate, Simmer) moved to [concord-consortium/eepsmedia](https://github.com/concord-consortium/eepsmedia) on 2026-07-31. Do not re-add plugin code here; see `eepsmedia/README.md`.
- `data-science-worlds/` - Collection of data science game plugins, all by Tim Erickson / eeps media.
  Migrating them into the eepsmedia repo has been discussed but **not** done — unlike `eepsmedia/`,
  this code is still live here. Only `nhanes` is built. Note that `sdlc/plugin` and `NOAA-weather`
  also carry Erickson authorship headers but are Concord-maintained, and are not part of that idea.

### Build Process (bin/build)

The standard build script handles three tiers:
1. **Static plugins** (copied as-is via rsync): TP-Sampler, DrawTool, Importer, NOAA-weather, sdlc/plugin, Sonify, nhanes
2. **Built plugins in this repo**: onboarding (outputs to `target/`)
3. **Built plugins in sibling repos**: `../codap-transformers`, `../story-builder`, `../noaa-codap-plugin` (output to `build/` or `dist/`)
4. **Hidden dirs** (Common) are copied but not listed as plugins
5. Generates `published-plugins.json` by filtering for `isStandard: "true"`
6. Creates `target/codap-data-interactives-{BUILD_NUM}.zip`

This build targets CODAP **V2**, which serves plugins from folders co-located with the built
application. (V3 deploys plugins independently of the application and does not use
`published-plugins.json`.) The eepsmedia plugins are still listed in `published-plugins.json` and
`src/data_interactive_map.json` even though `bin/build` no longer copies them — that file describes
what a V2 build should contain, so if another V2 build is ever needed, copy those folders in
manually. See `eepsmedia/README.md`.

**Which registry serves which application.** Getting this wrong is an easy and costly mistake, so
be explicit about it before reasoning from any of these files. As of this writing (2026-08), and
noting that the two entries in the codap repo can move without anything here changing:

| Application | Plugin registry | Where |
|---|---|---|
| V2 menu | `hierarchical_plugins.json` | codap repo, `apps/dg/resources/json/`, `master` |
| V2 build manifest | `published-plugins.json` | generated here by `bin/build` |
| V3 menu | `standard-plugins.json` | codap repo, `v3/src/components/tool-shelf/`, **`main`** |

V3 builds from `v3/` on `main`; V2 builds from `master`. **V3 does not read
`published-plugins.json` or `src/data_interactive_map.json` at all** — neither file is evidence
about V3 behaviour, however convenient it looks. V3's paths are mostly relative and resolve against
`https://codap.concord.org/codap-resources/plugins/`, so a plugin's real home is usually the
`codap-resources` S3 bucket, not this repo. Verify against the current codap repo before relying on
any of this.

### Technology Stack

The codebase is heterogeneous — identify which pattern a plugin uses before modifying it:
- **Plugin Browser**: React 16 + Create React App (react-scripts 3.4.3)
- **TypeScript + React**: DayLength, CollectMeasures — use CRA, each has own `tsconfig.json`
- **ES6 modules, no build step**: Importer — uses `"type": "module"` in package.json, runs directly in browser
- **Vue.js + Webpack**: Sonify
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

### Internationalization

- Translated plugins: Importer, TP-Sampler (Scrambler and Testimate moved to the eepsmedia repo)
- Translation keys follow pattern: `DG.plugin.PluginName.key`
- Strings stored in JSON files within each plugin (e.g., `modules/strings.json`)
- Pull updates from translation service via `npm run strings:pull` (root) or `npm run strings:pull` (individual plugin)
- HTML elements use `data-text` attributes for localized content

### Linting

- Root `.eslintrc.json`: ESLint with `eslint:recommended` + `plugin:react/recommended` (ecmaVersion 2017)
- Root `.jshintrc`: JSHint for legacy JavaScript (ES9, browser+jQuery globals, SproutCore globals)
- Plugin browser uses `react-app` ESLint preset (configured in root package.json)
- Some plugins have their own linting configs

## Adding a New Plugin

1. Create a directory for the plugin
2. Add entry to `src/data_interactive_map.json` with title, description, path, width, height, categories
3. Set `isStandard: "true"` if it should be included in CODAP V2 builds
4. If it needs to be built, add to `BUILT_PLUGIN_DIRS` in `bin/build`; otherwise add to `STATIC_PLUGIN_DIRS`
5. For static plugins, include `Common/js/iframe-phone.js` and `Common/js/CodapInterface.js` via script tags

## Branches

- `master` - Main development branch
- `gh-pages` - GitHub Pages deployment (plugin browser + static plugins)

> ⚠️ **`gh-pages` is load-bearing and is updated by hand.** No workflow or script syncs it, so it
> still holds content that `master` no longer has, and live applications point at it. As of this
> writing (2026-08):
>
> - CODAP **V3** serves the NHANES plugin from
>   `concord-consortium.github.io/codap-data-interactives/data-science-worlds/nhanes/nhanes.html`,
>   hardcoded in V3's `standard-plugins.json`. V2 pins the same URL independently.
> - The branch still carries the eepsmedia plugin files, and the plugin browser it publishes links
>   to `/eepsmedia/plugins/...`, which no longer exist on `master`.
>
> Regenerating `gh-pages` from `master` would therefore break NHANES in both applications and the
> eepsmedia links at the same time. Repointing either application requires a release of that
> application. Check whether both are still true, and deal with them, before regenerating.
