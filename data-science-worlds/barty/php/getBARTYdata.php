<?php

$options = array( "date_format" => DATE_RFC2822 );
date_default_timezone_set('America/Los_Angeles');
$now =  date("Y-m-d H:i:s (T)");     //  for debug purposes
$tableName = "hours";       //  the name of the table in the database tat holds all the hourly data

/**
    This php script feeds BART data, stored in MySQL, to a DSG Data Interactive.

    The interactive itself has to create a URL and a DATA string to give to the jQuery $.ajax method.
    The data string has POST variables and their values.
    This file parses those variables, assembles a MySQL query, and send that to MySQL, receiving the result in an array.
    We then process that array into JSON, and simply "echo" it.

    $.ajax captures that text (the JSON) as its iData result. Convoluted but effective. And asynchronous.

    POST variables

    c           command. getStation | byTime | byArrival | byDeparture
    stn0        abbr6 of the origin station, e.g., "Orinda" (optional)
    stn1        abbr6 of the arrival station (optional)
    d           date STRING
    h           hour INTEGER

    so the "dataString" might be something like

    ?c=byArrival&stn1=Orinda&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
*/
header('Access-Control-Allow-Origin: *');

include 'barty.establishCredentials.php';

/**
    Call this to make a connection to the MySQL database.
    Must call before submitting a query

    Point is to get the database handle ($DBH) needed to make a query.
    Needs:
        host    the server name, e.g., "localhost"
        user    the username that will access the database
        pass    the password
        dbname  the name of the database on the host

    Reason for ATTR_EMULATE_PREPARES, see:
    https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php
*/
function    CODAP_MySQL_connect( $host, $user, $pass, $dbname ) {
    $now =  date("Y-m-d H:i:s (T)");     //  for debug purposes

    try {
        $DBH = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);	// the database handle
        $DBH->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $DBH->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        file_put_contents("/tmp/bartdebug.txt", "\n\n----  $now connecting to " . $dbname, FILE_APPEND);
    } catch (PDOException $e) {
        print "Error connecting to the $dbname database!: " . $e->getMessage() . "<br/>";
        file_put_contents("/tmp/bartdebug.txt", "\n\n----  $now failed to connect to " . $dbname, FILE_APPEND);

        die();
    }

    return $DBH;
}

/**
    actually execute a MySQL query
    Parameters:
        db      the database handle
        query   the parameterized MySQL query, e.g., "SELECT * FROM theTable"
        params  parameters for the query
    returns an array of <associated array>s, each of which is one row.
*/

function	CODAP_MySQL_getQueryResult($db, $query, $params)	{
    $sth = $db->prepare($query);    //  $sth = statement handle
    $sth->execute($params);
    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
	return $result;
}

/**
    Gets one row of data.
*/

function	CODAP_MySQL_getOneRow($db, $query, $params)	{
    $result = CODAP_MySQL_getQueryResult($db, $query . " LIMIT 1", $params);
    return $result;
}

/**
    Utility function: Write to JS console.log.
    NOTE: Does not work in the BART situation, because this php is only a feed.
*/

function console_log( $data ){
  echo '<script>';
  echo 'console.log('. json_encode( $data ) .')';
  echo '</script>';
}


			//  universal code here

/*

*/
//	print_r($_GET);
	
file_put_contents("/tmp/bartdebug.txt", "\n\n----  $now in PHP, post is: " . implode(" | ",$_REQUEST) , FILE_APPEND);


$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

// $params will accumulate params for query
$params = array();

if (isset($_REQUEST["w"])) {
	$what = $_REQUEST["w"];
} else {
	$what = "";
}

if (isset($_REQUEST["d0"])) {
    $d0 = $_REQUEST["d0"];
    $d1 = $_REQUEST["d1"];
//    $dateRange = " ( date BETWEEN '" . $d0 . "' AND '" . $d1 . "' ) ";   //  note inclusive
    $dateRange = " ( date BETWEEN :d0 AND :d1 ) ";
    $params["d0"] = $d0;
    $params["d1"] = $d1;
} else {
    $dateRange = "";
}

if (isset($_REQUEST["h0"])) {
    $h0 = $_REQUEST["h0"];
    $h1 = $_REQUEST["h1"];
    $hourRange = " AND ( hour BETWEEN :h0 AND :h1 ) ";    //  note inclusive
    $params["h0"] = $h0;
    $params["h1"] = intval($h1) - 1;
} else {
    $hourRange = "";
}

if (isset($_REQUEST["dow"])) {
    $dow = $_REQUEST["dow"];               //      numerical day of week Sun = 1 in MySQL (Sun = 0 is js)
    $dowClause = " AND DAYOFWEEK( date ) = :dow ";
    $params["dow"] = intval($dow) + 1;
} else {
    $dowClause = " ";
}

//  the variable list part of the (long) BART query
$varList = "id, date, DAYOFWEEK(date) as dow, hour, riders, origin, destination ";

if ($what == "counts") $varList = "COUNT(*)";

$stationClause = "";

//  station of origin

if (isset($_REQUEST["stn0"])) {
    $stn0 = $_REQUEST["stn0"];
    $stationClause .= "AND origin = :stn0 ";
    $params["stn0"] = $stn0;
}

//  destination station

if (isset($_REQUEST["stn1"])) {
    $stn1 = $_REQUEST["stn1"];
    $stationClause .= "AND destination = :stn1 ";
    $params["stn1"] = $stn1;
}

$orderClause = "";      //      "\nORDER BY date, hour";


//  todo: include weekdays

$query = "SELECT $varList FROM $tableName \n      WHERE " . $dateRange . $hourRange . $dowClause . $stationClause;

$query = stripcslashes( $query );
file_put_contents("/tmp/bartdebug.txt", "\n\n----  " . $now . " submitting query: \n      " . $query, FILE_APPEND);

//  connect to the database
$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);

//  submit the query and receive the results
$rows = CODAP_MySQL_getQueryResult($DBH, $query, $params);

file_put_contents("/tmp/bartdebug.txt", "\n      $now " . $command . " got " . count($rows) . " row(s)" , FILE_APPEND);

//  actually get the data back to the javascript:
echo json_encode($rows);


?>
