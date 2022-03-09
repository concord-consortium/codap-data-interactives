codap-data-interactives
=======================

This is the directory of plugins for use with [CODAP](http://github.com/concord-consortium/codap).
A CODAP plugin, or more formally CODAP Data Interactive Plugin, 
is a small web application that
can be installed into the CODAP web application workspace to add 
functionality to CODAP.
It is instantiated in an IFrame and communicates with CODAP over postMessage using the 
[CODAP Data Interactive API](https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-Plugin-API).

In general, each subdirectory in this repository represents the code for 
a single plugin.
The plugins herein are a miscellany.
Some are experimental or prototype plugins where new development has ceased.
Some are more polished, but still not fully supported and are made available 
only on the GHPages site for this repository.
Some are fully supported and are built and released with CODAP.

Many of the plugins are statically deployed and have no build process.
Others have their own build process.
See the READMEs in the individual directory.

The GHPages index page is a React application.
Its source is in the 'src' subdirectory.
It builds to the 'build' subdirectory.
To build do this (assuming a node environment):
```
npm install
npm run build
```

Not all plugins referred to by the index page are present in this codeline.
Some are built by Concord Consortium but live elsewhere.
Many, if not most, have been build by other organizations and are managed on
their servers.
If you have built a CODAP plugin and would like it to be displayed here, 
please contact the [CODAP team](https://codap.concord.org).
