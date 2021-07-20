# NOAA Weather Plugin

## Building
```
% npm install
% npm run build
```

## Updating the Station Dataset

The station dataset starts with a filtered, merged view of the NOAA ISD 
(Integrated Station Data) data set, to which it adds correlated GHCN (Global 
Historical Climatology Network) ids. To regenerate this data:
```shell script
# fetch the current ISD dataset
./bin/noaa-get-isd-weather-stations > /tmp/hourly-weather-stations.json

# fetch the current GHCN station data
./bin/noaa-cdo-station-list-all > /tmp/cdo-station-list.json

# create a merged dataset 
./bin/noaa-merge-station-data /tmp/hourly-weather-stations.json \
    /tmp/cdo-station-list.json > assets/data/weather-stations.json
```
*Important*: The second script, noaa-cdo-station-list-all, requires an access token. 
This can be obtained for no cost from https://www.ncdc.noaa.gov/cdo-web/webservices/v2.
Once obtained, this token should be placed in a text file named, .noaa_rc, in 
the current working directory or your home directory. 
Like:
```shell script
CDO_TOKEN=[your token]
```

Execution of these scripts requires the following programs to be present in your
shell execution environment:
* curl (standard on Macs)
* jq (available through Homebrew on Macs)
* csvjson (available through NPM)
* node

## NOAA APIs

This plugin uses various NOAA APIs and resources, both for preparing static 
datasets the plugin relies on and, at runtime, to fetch historical weather data.

### Links

The following URLs describe the NCEI API's in use by this plugin.

* https://www.ncei.noaa.gov/support/access-data-service-api-user-documentation
 
  This document describes the basic NOAA Data Access API. It is a basically
  unrestricted API that does not require an API key. Here is a typical request:
  
    ```
    https://www.ncei.noaa.gov/access/services/data/v1\
      ?dataset=daily-summaries&stations=USW00014755\
      &startDate=2020-08-01&endDate=2020-09-01\
     &format=json&dataTypes=TMAX,TMIN&units=metric
   ```
   * Query parameters
      * **dataset**: the dataset we are requesting: 'daily-summaries' or 'global-summary-of-the-month'
      * **stations**: a station identifier: the particular scheme depends on the dataset
      * **startDate, endDate**: must be in yyyy-mm-dd format
      * **format**: we request 'json', but 'csv' is also available
      * **units**: 'metric' or 'standard'
      * **dataTypes**: basically properties. Dependent on dataset

* https://www.ncei.noaa.gov/access/services/support/v3/datasets/{dataset-name}.json
  
  Returns information about particular dataset, including supported datatypes.

* https://www1.ncdc.noaa.gov/pub/data/noaa/isd-history.csv

  Returns a historic list of weather stations in the Integrated Surface Data set. 
  These stations contribute to the Hourly dataset. 
  The list is updated regularly.

### Docs

The following documents are included within this codeline and may provide 
helpful background.

* docs/isd-format-document.pdf

  This is a NOAA document describing the Integrated Surface Data File Format. 
  It is applicable to Hourly data format, though not directly to the CSV or JSON versions.
  It describes a flat file format where each row is an observation. There is a 
  portion with required elements at fixed character positions and a portion with
  keyed optional properties, I believe separated by spaces.

* docs/CSV_HELP.pdf

  How to understand ISD Format conversion to CSV file format. Somewhat helpful.

