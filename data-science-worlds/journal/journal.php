<?php
/**
 * Created by IntelliJ IDEA.
 * User: tim
 * Date: 8/24/18
 * Time: 10:22
 */

function reportToFile($message)
{
    file_put_contents("Jdebug.txt", $message . "\n", FILE_APPEND);
}


include 'parsedown-1.7.1/Parsedown.php';
include 'phpFileLocations.php';     //  tells us where the credentials are

try {
    include $theCredentialsFilename;
} catch (Exception $e) {
    reportToFile('Problem getting the credentials: ' . $e->getMessage());
}

if (file_exists($theCredentialsFilename)) {
    //  reportToFile("the file " . $theCredentialsFilename . " exists!");
} else {
    reportToFile("the credentials file, " . $theCredentialsFilename . ", does not exist!");
}

//  reportToFile(print_r("CRED LOCAL = " . $credentials['local'], true));

header('Access-Control-Allow-Origin: *');


//  ------------    Connect to database ------------


include '../common/TE_DBCommon.php';    //  in the common folder



//  ------------    Connected ------------

$whence = $_REQUEST['whence'];

$user = $credentials[$whence]["user"];
$pass = $credentials[$whence]["pass"];
$dbname = $credentials[$whence]["dbname"];

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query
$query = "SELECT * FROM worlds LIMIT 10";

$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

$out = "{ Unhandled command : " . $command . "}";


