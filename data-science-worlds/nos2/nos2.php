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

function    makeOnePaperHTML($DBH, $p) {
    $theTitle = $p['title'];
    $tHTMLParser = new Parsedown();
    $theParsedText =    $tHTMLParser->text($p['text']);

    error_log("Making one preview for $theTitle");
    error_log("Parsed text: $theParsedText");

    $destURL = "p" . $p['id'];
    $teamID = $p['teamID'];
    $teamName = $p['teamName'];
    $teamString = $teamName ? $teamName : "team $teamID";

    $rawpacks = $p['packs'];
    $packs = json_decode($rawpacks);

    $figureGuts = "";

    if (count($packs) > 0) {
        $params = ["pkid" => $packs[0]];
        error_log(" params: " . print_r($params, true));
        $query = "SELECT figure, figureWidth, figureHeight FROM datapacks WHERE id = :pkid";
        $figureResult = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $ff = $figureResult[0];
        $fig = $ff['figure'];
        $figW = $ff['figureWidth'];
        $figH = $ff['figureHeight'];
        $viewBoxParams = "0 0 $figW $figH";
        error_log(" view: $viewBoxParams");
        $figureGuts = "<svg viewBox='" . $viewBoxParams . "'>$fig</svg>";
    };

    $guts = "";

    $guts .= "<span id='$destURL' class='paperTitle'>$theTitle</span><br>";
    $guts .= "<span class='paperAuthors'>$p[authors]</span>&nbsp;&bull;&nbsp;";
    $guts .= "<span class='paperTeam'>$teamString</span>";
    $guts .= $theParsedText;
    $guts .= "<h3>Figures</h3>";

    $guts .= $figureGuts;
    $guts .= "<h3>References</h3>";

    return $guts;
}

$user = null;
$pass = null;
$dbname = null;

include 'parsedown-1.7.1/Parsedown.php';
include 'nos2.establishCredentials.php';     //  tells us where the credentials are

//  reportToFile(print_r("CRED LOCAL = " . $credentials['local'], true));

header('Access-Control-Allow-Origin: *');


//  ------------    Connect to database ------------


include '../common/TE_DBCommon.php';    //  in the common folder



//  ------------    Connected ------------

$DBH = CODAP_MySQL_connect("localhost", $user, $pass, $dbname);     //  works under MAMP....

$params = array();  //  accumulate parameters for query
$query = "SELECT * FROM worlds LIMIT 10 ";

$command = $_REQUEST["c"];     //  this is the overall command, the only required part of the POST

$out = json_encode(['Unhandled command' => $command]);

