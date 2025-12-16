
/* global testimate, data, Test, jStat, ui, localize, binomial */


class OneSampleP extends Test {

    usingBinomial = false;

    constructor(iID) {
        super(iID);

        //  get a default "group" -- the value we count as "success" for proportions
        if (!testimate.restoringFromSave || !testimate.state.testParams.focusGroupX) {
            testimate.state.testParams.focusGroupX = testimate.state.focusGroupDictionary[data.xAttData.name];
            /*
                  testimate.state.testParams.value
                      = testimate.state.valueDictionary[this.testID]
                      ? testimate.state.valueDictionary[this.testID] : 0.5;
          */
        }

    }

    async updateTestResults() {
        const A = data.xAttData.theArray;
        const G = testimate.state.testParams.focusGroupX;

        let N = 0;
        this.results.successes = 0;
        A.forEach( x => {
            N++;
            if (x === G) this.results.successes++;
        });

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        if (N > 0) {
            const p0 = testimate.state.testParams.value;    //  hypothesized (null) proportion
            const pHat = this.results.successes / N;     //  sample proportion p-hat
            this.results.N = N;
            this.results.prop = pHat;

            this.usingBinomial = (N * pHat < 10) || (N * (1 - pHat) < 10);  //  must have ≥ 10 successes AND 10 failures

            if (this.usingBinomial) {

                /**
                 * jStat.binomial.cdf(k, N, p) is the probability that you get between 0 and k successes in N trials
                 */
                switch (testimate.state.testParams.theSidesOp) {
                    case "≠":
                        this.results.P = 2 * (1 - jStat.binomial.cdf(this.results.successes - 1, this.results.N, p0));
                        break;
                    case ">":
                        this.results.P = 1 - jStat.binomial.cdf(this.results.successes - 1, this.results.N, p0);     //
                        break;
                    case "<":
                        this.results.P = jStat.binomial.cdf(this.results.successes, this.results.N, p0);     //
                        break;
                    default:
                        alert(`odd result in oneSampleP: could not compute P-value.`);

                }

                if (this.results.P > 1) this.results.P = 1.00;

                this.results.SE = Math.sqrt((this.results.prop) * (1 - this.results.prop) / this.results.N);
                this.results.z = "";
                this.results.zCrit = "";

                const binomialResult = binomial.CIbeta(N, this.results.successes, testimate.state.testParams.alpha);
                this.results.CImin = binomialResult[0];
                this.results.CImax = binomialResult[1];

            } else {        //  not using binomial, using z

                this.results.SE = Math.sqrt((pHat) * (1 - pHat) / N);
                const SEnull = Math.sqrt((p0) * (1 - p0) / N);

                //  Note: test uses the SE of the null hypothesis (value); CI uses the SE of the sample.
                this.results.z = (pHat - p0) / SEnull;  //  this.results.SE;

                this.results.zCrit = jStat.normal.inv(theCIparam, 0, 1);    //  1.96-ish for 0.95
                const zAbs = Math.abs(this.results.z);

                const theTail = jStat.normal.cdf(-zAbs, 0, 1);
                this.results.P = Test.computePFromTail(theTail, p0 <= pHat);

                //  Note: CI uses the SE of the sample (this.results.SE)
                this.results.CImax = pHat + this.results.zCrit * this.results.SE;
                this.results.CImin = pHat - this.results.zCrit * this.results.SE;
            }
        }
    }

    makeResultsString() {

        const PString = Test.makePString(this.results.P);

        const prop = ui.numberToString(this.results.prop, 4);
        const successes = ui.numberToString(this.results.successes);
        const N = ui.numberToString(this.results.N);

        const CIString = Test.makeConfCIString(testimate.state.testParams.conf, this.results.CImin, this.results.CImax);

        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        const value = ui.numberToString(testimate.state.testParams.value);
        const sidesOp = testimate.state.testParams.theSidesOp;

        const testQuestion = localize.getString(
            "tests.oneSampleP.testQuestion",
            data.xAttData.name, testimate.state.testParams.focusGroupX, sidesOp, value
        );
        const r1 = localize.getString(
            "tests.oneSampleP.resultsLine1", prop, successes, N
        );

        let out = "<pre>";
        out += testQuestion;
        out += `<br><br>    ${r1}`;

        if (this.usingBinomial) {
            out += `<br>    ${PString}`;
            out += `<br>    ${CIString}`;
            out += `<br>        (${localize.getString("tests.oneSampleP.usingBinomialProc")})`;

        } else {
            const SEString = Test.makeResultValueString("SE", this.results.SE);
            const zCrit = ui.numberToString(this.results.zCrit, 3);
            const zString = Test.makeResultValueString("z", this.results.z, 3);

            out += `<br>    ${SEString}, ${zString}, &alpha; = ${alpha}, z* = ${zCrit}`;
            out += `<br>    ${PString}, ${CIString}`;
            out += `<br>        (${localize.getString("tests.oneSampleP.usingZProc")})`;
        }

        out += `</pre>`;

        return out;
    }

    makeTestDescription(iTestID, includeName) {
        return `mean of ${testimate.state.x.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        if(!testimate.state.focusGroupDictionary[data.xAttData.name]) {
            testimate.setFocusGroup(data.xAttData, null);
        }
        const rememberedGroup = testimate.state.focusGroupDictionary[data.xAttData.name];

        return localize.getString("tests.oneSampleP.menuString",
            testimate.state.x.name, rememberedGroup);
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.oneSampleP.configurationStart");

        const sides = ui.sidesChicletButtonHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value, 0.0, 1.0, 0.05);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        const group = ui.focusGroupButtonXHTML(testimate.state.testParams.focusGroupX);
        let theHTML = `${configStart}(${data.xAttData.name} = ${group}) ${sides} ${value} ${conf}`;

        return theHTML;
    }


}