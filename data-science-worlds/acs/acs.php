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

include 'acs.establishCredentials.php';     //  tells us where the credentials are

header('Access-Control-Allow-Origin: *');

function reportToFile($message)
{
    // Uncomment below to reenable debug
    //file_put_contents("/tmp/acsdebug.txt", $message . "\n", FILE_APPEND);
}


//  ------------    Connect to database ------------


include '../common/TE_DBCommon.php';


//  ------------    Connected ------------

//  reportToFile('CRED TEST: whence '. $whence ." user ". $user . " pass ".$pass." dbname ".$dbname);

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

        $query = "SELECT STPUMA" . $theVariables . " FROM peeps ORDER BY RAND( ) LIMIT :n";

        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile(".....[$command].(end)." . date("Y-m-d H:i:s (T)") . print_r($out, true));
        break;

    case 'getAllAttributeInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT * FROM variables WHERE groupNumber < 50 ORDER By groupNumber";
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
            //  reportToFile("    Ancestry code $theCode is $theText");
            $out[$theCode] = $theText;
            reportToFile("    Ancestry Array: ".print_r($out, true));
        }
        break;

    case 'getDecoderInfo':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $params = array();

        $query = "SELECT DISTINCT varname FROM decoder";
        $theVars = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = array();

        foreach ($theVars as $arrayOfValues) {
            //  reportToFile('get Decoder -- looking at array: ' . print_r($arrayOfValues, true));
            $var = $arrayOfValues['varname'];
            //  reportToFile('get Decoder -- looking at var: ' . print_r($var, true));
            $query = "SELECT * FROM decoder WHERE varname = '".$var . "'";
            $theCodes = CODAP_MySQL_getQueryResult($DBH, $query, $params);
            $oCodes = array();
            foreach ($theCodes as $aCode) {
                $oCodes[$aCode["code"]] = $aCode['result'];
            }
            $out[$var] = $oCodes;
        }

        break;
}

$jout = json_encode($out);

echo $jout;

