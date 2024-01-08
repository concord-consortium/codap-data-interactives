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

### Running the plugin

You can test the plugin by deploying a local CODAP instance 
and plugin instance together on an unsecure local http server or 
you can deploy the plugin in a secure http server and use the 
"official" CODAP release at https://codap.concord.org/app. 
Browser security rules prevent an unsecure instance of the plugin 
from communicating with a secure CODAP instance.

#### Installing a local CODAP Instance

The latest version of CODAP can be downloaded the CODAP server at
`https://codap.concord.org/releases/zips/latest.zip`.
Simply navigate that address in a browser.
Unzip into the file-space of a local http server.

#### Installing a secure server on a development machine

* Install mkcert. On Mac: `brew install mkcert`
* Create and install the CA in KeyChain with `mkcert -install`
* cd to this directory.
* `mkcert -key-file key.pem -cert-file cert.pem localhost`
* `npx http-server . -S`
* browse to `https://localhost:8080/Sonify/`

#### Dropping the plugin in a CODAP Document

- Open CODAP in one tab of a browser.
- Open the Sonify plugin in another tab.
- Drag the URL for the latter tab into the tab of the former.
  Wait for the CODAP tab to become active, then drop the URL in the CODAP
  workspace.

#### Opening the plugin when opening CODAP

Alternatively, if CODAP's URL is http://localhost:8080/CODAP/ and the plugin's
URL is http://localhost:8080/Sonify/, then, invoke them together this way:

    `http://localhost:8080/CODAP/?di=http://localhost:8080/Sonify/`


