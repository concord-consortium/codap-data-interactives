# Test Cases

This document has descriptions of test procedures for this plugin.
There may or may not be automated scripts to execute the tests.
Tests will often require specific data files or CODAP documents.
These will be found in this directory unless otherwise indicated.

## Performance and Best Practices Tests

### Lighthouse Suite

Checks for startup-related performance and best practices issues.

1. Open plugin in its own tab on a Chrome-derived browser (Chrome, Opera, Brave, ...)
2. Open the developer panel
3. In the developer panel find and open the "Lighthouse" tab.
4. Select Mode: Navigation, Device: Desktop, Categories: Performance, Accessibility, Best Practices
5. Click on "Analyze Page Load"

General scores should be above 90% on all three scores, and under .5 seconds for first contentful paint.

## Startup Modes

### Drop in initially empty CODAP document

1. Open CODAP with an empty document.
1. Drag in a link to the Sonify plugin
   - Dataset, Pitch, and Time should all should show an empty select box
1. Drag into the CODAP workspace the file `./data/sonification-test.csv`.
   - Dataset should now show "sonification-test"

### Drop in CODAP document with data

1. Open CODAP with an empty document.
1. Drag into the CODAP workspace the file `./data/sonification-test.csv`.
1. Drag in a link to the Sonify plugin
   - Dataset should show "sonification-test"

### Reopen document that had plugin defined

1. Open CODAP with `./documents/test-doc-1.codap` from this directory.
   - The plugin should have the following settings
     - Loop: disabled
     - Speed: slow (slider almost to the left)
     - Dataset: "sonification-test"
     - Pitch: "x"
     - Time: "time"

### Open plugin outside CODAP
