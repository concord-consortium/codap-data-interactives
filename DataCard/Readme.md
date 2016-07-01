### DataCard

This is a React-based data interactive. We translate from JSX to plain javascript
at build time. Right now this is done with the build task in `package.json`. 
The file `./src/DataCard.jsx` is the single source file for this implementation.
It is converted into `./js/DataCard.js`. If you change this data interactive
you should edit the `.jsx` file and run the build task to update the `.js`. If 
things get more complicated we will introduce a more sophisticated build process.