switch ($command) {

    case 'saveNewResult':
        $params = [
            "data" => $_REQUEST['data'],
            "epoch" => $_REQUEST['epoch'],
            "teamID" => $_REQUEST['teamID'],
            "source" => $_REQUEST['source'],
        ];

        $query = "INSERT INTO results (data, epoch, teamID, source) ".
            "VALUES (:data, :epoch, :teamID, :source)";

        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = $DBH->lastInsertId();
        break;

    case 'saveSnapshot':
        $valuesJSONString = $_REQUEST["v"];
        $params = json_decode($valuesJSONString, true);

        $query = "INSERT INTO datapacks (worldID, teamID, resultsList, figure, figureWidth, figureHeight, format, caption, title, notes) ".
            "VALUES (:worldID, :teamID, :resultsList, :figure, :figureWidth, :figureHeight, :format, :caption, :title, :notes)";
        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $out = $DBH->lastInsertId();
        break;

    case 'newWorld':
        reportToFile("\n[$command]......" . date("Y-m-d H:i:s (T)") . " code: " . $_REQUEST['code']);
        error_log("[$command] .... creds .... user $user pass $pass db $dbname");
        $params = array();
        $params["g"] = $_REQUEST["g"];
        $params["code"] = $_REQUEST["code"];
        $params["epoch"] = $_REQUEST["epoch"];
        $params["jName"] = $_REQUEST["jName"];
        $params["scen"] = $_REQUEST["scen"];
        $params["state"] = $_REQUEST["state"];

        $query = "INSERT INTO worlds (godID, code, epoch, journalTitle, scenario, state)".
            "VALUES (:g, :code, :epoch, :jName, :scen, :state)";
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
        $params["teamID"] = $_REQUEST["teamID"];
        $params["teamName"] = $_REQUEST["teamName"];
        $params["text"] = $_REQUEST["text"];
        $params["pkk"] = $_REQUEST["packs"];
        $params["refs"] = $_REQUEST["references"];
        $params["status"] = $_REQUEST["status"];

        $query = "INSERT INTO papers (worldID, title, authors, text, teamID, teamName, packs, `references`, status) ".
            "VALUES (:worldID, :title, :authors, :text, :teamID, :teamName, :ac, :pkk, :refs, :status)";
        $out1 = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $theID = $DBH->lastInsertId();
        reportToFile("[$command]...... new paper number: " . $theID);
        $out = ["id" => $theID];
        break;

    case 'updatePaper':
        reportToFile("[$command]...... title: " . $_REQUEST['title'] . " packs: " . $_REQUEST['packs'] );
        $params = array();
        $params["authors"] = $_REQUEST["authors"];
        $params["title"] = $_REQUEST["title"];
        $params["text"] = $_REQUEST["text"];
        $params["teamID"] = $_REQUEST["teamID"];
        $params["teamName"] = $_REQUEST["teamName"];
        $params["id"] = $_REQUEST["id"];
        $params["pkk"] = $_REQUEST["packs"];
        $params["refs"] = $_REQUEST["references"];
        $params["status"] = $_REQUEST["status"];

        $query = "UPDATE papers SET title = :title, authors = :authors, text=:text, teamID = :teamID, ".
            "teamName = :teamName, packs = :pkk, `references` = :refs, status = :status WHERE id = :id";
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

    case 'getKnownResults':      //  that is, retrieve known data cases
        $w =  $_REQUEST['w'];
        $t = $_REQUEST['t'];
        reportToFile("[$command]...... w = $w, t = $t ");

        if ($_REQUEST["t"] != 'null') {
            $params = ["w" => $w, "t" => $t];
            $query = "SELECT results.id as dbid, results.data, results.epoch, results.teamID, results.source ".
                " FROM results, knowledge ".
                "WHERE knowledge.worldID = :w AND knowledge.teamID = :t AND knowledge.resultID = results.id";
        } else {
            $params = [ "w" => $w ];
            $query = "SELECT * FROM results WHERE worldID = :w ";
        }
        //  reportToFile("[$command]...... query: " . $query);
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getPapers':
        $w =  $_REQUEST['w'];
        $t = $_REQUEST['t'];
        reportToFile("[$command]...... w = $w, t = $t ");

        if ($_REQUEST["t"] != 'null') {
            $params = ["w" => $w, "t" => $t];
            $query = "SELECT * FROM papers WHERE worldID = :w AND teamID = :t ORDER BY id DESC" ;
        } else {
            $params = [ "w" => $w ];
            $query = "SELECT * FROM papers WHERE worldID = :w ORDER BY id DESC";
        }
        reportToFile("[$command]...... query: " . $query);
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getMyWorlds':
        reportToFile("[$command]......  ");
        $params = ["g" => $_REQUEST["g"]];

        $query = "SELECT * FROM worlds WHERE godID = :g ORDER BY id DESC";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        reportToFile("[$command]...... query: " . $query);
        break;

    case 'getMyTeams':
        reportToFile("[$command]......  ");
        $params = ["w" => $_REQUEST["w"]];

        $query = "SELECT * FROM teams WHERE worldID = :w ORDER BY id DESC";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        //  reportToFile("[$command]...... query: " . $query);
        break;

    case 'getGodData':
        reportToFile("[$command]...... username: " . $_REQUEST['u']);
        $params = ['u' => $_REQUEST['u']];

        $query = "SELECT * FROM gods WHERE username = :u";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getPaperPreview':
        reportToFile("[$command]...... paperID: " . $_REQUEST['paperID']);

        $par = ['paperID' => $_REQUEST["paperID"]];     //  parameter
        $q = "SELECT * FROM papers WHERE id = :paperID";
        $p = CODAP_MySQL_getQueryResult($DBH, $q, $par);

        $out = makeOnePaperHTML($DBH, $p[0]);   //  just the one paper

        break;

    case 'getJournal':
        reportToFile("[$command]...... worldID: " . $_REQUEST['w']);
        $par = [ "w" => $_REQUEST["w"] ];

        $q = "SELECT * FROM papers WHERE status = 'published' AND worldID = :w";
        $papers = CODAP_MySQL_getQueryResult($DBH, $q, $par);

        $toc = "";
        $guts = "";

        reportToFile("The journal has : " . count($papers) . " papers.");

        foreach ($papers as $p) {

            $ref = "#p" . $p['id'];
            $toc .= "<li><a class='journalTOC' href='" . $ref . "'>$p[title]</a> ($p[authors])</li>";

            $guts .= makeOnePaperHTML($DBH, $p);
            $guts .= "<hr>";
        }


        $out = count($papers)
            ? "<h2>Contents</h2><ul>$toc</ul><h2>Papers</h2>$guts"
            : "<p>No papers in the journal yet";

        break;

    case 'assertKnowledge':
        $params = [ "w" => $_REQUEST["w"], "t" => $_REQUEST["t"], "r" => $_REQUEST["r"] ];
        $query = "INSERT INTO knowledge (resultID, worldID, teamID) VALUES (:r, :w, :t)";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

    case 'getMyDataPacks':
        $params = [ "w" => $_REQUEST["w"], "t" => $_REQUEST["t"] ];
        $query = "SELECT * FROM datapacks WHERE worldID = :w AND teamID = :t ORDER BY id DESC";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        reportToFile("\n[$command]......query: $query");
        break;

    case 'appendToConvo':
        $query = "SELECT convo FROM papers WHERE id = :p";
        $params = [ "p" => $_REQUEST["p"]];
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        $currentConvo = $out[0]['convo'];
        reportToFile("\n[$command]...... convo out: " . print_r($out, true));

        $newConvo = $currentConvo . $_REQUEST['t'];     //  the appended convo
        $params = [ "p" => $_REQUEST["p"], "t" => $newConvo];
        $query = "UPDATE papers SET convo = :t WHERE id = :p";
        $out = CODAP_MySQL_getQueryResult($DBH, $query, $params);
        break;

}

$jout = json_encode($out);
echo $jout;

