<?php
/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 4/19/18
 * Time: 13:56
 *
 *
 * Command (c)
 *      newGame : make a new game, insert a new game record, e.g.,
 *              ?c=newGame yields this query: INSERT into games (textCode) VALUES ("bar")
 *      joinGame : join an existing game. Requires gameCode, playerName, onTurn, balance, e.g.,
 *              ?c=joinGame&gameCode=foo.bar.baz&playerName=Aloysius   yields:
 *              INSERT into players (name, gameCode, onTurn, balance) VALUES ("Aloysius", "foo.bar.baz", "0", "10000")
 */

include 'words.php';

include 'fishEstablishCredentials.php';
include '../common/TE_DBCommon.php';

header('Access-Control-Allow-Origin: *');


//  ------------    Connect to database ------------


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

function reportToFile($message)
{
    file_put_contents("fishdebug.txt", $message . "\n", FILE_APPEND);
}


/**
 * Get the MySQL output array for all players in this game
 *
 * @param $db database handle
 * @param $gameCode the game code for this game
 */
function getPlayersData($db, $iGameCode)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
//    reportToFile("... getPlayersData() params: " . print_r($tParams, true));
    $query = "SELECT * FROM players WHERE gameCode = :gameCode";
    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    $tCommand = $_REQUEST['c'];
    return $out;
}

function getMyData($db, $iGameCode, $iPlayerName)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
    $tParams['playerName'] = $iPlayerName;
    $query = "SELECT * FROM players WHERE gameCode = :gameCode AND playerName = :playerName";

    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    $tCommand = $_REQUEST['c'];
    return $out;
}

function getMyTurns($db, $iGameCode, $iPlayerName)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
    $tParams['playerName'] = $iPlayerName;
    $query = "SELECT * FROM turns WHERE gameCode = :gameCode AND playerName = :playerName ORDER BY onTurn";

    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    $tCommand = $_REQUEST['c'];
    return $out;
}

function getOneTurn($db, $iGameCode, $iPlayerName, $iTurn)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
    $tParams['playerName'] = $iPlayerName;
    $tParams['turn'] = $iTurn;
    $query = "SELECT * FROM turns WHERE gameCode = :gameCode AND playerName = :playerName AND onTurn = :turn";

    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    $tCommand = $_REQUEST['c'];
    return $out;
}

function getGameData($db, $iGameCode)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;

    //  reportToFile("... getGameData() params: " . print_r($tParams, true));

    $query = "SELECT * FROM games WHERE gameCode = :gameCode";
    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);

    $tCommand = $_REQUEST['c'];     //      what was the original command?
    return $out[0];     // first game
}

function getTurnsData($db, $iGameCode, $iTurnNumber)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
    $tParams['onTurn'] = $iTurnNumber;
    $query = "SELECT * FROM turns WHERE gameCode = :gameCode AND onTurn = :onTurn ORDER BY onTurn";
    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    return $out;     //  all turns in an array
}

/**
 *
 * Note that this method must return gameState from Games -- for each turn --- as well as the turns data.
 *
 * Sample working mysql:
 * select games.gameState, turns.* from games, turns where games.gameCode = "awkward.unless.choice" and turns.gameCode = "awkward.unless.choice"
 * @param $db
 * @param $iGameCode
 * @return mixed
 */
function getHistoricalTurnsData($db, $iGameCode)
{
    $tParams = array();
    $tParams['gameCode'] = $iGameCode;
    $tParams['gameCode2'] = $iGameCode; //  yes, it's the same. Of course.
    reportToFile('doing getHistoricalTurnsData() for ' . $iGameCode . " with params " . print_r($tParams, true));
    $query = "SELECT games.gameState, games.config, turns.* FROM games,turns WHERE games.gameCode = :gameCode AND turns.gameCode = :gameCode2";
    $out = CODAP_MySQL_getQueryResult($db, $query, $tParams);
    return $out;     //  all turns in an array
}

