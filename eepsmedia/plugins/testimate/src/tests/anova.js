class ANOVA extends Test {

    constructor(iID) {
        super(iID);
        this.results.expected = {};
        this.results.observed = {};
        this.results.values = [];
    }

    updateTestResults() {

        const A = data.xAttData.theArray;
        const tempG = data.yAttData.theArray;
        const G = tempG.map( n => String(n));   //  make string values for group names

        const tempNames = [...data.yAttData.valueSet];
        this.results.groupNames  = tempNames.map( n => String(n));   //  make string values for group names

        this.results.N = A.length;

        if (this.results.N) {
            this.results.sum = 0;
            this.results.groupNs = new Array(this.results.groupNames.length).fill(0);


            //      calculate group means
            this.results.groupSums = new Array(this.results.groupNames.length).fill(0);
            this.results.groupMeans = new Array(this.results.groupNames.length).fill(0);

            for (let ix = 0; ix < A.length; ix++) {
                let group = this.results.groupNames.indexOf(G[ix]);
                this.results.groupNs[group]++;
                this.results.groupSums[group] += A[ix];
                this.results.sum += A[ix];
            }

            this.results.mean = this.results.sum / this.results.N;      //  grand mean

            //  calculate group means (loop over groups...)
            for (let ix = 0; ix < this.results.groupNames.length; ix++) {
                if (this.results.groupNs[ix]) {
                    const theGM = this.results.groupSums[ix] / this.results.groupNs[ix];
                    this.results.groupMeans[ix] = theGM;
                } else {
                    this.results.groupMeans[ix] = null; //  the group mean is null if there are no cases in the group.
                }
            }

            //  calculate within-group errors, add between-group errors

            this.results.SSR = 0;       //  between-group error (sum of squares of regression)
            this.results.SSE = 0;       //  sum of squares of error (within group)

            for (let ix = 0; ix < A.length; ix++) {
                let group = this.results.groupNames.indexOf(G[ix]);
                const treat = this.results.groupMeans[group] - this.results.mean; //  between
                const err = A[ix] - this.results.groupMeans[group];     //  within
                this.results.SSE += err * err;
                this.results.SSR += treat * treat;
            }

            this.results.SST = this.results.SSR + this.results.SSE;
            const theCIparam = 1 - testimate.state.testParams.alpha / 2;   //  the large number

            this.results.dfTreatment = this.results.groupNames.length - 1;      //  "numerator" between groups
            this.results.dfError = this.results.N - this.results.groupNames.length; //  "denominator" within
            this.results.dfTotal = this.results.dfError + this.results.dfTreatment;

            this.results.MSTreatment = this.results.SSR / this.results.dfTreatment;
            this.results.MSError = this.results.SSE / this.results.dfError;

            this.results.F = this.results.MSTreatment / this.results.MSError;

            this.results.FCrit = jStat.centralF.inv(theCIparam, this.results.dfTreatment, this.results.dfError);    //
            this.results.P = 1 - jStat.centralF.cdf(this.results.F, this.results.dfTreatment, this.results.dfError);
        }
    }

    static toggleDS() {
        this.openDS = !this.openDS;
        console.log(`descriptive details now ${this.openDS ? 'open' : 'closed'}.`);
    }

    makeResultsString() {

        const N = this.results.N;
        const F = ui.numberToString(this.results.F);
        const FCrit = ui.numberToString(this.results.FCrit);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const DSdetails = document.getElementById("DSdetails");
        const DSopen = DSdetails && DSdetails.hasAttribute("open");
        const Fdetails = document.getElementById("Fdetails");
        const Fopen = Fdetails && Fdetails.hasAttribute("open");

        let out = "<pre>";
        out += localize.getString("tests.anova.testQuestion",
            testimate.state.x.name, testimate.state.y.name);
        out += `<br>    N = ${N}, F = ${F}, ${P}<br>`;
        out += `<details id="DSdetails" ${DSopen ? "open" : ""}>`;
        out += localize.getString("tests.anova.detailsSummary1");
        out += this.makeDescriptiveTable();
        out += `</details>`;
        out += `<details id="Fdetails" ${Fopen ? "open" : ""}>`;
        out += localize.getString("tests.anova.detailsSummary2");
        out += this.makeANOVATable();
        out += `<br>    &alpha; = ${alpha}, F* = ${FCrit}`;
        out += `</details>`;
        out += `</pre>`;
        return out;
    }

    makeANOVATable() {
        const dfT = this.results.dfTreatment;
        const dfE = this.results.dfError;
        const dfTotal = this.results.dfTotal;
        const SSR = ui.numberToString(this.results.SSR, 5);
        const SSE = ui.numberToString(this.results.SSE, 5);
        const SST = ui.numberToString(this.results.SST, 5);
        const MST = ui.numberToString(this.results.MSTreatment, 5);
        const MSE = ui.numberToString(this.results.MSError, 5);
        const F = ui.numberToString(this.results.F);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;

        //  const treatmentString = `Treatment<br>(i.e., ${data.yAttData.name})`;
        const treatmentString = `${data.yAttData.name}`;
        const errorString = localize.getString("error");
        const totalString = localize.getString("total");

        let theHTML = "<table class = 'test-results'>";
        theHTML += "<tr><th>Source</th><th>(SS)</th><th>df</th><th>(MS)</th><th>F</th><th>P</th></tr>";
        theHTML += `<tr><th>${treatmentString}</th><td>${SSR}</td><td>${dfT}</td><td>${MST}</td><td>${F}</td><td>${P}</td></tr>`
        theHTML += `<tr><th>${errorString}</th><td>${SSE}</td><td>${dfE}</td><td>${MSE}</td><td></td></tr>`
        theHTML += `<tr><th>${totalString}</th><td>${SST}</td><td>${dfTotal}</td><td></td><td></td></tr>`
        theHTML += `</table>`

        return theHTML;
    }

    makeDescriptiveTable() {
        const meanOfX = localize.getString("tests.anova.meanOfX",testimate.state.x.name)

        let nameRow = `<tr><th>${data.yAttData.name} &rarr;</th>`;
        let countRow = `<tr><td>${localize.getString("count")}</td>`;
        let meanRow = `<tr><td>${meanOfX}</td>`;

        for (let ix = 0; ix < this.results.groupNames.length; ix++) {
            nameRow += `<th>${this.results.groupNames[ix]}</th>`;
            countRow += `<td>${this.results.groupNs[ix]}</td>`;
            meanRow += `<td>${ui.numberToString(this.results.groupMeans[ix], 3)}</td>`;
        }

        nameRow += `</tr>`;
        countRow += `</tr>`;
        meanRow += `</tr>`;

        return `<table class="test-results">${nameRow}${meanRow}${countRow}</table>`;

    }

    makeTestDescription() {
        return `ANOVA: ${testimate.state.x.name} by ${testimate.state.y.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.anova.menuString",
            testimate.state.x.name, testimate.state.y.name)
        //  return `ANOVA: ${testimate.state.x.name} by ${testimate.state.y.name}`;
    }

    makeConfigureGuts() {
        const configStart = localize.getString("tests.anova.configStart",
            testimate.state.x.name, testimate.state.y.name)
        const conf = ui.confBoxHTML(testimate.state.testParams.conf);
        let theHTML = `${configStart}:<br>&emsp;${conf}`;

        return theHTML;
    }

}