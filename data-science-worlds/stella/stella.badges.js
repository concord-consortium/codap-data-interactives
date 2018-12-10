/**
 * Created by tim on 10/8/16.


 ==========================================================================
 stella.badges.js in gamePrototypes.

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

/*
How to implement a new badge!

1)  below, in stella.badges.badgeStatus, extend the JSON to include what the badge is.
2)  Make sure stella.badges.badgeIDbyResultType reflects the new badge
    (for which results will this badge give you auto privileges??

Bear in mind that badges often (always?) depend on "results," which are defined in StarResult.js.
For example, the result IDs (such as "pm_x") are there.

Note that they depend on scores in those results, which get awarded in StarResult.prototype.evaluateResult()
That in turn depends on stella.starResultTypes[<type>].errorL1, the (absolute) error that roughly corresponds
to level one of the associated badge.


 */

/**
 * Global responsible for recording THIS USER'S badge achievements, his/her badge status.
 * @type {{checkNewResultForBadgeProgress: stella.badges.checkNewResultForBadgeProgress, badgeLevelForResult: stella.badges.badgeLevelForResult, lowestComponentPoints: stella.badges.lowestComponentPoints, badgeIDbyResultType: {temp: string, vel_r: string, pos_x: string, pos_y: string, pm_x: string, pm_y: string, parallax: string}, badgeStatus: {temp: {setAwardLevel: stella.badges.badgeStatus.temp.setAwardLevel, level: number, name: string, scoreInBadge: number, badgeComponents: *[]}, vel_r: {setAwardLevel: stella.badges.badgeStatus.vel_r.setAwardLevel, level: number, name: string, scoreInBadge: number, badgeComponents: *[]}, position: {setAwardLevel: stella.badges.badgeStatus.position.setAwardLevel, level: number, name: string, scoreInBadge: number, badgeComponents: *[]}, pm: {setAwardLevel: stella.badges.badgeStatus.pm.setAwardLevel, level: number, name: string, scoreInBadge: number, badgeComponents: *[]}, parallax: {setAwardLevel: stella.badges.badgeStatus.parallax.setAwardLevel, level: number, name: string, scoreInBadge: number, badgeComponents: *[]}}, toHTML: stella.badges.toHTML, toString: stella.badges.toString}}
 */
