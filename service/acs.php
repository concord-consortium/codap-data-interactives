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

//try {
//    include $theCredentialsFilename;
//} catch (Exception $e) {
//    reportToFile('Problem getting the credentials: '. $e->getMessage());
//}
//
//if (file_exists($theCredentialsFilename)) {
//    //  reportToFile("the file " . $theCredentialsFilename . " exists!");
//} else {
//    reportToFile("the credentials file, " . $theCredentialsFilename . ", does not exist!");
//
//}


//  reportToFile(print_r("CRED LOCAL = " . $credentials['local'], true));

header('Access-Control-Allow-Origin: *');

function reportToFile($message)
{
    file_put_contents("/tmp/acsdebug.txt", $message . "\n", FILE_APPEND);

}


//  ------------    Connect to database ------------


include './TE_DBCommon.php';


//  ------------    Connected ------------

$whence  = $_REQUEST['whence'];

$user = "root";
$pass = "FsysHs,rd";
$dbname = "sdlc";
//$user = $credentials[$whence]["user"];
//$pass = $credentials[$whence]["pass"];
//$dbname = $credentials[$whence]["dbname"];

  reportToFile('Creds : ' . print_r($credentials, true) . " REQ: " . print_r($_REQUEST, true));
  reportToFile("CRED TEST: whence \"$whence\" user \"$user\" pass \"$pass\" dbname \"$dbname\"");

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query
$query = "SELECT * FROM peeps LIMIT 10";

$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

$out = "{ Unhandled command : " . $command . "}";

switch ($command) {

    case 'getCases':
        reportToFile("[$command]............" . date("Y-m-d H:i:s (T)") . " cases: ".$_REQUEST['n']);
        $params = array();
        $params["n"] = $_REQUEST["n"];
        $state_codes = $_REQUEST["state_codes"];
        $years = $_REQUEST["years"];

//        $theVariables = $_REQUEST['atts'];  //  includes opening comma

        $query = "SELECT * FROM peeps ORDER BY RAND( ) LIMIT :n";

        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile(".....[$command].(end)." . date("Y-m-d H:i:s (T)") . print_r($out, true));
        break;

    case 'getAllAttributeInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT * FROM variables WHERE groupNumber < 50 ORDER By groupNumber";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
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

    case 'getDecoderInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT DISTINCT varname FROM decoder";
        $theVars = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = array();

        foreach ($theVars as $arrayOfValues) {
            //  reportToFile('get Decoder -- looking at array: ' . print_r($arrayOfValues, true));
            $var = $arrayOfValues[varname];
            //  reportToFile('get Decoder -- looking at var: ' . print_r($var, true));
            $query = "SELECT * FROM decoder WHERE varname = '".$var . "'";
            $theCodes = CODAP_MySQL_getQueryResult($DBH, $query, $params);
            $oCodes = array();
            foreach ($theCodes as $aCode) {
                $oCodes[$aCode[code]] = $aCode[result];
            }
            $out[$var] = $oCodes;
        }

        //  reportToFile("Codes! " . print_r($out, true));
        break;
}

$jout = json_encode($out);

 reportToFile('end of php: the json is '. print_r($jout, true));

//  echo $out;
echo $jout;