function generateNewGameCode($DBH, $words)
{
    $params = array();
    $query = "SELECT MAX(id) AS max FROM games";
    $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
    $theResultArray = $out[0];
    try {
        $theNumber = (int)$theResultArray["max"];
    } catch (Exception $e) {
        $theNumber = 0;
        reportToFile("\tNOTE: the number of records threw an exception and was set to zero: ");
    }
    $theNumber++;

    //  now use the built-in "words" array
    $iNumber = $theNumber;
    $largePrimes = [2347, 2011, 2017];
    reportToFile("\tReady to make the code. ..... the number is $iNumber");

    $N = count($words);

    $extraTens = floor($iNumber / $N);
    $extraHundreds = floor($iNumber / $N / $N);
    $unitsIndex = (100 + $iNumber * $largePrimes[0]) % $N;
    $tensIndex = (300 + $extraTens + $iNumber * $largePrimes[1]) % $N;
    $hundredsIndex = (200 + $extraHundreds + $iNumber * $largePrimes[2]) % $N;

    //  reportToFile("\tmaking new game code: extra10, extra100: $extraTens $extraHundreds");
    //  reportToFile("\tmaking new game code: nwords: $N indices: $unitsIndex $tensIndex $hundredsIndex");

    $c = $words[$unitsIndex];
    $c .= "." . $words[$tensIndex];
    $c .= "." . $words[$hundredsIndex];


    $theCode = $c;      //          newGameCode($theNumber);
    reportToFile("\tnew game code just made: " . print_r($theCode, true));
    return $theCode;
}

//  ------------    Connected ------------


error_log('CRED TEST: whence ' . $whence . " user " . $user . " pass " . $pass . " dbname " . $dbname);

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query
$query = "SELECT * FROM games";
$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

//  error_log("\nRequest is " . print_r($_REQUEST, true));

$out = ['Unhandled command' => $command];
$out = json_encode($out);

if ($command == 'joinGame' || $command == 'newGame') {
    reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
}

