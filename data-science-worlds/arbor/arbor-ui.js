/*
==========================================================================

 * Created by tim on 2019-08-02.
 
 
 ==========================================================================
arbor-ui in arbor

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

arbor.ui = {

    updateConfusionMatrix : function () {
        const tRes = arbor.state.tree.rootNode.getResultCounts();
        const kPositive = arbor.state.dependentVariableSplit.leftLabel;
        const kNegative = arbor.state.dependentVariableSplit.rightLabel;

        document.getElementById("table-head").innerHTML
            = "<span class='confusionHed'>Table</span><br>" + tRes.sampleSize + " cases";

        document.getElementById("truth-positive-head").innerHTML = kPositive + " (" + (tRes.TP + tRes.FN + tRes.PU) + ")";
        document.getElementById("truth-negative-head").innerHTML = kNegative + " (" + (tRes.FP + tRes.TN + tRes.NU) + ")";
        document.getElementById("pred-positive-head").innerHTML = kPositive + " (" + (tRes.TP + tRes.FP) + ")";
        document.getElementById("pred-negative-head").innerHTML = kNegative + " (" + (tRes.TN + tRes.FN) + ")";

        document.getElementById("no-pred-head").innerHTML = "no prediction (" + (tRes.PU + tRes.NU) + ")";

        document.getElementById("TP").innerHTML = tRes.TP;
        document.getElementById("FP").innerHTML = tRes.FP;
        document.getElementById("TN").innerHTML = tRes.TN;
        document.getElementById("FN").innerHTML = tRes.FN;
        document.getElementById("PU").innerHTML = tRes.PU;
        document.getElementById("NU").innerHTML = tRes.NU;

    }
};