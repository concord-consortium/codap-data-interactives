# Making a new test in `testimate`

In this document, I (Tim) plan to record my process in implementing 
a new test—in this case, Fisher's exact test.
This will draw on the corresponding section in the Programmer Guide,
but will list the steps chronologically.

## What is Fisher's exact test?

I had heard the phrase but never used it myself.
Here's the basic idea:

If we have data that we can represent 
as a 2x2 table of counts—which we often do,
in many contexts, and which 
we have explored extensively in the `arbor` universe—a question
arises whether the two attributes are associated.

These two attributes might be outcome and predictor,
for example if you have `experimental` and `control` groups
(which would be the predictor) and wanted to test whether the 
result was `positive` or `negatative` (the outcome). 
We often hope that the experimental outcome is positive in
a non-medical context (do students who use our learning tools do better?)
or negative in a medical setting (do patients who get the drug
have Fbola after 3 weeks?).

Or the two attributes may really just be about association,
not cause and effect.

Anyway, in the current `testimate`, we would analyze these data
using a chi-squared test for independence. 
A problem arises, however, if we have small sample sizes,
and the four cells in our table end up with fewer than five, or even zero, cases.
That's a situation in which we can use Fisher's exact test to judge
whether it's plausible that, in the case of the null hypothesis
(i.e., no association) you would get a result "this extreme or more."

This is just like using the binomial instead of _z_ for proportions
when the counts are low. What Fisher did was to look at all possible ways
to allocate the cases to the cells, and simply (ha ha) take the
ratio of more-extreme possibilities to all the possibilities.

But how do you figure out what's a possibility?
We take a page from randomization. Rather than imagining dropping 
all of our cases randomly into the four bins, we instead imagine
tearing the little data cards in two, with predictor and outcome
now on separate slips,
and then randomly matching them up to create a new dataset.
One key realization is that _this does not change the marginal totals
in the table_.