switch ($command) {
    case 'foo' :
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)"));
        $out = '{"bar":43}';
        reportToFile('Output during foo: ' . $out);
        break;

    case 'newGame' :
        reportToFile("\tNew game. PHP version " . phpversion());

        //  assemble a 3-word code based on the max ID currently in the database
        //  first, find out our current maximum index

        $theCode = generateNewGameCode($DBH, $words);

        //  assemble the query
        $params['gameCode'] = $theCode;
        $params['onTurn'] = $_REQUEST["onTurn"];
        $params['gameState'] = $_REQUEST["gameState"];
        $params['pop'] = $_REQUEST["population"];
        $params['chair'] = $_REQUEST["chair"];
        $params['config'] = $_REQUEST["config"];
        $query = "INSERT into games (gameCode, gameState, population, turn, chair, config) "
            . "VALUES (:gameCode, :gameState, :pop, :onTurn, :chair, :config)";

        //  make a new games record
        $out = CODAP_MySQL_doQueryWithoutResult($DBH, $query, $params);

        //  now get that newly-created record.

        $out = getGameData($DBH, $theCode);        //  return the new game

        $out = json_encode($out);

        error_log("Fish: New game called $theCode");

        break;

    case 'joinGame':
        /**
         * At this point, the game has been validated
         */
        //  $game = getGameData($DBH, $_REQUEST["gameCode"]);   //  we know the game exists, so get its information
        $me = getMyData($DBH, $_REQUEST["gameCode"], $_REQUEST["playerName"]);

        $playerName = $_REQUEST["playerName"];
        $gameCode = $_REQUEST["gameCode"];

        if (count($me) == 0) {

            reportToFile("\t" . $_REQUEST["playerName"] . " does not already exist in " . $_REQUEST["gameCode"]);

            $params['gameCode'] = $gameCode;
            $params['playerName'] = $playerName;
            $params['balance'] = $_REQUEST["balance"];
            $params['onTurn'] = $_REQUEST["onTurn"];      //  enter the game on its turn.

            $query = "INSERT INTO players (playerName, gameCode, onTurn, balance) VALUES (:playerName, :gameCode, :onTurn, :balance)";

            reportToFile("\tjoinGame query: " . $query);
            CODAP_MySQL_doQueryWithoutResult($DBH, $query, $params);
            $out = array('newPlayer' => true);
        } else {
            reportToFile("\t" . $_REQUEST["playerName"] . " was already in " . $_REQUEST["gameCode"]);
            $out = array('newPlayer' => false);
        }

        $out = json_encode($out);
        reportToFile("\tjoinGame exit with: " . print_r($out, true));
        error_log("Fish: Add player called $playerName to game $gameCode");
        break;

    /**
     * This command is not complete.
     */
    case 'updateGame':
        $params['gameCode'] = $_REQUEST["gameCode"];

        $fieldList = array_slice($_REQUEST, 2);
        $updateExpressionArray = array();

        foreach ($fieldList as $key => $value) {
            $params[$key] = $value;
            $updateExpressionArray = "foo";
        }

        $query = "UPDATE games SET " . $updateExpressions . " WHERE gameCode = :gameCode";
        break;

    case 'validateGame':
        reportToFile('Trying to vaildate ' . $_REQUEST["gameCode"]);

        $out = getGameData($DBH, $_REQUEST["gameCode"]);
        $out = json_encode($out);
        reportToFile('Validation result for ' . $_REQUEST["gameCode"] . ": " . $out);
        break;

    case 'gameData':
        $out = getGameData($DBH, $_REQUEST["gameCode"]);
        $out = json_encode($out);
        break;

    case 'playersData':
        $out = getPlayersData($DBH, $_REQUEST["gameCode"]);
        $out = json_encode($out);
        break;

    case 'turnsData':
        $out = getTurnsData($DBH, $_REQUEST["gameCode"], $_REQUEST["onTurn"]);
        $out = json_encode($out);
        break;

    case 'myTurns':
        $out = getMyTurns($DBH, $_REQUEST["gameCode"], $_REQUEST['playerName']);
        $out = json_encode($out);
        break;

    case 'oneTurn':
        $out = getOneTurn($DBH, $_REQUEST["gameCode"], $_REQUEST['playerName'], $_REQUEST['year']);
        $out = json_encode($out);
        break;

    case 'historicalTurnsData':
        reportToFile('Gonna get historical turns data for ' . $_REQUEST["gameCode"]);
        $out = getHistoricalTurnsData($DBH, $_REQUEST["gameCode"]);
        //reportToFile('Got historical turns data, $out = ' . print_r($out, true));
        $out = json_encode($out);
        break;

    case 'myData':
        $out = getMyData($DBH, $_REQUEST["gameCode"], $_REQUEST['playerName']);
        $out = json_encode($out);
        break;

    case 'playerStatus':
        $game = getGameData($DBH, $_REQUEST["gameCode"]);   //  need this for the game turn

        $params['gameCode'] = $_REQUEST["gameCode"];
        $params['playerName'] = $_REQUEST["playerName"];
        $query = "SELECT * FROM players WHERE (gameCode = :gameCode AND playerName = :playerName) ";

        $players = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        $me = $players[0];      //  first result only (there should only be one)
        $me['gameTurn'] = $game['turn'];    //  let the player know what the GAME's turn is.

        $out = json_encode($me);
        //  reportToFile('... player status! This is [me]: ' . $out);
        break;

    case 'newCatchRecord':
        $params = array();
        $namesA = array();
        //  $valuesA = array();

        foreach ($_REQUEST as $key => $value) {
            if ($key != "c" && $key != "whence") {
                $params[$key] = $value;
                array_push($namesA, $key);
            }
        }

        $caught = $params['caught'];
        $turn = $params['onTurn'];

        $names = implode(",", $namesA);
        $values = implode(",:", $namesA);

        //  insert a new turns record. Notice the syntax with the colons...

        $query2 = "INSERT INTO turns (" . $names . ") VALUES (:" . $values . ")";
        $out = CODAP_MySQL_doQueryWithoutResult($DBH, $query2, $params);

        reportToFile("\t{$params['playerName']} caught $caught fish during $turn");

        $out = json_encode(array('caught' => $caught));
        break;

    case 'endTurnCheck':    //  requires gameCode
        $game = getGameData($DBH, $_REQUEST["gameCode"]);
        $players = getPlayersData($DBH, $_REQUEST["gameCode"]);
        $theCurrentTurn = $game['turn'];
        $turns = getTurnsData($DBH, $_REQUEST["gameCode"], $theCurrentTurn);

        $missingPlayers = array();
        $allPlayers = array();

        //  reportToFile("    End of turn check for " . $theCurrentTurn . " in " . $_REQUEST["gameCode"]);

        foreach ($players as $p) {
            $innit = false;
            foreach ($turns as $t) {
                if ($t["playerName"] == $p["playerName"]) {
                    $innit = true;
                }
            }
            array_push($allPlayers, $p["playerName"]);
            if (!$innit) array_push($missingPlayers, $p["playerName"]);
        }

        $out = json_encode(
            array(
                'OK' => (count($players) == count($turns)),
                'missing' => $missingPlayers,
                'allPlayers' => $allPlayers
            )
        );

        break;

    case 'newTurn':
        $oldYear = $_REQUEST['oldYear'];

        $params['gameCode'] = $_REQUEST["gameCode"];
        $params['gameState'] = $_REQUEST["gameState"];
        $params['newPopulation'] = $_REQUEST["newPopulation"];
        $params['reason'] = $_REQUEST["reason"];

        reportToFile("... [" . $_REQUEST['c'] . "] updating from $oldYear");

        $query = "UPDATE games SET turn = turn + 1, population = :newPopulation, gameState = :gameState, reason = :reason WHERE gameCode = :gameCode";
        $out = CODAP_MySQL_doQueryWithoutResult($DBH, $query, $params);
        $out = json_encode(array('message' => "It is a new year."));
        error_log("Fish: New turn, done with $oldYear");
        break;

    /*    case 'getOneTurn':
            $params = array();
            $params['gameCode'] = $_REQUEST["gameCode"];
            $params['playerName'] = $_REQUEST["playerName"];
            $params['onTurn'] = $_REQUEST["onTurn"];

            $query = "SELECT turns WHERE (gameCode = :gameCode AND playerName = :playerName AND onTurn = :onTurn)";
            $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
            $out = json_encode($out);
            break;
    */
    case 'updateOneTurnRecord':
        $params = array();
        $params['gameCode'] = $_REQUEST["gameCode"];
        $params['playerName'] = $_REQUEST["playerName"];
        $params['income'] = $_REQUEST["income"];
        $params['unitPrice'] = $_REQUEST["unitPrice"];
        $params['balanceAfter'] = $_REQUEST["balanceAfter"];
        $params['onTurn'] = $_REQUEST["onTurn"];

        $query = "UPDATE turns SET unitPrice = :unitPrice, income = :income, balanceAfter = :balanceAfter " .
            "WHERE (gameCode = :gameCode AND playerName = :playerName AND onTurn = :onTurn)";
        $updateResult = CODAP_MySQL_doQueryWithoutResult($DBH, $query, $params);

        //  THEN make sure the player's record has the same ending balance

        $params = array();
        $params['gameCode'] = $_REQUEST["gameCode"];
        $params['playerName'] = $_REQUEST["playerName"];
        $params['balanceAfter'] = $_REQUEST["balanceAfter"];
        $query = "UPDATE players SET balance = :balanceAfter WHERE (gameCode = :gameCode AND playerName = :playerName)";
        $updateResult = CODAP_MySQL_doQueryWithoutResult($DBH, $query, $params);

        $out = $params;
        $out = json_encode($out);

        break;

    default:
        reportToFile("Unhandled command: " . print_r($_REQUEST, true));
        break;
}

//  error_log("\tActual output at end of php: " . $out);
echo $out;


?>