switch ($command) {

    case 'newWorld':
        reportToFile("/n[$command]......" . date("Y-m-d H:i:s (T)") . " code: " . $_REQUEST['code']);
        $params = array();
        $params["g"] = $_REQUEST["g"];
        $params["code"] = $_REQUEST["code"];
        $params["epoch"] = $_REQUEST["epoch"];
        $params["jName"] = $_REQUEST["jName"];

        $query = "INSERT INTO worlds (godID, code, epoch, journalTitle) VALUES (:g, :code, :epoch, :jName)";
        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        $params = array();
        $params["code"] = $_REQUEST["code"];
        $query = "SELECT * FROM worlds WHERE code = :code";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        reportToFile("[$command]...... out: " . print_r($out, true));
        break;

    case 'addTeam':
        reportToFile("[$command]......" . date("Y-m-d H:i:s (T)") . " code: " . $_REQUEST['code']);
        $params = ['code'=> $_REQUEST['code'], 'w'=>$_REQUEST['w'], 'name'=>$_REQUEST['name']];
        $query = "INSERT INTO teams (worldID, code, name) VALUES (:w, :code, :name)";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);

        break;

    case 'getWorldData':
        reportToFile("[$command]......" . date("Y-m-d H:i:s (T)") . " code: " . $_REQUEST['code']);
        $params = array();
        $params["code"] = $_REQUEST["code"];

        $query = "SELECT * FROM worlds Where code = :code";

        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile("[$command]...... out: " . print_r($out, true));
        break;

    case 'newGod':
        reportToFile("[$command]......" . date("Y-m-d H:i:s (T)") . " name: " . $_REQUEST['title']);
        $params = ['u' => $_REQUEST['u'], 'p' => $_REQUEST['u'], 'f' => $_REQUEST['u']];
        $query = "INSERT INTO gods (username, password, fullname) VALUES (:u, :p, :f )";
        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $theID = $DBH->lastInsertId();
        reportToFile("[$command]...... new god number: " . $theID);
        $out = ["id" => $theID];
        break;

    case 'newPaper':
        reportToFile("[$command]......" . date("Y-m-d H:i:s (T)") . " title: " . $_REQUEST['title']);
        $params = array();
        $params["worldID"] = $_REQUEST["worldID"];
        $params["authors"] = $_REQUEST["authors"];
        $params["title"] = $_REQUEST["title"];
        $params["team"] = $_REQUEST["team"];
        $params["text"] = $_REQUEST["text"];
        $params["ac"] = $_REQUEST["ac"];

        $query = "INSERT INTO papers (worldID, title, authors, text, teamID, authorComments) ".
            "VALUES (:worldID, :title, :authors, :text, :team, :ac)";
        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $theID = $DBH->lastInsertId();
        reportToFile("[$command]...... new paper number: " . $theID);
        $out = ["id" => $theID];
        break;

    case 'updatePaper':
        reportToFile("[$command]...... title: " . $_REQUEST['title']);
        $params = array();
        $params["authors"] = $_REQUEST["authors"];
        $params["title"] = $_REQUEST["title"];
        $params["text"] = $_REQUEST["text"];
        $params["team"] = $_REQUEST["team"];
        $params["id"] = $_REQUEST["id"];
        $params["ac"] = $_REQUEST["ac"];

        //  reportToFile("Updating paper, params = " . print_r($params, true));

        $query = "UPDATE papers SET title = :title, authors = :authors, text=:text, teamID = :team, authorComments = :ac WHERE id = :id";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = ["id" => $_REQUEST["id"]];
        break;

    case 'judgePaper':
        reportToFile("[$command]......" . date("Y-m-d H:i:s (T)") . " paperID: " . $_REQUEST['p']);
        $params = [ "pid" => $_REQUEST["p"], "s" => $_REQUEST["s"], "ec" => $_REQUEST["ec"]   ];

        $query = "UPDATE papers SET status = :s, editorComments = :ec WHERE id = :pid";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'submitPaper':
        reportToFile("[$command]......." . date("Y-m-d H:i:s (T)") . " id: " . $_REQUEST['id']);
        $params = ["id" => $_REQUEST["id"],"s" => $_REQUEST["s"]];  //  s is the status

        $query = "UPDATE papers SET status = :s WHERE id = :id";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getPapers':
        $w =  $_REQUEST['w'];
        $t = $_REQUEST['t'];
        reportToFile("[$command]...... w = $w, t = $t ");

        if ($_REQUEST["t"] != 'null') {
            $params = ["w" => $w, "t" => $t];
            $query = "SELECT * FROM papers WHERE worldID = :w AND teamID = :t";
        } else {
            $params = [ "w" => $w ];
            $query = "SELECT * FROM papers WHERE worldID = :w ";
        }
        reportToFile("[$command]...... query: " . $query);
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getMyWorlds':
        reportToFile("[$command]......  ");
        $params = ["g" => $_REQUEST["g"]];

        $query = "SELECT * FROM worlds WHERE godID = :g";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        reportToFile("[$command]...... query: " . $query);
        break;

    case 'getMyTeams':
        reportToFile("[$command]......  ");
        $params = ["w" => $_REQUEST["w"]];

        $query = "SELECT * FROM teams WHERE worldID = :w";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile("[$command]...... query: " . $query);
        break;

    case 'getGodData':
        reportToFile("[$command]...... username: " . $_REQUEST['u']);
        $params = ['u' => $_REQUEST['u']];

        $query = "SELECT * FROM gods WHERE username = :u";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getJournal':
        reportToFile("[$command]...... worldID: " . $_REQUEST['w']);
        $par = [ "w" => $_REQUEST["w"] ];

        $q = "SELECT * FROM papers WHERE status = 'published' AND worldID = :w";
        $papers = CODAP_MySQL_getQueryResult($DBH, $q, $par);

        $toc = "";
        $guts = "";

        reportToFile("how many papers? : " . count($papers));

        $Parsedown = new Parsedown();

        foreach ($papers as $p) {

            $dsturl = "p" . $p[id];
            $ref = "#p" . $p[id];

            $toc .= "<li><a class='journalTOC' href='" . $ref . "'>$p[title]</a> ($p[authors])</li>";

            $guts .= "<hr>";
            $guts .= "<span id='$dsturl' class='paperTitle'>$p[title]</span><br>";
            $guts .= "<span class='paperAuthors'>$p[authors]</span>";
            $guts .= "<span class='paperTeam'>$p[team]</span>";
            $guts .= $Parsedown->text($p[text]);
        }


        $out = count($papers)
            ? "<h2>Contents</h2><ul>$toc</ul><h2>Papers</h2>$guts"
            : "<p>No papers in the journal yet";

        break;
}

$jout = json_encode($out);
echo $jout;

