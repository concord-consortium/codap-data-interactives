/* global testimate, data, Test, jStat, ui, localize */


class Independence extends Test {

    constructor(iID) {
        super(iID);
        this.results.rowLabels = [];
        this.results.columnLabels = [];
        this.results.observed = null;
        this.results.expected = null;

        //  testimate.state.testParams.sides = 1;
    }

    updateTestResults() {

        const X = data.xAttData.theArray;       //  row-attribute data
        const Y = data.yAttData.theArray;       //  column-attribute data
        this.results.N = X.length;

        this.results.rowLabels = [...data.xAttData.valueSet];       //  x is vertical, row labels
        this.results.columnLabels = [...data.yAttData.valueSet];

        this.results.observed = this.makeZeroMatrix(this.results.columnLabels.length, this.results.rowLabels.length);
        this.results.expected = this.makeZeroMatrix(this.results.columnLabels.length, this.results.rowLabels.length);

        this.results.rowTotals = new Array(this.results.rowLabels.length).fill(0);
        this.results.columnTotals = new Array(this.results.columnLabels.length).fill(0);


        for (let r = 0; r < this.results.rowLabels.length; r++) {
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                this.results.observed[c][r] = 0;
            }
        }

        //  loop over all data
        //  count the observed values in each cell, update row and column totals

        for (let ix = 0; ix < X.length; ix++) {
            const row = this.results.rowLabels.indexOf(X[ix]);
            const column = this.results.columnLabels.indexOf(Y[ix]);
            this.results.observed[column][row]++;
            this.results.rowTotals[row]++;
            this.results.columnTotals[column]++;
        }

        //  calculate expected values and chisquare contributions
        this.results.chisq = 0;
        let totalCells = 0;
        let totalZeroCells = 0;
        let totalCellsFive = 0;


        for (let r = 0; r < this.results.rowLabels.length; r++) {
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                this.results.expected[c][r] = this.results.columnTotals[c] * this.results.rowTotals[r] / this.results.N;
                const contrib = (this.results.observed[c][r] - this.results.expected[c][r]) ** 2
                    / this.results.expected[c][r];
                this.results.chisq += contrib;

                totalCells++;       //  the count of cells
                if (this.results.observed[c][r] === 0) totalZeroCells++;
                if (this.results.observed[c][r] <= 5) totalCellsFive++;
            }
        }

        console.log(`independence: ${totalCells} cells, ${totalCellsFive} <= 5, ${totalZeroCells} zero.`);
        if (totalZeroCells || totalCellsFive) {
            testimate.warning = localize.getString("tests.independence.warning");
            if (this.results.rowLabels.length === 2 && this.results.columnLabels.length === 2) {
                testimate.warning = localize.getString("tests.independence.warningFisher");
            }
        }

        const theCIparam = 1 - testimate.state.testParams.alpha / testimate.state.testParams.sides;     //  2;   //  the large number
        this.results.df = (this.results.rowLabels.length - 1) * (this.results.columnLabels.length - 1);
        this.results.chisqCrit = jStat.chisquare.inv(theCIparam, this.results.df);    //
        this.results.P = 1 - jStat.chisquare.cdf(this.results.chisq, this.results.df);
    }

    makeResultsString() {
        const NString = Test.makeResultValueString("N", this.results.N);
        const PString = Test.makePString(this.results.P);
        const dfString  = Test.makeResultValueString("df", this.results.df, 3);

        const chisq = ui.numberToString(this.results.chisq);
        const chisqCrit = ui.numberToString(this.results.chisqCrit);

        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const TIdetails = document.getElementById("TIdetails");
        const TIopen = TIdetails && TIdetails.hasAttribute("open");

        let out = "<pre>";
        out += localize.getString("tests.independence.testQuestion",
            data.yName(), data.xName());
        out += `<br>    ${NString}, ${localize.getString("tests.fisher.columnsByRows", this.results.columnLabels.length, this.results.rowLabels.length)} `;
        out += `&chi;<sup>2</sup> = ${chisq}`;
        out += `<br>    ${PString}`;
        out += `<details id="TIdetails" ${TIopen ? "open" : ""}>`;
        out += localize.getString("tests.independence.detailsSummary");
        out += this.makeIndependenceTable();
        out += `<br>    ${dfString}, &alpha; = ${alpha}, &chi;<sup>2</sup>* = ${chisqCrit} <br>`;
        out += `</details>`;

        out += `</pre>`;
        return out;
    }

    makeIndependenceTable() {

        let headerRow = `<tr><td>${localize.getString("observed")}<br>${localize.getString("expected")}</td><th>${data.yName()} = </th>`;
        let tableRows = "";

        //  construct a header

        for (let c = 0; c < this.results.columnLabels.length; c++) {
            const col = this.results.columnLabels[c];   //  the string label
            headerRow += `<th>${col}</th>`;     //  column value in the header
        }
        headerRow += `</tr>`;

        //  now loop over rows, making a column inside each...

        for (let r = 0; r < this.results.rowLabels.length; r++) {
            const row = this.results.rowLabels[r];      //  the string row label
            const attLabel = (r === 0) ? `<th>${data.xName()} = ` : `<th></th>`;
            let thisRow = `${attLabel}<th>${row}</th>`;
            for (let c = 0; c < this.results.columnLabels.length; c++) {
                const obs = this.results.observed[c][r];
                const exp = ui.numberToString(this.results.expected[c][r], 4);
                const warn = obs <= 5 ? 'class = "warning"' : "";
                thisRow += `<td ${warn}>${obs}<br>${exp}</td>`;     //  observed value in the cell
            }
            thisRow += `</tr>`;
            tableRows += thisRow;
        }

        return `<table class="test-results">${headerRow}${tableRows}</table>`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.independence.menuString",
            data.yName(),data.xName());
    }

    makeConfigureGuts() {
        const start = localize.getString("tests.independence.configurationStart",
            data.yName(), data.xName());

        const alpha = ui.alphaBoxHTML(testimate.state.testParams.alpha);
        let theHTML = `${start}:<br>&emsp;${alpha}`;        //      used to have "&emsp;${sides12Button}"

        theHTML = "";

        return theHTML;
    }

    makeZeroMatrix(cols, rows) {
        let A = new Array(cols);
        for (let c = 0; c < cols; c++) {
            A[c] = new Array(rows).fill(0);
        }
        return A;
    }

}