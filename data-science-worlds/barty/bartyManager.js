/**
 ==========================================================================
 bartYManager.js

 overall controller for BART microdata.

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
 * Created by tim on 2/23/16.
 */

/* global $, TEEUtils, console */


barty.manager = {

    playing: false,
    requestNumber: 0,

    queryData: {},      //  a structure that holds stuff like the stations and times
    possibleCosts: {},
    caseCounts: {},


    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function () {
        meeting.setMeetingValues();     //   initialize the meeting location, get them from the menus
        barty.state.day = meeting.day;
        barty.state.hour = meeting.hour;
        barty.state.where = meeting.where;
        barty.state.number = meeting.number;

        barty.state.gameNumber++;
        barty.manager.playing = true;
        barty.ui.dataSelectionChanged();
    },


    /**
     * Called whenever a game ends.
     * @param iReason   why the game ended, a string, e.g., "aborted" "won" "lost"
     */
    endGame: function (iReason) {
        //  barty.connector.closeGame({result: iReason});   //  todo: cope with this if we want a real game

        this.playing = false;
    },

    /**
     * Read the UI controls and set up properties so that the data search will be correct.
     *  Also gets the names (abbr2's) of the stations.
     */
    getDataSearchCriteria: function () {

        this.queryData.c = $("input:radio[name=dataChoice]:checked").val();     //  jQuery wizardry to find chosen among radio buttons
        this.queryData.stn0 = $("#departureSelector").val();
        this.queryData.stn1 = $("#arrivalSelector").val();
        this.queryData.d0 = $("#dateControl").val();              //  String of the date
        this.queryData.nd = Number($("#numberOfDaysControl").val());

        var tDateZero = new Date(this.queryData.d0);
        var tParsedD0 = tDateZero.getTime() + 60000 * tDateZero.getTimezoneOffset();

        this.queryData.weekday = TEEUtils.dateNumberToDayOfWeek(tParsedD0);
        this.queryData.useWeekday = $("#useWeekday").is(":checked");
        this.queryData.useHour = $("#useHour").is(":checked");

        var tDt = (this.queryData.nd - 1) * 86400 * 1000 * (this.queryData.useWeekday ? 7 : 1);
        var tD1 = new Date(tParsedD0 + tDt);
        this.queryData.d1 = tD1.ISO_8601_string();

        return this.queryData;
    },


    /**
     * assembles the "POST" string that $.ajax() needs to communicate the variables php needs to assemble
     * the MySQL query that will get us our data.
     *
     * A finished string might be something like
     *      ?c=byArrival&stn1=OR&startTime=2015-09-30 10:00:00&stopTime=2015-09-30 11:00:00
     *
     * @param   iCommand    the query type, e.g., "byArrival"
     * @param   iWhat       what thing we're getting, data or just counts
     * @returns {string}
     */
    assembleQueryDataString: function (iCommand, iWhat) {

        var dataString = "c=" + iCommand + "&whence=" + barty.constants.whence;
        var tStationClauseString = "";

        switch (iWhat) {
            case barty.constants.kGetData:
                dataString += "&w=data";
                break;

            case barty.constants.kGetCounts:
                dataString += "&w=counts";
                break;
        }

        switch (iCommand) {
            case "betweenAny":
                //  no station clauses

                break;

            case "byRoute":
                tStationClauseString = "&stn1=" + this.queryData.stn1;   //  the abbr2 of that station
                tStationClauseString += "&stn0=" + this.queryData.stn0;   //  the abbr2 of that station
                break;

            case "byArrival":
                tStationClauseString = "&stn1=" + this.queryData.stn1;   //  the abbr2 of that station
                break;

            case "byDeparture":
                tStationClauseString = "&stn0=" + this.queryData.stn0;   //  the abbr2 of that station
                break;

            default:
                dataString += " true LIMIT 10";
        }

        dataString += "&d0=" + this.queryData.d0 + "&d1=" + this.queryData.d1;
        if (this.queryData.useHour) {
            dataString += "&h0=" + this.queryData.h0 + "&h1=" + this.queryData.h1;
        }
        if (this.queryData.useWeekday) {
            dataString += "&dow=" + this.queryData.weekday;
        }

        dataString += tStationClauseString; //  append the "station clause"

        $("#query").html("<strong>data string for PHP</strong> : " + dataString);
        return dataString;
    },

    /**
     * Estimate how many cases will be retrieved using the command and query data attached
     * @param iCommand  the "command," which is a string sych as "byDeparture"
     * @param iQueryData an object created in bartyManager.getDataSearchCriteria (above)
     * @returns {*}
     */
    estimateCount: function (iCommand, iQueryData) {
        var days = iQueryData.nd;

        var hoursPerDay = 20;
        if (iQueryData.useHour) hoursPerDay = iQueryData.h1 - iQueryData.h0;

        var totalHours = days * hoursPerDay;

        var estimate;

        switch (iCommand) {
            case "betweenAny":
                estimate = totalHours * 1500;
                break;

            case "byDeparture":
                estimate = totalHours * 35;
                break;
            case "byArrival":
                estimate = totalHours * 35;
                break;

            case "byRoute":
                estimate = totalHours;
                break;
            default:
                estimate = 42;
        }

        return estimate;
    },

    doCaseCounts: function () {

        barty.constants.queryTypes.forEach(function (iQT) {
            barty.manager.caseCounts[iQT] = null;   //  set dirty

            var tCountEstimate = barty.manager.estimateCount(iQT, barty.manager.queryData);

            barty.manager.possibleCosts[iQT] = tCountEstimate + " cases est";   //  temporary
            barty.ui.fixUI();        //  temporary



            if (tCountEstimate <= 1500) {
/*
                var tDataString = barty.manager.assembleQueryDataString(iQT, barty.constants.kGetCounts);
                console.log("Data query string: " + tDataString);


                $.ajax({
                    type: "post",
                    url: barty.constants.kBaseURL,
                    data: tDataString,
                    success: weGotPrice
                });

                function weGotPrice(iData) {
                    var jData = JSON.parse(iData)[0];     //  first object in the array
                    var tKeys = Object.keys(jData);
                    var tCount = Number(jData[tKeys[0]]);

                    barty.manager.caseCounts[iQT] = tCount;
                    barty.manager.possibleCosts[iQT] = tCount + " cases";


                    //  todo: fix the following loop, not working as of 2016-03-14

                    if (barty.constants.queryTypes.every(function (iQT) {
                            barty.manager.caseCounts[iQT] >= 0;
                        })) {
                        console.log("All case counts retrieved");
                    }
                }
*/
                //barty.manager.possibleCosts[iQT] = tCountEstimate + " cases";
                $("#byArrivalCostText").html(barty.manager.possibleCosts["byArrival"]);
                $("#betweenAnyCostText").html(barty.manager.possibleCosts["betweenAny"]);
                $("#byRouteCostText").html(barty.manager.possibleCosts["byRoute"]);
                $("#byDepartureCostText").html(barty.manager.possibleCosts["byDeparture"]);

            } else {
                barty.manager.possibleCosts[iQT] = "too much data<br>to download";
                barty.ui.fixUI();

                //  todo: fix the following loop, not working as of 2016-03-14

                if (barty.constants.queryTypes.every(function (iQT) {
                        barty.manager.caseCounts[iQT] >= 0;
                    })) {
                    console.log("All case counts retrieved");
                }

            }
        });
    },

    /**
     * Called from getDataButtonPressed()
     * Called when we need more data from the database.
     * Variables about what data we want have already been set.
     *
     *  This is a cascade of functions, some of which are asynchronous.
     *  (1) Create the "bucket" case, the parent of all the individual observations
     *  (2) doQuery: if successful, actually POST the information to the .php feed (barty.constants.kBaseURL)
     *  (3) weGotData( iData ): if successful, process the array, each element using...
     *  (4) processHours : extract the individual data values from the record and create a new "leaf" case
     */
    doBucketOfData: function () {

        var tEstimatedCount = barty.manager.estimateCount(this.queryData.c, this.queryData);

        if (tEstimatedCount < 1700) {
            barty.state.requestNumber++;

            var tDataString = this.assembleQueryDataString(this.queryData.c, this.kGetData);
            var theData;
            var tRememberedDateHour = null;

            $("#result").text("Looking for data. ");

            barty.statusSelector.text("getting data from " + barty.constants.kDataLocation + "...");
            $.ajax({
                type: "post",
                url: barty.constants.kBasePhpURL[barty.constants.whence],
                data: tDataString,
                success: weGotData
            });
        } else {
            alert("That's too much data. Make your request smaller.");
        }

        function weGotData(iData) {
            barty.statusSelector.text("parsing data from " + barty.constants.kDataLocation + "...");
            theData = JSON.parse(iData);
            $("#result").text((theData.length) ? " Got " + theData.length + " records! " : "No data. ");
            barty.statusSelector.text("loading data into CODAP...");
            tRememberedDateHour = null;

            var reorganizedData = {};

            //  output an item for each record
            //  we will stow these values in an array for having CODAP make the cases.

            var tValuesArray = [];  //  array of (CODAP-style) case values

            theData.forEach(function (d) {
                var tStartAt = barty.stations[d.origin].abbr6;
                var tEndAt = barty.stations[d.destination].abbr6;

                var tAdjustedCount = meeting.adjustCount(
                    tStartAt,
                    tEndAt,
                    d.dow - 1,           //      the index of the weekday
                    d.hour,
                    d.passengers
                );

                if (tAdjustedCount != d.passengers) {
                    console.log("Adjust count from " + d.passengers + " to " + tAdjustedCount);
                }

                var ymd = d.Bdate.split("-");
                var tDate = new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]), Number(d.hour));
                var tFormattedDate = $.datepicker.formatDate("mm/dd/yy", tDate);
                var tFormattedDateTime = tFormattedDate + " " + d.hour + ":00:00";

                var tValues = {
                    //gameNumber: barty.manager.gameNumber,
                    request: barty.state.requestNumber,
                    when: tFormattedDateTime,
                    day: barty.constants.daysOfWeek[d.dow - 1],
                    hour: d.hour,
                    date: tDate.toDateString(),

                    riders: tAdjustedCount,
                    startAt: barty.stations[d.origin].abbr6,
                    endAt: barty.stations[d.destination].abbr6,
                    startReg: barty.stations[d.origin].region,
                    endReg: barty.stations[d.destination].region,
                    id: d.id
                };
                tValuesArray.push(tValues);
            });

            barty.connector.outputDataItems(tValuesArray);      //  will create "Items"
            barty.statusSelector.text("CODAP has the new data.");
        }

    }
};

