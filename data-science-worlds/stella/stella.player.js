/**
 * Created by tim on 10/8/16.


 ==========================================================================
 stella.player.js.js in gamePrototypes.

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

stella.player = {

    stellaScore : 0,        //  current "score"
    knownResults : null,
    institution : "International Astronomical Institute",
    name: "Dr Emiliano Markov",

    recordResultLocally : function( iStarResult ) {
        this.knownResults.push(iStarResult);
        if (iStarResult.eligibleForBadge()) {
            stella.badges.checkNewResultForBadgeProgress(iStarResult);
        }
    },

    initialize : function() {
        this.badges = [];
        this.knownResults = [];
    }
};