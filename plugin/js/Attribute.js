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
        this.name = iRecord.name;
        this.groupNumber = iRecord.groupNumber;
        this.decoderTable = null;
        this.description = iRecord.description;
        this.useOriginalValue = true;
        this.chosen = Boolean(iRecord.defcheck);
        this.displayMe = Boolean(iRecord.defshow);
        this.hasCheckbox = this.displayMe;
        this.checkboxID = this.name + "Checkbox";

        this.title = iRecord.nameout;
        if (!this.title) {
            this.title = this.name;
        }

        if (acs.decoder.hasOwnProperty(this.name)) {
            this.decoderTable = acs.decoder[this.name];
            this.useOriginalValue = false;
        } else if (iRecord.decodeTable === "yesno") {
            this.decoderTable = {0: "", 1: "yes", 2: "no"};
            this.useOriginalValue = false;
        } else if (iRecord.decodeTable === "served") {
            this.decoderTable = {0: "did not serve", 1: "served"};
            this.useOriginalValue = false;
        } else if (iRecord.decodeTable === "ancestries") {
            this.decoderTable = acs.ancestries;
            this.useOriginalValue = false;
        } else if (iRecord.name === 'POBP' || iRecord.name === 'POWSP') {
            this.decoderTable = acs.placeOfBirth;
            this.useOriginalValue = false;
        }
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