Now: how do you judge extreme? Chi-squared, as a statistic, compares
expected to observed values and adds up 
the normalized squares of differences...which doesn't work well here.
But with the marginal totals the same, we realize a really cool truth:
There is only one degree of freedom in the table.
That is, the count in the upper-left cell (we'll call it `a`)
is a measure of extreme-ness. 
We can calculate the expected value `e` the usual way.
Then if `a > e`, "as extreme or more" is simply the arrangements
where the value in the upper left is greater than or equal to `a`.

## Initial planning

Lee Creighton requested the Fisher exact test, and he gave
sensible reasons why it might be useful,
though I had no idea how to calculate it.
A bit of googling suggested that it would be possible,
and the calculations would not be too onerous.

One key constraint we will impose, for simplicity,
it that we will offer it only in the 2x2 case.
This immediately suggests some of the implementation
and brings up a question.

First, if it's 2x2, that means that both attributes are _binary_,
and as a consquence the test "signatire" will begin with `BB`. 
That means that the test won't even appear unless there are two
binary attributes selected in the plugin.
This is great, but what a about a situation where we have categorical
attributes with more than two categories, but we want to do Fisher using
them, where we select one value (e.g., "frosh") and want to test
`frosh` vs `not frosh`? 
For now, I will ignore that, adopting the policy that if the user wants to
do that, they can make their own attribute.
Still, it's something to consider.

As to the calculation, I came across a number of suggestions for how to 
implement the one-sided test, and then warnings like, 
"The two-sided p-value is not simply twice the one-sided.
The calculation is complicated. Use software."
That would be us, right? So how do we do it?
After a lot of to and fro with Google, I decided to ask Claude,
who of course gave me sensible and usable code.
We will document how that went as we go along.
Right now, the code makes some sense, but I will be studying its logic
and performance carefuilly as we get into the implementation.

Now, as to the order we expect here:

* Create the `Fisher` subclass of `Test` as a js file, with stubs for
the required functionality.
* Implement Claude's code and debug it, getting results in the console,
using only the attributes as presented. No configuration.
* Implement and refine the basic text display.
* Configuration: implement one- and two-sided, first in the console
with gureilla coding, then using chiclet buttons in the UI.
* Configuration: ability to change which attribute value is listed first 
in each attribute. 
This lets the user focus on the "experimental" group, if any,
and on which result is "positive."
* Implement emit-to-CODAP

Special challenges I anticipate:

* Claude's code is simpler than I expected. 
Gonna have to test it carefully, and really come to understand the test.
* I suspect that we may need to let the user specify which tail for a 
one-sided test. We haven't done that before.
* We've never had to specify "focus values" for both attributes.
Gonna have to make the UI very clear

## First steps: the Fisher subclass

First, I made a file called `fisherExact.js` and poured in 
things I had found earlier and Claude's code
so I wouldn't use it, and commented all of that out.

Then, I realized that, since we're making a replacement for 
the test for independence, I should just start with that.
So I copied the whole contents of `independence.js` and 
plopped it into the file.
The plan is to get everything hooked up so that I can
choose Fisher when both attributes are binary,
but when we choose it, we get the test for independence
(with warnings for small counts!).

### fisherExact.js, beginning

Name the class:

```javascript
class Fisher extends Test {
```
### index.html

Connect to the new test:

```javascript
<script src="src/tests/correlation.js"></script>
<script src="src/tests/independence.js"></script>
<script src="src/tests/fisherExact.js"></script>    <!-- new 2026-01-02 -->
<script src="src/tests/anova.js"></script>
```

### Test.js

Add Fisher to the list of tests, using `independence` as a model.

```javascript
CC01: {
    id: `CC01`,
        name: `independence`,
        xType: 'categorical',
        yType: `categorical`,
        paired: true,
        groupAxis : "",
        emitted: `P,chisq,chisqCrit,N,df,alpha,sides`,
        paramExceptions: { sides : 1 },
        makeMenuString: ( ) => {return Independence.makeMenuString(`CC01`);},
        fresh: (ix) => { return new Independence(ix)  },
},
BB03: {
    id: `BB03`,
        name: `Fisher exact`,
        xType: 'binary',
        yType: `binary`,
        paired: true,
        groupAxis : "",
        emitted: `N,P`,
        paramExceptions: {},
        makeMenuString: ( ) => {return Fisher.makeMenuString(`BB03`);},
        fresh: (ix) => { return new Fisher(ix)  },
},

```

### testimate_English.json

Seeing `makeMenuString` made me realize that we should implement that one
function immediately so we can actually choose Fisher as distinct from independence.
But when we look at the code, we see that we'll need to
set some localization strings for the test.
This way, we will get free UI help seeing if we chose this test for real!

Again, we use independence as the model and lightly edit it.

```json
      "independence": {
        "menuString": "chisquare test of independence of •1• from •2•",
        "testQuestion": "Are (•1•) and (•2•) independent?",
        "detailsSummary": "<summary>Testing independence, •1•-sided &chi;<sup>2</sup> procedure</summary>",
        "configurationStart": "configure test for independence of (•1•) from (•2•)",
        "warning" : "⚠️😱&emsp;WARNING!<br>Some cells have too few cases for this test! Consider combining rows and/or columns.",
        "warningFisher" : "⚠️😱&emsp;WARNING!<br>Some cells have too few cases! Consider combining rows and/or columns ... or using a Fisher exact test"
      },
      "fisher": {
        "menuString": "Fisher exact test of independence of •1• from •2•",
        "testQuestion": "Are (•1•) and (•2•) independent?",
        "detailsSummary": "<summary>Testing independence, •1•-sided Fisher exact procedure</summary>",
        "configurationStart": "configure Fisher exact test for independence of (•1•) from (•2•)",
      },

```

### fisherExact.js, hook up some strings

Now we fix `makeMenuString()`:

```javascript
static makeMenuString() {
    return localize.getString("tests.fisher.menuString",    //  see? fisher!
            data.yName(),data.xName());
}

```

### Initial test

It works!

![](art/Fisher%20illustration%2001.png)

## Fisher: the calculation

Now that we can get something to appear, it's time to 
get the calculation to work correctly.

This will happen first in `updateTestResults()`.

Oh! and I'd better make a new branch....and a new version, 2026a.

### testimate.js

Set the version to 2026a!

### fisherExact.js

Plop the main Claude function in and adjust its syntax:

```javascript
    // Fisher's Exact Test Implementation (from Clause)
fisherExactTest(a, b, c, d, alternative = 'two-sided')  {
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
}
```

Notice that it's two-sided by default. 
That's what we'll use to test.
(Notice also that in the discussion above, we did not discuss 
what "more extreme" might mean for a two-sided test here.)

Now we call that function after we count up the observed cases.
Note that it's always confusing which thing is the rows and 
which is the columns. 
I THINK we're going to want columns to be different groups (`Y`)
and the rows to be different results (`X`).
But for now, we're just going to see how it comes out.

```javascript
        //  loop over all data
        //  count the observed values in each cell, update row and column totals

for (let ix = 0; ix < X.length; ix++) {
    const row = this.results.rowLabels.indexOf(X[ix]);
    const column = this.results.columnLabels.indexOf(Y[ix]);
    this.results.observed[column][row]++;
    this.results.rowTotals[row]++;
    this.results.columnTotals[column]++;
}

const a = this.results.observed[0][0];
const b = this.results.observed[1][0];
const c = this.results.observed[0][1];
const d = this.results.observed[1][1];
console.log(`a, b, c, d: ${a} ${b} ${c} ${d}`);

const fisherResult = this.fisherExactTest(a, b, c, d);  //  the call!
console.log(`Fisher result: ${JSON.stringify(fisherResult)}`);

```

Amazingly, we get good results with 3, 1, 1, 3 and 4, 0, 0, 4.
We check it in an online calculator at
(https://www.omnicalculator.com/statistics/fishers-exact-test).

Let's move on!

## The results string: in fisherExact.js

Now we adjust various things to make the Fisher result appear on the screen
instead of the independence, chi-square results.

### updateTestResults()
First, we stuff the results from the test into the `results` object:

```javascript
const fisherResult = this.fisherExactTest(a, b, c, d);
console.log(`Fisher result: ${JSON.stringify(fisherResult)}`);

this.results.P = fisherResult.pValue;
this.results.oddsRatio = fisherResult.oddsRatio;
this.results.aExpected = this.results.columnTotals[0] * this.results.rowTotals[0] / this.results.N;
//  don't understand fisherResult.observed yet!

```

Note we don't yet understand the "observed" member; at 4 0 0 4, this is 
half the p-value. Is it possibly a one-sided probability?
We will find out later.

I have also calculated the `a` expected value, anticipating that it
might be useful. 

Then I commented out much of the rest of the method, retaining `df`.

### makeReultsString()

This is the meat of this phase, of course.

* Change all localization strings from `independence` to `fisher`
* Note the call to `makeIndependenceTable()` and change it to `makeFisherTable()`
* Adjust the text to include only the values we need.
I removed references to chi-square of course, but also to alpha as I think
(and hope) that we don't do confidence intervals for this test.

I also noticed that there was an un-localized phrase remaining, so added a new
call to `localize,getString()` and a new item in the English localization file
for both this test and for `independence`.

It now looks like this:

```javascript
    makeResultsString() {
    const NString = Test.makeResultValueString("N", this.results.N);
    const PString = Test.makePString(this.results.P);
    const dfString  = Test.makeResultValueString("df", this.results.df, 3);

    const TIdetails = document.getElementById("TIdetails");
    const TIopen = TIdetails && TIdetails.hasAttribute("open");

    let out = "<pre>";
    out += localize.getString("tests.fisher.testQuestion", data.yName(), data.xName());
    out += `<br>    ${NString}, ${localize.getString("tests.fisher.columnsByRows", this.results.columnLabels.length, this.results.rowLabels.length)} `;
    out += `<br>    ${PString}, ${dfString}`;
    out += `<details id="TIdetails" ${TIopen ? "open" : ""}>`;
    out += localize.getString("tests.fisher.detailsSummary", testimate.state.testParams.sides);
    out += this.makeFisherTable();
    out += `</details>`;

    out += `</pre>`;
    return out;
}
```

### makeFisherTable()

The main change here is that we do not display all expected values,
but only the one for "`a`".
For now, we won't even do that, and just get rid of the expecteds,
the corresponding legend, 
and any machinery for warning about small sample sizes.

This makes a functional display:

![](art/Fisher%20illustration%2002.png)

Although it can be cleaned up and generally improved.

Time to commit and save what we've done!

### A couple fixes
Of course, we find things that we forgot.
One is that, in order to display the odds ratio,
we need to allow for localization.
because we plan eventually to emit that value, 
we need to access the name of the attribute in the English
localization file. 
Part of the "attributeNames" section appears below.

Eventually we will also need to include attribute descriptions.

And you can see that I also included relative risk.

```javascript
      "procedure": "procedure",
      "relativeRisk" : "relativeRisk",
      "oddsRatio" : "oddsRatio",
      "SSR": "SSR",

```
We also refactored some things, particularly in the table display, which you can see above was wonky.
A more streamlined display, no longer with `df` looks like this:

![](art/Fisher%20illus%2003.png)


## The basic configuration box

I think we don't need alpha anymore, 
but we will need to make the machinery for controlling whether
we're doing a one- or two-sided test.

Because `independence` doesn't use sides, I'll have to look at other tests
(such as 2-sample _t_, which I have been working on lately)
to recall how I have managed this.

One issue is how much to use
`testimate.state.testParams.theSidesOp` (which has values of "≠", ">", or "<"),
and how much to use `testimate.state.testParams.sides` (which is 1 or 2).

I already incorporated `sidesOp` into the call to calculate the test results
in `updateTestResults()`:

```javascript
        const fisherResult = this.fisherExactTest(a, b, c, d, testimate.state.testParams.theSidesOp);
```
Also, this test is not the same as others in that the consequence of making it two-sided or one
is somewhat different from in other tests (I have discovered).
Consider data like this: {5 2 15 28}

* One-sided is straightforward, with a = 5, we would add the probabilities for $a ≥ 5$.
* But two-sided is tricky (and tricky to explain). We add up all the combinations
where $P ≤ (P(a) ≤ P(a = 5))$. If that makes sense.
  (and if that's correct; Claude may eb wrong, I'll check...checked out!)

So let's make a crude UI at first.
We'll look at two-sample _t_, the handlers in `handlers.js`, 
and the button-making routines in `ui.js` to find what we need. 

### handlers.js
We make a new method for this special case, which calls back into the
test itself to figure out the direction of one-sidedness

```javascript
/**
 * Special case: we change the number of "sides" of a Fisher exact test.
 */
changeSidesFisher : function() {
  const thisTest = testimate.theTest;
  if (thisTest.theConfig.name !== "Fisher exact") {
    alert(`changing sides in Fisher when this is not a Fisher test!`);
    return;
  }

  testimate.state.testParams.sides = testimate.state.testParams.sides === 1 ? 2 : 1;

  thisTest.determineSidesOp();        //  works only with Fisher
  testimate.refreshDataAndTestResults();
},

```

### fisherExact.js
Here is that method that we call.
We need it here in `fisherExact.js` because we need the special values of `a` and its
expected value in order to determine the sign.

```javascript
determineSidesOp() {
  if (testimate.state.testParams.sides === 2) {
    testimate.state.testParams.theSidesOp = "≠";
  } else {
    testimate.state.testParams.theSidesOp =  (this.results.a > this.results.aExpected) ? ">" : "<";
  }
}
```

### ui.js

Here we repurposed an unused sides-changing button, renaming it to serve this specific purpose:

```javascript
/**
 * simple button 1-sided, 2-sided.
 * Used only in Fisher
 *
 * @param iSides
 * @returns {`<input id="sidesFisherButton" class="chiclet" type="button" onclick="handlers.changeSidesFisher()"
 value="${string}">`}
 */
sidesFisherButtonHTML : function(iSides) {
  const buttonTitle = localize.getString("Nsided", iSides);   //  localized 1-sided or 2-sided
  return `<input id="sidesFisherButton" class="chiclet" type="button" onclick="handlers.changeSidesFisher()" 
                value="${buttonTitle}">`;
},


```

## The improved configuration box

The mechanics above work fine, and the results match the online calculator.
But the display doesn't explain what's going on to the user;
it doesn't even tell the user whether a one-sided test is using > or <!

Let's put new strings somewhere to clarify things. 
Because the logic depends on the value in the upper-left corner of the 2x2 table, 
let's highlight that somehow and use it in the explanation.

This text can go in the main area, the table area, or in the configuration area.
We'll try it in the main area and see how it works.

The text might be something like,

> The p-value is the chance that a randomized dataset would yield a count
> of (well, drug) cases greater than or equal to our value of 5.

or 

> The probability that a randomized dataset would yield a count of 
> (well, drug) is 5, like our dataset,
> is 0.0686. The p-value is the chance that a randomized dataset
> would have a count whose probability is less than or equal to that value.

Which is quite a mouthful, especially for the two-sided case!

Maybe this goes in the "table" area, which is supposed to explain the details of the test.

Suppose we go there and write something like:

> The null hypothesis is that there is no association between outcome and treatment.
> The upper-left cell, where (outcome = well) and (treatment = drug),
> has 5 cases. Let's call that cell "a".
> If the null hypothesis were true, 
> the probability of getting 5 cases in that cell would be 0.0686.
> 
> The p-value is the probability that, under the null hypothesis,
> we would get 5 or more cases in a. 

or

> The p-value is the probabilty that, under the null hypothesis,
> we would get a number of cases in a whose probabilty 
> is 0.0686 or fewer.

There are still questions a user might have, 
but perhaps we could explain those at greater length in the testimate guide. 

Anyway, that worked OK, but testing reveals how important it will be to be able to choose 
which value gets priority. (Right now,
whatever occurs first gets the top or left spot.)
Current state:

![](art/Fisher%20illus%204.png)

## Configuration 3: choosing focus values, etc.

There will be a challenge here distinguishing between two choices:

1. If there are two values (e.g., `drug` and `placebo`), the user gets to choose
which one is in the "focus" spot: top of left in the table,
and the important result in calculations, that is, which one is in the numerator, which ine is `a`.
2. If there are more than two values (`frosh`, `soph`, `junior`, `senior`),
the user gets to choose which one we focus on, leaving the others to be `not frosh` or whatever.

For now, we'll just implement (1), assuming that the attribute is truly binary.

A possible text:

> Focus this [1-sided] analysis on:\
> [treatment] = [drug] and\
> [outcome] = [well]


