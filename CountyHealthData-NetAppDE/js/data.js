// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2021 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
const STATE_POPULATION_DATA =
    [
      {
        "State or territory": "Alabama",
        "USPS Code": "AL",
        "FIPS": "1",
        "Population": "4779736"
      },
      {
        "State or territory": "Alaska",
        "USPS Code": "AK",
        "FIPS": "2",
        "Population": "710231"
      },
      {
        "State or territory": "American Samoa",
        "USPS Code": "AS",
        "FIPS": "60",
        "Population": "55519"
      },
      {
        "State or territory": "Arizona",
        "USPS Code": "AZ",
        "FIPS": "4",
        "Population": "6392017"
      },
      {
        "State or territory": "Arkansas",
        "USPS Code": "AR",
        "FIPS": "5",
        "Population": "2915918"
      },
      {
        "State or territory": "California",
        "USPS Code": "CA",
        "FIPS": "6",
        "Population": "37253956"
      },
      {
        "State or territory": "Colorado",
        "USPS Code": "CO",
        "FIPS": "8",
        "Population": "5029196"
      },
      {
        "State or territory": "Connecticut",
        "USPS Code": "CT",
        "FIPS": "9",
        "Population": "3574097"
      },
      {
        "State or territory": "Delaware",
        "USPS Code": "DE",
        "FIPS": "10",
        "Population": "897934"
      },
      {
        "State or territory": "District of Columbia",
        "USPS Code": "DC",
        "FIPS": "11",
        "Population": "601723"
      },
      {
        "State or territory": "Florida",
        "USPS Code": "FL",
        "FIPS": "12",
        "Population": "18801310"
      },
      {
        "State or territory": "Georgia",
        "USPS Code": "GA",
        "FIPS": "13",
        "Population": "9687653"
      },
      {
        "State or territory": "Guam",
        "USPS Code": "GU",
        "FIPS": "66",
        "Population": "159358"
      },
      {
        "State or territory": "Hawaii",
        "USPS Code": "HI",
        "FIPS": "15",
        "Population": "1360301"
      },
      {
        "State or territory": "Idaho",
        "USPS Code": "ID",
        "FIPS": "16",
        "Population": "1567582"
      },
      {
        "State or territory": "Illinois",
        "USPS Code": "IL",
        "FIPS": "17",
        "Population": "12830632"
      },
      {
        "State or territory": "Indiana",
        "USPS Code": "IN",
        "FIPS": "18",
        "Population": "6483802"
      },
      {
        "State or territory": "Iowa",
        "USPS Code": "IA",
        "FIPS": "19",
        "Population": "3046355"
      },
      {
        "State or territory": "Kansas",
        "USPS Code": "KS",
        "FIPS": "20",
        "Population": "2853118"
      },
      {
        "State or territory": "Kentucky",
        "USPS Code": "KY",
        "FIPS": "21",
        "Population": "4339367"
      },
      {
        "State or territory": "Louisiana",
        "USPS Code": "LA",
        "FIPS": "22",
        "Population": "4533372"
      },
      {
        "State or territory": "Maine",
        "USPS Code": "ME",
        "FIPS": "23",
        "Population": "1328361"
      },
      {
        "State or territory": "Maryland",
        "USPS Code": "MD",
        "FIPS": "24",
        "Population": "5773552"
      },
      {
        "State or territory": "Massachusetts",
        "USPS Code": "MA",
        "FIPS": "25",
        "Population": "6547629"
      },
      {
        "State or territory": "Michigan",
        "USPS Code": "MI",
        "FIPS": "26",
        "Population": "9883640"
      },
      {
        "State or territory": "Minnesota",
        "USPS Code": "MN",
        "FIPS": "27",
        "Population": "5303925"
      },
      {
        "State or territory": "Mississippi",
        "USPS Code": "MS",
        "FIPS": "28",
        "Population": "2967297"
      },
      {
        "State or territory": "Missouri",
        "USPS Code": "MO",
        "FIPS": "29",
        "Population": "5988927"
      },
      {
        "State or territory": "Montana",
        "USPS Code": "MT",
        "FIPS": "30",
        "Population": "989415"
      },
      {
        "State or territory": "Nebraska",
        "USPS Code": "NE",
        "FIPS": "31",
        "Population": "1826341"
      },
      {
        "State or territory": "Nevada",
        "USPS Code": "NV",
        "FIPS": "32",
        "Population": "2700551"
      },
      {
        "State or territory": "New Hampshire",
        "USPS Code": "NH",
        "FIPS": "33",
        "Population": "1316470"
      },
      {
        "State or territory": "New Jersey",
        "USPS Code": "NJ",
        "FIPS": "34",
        "Population": "8791894"
      },
      {
        "State or territory": "New Mexico",
        "USPS Code": "NM",
        "FIPS": "35",
        "Population": "2059179"
      },
      {
        "State or territory": "New York",
        "USPS Code": "NY",
        "FIPS": "36",
        "Population": "19378102"
      },
      {
        "State or territory": "North Carolina",
        "USPS Code": "NC",
        "FIPS": "37",
        "Population": "9535483"
      },
      {
        "State or territory": "North Dakota",
        "USPS Code": "ND",
        "FIPS": "38",
        "Population": "672591"
      },
      {
        "State or territory": "Northern Mariana Islands",
        "USPS Code": "MP",
        "FIPS": "69",
        "Population": "53883"
      },
      {
        "State or territory": "Ohio",
        "USPS Code": "OH",
        "FIPS": "39",
        "Population": "11536504"
      },
      {
        "State or territory": "Oklahoma",
        "USPS Code": "OK",
        "FIPS": "40",
        "Population": "3751351"
      },
      {
        "State or territory": "Oregon",
        "USPS Code": "OR",
        "FIPS": "41",
        "Population": "3831074"
      },
      {
        "State or territory": "Pennsylvania",
        "USPS Code": "PA",
        "FIPS": "42",
        "Population": "12702379"
      },
      {
        "State or territory": "Puerto Rico",
        "USPS Code": "PR",
        "FIPS": "72",
        "Population": "3725789"
      },
      {
        "State or territory": "Rhode Island",
        "USPS Code": "RI",
        "FIPS": "44",
        "Population": "1052567"
      },
      {
        "State or territory": "South Carolina",
        "USPS Code": "SC",
        "FIPS": "45",
        "Population": "4625364"
      },
      {
        "State or territory": "South Dakota",
        "USPS Code": "SD",
        "FIPS": "46",
        "Population": "814180"
      },
      {
        "State or territory": "Tennessee",
        "USPS Code": "TN",
        "FIPS": "47",
        "Population": "6346105"
      },
      {
        "State or territory": "Texas",
        "USPS Code": "TX",
        "FIPS": "48",
        "Population": "25145561"
      },
      {
        "State or territory": "U.S. Virgin Islands",
        "USPS Code": "VI",
        "FIPS": "78",
        "Population": "106405"
      },
      {
        "State or territory": "Utah",
        "USPS Code": "UT",
        "FIPS": "49",
        "Population": "2763885"
      },
      {
        "State or territory": "Vermont",
        "USPS Code": "VT",
        "FIPS": "50",
        "Population": "625741"
      },
      {
        "State or territory": "Virginia",
        "USPS Code": "VA",
        "FIPS": "51",
        "Population": "8001024"
      },
      {
        "State or territory": "Washington",
        "USPS Code": "WA",
        "FIPS": "53",
        "Population": "6724540"
      },
      {
        "State or territory": "West Virginia",
        "USPS Code": "WV",
        "FIPS": "54",
        "Population": "1852994"
      },
      {
        "State or territory": "Wisconsin",
        "USPS Code": "WI",
        "FIPS": "55",
        "Population": "5686986"
      },
      {
        "State or territory": "Wyoming",
        "USPS Code": "WY",
        "FIPS": "56",
        "Population": "563626"
      }
    ];

const COUNTY_POPULATION_DATA =
    [
      {
        "STATE": "01",
        "COUNTY": "000",
        "STNAME": "Alabama",
        "CTYNAME": "Alabama",
        "POPESTIMATE2019": "4903185"
      },
      {
        "STATE": "01",
        "COUNTY": "001",
        "STNAME": "Alabama",
        "CTYNAME": "Autauga County",
        "POPESTIMATE2019": "55869"
      },
      {
        "STATE": "01",
        "COUNTY": "003",
        "STNAME": "Alabama",
        "CTYNAME": "Baldwin County",
        "POPESTIMATE2019": "223234"
      },
      {
        "STATE": "01",
        "COUNTY": "005",
        "STNAME": "Alabama",
        "CTYNAME": "Barbour County",
        "POPESTIMATE2019": "24686"
      },
      {
        "STATE": "01",
        "COUNTY": "007",
        "STNAME": "Alabama",
        "CTYNAME": "Bibb County",
        "POPESTIMATE2019": "22394"
      },
      {
        "STATE": "01",
        "COUNTY": "009",
        "STNAME": "Alabama",
        "CTYNAME": "Blount County",
        "POPESTIMATE2019": "57826"
      },
      {
        "STATE": "01",
        "COUNTY": "011",
        "STNAME": "Alabama",
        "CTYNAME": "Bullock County",
        "POPESTIMATE2019": "10101"
      },
      {
        "STATE": "01",
        "COUNTY": "013",
        "STNAME": "Alabama",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "19448"
      },
      {
        "STATE": "01",
        "COUNTY": "015",
        "STNAME": "Alabama",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "113605"
      },
      {
        "STATE": "01",
        "COUNTY": "017",
        "STNAME": "Alabama",
        "CTYNAME": "Chambers County",
        "POPESTIMATE2019": "33254"
      },
      {
        "STATE": "01",
        "COUNTY": "019",
        "STNAME": "Alabama",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "26196"
      },
      {
        "STATE": "01",
        "COUNTY": "021",
        "STNAME": "Alabama",
        "CTYNAME": "Chilton County",
        "POPESTIMATE2019": "44428"
      },
      {
        "STATE": "01",
        "COUNTY": "023",
        "STNAME": "Alabama",
        "CTYNAME": "Choctaw County",
        "POPESTIMATE2019": "12589"
      },
      {
        "STATE": "01",
        "COUNTY": "025",
        "STNAME": "Alabama",
        "CTYNAME": "Clarke County",
        "POPESTIMATE2019": "23622"
      },
      {
        "STATE": "01",
        "COUNTY": "027",
        "STNAME": "Alabama",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "13235"
      },
      {
        "STATE": "01",
        "COUNTY": "029",
        "STNAME": "Alabama",
        "CTYNAME": "Cleburne County",
        "POPESTIMATE2019": "14910"
      },
      {
        "STATE": "01",
        "COUNTY": "031",
        "STNAME": "Alabama",
        "CTYNAME": "Coffee County",
        "POPESTIMATE2019": "52342"
      },
      {
        "STATE": "01",
        "COUNTY": "033",
        "STNAME": "Alabama",
        "CTYNAME": "Colbert County",
        "POPESTIMATE2019": "55241"
      },
      {
        "STATE": "01",
        "COUNTY": "035",
        "STNAME": "Alabama",
        "CTYNAME": "Conecuh County",
        "POPESTIMATE2019": "12067"
      },
      {
        "STATE": "01",
        "COUNTY": "037",
        "STNAME": "Alabama",
        "CTYNAME": "Coosa County",
        "POPESTIMATE2019": "10663"
      },
      {
        "STATE": "01",
        "COUNTY": "039",
        "STNAME": "Alabama",
        "CTYNAME": "Covington County",
        "POPESTIMATE2019": "37049"
      },
      {
        "STATE": "01",
        "COUNTY": "041",
        "STNAME": "Alabama",
        "CTYNAME": "Crenshaw County",
        "POPESTIMATE2019": "13772"
      },
      {
        "STATE": "01",
        "COUNTY": "043",
        "STNAME": "Alabama",
        "CTYNAME": "Cullman County",
        "POPESTIMATE2019": "83768"
      },
      {
        "STATE": "01",
        "COUNTY": "045",
        "STNAME": "Alabama",
        "CTYNAME": "Dale County",
        "POPESTIMATE2019": "49172"
      },
      {
        "STATE": "01",
        "COUNTY": "047",
        "STNAME": "Alabama",
        "CTYNAME": "Dallas County",
        "POPESTIMATE2019": "37196"
      },
      {
        "STATE": "01",
        "COUNTY": "049",
        "STNAME": "Alabama",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "71513"
      },
      {
        "STATE": "01",
        "COUNTY": "051",
        "STNAME": "Alabama",
        "CTYNAME": "Elmore County",
        "POPESTIMATE2019": "81209"
      },
      {
        "STATE": "01",
        "COUNTY": "053",
        "STNAME": "Alabama",
        "CTYNAME": "Escambia County",
        "POPESTIMATE2019": "36633"
      },
      {
        "STATE": "01",
        "COUNTY": "055",
        "STNAME": "Alabama",
        "CTYNAME": "Etowah County",
        "POPESTIMATE2019": "102268"
      },
      {
        "STATE": "01",
        "COUNTY": "057",
        "STNAME": "Alabama",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "16302"
      },
      {
        "STATE": "01",
        "COUNTY": "059",
        "STNAME": "Alabama",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "31362"
      },
      {
        "STATE": "01",
        "COUNTY": "061",
        "STNAME": "Alabama",
        "CTYNAME": "Geneva County",
        "POPESTIMATE2019": "26271"
      },
      {
        "STATE": "01",
        "COUNTY": "063",
        "STNAME": "Alabama",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "8111"
      },
      {
        "STATE": "01",
        "COUNTY": "065",
        "STNAME": "Alabama",
        "CTYNAME": "Hale County",
        "POPESTIMATE2019": "14651"
      },
      {
        "STATE": "01",
        "COUNTY": "067",
        "STNAME": "Alabama",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "17205"
      },
      {
        "STATE": "01",
        "COUNTY": "069",
        "STNAME": "Alabama",
        "CTYNAME": "Houston County",
        "POPESTIMATE2019": "105882"
      },
      {
        "STATE": "01",
        "COUNTY": "071",
        "STNAME": "Alabama",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "51626"
      },
      {
        "STATE": "01",
        "COUNTY": "073",
        "STNAME": "Alabama",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "658573"
      },
      {
        "STATE": "01",
        "COUNTY": "075",
        "STNAME": "Alabama",
        "CTYNAME": "Lamar County",
        "POPESTIMATE2019": "13805"
      },
      {
        "STATE": "01",
        "COUNTY": "077",
        "STNAME": "Alabama",
        "CTYNAME": "Lauderdale County",
        "POPESTIMATE2019": "92729"
      },
      {
        "STATE": "01",
        "COUNTY": "079",
        "STNAME": "Alabama",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "32924"
      },
      {
        "STATE": "01",
        "COUNTY": "081",
        "STNAME": "Alabama",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "164542"
      },
      {
        "STATE": "01",
        "COUNTY": "083",
        "STNAME": "Alabama",
        "CTYNAME": "Limestone County",
        "POPESTIMATE2019": "98915"
      },
      {
        "STATE": "01",
        "COUNTY": "085",
        "STNAME": "Alabama",
        "CTYNAME": "Lowndes County",
        "POPESTIMATE2019": "9726"
      },
      {
        "STATE": "01",
        "COUNTY": "087",
        "STNAME": "Alabama",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "18068"
      },
      {
        "STATE": "01",
        "COUNTY": "089",
        "STNAME": "Alabama",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "372909"
      },
      {
        "STATE": "01",
        "COUNTY": "091",
        "STNAME": "Alabama",
        "CTYNAME": "Marengo County",
        "POPESTIMATE2019": "18863"
      },
      {
        "STATE": "01",
        "COUNTY": "093",
        "STNAME": "Alabama",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "29709"
      },
      {
        "STATE": "01",
        "COUNTY": "095",
        "STNAME": "Alabama",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "96774"
      },
      {
        "STATE": "01",
        "COUNTY": "097",
        "STNAME": "Alabama",
        "CTYNAME": "Mobile County",
        "POPESTIMATE2019": "413210"
      },
      {
        "STATE": "01",
        "COUNTY": "099",
        "STNAME": "Alabama",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "20733"
      },
      {
        "STATE": "01",
        "COUNTY": "101",
        "STNAME": "Alabama",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "226486"
      },
      {
        "STATE": "01",
        "COUNTY": "103",
        "STNAME": "Alabama",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "119679"
      },
      {
        "STATE": "01",
        "COUNTY": "105",
        "STNAME": "Alabama",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "8923"
      },
      {
        "STATE": "01",
        "COUNTY": "107",
        "STNAME": "Alabama",
        "CTYNAME": "Pickens County",
        "POPESTIMATE2019": "19930"
      },
      {
        "STATE": "01",
        "COUNTY": "109",
        "STNAME": "Alabama",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "33114"
      },
      {
        "STATE": "01",
        "COUNTY": "111",
        "STNAME": "Alabama",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "22722"
      },
      {
        "STATE": "01",
        "COUNTY": "113",
        "STNAME": "Alabama",
        "CTYNAME": "Russell County",
        "POPESTIMATE2019": "57961"
      },
      {
        "STATE": "01",
        "COUNTY": "115",
        "STNAME": "Alabama",
        "CTYNAME": "St. Clair County",
        "POPESTIMATE2019": "89512"
      },
      {
        "STATE": "01",
        "COUNTY": "117",
        "STNAME": "Alabama",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "217702"
      },
      {
        "STATE": "01",
        "COUNTY": "119",
        "STNAME": "Alabama",
        "CTYNAME": "Sumter County",
        "POPESTIMATE2019": "12427"
      },
      {
        "STATE": "01",
        "COUNTY": "121",
        "STNAME": "Alabama",
        "CTYNAME": "Talladega County",
        "POPESTIMATE2019": "79978"
      },
      {
        "STATE": "01",
        "COUNTY": "123",
        "STNAME": "Alabama",
        "CTYNAME": "Tallapoosa County",
        "POPESTIMATE2019": "40367"
      },
      {
        "STATE": "01",
        "COUNTY": "125",
        "STNAME": "Alabama",
        "CTYNAME": "Tuscaloosa County",
        "POPESTIMATE2019": "209355"
      },
      {
        "STATE": "01",
        "COUNTY": "127",
        "STNAME": "Alabama",
        "CTYNAME": "Walker County",
        "POPESTIMATE2019": "63521"
      },
      {
        "STATE": "01",
        "COUNTY": "129",
        "STNAME": "Alabama",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "16326"
      },
      {
        "STATE": "01",
        "COUNTY": "131",
        "STNAME": "Alabama",
        "CTYNAME": "Wilcox County",
        "POPESTIMATE2019": "10373"
      },
      {
        "STATE": "01",
        "COUNTY": "133",
        "STNAME": "Alabama",
        "CTYNAME": "Winston County",
        "POPESTIMATE2019": "23629"
      },
      {
        "STATE": "02",
        "COUNTY": "000",
        "STNAME": "Alaska",
        "CTYNAME": "Alaska",
        "POPESTIMATE2019": "731545"
      },
      {
        "STATE": "02",
        "COUNTY": "013",
        "STNAME": "Alaska",
        "CTYNAME": "Aleutians East Borough",
        "POPESTIMATE2019": "3337"
      },
      {
        "STATE": "02",
        "COUNTY": "016",
        "STNAME": "Alaska",
        "CTYNAME": "Aleutians West Census Area",
        "POPESTIMATE2019": "5634"
      },
      {
        "STATE": "02",
        "COUNTY": "020",
        "STNAME": "Alaska",
        "CTYNAME": "Anchorage Municipality",
        "POPESTIMATE2019": "288000"
      },
      {
        "STATE": "02",
        "COUNTY": "050",
        "STNAME": "Alaska",
        "CTYNAME": "Bethel Census Area",
        "POPESTIMATE2019": "18386"
      },
      {
        "STATE": "02",
        "COUNTY": "060",
        "STNAME": "Alaska",
        "CTYNAME": "Bristol Bay Borough",
        "POPESTIMATE2019": "836"
      },
      {
        "STATE": "02",
        "COUNTY": "068",
        "STNAME": "Alaska",
        "CTYNAME": "Denali Borough",
        "POPESTIMATE2019": "2097"
      },
      {
        "STATE": "02",
        "COUNTY": "070",
        "STNAME": "Alaska",
        "CTYNAME": "Dillingham Census Area",
        "POPESTIMATE2019": "4916"
      },
      {
        "STATE": "02",
        "COUNTY": "090",
        "STNAME": "Alaska",
        "CTYNAME": "Fairbanks North Star Borough",
        "POPESTIMATE2019": "96849"
      },
      {
        "STATE": "02",
        "COUNTY": "100",
        "STNAME": "Alaska",
        "CTYNAME": "Haines Borough",
        "POPESTIMATE2019": "2530"
      },
      {
        "STATE": "02",
        "COUNTY": "105",
        "STNAME": "Alaska",
        "CTYNAME": "Hoonah-Angoon Census Area",
        "POPESTIMATE2019": "2148"
      },
      {
        "STATE": "02",
        "COUNTY": "110",
        "STNAME": "Alaska",
        "CTYNAME": "Juneau City and Borough",
        "POPESTIMATE2019": "31974"
      },
      {
        "STATE": "02",
        "COUNTY": "122",
        "STNAME": "Alaska",
        "CTYNAME": "Kenai Peninsula Borough",
        "POPESTIMATE2019": "58708"
      },
      {
        "STATE": "02",
        "COUNTY": "130",
        "STNAME": "Alaska",
        "CTYNAME": "Ketchikan Gateway Borough",
        "POPESTIMATE2019": "13901"
      },
      {
        "STATE": "02",
        "COUNTY": "150",
        "STNAME": "Alaska",
        "CTYNAME": "Kodiak Island Borough",
        "POPESTIMATE2019": "12998"
      },
      {
        "STATE": "02",
        "COUNTY": "158",
        "STNAME": "Alaska",
        "CTYNAME": "Kusilvak Census Area",
        "POPESTIMATE2019": "8314"
      },
      {
        "STATE": "02",
        "COUNTY": "164",
        "STNAME": "Alaska",
        "CTYNAME": "Lake and Peninsula Borough",
        "POPESTIMATE2019": "1592"
      },
      {
        "STATE": "02",
        "COUNTY": "170",
        "STNAME": "Alaska",
        "CTYNAME": "Matanuska-Susitna Borough",
        "POPESTIMATE2019": "108317"
      },
      {
        "STATE": "02",
        "COUNTY": "180",
        "STNAME": "Alaska",
        "CTYNAME": "Nome Census Area",
        "POPESTIMATE2019": "10004"
      },
      {
        "STATE": "02",
        "COUNTY": "185",
        "STNAME": "Alaska",
        "CTYNAME": "North Slope Borough",
        "POPESTIMATE2019": "9832"
      },
      {
        "STATE": "02",
        "COUNTY": "188",
        "STNAME": "Alaska",
        "CTYNAME": "Northwest Arctic Borough",
        "POPESTIMATE2019": "7621"
      },
      {
        "STATE": "02",
        "COUNTY": "195",
        "STNAME": "Alaska",
        "CTYNAME": "Petersburg Borough",
        "POPESTIMATE2019": "3266"
      },
      {
        "STATE": "02",
        "COUNTY": "198",
        "STNAME": "Alaska",
        "CTYNAME": "Prince of Wales-Hyder Census Area",
        "POPESTIMATE2019": "6203"
      },
      {
        "STATE": "02",
        "COUNTY": "220",
        "STNAME": "Alaska",
        "CTYNAME": "Sitka City and Borough",
        "POPESTIMATE2019": "8493"
      },
      {
        "STATE": "02",
        "COUNTY": "230",
        "STNAME": "Alaska",
        "CTYNAME": "Skagway Municipality",
        "POPESTIMATE2019": "1183"
      },
      {
        "STATE": "02",
        "COUNTY": "240",
        "STNAME": "Alaska",
        "CTYNAME": "Southeast Fairbanks Census Area",
        "POPESTIMATE2019": "6893"
      },
      {
        "STATE": "02",
        "COUNTY": "261",
        "STNAME": "Alaska",
        "CTYNAME": "Valdez-Cordova Census Area",
        "POPESTIMATE2019": "9202"
      },
      {
        "STATE": "02",
        "COUNTY": "275",
        "STNAME": "Alaska",
        "CTYNAME": "Wrangell City and Borough",
        "POPESTIMATE2019": "2502"
      },
      {
        "STATE": "02",
        "COUNTY": "282",
        "STNAME": "Alaska",
        "CTYNAME": "Yakutat City and Borough",
        "POPESTIMATE2019": "579"
      },
      {
        "STATE": "02",
        "COUNTY": "290",
        "STNAME": "Alaska",
        "CTYNAME": "Yukon-Koyukuk Census Area",
        "POPESTIMATE2019": "5230"
      },
      {
        "STATE": "04",
        "COUNTY": "000",
        "STNAME": "Arizona",
        "CTYNAME": "Arizona",
        "POPESTIMATE2019": "7278717"
      },
      {
        "STATE": "04",
        "COUNTY": "001",
        "STNAME": "Arizona",
        "CTYNAME": "Apache County",
        "POPESTIMATE2019": "71887"
      },
      {
        "STATE": "04",
        "COUNTY": "003",
        "STNAME": "Arizona",
        "CTYNAME": "Cochise County",
        "POPESTIMATE2019": "125922"
      },
      {
        "STATE": "04",
        "COUNTY": "005",
        "STNAME": "Arizona",
        "CTYNAME": "Coconino County",
        "POPESTIMATE2019": "143476"
      },
      {
        "STATE": "04",
        "COUNTY": "007",
        "STNAME": "Arizona",
        "CTYNAME": "Gila County",
        "POPESTIMATE2019": "54018"
      },
      {
        "STATE": "04",
        "COUNTY": "009",
        "STNAME": "Arizona",
        "CTYNAME": "Graham County",
        "POPESTIMATE2019": "38837"
      },
      {
        "STATE": "04",
        "COUNTY": "011",
        "STNAME": "Arizona",
        "CTYNAME": "Greenlee County",
        "POPESTIMATE2019": "9498"
      },
      {
        "STATE": "04",
        "COUNTY": "012",
        "STNAME": "Arizona",
        "CTYNAME": "La Paz County",
        "POPESTIMATE2019": "21108"
      },
      {
        "STATE": "04",
        "COUNTY": "013",
        "STNAME": "Arizona",
        "CTYNAME": "Maricopa County",
        "POPESTIMATE2019": "4485414"
      },
      {
        "STATE": "04",
        "COUNTY": "015",
        "STNAME": "Arizona",
        "CTYNAME": "Mohave County",
        "POPESTIMATE2019": "212181"
      },
      {
        "STATE": "04",
        "COUNTY": "017",
        "STNAME": "Arizona",
        "CTYNAME": "Navajo County",
        "POPESTIMATE2019": "110924"
      },
      {
        "STATE": "04",
        "COUNTY": "019",
        "STNAME": "Arizona",
        "CTYNAME": "Pima County",
        "POPESTIMATE2019": "1047279"
      },
      {
        "STATE": "04",
        "COUNTY": "021",
        "STNAME": "Arizona",
        "CTYNAME": "Pinal County",
        "POPESTIMATE2019": "462789"
      },
      {
        "STATE": "04",
        "COUNTY": "023",
        "STNAME": "Arizona",
        "CTYNAME": "Santa Cruz County",
        "POPESTIMATE2019": "46498"
      },
      {
        "STATE": "04",
        "COUNTY": "025",
        "STNAME": "Arizona",
        "CTYNAME": "Yavapai County",
        "POPESTIMATE2019": "235099"
      },
      {
        "STATE": "04",
        "COUNTY": "027",
        "STNAME": "Arizona",
        "CTYNAME": "Yuma County",
        "POPESTIMATE2019": "213787"
      },
      {
        "STATE": "05",
        "COUNTY": "000",
        "STNAME": "Arkansas",
        "CTYNAME": "Arkansas",
        "POPESTIMATE2019": "3017804"
      },
      {
        "STATE": "05",
        "COUNTY": "001",
        "STNAME": "Arkansas",
        "CTYNAME": "Arkansas County",
        "POPESTIMATE2019": "17486"
      },
      {
        "STATE": "05",
        "COUNTY": "003",
        "STNAME": "Arkansas",
        "CTYNAME": "Ashley County",
        "POPESTIMATE2019": "19657"
      },
      {
        "STATE": "05",
        "COUNTY": "005",
        "STNAME": "Arkansas",
        "CTYNAME": "Baxter County",
        "POPESTIMATE2019": "41932"
      },
      {
        "STATE": "05",
        "COUNTY": "007",
        "STNAME": "Arkansas",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "279141"
      },
      {
        "STATE": "05",
        "COUNTY": "009",
        "STNAME": "Arkansas",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "37432"
      },
      {
        "STATE": "05",
        "COUNTY": "011",
        "STNAME": "Arkansas",
        "CTYNAME": "Bradley County",
        "POPESTIMATE2019": "10763"
      },
      {
        "STATE": "05",
        "COUNTY": "013",
        "STNAME": "Arkansas",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "5189"
      },
      {
        "STATE": "05",
        "COUNTY": "015",
        "STNAME": "Arkansas",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "28380"
      },
      {
        "STATE": "05",
        "COUNTY": "017",
        "STNAME": "Arkansas",
        "CTYNAME": "Chicot County",
        "POPESTIMATE2019": "10118"
      },
      {
        "STATE": "05",
        "COUNTY": "019",
        "STNAME": "Arkansas",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "22320"
      },
      {
        "STATE": "05",
        "COUNTY": "021",
        "STNAME": "Arkansas",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "14551"
      },
      {
        "STATE": "05",
        "COUNTY": "023",
        "STNAME": "Arkansas",
        "CTYNAME": "Cleburne County",
        "POPESTIMATE2019": "24919"
      },
      {
        "STATE": "05",
        "COUNTY": "025",
        "STNAME": "Arkansas",
        "CTYNAME": "Cleveland County",
        "POPESTIMATE2019": "7956"
      },
      {
        "STATE": "05",
        "COUNTY": "027",
        "STNAME": "Arkansas",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "23457"
      },
      {
        "STATE": "05",
        "COUNTY": "029",
        "STNAME": "Arkansas",
        "CTYNAME": "Conway County",
        "POPESTIMATE2019": "20846"
      },
      {
        "STATE": "05",
        "COUNTY": "031",
        "STNAME": "Arkansas",
        "CTYNAME": "Craighead County",
        "POPESTIMATE2019": "110332"
      },
      {
        "STATE": "05",
        "COUNTY": "033",
        "STNAME": "Arkansas",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "63257"
      },
      {
        "STATE": "05",
        "COUNTY": "035",
        "STNAME": "Arkansas",
        "CTYNAME": "Crittenden County",
        "POPESTIMATE2019": "47955"
      },
      {
        "STATE": "05",
        "COUNTY": "037",
        "STNAME": "Arkansas",
        "CTYNAME": "Cross County",
        "POPESTIMATE2019": "16419"
      },
      {
        "STATE": "05",
        "COUNTY": "039",
        "STNAME": "Arkansas",
        "CTYNAME": "Dallas County",
        "POPESTIMATE2019": "7009"
      },
      {
        "STATE": "05",
        "COUNTY": "041",
        "STNAME": "Arkansas",
        "CTYNAME": "Desha County",
        "POPESTIMATE2019": "11361"
      },
      {
        "STATE": "05",
        "COUNTY": "043",
        "STNAME": "Arkansas",
        "CTYNAME": "Drew County",
        "POPESTIMATE2019": "18219"
      },
      {
        "STATE": "05",
        "COUNTY": "045",
        "STNAME": "Arkansas",
        "CTYNAME": "Faulkner County",
        "POPESTIMATE2019": "126007"
      },
      {
        "STATE": "05",
        "COUNTY": "047",
        "STNAME": "Arkansas",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "17715"
      },
      {
        "STATE": "05",
        "COUNTY": "049",
        "STNAME": "Arkansas",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "12477"
      },
      {
        "STATE": "05",
        "COUNTY": "051",
        "STNAME": "Arkansas",
        "CTYNAME": "Garland County",
        "POPESTIMATE2019": "99386"
      },
      {
        "STATE": "05",
        "COUNTY": "053",
        "STNAME": "Arkansas",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "18265"
      },
      {
        "STATE": "05",
        "COUNTY": "055",
        "STNAME": "Arkansas",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "45325"
      },
      {
        "STATE": "05",
        "COUNTY": "057",
        "STNAME": "Arkansas",
        "CTYNAME": "Hempstead County",
        "POPESTIMATE2019": "21532"
      },
      {
        "STATE": "05",
        "COUNTY": "059",
        "STNAME": "Arkansas",
        "CTYNAME": "Hot Spring County",
        "POPESTIMATE2019": "33771"
      },
      {
        "STATE": "05",
        "COUNTY": "061",
        "STNAME": "Arkansas",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "13202"
      },
      {
        "STATE": "05",
        "COUNTY": "063",
        "STNAME": "Arkansas",
        "CTYNAME": "Independence County",
        "POPESTIMATE2019": "37825"
      },
      {
        "STATE": "05",
        "COUNTY": "065",
        "STNAME": "Arkansas",
        "CTYNAME": "Izard County",
        "POPESTIMATE2019": "13629"
      },
      {
        "STATE": "05",
        "COUNTY": "067",
        "STNAME": "Arkansas",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "16719"
      },
      {
        "STATE": "05",
        "COUNTY": "069",
        "STNAME": "Arkansas",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "66824"
      },
      {
        "STATE": "05",
        "COUNTY": "071",
        "STNAME": "Arkansas",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "26578"
      },
      {
        "STATE": "05",
        "COUNTY": "073",
        "STNAME": "Arkansas",
        "CTYNAME": "Lafayette County",
        "POPESTIMATE2019": "6624"
      },
      {
        "STATE": "05",
        "COUNTY": "075",
        "STNAME": "Arkansas",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "16406"
      },
      {
        "STATE": "05",
        "COUNTY": "077",
        "STNAME": "Arkansas",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "8857"
      },
      {
        "STATE": "05",
        "COUNTY": "079",
        "STNAME": "Arkansas",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "13024"
      },
      {
        "STATE": "05",
        "COUNTY": "081",
        "STNAME": "Arkansas",
        "CTYNAME": "Little River County",
        "POPESTIMATE2019": "12259"
      },
      {
        "STATE": "05",
        "COUNTY": "083",
        "STNAME": "Arkansas",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "21466"
      },
      {
        "STATE": "05",
        "COUNTY": "085",
        "STNAME": "Arkansas",
        "CTYNAME": "Lonoke County",
        "POPESTIMATE2019": "73309"
      },
      {
        "STATE": "05",
        "COUNTY": "087",
        "STNAME": "Arkansas",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "16576"
      },
      {
        "STATE": "05",
        "COUNTY": "089",
        "STNAME": "Arkansas",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "16694"
      },
      {
        "STATE": "05",
        "COUNTY": "091",
        "STNAME": "Arkansas",
        "CTYNAME": "Miller County",
        "POPESTIMATE2019": "43257"
      },
      {
        "STATE": "05",
        "COUNTY": "093",
        "STNAME": "Arkansas",
        "CTYNAME": "Mississippi County",
        "POPESTIMATE2019": "40651"
      },
      {
        "STATE": "05",
        "COUNTY": "095",
        "STNAME": "Arkansas",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "6701"
      },
      {
        "STATE": "05",
        "COUNTY": "097",
        "STNAME": "Arkansas",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "8986"
      },
      {
        "STATE": "05",
        "COUNTY": "099",
        "STNAME": "Arkansas",
        "CTYNAME": "Nevada County",
        "POPESTIMATE2019": "8252"
      },
      {
        "STATE": "05",
        "COUNTY": "101",
        "STNAME": "Arkansas",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "7753"
      },
      {
        "STATE": "05",
        "COUNTY": "103",
        "STNAME": "Arkansas",
        "CTYNAME": "Ouachita County",
        "POPESTIMATE2019": "23382"
      },
      {
        "STATE": "05",
        "COUNTY": "105",
        "STNAME": "Arkansas",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "10455"
      },
      {
        "STATE": "05",
        "COUNTY": "107",
        "STNAME": "Arkansas",
        "CTYNAME": "Phillips County",
        "POPESTIMATE2019": "17782"
      },
      {
        "STATE": "05",
        "COUNTY": "109",
        "STNAME": "Arkansas",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "10718"
      },
      {
        "STATE": "05",
        "COUNTY": "111",
        "STNAME": "Arkansas",
        "CTYNAME": "Poinsett County",
        "POPESTIMATE2019": "23528"
      },
      {
        "STATE": "05",
        "COUNTY": "113",
        "STNAME": "Arkansas",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "19964"
      },
      {
        "STATE": "05",
        "COUNTY": "115",
        "STNAME": "Arkansas",
        "CTYNAME": "Pope County",
        "POPESTIMATE2019": "64072"
      },
      {
        "STATE": "05",
        "COUNTY": "117",
        "STNAME": "Arkansas",
        "CTYNAME": "Prairie County",
        "POPESTIMATE2019": "8062"
      },
      {
        "STATE": "05",
        "COUNTY": "119",
        "STNAME": "Arkansas",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "391911"
      },
      {
        "STATE": "05",
        "COUNTY": "121",
        "STNAME": "Arkansas",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "17958"
      },
      {
        "STATE": "05",
        "COUNTY": "123",
        "STNAME": "Arkansas",
        "CTYNAME": "St. Francis County",
        "POPESTIMATE2019": "24994"
      },
      {
        "STATE": "05",
        "COUNTY": "125",
        "STNAME": "Arkansas",
        "CTYNAME": "Saline County",
        "POPESTIMATE2019": "122437"
      },
      {
        "STATE": "05",
        "COUNTY": "127",
        "STNAME": "Arkansas",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "10281"
      },
      {
        "STATE": "05",
        "COUNTY": "129",
        "STNAME": "Arkansas",
        "CTYNAME": "Searcy County",
        "POPESTIMATE2019": "7881"
      },
      {
        "STATE": "05",
        "COUNTY": "131",
        "STNAME": "Arkansas",
        "CTYNAME": "Sebastian County",
        "POPESTIMATE2019": "127827"
      },
      {
        "STATE": "05",
        "COUNTY": "133",
        "STNAME": "Arkansas",
        "CTYNAME": "Sevier County",
        "POPESTIMATE2019": "17007"
      },
      {
        "STATE": "05",
        "COUNTY": "135",
        "STNAME": "Arkansas",
        "CTYNAME": "Sharp County",
        "POPESTIMATE2019": "17442"
      },
      {
        "STATE": "05",
        "COUNTY": "137",
        "STNAME": "Arkansas",
        "CTYNAME": "Stone County",
        "POPESTIMATE2019": "12506"
      },
      {
        "STATE": "05",
        "COUNTY": "139",
        "STNAME": "Arkansas",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "38682"
      },
      {
        "STATE": "05",
        "COUNTY": "141",
        "STNAME": "Arkansas",
        "CTYNAME": "Van Buren County",
        "POPESTIMATE2019": "16545"
      },
      {
        "STATE": "05",
        "COUNTY": "143",
        "STNAME": "Arkansas",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "239187"
      },
      {
        "STATE": "05",
        "COUNTY": "145",
        "STNAME": "Arkansas",
        "CTYNAME": "White County",
        "POPESTIMATE2019": "78753"
      },
      {
        "STATE": "05",
        "COUNTY": "147",
        "STNAME": "Arkansas",
        "CTYNAME": "Woodruff County",
        "POPESTIMATE2019": "6320"
      },
      {
        "STATE": "05",
        "COUNTY": "149",
        "STNAME": "Arkansas",
        "CTYNAME": "Yell County",
        "POPESTIMATE2019": "21341"
      },
      {
        "STATE": "06",
        "COUNTY": "000",
        "STNAME": "California",
        "CTYNAME": "California",
        "POPESTIMATE2019": "39512223"
      },
      {
        "STATE": "06",
        "COUNTY": "001",
        "STNAME": "California",
        "CTYNAME": "Alameda County",
        "POPESTIMATE2019": "1671329"
      },
      {
        "STATE": "06",
        "COUNTY": "003",
        "STNAME": "California",
        "CTYNAME": "Alpine County",
        "POPESTIMATE2019": "1129"
      },
      {
        "STATE": "06",
        "COUNTY": "005",
        "STNAME": "California",
        "CTYNAME": "Amador County",
        "POPESTIMATE2019": "39752"
      },
      {
        "STATE": "06",
        "COUNTY": "007",
        "STNAME": "California",
        "CTYNAME": "Butte County",
        "POPESTIMATE2019": "219186"
      },
      {
        "STATE": "06",
        "COUNTY": "009",
        "STNAME": "California",
        "CTYNAME": "Calaveras County",
        "POPESTIMATE2019": "45905"
      },
      {
        "STATE": "06",
        "COUNTY": "011",
        "STNAME": "California",
        "CTYNAME": "Colusa County",
        "POPESTIMATE2019": "21547"
      },
      {
        "STATE": "06",
        "COUNTY": "013",
        "STNAME": "California",
        "CTYNAME": "Contra Costa County",
        "POPESTIMATE2019": "1153526"
      },
      {
        "STATE": "06",
        "COUNTY": "015",
        "STNAME": "California",
        "CTYNAME": "Del Norte County",
        "POPESTIMATE2019": "27812"
      },
      {
        "STATE": "06",
        "COUNTY": "017",
        "STNAME": "California",
        "CTYNAME": "El Dorado County",
        "POPESTIMATE2019": "192843"
      },
      {
        "STATE": "06",
        "COUNTY": "019",
        "STNAME": "California",
        "CTYNAME": "Fresno County",
        "POPESTIMATE2019": "999101"
      },
      {
        "STATE": "06",
        "COUNTY": "021",
        "STNAME": "California",
        "CTYNAME": "Glenn County",
        "POPESTIMATE2019": "28393"
      },
      {
        "STATE": "06",
        "COUNTY": "023",
        "STNAME": "California",
        "CTYNAME": "Humboldt County",
        "POPESTIMATE2019": "135558"
      },
      {
        "STATE": "06",
        "COUNTY": "025",
        "STNAME": "California",
        "CTYNAME": "Imperial County",
        "POPESTIMATE2019": "181215"
      },
      {
        "STATE": "06",
        "COUNTY": "027",
        "STNAME": "California",
        "CTYNAME": "Inyo County",
        "POPESTIMATE2019": "18039"
      },
      {
        "STATE": "06",
        "COUNTY": "029",
        "STNAME": "California",
        "CTYNAME": "Kern County",
        "POPESTIMATE2019": "900202"
      },
      {
        "STATE": "06",
        "COUNTY": "031",
        "STNAME": "California",
        "CTYNAME": "Kings County",
        "POPESTIMATE2019": "152940"
      },
      {
        "STATE": "06",
        "COUNTY": "033",
        "STNAME": "California",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "64386"
      },
      {
        "STATE": "06",
        "COUNTY": "035",
        "STNAME": "California",
        "CTYNAME": "Lassen County",
        "POPESTIMATE2019": "30573"
      },
      {
        "STATE": "06",
        "COUNTY": "037",
        "STNAME": "California",
        "CTYNAME": "Los Angeles County",
        "POPESTIMATE2019": "10039107"
      },
      {
        "STATE": "06",
        "COUNTY": "039",
        "STNAME": "California",
        "CTYNAME": "Madera County",
        "POPESTIMATE2019": "157327"
      },
      {
        "STATE": "06",
        "COUNTY": "041",
        "STNAME": "California",
        "CTYNAME": "Marin County",
        "POPESTIMATE2019": "258826"
      },
      {
        "STATE": "06",
        "COUNTY": "043",
        "STNAME": "California",
        "CTYNAME": "Mariposa County",
        "POPESTIMATE2019": "17203"
      },
      {
        "STATE": "06",
        "COUNTY": "045",
        "STNAME": "California",
        "CTYNAME": "Mendocino County",
        "POPESTIMATE2019": "86749"
      },
      {
        "STATE": "06",
        "COUNTY": "047",
        "STNAME": "California",
        "CTYNAME": "Merced County",
        "POPESTIMATE2019": "277680"
      },
      {
        "STATE": "06",
        "COUNTY": "049",
        "STNAME": "California",
        "CTYNAME": "Modoc County",
        "POPESTIMATE2019": "8841"
      },
      {
        "STATE": "06",
        "COUNTY": "051",
        "STNAME": "California",
        "CTYNAME": "Mono County",
        "POPESTIMATE2019": "14444"
      },
      {
        "STATE": "06",
        "COUNTY": "053",
        "STNAME": "California",
        "CTYNAME": "Monterey County",
        "POPESTIMATE2019": "434061"
      },
      {
        "STATE": "06",
        "COUNTY": "055",
        "STNAME": "California",
        "CTYNAME": "Napa County",
        "POPESTIMATE2019": "137744"
      },
      {
        "STATE": "06",
        "COUNTY": "057",
        "STNAME": "California",
        "CTYNAME": "Nevada County",
        "POPESTIMATE2019": "99755"
      },
      {
        "STATE": "06",
        "COUNTY": "059",
        "STNAME": "California",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "3175692"
      },
      {
        "STATE": "06",
        "COUNTY": "061",
        "STNAME": "California",
        "CTYNAME": "Placer County",
        "POPESTIMATE2019": "398329"
      },
      {
        "STATE": "06",
        "COUNTY": "063",
        "STNAME": "California",
        "CTYNAME": "Plumas County",
        "POPESTIMATE2019": "18807"
      },
      {
        "STATE": "06",
        "COUNTY": "065",
        "STNAME": "California",
        "CTYNAME": "Riverside County",
        "POPESTIMATE2019": "2470546"
      },
      {
        "STATE": "06",
        "COUNTY": "067",
        "STNAME": "California",
        "CTYNAME": "Sacramento County",
        "POPESTIMATE2019": "1552058"
      },
      {
        "STATE": "06",
        "COUNTY": "069",
        "STNAME": "California",
        "CTYNAME": "San Benito County",
        "POPESTIMATE2019": "62808"
      },
      {
        "STATE": "06",
        "COUNTY": "071",
        "STNAME": "California",
        "CTYNAME": "San Bernardino County",
        "POPESTIMATE2019": "2180085"
      },
      {
        "STATE": "06",
        "COUNTY": "073",
        "STNAME": "California",
        "CTYNAME": "San Diego County",
        "POPESTIMATE2019": "3338330"
      },
      {
        "STATE": "06",
        "COUNTY": "075",
        "STNAME": "California",
        "CTYNAME": "San Francisco County",
        "POPESTIMATE2019": "881549"
      },
      {
        "STATE": "06",
        "COUNTY": "077",
        "STNAME": "California",
        "CTYNAME": "San Joaquin County",
        "POPESTIMATE2019": "762148"
      },
      {
        "STATE": "06",
        "COUNTY": "079",
        "STNAME": "California",
        "CTYNAME": "San Luis Obispo County",
        "POPESTIMATE2019": "283111"
      },
      {
        "STATE": "06",
        "COUNTY": "081",
        "STNAME": "California",
        "CTYNAME": "San Mateo County",
        "POPESTIMATE2019": "766573"
      },
      {
        "STATE": "06",
        "COUNTY": "083",
        "STNAME": "California",
        "CTYNAME": "Santa Barbara County",
        "POPESTIMATE2019": "446499"
      },
      {
        "STATE": "06",
        "COUNTY": "085",
        "STNAME": "California",
        "CTYNAME": "Santa Clara County",
        "POPESTIMATE2019": "1927852"
      },
      {
        "STATE": "06",
        "COUNTY": "087",
        "STNAME": "California",
        "CTYNAME": "Santa Cruz County",
        "POPESTIMATE2019": "273213"
      },
      {
        "STATE": "06",
        "COUNTY": "089",
        "STNAME": "California",
        "CTYNAME": "Shasta County",
        "POPESTIMATE2019": "180080"
      },
      {
        "STATE": "06",
        "COUNTY": "091",
        "STNAME": "California",
        "CTYNAME": "Sierra County",
        "POPESTIMATE2019": "3005"
      },
      {
        "STATE": "06",
        "COUNTY": "093",
        "STNAME": "California",
        "CTYNAME": "Siskiyou County",
        "POPESTIMATE2019": "43539"
      },
      {
        "STATE": "06",
        "COUNTY": "095",
        "STNAME": "California",
        "CTYNAME": "Solano County",
        "POPESTIMATE2019": "447643"
      },
      {
        "STATE": "06",
        "COUNTY": "097",
        "STNAME": "California",
        "CTYNAME": "Sonoma County",
        "POPESTIMATE2019": "494336"
      },
      {
        "STATE": "06",
        "COUNTY": "099",
        "STNAME": "California",
        "CTYNAME": "Stanislaus County",
        "POPESTIMATE2019": "550660"
      },
      {
        "STATE": "06",
        "COUNTY": "101",
        "STNAME": "California",
        "CTYNAME": "Sutter County",
        "POPESTIMATE2019": "96971"
      },
      {
        "STATE": "06",
        "COUNTY": "103",
        "STNAME": "California",
        "CTYNAME": "Tehama County",
        "POPESTIMATE2019": "65084"
      },
      {
        "STATE": "06",
        "COUNTY": "105",
        "STNAME": "California",
        "CTYNAME": "Trinity County",
        "POPESTIMATE2019": "12285"
      },
      {
        "STATE": "06",
        "COUNTY": "107",
        "STNAME": "California",
        "CTYNAME": "Tulare County",
        "POPESTIMATE2019": "466195"
      },
      {
        "STATE": "06",
        "COUNTY": "109",
        "STNAME": "California",
        "CTYNAME": "Tuolumne County",
        "POPESTIMATE2019": "54478"
      },
      {
        "STATE": "06",
        "COUNTY": "111",
        "STNAME": "California",
        "CTYNAME": "Ventura County",
        "POPESTIMATE2019": "846006"
      },
      {
        "STATE": "06",
        "COUNTY": "113",
        "STNAME": "California",
        "CTYNAME": "Yolo County",
        "POPESTIMATE2019": "220500"
      },
      {
        "STATE": "06",
        "COUNTY": "115",
        "STNAME": "California",
        "CTYNAME": "Yuba County",
        "POPESTIMATE2019": "78668"
      },
      {
        "STATE": "08",
        "COUNTY": "000",
        "STNAME": "Colorado",
        "CTYNAME": "Colorado",
        "POPESTIMATE2019": "5758736"
      },
      {
        "STATE": "08",
        "COUNTY": "001",
        "STNAME": "Colorado",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "517421"
      },
      {
        "STATE": "08",
        "COUNTY": "003",
        "STNAME": "Colorado",
        "CTYNAME": "Alamosa County",
        "POPESTIMATE2019": "16233"
      },
      {
        "STATE": "08",
        "COUNTY": "005",
        "STNAME": "Colorado",
        "CTYNAME": "Arapahoe County",
        "POPESTIMATE2019": "656590"
      },
      {
        "STATE": "08",
        "COUNTY": "007",
        "STNAME": "Colorado",
        "CTYNAME": "Archuleta County",
        "POPESTIMATE2019": "14029"
      },
      {
        "STATE": "08",
        "COUNTY": "009",
        "STNAME": "Colorado",
        "CTYNAME": "Baca County",
        "POPESTIMATE2019": "3581"
      },
      {
        "STATE": "08",
        "COUNTY": "011",
        "STNAME": "Colorado",
        "CTYNAME": "Bent County",
        "POPESTIMATE2019": "5577"
      },
      {
        "STATE": "08",
        "COUNTY": "013",
        "STNAME": "Colorado",
        "CTYNAME": "Boulder County",
        "POPESTIMATE2019": "326196"
      },
      {
        "STATE": "08",
        "COUNTY": "014",
        "STNAME": "Colorado",
        "CTYNAME": "Broomfield County",
        "POPESTIMATE2019": "70465"
      },
      {
        "STATE": "08",
        "COUNTY": "015",
        "STNAME": "Colorado",
        "CTYNAME": "Chaffee County",
        "POPESTIMATE2019": "20356"
      },
      {
        "STATE": "08",
        "COUNTY": "017",
        "STNAME": "Colorado",
        "CTYNAME": "Cheyenne County",
        "POPESTIMATE2019": "1831"
      },
      {
        "STATE": "08",
        "COUNTY": "019",
        "STNAME": "Colorado",
        "CTYNAME": "Clear Creek County",
        "POPESTIMATE2019": "9700"
      },
      {
        "STATE": "08",
        "COUNTY": "021",
        "STNAME": "Colorado",
        "CTYNAME": "Conejos County",
        "POPESTIMATE2019": "8205"
      },
      {
        "STATE": "08",
        "COUNTY": "023",
        "STNAME": "Colorado",
        "CTYNAME": "Costilla County",
        "POPESTIMATE2019": "3887"
      },
      {
        "STATE": "08",
        "COUNTY": "025",
        "STNAME": "Colorado",
        "CTYNAME": "Crowley County",
        "POPESTIMATE2019": "6061"
      },
      {
        "STATE": "08",
        "COUNTY": "027",
        "STNAME": "Colorado",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "5068"
      },
      {
        "STATE": "08",
        "COUNTY": "029",
        "STNAME": "Colorado",
        "CTYNAME": "Delta County",
        "POPESTIMATE2019": "31162"
      },
      {
        "STATE": "08",
        "COUNTY": "031",
        "STNAME": "Colorado",
        "CTYNAME": "Denver County",
        "POPESTIMATE2019": "727211"
      },
      {
        "STATE": "08",
        "COUNTY": "033",
        "STNAME": "Colorado",
        "CTYNAME": "Dolores County",
        "POPESTIMATE2019": "2055"
      },
      {
        "STATE": "08",
        "COUNTY": "035",
        "STNAME": "Colorado",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "351154"
      },
      {
        "STATE": "08",
        "COUNTY": "037",
        "STNAME": "Colorado",
        "CTYNAME": "Eagle County",
        "POPESTIMATE2019": "55127"
      },
      {
        "STATE": "08",
        "COUNTY": "039",
        "STNAME": "Colorado",
        "CTYNAME": "Elbert County",
        "POPESTIMATE2019": "26729"
      },
      {
        "STATE": "08",
        "COUNTY": "041",
        "STNAME": "Colorado",
        "CTYNAME": "El Paso County",
        "POPESTIMATE2019": "720403"
      },
      {
        "STATE": "08",
        "COUNTY": "043",
        "STNAME": "Colorado",
        "CTYNAME": "Fremont County",
        "POPESTIMATE2019": "47839"
      },
      {
        "STATE": "08",
        "COUNTY": "045",
        "STNAME": "Colorado",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "60061"
      },
      {
        "STATE": "08",
        "COUNTY": "047",
        "STNAME": "Colorado",
        "CTYNAME": "Gilpin County",
        "POPESTIMATE2019": "6243"
      },
      {
        "STATE": "08",
        "COUNTY": "049",
        "STNAME": "Colorado",
        "CTYNAME": "Grand County",
        "POPESTIMATE2019": "15734"
      },
      {
        "STATE": "08",
        "COUNTY": "051",
        "STNAME": "Colorado",
        "CTYNAME": "Gunnison County",
        "POPESTIMATE2019": "17462"
      },
      {
        "STATE": "08",
        "COUNTY": "053",
        "STNAME": "Colorado",
        "CTYNAME": "Hinsdale County",
        "POPESTIMATE2019": "820"
      },
      {
        "STATE": "08",
        "COUNTY": "055",
        "STNAME": "Colorado",
        "CTYNAME": "Huerfano County",
        "POPESTIMATE2019": "6897"
      },
      {
        "STATE": "08",
        "COUNTY": "057",
        "STNAME": "Colorado",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "1392"
      },
      {
        "STATE": "08",
        "COUNTY": "059",
        "STNAME": "Colorado",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "582881"
      },
      {
        "STATE": "08",
        "COUNTY": "061",
        "STNAME": "Colorado",
        "CTYNAME": "Kiowa County",
        "POPESTIMATE2019": "1406"
      },
      {
        "STATE": "08",
        "COUNTY": "063",
        "STNAME": "Colorado",
        "CTYNAME": "Kit Carson County",
        "POPESTIMATE2019": "7097"
      },
      {
        "STATE": "08",
        "COUNTY": "065",
        "STNAME": "Colorado",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "8127"
      },
      {
        "STATE": "08",
        "COUNTY": "067",
        "STNAME": "Colorado",
        "CTYNAME": "La Plata County",
        "POPESTIMATE2019": "56221"
      },
      {
        "STATE": "08",
        "COUNTY": "069",
        "STNAME": "Colorado",
        "CTYNAME": "Larimer County",
        "POPESTIMATE2019": "356899"
      },
      {
        "STATE": "08",
        "COUNTY": "071",
        "STNAME": "Colorado",
        "CTYNAME": "Las Animas County",
        "POPESTIMATE2019": "14506"
      },
      {
        "STATE": "08",
        "COUNTY": "073",
        "STNAME": "Colorado",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "5701"
      },
      {
        "STATE": "08",
        "COUNTY": "075",
        "STNAME": "Colorado",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "22409"
      },
      {
        "STATE": "08",
        "COUNTY": "077",
        "STNAME": "Colorado",
        "CTYNAME": "Mesa County",
        "POPESTIMATE2019": "154210"
      },
      {
        "STATE": "08",
        "COUNTY": "079",
        "STNAME": "Colorado",
        "CTYNAME": "Mineral County",
        "POPESTIMATE2019": "769"
      },
      {
        "STATE": "08",
        "COUNTY": "081",
        "STNAME": "Colorado",
        "CTYNAME": "Moffat County",
        "POPESTIMATE2019": "13283"
      },
      {
        "STATE": "08",
        "COUNTY": "083",
        "STNAME": "Colorado",
        "CTYNAME": "Montezuma County",
        "POPESTIMATE2019": "26183"
      },
      {
        "STATE": "08",
        "COUNTY": "085",
        "STNAME": "Colorado",
        "CTYNAME": "Montrose County",
        "POPESTIMATE2019": "42758"
      },
      {
        "STATE": "08",
        "COUNTY": "087",
        "STNAME": "Colorado",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "29068"
      },
      {
        "STATE": "08",
        "COUNTY": "089",
        "STNAME": "Colorado",
        "CTYNAME": "Otero County",
        "POPESTIMATE2019": "18278"
      },
      {
        "STATE": "08",
        "COUNTY": "091",
        "STNAME": "Colorado",
        "CTYNAME": "Ouray County",
        "POPESTIMATE2019": "4952"
      },
      {
        "STATE": "08",
        "COUNTY": "093",
        "STNAME": "Colorado",
        "CTYNAME": "Park County",
        "POPESTIMATE2019": "18845"
      },
      {
        "STATE": "08",
        "COUNTY": "095",
        "STNAME": "Colorado",
        "CTYNAME": "Phillips County",
        "POPESTIMATE2019": "4265"
      },
      {
        "STATE": "08",
        "COUNTY": "097",
        "STNAME": "Colorado",
        "CTYNAME": "Pitkin County",
        "POPESTIMATE2019": "17767"
      },
      {
        "STATE": "08",
        "COUNTY": "099",
        "STNAME": "Colorado",
        "CTYNAME": "Prowers County",
        "POPESTIMATE2019": "12172"
      },
      {
        "STATE": "08",
        "COUNTY": "101",
        "STNAME": "Colorado",
        "CTYNAME": "Pueblo County",
        "POPESTIMATE2019": "168424"
      },
      {
        "STATE": "08",
        "COUNTY": "103",
        "STNAME": "Colorado",
        "CTYNAME": "Rio Blanco County",
        "POPESTIMATE2019": "6324"
      },
      {
        "STATE": "08",
        "COUNTY": "105",
        "STNAME": "Colorado",
        "CTYNAME": "Rio Grande County",
        "POPESTIMATE2019": "11267"
      },
      {
        "STATE": "08",
        "COUNTY": "107",
        "STNAME": "Colorado",
        "CTYNAME": "Routt County",
        "POPESTIMATE2019": "25638"
      },
      {
        "STATE": "08",
        "COUNTY": "109",
        "STNAME": "Colorado",
        "CTYNAME": "Saguache County",
        "POPESTIMATE2019": "6824"
      },
      {
        "STATE": "08",
        "COUNTY": "111",
        "STNAME": "Colorado",
        "CTYNAME": "San Juan County",
        "POPESTIMATE2019": "728"
      },
      {
        "STATE": "08",
        "COUNTY": "113",
        "STNAME": "Colorado",
        "CTYNAME": "San Miguel County",
        "POPESTIMATE2019": "8179"
      },
      {
        "STATE": "08",
        "COUNTY": "115",
        "STNAME": "Colorado",
        "CTYNAME": "Sedgwick County",
        "POPESTIMATE2019": "2248"
      },
      {
        "STATE": "08",
        "COUNTY": "117",
        "STNAME": "Colorado",
        "CTYNAME": "Summit County",
        "POPESTIMATE2019": "31011"
      },
      {
        "STATE": "08",
        "COUNTY": "119",
        "STNAME": "Colorado",
        "CTYNAME": "Teller County",
        "POPESTIMATE2019": "25388"
      },
      {
        "STATE": "08",
        "COUNTY": "121",
        "STNAME": "Colorado",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "4908"
      },
      {
        "STATE": "08",
        "COUNTY": "123",
        "STNAME": "Colorado",
        "CTYNAME": "Weld County",
        "POPESTIMATE2019": "324492"
      },
      {
        "STATE": "08",
        "COUNTY": "125",
        "STNAME": "Colorado",
        "CTYNAME": "Yuma County",
        "POPESTIMATE2019": "10019"
      },
      {
        "STATE": "09",
        "COUNTY": "000",
        "STNAME": "Connecticut",
        "CTYNAME": "Connecticut",
        "POPESTIMATE2019": "3565287"
      },
      {
        "STATE": "09",
        "COUNTY": "001",
        "STNAME": "Connecticut",
        "CTYNAME": "Fairfield County",
        "POPESTIMATE2019": "943332"
      },
      {
        "STATE": "09",
        "COUNTY": "003",
        "STNAME": "Connecticut",
        "CTYNAME": "Hartford County",
        "POPESTIMATE2019": "891720"
      },
      {
        "STATE": "09",
        "COUNTY": "005",
        "STNAME": "Connecticut",
        "CTYNAME": "Litchfield County",
        "POPESTIMATE2019": "180333"
      },
      {
        "STATE": "09",
        "COUNTY": "007",
        "STNAME": "Connecticut",
        "CTYNAME": "Middlesex County",
        "POPESTIMATE2019": "162436"
      },
      {
        "STATE": "09",
        "COUNTY": "009",
        "STNAME": "Connecticut",
        "CTYNAME": "New Haven County",
        "POPESTIMATE2019": "854757"
      },
      {
        "STATE": "09",
        "COUNTY": "011",
        "STNAME": "Connecticut",
        "CTYNAME": "New London County",
        "POPESTIMATE2019": "265206"
      },
      {
        "STATE": "09",
        "COUNTY": "013",
        "STNAME": "Connecticut",
        "CTYNAME": "Tolland County",
        "POPESTIMATE2019": "150721"
      },
      {
        "STATE": "09",
        "COUNTY": "015",
        "STNAME": "Connecticut",
        "CTYNAME": "Windham County",
        "POPESTIMATE2019": "116782"
      },
      {
        "STATE": "10",
        "COUNTY": "000",
        "STNAME": "Delaware",
        "CTYNAME": "Delaware",
        "POPESTIMATE2019": "973764"
      },
      {
        "STATE": "10",
        "COUNTY": "001",
        "STNAME": "Delaware",
        "CTYNAME": "Kent County",
        "POPESTIMATE2019": "180786"
      },
      {
        "STATE": "10",
        "COUNTY": "003",
        "STNAME": "Delaware",
        "CTYNAME": "New Castle County",
        "POPESTIMATE2019": "558753"
      },
      {
        "STATE": "10",
        "COUNTY": "005",
        "STNAME": "Delaware",
        "CTYNAME": "Sussex County",
        "POPESTIMATE2019": "234225"
      },
      {
        "STATE": "11",
        "COUNTY": "000",
        "STNAME": "District of Columbia",
        "CTYNAME": "District of Columbia",
        "POPESTIMATE2019": "705749"
      },
      {
        "STATE": "11",
        "COUNTY": "001",
        "STNAME": "District of Columbia",
        "CTYNAME": "District of Columbia",
        "POPESTIMATE2019": "705749"
      },
      {
        "STATE": "12",
        "COUNTY": "000",
        "STNAME": "Florida",
        "CTYNAME": "Florida",
        "POPESTIMATE2019": "21477737"
      },
      {
        "STATE": "12",
        "COUNTY": "001",
        "STNAME": "Florida",
        "CTYNAME": "Alachua County",
        "POPESTIMATE2019": "269043"
      },
      {
        "STATE": "12",
        "COUNTY": "003",
        "STNAME": "Florida",
        "CTYNAME": "Baker County",
        "POPESTIMATE2019": "29210"
      },
      {
        "STATE": "12",
        "COUNTY": "005",
        "STNAME": "Florida",
        "CTYNAME": "Bay County",
        "POPESTIMATE2019": "174705"
      },
      {
        "STATE": "12",
        "COUNTY": "007",
        "STNAME": "Florida",
        "CTYNAME": "Bradford County",
        "POPESTIMATE2019": "28201"
      },
      {
        "STATE": "12",
        "COUNTY": "009",
        "STNAME": "Florida",
        "CTYNAME": "Brevard County",
        "POPESTIMATE2019": "601942"
      },
      {
        "STATE": "12",
        "COUNTY": "011",
        "STNAME": "Florida",
        "CTYNAME": "Broward County",
        "POPESTIMATE2019": "1952778"
      },
      {
        "STATE": "12",
        "COUNTY": "013",
        "STNAME": "Florida",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "14105"
      },
      {
        "STATE": "12",
        "COUNTY": "015",
        "STNAME": "Florida",
        "CTYNAME": "Charlotte County",
        "POPESTIMATE2019": "188910"
      },
      {
        "STATE": "12",
        "COUNTY": "017",
        "STNAME": "Florida",
        "CTYNAME": "Citrus County",
        "POPESTIMATE2019": "149657"
      },
      {
        "STATE": "12",
        "COUNTY": "019",
        "STNAME": "Florida",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "219252"
      },
      {
        "STATE": "12",
        "COUNTY": "021",
        "STNAME": "Florida",
        "CTYNAME": "Collier County",
        "POPESTIMATE2019": "384902"
      },
      {
        "STATE": "12",
        "COUNTY": "023",
        "STNAME": "Florida",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "71686"
      },
      {
        "STATE": "12",
        "COUNTY": "027",
        "STNAME": "Florida",
        "CTYNAME": "DeSoto County",
        "POPESTIMATE2019": "38001"
      },
      {
        "STATE": "12",
        "COUNTY": "029",
        "STNAME": "Florida",
        "CTYNAME": "Dixie County",
        "POPESTIMATE2019": "16826"
      },
      {
        "STATE": "12",
        "COUNTY": "031",
        "STNAME": "Florida",
        "CTYNAME": "Duval County",
        "POPESTIMATE2019": "957755"
      },
      {
        "STATE": "12",
        "COUNTY": "033",
        "STNAME": "Florida",
        "CTYNAME": "Escambia County",
        "POPESTIMATE2019": "318316"
      },
      {
        "STATE": "12",
        "COUNTY": "035",
        "STNAME": "Florida",
        "CTYNAME": "Flagler County",
        "POPESTIMATE2019": "115081"
      },
      {
        "STATE": "12",
        "COUNTY": "037",
        "STNAME": "Florida",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "12125"
      },
      {
        "STATE": "12",
        "COUNTY": "039",
        "STNAME": "Florida",
        "CTYNAME": "Gadsden County",
        "POPESTIMATE2019": "45660"
      },
      {
        "STATE": "12",
        "COUNTY": "041",
        "STNAME": "Florida",
        "CTYNAME": "Gilchrist County",
        "POPESTIMATE2019": "18582"
      },
      {
        "STATE": "12",
        "COUNTY": "043",
        "STNAME": "Florida",
        "CTYNAME": "Glades County",
        "POPESTIMATE2019": "13811"
      },
      {
        "STATE": "12",
        "COUNTY": "045",
        "STNAME": "Florida",
        "CTYNAME": "Gulf County",
        "POPESTIMATE2019": "13639"
      },
      {
        "STATE": "12",
        "COUNTY": "047",
        "STNAME": "Florida",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "14428"
      },
      {
        "STATE": "12",
        "COUNTY": "049",
        "STNAME": "Florida",
        "CTYNAME": "Hardee County",
        "POPESTIMATE2019": "26937"
      },
      {
        "STATE": "12",
        "COUNTY": "051",
        "STNAME": "Florida",
        "CTYNAME": "Hendry County",
        "POPESTIMATE2019": "42022"
      },
      {
        "STATE": "12",
        "COUNTY": "053",
        "STNAME": "Florida",
        "CTYNAME": "Hernando County",
        "POPESTIMATE2019": "193920"
      },
      {
        "STATE": "12",
        "COUNTY": "055",
        "STNAME": "Florida",
        "CTYNAME": "Highlands County",
        "POPESTIMATE2019": "106221"
      },
      {
        "STATE": "12",
        "COUNTY": "057",
        "STNAME": "Florida",
        "CTYNAME": "Hillsborough County",
        "POPESTIMATE2019": "1471968"
      },
      {
        "STATE": "12",
        "COUNTY": "059",
        "STNAME": "Florida",
        "CTYNAME": "Holmes County",
        "POPESTIMATE2019": "19617"
      },
      {
        "STATE": "12",
        "COUNTY": "061",
        "STNAME": "Florida",
        "CTYNAME": "Indian River County",
        "POPESTIMATE2019": "159923"
      },
      {
        "STATE": "12",
        "COUNTY": "063",
        "STNAME": "Florida",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "46414"
      },
      {
        "STATE": "12",
        "COUNTY": "065",
        "STNAME": "Florida",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "14246"
      },
      {
        "STATE": "12",
        "COUNTY": "067",
        "STNAME": "Florida",
        "CTYNAME": "Lafayette County",
        "POPESTIMATE2019": "8422"
      },
      {
        "STATE": "12",
        "COUNTY": "069",
        "STNAME": "Florida",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "367118"
      },
      {
        "STATE": "12",
        "COUNTY": "071",
        "STNAME": "Florida",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "770577"
      },
      {
        "STATE": "12",
        "COUNTY": "073",
        "STNAME": "Florida",
        "CTYNAME": "Leon County",
        "POPESTIMATE2019": "293582"
      },
      {
        "STATE": "12",
        "COUNTY": "075",
        "STNAME": "Florida",
        "CTYNAME": "Levy County",
        "POPESTIMATE2019": "41503"
      },
      {
        "STATE": "12",
        "COUNTY": "077",
        "STNAME": "Florida",
        "CTYNAME": "Liberty County",
        "POPESTIMATE2019": "8354"
      },
      {
        "STATE": "12",
        "COUNTY": "079",
        "STNAME": "Florida",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "18493"
      },
      {
        "STATE": "12",
        "COUNTY": "081",
        "STNAME": "Florida",
        "CTYNAME": "Manatee County",
        "POPESTIMATE2019": "403253"
      },
      {
        "STATE": "12",
        "COUNTY": "083",
        "STNAME": "Florida",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "365579"
      },
      {
        "STATE": "12",
        "COUNTY": "085",
        "STNAME": "Florida",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "161000"
      },
      {
        "STATE": "12",
        "COUNTY": "086",
        "STNAME": "Florida",
        "CTYNAME": "Miami-Dade County",
        "POPESTIMATE2019": "2716940"
      },
      {
        "STATE": "12",
        "COUNTY": "087",
        "STNAME": "Florida",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "74228"
      },
      {
        "STATE": "12",
        "COUNTY": "089",
        "STNAME": "Florida",
        "CTYNAME": "Nassau County",
        "POPESTIMATE2019": "88625"
      },
      {
        "STATE": "12",
        "COUNTY": "091",
        "STNAME": "Florida",
        "CTYNAME": "Okaloosa County",
        "POPESTIMATE2019": "210738"
      },
      {
        "STATE": "12",
        "COUNTY": "093",
        "STNAME": "Florida",
        "CTYNAME": "Okeechobee County",
        "POPESTIMATE2019": "42168"
      },
      {
        "STATE": "12",
        "COUNTY": "095",
        "STNAME": "Florida",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "1393452"
      },
      {
        "STATE": "12",
        "COUNTY": "097",
        "STNAME": "Florida",
        "CTYNAME": "Osceola County",
        "POPESTIMATE2019": "375751"
      },
      {
        "STATE": "12",
        "COUNTY": "099",
        "STNAME": "Florida",
        "CTYNAME": "Palm Beach County",
        "POPESTIMATE2019": "1496770"
      },
      {
        "STATE": "12",
        "COUNTY": "101",
        "STNAME": "Florida",
        "CTYNAME": "Pasco County",
        "POPESTIMATE2019": "553947"
      },
      {
        "STATE": "12",
        "COUNTY": "103",
        "STNAME": "Florida",
        "CTYNAME": "Pinellas County",
        "POPESTIMATE2019": "974996"
      },
      {
        "STATE": "12",
        "COUNTY": "105",
        "STNAME": "Florida",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "724777"
      },
      {
        "STATE": "12",
        "COUNTY": "107",
        "STNAME": "Florida",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "74521"
      },
      {
        "STATE": "12",
        "COUNTY": "109",
        "STNAME": "Florida",
        "CTYNAME": "St. Johns County",
        "POPESTIMATE2019": "264672"
      },
      {
        "STATE": "12",
        "COUNTY": "111",
        "STNAME": "Florida",
        "CTYNAME": "St. Lucie County",
        "POPESTIMATE2019": "328297"
      },
      {
        "STATE": "12",
        "COUNTY": "113",
        "STNAME": "Florida",
        "CTYNAME": "Santa Rosa County",
        "POPESTIMATE2019": "184313"
      },
      {
        "STATE": "12",
        "COUNTY": "115",
        "STNAME": "Florida",
        "CTYNAME": "Sarasota County",
        "POPESTIMATE2019": "433742"
      },
      {
        "STATE": "12",
        "COUNTY": "117",
        "STNAME": "Florida",
        "CTYNAME": "Seminole County",
        "POPESTIMATE2019": "471826"
      },
      {
        "STATE": "12",
        "COUNTY": "119",
        "STNAME": "Florida",
        "CTYNAME": "Sumter County",
        "POPESTIMATE2019": "132420"
      },
      {
        "STATE": "12",
        "COUNTY": "121",
        "STNAME": "Florida",
        "CTYNAME": "Suwannee County",
        "POPESTIMATE2019": "44417"
      },
      {
        "STATE": "12",
        "COUNTY": "123",
        "STNAME": "Florida",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "21569"
      },
      {
        "STATE": "12",
        "COUNTY": "125",
        "STNAME": "Florida",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "15237"
      },
      {
        "STATE": "12",
        "COUNTY": "127",
        "STNAME": "Florida",
        "CTYNAME": "Volusia County",
        "POPESTIMATE2019": "553284"
      },
      {
        "STATE": "12",
        "COUNTY": "129",
        "STNAME": "Florida",
        "CTYNAME": "Wakulla County",
        "POPESTIMATE2019": "33739"
      },
      {
        "STATE": "12",
        "COUNTY": "131",
        "STNAME": "Florida",
        "CTYNAME": "Walton County",
        "POPESTIMATE2019": "74071"
      },
      {
        "STATE": "12",
        "COUNTY": "133",
        "STNAME": "Florida",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "25473"
      },
      {
        "STATE": "13",
        "COUNTY": "000",
        "STNAME": "Georgia",
        "CTYNAME": "Georgia",
        "POPESTIMATE2019": "10617423"
      },
      {
        "STATE": "13",
        "COUNTY": "001",
        "STNAME": "Georgia",
        "CTYNAME": "Appling County",
        "POPESTIMATE2019": "18386"
      },
      {
        "STATE": "13",
        "COUNTY": "003",
        "STNAME": "Georgia",
        "CTYNAME": "Atkinson County",
        "POPESTIMATE2019": "8165"
      },
      {
        "STATE": "13",
        "COUNTY": "005",
        "STNAME": "Georgia",
        "CTYNAME": "Bacon County",
        "POPESTIMATE2019": "11164"
      },
      {
        "STATE": "13",
        "COUNTY": "007",
        "STNAME": "Georgia",
        "CTYNAME": "Baker County",
        "POPESTIMATE2019": "3038"
      },
      {
        "STATE": "13",
        "COUNTY": "009",
        "STNAME": "Georgia",
        "CTYNAME": "Baldwin County",
        "POPESTIMATE2019": "44890"
      },
      {
        "STATE": "13",
        "COUNTY": "011",
        "STNAME": "Georgia",
        "CTYNAME": "Banks County",
        "POPESTIMATE2019": "19234"
      },
      {
        "STATE": "13",
        "COUNTY": "013",
        "STNAME": "Georgia",
        "CTYNAME": "Barrow County",
        "POPESTIMATE2019": "83240"
      },
      {
        "STATE": "13",
        "COUNTY": "015",
        "STNAME": "Georgia",
        "CTYNAME": "Bartow County",
        "POPESTIMATE2019": "107738"
      },
      {
        "STATE": "13",
        "COUNTY": "017",
        "STNAME": "Georgia",
        "CTYNAME": "Ben Hill County",
        "POPESTIMATE2019": "16700"
      },
      {
        "STATE": "13",
        "COUNTY": "019",
        "STNAME": "Georgia",
        "CTYNAME": "Berrien County",
        "POPESTIMATE2019": "19397"
      },
      {
        "STATE": "13",
        "COUNTY": "021",
        "STNAME": "Georgia",
        "CTYNAME": "Bibb County",
        "POPESTIMATE2019": "153159"
      },
      {
        "STATE": "13",
        "COUNTY": "023",
        "STNAME": "Georgia",
        "CTYNAME": "Bleckley County",
        "POPESTIMATE2019": "12873"
      },
      {
        "STATE": "13",
        "COUNTY": "025",
        "STNAME": "Georgia",
        "CTYNAME": "Brantley County",
        "POPESTIMATE2019": "19109"
      },
      {
        "STATE": "13",
        "COUNTY": "027",
        "STNAME": "Georgia",
        "CTYNAME": "Brooks County",
        "POPESTIMATE2019": "15457"
      },
      {
        "STATE": "13",
        "COUNTY": "029",
        "STNAME": "Georgia",
        "CTYNAME": "Bryan County",
        "POPESTIMATE2019": "39627"
      },
      {
        "STATE": "13",
        "COUNTY": "031",
        "STNAME": "Georgia",
        "CTYNAME": "Bulloch County",
        "POPESTIMATE2019": "79608"
      },
      {
        "STATE": "13",
        "COUNTY": "033",
        "STNAME": "Georgia",
        "CTYNAME": "Burke County",
        "POPESTIMATE2019": "22383"
      },
      {
        "STATE": "13",
        "COUNTY": "035",
        "STNAME": "Georgia",
        "CTYNAME": "Butts County",
        "POPESTIMATE2019": "24936"
      },
      {
        "STATE": "13",
        "COUNTY": "037",
        "STNAME": "Georgia",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "6189"
      },
      {
        "STATE": "13",
        "COUNTY": "039",
        "STNAME": "Georgia",
        "CTYNAME": "Camden County",
        "POPESTIMATE2019": "54666"
      },
      {
        "STATE": "13",
        "COUNTY": "043",
        "STNAME": "Georgia",
        "CTYNAME": "Candler County",
        "POPESTIMATE2019": "10803"
      },
      {
        "STATE": "13",
        "COUNTY": "045",
        "STNAME": "Georgia",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "119992"
      },
      {
        "STATE": "13",
        "COUNTY": "047",
        "STNAME": "Georgia",
        "CTYNAME": "Catoosa County",
        "POPESTIMATE2019": "67580"
      },
      {
        "STATE": "13",
        "COUNTY": "049",
        "STNAME": "Georgia",
        "CTYNAME": "Charlton County",
        "POPESTIMATE2019": "13392"
      },
      {
        "STATE": "13",
        "COUNTY": "051",
        "STNAME": "Georgia",
        "CTYNAME": "Chatham County",
        "POPESTIMATE2019": "289430"
      },
      {
        "STATE": "13",
        "COUNTY": "053",
        "STNAME": "Georgia",
        "CTYNAME": "Chattahoochee County",
        "POPESTIMATE2019": "10907"
      },
      {
        "STATE": "13",
        "COUNTY": "055",
        "STNAME": "Georgia",
        "CTYNAME": "Chattooga County",
        "POPESTIMATE2019": "24789"
      },
      {
        "STATE": "13",
        "COUNTY": "057",
        "STNAME": "Georgia",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "258773"
      },
      {
        "STATE": "13",
        "COUNTY": "059",
        "STNAME": "Georgia",
        "CTYNAME": "Clarke County",
        "POPESTIMATE2019": "128331"
      },
      {
        "STATE": "13",
        "COUNTY": "061",
        "STNAME": "Georgia",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "2834"
      },
      {
        "STATE": "13",
        "COUNTY": "063",
        "STNAME": "Georgia",
        "CTYNAME": "Clayton County",
        "POPESTIMATE2019": "292256"
      },
      {
        "STATE": "13",
        "COUNTY": "065",
        "STNAME": "Georgia",
        "CTYNAME": "Clinch County",
        "POPESTIMATE2019": "6618"
      },
      {
        "STATE": "13",
        "COUNTY": "067",
        "STNAME": "Georgia",
        "CTYNAME": "Cobb County",
        "POPESTIMATE2019": "760141"
      },
      {
        "STATE": "13",
        "COUNTY": "069",
        "STNAME": "Georgia",
        "CTYNAME": "Coffee County",
        "POPESTIMATE2019": "43273"
      },
      {
        "STATE": "13",
        "COUNTY": "071",
        "STNAME": "Georgia",
        "CTYNAME": "Colquitt County",
        "POPESTIMATE2019": "45600"
      },
      {
        "STATE": "13",
        "COUNTY": "073",
        "STNAME": "Georgia",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "156714"
      },
      {
        "STATE": "13",
        "COUNTY": "075",
        "STNAME": "Georgia",
        "CTYNAME": "Cook County",
        "POPESTIMATE2019": "17270"
      },
      {
        "STATE": "13",
        "COUNTY": "077",
        "STNAME": "Georgia",
        "CTYNAME": "Coweta County",
        "POPESTIMATE2019": "148509"
      },
      {
        "STATE": "13",
        "COUNTY": "079",
        "STNAME": "Georgia",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "12404"
      },
      {
        "STATE": "13",
        "COUNTY": "081",
        "STNAME": "Georgia",
        "CTYNAME": "Crisp County",
        "POPESTIMATE2019": "22372"
      },
      {
        "STATE": "13",
        "COUNTY": "083",
        "STNAME": "Georgia",
        "CTYNAME": "Dade County",
        "POPESTIMATE2019": "16116"
      },
      {
        "STATE": "13",
        "COUNTY": "085",
        "STNAME": "Georgia",
        "CTYNAME": "Dawson County",
        "POPESTIMATE2019": "26108"
      },
      {
        "STATE": "13",
        "COUNTY": "087",
        "STNAME": "Georgia",
        "CTYNAME": "Decatur County",
        "POPESTIMATE2019": "26404"
      },
      {
        "STATE": "13",
        "COUNTY": "089",
        "STNAME": "Georgia",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "759297"
      },
      {
        "STATE": "13",
        "COUNTY": "091",
        "STNAME": "Georgia",
        "CTYNAME": "Dodge County",
        "POPESTIMATE2019": "20605"
      },
      {
        "STATE": "13",
        "COUNTY": "093",
        "STNAME": "Georgia",
        "CTYNAME": "Dooly County",
        "POPESTIMATE2019": "13390"
      },
      {
        "STATE": "13",
        "COUNTY": "095",
        "STNAME": "Georgia",
        "CTYNAME": "Dougherty County",
        "POPESTIMATE2019": "87956"
      },
      {
        "STATE": "13",
        "COUNTY": "097",
        "STNAME": "Georgia",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "146343"
      },
      {
        "STATE": "13",
        "COUNTY": "099",
        "STNAME": "Georgia",
        "CTYNAME": "Early County",
        "POPESTIMATE2019": "10190"
      },
      {
        "STATE": "13",
        "COUNTY": "101",
        "STNAME": "Georgia",
        "CTYNAME": "Echols County",
        "POPESTIMATE2019": "4006"
      },
      {
        "STATE": "13",
        "COUNTY": "103",
        "STNAME": "Georgia",
        "CTYNAME": "Effingham County",
        "POPESTIMATE2019": "64296"
      },
      {
        "STATE": "13",
        "COUNTY": "105",
        "STNAME": "Georgia",
        "CTYNAME": "Elbert County",
        "POPESTIMATE2019": "19194"
      },
      {
        "STATE": "13",
        "COUNTY": "107",
        "STNAME": "Georgia",
        "CTYNAME": "Emanuel County",
        "POPESTIMATE2019": "22646"
      },
      {
        "STATE": "13",
        "COUNTY": "109",
        "STNAME": "Georgia",
        "CTYNAME": "Evans County",
        "POPESTIMATE2019": "10654"
      },
      {
        "STATE": "13",
        "COUNTY": "111",
        "STNAME": "Georgia",
        "CTYNAME": "Fannin County",
        "POPESTIMATE2019": "26188"
      },
      {
        "STATE": "13",
        "COUNTY": "113",
        "STNAME": "Georgia",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "114421"
      },
      {
        "STATE": "13",
        "COUNTY": "115",
        "STNAME": "Georgia",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "98498"
      },
      {
        "STATE": "13",
        "COUNTY": "117",
        "STNAME": "Georgia",
        "CTYNAME": "Forsyth County",
        "POPESTIMATE2019": "244252"
      },
      {
        "STATE": "13",
        "COUNTY": "119",
        "STNAME": "Georgia",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "23349"
      },
      {
        "STATE": "13",
        "COUNTY": "121",
        "STNAME": "Georgia",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "1063937"
      },
      {
        "STATE": "13",
        "COUNTY": "123",
        "STNAME": "Georgia",
        "CTYNAME": "Gilmer County",
        "POPESTIMATE2019": "31369"
      },
      {
        "STATE": "13",
        "COUNTY": "125",
        "STNAME": "Georgia",
        "CTYNAME": "Glascock County",
        "POPESTIMATE2019": "2971"
      },
      {
        "STATE": "13",
        "COUNTY": "127",
        "STNAME": "Georgia",
        "CTYNAME": "Glynn County",
        "POPESTIMATE2019": "85292"
      },
      {
        "STATE": "13",
        "COUNTY": "129",
        "STNAME": "Georgia",
        "CTYNAME": "Gordon County",
        "POPESTIMATE2019": "57963"
      },
      {
        "STATE": "13",
        "COUNTY": "131",
        "STNAME": "Georgia",
        "CTYNAME": "Grady County",
        "POPESTIMATE2019": "24633"
      },
      {
        "STATE": "13",
        "COUNTY": "133",
        "STNAME": "Georgia",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "18324"
      },
      {
        "STATE": "13",
        "COUNTY": "135",
        "STNAME": "Georgia",
        "CTYNAME": "Gwinnett County",
        "POPESTIMATE2019": "936250"
      },
      {
        "STATE": "13",
        "COUNTY": "137",
        "STNAME": "Georgia",
        "CTYNAME": "Habersham County",
        "POPESTIMATE2019": "45328"
      },
      {
        "STATE": "13",
        "COUNTY": "139",
        "STNAME": "Georgia",
        "CTYNAME": "Hall County",
        "POPESTIMATE2019": "204441"
      },
      {
        "STATE": "13",
        "COUNTY": "141",
        "STNAME": "Georgia",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "8457"
      },
      {
        "STATE": "13",
        "COUNTY": "143",
        "STNAME": "Georgia",
        "CTYNAME": "Haralson County",
        "POPESTIMATE2019": "29792"
      },
      {
        "STATE": "13",
        "COUNTY": "145",
        "STNAME": "Georgia",
        "CTYNAME": "Harris County",
        "POPESTIMATE2019": "35236"
      },
      {
        "STATE": "13",
        "COUNTY": "147",
        "STNAME": "Georgia",
        "CTYNAME": "Hart County",
        "POPESTIMATE2019": "26205"
      },
      {
        "STATE": "13",
        "COUNTY": "149",
        "STNAME": "Georgia",
        "CTYNAME": "Heard County",
        "POPESTIMATE2019": "11923"
      },
      {
        "STATE": "13",
        "COUNTY": "151",
        "STNAME": "Georgia",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "234561"
      },
      {
        "STATE": "13",
        "COUNTY": "153",
        "STNAME": "Georgia",
        "CTYNAME": "Houston County",
        "POPESTIMATE2019": "157863"
      },
      {
        "STATE": "13",
        "COUNTY": "155",
        "STNAME": "Georgia",
        "CTYNAME": "Irwin County",
        "POPESTIMATE2019": "9416"
      },
      {
        "STATE": "13",
        "COUNTY": "157",
        "STNAME": "Georgia",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "72977"
      },
      {
        "STATE": "13",
        "COUNTY": "159",
        "STNAME": "Georgia",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "14219"
      },
      {
        "STATE": "13",
        "COUNTY": "161",
        "STNAME": "Georgia",
        "CTYNAME": "Jeff Davis County",
        "POPESTIMATE2019": "15115"
      },
      {
        "STATE": "13",
        "COUNTY": "163",
        "STNAME": "Georgia",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "15362"
      },
      {
        "STATE": "13",
        "COUNTY": "165",
        "STNAME": "Georgia",
        "CTYNAME": "Jenkins County",
        "POPESTIMATE2019": "8676"
      },
      {
        "STATE": "13",
        "COUNTY": "167",
        "STNAME": "Georgia",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "9643"
      },
      {
        "STATE": "13",
        "COUNTY": "169",
        "STNAME": "Georgia",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "28735"
      },
      {
        "STATE": "13",
        "COUNTY": "171",
        "STNAME": "Georgia",
        "CTYNAME": "Lamar County",
        "POPESTIMATE2019": "19077"
      },
      {
        "STATE": "13",
        "COUNTY": "173",
        "STNAME": "Georgia",
        "CTYNAME": "Lanier County",
        "POPESTIMATE2019": "10423"
      },
      {
        "STATE": "13",
        "COUNTY": "175",
        "STNAME": "Georgia",
        "CTYNAME": "Laurens County",
        "POPESTIMATE2019": "47546"
      },
      {
        "STATE": "13",
        "COUNTY": "177",
        "STNAME": "Georgia",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "29992"
      },
      {
        "STATE": "13",
        "COUNTY": "179",
        "STNAME": "Georgia",
        "CTYNAME": "Liberty County",
        "POPESTIMATE2019": "61435"
      },
      {
        "STATE": "13",
        "COUNTY": "181",
        "STNAME": "Georgia",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "7921"
      },
      {
        "STATE": "13",
        "COUNTY": "183",
        "STNAME": "Georgia",
        "CTYNAME": "Long County",
        "POPESTIMATE2019": "19559"
      },
      {
        "STATE": "13",
        "COUNTY": "185",
        "STNAME": "Georgia",
        "CTYNAME": "Lowndes County",
        "POPESTIMATE2019": "117406"
      },
      {
        "STATE": "13",
        "COUNTY": "187",
        "STNAME": "Georgia",
        "CTYNAME": "Lumpkin County",
        "POPESTIMATE2019": "33610"
      },
      {
        "STATE": "13",
        "COUNTY": "189",
        "STNAME": "Georgia",
        "CTYNAME": "McDuffie County",
        "POPESTIMATE2019": "21312"
      },
      {
        "STATE": "13",
        "COUNTY": "191",
        "STNAME": "Georgia",
        "CTYNAME": "McIntosh County",
        "POPESTIMATE2019": "14378"
      },
      {
        "STATE": "13",
        "COUNTY": "193",
        "STNAME": "Georgia",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "12947"
      },
      {
        "STATE": "13",
        "COUNTY": "195",
        "STNAME": "Georgia",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "29880"
      },
      {
        "STATE": "13",
        "COUNTY": "197",
        "STNAME": "Georgia",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "8359"
      },
      {
        "STATE": "13",
        "COUNTY": "199",
        "STNAME": "Georgia",
        "CTYNAME": "Meriwether County",
        "POPESTIMATE2019": "21167"
      },
      {
        "STATE": "13",
        "COUNTY": "201",
        "STNAME": "Georgia",
        "CTYNAME": "Miller County",
        "POPESTIMATE2019": "5718"
      },
      {
        "STATE": "13",
        "COUNTY": "205",
        "STNAME": "Georgia",
        "CTYNAME": "Mitchell County",
        "POPESTIMATE2019": "21863"
      },
      {
        "STATE": "13",
        "COUNTY": "207",
        "STNAME": "Georgia",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "27578"
      },
      {
        "STATE": "13",
        "COUNTY": "209",
        "STNAME": "Georgia",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "9172"
      },
      {
        "STATE": "13",
        "COUNTY": "211",
        "STNAME": "Georgia",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "19276"
      },
      {
        "STATE": "13",
        "COUNTY": "213",
        "STNAME": "Georgia",
        "CTYNAME": "Murray County",
        "POPESTIMATE2019": "40096"
      },
      {
        "STATE": "13",
        "COUNTY": "215",
        "STNAME": "Georgia",
        "CTYNAME": "Muscogee County",
        "POPESTIMATE2019": "195769"
      },
      {
        "STATE": "13",
        "COUNTY": "217",
        "STNAME": "Georgia",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "111744"
      },
      {
        "STATE": "13",
        "COUNTY": "219",
        "STNAME": "Georgia",
        "CTYNAME": "Oconee County",
        "POPESTIMATE2019": "40280"
      },
      {
        "STATE": "13",
        "COUNTY": "221",
        "STNAME": "Georgia",
        "CTYNAME": "Oglethorpe County",
        "POPESTIMATE2019": "15259"
      },
      {
        "STATE": "13",
        "COUNTY": "223",
        "STNAME": "Georgia",
        "CTYNAME": "Paulding County",
        "POPESTIMATE2019": "168667"
      },
      {
        "STATE": "13",
        "COUNTY": "225",
        "STNAME": "Georgia",
        "CTYNAME": "Peach County",
        "POPESTIMATE2019": "27546"
      },
      {
        "STATE": "13",
        "COUNTY": "227",
        "STNAME": "Georgia",
        "CTYNAME": "Pickens County",
        "POPESTIMATE2019": "32591"
      },
      {
        "STATE": "13",
        "COUNTY": "229",
        "STNAME": "Georgia",
        "CTYNAME": "Pierce County",
        "POPESTIMATE2019": "19465"
      },
      {
        "STATE": "13",
        "COUNTY": "231",
        "STNAME": "Georgia",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "18962"
      },
      {
        "STATE": "13",
        "COUNTY": "233",
        "STNAME": "Georgia",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "42613"
      },
      {
        "STATE": "13",
        "COUNTY": "235",
        "STNAME": "Georgia",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "11137"
      },
      {
        "STATE": "13",
        "COUNTY": "237",
        "STNAME": "Georgia",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "22119"
      },
      {
        "STATE": "13",
        "COUNTY": "239",
        "STNAME": "Georgia",
        "CTYNAME": "Quitman County",
        "POPESTIMATE2019": "2299"
      },
      {
        "STATE": "13",
        "COUNTY": "241",
        "STNAME": "Georgia",
        "CTYNAME": "Rabun County",
        "POPESTIMATE2019": "17137"
      },
      {
        "STATE": "13",
        "COUNTY": "243",
        "STNAME": "Georgia",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "6778"
      },
      {
        "STATE": "13",
        "COUNTY": "245",
        "STNAME": "Georgia",
        "CTYNAME": "Richmond County",
        "POPESTIMATE2019": "202518"
      },
      {
        "STATE": "13",
        "COUNTY": "247",
        "STNAME": "Georgia",
        "CTYNAME": "Rockdale County",
        "POPESTIMATE2019": "90896"
      },
      {
        "STATE": "13",
        "COUNTY": "249",
        "STNAME": "Georgia",
        "CTYNAME": "Schley County",
        "POPESTIMATE2019": "5257"
      },
      {
        "STATE": "13",
        "COUNTY": "251",
        "STNAME": "Georgia",
        "CTYNAME": "Screven County",
        "POPESTIMATE2019": "13966"
      },
      {
        "STATE": "13",
        "COUNTY": "253",
        "STNAME": "Georgia",
        "CTYNAME": "Seminole County",
        "POPESTIMATE2019": "8090"
      },
      {
        "STATE": "13",
        "COUNTY": "255",
        "STNAME": "Georgia",
        "CTYNAME": "Spalding County",
        "POPESTIMATE2019": "66703"
      },
      {
        "STATE": "13",
        "COUNTY": "257",
        "STNAME": "Georgia",
        "CTYNAME": "Stephens County",
        "POPESTIMATE2019": "25925"
      },
      {
        "STATE": "13",
        "COUNTY": "259",
        "STNAME": "Georgia",
        "CTYNAME": "Stewart County",
        "POPESTIMATE2019": "6621"
      },
      {
        "STATE": "13",
        "COUNTY": "261",
        "STNAME": "Georgia",
        "CTYNAME": "Sumter County",
        "POPESTIMATE2019": "29524"
      },
      {
        "STATE": "13",
        "COUNTY": "263",
        "STNAME": "Georgia",
        "CTYNAME": "Talbot County",
        "POPESTIMATE2019": "6195"
      },
      {
        "STATE": "13",
        "COUNTY": "265",
        "STNAME": "Georgia",
        "CTYNAME": "Taliaferro County",
        "POPESTIMATE2019": "1537"
      },
      {
        "STATE": "13",
        "COUNTY": "267",
        "STNAME": "Georgia",
        "CTYNAME": "Tattnall County",
        "POPESTIMATE2019": "25286"
      },
      {
        "STATE": "13",
        "COUNTY": "269",
        "STNAME": "Georgia",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "8020"
      },
      {
        "STATE": "13",
        "COUNTY": "271",
        "STNAME": "Georgia",
        "CTYNAME": "Telfair County",
        "POPESTIMATE2019": "15860"
      },
      {
        "STATE": "13",
        "COUNTY": "273",
        "STNAME": "Georgia",
        "CTYNAME": "Terrell County",
        "POPESTIMATE2019": "8531"
      },
      {
        "STATE": "13",
        "COUNTY": "275",
        "STNAME": "Georgia",
        "CTYNAME": "Thomas County",
        "POPESTIMATE2019": "44451"
      },
      {
        "STATE": "13",
        "COUNTY": "277",
        "STNAME": "Georgia",
        "CTYNAME": "Tift County",
        "POPESTIMATE2019": "40644"
      },
      {
        "STATE": "13",
        "COUNTY": "279",
        "STNAME": "Georgia",
        "CTYNAME": "Toombs County",
        "POPESTIMATE2019": "26830"
      },
      {
        "STATE": "13",
        "COUNTY": "281",
        "STNAME": "Georgia",
        "CTYNAME": "Towns County",
        "POPESTIMATE2019": "12037"
      },
      {
        "STATE": "13",
        "COUNTY": "283",
        "STNAME": "Georgia",
        "CTYNAME": "Treutlen County",
        "POPESTIMATE2019": "6901"
      },
      {
        "STATE": "13",
        "COUNTY": "285",
        "STNAME": "Georgia",
        "CTYNAME": "Troup County",
        "POPESTIMATE2019": "69922"
      },
      {
        "STATE": "13",
        "COUNTY": "287",
        "STNAME": "Georgia",
        "CTYNAME": "Turner County",
        "POPESTIMATE2019": "7985"
      },
      {
        "STATE": "13",
        "COUNTY": "289",
        "STNAME": "Georgia",
        "CTYNAME": "Twiggs County",
        "POPESTIMATE2019": "8120"
      },
      {
        "STATE": "13",
        "COUNTY": "291",
        "STNAME": "Georgia",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "24511"
      },
      {
        "STATE": "13",
        "COUNTY": "293",
        "STNAME": "Georgia",
        "CTYNAME": "Upson County",
        "POPESTIMATE2019": "26320"
      },
      {
        "STATE": "13",
        "COUNTY": "295",
        "STNAME": "Georgia",
        "CTYNAME": "Walker County",
        "POPESTIMATE2019": "69761"
      },
      {
        "STATE": "13",
        "COUNTY": "297",
        "STNAME": "Georgia",
        "CTYNAME": "Walton County",
        "POPESTIMATE2019": "94593"
      },
      {
        "STATE": "13",
        "COUNTY": "299",
        "STNAME": "Georgia",
        "CTYNAME": "Ware County",
        "POPESTIMATE2019": "35734"
      },
      {
        "STATE": "13",
        "COUNTY": "301",
        "STNAME": "Georgia",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "5254"
      },
      {
        "STATE": "13",
        "COUNTY": "303",
        "STNAME": "Georgia",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "20374"
      },
      {
        "STATE": "13",
        "COUNTY": "305",
        "STNAME": "Georgia",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "29927"
      },
      {
        "STATE": "13",
        "COUNTY": "307",
        "STNAME": "Georgia",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "2607"
      },
      {
        "STATE": "13",
        "COUNTY": "309",
        "STNAME": "Georgia",
        "CTYNAME": "Wheeler County",
        "POPESTIMATE2019": "7855"
      },
      {
        "STATE": "13",
        "COUNTY": "311",
        "STNAME": "Georgia",
        "CTYNAME": "White County",
        "POPESTIMATE2019": "30798"
      },
      {
        "STATE": "13",
        "COUNTY": "313",
        "STNAME": "Georgia",
        "CTYNAME": "Whitfield County",
        "POPESTIMATE2019": "104628"
      },
      {
        "STATE": "13",
        "COUNTY": "315",
        "STNAME": "Georgia",
        "CTYNAME": "Wilcox County",
        "POPESTIMATE2019": "8635"
      },
      {
        "STATE": "13",
        "COUNTY": "317",
        "STNAME": "Georgia",
        "CTYNAME": "Wilkes County",
        "POPESTIMATE2019": "9777"
      },
      {
        "STATE": "13",
        "COUNTY": "319",
        "STNAME": "Georgia",
        "CTYNAME": "Wilkinson County",
        "POPESTIMATE2019": "8954"
      },
      {
        "STATE": "13",
        "COUNTY": "321",
        "STNAME": "Georgia",
        "CTYNAME": "Worth County",
        "POPESTIMATE2019": "20247"
      },
      {
        "STATE": "15",
        "COUNTY": "000",
        "STNAME": "Hawaii",
        "CTYNAME": "Hawaii",
        "POPESTIMATE2019": "1415872"
      },
      {
        "STATE": "15",
        "COUNTY": "001",
        "STNAME": "Hawaii",
        "CTYNAME": "Hawaii County",
        "POPESTIMATE2019": "201513"
      },
      {
        "STATE": "15",
        "COUNTY": "003",
        "STNAME": "Hawaii",
        "CTYNAME": "Honolulu County",
        "POPESTIMATE2019": "974563"
      },
      {
        "STATE": "15",
        "COUNTY": "005",
        "STNAME": "Hawaii",
        "CTYNAME": "Kalawao County",
        "POPESTIMATE2019": "86"
      },
      {
        "STATE": "15",
        "COUNTY": "007",
        "STNAME": "Hawaii",
        "CTYNAME": "Kauai County",
        "POPESTIMATE2019": "72293"
      },
      {
        "STATE": "15",
        "COUNTY": "009",
        "STNAME": "Hawaii",
        "CTYNAME": "Maui County",
        "POPESTIMATE2019": "167417"
      },
      {
        "STATE": "16",
        "COUNTY": "000",
        "STNAME": "Idaho",
        "CTYNAME": "Idaho",
        "POPESTIMATE2019": "1787065"
      },
      {
        "STATE": "16",
        "COUNTY": "001",
        "STNAME": "Idaho",
        "CTYNAME": "Ada County",
        "POPESTIMATE2019": "481587"
      },
      {
        "STATE": "16",
        "COUNTY": "003",
        "STNAME": "Idaho",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "4294"
      },
      {
        "STATE": "16",
        "COUNTY": "005",
        "STNAME": "Idaho",
        "CTYNAME": "Bannock County",
        "POPESTIMATE2019": "87808"
      },
      {
        "STATE": "16",
        "COUNTY": "007",
        "STNAME": "Idaho",
        "CTYNAME": "Bear Lake County",
        "POPESTIMATE2019": "6125"
      },
      {
        "STATE": "16",
        "COUNTY": "009",
        "STNAME": "Idaho",
        "CTYNAME": "Benewah County",
        "POPESTIMATE2019": "9298"
      },
      {
        "STATE": "16",
        "COUNTY": "011",
        "STNAME": "Idaho",
        "CTYNAME": "Bingham County",
        "POPESTIMATE2019": "46811"
      },
      {
        "STATE": "16",
        "COUNTY": "013",
        "STNAME": "Idaho",
        "CTYNAME": "Blaine County",
        "POPESTIMATE2019": "23021"
      },
      {
        "STATE": "16",
        "COUNTY": "015",
        "STNAME": "Idaho",
        "CTYNAME": "Boise County",
        "POPESTIMATE2019": "7831"
      },
      {
        "STATE": "16",
        "COUNTY": "017",
        "STNAME": "Idaho",
        "CTYNAME": "Bonner County",
        "POPESTIMATE2019": "45739"
      },
      {
        "STATE": "16",
        "COUNTY": "019",
        "STNAME": "Idaho",
        "CTYNAME": "Bonneville County",
        "POPESTIMATE2019": "119062"
      },
      {
        "STATE": "16",
        "COUNTY": "021",
        "STNAME": "Idaho",
        "CTYNAME": "Boundary County",
        "POPESTIMATE2019": "12245"
      },
      {
        "STATE": "16",
        "COUNTY": "023",
        "STNAME": "Idaho",
        "CTYNAME": "Butte County",
        "POPESTIMATE2019": "2597"
      },
      {
        "STATE": "16",
        "COUNTY": "025",
        "STNAME": "Idaho",
        "CTYNAME": "Camas County",
        "POPESTIMATE2019": "1106"
      },
      {
        "STATE": "16",
        "COUNTY": "027",
        "STNAME": "Idaho",
        "CTYNAME": "Canyon County",
        "POPESTIMATE2019": "229849"
      },
      {
        "STATE": "16",
        "COUNTY": "029",
        "STNAME": "Idaho",
        "CTYNAME": "Caribou County",
        "POPESTIMATE2019": "7155"
      },
      {
        "STATE": "16",
        "COUNTY": "031",
        "STNAME": "Idaho",
        "CTYNAME": "Cassia County",
        "POPESTIMATE2019": "24030"
      },
      {
        "STATE": "16",
        "COUNTY": "033",
        "STNAME": "Idaho",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "845"
      },
      {
        "STATE": "16",
        "COUNTY": "035",
        "STNAME": "Idaho",
        "CTYNAME": "Clearwater County",
        "POPESTIMATE2019": "8756"
      },
      {
        "STATE": "16",
        "COUNTY": "037",
        "STNAME": "Idaho",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "4315"
      },
      {
        "STATE": "16",
        "COUNTY": "039",
        "STNAME": "Idaho",
        "CTYNAME": "Elmore County",
        "POPESTIMATE2019": "27511"
      },
      {
        "STATE": "16",
        "COUNTY": "041",
        "STNAME": "Idaho",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "13876"
      },
      {
        "STATE": "16",
        "COUNTY": "043",
        "STNAME": "Idaho",
        "CTYNAME": "Fremont County",
        "POPESTIMATE2019": "13099"
      },
      {
        "STATE": "16",
        "COUNTY": "045",
        "STNAME": "Idaho",
        "CTYNAME": "Gem County",
        "POPESTIMATE2019": "18112"
      },
      {
        "STATE": "16",
        "COUNTY": "047",
        "STNAME": "Idaho",
        "CTYNAME": "Gooding County",
        "POPESTIMATE2019": "15179"
      },
      {
        "STATE": "16",
        "COUNTY": "049",
        "STNAME": "Idaho",
        "CTYNAME": "Idaho County",
        "POPESTIMATE2019": "16667"
      },
      {
        "STATE": "16",
        "COUNTY": "051",
        "STNAME": "Idaho",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "29871"
      },
      {
        "STATE": "16",
        "COUNTY": "053",
        "STNAME": "Idaho",
        "CTYNAME": "Jerome County",
        "POPESTIMATE2019": "24412"
      },
      {
        "STATE": "16",
        "COUNTY": "055",
        "STNAME": "Idaho",
        "CTYNAME": "Kootenai County",
        "POPESTIMATE2019": "165697"
      },
      {
        "STATE": "16",
        "COUNTY": "057",
        "STNAME": "Idaho",
        "CTYNAME": "Latah County",
        "POPESTIMATE2019": "40108"
      },
      {
        "STATE": "16",
        "COUNTY": "059",
        "STNAME": "Idaho",
        "CTYNAME": "Lemhi County",
        "POPESTIMATE2019": "8027"
      },
      {
        "STATE": "16",
        "COUNTY": "061",
        "STNAME": "Idaho",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "3838"
      },
      {
        "STATE": "16",
        "COUNTY": "063",
        "STNAME": "Idaho",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "5366"
      },
      {
        "STATE": "16",
        "COUNTY": "065",
        "STNAME": "Idaho",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "39907"
      },
      {
        "STATE": "16",
        "COUNTY": "067",
        "STNAME": "Idaho",
        "CTYNAME": "Minidoka County",
        "POPESTIMATE2019": "21039"
      },
      {
        "STATE": "16",
        "COUNTY": "069",
        "STNAME": "Idaho",
        "CTYNAME": "Nez Perce County",
        "POPESTIMATE2019": "40408"
      },
      {
        "STATE": "16",
        "COUNTY": "071",
        "STNAME": "Idaho",
        "CTYNAME": "Oneida County",
        "POPESTIMATE2019": "4531"
      },
      {
        "STATE": "16",
        "COUNTY": "073",
        "STNAME": "Idaho",
        "CTYNAME": "Owyhee County",
        "POPESTIMATE2019": "11823"
      },
      {
        "STATE": "16",
        "COUNTY": "075",
        "STNAME": "Idaho",
        "CTYNAME": "Payette County",
        "POPESTIMATE2019": "23951"
      },
      {
        "STATE": "16",
        "COUNTY": "077",
        "STNAME": "Idaho",
        "CTYNAME": "Power County",
        "POPESTIMATE2019": "7681"
      },
      {
        "STATE": "16",
        "COUNTY": "079",
        "STNAME": "Idaho",
        "CTYNAME": "Shoshone County",
        "POPESTIMATE2019": "12882"
      },
      {
        "STATE": "16",
        "COUNTY": "081",
        "STNAME": "Idaho",
        "CTYNAME": "Teton County",
        "POPESTIMATE2019": "12142"
      },
      {
        "STATE": "16",
        "COUNTY": "083",
        "STNAME": "Idaho",
        "CTYNAME": "Twin Falls County",
        "POPESTIMATE2019": "86878"
      },
      {
        "STATE": "16",
        "COUNTY": "085",
        "STNAME": "Idaho",
        "CTYNAME": "Valley County",
        "POPESTIMATE2019": "11392"
      },
      {
        "STATE": "16",
        "COUNTY": "087",
        "STNAME": "Idaho",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "10194"
      },
      {
        "STATE": "17",
        "COUNTY": "000",
        "STNAME": "Illinois",
        "CTYNAME": "Illinois",
        "POPESTIMATE2019": "12671821"
      },
      {
        "STATE": "17",
        "COUNTY": "001",
        "STNAME": "Illinois",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "65435"
      },
      {
        "STATE": "17",
        "COUNTY": "003",
        "STNAME": "Illinois",
        "CTYNAME": "Alexander County",
        "POPESTIMATE2019": "5761"
      },
      {
        "STATE": "17",
        "COUNTY": "005",
        "STNAME": "Illinois",
        "CTYNAME": "Bond County",
        "POPESTIMATE2019": "16426"
      },
      {
        "STATE": "17",
        "COUNTY": "007",
        "STNAME": "Illinois",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "53544"
      },
      {
        "STATE": "17",
        "COUNTY": "009",
        "STNAME": "Illinois",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "6578"
      },
      {
        "STATE": "17",
        "COUNTY": "011",
        "STNAME": "Illinois",
        "CTYNAME": "Bureau County",
        "POPESTIMATE2019": "32628"
      },
      {
        "STATE": "17",
        "COUNTY": "013",
        "STNAME": "Illinois",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "4739"
      },
      {
        "STATE": "17",
        "COUNTY": "015",
        "STNAME": "Illinois",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "14305"
      },
      {
        "STATE": "17",
        "COUNTY": "017",
        "STNAME": "Illinois",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "12147"
      },
      {
        "STATE": "17",
        "COUNTY": "019",
        "STNAME": "Illinois",
        "CTYNAME": "Champaign County",
        "POPESTIMATE2019": "209689"
      },
      {
        "STATE": "17",
        "COUNTY": "021",
        "STNAME": "Illinois",
        "CTYNAME": "Christian County",
        "POPESTIMATE2019": "32304"
      },
      {
        "STATE": "17",
        "COUNTY": "023",
        "STNAME": "Illinois",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "15441"
      },
      {
        "STATE": "17",
        "COUNTY": "025",
        "STNAME": "Illinois",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "13184"
      },
      {
        "STATE": "17",
        "COUNTY": "027",
        "STNAME": "Illinois",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "37562"
      },
      {
        "STATE": "17",
        "COUNTY": "029",
        "STNAME": "Illinois",
        "CTYNAME": "Coles County",
        "POPESTIMATE2019": "50621"
      },
      {
        "STATE": "17",
        "COUNTY": "031",
        "STNAME": "Illinois",
        "CTYNAME": "Cook County",
        "POPESTIMATE2019": "5150233"
      },
      {
        "STATE": "17",
        "COUNTY": "033",
        "STNAME": "Illinois",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "18667"
      },
      {
        "STATE": "17",
        "COUNTY": "035",
        "STNAME": "Illinois",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "10766"
      },
      {
        "STATE": "17",
        "COUNTY": "037",
        "STNAME": "Illinois",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "104897"
      },
      {
        "STATE": "17",
        "COUNTY": "039",
        "STNAME": "Illinois",
        "CTYNAME": "De Witt County",
        "POPESTIMATE2019": "15638"
      },
      {
        "STATE": "17",
        "COUNTY": "041",
        "STNAME": "Illinois",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "19465"
      },
      {
        "STATE": "17",
        "COUNTY": "043",
        "STNAME": "Illinois",
        "CTYNAME": "DuPage County",
        "POPESTIMATE2019": "922921"
      },
      {
        "STATE": "17",
        "COUNTY": "045",
        "STNAME": "Illinois",
        "CTYNAME": "Edgar County",
        "POPESTIMATE2019": "17161"
      },
      {
        "STATE": "17",
        "COUNTY": "047",
        "STNAME": "Illinois",
        "CTYNAME": "Edwards County",
        "POPESTIMATE2019": "6395"
      },
      {
        "STATE": "17",
        "COUNTY": "049",
        "STNAME": "Illinois",
        "CTYNAME": "Effingham County",
        "POPESTIMATE2019": "34008"
      },
      {
        "STATE": "17",
        "COUNTY": "051",
        "STNAME": "Illinois",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "21336"
      },
      {
        "STATE": "17",
        "COUNTY": "053",
        "STNAME": "Illinois",
        "CTYNAME": "Ford County",
        "POPESTIMATE2019": "12961"
      },
      {
        "STATE": "17",
        "COUNTY": "055",
        "STNAME": "Illinois",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "38469"
      },
      {
        "STATE": "17",
        "COUNTY": "057",
        "STNAME": "Illinois",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "34340"
      },
      {
        "STATE": "17",
        "COUNTY": "059",
        "STNAME": "Illinois",
        "CTYNAME": "Gallatin County",
        "POPESTIMATE2019": "4828"
      },
      {
        "STATE": "17",
        "COUNTY": "061",
        "STNAME": "Illinois",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "12969"
      },
      {
        "STATE": "17",
        "COUNTY": "063",
        "STNAME": "Illinois",
        "CTYNAME": "Grundy County",
        "POPESTIMATE2019": "51054"
      },
      {
        "STATE": "17",
        "COUNTY": "065",
        "STNAME": "Illinois",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "8116"
      },
      {
        "STATE": "17",
        "COUNTY": "067",
        "STNAME": "Illinois",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "17708"
      },
      {
        "STATE": "17",
        "COUNTY": "069",
        "STNAME": "Illinois",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "3821"
      },
      {
        "STATE": "17",
        "COUNTY": "071",
        "STNAME": "Illinois",
        "CTYNAME": "Henderson County",
        "POPESTIMATE2019": "6646"
      },
      {
        "STATE": "17",
        "COUNTY": "073",
        "STNAME": "Illinois",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "48913"
      },
      {
        "STATE": "17",
        "COUNTY": "075",
        "STNAME": "Illinois",
        "CTYNAME": "Iroquois County",
        "POPESTIMATE2019": "27114"
      },
      {
        "STATE": "17",
        "COUNTY": "077",
        "STNAME": "Illinois",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "56750"
      },
      {
        "STATE": "17",
        "COUNTY": "079",
        "STNAME": "Illinois",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "9610"
      },
      {
        "STATE": "17",
        "COUNTY": "081",
        "STNAME": "Illinois",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "37684"
      },
      {
        "STATE": "17",
        "COUNTY": "083",
        "STNAME": "Illinois",
        "CTYNAME": "Jersey County",
        "POPESTIMATE2019": "21773"
      },
      {
        "STATE": "17",
        "COUNTY": "085",
        "STNAME": "Illinois",
        "CTYNAME": "Jo Daviess County",
        "POPESTIMATE2019": "21235"
      },
      {
        "STATE": "17",
        "COUNTY": "087",
        "STNAME": "Illinois",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "12417"
      },
      {
        "STATE": "17",
        "COUNTY": "089",
        "STNAME": "Illinois",
        "CTYNAME": "Kane County",
        "POPESTIMATE2019": "532403"
      },
      {
        "STATE": "17",
        "COUNTY": "091",
        "STNAME": "Illinois",
        "CTYNAME": "Kankakee County",
        "POPESTIMATE2019": "109862"
      },
      {
        "STATE": "17",
        "COUNTY": "093",
        "STNAME": "Illinois",
        "CTYNAME": "Kendall County",
        "POPESTIMATE2019": "128990"
      },
      {
        "STATE": "17",
        "COUNTY": "095",
        "STNAME": "Illinois",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "49699"
      },
      {
        "STATE": "17",
        "COUNTY": "097",
        "STNAME": "Illinois",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "696535"
      },
      {
        "STATE": "17",
        "COUNTY": "099",
        "STNAME": "Illinois",
        "CTYNAME": "LaSalle County",
        "POPESTIMATE2019": "108669"
      },
      {
        "STATE": "17",
        "COUNTY": "101",
        "STNAME": "Illinois",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "15678"
      },
      {
        "STATE": "17",
        "COUNTY": "103",
        "STNAME": "Illinois",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "34096"
      },
      {
        "STATE": "17",
        "COUNTY": "105",
        "STNAME": "Illinois",
        "CTYNAME": "Livingston County",
        "POPESTIMATE2019": "35648"
      },
      {
        "STATE": "17",
        "COUNTY": "107",
        "STNAME": "Illinois",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "28618"
      },
      {
        "STATE": "17",
        "COUNTY": "109",
        "STNAME": "Illinois",
        "CTYNAME": "McDonough County",
        "POPESTIMATE2019": "29682"
      },
      {
        "STATE": "17",
        "COUNTY": "111",
        "STNAME": "Illinois",
        "CTYNAME": "McHenry County",
        "POPESTIMATE2019": "307774"
      },
      {
        "STATE": "17",
        "COUNTY": "113",
        "STNAME": "Illinois",
        "CTYNAME": "McLean County",
        "POPESTIMATE2019": "171517"
      },
      {
        "STATE": "17",
        "COUNTY": "115",
        "STNAME": "Illinois",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "104009"
      },
      {
        "STATE": "17",
        "COUNTY": "117",
        "STNAME": "Illinois",
        "CTYNAME": "Macoupin County",
        "POPESTIMATE2019": "44926"
      },
      {
        "STATE": "17",
        "COUNTY": "119",
        "STNAME": "Illinois",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "262966"
      },
      {
        "STATE": "17",
        "COUNTY": "121",
        "STNAME": "Illinois",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "37205"
      },
      {
        "STATE": "17",
        "COUNTY": "123",
        "STNAME": "Illinois",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "11438"
      },
      {
        "STATE": "17",
        "COUNTY": "125",
        "STNAME": "Illinois",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "13359"
      },
      {
        "STATE": "17",
        "COUNTY": "127",
        "STNAME": "Illinois",
        "CTYNAME": "Massac County",
        "POPESTIMATE2019": "13772"
      },
      {
        "STATE": "17",
        "COUNTY": "129",
        "STNAME": "Illinois",
        "CTYNAME": "Menard County",
        "POPESTIMATE2019": "12196"
      },
      {
        "STATE": "17",
        "COUNTY": "131",
        "STNAME": "Illinois",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "15437"
      },
      {
        "STATE": "17",
        "COUNTY": "133",
        "STNAME": "Illinois",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "34637"
      },
      {
        "STATE": "17",
        "COUNTY": "135",
        "STNAME": "Illinois",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "28414"
      },
      {
        "STATE": "17",
        "COUNTY": "137",
        "STNAME": "Illinois",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "33658"
      },
      {
        "STATE": "17",
        "COUNTY": "139",
        "STNAME": "Illinois",
        "CTYNAME": "Moultrie County",
        "POPESTIMATE2019": "14501"
      },
      {
        "STATE": "17",
        "COUNTY": "141",
        "STNAME": "Illinois",
        "CTYNAME": "Ogle County",
        "POPESTIMATE2019": "50643"
      },
      {
        "STATE": "17",
        "COUNTY": "143",
        "STNAME": "Illinois",
        "CTYNAME": "Peoria County",
        "POPESTIMATE2019": "179179"
      },
      {
        "STATE": "17",
        "COUNTY": "145",
        "STNAME": "Illinois",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "20916"
      },
      {
        "STATE": "17",
        "COUNTY": "147",
        "STNAME": "Illinois",
        "CTYNAME": "Piatt County",
        "POPESTIMATE2019": "16344"
      },
      {
        "STATE": "17",
        "COUNTY": "149",
        "STNAME": "Illinois",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "15561"
      },
      {
        "STATE": "17",
        "COUNTY": "151",
        "STNAME": "Illinois",
        "CTYNAME": "Pope County",
        "POPESTIMATE2019": "4177"
      },
      {
        "STATE": "17",
        "COUNTY": "153",
        "STNAME": "Illinois",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "5335"
      },
      {
        "STATE": "17",
        "COUNTY": "155",
        "STNAME": "Illinois",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "5739"
      },
      {
        "STATE": "17",
        "COUNTY": "157",
        "STNAME": "Illinois",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "31782"
      },
      {
        "STATE": "17",
        "COUNTY": "159",
        "STNAME": "Illinois",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "15513"
      },
      {
        "STATE": "17",
        "COUNTY": "161",
        "STNAME": "Illinois",
        "CTYNAME": "Rock Island County",
        "POPESTIMATE2019": "141879"
      },
      {
        "STATE": "17",
        "COUNTY": "163",
        "STNAME": "Illinois",
        "CTYNAME": "St. Clair County",
        "POPESTIMATE2019": "259686"
      },
      {
        "STATE": "17",
        "COUNTY": "165",
        "STNAME": "Illinois",
        "CTYNAME": "Saline County",
        "POPESTIMATE2019": "23491"
      },
      {
        "STATE": "17",
        "COUNTY": "167",
        "STNAME": "Illinois",
        "CTYNAME": "Sangamon County",
        "POPESTIMATE2019": "194672"
      },
      {
        "STATE": "17",
        "COUNTY": "169",
        "STNAME": "Illinois",
        "CTYNAME": "Schuyler County",
        "POPESTIMATE2019": "6768"
      },
      {
        "STATE": "17",
        "COUNTY": "171",
        "STNAME": "Illinois",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "4951"
      },
      {
        "STATE": "17",
        "COUNTY": "173",
        "STNAME": "Illinois",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "21634"
      },
      {
        "STATE": "17",
        "COUNTY": "175",
        "STNAME": "Illinois",
        "CTYNAME": "Stark County",
        "POPESTIMATE2019": "5342"
      },
      {
        "STATE": "17",
        "COUNTY": "177",
        "STNAME": "Illinois",
        "CTYNAME": "Stephenson County",
        "POPESTIMATE2019": "44498"
      },
      {
        "STATE": "17",
        "COUNTY": "179",
        "STNAME": "Illinois",
        "CTYNAME": "Tazewell County",
        "POPESTIMATE2019": "131803"
      },
      {
        "STATE": "17",
        "COUNTY": "181",
        "STNAME": "Illinois",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "16653"
      },
      {
        "STATE": "17",
        "COUNTY": "183",
        "STNAME": "Illinois",
        "CTYNAME": "Vermilion County",
        "POPESTIMATE2019": "75758"
      },
      {
        "STATE": "17",
        "COUNTY": "185",
        "STNAME": "Illinois",
        "CTYNAME": "Wabash County",
        "POPESTIMATE2019": "11520"
      },
      {
        "STATE": "17",
        "COUNTY": "187",
        "STNAME": "Illinois",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "16844"
      },
      {
        "STATE": "17",
        "COUNTY": "189",
        "STNAME": "Illinois",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "13887"
      },
      {
        "STATE": "17",
        "COUNTY": "191",
        "STNAME": "Illinois",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "16215"
      },
      {
        "STATE": "17",
        "COUNTY": "193",
        "STNAME": "Illinois",
        "CTYNAME": "White County",
        "POPESTIMATE2019": "13537"
      },
      {
        "STATE": "17",
        "COUNTY": "195",
        "STNAME": "Illinois",
        "CTYNAME": "Whiteside County",
        "POPESTIMATE2019": "55175"
      },
      {
        "STATE": "17",
        "COUNTY": "197",
        "STNAME": "Illinois",
        "CTYNAME": "Will County",
        "POPESTIMATE2019": "690743"
      },
      {
        "STATE": "17",
        "COUNTY": "199",
        "STNAME": "Illinois",
        "CTYNAME": "Williamson County",
        "POPESTIMATE2019": "66597"
      },
      {
        "STATE": "17",
        "COUNTY": "201",
        "STNAME": "Illinois",
        "CTYNAME": "Winnebago County",
        "POPESTIMATE2019": "282572"
      },
      {
        "STATE": "17",
        "COUNTY": "203",
        "STNAME": "Illinois",
        "CTYNAME": "Woodford County",
        "POPESTIMATE2019": "38459"
      },
      {
        "STATE": "18",
        "COUNTY": "000",
        "STNAME": "Indiana",
        "CTYNAME": "Indiana",
        "POPESTIMATE2019": "6732219"
      },
      {
        "STATE": "18",
        "COUNTY": "001",
        "STNAME": "Indiana",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "35777"
      },
      {
        "STATE": "18",
        "COUNTY": "003",
        "STNAME": "Indiana",
        "CTYNAME": "Allen County",
        "POPESTIMATE2019": "379299"
      },
      {
        "STATE": "18",
        "COUNTY": "005",
        "STNAME": "Indiana",
        "CTYNAME": "Bartholomew County",
        "POPESTIMATE2019": "83779"
      },
      {
        "STATE": "18",
        "COUNTY": "007",
        "STNAME": "Indiana",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "8748"
      },
      {
        "STATE": "18",
        "COUNTY": "009",
        "STNAME": "Indiana",
        "CTYNAME": "Blackford County",
        "POPESTIMATE2019": "11758"
      },
      {
        "STATE": "18",
        "COUNTY": "011",
        "STNAME": "Indiana",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "67843"
      },
      {
        "STATE": "18",
        "COUNTY": "013",
        "STNAME": "Indiana",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "15092"
      },
      {
        "STATE": "18",
        "COUNTY": "015",
        "STNAME": "Indiana",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "20257"
      },
      {
        "STATE": "18",
        "COUNTY": "017",
        "STNAME": "Indiana",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "37689"
      },
      {
        "STATE": "18",
        "COUNTY": "019",
        "STNAME": "Indiana",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "118302"
      },
      {
        "STATE": "18",
        "COUNTY": "021",
        "STNAME": "Indiana",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "26225"
      },
      {
        "STATE": "18",
        "COUNTY": "023",
        "STNAME": "Indiana",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "32399"
      },
      {
        "STATE": "18",
        "COUNTY": "025",
        "STNAME": "Indiana",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "10577"
      },
      {
        "STATE": "18",
        "COUNTY": "027",
        "STNAME": "Indiana",
        "CTYNAME": "Daviess County",
        "POPESTIMATE2019": "33351"
      },
      {
        "STATE": "18",
        "COUNTY": "029",
        "STNAME": "Indiana",
        "CTYNAME": "Dearborn County",
        "POPESTIMATE2019": "49458"
      },
      {
        "STATE": "18",
        "COUNTY": "031",
        "STNAME": "Indiana",
        "CTYNAME": "Decatur County",
        "POPESTIMATE2019": "26559"
      },
      {
        "STATE": "18",
        "COUNTY": "033",
        "STNAME": "Indiana",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "43475"
      },
      {
        "STATE": "18",
        "COUNTY": "035",
        "STNAME": "Indiana",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "114135"
      },
      {
        "STATE": "18",
        "COUNTY": "037",
        "STNAME": "Indiana",
        "CTYNAME": "Dubois County",
        "POPESTIMATE2019": "42736"
      },
      {
        "STATE": "18",
        "COUNTY": "039",
        "STNAME": "Indiana",
        "CTYNAME": "Elkhart County",
        "POPESTIMATE2019": "206341"
      },
      {
        "STATE": "18",
        "COUNTY": "041",
        "STNAME": "Indiana",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "23102"
      },
      {
        "STATE": "18",
        "COUNTY": "043",
        "STNAME": "Indiana",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "78522"
      },
      {
        "STATE": "18",
        "COUNTY": "045",
        "STNAME": "Indiana",
        "CTYNAME": "Fountain County",
        "POPESTIMATE2019": "16346"
      },
      {
        "STATE": "18",
        "COUNTY": "047",
        "STNAME": "Indiana",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "22758"
      },
      {
        "STATE": "18",
        "COUNTY": "049",
        "STNAME": "Indiana",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "19974"
      },
      {
        "STATE": "18",
        "COUNTY": "051",
        "STNAME": "Indiana",
        "CTYNAME": "Gibson County",
        "POPESTIMATE2019": "33659"
      },
      {
        "STATE": "18",
        "COUNTY": "053",
        "STNAME": "Indiana",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "65769"
      },
      {
        "STATE": "18",
        "COUNTY": "055",
        "STNAME": "Indiana",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "31922"
      },
      {
        "STATE": "18",
        "COUNTY": "057",
        "STNAME": "Indiana",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "338011"
      },
      {
        "STATE": "18",
        "COUNTY": "059",
        "STNAME": "Indiana",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "78168"
      },
      {
        "STATE": "18",
        "COUNTY": "061",
        "STNAME": "Indiana",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "40515"
      },
      {
        "STATE": "18",
        "COUNTY": "063",
        "STNAME": "Indiana",
        "CTYNAME": "Hendricks County",
        "POPESTIMATE2019": "170311"
      },
      {
        "STATE": "18",
        "COUNTY": "065",
        "STNAME": "Indiana",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "47972"
      },
      {
        "STATE": "18",
        "COUNTY": "067",
        "STNAME": "Indiana",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "82544"
      },
      {
        "STATE": "18",
        "COUNTY": "069",
        "STNAME": "Indiana",
        "CTYNAME": "Huntington County",
        "POPESTIMATE2019": "36520"
      },
      {
        "STATE": "18",
        "COUNTY": "071",
        "STNAME": "Indiana",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "44231"
      },
      {
        "STATE": "18",
        "COUNTY": "073",
        "STNAME": "Indiana",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "33562"
      },
      {
        "STATE": "18",
        "COUNTY": "075",
        "STNAME": "Indiana",
        "CTYNAME": "Jay County",
        "POPESTIMATE2019": "20436"
      },
      {
        "STATE": "18",
        "COUNTY": "077",
        "STNAME": "Indiana",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "32308"
      },
      {
        "STATE": "18",
        "COUNTY": "079",
        "STNAME": "Indiana",
        "CTYNAME": "Jennings County",
        "POPESTIMATE2019": "27735"
      },
      {
        "STATE": "18",
        "COUNTY": "081",
        "STNAME": "Indiana",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "158167"
      },
      {
        "STATE": "18",
        "COUNTY": "083",
        "STNAME": "Indiana",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "36594"
      },
      {
        "STATE": "18",
        "COUNTY": "085",
        "STNAME": "Indiana",
        "CTYNAME": "Kosciusko County",
        "POPESTIMATE2019": "79456"
      },
      {
        "STATE": "18",
        "COUNTY": "087",
        "STNAME": "Indiana",
        "CTYNAME": "LaGrange County",
        "POPESTIMATE2019": "39614"
      },
      {
        "STATE": "18",
        "COUNTY": "089",
        "STNAME": "Indiana",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "485493"
      },
      {
        "STATE": "18",
        "COUNTY": "091",
        "STNAME": "Indiana",
        "CTYNAME": "LaPorte County",
        "POPESTIMATE2019": "109888"
      },
      {
        "STATE": "18",
        "COUNTY": "093",
        "STNAME": "Indiana",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "45370"
      },
      {
        "STATE": "18",
        "COUNTY": "095",
        "STNAME": "Indiana",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "129569"
      },
      {
        "STATE": "18",
        "COUNTY": "097",
        "STNAME": "Indiana",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "964582"
      },
      {
        "STATE": "18",
        "COUNTY": "099",
        "STNAME": "Indiana",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "46258"
      },
      {
        "STATE": "18",
        "COUNTY": "101",
        "STNAME": "Indiana",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "10255"
      },
      {
        "STATE": "18",
        "COUNTY": "103",
        "STNAME": "Indiana",
        "CTYNAME": "Miami County",
        "POPESTIMATE2019": "35516"
      },
      {
        "STATE": "18",
        "COUNTY": "105",
        "STNAME": "Indiana",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "148431"
      },
      {
        "STATE": "18",
        "COUNTY": "107",
        "STNAME": "Indiana",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "38338"
      },
      {
        "STATE": "18",
        "COUNTY": "109",
        "STNAME": "Indiana",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "70489"
      },
      {
        "STATE": "18",
        "COUNTY": "111",
        "STNAME": "Indiana",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "13984"
      },
      {
        "STATE": "18",
        "COUNTY": "113",
        "STNAME": "Indiana",
        "CTYNAME": "Noble County",
        "POPESTIMATE2019": "47744"
      },
      {
        "STATE": "18",
        "COUNTY": "115",
        "STNAME": "Indiana",
        "CTYNAME": "Ohio County",
        "POPESTIMATE2019": "5875"
      },
      {
        "STATE": "18",
        "COUNTY": "117",
        "STNAME": "Indiana",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "19646"
      },
      {
        "STATE": "18",
        "COUNTY": "119",
        "STNAME": "Indiana",
        "CTYNAME": "Owen County",
        "POPESTIMATE2019": "20799"
      },
      {
        "STATE": "18",
        "COUNTY": "121",
        "STNAME": "Indiana",
        "CTYNAME": "Parke County",
        "POPESTIMATE2019": "16937"
      },
      {
        "STATE": "18",
        "COUNTY": "123",
        "STNAME": "Indiana",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "19169"
      },
      {
        "STATE": "18",
        "COUNTY": "125",
        "STNAME": "Indiana",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "12389"
      },
      {
        "STATE": "18",
        "COUNTY": "127",
        "STNAME": "Indiana",
        "CTYNAME": "Porter County",
        "POPESTIMATE2019": "170389"
      },
      {
        "STATE": "18",
        "COUNTY": "129",
        "STNAME": "Indiana",
        "CTYNAME": "Posey County",
        "POPESTIMATE2019": "25427"
      },
      {
        "STATE": "18",
        "COUNTY": "131",
        "STNAME": "Indiana",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "12353"
      },
      {
        "STATE": "18",
        "COUNTY": "133",
        "STNAME": "Indiana",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "37576"
      },
      {
        "STATE": "18",
        "COUNTY": "135",
        "STNAME": "Indiana",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "24665"
      },
      {
        "STATE": "18",
        "COUNTY": "137",
        "STNAME": "Indiana",
        "CTYNAME": "Ripley County",
        "POPESTIMATE2019": "28324"
      },
      {
        "STATE": "18",
        "COUNTY": "139",
        "STNAME": "Indiana",
        "CTYNAME": "Rush County",
        "POPESTIMATE2019": "16581"
      },
      {
        "STATE": "18",
        "COUNTY": "141",
        "STNAME": "Indiana",
        "CTYNAME": "St. Joseph County",
        "POPESTIMATE2019": "271826"
      },
      {
        "STATE": "18",
        "COUNTY": "143",
        "STNAME": "Indiana",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "23873"
      },
      {
        "STATE": "18",
        "COUNTY": "145",
        "STNAME": "Indiana",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "44729"
      },
      {
        "STATE": "18",
        "COUNTY": "147",
        "STNAME": "Indiana",
        "CTYNAME": "Spencer County",
        "POPESTIMATE2019": "20277"
      },
      {
        "STATE": "18",
        "COUNTY": "149",
        "STNAME": "Indiana",
        "CTYNAME": "Starke County",
        "POPESTIMATE2019": "22995"
      },
      {
        "STATE": "18",
        "COUNTY": "151",
        "STNAME": "Indiana",
        "CTYNAME": "Steuben County",
        "POPESTIMATE2019": "34594"
      },
      {
        "STATE": "18",
        "COUNTY": "153",
        "STNAME": "Indiana",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "20669"
      },
      {
        "STATE": "18",
        "COUNTY": "155",
        "STNAME": "Indiana",
        "CTYNAME": "Switzerland County",
        "POPESTIMATE2019": "10751"
      },
      {
        "STATE": "18",
        "COUNTY": "157",
        "STNAME": "Indiana",
        "CTYNAME": "Tippecanoe County",
        "POPESTIMATE2019": "195732"
      },
      {
        "STATE": "18",
        "COUNTY": "159",
        "STNAME": "Indiana",
        "CTYNAME": "Tipton County",
        "POPESTIMATE2019": "15148"
      },
      {
        "STATE": "18",
        "COUNTY": "161",
        "STNAME": "Indiana",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "7054"
      },
      {
        "STATE": "18",
        "COUNTY": "163",
        "STNAME": "Indiana",
        "CTYNAME": "Vanderburgh County",
        "POPESTIMATE2019": "181451"
      },
      {
        "STATE": "18",
        "COUNTY": "165",
        "STNAME": "Indiana",
        "CTYNAME": "Vermillion County",
        "POPESTIMATE2019": "15498"
      },
      {
        "STATE": "18",
        "COUNTY": "167",
        "STNAME": "Indiana",
        "CTYNAME": "Vigo County",
        "POPESTIMATE2019": "107038"
      },
      {
        "STATE": "18",
        "COUNTY": "169",
        "STNAME": "Indiana",
        "CTYNAME": "Wabash County",
        "POPESTIMATE2019": "30996"
      },
      {
        "STATE": "18",
        "COUNTY": "171",
        "STNAME": "Indiana",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "8265"
      },
      {
        "STATE": "18",
        "COUNTY": "173",
        "STNAME": "Indiana",
        "CTYNAME": "Warrick County",
        "POPESTIMATE2019": "62998"
      },
      {
        "STATE": "18",
        "COUNTY": "175",
        "STNAME": "Indiana",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "28036"
      },
      {
        "STATE": "18",
        "COUNTY": "177",
        "STNAME": "Indiana",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "65884"
      },
      {
        "STATE": "18",
        "COUNTY": "179",
        "STNAME": "Indiana",
        "CTYNAME": "Wells County",
        "POPESTIMATE2019": "28296"
      },
      {
        "STATE": "18",
        "COUNTY": "181",
        "STNAME": "Indiana",
        "CTYNAME": "White County",
        "POPESTIMATE2019": "24102"
      },
      {
        "STATE": "18",
        "COUNTY": "183",
        "STNAME": "Indiana",
        "CTYNAME": "Whitley County",
        "POPESTIMATE2019": "33964"
      },
      {
        "STATE": "19",
        "COUNTY": "000",
        "STNAME": "Iowa",
        "CTYNAME": "Iowa",
        "POPESTIMATE2019": "3155070"
      },
      {
        "STATE": "19",
        "COUNTY": "001",
        "STNAME": "Iowa",
        "CTYNAME": "Adair County",
        "POPESTIMATE2019": "7152"
      },
      {
        "STATE": "19",
        "COUNTY": "003",
        "STNAME": "Iowa",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "3602"
      },
      {
        "STATE": "19",
        "COUNTY": "005",
        "STNAME": "Iowa",
        "CTYNAME": "Allamakee County",
        "POPESTIMATE2019": "13687"
      },
      {
        "STATE": "19",
        "COUNTY": "007",
        "STNAME": "Iowa",
        "CTYNAME": "Appanoose County",
        "POPESTIMATE2019": "12426"
      },
      {
        "STATE": "19",
        "COUNTY": "009",
        "STNAME": "Iowa",
        "CTYNAME": "Audubon County",
        "POPESTIMATE2019": "5496"
      },
      {
        "STATE": "19",
        "COUNTY": "011",
        "STNAME": "Iowa",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "25645"
      },
      {
        "STATE": "19",
        "COUNTY": "013",
        "STNAME": "Iowa",
        "CTYNAME": "Black Hawk County",
        "POPESTIMATE2019": "131228"
      },
      {
        "STATE": "19",
        "COUNTY": "015",
        "STNAME": "Iowa",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "26234"
      },
      {
        "STATE": "19",
        "COUNTY": "017",
        "STNAME": "Iowa",
        "CTYNAME": "Bremer County",
        "POPESTIMATE2019": "25062"
      },
      {
        "STATE": "19",
        "COUNTY": "019",
        "STNAME": "Iowa",
        "CTYNAME": "Buchanan County",
        "POPESTIMATE2019": "21175"
      },
      {
        "STATE": "19",
        "COUNTY": "021",
        "STNAME": "Iowa",
        "CTYNAME": "Buena Vista County",
        "POPESTIMATE2019": "19620"
      },
      {
        "STATE": "19",
        "COUNTY": "023",
        "STNAME": "Iowa",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "14439"
      },
      {
        "STATE": "19",
        "COUNTY": "025",
        "STNAME": "Iowa",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "9668"
      },
      {
        "STATE": "19",
        "COUNTY": "027",
        "STNAME": "Iowa",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "20165"
      },
      {
        "STATE": "19",
        "COUNTY": "029",
        "STNAME": "Iowa",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "12836"
      },
      {
        "STATE": "19",
        "COUNTY": "031",
        "STNAME": "Iowa",
        "CTYNAME": "Cedar County",
        "POPESTIMATE2019": "18627"
      },
      {
        "STATE": "19",
        "COUNTY": "033",
        "STNAME": "Iowa",
        "CTYNAME": "Cerro Gordo County",
        "POPESTIMATE2019": "42450"
      },
      {
        "STATE": "19",
        "COUNTY": "035",
        "STNAME": "Iowa",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "11235"
      },
      {
        "STATE": "19",
        "COUNTY": "037",
        "STNAME": "Iowa",
        "CTYNAME": "Chickasaw County",
        "POPESTIMATE2019": "11933"
      },
      {
        "STATE": "19",
        "COUNTY": "039",
        "STNAME": "Iowa",
        "CTYNAME": "Clarke County",
        "POPESTIMATE2019": "9395"
      },
      {
        "STATE": "19",
        "COUNTY": "041",
        "STNAME": "Iowa",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "16016"
      },
      {
        "STATE": "19",
        "COUNTY": "043",
        "STNAME": "Iowa",
        "CTYNAME": "Clayton County",
        "POPESTIMATE2019": "17549"
      },
      {
        "STATE": "19",
        "COUNTY": "045",
        "STNAME": "Iowa",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "46429"
      },
      {
        "STATE": "19",
        "COUNTY": "047",
        "STNAME": "Iowa",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "16820"
      },
      {
        "STATE": "19",
        "COUNTY": "049",
        "STNAME": "Iowa",
        "CTYNAME": "Dallas County",
        "POPESTIMATE2019": "93453"
      },
      {
        "STATE": "19",
        "COUNTY": "051",
        "STNAME": "Iowa",
        "CTYNAME": "Davis County",
        "POPESTIMATE2019": "9000"
      },
      {
        "STATE": "19",
        "COUNTY": "053",
        "STNAME": "Iowa",
        "CTYNAME": "Decatur County",
        "POPESTIMATE2019": "7870"
      },
      {
        "STATE": "19",
        "COUNTY": "055",
        "STNAME": "Iowa",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "17011"
      },
      {
        "STATE": "19",
        "COUNTY": "057",
        "STNAME": "Iowa",
        "CTYNAME": "Des Moines County",
        "POPESTIMATE2019": "38967"
      },
      {
        "STATE": "19",
        "COUNTY": "059",
        "STNAME": "Iowa",
        "CTYNAME": "Dickinson County",
        "POPESTIMATE2019": "17258"
      },
      {
        "STATE": "19",
        "COUNTY": "061",
        "STNAME": "Iowa",
        "CTYNAME": "Dubuque County",
        "POPESTIMATE2019": "97311"
      },
      {
        "STATE": "19",
        "COUNTY": "063",
        "STNAME": "Iowa",
        "CTYNAME": "Emmet County",
        "POPESTIMATE2019": "9208"
      },
      {
        "STATE": "19",
        "COUNTY": "065",
        "STNAME": "Iowa",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "19650"
      },
      {
        "STATE": "19",
        "COUNTY": "067",
        "STNAME": "Iowa",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "15642"
      },
      {
        "STATE": "19",
        "COUNTY": "069",
        "STNAME": "Iowa",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "10070"
      },
      {
        "STATE": "19",
        "COUNTY": "071",
        "STNAME": "Iowa",
        "CTYNAME": "Fremont County",
        "POPESTIMATE2019": "6960"
      },
      {
        "STATE": "19",
        "COUNTY": "073",
        "STNAME": "Iowa",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "8888"
      },
      {
        "STATE": "19",
        "COUNTY": "075",
        "STNAME": "Iowa",
        "CTYNAME": "Grundy County",
        "POPESTIMATE2019": "12232"
      },
      {
        "STATE": "19",
        "COUNTY": "077",
        "STNAME": "Iowa",
        "CTYNAME": "Guthrie County",
        "POPESTIMATE2019": "10689"
      },
      {
        "STATE": "19",
        "COUNTY": "079",
        "STNAME": "Iowa",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "14773"
      },
      {
        "STATE": "19",
        "COUNTY": "081",
        "STNAME": "Iowa",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "10630"
      },
      {
        "STATE": "19",
        "COUNTY": "083",
        "STNAME": "Iowa",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "16846"
      },
      {
        "STATE": "19",
        "COUNTY": "085",
        "STNAME": "Iowa",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "14049"
      },
      {
        "STATE": "19",
        "COUNTY": "087",
        "STNAME": "Iowa",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "19954"
      },
      {
        "STATE": "19",
        "COUNTY": "089",
        "STNAME": "Iowa",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "9158"
      },
      {
        "STATE": "19",
        "COUNTY": "091",
        "STNAME": "Iowa",
        "CTYNAME": "Humboldt County",
        "POPESTIMATE2019": "9558"
      },
      {
        "STATE": "19",
        "COUNTY": "093",
        "STNAME": "Iowa",
        "CTYNAME": "Ida County",
        "POPESTIMATE2019": "6860"
      },
      {
        "STATE": "19",
        "COUNTY": "095",
        "STNAME": "Iowa",
        "CTYNAME": "Iowa County",
        "POPESTIMATE2019": "16184"
      },
      {
        "STATE": "19",
        "COUNTY": "097",
        "STNAME": "Iowa",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "19439"
      },
      {
        "STATE": "19",
        "COUNTY": "099",
        "STNAME": "Iowa",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "37185"
      },
      {
        "STATE": "19",
        "COUNTY": "101",
        "STNAME": "Iowa",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "18295"
      },
      {
        "STATE": "19",
        "COUNTY": "103",
        "STNAME": "Iowa",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "151140"
      },
      {
        "STATE": "19",
        "COUNTY": "105",
        "STNAME": "Iowa",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "20681"
      },
      {
        "STATE": "19",
        "COUNTY": "107",
        "STNAME": "Iowa",
        "CTYNAME": "Keokuk County",
        "POPESTIMATE2019": "10246"
      },
      {
        "STATE": "19",
        "COUNTY": "109",
        "STNAME": "Iowa",
        "CTYNAME": "Kossuth County",
        "POPESTIMATE2019": "14813"
      },
      {
        "STATE": "19",
        "COUNTY": "111",
        "STNAME": "Iowa",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "33657"
      },
      {
        "STATE": "19",
        "COUNTY": "113",
        "STNAME": "Iowa",
        "CTYNAME": "Linn County",
        "POPESTIMATE2019": "226706"
      },
      {
        "STATE": "19",
        "COUNTY": "115",
        "STNAME": "Iowa",
        "CTYNAME": "Louisa County",
        "POPESTIMATE2019": "11035"
      },
      {
        "STATE": "19",
        "COUNTY": "117",
        "STNAME": "Iowa",
        "CTYNAME": "Lucas County",
        "POPESTIMATE2019": "8600"
      },
      {
        "STATE": "19",
        "COUNTY": "119",
        "STNAME": "Iowa",
        "CTYNAME": "Lyon County",
        "POPESTIMATE2019": "11755"
      },
      {
        "STATE": "19",
        "COUNTY": "121",
        "STNAME": "Iowa",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "16338"
      },
      {
        "STATE": "19",
        "COUNTY": "123",
        "STNAME": "Iowa",
        "CTYNAME": "Mahaska County",
        "POPESTIMATE2019": "22095"
      },
      {
        "STATE": "19",
        "COUNTY": "125",
        "STNAME": "Iowa",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "33253"
      },
      {
        "STATE": "19",
        "COUNTY": "127",
        "STNAME": "Iowa",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "39369"
      },
      {
        "STATE": "19",
        "COUNTY": "129",
        "STNAME": "Iowa",
        "CTYNAME": "Mills County",
        "POPESTIMATE2019": "15109"
      },
      {
        "STATE": "19",
        "COUNTY": "131",
        "STNAME": "Iowa",
        "CTYNAME": "Mitchell County",
        "POPESTIMATE2019": "10586"
      },
      {
        "STATE": "19",
        "COUNTY": "133",
        "STNAME": "Iowa",
        "CTYNAME": "Monona County",
        "POPESTIMATE2019": "8615"
      },
      {
        "STATE": "19",
        "COUNTY": "135",
        "STNAME": "Iowa",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "7707"
      },
      {
        "STATE": "19",
        "COUNTY": "137",
        "STNAME": "Iowa",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "9917"
      },
      {
        "STATE": "19",
        "COUNTY": "139",
        "STNAME": "Iowa",
        "CTYNAME": "Muscatine County",
        "POPESTIMATE2019": "42664"
      },
      {
        "STATE": "19",
        "COUNTY": "141",
        "STNAME": "Iowa",
        "CTYNAME": "O'Brien County",
        "POPESTIMATE2019": "13753"
      },
      {
        "STATE": "19",
        "COUNTY": "143",
        "STNAME": "Iowa",
        "CTYNAME": "Osceola County",
        "POPESTIMATE2019": "5958"
      },
      {
        "STATE": "19",
        "COUNTY": "145",
        "STNAME": "Iowa",
        "CTYNAME": "Page County",
        "POPESTIMATE2019": "15107"
      },
      {
        "STATE": "19",
        "COUNTY": "147",
        "STNAME": "Iowa",
        "CTYNAME": "Palo Alto County",
        "POPESTIMATE2019": "8886"
      },
      {
        "STATE": "19",
        "COUNTY": "149",
        "STNAME": "Iowa",
        "CTYNAME": "Plymouth County",
        "POPESTIMATE2019": "25177"
      },
      {
        "STATE": "19",
        "COUNTY": "151",
        "STNAME": "Iowa",
        "CTYNAME": "Pocahontas County",
        "POPESTIMATE2019": "6619"
      },
      {
        "STATE": "19",
        "COUNTY": "153",
        "STNAME": "Iowa",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "490161"
      },
      {
        "STATE": "19",
        "COUNTY": "155",
        "STNAME": "Iowa",
        "CTYNAME": "Pottawattamie County",
        "POPESTIMATE2019": "93206"
      },
      {
        "STATE": "19",
        "COUNTY": "157",
        "STNAME": "Iowa",
        "CTYNAME": "Poweshiek County",
        "POPESTIMATE2019": "18504"
      },
      {
        "STATE": "19",
        "COUNTY": "159",
        "STNAME": "Iowa",
        "CTYNAME": "Ringgold County",
        "POPESTIMATE2019": "4894"
      },
      {
        "STATE": "19",
        "COUNTY": "161",
        "STNAME": "Iowa",
        "CTYNAME": "Sac County",
        "POPESTIMATE2019": "9721"
      },
      {
        "STATE": "19",
        "COUNTY": "163",
        "STNAME": "Iowa",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "172943"
      },
      {
        "STATE": "19",
        "COUNTY": "165",
        "STNAME": "Iowa",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "11454"
      },
      {
        "STATE": "19",
        "COUNTY": "167",
        "STNAME": "Iowa",
        "CTYNAME": "Sioux County",
        "POPESTIMATE2019": "34855"
      },
      {
        "STATE": "19",
        "COUNTY": "169",
        "STNAME": "Iowa",
        "CTYNAME": "Story County",
        "POPESTIMATE2019": "97117"
      },
      {
        "STATE": "19",
        "COUNTY": "171",
        "STNAME": "Iowa",
        "CTYNAME": "Tama County",
        "POPESTIMATE2019": "16854"
      },
      {
        "STATE": "19",
        "COUNTY": "173",
        "STNAME": "Iowa",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "6121"
      },
      {
        "STATE": "19",
        "COUNTY": "175",
        "STNAME": "Iowa",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "12241"
      },
      {
        "STATE": "19",
        "COUNTY": "177",
        "STNAME": "Iowa",
        "CTYNAME": "Van Buren County",
        "POPESTIMATE2019": "7044"
      },
      {
        "STATE": "19",
        "COUNTY": "179",
        "STNAME": "Iowa",
        "CTYNAME": "Wapello County",
        "POPESTIMATE2019": "34969"
      },
      {
        "STATE": "19",
        "COUNTY": "181",
        "STNAME": "Iowa",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "51466"
      },
      {
        "STATE": "19",
        "COUNTY": "183",
        "STNAME": "Iowa",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "21965"
      },
      {
        "STATE": "19",
        "COUNTY": "185",
        "STNAME": "Iowa",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "6441"
      },
      {
        "STATE": "19",
        "COUNTY": "187",
        "STNAME": "Iowa",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "35904"
      },
      {
        "STATE": "19",
        "COUNTY": "189",
        "STNAME": "Iowa",
        "CTYNAME": "Winnebago County",
        "POPESTIMATE2019": "10354"
      },
      {
        "STATE": "19",
        "COUNTY": "191",
        "STNAME": "Iowa",
        "CTYNAME": "Winneshiek County",
        "POPESTIMATE2019": "19991"
      },
      {
        "STATE": "19",
        "COUNTY": "193",
        "STNAME": "Iowa",
        "CTYNAME": "Woodbury County",
        "POPESTIMATE2019": "103107"
      },
      {
        "STATE": "19",
        "COUNTY": "195",
        "STNAME": "Iowa",
        "CTYNAME": "Worth County",
        "POPESTIMATE2019": "7381"
      },
      {
        "STATE": "19",
        "COUNTY": "197",
        "STNAME": "Iowa",
        "CTYNAME": "Wright County",
        "POPESTIMATE2019": "12562"
      },
      {
        "STATE": "20",
        "COUNTY": "000",
        "STNAME": "Kansas",
        "CTYNAME": "Kansas",
        "POPESTIMATE2019": "2913314"
      },
      {
        "STATE": "20",
        "COUNTY": "001",
        "STNAME": "Kansas",
        "CTYNAME": "Allen County",
        "POPESTIMATE2019": "12369"
      },
      {
        "STATE": "20",
        "COUNTY": "003",
        "STNAME": "Kansas",
        "CTYNAME": "Anderson County",
        "POPESTIMATE2019": "7858"
      },
      {
        "STATE": "20",
        "COUNTY": "005",
        "STNAME": "Kansas",
        "CTYNAME": "Atchison County",
        "POPESTIMATE2019": "16073"
      },
      {
        "STATE": "20",
        "COUNTY": "007",
        "STNAME": "Kansas",
        "CTYNAME": "Barber County",
        "POPESTIMATE2019": "4427"
      },
      {
        "STATE": "20",
        "COUNTY": "009",
        "STNAME": "Kansas",
        "CTYNAME": "Barton County",
        "POPESTIMATE2019": "25779"
      },
      {
        "STATE": "20",
        "COUNTY": "011",
        "STNAME": "Kansas",
        "CTYNAME": "Bourbon County",
        "POPESTIMATE2019": "14534"
      },
      {
        "STATE": "20",
        "COUNTY": "013",
        "STNAME": "Kansas",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "9564"
      },
      {
        "STATE": "20",
        "COUNTY": "015",
        "STNAME": "Kansas",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "66911"
      },
      {
        "STATE": "20",
        "COUNTY": "017",
        "STNAME": "Kansas",
        "CTYNAME": "Chase County",
        "POPESTIMATE2019": "2648"
      },
      {
        "STATE": "20",
        "COUNTY": "019",
        "STNAME": "Kansas",
        "CTYNAME": "Chautauqua County",
        "POPESTIMATE2019": "3250"
      },
      {
        "STATE": "20",
        "COUNTY": "021",
        "STNAME": "Kansas",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "19939"
      },
      {
        "STATE": "20",
        "COUNTY": "023",
        "STNAME": "Kansas",
        "CTYNAME": "Cheyenne County",
        "POPESTIMATE2019": "2657"
      },
      {
        "STATE": "20",
        "COUNTY": "025",
        "STNAME": "Kansas",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "1994"
      },
      {
        "STATE": "20",
        "COUNTY": "027",
        "STNAME": "Kansas",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "8002"
      },
      {
        "STATE": "20",
        "COUNTY": "029",
        "STNAME": "Kansas",
        "CTYNAME": "Cloud County",
        "POPESTIMATE2019": "8786"
      },
      {
        "STATE": "20",
        "COUNTY": "031",
        "STNAME": "Kansas",
        "CTYNAME": "Coffey County",
        "POPESTIMATE2019": "8179"
      },
      {
        "STATE": "20",
        "COUNTY": "033",
        "STNAME": "Kansas",
        "CTYNAME": "Comanche County",
        "POPESTIMATE2019": "1700"
      },
      {
        "STATE": "20",
        "COUNTY": "035",
        "STNAME": "Kansas",
        "CTYNAME": "Cowley County",
        "POPESTIMATE2019": "34908"
      },
      {
        "STATE": "20",
        "COUNTY": "037",
        "STNAME": "Kansas",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "38818"
      },
      {
        "STATE": "20",
        "COUNTY": "039",
        "STNAME": "Kansas",
        "CTYNAME": "Decatur County",
        "POPESTIMATE2019": "2827"
      },
      {
        "STATE": "20",
        "COUNTY": "041",
        "STNAME": "Kansas",
        "CTYNAME": "Dickinson County",
        "POPESTIMATE2019": "18466"
      },
      {
        "STATE": "20",
        "COUNTY": "043",
        "STNAME": "Kansas",
        "CTYNAME": "Doniphan County",
        "POPESTIMATE2019": "7600"
      },
      {
        "STATE": "20",
        "COUNTY": "045",
        "STNAME": "Kansas",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "122259"
      },
      {
        "STATE": "20",
        "COUNTY": "047",
        "STNAME": "Kansas",
        "CTYNAME": "Edwards County",
        "POPESTIMATE2019": "2798"
      },
      {
        "STATE": "20",
        "COUNTY": "049",
        "STNAME": "Kansas",
        "CTYNAME": "Elk County",
        "POPESTIMATE2019": "2530"
      },
      {
        "STATE": "20",
        "COUNTY": "051",
        "STNAME": "Kansas",
        "CTYNAME": "Ellis County",
        "POPESTIMATE2019": "28553"
      },
      {
        "STATE": "20",
        "COUNTY": "053",
        "STNAME": "Kansas",
        "CTYNAME": "Ellsworth County",
        "POPESTIMATE2019": "6102"
      },
      {
        "STATE": "20",
        "COUNTY": "055",
        "STNAME": "Kansas",
        "CTYNAME": "Finney County",
        "POPESTIMATE2019": "36467"
      },
      {
        "STATE": "20",
        "COUNTY": "057",
        "STNAME": "Kansas",
        "CTYNAME": "Ford County",
        "POPESTIMATE2019": "33619"
      },
      {
        "STATE": "20",
        "COUNTY": "059",
        "STNAME": "Kansas",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "25544"
      },
      {
        "STATE": "20",
        "COUNTY": "061",
        "STNAME": "Kansas",
        "CTYNAME": "Geary County",
        "POPESTIMATE2019": "31670"
      },
      {
        "STATE": "20",
        "COUNTY": "063",
        "STNAME": "Kansas",
        "CTYNAME": "Gove County",
        "POPESTIMATE2019": "2636"
      },
      {
        "STATE": "20",
        "COUNTY": "065",
        "STNAME": "Kansas",
        "CTYNAME": "Graham County",
        "POPESTIMATE2019": "2482"
      },
      {
        "STATE": "20",
        "COUNTY": "067",
        "STNAME": "Kansas",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "7150"
      },
      {
        "STATE": "20",
        "COUNTY": "069",
        "STNAME": "Kansas",
        "CTYNAME": "Gray County",
        "POPESTIMATE2019": "5988"
      },
      {
        "STATE": "20",
        "COUNTY": "071",
        "STNAME": "Kansas",
        "CTYNAME": "Greeley County",
        "POPESTIMATE2019": "1232"
      },
      {
        "STATE": "20",
        "COUNTY": "073",
        "STNAME": "Kansas",
        "CTYNAME": "Greenwood County",
        "POPESTIMATE2019": "5982"
      },
      {
        "STATE": "20",
        "COUNTY": "075",
        "STNAME": "Kansas",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "2539"
      },
      {
        "STATE": "20",
        "COUNTY": "077",
        "STNAME": "Kansas",
        "CTYNAME": "Harper County",
        "POPESTIMATE2019": "5436"
      },
      {
        "STATE": "20",
        "COUNTY": "079",
        "STNAME": "Kansas",
        "CTYNAME": "Harvey County",
        "POPESTIMATE2019": "34429"
      },
      {
        "STATE": "20",
        "COUNTY": "081",
        "STNAME": "Kansas",
        "CTYNAME": "Haskell County",
        "POPESTIMATE2019": "3968"
      },
      {
        "STATE": "20",
        "COUNTY": "083",
        "STNAME": "Kansas",
        "CTYNAME": "Hodgeman County",
        "POPESTIMATE2019": "1794"
      },
      {
        "STATE": "20",
        "COUNTY": "085",
        "STNAME": "Kansas",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "13171"
      },
      {
        "STATE": "20",
        "COUNTY": "087",
        "STNAME": "Kansas",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "19043"
      },
      {
        "STATE": "20",
        "COUNTY": "089",
        "STNAME": "Kansas",
        "CTYNAME": "Jewell County",
        "POPESTIMATE2019": "2879"
      },
      {
        "STATE": "20",
        "COUNTY": "091",
        "STNAME": "Kansas",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "602401"
      },
      {
        "STATE": "20",
        "COUNTY": "093",
        "STNAME": "Kansas",
        "CTYNAME": "Kearny County",
        "POPESTIMATE2019": "3838"
      },
      {
        "STATE": "20",
        "COUNTY": "095",
        "STNAME": "Kansas",
        "CTYNAME": "Kingman County",
        "POPESTIMATE2019": "7152"
      },
      {
        "STATE": "20",
        "COUNTY": "097",
        "STNAME": "Kansas",
        "CTYNAME": "Kiowa County",
        "POPESTIMATE2019": "2475"
      },
      {
        "STATE": "20",
        "COUNTY": "099",
        "STNAME": "Kansas",
        "CTYNAME": "Labette County",
        "POPESTIMATE2019": "19618"
      },
      {
        "STATE": "20",
        "COUNTY": "101",
        "STNAME": "Kansas",
        "CTYNAME": "Lane County",
        "POPESTIMATE2019": "1535"
      },
      {
        "STATE": "20",
        "COUNTY": "103",
        "STNAME": "Kansas",
        "CTYNAME": "Leavenworth County",
        "POPESTIMATE2019": "81758"
      },
      {
        "STATE": "20",
        "COUNTY": "105",
        "STNAME": "Kansas",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "2962"
      },
      {
        "STATE": "20",
        "COUNTY": "107",
        "STNAME": "Kansas",
        "CTYNAME": "Linn County",
        "POPESTIMATE2019": "9703"
      },
      {
        "STATE": "20",
        "COUNTY": "109",
        "STNAME": "Kansas",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "2794"
      },
      {
        "STATE": "20",
        "COUNTY": "111",
        "STNAME": "Kansas",
        "CTYNAME": "Lyon County",
        "POPESTIMATE2019": "33195"
      },
      {
        "STATE": "20",
        "COUNTY": "113",
        "STNAME": "Kansas",
        "CTYNAME": "McPherson County",
        "POPESTIMATE2019": "28542"
      },
      {
        "STATE": "20",
        "COUNTY": "115",
        "STNAME": "Kansas",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "11884"
      },
      {
        "STATE": "20",
        "COUNTY": "117",
        "STNAME": "Kansas",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "9707"
      },
      {
        "STATE": "20",
        "COUNTY": "119",
        "STNAME": "Kansas",
        "CTYNAME": "Meade County",
        "POPESTIMATE2019": "4033"
      },
      {
        "STATE": "20",
        "COUNTY": "121",
        "STNAME": "Kansas",
        "CTYNAME": "Miami County",
        "POPESTIMATE2019": "34237"
      },
      {
        "STATE": "20",
        "COUNTY": "123",
        "STNAME": "Kansas",
        "CTYNAME": "Mitchell County",
        "POPESTIMATE2019": "5979"
      },
      {
        "STATE": "20",
        "COUNTY": "125",
        "STNAME": "Kansas",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "31829"
      },
      {
        "STATE": "20",
        "COUNTY": "127",
        "STNAME": "Kansas",
        "CTYNAME": "Morris County",
        "POPESTIMATE2019": "5620"
      },
      {
        "STATE": "20",
        "COUNTY": "129",
        "STNAME": "Kansas",
        "CTYNAME": "Morton County",
        "POPESTIMATE2019": "2587"
      },
      {
        "STATE": "20",
        "COUNTY": "131",
        "STNAME": "Kansas",
        "CTYNAME": "Nemaha County",
        "POPESTIMATE2019": "10231"
      },
      {
        "STATE": "20",
        "COUNTY": "133",
        "STNAME": "Kansas",
        "CTYNAME": "Neosho County",
        "POPESTIMATE2019": "16007"
      },
      {
        "STATE": "20",
        "COUNTY": "135",
        "STNAME": "Kansas",
        "CTYNAME": "Ness County",
        "POPESTIMATE2019": "2750"
      },
      {
        "STATE": "20",
        "COUNTY": "137",
        "STNAME": "Kansas",
        "CTYNAME": "Norton County",
        "POPESTIMATE2019": "5361"
      },
      {
        "STATE": "20",
        "COUNTY": "139",
        "STNAME": "Kansas",
        "CTYNAME": "Osage County",
        "POPESTIMATE2019": "15949"
      },
      {
        "STATE": "20",
        "COUNTY": "141",
        "STNAME": "Kansas",
        "CTYNAME": "Osborne County",
        "POPESTIMATE2019": "3421"
      },
      {
        "STATE": "20",
        "COUNTY": "143",
        "STNAME": "Kansas",
        "CTYNAME": "Ottawa County",
        "POPESTIMATE2019": "5704"
      },
      {
        "STATE": "20",
        "COUNTY": "145",
        "STNAME": "Kansas",
        "CTYNAME": "Pawnee County",
        "POPESTIMATE2019": "6414"
      },
      {
        "STATE": "20",
        "COUNTY": "147",
        "STNAME": "Kansas",
        "CTYNAME": "Phillips County",
        "POPESTIMATE2019": "5234"
      },
      {
        "STATE": "20",
        "COUNTY": "149",
        "STNAME": "Kansas",
        "CTYNAME": "Pottawatomie County",
        "POPESTIMATE2019": "24383"
      },
      {
        "STATE": "20",
        "COUNTY": "151",
        "STNAME": "Kansas",
        "CTYNAME": "Pratt County",
        "POPESTIMATE2019": "9164"
      },
      {
        "STATE": "20",
        "COUNTY": "153",
        "STNAME": "Kansas",
        "CTYNAME": "Rawlins County",
        "POPESTIMATE2019": "2530"
      },
      {
        "STATE": "20",
        "COUNTY": "155",
        "STNAME": "Kansas",
        "CTYNAME": "Reno County",
        "POPESTIMATE2019": "61998"
      },
      {
        "STATE": "20",
        "COUNTY": "157",
        "STNAME": "Kansas",
        "CTYNAME": "Republic County",
        "POPESTIMATE2019": "4636"
      },
      {
        "STATE": "20",
        "COUNTY": "159",
        "STNAME": "Kansas",
        "CTYNAME": "Rice County",
        "POPESTIMATE2019": "9537"
      },
      {
        "STATE": "20",
        "COUNTY": "161",
        "STNAME": "Kansas",
        "CTYNAME": "Riley County",
        "POPESTIMATE2019": "74232"
      },
      {
        "STATE": "20",
        "COUNTY": "163",
        "STNAME": "Kansas",
        "CTYNAME": "Rooks County",
        "POPESTIMATE2019": "4920"
      },
      {
        "STATE": "20",
        "COUNTY": "165",
        "STNAME": "Kansas",
        "CTYNAME": "Rush County",
        "POPESTIMATE2019": "3036"
      },
      {
        "STATE": "20",
        "COUNTY": "167",
        "STNAME": "Kansas",
        "CTYNAME": "Russell County",
        "POPESTIMATE2019": "6856"
      },
      {
        "STATE": "20",
        "COUNTY": "169",
        "STNAME": "Kansas",
        "CTYNAME": "Saline County",
        "POPESTIMATE2019": "54224"
      },
      {
        "STATE": "20",
        "COUNTY": "171",
        "STNAME": "Kansas",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "4823"
      },
      {
        "STATE": "20",
        "COUNTY": "173",
        "STNAME": "Kansas",
        "CTYNAME": "Sedgwick County",
        "POPESTIMATE2019": "516042"
      },
      {
        "STATE": "20",
        "COUNTY": "175",
        "STNAME": "Kansas",
        "CTYNAME": "Seward County",
        "POPESTIMATE2019": "21428"
      },
      {
        "STATE": "20",
        "COUNTY": "177",
        "STNAME": "Kansas",
        "CTYNAME": "Shawnee County",
        "POPESTIMATE2019": "176875"
      },
      {
        "STATE": "20",
        "COUNTY": "179",
        "STNAME": "Kansas",
        "CTYNAME": "Sheridan County",
        "POPESTIMATE2019": "2521"
      },
      {
        "STATE": "20",
        "COUNTY": "181",
        "STNAME": "Kansas",
        "CTYNAME": "Sherman County",
        "POPESTIMATE2019": "5917"
      },
      {
        "STATE": "20",
        "COUNTY": "183",
        "STNAME": "Kansas",
        "CTYNAME": "Smith County",
        "POPESTIMATE2019": "3583"
      },
      {
        "STATE": "20",
        "COUNTY": "185",
        "STNAME": "Kansas",
        "CTYNAME": "Stafford County",
        "POPESTIMATE2019": "4156"
      },
      {
        "STATE": "20",
        "COUNTY": "187",
        "STNAME": "Kansas",
        "CTYNAME": "Stanton County",
        "POPESTIMATE2019": "2006"
      },
      {
        "STATE": "20",
        "COUNTY": "189",
        "STNAME": "Kansas",
        "CTYNAME": "Stevens County",
        "POPESTIMATE2019": "5485"
      },
      {
        "STATE": "20",
        "COUNTY": "191",
        "STNAME": "Kansas",
        "CTYNAME": "Sumner County",
        "POPESTIMATE2019": "22836"
      },
      {
        "STATE": "20",
        "COUNTY": "193",
        "STNAME": "Kansas",
        "CTYNAME": "Thomas County",
        "POPESTIMATE2019": "7777"
      },
      {
        "STATE": "20",
        "COUNTY": "195",
        "STNAME": "Kansas",
        "CTYNAME": "Trego County",
        "POPESTIMATE2019": "2803"
      },
      {
        "STATE": "20",
        "COUNTY": "197",
        "STNAME": "Kansas",
        "CTYNAME": "Wabaunsee County",
        "POPESTIMATE2019": "6931"
      },
      {
        "STATE": "20",
        "COUNTY": "199",
        "STNAME": "Kansas",
        "CTYNAME": "Wallace County",
        "POPESTIMATE2019": "1518"
      },
      {
        "STATE": "20",
        "COUNTY": "201",
        "STNAME": "Kansas",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "5406"
      },
      {
        "STATE": "20",
        "COUNTY": "203",
        "STNAME": "Kansas",
        "CTYNAME": "Wichita County",
        "POPESTIMATE2019": "2119"
      },
      {
        "STATE": "20",
        "COUNTY": "205",
        "STNAME": "Kansas",
        "CTYNAME": "Wilson County",
        "POPESTIMATE2019": "8525"
      },
      {
        "STATE": "20",
        "COUNTY": "207",
        "STNAME": "Kansas",
        "CTYNAME": "Woodson County",
        "POPESTIMATE2019": "3138"
      },
      {
        "STATE": "20",
        "COUNTY": "209",
        "STNAME": "Kansas",
        "CTYNAME": "Wyandotte County",
        "POPESTIMATE2019": "165429"
      },
      {
        "STATE": "21",
        "COUNTY": "000",
        "STNAME": "Kentucky",
        "CTYNAME": "Kentucky",
        "POPESTIMATE2019": "4467673"
      },
      {
        "STATE": "21",
        "COUNTY": "001",
        "STNAME": "Kentucky",
        "CTYNAME": "Adair County",
        "POPESTIMATE2019": "19202"
      },
      {
        "STATE": "21",
        "COUNTY": "003",
        "STNAME": "Kentucky",
        "CTYNAME": "Allen County",
        "POPESTIMATE2019": "21315"
      },
      {
        "STATE": "21",
        "COUNTY": "005",
        "STNAME": "Kentucky",
        "CTYNAME": "Anderson County",
        "POPESTIMATE2019": "22747"
      },
      {
        "STATE": "21",
        "COUNTY": "007",
        "STNAME": "Kentucky",
        "CTYNAME": "Ballard County",
        "POPESTIMATE2019": "7888"
      },
      {
        "STATE": "21",
        "COUNTY": "009",
        "STNAME": "Kentucky",
        "CTYNAME": "Barren County",
        "POPESTIMATE2019": "44249"
      },
      {
        "STATE": "21",
        "COUNTY": "011",
        "STNAME": "Kentucky",
        "CTYNAME": "Bath County",
        "POPESTIMATE2019": "12500"
      },
      {
        "STATE": "21",
        "COUNTY": "013",
        "STNAME": "Kentucky",
        "CTYNAME": "Bell County",
        "POPESTIMATE2019": "26032"
      },
      {
        "STATE": "21",
        "COUNTY": "015",
        "STNAME": "Kentucky",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "133581"
      },
      {
        "STATE": "21",
        "COUNTY": "017",
        "STNAME": "Kentucky",
        "CTYNAME": "Bourbon County",
        "POPESTIMATE2019": "19788"
      },
      {
        "STATE": "21",
        "COUNTY": "019",
        "STNAME": "Kentucky",
        "CTYNAME": "Boyd County",
        "POPESTIMATE2019": "46718"
      },
      {
        "STATE": "21",
        "COUNTY": "021",
        "STNAME": "Kentucky",
        "CTYNAME": "Boyle County",
        "POPESTIMATE2019": "30060"
      },
      {
        "STATE": "21",
        "COUNTY": "023",
        "STNAME": "Kentucky",
        "CTYNAME": "Bracken County",
        "POPESTIMATE2019": "8303"
      },
      {
        "STATE": "21",
        "COUNTY": "025",
        "STNAME": "Kentucky",
        "CTYNAME": "Breathitt County",
        "POPESTIMATE2019": "12630"
      },
      {
        "STATE": "21",
        "COUNTY": "027",
        "STNAME": "Kentucky",
        "CTYNAME": "Breckinridge County",
        "POPESTIMATE2019": "20477"
      },
      {
        "STATE": "21",
        "COUNTY": "029",
        "STNAME": "Kentucky",
        "CTYNAME": "Bullitt County",
        "POPESTIMATE2019": "81676"
      },
      {
        "STATE": "21",
        "COUNTY": "031",
        "STNAME": "Kentucky",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "12879"
      },
      {
        "STATE": "21",
        "COUNTY": "033",
        "STNAME": "Kentucky",
        "CTYNAME": "Caldwell County",
        "POPESTIMATE2019": "12747"
      },
      {
        "STATE": "21",
        "COUNTY": "035",
        "STNAME": "Kentucky",
        "CTYNAME": "Calloway County",
        "POPESTIMATE2019": "39001"
      },
      {
        "STATE": "21",
        "COUNTY": "037",
        "STNAME": "Kentucky",
        "CTYNAME": "Campbell County",
        "POPESTIMATE2019": "93584"
      },
      {
        "STATE": "21",
        "COUNTY": "039",
        "STNAME": "Kentucky",
        "CTYNAME": "Carlisle County",
        "POPESTIMATE2019": "4760"
      },
      {
        "STATE": "21",
        "COUNTY": "041",
        "STNAME": "Kentucky",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "10631"
      },
      {
        "STATE": "21",
        "COUNTY": "043",
        "STNAME": "Kentucky",
        "CTYNAME": "Carter County",
        "POPESTIMATE2019": "26797"
      },
      {
        "STATE": "21",
        "COUNTY": "045",
        "STNAME": "Kentucky",
        "CTYNAME": "Casey County",
        "POPESTIMATE2019": "16159"
      },
      {
        "STATE": "21",
        "COUNTY": "047",
        "STNAME": "Kentucky",
        "CTYNAME": "Christian County",
        "POPESTIMATE2019": "70461"
      },
      {
        "STATE": "21",
        "COUNTY": "049",
        "STNAME": "Kentucky",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "36263"
      },
      {
        "STATE": "21",
        "COUNTY": "051",
        "STNAME": "Kentucky",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "19901"
      },
      {
        "STATE": "21",
        "COUNTY": "053",
        "STNAME": "Kentucky",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "10218"
      },
      {
        "STATE": "21",
        "COUNTY": "055",
        "STNAME": "Kentucky",
        "CTYNAME": "Crittenden County",
        "POPESTIMATE2019": "8806"
      },
      {
        "STATE": "21",
        "COUNTY": "057",
        "STNAME": "Kentucky",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "6614"
      },
      {
        "STATE": "21",
        "COUNTY": "059",
        "STNAME": "Kentucky",
        "CTYNAME": "Daviess County",
        "POPESTIMATE2019": "101511"
      },
      {
        "STATE": "21",
        "COUNTY": "061",
        "STNAME": "Kentucky",
        "CTYNAME": "Edmonson County",
        "POPESTIMATE2019": "12150"
      },
      {
        "STATE": "21",
        "COUNTY": "063",
        "STNAME": "Kentucky",
        "CTYNAME": "Elliott County",
        "POPESTIMATE2019": "7517"
      },
      {
        "STATE": "21",
        "COUNTY": "065",
        "STNAME": "Kentucky",
        "CTYNAME": "Estill County",
        "POPESTIMATE2019": "14106"
      },
      {
        "STATE": "21",
        "COUNTY": "067",
        "STNAME": "Kentucky",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "323152"
      },
      {
        "STATE": "21",
        "COUNTY": "069",
        "STNAME": "Kentucky",
        "CTYNAME": "Fleming County",
        "POPESTIMATE2019": "14581"
      },
      {
        "STATE": "21",
        "COUNTY": "071",
        "STNAME": "Kentucky",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "35589"
      },
      {
        "STATE": "21",
        "COUNTY": "073",
        "STNAME": "Kentucky",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "50991"
      },
      {
        "STATE": "21",
        "COUNTY": "075",
        "STNAME": "Kentucky",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "5969"
      },
      {
        "STATE": "21",
        "COUNTY": "077",
        "STNAME": "Kentucky",
        "CTYNAME": "Gallatin County",
        "POPESTIMATE2019": "8869"
      },
      {
        "STATE": "21",
        "COUNTY": "079",
        "STNAME": "Kentucky",
        "CTYNAME": "Garrard County",
        "POPESTIMATE2019": "17666"
      },
      {
        "STATE": "21",
        "COUNTY": "081",
        "STNAME": "Kentucky",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "25069"
      },
      {
        "STATE": "21",
        "COUNTY": "083",
        "STNAME": "Kentucky",
        "CTYNAME": "Graves County",
        "POPESTIMATE2019": "37266"
      },
      {
        "STATE": "21",
        "COUNTY": "085",
        "STNAME": "Kentucky",
        "CTYNAME": "Grayson County",
        "POPESTIMATE2019": "26427"
      },
      {
        "STATE": "21",
        "COUNTY": "087",
        "STNAME": "Kentucky",
        "CTYNAME": "Green County",
        "POPESTIMATE2019": "10941"
      },
      {
        "STATE": "21",
        "COUNTY": "089",
        "STNAME": "Kentucky",
        "CTYNAME": "Greenup County",
        "POPESTIMATE2019": "35098"
      },
      {
        "STATE": "21",
        "COUNTY": "091",
        "STNAME": "Kentucky",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "8722"
      },
      {
        "STATE": "21",
        "COUNTY": "093",
        "STNAME": "Kentucky",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "110958"
      },
      {
        "STATE": "21",
        "COUNTY": "095",
        "STNAME": "Kentucky",
        "CTYNAME": "Harlan County",
        "POPESTIMATE2019": "26010"
      },
      {
        "STATE": "21",
        "COUNTY": "097",
        "STNAME": "Kentucky",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "18886"
      },
      {
        "STATE": "21",
        "COUNTY": "099",
        "STNAME": "Kentucky",
        "CTYNAME": "Hart County",
        "POPESTIMATE2019": "19035"
      },
      {
        "STATE": "21",
        "COUNTY": "101",
        "STNAME": "Kentucky",
        "CTYNAME": "Henderson County",
        "POPESTIMATE2019": "45210"
      },
      {
        "STATE": "21",
        "COUNTY": "103",
        "STNAME": "Kentucky",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "16126"
      },
      {
        "STATE": "21",
        "COUNTY": "105",
        "STNAME": "Kentucky",
        "CTYNAME": "Hickman County",
        "POPESTIMATE2019": "4380"
      },
      {
        "STATE": "21",
        "COUNTY": "107",
        "STNAME": "Kentucky",
        "CTYNAME": "Hopkins County",
        "POPESTIMATE2019": "44686"
      },
      {
        "STATE": "21",
        "COUNTY": "109",
        "STNAME": "Kentucky",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "13329"
      },
      {
        "STATE": "21",
        "COUNTY": "111",
        "STNAME": "Kentucky",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "766757"
      },
      {
        "STATE": "21",
        "COUNTY": "113",
        "STNAME": "Kentucky",
        "CTYNAME": "Jessamine County",
        "POPESTIMATE2019": "54115"
      },
      {
        "STATE": "21",
        "COUNTY": "115",
        "STNAME": "Kentucky",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "22188"
      },
      {
        "STATE": "21",
        "COUNTY": "117",
        "STNAME": "Kentucky",
        "CTYNAME": "Kenton County",
        "POPESTIMATE2019": "166998"
      },
      {
        "STATE": "21",
        "COUNTY": "119",
        "STNAME": "Kentucky",
        "CTYNAME": "Knott County",
        "POPESTIMATE2019": "14806"
      },
      {
        "STATE": "21",
        "COUNTY": "121",
        "STNAME": "Kentucky",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "31145"
      },
      {
        "STATE": "21",
        "COUNTY": "123",
        "STNAME": "Kentucky",
        "CTYNAME": "Larue County",
        "POPESTIMATE2019": "14398"
      },
      {
        "STATE": "21",
        "COUNTY": "125",
        "STNAME": "Kentucky",
        "CTYNAME": "Laurel County",
        "POPESTIMATE2019": "60813"
      },
      {
        "STATE": "21",
        "COUNTY": "127",
        "STNAME": "Kentucky",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "15317"
      },
      {
        "STATE": "21",
        "COUNTY": "129",
        "STNAME": "Kentucky",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "7403"
      },
      {
        "STATE": "21",
        "COUNTY": "131",
        "STNAME": "Kentucky",
        "CTYNAME": "Leslie County",
        "POPESTIMATE2019": "9877"
      },
      {
        "STATE": "21",
        "COUNTY": "133",
        "STNAME": "Kentucky",
        "CTYNAME": "Letcher County",
        "POPESTIMATE2019": "21553"
      },
      {
        "STATE": "21",
        "COUNTY": "135",
        "STNAME": "Kentucky",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "13275"
      },
      {
        "STATE": "21",
        "COUNTY": "137",
        "STNAME": "Kentucky",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "24549"
      },
      {
        "STATE": "21",
        "COUNTY": "139",
        "STNAME": "Kentucky",
        "CTYNAME": "Livingston County",
        "POPESTIMATE2019": "9194"
      },
      {
        "STATE": "21",
        "COUNTY": "141",
        "STNAME": "Kentucky",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "27102"
      },
      {
        "STATE": "21",
        "COUNTY": "143",
        "STNAME": "Kentucky",
        "CTYNAME": "Lyon County",
        "POPESTIMATE2019": "8210"
      },
      {
        "STATE": "21",
        "COUNTY": "145",
        "STNAME": "Kentucky",
        "CTYNAME": "McCracken County",
        "POPESTIMATE2019": "65418"
      },
      {
        "STATE": "21",
        "COUNTY": "147",
        "STNAME": "Kentucky",
        "CTYNAME": "McCreary County",
        "POPESTIMATE2019": "17231"
      },
      {
        "STATE": "21",
        "COUNTY": "149",
        "STNAME": "Kentucky",
        "CTYNAME": "McLean County",
        "POPESTIMATE2019": "9207"
      },
      {
        "STATE": "21",
        "COUNTY": "151",
        "STNAME": "Kentucky",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "92987"
      },
      {
        "STATE": "21",
        "COUNTY": "153",
        "STNAME": "Kentucky",
        "CTYNAME": "Magoffin County",
        "POPESTIMATE2019": "12161"
      },
      {
        "STATE": "21",
        "COUNTY": "155",
        "STNAME": "Kentucky",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "19273"
      },
      {
        "STATE": "21",
        "COUNTY": "157",
        "STNAME": "Kentucky",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "31100"
      },
      {
        "STATE": "21",
        "COUNTY": "159",
        "STNAME": "Kentucky",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "11195"
      },
      {
        "STATE": "21",
        "COUNTY": "161",
        "STNAME": "Kentucky",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "17070"
      },
      {
        "STATE": "21",
        "COUNTY": "163",
        "STNAME": "Kentucky",
        "CTYNAME": "Meade County",
        "POPESTIMATE2019": "28572"
      },
      {
        "STATE": "21",
        "COUNTY": "165",
        "STNAME": "Kentucky",
        "CTYNAME": "Menifee County",
        "POPESTIMATE2019": "6489"
      },
      {
        "STATE": "21",
        "COUNTY": "167",
        "STNAME": "Kentucky",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "21933"
      },
      {
        "STATE": "21",
        "COUNTY": "169",
        "STNAME": "Kentucky",
        "CTYNAME": "Metcalfe County",
        "POPESTIMATE2019": "10071"
      },
      {
        "STATE": "21",
        "COUNTY": "171",
        "STNAME": "Kentucky",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "10650"
      },
      {
        "STATE": "21",
        "COUNTY": "173",
        "STNAME": "Kentucky",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "28157"
      },
      {
        "STATE": "21",
        "COUNTY": "175",
        "STNAME": "Kentucky",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "13309"
      },
      {
        "STATE": "21",
        "COUNTY": "177",
        "STNAME": "Kentucky",
        "CTYNAME": "Muhlenberg County",
        "POPESTIMATE2019": "30622"
      },
      {
        "STATE": "21",
        "COUNTY": "179",
        "STNAME": "Kentucky",
        "CTYNAME": "Nelson County",
        "POPESTIMATE2019": "46233"
      },
      {
        "STATE": "21",
        "COUNTY": "181",
        "STNAME": "Kentucky",
        "CTYNAME": "Nicholas County",
        "POPESTIMATE2019": "7269"
      },
      {
        "STATE": "21",
        "COUNTY": "183",
        "STNAME": "Kentucky",
        "CTYNAME": "Ohio County",
        "POPESTIMATE2019": "23994"
      },
      {
        "STATE": "21",
        "COUNTY": "185",
        "STNAME": "Kentucky",
        "CTYNAME": "Oldham County",
        "POPESTIMATE2019": "66799"
      },
      {
        "STATE": "21",
        "COUNTY": "187",
        "STNAME": "Kentucky",
        "CTYNAME": "Owen County",
        "POPESTIMATE2019": "10901"
      },
      {
        "STATE": "21",
        "COUNTY": "189",
        "STNAME": "Kentucky",
        "CTYNAME": "Owsley County",
        "POPESTIMATE2019": "4415"
      },
      {
        "STATE": "21",
        "COUNTY": "191",
        "STNAME": "Kentucky",
        "CTYNAME": "Pendleton County",
        "POPESTIMATE2019": "14590"
      },
      {
        "STATE": "21",
        "COUNTY": "193",
        "STNAME": "Kentucky",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "25758"
      },
      {
        "STATE": "21",
        "COUNTY": "195",
        "STNAME": "Kentucky",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "57876"
      },
      {
        "STATE": "21",
        "COUNTY": "197",
        "STNAME": "Kentucky",
        "CTYNAME": "Powell County",
        "POPESTIMATE2019": "12359"
      },
      {
        "STATE": "21",
        "COUNTY": "199",
        "STNAME": "Kentucky",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "64979"
      },
      {
        "STATE": "21",
        "COUNTY": "201",
        "STNAME": "Kentucky",
        "CTYNAME": "Robertson County",
        "POPESTIMATE2019": "2108"
      },
      {
        "STATE": "21",
        "COUNTY": "203",
        "STNAME": "Kentucky",
        "CTYNAME": "Rockcastle County",
        "POPESTIMATE2019": "16695"
      },
      {
        "STATE": "21",
        "COUNTY": "205",
        "STNAME": "Kentucky",
        "CTYNAME": "Rowan County",
        "POPESTIMATE2019": "24460"
      },
      {
        "STATE": "21",
        "COUNTY": "207",
        "STNAME": "Kentucky",
        "CTYNAME": "Russell County",
        "POPESTIMATE2019": "17923"
      },
      {
        "STATE": "21",
        "COUNTY": "209",
        "STNAME": "Kentucky",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "57004"
      },
      {
        "STATE": "21",
        "COUNTY": "211",
        "STNAME": "Kentucky",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "49024"
      },
      {
        "STATE": "21",
        "COUNTY": "213",
        "STNAME": "Kentucky",
        "CTYNAME": "Simpson County",
        "POPESTIMATE2019": "18572"
      },
      {
        "STATE": "21",
        "COUNTY": "215",
        "STNAME": "Kentucky",
        "CTYNAME": "Spencer County",
        "POPESTIMATE2019": "19351"
      },
      {
        "STATE": "21",
        "COUNTY": "217",
        "STNAME": "Kentucky",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "25769"
      },
      {
        "STATE": "21",
        "COUNTY": "219",
        "STNAME": "Kentucky",
        "CTYNAME": "Todd County",
        "POPESTIMATE2019": "12294"
      },
      {
        "STATE": "21",
        "COUNTY": "221",
        "STNAME": "Kentucky",
        "CTYNAME": "Trigg County",
        "POPESTIMATE2019": "14651"
      },
      {
        "STATE": "21",
        "COUNTY": "223",
        "STNAME": "Kentucky",
        "CTYNAME": "Trimble County",
        "POPESTIMATE2019": "8471"
      },
      {
        "STATE": "21",
        "COUNTY": "225",
        "STNAME": "Kentucky",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "14381"
      },
      {
        "STATE": "21",
        "COUNTY": "227",
        "STNAME": "Kentucky",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "132896"
      },
      {
        "STATE": "21",
        "COUNTY": "229",
        "STNAME": "Kentucky",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "12095"
      },
      {
        "STATE": "21",
        "COUNTY": "231",
        "STNAME": "Kentucky",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "20333"
      },
      {
        "STATE": "21",
        "COUNTY": "233",
        "STNAME": "Kentucky",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "12942"
      },
      {
        "STATE": "21",
        "COUNTY": "235",
        "STNAME": "Kentucky",
        "CTYNAME": "Whitley County",
        "POPESTIMATE2019": "36264"
      },
      {
        "STATE": "21",
        "COUNTY": "237",
        "STNAME": "Kentucky",
        "CTYNAME": "Wolfe County",
        "POPESTIMATE2019": "7157"
      },
      {
        "STATE": "21",
        "COUNTY": "239",
        "STNAME": "Kentucky",
        "CTYNAME": "Woodford County",
        "POPESTIMATE2019": "26734"
      },
      {
        "STATE": "22",
        "COUNTY": "000",
        "STNAME": "Louisiana",
        "CTYNAME": "Louisiana",
        "POPESTIMATE2019": "4648794"
      },
      {
        "STATE": "22",
        "COUNTY": "001",
        "STNAME": "Louisiana",
        "CTYNAME": "Acadia Parish",
        "POPESTIMATE2019": "62045"
      },
      {
        "STATE": "22",
        "COUNTY": "003",
        "STNAME": "Louisiana",
        "CTYNAME": "Allen Parish",
        "POPESTIMATE2019": "25627"
      },
      {
        "STATE": "22",
        "COUNTY": "005",
        "STNAME": "Louisiana",
        "CTYNAME": "Ascension Parish",
        "POPESTIMATE2019": "126604"
      },
      {
        "STATE": "22",
        "COUNTY": "007",
        "STNAME": "Louisiana",
        "CTYNAME": "Assumption Parish",
        "POPESTIMATE2019": "21891"
      },
      {
        "STATE": "22",
        "COUNTY": "009",
        "STNAME": "Louisiana",
        "CTYNAME": "Avoyelles Parish",
        "POPESTIMATE2019": "40144"
      },
      {
        "STATE": "22",
        "COUNTY": "011",
        "STNAME": "Louisiana",
        "CTYNAME": "Beauregard Parish",
        "POPESTIMATE2019": "37497"
      },
      {
        "STATE": "22",
        "COUNTY": "013",
        "STNAME": "Louisiana",
        "CTYNAME": "Bienville Parish",
        "POPESTIMATE2019": "13241"
      },
      {
        "STATE": "22",
        "COUNTY": "015",
        "STNAME": "Louisiana",
        "CTYNAME": "Bossier Parish",
        "POPESTIMATE2019": "127039"
      },
      {
        "STATE": "22",
        "COUNTY": "017",
        "STNAME": "Louisiana",
        "CTYNAME": "Caddo Parish",
        "POPESTIMATE2019": "240204"
      },
      {
        "STATE": "22",
        "COUNTY": "019",
        "STNAME": "Louisiana",
        "CTYNAME": "Calcasieu Parish",
        "POPESTIMATE2019": "203436"
      },
      {
        "STATE": "22",
        "COUNTY": "021",
        "STNAME": "Louisiana",
        "CTYNAME": "Caldwell Parish",
        "POPESTIMATE2019": "9918"
      },
      {
        "STATE": "22",
        "COUNTY": "023",
        "STNAME": "Louisiana",
        "CTYNAME": "Cameron Parish",
        "POPESTIMATE2019": "6973"
      },
      {
        "STATE": "22",
        "COUNTY": "025",
        "STNAME": "Louisiana",
        "CTYNAME": "Catahoula Parish",
        "POPESTIMATE2019": "9494"
      },
      {
        "STATE": "22",
        "COUNTY": "027",
        "STNAME": "Louisiana",
        "CTYNAME": "Claiborne Parish",
        "POPESTIMATE2019": "15670"
      },
      {
        "STATE": "22",
        "COUNTY": "029",
        "STNAME": "Louisiana",
        "CTYNAME": "Concordia Parish",
        "POPESTIMATE2019": "19259"
      },
      {
        "STATE": "22",
        "COUNTY": "031",
        "STNAME": "Louisiana",
        "CTYNAME": "De Soto Parish",
        "POPESTIMATE2019": "27463"
      },
      {
        "STATE": "22",
        "COUNTY": "033",
        "STNAME": "Louisiana",
        "CTYNAME": "East Baton Rouge Parish",
        "POPESTIMATE2019": "440059"
      },
      {
        "STATE": "22",
        "COUNTY": "035",
        "STNAME": "Louisiana",
        "CTYNAME": "East Carroll Parish",
        "POPESTIMATE2019": "6861"
      },
      {
        "STATE": "22",
        "COUNTY": "037",
        "STNAME": "Louisiana",
        "CTYNAME": "East Feliciana Parish",
        "POPESTIMATE2019": "19135"
      },
      {
        "STATE": "22",
        "COUNTY": "039",
        "STNAME": "Louisiana",
        "CTYNAME": "Evangeline Parish",
        "POPESTIMATE2019": "33395"
      },
      {
        "STATE": "22",
        "COUNTY": "041",
        "STNAME": "Louisiana",
        "CTYNAME": "Franklin Parish",
        "POPESTIMATE2019": "20015"
      },
      {
        "STATE": "22",
        "COUNTY": "043",
        "STNAME": "Louisiana",
        "CTYNAME": "Grant Parish",
        "POPESTIMATE2019": "22389"
      },
      {
        "STATE": "22",
        "COUNTY": "045",
        "STNAME": "Louisiana",
        "CTYNAME": "Iberia Parish",
        "POPESTIMATE2019": "69830"
      },
      {
        "STATE": "22",
        "COUNTY": "047",
        "STNAME": "Louisiana",
        "CTYNAME": "Iberville Parish",
        "POPESTIMATE2019": "32511"
      },
      {
        "STATE": "22",
        "COUNTY": "049",
        "STNAME": "Louisiana",
        "CTYNAME": "Jackson Parish",
        "POPESTIMATE2019": "15744"
      },
      {
        "STATE": "22",
        "COUNTY": "051",
        "STNAME": "Louisiana",
        "CTYNAME": "Jefferson Parish",
        "POPESTIMATE2019": "432493"
      },
      {
        "STATE": "22",
        "COUNTY": "053",
        "STNAME": "Louisiana",
        "CTYNAME": "Jefferson Davis Parish",
        "POPESTIMATE2019": "31368"
      },
      {
        "STATE": "22",
        "COUNTY": "055",
        "STNAME": "Louisiana",
        "CTYNAME": "Lafayette Parish",
        "POPESTIMATE2019": "244390"
      },
      {
        "STATE": "22",
        "COUNTY": "057",
        "STNAME": "Louisiana",
        "CTYNAME": "Lafourche Parish",
        "POPESTIMATE2019": "97614"
      },
      {
        "STATE": "22",
        "COUNTY": "059",
        "STNAME": "Louisiana",
        "CTYNAME": "LaSalle Parish",
        "POPESTIMATE2019": "14892"
      },
      {
        "STATE": "22",
        "COUNTY": "061",
        "STNAME": "Louisiana",
        "CTYNAME": "Lincoln Parish",
        "POPESTIMATE2019": "46742"
      },
      {
        "STATE": "22",
        "COUNTY": "063",
        "STNAME": "Louisiana",
        "CTYNAME": "Livingston Parish",
        "POPESTIMATE2019": "140789"
      },
      {
        "STATE": "22",
        "COUNTY": "065",
        "STNAME": "Louisiana",
        "CTYNAME": "Madison Parish",
        "POPESTIMATE2019": "10951"
      },
      {
        "STATE": "22",
        "COUNTY": "067",
        "STNAME": "Louisiana",
        "CTYNAME": "Morehouse Parish",
        "POPESTIMATE2019": "24874"
      },
      {
        "STATE": "22",
        "COUNTY": "069",
        "STNAME": "Louisiana",
        "CTYNAME": "Natchitoches Parish",
        "POPESTIMATE2019": "38158"
      },
      {
        "STATE": "22",
        "COUNTY": "071",
        "STNAME": "Louisiana",
        "CTYNAME": "Orleans Parish",
        "POPESTIMATE2019": "390144"
      },
      {
        "STATE": "22",
        "COUNTY": "073",
        "STNAME": "Louisiana",
        "CTYNAME": "Ouachita Parish",
        "POPESTIMATE2019": "153279"
      },
      {
        "STATE": "22",
        "COUNTY": "075",
        "STNAME": "Louisiana",
        "CTYNAME": "Plaquemines Parish",
        "POPESTIMATE2019": "23197"
      },
      {
        "STATE": "22",
        "COUNTY": "077",
        "STNAME": "Louisiana",
        "CTYNAME": "Pointe Coupee Parish",
        "POPESTIMATE2019": "21730"
      },
      {
        "STATE": "22",
        "COUNTY": "079",
        "STNAME": "Louisiana",
        "CTYNAME": "Rapides Parish",
        "POPESTIMATE2019": "129648"
      },
      {
        "STATE": "22",
        "COUNTY": "081",
        "STNAME": "Louisiana",
        "CTYNAME": "Red River Parish",
        "POPESTIMATE2019": "8442"
      },
      {
        "STATE": "22",
        "COUNTY": "083",
        "STNAME": "Louisiana",
        "CTYNAME": "Richland Parish",
        "POPESTIMATE2019": "20122"
      },
      {
        "STATE": "22",
        "COUNTY": "085",
        "STNAME": "Louisiana",
        "CTYNAME": "Sabine Parish",
        "POPESTIMATE2019": "23884"
      },
      {
        "STATE": "22",
        "COUNTY": "087",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Bernard Parish",
        "POPESTIMATE2019": "47244"
      },
      {
        "STATE": "22",
        "COUNTY": "089",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Charles Parish",
        "POPESTIMATE2019": "53100"
      },
      {
        "STATE": "22",
        "COUNTY": "091",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Helena Parish",
        "POPESTIMATE2019": "10132"
      },
      {
        "STATE": "22",
        "COUNTY": "093",
        "STNAME": "Louisiana",
        "CTYNAME": "St. James Parish",
        "POPESTIMATE2019": "21096"
      },
      {
        "STATE": "22",
        "COUNTY": "095",
        "STNAME": "Louisiana",
        "CTYNAME": "St. John the Baptist Parish",
        "POPESTIMATE2019": "42837"
      },
      {
        "STATE": "22",
        "COUNTY": "097",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Landry Parish",
        "POPESTIMATE2019": "82124"
      },
      {
        "STATE": "22",
        "COUNTY": "099",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Martin Parish",
        "POPESTIMATE2019": "53431"
      },
      {
        "STATE": "22",
        "COUNTY": "101",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Mary Parish",
        "POPESTIMATE2019": "49348"
      },
      {
        "STATE": "22",
        "COUNTY": "103",
        "STNAME": "Louisiana",
        "CTYNAME": "St. Tammany Parish",
        "POPESTIMATE2019": "260419"
      },
      {
        "STATE": "22",
        "COUNTY": "105",
        "STNAME": "Louisiana",
        "CTYNAME": "Tangipahoa Parish",
        "POPESTIMATE2019": "134758"
      },
      {
        "STATE": "22",
        "COUNTY": "107",
        "STNAME": "Louisiana",
        "CTYNAME": "Tensas Parish",
        "POPESTIMATE2019": "4334"
      },
      {
        "STATE": "22",
        "COUNTY": "109",
        "STNAME": "Louisiana",
        "CTYNAME": "Terrebonne Parish",
        "POPESTIMATE2019": "110461"
      },
      {
        "STATE": "22",
        "COUNTY": "111",
        "STNAME": "Louisiana",
        "CTYNAME": "Union Parish",
        "POPESTIMATE2019": "22108"
      },
      {
        "STATE": "22",
        "COUNTY": "113",
        "STNAME": "Louisiana",
        "CTYNAME": "Vermilion Parish",
        "POPESTIMATE2019": "59511"
      },
      {
        "STATE": "22",
        "COUNTY": "115",
        "STNAME": "Louisiana",
        "CTYNAME": "Vernon Parish",
        "POPESTIMATE2019": "47429"
      },
      {
        "STATE": "22",
        "COUNTY": "117",
        "STNAME": "Louisiana",
        "CTYNAME": "Washington Parish",
        "POPESTIMATE2019": "46194"
      },
      {
        "STATE": "22",
        "COUNTY": "119",
        "STNAME": "Louisiana",
        "CTYNAME": "Webster Parish",
        "POPESTIMATE2019": "38340"
      },
      {
        "STATE": "22",
        "COUNTY": "121",
        "STNAME": "Louisiana",
        "CTYNAME": "West Baton Rouge Parish",
        "POPESTIMATE2019": "26465"
      },
      {
        "STATE": "22",
        "COUNTY": "123",
        "STNAME": "Louisiana",
        "CTYNAME": "West Carroll Parish",
        "POPESTIMATE2019": "10830"
      },
      {
        "STATE": "22",
        "COUNTY": "125",
        "STNAME": "Louisiana",
        "CTYNAME": "West Feliciana Parish",
        "POPESTIMATE2019": "15568"
      },
      {
        "STATE": "22",
        "COUNTY": "127",
        "STNAME": "Louisiana",
        "CTYNAME": "Winn Parish",
        "POPESTIMATE2019": "13904"
      },
      {
        "STATE": "23",
        "COUNTY": "000",
        "STNAME": "Maine",
        "CTYNAME": "Maine",
        "POPESTIMATE2019": "1344212"
      },
      {
        "STATE": "23",
        "COUNTY": "001",
        "STNAME": "Maine",
        "CTYNAME": "Androscoggin County",
        "POPESTIMATE2019": "108277"
      },
      {
        "STATE": "23",
        "COUNTY": "003",
        "STNAME": "Maine",
        "CTYNAME": "Aroostook County",
        "POPESTIMATE2019": "67055"
      },
      {
        "STATE": "23",
        "COUNTY": "005",
        "STNAME": "Maine",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "295003"
      },
      {
        "STATE": "23",
        "COUNTY": "007",
        "STNAME": "Maine",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "30199"
      },
      {
        "STATE": "23",
        "COUNTY": "009",
        "STNAME": "Maine",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "54987"
      },
      {
        "STATE": "23",
        "COUNTY": "011",
        "STNAME": "Maine",
        "CTYNAME": "Kennebec County",
        "POPESTIMATE2019": "122302"
      },
      {
        "STATE": "23",
        "COUNTY": "013",
        "STNAME": "Maine",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "39772"
      },
      {
        "STATE": "23",
        "COUNTY": "015",
        "STNAME": "Maine",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "34634"
      },
      {
        "STATE": "23",
        "COUNTY": "017",
        "STNAME": "Maine",
        "CTYNAME": "Oxford County",
        "POPESTIMATE2019": "57975"
      },
      {
        "STATE": "23",
        "COUNTY": "019",
        "STNAME": "Maine",
        "CTYNAME": "Penobscot County",
        "POPESTIMATE2019": "152148"
      },
      {
        "STATE": "23",
        "COUNTY": "021",
        "STNAME": "Maine",
        "CTYNAME": "Piscataquis County",
        "POPESTIMATE2019": "16785"
      },
      {
        "STATE": "23",
        "COUNTY": "023",
        "STNAME": "Maine",
        "CTYNAME": "Sagadahoc County",
        "POPESTIMATE2019": "35856"
      },
      {
        "STATE": "23",
        "COUNTY": "025",
        "STNAME": "Maine",
        "CTYNAME": "Somerset County",
        "POPESTIMATE2019": "50484"
      },
      {
        "STATE": "23",
        "COUNTY": "027",
        "STNAME": "Maine",
        "CTYNAME": "Waldo County",
        "POPESTIMATE2019": "39715"
      },
      {
        "STATE": "23",
        "COUNTY": "029",
        "STNAME": "Maine",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "31379"
      },
      {
        "STATE": "23",
        "COUNTY": "031",
        "STNAME": "Maine",
        "CTYNAME": "York County",
        "POPESTIMATE2019": "207641"
      },
      {
        "STATE": "24",
        "COUNTY": "000",
        "STNAME": "Maryland",
        "CTYNAME": "Maryland",
        "POPESTIMATE2019": "6045680"
      },
      {
        "STATE": "24",
        "COUNTY": "001",
        "STNAME": "Maryland",
        "CTYNAME": "Allegany County",
        "POPESTIMATE2019": "70416"
      },
      {
        "STATE": "24",
        "COUNTY": "003",
        "STNAME": "Maryland",
        "CTYNAME": "Anne Arundel County",
        "POPESTIMATE2019": "579234"
      },
      {
        "STATE": "24",
        "COUNTY": "005",
        "STNAME": "Maryland",
        "CTYNAME": "Baltimore County",
        "POPESTIMATE2019": "827370"
      },
      {
        "STATE": "24",
        "COUNTY": "009",
        "STNAME": "Maryland",
        "CTYNAME": "Calvert County",
        "POPESTIMATE2019": "92525"
      },
      {
        "STATE": "24",
        "COUNTY": "011",
        "STNAME": "Maryland",
        "CTYNAME": "Caroline County",
        "POPESTIMATE2019": "33406"
      },
      {
        "STATE": "24",
        "COUNTY": "013",
        "STNAME": "Maryland",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "168447"
      },
      {
        "STATE": "24",
        "COUNTY": "015",
        "STNAME": "Maryland",
        "CTYNAME": "Cecil County",
        "POPESTIMATE2019": "102855"
      },
      {
        "STATE": "24",
        "COUNTY": "017",
        "STNAME": "Maryland",
        "CTYNAME": "Charles County",
        "POPESTIMATE2019": "163257"
      },
      {
        "STATE": "24",
        "COUNTY": "019",
        "STNAME": "Maryland",
        "CTYNAME": "Dorchester County",
        "POPESTIMATE2019": "31929"
      },
      {
        "STATE": "24",
        "COUNTY": "021",
        "STNAME": "Maryland",
        "CTYNAME": "Frederick County",
        "POPESTIMATE2019": "259547"
      },
      {
        "STATE": "24",
        "COUNTY": "023",
        "STNAME": "Maryland",
        "CTYNAME": "Garrett County",
        "POPESTIMATE2019": "29014"
      },
      {
        "STATE": "24",
        "COUNTY": "025",
        "STNAME": "Maryland",
        "CTYNAME": "Harford County",
        "POPESTIMATE2019": "255441"
      },
      {
        "STATE": "24",
        "COUNTY": "027",
        "STNAME": "Maryland",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "325690"
      },
      {
        "STATE": "24",
        "COUNTY": "029",
        "STNAME": "Maryland",
        "CTYNAME": "Kent County",
        "POPESTIMATE2019": "19422"
      },
      {
        "STATE": "24",
        "COUNTY": "031",
        "STNAME": "Maryland",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "1050688"
      },
      {
        "STATE": "24",
        "COUNTY": "033",
        "STNAME": "Maryland",
        "CTYNAME": "Prince George's County",
        "POPESTIMATE2019": "909327"
      },
      {
        "STATE": "24",
        "COUNTY": "035",
        "STNAME": "Maryland",
        "CTYNAME": "Queen Anne's County",
        "POPESTIMATE2019": "50381"
      },
      {
        "STATE": "24",
        "COUNTY": "037",
        "STNAME": "Maryland",
        "CTYNAME": "St. Mary's County",
        "POPESTIMATE2019": "113510"
      },
      {
        "STATE": "24",
        "COUNTY": "039",
        "STNAME": "Maryland",
        "CTYNAME": "Somerset County",
        "POPESTIMATE2019": "25616"
      },
      {
        "STATE": "24",
        "COUNTY": "041",
        "STNAME": "Maryland",
        "CTYNAME": "Talbot County",
        "POPESTIMATE2019": "37181"
      },
      {
        "STATE": "24",
        "COUNTY": "043",
        "STNAME": "Maryland",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "151049"
      },
      {
        "STATE": "24",
        "COUNTY": "045",
        "STNAME": "Maryland",
        "CTYNAME": "Wicomico County",
        "POPESTIMATE2019": "103609"
      },
      {
        "STATE": "24",
        "COUNTY": "047",
        "STNAME": "Maryland",
        "CTYNAME": "Worcester County",
        "POPESTIMATE2019": "52276"
      },
      {
        "STATE": "24",
        "COUNTY": "510",
        "STNAME": "Maryland",
        "CTYNAME": "Baltimore city",
        "POPESTIMATE2019": "593490"
      },
      {
        "STATE": "25",
        "COUNTY": "000",
        "STNAME": "Massachusetts",
        "CTYNAME": "Massachusetts",
        "POPESTIMATE2019": "6892503"
      },
      {
        "STATE": "25",
        "COUNTY": "001",
        "STNAME": "Massachusetts",
        "CTYNAME": "Barnstable County",
        "POPESTIMATE2019": "212990"
      },
      {
        "STATE": "25",
        "COUNTY": "003",
        "STNAME": "Massachusetts",
        "CTYNAME": "Berkshire County",
        "POPESTIMATE2019": "124944"
      },
      {
        "STATE": "25",
        "COUNTY": "005",
        "STNAME": "Massachusetts",
        "CTYNAME": "Bristol County",
        "POPESTIMATE2019": "565217"
      },
      {
        "STATE": "25",
        "COUNTY": "007",
        "STNAME": "Massachusetts",
        "CTYNAME": "Dukes County",
        "POPESTIMATE2019": "17332"
      },
      {
        "STATE": "25",
        "COUNTY": "009",
        "STNAME": "Massachusetts",
        "CTYNAME": "Essex County",
        "POPESTIMATE2019": "789034"
      },
      {
        "STATE": "25",
        "COUNTY": "011",
        "STNAME": "Massachusetts",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "70180"
      },
      {
        "STATE": "25",
        "COUNTY": "013",
        "STNAME": "Massachusetts",
        "CTYNAME": "Hampden County",
        "POPESTIMATE2019": "466372"
      },
      {
        "STATE": "25",
        "COUNTY": "015",
        "STNAME": "Massachusetts",
        "CTYNAME": "Hampshire County",
        "POPESTIMATE2019": "160830"
      },
      {
        "STATE": "25",
        "COUNTY": "017",
        "STNAME": "Massachusetts",
        "CTYNAME": "Middlesex County",
        "POPESTIMATE2019": "1611699"
      },
      {
        "STATE": "25",
        "COUNTY": "019",
        "STNAME": "Massachusetts",
        "CTYNAME": "Nantucket County",
        "POPESTIMATE2019": "11399"
      },
      {
        "STATE": "25",
        "COUNTY": "021",
        "STNAME": "Massachusetts",
        "CTYNAME": "Norfolk County",
        "POPESTIMATE2019": "706775"
      },
      {
        "STATE": "25",
        "COUNTY": "023",
        "STNAME": "Massachusetts",
        "CTYNAME": "Plymouth County",
        "POPESTIMATE2019": "521202"
      },
      {
        "STATE": "25",
        "COUNTY": "025",
        "STNAME": "Massachusetts",
        "CTYNAME": "Suffolk County",
        "POPESTIMATE2019": "803907"
      },
      {
        "STATE": "25",
        "COUNTY": "027",
        "STNAME": "Massachusetts",
        "CTYNAME": "Worcester County",
        "POPESTIMATE2019": "830622"
      },
      {
        "STATE": "26",
        "COUNTY": "000",
        "STNAME": "Michigan",
        "CTYNAME": "Michigan",
        "POPESTIMATE2019": "9986857"
      },
      {
        "STATE": "26",
        "COUNTY": "001",
        "STNAME": "Michigan",
        "CTYNAME": "Alcona County",
        "POPESTIMATE2019": "10405"
      },
      {
        "STATE": "26",
        "COUNTY": "003",
        "STNAME": "Michigan",
        "CTYNAME": "Alger County",
        "POPESTIMATE2019": "9108"
      },
      {
        "STATE": "26",
        "COUNTY": "005",
        "STNAME": "Michigan",
        "CTYNAME": "Allegan County",
        "POPESTIMATE2019": "118081"
      },
      {
        "STATE": "26",
        "COUNTY": "007",
        "STNAME": "Michigan",
        "CTYNAME": "Alpena County",
        "POPESTIMATE2019": "28405"
      },
      {
        "STATE": "26",
        "COUNTY": "009",
        "STNAME": "Michigan",
        "CTYNAME": "Antrim County",
        "POPESTIMATE2019": "23324"
      },
      {
        "STATE": "26",
        "COUNTY": "011",
        "STNAME": "Michigan",
        "CTYNAME": "Arenac County",
        "POPESTIMATE2019": "14883"
      },
      {
        "STATE": "26",
        "COUNTY": "013",
        "STNAME": "Michigan",
        "CTYNAME": "Baraga County",
        "POPESTIMATE2019": "8209"
      },
      {
        "STATE": "26",
        "COUNTY": "015",
        "STNAME": "Michigan",
        "CTYNAME": "Barry County",
        "POPESTIMATE2019": "61550"
      },
      {
        "STATE": "26",
        "COUNTY": "017",
        "STNAME": "Michigan",
        "CTYNAME": "Bay County",
        "POPESTIMATE2019": "103126"
      },
      {
        "STATE": "26",
        "COUNTY": "019",
        "STNAME": "Michigan",
        "CTYNAME": "Benzie County",
        "POPESTIMATE2019": "17766"
      },
      {
        "STATE": "26",
        "COUNTY": "021",
        "STNAME": "Michigan",
        "CTYNAME": "Berrien County",
        "POPESTIMATE2019": "153401"
      },
      {
        "STATE": "26",
        "COUNTY": "023",
        "STNAME": "Michigan",
        "CTYNAME": "Branch County",
        "POPESTIMATE2019": "43517"
      },
      {
        "STATE": "26",
        "COUNTY": "025",
        "STNAME": "Michigan",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "134159"
      },
      {
        "STATE": "26",
        "COUNTY": "027",
        "STNAME": "Michigan",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "51787"
      },
      {
        "STATE": "26",
        "COUNTY": "029",
        "STNAME": "Michigan",
        "CTYNAME": "Charlevoix County",
        "POPESTIMATE2019": "26143"
      },
      {
        "STATE": "26",
        "COUNTY": "031",
        "STNAME": "Michigan",
        "CTYNAME": "Cheboygan County",
        "POPESTIMATE2019": "25276"
      },
      {
        "STATE": "26",
        "COUNTY": "033",
        "STNAME": "Michigan",
        "CTYNAME": "Chippewa County",
        "POPESTIMATE2019": "37349"
      },
      {
        "STATE": "26",
        "COUNTY": "035",
        "STNAME": "Michigan",
        "CTYNAME": "Clare County",
        "POPESTIMATE2019": "30950"
      },
      {
        "STATE": "26",
        "COUNTY": "037",
        "STNAME": "Michigan",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "79595"
      },
      {
        "STATE": "26",
        "COUNTY": "039",
        "STNAME": "Michigan",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "14029"
      },
      {
        "STATE": "26",
        "COUNTY": "041",
        "STNAME": "Michigan",
        "CTYNAME": "Delta County",
        "POPESTIMATE2019": "35784"
      },
      {
        "STATE": "26",
        "COUNTY": "043",
        "STNAME": "Michigan",
        "CTYNAME": "Dickinson County",
        "POPESTIMATE2019": "25239"
      },
      {
        "STATE": "26",
        "COUNTY": "045",
        "STNAME": "Michigan",
        "CTYNAME": "Eaton County",
        "POPESTIMATE2019": "110268"
      },
      {
        "STATE": "26",
        "COUNTY": "047",
        "STNAME": "Michigan",
        "CTYNAME": "Emmet County",
        "POPESTIMATE2019": "33415"
      },
      {
        "STATE": "26",
        "COUNTY": "049",
        "STNAME": "Michigan",
        "CTYNAME": "Genesee County",
        "POPESTIMATE2019": "405813"
      },
      {
        "STATE": "26",
        "COUNTY": "051",
        "STNAME": "Michigan",
        "CTYNAME": "Gladwin County",
        "POPESTIMATE2019": "25449"
      },
      {
        "STATE": "26",
        "COUNTY": "053",
        "STNAME": "Michigan",
        "CTYNAME": "Gogebic County",
        "POPESTIMATE2019": "13975"
      },
      {
        "STATE": "26",
        "COUNTY": "055",
        "STNAME": "Michigan",
        "CTYNAME": "Grand Traverse County",
        "POPESTIMATE2019": "93088"
      },
      {
        "STATE": "26",
        "COUNTY": "057",
        "STNAME": "Michigan",
        "CTYNAME": "Gratiot County",
        "POPESTIMATE2019": "40711"
      },
      {
        "STATE": "26",
        "COUNTY": "059",
        "STNAME": "Michigan",
        "CTYNAME": "Hillsdale County",
        "POPESTIMATE2019": "45605"
      },
      {
        "STATE": "26",
        "COUNTY": "061",
        "STNAME": "Michigan",
        "CTYNAME": "Houghton County",
        "POPESTIMATE2019": "35684"
      },
      {
        "STATE": "26",
        "COUNTY": "063",
        "STNAME": "Michigan",
        "CTYNAME": "Huron County",
        "POPESTIMATE2019": "30981"
      },
      {
        "STATE": "26",
        "COUNTY": "065",
        "STNAME": "Michigan",
        "CTYNAME": "Ingham County",
        "POPESTIMATE2019": "292406"
      },
      {
        "STATE": "26",
        "COUNTY": "067",
        "STNAME": "Michigan",
        "CTYNAME": "Ionia County",
        "POPESTIMATE2019": "64697"
      },
      {
        "STATE": "26",
        "COUNTY": "069",
        "STNAME": "Michigan",
        "CTYNAME": "Iosco County",
        "POPESTIMATE2019": "25127"
      },
      {
        "STATE": "26",
        "COUNTY": "071",
        "STNAME": "Michigan",
        "CTYNAME": "Iron County",
        "POPESTIMATE2019": "11066"
      },
      {
        "STATE": "26",
        "COUNTY": "073",
        "STNAME": "Michigan",
        "CTYNAME": "Isabella County",
        "POPESTIMATE2019": "69872"
      },
      {
        "STATE": "26",
        "COUNTY": "075",
        "STNAME": "Michigan",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "158510"
      },
      {
        "STATE": "26",
        "COUNTY": "077",
        "STNAME": "Michigan",
        "CTYNAME": "Kalamazoo County",
        "POPESTIMATE2019": "265066"
      },
      {
        "STATE": "26",
        "COUNTY": "079",
        "STNAME": "Michigan",
        "CTYNAME": "Kalkaska County",
        "POPESTIMATE2019": "18038"
      },
      {
        "STATE": "26",
        "COUNTY": "081",
        "STNAME": "Michigan",
        "CTYNAME": "Kent County",
        "POPESTIMATE2019": "656955"
      },
      {
        "STATE": "26",
        "COUNTY": "083",
        "STNAME": "Michigan",
        "CTYNAME": "Keweenaw County",
        "POPESTIMATE2019": "2116"
      },
      {
        "STATE": "26",
        "COUNTY": "085",
        "STNAME": "Michigan",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "11853"
      },
      {
        "STATE": "26",
        "COUNTY": "087",
        "STNAME": "Michigan",
        "CTYNAME": "Lapeer County",
        "POPESTIMATE2019": "87607"
      },
      {
        "STATE": "26",
        "COUNTY": "089",
        "STNAME": "Michigan",
        "CTYNAME": "Leelanau County",
        "POPESTIMATE2019": "21761"
      },
      {
        "STATE": "26",
        "COUNTY": "091",
        "STNAME": "Michigan",
        "CTYNAME": "Lenawee County",
        "POPESTIMATE2019": "98451"
      },
      {
        "STATE": "26",
        "COUNTY": "093",
        "STNAME": "Michigan",
        "CTYNAME": "Livingston County",
        "POPESTIMATE2019": "191995"
      },
      {
        "STATE": "26",
        "COUNTY": "095",
        "STNAME": "Michigan",
        "CTYNAME": "Luce County",
        "POPESTIMATE2019": "6229"
      },
      {
        "STATE": "26",
        "COUNTY": "097",
        "STNAME": "Michigan",
        "CTYNAME": "Mackinac County",
        "POPESTIMATE2019": "10799"
      },
      {
        "STATE": "26",
        "COUNTY": "099",
        "STNAME": "Michigan",
        "CTYNAME": "Macomb County",
        "POPESTIMATE2019": "873972"
      },
      {
        "STATE": "26",
        "COUNTY": "101",
        "STNAME": "Michigan",
        "CTYNAME": "Manistee County",
        "POPESTIMATE2019": "24558"
      },
      {
        "STATE": "26",
        "COUNTY": "103",
        "STNAME": "Michigan",
        "CTYNAME": "Marquette County",
        "POPESTIMATE2019": "66699"
      },
      {
        "STATE": "26",
        "COUNTY": "105",
        "STNAME": "Michigan",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "29144"
      },
      {
        "STATE": "26",
        "COUNTY": "107",
        "STNAME": "Michigan",
        "CTYNAME": "Mecosta County",
        "POPESTIMATE2019": "43453"
      },
      {
        "STATE": "26",
        "COUNTY": "109",
        "STNAME": "Michigan",
        "CTYNAME": "Menominee County",
        "POPESTIMATE2019": "22780"
      },
      {
        "STATE": "26",
        "COUNTY": "111",
        "STNAME": "Michigan",
        "CTYNAME": "Midland County",
        "POPESTIMATE2019": "83156"
      },
      {
        "STATE": "26",
        "COUNTY": "113",
        "STNAME": "Michigan",
        "CTYNAME": "Missaukee County",
        "POPESTIMATE2019": "15118"
      },
      {
        "STATE": "26",
        "COUNTY": "115",
        "STNAME": "Michigan",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "150500"
      },
      {
        "STATE": "26",
        "COUNTY": "117",
        "STNAME": "Michigan",
        "CTYNAME": "Montcalm County",
        "POPESTIMATE2019": "63888"
      },
      {
        "STATE": "26",
        "COUNTY": "119",
        "STNAME": "Michigan",
        "CTYNAME": "Montmorency County",
        "POPESTIMATE2019": "9328"
      },
      {
        "STATE": "26",
        "COUNTY": "121",
        "STNAME": "Michigan",
        "CTYNAME": "Muskegon County",
        "POPESTIMATE2019": "173566"
      },
      {
        "STATE": "26",
        "COUNTY": "123",
        "STNAME": "Michigan",
        "CTYNAME": "Newaygo County",
        "POPESTIMATE2019": "48980"
      },
      {
        "STATE": "26",
        "COUNTY": "125",
        "STNAME": "Michigan",
        "CTYNAME": "Oakland County",
        "POPESTIMATE2019": "1257584"
      },
      {
        "STATE": "26",
        "COUNTY": "127",
        "STNAME": "Michigan",
        "CTYNAME": "Oceana County",
        "POPESTIMATE2019": "26467"
      },
      {
        "STATE": "26",
        "COUNTY": "129",
        "STNAME": "Michigan",
        "CTYNAME": "Ogemaw County",
        "POPESTIMATE2019": "20997"
      },
      {
        "STATE": "26",
        "COUNTY": "131",
        "STNAME": "Michigan",
        "CTYNAME": "Ontonagon County",
        "POPESTIMATE2019": "5720"
      },
      {
        "STATE": "26",
        "COUNTY": "133",
        "STNAME": "Michigan",
        "CTYNAME": "Osceola County",
        "POPESTIMATE2019": "23460"
      },
      {
        "STATE": "26",
        "COUNTY": "135",
        "STNAME": "Michigan",
        "CTYNAME": "Oscoda County",
        "POPESTIMATE2019": "8241"
      },
      {
        "STATE": "26",
        "COUNTY": "137",
        "STNAME": "Michigan",
        "CTYNAME": "Otsego County",
        "POPESTIMATE2019": "24668"
      },
      {
        "STATE": "26",
        "COUNTY": "139",
        "STNAME": "Michigan",
        "CTYNAME": "Ottawa County",
        "POPESTIMATE2019": "291830"
      },
      {
        "STATE": "26",
        "COUNTY": "141",
        "STNAME": "Michigan",
        "CTYNAME": "Presque Isle County",
        "POPESTIMATE2019": "12592"
      },
      {
        "STATE": "26",
        "COUNTY": "143",
        "STNAME": "Michigan",
        "CTYNAME": "Roscommon County",
        "POPESTIMATE2019": "24019"
      },
      {
        "STATE": "26",
        "COUNTY": "145",
        "STNAME": "Michigan",
        "CTYNAME": "Saginaw County",
        "POPESTIMATE2019": "190539"
      },
      {
        "STATE": "26",
        "COUNTY": "147",
        "STNAME": "Michigan",
        "CTYNAME": "St. Clair County",
        "POPESTIMATE2019": "159128"
      },
      {
        "STATE": "26",
        "COUNTY": "149",
        "STNAME": "Michigan",
        "CTYNAME": "St. Joseph County",
        "POPESTIMATE2019": "60964"
      },
      {
        "STATE": "26",
        "COUNTY": "151",
        "STNAME": "Michigan",
        "CTYNAME": "Sanilac County",
        "POPESTIMATE2019": "41170"
      },
      {
        "STATE": "26",
        "COUNTY": "153",
        "STNAME": "Michigan",
        "CTYNAME": "Schoolcraft County",
        "POPESTIMATE2019": "8094"
      },
      {
        "STATE": "26",
        "COUNTY": "155",
        "STNAME": "Michigan",
        "CTYNAME": "Shiawassee County",
        "POPESTIMATE2019": "68122"
      },
      {
        "STATE": "26",
        "COUNTY": "157",
        "STNAME": "Michigan",
        "CTYNAME": "Tuscola County",
        "POPESTIMATE2019": "52245"
      },
      {
        "STATE": "26",
        "COUNTY": "159",
        "STNAME": "Michigan",
        "CTYNAME": "Van Buren County",
        "POPESTIMATE2019": "75677"
      },
      {
        "STATE": "26",
        "COUNTY": "161",
        "STNAME": "Michigan",
        "CTYNAME": "Washtenaw County",
        "POPESTIMATE2019": "367601"
      },
      {
        "STATE": "26",
        "COUNTY": "163",
        "STNAME": "Michigan",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "1749343"
      },
      {
        "STATE": "26",
        "COUNTY": "165",
        "STNAME": "Michigan",
        "CTYNAME": "Wexford County",
        "POPESTIMATE2019": "33631"
      },
      {
        "STATE": "27",
        "COUNTY": "000",
        "STNAME": "Minnesota",
        "CTYNAME": "Minnesota",
        "POPESTIMATE2019": "5639632"
      },
      {
        "STATE": "27",
        "COUNTY": "001",
        "STNAME": "Minnesota",
        "CTYNAME": "Aitkin County",
        "POPESTIMATE2019": "15886"
      },
      {
        "STATE": "27",
        "COUNTY": "003",
        "STNAME": "Minnesota",
        "CTYNAME": "Anoka County",
        "POPESTIMATE2019": "356921"
      },
      {
        "STATE": "27",
        "COUNTY": "005",
        "STNAME": "Minnesota",
        "CTYNAME": "Becker County",
        "POPESTIMATE2019": "34423"
      },
      {
        "STATE": "27",
        "COUNTY": "007",
        "STNAME": "Minnesota",
        "CTYNAME": "Beltrami County",
        "POPESTIMATE2019": "47188"
      },
      {
        "STATE": "27",
        "COUNTY": "009",
        "STNAME": "Minnesota",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "40889"
      },
      {
        "STATE": "27",
        "COUNTY": "011",
        "STNAME": "Minnesota",
        "CTYNAME": "Big Stone County",
        "POPESTIMATE2019": "4991"
      },
      {
        "STATE": "27",
        "COUNTY": "013",
        "STNAME": "Minnesota",
        "CTYNAME": "Blue Earth County",
        "POPESTIMATE2019": "67653"
      },
      {
        "STATE": "27",
        "COUNTY": "015",
        "STNAME": "Minnesota",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "25008"
      },
      {
        "STATE": "27",
        "COUNTY": "017",
        "STNAME": "Minnesota",
        "CTYNAME": "Carlton County",
        "POPESTIMATE2019": "35871"
      },
      {
        "STATE": "27",
        "COUNTY": "019",
        "STNAME": "Minnesota",
        "CTYNAME": "Carver County",
        "POPESTIMATE2019": "105089"
      },
      {
        "STATE": "27",
        "COUNTY": "021",
        "STNAME": "Minnesota",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "29779"
      },
      {
        "STATE": "27",
        "COUNTY": "023",
        "STNAME": "Minnesota",
        "CTYNAME": "Chippewa County",
        "POPESTIMATE2019": "11800"
      },
      {
        "STATE": "27",
        "COUNTY": "025",
        "STNAME": "Minnesota",
        "CTYNAME": "Chisago County",
        "POPESTIMATE2019": "56579"
      },
      {
        "STATE": "27",
        "COUNTY": "027",
        "STNAME": "Minnesota",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "64222"
      },
      {
        "STATE": "27",
        "COUNTY": "029",
        "STNAME": "Minnesota",
        "CTYNAME": "Clearwater County",
        "POPESTIMATE2019": "8818"
      },
      {
        "STATE": "27",
        "COUNTY": "031",
        "STNAME": "Minnesota",
        "CTYNAME": "Cook County",
        "POPESTIMATE2019": "5463"
      },
      {
        "STATE": "27",
        "COUNTY": "033",
        "STNAME": "Minnesota",
        "CTYNAME": "Cottonwood County",
        "POPESTIMATE2019": "11196"
      },
      {
        "STATE": "27",
        "COUNTY": "035",
        "STNAME": "Minnesota",
        "CTYNAME": "Crow Wing County",
        "POPESTIMATE2019": "65055"
      },
      {
        "STATE": "27",
        "COUNTY": "037",
        "STNAME": "Minnesota",
        "CTYNAME": "Dakota County",
        "POPESTIMATE2019": "429021"
      },
      {
        "STATE": "27",
        "COUNTY": "039",
        "STNAME": "Minnesota",
        "CTYNAME": "Dodge County",
        "POPESTIMATE2019": "20934"
      },
      {
        "STATE": "27",
        "COUNTY": "041",
        "STNAME": "Minnesota",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "38141"
      },
      {
        "STATE": "27",
        "COUNTY": "043",
        "STNAME": "Minnesota",
        "CTYNAME": "Faribault County",
        "POPESTIMATE2019": "13653"
      },
      {
        "STATE": "27",
        "COUNTY": "045",
        "STNAME": "Minnesota",
        "CTYNAME": "Fillmore County",
        "POPESTIMATE2019": "21067"
      },
      {
        "STATE": "27",
        "COUNTY": "047",
        "STNAME": "Minnesota",
        "CTYNAME": "Freeborn County",
        "POPESTIMATE2019": "30281"
      },
      {
        "STATE": "27",
        "COUNTY": "049",
        "STNAME": "Minnesota",
        "CTYNAME": "Goodhue County",
        "POPESTIMATE2019": "46340"
      },
      {
        "STATE": "27",
        "COUNTY": "051",
        "STNAME": "Minnesota",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "5972"
      },
      {
        "STATE": "27",
        "COUNTY": "053",
        "STNAME": "Minnesota",
        "CTYNAME": "Hennepin County",
        "POPESTIMATE2019": "1265843"
      },
      {
        "STATE": "27",
        "COUNTY": "055",
        "STNAME": "Minnesota",
        "CTYNAME": "Houston County",
        "POPESTIMATE2019": "18600"
      },
      {
        "STATE": "27",
        "COUNTY": "057",
        "STNAME": "Minnesota",
        "CTYNAME": "Hubbard County",
        "POPESTIMATE2019": "21491"
      },
      {
        "STATE": "27",
        "COUNTY": "059",
        "STNAME": "Minnesota",
        "CTYNAME": "Isanti County",
        "POPESTIMATE2019": "40596"
      },
      {
        "STATE": "27",
        "COUNTY": "061",
        "STNAME": "Minnesota",
        "CTYNAME": "Itasca County",
        "POPESTIMATE2019": "45130"
      },
      {
        "STATE": "27",
        "COUNTY": "063",
        "STNAME": "Minnesota",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "9846"
      },
      {
        "STATE": "27",
        "COUNTY": "065",
        "STNAME": "Minnesota",
        "CTYNAME": "Kanabec County",
        "POPESTIMATE2019": "16337"
      },
      {
        "STATE": "27",
        "COUNTY": "067",
        "STNAME": "Minnesota",
        "CTYNAME": "Kandiyohi County",
        "POPESTIMATE2019": "43199"
      },
      {
        "STATE": "27",
        "COUNTY": "069",
        "STNAME": "Minnesota",
        "CTYNAME": "Kittson County",
        "POPESTIMATE2019": "4298"
      },
      {
        "STATE": "27",
        "COUNTY": "071",
        "STNAME": "Minnesota",
        "CTYNAME": "Koochiching County",
        "POPESTIMATE2019": "12229"
      },
      {
        "STATE": "27",
        "COUNTY": "073",
        "STNAME": "Minnesota",
        "CTYNAME": "Lac qui Parle County",
        "POPESTIMATE2019": "6623"
      },
      {
        "STATE": "27",
        "COUNTY": "075",
        "STNAME": "Minnesota",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "10641"
      },
      {
        "STATE": "27",
        "COUNTY": "077",
        "STNAME": "Minnesota",
        "CTYNAME": "Lake of the Woods County",
        "POPESTIMATE2019": "3740"
      },
      {
        "STATE": "27",
        "COUNTY": "079",
        "STNAME": "Minnesota",
        "CTYNAME": "Le Sueur County",
        "POPESTIMATE2019": "28887"
      },
      {
        "STATE": "27",
        "COUNTY": "081",
        "STNAME": "Minnesota",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "5639"
      },
      {
        "STATE": "27",
        "COUNTY": "083",
        "STNAME": "Minnesota",
        "CTYNAME": "Lyon County",
        "POPESTIMATE2019": "25474"
      },
      {
        "STATE": "27",
        "COUNTY": "085",
        "STNAME": "Minnesota",
        "CTYNAME": "McLeod County",
        "POPESTIMATE2019": "35893"
      },
      {
        "STATE": "27",
        "COUNTY": "087",
        "STNAME": "Minnesota",
        "CTYNAME": "Mahnomen County",
        "POPESTIMATE2019": "5527"
      },
      {
        "STATE": "27",
        "COUNTY": "089",
        "STNAME": "Minnesota",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "9336"
      },
      {
        "STATE": "27",
        "COUNTY": "091",
        "STNAME": "Minnesota",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "19683"
      },
      {
        "STATE": "27",
        "COUNTY": "093",
        "STNAME": "Minnesota",
        "CTYNAME": "Meeker County",
        "POPESTIMATE2019": "23222"
      },
      {
        "STATE": "27",
        "COUNTY": "095",
        "STNAME": "Minnesota",
        "CTYNAME": "Mille Lacs County",
        "POPESTIMATE2019": "26277"
      },
      {
        "STATE": "27",
        "COUNTY": "097",
        "STNAME": "Minnesota",
        "CTYNAME": "Morrison County",
        "POPESTIMATE2019": "33386"
      },
      {
        "STATE": "27",
        "COUNTY": "099",
        "STNAME": "Minnesota",
        "CTYNAME": "Mower County",
        "POPESTIMATE2019": "40062"
      },
      {
        "STATE": "27",
        "COUNTY": "101",
        "STNAME": "Minnesota",
        "CTYNAME": "Murray County",
        "POPESTIMATE2019": "8194"
      },
      {
        "STATE": "27",
        "COUNTY": "103",
        "STNAME": "Minnesota",
        "CTYNAME": "Nicollet County",
        "POPESTIMATE2019": "34274"
      },
      {
        "STATE": "27",
        "COUNTY": "105",
        "STNAME": "Minnesota",
        "CTYNAME": "Nobles County",
        "POPESTIMATE2019": "21629"
      },
      {
        "STATE": "27",
        "COUNTY": "107",
        "STNAME": "Minnesota",
        "CTYNAME": "Norman County",
        "POPESTIMATE2019": "6375"
      },
      {
        "STATE": "27",
        "COUNTY": "109",
        "STNAME": "Minnesota",
        "CTYNAME": "Olmsted County",
        "POPESTIMATE2019": "158293"
      },
      {
        "STATE": "27",
        "COUNTY": "111",
        "STNAME": "Minnesota",
        "CTYNAME": "Otter Tail County",
        "POPESTIMATE2019": "58746"
      },
      {
        "STATE": "27",
        "COUNTY": "113",
        "STNAME": "Minnesota",
        "CTYNAME": "Pennington County",
        "POPESTIMATE2019": "14119"
      },
      {
        "STATE": "27",
        "COUNTY": "115",
        "STNAME": "Minnesota",
        "CTYNAME": "Pine County",
        "POPESTIMATE2019": "29579"
      },
      {
        "STATE": "27",
        "COUNTY": "117",
        "STNAME": "Minnesota",
        "CTYNAME": "Pipestone County",
        "POPESTIMATE2019": "9126"
      },
      {
        "STATE": "27",
        "COUNTY": "119",
        "STNAME": "Minnesota",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "31364"
      },
      {
        "STATE": "27",
        "COUNTY": "121",
        "STNAME": "Minnesota",
        "CTYNAME": "Pope County",
        "POPESTIMATE2019": "11249"
      },
      {
        "STATE": "27",
        "COUNTY": "123",
        "STNAME": "Minnesota",
        "CTYNAME": "Ramsey County",
        "POPESTIMATE2019": "550321"
      },
      {
        "STATE": "27",
        "COUNTY": "125",
        "STNAME": "Minnesota",
        "CTYNAME": "Red Lake County",
        "POPESTIMATE2019": "4055"
      },
      {
        "STATE": "27",
        "COUNTY": "127",
        "STNAME": "Minnesota",
        "CTYNAME": "Redwood County",
        "POPESTIMATE2019": "15170"
      },
      {
        "STATE": "27",
        "COUNTY": "129",
        "STNAME": "Minnesota",
        "CTYNAME": "Renville County",
        "POPESTIMATE2019": "14548"
      },
      {
        "STATE": "27",
        "COUNTY": "131",
        "STNAME": "Minnesota",
        "CTYNAME": "Rice County",
        "POPESTIMATE2019": "66972"
      },
      {
        "STATE": "27",
        "COUNTY": "133",
        "STNAME": "Minnesota",
        "CTYNAME": "Rock County",
        "POPESTIMATE2019": "9315"
      },
      {
        "STATE": "27",
        "COUNTY": "135",
        "STNAME": "Minnesota",
        "CTYNAME": "Roseau County",
        "POPESTIMATE2019": "15165"
      },
      {
        "STATE": "27",
        "COUNTY": "137",
        "STNAME": "Minnesota",
        "CTYNAME": "St. Louis County",
        "POPESTIMATE2019": "199070"
      },
      {
        "STATE": "27",
        "COUNTY": "139",
        "STNAME": "Minnesota",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "149013"
      },
      {
        "STATE": "27",
        "COUNTY": "141",
        "STNAME": "Minnesota",
        "CTYNAME": "Sherburne County",
        "POPESTIMATE2019": "97238"
      },
      {
        "STATE": "27",
        "COUNTY": "143",
        "STNAME": "Minnesota",
        "CTYNAME": "Sibley County",
        "POPESTIMATE2019": "14865"
      },
      {
        "STATE": "27",
        "COUNTY": "145",
        "STNAME": "Minnesota",
        "CTYNAME": "Stearns County",
        "POPESTIMATE2019": "161075"
      },
      {
        "STATE": "27",
        "COUNTY": "147",
        "STNAME": "Minnesota",
        "CTYNAME": "Steele County",
        "POPESTIMATE2019": "36649"
      },
      {
        "STATE": "27",
        "COUNTY": "149",
        "STNAME": "Minnesota",
        "CTYNAME": "Stevens County",
        "POPESTIMATE2019": "9805"
      },
      {
        "STATE": "27",
        "COUNTY": "151",
        "STNAME": "Minnesota",
        "CTYNAME": "Swift County",
        "POPESTIMATE2019": "9266"
      },
      {
        "STATE": "27",
        "COUNTY": "153",
        "STNAME": "Minnesota",
        "CTYNAME": "Todd County",
        "POPESTIMATE2019": "24664"
      },
      {
        "STATE": "27",
        "COUNTY": "155",
        "STNAME": "Minnesota",
        "CTYNAME": "Traverse County",
        "POPESTIMATE2019": "3259"
      },
      {
        "STATE": "27",
        "COUNTY": "157",
        "STNAME": "Minnesota",
        "CTYNAME": "Wabasha County",
        "POPESTIMATE2019": "21627"
      },
      {
        "STATE": "27",
        "COUNTY": "159",
        "STNAME": "Minnesota",
        "CTYNAME": "Wadena County",
        "POPESTIMATE2019": "13682"
      },
      {
        "STATE": "27",
        "COUNTY": "161",
        "STNAME": "Minnesota",
        "CTYNAME": "Waseca County",
        "POPESTIMATE2019": "18612"
      },
      {
        "STATE": "27",
        "COUNTY": "163",
        "STNAME": "Minnesota",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "262440"
      },
      {
        "STATE": "27",
        "COUNTY": "165",
        "STNAME": "Minnesota",
        "CTYNAME": "Watonwan County",
        "POPESTIMATE2019": "10897"
      },
      {
        "STATE": "27",
        "COUNTY": "167",
        "STNAME": "Minnesota",
        "CTYNAME": "Wilkin County",
        "POPESTIMATE2019": "6207"
      },
      {
        "STATE": "27",
        "COUNTY": "169",
        "STNAME": "Minnesota",
        "CTYNAME": "Winona County",
        "POPESTIMATE2019": "50484"
      },
      {
        "STATE": "27",
        "COUNTY": "171",
        "STNAME": "Minnesota",
        "CTYNAME": "Wright County",
        "POPESTIMATE2019": "138377"
      },
      {
        "STATE": "27",
        "COUNTY": "173",
        "STNAME": "Minnesota",
        "CTYNAME": "Yellow Medicine County",
        "POPESTIMATE2019": "9709"
      },
      {
        "STATE": "28",
        "COUNTY": "000",
        "STNAME": "Mississippi",
        "CTYNAME": "Mississippi",
        "POPESTIMATE2019": "2976149"
      },
      {
        "STATE": "28",
        "COUNTY": "001",
        "STNAME": "Mississippi",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "30693"
      },
      {
        "STATE": "28",
        "COUNTY": "003",
        "STNAME": "Mississippi",
        "CTYNAME": "Alcorn County",
        "POPESTIMATE2019": "36953"
      },
      {
        "STATE": "28",
        "COUNTY": "005",
        "STNAME": "Mississippi",
        "CTYNAME": "Amite County",
        "POPESTIMATE2019": "12297"
      },
      {
        "STATE": "28",
        "COUNTY": "007",
        "STNAME": "Mississippi",
        "CTYNAME": "Attala County",
        "POPESTIMATE2019": "18174"
      },
      {
        "STATE": "28",
        "COUNTY": "009",
        "STNAME": "Mississippi",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "8259"
      },
      {
        "STATE": "28",
        "COUNTY": "011",
        "STNAME": "Mississippi",
        "CTYNAME": "Bolivar County",
        "POPESTIMATE2019": "30628"
      },
      {
        "STATE": "28",
        "COUNTY": "013",
        "STNAME": "Mississippi",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "14361"
      },
      {
        "STATE": "28",
        "COUNTY": "015",
        "STNAME": "Mississippi",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "9947"
      },
      {
        "STATE": "28",
        "COUNTY": "017",
        "STNAME": "Mississippi",
        "CTYNAME": "Chickasaw County",
        "POPESTIMATE2019": "17103"
      },
      {
        "STATE": "28",
        "COUNTY": "019",
        "STNAME": "Mississippi",
        "CTYNAME": "Choctaw County",
        "POPESTIMATE2019": "8210"
      },
      {
        "STATE": "28",
        "COUNTY": "021",
        "STNAME": "Mississippi",
        "CTYNAME": "Claiborne County",
        "POPESTIMATE2019": "8988"
      },
      {
        "STATE": "28",
        "COUNTY": "023",
        "STNAME": "Mississippi",
        "CTYNAME": "Clarke County",
        "POPESTIMATE2019": "15541"
      },
      {
        "STATE": "28",
        "COUNTY": "025",
        "STNAME": "Mississippi",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "19316"
      },
      {
        "STATE": "28",
        "COUNTY": "027",
        "STNAME": "Mississippi",
        "CTYNAME": "Coahoma County",
        "POPESTIMATE2019": "22124"
      },
      {
        "STATE": "28",
        "COUNTY": "029",
        "STNAME": "Mississippi",
        "CTYNAME": "Copiah County",
        "POPESTIMATE2019": "28065"
      },
      {
        "STATE": "28",
        "COUNTY": "031",
        "STNAME": "Mississippi",
        "CTYNAME": "Covington County",
        "POPESTIMATE2019": "18636"
      },
      {
        "STATE": "28",
        "COUNTY": "033",
        "STNAME": "Mississippi",
        "CTYNAME": "DeSoto County",
        "POPESTIMATE2019": "184945"
      },
      {
        "STATE": "28",
        "COUNTY": "035",
        "STNAME": "Mississippi",
        "CTYNAME": "Forrest County",
        "POPESTIMATE2019": "74897"
      },
      {
        "STATE": "28",
        "COUNTY": "037",
        "STNAME": "Mississippi",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "7713"
      },
      {
        "STATE": "28",
        "COUNTY": "039",
        "STNAME": "Mississippi",
        "CTYNAME": "George County",
        "POPESTIMATE2019": "24500"
      },
      {
        "STATE": "28",
        "COUNTY": "041",
        "STNAME": "Mississippi",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "13586"
      },
      {
        "STATE": "28",
        "COUNTY": "043",
        "STNAME": "Mississippi",
        "CTYNAME": "Grenada County",
        "POPESTIMATE2019": "20758"
      },
      {
        "STATE": "28",
        "COUNTY": "045",
        "STNAME": "Mississippi",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "47632"
      },
      {
        "STATE": "28",
        "COUNTY": "047",
        "STNAME": "Mississippi",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "208080"
      },
      {
        "STATE": "28",
        "COUNTY": "049",
        "STNAME": "Mississippi",
        "CTYNAME": "Hinds County",
        "POPESTIMATE2019": "231840"
      },
      {
        "STATE": "28",
        "COUNTY": "051",
        "STNAME": "Mississippi",
        "CTYNAME": "Holmes County",
        "POPESTIMATE2019": "17010"
      },
      {
        "STATE": "28",
        "COUNTY": "053",
        "STNAME": "Mississippi",
        "CTYNAME": "Humphreys County",
        "POPESTIMATE2019": "8064"
      },
      {
        "STATE": "28",
        "COUNTY": "055",
        "STNAME": "Mississippi",
        "CTYNAME": "Issaquena County",
        "POPESTIMATE2019": "1327"
      },
      {
        "STATE": "28",
        "COUNTY": "057",
        "STNAME": "Mississippi",
        "CTYNAME": "Itawamba County",
        "POPESTIMATE2019": "23390"
      },
      {
        "STATE": "28",
        "COUNTY": "059",
        "STNAME": "Mississippi",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "143617"
      },
      {
        "STATE": "28",
        "COUNTY": "061",
        "STNAME": "Mississippi",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "16383"
      },
      {
        "STATE": "28",
        "COUNTY": "063",
        "STNAME": "Mississippi",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "6990"
      },
      {
        "STATE": "28",
        "COUNTY": "065",
        "STNAME": "Mississippi",
        "CTYNAME": "Jefferson Davis County",
        "POPESTIMATE2019": "11128"
      },
      {
        "STATE": "28",
        "COUNTY": "067",
        "STNAME": "Mississippi",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "68098"
      },
      {
        "STATE": "28",
        "COUNTY": "069",
        "STNAME": "Mississippi",
        "CTYNAME": "Kemper County",
        "POPESTIMATE2019": "9742"
      },
      {
        "STATE": "28",
        "COUNTY": "071",
        "STNAME": "Mississippi",
        "CTYNAME": "Lafayette County",
        "POPESTIMATE2019": "54019"
      },
      {
        "STATE": "28",
        "COUNTY": "073",
        "STNAME": "Mississippi",
        "CTYNAME": "Lamar County",
        "POPESTIMATE2019": "63343"
      },
      {
        "STATE": "28",
        "COUNTY": "075",
        "STNAME": "Mississippi",
        "CTYNAME": "Lauderdale County",
        "POPESTIMATE2019": "74125"
      },
      {
        "STATE": "28",
        "COUNTY": "077",
        "STNAME": "Mississippi",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "12586"
      },
      {
        "STATE": "28",
        "COUNTY": "079",
        "STNAME": "Mississippi",
        "CTYNAME": "Leake County",
        "POPESTIMATE2019": "22786"
      },
      {
        "STATE": "28",
        "COUNTY": "081",
        "STNAME": "Mississippi",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "85436"
      },
      {
        "STATE": "28",
        "COUNTY": "083",
        "STNAME": "Mississippi",
        "CTYNAME": "Leflore County",
        "POPESTIMATE2019": "28183"
      },
      {
        "STATE": "28",
        "COUNTY": "085",
        "STNAME": "Mississippi",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "34153"
      },
      {
        "STATE": "28",
        "COUNTY": "087",
        "STNAME": "Mississippi",
        "CTYNAME": "Lowndes County",
        "POPESTIMATE2019": "58595"
      },
      {
        "STATE": "28",
        "COUNTY": "089",
        "STNAME": "Mississippi",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "106272"
      },
      {
        "STATE": "28",
        "COUNTY": "091",
        "STNAME": "Mississippi",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "24573"
      },
      {
        "STATE": "28",
        "COUNTY": "093",
        "STNAME": "Mississippi",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "35294"
      },
      {
        "STATE": "28",
        "COUNTY": "095",
        "STNAME": "Mississippi",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "35252"
      },
      {
        "STATE": "28",
        "COUNTY": "097",
        "STNAME": "Mississippi",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "9775"
      },
      {
        "STATE": "28",
        "COUNTY": "099",
        "STNAME": "Mississippi",
        "CTYNAME": "Neshoba County",
        "POPESTIMATE2019": "29118"
      },
      {
        "STATE": "28",
        "COUNTY": "101",
        "STNAME": "Mississippi",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "21018"
      },
      {
        "STATE": "28",
        "COUNTY": "103",
        "STNAME": "Mississippi",
        "CTYNAME": "Noxubee County",
        "POPESTIMATE2019": "10417"
      },
      {
        "STATE": "28",
        "COUNTY": "105",
        "STNAME": "Mississippi",
        "CTYNAME": "Oktibbeha County",
        "POPESTIMATE2019": "49587"
      },
      {
        "STATE": "28",
        "COUNTY": "107",
        "STNAME": "Mississippi",
        "CTYNAME": "Panola County",
        "POPESTIMATE2019": "34192"
      },
      {
        "STATE": "28",
        "COUNTY": "109",
        "STNAME": "Mississippi",
        "CTYNAME": "Pearl River County",
        "POPESTIMATE2019": "55535"
      },
      {
        "STATE": "28",
        "COUNTY": "111",
        "STNAME": "Mississippi",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "11973"
      },
      {
        "STATE": "28",
        "COUNTY": "113",
        "STNAME": "Mississippi",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "39288"
      },
      {
        "STATE": "28",
        "COUNTY": "115",
        "STNAME": "Mississippi",
        "CTYNAME": "Pontotoc County",
        "POPESTIMATE2019": "32174"
      },
      {
        "STATE": "28",
        "COUNTY": "117",
        "STNAME": "Mississippi",
        "CTYNAME": "Prentiss County",
        "POPESTIMATE2019": "25126"
      },
      {
        "STATE": "28",
        "COUNTY": "119",
        "STNAME": "Mississippi",
        "CTYNAME": "Quitman County",
        "POPESTIMATE2019": "6792"
      },
      {
        "STATE": "28",
        "COUNTY": "121",
        "STNAME": "Mississippi",
        "CTYNAME": "Rankin County",
        "POPESTIMATE2019": "155271"
      },
      {
        "STATE": "28",
        "COUNTY": "123",
        "STNAME": "Mississippi",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "28124"
      },
      {
        "STATE": "28",
        "COUNTY": "125",
        "STNAME": "Mississippi",
        "CTYNAME": "Sharkey County",
        "POPESTIMATE2019": "4321"
      },
      {
        "STATE": "28",
        "COUNTY": "127",
        "STNAME": "Mississippi",
        "CTYNAME": "Simpson County",
        "POPESTIMATE2019": "26658"
      },
      {
        "STATE": "28",
        "COUNTY": "129",
        "STNAME": "Mississippi",
        "CTYNAME": "Smith County",
        "POPESTIMATE2019": "15916"
      },
      {
        "STATE": "28",
        "COUNTY": "131",
        "STNAME": "Mississippi",
        "CTYNAME": "Stone County",
        "POPESTIMATE2019": "18336"
      },
      {
        "STATE": "28",
        "COUNTY": "133",
        "STNAME": "Mississippi",
        "CTYNAME": "Sunflower County",
        "POPESTIMATE2019": "25110"
      },
      {
        "STATE": "28",
        "COUNTY": "135",
        "STNAME": "Mississippi",
        "CTYNAME": "Tallahatchie County",
        "POPESTIMATE2019": "13809"
      },
      {
        "STATE": "28",
        "COUNTY": "137",
        "STNAME": "Mississippi",
        "CTYNAME": "Tate County",
        "POPESTIMATE2019": "28321"
      },
      {
        "STATE": "28",
        "COUNTY": "139",
        "STNAME": "Mississippi",
        "CTYNAME": "Tippah County",
        "POPESTIMATE2019": "22015"
      },
      {
        "STATE": "28",
        "COUNTY": "141",
        "STNAME": "Mississippi",
        "CTYNAME": "Tishomingo County",
        "POPESTIMATE2019": "19383"
      },
      {
        "STATE": "28",
        "COUNTY": "143",
        "STNAME": "Mississippi",
        "CTYNAME": "Tunica County",
        "POPESTIMATE2019": "9632"
      },
      {
        "STATE": "28",
        "COUNTY": "145",
        "STNAME": "Mississippi",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "28815"
      },
      {
        "STATE": "28",
        "COUNTY": "147",
        "STNAME": "Mississippi",
        "CTYNAME": "Walthall County",
        "POPESTIMATE2019": "14286"
      },
      {
        "STATE": "28",
        "COUNTY": "149",
        "STNAME": "Mississippi",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "45381"
      },
      {
        "STATE": "28",
        "COUNTY": "151",
        "STNAME": "Mississippi",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "43909"
      },
      {
        "STATE": "28",
        "COUNTY": "153",
        "STNAME": "Mississippi",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "20183"
      },
      {
        "STATE": "28",
        "COUNTY": "155",
        "STNAME": "Mississippi",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "9689"
      },
      {
        "STATE": "28",
        "COUNTY": "157",
        "STNAME": "Mississippi",
        "CTYNAME": "Wilkinson County",
        "POPESTIMATE2019": "8630"
      },
      {
        "STATE": "28",
        "COUNTY": "159",
        "STNAME": "Mississippi",
        "CTYNAME": "Winston County",
        "POPESTIMATE2019": "17955"
      },
      {
        "STATE": "28",
        "COUNTY": "161",
        "STNAME": "Mississippi",
        "CTYNAME": "Yalobusha County",
        "POPESTIMATE2019": "12108"
      },
      {
        "STATE": "28",
        "COUNTY": "163",
        "STNAME": "Mississippi",
        "CTYNAME": "Yazoo County",
        "POPESTIMATE2019": "29690"
      },
      {
        "STATE": "29",
        "COUNTY": "000",
        "STNAME": "Missouri",
        "CTYNAME": "Missouri",
        "POPESTIMATE2019": "6137428"
      },
      {
        "STATE": "29",
        "COUNTY": "001",
        "STNAME": "Missouri",
        "CTYNAME": "Adair County",
        "POPESTIMATE2019": "25343"
      },
      {
        "STATE": "29",
        "COUNTY": "003",
        "STNAME": "Missouri",
        "CTYNAME": "Andrew County",
        "POPESTIMATE2019": "17712"
      },
      {
        "STATE": "29",
        "COUNTY": "005",
        "STNAME": "Missouri",
        "CTYNAME": "Atchison County",
        "POPESTIMATE2019": "5143"
      },
      {
        "STATE": "29",
        "COUNTY": "007",
        "STNAME": "Missouri",
        "CTYNAME": "Audrain County",
        "POPESTIMATE2019": "25388"
      },
      {
        "STATE": "29",
        "COUNTY": "009",
        "STNAME": "Missouri",
        "CTYNAME": "Barry County",
        "POPESTIMATE2019": "35789"
      },
      {
        "STATE": "29",
        "COUNTY": "011",
        "STNAME": "Missouri",
        "CTYNAME": "Barton County",
        "POPESTIMATE2019": "11754"
      },
      {
        "STATE": "29",
        "COUNTY": "013",
        "STNAME": "Missouri",
        "CTYNAME": "Bates County",
        "POPESTIMATE2019": "16172"
      },
      {
        "STATE": "29",
        "COUNTY": "015",
        "STNAME": "Missouri",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "19443"
      },
      {
        "STATE": "29",
        "COUNTY": "017",
        "STNAME": "Missouri",
        "CTYNAME": "Bollinger County",
        "POPESTIMATE2019": "12133"
      },
      {
        "STATE": "29",
        "COUNTY": "019",
        "STNAME": "Missouri",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "180463"
      },
      {
        "STATE": "29",
        "COUNTY": "021",
        "STNAME": "Missouri",
        "CTYNAME": "Buchanan County",
        "POPESTIMATE2019": "87364"
      },
      {
        "STATE": "29",
        "COUNTY": "023",
        "STNAME": "Missouri",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "42478"
      },
      {
        "STATE": "29",
        "COUNTY": "025",
        "STNAME": "Missouri",
        "CTYNAME": "Caldwell County",
        "POPESTIMATE2019": "9020"
      },
      {
        "STATE": "29",
        "COUNTY": "027",
        "STNAME": "Missouri",
        "CTYNAME": "Callaway County",
        "POPESTIMATE2019": "44743"
      },
      {
        "STATE": "29",
        "COUNTY": "029",
        "STNAME": "Missouri",
        "CTYNAME": "Camden County",
        "POPESTIMATE2019": "46305"
      },
      {
        "STATE": "29",
        "COUNTY": "031",
        "STNAME": "Missouri",
        "CTYNAME": "Cape Girardeau County",
        "POPESTIMATE2019": "78871"
      },
      {
        "STATE": "29",
        "COUNTY": "033",
        "STNAME": "Missouri",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "8679"
      },
      {
        "STATE": "29",
        "COUNTY": "035",
        "STNAME": "Missouri",
        "CTYNAME": "Carter County",
        "POPESTIMATE2019": "5982"
      },
      {
        "STATE": "29",
        "COUNTY": "037",
        "STNAME": "Missouri",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "105780"
      },
      {
        "STATE": "29",
        "COUNTY": "039",
        "STNAME": "Missouri",
        "CTYNAME": "Cedar County",
        "POPESTIMATE2019": "14349"
      },
      {
        "STATE": "29",
        "COUNTY": "041",
        "STNAME": "Missouri",
        "CTYNAME": "Chariton County",
        "POPESTIMATE2019": "7426"
      },
      {
        "STATE": "29",
        "COUNTY": "043",
        "STNAME": "Missouri",
        "CTYNAME": "Christian County",
        "POPESTIMATE2019": "88595"
      },
      {
        "STATE": "29",
        "COUNTY": "045",
        "STNAME": "Missouri",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "6797"
      },
      {
        "STATE": "29",
        "COUNTY": "047",
        "STNAME": "Missouri",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "249948"
      },
      {
        "STATE": "29",
        "COUNTY": "049",
        "STNAME": "Missouri",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "20387"
      },
      {
        "STATE": "29",
        "COUNTY": "051",
        "STNAME": "Missouri",
        "CTYNAME": "Cole County",
        "POPESTIMATE2019": "76745"
      },
      {
        "STATE": "29",
        "COUNTY": "053",
        "STNAME": "Missouri",
        "CTYNAME": "Cooper County",
        "POPESTIMATE2019": "17709"
      },
      {
        "STATE": "29",
        "COUNTY": "055",
        "STNAME": "Missouri",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "23920"
      },
      {
        "STATE": "29",
        "COUNTY": "057",
        "STNAME": "Missouri",
        "CTYNAME": "Dade County",
        "POPESTIMATE2019": "7561"
      },
      {
        "STATE": "29",
        "COUNTY": "059",
        "STNAME": "Missouri",
        "CTYNAME": "Dallas County",
        "POPESTIMATE2019": "16878"
      },
      {
        "STATE": "29",
        "COUNTY": "061",
        "STNAME": "Missouri",
        "CTYNAME": "Daviess County",
        "POPESTIMATE2019": "8278"
      },
      {
        "STATE": "29",
        "COUNTY": "063",
        "STNAME": "Missouri",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "12547"
      },
      {
        "STATE": "29",
        "COUNTY": "065",
        "STNAME": "Missouri",
        "CTYNAME": "Dent County",
        "POPESTIMATE2019": "15573"
      },
      {
        "STATE": "29",
        "COUNTY": "067",
        "STNAME": "Missouri",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "13185"
      },
      {
        "STATE": "29",
        "COUNTY": "069",
        "STNAME": "Missouri",
        "CTYNAME": "Dunklin County",
        "POPESTIMATE2019": "29131"
      },
      {
        "STATE": "29",
        "COUNTY": "071",
        "STNAME": "Missouri",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "103967"
      },
      {
        "STATE": "29",
        "COUNTY": "073",
        "STNAME": "Missouri",
        "CTYNAME": "Gasconade County",
        "POPESTIMATE2019": "14706"
      },
      {
        "STATE": "29",
        "COUNTY": "075",
        "STNAME": "Missouri",
        "CTYNAME": "Gentry County",
        "POPESTIMATE2019": "6571"
      },
      {
        "STATE": "29",
        "COUNTY": "077",
        "STNAME": "Missouri",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "293086"
      },
      {
        "STATE": "29",
        "COUNTY": "079",
        "STNAME": "Missouri",
        "CTYNAME": "Grundy County",
        "POPESTIMATE2019": "9850"
      },
      {
        "STATE": "29",
        "COUNTY": "081",
        "STNAME": "Missouri",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "8352"
      },
      {
        "STATE": "29",
        "COUNTY": "083",
        "STNAME": "Missouri",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "21824"
      },
      {
        "STATE": "29",
        "COUNTY": "085",
        "STNAME": "Missouri",
        "CTYNAME": "Hickory County",
        "POPESTIMATE2019": "9544"
      },
      {
        "STATE": "29",
        "COUNTY": "087",
        "STNAME": "Missouri",
        "CTYNAME": "Holt County",
        "POPESTIMATE2019": "4403"
      },
      {
        "STATE": "29",
        "COUNTY": "089",
        "STNAME": "Missouri",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "10001"
      },
      {
        "STATE": "29",
        "COUNTY": "091",
        "STNAME": "Missouri",
        "CTYNAME": "Howell County",
        "POPESTIMATE2019": "40117"
      },
      {
        "STATE": "29",
        "COUNTY": "093",
        "STNAME": "Missouri",
        "CTYNAME": "Iron County",
        "POPESTIMATE2019": "10125"
      },
      {
        "STATE": "29",
        "COUNTY": "095",
        "STNAME": "Missouri",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "703011"
      },
      {
        "STATE": "29",
        "COUNTY": "097",
        "STNAME": "Missouri",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "121328"
      },
      {
        "STATE": "29",
        "COUNTY": "099",
        "STNAME": "Missouri",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "225081"
      },
      {
        "STATE": "29",
        "COUNTY": "101",
        "STNAME": "Missouri",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "54062"
      },
      {
        "STATE": "29",
        "COUNTY": "103",
        "STNAME": "Missouri",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "3959"
      },
      {
        "STATE": "29",
        "COUNTY": "105",
        "STNAME": "Missouri",
        "CTYNAME": "Laclede County",
        "POPESTIMATE2019": "35723"
      },
      {
        "STATE": "29",
        "COUNTY": "107",
        "STNAME": "Missouri",
        "CTYNAME": "Lafayette County",
        "POPESTIMATE2019": "32708"
      },
      {
        "STATE": "29",
        "COUNTY": "109",
        "STNAME": "Missouri",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "38355"
      },
      {
        "STATE": "29",
        "COUNTY": "111",
        "STNAME": "Missouri",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "9776"
      },
      {
        "STATE": "29",
        "COUNTY": "113",
        "STNAME": "Missouri",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "59013"
      },
      {
        "STATE": "29",
        "COUNTY": "115",
        "STNAME": "Missouri",
        "CTYNAME": "Linn County",
        "POPESTIMATE2019": "11920"
      },
      {
        "STATE": "29",
        "COUNTY": "117",
        "STNAME": "Missouri",
        "CTYNAME": "Livingston County",
        "POPESTIMATE2019": "15227"
      },
      {
        "STATE": "29",
        "COUNTY": "119",
        "STNAME": "Missouri",
        "CTYNAME": "McDonald County",
        "POPESTIMATE2019": "22837"
      },
      {
        "STATE": "29",
        "COUNTY": "121",
        "STNAME": "Missouri",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "15117"
      },
      {
        "STATE": "29",
        "COUNTY": "123",
        "STNAME": "Missouri",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "12088"
      },
      {
        "STATE": "29",
        "COUNTY": "125",
        "STNAME": "Missouri",
        "CTYNAME": "Maries County",
        "POPESTIMATE2019": "8697"
      },
      {
        "STATE": "29",
        "COUNTY": "127",
        "STNAME": "Missouri",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "28530"
      },
      {
        "STATE": "29",
        "COUNTY": "129",
        "STNAME": "Missouri",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "3617"
      },
      {
        "STATE": "29",
        "COUNTY": "131",
        "STNAME": "Missouri",
        "CTYNAME": "Miller County",
        "POPESTIMATE2019": "25619"
      },
      {
        "STATE": "29",
        "COUNTY": "133",
        "STNAME": "Missouri",
        "CTYNAME": "Mississippi County",
        "POPESTIMATE2019": "13180"
      },
      {
        "STATE": "29",
        "COUNTY": "135",
        "STNAME": "Missouri",
        "CTYNAME": "Moniteau County",
        "POPESTIMATE2019": "16132"
      },
      {
        "STATE": "29",
        "COUNTY": "137",
        "STNAME": "Missouri",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "8644"
      },
      {
        "STATE": "29",
        "COUNTY": "139",
        "STNAME": "Missouri",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "11551"
      },
      {
        "STATE": "29",
        "COUNTY": "141",
        "STNAME": "Missouri",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "20627"
      },
      {
        "STATE": "29",
        "COUNTY": "143",
        "STNAME": "Missouri",
        "CTYNAME": "New Madrid County",
        "POPESTIMATE2019": "17076"
      },
      {
        "STATE": "29",
        "COUNTY": "145",
        "STNAME": "Missouri",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "58236"
      },
      {
        "STATE": "29",
        "COUNTY": "147",
        "STNAME": "Missouri",
        "CTYNAME": "Nodaway County",
        "POPESTIMATE2019": "22092"
      },
      {
        "STATE": "29",
        "COUNTY": "149",
        "STNAME": "Missouri",
        "CTYNAME": "Oregon County",
        "POPESTIMATE2019": "10529"
      },
      {
        "STATE": "29",
        "COUNTY": "151",
        "STNAME": "Missouri",
        "CTYNAME": "Osage County",
        "POPESTIMATE2019": "13615"
      },
      {
        "STATE": "29",
        "COUNTY": "153",
        "STNAME": "Missouri",
        "CTYNAME": "Ozark County",
        "POPESTIMATE2019": "9174"
      },
      {
        "STATE": "29",
        "COUNTY": "155",
        "STNAME": "Missouri",
        "CTYNAME": "Pemiscot County",
        "POPESTIMATE2019": "15805"
      },
      {
        "STATE": "29",
        "COUNTY": "157",
        "STNAME": "Missouri",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "19136"
      },
      {
        "STATE": "29",
        "COUNTY": "159",
        "STNAME": "Missouri",
        "CTYNAME": "Pettis County",
        "POPESTIMATE2019": "42339"
      },
      {
        "STATE": "29",
        "COUNTY": "161",
        "STNAME": "Missouri",
        "CTYNAME": "Phelps County",
        "POPESTIMATE2019": "44573"
      },
      {
        "STATE": "29",
        "COUNTY": "163",
        "STNAME": "Missouri",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "18302"
      },
      {
        "STATE": "29",
        "COUNTY": "165",
        "STNAME": "Missouri",
        "CTYNAME": "Platte County",
        "POPESTIMATE2019": "104418"
      },
      {
        "STATE": "29",
        "COUNTY": "167",
        "STNAME": "Missouri",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "32149"
      },
      {
        "STATE": "29",
        "COUNTY": "169",
        "STNAME": "Missouri",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "52607"
      },
      {
        "STATE": "29",
        "COUNTY": "171",
        "STNAME": "Missouri",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "4696"
      },
      {
        "STATE": "29",
        "COUNTY": "173",
        "STNAME": "Missouri",
        "CTYNAME": "Ralls County",
        "POPESTIMATE2019": "10309"
      },
      {
        "STATE": "29",
        "COUNTY": "175",
        "STNAME": "Missouri",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "24748"
      },
      {
        "STATE": "29",
        "COUNTY": "177",
        "STNAME": "Missouri",
        "CTYNAME": "Ray County",
        "POPESTIMATE2019": "23018"
      },
      {
        "STATE": "29",
        "COUNTY": "179",
        "STNAME": "Missouri",
        "CTYNAME": "Reynolds County",
        "POPESTIMATE2019": "6270"
      },
      {
        "STATE": "29",
        "COUNTY": "181",
        "STNAME": "Missouri",
        "CTYNAME": "Ripley County",
        "POPESTIMATE2019": "13288"
      },
      {
        "STATE": "29",
        "COUNTY": "183",
        "STNAME": "Missouri",
        "CTYNAME": "St. Charles County",
        "POPESTIMATE2019": "402022"
      },
      {
        "STATE": "29",
        "COUNTY": "185",
        "STNAME": "Missouri",
        "CTYNAME": "St. Clair County",
        "POPESTIMATE2019": "9397"
      },
      {
        "STATE": "29",
        "COUNTY": "186",
        "STNAME": "Missouri",
        "CTYNAME": "Ste. Genevieve County",
        "POPESTIMATE2019": "17894"
      },
      {
        "STATE": "29",
        "COUNTY": "187",
        "STNAME": "Missouri",
        "CTYNAME": "St. Francois County",
        "POPESTIMATE2019": "67215"
      },
      {
        "STATE": "29",
        "COUNTY": "189",
        "STNAME": "Missouri",
        "CTYNAME": "St. Louis County",
        "POPESTIMATE2019": "994205"
      },
      {
        "STATE": "29",
        "COUNTY": "195",
        "STNAME": "Missouri",
        "CTYNAME": "Saline County",
        "POPESTIMATE2019": "22761"
      },
      {
        "STATE": "29",
        "COUNTY": "197",
        "STNAME": "Missouri",
        "CTYNAME": "Schuyler County",
        "POPESTIMATE2019": "4660"
      },
      {
        "STATE": "29",
        "COUNTY": "199",
        "STNAME": "Missouri",
        "CTYNAME": "Scotland County",
        "POPESTIMATE2019": "4902"
      },
      {
        "STATE": "29",
        "COUNTY": "201",
        "STNAME": "Missouri",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "38280"
      },
      {
        "STATE": "29",
        "COUNTY": "203",
        "STNAME": "Missouri",
        "CTYNAME": "Shannon County",
        "POPESTIMATE2019": "8166"
      },
      {
        "STATE": "29",
        "COUNTY": "205",
        "STNAME": "Missouri",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "5930"
      },
      {
        "STATE": "29",
        "COUNTY": "207",
        "STNAME": "Missouri",
        "CTYNAME": "Stoddard County",
        "POPESTIMATE2019": "29025"
      },
      {
        "STATE": "29",
        "COUNTY": "209",
        "STNAME": "Missouri",
        "CTYNAME": "Stone County",
        "POPESTIMATE2019": "31952"
      },
      {
        "STATE": "29",
        "COUNTY": "211",
        "STNAME": "Missouri",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "6089"
      },
      {
        "STATE": "29",
        "COUNTY": "213",
        "STNAME": "Missouri",
        "CTYNAME": "Taney County",
        "POPESTIMATE2019": "55928"
      },
      {
        "STATE": "29",
        "COUNTY": "215",
        "STNAME": "Missouri",
        "CTYNAME": "Texas County",
        "POPESTIMATE2019": "25398"
      },
      {
        "STATE": "29",
        "COUNTY": "217",
        "STNAME": "Missouri",
        "CTYNAME": "Vernon County",
        "POPESTIMATE2019": "20563"
      },
      {
        "STATE": "29",
        "COUNTY": "219",
        "STNAME": "Missouri",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "35649"
      },
      {
        "STATE": "29",
        "COUNTY": "221",
        "STNAME": "Missouri",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "24730"
      },
      {
        "STATE": "29",
        "COUNTY": "223",
        "STNAME": "Missouri",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "12873"
      },
      {
        "STATE": "29",
        "COUNTY": "225",
        "STNAME": "Missouri",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "39592"
      },
      {
        "STATE": "29",
        "COUNTY": "227",
        "STNAME": "Missouri",
        "CTYNAME": "Worth County",
        "POPESTIMATE2019": "2013"
      },
      {
        "STATE": "29",
        "COUNTY": "229",
        "STNAME": "Missouri",
        "CTYNAME": "Wright County",
        "POPESTIMATE2019": "18289"
      },
      {
        "STATE": "29",
        "COUNTY": "510",
        "STNAME": "Missouri",
        "CTYNAME": "St. Louis city",
        "POPESTIMATE2019": "300576"
      },
      {
        "STATE": "30",
        "COUNTY": "000",
        "STNAME": "Montana",
        "CTYNAME": "Montana",
        "POPESTIMATE2019": "1068778"
      },
      {
        "STATE": "30",
        "COUNTY": "001",
        "STNAME": "Montana",
        "CTYNAME": "Beaverhead County",
        "POPESTIMATE2019": "9453"
      },
      {
        "STATE": "30",
        "COUNTY": "003",
        "STNAME": "Montana",
        "CTYNAME": "Big Horn County",
        "POPESTIMATE2019": "13319"
      },
      {
        "STATE": "30",
        "COUNTY": "005",
        "STNAME": "Montana",
        "CTYNAME": "Blaine County",
        "POPESTIMATE2019": "6681"
      },
      {
        "STATE": "30",
        "COUNTY": "007",
        "STNAME": "Montana",
        "CTYNAME": "Broadwater County",
        "POPESTIMATE2019": "6237"
      },
      {
        "STATE": "30",
        "COUNTY": "009",
        "STNAME": "Montana",
        "CTYNAME": "Carbon County",
        "POPESTIMATE2019": "10725"
      },
      {
        "STATE": "30",
        "COUNTY": "011",
        "STNAME": "Montana",
        "CTYNAME": "Carter County",
        "POPESTIMATE2019": "1252"
      },
      {
        "STATE": "30",
        "COUNTY": "013",
        "STNAME": "Montana",
        "CTYNAME": "Cascade County",
        "POPESTIMATE2019": "81366"
      },
      {
        "STATE": "30",
        "COUNTY": "015",
        "STNAME": "Montana",
        "CTYNAME": "Chouteau County",
        "POPESTIMATE2019": "5635"
      },
      {
        "STATE": "30",
        "COUNTY": "017",
        "STNAME": "Montana",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "11402"
      },
      {
        "STATE": "30",
        "COUNTY": "019",
        "STNAME": "Montana",
        "CTYNAME": "Daniels County",
        "POPESTIMATE2019": "1690"
      },
      {
        "STATE": "30",
        "COUNTY": "021",
        "STNAME": "Montana",
        "CTYNAME": "Dawson County",
        "POPESTIMATE2019": "8613"
      },
      {
        "STATE": "30",
        "COUNTY": "023",
        "STNAME": "Montana",
        "CTYNAME": "Deer Lodge County",
        "POPESTIMATE2019": "9140"
      },
      {
        "STATE": "30",
        "COUNTY": "025",
        "STNAME": "Montana",
        "CTYNAME": "Fallon County",
        "POPESTIMATE2019": "2846"
      },
      {
        "STATE": "30",
        "COUNTY": "027",
        "STNAME": "Montana",
        "CTYNAME": "Fergus County",
        "POPESTIMATE2019": "11050"
      },
      {
        "STATE": "30",
        "COUNTY": "029",
        "STNAME": "Montana",
        "CTYNAME": "Flathead County",
        "POPESTIMATE2019": "103806"
      },
      {
        "STATE": "30",
        "COUNTY": "031",
        "STNAME": "Montana",
        "CTYNAME": "Gallatin County",
        "POPESTIMATE2019": "114434"
      },
      {
        "STATE": "30",
        "COUNTY": "033",
        "STNAME": "Montana",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "1258"
      },
      {
        "STATE": "30",
        "COUNTY": "035",
        "STNAME": "Montana",
        "CTYNAME": "Glacier County",
        "POPESTIMATE2019": "13753"
      },
      {
        "STATE": "30",
        "COUNTY": "037",
        "STNAME": "Montana",
        "CTYNAME": "Golden Valley County",
        "POPESTIMATE2019": "821"
      },
      {
        "STATE": "30",
        "COUNTY": "039",
        "STNAME": "Montana",
        "CTYNAME": "Granite County",
        "POPESTIMATE2019": "3379"
      },
      {
        "STATE": "30",
        "COUNTY": "041",
        "STNAME": "Montana",
        "CTYNAME": "Hill County",
        "POPESTIMATE2019": "16484"
      },
      {
        "STATE": "30",
        "COUNTY": "043",
        "STNAME": "Montana",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "12221"
      },
      {
        "STATE": "30",
        "COUNTY": "045",
        "STNAME": "Montana",
        "CTYNAME": "Judith Basin County",
        "POPESTIMATE2019": "2007"
      },
      {
        "STATE": "30",
        "COUNTY": "047",
        "STNAME": "Montana",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "30458"
      },
      {
        "STATE": "30",
        "COUNTY": "049",
        "STNAME": "Montana",
        "CTYNAME": "Lewis and Clark County",
        "POPESTIMATE2019": "69432"
      },
      {
        "STATE": "30",
        "COUNTY": "051",
        "STNAME": "Montana",
        "CTYNAME": "Liberty County",
        "POPESTIMATE2019": "2337"
      },
      {
        "STATE": "30",
        "COUNTY": "053",
        "STNAME": "Montana",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "19980"
      },
      {
        "STATE": "30",
        "COUNTY": "055",
        "STNAME": "Montana",
        "CTYNAME": "McCone County",
        "POPESTIMATE2019": "1664"
      },
      {
        "STATE": "30",
        "COUNTY": "057",
        "STNAME": "Montana",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "8600"
      },
      {
        "STATE": "30",
        "COUNTY": "059",
        "STNAME": "Montana",
        "CTYNAME": "Meagher County",
        "POPESTIMATE2019": "1862"
      },
      {
        "STATE": "30",
        "COUNTY": "061",
        "STNAME": "Montana",
        "CTYNAME": "Mineral County",
        "POPESTIMATE2019": "4397"
      },
      {
        "STATE": "30",
        "COUNTY": "063",
        "STNAME": "Montana",
        "CTYNAME": "Missoula County",
        "POPESTIMATE2019": "119600"
      },
      {
        "STATE": "30",
        "COUNTY": "065",
        "STNAME": "Montana",
        "CTYNAME": "Musselshell County",
        "POPESTIMATE2019": "4633"
      },
      {
        "STATE": "30",
        "COUNTY": "067",
        "STNAME": "Montana",
        "CTYNAME": "Park County",
        "POPESTIMATE2019": "16606"
      },
      {
        "STATE": "30",
        "COUNTY": "069",
        "STNAME": "Montana",
        "CTYNAME": "Petroleum County",
        "POPESTIMATE2019": "487"
      },
      {
        "STATE": "30",
        "COUNTY": "071",
        "STNAME": "Montana",
        "CTYNAME": "Phillips County",
        "POPESTIMATE2019": "3954"
      },
      {
        "STATE": "30",
        "COUNTY": "073",
        "STNAME": "Montana",
        "CTYNAME": "Pondera County",
        "POPESTIMATE2019": "5911"
      },
      {
        "STATE": "30",
        "COUNTY": "075",
        "STNAME": "Montana",
        "CTYNAME": "Powder River County",
        "POPESTIMATE2019": "1682"
      },
      {
        "STATE": "30",
        "COUNTY": "077",
        "STNAME": "Montana",
        "CTYNAME": "Powell County",
        "POPESTIMATE2019": "6890"
      },
      {
        "STATE": "30",
        "COUNTY": "079",
        "STNAME": "Montana",
        "CTYNAME": "Prairie County",
        "POPESTIMATE2019": "1077"
      },
      {
        "STATE": "30",
        "COUNTY": "081",
        "STNAME": "Montana",
        "CTYNAME": "Ravalli County",
        "POPESTIMATE2019": "43806"
      },
      {
        "STATE": "30",
        "COUNTY": "083",
        "STNAME": "Montana",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "10803"
      },
      {
        "STATE": "30",
        "COUNTY": "085",
        "STNAME": "Montana",
        "CTYNAME": "Roosevelt County",
        "POPESTIMATE2019": "11004"
      },
      {
        "STATE": "30",
        "COUNTY": "087",
        "STNAME": "Montana",
        "CTYNAME": "Rosebud County",
        "POPESTIMATE2019": "8937"
      },
      {
        "STATE": "30",
        "COUNTY": "089",
        "STNAME": "Montana",
        "CTYNAME": "Sanders County",
        "POPESTIMATE2019": "12113"
      },
      {
        "STATE": "30",
        "COUNTY": "091",
        "STNAME": "Montana",
        "CTYNAME": "Sheridan County",
        "POPESTIMATE2019": "3309"
      },
      {
        "STATE": "30",
        "COUNTY": "093",
        "STNAME": "Montana",
        "CTYNAME": "Silver Bow County",
        "POPESTIMATE2019": "34915"
      },
      {
        "STATE": "30",
        "COUNTY": "095",
        "STNAME": "Montana",
        "CTYNAME": "Stillwater County",
        "POPESTIMATE2019": "9642"
      },
      {
        "STATE": "30",
        "COUNTY": "097",
        "STNAME": "Montana",
        "CTYNAME": "Sweet Grass County",
        "POPESTIMATE2019": "3737"
      },
      {
        "STATE": "30",
        "COUNTY": "099",
        "STNAME": "Montana",
        "CTYNAME": "Teton County",
        "POPESTIMATE2019": "6147"
      },
      {
        "STATE": "30",
        "COUNTY": "101",
        "STNAME": "Montana",
        "CTYNAME": "Toole County",
        "POPESTIMATE2019": "4736"
      },
      {
        "STATE": "30",
        "COUNTY": "103",
        "STNAME": "Montana",
        "CTYNAME": "Treasure County",
        "POPESTIMATE2019": "696"
      },
      {
        "STATE": "30",
        "COUNTY": "105",
        "STNAME": "Montana",
        "CTYNAME": "Valley County",
        "POPESTIMATE2019": "7396"
      },
      {
        "STATE": "30",
        "COUNTY": "107",
        "STNAME": "Montana",
        "CTYNAME": "Wheatland County",
        "POPESTIMATE2019": "2126"
      },
      {
        "STATE": "30",
        "COUNTY": "109",
        "STNAME": "Montana",
        "CTYNAME": "Wibaux County",
        "POPESTIMATE2019": "969"
      },
      {
        "STATE": "30",
        "COUNTY": "111",
        "STNAME": "Montana",
        "CTYNAME": "Yellowstone County",
        "POPESTIMATE2019": "161300"
      },
      {
        "STATE": "31",
        "COUNTY": "000",
        "STNAME": "Nebraska",
        "CTYNAME": "Nebraska",
        "POPESTIMATE2019": "1934408"
      },
      {
        "STATE": "31",
        "COUNTY": "001",
        "STNAME": "Nebraska",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "31363"
      },
      {
        "STATE": "31",
        "COUNTY": "003",
        "STNAME": "Nebraska",
        "CTYNAME": "Antelope County",
        "POPESTIMATE2019": "6298"
      },
      {
        "STATE": "31",
        "COUNTY": "005",
        "STNAME": "Nebraska",
        "CTYNAME": "Arthur County",
        "POPESTIMATE2019": "463"
      },
      {
        "STATE": "31",
        "COUNTY": "007",
        "STNAME": "Nebraska",
        "CTYNAME": "Banner County",
        "POPESTIMATE2019": "745"
      },
      {
        "STATE": "31",
        "COUNTY": "009",
        "STNAME": "Nebraska",
        "CTYNAME": "Blaine County",
        "POPESTIMATE2019": "465"
      },
      {
        "STATE": "31",
        "COUNTY": "011",
        "STNAME": "Nebraska",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "5192"
      },
      {
        "STATE": "31",
        "COUNTY": "013",
        "STNAME": "Nebraska",
        "CTYNAME": "Box Butte County",
        "POPESTIMATE2019": "10783"
      },
      {
        "STATE": "31",
        "COUNTY": "015",
        "STNAME": "Nebraska",
        "CTYNAME": "Boyd County",
        "POPESTIMATE2019": "1919"
      },
      {
        "STATE": "31",
        "COUNTY": "017",
        "STNAME": "Nebraska",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "2955"
      },
      {
        "STATE": "31",
        "COUNTY": "019",
        "STNAME": "Nebraska",
        "CTYNAME": "Buffalo County",
        "POPESTIMATE2019": "49659"
      },
      {
        "STATE": "31",
        "COUNTY": "021",
        "STNAME": "Nebraska",
        "CTYNAME": "Burt County",
        "POPESTIMATE2019": "6459"
      },
      {
        "STATE": "31",
        "COUNTY": "023",
        "STNAME": "Nebraska",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "8016"
      },
      {
        "STATE": "31",
        "COUNTY": "025",
        "STNAME": "Nebraska",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "26248"
      },
      {
        "STATE": "31",
        "COUNTY": "027",
        "STNAME": "Nebraska",
        "CTYNAME": "Cedar County",
        "POPESTIMATE2019": "8402"
      },
      {
        "STATE": "31",
        "COUNTY": "029",
        "STNAME": "Nebraska",
        "CTYNAME": "Chase County",
        "POPESTIMATE2019": "3924"
      },
      {
        "STATE": "31",
        "COUNTY": "031",
        "STNAME": "Nebraska",
        "CTYNAME": "Cherry County",
        "POPESTIMATE2019": "5689"
      },
      {
        "STATE": "31",
        "COUNTY": "033",
        "STNAME": "Nebraska",
        "CTYNAME": "Cheyenne County",
        "POPESTIMATE2019": "8910"
      },
      {
        "STATE": "31",
        "COUNTY": "035",
        "STNAME": "Nebraska",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "6203"
      },
      {
        "STATE": "31",
        "COUNTY": "037",
        "STNAME": "Nebraska",
        "CTYNAME": "Colfax County",
        "POPESTIMATE2019": "10709"
      },
      {
        "STATE": "31",
        "COUNTY": "039",
        "STNAME": "Nebraska",
        "CTYNAME": "Cuming County",
        "POPESTIMATE2019": "8846"
      },
      {
        "STATE": "31",
        "COUNTY": "041",
        "STNAME": "Nebraska",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "10777"
      },
      {
        "STATE": "31",
        "COUNTY": "043",
        "STNAME": "Nebraska",
        "CTYNAME": "Dakota County",
        "POPESTIMATE2019": "20026"
      },
      {
        "STATE": "31",
        "COUNTY": "045",
        "STNAME": "Nebraska",
        "CTYNAME": "Dawes County",
        "POPESTIMATE2019": "8589"
      },
      {
        "STATE": "31",
        "COUNTY": "047",
        "STNAME": "Nebraska",
        "CTYNAME": "Dawson County",
        "POPESTIMATE2019": "23595"
      },
      {
        "STATE": "31",
        "COUNTY": "049",
        "STNAME": "Nebraska",
        "CTYNAME": "Deuel County",
        "POPESTIMATE2019": "1794"
      },
      {
        "STATE": "31",
        "COUNTY": "051",
        "STNAME": "Nebraska",
        "CTYNAME": "Dixon County",
        "POPESTIMATE2019": "5636"
      },
      {
        "STATE": "31",
        "COUNTY": "053",
        "STNAME": "Nebraska",
        "CTYNAME": "Dodge County",
        "POPESTIMATE2019": "36565"
      },
      {
        "STATE": "31",
        "COUNTY": "055",
        "STNAME": "Nebraska",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "571327"
      },
      {
        "STATE": "31",
        "COUNTY": "057",
        "STNAME": "Nebraska",
        "CTYNAME": "Dundy County",
        "POPESTIMATE2019": "1693"
      },
      {
        "STATE": "31",
        "COUNTY": "059",
        "STNAME": "Nebraska",
        "CTYNAME": "Fillmore County",
        "POPESTIMATE2019": "5462"
      },
      {
        "STATE": "31",
        "COUNTY": "061",
        "STNAME": "Nebraska",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "2979"
      },
      {
        "STATE": "31",
        "COUNTY": "063",
        "STNAME": "Nebraska",
        "CTYNAME": "Frontier County",
        "POPESTIMATE2019": "2627"
      },
      {
        "STATE": "31",
        "COUNTY": "065",
        "STNAME": "Nebraska",
        "CTYNAME": "Furnas County",
        "POPESTIMATE2019": "4676"
      },
      {
        "STATE": "31",
        "COUNTY": "067",
        "STNAME": "Nebraska",
        "CTYNAME": "Gage County",
        "POPESTIMATE2019": "21513"
      },
      {
        "STATE": "31",
        "COUNTY": "069",
        "STNAME": "Nebraska",
        "CTYNAME": "Garden County",
        "POPESTIMATE2019": "1837"
      },
      {
        "STATE": "31",
        "COUNTY": "071",
        "STNAME": "Nebraska",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "1969"
      },
      {
        "STATE": "31",
        "COUNTY": "073",
        "STNAME": "Nebraska",
        "CTYNAME": "Gosper County",
        "POPESTIMATE2019": "1990"
      },
      {
        "STATE": "31",
        "COUNTY": "075",
        "STNAME": "Nebraska",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "623"
      },
      {
        "STATE": "31",
        "COUNTY": "077",
        "STNAME": "Nebraska",
        "CTYNAME": "Greeley County",
        "POPESTIMATE2019": "2356"
      },
      {
        "STATE": "31",
        "COUNTY": "079",
        "STNAME": "Nebraska",
        "CTYNAME": "Hall County",
        "POPESTIMATE2019": "61353"
      },
      {
        "STATE": "31",
        "COUNTY": "081",
        "STNAME": "Nebraska",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "9324"
      },
      {
        "STATE": "31",
        "COUNTY": "083",
        "STNAME": "Nebraska",
        "CTYNAME": "Harlan County",
        "POPESTIMATE2019": "3380"
      },
      {
        "STATE": "31",
        "COUNTY": "085",
        "STNAME": "Nebraska",
        "CTYNAME": "Hayes County",
        "POPESTIMATE2019": "922"
      },
      {
        "STATE": "31",
        "COUNTY": "087",
        "STNAME": "Nebraska",
        "CTYNAME": "Hitchcock County",
        "POPESTIMATE2019": "2762"
      },
      {
        "STATE": "31",
        "COUNTY": "089",
        "STNAME": "Nebraska",
        "CTYNAME": "Holt County",
        "POPESTIMATE2019": "10067"
      },
      {
        "STATE": "31",
        "COUNTY": "091",
        "STNAME": "Nebraska",
        "CTYNAME": "Hooker County",
        "POPESTIMATE2019": "682"
      },
      {
        "STATE": "31",
        "COUNTY": "093",
        "STNAME": "Nebraska",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "6445"
      },
      {
        "STATE": "31",
        "COUNTY": "095",
        "STNAME": "Nebraska",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "7046"
      },
      {
        "STATE": "31",
        "COUNTY": "097",
        "STNAME": "Nebraska",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "5071"
      },
      {
        "STATE": "31",
        "COUNTY": "099",
        "STNAME": "Nebraska",
        "CTYNAME": "Kearney County",
        "POPESTIMATE2019": "6495"
      },
      {
        "STATE": "31",
        "COUNTY": "101",
        "STNAME": "Nebraska",
        "CTYNAME": "Keith County",
        "POPESTIMATE2019": "8034"
      },
      {
        "STATE": "31",
        "COUNTY": "103",
        "STNAME": "Nebraska",
        "CTYNAME": "Keya Paha County",
        "POPESTIMATE2019": "806"
      },
      {
        "STATE": "31",
        "COUNTY": "105",
        "STNAME": "Nebraska",
        "CTYNAME": "Kimball County",
        "POPESTIMATE2019": "3632"
      },
      {
        "STATE": "31",
        "COUNTY": "107",
        "STNAME": "Nebraska",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "8332"
      },
      {
        "STATE": "31",
        "COUNTY": "109",
        "STNAME": "Nebraska",
        "CTYNAME": "Lancaster County",
        "POPESTIMATE2019": "319090"
      },
      {
        "STATE": "31",
        "COUNTY": "111",
        "STNAME": "Nebraska",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "34914"
      },
      {
        "STATE": "31",
        "COUNTY": "113",
        "STNAME": "Nebraska",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "748"
      },
      {
        "STATE": "31",
        "COUNTY": "115",
        "STNAME": "Nebraska",
        "CTYNAME": "Loup County",
        "POPESTIMATE2019": "664"
      },
      {
        "STATE": "31",
        "COUNTY": "117",
        "STNAME": "Nebraska",
        "CTYNAME": "McPherson County",
        "POPESTIMATE2019": "494"
      },
      {
        "STATE": "31",
        "COUNTY": "119",
        "STNAME": "Nebraska",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "35099"
      },
      {
        "STATE": "31",
        "COUNTY": "121",
        "STNAME": "Nebraska",
        "CTYNAME": "Merrick County",
        "POPESTIMATE2019": "7755"
      },
      {
        "STATE": "31",
        "COUNTY": "123",
        "STNAME": "Nebraska",
        "CTYNAME": "Morrill County",
        "POPESTIMATE2019": "4642"
      },
      {
        "STATE": "31",
        "COUNTY": "125",
        "STNAME": "Nebraska",
        "CTYNAME": "Nance County",
        "POPESTIMATE2019": "3519"
      },
      {
        "STATE": "31",
        "COUNTY": "127",
        "STNAME": "Nebraska",
        "CTYNAME": "Nemaha County",
        "POPESTIMATE2019": "6972"
      },
      {
        "STATE": "31",
        "COUNTY": "129",
        "STNAME": "Nebraska",
        "CTYNAME": "Nuckolls County",
        "POPESTIMATE2019": "4148"
      },
      {
        "STATE": "31",
        "COUNTY": "131",
        "STNAME": "Nebraska",
        "CTYNAME": "Otoe County",
        "POPESTIMATE2019": "16012"
      },
      {
        "STATE": "31",
        "COUNTY": "133",
        "STNAME": "Nebraska",
        "CTYNAME": "Pawnee County",
        "POPESTIMATE2019": "2613"
      },
      {
        "STATE": "31",
        "COUNTY": "135",
        "STNAME": "Nebraska",
        "CTYNAME": "Perkins County",
        "POPESTIMATE2019": "2891"
      },
      {
        "STATE": "31",
        "COUNTY": "137",
        "STNAME": "Nebraska",
        "CTYNAME": "Phelps County",
        "POPESTIMATE2019": "9034"
      },
      {
        "STATE": "31",
        "COUNTY": "139",
        "STNAME": "Nebraska",
        "CTYNAME": "Pierce County",
        "POPESTIMATE2019": "7148"
      },
      {
        "STATE": "31",
        "COUNTY": "141",
        "STNAME": "Nebraska",
        "CTYNAME": "Platte County",
        "POPESTIMATE2019": "33470"
      },
      {
        "STATE": "31",
        "COUNTY": "143",
        "STNAME": "Nebraska",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "5213"
      },
      {
        "STATE": "31",
        "COUNTY": "145",
        "STNAME": "Nebraska",
        "CTYNAME": "Red Willow County",
        "POPESTIMATE2019": "10724"
      },
      {
        "STATE": "31",
        "COUNTY": "147",
        "STNAME": "Nebraska",
        "CTYNAME": "Richardson County",
        "POPESTIMATE2019": "7865"
      },
      {
        "STATE": "31",
        "COUNTY": "149",
        "STNAME": "Nebraska",
        "CTYNAME": "Rock County",
        "POPESTIMATE2019": "1357"
      },
      {
        "STATE": "31",
        "COUNTY": "151",
        "STNAME": "Nebraska",
        "CTYNAME": "Saline County",
        "POPESTIMATE2019": "14224"
      },
      {
        "STATE": "31",
        "COUNTY": "153",
        "STNAME": "Nebraska",
        "CTYNAME": "Sarpy County",
        "POPESTIMATE2019": "187196"
      },
      {
        "STATE": "31",
        "COUNTY": "155",
        "STNAME": "Nebraska",
        "CTYNAME": "Saunders County",
        "POPESTIMATE2019": "21578"
      },
      {
        "STATE": "31",
        "COUNTY": "157",
        "STNAME": "Nebraska",
        "CTYNAME": "Scotts Bluff County",
        "POPESTIMATE2019": "35618"
      },
      {
        "STATE": "31",
        "COUNTY": "159",
        "STNAME": "Nebraska",
        "CTYNAME": "Seward County",
        "POPESTIMATE2019": "17284"
      },
      {
        "STATE": "31",
        "COUNTY": "161",
        "STNAME": "Nebraska",
        "CTYNAME": "Sheridan County",
        "POPESTIMATE2019": "5246"
      },
      {
        "STATE": "31",
        "COUNTY": "163",
        "STNAME": "Nebraska",
        "CTYNAME": "Sherman County",
        "POPESTIMATE2019": "3001"
      },
      {
        "STATE": "31",
        "COUNTY": "165",
        "STNAME": "Nebraska",
        "CTYNAME": "Sioux County",
        "POPESTIMATE2019": "1166"
      },
      {
        "STATE": "31",
        "COUNTY": "167",
        "STNAME": "Nebraska",
        "CTYNAME": "Stanton County",
        "POPESTIMATE2019": "5920"
      },
      {
        "STATE": "31",
        "COUNTY": "169",
        "STNAME": "Nebraska",
        "CTYNAME": "Thayer County",
        "POPESTIMATE2019": "5003"
      },
      {
        "STATE": "31",
        "COUNTY": "171",
        "STNAME": "Nebraska",
        "CTYNAME": "Thomas County",
        "POPESTIMATE2019": "722"
      },
      {
        "STATE": "31",
        "COUNTY": "173",
        "STNAME": "Nebraska",
        "CTYNAME": "Thurston County",
        "POPESTIMATE2019": "7224"
      },
      {
        "STATE": "31",
        "COUNTY": "175",
        "STNAME": "Nebraska",
        "CTYNAME": "Valley County",
        "POPESTIMATE2019": "4158"
      },
      {
        "STATE": "31",
        "COUNTY": "177",
        "STNAME": "Nebraska",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "20729"
      },
      {
        "STATE": "31",
        "COUNTY": "179",
        "STNAME": "Nebraska",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "9385"
      },
      {
        "STATE": "31",
        "COUNTY": "181",
        "STNAME": "Nebraska",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "3487"
      },
      {
        "STATE": "31",
        "COUNTY": "183",
        "STNAME": "Nebraska",
        "CTYNAME": "Wheeler County",
        "POPESTIMATE2019": "783"
      },
      {
        "STATE": "31",
        "COUNTY": "185",
        "STNAME": "Nebraska",
        "CTYNAME": "York County",
        "POPESTIMATE2019": "13679"
      },
      {
        "STATE": "32",
        "COUNTY": "000",
        "STNAME": "Nevada",
        "CTYNAME": "Nevada",
        "POPESTIMATE2019": "3080156"
      },
      {
        "STATE": "32",
        "COUNTY": "001",
        "STNAME": "Nevada",
        "CTYNAME": "Churchill County",
        "POPESTIMATE2019": "24909"
      },
      {
        "STATE": "32",
        "COUNTY": "003",
        "STNAME": "Nevada",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "2266715"
      },
      {
        "STATE": "32",
        "COUNTY": "005",
        "STNAME": "Nevada",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "48905"
      },
      {
        "STATE": "32",
        "COUNTY": "007",
        "STNAME": "Nevada",
        "CTYNAME": "Elko County",
        "POPESTIMATE2019": "52778"
      },
      {
        "STATE": "32",
        "COUNTY": "009",
        "STNAME": "Nevada",
        "CTYNAME": "Esmeralda County",
        "POPESTIMATE2019": "873"
      },
      {
        "STATE": "32",
        "COUNTY": "011",
        "STNAME": "Nevada",
        "CTYNAME": "Eureka County",
        "POPESTIMATE2019": "2029"
      },
      {
        "STATE": "32",
        "COUNTY": "013",
        "STNAME": "Nevada",
        "CTYNAME": "Humboldt County",
        "POPESTIMATE2019": "16831"
      },
      {
        "STATE": "32",
        "COUNTY": "015",
        "STNAME": "Nevada",
        "CTYNAME": "Lander County",
        "POPESTIMATE2019": "5532"
      },
      {
        "STATE": "32",
        "COUNTY": "017",
        "STNAME": "Nevada",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "5183"
      },
      {
        "STATE": "32",
        "COUNTY": "019",
        "STNAME": "Nevada",
        "CTYNAME": "Lyon County",
        "POPESTIMATE2019": "57510"
      },
      {
        "STATE": "32",
        "COUNTY": "021",
        "STNAME": "Nevada",
        "CTYNAME": "Mineral County",
        "POPESTIMATE2019": "4505"
      },
      {
        "STATE": "32",
        "COUNTY": "023",
        "STNAME": "Nevada",
        "CTYNAME": "Nye County",
        "POPESTIMATE2019": "46523"
      },
      {
        "STATE": "32",
        "COUNTY": "027",
        "STNAME": "Nevada",
        "CTYNAME": "Pershing County",
        "POPESTIMATE2019": "6725"
      },
      {
        "STATE": "32",
        "COUNTY": "029",
        "STNAME": "Nevada",
        "CTYNAME": "Storey County",
        "POPESTIMATE2019": "4123"
      },
      {
        "STATE": "32",
        "COUNTY": "031",
        "STNAME": "Nevada",
        "CTYNAME": "Washoe County",
        "POPESTIMATE2019": "471519"
      },
      {
        "STATE": "32",
        "COUNTY": "033",
        "STNAME": "Nevada",
        "CTYNAME": "White Pine County",
        "POPESTIMATE2019": "9580"
      },
      {
        "STATE": "32",
        "COUNTY": "510",
        "STNAME": "Nevada",
        "CTYNAME": "Carson City",
        "POPESTIMATE2019": "55916"
      },
      {
        "STATE": "33",
        "COUNTY": "000",
        "STNAME": "New Hampshire",
        "CTYNAME": "New Hampshire",
        "POPESTIMATE2019": "1359711"
      },
      {
        "STATE": "33",
        "COUNTY": "001",
        "STNAME": "New Hampshire",
        "CTYNAME": "Belknap County",
        "POPESTIMATE2019": "61303"
      },
      {
        "STATE": "33",
        "COUNTY": "003",
        "STNAME": "New Hampshire",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "48910"
      },
      {
        "STATE": "33",
        "COUNTY": "005",
        "STNAME": "New Hampshire",
        "CTYNAME": "Cheshire County",
        "POPESTIMATE2019": "76085"
      },
      {
        "STATE": "33",
        "COUNTY": "007",
        "STNAME": "New Hampshire",
        "CTYNAME": "Coos County",
        "POPESTIMATE2019": "31563"
      },
      {
        "STATE": "33",
        "COUNTY": "009",
        "STNAME": "New Hampshire",
        "CTYNAME": "Grafton County",
        "POPESTIMATE2019": "89886"
      },
      {
        "STATE": "33",
        "COUNTY": "011",
        "STNAME": "New Hampshire",
        "CTYNAME": "Hillsborough County",
        "POPESTIMATE2019": "417025"
      },
      {
        "STATE": "33",
        "COUNTY": "013",
        "STNAME": "New Hampshire",
        "CTYNAME": "Merrimack County",
        "POPESTIMATE2019": "151391"
      },
      {
        "STATE": "33",
        "COUNTY": "015",
        "STNAME": "New Hampshire",
        "CTYNAME": "Rockingham County",
        "POPESTIMATE2019": "309769"
      },
      {
        "STATE": "33",
        "COUNTY": "017",
        "STNAME": "New Hampshire",
        "CTYNAME": "Strafford County",
        "POPESTIMATE2019": "130633"
      },
      {
        "STATE": "33",
        "COUNTY": "019",
        "STNAME": "New Hampshire",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "43146"
      },
      {
        "STATE": "34",
        "COUNTY": "000",
        "STNAME": "New Jersey",
        "CTYNAME": "New Jersey",
        "POPESTIMATE2019": "8882190"
      },
      {
        "STATE": "34",
        "COUNTY": "001",
        "STNAME": "New Jersey",
        "CTYNAME": "Atlantic County",
        "POPESTIMATE2019": "263670"
      },
      {
        "STATE": "34",
        "COUNTY": "003",
        "STNAME": "New Jersey",
        "CTYNAME": "Bergen County",
        "POPESTIMATE2019": "932202"
      },
      {
        "STATE": "34",
        "COUNTY": "005",
        "STNAME": "New Jersey",
        "CTYNAME": "Burlington County",
        "POPESTIMATE2019": "445349"
      },
      {
        "STATE": "34",
        "COUNTY": "007",
        "STNAME": "New Jersey",
        "CTYNAME": "Camden County",
        "POPESTIMATE2019": "506471"
      },
      {
        "STATE": "34",
        "COUNTY": "009",
        "STNAME": "New Jersey",
        "CTYNAME": "Cape May County",
        "POPESTIMATE2019": "92039"
      },
      {
        "STATE": "34",
        "COUNTY": "011",
        "STNAME": "New Jersey",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "149527"
      },
      {
        "STATE": "34",
        "COUNTY": "013",
        "STNAME": "New Jersey",
        "CTYNAME": "Essex County",
        "POPESTIMATE2019": "798975"
      },
      {
        "STATE": "34",
        "COUNTY": "015",
        "STNAME": "New Jersey",
        "CTYNAME": "Gloucester County",
        "POPESTIMATE2019": "291636"
      },
      {
        "STATE": "34",
        "COUNTY": "017",
        "STNAME": "New Jersey",
        "CTYNAME": "Hudson County",
        "POPESTIMATE2019": "672391"
      },
      {
        "STATE": "34",
        "COUNTY": "019",
        "STNAME": "New Jersey",
        "CTYNAME": "Hunterdon County",
        "POPESTIMATE2019": "124371"
      },
      {
        "STATE": "34",
        "COUNTY": "021",
        "STNAME": "New Jersey",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "367430"
      },
      {
        "STATE": "34",
        "COUNTY": "023",
        "STNAME": "New Jersey",
        "CTYNAME": "Middlesex County",
        "POPESTIMATE2019": "825062"
      },
      {
        "STATE": "34",
        "COUNTY": "025",
        "STNAME": "New Jersey",
        "CTYNAME": "Monmouth County",
        "POPESTIMATE2019": "618795"
      },
      {
        "STATE": "34",
        "COUNTY": "027",
        "STNAME": "New Jersey",
        "CTYNAME": "Morris County",
        "POPESTIMATE2019": "491845"
      },
      {
        "STATE": "34",
        "COUNTY": "029",
        "STNAME": "New Jersey",
        "CTYNAME": "Ocean County",
        "POPESTIMATE2019": "607186"
      },
      {
        "STATE": "34",
        "COUNTY": "031",
        "STNAME": "New Jersey",
        "CTYNAME": "Passaic County",
        "POPESTIMATE2019": "501826"
      },
      {
        "STATE": "34",
        "COUNTY": "033",
        "STNAME": "New Jersey",
        "CTYNAME": "Salem County",
        "POPESTIMATE2019": "62385"
      },
      {
        "STATE": "34",
        "COUNTY": "035",
        "STNAME": "New Jersey",
        "CTYNAME": "Somerset County",
        "POPESTIMATE2019": "328934"
      },
      {
        "STATE": "34",
        "COUNTY": "037",
        "STNAME": "New Jersey",
        "CTYNAME": "Sussex County",
        "POPESTIMATE2019": "140488"
      },
      {
        "STATE": "34",
        "COUNTY": "039",
        "STNAME": "New Jersey",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "556341"
      },
      {
        "STATE": "34",
        "COUNTY": "041",
        "STNAME": "New Jersey",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "105267"
      },
      {
        "STATE": "35",
        "COUNTY": "000",
        "STNAME": "New Mexico",
        "CTYNAME": "New Mexico",
        "POPESTIMATE2019": "2096829"
      },
      {
        "STATE": "35",
        "COUNTY": "001",
        "STNAME": "New Mexico",
        "CTYNAME": "Bernalillo County",
        "POPESTIMATE2019": "679121"
      },
      {
        "STATE": "35",
        "COUNTY": "003",
        "STNAME": "New Mexico",
        "CTYNAME": "Catron County",
        "POPESTIMATE2019": "3527"
      },
      {
        "STATE": "35",
        "COUNTY": "005",
        "STNAME": "New Mexico",
        "CTYNAME": "Chaves County",
        "POPESTIMATE2019": "64615"
      },
      {
        "STATE": "35",
        "COUNTY": "006",
        "STNAME": "New Mexico",
        "CTYNAME": "Cibola County",
        "POPESTIMATE2019": "26675"
      },
      {
        "STATE": "35",
        "COUNTY": "007",
        "STNAME": "New Mexico",
        "CTYNAME": "Colfax County",
        "POPESTIMATE2019": "11941"
      },
      {
        "STATE": "35",
        "COUNTY": "009",
        "STNAME": "New Mexico",
        "CTYNAME": "Curry County",
        "POPESTIMATE2019": "48954"
      },
      {
        "STATE": "35",
        "COUNTY": "011",
        "STNAME": "New Mexico",
        "CTYNAME": "De Baca County",
        "POPESTIMATE2019": "1748"
      },
      {
        "STATE": "35",
        "COUNTY": "013",
        "STNAME": "New Mexico",
        "CTYNAME": "Do�a Ana County",
        "POPESTIMATE2019": "218195"
      },
      {
        "STATE": "35",
        "COUNTY": "015",
        "STNAME": "New Mexico",
        "CTYNAME": "Eddy County",
        "POPESTIMATE2019": "58460"
      },
      {
        "STATE": "35",
        "COUNTY": "017",
        "STNAME": "New Mexico",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "26998"
      },
      {
        "STATE": "35",
        "COUNTY": "019",
        "STNAME": "New Mexico",
        "CTYNAME": "Guadalupe County",
        "POPESTIMATE2019": "4300"
      },
      {
        "STATE": "35",
        "COUNTY": "021",
        "STNAME": "New Mexico",
        "CTYNAME": "Harding County",
        "POPESTIMATE2019": "625"
      },
      {
        "STATE": "35",
        "COUNTY": "023",
        "STNAME": "New Mexico",
        "CTYNAME": "Hidalgo County",
        "POPESTIMATE2019": "4198"
      },
      {
        "STATE": "35",
        "COUNTY": "025",
        "STNAME": "New Mexico",
        "CTYNAME": "Lea County",
        "POPESTIMATE2019": "71070"
      },
      {
        "STATE": "35",
        "COUNTY": "027",
        "STNAME": "New Mexico",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "19572"
      },
      {
        "STATE": "35",
        "COUNTY": "028",
        "STNAME": "New Mexico",
        "CTYNAME": "Los Alamos County",
        "POPESTIMATE2019": "19369"
      },
      {
        "STATE": "35",
        "COUNTY": "029",
        "STNAME": "New Mexico",
        "CTYNAME": "Luna County",
        "POPESTIMATE2019": "23709"
      },
      {
        "STATE": "35",
        "COUNTY": "031",
        "STNAME": "New Mexico",
        "CTYNAME": "McKinley County",
        "POPESTIMATE2019": "71367"
      },
      {
        "STATE": "35",
        "COUNTY": "033",
        "STNAME": "New Mexico",
        "CTYNAME": "Mora County",
        "POPESTIMATE2019": "4521"
      },
      {
        "STATE": "35",
        "COUNTY": "035",
        "STNAME": "New Mexico",
        "CTYNAME": "Otero County",
        "POPESTIMATE2019": "67490"
      },
      {
        "STATE": "35",
        "COUNTY": "037",
        "STNAME": "New Mexico",
        "CTYNAME": "Quay County",
        "POPESTIMATE2019": "8253"
      },
      {
        "STATE": "35",
        "COUNTY": "039",
        "STNAME": "New Mexico",
        "CTYNAME": "Rio Arriba County",
        "POPESTIMATE2019": "38921"
      },
      {
        "STATE": "35",
        "COUNTY": "041",
        "STNAME": "New Mexico",
        "CTYNAME": "Roosevelt County",
        "POPESTIMATE2019": "18500"
      },
      {
        "STATE": "35",
        "COUNTY": "043",
        "STNAME": "New Mexico",
        "CTYNAME": "Sandoval County",
        "POPESTIMATE2019": "146748"
      },
      {
        "STATE": "35",
        "COUNTY": "045",
        "STNAME": "New Mexico",
        "CTYNAME": "San Juan County",
        "POPESTIMATE2019": "123958"
      },
      {
        "STATE": "35",
        "COUNTY": "047",
        "STNAME": "New Mexico",
        "CTYNAME": "San Miguel County",
        "POPESTIMATE2019": "27277"
      },
      {
        "STATE": "35",
        "COUNTY": "049",
        "STNAME": "New Mexico",
        "CTYNAME": "Santa Fe County",
        "POPESTIMATE2019": "150358"
      },
      {
        "STATE": "35",
        "COUNTY": "051",
        "STNAME": "New Mexico",
        "CTYNAME": "Sierra County",
        "POPESTIMATE2019": "10791"
      },
      {
        "STATE": "35",
        "COUNTY": "053",
        "STNAME": "New Mexico",
        "CTYNAME": "Socorro County",
        "POPESTIMATE2019": "16637"
      },
      {
        "STATE": "35",
        "COUNTY": "055",
        "STNAME": "New Mexico",
        "CTYNAME": "Taos County",
        "POPESTIMATE2019": "32723"
      },
      {
        "STATE": "35",
        "COUNTY": "057",
        "STNAME": "New Mexico",
        "CTYNAME": "Torrance County",
        "POPESTIMATE2019": "15461"
      },
      {
        "STATE": "35",
        "COUNTY": "059",
        "STNAME": "New Mexico",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "4059"
      },
      {
        "STATE": "35",
        "COUNTY": "061",
        "STNAME": "New Mexico",
        "CTYNAME": "Valencia County",
        "POPESTIMATE2019": "76688"
      },
      {
        "STATE": "36",
        "COUNTY": "000",
        "STNAME": "New York",
        "CTYNAME": "New York",
        "POPESTIMATE2019": "19453561"
      },
      {
        "STATE": "36",
        "COUNTY": "001",
        "STNAME": "New York",
        "CTYNAME": "Albany County",
        "POPESTIMATE2019": "305506"
      },
      {
        "STATE": "36",
        "COUNTY": "003",
        "STNAME": "New York",
        "CTYNAME": "Allegany County",
        "POPESTIMATE2019": "46091"
      },
      {
        "STATE": "36",
        "COUNTY": "005",
        "STNAME": "New York",
        "CTYNAME": "Bronx County",
        "POPESTIMATE2019": "1418207"
      },
      {
        "STATE": "36",
        "COUNTY": "007",
        "STNAME": "New York",
        "CTYNAME": "Broome County",
        "POPESTIMATE2019": "190488"
      },
      {
        "STATE": "36",
        "COUNTY": "009",
        "STNAME": "New York",
        "CTYNAME": "Cattaraugus County",
        "POPESTIMATE2019": "76117"
      },
      {
        "STATE": "36",
        "COUNTY": "011",
        "STNAME": "New York",
        "CTYNAME": "Cayuga County",
        "POPESTIMATE2019": "76576"
      },
      {
        "STATE": "36",
        "COUNTY": "013",
        "STNAME": "New York",
        "CTYNAME": "Chautauqua County",
        "POPESTIMATE2019": "126903"
      },
      {
        "STATE": "36",
        "COUNTY": "015",
        "STNAME": "New York",
        "CTYNAME": "Chemung County",
        "POPESTIMATE2019": "83456"
      },
      {
        "STATE": "36",
        "COUNTY": "017",
        "STNAME": "New York",
        "CTYNAME": "Chenango County",
        "POPESTIMATE2019": "47207"
      },
      {
        "STATE": "36",
        "COUNTY": "019",
        "STNAME": "New York",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "80485"
      },
      {
        "STATE": "36",
        "COUNTY": "021",
        "STNAME": "New York",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "59461"
      },
      {
        "STATE": "36",
        "COUNTY": "023",
        "STNAME": "New York",
        "CTYNAME": "Cortland County",
        "POPESTIMATE2019": "47581"
      },
      {
        "STATE": "36",
        "COUNTY": "025",
        "STNAME": "New York",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "44135"
      },
      {
        "STATE": "36",
        "COUNTY": "027",
        "STNAME": "New York",
        "CTYNAME": "Dutchess County",
        "POPESTIMATE2019": "294218"
      },
      {
        "STATE": "36",
        "COUNTY": "029",
        "STNAME": "New York",
        "CTYNAME": "Erie County",
        "POPESTIMATE2019": "918702"
      },
      {
        "STATE": "36",
        "COUNTY": "031",
        "STNAME": "New York",
        "CTYNAME": "Essex County",
        "POPESTIMATE2019": "36885"
      },
      {
        "STATE": "36",
        "COUNTY": "033",
        "STNAME": "New York",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "50022"
      },
      {
        "STATE": "36",
        "COUNTY": "035",
        "STNAME": "New York",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "53383"
      },
      {
        "STATE": "36",
        "COUNTY": "037",
        "STNAME": "New York",
        "CTYNAME": "Genesee County",
        "POPESTIMATE2019": "57280"
      },
      {
        "STATE": "36",
        "COUNTY": "039",
        "STNAME": "New York",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "47188"
      },
      {
        "STATE": "36",
        "COUNTY": "041",
        "STNAME": "New York",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "4416"
      },
      {
        "STATE": "36",
        "COUNTY": "043",
        "STNAME": "New York",
        "CTYNAME": "Herkimer County",
        "POPESTIMATE2019": "61319"
      },
      {
        "STATE": "36",
        "COUNTY": "045",
        "STNAME": "New York",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "109834"
      },
      {
        "STATE": "36",
        "COUNTY": "047",
        "STNAME": "New York",
        "CTYNAME": "Kings County",
        "POPESTIMATE2019": "2559903"
      },
      {
        "STATE": "36",
        "COUNTY": "049",
        "STNAME": "New York",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "26296"
      },
      {
        "STATE": "36",
        "COUNTY": "051",
        "STNAME": "New York",
        "CTYNAME": "Livingston County",
        "POPESTIMATE2019": "62914"
      },
      {
        "STATE": "36",
        "COUNTY": "053",
        "STNAME": "New York",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "70941"
      },
      {
        "STATE": "36",
        "COUNTY": "055",
        "STNAME": "New York",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "741770"
      },
      {
        "STATE": "36",
        "COUNTY": "057",
        "STNAME": "New York",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "49221"
      },
      {
        "STATE": "36",
        "COUNTY": "059",
        "STNAME": "New York",
        "CTYNAME": "Nassau County",
        "POPESTIMATE2019": "1356924"
      },
      {
        "STATE": "36",
        "COUNTY": "061",
        "STNAME": "New York",
        "CTYNAME": "New York County",
        "POPESTIMATE2019": "1628706"
      },
      {
        "STATE": "36",
        "COUNTY": "063",
        "STNAME": "New York",
        "CTYNAME": "Niagara County",
        "POPESTIMATE2019": "209281"
      },
      {
        "STATE": "36",
        "COUNTY": "065",
        "STNAME": "New York",
        "CTYNAME": "Oneida County",
        "POPESTIMATE2019": "228671"
      },
      {
        "STATE": "36",
        "COUNTY": "067",
        "STNAME": "New York",
        "CTYNAME": "Onondaga County",
        "POPESTIMATE2019": "460528"
      },
      {
        "STATE": "36",
        "COUNTY": "069",
        "STNAME": "New York",
        "CTYNAME": "Ontario County",
        "POPESTIMATE2019": "109777"
      },
      {
        "STATE": "36",
        "COUNTY": "071",
        "STNAME": "New York",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "384940"
      },
      {
        "STATE": "36",
        "COUNTY": "073",
        "STNAME": "New York",
        "CTYNAME": "Orleans County",
        "POPESTIMATE2019": "40352"
      },
      {
        "STATE": "36",
        "COUNTY": "075",
        "STNAME": "New York",
        "CTYNAME": "Oswego County",
        "POPESTIMATE2019": "117124"
      },
      {
        "STATE": "36",
        "COUNTY": "077",
        "STNAME": "New York",
        "CTYNAME": "Otsego County",
        "POPESTIMATE2019": "59493"
      },
      {
        "STATE": "36",
        "COUNTY": "079",
        "STNAME": "New York",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "98320"
      },
      {
        "STATE": "36",
        "COUNTY": "081",
        "STNAME": "New York",
        "CTYNAME": "Queens County",
        "POPESTIMATE2019": "2253858"
      },
      {
        "STATE": "36",
        "COUNTY": "083",
        "STNAME": "New York",
        "CTYNAME": "Rensselaer County",
        "POPESTIMATE2019": "158714"
      },
      {
        "STATE": "36",
        "COUNTY": "085",
        "STNAME": "New York",
        "CTYNAME": "Richmond County",
        "POPESTIMATE2019": "476143"
      },
      {
        "STATE": "36",
        "COUNTY": "087",
        "STNAME": "New York",
        "CTYNAME": "Rockland County",
        "POPESTIMATE2019": "325789"
      },
      {
        "STATE": "36",
        "COUNTY": "089",
        "STNAME": "New York",
        "CTYNAME": "St. Lawrence County",
        "POPESTIMATE2019": "107740"
      },
      {
        "STATE": "36",
        "COUNTY": "091",
        "STNAME": "New York",
        "CTYNAME": "Saratoga County",
        "POPESTIMATE2019": "229863"
      },
      {
        "STATE": "36",
        "COUNTY": "093",
        "STNAME": "New York",
        "CTYNAME": "Schenectady County",
        "POPESTIMATE2019": "155299"
      },
      {
        "STATE": "36",
        "COUNTY": "095",
        "STNAME": "New York",
        "CTYNAME": "Schoharie County",
        "POPESTIMATE2019": "30999"
      },
      {
        "STATE": "36",
        "COUNTY": "097",
        "STNAME": "New York",
        "CTYNAME": "Schuyler County",
        "POPESTIMATE2019": "17807"
      },
      {
        "STATE": "36",
        "COUNTY": "099",
        "STNAME": "New York",
        "CTYNAME": "Seneca County",
        "POPESTIMATE2019": "34016"
      },
      {
        "STATE": "36",
        "COUNTY": "101",
        "STNAME": "New York",
        "CTYNAME": "Steuben County",
        "POPESTIMATE2019": "95379"
      },
      {
        "STATE": "36",
        "COUNTY": "103",
        "STNAME": "New York",
        "CTYNAME": "Suffolk County",
        "POPESTIMATE2019": "1476601"
      },
      {
        "STATE": "36",
        "COUNTY": "105",
        "STNAME": "New York",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "75432"
      },
      {
        "STATE": "36",
        "COUNTY": "107",
        "STNAME": "New York",
        "CTYNAME": "Tioga County",
        "POPESTIMATE2019": "48203"
      },
      {
        "STATE": "36",
        "COUNTY": "109",
        "STNAME": "New York",
        "CTYNAME": "Tompkins County",
        "POPESTIMATE2019": "102180"
      },
      {
        "STATE": "36",
        "COUNTY": "111",
        "STNAME": "New York",
        "CTYNAME": "Ulster County",
        "POPESTIMATE2019": "177573"
      },
      {
        "STATE": "36",
        "COUNTY": "113",
        "STNAME": "New York",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "63944"
      },
      {
        "STATE": "36",
        "COUNTY": "115",
        "STNAME": "New York",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "61204"
      },
      {
        "STATE": "36",
        "COUNTY": "117",
        "STNAME": "New York",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "89918"
      },
      {
        "STATE": "36",
        "COUNTY": "119",
        "STNAME": "New York",
        "CTYNAME": "Westchester County",
        "POPESTIMATE2019": "967506"
      },
      {
        "STATE": "36",
        "COUNTY": "121",
        "STNAME": "New York",
        "CTYNAME": "Wyoming County",
        "POPESTIMATE2019": "39859"
      },
      {
        "STATE": "36",
        "COUNTY": "123",
        "STNAME": "New York",
        "CTYNAME": "Yates County",
        "POPESTIMATE2019": "24913"
      },
      {
        "STATE": "37",
        "COUNTY": "000",
        "STNAME": "North Carolina",
        "CTYNAME": "North Carolina",
        "POPESTIMATE2019": "10488084"
      },
      {
        "STATE": "37",
        "COUNTY": "001",
        "STNAME": "North Carolina",
        "CTYNAME": "Alamance County",
        "POPESTIMATE2019": "169509"
      },
      {
        "STATE": "37",
        "COUNTY": "003",
        "STNAME": "North Carolina",
        "CTYNAME": "Alexander County",
        "POPESTIMATE2019": "37497"
      },
      {
        "STATE": "37",
        "COUNTY": "005",
        "STNAME": "North Carolina",
        "CTYNAME": "Alleghany County",
        "POPESTIMATE2019": "11137"
      },
      {
        "STATE": "37",
        "COUNTY": "007",
        "STNAME": "North Carolina",
        "CTYNAME": "Anson County",
        "POPESTIMATE2019": "24446"
      },
      {
        "STATE": "37",
        "COUNTY": "009",
        "STNAME": "North Carolina",
        "CTYNAME": "Ashe County",
        "POPESTIMATE2019": "27203"
      },
      {
        "STATE": "37",
        "COUNTY": "011",
        "STNAME": "North Carolina",
        "CTYNAME": "Avery County",
        "POPESTIMATE2019": "17557"
      },
      {
        "STATE": "37",
        "COUNTY": "013",
        "STNAME": "North Carolina",
        "CTYNAME": "Beaufort County",
        "POPESTIMATE2019": "46994"
      },
      {
        "STATE": "37",
        "COUNTY": "015",
        "STNAME": "North Carolina",
        "CTYNAME": "Bertie County",
        "POPESTIMATE2019": "18947"
      },
      {
        "STATE": "37",
        "COUNTY": "017",
        "STNAME": "North Carolina",
        "CTYNAME": "Bladen County",
        "POPESTIMATE2019": "32722"
      },
      {
        "STATE": "37",
        "COUNTY": "019",
        "STNAME": "North Carolina",
        "CTYNAME": "Brunswick County",
        "POPESTIMATE2019": "142820"
      },
      {
        "STATE": "37",
        "COUNTY": "021",
        "STNAME": "North Carolina",
        "CTYNAME": "Buncombe County",
        "POPESTIMATE2019": "261191"
      },
      {
        "STATE": "37",
        "COUNTY": "023",
        "STNAME": "North Carolina",
        "CTYNAME": "Burke County",
        "POPESTIMATE2019": "90485"
      },
      {
        "STATE": "37",
        "COUNTY": "025",
        "STNAME": "North Carolina",
        "CTYNAME": "Cabarrus County",
        "POPESTIMATE2019": "216453"
      },
      {
        "STATE": "37",
        "COUNTY": "027",
        "STNAME": "North Carolina",
        "CTYNAME": "Caldwell County",
        "POPESTIMATE2019": "82178"
      },
      {
        "STATE": "37",
        "COUNTY": "029",
        "STNAME": "North Carolina",
        "CTYNAME": "Camden County",
        "POPESTIMATE2019": "10867"
      },
      {
        "STATE": "37",
        "COUNTY": "031",
        "STNAME": "North Carolina",
        "CTYNAME": "Carteret County",
        "POPESTIMATE2019": "69473"
      },
      {
        "STATE": "37",
        "COUNTY": "033",
        "STNAME": "North Carolina",
        "CTYNAME": "Caswell County",
        "POPESTIMATE2019": "22604"
      },
      {
        "STATE": "37",
        "COUNTY": "035",
        "STNAME": "North Carolina",
        "CTYNAME": "Catawba County",
        "POPESTIMATE2019": "159551"
      },
      {
        "STATE": "37",
        "COUNTY": "037",
        "STNAME": "North Carolina",
        "CTYNAME": "Chatham County",
        "POPESTIMATE2019": "74470"
      },
      {
        "STATE": "37",
        "COUNTY": "039",
        "STNAME": "North Carolina",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "28612"
      },
      {
        "STATE": "37",
        "COUNTY": "041",
        "STNAME": "North Carolina",
        "CTYNAME": "Chowan County",
        "POPESTIMATE2019": "13943"
      },
      {
        "STATE": "37",
        "COUNTY": "043",
        "STNAME": "North Carolina",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "11231"
      },
      {
        "STATE": "37",
        "COUNTY": "045",
        "STNAME": "North Carolina",
        "CTYNAME": "Cleveland County",
        "POPESTIMATE2019": "97947"
      },
      {
        "STATE": "37",
        "COUNTY": "047",
        "STNAME": "North Carolina",
        "CTYNAME": "Columbus County",
        "POPESTIMATE2019": "55508"
      },
      {
        "STATE": "37",
        "COUNTY": "049",
        "STNAME": "North Carolina",
        "CTYNAME": "Craven County",
        "POPESTIMATE2019": "102139"
      },
      {
        "STATE": "37",
        "COUNTY": "051",
        "STNAME": "North Carolina",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "335509"
      },
      {
        "STATE": "37",
        "COUNTY": "053",
        "STNAME": "North Carolina",
        "CTYNAME": "Currituck County",
        "POPESTIMATE2019": "27763"
      },
      {
        "STATE": "37",
        "COUNTY": "055",
        "STNAME": "North Carolina",
        "CTYNAME": "Dare County",
        "POPESTIMATE2019": "37009"
      },
      {
        "STATE": "37",
        "COUNTY": "057",
        "STNAME": "North Carolina",
        "CTYNAME": "Davidson County",
        "POPESTIMATE2019": "167609"
      },
      {
        "STATE": "37",
        "COUNTY": "059",
        "STNAME": "North Carolina",
        "CTYNAME": "Davie County",
        "POPESTIMATE2019": "42846"
      },
      {
        "STATE": "37",
        "COUNTY": "061",
        "STNAME": "North Carolina",
        "CTYNAME": "Duplin County",
        "POPESTIMATE2019": "58741"
      },
      {
        "STATE": "37",
        "COUNTY": "063",
        "STNAME": "North Carolina",
        "CTYNAME": "Durham County",
        "POPESTIMATE2019": "321488"
      },
      {
        "STATE": "37",
        "COUNTY": "065",
        "STNAME": "North Carolina",
        "CTYNAME": "Edgecombe County",
        "POPESTIMATE2019": "51472"
      },
      {
        "STATE": "37",
        "COUNTY": "067",
        "STNAME": "North Carolina",
        "CTYNAME": "Forsyth County",
        "POPESTIMATE2019": "382295"
      },
      {
        "STATE": "37",
        "COUNTY": "069",
        "STNAME": "North Carolina",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "69685"
      },
      {
        "STATE": "37",
        "COUNTY": "071",
        "STNAME": "North Carolina",
        "CTYNAME": "Gaston County",
        "POPESTIMATE2019": "224529"
      },
      {
        "STATE": "37",
        "COUNTY": "073",
        "STNAME": "North Carolina",
        "CTYNAME": "Gates County",
        "POPESTIMATE2019": "11562"
      },
      {
        "STATE": "37",
        "COUNTY": "075",
        "STNAME": "North Carolina",
        "CTYNAME": "Graham County",
        "POPESTIMATE2019": "8441"
      },
      {
        "STATE": "37",
        "COUNTY": "077",
        "STNAME": "North Carolina",
        "CTYNAME": "Granville County",
        "POPESTIMATE2019": "60443"
      },
      {
        "STATE": "37",
        "COUNTY": "079",
        "STNAME": "North Carolina",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "21069"
      },
      {
        "STATE": "37",
        "COUNTY": "081",
        "STNAME": "North Carolina",
        "CTYNAME": "Guilford County",
        "POPESTIMATE2019": "537174"
      },
      {
        "STATE": "37",
        "COUNTY": "083",
        "STNAME": "North Carolina",
        "CTYNAME": "Halifax County",
        "POPESTIMATE2019": "50010"
      },
      {
        "STATE": "37",
        "COUNTY": "085",
        "STNAME": "North Carolina",
        "CTYNAME": "Harnett County",
        "POPESTIMATE2019": "135976"
      },
      {
        "STATE": "37",
        "COUNTY": "087",
        "STNAME": "North Carolina",
        "CTYNAME": "Haywood County",
        "POPESTIMATE2019": "62317"
      },
      {
        "STATE": "37",
        "COUNTY": "089",
        "STNAME": "North Carolina",
        "CTYNAME": "Henderson County",
        "POPESTIMATE2019": "117417"
      },
      {
        "STATE": "37",
        "COUNTY": "091",
        "STNAME": "North Carolina",
        "CTYNAME": "Hertford County",
        "POPESTIMATE2019": "23677"
      },
      {
        "STATE": "37",
        "COUNTY": "093",
        "STNAME": "North Carolina",
        "CTYNAME": "Hoke County",
        "POPESTIMATE2019": "55234"
      },
      {
        "STATE": "37",
        "COUNTY": "095",
        "STNAME": "North Carolina",
        "CTYNAME": "Hyde County",
        "POPESTIMATE2019": "4937"
      },
      {
        "STATE": "37",
        "COUNTY": "097",
        "STNAME": "North Carolina",
        "CTYNAME": "Iredell County",
        "POPESTIMATE2019": "181806"
      },
      {
        "STATE": "37",
        "COUNTY": "099",
        "STNAME": "North Carolina",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "43938"
      },
      {
        "STATE": "37",
        "COUNTY": "101",
        "STNAME": "North Carolina",
        "CTYNAME": "Johnston County",
        "POPESTIMATE2019": "209339"
      },
      {
        "STATE": "37",
        "COUNTY": "103",
        "STNAME": "North Carolina",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "9419"
      },
      {
        "STATE": "37",
        "COUNTY": "105",
        "STNAME": "North Carolina",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "61779"
      },
      {
        "STATE": "37",
        "COUNTY": "107",
        "STNAME": "North Carolina",
        "CTYNAME": "Lenoir County",
        "POPESTIMATE2019": "55949"
      },
      {
        "STATE": "37",
        "COUNTY": "109",
        "STNAME": "North Carolina",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "86111"
      },
      {
        "STATE": "37",
        "COUNTY": "111",
        "STNAME": "North Carolina",
        "CTYNAME": "McDowell County",
        "POPESTIMATE2019": "45756"
      },
      {
        "STATE": "37",
        "COUNTY": "113",
        "STNAME": "North Carolina",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "35858"
      },
      {
        "STATE": "37",
        "COUNTY": "115",
        "STNAME": "North Carolina",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "21755"
      },
      {
        "STATE": "37",
        "COUNTY": "117",
        "STNAME": "North Carolina",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "22440"
      },
      {
        "STATE": "37",
        "COUNTY": "119",
        "STNAME": "North Carolina",
        "CTYNAME": "Mecklenburg County",
        "POPESTIMATE2019": "1110356"
      },
      {
        "STATE": "37",
        "COUNTY": "121",
        "STNAME": "North Carolina",
        "CTYNAME": "Mitchell County",
        "POPESTIMATE2019": "14964"
      },
      {
        "STATE": "37",
        "COUNTY": "123",
        "STNAME": "North Carolina",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "27173"
      },
      {
        "STATE": "37",
        "COUNTY": "125",
        "STNAME": "North Carolina",
        "CTYNAME": "Moore County",
        "POPESTIMATE2019": "100880"
      },
      {
        "STATE": "37",
        "COUNTY": "127",
        "STNAME": "North Carolina",
        "CTYNAME": "Nash County",
        "POPESTIMATE2019": "94298"
      },
      {
        "STATE": "37",
        "COUNTY": "129",
        "STNAME": "North Carolina",
        "CTYNAME": "New Hanover County",
        "POPESTIMATE2019": "234473"
      },
      {
        "STATE": "37",
        "COUNTY": "131",
        "STNAME": "North Carolina",
        "CTYNAME": "Northampton County",
        "POPESTIMATE2019": "19483"
      },
      {
        "STATE": "37",
        "COUNTY": "133",
        "STNAME": "North Carolina",
        "CTYNAME": "Onslow County",
        "POPESTIMATE2019": "197938"
      },
      {
        "STATE": "37",
        "COUNTY": "135",
        "STNAME": "North Carolina",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "148476"
      },
      {
        "STATE": "37",
        "COUNTY": "137",
        "STNAME": "North Carolina",
        "CTYNAME": "Pamlico County",
        "POPESTIMATE2019": "12726"
      },
      {
        "STATE": "37",
        "COUNTY": "139",
        "STNAME": "North Carolina",
        "CTYNAME": "Pasquotank County",
        "POPESTIMATE2019": "39824"
      },
      {
        "STATE": "37",
        "COUNTY": "141",
        "STNAME": "North Carolina",
        "CTYNAME": "Pender County",
        "POPESTIMATE2019": "63060"
      },
      {
        "STATE": "37",
        "COUNTY": "143",
        "STNAME": "North Carolina",
        "CTYNAME": "Perquimans County",
        "POPESTIMATE2019": "13463"
      },
      {
        "STATE": "37",
        "COUNTY": "145",
        "STNAME": "North Carolina",
        "CTYNAME": "Person County",
        "POPESTIMATE2019": "39490"
      },
      {
        "STATE": "37",
        "COUNTY": "147",
        "STNAME": "North Carolina",
        "CTYNAME": "Pitt County",
        "POPESTIMATE2019": "180742"
      },
      {
        "STATE": "37",
        "COUNTY": "149",
        "STNAME": "North Carolina",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "20724"
      },
      {
        "STATE": "37",
        "COUNTY": "151",
        "STNAME": "North Carolina",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "143667"
      },
      {
        "STATE": "37",
        "COUNTY": "153",
        "STNAME": "North Carolina",
        "CTYNAME": "Richmond County",
        "POPESTIMATE2019": "44829"
      },
      {
        "STATE": "37",
        "COUNTY": "155",
        "STNAME": "North Carolina",
        "CTYNAME": "Robeson County",
        "POPESTIMATE2019": "130625"
      },
      {
        "STATE": "37",
        "COUNTY": "157",
        "STNAME": "North Carolina",
        "CTYNAME": "Rockingham County",
        "POPESTIMATE2019": "91010"
      },
      {
        "STATE": "37",
        "COUNTY": "159",
        "STNAME": "North Carolina",
        "CTYNAME": "Rowan County",
        "POPESTIMATE2019": "142088"
      },
      {
        "STATE": "37",
        "COUNTY": "161",
        "STNAME": "North Carolina",
        "CTYNAME": "Rutherford County",
        "POPESTIMATE2019": "67029"
      },
      {
        "STATE": "37",
        "COUNTY": "163",
        "STNAME": "North Carolina",
        "CTYNAME": "Sampson County",
        "POPESTIMATE2019": "63531"
      },
      {
        "STATE": "37",
        "COUNTY": "165",
        "STNAME": "North Carolina",
        "CTYNAME": "Scotland County",
        "POPESTIMATE2019": "34823"
      },
      {
        "STATE": "37",
        "COUNTY": "167",
        "STNAME": "North Carolina",
        "CTYNAME": "Stanly County",
        "POPESTIMATE2019": "62806"
      },
      {
        "STATE": "37",
        "COUNTY": "169",
        "STNAME": "North Carolina",
        "CTYNAME": "Stokes County",
        "POPESTIMATE2019": "45591"
      },
      {
        "STATE": "37",
        "COUNTY": "171",
        "STNAME": "North Carolina",
        "CTYNAME": "Surry County",
        "POPESTIMATE2019": "71783"
      },
      {
        "STATE": "37",
        "COUNTY": "173",
        "STNAME": "North Carolina",
        "CTYNAME": "Swain County",
        "POPESTIMATE2019": "14271"
      },
      {
        "STATE": "37",
        "COUNTY": "175",
        "STNAME": "North Carolina",
        "CTYNAME": "Transylvania County",
        "POPESTIMATE2019": "34385"
      },
      {
        "STATE": "37",
        "COUNTY": "177",
        "STNAME": "North Carolina",
        "CTYNAME": "Tyrrell County",
        "POPESTIMATE2019": "4016"
      },
      {
        "STATE": "37",
        "COUNTY": "179",
        "STNAME": "North Carolina",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "239859"
      },
      {
        "STATE": "37",
        "COUNTY": "181",
        "STNAME": "North Carolina",
        "CTYNAME": "Vance County",
        "POPESTIMATE2019": "44535"
      },
      {
        "STATE": "37",
        "COUNTY": "183",
        "STNAME": "North Carolina",
        "CTYNAME": "Wake County",
        "POPESTIMATE2019": "1111761"
      },
      {
        "STATE": "37",
        "COUNTY": "185",
        "STNAME": "North Carolina",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "19731"
      },
      {
        "STATE": "37",
        "COUNTY": "187",
        "STNAME": "North Carolina",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "11580"
      },
      {
        "STATE": "37",
        "COUNTY": "189",
        "STNAME": "North Carolina",
        "CTYNAME": "Watauga County",
        "POPESTIMATE2019": "56177"
      },
      {
        "STATE": "37",
        "COUNTY": "191",
        "STNAME": "North Carolina",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "123131"
      },
      {
        "STATE": "37",
        "COUNTY": "193",
        "STNAME": "North Carolina",
        "CTYNAME": "Wilkes County",
        "POPESTIMATE2019": "68412"
      },
      {
        "STATE": "37",
        "COUNTY": "195",
        "STNAME": "North Carolina",
        "CTYNAME": "Wilson County",
        "POPESTIMATE2019": "81801"
      },
      {
        "STATE": "37",
        "COUNTY": "197",
        "STNAME": "North Carolina",
        "CTYNAME": "Yadkin County",
        "POPESTIMATE2019": "37667"
      },
      {
        "STATE": "37",
        "COUNTY": "199",
        "STNAME": "North Carolina",
        "CTYNAME": "Yancey County",
        "POPESTIMATE2019": "18069"
      },
      {
        "STATE": "38",
        "COUNTY": "000",
        "STNAME": "North Dakota",
        "CTYNAME": "North Dakota",
        "POPESTIMATE2019": "762062"
      },
      {
        "STATE": "38",
        "COUNTY": "001",
        "STNAME": "North Dakota",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "2216"
      },
      {
        "STATE": "38",
        "COUNTY": "003",
        "STNAME": "North Dakota",
        "CTYNAME": "Barnes County",
        "POPESTIMATE2019": "10415"
      },
      {
        "STATE": "38",
        "COUNTY": "005",
        "STNAME": "North Dakota",
        "CTYNAME": "Benson County",
        "POPESTIMATE2019": "6832"
      },
      {
        "STATE": "38",
        "COUNTY": "007",
        "STNAME": "North Dakota",
        "CTYNAME": "Billings County",
        "POPESTIMATE2019": "928"
      },
      {
        "STATE": "38",
        "COUNTY": "009",
        "STNAME": "North Dakota",
        "CTYNAME": "Bottineau County",
        "POPESTIMATE2019": "6282"
      },
      {
        "STATE": "38",
        "COUNTY": "011",
        "STNAME": "North Dakota",
        "CTYNAME": "Bowman County",
        "POPESTIMATE2019": "3024"
      },
      {
        "STATE": "38",
        "COUNTY": "013",
        "STNAME": "North Dakota",
        "CTYNAME": "Burke County",
        "POPESTIMATE2019": "2115"
      },
      {
        "STATE": "38",
        "COUNTY": "015",
        "STNAME": "North Dakota",
        "CTYNAME": "Burleigh County",
        "POPESTIMATE2019": "95626"
      },
      {
        "STATE": "38",
        "COUNTY": "017",
        "STNAME": "North Dakota",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "181923"
      },
      {
        "STATE": "38",
        "COUNTY": "019",
        "STNAME": "North Dakota",
        "CTYNAME": "Cavalier County",
        "POPESTIMATE2019": "3762"
      },
      {
        "STATE": "38",
        "COUNTY": "021",
        "STNAME": "North Dakota",
        "CTYNAME": "Dickey County",
        "POPESTIMATE2019": "4872"
      },
      {
        "STATE": "38",
        "COUNTY": "023",
        "STNAME": "North Dakota",
        "CTYNAME": "Divide County",
        "POPESTIMATE2019": "2264"
      },
      {
        "STATE": "38",
        "COUNTY": "025",
        "STNAME": "North Dakota",
        "CTYNAME": "Dunn County",
        "POPESTIMATE2019": "4424"
      },
      {
        "STATE": "38",
        "COUNTY": "027",
        "STNAME": "North Dakota",
        "CTYNAME": "Eddy County",
        "POPESTIMATE2019": "2287"
      },
      {
        "STATE": "38",
        "COUNTY": "029",
        "STNAME": "North Dakota",
        "CTYNAME": "Emmons County",
        "POPESTIMATE2019": "3241"
      },
      {
        "STATE": "38",
        "COUNTY": "031",
        "STNAME": "North Dakota",
        "CTYNAME": "Foster County",
        "POPESTIMATE2019": "3210"
      },
      {
        "STATE": "38",
        "COUNTY": "033",
        "STNAME": "North Dakota",
        "CTYNAME": "Golden Valley County",
        "POPESTIMATE2019": "1761"
      },
      {
        "STATE": "38",
        "COUNTY": "035",
        "STNAME": "North Dakota",
        "CTYNAME": "Grand Forks County",
        "POPESTIMATE2019": "69451"
      },
      {
        "STATE": "38",
        "COUNTY": "037",
        "STNAME": "North Dakota",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "2274"
      },
      {
        "STATE": "38",
        "COUNTY": "039",
        "STNAME": "North Dakota",
        "CTYNAME": "Griggs County",
        "POPESTIMATE2019": "2231"
      },
      {
        "STATE": "38",
        "COUNTY": "041",
        "STNAME": "North Dakota",
        "CTYNAME": "Hettinger County",
        "POPESTIMATE2019": "2499"
      },
      {
        "STATE": "38",
        "COUNTY": "043",
        "STNAME": "North Dakota",
        "CTYNAME": "Kidder County",
        "POPESTIMATE2019": "2480"
      },
      {
        "STATE": "38",
        "COUNTY": "045",
        "STNAME": "North Dakota",
        "CTYNAME": "LaMoure County",
        "POPESTIMATE2019": "4046"
      },
      {
        "STATE": "38",
        "COUNTY": "047",
        "STNAME": "North Dakota",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "1850"
      },
      {
        "STATE": "38",
        "COUNTY": "049",
        "STNAME": "North Dakota",
        "CTYNAME": "McHenry County",
        "POPESTIMATE2019": "5745"
      },
      {
        "STATE": "38",
        "COUNTY": "051",
        "STNAME": "North Dakota",
        "CTYNAME": "McIntosh County",
        "POPESTIMATE2019": "2497"
      },
      {
        "STATE": "38",
        "COUNTY": "053",
        "STNAME": "North Dakota",
        "CTYNAME": "McKenzie County",
        "POPESTIMATE2019": "15024"
      },
      {
        "STATE": "38",
        "COUNTY": "055",
        "STNAME": "North Dakota",
        "CTYNAME": "McLean County",
        "POPESTIMATE2019": "9450"
      },
      {
        "STATE": "38",
        "COUNTY": "057",
        "STNAME": "North Dakota",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "8187"
      },
      {
        "STATE": "38",
        "COUNTY": "059",
        "STNAME": "North Dakota",
        "CTYNAME": "Morton County",
        "POPESTIMATE2019": "31364"
      },
      {
        "STATE": "38",
        "COUNTY": "061",
        "STNAME": "North Dakota",
        "CTYNAME": "Mountrail County",
        "POPESTIMATE2019": "10545"
      },
      {
        "STATE": "38",
        "COUNTY": "063",
        "STNAME": "North Dakota",
        "CTYNAME": "Nelson County",
        "POPESTIMATE2019": "2879"
      },
      {
        "STATE": "38",
        "COUNTY": "065",
        "STNAME": "North Dakota",
        "CTYNAME": "Oliver County",
        "POPESTIMATE2019": "1959"
      },
      {
        "STATE": "38",
        "COUNTY": "067",
        "STNAME": "North Dakota",
        "CTYNAME": "Pembina County",
        "POPESTIMATE2019": "6801"
      },
      {
        "STATE": "38",
        "COUNTY": "069",
        "STNAME": "North Dakota",
        "CTYNAME": "Pierce County",
        "POPESTIMATE2019": "3975"
      },
      {
        "STATE": "38",
        "COUNTY": "071",
        "STNAME": "North Dakota",
        "CTYNAME": "Ramsey County",
        "POPESTIMATE2019": "11519"
      },
      {
        "STATE": "38",
        "COUNTY": "073",
        "STNAME": "North Dakota",
        "CTYNAME": "Ransom County",
        "POPESTIMATE2019": "5218"
      },
      {
        "STATE": "38",
        "COUNTY": "075",
        "STNAME": "North Dakota",
        "CTYNAME": "Renville County",
        "POPESTIMATE2019": "2327"
      },
      {
        "STATE": "38",
        "COUNTY": "077",
        "STNAME": "North Dakota",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "16177"
      },
      {
        "STATE": "38",
        "COUNTY": "079",
        "STNAME": "North Dakota",
        "CTYNAME": "Rolette County",
        "POPESTIMATE2019": "14176"
      },
      {
        "STATE": "38",
        "COUNTY": "081",
        "STNAME": "North Dakota",
        "CTYNAME": "Sargent County",
        "POPESTIMATE2019": "3898"
      },
      {
        "STATE": "38",
        "COUNTY": "083",
        "STNAME": "North Dakota",
        "CTYNAME": "Sheridan County",
        "POPESTIMATE2019": "1315"
      },
      {
        "STATE": "38",
        "COUNTY": "085",
        "STNAME": "North Dakota",
        "CTYNAME": "Sioux County",
        "POPESTIMATE2019": "4230"
      },
      {
        "STATE": "38",
        "COUNTY": "087",
        "STNAME": "North Dakota",
        "CTYNAME": "Slope County",
        "POPESTIMATE2019": "750"
      },
      {
        "STATE": "38",
        "COUNTY": "089",
        "STNAME": "North Dakota",
        "CTYNAME": "Stark County",
        "POPESTIMATE2019": "31489"
      },
      {
        "STATE": "38",
        "COUNTY": "091",
        "STNAME": "North Dakota",
        "CTYNAME": "Steele County",
        "POPESTIMATE2019": "1890"
      },
      {
        "STATE": "38",
        "COUNTY": "093",
        "STNAME": "North Dakota",
        "CTYNAME": "Stutsman County",
        "POPESTIMATE2019": "20704"
      },
      {
        "STATE": "38",
        "COUNTY": "095",
        "STNAME": "North Dakota",
        "CTYNAME": "Towner County",
        "POPESTIMATE2019": "2189"
      },
      {
        "STATE": "38",
        "COUNTY": "097",
        "STNAME": "North Dakota",
        "CTYNAME": "Traill County",
        "POPESTIMATE2019": "8036"
      },
      {
        "STATE": "38",
        "COUNTY": "099",
        "STNAME": "North Dakota",
        "CTYNAME": "Walsh County",
        "POPESTIMATE2019": "10641"
      },
      {
        "STATE": "38",
        "COUNTY": "101",
        "STNAME": "North Dakota",
        "CTYNAME": "Ward County",
        "POPESTIMATE2019": "67641"
      },
      {
        "STATE": "38",
        "COUNTY": "103",
        "STNAME": "North Dakota",
        "CTYNAME": "Wells County",
        "POPESTIMATE2019": "3834"
      },
      {
        "STATE": "38",
        "COUNTY": "105",
        "STNAME": "North Dakota",
        "CTYNAME": "Williams County",
        "POPESTIMATE2019": "37589"
      },
      {
        "STATE": "39",
        "COUNTY": "000",
        "STNAME": "Ohio",
        "CTYNAME": "Ohio",
        "POPESTIMATE2019": "11689100"
      },
      {
        "STATE": "39",
        "COUNTY": "001",
        "STNAME": "Ohio",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "27698"
      },
      {
        "STATE": "39",
        "COUNTY": "003",
        "STNAME": "Ohio",
        "CTYNAME": "Allen County",
        "POPESTIMATE2019": "102351"
      },
      {
        "STATE": "39",
        "COUNTY": "005",
        "STNAME": "Ohio",
        "CTYNAME": "Ashland County",
        "POPESTIMATE2019": "53484"
      },
      {
        "STATE": "39",
        "COUNTY": "007",
        "STNAME": "Ohio",
        "CTYNAME": "Ashtabula County",
        "POPESTIMATE2019": "97241"
      },
      {
        "STATE": "39",
        "COUNTY": "009",
        "STNAME": "Ohio",
        "CTYNAME": "Athens County",
        "POPESTIMATE2019": "65327"
      },
      {
        "STATE": "39",
        "COUNTY": "011",
        "STNAME": "Ohio",
        "CTYNAME": "Auglaize County",
        "POPESTIMATE2019": "45656"
      },
      {
        "STATE": "39",
        "COUNTY": "013",
        "STNAME": "Ohio",
        "CTYNAME": "Belmont County",
        "POPESTIMATE2019": "67006"
      },
      {
        "STATE": "39",
        "COUNTY": "015",
        "STNAME": "Ohio",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "43432"
      },
      {
        "STATE": "39",
        "COUNTY": "017",
        "STNAME": "Ohio",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "383134"
      },
      {
        "STATE": "39",
        "COUNTY": "019",
        "STNAME": "Ohio",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "26914"
      },
      {
        "STATE": "39",
        "COUNTY": "021",
        "STNAME": "Ohio",
        "CTYNAME": "Champaign County",
        "POPESTIMATE2019": "38885"
      },
      {
        "STATE": "39",
        "COUNTY": "023",
        "STNAME": "Ohio",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "134083"
      },
      {
        "STATE": "39",
        "COUNTY": "025",
        "STNAME": "Ohio",
        "CTYNAME": "Clermont County",
        "POPESTIMATE2019": "206428"
      },
      {
        "STATE": "39",
        "COUNTY": "027",
        "STNAME": "Ohio",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "41968"
      },
      {
        "STATE": "39",
        "COUNTY": "029",
        "STNAME": "Ohio",
        "CTYNAME": "Columbiana County",
        "POPESTIMATE2019": "101883"
      },
      {
        "STATE": "39",
        "COUNTY": "031",
        "STNAME": "Ohio",
        "CTYNAME": "Coshocton County",
        "POPESTIMATE2019": "36600"
      },
      {
        "STATE": "39",
        "COUNTY": "033",
        "STNAME": "Ohio",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "41494"
      },
      {
        "STATE": "39",
        "COUNTY": "035",
        "STNAME": "Ohio",
        "CTYNAME": "Cuyahoga County",
        "POPESTIMATE2019": "1235072"
      },
      {
        "STATE": "39",
        "COUNTY": "037",
        "STNAME": "Ohio",
        "CTYNAME": "Darke County",
        "POPESTIMATE2019": "51113"
      },
      {
        "STATE": "39",
        "COUNTY": "039",
        "STNAME": "Ohio",
        "CTYNAME": "Defiance County",
        "POPESTIMATE2019": "38087"
      },
      {
        "STATE": "39",
        "COUNTY": "041",
        "STNAME": "Ohio",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "209177"
      },
      {
        "STATE": "39",
        "COUNTY": "043",
        "STNAME": "Ohio",
        "CTYNAME": "Erie County",
        "POPESTIMATE2019": "74266"
      },
      {
        "STATE": "39",
        "COUNTY": "045",
        "STNAME": "Ohio",
        "CTYNAME": "Fairfield County",
        "POPESTIMATE2019": "157574"
      },
      {
        "STATE": "39",
        "COUNTY": "047",
        "STNAME": "Ohio",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "28525"
      },
      {
        "STATE": "39",
        "COUNTY": "049",
        "STNAME": "Ohio",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "1316756"
      },
      {
        "STATE": "39",
        "COUNTY": "051",
        "STNAME": "Ohio",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "42126"
      },
      {
        "STATE": "39",
        "COUNTY": "053",
        "STNAME": "Ohio",
        "CTYNAME": "Gallia County",
        "POPESTIMATE2019": "29898"
      },
      {
        "STATE": "39",
        "COUNTY": "055",
        "STNAME": "Ohio",
        "CTYNAME": "Geauga County",
        "POPESTIMATE2019": "93649"
      },
      {
        "STATE": "39",
        "COUNTY": "057",
        "STNAME": "Ohio",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "168937"
      },
      {
        "STATE": "39",
        "COUNTY": "059",
        "STNAME": "Ohio",
        "CTYNAME": "Guernsey County",
        "POPESTIMATE2019": "38875"
      },
      {
        "STATE": "39",
        "COUNTY": "061",
        "STNAME": "Ohio",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "817473"
      },
      {
        "STATE": "39",
        "COUNTY": "063",
        "STNAME": "Ohio",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "75783"
      },
      {
        "STATE": "39",
        "COUNTY": "065",
        "STNAME": "Ohio",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "31365"
      },
      {
        "STATE": "39",
        "COUNTY": "067",
        "STNAME": "Ohio",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "15040"
      },
      {
        "STATE": "39",
        "COUNTY": "069",
        "STNAME": "Ohio",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "27006"
      },
      {
        "STATE": "39",
        "COUNTY": "071",
        "STNAME": "Ohio",
        "CTYNAME": "Highland County",
        "POPESTIMATE2019": "43161"
      },
      {
        "STATE": "39",
        "COUNTY": "073",
        "STNAME": "Ohio",
        "CTYNAME": "Hocking County",
        "POPESTIMATE2019": "28264"
      },
      {
        "STATE": "39",
        "COUNTY": "075",
        "STNAME": "Ohio",
        "CTYNAME": "Holmes County",
        "POPESTIMATE2019": "43960"
      },
      {
        "STATE": "39",
        "COUNTY": "077",
        "STNAME": "Ohio",
        "CTYNAME": "Huron County",
        "POPESTIMATE2019": "58266"
      },
      {
        "STATE": "39",
        "COUNTY": "079",
        "STNAME": "Ohio",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "32413"
      },
      {
        "STATE": "39",
        "COUNTY": "081",
        "STNAME": "Ohio",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "65325"
      },
      {
        "STATE": "39",
        "COUNTY": "083",
        "STNAME": "Ohio",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "62322"
      },
      {
        "STATE": "39",
        "COUNTY": "085",
        "STNAME": "Ohio",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "230149"
      },
      {
        "STATE": "39",
        "COUNTY": "087",
        "STNAME": "Ohio",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "59463"
      },
      {
        "STATE": "39",
        "COUNTY": "089",
        "STNAME": "Ohio",
        "CTYNAME": "Licking County",
        "POPESTIMATE2019": "176862"
      },
      {
        "STATE": "39",
        "COUNTY": "091",
        "STNAME": "Ohio",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "45672"
      },
      {
        "STATE": "39",
        "COUNTY": "093",
        "STNAME": "Ohio",
        "CTYNAME": "Lorain County",
        "POPESTIMATE2019": "309833"
      },
      {
        "STATE": "39",
        "COUNTY": "095",
        "STNAME": "Ohio",
        "CTYNAME": "Lucas County",
        "POPESTIMATE2019": "428348"
      },
      {
        "STATE": "39",
        "COUNTY": "097",
        "STNAME": "Ohio",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "44731"
      },
      {
        "STATE": "39",
        "COUNTY": "099",
        "STNAME": "Ohio",
        "CTYNAME": "Mahoning County",
        "POPESTIMATE2019": "228683"
      },
      {
        "STATE": "39",
        "COUNTY": "101",
        "STNAME": "Ohio",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "65093"
      },
      {
        "STATE": "39",
        "COUNTY": "103",
        "STNAME": "Ohio",
        "CTYNAME": "Medina County",
        "POPESTIMATE2019": "179746"
      },
      {
        "STATE": "39",
        "COUNTY": "105",
        "STNAME": "Ohio",
        "CTYNAME": "Meigs County",
        "POPESTIMATE2019": "22907"
      },
      {
        "STATE": "39",
        "COUNTY": "107",
        "STNAME": "Ohio",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "41172"
      },
      {
        "STATE": "39",
        "COUNTY": "109",
        "STNAME": "Ohio",
        "CTYNAME": "Miami County",
        "POPESTIMATE2019": "106987"
      },
      {
        "STATE": "39",
        "COUNTY": "111",
        "STNAME": "Ohio",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "13654"
      },
      {
        "STATE": "39",
        "COUNTY": "113",
        "STNAME": "Ohio",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "531687"
      },
      {
        "STATE": "39",
        "COUNTY": "115",
        "STNAME": "Ohio",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "14508"
      },
      {
        "STATE": "39",
        "COUNTY": "117",
        "STNAME": "Ohio",
        "CTYNAME": "Morrow County",
        "POPESTIMATE2019": "35328"
      },
      {
        "STATE": "39",
        "COUNTY": "119",
        "STNAME": "Ohio",
        "CTYNAME": "Muskingum County",
        "POPESTIMATE2019": "86215"
      },
      {
        "STATE": "39",
        "COUNTY": "121",
        "STNAME": "Ohio",
        "CTYNAME": "Noble County",
        "POPESTIMATE2019": "14424"
      },
      {
        "STATE": "39",
        "COUNTY": "123",
        "STNAME": "Ohio",
        "CTYNAME": "Ottawa County",
        "POPESTIMATE2019": "40525"
      },
      {
        "STATE": "39",
        "COUNTY": "125",
        "STNAME": "Ohio",
        "CTYNAME": "Paulding County",
        "POPESTIMATE2019": "18672"
      },
      {
        "STATE": "39",
        "COUNTY": "127",
        "STNAME": "Ohio",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "36134"
      },
      {
        "STATE": "39",
        "COUNTY": "129",
        "STNAME": "Ohio",
        "CTYNAME": "Pickaway County",
        "POPESTIMATE2019": "58457"
      },
      {
        "STATE": "39",
        "COUNTY": "131",
        "STNAME": "Ohio",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "27772"
      },
      {
        "STATE": "39",
        "COUNTY": "133",
        "STNAME": "Ohio",
        "CTYNAME": "Portage County",
        "POPESTIMATE2019": "162466"
      },
      {
        "STATE": "39",
        "COUNTY": "135",
        "STNAME": "Ohio",
        "CTYNAME": "Preble County",
        "POPESTIMATE2019": "40882"
      },
      {
        "STATE": "39",
        "COUNTY": "137",
        "STNAME": "Ohio",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "33861"
      },
      {
        "STATE": "39",
        "COUNTY": "139",
        "STNAME": "Ohio",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "121154"
      },
      {
        "STATE": "39",
        "COUNTY": "141",
        "STNAME": "Ohio",
        "CTYNAME": "Ross County",
        "POPESTIMATE2019": "76666"
      },
      {
        "STATE": "39",
        "COUNTY": "143",
        "STNAME": "Ohio",
        "CTYNAME": "Sandusky County",
        "POPESTIMATE2019": "58518"
      },
      {
        "STATE": "39",
        "COUNTY": "145",
        "STNAME": "Ohio",
        "CTYNAME": "Scioto County",
        "POPESTIMATE2019": "75314"
      },
      {
        "STATE": "39",
        "COUNTY": "147",
        "STNAME": "Ohio",
        "CTYNAME": "Seneca County",
        "POPESTIMATE2019": "55178"
      },
      {
        "STATE": "39",
        "COUNTY": "149",
        "STNAME": "Ohio",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "48590"
      },
      {
        "STATE": "39",
        "COUNTY": "151",
        "STNAME": "Ohio",
        "CTYNAME": "Stark County",
        "POPESTIMATE2019": "370606"
      },
      {
        "STATE": "39",
        "COUNTY": "153",
        "STNAME": "Ohio",
        "CTYNAME": "Summit County",
        "POPESTIMATE2019": "541013"
      },
      {
        "STATE": "39",
        "COUNTY": "155",
        "STNAME": "Ohio",
        "CTYNAME": "Trumbull County",
        "POPESTIMATE2019": "197974"
      },
      {
        "STATE": "39",
        "COUNTY": "157",
        "STNAME": "Ohio",
        "CTYNAME": "Tuscarawas County",
        "POPESTIMATE2019": "91987"
      },
      {
        "STATE": "39",
        "COUNTY": "159",
        "STNAME": "Ohio",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "58988"
      },
      {
        "STATE": "39",
        "COUNTY": "161",
        "STNAME": "Ohio",
        "CTYNAME": "Van Wert County",
        "POPESTIMATE2019": "28275"
      },
      {
        "STATE": "39",
        "COUNTY": "163",
        "STNAME": "Ohio",
        "CTYNAME": "Vinton County",
        "POPESTIMATE2019": "13085"
      },
      {
        "STATE": "39",
        "COUNTY": "165",
        "STNAME": "Ohio",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "234602"
      },
      {
        "STATE": "39",
        "COUNTY": "167",
        "STNAME": "Ohio",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "59911"
      },
      {
        "STATE": "39",
        "COUNTY": "169",
        "STNAME": "Ohio",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "115710"
      },
      {
        "STATE": "39",
        "COUNTY": "171",
        "STNAME": "Ohio",
        "CTYNAME": "Williams County",
        "POPESTIMATE2019": "36692"
      },
      {
        "STATE": "39",
        "COUNTY": "173",
        "STNAME": "Ohio",
        "CTYNAME": "Wood County",
        "POPESTIMATE2019": "130817"
      },
      {
        "STATE": "39",
        "COUNTY": "175",
        "STNAME": "Ohio",
        "CTYNAME": "Wyandot County",
        "POPESTIMATE2019": "21772"
      },
      {
        "STATE": "40",
        "COUNTY": "000",
        "STNAME": "Oklahoma",
        "CTYNAME": "Oklahoma",
        "POPESTIMATE2019": "3956971"
      },
      {
        "STATE": "40",
        "COUNTY": "001",
        "STNAME": "Oklahoma",
        "CTYNAME": "Adair County",
        "POPESTIMATE2019": "22194"
      },
      {
        "STATE": "40",
        "COUNTY": "003",
        "STNAME": "Oklahoma",
        "CTYNAME": "Alfalfa County",
        "POPESTIMATE2019": "5702"
      },
      {
        "STATE": "40",
        "COUNTY": "005",
        "STNAME": "Oklahoma",
        "CTYNAME": "Atoka County",
        "POPESTIMATE2019": "13758"
      },
      {
        "STATE": "40",
        "COUNTY": "007",
        "STNAME": "Oklahoma",
        "CTYNAME": "Beaver County",
        "POPESTIMATE2019": "5311"
      },
      {
        "STATE": "40",
        "COUNTY": "009",
        "STNAME": "Oklahoma",
        "CTYNAME": "Beckham County",
        "POPESTIMATE2019": "21859"
      },
      {
        "STATE": "40",
        "COUNTY": "011",
        "STNAME": "Oklahoma",
        "CTYNAME": "Blaine County",
        "POPESTIMATE2019": "9429"
      },
      {
        "STATE": "40",
        "COUNTY": "013",
        "STNAME": "Oklahoma",
        "CTYNAME": "Bryan County",
        "POPESTIMATE2019": "47995"
      },
      {
        "STATE": "40",
        "COUNTY": "015",
        "STNAME": "Oklahoma",
        "CTYNAME": "Caddo County",
        "POPESTIMATE2019": "28762"
      },
      {
        "STATE": "40",
        "COUNTY": "017",
        "STNAME": "Oklahoma",
        "CTYNAME": "Canadian County",
        "POPESTIMATE2019": "148306"
      },
      {
        "STATE": "40",
        "COUNTY": "019",
        "STNAME": "Oklahoma",
        "CTYNAME": "Carter County",
        "POPESTIMATE2019": "48111"
      },
      {
        "STATE": "40",
        "COUNTY": "021",
        "STNAME": "Oklahoma",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "48657"
      },
      {
        "STATE": "40",
        "COUNTY": "023",
        "STNAME": "Oklahoma",
        "CTYNAME": "Choctaw County",
        "POPESTIMATE2019": "14672"
      },
      {
        "STATE": "40",
        "COUNTY": "025",
        "STNAME": "Oklahoma",
        "CTYNAME": "Cimarron County",
        "POPESTIMATE2019": "2137"
      },
      {
        "STATE": "40",
        "COUNTY": "027",
        "STNAME": "Oklahoma",
        "CTYNAME": "Cleveland County",
        "POPESTIMATE2019": "284014"
      },
      {
        "STATE": "40",
        "COUNTY": "029",
        "STNAME": "Oklahoma",
        "CTYNAME": "Coal County",
        "POPESTIMATE2019": "5495"
      },
      {
        "STATE": "40",
        "COUNTY": "031",
        "STNAME": "Oklahoma",
        "CTYNAME": "Comanche County",
        "POPESTIMATE2019": "120749"
      },
      {
        "STATE": "40",
        "COUNTY": "033",
        "STNAME": "Oklahoma",
        "CTYNAME": "Cotton County",
        "POPESTIMATE2019": "5666"
      },
      {
        "STATE": "40",
        "COUNTY": "035",
        "STNAME": "Oklahoma",
        "CTYNAME": "Craig County",
        "POPESTIMATE2019": "14142"
      },
      {
        "STATE": "40",
        "COUNTY": "037",
        "STNAME": "Oklahoma",
        "CTYNAME": "Creek County",
        "POPESTIMATE2019": "71522"
      },
      {
        "STATE": "40",
        "COUNTY": "039",
        "STNAME": "Oklahoma",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "29003"
      },
      {
        "STATE": "40",
        "COUNTY": "041",
        "STNAME": "Oklahoma",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "43009"
      },
      {
        "STATE": "40",
        "COUNTY": "043",
        "STNAME": "Oklahoma",
        "CTYNAME": "Dewey County",
        "POPESTIMATE2019": "4891"
      },
      {
        "STATE": "40",
        "COUNTY": "045",
        "STNAME": "Oklahoma",
        "CTYNAME": "Ellis County",
        "POPESTIMATE2019": "3859"
      },
      {
        "STATE": "40",
        "COUNTY": "047",
        "STNAME": "Oklahoma",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "61056"
      },
      {
        "STATE": "40",
        "COUNTY": "049",
        "STNAME": "Oklahoma",
        "CTYNAME": "Garvin County",
        "POPESTIMATE2019": "27711"
      },
      {
        "STATE": "40",
        "COUNTY": "051",
        "STNAME": "Oklahoma",
        "CTYNAME": "Grady County",
        "POPESTIMATE2019": "55834"
      },
      {
        "STATE": "40",
        "COUNTY": "053",
        "STNAME": "Oklahoma",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "4333"
      },
      {
        "STATE": "40",
        "COUNTY": "055",
        "STNAME": "Oklahoma",
        "CTYNAME": "Greer County",
        "POPESTIMATE2019": "5712"
      },
      {
        "STATE": "40",
        "COUNTY": "057",
        "STNAME": "Oklahoma",
        "CTYNAME": "Harmon County",
        "POPESTIMATE2019": "2653"
      },
      {
        "STATE": "40",
        "COUNTY": "059",
        "STNAME": "Oklahoma",
        "CTYNAME": "Harper County",
        "POPESTIMATE2019": "3688"
      },
      {
        "STATE": "40",
        "COUNTY": "061",
        "STNAME": "Oklahoma",
        "CTYNAME": "Haskell County",
        "POPESTIMATE2019": "12627"
      },
      {
        "STATE": "40",
        "COUNTY": "063",
        "STNAME": "Oklahoma",
        "CTYNAME": "Hughes County",
        "POPESTIMATE2019": "13279"
      },
      {
        "STATE": "40",
        "COUNTY": "065",
        "STNAME": "Oklahoma",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "24530"
      },
      {
        "STATE": "40",
        "COUNTY": "067",
        "STNAME": "Oklahoma",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "6002"
      },
      {
        "STATE": "40",
        "COUNTY": "069",
        "STNAME": "Oklahoma",
        "CTYNAME": "Johnston County",
        "POPESTIMATE2019": "11085"
      },
      {
        "STATE": "40",
        "COUNTY": "071",
        "STNAME": "Oklahoma",
        "CTYNAME": "Kay County",
        "POPESTIMATE2019": "43538"
      },
      {
        "STATE": "40",
        "COUNTY": "073",
        "STNAME": "Oklahoma",
        "CTYNAME": "Kingfisher County",
        "POPESTIMATE2019": "15765"
      },
      {
        "STATE": "40",
        "COUNTY": "075",
        "STNAME": "Oklahoma",
        "CTYNAME": "Kiowa County",
        "POPESTIMATE2019": "8708"
      },
      {
        "STATE": "40",
        "COUNTY": "077",
        "STNAME": "Oklahoma",
        "CTYNAME": "Latimer County",
        "POPESTIMATE2019": "10073"
      },
      {
        "STATE": "40",
        "COUNTY": "079",
        "STNAME": "Oklahoma",
        "CTYNAME": "Le Flore County",
        "POPESTIMATE2019": "49853"
      },
      {
        "STATE": "40",
        "COUNTY": "081",
        "STNAME": "Oklahoma",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "34877"
      },
      {
        "STATE": "40",
        "COUNTY": "083",
        "STNAME": "Oklahoma",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "48011"
      },
      {
        "STATE": "40",
        "COUNTY": "085",
        "STNAME": "Oklahoma",
        "CTYNAME": "Love County",
        "POPESTIMATE2019": "10253"
      },
      {
        "STATE": "40",
        "COUNTY": "087",
        "STNAME": "Oklahoma",
        "CTYNAME": "McClain County",
        "POPESTIMATE2019": "40474"
      },
      {
        "STATE": "40",
        "COUNTY": "089",
        "STNAME": "Oklahoma",
        "CTYNAME": "McCurtain County",
        "POPESTIMATE2019": "32832"
      },
      {
        "STATE": "40",
        "COUNTY": "091",
        "STNAME": "Oklahoma",
        "CTYNAME": "McIntosh County",
        "POPESTIMATE2019": "19596"
      },
      {
        "STATE": "40",
        "COUNTY": "093",
        "STNAME": "Oklahoma",
        "CTYNAME": "Major County",
        "POPESTIMATE2019": "7629"
      },
      {
        "STATE": "40",
        "COUNTY": "095",
        "STNAME": "Oklahoma",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "16931"
      },
      {
        "STATE": "40",
        "COUNTY": "097",
        "STNAME": "Oklahoma",
        "CTYNAME": "Mayes County",
        "POPESTIMATE2019": "41100"
      },
      {
        "STATE": "40",
        "COUNTY": "099",
        "STNAME": "Oklahoma",
        "CTYNAME": "Murray County",
        "POPESTIMATE2019": "14073"
      },
      {
        "STATE": "40",
        "COUNTY": "101",
        "STNAME": "Oklahoma",
        "CTYNAME": "Muskogee County",
        "POPESTIMATE2019": "67997"
      },
      {
        "STATE": "40",
        "COUNTY": "103",
        "STNAME": "Oklahoma",
        "CTYNAME": "Noble County",
        "POPESTIMATE2019": "11131"
      },
      {
        "STATE": "40",
        "COUNTY": "105",
        "STNAME": "Oklahoma",
        "CTYNAME": "Nowata County",
        "POPESTIMATE2019": "10076"
      },
      {
        "STATE": "40",
        "COUNTY": "107",
        "STNAME": "Oklahoma",
        "CTYNAME": "Okfuskee County",
        "POPESTIMATE2019": "11993"
      },
      {
        "STATE": "40",
        "COUNTY": "109",
        "STNAME": "Oklahoma",
        "CTYNAME": "Oklahoma County",
        "POPESTIMATE2019": "797434"
      },
      {
        "STATE": "40",
        "COUNTY": "111",
        "STNAME": "Oklahoma",
        "CTYNAME": "Okmulgee County",
        "POPESTIMATE2019": "38465"
      },
      {
        "STATE": "40",
        "COUNTY": "113",
        "STNAME": "Oklahoma",
        "CTYNAME": "Osage County",
        "POPESTIMATE2019": "46963"
      },
      {
        "STATE": "40",
        "COUNTY": "115",
        "STNAME": "Oklahoma",
        "CTYNAME": "Ottawa County",
        "POPESTIMATE2019": "31127"
      },
      {
        "STATE": "40",
        "COUNTY": "117",
        "STNAME": "Oklahoma",
        "CTYNAME": "Pawnee County",
        "POPESTIMATE2019": "16376"
      },
      {
        "STATE": "40",
        "COUNTY": "119",
        "STNAME": "Oklahoma",
        "CTYNAME": "Payne County",
        "POPESTIMATE2019": "81784"
      },
      {
        "STATE": "40",
        "COUNTY": "121",
        "STNAME": "Oklahoma",
        "CTYNAME": "Pittsburg County",
        "POPESTIMATE2019": "43654"
      },
      {
        "STATE": "40",
        "COUNTY": "123",
        "STNAME": "Oklahoma",
        "CTYNAME": "Pontotoc County",
        "POPESTIMATE2019": "38284"
      },
      {
        "STATE": "40",
        "COUNTY": "125",
        "STNAME": "Oklahoma",
        "CTYNAME": "Pottawatomie County",
        "POPESTIMATE2019": "72592"
      },
      {
        "STATE": "40",
        "COUNTY": "127",
        "STNAME": "Oklahoma",
        "CTYNAME": "Pushmataha County",
        "POPESTIMATE2019": "11096"
      },
      {
        "STATE": "40",
        "COUNTY": "129",
        "STNAME": "Oklahoma",
        "CTYNAME": "Roger Mills County",
        "POPESTIMATE2019": "3583"
      },
      {
        "STATE": "40",
        "COUNTY": "131",
        "STNAME": "Oklahoma",
        "CTYNAME": "Rogers County",
        "POPESTIMATE2019": "92459"
      },
      {
        "STATE": "40",
        "COUNTY": "133",
        "STNAME": "Oklahoma",
        "CTYNAME": "Seminole County",
        "POPESTIMATE2019": "24258"
      },
      {
        "STATE": "40",
        "COUNTY": "135",
        "STNAME": "Oklahoma",
        "CTYNAME": "Sequoyah County",
        "POPESTIMATE2019": "41569"
      },
      {
        "STATE": "40",
        "COUNTY": "137",
        "STNAME": "Oklahoma",
        "CTYNAME": "Stephens County",
        "POPESTIMATE2019": "43143"
      },
      {
        "STATE": "40",
        "COUNTY": "139",
        "STNAME": "Oklahoma",
        "CTYNAME": "Texas County",
        "POPESTIMATE2019": "19983"
      },
      {
        "STATE": "40",
        "COUNTY": "141",
        "STNAME": "Oklahoma",
        "CTYNAME": "Tillman County",
        "POPESTIMATE2019": "7250"
      },
      {
        "STATE": "40",
        "COUNTY": "143",
        "STNAME": "Oklahoma",
        "CTYNAME": "Tulsa County",
        "POPESTIMATE2019": "651552"
      },
      {
        "STATE": "40",
        "COUNTY": "145",
        "STNAME": "Oklahoma",
        "CTYNAME": "Wagoner County",
        "POPESTIMATE2019": "81289"
      },
      {
        "STATE": "40",
        "COUNTY": "147",
        "STNAME": "Oklahoma",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "51527"
      },
      {
        "STATE": "40",
        "COUNTY": "149",
        "STNAME": "Oklahoma",
        "CTYNAME": "Washita County",
        "POPESTIMATE2019": "10916"
      },
      {
        "STATE": "40",
        "COUNTY": "151",
        "STNAME": "Oklahoma",
        "CTYNAME": "Woods County",
        "POPESTIMATE2019": "8793"
      },
      {
        "STATE": "40",
        "COUNTY": "153",
        "STNAME": "Oklahoma",
        "CTYNAME": "Woodward County",
        "POPESTIMATE2019": "20211"
      },
      {
        "STATE": "41",
        "COUNTY": "000",
        "STNAME": "Oregon",
        "CTYNAME": "Oregon",
        "POPESTIMATE2019": "4217737"
      },
      {
        "STATE": "41",
        "COUNTY": "001",
        "STNAME": "Oregon",
        "CTYNAME": "Baker County",
        "POPESTIMATE2019": "16124"
      },
      {
        "STATE": "41",
        "COUNTY": "003",
        "STNAME": "Oregon",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "93053"
      },
      {
        "STATE": "41",
        "COUNTY": "005",
        "STNAME": "Oregon",
        "CTYNAME": "Clackamas County",
        "POPESTIMATE2019": "418187"
      },
      {
        "STATE": "41",
        "COUNTY": "007",
        "STNAME": "Oregon",
        "CTYNAME": "Clatsop County",
        "POPESTIMATE2019": "40224"
      },
      {
        "STATE": "41",
        "COUNTY": "009",
        "STNAME": "Oregon",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "52354"
      },
      {
        "STATE": "41",
        "COUNTY": "011",
        "STNAME": "Oregon",
        "CTYNAME": "Coos County",
        "POPESTIMATE2019": "64487"
      },
      {
        "STATE": "41",
        "COUNTY": "013",
        "STNAME": "Oregon",
        "CTYNAME": "Crook County",
        "POPESTIMATE2019": "24404"
      },
      {
        "STATE": "41",
        "COUNTY": "015",
        "STNAME": "Oregon",
        "CTYNAME": "Curry County",
        "POPESTIMATE2019": "22925"
      },
      {
        "STATE": "41",
        "COUNTY": "017",
        "STNAME": "Oregon",
        "CTYNAME": "Deschutes County",
        "POPESTIMATE2019": "197692"
      },
      {
        "STATE": "41",
        "COUNTY": "019",
        "STNAME": "Oregon",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "110980"
      },
      {
        "STATE": "41",
        "COUNTY": "021",
        "STNAME": "Oregon",
        "CTYNAME": "Gilliam County",
        "POPESTIMATE2019": "1912"
      },
      {
        "STATE": "41",
        "COUNTY": "023",
        "STNAME": "Oregon",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "7199"
      },
      {
        "STATE": "41",
        "COUNTY": "025",
        "STNAME": "Oregon",
        "CTYNAME": "Harney County",
        "POPESTIMATE2019": "7393"
      },
      {
        "STATE": "41",
        "COUNTY": "027",
        "STNAME": "Oregon",
        "CTYNAME": "Hood River County",
        "POPESTIMATE2019": "23382"
      },
      {
        "STATE": "41",
        "COUNTY": "029",
        "STNAME": "Oregon",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "220944"
      },
      {
        "STATE": "41",
        "COUNTY": "031",
        "STNAME": "Oregon",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "24658"
      },
      {
        "STATE": "41",
        "COUNTY": "033",
        "STNAME": "Oregon",
        "CTYNAME": "Josephine County",
        "POPESTIMATE2019": "87487"
      },
      {
        "STATE": "41",
        "COUNTY": "035",
        "STNAME": "Oregon",
        "CTYNAME": "Klamath County",
        "POPESTIMATE2019": "68238"
      },
      {
        "STATE": "41",
        "COUNTY": "037",
        "STNAME": "Oregon",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "7869"
      },
      {
        "STATE": "41",
        "COUNTY": "039",
        "STNAME": "Oregon",
        "CTYNAME": "Lane County",
        "POPESTIMATE2019": "382067"
      },
      {
        "STATE": "41",
        "COUNTY": "041",
        "STNAME": "Oregon",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "49962"
      },
      {
        "STATE": "41",
        "COUNTY": "043",
        "STNAME": "Oregon",
        "CTYNAME": "Linn County",
        "POPESTIMATE2019": "129749"
      },
      {
        "STATE": "41",
        "COUNTY": "045",
        "STNAME": "Oregon",
        "CTYNAME": "Malheur County",
        "POPESTIMATE2019": "30571"
      },
      {
        "STATE": "41",
        "COUNTY": "047",
        "STNAME": "Oregon",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "347818"
      },
      {
        "STATE": "41",
        "COUNTY": "049",
        "STNAME": "Oregon",
        "CTYNAME": "Morrow County",
        "POPESTIMATE2019": "11603"
      },
      {
        "STATE": "41",
        "COUNTY": "051",
        "STNAME": "Oregon",
        "CTYNAME": "Multnomah County",
        "POPESTIMATE2019": "812855"
      },
      {
        "STATE": "41",
        "COUNTY": "053",
        "STNAME": "Oregon",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "86085"
      },
      {
        "STATE": "41",
        "COUNTY": "055",
        "STNAME": "Oregon",
        "CTYNAME": "Sherman County",
        "POPESTIMATE2019": "1780"
      },
      {
        "STATE": "41",
        "COUNTY": "057",
        "STNAME": "Oregon",
        "CTYNAME": "Tillamook County",
        "POPESTIMATE2019": "27036"
      },
      {
        "STATE": "41",
        "COUNTY": "059",
        "STNAME": "Oregon",
        "CTYNAME": "Umatilla County",
        "POPESTIMATE2019": "77950"
      },
      {
        "STATE": "41",
        "COUNTY": "061",
        "STNAME": "Oregon",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "26835"
      },
      {
        "STATE": "41",
        "COUNTY": "063",
        "STNAME": "Oregon",
        "CTYNAME": "Wallowa County",
        "POPESTIMATE2019": "7208"
      },
      {
        "STATE": "41",
        "COUNTY": "065",
        "STNAME": "Oregon",
        "CTYNAME": "Wasco County",
        "POPESTIMATE2019": "26682"
      },
      {
        "STATE": "41",
        "COUNTY": "067",
        "STNAME": "Oregon",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "601592"
      },
      {
        "STATE": "41",
        "COUNTY": "069",
        "STNAME": "Oregon",
        "CTYNAME": "Wheeler County",
        "POPESTIMATE2019": "1332"
      },
      {
        "STATE": "41",
        "COUNTY": "071",
        "STNAME": "Oregon",
        "CTYNAME": "Yamhill County",
        "POPESTIMATE2019": "107100"
      },
      {
        "STATE": "42",
        "COUNTY": "000",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Pennsylvania",
        "POPESTIMATE2019": "12801989"
      },
      {
        "STATE": "42",
        "COUNTY": "001",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "103009"
      },
      {
        "STATE": "42",
        "COUNTY": "003",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Allegheny County",
        "POPESTIMATE2019": "1216045"
      },
      {
        "STATE": "42",
        "COUNTY": "005",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Armstrong County",
        "POPESTIMATE2019": "64735"
      },
      {
        "STATE": "42",
        "COUNTY": "007",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Beaver County",
        "POPESTIMATE2019": "163929"
      },
      {
        "STATE": "42",
        "COUNTY": "009",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Bedford County",
        "POPESTIMATE2019": "47888"
      },
      {
        "STATE": "42",
        "COUNTY": "011",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Berks County",
        "POPESTIMATE2019": "421164"
      },
      {
        "STATE": "42",
        "COUNTY": "013",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Blair County",
        "POPESTIMATE2019": "121829"
      },
      {
        "STATE": "42",
        "COUNTY": "015",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Bradford County",
        "POPESTIMATE2019": "60323"
      },
      {
        "STATE": "42",
        "COUNTY": "017",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Bucks County",
        "POPESTIMATE2019": "628270"
      },
      {
        "STATE": "42",
        "COUNTY": "019",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Butler County",
        "POPESTIMATE2019": "187853"
      },
      {
        "STATE": "42",
        "COUNTY": "021",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Cambria County",
        "POPESTIMATE2019": "130192"
      },
      {
        "STATE": "42",
        "COUNTY": "023",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Cameron County",
        "POPESTIMATE2019": "4447"
      },
      {
        "STATE": "42",
        "COUNTY": "025",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Carbon County",
        "POPESTIMATE2019": "64182"
      },
      {
        "STATE": "42",
        "COUNTY": "027",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Centre County",
        "POPESTIMATE2019": "162385"
      },
      {
        "STATE": "42",
        "COUNTY": "029",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Chester County",
        "POPESTIMATE2019": "524989"
      },
      {
        "STATE": "42",
        "COUNTY": "031",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Clarion County",
        "POPESTIMATE2019": "38438"
      },
      {
        "STATE": "42",
        "COUNTY": "033",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Clearfield County",
        "POPESTIMATE2019": "79255"
      },
      {
        "STATE": "42",
        "COUNTY": "035",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Clinton County",
        "POPESTIMATE2019": "38632"
      },
      {
        "STATE": "42",
        "COUNTY": "037",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "64964"
      },
      {
        "STATE": "42",
        "COUNTY": "039",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "84629"
      },
      {
        "STATE": "42",
        "COUNTY": "041",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "253370"
      },
      {
        "STATE": "42",
        "COUNTY": "043",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Dauphin County",
        "POPESTIMATE2019": "278299"
      },
      {
        "STATE": "42",
        "COUNTY": "045",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Delaware County",
        "POPESTIMATE2019": "566747"
      },
      {
        "STATE": "42",
        "COUNTY": "047",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Elk County",
        "POPESTIMATE2019": "29910"
      },
      {
        "STATE": "42",
        "COUNTY": "049",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Erie County",
        "POPESTIMATE2019": "269728"
      },
      {
        "STATE": "42",
        "COUNTY": "051",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "129274"
      },
      {
        "STATE": "42",
        "COUNTY": "053",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Forest County",
        "POPESTIMATE2019": "7247"
      },
      {
        "STATE": "42",
        "COUNTY": "055",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "155027"
      },
      {
        "STATE": "42",
        "COUNTY": "057",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Fulton County",
        "POPESTIMATE2019": "14530"
      },
      {
        "STATE": "42",
        "COUNTY": "059",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "36233"
      },
      {
        "STATE": "42",
        "COUNTY": "061",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Huntingdon County",
        "POPESTIMATE2019": "45144"
      },
      {
        "STATE": "42",
        "COUNTY": "063",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Indiana County",
        "POPESTIMATE2019": "84073"
      },
      {
        "STATE": "42",
        "COUNTY": "065",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "43425"
      },
      {
        "STATE": "42",
        "COUNTY": "067",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Juniata County",
        "POPESTIMATE2019": "24763"
      },
      {
        "STATE": "42",
        "COUNTY": "069",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lackawanna County",
        "POPESTIMATE2019": "209674"
      },
      {
        "STATE": "42",
        "COUNTY": "071",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lancaster County",
        "POPESTIMATE2019": "545724"
      },
      {
        "STATE": "42",
        "COUNTY": "073",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "85512"
      },
      {
        "STATE": "42",
        "COUNTY": "075",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lebanon County",
        "POPESTIMATE2019": "141793"
      },
      {
        "STATE": "42",
        "COUNTY": "077",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lehigh County",
        "POPESTIMATE2019": "369318"
      },
      {
        "STATE": "42",
        "COUNTY": "079",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Luzerne County",
        "POPESTIMATE2019": "317417"
      },
      {
        "STATE": "42",
        "COUNTY": "081",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Lycoming County",
        "POPESTIMATE2019": "113299"
      },
      {
        "STATE": "42",
        "COUNTY": "083",
        "STNAME": "Pennsylvania",
        "CTYNAME": "McKean County",
        "POPESTIMATE2019": "40625"
      },
      {
        "STATE": "42",
        "COUNTY": "085",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "109424"
      },
      {
        "STATE": "42",
        "COUNTY": "087",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Mifflin County",
        "POPESTIMATE2019": "46138"
      },
      {
        "STATE": "42",
        "COUNTY": "089",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "170271"
      },
      {
        "STATE": "42",
        "COUNTY": "091",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "830915"
      },
      {
        "STATE": "42",
        "COUNTY": "093",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Montour County",
        "POPESTIMATE2019": "18230"
      },
      {
        "STATE": "42",
        "COUNTY": "095",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Northampton County",
        "POPESTIMATE2019": "305285"
      },
      {
        "STATE": "42",
        "COUNTY": "097",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Northumberland County",
        "POPESTIMATE2019": "90843"
      },
      {
        "STATE": "42",
        "COUNTY": "099",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "46272"
      },
      {
        "STATE": "42",
        "COUNTY": "101",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Philadelphia County",
        "POPESTIMATE2019": "1584064"
      },
      {
        "STATE": "42",
        "COUNTY": "103",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Pike County",
        "POPESTIMATE2019": "55809"
      },
      {
        "STATE": "42",
        "COUNTY": "105",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Potter County",
        "POPESTIMATE2019": "16526"
      },
      {
        "STATE": "42",
        "COUNTY": "107",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Schuylkill County",
        "POPESTIMATE2019": "141359"
      },
      {
        "STATE": "42",
        "COUNTY": "109",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Snyder County",
        "POPESTIMATE2019": "40372"
      },
      {
        "STATE": "42",
        "COUNTY": "111",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Somerset County",
        "POPESTIMATE2019": "73447"
      },
      {
        "STATE": "42",
        "COUNTY": "113",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "6066"
      },
      {
        "STATE": "42",
        "COUNTY": "115",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Susquehanna County",
        "POPESTIMATE2019": "40328"
      },
      {
        "STATE": "42",
        "COUNTY": "117",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Tioga County",
        "POPESTIMATE2019": "40591"
      },
      {
        "STATE": "42",
        "COUNTY": "119",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "44923"
      },
      {
        "STATE": "42",
        "COUNTY": "121",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Venango County",
        "POPESTIMATE2019": "50668"
      },
      {
        "STATE": "42",
        "COUNTY": "123",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "39191"
      },
      {
        "STATE": "42",
        "COUNTY": "125",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "206865"
      },
      {
        "STATE": "42",
        "COUNTY": "127",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "51361"
      },
      {
        "STATE": "42",
        "COUNTY": "129",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Westmoreland County",
        "POPESTIMATE2019": "348899"
      },
      {
        "STATE": "42",
        "COUNTY": "131",
        "STNAME": "Pennsylvania",
        "CTYNAME": "Wyoming County",
        "POPESTIMATE2019": "26794"
      },
      {
        "STATE": "42",
        "COUNTY": "133",
        "STNAME": "Pennsylvania",
        "CTYNAME": "York County",
        "POPESTIMATE2019": "449058"
      },
      {
        "STATE": "44",
        "COUNTY": "000",
        "STNAME": "Rhode Island",
        "CTYNAME": "Rhode Island",
        "POPESTIMATE2019": "1059361"
      },
      {
        "STATE": "44",
        "COUNTY": "001",
        "STNAME": "Rhode Island",
        "CTYNAME": "Bristol County",
        "POPESTIMATE2019": "48479"
      },
      {
        "STATE": "44",
        "COUNTY": "003",
        "STNAME": "Rhode Island",
        "CTYNAME": "Kent County",
        "POPESTIMATE2019": "164292"
      },
      {
        "STATE": "44",
        "COUNTY": "005",
        "STNAME": "Rhode Island",
        "CTYNAME": "Newport County",
        "POPESTIMATE2019": "82082"
      },
      {
        "STATE": "44",
        "COUNTY": "007",
        "STNAME": "Rhode Island",
        "CTYNAME": "Providence County",
        "POPESTIMATE2019": "638931"
      },
      {
        "STATE": "44",
        "COUNTY": "009",
        "STNAME": "Rhode Island",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "125577"
      },
      {
        "STATE": "45",
        "COUNTY": "000",
        "STNAME": "South Carolina",
        "CTYNAME": "South Carolina",
        "POPESTIMATE2019": "5148714"
      },
      {
        "STATE": "45",
        "COUNTY": "001",
        "STNAME": "South Carolina",
        "CTYNAME": "Abbeville County",
        "POPESTIMATE2019": "24527"
      },
      {
        "STATE": "45",
        "COUNTY": "003",
        "STNAME": "South Carolina",
        "CTYNAME": "Aiken County",
        "POPESTIMATE2019": "170872"
      },
      {
        "STATE": "45",
        "COUNTY": "005",
        "STNAME": "South Carolina",
        "CTYNAME": "Allendale County",
        "POPESTIMATE2019": "8688"
      },
      {
        "STATE": "45",
        "COUNTY": "007",
        "STNAME": "South Carolina",
        "CTYNAME": "Anderson County",
        "POPESTIMATE2019": "202558"
      },
      {
        "STATE": "45",
        "COUNTY": "009",
        "STNAME": "South Carolina",
        "CTYNAME": "Bamberg County",
        "POPESTIMATE2019": "14066"
      },
      {
        "STATE": "45",
        "COUNTY": "011",
        "STNAME": "South Carolina",
        "CTYNAME": "Barnwell County",
        "POPESTIMATE2019": "20866"
      },
      {
        "STATE": "45",
        "COUNTY": "013",
        "STNAME": "South Carolina",
        "CTYNAME": "Beaufort County",
        "POPESTIMATE2019": "192122"
      },
      {
        "STATE": "45",
        "COUNTY": "015",
        "STNAME": "South Carolina",
        "CTYNAME": "Berkeley County",
        "POPESTIMATE2019": "227907"
      },
      {
        "STATE": "45",
        "COUNTY": "017",
        "STNAME": "South Carolina",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "14553"
      },
      {
        "STATE": "45",
        "COUNTY": "019",
        "STNAME": "South Carolina",
        "CTYNAME": "Charleston County",
        "POPESTIMATE2019": "411406"
      },
      {
        "STATE": "45",
        "COUNTY": "021",
        "STNAME": "South Carolina",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "57300"
      },
      {
        "STATE": "45",
        "COUNTY": "023",
        "STNAME": "South Carolina",
        "CTYNAME": "Chester County",
        "POPESTIMATE2019": "32244"
      },
      {
        "STATE": "45",
        "COUNTY": "025",
        "STNAME": "South Carolina",
        "CTYNAME": "Chesterfield County",
        "POPESTIMATE2019": "45650"
      },
      {
        "STATE": "45",
        "COUNTY": "027",
        "STNAME": "South Carolina",
        "CTYNAME": "Clarendon County",
        "POPESTIMATE2019": "33745"
      },
      {
        "STATE": "45",
        "COUNTY": "029",
        "STNAME": "South Carolina",
        "CTYNAME": "Colleton County",
        "POPESTIMATE2019": "37677"
      },
      {
        "STATE": "45",
        "COUNTY": "031",
        "STNAME": "South Carolina",
        "CTYNAME": "Darlington County",
        "POPESTIMATE2019": "66618"
      },
      {
        "STATE": "45",
        "COUNTY": "033",
        "STNAME": "South Carolina",
        "CTYNAME": "Dillon County",
        "POPESTIMATE2019": "30479"
      },
      {
        "STATE": "45",
        "COUNTY": "035",
        "STNAME": "South Carolina",
        "CTYNAME": "Dorchester County",
        "POPESTIMATE2019": "162809"
      },
      {
        "STATE": "45",
        "COUNTY": "037",
        "STNAME": "South Carolina",
        "CTYNAME": "Edgefield County",
        "POPESTIMATE2019": "27260"
      },
      {
        "STATE": "45",
        "COUNTY": "039",
        "STNAME": "South Carolina",
        "CTYNAME": "Fairfield County",
        "POPESTIMATE2019": "22347"
      },
      {
        "STATE": "45",
        "COUNTY": "041",
        "STNAME": "South Carolina",
        "CTYNAME": "Florence County",
        "POPESTIMATE2019": "138293"
      },
      {
        "STATE": "45",
        "COUNTY": "043",
        "STNAME": "South Carolina",
        "CTYNAME": "Georgetown County",
        "POPESTIMATE2019": "62680"
      },
      {
        "STATE": "45",
        "COUNTY": "045",
        "STNAME": "South Carolina",
        "CTYNAME": "Greenville County",
        "POPESTIMATE2019": "523542"
      },
      {
        "STATE": "45",
        "COUNTY": "047",
        "STNAME": "South Carolina",
        "CTYNAME": "Greenwood County",
        "POPESTIMATE2019": "70811"
      },
      {
        "STATE": "45",
        "COUNTY": "049",
        "STNAME": "South Carolina",
        "CTYNAME": "Hampton County",
        "POPESTIMATE2019": "19222"
      },
      {
        "STATE": "45",
        "COUNTY": "051",
        "STNAME": "South Carolina",
        "CTYNAME": "Horry County",
        "POPESTIMATE2019": "354081"
      },
      {
        "STATE": "45",
        "COUNTY": "053",
        "STNAME": "South Carolina",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "30073"
      },
      {
        "STATE": "45",
        "COUNTY": "055",
        "STNAME": "South Carolina",
        "CTYNAME": "Kershaw County",
        "POPESTIMATE2019": "66551"
      },
      {
        "STATE": "45",
        "COUNTY": "057",
        "STNAME": "South Carolina",
        "CTYNAME": "Lancaster County",
        "POPESTIMATE2019": "98012"
      },
      {
        "STATE": "45",
        "COUNTY": "059",
        "STNAME": "South Carolina",
        "CTYNAME": "Laurens County",
        "POPESTIMATE2019": "67493"
      },
      {
        "STATE": "45",
        "COUNTY": "061",
        "STNAME": "South Carolina",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "16828"
      },
      {
        "STATE": "45",
        "COUNTY": "063",
        "STNAME": "South Carolina",
        "CTYNAME": "Lexington County",
        "POPESTIMATE2019": "298750"
      },
      {
        "STATE": "45",
        "COUNTY": "065",
        "STNAME": "South Carolina",
        "CTYNAME": "McCormick County",
        "POPESTIMATE2019": "9463"
      },
      {
        "STATE": "45",
        "COUNTY": "067",
        "STNAME": "South Carolina",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "30657"
      },
      {
        "STATE": "45",
        "COUNTY": "069",
        "STNAME": "South Carolina",
        "CTYNAME": "Marlboro County",
        "POPESTIMATE2019": "26118"
      },
      {
        "STATE": "45",
        "COUNTY": "071",
        "STNAME": "South Carolina",
        "CTYNAME": "Newberry County",
        "POPESTIMATE2019": "38440"
      },
      {
        "STATE": "45",
        "COUNTY": "073",
        "STNAME": "South Carolina",
        "CTYNAME": "Oconee County",
        "POPESTIMATE2019": "79546"
      },
      {
        "STATE": "45",
        "COUNTY": "075",
        "STNAME": "South Carolina",
        "CTYNAME": "Orangeburg County",
        "POPESTIMATE2019": "86175"
      },
      {
        "STATE": "45",
        "COUNTY": "077",
        "STNAME": "South Carolina",
        "CTYNAME": "Pickens County",
        "POPESTIMATE2019": "126884"
      },
      {
        "STATE": "45",
        "COUNTY": "079",
        "STNAME": "South Carolina",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "415759"
      },
      {
        "STATE": "45",
        "COUNTY": "081",
        "STNAME": "South Carolina",
        "CTYNAME": "Saluda County",
        "POPESTIMATE2019": "20473"
      },
      {
        "STATE": "45",
        "COUNTY": "083",
        "STNAME": "South Carolina",
        "CTYNAME": "Spartanburg County",
        "POPESTIMATE2019": "319785"
      },
      {
        "STATE": "45",
        "COUNTY": "085",
        "STNAME": "South Carolina",
        "CTYNAME": "Sumter County",
        "POPESTIMATE2019": "106721"
      },
      {
        "STATE": "45",
        "COUNTY": "087",
        "STNAME": "South Carolina",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "27316"
      },
      {
        "STATE": "45",
        "COUNTY": "089",
        "STNAME": "South Carolina",
        "CTYNAME": "Williamsburg County",
        "POPESTIMATE2019": "30368"
      },
      {
        "STATE": "45",
        "COUNTY": "091",
        "STNAME": "South Carolina",
        "CTYNAME": "York County",
        "POPESTIMATE2019": "280979"
      },
      {
        "STATE": "46",
        "COUNTY": "000",
        "STNAME": "South Dakota",
        "CTYNAME": "South Dakota",
        "POPESTIMATE2019": "884659"
      },
      {
        "STATE": "46",
        "COUNTY": "003",
        "STNAME": "South Dakota",
        "CTYNAME": "Aurora County",
        "POPESTIMATE2019": "2751"
      },
      {
        "STATE": "46",
        "COUNTY": "005",
        "STNAME": "South Dakota",
        "CTYNAME": "Beadle County",
        "POPESTIMATE2019": "18453"
      },
      {
        "STATE": "46",
        "COUNTY": "007",
        "STNAME": "South Dakota",
        "CTYNAME": "Bennett County",
        "POPESTIMATE2019": "3365"
      },
      {
        "STATE": "46",
        "COUNTY": "009",
        "STNAME": "South Dakota",
        "CTYNAME": "Bon Homme County",
        "POPESTIMATE2019": "6901"
      },
      {
        "STATE": "46",
        "COUNTY": "011",
        "STNAME": "South Dakota",
        "CTYNAME": "Brookings County",
        "POPESTIMATE2019": "35077"
      },
      {
        "STATE": "46",
        "COUNTY": "013",
        "STNAME": "South Dakota",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "38839"
      },
      {
        "STATE": "46",
        "COUNTY": "015",
        "STNAME": "South Dakota",
        "CTYNAME": "Brule County",
        "POPESTIMATE2019": "5297"
      },
      {
        "STATE": "46",
        "COUNTY": "017",
        "STNAME": "South Dakota",
        "CTYNAME": "Buffalo County",
        "POPESTIMATE2019": "1962"
      },
      {
        "STATE": "46",
        "COUNTY": "019",
        "STNAME": "South Dakota",
        "CTYNAME": "Butte County",
        "POPESTIMATE2019": "10429"
      },
      {
        "STATE": "46",
        "COUNTY": "021",
        "STNAME": "South Dakota",
        "CTYNAME": "Campbell County",
        "POPESTIMATE2019": "1376"
      },
      {
        "STATE": "46",
        "COUNTY": "023",
        "STNAME": "South Dakota",
        "CTYNAME": "Charles Mix County",
        "POPESTIMATE2019": "9292"
      },
      {
        "STATE": "46",
        "COUNTY": "025",
        "STNAME": "South Dakota",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "3736"
      },
      {
        "STATE": "46",
        "COUNTY": "027",
        "STNAME": "South Dakota",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "14070"
      },
      {
        "STATE": "46",
        "COUNTY": "029",
        "STNAME": "South Dakota",
        "CTYNAME": "Codington County",
        "POPESTIMATE2019": "28009"
      },
      {
        "STATE": "46",
        "COUNTY": "031",
        "STNAME": "South Dakota",
        "CTYNAME": "Corson County",
        "POPESTIMATE2019": "4086"
      },
      {
        "STATE": "46",
        "COUNTY": "033",
        "STNAME": "South Dakota",
        "CTYNAME": "Custer County",
        "POPESTIMATE2019": "8972"
      },
      {
        "STATE": "46",
        "COUNTY": "035",
        "STNAME": "South Dakota",
        "CTYNAME": "Davison County",
        "POPESTIMATE2019": "19775"
      },
      {
        "STATE": "46",
        "COUNTY": "037",
        "STNAME": "South Dakota",
        "CTYNAME": "Day County",
        "POPESTIMATE2019": "5424"
      },
      {
        "STATE": "46",
        "COUNTY": "039",
        "STNAME": "South Dakota",
        "CTYNAME": "Deuel County",
        "POPESTIMATE2019": "4351"
      },
      {
        "STATE": "46",
        "COUNTY": "041",
        "STNAME": "South Dakota",
        "CTYNAME": "Dewey County",
        "POPESTIMATE2019": "5892"
      },
      {
        "STATE": "46",
        "COUNTY": "043",
        "STNAME": "South Dakota",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "2921"
      },
      {
        "STATE": "46",
        "COUNTY": "045",
        "STNAME": "South Dakota",
        "CTYNAME": "Edmunds County",
        "POPESTIMATE2019": "3829"
      },
      {
        "STATE": "46",
        "COUNTY": "047",
        "STNAME": "South Dakota",
        "CTYNAME": "Fall River County",
        "POPESTIMATE2019": "6713"
      },
      {
        "STATE": "46",
        "COUNTY": "049",
        "STNAME": "South Dakota",
        "CTYNAME": "Faulk County",
        "POPESTIMATE2019": "2299"
      },
      {
        "STATE": "46",
        "COUNTY": "051",
        "STNAME": "South Dakota",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "7052"
      },
      {
        "STATE": "46",
        "COUNTY": "053",
        "STNAME": "South Dakota",
        "CTYNAME": "Gregory County",
        "POPESTIMATE2019": "4185"
      },
      {
        "STATE": "46",
        "COUNTY": "055",
        "STNAME": "South Dakota",
        "CTYNAME": "Haakon County",
        "POPESTIMATE2019": "1899"
      },
      {
        "STATE": "46",
        "COUNTY": "057",
        "STNAME": "South Dakota",
        "CTYNAME": "Hamlin County",
        "POPESTIMATE2019": "6164"
      },
      {
        "STATE": "46",
        "COUNTY": "059",
        "STNAME": "South Dakota",
        "CTYNAME": "Hand County",
        "POPESTIMATE2019": "3191"
      },
      {
        "STATE": "46",
        "COUNTY": "061",
        "STNAME": "South Dakota",
        "CTYNAME": "Hanson County",
        "POPESTIMATE2019": "3453"
      },
      {
        "STATE": "46",
        "COUNTY": "063",
        "STNAME": "South Dakota",
        "CTYNAME": "Harding County",
        "POPESTIMATE2019": "1298"
      },
      {
        "STATE": "46",
        "COUNTY": "065",
        "STNAME": "South Dakota",
        "CTYNAME": "Hughes County",
        "POPESTIMATE2019": "17526"
      },
      {
        "STATE": "46",
        "COUNTY": "067",
        "STNAME": "South Dakota",
        "CTYNAME": "Hutchinson County",
        "POPESTIMATE2019": "7291"
      },
      {
        "STATE": "46",
        "COUNTY": "069",
        "STNAME": "South Dakota",
        "CTYNAME": "Hyde County",
        "POPESTIMATE2019": "1301"
      },
      {
        "STATE": "46",
        "COUNTY": "071",
        "STNAME": "South Dakota",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "3344"
      },
      {
        "STATE": "46",
        "COUNTY": "073",
        "STNAME": "South Dakota",
        "CTYNAME": "Jerauld County",
        "POPESTIMATE2019": "2013"
      },
      {
        "STATE": "46",
        "COUNTY": "075",
        "STNAME": "South Dakota",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "903"
      },
      {
        "STATE": "46",
        "COUNTY": "077",
        "STNAME": "South Dakota",
        "CTYNAME": "Kingsbury County",
        "POPESTIMATE2019": "4939"
      },
      {
        "STATE": "46",
        "COUNTY": "079",
        "STNAME": "South Dakota",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "12797"
      },
      {
        "STATE": "46",
        "COUNTY": "081",
        "STNAME": "South Dakota",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "25844"
      },
      {
        "STATE": "46",
        "COUNTY": "083",
        "STNAME": "South Dakota",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "61128"
      },
      {
        "STATE": "46",
        "COUNTY": "085",
        "STNAME": "South Dakota",
        "CTYNAME": "Lyman County",
        "POPESTIMATE2019": "3781"
      },
      {
        "STATE": "46",
        "COUNTY": "087",
        "STNAME": "South Dakota",
        "CTYNAME": "McCook County",
        "POPESTIMATE2019": "5586"
      },
      {
        "STATE": "46",
        "COUNTY": "089",
        "STNAME": "South Dakota",
        "CTYNAME": "McPherson County",
        "POPESTIMATE2019": "2379"
      },
      {
        "STATE": "46",
        "COUNTY": "091",
        "STNAME": "South Dakota",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "4935"
      },
      {
        "STATE": "46",
        "COUNTY": "093",
        "STNAME": "South Dakota",
        "CTYNAME": "Meade County",
        "POPESTIMATE2019": "28332"
      },
      {
        "STATE": "46",
        "COUNTY": "095",
        "STNAME": "South Dakota",
        "CTYNAME": "Mellette County",
        "POPESTIMATE2019": "2061"
      },
      {
        "STATE": "46",
        "COUNTY": "097",
        "STNAME": "South Dakota",
        "CTYNAME": "Miner County",
        "POPESTIMATE2019": "2216"
      },
      {
        "STATE": "46",
        "COUNTY": "099",
        "STNAME": "South Dakota",
        "CTYNAME": "Minnehaha County",
        "POPESTIMATE2019": "193134"
      },
      {
        "STATE": "46",
        "COUNTY": "101",
        "STNAME": "South Dakota",
        "CTYNAME": "Moody County",
        "POPESTIMATE2019": "6576"
      },
      {
        "STATE": "46",
        "COUNTY": "102",
        "STNAME": "South Dakota",
        "CTYNAME": "Oglala Lakota County",
        "POPESTIMATE2019": "14177"
      },
      {
        "STATE": "46",
        "COUNTY": "103",
        "STNAME": "South Dakota",
        "CTYNAME": "Pennington County",
        "POPESTIMATE2019": "113775"
      },
      {
        "STATE": "46",
        "COUNTY": "105",
        "STNAME": "South Dakota",
        "CTYNAME": "Perkins County",
        "POPESTIMATE2019": "2865"
      },
      {
        "STATE": "46",
        "COUNTY": "107",
        "STNAME": "South Dakota",
        "CTYNAME": "Potter County",
        "POPESTIMATE2019": "2153"
      },
      {
        "STATE": "46",
        "COUNTY": "109",
        "STNAME": "South Dakota",
        "CTYNAME": "Roberts County",
        "POPESTIMATE2019": "10394"
      },
      {
        "STATE": "46",
        "COUNTY": "111",
        "STNAME": "South Dakota",
        "CTYNAME": "Sanborn County",
        "POPESTIMATE2019": "2344"
      },
      {
        "STATE": "46",
        "COUNTY": "115",
        "STNAME": "South Dakota",
        "CTYNAME": "Spink County",
        "POPESTIMATE2019": "6376"
      },
      {
        "STATE": "46",
        "COUNTY": "117",
        "STNAME": "South Dakota",
        "CTYNAME": "Stanley County",
        "POPESTIMATE2019": "3098"
      },
      {
        "STATE": "46",
        "COUNTY": "119",
        "STNAME": "South Dakota",
        "CTYNAME": "Sully County",
        "POPESTIMATE2019": "1391"
      },
      {
        "STATE": "46",
        "COUNTY": "121",
        "STNAME": "South Dakota",
        "CTYNAME": "Todd County",
        "POPESTIMATE2019": "10177"
      },
      {
        "STATE": "46",
        "COUNTY": "123",
        "STNAME": "South Dakota",
        "CTYNAME": "Tripp County",
        "POPESTIMATE2019": "5441"
      },
      {
        "STATE": "46",
        "COUNTY": "125",
        "STNAME": "South Dakota",
        "CTYNAME": "Turner County",
        "POPESTIMATE2019": "8384"
      },
      {
        "STATE": "46",
        "COUNTY": "127",
        "STNAME": "South Dakota",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "15932"
      },
      {
        "STATE": "46",
        "COUNTY": "129",
        "STNAME": "South Dakota",
        "CTYNAME": "Walworth County",
        "POPESTIMATE2019": "5435"
      },
      {
        "STATE": "46",
        "COUNTY": "135",
        "STNAME": "South Dakota",
        "CTYNAME": "Yankton County",
        "POPESTIMATE2019": "22814"
      },
      {
        "STATE": "46",
        "COUNTY": "137",
        "STNAME": "South Dakota",
        "CTYNAME": "Ziebach County",
        "POPESTIMATE2019": "2756"
      },
      {
        "STATE": "47",
        "COUNTY": "000",
        "STNAME": "Tennessee",
        "CTYNAME": "Tennessee",
        "POPESTIMATE2019": "6829174"
      },
      {
        "STATE": "47",
        "COUNTY": "001",
        "STNAME": "Tennessee",
        "CTYNAME": "Anderson County",
        "POPESTIMATE2019": "76978"
      },
      {
        "STATE": "47",
        "COUNTY": "003",
        "STNAME": "Tennessee",
        "CTYNAME": "Bedford County",
        "POPESTIMATE2019": "49713"
      },
      {
        "STATE": "47",
        "COUNTY": "005",
        "STNAME": "Tennessee",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "16160"
      },
      {
        "STATE": "47",
        "COUNTY": "007",
        "STNAME": "Tennessee",
        "CTYNAME": "Bledsoe County",
        "POPESTIMATE2019": "15064"
      },
      {
        "STATE": "47",
        "COUNTY": "009",
        "STNAME": "Tennessee",
        "CTYNAME": "Blount County",
        "POPESTIMATE2019": "133088"
      },
      {
        "STATE": "47",
        "COUNTY": "011",
        "STNAME": "Tennessee",
        "CTYNAME": "Bradley County",
        "POPESTIMATE2019": "108110"
      },
      {
        "STATE": "47",
        "COUNTY": "013",
        "STNAME": "Tennessee",
        "CTYNAME": "Campbell County",
        "POPESTIMATE2019": "39842"
      },
      {
        "STATE": "47",
        "COUNTY": "015",
        "STNAME": "Tennessee",
        "CTYNAME": "Cannon County",
        "POPESTIMATE2019": "14678"
      },
      {
        "STATE": "47",
        "COUNTY": "017",
        "STNAME": "Tennessee",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "27767"
      },
      {
        "STATE": "47",
        "COUNTY": "019",
        "STNAME": "Tennessee",
        "CTYNAME": "Carter County",
        "POPESTIMATE2019": "56391"
      },
      {
        "STATE": "47",
        "COUNTY": "021",
        "STNAME": "Tennessee",
        "CTYNAME": "Cheatham County",
        "POPESTIMATE2019": "40667"
      },
      {
        "STATE": "47",
        "COUNTY": "023",
        "STNAME": "Tennessee",
        "CTYNAME": "Chester County",
        "POPESTIMATE2019": "17297"
      },
      {
        "STATE": "47",
        "COUNTY": "025",
        "STNAME": "Tennessee",
        "CTYNAME": "Claiborne County",
        "POPESTIMATE2019": "31959"
      },
      {
        "STATE": "47",
        "COUNTY": "027",
        "STNAME": "Tennessee",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "7615"
      },
      {
        "STATE": "47",
        "COUNTY": "029",
        "STNAME": "Tennessee",
        "CTYNAME": "Cocke County",
        "POPESTIMATE2019": "36004"
      },
      {
        "STATE": "47",
        "COUNTY": "031",
        "STNAME": "Tennessee",
        "CTYNAME": "Coffee County",
        "POPESTIMATE2019": "56520"
      },
      {
        "STATE": "47",
        "COUNTY": "033",
        "STNAME": "Tennessee",
        "CTYNAME": "Crockett County",
        "POPESTIMATE2019": "14230"
      },
      {
        "STATE": "47",
        "COUNTY": "035",
        "STNAME": "Tennessee",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "60520"
      },
      {
        "STATE": "47",
        "COUNTY": "037",
        "STNAME": "Tennessee",
        "CTYNAME": "Davidson County",
        "POPESTIMATE2019": "694144"
      },
      {
        "STATE": "47",
        "COUNTY": "039",
        "STNAME": "Tennessee",
        "CTYNAME": "Decatur County",
        "POPESTIMATE2019": "11663"
      },
      {
        "STATE": "47",
        "COUNTY": "041",
        "STNAME": "Tennessee",
        "CTYNAME": "DeKalb County",
        "POPESTIMATE2019": "20490"
      },
      {
        "STATE": "47",
        "COUNTY": "043",
        "STNAME": "Tennessee",
        "CTYNAME": "Dickson County",
        "POPESTIMATE2019": "53948"
      },
      {
        "STATE": "47",
        "COUNTY": "045",
        "STNAME": "Tennessee",
        "CTYNAME": "Dyer County",
        "POPESTIMATE2019": "37159"
      },
      {
        "STATE": "47",
        "COUNTY": "047",
        "STNAME": "Tennessee",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "41133"
      },
      {
        "STATE": "47",
        "COUNTY": "049",
        "STNAME": "Tennessee",
        "CTYNAME": "Fentress County",
        "POPESTIMATE2019": "18523"
      },
      {
        "STATE": "47",
        "COUNTY": "051",
        "STNAME": "Tennessee",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "42208"
      },
      {
        "STATE": "47",
        "COUNTY": "053",
        "STNAME": "Tennessee",
        "CTYNAME": "Gibson County",
        "POPESTIMATE2019": "49133"
      },
      {
        "STATE": "47",
        "COUNTY": "055",
        "STNAME": "Tennessee",
        "CTYNAME": "Giles County",
        "POPESTIMATE2019": "29464"
      },
      {
        "STATE": "47",
        "COUNTY": "057",
        "STNAME": "Tennessee",
        "CTYNAME": "Grainger County",
        "POPESTIMATE2019": "23320"
      },
      {
        "STATE": "47",
        "COUNTY": "059",
        "STNAME": "Tennessee",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "69069"
      },
      {
        "STATE": "47",
        "COUNTY": "061",
        "STNAME": "Tennessee",
        "CTYNAME": "Grundy County",
        "POPESTIMATE2019": "13427"
      },
      {
        "STATE": "47",
        "COUNTY": "063",
        "STNAME": "Tennessee",
        "CTYNAME": "Hamblen County",
        "POPESTIMATE2019": "64934"
      },
      {
        "STATE": "47",
        "COUNTY": "065",
        "STNAME": "Tennessee",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "367804"
      },
      {
        "STATE": "47",
        "COUNTY": "067",
        "STNAME": "Tennessee",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "6620"
      },
      {
        "STATE": "47",
        "COUNTY": "069",
        "STNAME": "Tennessee",
        "CTYNAME": "Hardeman County",
        "POPESTIMATE2019": "25050"
      },
      {
        "STATE": "47",
        "COUNTY": "071",
        "STNAME": "Tennessee",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "25652"
      },
      {
        "STATE": "47",
        "COUNTY": "073",
        "STNAME": "Tennessee",
        "CTYNAME": "Hawkins County",
        "POPESTIMATE2019": "56786"
      },
      {
        "STATE": "47",
        "COUNTY": "075",
        "STNAME": "Tennessee",
        "CTYNAME": "Haywood County",
        "POPESTIMATE2019": "17304"
      },
      {
        "STATE": "47",
        "COUNTY": "077",
        "STNAME": "Tennessee",
        "CTYNAME": "Henderson County",
        "POPESTIMATE2019": "28117"
      },
      {
        "STATE": "47",
        "COUNTY": "079",
        "STNAME": "Tennessee",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "32345"
      },
      {
        "STATE": "47",
        "COUNTY": "081",
        "STNAME": "Tennessee",
        "CTYNAME": "Hickman County",
        "POPESTIMATE2019": "25178"
      },
      {
        "STATE": "47",
        "COUNTY": "083",
        "STNAME": "Tennessee",
        "CTYNAME": "Houston County",
        "POPESTIMATE2019": "8201"
      },
      {
        "STATE": "47",
        "COUNTY": "085",
        "STNAME": "Tennessee",
        "CTYNAME": "Humphreys County",
        "POPESTIMATE2019": "18582"
      },
      {
        "STATE": "47",
        "COUNTY": "087",
        "STNAME": "Tennessee",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "11786"
      },
      {
        "STATE": "47",
        "COUNTY": "089",
        "STNAME": "Tennessee",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "54495"
      },
      {
        "STATE": "47",
        "COUNTY": "091",
        "STNAME": "Tennessee",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "17788"
      },
      {
        "STATE": "47",
        "COUNTY": "093",
        "STNAME": "Tennessee",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "470313"
      },
      {
        "STATE": "47",
        "COUNTY": "095",
        "STNAME": "Tennessee",
        "CTYNAME": "Lake County",
        "POPESTIMATE2019": "7016"
      },
      {
        "STATE": "47",
        "COUNTY": "097",
        "STNAME": "Tennessee",
        "CTYNAME": "Lauderdale County",
        "POPESTIMATE2019": "25633"
      },
      {
        "STATE": "47",
        "COUNTY": "099",
        "STNAME": "Tennessee",
        "CTYNAME": "Lawrence County",
        "POPESTIMATE2019": "44142"
      },
      {
        "STATE": "47",
        "COUNTY": "101",
        "STNAME": "Tennessee",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "12268"
      },
      {
        "STATE": "47",
        "COUNTY": "103",
        "STNAME": "Tennessee",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "34366"
      },
      {
        "STATE": "47",
        "COUNTY": "105",
        "STNAME": "Tennessee",
        "CTYNAME": "Loudon County",
        "POPESTIMATE2019": "54068"
      },
      {
        "STATE": "47",
        "COUNTY": "107",
        "STNAME": "Tennessee",
        "CTYNAME": "McMinn County",
        "POPESTIMATE2019": "53794"
      },
      {
        "STATE": "47",
        "COUNTY": "109",
        "STNAME": "Tennessee",
        "CTYNAME": "McNairy County",
        "POPESTIMATE2019": "25694"
      },
      {
        "STATE": "47",
        "COUNTY": "111",
        "STNAME": "Tennessee",
        "CTYNAME": "Macon County",
        "POPESTIMATE2019": "24602"
      },
      {
        "STATE": "47",
        "COUNTY": "113",
        "STNAME": "Tennessee",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "97984"
      },
      {
        "STATE": "47",
        "COUNTY": "115",
        "STNAME": "Tennessee",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "28907"
      },
      {
        "STATE": "47",
        "COUNTY": "117",
        "STNAME": "Tennessee",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "34375"
      },
      {
        "STATE": "47",
        "COUNTY": "119",
        "STNAME": "Tennessee",
        "CTYNAME": "Maury County",
        "POPESTIMATE2019": "96387"
      },
      {
        "STATE": "47",
        "COUNTY": "121",
        "STNAME": "Tennessee",
        "CTYNAME": "Meigs County",
        "POPESTIMATE2019": "12422"
      },
      {
        "STATE": "47",
        "COUNTY": "123",
        "STNAME": "Tennessee",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "46545"
      },
      {
        "STATE": "47",
        "COUNTY": "125",
        "STNAME": "Tennessee",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "208993"
      },
      {
        "STATE": "47",
        "COUNTY": "127",
        "STNAME": "Tennessee",
        "CTYNAME": "Moore County",
        "POPESTIMATE2019": "6488"
      },
      {
        "STATE": "47",
        "COUNTY": "129",
        "STNAME": "Tennessee",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "21403"
      },
      {
        "STATE": "47",
        "COUNTY": "131",
        "STNAME": "Tennessee",
        "CTYNAME": "Obion County",
        "POPESTIMATE2019": "30069"
      },
      {
        "STATE": "47",
        "COUNTY": "133",
        "STNAME": "Tennessee",
        "CTYNAME": "Overton County",
        "POPESTIMATE2019": "22241"
      },
      {
        "STATE": "47",
        "COUNTY": "135",
        "STNAME": "Tennessee",
        "CTYNAME": "Perry County",
        "POPESTIMATE2019": "8076"
      },
      {
        "STATE": "47",
        "COUNTY": "137",
        "STNAME": "Tennessee",
        "CTYNAME": "Pickett County",
        "POPESTIMATE2019": "5048"
      },
      {
        "STATE": "47",
        "COUNTY": "139",
        "STNAME": "Tennessee",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "16832"
      },
      {
        "STATE": "47",
        "COUNTY": "141",
        "STNAME": "Tennessee",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "80245"
      },
      {
        "STATE": "47",
        "COUNTY": "143",
        "STNAME": "Tennessee",
        "CTYNAME": "Rhea County",
        "POPESTIMATE2019": "33167"
      },
      {
        "STATE": "47",
        "COUNTY": "145",
        "STNAME": "Tennessee",
        "CTYNAME": "Roane County",
        "POPESTIMATE2019": "53382"
      },
      {
        "STATE": "47",
        "COUNTY": "147",
        "STNAME": "Tennessee",
        "CTYNAME": "Robertson County",
        "POPESTIMATE2019": "71813"
      },
      {
        "STATE": "47",
        "COUNTY": "149",
        "STNAME": "Tennessee",
        "CTYNAME": "Rutherford County",
        "POPESTIMATE2019": "332285"
      },
      {
        "STATE": "47",
        "COUNTY": "151",
        "STNAME": "Tennessee",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "22068"
      },
      {
        "STATE": "47",
        "COUNTY": "153",
        "STNAME": "Tennessee",
        "CTYNAME": "Sequatchie County",
        "POPESTIMATE2019": "15026"
      },
      {
        "STATE": "47",
        "COUNTY": "155",
        "STNAME": "Tennessee",
        "CTYNAME": "Sevier County",
        "POPESTIMATE2019": "98250"
      },
      {
        "STATE": "47",
        "COUNTY": "157",
        "STNAME": "Tennessee",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "937166"
      },
      {
        "STATE": "47",
        "COUNTY": "159",
        "STNAME": "Tennessee",
        "CTYNAME": "Smith County",
        "POPESTIMATE2019": "20157"
      },
      {
        "STATE": "47",
        "COUNTY": "161",
        "STNAME": "Tennessee",
        "CTYNAME": "Stewart County",
        "POPESTIMATE2019": "13715"
      },
      {
        "STATE": "47",
        "COUNTY": "163",
        "STNAME": "Tennessee",
        "CTYNAME": "Sullivan County",
        "POPESTIMATE2019": "158348"
      },
      {
        "STATE": "47",
        "COUNTY": "165",
        "STNAME": "Tennessee",
        "CTYNAME": "Sumner County",
        "POPESTIMATE2019": "191283"
      },
      {
        "STATE": "47",
        "COUNTY": "167",
        "STNAME": "Tennessee",
        "CTYNAME": "Tipton County",
        "POPESTIMATE2019": "61599"
      },
      {
        "STATE": "47",
        "COUNTY": "169",
        "STNAME": "Tennessee",
        "CTYNAME": "Trousdale County",
        "POPESTIMATE2019": "11284"
      },
      {
        "STATE": "47",
        "COUNTY": "171",
        "STNAME": "Tennessee",
        "CTYNAME": "Unicoi County",
        "POPESTIMATE2019": "17883"
      },
      {
        "STATE": "47",
        "COUNTY": "173",
        "STNAME": "Tennessee",
        "CTYNAME": "Union County",
        "POPESTIMATE2019": "19972"
      },
      {
        "STATE": "47",
        "COUNTY": "175",
        "STNAME": "Tennessee",
        "CTYNAME": "Van Buren County",
        "POPESTIMATE2019": "5872"
      },
      {
        "STATE": "47",
        "COUNTY": "177",
        "STNAME": "Tennessee",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "41277"
      },
      {
        "STATE": "47",
        "COUNTY": "179",
        "STNAME": "Tennessee",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "129375"
      },
      {
        "STATE": "47",
        "COUNTY": "181",
        "STNAME": "Tennessee",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "16673"
      },
      {
        "STATE": "47",
        "COUNTY": "183",
        "STNAME": "Tennessee",
        "CTYNAME": "Weakley County",
        "POPESTIMATE2019": "33328"
      },
      {
        "STATE": "47",
        "COUNTY": "185",
        "STNAME": "Tennessee",
        "CTYNAME": "White County",
        "POPESTIMATE2019": "27345"
      },
      {
        "STATE": "47",
        "COUNTY": "187",
        "STNAME": "Tennessee",
        "CTYNAME": "Williamson County",
        "POPESTIMATE2019": "238412"
      },
      {
        "STATE": "47",
        "COUNTY": "189",
        "STNAME": "Tennessee",
        "CTYNAME": "Wilson County",
        "POPESTIMATE2019": "144657"
      },
      {
        "STATE": "48",
        "COUNTY": "000",
        "STNAME": "Texas",
        "CTYNAME": "Texas",
        "POPESTIMATE2019": "28995881"
      },
      {
        "STATE": "48",
        "COUNTY": "001",
        "STNAME": "Texas",
        "CTYNAME": "Anderson County",
        "POPESTIMATE2019": "57735"
      },
      {
        "STATE": "48",
        "COUNTY": "003",
        "STNAME": "Texas",
        "CTYNAME": "Andrews County",
        "POPESTIMATE2019": "18705"
      },
      {
        "STATE": "48",
        "COUNTY": "005",
        "STNAME": "Texas",
        "CTYNAME": "Angelina County",
        "POPESTIMATE2019": "86715"
      },
      {
        "STATE": "48",
        "COUNTY": "007",
        "STNAME": "Texas",
        "CTYNAME": "Aransas County",
        "POPESTIMATE2019": "23510"
      },
      {
        "STATE": "48",
        "COUNTY": "009",
        "STNAME": "Texas",
        "CTYNAME": "Archer County",
        "POPESTIMATE2019": "8553"
      },
      {
        "STATE": "48",
        "COUNTY": "011",
        "STNAME": "Texas",
        "CTYNAME": "Armstrong County",
        "POPESTIMATE2019": "1887"
      },
      {
        "STATE": "48",
        "COUNTY": "013",
        "STNAME": "Texas",
        "CTYNAME": "Atascosa County",
        "POPESTIMATE2019": "51153"
      },
      {
        "STATE": "48",
        "COUNTY": "015",
        "STNAME": "Texas",
        "CTYNAME": "Austin County",
        "POPESTIMATE2019": "30032"
      },
      {
        "STATE": "48",
        "COUNTY": "017",
        "STNAME": "Texas",
        "CTYNAME": "Bailey County",
        "POPESTIMATE2019": "7000"
      },
      {
        "STATE": "48",
        "COUNTY": "019",
        "STNAME": "Texas",
        "CTYNAME": "Bandera County",
        "POPESTIMATE2019": "23112"
      },
      {
        "STATE": "48",
        "COUNTY": "021",
        "STNAME": "Texas",
        "CTYNAME": "Bastrop County",
        "POPESTIMATE2019": "88723"
      },
      {
        "STATE": "48",
        "COUNTY": "023",
        "STNAME": "Texas",
        "CTYNAME": "Baylor County",
        "POPESTIMATE2019": "3509"
      },
      {
        "STATE": "48",
        "COUNTY": "025",
        "STNAME": "Texas",
        "CTYNAME": "Bee County",
        "POPESTIMATE2019": "32565"
      },
      {
        "STATE": "48",
        "COUNTY": "027",
        "STNAME": "Texas",
        "CTYNAME": "Bell County",
        "POPESTIMATE2019": "362924"
      },
      {
        "STATE": "48",
        "COUNTY": "029",
        "STNAME": "Texas",
        "CTYNAME": "Bexar County",
        "POPESTIMATE2019": "2003554"
      },
      {
        "STATE": "48",
        "COUNTY": "031",
        "STNAME": "Texas",
        "CTYNAME": "Blanco County",
        "POPESTIMATE2019": "11931"
      },
      {
        "STATE": "48",
        "COUNTY": "033",
        "STNAME": "Texas",
        "CTYNAME": "Borden County",
        "POPESTIMATE2019": "654"
      },
      {
        "STATE": "48",
        "COUNTY": "035",
        "STNAME": "Texas",
        "CTYNAME": "Bosque County",
        "POPESTIMATE2019": "18685"
      },
      {
        "STATE": "48",
        "COUNTY": "037",
        "STNAME": "Texas",
        "CTYNAME": "Bowie County",
        "POPESTIMATE2019": "93245"
      },
      {
        "STATE": "48",
        "COUNTY": "039",
        "STNAME": "Texas",
        "CTYNAME": "Brazoria County",
        "POPESTIMATE2019": "374264"
      },
      {
        "STATE": "48",
        "COUNTY": "041",
        "STNAME": "Texas",
        "CTYNAME": "Brazos County",
        "POPESTIMATE2019": "229211"
      },
      {
        "STATE": "48",
        "COUNTY": "043",
        "STNAME": "Texas",
        "CTYNAME": "Brewster County",
        "POPESTIMATE2019": "9203"
      },
      {
        "STATE": "48",
        "COUNTY": "045",
        "STNAME": "Texas",
        "CTYNAME": "Briscoe County",
        "POPESTIMATE2019": "1546"
      },
      {
        "STATE": "48",
        "COUNTY": "047",
        "STNAME": "Texas",
        "CTYNAME": "Brooks County",
        "POPESTIMATE2019": "7093"
      },
      {
        "STATE": "48",
        "COUNTY": "049",
        "STNAME": "Texas",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "37864"
      },
      {
        "STATE": "48",
        "COUNTY": "051",
        "STNAME": "Texas",
        "CTYNAME": "Burleson County",
        "POPESTIMATE2019": "18443"
      },
      {
        "STATE": "48",
        "COUNTY": "053",
        "STNAME": "Texas",
        "CTYNAME": "Burnet County",
        "POPESTIMATE2019": "48155"
      },
      {
        "STATE": "48",
        "COUNTY": "055",
        "STNAME": "Texas",
        "CTYNAME": "Caldwell County",
        "POPESTIMATE2019": "43664"
      },
      {
        "STATE": "48",
        "COUNTY": "057",
        "STNAME": "Texas",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "21290"
      },
      {
        "STATE": "48",
        "COUNTY": "059",
        "STNAME": "Texas",
        "CTYNAME": "Callahan County",
        "POPESTIMATE2019": "13943"
      },
      {
        "STATE": "48",
        "COUNTY": "061",
        "STNAME": "Texas",
        "CTYNAME": "Cameron County",
        "POPESTIMATE2019": "423163"
      },
      {
        "STATE": "48",
        "COUNTY": "063",
        "STNAME": "Texas",
        "CTYNAME": "Camp County",
        "POPESTIMATE2019": "13094"
      },
      {
        "STATE": "48",
        "COUNTY": "065",
        "STNAME": "Texas",
        "CTYNAME": "Carson County",
        "POPESTIMATE2019": "5926"
      },
      {
        "STATE": "48",
        "COUNTY": "067",
        "STNAME": "Texas",
        "CTYNAME": "Cass County",
        "POPESTIMATE2019": "30026"
      },
      {
        "STATE": "48",
        "COUNTY": "069",
        "STNAME": "Texas",
        "CTYNAME": "Castro County",
        "POPESTIMATE2019": "7530"
      },
      {
        "STATE": "48",
        "COUNTY": "071",
        "STNAME": "Texas",
        "CTYNAME": "Chambers County",
        "POPESTIMATE2019": "43837"
      },
      {
        "STATE": "48",
        "COUNTY": "073",
        "STNAME": "Texas",
        "CTYNAME": "Cherokee County",
        "POPESTIMATE2019": "52646"
      },
      {
        "STATE": "48",
        "COUNTY": "075",
        "STNAME": "Texas",
        "CTYNAME": "Childress County",
        "POPESTIMATE2019": "7306"
      },
      {
        "STATE": "48",
        "COUNTY": "077",
        "STNAME": "Texas",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "10471"
      },
      {
        "STATE": "48",
        "COUNTY": "079",
        "STNAME": "Texas",
        "CTYNAME": "Cochran County",
        "POPESTIMATE2019": "2853"
      },
      {
        "STATE": "48",
        "COUNTY": "081",
        "STNAME": "Texas",
        "CTYNAME": "Coke County",
        "POPESTIMATE2019": "3387"
      },
      {
        "STATE": "48",
        "COUNTY": "083",
        "STNAME": "Texas",
        "CTYNAME": "Coleman County",
        "POPESTIMATE2019": "8175"
      },
      {
        "STATE": "48",
        "COUNTY": "085",
        "STNAME": "Texas",
        "CTYNAME": "Collin County",
        "POPESTIMATE2019": "1034730"
      },
      {
        "STATE": "48",
        "COUNTY": "087",
        "STNAME": "Texas",
        "CTYNAME": "Collingsworth County",
        "POPESTIMATE2019": "2920"
      },
      {
        "STATE": "48",
        "COUNTY": "089",
        "STNAME": "Texas",
        "CTYNAME": "Colorado County",
        "POPESTIMATE2019": "21493"
      },
      {
        "STATE": "48",
        "COUNTY": "091",
        "STNAME": "Texas",
        "CTYNAME": "Comal County",
        "POPESTIMATE2019": "156209"
      },
      {
        "STATE": "48",
        "COUNTY": "093",
        "STNAME": "Texas",
        "CTYNAME": "Comanche County",
        "POPESTIMATE2019": "13635"
      },
      {
        "STATE": "48",
        "COUNTY": "095",
        "STNAME": "Texas",
        "CTYNAME": "Concho County",
        "POPESTIMATE2019": "2726"
      },
      {
        "STATE": "48",
        "COUNTY": "097",
        "STNAME": "Texas",
        "CTYNAME": "Cooke County",
        "POPESTIMATE2019": "41257"
      },
      {
        "STATE": "48",
        "COUNTY": "099",
        "STNAME": "Texas",
        "CTYNAME": "Coryell County",
        "POPESTIMATE2019": "75951"
      },
      {
        "STATE": "48",
        "COUNTY": "101",
        "STNAME": "Texas",
        "CTYNAME": "Cottle County",
        "POPESTIMATE2019": "1398"
      },
      {
        "STATE": "48",
        "COUNTY": "103",
        "STNAME": "Texas",
        "CTYNAME": "Crane County",
        "POPESTIMATE2019": "4797"
      },
      {
        "STATE": "48",
        "COUNTY": "105",
        "STNAME": "Texas",
        "CTYNAME": "Crockett County",
        "POPESTIMATE2019": "3464"
      },
      {
        "STATE": "48",
        "COUNTY": "107",
        "STNAME": "Texas",
        "CTYNAME": "Crosby County",
        "POPESTIMATE2019": "5737"
      },
      {
        "STATE": "48",
        "COUNTY": "109",
        "STNAME": "Texas",
        "CTYNAME": "Culberson County",
        "POPESTIMATE2019": "2171"
      },
      {
        "STATE": "48",
        "COUNTY": "111",
        "STNAME": "Texas",
        "CTYNAME": "Dallam County",
        "POPESTIMATE2019": "7287"
      },
      {
        "STATE": "48",
        "COUNTY": "113",
        "STNAME": "Texas",
        "CTYNAME": "Dallas County",
        "POPESTIMATE2019": "2635516"
      },
      {
        "STATE": "48",
        "COUNTY": "115",
        "STNAME": "Texas",
        "CTYNAME": "Dawson County",
        "POPESTIMATE2019": "12728"
      },
      {
        "STATE": "48",
        "COUNTY": "117",
        "STNAME": "Texas",
        "CTYNAME": "Deaf Smith County",
        "POPESTIMATE2019": "18546"
      },
      {
        "STATE": "48",
        "COUNTY": "119",
        "STNAME": "Texas",
        "CTYNAME": "Delta County",
        "POPESTIMATE2019": "5331"
      },
      {
        "STATE": "48",
        "COUNTY": "121",
        "STNAME": "Texas",
        "CTYNAME": "Denton County",
        "POPESTIMATE2019": "887207"
      },
      {
        "STATE": "48",
        "COUNTY": "123",
        "STNAME": "Texas",
        "CTYNAME": "DeWitt County",
        "POPESTIMATE2019": "20160"
      },
      {
        "STATE": "48",
        "COUNTY": "125",
        "STNAME": "Texas",
        "CTYNAME": "Dickens County",
        "POPESTIMATE2019": "2211"
      },
      {
        "STATE": "48",
        "COUNTY": "127",
        "STNAME": "Texas",
        "CTYNAME": "Dimmit County",
        "POPESTIMATE2019": "10124"
      },
      {
        "STATE": "48",
        "COUNTY": "129",
        "STNAME": "Texas",
        "CTYNAME": "Donley County",
        "POPESTIMATE2019": "3278"
      },
      {
        "STATE": "48",
        "COUNTY": "131",
        "STNAME": "Texas",
        "CTYNAME": "Duval County",
        "POPESTIMATE2019": "11157"
      },
      {
        "STATE": "48",
        "COUNTY": "133",
        "STNAME": "Texas",
        "CTYNAME": "Eastland County",
        "POPESTIMATE2019": "18360"
      },
      {
        "STATE": "48",
        "COUNTY": "135",
        "STNAME": "Texas",
        "CTYNAME": "Ector County",
        "POPESTIMATE2019": "166223"
      },
      {
        "STATE": "48",
        "COUNTY": "137",
        "STNAME": "Texas",
        "CTYNAME": "Edwards County",
        "POPESTIMATE2019": "1932"
      },
      {
        "STATE": "48",
        "COUNTY": "139",
        "STNAME": "Texas",
        "CTYNAME": "Ellis County",
        "POPESTIMATE2019": "184826"
      },
      {
        "STATE": "48",
        "COUNTY": "141",
        "STNAME": "Texas",
        "CTYNAME": "El Paso County",
        "POPESTIMATE2019": "839238"
      },
      {
        "STATE": "48",
        "COUNTY": "143",
        "STNAME": "Texas",
        "CTYNAME": "Erath County",
        "POPESTIMATE2019": "42698"
      },
      {
        "STATE": "48",
        "COUNTY": "145",
        "STNAME": "Texas",
        "CTYNAME": "Falls County",
        "POPESTIMATE2019": "17297"
      },
      {
        "STATE": "48",
        "COUNTY": "147",
        "STNAME": "Texas",
        "CTYNAME": "Fannin County",
        "POPESTIMATE2019": "35514"
      },
      {
        "STATE": "48",
        "COUNTY": "149",
        "STNAME": "Texas",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "25346"
      },
      {
        "STATE": "48",
        "COUNTY": "151",
        "STNAME": "Texas",
        "CTYNAME": "Fisher County",
        "POPESTIMATE2019": "3830"
      },
      {
        "STATE": "48",
        "COUNTY": "153",
        "STNAME": "Texas",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "5712"
      },
      {
        "STATE": "48",
        "COUNTY": "155",
        "STNAME": "Texas",
        "CTYNAME": "Foard County",
        "POPESTIMATE2019": "1155"
      },
      {
        "STATE": "48",
        "COUNTY": "157",
        "STNAME": "Texas",
        "CTYNAME": "Fort Bend County",
        "POPESTIMATE2019": "811688"
      },
      {
        "STATE": "48",
        "COUNTY": "159",
        "STNAME": "Texas",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "10725"
      },
      {
        "STATE": "48",
        "COUNTY": "161",
        "STNAME": "Texas",
        "CTYNAME": "Freestone County",
        "POPESTIMATE2019": "19717"
      },
      {
        "STATE": "48",
        "COUNTY": "163",
        "STNAME": "Texas",
        "CTYNAME": "Frio County",
        "POPESTIMATE2019": "20306"
      },
      {
        "STATE": "48",
        "COUNTY": "165",
        "STNAME": "Texas",
        "CTYNAME": "Gaines County",
        "POPESTIMATE2019": "21492"
      },
      {
        "STATE": "48",
        "COUNTY": "167",
        "STNAME": "Texas",
        "CTYNAME": "Galveston County",
        "POPESTIMATE2019": "342139"
      },
      {
        "STATE": "48",
        "COUNTY": "169",
        "STNAME": "Texas",
        "CTYNAME": "Garza County",
        "POPESTIMATE2019": "6229"
      },
      {
        "STATE": "48",
        "COUNTY": "171",
        "STNAME": "Texas",
        "CTYNAME": "Gillespie County",
        "POPESTIMATE2019": "26988"
      },
      {
        "STATE": "48",
        "COUNTY": "173",
        "STNAME": "Texas",
        "CTYNAME": "Glasscock County",
        "POPESTIMATE2019": "1409"
      },
      {
        "STATE": "48",
        "COUNTY": "175",
        "STNAME": "Texas",
        "CTYNAME": "Goliad County",
        "POPESTIMATE2019": "7658"
      },
      {
        "STATE": "48",
        "COUNTY": "177",
        "STNAME": "Texas",
        "CTYNAME": "Gonzales County",
        "POPESTIMATE2019": "20837"
      },
      {
        "STATE": "48",
        "COUNTY": "179",
        "STNAME": "Texas",
        "CTYNAME": "Gray County",
        "POPESTIMATE2019": "21886"
      },
      {
        "STATE": "48",
        "COUNTY": "181",
        "STNAME": "Texas",
        "CTYNAME": "Grayson County",
        "POPESTIMATE2019": "136212"
      },
      {
        "STATE": "48",
        "COUNTY": "183",
        "STNAME": "Texas",
        "CTYNAME": "Gregg County",
        "POPESTIMATE2019": "123945"
      },
      {
        "STATE": "48",
        "COUNTY": "185",
        "STNAME": "Texas",
        "CTYNAME": "Grimes County",
        "POPESTIMATE2019": "28880"
      },
      {
        "STATE": "48",
        "COUNTY": "187",
        "STNAME": "Texas",
        "CTYNAME": "Guadalupe County",
        "POPESTIMATE2019": "166847"
      },
      {
        "STATE": "48",
        "COUNTY": "189",
        "STNAME": "Texas",
        "CTYNAME": "Hale County",
        "POPESTIMATE2019": "33406"
      },
      {
        "STATE": "48",
        "COUNTY": "191",
        "STNAME": "Texas",
        "CTYNAME": "Hall County",
        "POPESTIMATE2019": "2964"
      },
      {
        "STATE": "48",
        "COUNTY": "193",
        "STNAME": "Texas",
        "CTYNAME": "Hamilton County",
        "POPESTIMATE2019": "8461"
      },
      {
        "STATE": "48",
        "COUNTY": "195",
        "STNAME": "Texas",
        "CTYNAME": "Hansford County",
        "POPESTIMATE2019": "5399"
      },
      {
        "STATE": "48",
        "COUNTY": "197",
        "STNAME": "Texas",
        "CTYNAME": "Hardeman County",
        "POPESTIMATE2019": "3933"
      },
      {
        "STATE": "48",
        "COUNTY": "199",
        "STNAME": "Texas",
        "CTYNAME": "Hardin County",
        "POPESTIMATE2019": "57602"
      },
      {
        "STATE": "48",
        "COUNTY": "201",
        "STNAME": "Texas",
        "CTYNAME": "Harris County",
        "POPESTIMATE2019": "4713325"
      },
      {
        "STATE": "48",
        "COUNTY": "203",
        "STNAME": "Texas",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "66553"
      },
      {
        "STATE": "48",
        "COUNTY": "205",
        "STNAME": "Texas",
        "CTYNAME": "Hartley County",
        "POPESTIMATE2019": "5576"
      },
      {
        "STATE": "48",
        "COUNTY": "207",
        "STNAME": "Texas",
        "CTYNAME": "Haskell County",
        "POPESTIMATE2019": "5658"
      },
      {
        "STATE": "48",
        "COUNTY": "209",
        "STNAME": "Texas",
        "CTYNAME": "Hays County",
        "POPESTIMATE2019": "230191"
      },
      {
        "STATE": "48",
        "COUNTY": "211",
        "STNAME": "Texas",
        "CTYNAME": "Hemphill County",
        "POPESTIMATE2019": "3819"
      },
      {
        "STATE": "48",
        "COUNTY": "213",
        "STNAME": "Texas",
        "CTYNAME": "Henderson County",
        "POPESTIMATE2019": "82737"
      },
      {
        "STATE": "48",
        "COUNTY": "215",
        "STNAME": "Texas",
        "CTYNAME": "Hidalgo County",
        "POPESTIMATE2019": "868707"
      },
      {
        "STATE": "48",
        "COUNTY": "217",
        "STNAME": "Texas",
        "CTYNAME": "Hill County",
        "POPESTIMATE2019": "36649"
      },
      {
        "STATE": "48",
        "COUNTY": "219",
        "STNAME": "Texas",
        "CTYNAME": "Hockley County",
        "POPESTIMATE2019": "23021"
      },
      {
        "STATE": "48",
        "COUNTY": "221",
        "STNAME": "Texas",
        "CTYNAME": "Hood County",
        "POPESTIMATE2019": "61643"
      },
      {
        "STATE": "48",
        "COUNTY": "223",
        "STNAME": "Texas",
        "CTYNAME": "Hopkins County",
        "POPESTIMATE2019": "37084"
      },
      {
        "STATE": "48",
        "COUNTY": "225",
        "STNAME": "Texas",
        "CTYNAME": "Houston County",
        "POPESTIMATE2019": "22968"
      },
      {
        "STATE": "48",
        "COUNTY": "227",
        "STNAME": "Texas",
        "CTYNAME": "Howard County",
        "POPESTIMATE2019": "36664"
      },
      {
        "STATE": "48",
        "COUNTY": "229",
        "STNAME": "Texas",
        "CTYNAME": "Hudspeth County",
        "POPESTIMATE2019": "4886"
      },
      {
        "STATE": "48",
        "COUNTY": "231",
        "STNAME": "Texas",
        "CTYNAME": "Hunt County",
        "POPESTIMATE2019": "98594"
      },
      {
        "STATE": "48",
        "COUNTY": "233",
        "STNAME": "Texas",
        "CTYNAME": "Hutchinson County",
        "POPESTIMATE2019": "20938"
      },
      {
        "STATE": "48",
        "COUNTY": "235",
        "STNAME": "Texas",
        "CTYNAME": "Irion County",
        "POPESTIMATE2019": "1536"
      },
      {
        "STATE": "48",
        "COUNTY": "237",
        "STNAME": "Texas",
        "CTYNAME": "Jack County",
        "POPESTIMATE2019": "8935"
      },
      {
        "STATE": "48",
        "COUNTY": "239",
        "STNAME": "Texas",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "14760"
      },
      {
        "STATE": "48",
        "COUNTY": "241",
        "STNAME": "Texas",
        "CTYNAME": "Jasper County",
        "POPESTIMATE2019": "35529"
      },
      {
        "STATE": "48",
        "COUNTY": "243",
        "STNAME": "Texas",
        "CTYNAME": "Jeff Davis County",
        "POPESTIMATE2019": "2274"
      },
      {
        "STATE": "48",
        "COUNTY": "245",
        "STNAME": "Texas",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "251565"
      },
      {
        "STATE": "48",
        "COUNTY": "247",
        "STNAME": "Texas",
        "CTYNAME": "Jim Hogg County",
        "POPESTIMATE2019": "5200"
      },
      {
        "STATE": "48",
        "COUNTY": "249",
        "STNAME": "Texas",
        "CTYNAME": "Jim Wells County",
        "POPESTIMATE2019": "40482"
      },
      {
        "STATE": "48",
        "COUNTY": "251",
        "STNAME": "Texas",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "175817"
      },
      {
        "STATE": "48",
        "COUNTY": "253",
        "STNAME": "Texas",
        "CTYNAME": "Jones County",
        "POPESTIMATE2019": "20083"
      },
      {
        "STATE": "48",
        "COUNTY": "255",
        "STNAME": "Texas",
        "CTYNAME": "Karnes County",
        "POPESTIMATE2019": "15601"
      },
      {
        "STATE": "48",
        "COUNTY": "257",
        "STNAME": "Texas",
        "CTYNAME": "Kaufman County",
        "POPESTIMATE2019": "136154"
      },
      {
        "STATE": "48",
        "COUNTY": "259",
        "STNAME": "Texas",
        "CTYNAME": "Kendall County",
        "POPESTIMATE2019": "47431"
      },
      {
        "STATE": "48",
        "COUNTY": "261",
        "STNAME": "Texas",
        "CTYNAME": "Kenedy County",
        "POPESTIMATE2019": "404"
      },
      {
        "STATE": "48",
        "COUNTY": "263",
        "STNAME": "Texas",
        "CTYNAME": "Kent County",
        "POPESTIMATE2019": "762"
      },
      {
        "STATE": "48",
        "COUNTY": "265",
        "STNAME": "Texas",
        "CTYNAME": "Kerr County",
        "POPESTIMATE2019": "52600"
      },
      {
        "STATE": "48",
        "COUNTY": "267",
        "STNAME": "Texas",
        "CTYNAME": "Kimble County",
        "POPESTIMATE2019": "4337"
      },
      {
        "STATE": "48",
        "COUNTY": "269",
        "STNAME": "Texas",
        "CTYNAME": "King County",
        "POPESTIMATE2019": "272"
      },
      {
        "STATE": "48",
        "COUNTY": "271",
        "STNAME": "Texas",
        "CTYNAME": "Kinney County",
        "POPESTIMATE2019": "3667"
      },
      {
        "STATE": "48",
        "COUNTY": "273",
        "STNAME": "Texas",
        "CTYNAME": "Kleberg County",
        "POPESTIMATE2019": "30680"
      },
      {
        "STATE": "48",
        "COUNTY": "275",
        "STNAME": "Texas",
        "CTYNAME": "Knox County",
        "POPESTIMATE2019": "3664"
      },
      {
        "STATE": "48",
        "COUNTY": "277",
        "STNAME": "Texas",
        "CTYNAME": "Lamar County",
        "POPESTIMATE2019": "49859"
      },
      {
        "STATE": "48",
        "COUNTY": "279",
        "STNAME": "Texas",
        "CTYNAME": "Lamb County",
        "POPESTIMATE2019": "12893"
      },
      {
        "STATE": "48",
        "COUNTY": "281",
        "STNAME": "Texas",
        "CTYNAME": "Lampasas County",
        "POPESTIMATE2019": "21428"
      },
      {
        "STATE": "48",
        "COUNTY": "283",
        "STNAME": "Texas",
        "CTYNAME": "La Salle County",
        "POPESTIMATE2019": "7520"
      },
      {
        "STATE": "48",
        "COUNTY": "285",
        "STNAME": "Texas",
        "CTYNAME": "Lavaca County",
        "POPESTIMATE2019": "20154"
      },
      {
        "STATE": "48",
        "COUNTY": "287",
        "STNAME": "Texas",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "17239"
      },
      {
        "STATE": "48",
        "COUNTY": "289",
        "STNAME": "Texas",
        "CTYNAME": "Leon County",
        "POPESTIMATE2019": "17404"
      },
      {
        "STATE": "48",
        "COUNTY": "291",
        "STNAME": "Texas",
        "CTYNAME": "Liberty County",
        "POPESTIMATE2019": "88219"
      },
      {
        "STATE": "48",
        "COUNTY": "293",
        "STNAME": "Texas",
        "CTYNAME": "Limestone County",
        "POPESTIMATE2019": "23437"
      },
      {
        "STATE": "48",
        "COUNTY": "295",
        "STNAME": "Texas",
        "CTYNAME": "Lipscomb County",
        "POPESTIMATE2019": "3233"
      },
      {
        "STATE": "48",
        "COUNTY": "297",
        "STNAME": "Texas",
        "CTYNAME": "Live Oak County",
        "POPESTIMATE2019": "12207"
      },
      {
        "STATE": "48",
        "COUNTY": "299",
        "STNAME": "Texas",
        "CTYNAME": "Llano County",
        "POPESTIMATE2019": "21795"
      },
      {
        "STATE": "48",
        "COUNTY": "301",
        "STNAME": "Texas",
        "CTYNAME": "Loving County",
        "POPESTIMATE2019": "169"
      },
      {
        "STATE": "48",
        "COUNTY": "303",
        "STNAME": "Texas",
        "CTYNAME": "Lubbock County",
        "POPESTIMATE2019": "310569"
      },
      {
        "STATE": "48",
        "COUNTY": "305",
        "STNAME": "Texas",
        "CTYNAME": "Lynn County",
        "POPESTIMATE2019": "5951"
      },
      {
        "STATE": "48",
        "COUNTY": "307",
        "STNAME": "Texas",
        "CTYNAME": "McCulloch County",
        "POPESTIMATE2019": "7984"
      },
      {
        "STATE": "48",
        "COUNTY": "309",
        "STNAME": "Texas",
        "CTYNAME": "McLennan County",
        "POPESTIMATE2019": "256623"
      },
      {
        "STATE": "48",
        "COUNTY": "311",
        "STNAME": "Texas",
        "CTYNAME": "McMullen County",
        "POPESTIMATE2019": "743"
      },
      {
        "STATE": "48",
        "COUNTY": "313",
        "STNAME": "Texas",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "14284"
      },
      {
        "STATE": "48",
        "COUNTY": "315",
        "STNAME": "Texas",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "9854"
      },
      {
        "STATE": "48",
        "COUNTY": "317",
        "STNAME": "Texas",
        "CTYNAME": "Martin County",
        "POPESTIMATE2019": "5771"
      },
      {
        "STATE": "48",
        "COUNTY": "319",
        "STNAME": "Texas",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "4274"
      },
      {
        "STATE": "48",
        "COUNTY": "321",
        "STNAME": "Texas",
        "CTYNAME": "Matagorda County",
        "POPESTIMATE2019": "36643"
      },
      {
        "STATE": "48",
        "COUNTY": "323",
        "STNAME": "Texas",
        "CTYNAME": "Maverick County",
        "POPESTIMATE2019": "58722"
      },
      {
        "STATE": "48",
        "COUNTY": "325",
        "STNAME": "Texas",
        "CTYNAME": "Medina County",
        "POPESTIMATE2019": "51584"
      },
      {
        "STATE": "48",
        "COUNTY": "327",
        "STNAME": "Texas",
        "CTYNAME": "Menard County",
        "POPESTIMATE2019": "2138"
      },
      {
        "STATE": "48",
        "COUNTY": "329",
        "STNAME": "Texas",
        "CTYNAME": "Midland County",
        "POPESTIMATE2019": "176832"
      },
      {
        "STATE": "48",
        "COUNTY": "331",
        "STNAME": "Texas",
        "CTYNAME": "Milam County",
        "POPESTIMATE2019": "24823"
      },
      {
        "STATE": "48",
        "COUNTY": "333",
        "STNAME": "Texas",
        "CTYNAME": "Mills County",
        "POPESTIMATE2019": "4873"
      },
      {
        "STATE": "48",
        "COUNTY": "335",
        "STNAME": "Texas",
        "CTYNAME": "Mitchell County",
        "POPESTIMATE2019": "8545"
      },
      {
        "STATE": "48",
        "COUNTY": "337",
        "STNAME": "Texas",
        "CTYNAME": "Montague County",
        "POPESTIMATE2019": "19818"
      },
      {
        "STATE": "48",
        "COUNTY": "339",
        "STNAME": "Texas",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "607391"
      },
      {
        "STATE": "48",
        "COUNTY": "341",
        "STNAME": "Texas",
        "CTYNAME": "Moore County",
        "POPESTIMATE2019": "20940"
      },
      {
        "STATE": "48",
        "COUNTY": "343",
        "STNAME": "Texas",
        "CTYNAME": "Morris County",
        "POPESTIMATE2019": "12388"
      },
      {
        "STATE": "48",
        "COUNTY": "345",
        "STNAME": "Texas",
        "CTYNAME": "Motley County",
        "POPESTIMATE2019": "1200"
      },
      {
        "STATE": "48",
        "COUNTY": "347",
        "STNAME": "Texas",
        "CTYNAME": "Nacogdoches County",
        "POPESTIMATE2019": "65204"
      },
      {
        "STATE": "48",
        "COUNTY": "349",
        "STNAME": "Texas",
        "CTYNAME": "Navarro County",
        "POPESTIMATE2019": "50113"
      },
      {
        "STATE": "48",
        "COUNTY": "351",
        "STNAME": "Texas",
        "CTYNAME": "Newton County",
        "POPESTIMATE2019": "13595"
      },
      {
        "STATE": "48",
        "COUNTY": "353",
        "STNAME": "Texas",
        "CTYNAME": "Nolan County",
        "POPESTIMATE2019": "14714"
      },
      {
        "STATE": "48",
        "COUNTY": "355",
        "STNAME": "Texas",
        "CTYNAME": "Nueces County",
        "POPESTIMATE2019": "362294"
      },
      {
        "STATE": "48",
        "COUNTY": "357",
        "STNAME": "Texas",
        "CTYNAME": "Ochiltree County",
        "POPESTIMATE2019": "9836"
      },
      {
        "STATE": "48",
        "COUNTY": "359",
        "STNAME": "Texas",
        "CTYNAME": "Oldham County",
        "POPESTIMATE2019": "2112"
      },
      {
        "STATE": "48",
        "COUNTY": "361",
        "STNAME": "Texas",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "83396"
      },
      {
        "STATE": "48",
        "COUNTY": "363",
        "STNAME": "Texas",
        "CTYNAME": "Palo Pinto County",
        "POPESTIMATE2019": "29189"
      },
      {
        "STATE": "48",
        "COUNTY": "365",
        "STNAME": "Texas",
        "CTYNAME": "Panola County",
        "POPESTIMATE2019": "23194"
      },
      {
        "STATE": "48",
        "COUNTY": "367",
        "STNAME": "Texas",
        "CTYNAME": "Parker County",
        "POPESTIMATE2019": "142878"
      },
      {
        "STATE": "48",
        "COUNTY": "369",
        "STNAME": "Texas",
        "CTYNAME": "Parmer County",
        "POPESTIMATE2019": "9605"
      },
      {
        "STATE": "48",
        "COUNTY": "371",
        "STNAME": "Texas",
        "CTYNAME": "Pecos County",
        "POPESTIMATE2019": "15823"
      },
      {
        "STATE": "48",
        "COUNTY": "373",
        "STNAME": "Texas",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "51353"
      },
      {
        "STATE": "48",
        "COUNTY": "375",
        "STNAME": "Texas",
        "CTYNAME": "Potter County",
        "POPESTIMATE2019": "117415"
      },
      {
        "STATE": "48",
        "COUNTY": "377",
        "STNAME": "Texas",
        "CTYNAME": "Presidio County",
        "POPESTIMATE2019": "6704"
      },
      {
        "STATE": "48",
        "COUNTY": "379",
        "STNAME": "Texas",
        "CTYNAME": "Rains County",
        "POPESTIMATE2019": "12514"
      },
      {
        "STATE": "48",
        "COUNTY": "381",
        "STNAME": "Texas",
        "CTYNAME": "Randall County",
        "POPESTIMATE2019": "137713"
      },
      {
        "STATE": "48",
        "COUNTY": "383",
        "STNAME": "Texas",
        "CTYNAME": "Reagan County",
        "POPESTIMATE2019": "3849"
      },
      {
        "STATE": "48",
        "COUNTY": "385",
        "STNAME": "Texas",
        "CTYNAME": "Real County",
        "POPESTIMATE2019": "3452"
      },
      {
        "STATE": "48",
        "COUNTY": "387",
        "STNAME": "Texas",
        "CTYNAME": "Red River County",
        "POPESTIMATE2019": "12023"
      },
      {
        "STATE": "48",
        "COUNTY": "389",
        "STNAME": "Texas",
        "CTYNAME": "Reeves County",
        "POPESTIMATE2019": "15976"
      },
      {
        "STATE": "48",
        "COUNTY": "391",
        "STNAME": "Texas",
        "CTYNAME": "Refugio County",
        "POPESTIMATE2019": "6948"
      },
      {
        "STATE": "48",
        "COUNTY": "393",
        "STNAME": "Texas",
        "CTYNAME": "Roberts County",
        "POPESTIMATE2019": "854"
      },
      {
        "STATE": "48",
        "COUNTY": "395",
        "STNAME": "Texas",
        "CTYNAME": "Robertson County",
        "POPESTIMATE2019": "17074"
      },
      {
        "STATE": "48",
        "COUNTY": "397",
        "STNAME": "Texas",
        "CTYNAME": "Rockwall County",
        "POPESTIMATE2019": "104915"
      },
      {
        "STATE": "48",
        "COUNTY": "399",
        "STNAME": "Texas",
        "CTYNAME": "Runnels County",
        "POPESTIMATE2019": "10264"
      },
      {
        "STATE": "48",
        "COUNTY": "401",
        "STNAME": "Texas",
        "CTYNAME": "Rusk County",
        "POPESTIMATE2019": "54406"
      },
      {
        "STATE": "48",
        "COUNTY": "403",
        "STNAME": "Texas",
        "CTYNAME": "Sabine County",
        "POPESTIMATE2019": "10542"
      },
      {
        "STATE": "48",
        "COUNTY": "405",
        "STNAME": "Texas",
        "CTYNAME": "San Augustine County",
        "POPESTIMATE2019": "8237"
      },
      {
        "STATE": "48",
        "COUNTY": "407",
        "STNAME": "Texas",
        "CTYNAME": "San Jacinto County",
        "POPESTIMATE2019": "28859"
      },
      {
        "STATE": "48",
        "COUNTY": "409",
        "STNAME": "Texas",
        "CTYNAME": "San Patricio County",
        "POPESTIMATE2019": "66730"
      },
      {
        "STATE": "48",
        "COUNTY": "411",
        "STNAME": "Texas",
        "CTYNAME": "San Saba County",
        "POPESTIMATE2019": "6055"
      },
      {
        "STATE": "48",
        "COUNTY": "413",
        "STNAME": "Texas",
        "CTYNAME": "Schleicher County",
        "POPESTIMATE2019": "2793"
      },
      {
        "STATE": "48",
        "COUNTY": "415",
        "STNAME": "Texas",
        "CTYNAME": "Scurry County",
        "POPESTIMATE2019": "16703"
      },
      {
        "STATE": "48",
        "COUNTY": "417",
        "STNAME": "Texas",
        "CTYNAME": "Shackelford County",
        "POPESTIMATE2019": "3265"
      },
      {
        "STATE": "48",
        "COUNTY": "419",
        "STNAME": "Texas",
        "CTYNAME": "Shelby County",
        "POPESTIMATE2019": "25274"
      },
      {
        "STATE": "48",
        "COUNTY": "421",
        "STNAME": "Texas",
        "CTYNAME": "Sherman County",
        "POPESTIMATE2019": "3022"
      },
      {
        "STATE": "48",
        "COUNTY": "423",
        "STNAME": "Texas",
        "CTYNAME": "Smith County",
        "POPESTIMATE2019": "232751"
      },
      {
        "STATE": "48",
        "COUNTY": "425",
        "STNAME": "Texas",
        "CTYNAME": "Somervell County",
        "POPESTIMATE2019": "9128"
      },
      {
        "STATE": "48",
        "COUNTY": "427",
        "STNAME": "Texas",
        "CTYNAME": "Starr County",
        "POPESTIMATE2019": "64633"
      },
      {
        "STATE": "48",
        "COUNTY": "429",
        "STNAME": "Texas",
        "CTYNAME": "Stephens County",
        "POPESTIMATE2019": "9366"
      },
      {
        "STATE": "48",
        "COUNTY": "431",
        "STNAME": "Texas",
        "CTYNAME": "Sterling County",
        "POPESTIMATE2019": "1291"
      },
      {
        "STATE": "48",
        "COUNTY": "433",
        "STNAME": "Texas",
        "CTYNAME": "Stonewall County",
        "POPESTIMATE2019": "1350"
      },
      {
        "STATE": "48",
        "COUNTY": "435",
        "STNAME": "Texas",
        "CTYNAME": "Sutton County",
        "POPESTIMATE2019": "3776"
      },
      {
        "STATE": "48",
        "COUNTY": "437",
        "STNAME": "Texas",
        "CTYNAME": "Swisher County",
        "POPESTIMATE2019": "7397"
      },
      {
        "STATE": "48",
        "COUNTY": "439",
        "STNAME": "Texas",
        "CTYNAME": "Tarrant County",
        "POPESTIMATE2019": "2102515"
      },
      {
        "STATE": "48",
        "COUNTY": "441",
        "STNAME": "Texas",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "138034"
      },
      {
        "STATE": "48",
        "COUNTY": "443",
        "STNAME": "Texas",
        "CTYNAME": "Terrell County",
        "POPESTIMATE2019": "776"
      },
      {
        "STATE": "48",
        "COUNTY": "445",
        "STNAME": "Texas",
        "CTYNAME": "Terry County",
        "POPESTIMATE2019": "12337"
      },
      {
        "STATE": "48",
        "COUNTY": "447",
        "STNAME": "Texas",
        "CTYNAME": "Throckmorton County",
        "POPESTIMATE2019": "1501"
      },
      {
        "STATE": "48",
        "COUNTY": "449",
        "STNAME": "Texas",
        "CTYNAME": "Titus County",
        "POPESTIMATE2019": "32750"
      },
      {
        "STATE": "48",
        "COUNTY": "451",
        "STNAME": "Texas",
        "CTYNAME": "Tom Green County",
        "POPESTIMATE2019": "119200"
      },
      {
        "STATE": "48",
        "COUNTY": "453",
        "STNAME": "Texas",
        "CTYNAME": "Travis County",
        "POPESTIMATE2019": "1273954"
      },
      {
        "STATE": "48",
        "COUNTY": "455",
        "STNAME": "Texas",
        "CTYNAME": "Trinity County",
        "POPESTIMATE2019": "14651"
      },
      {
        "STATE": "48",
        "COUNTY": "457",
        "STNAME": "Texas",
        "CTYNAME": "Tyler County",
        "POPESTIMATE2019": "21672"
      },
      {
        "STATE": "48",
        "COUNTY": "459",
        "STNAME": "Texas",
        "CTYNAME": "Upshur County",
        "POPESTIMATE2019": "41753"
      },
      {
        "STATE": "48",
        "COUNTY": "461",
        "STNAME": "Texas",
        "CTYNAME": "Upton County",
        "POPESTIMATE2019": "3657"
      },
      {
        "STATE": "48",
        "COUNTY": "463",
        "STNAME": "Texas",
        "CTYNAME": "Uvalde County",
        "POPESTIMATE2019": "26741"
      },
      {
        "STATE": "48",
        "COUNTY": "465",
        "STNAME": "Texas",
        "CTYNAME": "Val Verde County",
        "POPESTIMATE2019": "49025"
      },
      {
        "STATE": "48",
        "COUNTY": "467",
        "STNAME": "Texas",
        "CTYNAME": "Van Zandt County",
        "POPESTIMATE2019": "56590"
      },
      {
        "STATE": "48",
        "COUNTY": "469",
        "STNAME": "Texas",
        "CTYNAME": "Victoria County",
        "POPESTIMATE2019": "92084"
      },
      {
        "STATE": "48",
        "COUNTY": "471",
        "STNAME": "Texas",
        "CTYNAME": "Walker County",
        "POPESTIMATE2019": "72971"
      },
      {
        "STATE": "48",
        "COUNTY": "473",
        "STNAME": "Texas",
        "CTYNAME": "Waller County",
        "POPESTIMATE2019": "55246"
      },
      {
        "STATE": "48",
        "COUNTY": "475",
        "STNAME": "Texas",
        "CTYNAME": "Ward County",
        "POPESTIMATE2019": "11998"
      },
      {
        "STATE": "48",
        "COUNTY": "477",
        "STNAME": "Texas",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "35882"
      },
      {
        "STATE": "48",
        "COUNTY": "479",
        "STNAME": "Texas",
        "CTYNAME": "Webb County",
        "POPESTIMATE2019": "276652"
      },
      {
        "STATE": "48",
        "COUNTY": "481",
        "STNAME": "Texas",
        "CTYNAME": "Wharton County",
        "POPESTIMATE2019": "41556"
      },
      {
        "STATE": "48",
        "COUNTY": "483",
        "STNAME": "Texas",
        "CTYNAME": "Wheeler County",
        "POPESTIMATE2019": "5056"
      },
      {
        "STATE": "48",
        "COUNTY": "485",
        "STNAME": "Texas",
        "CTYNAME": "Wichita County",
        "POPESTIMATE2019": "132230"
      },
      {
        "STATE": "48",
        "COUNTY": "487",
        "STNAME": "Texas",
        "CTYNAME": "Wilbarger County",
        "POPESTIMATE2019": "12769"
      },
      {
        "STATE": "48",
        "COUNTY": "489",
        "STNAME": "Texas",
        "CTYNAME": "Willacy County",
        "POPESTIMATE2019": "21358"
      },
      {
        "STATE": "48",
        "COUNTY": "491",
        "STNAME": "Texas",
        "CTYNAME": "Williamson County",
        "POPESTIMATE2019": "590551"
      },
      {
        "STATE": "48",
        "COUNTY": "493",
        "STNAME": "Texas",
        "CTYNAME": "Wilson County",
        "POPESTIMATE2019": "51070"
      },
      {
        "STATE": "48",
        "COUNTY": "495",
        "STNAME": "Texas",
        "CTYNAME": "Winkler County",
        "POPESTIMATE2019": "8010"
      },
      {
        "STATE": "48",
        "COUNTY": "497",
        "STNAME": "Texas",
        "CTYNAME": "Wise County",
        "POPESTIMATE2019": "69984"
      },
      {
        "STATE": "48",
        "COUNTY": "499",
        "STNAME": "Texas",
        "CTYNAME": "Wood County",
        "POPESTIMATE2019": "45539"
      },
      {
        "STATE": "48",
        "COUNTY": "501",
        "STNAME": "Texas",
        "CTYNAME": "Yoakum County",
        "POPESTIMATE2019": "8713"
      },
      {
        "STATE": "48",
        "COUNTY": "503",
        "STNAME": "Texas",
        "CTYNAME": "Young County",
        "POPESTIMATE2019": "18010"
      },
      {
        "STATE": "48",
        "COUNTY": "505",
        "STNAME": "Texas",
        "CTYNAME": "Zapata County",
        "POPESTIMATE2019": "14179"
      },
      {
        "STATE": "48",
        "COUNTY": "507",
        "STNAME": "Texas",
        "CTYNAME": "Zavala County",
        "POPESTIMATE2019": "11840"
      },
      {
        "STATE": "49",
        "COUNTY": "000",
        "STNAME": "Utah",
        "CTYNAME": "Utah",
        "POPESTIMATE2019": "3205958"
      },
      {
        "STATE": "49",
        "COUNTY": "001",
        "STNAME": "Utah",
        "CTYNAME": "Beaver County",
        "POPESTIMATE2019": "6710"
      },
      {
        "STATE": "49",
        "COUNTY": "003",
        "STNAME": "Utah",
        "CTYNAME": "Box Elder County",
        "POPESTIMATE2019": "56046"
      },
      {
        "STATE": "49",
        "COUNTY": "005",
        "STNAME": "Utah",
        "CTYNAME": "Cache County",
        "POPESTIMATE2019": "128289"
      },
      {
        "STATE": "49",
        "COUNTY": "007",
        "STNAME": "Utah",
        "CTYNAME": "Carbon County",
        "POPESTIMATE2019": "20463"
      },
      {
        "STATE": "49",
        "COUNTY": "009",
        "STNAME": "Utah",
        "CTYNAME": "Daggett County",
        "POPESTIMATE2019": "950"
      },
      {
        "STATE": "49",
        "COUNTY": "011",
        "STNAME": "Utah",
        "CTYNAME": "Davis County",
        "POPESTIMATE2019": "355481"
      },
      {
        "STATE": "49",
        "COUNTY": "013",
        "STNAME": "Utah",
        "CTYNAME": "Duchesne County",
        "POPESTIMATE2019": "19938"
      },
      {
        "STATE": "49",
        "COUNTY": "015",
        "STNAME": "Utah",
        "CTYNAME": "Emery County",
        "POPESTIMATE2019": "10012"
      },
      {
        "STATE": "49",
        "COUNTY": "017",
        "STNAME": "Utah",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "5051"
      },
      {
        "STATE": "49",
        "COUNTY": "019",
        "STNAME": "Utah",
        "CTYNAME": "Grand County",
        "POPESTIMATE2019": "9754"
      },
      {
        "STATE": "49",
        "COUNTY": "021",
        "STNAME": "Utah",
        "CTYNAME": "Iron County",
        "POPESTIMATE2019": "54839"
      },
      {
        "STATE": "49",
        "COUNTY": "023",
        "STNAME": "Utah",
        "CTYNAME": "Juab County",
        "POPESTIMATE2019": "12017"
      },
      {
        "STATE": "49",
        "COUNTY": "025",
        "STNAME": "Utah",
        "CTYNAME": "Kane County",
        "POPESTIMATE2019": "7886"
      },
      {
        "STATE": "49",
        "COUNTY": "027",
        "STNAME": "Utah",
        "CTYNAME": "Millard County",
        "POPESTIMATE2019": "13188"
      },
      {
        "STATE": "49",
        "COUNTY": "029",
        "STNAME": "Utah",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "12124"
      },
      {
        "STATE": "49",
        "COUNTY": "031",
        "STNAME": "Utah",
        "CTYNAME": "Piute County",
        "POPESTIMATE2019": "1479"
      },
      {
        "STATE": "49",
        "COUNTY": "033",
        "STNAME": "Utah",
        "CTYNAME": "Rich County",
        "POPESTIMATE2019": "2483"
      },
      {
        "STATE": "49",
        "COUNTY": "035",
        "STNAME": "Utah",
        "CTYNAME": "Salt Lake County",
        "POPESTIMATE2019": "1160437"
      },
      {
        "STATE": "49",
        "COUNTY": "037",
        "STNAME": "Utah",
        "CTYNAME": "San Juan County",
        "POPESTIMATE2019": "15308"
      },
      {
        "STATE": "49",
        "COUNTY": "039",
        "STNAME": "Utah",
        "CTYNAME": "Sanpete County",
        "POPESTIMATE2019": "30939"
      },
      {
        "STATE": "49",
        "COUNTY": "041",
        "STNAME": "Utah",
        "CTYNAME": "Sevier County",
        "POPESTIMATE2019": "21620"
      },
      {
        "STATE": "49",
        "COUNTY": "043",
        "STNAME": "Utah",
        "CTYNAME": "Summit County",
        "POPESTIMATE2019": "42145"
      },
      {
        "STATE": "49",
        "COUNTY": "045",
        "STNAME": "Utah",
        "CTYNAME": "Tooele County",
        "POPESTIMATE2019": "72259"
      },
      {
        "STATE": "49",
        "COUNTY": "047",
        "STNAME": "Utah",
        "CTYNAME": "Uintah County",
        "POPESTIMATE2019": "35734"
      },
      {
        "STATE": "49",
        "COUNTY": "049",
        "STNAME": "Utah",
        "CTYNAME": "Utah County",
        "POPESTIMATE2019": "636235"
      },
      {
        "STATE": "49",
        "COUNTY": "051",
        "STNAME": "Utah",
        "CTYNAME": "Wasatch County",
        "POPESTIMATE2019": "34091"
      },
      {
        "STATE": "49",
        "COUNTY": "053",
        "STNAME": "Utah",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "177556"
      },
      {
        "STATE": "49",
        "COUNTY": "055",
        "STNAME": "Utah",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "2711"
      },
      {
        "STATE": "49",
        "COUNTY": "057",
        "STNAME": "Utah",
        "CTYNAME": "Weber County",
        "POPESTIMATE2019": "260213"
      },
      {
        "STATE": "50",
        "COUNTY": "000",
        "STNAME": "Vermont",
        "CTYNAME": "Vermont",
        "POPESTIMATE2019": "623989"
      },
      {
        "STATE": "50",
        "COUNTY": "001",
        "STNAME": "Vermont",
        "CTYNAME": "Addison County",
        "POPESTIMATE2019": "36777"
      },
      {
        "STATE": "50",
        "COUNTY": "003",
        "STNAME": "Vermont",
        "CTYNAME": "Bennington County",
        "POPESTIMATE2019": "35470"
      },
      {
        "STATE": "50",
        "COUNTY": "005",
        "STNAME": "Vermont",
        "CTYNAME": "Caledonia County",
        "POPESTIMATE2019": "29993"
      },
      {
        "STATE": "50",
        "COUNTY": "007",
        "STNAME": "Vermont",
        "CTYNAME": "Chittenden County",
        "POPESTIMATE2019": "163774"
      },
      {
        "STATE": "50",
        "COUNTY": "009",
        "STNAME": "Vermont",
        "CTYNAME": "Essex County",
        "POPESTIMATE2019": "6163"
      },
      {
        "STATE": "50",
        "COUNTY": "011",
        "STNAME": "Vermont",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "49402"
      },
      {
        "STATE": "50",
        "COUNTY": "013",
        "STNAME": "Vermont",
        "CTYNAME": "Grand Isle County",
        "POPESTIMATE2019": "7235"
      },
      {
        "STATE": "50",
        "COUNTY": "015",
        "STNAME": "Vermont",
        "CTYNAME": "Lamoille County",
        "POPESTIMATE2019": "25362"
      },
      {
        "STATE": "50",
        "COUNTY": "017",
        "STNAME": "Vermont",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "28892"
      },
      {
        "STATE": "50",
        "COUNTY": "019",
        "STNAME": "Vermont",
        "CTYNAME": "Orleans County",
        "POPESTIMATE2019": "27037"
      },
      {
        "STATE": "50",
        "COUNTY": "021",
        "STNAME": "Vermont",
        "CTYNAME": "Rutland County",
        "POPESTIMATE2019": "58191"
      },
      {
        "STATE": "50",
        "COUNTY": "023",
        "STNAME": "Vermont",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "58409"
      },
      {
        "STATE": "50",
        "COUNTY": "025",
        "STNAME": "Vermont",
        "CTYNAME": "Windham County",
        "POPESTIMATE2019": "42222"
      },
      {
        "STATE": "50",
        "COUNTY": "027",
        "STNAME": "Vermont",
        "CTYNAME": "Windsor County",
        "POPESTIMATE2019": "55062"
      },
      {
        "STATE": "51",
        "COUNTY": "000",
        "STNAME": "Virginia",
        "CTYNAME": "Virginia",
        "POPESTIMATE2019": "8535519"
      },
      {
        "STATE": "51",
        "COUNTY": "001",
        "STNAME": "Virginia",
        "CTYNAME": "Accomack County",
        "POPESTIMATE2019": "32316"
      },
      {
        "STATE": "51",
        "COUNTY": "003",
        "STNAME": "Virginia",
        "CTYNAME": "Albemarle County",
        "POPESTIMATE2019": "109330"
      },
      {
        "STATE": "51",
        "COUNTY": "005",
        "STNAME": "Virginia",
        "CTYNAME": "Alleghany County",
        "POPESTIMATE2019": "14860"
      },
      {
        "STATE": "51",
        "COUNTY": "007",
        "STNAME": "Virginia",
        "CTYNAME": "Amelia County",
        "POPESTIMATE2019": "13145"
      },
      {
        "STATE": "51",
        "COUNTY": "009",
        "STNAME": "Virginia",
        "CTYNAME": "Amherst County",
        "POPESTIMATE2019": "31605"
      },
      {
        "STATE": "51",
        "COUNTY": "011",
        "STNAME": "Virginia",
        "CTYNAME": "Appomattox County",
        "POPESTIMATE2019": "15911"
      },
      {
        "STATE": "51",
        "COUNTY": "013",
        "STNAME": "Virginia",
        "CTYNAME": "Arlington County",
        "POPESTIMATE2019": "236842"
      },
      {
        "STATE": "51",
        "COUNTY": "015",
        "STNAME": "Virginia",
        "CTYNAME": "Augusta County",
        "POPESTIMATE2019": "75558"
      },
      {
        "STATE": "51",
        "COUNTY": "017",
        "STNAME": "Virginia",
        "CTYNAME": "Bath County",
        "POPESTIMATE2019": "4147"
      },
      {
        "STATE": "51",
        "COUNTY": "019",
        "STNAME": "Virginia",
        "CTYNAME": "Bedford County",
        "POPESTIMATE2019": "78997"
      },
      {
        "STATE": "51",
        "COUNTY": "021",
        "STNAME": "Virginia",
        "CTYNAME": "Bland County",
        "POPESTIMATE2019": "6280"
      },
      {
        "STATE": "51",
        "COUNTY": "023",
        "STNAME": "Virginia",
        "CTYNAME": "Botetourt County",
        "POPESTIMATE2019": "33419"
      },
      {
        "STATE": "51",
        "COUNTY": "025",
        "STNAME": "Virginia",
        "CTYNAME": "Brunswick County",
        "POPESTIMATE2019": "16231"
      },
      {
        "STATE": "51",
        "COUNTY": "027",
        "STNAME": "Virginia",
        "CTYNAME": "Buchanan County",
        "POPESTIMATE2019": "21004"
      },
      {
        "STATE": "51",
        "COUNTY": "029",
        "STNAME": "Virginia",
        "CTYNAME": "Buckingham County",
        "POPESTIMATE2019": "17148"
      },
      {
        "STATE": "51",
        "COUNTY": "031",
        "STNAME": "Virginia",
        "CTYNAME": "Campbell County",
        "POPESTIMATE2019": "54885"
      },
      {
        "STATE": "51",
        "COUNTY": "033",
        "STNAME": "Virginia",
        "CTYNAME": "Caroline County",
        "POPESTIMATE2019": "30725"
      },
      {
        "STATE": "51",
        "COUNTY": "035",
        "STNAME": "Virginia",
        "CTYNAME": "Carroll County",
        "POPESTIMATE2019": "29791"
      },
      {
        "STATE": "51",
        "COUNTY": "036",
        "STNAME": "Virginia",
        "CTYNAME": "Charles City County",
        "POPESTIMATE2019": "6963"
      },
      {
        "STATE": "51",
        "COUNTY": "037",
        "STNAME": "Virginia",
        "CTYNAME": "Charlotte County",
        "POPESTIMATE2019": "11880"
      },
      {
        "STATE": "51",
        "COUNTY": "041",
        "STNAME": "Virginia",
        "CTYNAME": "Chesterfield County",
        "POPESTIMATE2019": "352802"
      },
      {
        "STATE": "51",
        "COUNTY": "043",
        "STNAME": "Virginia",
        "CTYNAME": "Clarke County",
        "POPESTIMATE2019": "14619"
      },
      {
        "STATE": "51",
        "COUNTY": "045",
        "STNAME": "Virginia",
        "CTYNAME": "Craig County",
        "POPESTIMATE2019": "5131"
      },
      {
        "STATE": "51",
        "COUNTY": "047",
        "STNAME": "Virginia",
        "CTYNAME": "Culpeper County",
        "POPESTIMATE2019": "52605"
      },
      {
        "STATE": "51",
        "COUNTY": "049",
        "STNAME": "Virginia",
        "CTYNAME": "Cumberland County",
        "POPESTIMATE2019": "9932"
      },
      {
        "STATE": "51",
        "COUNTY": "051",
        "STNAME": "Virginia",
        "CTYNAME": "Dickenson County",
        "POPESTIMATE2019": "14318"
      },
      {
        "STATE": "51",
        "COUNTY": "053",
        "STNAME": "Virginia",
        "CTYNAME": "Dinwiddie County",
        "POPESTIMATE2019": "28544"
      },
      {
        "STATE": "51",
        "COUNTY": "057",
        "STNAME": "Virginia",
        "CTYNAME": "Essex County",
        "POPESTIMATE2019": "10953"
      },
      {
        "STATE": "51",
        "COUNTY": "059",
        "STNAME": "Virginia",
        "CTYNAME": "Fairfax County",
        "POPESTIMATE2019": "1147532"
      },
      {
        "STATE": "51",
        "COUNTY": "061",
        "STNAME": "Virginia",
        "CTYNAME": "Fauquier County",
        "POPESTIMATE2019": "71222"
      },
      {
        "STATE": "51",
        "COUNTY": "063",
        "STNAME": "Virginia",
        "CTYNAME": "Floyd County",
        "POPESTIMATE2019": "15749"
      },
      {
        "STATE": "51",
        "COUNTY": "065",
        "STNAME": "Virginia",
        "CTYNAME": "Fluvanna County",
        "POPESTIMATE2019": "27270"
      },
      {
        "STATE": "51",
        "COUNTY": "067",
        "STNAME": "Virginia",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "56042"
      },
      {
        "STATE": "51",
        "COUNTY": "069",
        "STNAME": "Virginia",
        "CTYNAME": "Frederick County",
        "POPESTIMATE2019": "89313"
      },
      {
        "STATE": "51",
        "COUNTY": "071",
        "STNAME": "Virginia",
        "CTYNAME": "Giles County",
        "POPESTIMATE2019": "16720"
      },
      {
        "STATE": "51",
        "COUNTY": "073",
        "STNAME": "Virginia",
        "CTYNAME": "Gloucester County",
        "POPESTIMATE2019": "37348"
      },
      {
        "STATE": "51",
        "COUNTY": "075",
        "STNAME": "Virginia",
        "CTYNAME": "Goochland County",
        "POPESTIMATE2019": "23753"
      },
      {
        "STATE": "51",
        "COUNTY": "077",
        "STNAME": "Virginia",
        "CTYNAME": "Grayson County",
        "POPESTIMATE2019": "15550"
      },
      {
        "STATE": "51",
        "COUNTY": "079",
        "STNAME": "Virginia",
        "CTYNAME": "Greene County",
        "POPESTIMATE2019": "19819"
      },
      {
        "STATE": "51",
        "COUNTY": "081",
        "STNAME": "Virginia",
        "CTYNAME": "Greensville County",
        "POPESTIMATE2019": "11336"
      },
      {
        "STATE": "51",
        "COUNTY": "083",
        "STNAME": "Virginia",
        "CTYNAME": "Halifax County",
        "POPESTIMATE2019": "33911"
      },
      {
        "STATE": "51",
        "COUNTY": "085",
        "STNAME": "Virginia",
        "CTYNAME": "Hanover County",
        "POPESTIMATE2019": "107766"
      },
      {
        "STATE": "51",
        "COUNTY": "087",
        "STNAME": "Virginia",
        "CTYNAME": "Henrico County",
        "POPESTIMATE2019": "330818"
      },
      {
        "STATE": "51",
        "COUNTY": "089",
        "STNAME": "Virginia",
        "CTYNAME": "Henry County",
        "POPESTIMATE2019": "50557"
      },
      {
        "STATE": "51",
        "COUNTY": "091",
        "STNAME": "Virginia",
        "CTYNAME": "Highland County",
        "POPESTIMATE2019": "2190"
      },
      {
        "STATE": "51",
        "COUNTY": "093",
        "STNAME": "Virginia",
        "CTYNAME": "Isle of Wight County",
        "POPESTIMATE2019": "37109"
      },
      {
        "STATE": "51",
        "COUNTY": "095",
        "STNAME": "Virginia",
        "CTYNAME": "James City County",
        "POPESTIMATE2019": "76523"
      },
      {
        "STATE": "51",
        "COUNTY": "097",
        "STNAME": "Virginia",
        "CTYNAME": "King and Queen County",
        "POPESTIMATE2019": "7025"
      },
      {
        "STATE": "51",
        "COUNTY": "099",
        "STNAME": "Virginia",
        "CTYNAME": "King George County",
        "POPESTIMATE2019": "26836"
      },
      {
        "STATE": "51",
        "COUNTY": "101",
        "STNAME": "Virginia",
        "CTYNAME": "King William County",
        "POPESTIMATE2019": "17148"
      },
      {
        "STATE": "51",
        "COUNTY": "103",
        "STNAME": "Virginia",
        "CTYNAME": "Lancaster County",
        "POPESTIMATE2019": "10603"
      },
      {
        "STATE": "51",
        "COUNTY": "105",
        "STNAME": "Virginia",
        "CTYNAME": "Lee County",
        "POPESTIMATE2019": "23423"
      },
      {
        "STATE": "51",
        "COUNTY": "107",
        "STNAME": "Virginia",
        "CTYNAME": "Loudoun County",
        "POPESTIMATE2019": "413538"
      },
      {
        "STATE": "51",
        "COUNTY": "109",
        "STNAME": "Virginia",
        "CTYNAME": "Louisa County",
        "POPESTIMATE2019": "37591"
      },
      {
        "STATE": "51",
        "COUNTY": "111",
        "STNAME": "Virginia",
        "CTYNAME": "Lunenburg County",
        "POPESTIMATE2019": "12196"
      },
      {
        "STATE": "51",
        "COUNTY": "113",
        "STNAME": "Virginia",
        "CTYNAME": "Madison County",
        "POPESTIMATE2019": "13261"
      },
      {
        "STATE": "51",
        "COUNTY": "115",
        "STNAME": "Virginia",
        "CTYNAME": "Mathews County",
        "POPESTIMATE2019": "8834"
      },
      {
        "STATE": "51",
        "COUNTY": "117",
        "STNAME": "Virginia",
        "CTYNAME": "Mecklenburg County",
        "POPESTIMATE2019": "30587"
      },
      {
        "STATE": "51",
        "COUNTY": "119",
        "STNAME": "Virginia",
        "CTYNAME": "Middlesex County",
        "POPESTIMATE2019": "10582"
      },
      {
        "STATE": "51",
        "COUNTY": "121",
        "STNAME": "Virginia",
        "CTYNAME": "Montgomery County",
        "POPESTIMATE2019": "98535"
      },
      {
        "STATE": "51",
        "COUNTY": "125",
        "STNAME": "Virginia",
        "CTYNAME": "Nelson County",
        "POPESTIMATE2019": "14930"
      },
      {
        "STATE": "51",
        "COUNTY": "127",
        "STNAME": "Virginia",
        "CTYNAME": "New Kent County",
        "POPESTIMATE2019": "23091"
      },
      {
        "STATE": "51",
        "COUNTY": "131",
        "STNAME": "Virginia",
        "CTYNAME": "Northampton County",
        "POPESTIMATE2019": "11710"
      },
      {
        "STATE": "51",
        "COUNTY": "133",
        "STNAME": "Virginia",
        "CTYNAME": "Northumberland County",
        "POPESTIMATE2019": "12095"
      },
      {
        "STATE": "51",
        "COUNTY": "135",
        "STNAME": "Virginia",
        "CTYNAME": "Nottoway County",
        "POPESTIMATE2019": "15232"
      },
      {
        "STATE": "51",
        "COUNTY": "137",
        "STNAME": "Virginia",
        "CTYNAME": "Orange County",
        "POPESTIMATE2019": "37051"
      },
      {
        "STATE": "51",
        "COUNTY": "139",
        "STNAME": "Virginia",
        "CTYNAME": "Page County",
        "POPESTIMATE2019": "23902"
      },
      {
        "STATE": "51",
        "COUNTY": "141",
        "STNAME": "Virginia",
        "CTYNAME": "Patrick County",
        "POPESTIMATE2019": "17608"
      },
      {
        "STATE": "51",
        "COUNTY": "143",
        "STNAME": "Virginia",
        "CTYNAME": "Pittsylvania County",
        "POPESTIMATE2019": "60354"
      },
      {
        "STATE": "51",
        "COUNTY": "145",
        "STNAME": "Virginia",
        "CTYNAME": "Powhatan County",
        "POPESTIMATE2019": "29652"
      },
      {
        "STATE": "51",
        "COUNTY": "147",
        "STNAME": "Virginia",
        "CTYNAME": "Prince Edward County",
        "POPESTIMATE2019": "22802"
      },
      {
        "STATE": "51",
        "COUNTY": "149",
        "STNAME": "Virginia",
        "CTYNAME": "Prince George County",
        "POPESTIMATE2019": "38353"
      },
      {
        "STATE": "51",
        "COUNTY": "153",
        "STNAME": "Virginia",
        "CTYNAME": "Prince William County",
        "POPESTIMATE2019": "470335"
      },
      {
        "STATE": "51",
        "COUNTY": "155",
        "STNAME": "Virginia",
        "CTYNAME": "Pulaski County",
        "POPESTIMATE2019": "34027"
      },
      {
        "STATE": "51",
        "COUNTY": "157",
        "STNAME": "Virginia",
        "CTYNAME": "Rappahannock County",
        "POPESTIMATE2019": "7370"
      },
      {
        "STATE": "51",
        "COUNTY": "159",
        "STNAME": "Virginia",
        "CTYNAME": "Richmond County",
        "POPESTIMATE2019": "9023"
      },
      {
        "STATE": "51",
        "COUNTY": "161",
        "STNAME": "Virginia",
        "CTYNAME": "Roanoke County",
        "POPESTIMATE2019": "94186"
      },
      {
        "STATE": "51",
        "COUNTY": "163",
        "STNAME": "Virginia",
        "CTYNAME": "Rockbridge County",
        "POPESTIMATE2019": "22573"
      },
      {
        "STATE": "51",
        "COUNTY": "165",
        "STNAME": "Virginia",
        "CTYNAME": "Rockingham County",
        "POPESTIMATE2019": "81948"
      },
      {
        "STATE": "51",
        "COUNTY": "167",
        "STNAME": "Virginia",
        "CTYNAME": "Russell County",
        "POPESTIMATE2019": "26586"
      },
      {
        "STATE": "51",
        "COUNTY": "169",
        "STNAME": "Virginia",
        "CTYNAME": "Scott County",
        "POPESTIMATE2019": "21566"
      },
      {
        "STATE": "51",
        "COUNTY": "171",
        "STNAME": "Virginia",
        "CTYNAME": "Shenandoah County",
        "POPESTIMATE2019": "43616"
      },
      {
        "STATE": "51",
        "COUNTY": "173",
        "STNAME": "Virginia",
        "CTYNAME": "Smyth County",
        "POPESTIMATE2019": "30104"
      },
      {
        "STATE": "51",
        "COUNTY": "175",
        "STNAME": "Virginia",
        "CTYNAME": "Southampton County",
        "POPESTIMATE2019": "17631"
      },
      {
        "STATE": "51",
        "COUNTY": "177",
        "STNAME": "Virginia",
        "CTYNAME": "Spotsylvania County",
        "POPESTIMATE2019": "136215"
      },
      {
        "STATE": "51",
        "COUNTY": "179",
        "STNAME": "Virginia",
        "CTYNAME": "Stafford County",
        "POPESTIMATE2019": "152882"
      },
      {
        "STATE": "51",
        "COUNTY": "181",
        "STNAME": "Virginia",
        "CTYNAME": "Surry County",
        "POPESTIMATE2019": "6422"
      },
      {
        "STATE": "51",
        "COUNTY": "183",
        "STNAME": "Virginia",
        "CTYNAME": "Sussex County",
        "POPESTIMATE2019": "11159"
      },
      {
        "STATE": "51",
        "COUNTY": "185",
        "STNAME": "Virginia",
        "CTYNAME": "Tazewell County",
        "POPESTIMATE2019": "40595"
      },
      {
        "STATE": "51",
        "COUNTY": "187",
        "STNAME": "Virginia",
        "CTYNAME": "Warren County",
        "POPESTIMATE2019": "40164"
      },
      {
        "STATE": "51",
        "COUNTY": "191",
        "STNAME": "Virginia",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "53740"
      },
      {
        "STATE": "51",
        "COUNTY": "193",
        "STNAME": "Virginia",
        "CTYNAME": "Westmoreland County",
        "POPESTIMATE2019": "18015"
      },
      {
        "STATE": "51",
        "COUNTY": "195",
        "STNAME": "Virginia",
        "CTYNAME": "Wise County",
        "POPESTIMATE2019": "37383"
      },
      {
        "STATE": "51",
        "COUNTY": "197",
        "STNAME": "Virginia",
        "CTYNAME": "Wythe County",
        "POPESTIMATE2019": "28684"
      },
      {
        "STATE": "51",
        "COUNTY": "199",
        "STNAME": "Virginia",
        "CTYNAME": "York County",
        "POPESTIMATE2019": "68280"
      },
      {
        "STATE": "51",
        "COUNTY": "510",
        "STNAME": "Virginia",
        "CTYNAME": "Alexandria city",
        "POPESTIMATE2019": "159428"
      },
      {
        "STATE": "51",
        "COUNTY": "520",
        "STNAME": "Virginia",
        "CTYNAME": "Bristol city",
        "POPESTIMATE2019": "16762"
      },
      {
        "STATE": "51",
        "COUNTY": "530",
        "STNAME": "Virginia",
        "CTYNAME": "Buena Vista city",
        "POPESTIMATE2019": "6478"
      },
      {
        "STATE": "51",
        "COUNTY": "540",
        "STNAME": "Virginia",
        "CTYNAME": "Charlottesville city",
        "POPESTIMATE2019": "47266"
      },
      {
        "STATE": "51",
        "COUNTY": "550",
        "STNAME": "Virginia",
        "CTYNAME": "Chesapeake city",
        "POPESTIMATE2019": "244835"
      },
      {
        "STATE": "51",
        "COUNTY": "570",
        "STNAME": "Virginia",
        "CTYNAME": "Colonial Heights city",
        "POPESTIMATE2019": "17370"
      },
      {
        "STATE": "51",
        "COUNTY": "580",
        "STNAME": "Virginia",
        "CTYNAME": "Covington city",
        "POPESTIMATE2019": "5538"
      },
      {
        "STATE": "51",
        "COUNTY": "590",
        "STNAME": "Virginia",
        "CTYNAME": "Danville city",
        "POPESTIMATE2019": "40044"
      },
      {
        "STATE": "51",
        "COUNTY": "595",
        "STNAME": "Virginia",
        "CTYNAME": "Emporia city",
        "POPESTIMATE2019": "5346"
      },
      {
        "STATE": "51",
        "COUNTY": "600",
        "STNAME": "Virginia",
        "CTYNAME": "Fairfax city",
        "POPESTIMATE2019": "24019"
      },
      {
        "STATE": "51",
        "COUNTY": "610",
        "STNAME": "Virginia",
        "CTYNAME": "Falls Church city",
        "POPESTIMATE2019": "14617"
      },
      {
        "STATE": "51",
        "COUNTY": "620",
        "STNAME": "Virginia",
        "CTYNAME": "Franklin city",
        "POPESTIMATE2019": "7967"
      },
      {
        "STATE": "51",
        "COUNTY": "630",
        "STNAME": "Virginia",
        "CTYNAME": "Fredericksburg city",
        "POPESTIMATE2019": "29036"
      },
      {
        "STATE": "51",
        "COUNTY": "640",
        "STNAME": "Virginia",
        "CTYNAME": "Galax city",
        "POPESTIMATE2019": "6347"
      },
      {
        "STATE": "51",
        "COUNTY": "650",
        "STNAME": "Virginia",
        "CTYNAME": "Hampton city",
        "POPESTIMATE2019": "134510"
      },
      {
        "STATE": "51",
        "COUNTY": "660",
        "STNAME": "Virginia",
        "CTYNAME": "Harrisonburg city",
        "POPESTIMATE2019": "53016"
      },
      {
        "STATE": "51",
        "COUNTY": "670",
        "STNAME": "Virginia",
        "CTYNAME": "Hopewell city",
        "POPESTIMATE2019": "22529"
      },
      {
        "STATE": "51",
        "COUNTY": "678",
        "STNAME": "Virginia",
        "CTYNAME": "Lexington city",
        "POPESTIMATE2019": "7446"
      },
      {
        "STATE": "51",
        "COUNTY": "680",
        "STNAME": "Virginia",
        "CTYNAME": "Lynchburg city",
        "POPESTIMATE2019": "82168"
      },
      {
        "STATE": "51",
        "COUNTY": "683",
        "STNAME": "Virginia",
        "CTYNAME": "Manassas city",
        "POPESTIMATE2019": "41085"
      },
      {
        "STATE": "51",
        "COUNTY": "685",
        "STNAME": "Virginia",
        "CTYNAME": "Manassas Park city",
        "POPESTIMATE2019": "17478"
      },
      {
        "STATE": "51",
        "COUNTY": "690",
        "STNAME": "Virginia",
        "CTYNAME": "Martinsville city",
        "POPESTIMATE2019": "12554"
      },
      {
        "STATE": "51",
        "COUNTY": "700",
        "STNAME": "Virginia",
        "CTYNAME": "Newport News city",
        "POPESTIMATE2019": "179225"
      },
      {
        "STATE": "51",
        "COUNTY": "710",
        "STNAME": "Virginia",
        "CTYNAME": "Norfolk city",
        "POPESTIMATE2019": "242742"
      },
      {
        "STATE": "51",
        "COUNTY": "720",
        "STNAME": "Virginia",
        "CTYNAME": "Norton city",
        "POPESTIMATE2019": "3981"
      },
      {
        "STATE": "51",
        "COUNTY": "730",
        "STNAME": "Virginia",
        "CTYNAME": "Petersburg city",
        "POPESTIMATE2019": "31346"
      },
      {
        "STATE": "51",
        "COUNTY": "735",
        "STNAME": "Virginia",
        "CTYNAME": "Poquoson city",
        "POPESTIMATE2019": "12271"
      },
      {
        "STATE": "51",
        "COUNTY": "740",
        "STNAME": "Virginia",
        "CTYNAME": "Portsmouth city",
        "POPESTIMATE2019": "94398"
      },
      {
        "STATE": "51",
        "COUNTY": "750",
        "STNAME": "Virginia",
        "CTYNAME": "Radford city",
        "POPESTIMATE2019": "18249"
      },
      {
        "STATE": "51",
        "COUNTY": "760",
        "STNAME": "Virginia",
        "CTYNAME": "Richmond city",
        "POPESTIMATE2019": "230436"
      },
      {
        "STATE": "51",
        "COUNTY": "770",
        "STNAME": "Virginia",
        "CTYNAME": "Roanoke city",
        "POPESTIMATE2019": "99143"
      },
      {
        "STATE": "51",
        "COUNTY": "775",
        "STNAME": "Virginia",
        "CTYNAME": "Salem city",
        "POPESTIMATE2019": "25301"
      },
      {
        "STATE": "51",
        "COUNTY": "790",
        "STNAME": "Virginia",
        "CTYNAME": "Staunton city",
        "POPESTIMATE2019": "24932"
      },
      {
        "STATE": "51",
        "COUNTY": "800",
        "STNAME": "Virginia",
        "CTYNAME": "Suffolk city",
        "POPESTIMATE2019": "92108"
      },
      {
        "STATE": "51",
        "COUNTY": "810",
        "STNAME": "Virginia",
        "CTYNAME": "Virginia Beach city",
        "POPESTIMATE2019": "449974"
      },
      {
        "STATE": "51",
        "COUNTY": "820",
        "STNAME": "Virginia",
        "CTYNAME": "Waynesboro city",
        "POPESTIMATE2019": "22630"
      },
      {
        "STATE": "51",
        "COUNTY": "830",
        "STNAME": "Virginia",
        "CTYNAME": "Williamsburg city",
        "POPESTIMATE2019": "14954"
      },
      {
        "STATE": "51",
        "COUNTY": "840",
        "STNAME": "Virginia",
        "CTYNAME": "Winchester city",
        "POPESTIMATE2019": "28078"
      },
      {
        "STATE": "53",
        "COUNTY": "000",
        "STNAME": "Washington",
        "CTYNAME": "Washington",
        "POPESTIMATE2019": "7614893"
      },
      {
        "STATE": "53",
        "COUNTY": "001",
        "STNAME": "Washington",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "19983"
      },
      {
        "STATE": "53",
        "COUNTY": "003",
        "STNAME": "Washington",
        "CTYNAME": "Asotin County",
        "POPESTIMATE2019": "22582"
      },
      {
        "STATE": "53",
        "COUNTY": "005",
        "STNAME": "Washington",
        "CTYNAME": "Benton County",
        "POPESTIMATE2019": "204390"
      },
      {
        "STATE": "53",
        "COUNTY": "007",
        "STNAME": "Washington",
        "CTYNAME": "Chelan County",
        "POPESTIMATE2019": "77200"
      },
      {
        "STATE": "53",
        "COUNTY": "009",
        "STNAME": "Washington",
        "CTYNAME": "Clallam County",
        "POPESTIMATE2019": "77331"
      },
      {
        "STATE": "53",
        "COUNTY": "011",
        "STNAME": "Washington",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "488241"
      },
      {
        "STATE": "53",
        "COUNTY": "013",
        "STNAME": "Washington",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "3985"
      },
      {
        "STATE": "53",
        "COUNTY": "015",
        "STNAME": "Washington",
        "CTYNAME": "Cowlitz County",
        "POPESTIMATE2019": "110593"
      },
      {
        "STATE": "53",
        "COUNTY": "017",
        "STNAME": "Washington",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "43429"
      },
      {
        "STATE": "53",
        "COUNTY": "019",
        "STNAME": "Washington",
        "CTYNAME": "Ferry County",
        "POPESTIMATE2019": "7627"
      },
      {
        "STATE": "53",
        "COUNTY": "021",
        "STNAME": "Washington",
        "CTYNAME": "Franklin County",
        "POPESTIMATE2019": "95222"
      },
      {
        "STATE": "53",
        "COUNTY": "023",
        "STNAME": "Washington",
        "CTYNAME": "Garfield County",
        "POPESTIMATE2019": "2225"
      },
      {
        "STATE": "53",
        "COUNTY": "025",
        "STNAME": "Washington",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "97733"
      },
      {
        "STATE": "53",
        "COUNTY": "027",
        "STNAME": "Washington",
        "CTYNAME": "Grays Harbor County",
        "POPESTIMATE2019": "75061"
      },
      {
        "STATE": "53",
        "COUNTY": "029",
        "STNAME": "Washington",
        "CTYNAME": "Island County",
        "POPESTIMATE2019": "85141"
      },
      {
        "STATE": "53",
        "COUNTY": "031",
        "STNAME": "Washington",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "32221"
      },
      {
        "STATE": "53",
        "COUNTY": "033",
        "STNAME": "Washington",
        "CTYNAME": "King County",
        "POPESTIMATE2019": "2252782"
      },
      {
        "STATE": "53",
        "COUNTY": "035",
        "STNAME": "Washington",
        "CTYNAME": "Kitsap County",
        "POPESTIMATE2019": "271473"
      },
      {
        "STATE": "53",
        "COUNTY": "037",
        "STNAME": "Washington",
        "CTYNAME": "Kittitas County",
        "POPESTIMATE2019": "47935"
      },
      {
        "STATE": "53",
        "COUNTY": "039",
        "STNAME": "Washington",
        "CTYNAME": "Klickitat County",
        "POPESTIMATE2019": "22425"
      },
      {
        "STATE": "53",
        "COUNTY": "041",
        "STNAME": "Washington",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "80707"
      },
      {
        "STATE": "53",
        "COUNTY": "043",
        "STNAME": "Washington",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "10939"
      },
      {
        "STATE": "53",
        "COUNTY": "045",
        "STNAME": "Washington",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "66768"
      },
      {
        "STATE": "53",
        "COUNTY": "047",
        "STNAME": "Washington",
        "CTYNAME": "Okanogan County",
        "POPESTIMATE2019": "42243"
      },
      {
        "STATE": "53",
        "COUNTY": "049",
        "STNAME": "Washington",
        "CTYNAME": "Pacific County",
        "POPESTIMATE2019": "22471"
      },
      {
        "STATE": "53",
        "COUNTY": "051",
        "STNAME": "Washington",
        "CTYNAME": "Pend Oreille County",
        "POPESTIMATE2019": "13724"
      },
      {
        "STATE": "53",
        "COUNTY": "053",
        "STNAME": "Washington",
        "CTYNAME": "Pierce County",
        "POPESTIMATE2019": "904980"
      },
      {
        "STATE": "53",
        "COUNTY": "055",
        "STNAME": "Washington",
        "CTYNAME": "San Juan County",
        "POPESTIMATE2019": "17582"
      },
      {
        "STATE": "53",
        "COUNTY": "057",
        "STNAME": "Washington",
        "CTYNAME": "Skagit County",
        "POPESTIMATE2019": "129205"
      },
      {
        "STATE": "53",
        "COUNTY": "059",
        "STNAME": "Washington",
        "CTYNAME": "Skamania County",
        "POPESTIMATE2019": "12083"
      },
      {
        "STATE": "53",
        "COUNTY": "061",
        "STNAME": "Washington",
        "CTYNAME": "Snohomish County",
        "POPESTIMATE2019": "822083"
      },
      {
        "STATE": "53",
        "COUNTY": "063",
        "STNAME": "Washington",
        "CTYNAME": "Spokane County",
        "POPESTIMATE2019": "522798"
      },
      {
        "STATE": "53",
        "COUNTY": "065",
        "STNAME": "Washington",
        "CTYNAME": "Stevens County",
        "POPESTIMATE2019": "45723"
      },
      {
        "STATE": "53",
        "COUNTY": "067",
        "STNAME": "Washington",
        "CTYNAME": "Thurston County",
        "POPESTIMATE2019": "290536"
      },
      {
        "STATE": "53",
        "COUNTY": "069",
        "STNAME": "Washington",
        "CTYNAME": "Wahkiakum County",
        "POPESTIMATE2019": "4488"
      },
      {
        "STATE": "53",
        "COUNTY": "071",
        "STNAME": "Washington",
        "CTYNAME": "Walla Walla County",
        "POPESTIMATE2019": "60760"
      },
      {
        "STATE": "53",
        "COUNTY": "073",
        "STNAME": "Washington",
        "CTYNAME": "Whatcom County",
        "POPESTIMATE2019": "229247"
      },
      {
        "STATE": "53",
        "COUNTY": "075",
        "STNAME": "Washington",
        "CTYNAME": "Whitman County",
        "POPESTIMATE2019": "50104"
      },
      {
        "STATE": "53",
        "COUNTY": "077",
        "STNAME": "Washington",
        "CTYNAME": "Yakima County",
        "POPESTIMATE2019": "250873"
      },
      {
        "STATE": "54",
        "COUNTY": "000",
        "STNAME": "West Virginia",
        "CTYNAME": "West Virginia",
        "POPESTIMATE2019": "1792147"
      },
      {
        "STATE": "54",
        "COUNTY": "001",
        "STNAME": "West Virginia",
        "CTYNAME": "Barbour County",
        "POPESTIMATE2019": "16441"
      },
      {
        "STATE": "54",
        "COUNTY": "003",
        "STNAME": "West Virginia",
        "CTYNAME": "Berkeley County",
        "POPESTIMATE2019": "119171"
      },
      {
        "STATE": "54",
        "COUNTY": "005",
        "STNAME": "West Virginia",
        "CTYNAME": "Boone County",
        "POPESTIMATE2019": "21457"
      },
      {
        "STATE": "54",
        "COUNTY": "007",
        "STNAME": "West Virginia",
        "CTYNAME": "Braxton County",
        "POPESTIMATE2019": "13957"
      },
      {
        "STATE": "54",
        "COUNTY": "009",
        "STNAME": "West Virginia",
        "CTYNAME": "Brooke County",
        "POPESTIMATE2019": "21939"
      },
      {
        "STATE": "54",
        "COUNTY": "011",
        "STNAME": "West Virginia",
        "CTYNAME": "Cabell County",
        "POPESTIMATE2019": "91945"
      },
      {
        "STATE": "54",
        "COUNTY": "013",
        "STNAME": "West Virginia",
        "CTYNAME": "Calhoun County",
        "POPESTIMATE2019": "7109"
      },
      {
        "STATE": "54",
        "COUNTY": "015",
        "STNAME": "West Virginia",
        "CTYNAME": "Clay County",
        "POPESTIMATE2019": "8508"
      },
      {
        "STATE": "54",
        "COUNTY": "017",
        "STNAME": "West Virginia",
        "CTYNAME": "Doddridge County",
        "POPESTIMATE2019": "8448"
      },
      {
        "STATE": "54",
        "COUNTY": "019",
        "STNAME": "West Virginia",
        "CTYNAME": "Fayette County",
        "POPESTIMATE2019": "42406"
      },
      {
        "STATE": "54",
        "COUNTY": "021",
        "STNAME": "West Virginia",
        "CTYNAME": "Gilmer County",
        "POPESTIMATE2019": "7823"
      },
      {
        "STATE": "54",
        "COUNTY": "023",
        "STNAME": "West Virginia",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "11568"
      },
      {
        "STATE": "54",
        "COUNTY": "025",
        "STNAME": "West Virginia",
        "CTYNAME": "Greenbrier County",
        "POPESTIMATE2019": "34662"
      },
      {
        "STATE": "54",
        "COUNTY": "027",
        "STNAME": "West Virginia",
        "CTYNAME": "Hampshire County",
        "POPESTIMATE2019": "23175"
      },
      {
        "STATE": "54",
        "COUNTY": "029",
        "STNAME": "West Virginia",
        "CTYNAME": "Hancock County",
        "POPESTIMATE2019": "28810"
      },
      {
        "STATE": "54",
        "COUNTY": "031",
        "STNAME": "West Virginia",
        "CTYNAME": "Hardy County",
        "POPESTIMATE2019": "13776"
      },
      {
        "STATE": "54",
        "COUNTY": "033",
        "STNAME": "West Virginia",
        "CTYNAME": "Harrison County",
        "POPESTIMATE2019": "67256"
      },
      {
        "STATE": "54",
        "COUNTY": "035",
        "STNAME": "West Virginia",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "28576"
      },
      {
        "STATE": "54",
        "COUNTY": "037",
        "STNAME": "West Virginia",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "57146"
      },
      {
        "STATE": "54",
        "COUNTY": "039",
        "STNAME": "West Virginia",
        "CTYNAME": "Kanawha County",
        "POPESTIMATE2019": "178124"
      },
      {
        "STATE": "54",
        "COUNTY": "041",
        "STNAME": "West Virginia",
        "CTYNAME": "Lewis County",
        "POPESTIMATE2019": "15907"
      },
      {
        "STATE": "54",
        "COUNTY": "043",
        "STNAME": "West Virginia",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "20409"
      },
      {
        "STATE": "54",
        "COUNTY": "045",
        "STNAME": "West Virginia",
        "CTYNAME": "Logan County",
        "POPESTIMATE2019": "32019"
      },
      {
        "STATE": "54",
        "COUNTY": "047",
        "STNAME": "West Virginia",
        "CTYNAME": "McDowell County",
        "POPESTIMATE2019": "17624"
      },
      {
        "STATE": "54",
        "COUNTY": "049",
        "STNAME": "West Virginia",
        "CTYNAME": "Marion County",
        "POPESTIMATE2019": "56072"
      },
      {
        "STATE": "54",
        "COUNTY": "051",
        "STNAME": "West Virginia",
        "CTYNAME": "Marshall County",
        "POPESTIMATE2019": "30531"
      },
      {
        "STATE": "54",
        "COUNTY": "053",
        "STNAME": "West Virginia",
        "CTYNAME": "Mason County",
        "POPESTIMATE2019": "26516"
      },
      {
        "STATE": "54",
        "COUNTY": "055",
        "STNAME": "West Virginia",
        "CTYNAME": "Mercer County",
        "POPESTIMATE2019": "58758"
      },
      {
        "STATE": "54",
        "COUNTY": "057",
        "STNAME": "West Virginia",
        "CTYNAME": "Mineral County",
        "POPESTIMATE2019": "26868"
      },
      {
        "STATE": "54",
        "COUNTY": "059",
        "STNAME": "West Virginia",
        "CTYNAME": "Mingo County",
        "POPESTIMATE2019": "23424"
      },
      {
        "STATE": "54",
        "COUNTY": "061",
        "STNAME": "West Virginia",
        "CTYNAME": "Monongalia County",
        "POPESTIMATE2019": "105612"
      },
      {
        "STATE": "54",
        "COUNTY": "063",
        "STNAME": "West Virginia",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "13275"
      },
      {
        "STATE": "54",
        "COUNTY": "065",
        "STNAME": "West Virginia",
        "CTYNAME": "Morgan County",
        "POPESTIMATE2019": "17884"
      },
      {
        "STATE": "54",
        "COUNTY": "067",
        "STNAME": "West Virginia",
        "CTYNAME": "Nicholas County",
        "POPESTIMATE2019": "24496"
      },
      {
        "STATE": "54",
        "COUNTY": "069",
        "STNAME": "West Virginia",
        "CTYNAME": "Ohio County",
        "POPESTIMATE2019": "41411"
      },
      {
        "STATE": "54",
        "COUNTY": "071",
        "STNAME": "West Virginia",
        "CTYNAME": "Pendleton County",
        "POPESTIMATE2019": "6969"
      },
      {
        "STATE": "54",
        "COUNTY": "073",
        "STNAME": "West Virginia",
        "CTYNAME": "Pleasants County",
        "POPESTIMATE2019": "7460"
      },
      {
        "STATE": "54",
        "COUNTY": "075",
        "STNAME": "West Virginia",
        "CTYNAME": "Pocahontas County",
        "POPESTIMATE2019": "8247"
      },
      {
        "STATE": "54",
        "COUNTY": "077",
        "STNAME": "West Virginia",
        "CTYNAME": "Preston County",
        "POPESTIMATE2019": "33432"
      },
      {
        "STATE": "54",
        "COUNTY": "079",
        "STNAME": "West Virginia",
        "CTYNAME": "Putnam County",
        "POPESTIMATE2019": "56450"
      },
      {
        "STATE": "54",
        "COUNTY": "081",
        "STNAME": "West Virginia",
        "CTYNAME": "Raleigh County",
        "POPESTIMATE2019": "73361"
      },
      {
        "STATE": "54",
        "COUNTY": "083",
        "STNAME": "West Virginia",
        "CTYNAME": "Randolph County",
        "POPESTIMATE2019": "28695"
      },
      {
        "STATE": "54",
        "COUNTY": "085",
        "STNAME": "West Virginia",
        "CTYNAME": "Ritchie County",
        "POPESTIMATE2019": "9554"
      },
      {
        "STATE": "54",
        "COUNTY": "087",
        "STNAME": "West Virginia",
        "CTYNAME": "Roane County",
        "POPESTIMATE2019": "13688"
      },
      {
        "STATE": "54",
        "COUNTY": "089",
        "STNAME": "West Virginia",
        "CTYNAME": "Summers County",
        "POPESTIMATE2019": "12573"
      },
      {
        "STATE": "54",
        "COUNTY": "091",
        "STNAME": "West Virginia",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "16695"
      },
      {
        "STATE": "54",
        "COUNTY": "093",
        "STNAME": "West Virginia",
        "CTYNAME": "Tucker County",
        "POPESTIMATE2019": "6839"
      },
      {
        "STATE": "54",
        "COUNTY": "095",
        "STNAME": "West Virginia",
        "CTYNAME": "Tyler County",
        "POPESTIMATE2019": "8591"
      },
      {
        "STATE": "54",
        "COUNTY": "097",
        "STNAME": "West Virginia",
        "CTYNAME": "Upshur County",
        "POPESTIMATE2019": "24176"
      },
      {
        "STATE": "54",
        "COUNTY": "099",
        "STNAME": "West Virginia",
        "CTYNAME": "Wayne County",
        "POPESTIMATE2019": "39402"
      },
      {
        "STATE": "54",
        "COUNTY": "101",
        "STNAME": "West Virginia",
        "CTYNAME": "Webster County",
        "POPESTIMATE2019": "8114"
      },
      {
        "STATE": "54",
        "COUNTY": "103",
        "STNAME": "West Virginia",
        "CTYNAME": "Wetzel County",
        "POPESTIMATE2019": "15065"
      },
      {
        "STATE": "54",
        "COUNTY": "105",
        "STNAME": "West Virginia",
        "CTYNAME": "Wirt County",
        "POPESTIMATE2019": "5821"
      },
      {
        "STATE": "54",
        "COUNTY": "107",
        "STNAME": "West Virginia",
        "CTYNAME": "Wood County",
        "POPESTIMATE2019": "83518"
      },
      {
        "STATE": "54",
        "COUNTY": "109",
        "STNAME": "West Virginia",
        "CTYNAME": "Wyoming County",
        "POPESTIMATE2019": "20394"
      },
      {
        "STATE": "55",
        "COUNTY": "000",
        "STNAME": "Wisconsin",
        "CTYNAME": "Wisconsin",
        "POPESTIMATE2019": "5822434"
      },
      {
        "STATE": "55",
        "COUNTY": "001",
        "STNAME": "Wisconsin",
        "CTYNAME": "Adams County",
        "POPESTIMATE2019": "20220"
      },
      {
        "STATE": "55",
        "COUNTY": "003",
        "STNAME": "Wisconsin",
        "CTYNAME": "Ashland County",
        "POPESTIMATE2019": "15562"
      },
      {
        "STATE": "55",
        "COUNTY": "005",
        "STNAME": "Wisconsin",
        "CTYNAME": "Barron County",
        "POPESTIMATE2019": "45244"
      },
      {
        "STATE": "55",
        "COUNTY": "007",
        "STNAME": "Wisconsin",
        "CTYNAME": "Bayfield County",
        "POPESTIMATE2019": "15036"
      },
      {
        "STATE": "55",
        "COUNTY": "009",
        "STNAME": "Wisconsin",
        "CTYNAME": "Brown County",
        "POPESTIMATE2019": "264542"
      },
      {
        "STATE": "55",
        "COUNTY": "011",
        "STNAME": "Wisconsin",
        "CTYNAME": "Buffalo County",
        "POPESTIMATE2019": "13031"
      },
      {
        "STATE": "55",
        "COUNTY": "013",
        "STNAME": "Wisconsin",
        "CTYNAME": "Burnett County",
        "POPESTIMATE2019": "15414"
      },
      {
        "STATE": "55",
        "COUNTY": "015",
        "STNAME": "Wisconsin",
        "CTYNAME": "Calumet County",
        "POPESTIMATE2019": "50089"
      },
      {
        "STATE": "55",
        "COUNTY": "017",
        "STNAME": "Wisconsin",
        "CTYNAME": "Chippewa County",
        "POPESTIMATE2019": "64658"
      },
      {
        "STATE": "55",
        "COUNTY": "019",
        "STNAME": "Wisconsin",
        "CTYNAME": "Clark County",
        "POPESTIMATE2019": "34774"
      },
      {
        "STATE": "55",
        "COUNTY": "021",
        "STNAME": "Wisconsin",
        "CTYNAME": "Columbia County",
        "POPESTIMATE2019": "57532"
      },
      {
        "STATE": "55",
        "COUNTY": "023",
        "STNAME": "Wisconsin",
        "CTYNAME": "Crawford County",
        "POPESTIMATE2019": "16131"
      },
      {
        "STATE": "55",
        "COUNTY": "025",
        "STNAME": "Wisconsin",
        "CTYNAME": "Dane County",
        "POPESTIMATE2019": "546695"
      },
      {
        "STATE": "55",
        "COUNTY": "027",
        "STNAME": "Wisconsin",
        "CTYNAME": "Dodge County",
        "POPESTIMATE2019": "87839"
      },
      {
        "STATE": "55",
        "COUNTY": "029",
        "STNAME": "Wisconsin",
        "CTYNAME": "Door County",
        "POPESTIMATE2019": "27668"
      },
      {
        "STATE": "55",
        "COUNTY": "031",
        "STNAME": "Wisconsin",
        "CTYNAME": "Douglas County",
        "POPESTIMATE2019": "43150"
      },
      {
        "STATE": "55",
        "COUNTY": "033",
        "STNAME": "Wisconsin",
        "CTYNAME": "Dunn County",
        "POPESTIMATE2019": "45368"
      },
      {
        "STATE": "55",
        "COUNTY": "035",
        "STNAME": "Wisconsin",
        "CTYNAME": "Eau Claire County",
        "POPESTIMATE2019": "104646"
      },
      {
        "STATE": "55",
        "COUNTY": "037",
        "STNAME": "Wisconsin",
        "CTYNAME": "Florence County",
        "POPESTIMATE2019": "4295"
      },
      {
        "STATE": "55",
        "COUNTY": "039",
        "STNAME": "Wisconsin",
        "CTYNAME": "Fond du Lac County",
        "POPESTIMATE2019": "103403"
      },
      {
        "STATE": "55",
        "COUNTY": "041",
        "STNAME": "Wisconsin",
        "CTYNAME": "Forest County",
        "POPESTIMATE2019": "9004"
      },
      {
        "STATE": "55",
        "COUNTY": "043",
        "STNAME": "Wisconsin",
        "CTYNAME": "Grant County",
        "POPESTIMATE2019": "51439"
      },
      {
        "STATE": "55",
        "COUNTY": "045",
        "STNAME": "Wisconsin",
        "CTYNAME": "Green County",
        "POPESTIMATE2019": "36960"
      },
      {
        "STATE": "55",
        "COUNTY": "047",
        "STNAME": "Wisconsin",
        "CTYNAME": "Green Lake County",
        "POPESTIMATE2019": "18913"
      },
      {
        "STATE": "55",
        "COUNTY": "049",
        "STNAME": "Wisconsin",
        "CTYNAME": "Iowa County",
        "POPESTIMATE2019": "23678"
      },
      {
        "STATE": "55",
        "COUNTY": "051",
        "STNAME": "Wisconsin",
        "CTYNAME": "Iron County",
        "POPESTIMATE2019": "5687"
      },
      {
        "STATE": "55",
        "COUNTY": "053",
        "STNAME": "Wisconsin",
        "CTYNAME": "Jackson County",
        "POPESTIMATE2019": "20643"
      },
      {
        "STATE": "55",
        "COUNTY": "055",
        "STNAME": "Wisconsin",
        "CTYNAME": "Jefferson County",
        "POPESTIMATE2019": "84769"
      },
      {
        "STATE": "55",
        "COUNTY": "057",
        "STNAME": "Wisconsin",
        "CTYNAME": "Juneau County",
        "POPESTIMATE2019": "26687"
      },
      {
        "STATE": "55",
        "COUNTY": "059",
        "STNAME": "Wisconsin",
        "CTYNAME": "Kenosha County",
        "POPESTIMATE2019": "169561"
      },
      {
        "STATE": "55",
        "COUNTY": "061",
        "STNAME": "Wisconsin",
        "CTYNAME": "Kewaunee County",
        "POPESTIMATE2019": "20434"
      },
      {
        "STATE": "55",
        "COUNTY": "063",
        "STNAME": "Wisconsin",
        "CTYNAME": "La Crosse County",
        "POPESTIMATE2019": "118016"
      },
      {
        "STATE": "55",
        "COUNTY": "065",
        "STNAME": "Wisconsin",
        "CTYNAME": "Lafayette County",
        "POPESTIMATE2019": "16665"
      },
      {
        "STATE": "55",
        "COUNTY": "067",
        "STNAME": "Wisconsin",
        "CTYNAME": "Langlade County",
        "POPESTIMATE2019": "19189"
      },
      {
        "STATE": "55",
        "COUNTY": "069",
        "STNAME": "Wisconsin",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "27593"
      },
      {
        "STATE": "55",
        "COUNTY": "071",
        "STNAME": "Wisconsin",
        "CTYNAME": "Manitowoc County",
        "POPESTIMATE2019": "78981"
      },
      {
        "STATE": "55",
        "COUNTY": "073",
        "STNAME": "Wisconsin",
        "CTYNAME": "Marathon County",
        "POPESTIMATE2019": "135692"
      },
      {
        "STATE": "55",
        "COUNTY": "075",
        "STNAME": "Wisconsin",
        "CTYNAME": "Marinette County",
        "POPESTIMATE2019": "40350"
      },
      {
        "STATE": "55",
        "COUNTY": "077",
        "STNAME": "Wisconsin",
        "CTYNAME": "Marquette County",
        "POPESTIMATE2019": "15574"
      },
      {
        "STATE": "55",
        "COUNTY": "078",
        "STNAME": "Wisconsin",
        "CTYNAME": "Menominee County",
        "POPESTIMATE2019": "4556"
      },
      {
        "STATE": "55",
        "COUNTY": "079",
        "STNAME": "Wisconsin",
        "CTYNAME": "Milwaukee County",
        "POPESTIMATE2019": "945726"
      },
      {
        "STATE": "55",
        "COUNTY": "081",
        "STNAME": "Wisconsin",
        "CTYNAME": "Monroe County",
        "POPESTIMATE2019": "46253"
      },
      {
        "STATE": "55",
        "COUNTY": "083",
        "STNAME": "Wisconsin",
        "CTYNAME": "Oconto County",
        "POPESTIMATE2019": "37930"
      },
      {
        "STATE": "55",
        "COUNTY": "085",
        "STNAME": "Wisconsin",
        "CTYNAME": "Oneida County",
        "POPESTIMATE2019": "35595"
      },
      {
        "STATE": "55",
        "COUNTY": "087",
        "STNAME": "Wisconsin",
        "CTYNAME": "Outagamie County",
        "POPESTIMATE2019": "187885"
      },
      {
        "STATE": "55",
        "COUNTY": "089",
        "STNAME": "Wisconsin",
        "CTYNAME": "Ozaukee County",
        "POPESTIMATE2019": "89221"
      },
      {
        "STATE": "55",
        "COUNTY": "091",
        "STNAME": "Wisconsin",
        "CTYNAME": "Pepin County",
        "POPESTIMATE2019": "7287"
      },
      {
        "STATE": "55",
        "COUNTY": "093",
        "STNAME": "Wisconsin",
        "CTYNAME": "Pierce County",
        "POPESTIMATE2019": "42754"
      },
      {
        "STATE": "55",
        "COUNTY": "095",
        "STNAME": "Wisconsin",
        "CTYNAME": "Polk County",
        "POPESTIMATE2019": "43783"
      },
      {
        "STATE": "55",
        "COUNTY": "097",
        "STNAME": "Wisconsin",
        "CTYNAME": "Portage County",
        "POPESTIMATE2019": "70772"
      },
      {
        "STATE": "55",
        "COUNTY": "099",
        "STNAME": "Wisconsin",
        "CTYNAME": "Price County",
        "POPESTIMATE2019": "13351"
      },
      {
        "STATE": "55",
        "COUNTY": "101",
        "STNAME": "Wisconsin",
        "CTYNAME": "Racine County",
        "POPESTIMATE2019": "196311"
      },
      {
        "STATE": "55",
        "COUNTY": "103",
        "STNAME": "Wisconsin",
        "CTYNAME": "Richland County",
        "POPESTIMATE2019": "17252"
      },
      {
        "STATE": "55",
        "COUNTY": "105",
        "STNAME": "Wisconsin",
        "CTYNAME": "Rock County",
        "POPESTIMATE2019": "163354"
      },
      {
        "STATE": "55",
        "COUNTY": "107",
        "STNAME": "Wisconsin",
        "CTYNAME": "Rusk County",
        "POPESTIMATE2019": "14178"
      },
      {
        "STATE": "55",
        "COUNTY": "109",
        "STNAME": "Wisconsin",
        "CTYNAME": "St. Croix County",
        "POPESTIMATE2019": "90687"
      },
      {
        "STATE": "55",
        "COUNTY": "111",
        "STNAME": "Wisconsin",
        "CTYNAME": "Sauk County",
        "POPESTIMATE2019": "64442"
      },
      {
        "STATE": "55",
        "COUNTY": "113",
        "STNAME": "Wisconsin",
        "CTYNAME": "Sawyer County",
        "POPESTIMATE2019": "16558"
      },
      {
        "STATE": "55",
        "COUNTY": "115",
        "STNAME": "Wisconsin",
        "CTYNAME": "Shawano County",
        "POPESTIMATE2019": "40899"
      },
      {
        "STATE": "55",
        "COUNTY": "117",
        "STNAME": "Wisconsin",
        "CTYNAME": "Sheboygan County",
        "POPESTIMATE2019": "115340"
      },
      {
        "STATE": "55",
        "COUNTY": "119",
        "STNAME": "Wisconsin",
        "CTYNAME": "Taylor County",
        "POPESTIMATE2019": "20343"
      },
      {
        "STATE": "55",
        "COUNTY": "121",
        "STNAME": "Wisconsin",
        "CTYNAME": "Trempealeau County",
        "POPESTIMATE2019": "29649"
      },
      {
        "STATE": "55",
        "COUNTY": "123",
        "STNAME": "Wisconsin",
        "CTYNAME": "Vernon County",
        "POPESTIMATE2019": "30822"
      },
      {
        "STATE": "55",
        "COUNTY": "125",
        "STNAME": "Wisconsin",
        "CTYNAME": "Vilas County",
        "POPESTIMATE2019": "22195"
      },
      {
        "STATE": "55",
        "COUNTY": "127",
        "STNAME": "Wisconsin",
        "CTYNAME": "Walworth County",
        "POPESTIMATE2019": "103868"
      },
      {
        "STATE": "55",
        "COUNTY": "129",
        "STNAME": "Wisconsin",
        "CTYNAME": "Washburn County",
        "POPESTIMATE2019": "15720"
      },
      {
        "STATE": "55",
        "COUNTY": "131",
        "STNAME": "Wisconsin",
        "CTYNAME": "Washington County",
        "POPESTIMATE2019": "136034"
      },
      {
        "STATE": "55",
        "COUNTY": "133",
        "STNAME": "Wisconsin",
        "CTYNAME": "Waukesha County",
        "POPESTIMATE2019": "404198"
      },
      {
        "STATE": "55",
        "COUNTY": "135",
        "STNAME": "Wisconsin",
        "CTYNAME": "Waupaca County",
        "POPESTIMATE2019": "50990"
      },
      {
        "STATE": "55",
        "COUNTY": "137",
        "STNAME": "Wisconsin",
        "CTYNAME": "Waushara County",
        "POPESTIMATE2019": "24443"
      },
      {
        "STATE": "55",
        "COUNTY": "139",
        "STNAME": "Wisconsin",
        "CTYNAME": "Winnebago County",
        "POPESTIMATE2019": "171907"
      },
      {
        "STATE": "55",
        "COUNTY": "141",
        "STNAME": "Wisconsin",
        "CTYNAME": "Wood County",
        "POPESTIMATE2019": "72999"
      },
      {
        "STATE": "56",
        "COUNTY": "000",
        "STNAME": "Wyoming",
        "CTYNAME": "Wyoming",
        "POPESTIMATE2019": "578759"
      },
      {
        "STATE": "56",
        "COUNTY": "001",
        "STNAME": "Wyoming",
        "CTYNAME": "Albany County",
        "POPESTIMATE2019": "38880"
      },
      {
        "STATE": "56",
        "COUNTY": "003",
        "STNAME": "Wyoming",
        "CTYNAME": "Big Horn County",
        "POPESTIMATE2019": "11790"
      },
      {
        "STATE": "56",
        "COUNTY": "005",
        "STNAME": "Wyoming",
        "CTYNAME": "Campbell County",
        "POPESTIMATE2019": "46341"
      },
      {
        "STATE": "56",
        "COUNTY": "007",
        "STNAME": "Wyoming",
        "CTYNAME": "Carbon County",
        "POPESTIMATE2019": "14800"
      },
      {
        "STATE": "56",
        "COUNTY": "009",
        "STNAME": "Wyoming",
        "CTYNAME": "Converse County",
        "POPESTIMATE2019": "13822"
      },
      {
        "STATE": "56",
        "COUNTY": "011",
        "STNAME": "Wyoming",
        "CTYNAME": "Crook County",
        "POPESTIMATE2019": "7584"
      },
      {
        "STATE": "56",
        "COUNTY": "013",
        "STNAME": "Wyoming",
        "CTYNAME": "Fremont County",
        "POPESTIMATE2019": "39261"
      },
      {
        "STATE": "56",
        "COUNTY": "015",
        "STNAME": "Wyoming",
        "CTYNAME": "Goshen County",
        "POPESTIMATE2019": "13211"
      },
      {
        "STATE": "56",
        "COUNTY": "017",
        "STNAME": "Wyoming",
        "CTYNAME": "Hot Springs County",
        "POPESTIMATE2019": "4413"
      },
      {
        "STATE": "56",
        "COUNTY": "019",
        "STNAME": "Wyoming",
        "CTYNAME": "Johnson County",
        "POPESTIMATE2019": "8445"
      },
      {
        "STATE": "56",
        "COUNTY": "021",
        "STNAME": "Wyoming",
        "CTYNAME": "Laramie County",
        "POPESTIMATE2019": "99500"
      },
      {
        "STATE": "56",
        "COUNTY": "023",
        "STNAME": "Wyoming",
        "CTYNAME": "Lincoln County",
        "POPESTIMATE2019": "19830"
      },
      {
        "STATE": "56",
        "COUNTY": "025",
        "STNAME": "Wyoming",
        "CTYNAME": "Natrona County",
        "POPESTIMATE2019": "79858"
      },
      {
        "STATE": "56",
        "COUNTY": "027",
        "STNAME": "Wyoming",
        "CTYNAME": "Niobrara County",
        "POPESTIMATE2019": "2356"
      },
      {
        "STATE": "56",
        "COUNTY": "029",
        "STNAME": "Wyoming",
        "CTYNAME": "Park County",
        "POPESTIMATE2019": "29194"
      },
      {
        "STATE": "56",
        "COUNTY": "031",
        "STNAME": "Wyoming",
        "CTYNAME": "Platte County",
        "POPESTIMATE2019": "8393"
      },
      {
        "STATE": "56",
        "COUNTY": "033",
        "STNAME": "Wyoming",
        "CTYNAME": "Sheridan County",
        "POPESTIMATE2019": "30485"
      },
      {
        "STATE": "56",
        "COUNTY": "035",
        "STNAME": "Wyoming",
        "CTYNAME": "Sublette County",
        "POPESTIMATE2019": "9831"
      },
      {
        "STATE": "56",
        "COUNTY": "037",
        "STNAME": "Wyoming",
        "CTYNAME": "Sweetwater County",
        "POPESTIMATE2019": "42343"
      },
      {
        "STATE": "56",
        "COUNTY": "039",
        "STNAME": "Wyoming",
        "CTYNAME": "Teton County",
        "POPESTIMATE2019": "23464"
      },
      {
        "STATE": "56",
        "COUNTY": "041",
        "STNAME": "Wyoming",
        "CTYNAME": "Uinta County",
        "POPESTIMATE2019": "20226"
      },
      {
        "STATE": "56",
        "COUNTY": "043",
        "STNAME": "Wyoming",
        "CTYNAME": "Washakie County",
        "POPESTIMATE2019": "7805"
      },
      {
        "STATE": "56",
        "COUNTY": "045",
        "STNAME": "Wyoming",
        "CTYNAME": "Weston County",
        "POPESTIMATE2019": "6927"
      }
    ];

function annotateCountyData() {
  let nameMap = {};
  STATE_POPULATION_DATA.forEach(function (st) {
    nameMap[st["State or territory"]] = st;
  });
  COUNTY_POPULATION_DATA.forEach(function (co) {
    let st = nameMap[co.STNAME];
    co.STCODE = st && st['USPS Code'];
  })
}
annotateCountyData();
export {STATE_POPULATION_DATA, COUNTY_POPULATION_DATA};
