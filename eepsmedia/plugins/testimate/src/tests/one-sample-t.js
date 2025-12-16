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
        const theHypothesizedValue = (testimate.state.testParams.value);

        this.results.N = jX.cols();
        this.results.mean = jX.mean();
        this.results.s = jX.stdev(true);    //      `true` means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);
        this.results.t = (this.results.mean - theHypothesizedValue) / this.results.SE;  //  can be negative
        this.results.df = this.results.N - 1;

        this.results.P = Test.computePFromT(theHypothesizedValue, this.results.mean, this.results.t, this.results.df);

        //      for confidence interval
        const theCIparam = 1 - testimate.state.testParams.alpha / 2;
        const CIHalfWidth = jStat.studentt.inv(theCIparam, this.results.df);    //  1.96-ish for 0.95
        this.results.CImax = this.results.mean + CIHalfWidth * this.results.SE;
        this.results.CImin = this.results.mean - CIHalfWidth * this.results.SE;

        //  for critical values
        let theCritParam = theCIparam;
        if (testimate.state.testParams.sides === 1) {
            theCritParam = (testimate.state.testParams.theSidesOp === "<") ? testimate.state.testParams.alpha : 1 - testimate.state.testParams.alpha;
        }
        this.results.tCrit = jStat.studentt.inv(theCritParam, this.results.df);
        this.results.xCrit = theHypothesizedValue + this.results.tCrit * this.results.SE;

        const timP = 1 - jStat.studentt.cdf(this.results.t, this.results.df);
        console.log(`Tim's p-value is ${timP}`);

    }

    makeResultsString() {
        const varXName = testimate.state.x.title;

        const CIString = Test.makeConfCIString(testimate.state.testParams.conf, this.results.CImin, this.results.CImax);

        const NString = Test.makeResultValueString("N", this.results.N);
        const tString = Test.makeResultValueString("t", this.results.t, 3);
        const PString = Test.makePString(this.results.P);
        const sString = Test.makeResultValueString("s", this.results.s);
        const SEString = Test.makeResultValueString("SE", this.results.SE);
        const dfString = Test.makeResultValueString("df", this.results.df, 3);
        const sampleMeanString = `${localize.getString("tests.oneSampleT.sampleMean")} = ${ui.numberToString(this.results.mean, 3)}`;

        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const xCrit = ui.numberToString(this.results.xCrit, 3);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        const value = ui.numberToString(testimate.state.testParams.value);

        const testQuestion = localize.getString("tests.oneSampleT.testQuestion",
            data.xAttData.name, testimate.state.testParams.theSidesOp, value);

        let out = "<pre>";

        out += testQuestion;
        out += `<br><br>    ${NString}, ${sampleMeanString}, ${sString}, ${SEString}` ;
        out += `<br>    ${tString}, ${dfString}, &alpha; = ${alpha}, t* = ${tCrit}, (${varXName})* = ${xCrit}`;
        out += `<br>    ${PString}, ${CIString}`;
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

        const sides = ui.sidesChicletButtonHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${configStart}(${data.xAttData.name}) ${sides} ${value} ${conf}`;

        return theHTML;
    }

}