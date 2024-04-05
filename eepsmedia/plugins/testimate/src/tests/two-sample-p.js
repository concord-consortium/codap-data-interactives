class TwoSampleP extends Test {

    constructor(iID, iGrouping) {
        super(iID);
        this.grouping = iGrouping;
        this.results.successValueA = null;      //  label for principal value for group A
        this.results.successValueB = null;      //  label for principal value for B

        //  get a default "group" -- the value we count as "success" for proportions
        if (!testimate.restoringFromSave || !testimate.state.testParams.focusGroupX) {
            testimate.state.testParams.focusGroupX = testimate.state.focusGroupDictionary[data.xAttData.name];
            testimate.state.testParams.focusGroupY = testimate.state.focusGroupDictionary[data.yAttData.name];
        }
        testimate.state.testParams.value
            = testimate.state.valueDictionary[this.testID]
            ? testimate.state.valueDictionary[this.testID] : 0;

    }


    updateTestResults() {
        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        let A = data.xAttData.theArray;
        let B = data.yAttData.theArray;

        if (this.grouping) {
            //  A (X) holds the data and values
            //  B (Y) holds the group membership.

            this.results.labelA = testimate.state.testParams.focusGroupY;       //      theGroups[0];
            this.results.labelB = Test.getComplementaryValue( data.yAttData, this.results.labelA);

            this.results.successValueA = testimate.state.testParams.focusGroupX;
                //  this.results.successValueA || theValues[0];   //  the default principal group = the first, by default
            this.results.successValueB = testimate.state.testParams.focusGroupX;   // must be the same as for A if we're grouped

            [A, B] = Test.splitByGroup(A, B, this.results.labelA);

        } else {
            this.results.labelA = data.xAttData.name;
            this.results.labelB = data.yAttData.name;

            //  const theAValues = [...data.xAttData.valueSet];
            this.results.successValueA = testimate.state.testParams.focusGroupX;        //      this.results.successValueA || theAValues[0];   //  the default principal group = the first, by default
            const theBValues = [...data.yAttData.valueSet];
            if (theBValues.includes(this.results.successValueA)) {
                //  we don't do the "or" here so that if the value exists in A,
                //  a change will "drag" B along.
                //  There is a chance this is not what the user wants.
                this.results.successValueB = this.results.successValueA;
            } else {
                this.results.successValueB =  testimate.state.testParams.focusGroupY;
            }
        }

        //  count cases and successes in "A"
        this.results.N1 = 0;
        this.results.successesA = 0;
        A.forEach( a => {
            this.results.N1++;
            if (a === this.results.successValueA) this.results.successesA++
        })

        //  count cases and successes in "B"
        this.results.N2 = 0;
        this.results.successesB = 0;
        B.forEach( b => {
            this.results.N2++;
            if (b === this.results.successValueB) this.results.successesB++
        })

        this.results.N = this.results.N1 + this.results.N2;
        if (this.results.N1 > 0 && this.results.N2 > 0) {
            const pHat = (this.results.successesA + this.results.successesB) / this.results.N;   //  p (pooled)
            const qHat = 1 - pHat;
            this.results.prop = pHat;

            this.results.prop1 = this.results.successesA / this.results.N1;
            this.results.prop2 = this.results.successesB / this.results.N2;
            this.results.SE1 = Math.sqrt(this.results.prop1 * (1 - this.results.prop1) / this.results.N1);
            this.results.SE2 = Math.sqrt(this.results.prop2 * (1 - this.results.prop2) / this.results.N2);

            //  pooled standard error
            this.results.SE = Math.sqrt((pHat * qHat) * (1/ this.results.N1 + 1 / this.results.N2));

            this.results.SEinterval = Math.sqrt(
                this.results.prop1 * (1 - this.results.prop1) / this.results.N1 +
                this.results.prop2 * (1 - this.results.prop2) / this.results.N2
            )

            //  the test p1 - p2
            this.results.pDiff = this.results.prop1 - this.results.prop2;

            //  test statistic = z
            this.results.z = (this.results.pDiff - testimate.state.testParams.value) / this.results.SE;
            this.results.zCrit = jStat.normal.inv(theCIparam, 0, 1);    //  1.96-ish for 0.95

            const zAbs = Math.abs(this.results.z);
            this.results.P = jStat.normal.cdf(-zAbs, 0, 1);
            if (testimate.state.testParams.sides === 2) this.results.P *= 2;

            this.results.CImax = this.results.pDiff + this.results.zCrit * this.results.SEinterval;
            this.results.CImin = this.results.pDiff - this.results.zCrit * this.results.SEinterval;
        }
    }

    makeResultsString() {
        const N = this.results.N;
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const pDiff = ui.numberToString(this.results.pDiff, 3);
        const SE = ui.numberToString(this.results.SE);
        const SEinterval = ui.numberToString(this.results.SEinterval);

        const p1 = ui.numberToString(this.results.prop1);
        const p2 = ui.numberToString(this.results.prop2);

        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);
        const zCrit = ui.numberToString(this.results.zCrit, 3);

        const z = ui.numberToString(this.results.z, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const DSdetails = document.getElementById("DSdetails");
        const DSopen = DSdetails && DSdetails.hasAttribute("open");
        let out = "<pre>";

        const groupingPhrase = `(${testimate.state.x.name} = ${this.results.successValueA}): ${this.results.labelA} - ${this.results.labelB}`;
        const nonGroupingPhrase = `(${testimate.state.x.name} = ${this.results.successValueA}) - (${testimate.state.y.name} = ${this.results.successValueB})`;

        const comparison = `${testimate.state.testParams.theSidesOp} ${testimate.state.testParams.value}`;
        const resultHed = (this.grouping) ?
            `${localize.getString("tests.twoSampleP.testQuestionHead")} ${groupingPhrase} ${comparison}?` :
            `${localize.getString("tests.twoSampleP.testQuestionHead")} ${nonGroupingPhrase} ${comparison}?`;

        out += `${resultHed} <br>`;
        out += `<br>    N = ${N}, diff = ${pDiff}, z = ${z}, ${P}`;
        out += `<br>    ${conf}% CI = [${CImin}, ${CImax}],  SE(CI) = ${SEinterval} `;

        out += `<details id="DSdetails" ${DSopen ? "open" : ""}>`;
        out += localize.getString("tests.twoSampleP.detailsSummary");
        out += this.makeTwoSampleTable();
        out += `<br>     &alpha; = ${alpha}, z* = ${zCrit}</p>`
        out += `</details>`;

        out += `</pre>`;

        return out;
    }

    makeTwoSampleTable() {
        const SE1 = ui.numberToString(this.results.SE1);
        const SE2 = ui.numberToString(this.results.SE2);
        const SE = ui.numberToString(this.results.SE);
        const N2 = this.results.N2;
        const N1 = this.results.N1;
        const N = this.results.N;
        const succA = this.results.successesA;
        const succB = this.results.successesB;
        const p1 = ui.numberToString(this.results.prop1);
        const p2 = ui.numberToString(this.results.prop2);
        const prop = ui.numberToString(this.results.prop);

        const groupColHead = this.grouping ?  `${data.yAttData.name}` : localize.getString("group");
        const propColHead = this.grouping ?
            `${localize.getString("proportion")}<br>${data.xAttData.name} = ${this.results.successValueA}` :
            `${localize.getString("proportion")}`;
        const pooled = localize.getString("pooled");

        let out = "";

        const groupRowLabelA = this.grouping ? this.results.labelA : `${this.results.labelA} = ${this.results.successValueA}`;
        const groupRowLabelB = this.grouping ? this.results.labelB : `${this.results.labelB} = ${this.results.successValueB}`;

        out += `<table class="test-results">`;
        out += `<tr class="headerRow"><th>${groupColHead}</th><th>N</th><th>${propColHead}</th><th>SE</th></tr>`;
        out += `<tr><td>${groupRowLabelA}</td><td>${succA} / ${N1}</td><td>${p1}</td><td>${SE1}</td></tr>`;
        out += `<tr><td>${groupRowLabelB}</td><td>${succB} / ${N2}</td><td>${p2}</td><td>${SE2}</td></tr>`;
        out += `<tr><td>${pooled}</td><td>${succA + succB} / ${N}</td><td>${prop}</td><td>${SE}</td></tr>`;
        out += `</table>`;

        return out
    }


    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString(iID) {
        if (iID === `BB02`) {
            return localize.getString("tests.twoSampleP.menuString1", testimate.state.x.name, testimate.state.y.name);
        } else {
            return localize.getString("tests.twoSampleP.menuString2", testimate.state.x.name, testimate.state.y.name);
        }
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.twoSampleP.configStart");

        const intro = (this.grouping) ?
            `${configStart}: <br>&emsp;(${testimate.state.x.name} = ${ui.focusGroupButtonXHTML(testimate.state.testParams.focusGroupX)} ) : ${ui.focusGroupButtonYHTML(testimate.state.testParams.focusGroupY)} - ${this.results.labelB}` :
            `${configStart}: <br>&emsp;(${testimate.state.x.name} = ${ui.focusGroupButtonXHTML(testimate.state.testParams.focusGroupX)}) - (${testimate.state.y.name} = ${ui.focusGroupButtonYHTML(testimate.state.testParams.focusGroupY)}) `;
        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value, 0.0, 1.0, .05);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${intro} ${sides} ${value} <br>&emsp;${conf}`;

        return theHTML;
    }

/*
    successValueButtonA( ) {
        return `<input id="successButtonA" type="button" onclick="TwoSampleP.rotateSuccessValueA()" 
                value="${this.results.successValueA}">`
    }

    successValueButtonB( ) {
        return `<input id="successButtonB" type="button" onclick="TwoSampleP.rotateSuccessValueB()" 
                value="${this.results.successValueB}">`
    }
*/

}