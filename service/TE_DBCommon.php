<?php
/**
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:30 AM
 *
 * Created by Tim Erickson on 8/21/18 9:30 AM
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
 * Time: 09:30
 */

/**
 * Call this to make a connection to the MySQL database.
 * Must call before submitting a query
 *
 * Point is to get the database handle ($DBH) needed to make a query.
 * Needs:
 * host    the server name, e.g., "localhost"
 * user    the username that will access the database
 * pass    the password
 * dbname  the name of the database on the host
 *
 * Reason for ATTR_EMULATE_PREPARES, see:
 * https://stackoverflow.com/questions/60174/how-can-i-prevent-sql-injection-in-php
 */


function CODAP_MySQL_connect($host, $user, $pass, $dbname)
{
    //    reportToFile( "In CODAP_MySQL_connect");
    try {
        $connectionArgument = "mysql:host=$host;dbname=$dbname;charset=utf8";
        //  reportToFile( "CONNECTING using:" . $connectionArgument);               //  debug
        $DBH = new PDO($connectionArgument, $user, $pass);    // the database handle
        $DBH->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $DBH->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        error_log("---  MYSQL error connecting to database $dbname : " . $e->getMessage());
        die();
    }

    return $DBH;
}

/**
 * actually execute a MySQL query
 * Parameters:
 * db      the database handle
 * query   the parameterized MySQL query, e.g., "SELECT * FROM theTable"
 * params  parameters for the query
 * returns an array of <associated array>s, each of which is one row.
 */

function CODAP_MySQL_doQueryWithoutResult($db, $query, $params)
{
    try {
        $sth = $db->prepare($query);    //  $sth = statement handle
        $sth->execute($params);
    } catch (PDOException $e) {
        error_log("---  MySQL preparation or execution error " . $e->getMessage());
        die();
    }
}

/**
 * actually execute a MySQL query
 * Parameters:
 * query   prepared query
 * params  parameters for the query
 * returns an array of <associated array>s, each of which is one row.
 */

function CODAP_MySQL_doPreparedQueryWithoutResult($query, $params)
{
    try {
        $query->execute($params);
    } catch (PDOException $e) {
        error_log("---  MySQL preparation or execution error " . $e->getMessage());
        die();
    }
}

function CODAP_MySQL_getQueryResult($db, $query, $params)
{
    try {
        $sth = $db->prepare($query);    //  $sth = statement handle
        $sth->execute($params);
    } catch (PDOException $e) {
        error_log("---  MySQL preparation or execution error " . $e->getMessage());
        die();
    }

    $result = $sth->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}

function CODAP_MySQL_getPreparedQueryResult($query, $params)
{
    try {
        $query->execute($params);
    } catch (PDOException $e) {
        error_log("---  MySQL preparation or execution error " . $e->getMessage());
        die();
    }

    $result = $query->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}
/**
 * Gets one row of data.
 */

function CODAP_MySQL_getOneRow($db, $query, $params)
{
    $result = CODAP_MySQL_getQueryResult($db, $query . " LIMIT 1", $params);
    return $result;
}


?>