stella.badges = {

    /**
     * We just got a new result that is deemed worthy.
     * What badge(s) does it count towards?
     * @param iResult
     */
    checkNewResultForBadgeProgress: function (iResult) {
        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {

                var tStat = this.badgeStatus[iBadge];

                tStat.badgeComponents.forEach(function (iBadgeComponent) {
                    if (iBadgeComponent.fitsInComponent(iResult)) {
                        //  this result fits this component
                        if (iResult.points > iBadgeComponent.points) {
                            var dPoints = iResult.points - iBadgeComponent.points;
                            tStat.scoreInBadge += dPoints;
                            stella.player.stellaScore += dPoints;       //      update global score here
                            iBadgeComponent.points = iResult.points;
                            iBadgeComponent.relevantResult = iResult;

                            console.log(stella.badges.toString());
                        }
                    }
                });
                tStat.setAwardLevel();
            }
        }
    },

    /**
     * Given a result type (e.g., "pos_x" find the level of the associated badge
     * (here, "position," whose name is "Astrometry.")
     *
     * @param iResultType
     * @returns {number|*}
     */
    badgeLevelForResult : function( iResultType ) {

        return this.badgeStatus[ this.badgeIDbyResultType[iResultType]].level;
    },

    /**
     * Each badge has an array of components.
     * Each component has earned points associated with it.
     * This method finds the lowest points value for the components.
     *
     * So note: if the lowest value is greater than zero, the user has done something worthy in ALL components.
     * @param iComponents
     * @returns {Number}
     */
    lowestComponentPoints : function( iComponents ) {
        var out = Number.MAX_VALUE;
        iComponents.forEach( function( iC ){
            if (iC.points < out) {
                out = iC.points;
            }
        });
        return out;
    },

    /**
     * Which badge corresponds to which result?
     * Use this object to find out.
     */
    badgeIDbyResultType : {
        temp: "temp",
        vel_r: "vel_r",
        pos_x: "position",
        pos_y: "position",
        pm_x: "pm",
        pm_y: "pm",
        parallax: "parallax"
    },

    /**
     * Here is the actual user's badge status.
     * There is a key for each badge type (mapped from result types above)
     * The value associated with the badge type is itself an object.
     *
     * level    the current level the user has earned
     * name     the full name of the badge
     * scoreInBadge how many points the user has earned in this badge
     * badgeComponents  Array of objects, one for each sub-achievement you need for the badge.
     *      description text descriptionof the component
     *      points  how many points you have earned in this component
     *      relevantResult the most recent StarResult used to gain points
     *      fitsInComponent a function(!) that takes a StarResult and returns a Boolean, whether it is appropriate for this component
     *      (remember that the result will have been evaluated elsewhere for its precision)
     *  SetAwardLevel   a function (up at the badge level) that returns the level of the badge.
     *      This typically depends on the lowest component score and the total points scored in the badge.
     */
    badgeStatus: {

        //  the Temperature badge

        temp: {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 10) {
                    out = 1;
                }
                this.level = out;
            },
            level: 0,
            name: "Temperature",
            scoreInBadge: 0,       //  total score for all results that have scored
            badgeComponents: [
                {
                    description: "low temperature (< 3500 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue < 3500);
                    }
                },
                {
                    description: "medium temperature (3500 K <= T < 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue >= 3500 && iResult.trueResultValue < 15000);
                    }
                },
                {
                    description: "high temperature ( >= 15000 K)",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "temp" && iResult.trueResultValue >= 15000);
                    }
                }
            ]
        },

        //  Radial Velocity badge.

        vel_r: {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 10) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Radial Velocity",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "radial velocity > 10",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "vel_r" && iResult.trueResultValue > 10);
                    }
                },
                {
                    description: "negative radial velocity",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "vel_r" && iResult.trueResultValue < 0);
                    }
                }

            ]
        },

        //  the position badge. Needs both x and y.

        position : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 0) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Astrometry",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "x position successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pos_x" && iResult.points > 0);
                    }
                },
                {
                    description: "y position successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pos_y" && iResult.points > 0);
                    }
                }

            ]

        },

        //  the proper motion (pm) badge. Needs both x and y.

        pm : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 0) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Proper Motion",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "proper motion in x successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pm_x" && iResult.points > 0);
                    }
                },
                {
                    description: "proper motion in y successful",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "pm_y" && iResult.points > 0);
                    }
                }
            ]
        },

        //  the parallax badge.

        parallax : {
            setAwardLevel: function( ) {
                var out = 0;
                if (stella.badges.lowestComponentPoints( this.badgeComponents) > 50) {
                    out = 1;
                }
                this.level = out;
            },
            level : 0,
            name : "Parallax",
            scoreInBadge : 0,
            badgeComponents : [
                {
                    description: "parallax greater than 20 microdegrees",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "parallax" && iResult.trueResultValue >= 20);
                    }
                },
                {
                    description: "parallax between 5 and 10 microdegrees",
                    points: 0,
                    relevantResult: null,
                    fitsInComponent: function (iResult) {
                        return (iResult.type === "parallax" && iResult.trueResultValue >= 5
                        && iResult.trueResultValue <= 10);
                    }
                }
            ]
        }

    },


    /**
     * An HTML report of the current badge status
     * @returns {string}
     */
    toHTML : function() {
        var out = "<h2>Badge Progress</h2>";
        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {
                var tStat = stella.badges.badgeStatus[iBadge];
                out += "<b>" + tStat.name + " </b>(" + tStat.scoreInBadge + " p total)</br>";
                out += (tStat.level > 0) ? "<b> LEVEL " + tStat.level + "</b><ul>" : "<ul>";

                tStat.badgeComponents.forEach(function (iBadgeComponent) {
                    out += "<li>" + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "</li>";
                });
                out += "</ul>"
            }
        }
        return out;
    },

    /**
     * a string (text) report of the current badge progress.
     * @returns {string}
     */
    toString: function () {

        var out = "\nNEW BADGE PROGRESS!\n";

        for (var iBadge in this.badgeStatus) {
            if (this.badgeStatus.hasOwnProperty(iBadge)) {
                var tStat = stella.badges.badgeStatus[iBadge];

                out += tStat.name + " (" + tStat.scoreInBadge + " p total)";
                out += (tStat.level > 0) ? " LEVEL " + tStat.level + "\n" : "\n";

                tStat.badgeComponents.forEach(function (iBadgeComponent) {
                    out += "    " + "(" + iBadgeComponent.points + ") " + iBadgeComponent.description + "\n";
                });
            }
        }
        return out;
    }
};