<?php
/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/24/18
 * Time: 10:23
 */


$whence  = $_REQUEST['whence'];


$credentialFileNames = [
    "local" => "/Applications/MAMP/cred/nos2Cred.php",
    "eeps" => "/home1/denofinq/cred/nos2Cred.php"
];

$thisFileName = $credentialFileNames[$whence];


try {
    include_once($thisFileName);
} catch (Exception $e) {
    error_log("Error including the credentials file.  $e->getMessage()");
}

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];


?>