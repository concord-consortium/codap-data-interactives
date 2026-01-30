/* global testimate, data, Test, jStat, ui, localize */


class Correlation extends Test {

    constructor(iID, iGrouping) {
        super(iID);
    }

    updateTestResults() {

        const theCIparam = 1 - testimate.state.testParams.alpha / 2;

        let sumXY = 0;
        let sumX = 0;
        let sumXX = 0;
        let sumYY = 0;
        let sumY = 0;
        let N = data.xAttData.theArray.length;
        const df = N - 2;

        if (N > 2) {
            for (let i = 0; i < N; i++) {
                //  Note how these definitions are REVERSED.
                //  we want to look at the var in the first position (xAttData) as the dependent variable (Y)
                const X = data.yAttData.theArray[i];
                const Y = data.xAttData.theArray[i];
                sumX += X;
                sumY += Y;
                sumXY += X * Y;
                sumXX += X * X;
                sumYY += Y * Y;
            }

            const rho = (N * sumXY - sumX * sumY) /
                Math.sqrt((N * sumXX - sumX ** 2) * (N * sumYY - sumY ** 2));
            const rsq = rho * rho;

            //  test for rho ≠ 0 from https://online.stat.psu.edu/stat501/lesson/1/1.9

            this.results.N = N;
            this.results.df = df;
            this.results.tCrit = jStat.studentt.inv(theCIparam, df);    //  1.96-ish for 0.95
            this.results.rho = rho;
            this.results.rsq = rsq;

            //   test correlation against ZERO
            this.results.t = rho * Math.sqrt(df/(1 - rsq));

            //  CI calculations, see https://www.statology.org/confidence-interval-correlation-coefficient/
            const zr = Math.log((1 + rho)/(1 - rho)) / 2.0 ;
            const halfWidth = this.results.tCrit / Math.sqrt(N - 3);
            const L = zr - halfWidth;
            const U = zr + halfWidth;

            this.results.CImin = (Math.exp(2 * L) - 1) / (Math.exp(2 * L) + 1);   //  numeric value
            this.results.CImax = (Math.exp(2 * U) - 1) / (Math.exp(2 * U) + 1);   //  numeric value

            const tAbs = Math.abs(this.results.t);
            this.results.P = jStat.studentt.cdf(-tAbs, this.results.df);
            if (testimate.state.testParams.sides === 2) this.results.P *= 2;
        }

    }

    makeResultsString() {

        const NString = Test.makeResultValueString("N", this.results.N);
        const tString = Test.makeResultValueString("t", this.results.t, 3);
        const dfString = Test.makeResultValueString("df", this.results.df);
        const PString = Test.makePString(this.results.P);
        const CIString = Test.makeConfCIString(testimate.state.testParams.conf, this.results.CImin, this.results.CImax);


        const rho = ui.numberToString(this.results.rho);       //  correlation
        const rsq = ui.numberToString(this.results.rsq);       //  r^2, coeff of deter

        const tCrit = ui.numberToString(this.results.tCrit, 3);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const xName = data.xName();
        const yName = data.yName();

        let out = "<pre>";

        //  out += `How does (${X}) depend on (${Y})?`
        out += localize.getString("tests.correlation.testQuestion",
            xName, yName, testimate.state.testParams.theSidesOp, testimate.state.testParams.value.toString());
        out += `<br>    &rho; = ${rho}, r<sup>2</sup> = ${rsq}, ${NString}`;  //  note reversal!
        out += `<br>    ${tString}, ${PString}`;
        out += `<br>    ${CIString}`;
        out += `<br>    ${dfString},  &alpha; = ${alpha}, t* = ${tCrit}, `;
        out += `</pre>`;

        return out;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.correlation.menuString",data.xName(), data.yName());
    }

    makeConfigureGuts() {
        const testingCorrelationPhrase = localize.getString("tests.correlation.testingCorrelation");

        const sides = ui.sidesChicletButtonHTML(testimate.state.testParams.sides);
        const value = "0";  //  ui.valueBoxHTML(testimate.state.testParams.value);
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${testingCorrelationPhrase} ${sides} ${value},  ${conf}`;

        return theHTML;
    }

}