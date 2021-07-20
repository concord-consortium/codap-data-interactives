/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/18/18 9:03 PM
 *
 * Created by Tim Erickson on 8/18/18 9:03 PM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */


let nhanes = {
    state: null,
    whence: "concord",
    allAttributes: {},     //  object containing all Attributes (Attribute is a class), keyed by NAME.
    /**
     * An object whose keys are variable naames and whose value is an object...
     * ...whose keys are (numeric) values and whose values are the "decoded" strings for the values,
     *
     * e.g. { "sex" : { 1 : "Male", 2: Female}, ... }
     */
    decoder: {},
    ancestries: {},
    map: null,

    freshState: {
        sampleNumber: 1,
        minAge : null,
        maxAge : null
    },

    initialize: async function () {
        await nhanes.getAllAttributes();
        console.log("NHANES got " + Object.keys(this.allAttributes).length + " attributes from the db.");
        await nhanes.CODAPconnect.initialize(null);
        nhanes.ui.updateWholeUI();

        //      Make sure the correct tab panel comes to the front when the text link is clicked

        $('#linkToAttributePanel').click(
            () => {
                $('#tabs').tabs("option", "active", 1);     //  1 is the index of the attribute panel
            });
        $('#linkToCasesPanel').click(
            () => {
                $('#tabs').tabs("option", "active", 2);     //  2 is the index of the filter panel
            });

    },


    getAllAttributes: async function () {
        nhanes.decoder = await nhanes.DBconnect.getDBInfo("getDecoderInfo");
        // nhanes.ancestries = await nhanes.DBconnect.getDBInfo("getAncestries");
        const tAtts = await nhanes.DBconnect.getDBInfo("getAllAttributeInfo");
        //  console.log("the variables: " + JSON.stringify(tAtts));

        tAtts.forEach(a => {
            let tA = new Attribute(a);
            nhanes.allAttributes[tA.name] = tA;
        });

        $("#chooseAttributeDiv").html(nhanes.ui.makeBasicCheckboxesHTML());
    },

    attributeGroups : [
        {number : 1, name : "demog",    open : false, title : "Demography"},
        {number : 2, name : "bmx",      open : false, title : "Body measurements"},
        {number : 3, name : "bp",       open : false, title : "Blood pressure"},
        {number : 4, name : "biochem",  open : false, title : "Biochemistry (bloodwork)"},
        {number : 5, name : "sexactivity",  open : false, title : "Sexual behavior (questionnaire)"}
    ],

placeOfBirth: {
        0: "",
        1: "Alabama/AL",
        2: "Alaska/AK",
        4: "Arizona/AZ",
        5: "Arkansas/AR",
        6: "California/CA",
        8: "Colorado/CO",
        9: "Connecticut/CT",
        10: "Delaware/DE",
        11: "District of Columbia/DC",
        12: "Florida/FL",
        13: "Georgia/GA",
        15: "Hawaii/HI",
        16: "Idaho/ID",
        17: "Illinois/IL",
        18: "Indiana/IN",
        19: "Iowa/IA",
        20: "Kansas/KS",
        21: "Kentucky/KY",
        22: "Louisiana/LA",
        23: "Maine/ME",
        24: "Maryland/MD",
        25: "Massachusetts/MA",
        26: "Michigan/MI",
        27: "Minnesota/MN",
        28: "Mississippi/MS",
        29: "Missouri/MO",
        30: "Montana/MT",
        31: "Nebraska/NE",
        32: "Nevada/NV",
        33: "New Hampshire/NH",
        34: "New Jersey/NJ",
        35: "New Mexico/NM",
        36: "New York/NY",
        37: "North Carolina/NC",
        38: "North Dakota/ND",
        39: "Ohio/OH",
        40: "Oklahoma/OK",
        41: "Oregon/OR",
        42: "Pennsylvania/PA",
        44: "Rhode Island/RI",
        45: "South Carolina/SC",
        46: "South Dakota/SD",
        47: "Tennessee/TN",
        48: "Texas/TX",
        49: "Utah/UT",
        50: "Vermont/VT",
        51: "Virginia/VA",
        53: "Washington/WA",
        54: "West Virginia/WV",
        55: "Wisconsin/WI",
        56: "Wyoming/WY",
        60: "American Samoa",
        66: "Guam",
        69: "Commonwealth of the Northern Mariana Islands",
        72: "Puerto Rico",
        78: "US Virgin Islands",
        100: "Albania",
        102: "Austria",
        103: "Belgium",
        104: "Bulgaria",
        105: "Czechoslovakia",
        106: "Denmark",
        108: "Finland",
        109: "France",
        110: "Germany",
        116: "Greece",
        117: "Hungary",
        118: "Iceland",
        119: "Ireland",
        120: "Italy",
        126: "Netherlands",
        127: "Norway",
        128: "Poland",
        129: "Portugal",
        130: "Azores Islands",
        132: "Romania",
        134: "Spain",
        136: "Sweden",
        137: "Switzerland",
        138: "United Kingdom, Not Specified",
        139: "England",
        140: "Scotland",
        147: "Yugoslavia",
        148: "Czech Republic",
        149: "Slovakia",
        150: "Bosnia and Herzegovina",
        151: "Croatia",
        152: "Macedonia",
        154: "Serbia",
        156: "Latvia",
        157: "Lithuania",
        158: "Armenia",
        159: "Azerbaijan",
        160: "Belarus",
        161: "Georgia",
        162: "Moldova",
        163: "Russia",
        164: "Ukraine",
        165: "USSR",
        166: "Europe",
        168: "Montenegro",
        169: "Other Europe, Not Specified",
        200: "Afghanistan",
        202: "Bangladesh",
        203: "Bhutan",
        205: "Myanmar",
        206: "Cambodia",
        207: "China",
        208: "Cyprus",
        209: "Hong Kong",
        210: "India",
        211: "Indonesia",
        212: "Iran",
        213: "Iraq",
        214: "Israel",
        215: "Japan",
        216: "Jordan",
        217: "Korea",
        218: "Kazakhstan",
        222: "Kuwait",
        223: "Laos",
        224: "Lebanon",
        226: "Malaysia",
        229: "Nepal",
        231: "Pakistan",
        233: "Philippines",
        235: "Saudi Arabia",
        236: "Singapore",
        238: "Sri Lanka",
        239: "Syria",
        240: "Taiwan",
        242: "Thailand",
        243: "Turkey",
        245: "United Arab Emirates",
        246: "Uzbekistan",
        247: "Vietnam",
        248: "Yemen",
        249: "Asia",
        251: "Eastern Asia",
        253: "South Central Asia, Not Specified",
        254: "Other Asia, Not Specified",
        300: "Bermuda",
        301: "Canada",
        303: "Mexico",
        310: "Belize",
        311: "Costa Rica",
        312: "El Salvador",
        313: "Guatemala",
        314: "Honduras",
        315: "Nicaragua",
        316: "Panama",
        321: "Antigua & Barbuda",
        323: "Bahamas",
        324: "Barbados",
        327: "Cuba",
        328: "Dominica",
        329: "Dominican Republic",
        330: "Grenada",
        332: "Haiti",
        333: "Jamaica",
        339: "St. Lucia",
        340: "St. Vincent & the Grenadines",
        341: "Trinidad & Tobago",
        343: "West Indies",
        344: "Caribbean, Not Specified",
        360: "Argentina",
        361: "Bolivia",
        362: "Brazil",
        363: "Chile",
        364: "Colombia",
        365: "Ecuador",
        368: "Guyana",
        369: "Paraguay",
        370: "Peru",
        372: "Uruguay",
        373: "Venezuela",
        374: "South America",
        399: "Americas, Not Specified",
        400: "Algeria",
        407: "Cameroon",
        408: "Cape Verde",
        412: "Congo",
        414: "Egypt",
        416: "Ethiopia",
        417: "Eritrea",
        420: "Gambia",
        421: "Ghana",
        423: "Guinea",
        427: "Kenya",
        429: "Liberia",
        430: "Libya",
        436: "Morocco",
        440: "Nigeria",
        444: "Senegal",
        447: "Sierra Leone",
        448: "Somalia",
        449: "South Africa",
        451: "Sudan",
        453: "Tanzania",
        454: "Togo",
        457: "Uganda",
        459: "Democratic Republic of Congo (Zaire)",
        460: "Zambia",
        461: "Zimbabwe",
        462: "Africa",
        463: "Eastern Africa, Not Specified",
        464: "Northern Africa, Not Specified",
        467: "Western Africa, Not Specified",
        468: "Other Africa, Not Specified",
        501: "Australia",
        508: "Fiji",
        511: "Marshall Islands",
        512: "Micronesia",
        515: "New Zealand",
        523: "Tonga",
        527: "Samoa",
        554: "Other US Island Areas, Oceania, Not Specified, or at Sea",
        555: "Other US Island Areas, Oceania, Not Specified, or at Sea"
    }
};