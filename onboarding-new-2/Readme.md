### tutorial

This is a React-based data interactive plugin. We translate from JSX to plain javascript
at build time. Right now this is done with the build task in `package.json`. 
The file `./src/onboarding.jsx` is the single source file for this implementation.
It is converted into `./js/onboarding.js`. If you change this data interactive
you should edit the `.jsx` file and run the build task to update the `.js`. If 
things get more complicated we will introduce a more sophisticated build process.

### To get started

- npm install
- npm run build



This data-interactive plugin is not deployable in the usual way that plugins in this codap-data-interactives directory are because it relies on same-origin for the drag of the data file into CODAP.

It is normally deployed to the codap.concord.org/plugins server.