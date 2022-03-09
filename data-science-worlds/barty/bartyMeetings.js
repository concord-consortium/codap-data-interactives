/**
 * Created by tim on 3/9/16.


 ==========================================================================
 meetingGame.js in data-science-games.

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
 * global to describe the secret meeting
 *
 * Note that "where" is the abbr6 of the station (not abbr4)
 */


barty.meeting = {
    day : null,     //   the weekday INDEX (Sun = 0)
    hour : null,        //   the time (24-hr)
    where: null,       //      the abbr6 of the station
    number: null,        //  how many people there are

    origins: ["Powell", "Montgy", "Embarc", "CivCtr"],
    possibleTimes : [9, 10, 11, 12, 13, 14],
    possibleSizes : [12, 52, 160],
    possibleStations : {
        "Orinda": "Orinda",
        "SanBru": "San Bruno",
        "Haywrd": "Hayward",
        "PlHill": "Pleasant Hill"
    },

    restoreMeetingParameters : function( iFromSave ) {
        this.day = iFromSave.day;
        this.hour = iFromSave.hour;
        this.where = iFromSave.where;
        this.number = iFromSave.number;

        $("#meetingTimeSelector").val(this.hour);
        $("#meetingSizeSelector").val(this.number);
        $("#meetingLocationSelector").val(this.where);
        $("#meetingDaySelector").val(this.day);

    },

    /**
     * Called from barty.manager.newGame().
     *
     * Set the values of this (new) meeting pameters to the menu choices; then
     * return an object describing this new meeting,
     *
     */
    setMeetingValues : function() {
        this.hour = Number($("#meetingTimeSelector").val());
        this.number = Number($("#meetingSizeSelector").val());
        this.where = $("#meetingLocationSelector").val();
        this.day = Number($("#meetingDaySelector").val());

        //  choose from the list if the menu is set to "surprise me."

        if (this.where === "-42") {
            const tStationAbbrs = Object.keys( this.possibleStations );
            this.where = TEEUtils.pickRandomItemFrom( tStationAbbrs );
        }
        if ( this.hour === -42 ) this.hour = TEEUtils.pickRandomItemFrom( this.possibleTimes );
        if ( this.day === -42 )    this.day = TEEUtils.pickRandomItemFrom( [0, 1, 2, 3, 4, 5, 6] );
        if ( this.number === -42)  this.number = TEEUtils.pickRandomItemFrom( this.possibleSizes );

        $("#secret").text( this.toString());

        return {
            day : this.day,
            hour : this.hour,
            where : this.where,
            number : this.number
        }
    },


    adjustCount : function(iFrom, iTo, iDay, iHour, iCount ) {

        let result = Number(iCount);
        if ( this.origins.includes(iFrom)
        //  if (($.inArray( iFrom, this.origins) !== -1)
            && iTo === this.where
            && iDay === this.day
            && iHour === this.hour) {
            result += Math.round( this.number / this.origins.length );

            console.log("Adjust count from " + iCount + " to " + result);   //  for debugging
        }
        return result;
    },

    toString : function() {
        return  "Meeting info: "
                + this.number + " people meet every "
                + barty.constants.daysOfWeek[ this.day ] + " at "
                + this.hour + ":00 near the "
                + this.possibleStations[ this.where ] + " BART station. ";
    }
};