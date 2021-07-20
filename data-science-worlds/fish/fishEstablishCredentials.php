<?php
/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/18/18
 * Time: 14:58
 */


//  $theCredentialsFilename = dirname( __FILE__, 4 ) . '/cred/fishCred.php';


$whence = $_REQUEST['whence'];

$credentialFileNames = [
    "local_concordRepository" => "/Applications/MAMP/cred/fishCred.php",
    "local" => "/Applications/MAMP/cred/fishCred.php",
    "eeps" => "/home1/denofinq/cred/fishCred.php"
];

$thisFileName = $credentialFileNames[$whence];

//  error_log("Credential file: $thisFileName");

try {
    include_once($thisFileName);
} catch (Exception $e) {
    error_log("Error including the credentials file.  $e->getMessage()");
}

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];


?>