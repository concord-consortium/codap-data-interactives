# Sonify README

## Description
Sonify is a CODAP Plugin that permits time series data in 
CODAP to be played as sounds.
## Developer Notes
### Setup
Assumes node and npm are installed.

    `npm install`

### Build
    `npm run build`
### Running locally
Assumes a local CODAP instance and that the working directory is within the 
filesystem managed by a local web server.
* Open CODAP in one tab of a browser.
* Open the Sonify plugin in another tab.
* Drag the URL for the latter tab into the tab of the former. 
Wait for the CODAP tab to become active, then drop the URL in the CODAP 
workspace.

Alternatively, if CODAP's URL is http://localhost:8080/CODAP/ and the plugin's 
URL is http://localhost:8080/Sonify/, then, invoke them together this way:

    `http://localhost:8080/CODAP/?di=http://localhost:8080/Sonify/`

