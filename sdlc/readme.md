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
* Database containing IPUMS microdata
* Server-side DB access scripts

### The IPUMS Extract

IPUMS provides harmonized population microdata based on the decennial US Federal Census and the American Community Survey. The following steps will allow you to recreate an extract, for example, to update the selected properties of individuals. Updates to properties need to be coordinated with the attribute definitions in `plugin/js/attributeConfig.js`.

* Create an account:
  * Go to https://usa.ipums.org/usa/,
  * click on "Log In",
  * then, "Create an Account", and
  * follow instructions.
* Create an extract:
  * Go to https://usa.ipums.org/usa/,
  * click on "Select Data"
  * Using codebook.xml as a guide, select desired variables from the available options. Note, you will see some attributes that appear to be duplicates of others but with an extra "D" at the end -- these are detailed versions of those attributes, and are auto-generated when you select the first one. Also note, that the SAMPLES variable has replaced the old DATANUM variable.
  * Select the samples for the desired years.
  * Use the full sample size.
  * Submit extract.
* Convert the .dat file to CSV
  * Run the bin/createCSVFromDat script with the following arguments: path_to_datFile, path_to_codebookFile, year, name_of_output_directory
* Generate presets from CSV file
  * Run the bin/createPresets script with the following arguments: path_to_generated_csvFile, path_to_codebookFile, `presets/[year]`
* Upload CSV files to S3
  * Gzip the preset csv files using the command `gzip -r presets`
  * Run the s3-sync script: `./bin/s3-sync presets`
* Update metadata file
  * Run the createMetadataFile with the following arguments: presets path_for_output_file.json. Note: the path to the output file should be different than the current path to the metadata file, otherwise it will overwrite the current metadata file.
  * Once the metadata is generated, copy the new data values into the plugin/assets/data/metadata.json.
  * Delete the newly-generated metadata file.

### The Database

#### Technology

* Mysql: tested with mysql client: 8.0.12, server: 5.7.18

#### Tables

The following tables are defined:

* peeps: contains data as extracted from IPUMS with additional weighting rows.
* pumas: currently not used by the application, but is intended to contain
geographic information.
* stats: contains sums of weights by sample year and state, including full-US samples.
* presets: contains preselected random samples.

#### Initialization

1. Create database, login user, and grant permissions. We recommend avoiding the
use of the root user for operational access.

Something like
```sql
  CREATE DATABASE sdlc
  USE sdlc;
  CREATE USER 'sdlcuser'@'localhost' IDENTIFIED BY 'some password';
  GRANT SELECT, INSERT, UPDATE, DROP, CREATE TEMPORARY TABLES, EXECUTE ON `sdlc`.* TO 'sdlcuser'@'localhost';
```

2. Create a credential file (needed by PHP scripts) with access properties.

```php
<?php

$credentials = array(
  "local" => array(
    "user" => "sdlcuser",
    "pass" => "sdlcuser password",
    "dbname" => "sdlc"
  )
);

?>
```
This file should be placed ... TBD

3. Create tables and stored procedures: TBD

```bash
% mysql -usdlcuser -p sdlcdb < sql/createTables.sql
```
3. Upload data: TBD
4. Initialize presets: TBD
5. Start scheduled event: TBD



1.)