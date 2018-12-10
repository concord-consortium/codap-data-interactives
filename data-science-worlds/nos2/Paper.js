/*
==========================================================================

 * Created by tim on 10/2/18.
 
 
 ==========================================================================
Paper in nos2

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

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

class Paper {

    constructor() {
        this.dbid = 0;
        this.title = "";
        this.authors = "";
        this.text = "";

        this.worldID = journal.state.worldID;
        this.teamID = journal.state.teamID;
        this.teamName = journal.state.teamName;

        this.convo = "";

        this.packs = [];        //  array of dbids of DataPacks for This Papaer

        this.status = journal.constants.kPaperStatusInProgress;
        this.pubYear = "";
        this.citation = "";
        this.references = [];
    }

    isEditable() {
        return (
            this.status === journal.constants.kPaperStatusInProgress ||
            this.status === journal.constants.kPaperStatusRevise
        );
    }

    convertToAssociativeArray() {
        let out = [];
        out["id"] = this.dbid;
        out["title"] = this.title;
        out["authors"] = this.authors;
        out["text"] = this.text;

        out["worldID"] = this.worldID;
        out["teamID"] = this.teamID;
        out["teamName"] = this.teamName;

        out["convo"] = this.convo;

        out["packs"] = JSON.stringify(this.packs);

        out["status"] = this.status;
        out["pubYear"] = this.pubYear;
        out["citation"] = this.citation;

        out["references"] = JSON.stringify(this.references);

        return out;
    }

    setThisPack(iDatapackNumber) {
        this.packs = [ iDatapackNumber ];
        console.log("Set snapshot (pack) " + iDatapackNumber + " for paper " + this.title);
    }

    addPack(iDataPack) {
        if (this.packs.includes( iDataPack.dbid)) {
            console.log("Paper " + this.title + " already has snapshot (pack) " + iDataPack.dbid);
        } else {
            this.packs.push( iDataPack.dbid );
            console.log("Added snapshot (pack) " + iDataPack.dbid + " to paper " + this.title);
        }
    }
}

Paper.paperFromDBArray = function(iDBArray) {
    let out = new Paper();

    out.dbid = iDBArray["id"];
    out.title = iDBArray["title"];
    out.authors = iDBArray["authors"];
    out.text = iDBArray["text"];
    out.worldID = iDBArray["worldID"];
    out.teamID = iDBArray["teamID"];
    out.teamName = iDBArray["teamName"];
    out.status = iDBArray["status"];
    out.pubYear = iDBArray["pubYear"];
    out.citation = iDBArray["citation"];

    out.convo = iDBArray["convo"];

    let dbPacks = iDBArray["packs"];
    let dbRefs = iDBArray["references"];

    if (dbPacks == "") dbPacks = "[]";
    if (dbRefs == "") dbRefs = "[]";

    try {
        out.references = JSON.parse(dbRefs);   //  convert to array of ints
    } catch(e) {
        out.references = [];
    }
    try {
        out.packs = JSON.parse(dbPacks);   //  convert to array of ints
    } catch {
        out.packs = [];
    }

    return out;
};