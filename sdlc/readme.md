## SDLC Project

The SDLC Project provides a data portal as a CODAP plugin. It accesses an extract
of IPUMS population data that is stored on a concord server. The user can select
a subset of people to study in CODAP. The user can choose the sub-sample size,
one or more sample years, and whether to pull the data from the population of
the US as a whole or from the populations of individual states. The data
extracted is a random subsample. It selected taking into account sample
weightings. The goal is that the subsample is representative of within the total
population.

### Links

* Project working doc: https://docs.google.com/document/d/1tbCt3zTmPZYxZH1Yoysi8fx19f2zK1hNi8crNOd4_hk/edit#heading=h.eidohgtya2ew


### Elements

* Plugin: runs in codap.
  * Creates a dataset in CODAP that is an extract of our extract according
    to user's selection.
    * Fetches codebook, translation json to use to create the table and to
      translate data.
  * user can select
    * one or more states or all states
    * one or more year or all years
    * some number of attributes of interest
    * the size of the sample
* Server-side scripts that generate one or more csv files from the IPUMS extract, break those csv files into smaller files in sub-directories, and then upload these files to AWS

### Add new data from IPUMS

IPUMS provides harmonized population microdata based on the decennial US Federal Census and the American Community Survey. The following steps will allow you to recreate an extract, for example, to update the selected properties of individuals. Updates to properties need to be coordinated with the attribute definitions in `plugin/js/attributeConfig.js`.

If the plugin needs to be updated with data for new years, or if new variables need to be added to the available options, follow these steps:

* Create an account:
  * Go to https://usa.ipums.org/usa/,
  * click on "Log In",
  * then, "Create an Account", and
  * follow instructions.
* Create an extract:
  * Go to https://usa.ipums.org/usa/,
  * click on "Select Data"
  * Using codebook.xml as a guide, select desired variables from the available options.
    * Note: you will see some attributes that appear to be duplicates of others but with an extra "D" at the end -- these are detailed versions of those attributes, and are auto-generated when you select the first one. Also note, that the SAMPLES variable has replaced the old DATANUM variable.
  * Select the samples for the desired years.
  * Use the full sample size.
  * Submit extract.
  * Download the .dat file and the codebook .xml file, and store them in the data directory (for now).
* Convert the .dat file to CSV(s)
  * In the terminal, for each year of downloaded data, run `./bin/createCSVFromDat path_to_datFile, path_to_codebookFile, [year], path_to_output_directory`
* Generate "presets" files from CSV file
  * In the terminal, for each year, run  `./bin/createPresets path_to_generated_csvFile, path_to_codebookFile, presets/[year]`
* Upload CSV files to S3
  * Gzip the preset csv files using the command `gzip -r presets`
  * Run the s3-sync script: `./bin/s3-sync presets`
* Update metadata file
  * In the terminal, run `./bin/createMetadataFile presets path_for_output_file.json`
    * Note: the path to the output file should be different than the current path to the metadata file, otherwise it will overwrite the current metadata file.
  * Once the metadata is generated, copy the new data values into plugin/assets/data/metadata.json.
  * Delete the newly-generated metadata file.
* Delete any extraneous files
  * Delete the .dat file, codebook file, and the csv files you generated for each year. Git will automatically ignore the presets folder.
* Push up changes.
