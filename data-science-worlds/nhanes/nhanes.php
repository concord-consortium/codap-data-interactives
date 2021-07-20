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

include 'nhanes.establishCredentials.php';     //  defines the credentials we need for mySQL

/*
 *
 try {
    include $theCredentialsFilename;
} catch (Exception $e) {
    reportToFile('Problem getting the credentials: '. $e->getMessage());
}

if (file_exists($theCredentialsFilename)) {
    //  reportToFile("the file " . $theCredentialsFilename . " exists!");
} else {
    reportToFile("the credentials file, " . $theCredentialsFilename . ", does not exist!");

}
*/

//  reportToFile(print_r("CRED LOCAL = " . $credentials['local'], true));

header('Access-Control-Allow-Origin: *');

function reportToFile($message)
{
    file_put_contents("nhanesDebug.txt", $message . "\n", FILE_APPEND);

}


//  ------------    Connect to database ------------


include '../common/TE_DBCommon.php';


//  ------------    Connected ------------


//  reportToFile('Creds : ' . print_r($credentials, true) . " REQ: " . print_r($_REQUEST, true));
error_log('CRED TEST: whence '. $whence ." user ". $user . " pass ".$pass." dbname ".$dbname);

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
        $theVariables = $_REQUEST['atts'];  //  includes opening comma

        $tableString = $_REQUEST['tables'];

        $joinString = $_REQUEST['joins'];

        $query = "SELECT $theVariables FROM $tableString WHERE $joinString ORDER BY RAND( ) LIMIT :n";

        error_log("Get cases query : $query");

        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile(".....[$command].(end)." . date("Y-m-d H:i:s (T)") . print_r($out, true));
        break;

    case 'getAllAttributeInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT * FROM varlist WHERE tableid < 50 ORDER By tableid";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getAncestries':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();
        $query = "SELECT * FROM ancestries";
        $theAncestries = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        $out = array();

        foreach ($theAncestries as $a) {
            $theCode = $a["code"];
            $theText = $a["text"];
            $out[$theCode] = $theText;
        }
        break;

    case 'getDecoderInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT DISTINCT varname FROM decoder";
        $theDecodableVars = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = array();

        foreach ($theDecodableVars as $arrayOfValues) {
            //  each row (which contains only one item) is an array
            $var = $arrayOfValues["varname"]; //  get the variable name

            //  assemble an array (will be an object in js) of all of that variable's
            //  values and decoded values
            $params = ["v" => $var];
            $query = "SELECT * FROM decoder WHERE varname = :v";
            $theCodes = CODAP_MySQL_getQueryResult($DBH, $query, $params);
            $oCodes = array();

            //  error_log("theCodes for $var = ". print_r($theCodes, true));
            foreach ($theCodes as $aCode) {
                $theCode = $aCode['CODE'];
                $theResult = $aCode['RESULT'];
                $oCodes[$theCode] = $theResult;
            }
            $out[$var] = $oCodes;
        }

        break;
}

$jout = json_encode($out);

//  reportToFile('end of php: the json is '. print_r($jout, true));

//  echo $out;
echo $jout;

