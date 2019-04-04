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

    possibleCosts: {},
    caseCounts: {},


    /**
     * Called when a new game is starting,
     * created the top-level "game' case, and records the ID for the case.
     */
    newGame: function () {
        barty.state.meetingParameters = barty.meeting.setMeetingValues();     //   initialize the meeting location, get them from the menus

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
     *  Also gets the names (abbr4's) of the stations.
     */
    getDataSearchCriteria: function () {

        barty.state.queryData.c = $("input:radio[name=dataChoice]:checked").val();     //  jQuery wizardry to find chosen among radio buttons
        barty.state.queryData.stn0 = $("#departureSelector").val();
        barty.state.queryData.stn1 = $("#arrivalSelector").val();
        barty.state.queryData.d0 = $("#dateControl").val();              //  String of the date
        barty.state.queryData.nd = Number($("#numberOfDaysControl").val());

        const tDateZero = new Date(barty.state.queryData.d0);
        const tParsedD0 = tDateZero.getTime() + 60000 * tDateZero.getTimezoneOffset();

        barty.state.queryData.weekday = TEEUtils.dateNumberToDayOfWeek(tParsedD0);
        barty.state.queryData.useWeekday = $("#useWeekday").is(":checked");
        barty.state.queryData.useHour = $("#useHour").is(":checked");

        const tDt = (barty.state.queryData.nd - 1) * 86400 * 1000 * (barty.state.queryData.useWeekday ? 7 : 1);
        const tD1 = new Date(tParsedD0 + tDt);
        barty.state.queryData.d1 = tD1.ISO_8601_string();

        return barty.state.queryData;
    },

    /**
     * This function is the only place in this file that actually communicates with php, via the fetch command.
     *
     * @param iCommands     The commands to send. This is an object whose keys (string) are the commands in php, and the values are the values.
     * @returns {Promise<any>}
     */
    sendCommand: async function (iCommands) {

        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        //  theBody.append("whence", barty.constants.whence);      //  here is where the JS tells the PHP which server we're on.

        let theRequest = new Request(
            barty.constants.kBasePhpURL[barty.constants.whence],
            {method: 'POST', body: theBody, headers: new Headers()}
        );

        try {
            const theResult = await fetch(theRequest);
            if (theResult.ok) {
                return await theResult.json();
            } else {
                console.error("bartyManager.sendCommand() error: " + theResult.statusText);
            }
        } catch (msg) {
            console.log('fetch sequence error: ' + msg);
        }
    },

    /**
     * assembles the array that we pass to php as a set of "commands," that is, an associative
     * array with all the information needed to assemble the MySQL query string.
     *
     * That happens in the php, where this will be known as `$params`.
     *
     * @param   iCommand    the query type, e.g., "byArrival"
     * @param   iWhat       what thing we're getting, data or just counts
     * @returns {string}
     */
    assembleQueryCommandObject: function (iCommand, iWhat) {

        let commandObject = {"c": iCommand, "whence" : barty.constants.whence};

        switch (iWhat) {
            case barty.constants.kGetData:
                commandObject["w"] = "data";
                break;

            case barty.constants.kGetCounts:
                commandObject["w"] = "counts";
                break;
        }

        switch (iCommand) {
            case "betweenAny":
                //  no station clauses

                break;

            case "byRoute":
                commandObject["stn0"] = barty.state.queryData.stn0;     //  departure station
                commandObject["stn1"] = barty.state.queryData.stn1;
                break;

            case "byDeparture":
                commandObject["stn0"] = barty.state.queryData.stn0;
                break;

            case "byArrival":
                commandObject["stn1"] = barty.state.queryData.stn1;
                break;

            default:
                alert("Dang! Unknown command in manager.assembleQueryCommandObject(): " + iCommand);
        }

        commandObject["d0"] = barty.state.queryData.d0;
        commandObject["d1"] = barty.state.queryData.d1;

        if (barty.state.queryData.useHour) {
            commandObject["h0"] = barty.state.queryData.h0;
            commandObject["h1"] = barty.state.queryData.h1;
        }
        if (barty.state.queryData.useWeekday) {
            commandObject["dow"] = barty.state.queryData.weekday;
        }

        return commandObject;       //      dataString;
    },

    /**
     * Estimate how many cases will be retrieved using the command and query data attached
     * @param iCommand  the "command," which is a string sych as "byDeparture"
     * @param iQueryData an object created in bartyManager.getDataSearchCriteria (above)
     * @returns {*}
     */
    estimateCount: function (iCommand, iQueryData) {
        const days = iQueryData.nd;

        let hoursPerDay = 20;
        if (iQueryData.useHour) hoursPerDay = iQueryData.h1 - iQueryData.h0;

        const totalHours = days * hoursPerDay;

        let estimate = 42;

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

            const tCountEstimate = barty.manager.estimateCount(iQT, barty.state.queryData);

            barty.manager.possibleCosts[iQT] = tCountEstimate + " cases est";   //  temporary
            barty.ui.fixUI();        //  temporary

            if (tCountEstimate <= 1500) {
                $("#byArrivalCostText").html(barty.manager.possibleCosts["byArrival"]);
                $("#betweenAnyCostText").html(barty.manager.possibleCosts["betweenAny"]);
                $("#byRouteCostText").html(barty.manager.possibleCosts["byRoute"]);
                $("#byDepartureCostText").html(barty.manager.possibleCosts["byDeparture"]);

            } else {
                barty.manager.possibleCosts[iQT] = "too much data<br>to download";
                barty.ui.fixUI();

                //  todo: fix the following loop, not working as of 2016-03-14

/*
                if (barty.constants.queryTypes.every(function (iQT) {
                    barty.manager.caseCounts[iQT] >= 0;
                })) {
                    console.log("All case counts retrieved");
                }
*/

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
    doBucketOfData: async function () {

        const tEstimatedCount = barty.manager.estimateCount(barty.state.queryData.c, barty.state.queryData);

        if (tEstimatedCount < barty.constants.kRecordsPerRequestLimit) {
            barty.state.requestNumber++;

            const tCommandObject = this.assembleQueryCommandObject(barty.state.queryData.c, this.kGetData);

            $("#result").text("Looking for data. ");

            barty.statusSelector.text("waiting for data from " + barty.constants.whence + "...");
            let theData = await this.sendCommand(tCommandObject);
            this.weGotData(theData);
        } else {
            alert("That's too much data. Make your request smaller.");
        }
    },

    weGotData: function (theParsedData) {
        $("#result").text((theParsedData.length) ? " Got " + theParsedData.length + " records! " : "No data. ");
        barty.statusSelector.text("loading data into CODAP...");
/*
        let tRememberedDateHour = null;

        let reorganizedData = {};
*/

        //  output an item for each record
        //  we will stow these values in an array for having CODAP make the cases.

        let tValuesArray = [];  //  array of (CODAP-style) case values

        //  loop over all cases in the returned data (one per hour-station-pair)

        theParsedData.forEach(function (d) {
            const tStartAt = barty.stations[d.origin].abbr6;
            const tEndAt = barty.stations[d.destination].abbr6;

            //  in case the list of stations is screwed up...
            if (!tStartAt) {
                console.log('Station ' + d.origin + ' not found!');
            }
            if (!tEndAt) {
                console.log('Station ' + d.destination + ' not found!');
            }

            //  alter the count if the data includes a secret meeting!
            const tAdjustedCount = barty.meeting.adjustCount(
                tStartAt,
                tEndAt,
                d.dow - 1,           //      the index of the weekday
                d.hour,
                d.riders
            );

            const ymd = d.date.split("-");
            const tDate = new Date(Number(ymd[0]), Number(ymd[1]) - 1, Number(ymd[2]), Number(d.hour));
            const tFormattedDate = $.datepicker.formatDate("mm/dd/yy", tDate);
            const tFormattedDateTime = tFormattedDate + " " + d.hour + ":00:00";

            //  assemble the values for the CODAP case
            const tValues = {
                request: barty.state.requestNumber,
                when: tFormattedDateTime,
                day: barty.constants.daysOfWeek[d.dow - 1],
                hour: d.hour,
                date: tDate.toDateString(),

                riders: tAdjustedCount,
                startAt: tStartAt,
                endAt: tEndAt,
                startReg: barty.stations[d.origin].region,
                endReg: barty.stations[d.destination].region,
                id: d.id
            };
            tValuesArray.push(tValues);
        });

        barty.connector.outputDataItems(tValuesArray);      //  will create "Items"
        barty.statusSelector.text("CODAP has the new data.");
        barty.connector.makeTableAppear();
    },


};

