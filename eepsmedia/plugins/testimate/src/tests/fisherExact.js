/**
 *
 *   Class to compute and display results from the Fisher exact test of independence in a 2x2 case.
 */

/* global testimate, data, Test, jStat, ui, localize */


class Fisher extends Test {

    constructor(iID) {
        super(iID);
        this.results.rowLabels = [];
        this.results.columnLabels = [];
        this.results.observed = null;

        //  testimate.state.testParams.sides = 1;
    }

    updateTestResults() {

        const X = data.xAttData.theArray;       //  row-attribute data
        const Y = data.yAttData.theArray;       //  column-attribute data
        this.results.N = X.length;

        this.results.rowLabels = [...data.xAttData.valueSet];       //  x is vertical, row labels
        this.results.columnLabels = [...data.yAttData.valueSet];

        //  change rowLabels and columnLabels to begin with focusGroupX and focusGroupY.

        this.results.rowLabels = testimate.putFocusFirst(this.results.rowLabels, testimate.state.testParams.focusGroupX);
        this.results.columnLabels = testimate.putFocusFirst(this.results.columnLabels, testimate.state.testParams.focusGroupY);

        this.results.observed = this.makeZeroMatrix(this.results.columnLabels.length, this.results.rowLabels.length);

        this.results.rowTotals = new Array(this.results.rowLabels.length).fill(0);
        this.results.columnTotals = new Array(this.results.columnLabels.length).fill(0);

        //  loop over all data
        //  count the observed values in each cell, update row and column totals

        for (let ix = 0; ix < X.length; ix++) {
            const row = this.results.rowLabels.indexOf(X[ix]);
            const column = this.results.columnLabels.indexOf(Y[ix]);
            this.results.observed[column][row]++;
            this.results.rowTotals[row]++;
            this.results.columnTotals[column]++;
        }

        this.results.a = this.results.observed[0][0];
        this.results.b = this.results.observed[1][0];
        this.results.c = this.results.observed[0][1];
        this.results.d = this.results.observed[1][1];

        const a = this.results.a;
        const b = this.results.b;
        const c = this.results.c;
        const d = this.results.d;
        console.log(`a, b, c, d: ${a} ${b} ${c} ${d}`);

        const fisherResult = this.fisherExactTest(a, b, c, d);
        //  const fisherResult = this.fisherExactTest(a, b, c, d, ">");
        console.log(`Fisher result: ${JSON.stringify(fisherResult)}`);

        this.results.P = fisherResult.pValue;
        this.results.pObserved = fisherResult.pObserved;
        this.results.oddsRatio = fisherResult.oddsRatio;
        this.results.relativeRisk = fisherResult.relativeRisk;
        this.results.aExpected = this.results.columnTotals[0] * this.results.rowTotals[0] / this.results.N;
        this.results.df = (this.results.rowLabels.length - 1) * (this.results.columnLabels.length - 1);
    }

    makeResultsString() {
        const NString = Test.makeResultValueString("N", this.results.N);
        const orString = Test.makeResultValueString("oddsRatio", this.results.oddsRatio, 3);
        const rrString = Test.makeResultValueString("relativeRisk", this.results.relativeRisk, 3);
        const PString = Test.makePString(this.results.P);

        const FisherDetails = document.getElementById("FisherDetails");
        const detailsOpen = FisherDetails && FisherDetails.hasAttribute("open");
        const FisherDiscussion = document.getElementById("FisherDiscussion");
        const discussionOpen = FisherDiscussion && FisherDiscussion.hasAttribute("open");

        let moreOrLessLikely = this.results.a > this.results.aExpected ?
            localize.getString("moreLikely") : localize.getString("lessLikely");
        if (this.results.a === this.results.aExpected) moreOrLessLikely = localize.getString("justAsLikely");

        const yAlternative = Test.getComplementaryValue(data.yAttData, testimate.state.testParams.focusGroupY);

        let out = "<pre>";
        out += localize.getString("tests.fisher.testQuestion", data.yName(), data.xName());
        out += `<br>    ${NString}, ${rrString}, ${orString}`;
        out += `<br>    ${PString} (${localize.getString("Nsided", testimate.state.testParams.sides)})`;

        //  table enclosed in a <details>

        out += `<details id="FisherDetails" ${detailsOpen ? "open" : ""}>`;
        out += localize.getString("tests.fisher.detailsSummary");
        out += this.makeFisherTable();
        out += `</details>`;

        //  discussion section, also <details>

        out += `<details id="FisherDiscussion" ${discussionOpen ? "open" : ""}>`;
        out += localize.getString("tests.fisher.discussionSummary");

        out += "<ul>";
        out += localize.getString("tests.fisher.nullStatement1", testimate.state.x.name, testimate.state.y.name);

        out += localize.getString("tests.fisher.configureDataShow", testimate.state.y.name, testimate.state.testParams.focusGroupY);
        out += localize.getString("tests.fisher.configureMoreOrLess", moreOrLessLikely, testimate.state.x.name, testimate.state.testParams.focusGroupX);
        out += localize.getString("tests.fisher.configureThanAlternative", testimate.state.y.name, yAlternative);

        if (testimate.state.testParams.sides === 2) {
            out += localize.getString("tests.fisher.twoSidedDef", ui.numberToString(this.results.pObserved));
        } else {
            out += localize.getString("tests.fisher.oneSidedDef",
                this.results.a,
                (testimate.state.testParams.theSidesOp === ">") ? "more" : "fewer");
        }
        out += "</ul>";
        out += `</details>`;
        out += `</pre>`;
        return out;
    }

