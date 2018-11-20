<?php
/**
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:27 AM
 *
 * Created by Tim Erickson on 8/21/18 9:27 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */

/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/21/18
 * Time: 09:27
 */

include 'acs.phpFileLocations.php';     //  tells us where the credentials are

try {
    include $theCredentialsFilename;
} catch (Exception $e) {
    reportToFile('Problem getting the credentials: '. $e->getMessage());
}

//  reportToFile(print_r("CRED LOCAL = " . $credentials['local'], true));

header('Access-Control-Allow-Origin: *');

function reportToFile($message)
{
    file_put_contents("/tmp/acsdebug.txt", $message . "\n", FILE_APPEND);
}

function prefetch($DBH) {
    $createTempQ = "CREATE TEMPORARY TABLE rand_numbers (number FLOAT)";

    CODAP_MySQL_doQueryWithoutResult($DBH, $createTempQ, array());
}

function fetchSamples($DBH, $num, $yr, $st) {
    $populateTempQ = "CALL InsertRandom(?, 0, 1)";
    $sumWeightsQ = "SELECT @sum_weights:=sum_weights FROM stats WHERE year=? AND state_code=?";
    $sumWeightsNoStateQ = "SELECT @sum_weights:=sum_weights FROM stats WHERE year=? AND state_code IS NULL";
    $selectSamplesYrStQ = "SELECT peeps.id,peeps.sample_data " .
        "FROM peeps, rand_numbers WHERE peeps.year=? AND peeps.state_code=? AND " .
        "(rand_numbers.number * @sum_weights) BETWEEN peeps.accum_yr_st AND " .
        "peeps.accum_yr_st + peeps.perwt";
    $selectSamplesYrQ = "SELECT peeps.id,peeps.sample_data " .
        "FROM peeps, rand_numbers WHERE peeps.year=? AND " .
        "(rand_numbers.number * @sum_weights) BETWEEN peeps.accum_yr AND " .
        "peeps.accum_yr + peeps.perwt";
    $depopulateTempQ = "DELETE FROM rand_numbers";
    $populateTempParams = [$num];
    $params = [$yr, $st];

    CODAP_MySQL_doQueryWithoutResult($DBH, $populateTempQ, $populateTempParams);
    if ($st) {
        CODAP_MySQL_doQueryWithoutResult($DBH, $sumWeightsQ, $params);
        $rslt = CODAP_MySQL_getQueryResult($DBH, $selectSamplesYrStQ, $params);
    } else {
        CODAP_MySQL_doQueryWithoutResult($DBH, $sumWeightsNoStateQ, [$yr]);
        $rslt = CODAP_MySQL_getQueryResult($DBH, $selectSamplesYrQ, [$yr]);
    }
    CODAP_MySQL_doQueryWithoutResult($DBH, $depopulateTempQ, array ());
    return $rslt;
}

function postFetch ($DBH) {
    $emptyTempQ = "DROP TEMPORARY TABLE rand_numbers";
    CODAP_MySQL_doQueryWithoutResult($DBH, $emptyTempQ, array());
}

function assembleSamples($DBH, $num, $yrArray, $stArray) {
    assert(is_array($stArray), 'state codes invalid');
    assert(is_array($yrArray), 'sample years invalid');

    if (count($stArray) > 0) {
        $numCombs = count($yrArray) * count($stArray);
    } else {
        $numCombs = count($yrArray);
    }
    assert($numCombs > 0, 'expect number of combs > 0');
    $segmentSize = ceil($num/$numCombs);

    $samples = array();

    preFetch($DBH);
    foreach ($yrArray as $yr ) {
        if (count($stArray) > 0) {
            foreach ($stArray as $st) {
                reportToFile("Getting $segmentSize segment samples for year: " . $yr .
                    " and state: " . $st . ".");
                $segSamples =  fetchSamples($DBH, $segmentSize, $yr, $st);
                $samples = array_merge($samples, $segSamples);
            }
        } else {
            reportToFile("Getting $segmentSize segment samples for year: " . $yr .
                " for all states.");
            $segSamples =  fetchSamples($DBH, $segmentSize, $yr, null);
            $samples = array_merge($samples, $segSamples);
        }
    }
    postFetch($DBH);
    return $samples;
}

//  -----------)-    Connect to database ------------


include './TE_DBCommon.php';


if (file_exists($theCredentialsFilename)) {
    reportToFile("the file " . $theCredentialsFilename . " exists!");
} else {
    reportToFile("the credentials file, " . $theCredentialsFilename . ", does not exist!");
}

//  ------------    Connected ------------

$whence  = $_REQUEST['whence'];

// todo: derive from file
$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];

//  reportToFile('Creds : ' . print_r($credentials, true) . " REQ: " . print_r($_REQUEST, true));
  reportToFile("CRED TEST: whence \"$whence\" user \"$user\" pass \"$pass\" dbname \"$dbname\"");

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query

$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

$out = "{ Unhandled command : " . $command . "}";

switch ($command) {

    case 'getCases':
        reportToFile("[$command]............" . date("Y-m-d H:i:s (T)") . " cases: " . $_REQUEST['n']);

        $params = array();

        $total_requested = $_REQUEST["n"];
        assert($total_requested>0, 'requested samples missing or invalid');
        $params["n"] = $total_requested;

        $state_codes_raw = (isset($_REQUEST["state_codes"]))? $_REQUEST["state_codes"]: "" ;
        if (strlen($state_codes_raw) == 0) {
            $state_codes = [];
        } else {
            $state_codes=explode(",", $state_codes_raw);
        }

        $years_raw = (isset($_REQUEST["years"]))?$_REQUEST["years"]: "";
        $years = explode(",", $years_raw);

        // determine per state/year request size
        // determine if national or per state query

        reportToFile("Getting $total_requested samples for " . count($years) .
            " years and " . count($state_codes) . " states");
        $out = assembleSamples($DBH, $total_requested, $years, $state_codes);

        break;

    case 'getYears':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();
        $query = "SELECT distinct(year) FROM peeps order by year";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        break;

    case 'getStates':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();
        $query = "SELECT distinct(state_code) FROM peeps order by state_code";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        break;

}

$jout = json_encode($out);

echo $jout;

