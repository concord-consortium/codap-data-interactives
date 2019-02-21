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

/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/21/18
 * Time: 09:43
 */


$whence  = $_REQUEST['whence'];

$credentialFileNames = [
    "concord"=>"/var/www/cred/bartyCred.php",
    "local" => "/Applications/MAMP/cred/bartyCred.php",
    "local_concord" => "/Applications/MAMP/cred/bartyCred.php",     //  that is, on Tim's machine but attached to the concord github repos
    "eeps" => "/home1/denofinq/cred/bartyCred.php"
];

$thisFileName = $credentialFileNames[$whence];

file_put_contents("bartdebug.txt", "\n\nCRED ----  " . date("Y-m-d H:i:s (T)") . " Credential filename: $thisFileName", FILE_APPEND);


try {
    include_once($thisFileName);
} catch (Exception $e) {
    error_log("Error including the credentials file.  $e->getMessage()");
}

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];

file_put_contents("bartdebug.txt", "\nCRED ----  " . date("Y-m-d H:i:s (T)") . " Credentials: $whence | $user | $dbname", FILE_APPEND);


?>