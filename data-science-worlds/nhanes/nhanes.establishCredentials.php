<?php
/**
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:43 AM
 *
 * Created by Tim Erickson on 8/21/18 9:43 AM
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

//  echo print_r($_SERVER, true);       //  un-comment to find the actual pathname of the server

$whence  = $_REQUEST['whence'];

$credentialFileNames = [
    "concord" => "/var/www/cred/nhanesCred.php",
    "local" => "/Applications/MAMP/cred/nhanesCred.php",
    "eeps" => "/home1/denofinq/cred/nhanesCred.php"
];

$thisFileName = $credentialFileNames[$whence];

//  echo "Credential file: $thisFileName <br>";

try {
    include_once($thisFileName);
} catch (Exception $e) {
    error_log("Error including the credentials file.  $e->getMessage()");
}

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];


?>