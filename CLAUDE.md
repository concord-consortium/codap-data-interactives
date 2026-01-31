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
npm test             # Run tests
```

**Standard Plugin Build (for CODAP V2 release):**
```bash
npm run std:check                    # Validate git status before build
npm run std:increment-build-number   # Increment build number in lib/build-num.txt
npm run std:build                    # Build all standard plugins to target/
```

**Individual Plugin Build (example for a React plugin):**
```bash
cd PluginName
npm install
npm run build
```

## Architecture

### Plugin Types

1. **Standard Plugins** (`isStandard: "true"` in data_interactive_map.json): Built and released with CODAP V2
2. **GitHub Pages Plugins**: Deployed independently to concord-consortium.github.io
3. **External Plugins**: Hosted on third-party servers

### Key Files

- `src/data_interactive_map.json` - Master registry of all plugins (title, path, dimensions, categories, visibility)
- `lib/build-num.txt` - Current build number for standard plugin releases
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

## Adding a New Plugin

1. Create a directory for the plugin
2. Add entry to `src/data_interactive_map.json` with title, description, path, width, height, categories
3. Set `isStandard: "true"` if it should be included in CODAP V2 builds
4. If it needs to be built, add to `BUILT_PLUGIN_DIRS` in `bin/build`; otherwise add to `STATIC_PLUGIN_DIRS`

## Branches

- `master` - Main development branch
- `gh-pages` - GitHub Pages deployment (plugin browser + static plugins)
