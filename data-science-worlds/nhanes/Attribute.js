/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 8:16 PM
 *
 * Created by Tim Erickson on 8/21/18 8:16 PM
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


class Attribute {

    constructor(iRecord) {
        this.name = iRecord.NAME;
        this.groupNumber = iRecord.TABLEID;
        this.queryName = "t"+ this.groupNumber + "." + this.name;
        this.decoderTable = null;
        this.description = iRecord.DESCRIPTION;
        this.units = iRecord.UNITS;
        this.useOriginalValue = true;
        this.chosen = Boolean(Number(iRecord.DEFCHECK));
        this.displayMe = Boolean(Number(iRecord.DEFSHOW));
        this.hasCheckbox = this.displayMe;
        this.checkboxID = this.name + "Checkbox";

        if (this.units) {
            this.description += ", " + this.units;
        }

        this.title = iRecord.NAMEOUT;
        if (!this.title) {
            this.title = this.name;
        }

        if (nhanes.decoder.hasOwnProperty(this.name)) {
            this.decoderTable = nhanes.decoder[this.name];
            this.useOriginalValue = false;
        }

/*      From ACS. Left here in case we need to remember the syntax someday...

        else if (iRecord.decodeTable === "yesno") {
            this.decoderTable = {0: "", 1: "yes", 2: "no"};
            this.useOriginalValue = false;
        } else if (iRecord.decodeTable === "served") {
            this.decoderTable = {0: "did not serve", 1: "served"};
            this.useOriginalValue = false;
        } else if (iRecord.decodeTable === "ancestries") {
            this.decoderTable = nhanes.ancestries;
            this.useOriginalValue = false;
        } else if (iRecord.name === 'POBP' || iRecord.name === 'POWSP') {
            this.decoderTable = nhanes.placeOfBirth;
            this.useOriginalValue = false;
        }
*/
    }

    decodeValue(iValue) {
        let out = iValue;

        if (!this.useOriginalValue) {
            if (this.decoderTable.hasOwnProperty(iValue)) {
                out = this.decoderTable[iValue];
            }
        }
        return out;
    }
}

