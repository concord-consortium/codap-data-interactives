/**
 * Created by tim on 3/20/16.


 ==========================================================================
 barty.ui.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

/**
 * singleton to adjust various UI issues
 *
 * @type {{initialize: barty.ui.initialize, getDataButtonPressed: barty.ui.getDataButtonPressed, dataSelectionChanged: barty.ui.dataSelectionChanged, hourControlSlides: barty.ui.hourControlSlides, newGameButtonPressed: barty.ui.newGameButtonPressed, fixUI: barty.ui.fixUI, fixRouteStrings: barty.ui.fixRouteStrings, fixDataSelectionText: barty.ui.fixDataSelectionText, formatTime: barty.ui.formatTime, formatDate: barty.ui.formatDate, makeInitialOptions: barty.ui.makeInitialOptions, makeMeetingTimeOptions: barty.ui.makeMeetingTimeOptions, makeMeetingSizeOptions: barty.ui.makeMeetingSizeOptions, makeMeetingLocationOptions: barty.ui.makeMeetingLocationOptions, makeWeekdaysOptions: barty.ui.makeWeekdaysOptions, makeOptionsFromStationsDB: barty.ui.makeOptionsFromStationsDB}}
 */
barty.ui = {

    /**
     * Set up initial values
     */
    initialize: function () {
        $("#dateControl").val(barty.state.queryData.d0);

/*
        //  set up hours control

        barty.manager.queryData.h0 = barty.constants.kBaseH0;   //  initial hour, if we're using hours
        barty.manager.queryData.h1 = barty.constants.kBaseH1;   //  final hour
*/

        //  set up the slider
        $("#hourControl").slider({
            range: true,
            min: 0,
            max: 24,
            values: [barty.state.queryData.h0, barty.state.queryData.h1],
            slide: barty.ui.hourControlSlides.bind(this),
            step: 1
        });

        barty.ui.makeInitialOptions();  //  construct menus for stations and for secret meeting options
        barty.ui.restoreOtherStateSettings();

        barty.manager.possibleCosts = {
            "betweenAny": "???",
            "byRoute": "???",
            "byDeparture": "???",
            "byArrival": "???"
        };

        barty.ui.fixUI();

    },

    restoreOtherStateSettings : function() {

        //  restore the menu for how many days
        document.getElementById("numberOfDaysControl").value = barty.state.queryData.nd;

        //  restore checkboxes
        document.getElementById("useHour").checked = barty.state.queryData.useHour;
        document.getElementById("useWeekday").checked = barty.state.queryData.useWeekday;

        //  restore which kind of data grab this is (e.g., by departure)

        const radioItemName = barty.state.queryData.c + "Item";
        document.getElementById(radioItemName).checked = true;

    },

    /**
     * User has pressed the button to get data.
     * @param e     The mouse event
     */
    getDataButtonPressed: function (e) {

        barty.manager.getDataSearchCriteria();   //  make sure we have current values
        barty.manager.doBucketOfData();        //  actually get the data
        this.fixUI();                   //  update what we see
    },

/*
    showPricesButtonPressed: function () {
        barty.manager.getDataSearchCriteria();   //  make sure we have current values
        barty.manager.doCaseCounts();

        this.fixUI();
    },
*/

    swapStations : function() {
        var tOldDeparture = $("#departureSelector").val();
        var tOldArrival = $("#arrivalSelector").val();
        $("#departureSelector").val(tOldArrival);
        $("#arrivalSelector").val(tOldDeparture);

        barty.state.queryData.stn0 = $("#departureSelector").val();
        barty.state.queryData.stn1 = $("#arrivalSelector").val();

        this.dataSelectionChanged();
    },

    /**
     * The user has changed something (anything) in the UI for choosing data
     */
    dataSelectionChanged: function () {
        this.possibleCosts = {
            "betweenAny": "???",
            "byRoute": "???",
            "byDeparture": "???",
            "byArrival": "???"
        };

        barty.manager.getDataSearchCriteria();   //  make sure we have current values
        barty.manager.doCaseCounts();   //  count the cases

        this.fixUI();   //  update the display (e.g., the case counts, the strings describing stations...)
    },

    /**
     * Use has changed the slider that controls the hours.
     * @param event
     * @param iThis     the slider itself
     */
    hourControlSlides: function (event, iThis) {
        barty.state.queryData.h0 = iThis.values[0];
        barty.state.queryData.h1 = iThis.values[1];
        barty.ui.dataSelectionChanged();    //  update all possible consequences
    },

    /**
     * User pressed the new game button, but when we're playing, that button is for aborting a game.
     * So this routine figures out whether to call the newGame() or endGame("abort") methods.
     */
    newGameButtonPressed: function () {
        if (barty.manager.playing) {
            barty.manager.endGame("abort")
        } else {
            barty.manager.newGame();
        }

        this.fixUI();
    },

    /**
     * Adjust the UI with regard to disabled controls and visibility. Called whenever things could change.
     */
    fixUI: function () {
        var tQD = barty.manager.getDataSearchCriteria();    //  query data. tQD.c is the type of data (byArrival, etc.)

        this.fixDataSelectionText(tQD);

        if (tQD.useHour) {
            $("#hourControl").show();   //  only show the hour slider if the user is using hours
        } else {
            $("#hourControl").hide();   //  otherwise, user is getting all data from that day; no slider needed
        }

        if (tQD.nd === 1) {
            $("#oneDayOnlyControl").hide(); //  The user is getting only one day, so no need to show the control
                                            //  about getting only that day of the week
        } else {
            $("#oneDayOnlyControl").show(); //  more than one day, we need to know if user wants only Thursdays...
        }

        $("#newGameButton").text(barty.manager.playing ? "abort game" : "new game");

        if (barty.manager.playing) {
            $("#getDataButton").prop("disabled", false);
            $(".options").hide();   //  no options visible while playing
        } else {
            $(".options").show();
            $("#getDataButton").prop("disabled", true);
        }


        //  here we could write a longer description of what you will get if you press get data.
    },

    /**
     * Set the "route strings" ('from any station to Embarcadero') based on what is selected
     */
    fixRouteStrings : function()    {
        var tArrivalStationName = $("#arrivalSelector").find('option:selected').text();
        var tDepartureStationName = $("#departureSelector").find('option:selected').text();

        barty.routeStrings["betweenAny"] = "between any<br>two stations";
        barty.routeStrings["byRoute"] = "from <strong>" + tDepartureStationName
            + "</strong><br>to <strong>" + tArrivalStationName + "</strong>";
        barty.routeStrings["byArrival"] = "from any station<br>to <strong>" + tArrivalStationName + "</strong>";
        barty.routeStrings["byDeparture"] = "from <strong>" + tDepartureStationName + "</strong><br>to any station";

        $("#betweenAnyItemText").html(barty.routeStrings["betweenAny"]);
        $("#byRouteItemText").html(barty.routeStrings["byRoute"]);
        $("#byDepartureItemText").html(barty.routeStrings["byDeparture"]);
        $("#byArrivalItemText").html(barty.routeStrings["byArrival"]);
    },

    /**
     *  Construct text that describes what the user will get if they request data
     * @param iQD   query data record set in .manager but is actualy in barty.state.queryData
     * iQD.c, for example, is the type (e.g.,byArrival)
     */
    fixDataSelectionText: function (iQD) {

        //  Whole names of selected stations
        var tArrivalStationName = $("#arrivalSelector").find('option:selected').text();
        var tDepartureStationName = $("#departureSelector").find('option:selected').text();

        this.fixRouteStrings();
        var tStationSetupText = barty.routeStrings[iQD.c];

        //  time description text.
        var tEndHour = iQD.h1 - 1;
        var tWeekdayText = barty.constants.daysOfWeekLong[iQD.weekday];

        var tHoursText = "from "
            + this.formatTime(iQD.h0, 0)
            + " to " + this.formatTime(tEndHour, 59);

        if (iQD.h0 === iQD.h1) tHoursText = " (zero time interval; no data)";

        //  fix the weekday text
        var tWeekdayBoxLabel = iQD.useWeekday
            ? tWeekdayText + " only. Deselect for any day:"
            : "Select to search " + tWeekdayText + "s only:";

        //  fix the hours text
        var tHoursBoxLabel = iQD.useHour
            ? "You will get data from " + tHoursText + ". Deslect for whole day: "
            : "You will get data for the whole day. Click the box to restrict the hours: ";

        $("#useHoursItemText").text(tHoursBoxLabel);
        $("#useWeekdayItemText").text(tWeekdayBoxLabel);
        $("#timeDescription").text(
            (iQD.useWeekday ? tWeekdayText + " only, " : "Any day, ")
            + (iQD.useHour ? tHoursText + "." : "all day.")
        );

        //  assemble "data interval statement"
        // .d0 and .d1 are ISO date strings

        var tDay0Text = this.formatDate(iQD.d0);
        var tDay1Text = this.formatDate(iQD.d1);

        var tSearchTime = (tDay0Text == tDay1Text)
            ? tDay0Text
            : tDay0Text + " to " + tDay1Text;
        tSearchTime += ", ";

        if (iQD.useWeekday) tSearchTime += "<br>only " + tWeekdayText + "s, ";
        tSearchTime += (iQD.useHour ? "<br>" + tHoursText : " all day");

        $("#dataIntervalStatement").text(tSearchTime);
        $("#downloadOptionTimeAndStationsText").html(tSearchTime + "<br>" + tStationSetupText);

        //  set more texts

    },

    formatTime: function (h, m) {
        var hourNumber = h < 13 ? h : h - 12;
        if (hourNumber === 0) hourNumber = 12;

        var ampm = h < 12 ? "AM" : "PM";

        var minuteString = m.toString();
        if (minuteString.length < 2) minuteString = "0" + minuteString;

        return hourNumber.toString() + ":" + minuteString + " " + ampm;
    },

    formatDate: function (iso) {
        var dIn = new Date(iso);
        var userTimezoneOffset = new Date().getTimezoneOffset() * 60000;  //  at our current location
        var dOut = new Date(dIn.getTime() + userTimezoneOffset);
        return dOut.toLocaleDateString();
    },

    /**
     * Set up the "options" devices, esp. for specifying where/when the meetings are
     */
    makeInitialOptions: function () {
        //  get menu items for a list of stations
        barty.ui.makeOptionsFromStationsDB();

        //  set up game options -- possible meeting parameters and menus
        barty.ui.makeMeetingLocationOptions($('#meetingLocationSelector'));
        barty.ui.makeWeekdaysOptions($('#meetingDaySelector'));
        barty.ui.makeMeetingTimeOptions($('#meetingTimeSelector'));
        barty.ui.makeMeetingSizeOptions($('#meetingSizeSelector'));

    },

    /**
     * Make the menu for meeting times
     * @param iSelector
     */
    makeMeetingTimeOptions: function (iSelector) {
        var result = "";
        barty.meeting.possibleTimes.forEach(
            function (t) {
                result += "<option value='" + t + "'>" + t + ":00 </option>";
            }
        );
        iSelector.empty().append(result);
        iSelector.append("<option value='-1' disabled>————</option>");
        iSelector.append("<option value='-42'>Surprise me</option>");
        iSelector.val(barty.state.meetingParameters.time);
    },

    /**
     * Make the menu for meeting size
     * @param iSelector
     */
    makeMeetingSizeOptions: function (iSelector) {
        var result = "";
        barty.meeting.possibleSizes.forEach(
            function (s) {
                result += "<option value='" + s + "'>" + s + " people </option>";
            }
        );
        iSelector.empty().append(result);
        iSelector.append("<option value='-1' disabled>————</option>");
        iSelector.append("<option value='-42'>Surprise me</option>");
        iSelector.val(barty.state.meetingParameters.size);
    },

    /**
     * make the menu for the meeting location
     * @param iSelector
     */
    makeMeetingLocationOptions: function (iSelector) {

        var result = "";
        Object.keys(barty.meeting.possibleStations).forEach(
            function (iAbbr4) {
                result += "<option value='" + iAbbr4 + "'>" + barty.meeting.possibleStations[iAbbr4] + "</option>";
            }
        );
        iSelector.empty().append(result);
        iSelector.append("<option value='-1' disabled>————</option>");
        iSelector.append("<option value='-42'>Surprise me</option>");
    },

    /**
     * Make the menu for which day of the week
     * @param iSelector
     */
    makeWeekdaysOptions: function (iSelector) {
        var result = "";
        barty.constants.daysOfWeek.forEach(
            function (iDay, index) {
                result += "<option value='" + index + "'>" + iDay + "</option>";
            }
        );
        iSelector.empty().append(result);
        iSelector.append("<option value='-1' disabled>————</option>");
        iSelector.append("<option value='-42'>Surprise me</option>");
        iSelector.val(barty.state.queryData.day);      //  set to saved value
    },

    /**
     *  get the list of stations from the bart.stations object,
     *  then use those names to populate the menus that need stations
     */
    makeOptionsFromStationsDB: function () {

        var stationArray = [];
        var theOptionText = "";        //

        for (var stn in barty.stations) {
            if (barty.stations.hasOwnProperty(stn)) {
                var tStation = barty.stations[stn];
                stationArray.push(tStation);
            }
        }

        stationArray.sort(compareStations);

        stationArray.forEach( function (sta) {
            theOptionText += "<option value='" + sta.abbr4 + "'>" + sta.name + "</option>";
        });

        $("#departureSelector").empty().append(theOptionText);   // put them into the DOM
        $("#departureSelector").val(barty.state.queryData.stn0);   // restore saved value
        $("#arrivalSelector").empty().append(theOptionText);   // put them into the DOM
        $("#arrivalSelector").val(barty.state.queryData.stn1);   // restore saved value

        function compareStations(a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        }
    }

};


