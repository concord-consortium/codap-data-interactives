Wolf-Sheep Predation ReadMe
===========================

These files demonstrate straightforward modifications to a NetLogo model that has been converted to HTML to allow to be embedded in CODAP.

Changes to the Interface
------------------------
1. Because CODAP produces graphs of the data, the plot contained in the NetLogo model was removed so that it would take up less room.
2. To free up a little more room, the option to show the energy of individual wolves and sheep was removed.
3. If either wolves or sheep go to zero, the simulation stops.
4. The count of grass patches is no longer divided by 4. In CODAP this attribute can be plotted on a separate vertical axis so that its vertical range is commensurate with the count of wolves and sheep.

Files
-----
* iframe-phone.js—The standard IFramePhone library file
* nl_codap_helper.js—Functions contained herein are generally useful for preparing NetLogo models for embedding in CODAP
* index.html—The result of running 'Wolf Sheep Predation.nlogo,' a model that comes with the NetLogo installation, through the NetLogo Tortoise compiler and then hand editing to work when embedded in CODAP
