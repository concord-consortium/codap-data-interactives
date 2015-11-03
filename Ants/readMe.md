Ants ReadMe
===========

These files demonstrate straightforward modifications to a NetLogo model that has been converted to HTML to allow to be embedded in CODAP.

Changes to the Interface
------------------------
1. Because CODAP produces graphs of the data, the plot contained in the NetLogo model was removed so that it would take up less room.

Files
-----
* nl_codap_helper.js—Functions contained herein are generally useful for preparing NetLogo models for embedding in CODAP. However, there are specific modifications for this model specifying the structure of the data produced.
* index.html—The result of running 'Ants.nlogo,' a model that comes with the NetLogo installation, through the NetLogo Web Standalone generator and then hand editing to work with CODAP.
