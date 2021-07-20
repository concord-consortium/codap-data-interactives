// Run a flash game.
// This is a wrapper around AC_OERTags.js AC_FL_RunContent, which sets parameters appropriatly for embedding in DG.

/**
 * Run a flash game.
 *
 *  @param params configuration parameters.
 *  @param {String} params.name Name of the flash source file (without the .swf).
 *  @param {String} [params.gameName] Name of the flash game, used as an id, defaults to params.name.
 *  @param {String} params.bgcolor Background color, e.g. "#869ca7".
 *  @param {String} params.width Width of the flash view, e.g. "627".
 *  @param {String} params.width Height of the flash view, e.g. "452".
 */
function run_game(params) {
  
  // Major version of Flash required
  var requiredMajorVersion = 9;
  // Minor version of Flash required
  var requiredMinorVersion = 0;
  // Minor version of Flash required
  var requiredRevision = 124;
  
  // Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
  var hasProductInstall = DetectFlashVer(6, 0, 65);
  
  // Version check based upon the values defined in globals
  if( params.swfVersionStr) {
    var versionParts = params.swfVersionStr.split("."); // expecting 3-part string like "10.2.0"; "0.0.0" means no version detection
    requiredMajorVersion = Number(versionParts[0]);
    requiredMinorVersion = Number(versionParts[1]);
    requiredRevision     = Number(versionParts[2]);
  }
  var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
  
  if( !params.gameName) // Default gameName to name
    params.gameName = params.name; 
  
  if ( hasProductInstall && !hasRequestedVersion ) {
    // DO NOT MODIFY THE FOLLOWING FOUR LINES
    // Location visited after installation is complete if installation is required
    var MMPlayerType = (isIE == true) ? "ActiveX" : "PlugIn";
    var MMredirectURL = window.location;
      document.title = document.title.slice(0, 47) + " - Flash Player Installation";
      var MMdoctitle = document.title;
  
    AC_FL_RunContent(
      "src", "playerProductInstall",
      "FlashVars", "MMredirectURL="+MMredirectURL+'&MMplayerType='+MMPlayerType+'&MMdoctitle='+MMdoctitle+"",
      "width", params.width,
      "height", params.height,
      "align", "middle",
      "id", params.gameName,
      "quality", "high",
      "bgcolor", "#869ca7",
      "name", params.name,
      "allowScriptAccess","sameDomain",
      "type", "application/x-shockwave-flash",
      "wmode", "transparent",
      "pluginspage", "http://www.adobe.com/go/getflashplayer"
    );
  } else if (hasRequestedVersion) {
    // if we've detected an acceptable version
    // embed the Flash Content SWF when all tests are passed
    AC_FL_RunContent(
        "src", params.name,
        "width", params.width,
        "height", params.height,
        "align", "middle",
        "id", params.gameName,
        "quality", "high",
        "bgcolor", params.bgcolor,
        "name", params.name,
        "allowScriptAccess","sameDomain",
        "type", "application/x-shockwave-flash",
        "wmode", "transparent",
        "pluginspage", "http://www.adobe.com/go/getflashplayer"
    );
    } else {  // flash is too old or we can't detect the plugin
      var alternateContent = 'Alternate HTML content should be placed here. '
      + 'This content requires the Adobe Flash Player. '
      + '<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
      document.write(alternateContent);  // insert non-flash content
  }
}

/*
If you want to support windows browsers without javascript support enabled, you will need the following
<noscript> in the body of your html file. Replace "Markov" etc. with the correct values for your game.
<noscript>
  	<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
			id="Markov" width="522" height="179"
			codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">
			<param name="movie" value="Markov.swf" />
			<param name="quality" value="high" />
			<param name="bgcolor" value="#869ca7" />
			<param name="allowScriptAccess" value="sameDomain" />
			<embed src="Markov.swf" quality="high" bgcolor="#869ca7"
				width="627" height="452" name="Markov" align="middle"
				play="true"
				loop="false"
				quality="high"
				allowScriptAccess="sameDomain"
				type="application/x-shockwave-flash"
				wmode="transparent"
				pluginspage="http://www.adobe.com/go/getflashplayer">
			</embed>
	</object>
</noscript>
-->
*/


