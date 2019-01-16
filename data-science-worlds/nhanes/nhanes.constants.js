/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:18 AM
 *
 * Created by Tim Erickson on 8/21/18 9:18 AM
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


nhanes.constants = {

    version: "001a",

    kNHANESDataSetName: "NHANESdata",
    kNHANESDataSetTitle: "NHANESdata",
    kNHANESCollectionName: "people",
    kNHANESCaseTableName: "People from NHANES",

    kBasePhpURL: {
        concord: 'https://codap.concord.org/data-science-worlds/nhanes/nhanes.php',
        local: "http://localhost:8888/plugins/nhanes/nhanes.php",
        xyz: "https://codap.xyz/plugins/nhanes/nhanes.php",
        eeps: "https://www.eeps.com/codap/nhanes/nhanes.php"
    }
};