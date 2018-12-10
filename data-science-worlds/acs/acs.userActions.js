/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:07 AM
 *
 * Created by Tim Erickson on 8/21/18 9:07 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */

acs.userActions = {

    pressGetCasesButton : async function() {
        console.log("get cases!");
        let oData = [];
        let tData = await acs.DBconnect.getCasesFromDB(acs.ui.getArrayOfChosenAttributes());

        //  okay, tData is an Array of objects whose keys are the variable names.
        //  now we have to translate names and values...

        tData.forEach( c => {
            //  c is a case object
            let o = { sample : acs.state.sampleNumber };
            for (let key in c) {
                if (c.hasOwnProperty(key)) {
                    const tAtt = acs.allAttributes[key];    //  the Attribute
                    const tValue = tAtt.decodeValue( c[key]);
                    o[tAtt.title] = tValue;
                }
            }
            oData.push(o);
        });

        //     make sure the case table is showing

        await acs.CODAPconnect.makeCaseTableAppear();

        //  console.log("the cases: " + JSON.stringify(oData));

        acs.CODAPconnect.saveCasesToCODAP( oData );
        acs.state.sampleNumber++;
    },

    changeAttributeCheckbox : function(iAttName) {
        const tAtt = acs.allAttributes[iAttName];

        tAtt.chosen = !tAtt.chosen;
        acs.ui.updateWholeUI();
    },

    clickMakeMapButton : async function() {
        const thePUMA = Number(document.getElementById("pumaNumberBox").value);
        const latlong = await acs.DBconnect.getLatLon( thePUMA );

        if (latlong) {
            console.log("latlon received: " + JSON.stringify(latlong));
            const googleLatLong = new google.maps.LatLng(latlong.lat, latlong.long);
            acs.map.setCenter(googleLatLong);
            const marker = new google.maps.Marker({
                position: googleLatLong,
                map: acs.map
            });
        } else {
            console.log('Perhaps ' + thePUMA + ' is not a real PUMA?');
        }

    }

};