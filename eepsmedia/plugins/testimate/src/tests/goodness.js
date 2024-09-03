class Goodness extends Test {

    constructor(iID) {
        super(iID);
        this.results.expected = {};
        this.results.observed = {};
        this.results.groupNames = [];
        if (!testimate.restoringFromSave) {
            testimate.state.testParams.groupProportions = {};
        }

        //  testimate.state.testParams.sides = 1;
    }

    updateTestResults() {

        const A = data.xAttData.theArray;
        this.results.N = A.length;
        const tempNames = [...data.xAttData.valueSet];
        this.results.groupNames  = tempNames.map( n => String(n));

        testimate.state.testParams.groupProportions = this.getExpectations();

        this.results.groupNames.forEach( v => {
            this.results.observed[v] = 0;
            this.results.expected[v] = this.results.N * testimate.state.testParams.groupProportions[v];
        })

        //`count the observed values in each category
        A.forEach( a => {
            this.results.observed[a]++;
        })

        //  counts array now has all counts.

        this.results.chisq = 0;

        this.results.groupNames.forEach( v => {
            const cellValue = (this.results.observed[v] - this.results.expected[v])**2
                / this.results.expected[v];
            this.results.chisq += cellValue;
        })

        const theCIparam = 1 - testimate.state.testParams.alpha / testimate.state.testParams.sides;   //  the large number
        this.results.df = this.results.groupNames.length - 1;
        this.results.chisqCrit = jStat.chisquare.inv(theCIparam, this.results.df);    //
        this.results.P = 1 - jStat.chisquare.cdf(this.results.chisq, this.results.df);
    }

    makeResultsString() {

        const N = this.results.N;
        const chisq = ui.numberToString(this.results.chisq);
        const chisqCrit = ui.numberToString(this.results.chisqCrit);
        const P = (this.results.P < 0.0001) ?
            `P < 0.0001` :
            `P = ${ui.numberToString(this.results.P)}`;
        const df = ui.numberToString(this.results.df, 3);
        const conf = ui.numberToString(testimate.state.testParams.conf);
        const alpha = ui.numberToString(testimate.state.testParams.alpha);

        const GFdetails = document.getElementById("GFdetails");
        const GFopen = GFdetails && GFdetails.hasAttribute("open");

        let out = "<pre>";
        out += localize.getString("tests.goodness.testQuestion", data.xAttData.name);
        //  out += `Are the proportions of ${data.xAttData.name} as hypothesized?`;
        out += `<br>    N = ${N}, ${this.results.groupNames.length} ${localize.getString("groups")}, &chi;<sup>2</sup> = ${chisq}, ${P}`;
        out += `<details id="GFdetails" ${GFopen ? "open" : ""}>`;
        out += localize.getString("tests.goodness.detailsSummary1", testimate.state.testParams.sides);
        out += this.makeGoodnessTable();
        out += `    df = ${df}, &alpha; = ${alpha}, &chi;<sup>2</sup>* = ${chisqCrit} <br>`;
        out += `</details>`;

        out += `</pre>`;
        return out;
    }

    makeGoodnessTable() {

        let nameRow = `<tr><th>${data.xAttData.name} =</th>`;
        let observedRow = `<tr><td>${localize.getString("observed")}</td>`;
        let expectedRow = `<tr><td>${localize.getString("expected")}</td>`;

        this.results.groupNames.forEach( v => {
            nameRow += `<th>${v}</th>`;
            observedRow += `<td>${this.results.observed[v]}</td>`;
            expectedRow += `<td>${ui.numberToString(this.results.expected[v], 3)}</td>`;
        })

        nameRow += `</tr>`;
        observedRow += `</tr>`;
        expectedRow += `</tr>`;

        return `<table class="test-results">${nameRow}${observedRow}${expectedRow}</table>`;
    }

    getExpectations() {
        let out = {};

        let needFresh = false;

        const oldGroups = Object.keys(testimate.state.testParams.groupProportions);
        //  problem here: oldGroups is now an array of STRINGS, even if the keys were numbers.
        //  (Titanic "Class", {1,2,3} rendered as categorical, now we're doing goodness of fit.)

        const newGroups = this.results.groupNames;

        let sum = 0;

        /*
            for each old group, if it's also a new group,
            give it that old proportion as a first guess
         */
        oldGroups.forEach( old => {
            if (newGroups.includes(old)) {  //      there is a match!
                let newVal = testimate.state.testParams.groupProportions[old];
                if (sum + newVal > 1) {
                    newVal = 1 - sum;
                }
                out[old] = newVal;
                sum += newVal;
            }
        })

        //  how many do we still have to find?
        const leftOut = newGroups.length - Object.keys(out).length;

        /*
            for each new group, is it left out?
            if so, give it that fraction of what's left to be allocated.
         */
        newGroups.forEach(n => {
            if (!out.hasOwnProperty(n))   {       //  haven't done it yet!
                out[n] = (1 - sum)/leftOut;
            }
        })

        return out;
    }

    makeTestDescription( ) {
        return `goodness of fit: ${testimate.state.x.name}`;
    }

    /**
     * NB: This is a _static_ method, so you can't use `this`!
     * @returns {string}    what shows up in a menu.
     */
    static makeMenuString() {
        return localize.getString("tests.goodness.menuString",testimate.state.x.name);
        //  return `goodness of fit for ${testimate.state.x.name}`;
    }

    makeConfigureGuts() {
        const sides12Button = ui.sides12ButtonHTML(testimate.state.testParams.sides);
        const alpha = ui.alphaBoxHTML(testimate.state.testParams.alpha);

        let theHTML = `${localize.getString("tests.goodness.configurationStart")}`;
        theHTML += `<br>&emsp;${alpha}&emsp;${sides12Button}`;


        let nameRow =   `<tr><th>${testimate.state.x.name} &rarr; </th>`;
        let valueRow =   `<tr><th>${this.equalExpectationsButton()}</th>`;

        //  is the goodness-of-fit configuration details element [extant and] open?

        const GFConfigDetails = document.getElementById("GFConfigDetails");
        const GFConfigOpen = GFConfigDetails && GFConfigDetails.hasAttribute("open");

        //  start the GF details element

        theHTML += `<details id="GFConfigDetails" ${GFConfigOpen ? "open" : ""}>`;
        theHTML += localize.getString("tests.goodness.detailsSummary2");

        //  start the table of values. These are not results per se, but we class the table that way.

        theHTML += `<table class="test-results">`

        //  the last group name will absorb any leftover proportion
        const lastGroupName = this.results.groupNames[this.results.groupNames.length - 1];
        this.results.groupNames.forEach( g => {
            const theProp  = ui.numberToString(testimate.state.testParams.groupProportions[g],3)
            nameRow += `<th>${g}</th>`;
            valueRow += (g === lastGroupName) ?   //  (the last one)
                `<td id="lastProp">${theProp}</td>` :
                `<td><input type="number" class="short_number_field" value="${theProp}"
                    step=".01" min="0" max="1"
                    id="GProp_${g}"
                    onchange="handlers.changeGoodnessProp('${lastGroupName}')"></input></td>`;
        })

        theHTML += `${nameRow}${valueRow}</table>`;
        theHTML += `</details>`;

        return theHTML;
    }

    equalExpectationsButton( ) {
        const theTip = localize.getString("tips.equalize");
        const theLabel = localize.getString("equalize") + "&nbsp;&rarr;";
        return `<input id="equalExpectationsButton" type="button" 
                onclick="Goodness.equalizeExpectations()" 
                value=${theLabel} title="${theTip}">`
    }

    static equalizeExpectations() {
        const theProportions = testimate.state.testParams.groupProportions;
        const theShares = Object.keys(theProportions).length;
        const theEqualShare = 1.0 / theShares;
        for (let group in theProportions) {
            if (theProportions.hasOwnProperty(group)) {
                theProportions[group] = theEqualShare;
            }
        }
        testimate.refreshDataAndTestResults();
    }


}