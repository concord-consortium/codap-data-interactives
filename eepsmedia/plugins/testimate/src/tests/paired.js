/* global testimate, data, Test, jStat, ui, localize */


class Paired extends Test {

    constructor(iID) {
        super(iID);
        testimate.state.testParams.reversed = false;
    }

    updateTestResults() {
        const theHypothesizedValue = (testimate.state.testParams.value);

        const X = data.xAttData.theArray;
        const Y = data.yAttData.theArray;
        const N = X.length;
        if (N !== Y.length) {
            alert(`Paired arrays are not the same length! Bogus results ahead!`);
        }
        let Z = [];

        for (let i = 0; i < N; i++) {
            Z[i] = testimate.state.testParams.reversed ? Y[i] - X[i] : X[i] - Y[i];
        }
        const jX = jStat(Z);      //  jStat version of difference array

        this.results.N = jX.cols();
        this.results.mean = jX.mean();
        this.results.s = jX.stdev(true);    //      true means SAMPLE SD
        this.results.SE = this.results.s / Math.sqrt(this.results.N);
        this.results.df = this.results.N - 1;
        this.results.t = (this.results.mean - theHypothesizedValue) / this.results.SE;

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

        this.results.P = Test.computePFromT(theHypothesizedValue, this.results.mean, this.results.t, this.results.df);
    }

    makeResultsString() {

        const CIString = Test.makeConfCIString(testimate.state.testParams.conf, this.results.CImin, this.results.CImax);

        const NString = Test.makeResultValueString("N", this.results.N);
        const sString  = Test.makeResultValueString("s", this.results.s);
        const SEString = Test.makeResultValueString("SE", this.results.SE);
        const tString = Test.makeResultValueString("t", this.results.t, 3);
        const dfString = Test.makeResultValueString("df", this.results.df, 3);

        const PString = Test.makePString(this.results.P);

        const alpha = ui.numberToString(testimate.state.testParams.alpha);
        const value = ui.numberToString(testimate.state.testParams.value);
        const tCrit = ui.numberToString(this.results.tCrit, 3);

        const testQuestion = testimate.state.testParams.reversed ?
            localize.getString("tests.paired.testQuestion",
                testimate.state.y.name, testimate.state.x.name, testimate.state.testParams.theSidesOp, value) :
            localize.getString("tests.paired.testQuestion",
                testimate.state.x.name, testimate.state.y.name, testimate.state.testParams.theSidesOp, value) ;
        const MPDstring = `${localize.getString( "tests.paired.meanPairedDifference")} = ${ui.numberToString(this.results.mean, 3)}`;

        let out = "<pre>";

        out += testQuestion;
        out += `<br><br>    ${NString}, ${sString}, ${SEString}`;
        out += `<br>    ${MPDstring}, ${tString}, ${dfString}, &alpha; = ${alpha}, t* = ${tCrit}`;
        out += `<br>    ${PString}, ${CIString}`;
        out += `<br> `;

        out += `</pre>`;
        return out;
    }

    makeTestDescription( ) {
        return `paired test of ${data.xAttData.name} - ${data.yAttData.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        //  return `paired test of ${data.xAttData.name} - ${data.yAttData.name}`;
        if (testimate.state.testParams.reversed) {
            return localize.getString("tests.paired.menuString", testimate.state.y.name, testimate.state.x.name);
        } else {
            return localize.getString("tests.paired.menuString", testimate.state.x.name, testimate.state.y.name);
        }
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.paired.configurationStart");

        const chicletGuts = (testimate.state.testParams.reversed) ?
            `${testimate.state.y.name} – ${testimate.state.x.name}` :
            `${testimate.state.x.name} – ${testimate.state.y.name}` ;

        const chiclet = ui.chicletButtonHTML(chicletGuts);
        const sides = ui.sidesChicletButtonHTML(testimate.state.testParams.sides);
        const value = ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${configStart}<br>&emsp;${chiclet} ${sides} ${value}<br>&emsp;</br>${conf}`;

        return theHTML;
    }

}