    makeFisherTable() {

        const count00 = this.results.observed[0][0];
        const count01 = this.results.observed[0][1];
        const count10 = this.results.observed[1][0];
        const count11 = this.results.observed[1][1];

        const pct00 = ui.numberToString(100 * count00 / (count00 + count01), 3) + "%";
        const pct01 = ui.numberToString(100 * count01 / (count00 + count01), 3) + "%";
        const pct10 = ui.numberToString(100 * count10 / (count10 + count11), 3) + "%";
        const pct11 = ui.numberToString(100 * count11 / (count10 + count11), 3) + "%";

        let headerRows = `<tr><th>${localize.getString("tests.fisher.columnPctLabel")}</th><th></th><th colspan="2">${data.yName()}</th>`;
        headerRows += `<tr><th></th><th></th><th>${this.results.columnLabels[0]}</th><th>${this.results.columnLabels[1]}</th></tr>`;
        //  first row of data
        let tableRows = "<tr>";
        tableRows += `<th rowSpan="2">${data.xName()}</th><th>${this.results.rowLabels[0]}</th>`;
        tableRows += `<td>${count00}<br>${pct00}</td><td>${count10}<br>${pct10}</td>  </tr>`;
        //  second row of data
        tableRows += "<tr>";
        tableRows += `<th>${this.results.rowLabels[1]}</th>`;
        tableRows += `<td>${count01}<br>${pct01}</td><td>${count11}<br>${pct11}</td>  </tr>`;

        return `<table class="test-results">${headerRows}${tableRows}</table>`;
    }


    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.fisher.menuString",    //  see? fisher!
            data.yName(),data.xName());
    }

    makeConfigureGuts() {
        const xName = data.xName();
        const yName = data.yName();

        const sidesButtonHTML = ui.sidesFisherButtonHTML(testimate.state.testParams.sides);

        const start = localize.getString("tests.fisher.configurationStart", sidesButtonHTML);
        const groupXbutton = ui.focusGroupButtonXHTML(testimate.state.testParams.focusGroupX);
        const groupYbutton = ui.focusGroupButtonYHTML(testimate.state.testParams.focusGroupY);

        let theHTML = start;
        theHTML += localize.getString("tests.fisher.configureFocus", yName, groupYbutton, xName, groupXbutton);

        return theHTML;
    }

    makeZeroMatrix(cols, rows) {
        let A = new Array(cols);
        for (let c = 0; c < cols; c++) {
            A[c] = new Array(rows).fill(0);
        }
        return A;
    }

    // Fisher's Exact Test Implementation (from Clause)
    fisherExactTest(a, b, c, d) {
        console.log("Fisher calculation!");

        const n = a + b + c + d;
        const rowMargin1 = a + b;
        const colMargin1 = a + c;

        // Hypergeometric probability for a given value of 'a'
        // Using the formula: C(rowMargin1, a) * C(n - rowMargin1, colMargin1 - a) / C(n, colMargin1)
        const hypgeomProb = (aVal) => {
            if (aVal < 0 || aVal > rowMargin1 || aVal > colMargin1) return 0;
            const cVal = colMargin1 - aVal;
            if (cVal < 0 || cVal > (n - rowMargin1)) return 0;

            // Using jStat's combination function
            const numerator = jStat.combination(rowMargin1, aVal) *
                jStat.combination(n - rowMargin1, cVal);
            const denominator = jStat.combination(n, colMargin1);

            return numerator / denominator;
        };

        // Probability of observed table
        const pObserved = hypgeomProb(a);
        console.log(`    p(a = ${a}) = ${pObserved}`);

        // Range of possible values for 'a'
        const minA = Math.max(0, colMargin1 - (n - rowMargin1));
        const maxA = Math.min(rowMargin1, colMargin1);

        //  find the direction of the test, but we can't do that until we get the expected value for "a"

        this.results.aExpected = rowMargin1 * colMargin1 / n;
        if (!testimate.iteratingRandom) {
            testimate.determineSidesOp();
        }
        const sidesOp = testimate.state.testParams.theSidesOp;

        let pValue;

        if (sidesOp === '>') {
            // Right tail: sum probabilities for a >= observed
            pValue = 0;
            for (let aVal = a; aVal <= maxA; aVal++) {
                const prob = hypgeomProb(aVal);
                pValue += prob;
                console.log(`        a = ${aVal}, prob = ${ui.numberToString(prob)}`);
            }
        } else if (sidesOp === '<') {
            // Left tail: sum probabilities for a <= observed
            pValue = 0;
            for (let aVal = minA; aVal <= a; aVal++) {
                const prob = hypgeomProb(aVal);
                pValue += prob;
                console.log(`        a = ${aVal}, prob = ${ui.numberToString(prob)}`);
            }
        } else {
            // Two-sided: sum all probabilities <= observed probability, sidesOp = '≠'
            pValue = 0;
            for (let aVal = minA; aVal <= maxA; aVal++) {
                const prob = hypgeomProb(aVal);
                if (prob <= pObserved + 1e-10) { // Small epsilon for floating point comparison
                    pValue += prob;
                    console.log(`        a = ${aVal}, prob = ${ui.numberToString(prob)}`);
                }
            }
        }

        // Calculate odds ratio
        const oddsRatio = (a * d) / (b * c);
        const relativeRisk = a * (b + d) / ((a + c) * b);

        return {
            pValue: Math.min(pValue, 1), // Cap at 1 due to floating point errors
            oddsRatio: isFinite(oddsRatio) ? oddsRatio : null,
            relativeRisk: isFinite(relativeRisk) ? relativeRisk : null,
            pObserved: pObserved,
            aExpected: rowMargin1 * colMargin1 / n
        };
    }

}

