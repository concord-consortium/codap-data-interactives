/* global testimate, data, Test, jStat, ui, localize */

class OneSampleT extends Test {

    constructor(iID) {
        super(iID);

        testimate.state.testParams.value
            = testimate.state.valueDictionary[this.testID]
            ? testimate.state.valueDictionary[this.testID] : 0;

    }

    updateTestResults() {
        const jX = jStat(data.xAttData.theArray);      //  jStat version of x array

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        this.results.N = jX.cols();
        this.results.df = this.results.N - 1;
        this.results.mean = jX.mean();
        this.results.s = jX.stdev(true);    //      `true` means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);
        this.results.P = jX.ttest(testimate.state.testParams.value, testimate.state.testParams.sides);
        this.results.tCrit = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        this.results.CImax = this.results.mean + this.results.tCrit * this.results.SE;
        this.results.CImin = this.results.mean - this.results.tCrit * this.results.SE;
        this.results.t = (this.results.mean - testimate.state.testParams.value) / this.results.SE;
    }

    makeResultsString() {

        //  const testDesc = `mean of ${testimate.state.x.name}`;

        const mean = ui.numberToString(this.results.mean, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const CImin = ui.numberToString(this.results.CImin);
        const CImax = ui.numberToString(this.results.CImax);

        const NString = Test.makeResultValueString("N", this.results.N);
        const tString = Test.makeResultValueString("t", this.results.t, 3);
        const PString = Test.makePString(this.results.P);
        const sString = Test.makeResultValueString("s", this.results.s);
        const SEString = Test.makeResultValueString("SE", this.results.SE);
        const dfString = Test.makeResultValueString("df", this.results.df, 3);

        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        const value = ui.numberToString(testimate.state.testParams.value);

        const testQuestion = localize.getString("tests.oneSampleT.testQuestion",
            data.xAttData.name, testimate.state.testParams.theSidesOp, value);
        const r2 = localize.getString("tests.oneSampleT.resultsLine2", mean, conf, CImin, CImax);

        let out = "<pre>";

        out += testQuestion;
        out += `<br><br>    ${NString}, ${tString}, ${PString}`;
        out += `<br>    ${r2}`;
        out += `<br>    ${sString}, ${SEString}, `;
        out += `${dfString}, &alpha; = ${alpha}, t* = ${tCrit}`;
        out += `<br> `;

        out += `</pre>`;
        return out;
    }

    makeTestDescription( ) {
        return `mean of ${testimate.state.x.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.oneSampleT.menuString", testimate.state.x.name);

        //  return `one-sample t mean of ${testimate.state.x.name}`;
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.oneSampleT.configurationStart");

        const sides = ui.sidesBoxHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${configStart}(${data.xAttData.name}) ${sides} ${value} ${conf}`;

        return theHTML;
    }

}