/*
FROM CLAUDE



import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

// Fisher's Exact Test Implementation
const fisherExactTest = (a, b, c, d, alternative = 'two-sided') => {
    const n = a + b + c + d;
    const rowMargin1 = a + b;
    const colMargin1 = a + c;

    // Hypergeometric probability for a given value of 'a'
    // Using the formula: C(rowMargin1, a) * C(n - rowMargin1, colMargin1 - a) / C(n, colMargin1)
    const hypgeomProb = (aVal) => {
        if (aVal < 0 || aVal > rowMargin1 || aVal > colMargin1) return 0;
        const cVal = colMargin1 - aVal;
        if (cVal < 0 || cVal > (n - rowMargin1)) return 0;

        // Using jStat's combination function
        const numerator = jStat.combination(rowMargin1, aVal) *
            jStat.combination(n - rowMargin1, cVal);
        const denominator = jStat.combination(n, colMargin1);

        return numerator / denominator;
    };

    // Probability of observed table
    const pObserved = hypgeomProb(a);

    // Range of possible values for 'a'
    const minA = Math.max(0, colMargin1 - (n - rowMargin1));
    const maxA = Math.min(rowMargin1, colMargin1);

    let pValue;

    if (alternative === 'greater') {
        // Right tail: sum probabilities for a >= observed
        pValue = 0;
        for (let aVal = a; aVal <= maxA; aVal++) {
            pValue += hypgeomProb(aVal);
        }
    } else if (alternative === 'less') {
        // Left tail: sum probabilities for a <= observed
        pValue = 0;
        for (let aVal = minA; aVal <= a; aVal++) {
            pValue += hypgeomProb(aVal);
        }
    } else {
        // Two-sided: sum all probabilities <= observed probability
        pValue = 0;
        for (let aVal = minA; aVal <= maxA; aVal++) {
            const prob = hypgeomProb(aVal);
            if (prob <= pObserved + 1e-10) { // Small epsilon for floating point comparison
                pValue += prob;
            }
        }
    }

    // Calculate odds ratio
    const oddsRatio = (a * d) / (b * c);

    return {
        pValue: Math.min(pValue, 1), // Cap at 1 due to floating point errors
        oddsRatio: isFinite(oddsRatio) ? oddsRatio : null,
        pObserved
    };
};

const FisherExactTestCalculator = () => {
    const [a, setA] = useState(3);
    const [b, setB] = useState(1);
    const [c, setC] = useState(1);
    const [d, setD] = useState(3);
    const [alternative, setAlternative] = useState('two-sided');
    const [result, setResult] = useState(null);

    const handleCalculate = () => {
        try {
            const res = fisherExactTest(
                parseInt(a),
                parseInt(b),
                parseInt(c),
                parseInt(d),
                alternative
            );
            setResult(res);
        } catch (error) {
            alert('Error calculating test: ' + error.message);
        }
    };

    const rowMargin1 = parseInt(a) + parseInt(b);
    const rowMargin2 = parseInt(c) + parseInt(d);
    const colMargin1 = parseInt(a) + parseInt(c);
    const colMargin2 = parseInt(b) + parseInt(d);
    const total = parseInt(a) + parseInt(b) + parseInt(c) + parseInt(d);

    const getAlternativeDescription = () => {
        if (alternative === 'two-sided') {
            return 'Tests if the odds ratio differs from 1';
        } else if (alternative === 'greater') {
            return 'Tests if Group 1 has higher event rate than Group 2';
        } else {
            return 'Tests if Group 1 has lower event rate than Group 2';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">Fisher's Exact Test</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">2×2 Contingency Table</h2>
                        <div className="overflow-x-auto">
                            <table className="border-collapse border border-gray-300">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-3"></th>
                                    <th className="border border-gray-300 p-3">Group 1</th>
                                    <th className="border border-gray-300 p-3">Group 2</th>
                                    <th className="border border-gray-300 p-3 bg-gray-200">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td className="border border-gray-300 p-3 font-semibold bg-gray-100">Event</td>
                                    <td className="border border-gray-300 p-3">
                                        <input
                                            type="number"
                                            value={a}
                                            onChange={(e) => setA(e.target.value)}
                                            className="w-20 p-2 border rounded"
                                            min="0"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-3">
                                        <input
                                            type="number"
                                            value={b}
                                            onChange={(e) => setB(e.target.value)}
                                            className="w-20 p-2 border rounded"
                                            min="0"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-3 bg-gray-200 font-semibold">{rowMargin1}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-3 font-semibold bg-gray-100">No Event</td>
                                    <td className="border border-gray-300 p-3">
                                        <input
                                            type="number"
                                            value={c}
                                            onChange={(e) => setC(e.target.value)}
                                            className="w-20 p-2 border rounded"
                                            min="0"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-3">
                                        <input
                                            type="number"
                                            value={d}
                                            onChange={(e) => setD(e.target.value)}
                                            className="w-20 p-2 border rounded"
                                            min="0"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-3 bg-gray-200 font-semibold">{rowMargin2}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 p-3 font-semibold bg-gray-200">Total</td>
                                    <td className="border border-gray-300 p-3 bg-gray-200 font-semibold">{colMargin1}</td>
                                    <td className="border border-gray-300 p-3 bg-gray-200 font-semibold">{colMargin2}</td>
                                    <td className="border border-gray-300 p-3 bg-gray-300 font-bold">{total}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Alternative Hypothesis</label>
                        <select
                            value={alternative}
                            onChange={(e) => setAlternative(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="two-sided">Two-sided (≠)</option>
                            <option value="greater">Greater (>)</option>
                            <option value="less">Less (&lt;)</option>
                        </select>
                        <p className="text-sm text-gray-600 mt-2">
                            {getAlternativeDescription()}
                        </p>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Calculate Fisher's Exact Test
                    </button>

                    {result && (
                        <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 text-indigo-900">Results</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">p-value:</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                    {result.pValue.toFixed(6)}
                  </span>
                                </div>
                                {result.oddsRatio !== null && (
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Odds Ratio:</span>
                                        <span className="text-xl font-bold text-gray-800">
                      {result.oddsRatio.toFixed(4)}
                    </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Probability of observed table:</span>
                                    <span className="text-gray-800">{result.pObserved.toFixed(6)}</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-indigo-200">
                                    <p className="text-sm text-gray-700">
                                        <strong>Interpretation:</strong> {result.pValue < 0.05
                                        ? 'The association is statistically significant at α = 0.05'
                                        : 'The association is not statistically significant at α = 0.05'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                        <h4 className="font-semibold mb-2">About Fisher's Exact Test</h4>
                        <p>
                            Fisher's exact test determines if there are nonrandom associations between two categorical variables
                            in a 2×2 contingency table. It's particularly useful for small sample sizes where chi-square tests
                            may be unreliable. The test computes exact probabilities using the hypergeometric distribution.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FisherExactTestCalculator;

*/
