# testimate programmer's guide

## Overall design

The user drops attributes onto the "x" and "y" attribute positions. 
The idea is that if there's only one attribute, it's `x`.
The second attribute is `y`.

If there are two attributes, `x` is the outcome and `y` is the predictor.
This is wrong, traditionally, but it's (probably) too late to change! 
For some tests, such as a two-sample *t*, both are equivalent.

`testimate` evaluates the variables to see what kind they are.
It judges them to be _numeric_, _categorical_, or _binary_,
that is categorical with only two categories. 

Once the two variables are established, 
`testimate` presents the user with all the tests appropriate to that set of variables.
These appear in a menu.
The moment that menu item is changed, `testimate` recalculates everything and displays the results
of that test and/or estimate. 

The user can press buttons to "emit" data into CODAP. 
These are test parameters and results, and go into a separate collection.
If the test has been changed, the dataset is constructed anew.
(If it were not, the attributes would not be the same.)

## The update loop
We want to show the user a valid test and its results whenever any attribute has been dropped
into a slot in the plugin.
This happens not just on the drop of an attribute,
but whenever anything happens that could conceivably affect those results;
that way the display is always current.
So if the user changes the test, we update.
If the user changes the alpha level, we update.
If a case value changes, we update.

These actions result in calls to various handlers, 
most of which are in `handlers.js`.
The handlers call "update central" in the form of
`testimate.refreshDataAndTestResults()`.

An example is the handler that gets called when a user picks a new test from the menu:

```javascript
    changeTest: function() {
        const T = document.getElementById(`testMenu`);
        testimate.makeFreshTest(T.value); //  the testID, need for state and restore
        testimate.refreshDataAndTestResults();
    }
```

Other handlers include notification handlers (like for case or attribute changes in CODAP)
that are more elaborate and may reside in `connect.js` or `data.js`
depending on whether I've gotten around to refactoring...

### testimate.refreshDataAndTestResults()

Here is that method, with various console.logs removed:

```
    refreshDataAndTestResults: async function () {
        if (this.state.dataset) {
            await data.updateData();
            await data.makeXandYArrays(data.allCODAPitems);
            this.dirtyData = false;     //  todo: do we need this any more?

            this.checkTestConfiguration();      //  ensure that this.theTest holds a suitable "Test"

            if (this.theTest && this.theTest.testID) {
                this.adjustTestSides();     //  todo: figure out if this is correct; shouldn't we compute the value before we do this?
                data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
                await this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.
            } 
        }         
        ui.redraw();
    },
```

This method is responsible for getting everything ready for display,
and then calling `ui.redraw()`, which makes the display happen.

* `data.updateData()` gets the data from CODAP as an array of items, `data.allCODAPitems`.
* `data.makeXandYArrays()` processes those case-based objects into [one or] two Arrays, 
containing the values for the [one or] two attributes. These are of class `AttData`,
and hold additional information, such as whether the attribute is numeric or categorical.
* `this.checkTestConfiguration()` creates a list of all compatible tests;
if the current test is not on the list, it picks a new one and 
stores it in `testimate.theTest`.
* `this.adjustTestSides()` may be gone soon, but it takes care of the one- or two-sided nature of the test.
*  `data.removeInappropriateCases()` adjusts the x and y arrays depending on the test.
For example, in a regression, it ensures that each pair of values are both numeric.
The result is cleaned arrays suitable for the stats package we use for calculation.
* `this.theTest.updateTestResults()` actually performs the calculations,
storing results in an object `theTest.results`.


## Tests

Each test (and its associated estimate, if any) is represented 
by a class that inherits from `Test`. 
In that file (`src/Test.js`) is a static menber, `Test.configs`, 
which is an object whose keys are...well, here's one:

```
        NN02: {
            id: `NN02`,
            name: 'two-sample t',
            xType: 'numeric',
            yType: 'numeric',
            paired: false,
            groupAxis : "",
            emitted: `N,P,mean1,mean2,diff,t,conf,CImin,CImax`,
            testing: `diff`,
            makeMenuString: ( ) => {return TwoSampleT.makeMenuString(`NN02`);},
            fresh: (ix) => { return new TwoSampleT(ix, false)  },
        },
```

The `id`, `NN02`, means that x and y are `N`umeric and that this is the second (of four)
tests that you can do if both your attributes are numeric. 
This particular one is an un-paired, two-sample _t_ procedure, 
testing or estimating the difference of means between two attributes. 
(The other three `NN` are a one-sample _t_ — using only `x` —; 
a paired two-sample _t_;
and linear regression.)

The configuration above also gives you hints about other things.
For example, the class `TwoSampleT` is the subclass of `Test` in which the test is performed.
Its code is in `src/test/two-sample-t.js`.
We also infer that it will have a (`static`) method called `makeMenuString(iConfigID)`, 
and as you might expect it's responsible for creating the text of the menu item
that the user can choose.

Note: in this case, the _paired_ test also refers to the `TwoSampleT` class, but in its configuration,
the `paired` member is set to `true`. 
That way, the test instantiation can know to make the appropriate calculations and 
construct the appropriate output.

### Test subclasses

There are a total of 10 subclasses of `Test` as of this writing (Nov 2023).
All tests, like `TwoSampleT`, have `makeMenuString`. 
Besides `makeMenuString()`, they have several methods in common as well, for example:

#### updateTestResults()
...does the actual calculation. 
It adds to an object called `results` that belongs to the instance of the test.
An example for two-sample _t_ is the calculation of standard error. 
Its line is

```
    this.results.SE = this.results.s * Math.sqrt((1 / this.results.N1) + (1 / this.results.N2));
```

which is, of course,different from the corresponding line in the `OneSampleT` class:

```
    this.results.SE = this.results.s / Math.sqrt(this.results.N);
```
#### makeResultsString()
...creates a string (HTML) that gets put into the DOM so the user can see it.
It basically takes elements of `this.results` (such as `this.results.SE`)
and inserts them into a big string (called `out`) that the method constructs and returns.

In that method, the results items are first converted into strings:

```agsl
    const SE = ui.numberToString(this.results.SE);
```

The utility `ui.numberToString()` takes an optional argument for the number of places (default: 4). 
It also collapses large numbers (to make, e.g., `3.7602 M` for 3.76 million) and, if necessary,
resorts to scientific notation. 
this is important because the user really doesn't want to see all the available places.

Ultimately, these string elements get substituted into `out`; this shows the 
part that outputs the confidence interval:

```        
    out += `<br>    diff = ${diff},  ${conf}% CI = [${CImin}, ${CImax}] `;
```

#### makeConfigureGuts()
...makes the HTML that fills the "configuration" stripe taht appears below the results. 
There, the user specifies important _parameters_ for the test
such as 

* the value you are testing against 
* whether you are doing a one-or two-sided procedure
* the confidence level you want for the estimate

These are stored not in `results` but in the global `state` variable,
such as `testimate.state.testParams.conf`, which is the confidence level.

### Test parameters

When you perform a test, you do so using a number of parameters such as
the alpha level and whether it is 1- or 2-sided.
These parameters vary from test to test.
They are used extensively in each test's `updatetestResults()` method.

The current parameters are an object stored in a `state` field,
that is, `testimate.state.testParams`. 
Users change test parameters using the "configuration" section
of the display, created using the `makeConfigureGuts()` 
method for each type of test.

> Note: do not confuse this user-facing "configuration" with the _test_ configuration,
> often `theConfig`, which specifies things about the _type_ of
> test, such as whether its variables must be numeric or categorical.
> Those "configs" live in the important and extensive
> static object, `Test.configs`.

The tricky bit is that we want `testimate` to remember the parameters
for each type of test, so that if the user changes from (say)
a one-sample *p* test to a test for independence,
and then switches back, the parameters are restored. 

This is accomplished using another `state` field,
`testimate.state.testParamDictionary`, which is keyed by the 
`testID`, that is, the four-character label such as `C_01`.
Each value in that dictionary is the entire `testParam` object,
kind of like this:

```javascript
testParamDictionary : {
    BB01 : {
        alpha : 0.05
        conf : 95
        focusGroupX : "sick"
        focusGroupY : "treatment"
        reversed : false
        sides : 2
        value : 0
    }
}
```

Note that this dictionary, keyed by test type, 
is different from (and independent of) the "focus group" dictionaries, which
are keyed by attribute name. 

Tests are created anew frequently, and when they are, a new set of `testParams`
gets created as well. 
The dance between saved values and defaults for a new test takes
place in the (parent class) `Test` constructor, like this:

```javascript
if (testimate.state.testParamDictionary[iID]) {
    testimate.state.testParams = testimate.state.testParamDictionary[iID];
} else {
    testimate.state.testParams = {...Test.defaultTestParams, ...this.theConfig.paramExceptions};
}
```
There are not many `paramExceptions`;  each type of test has a set, mostly empty. 
However, as an example, the one-sample _p_ test has a default `value` of 0.5,
while all other tests use 0 as a default.

When the user uses a control to change a parameter, that happens in 
a handler (in `handlers.js`). 
For example, changing `value` looks like this:

```javascript
changeValue: function() {
    const v = document.getElementById(`valueBox`);
    testimate.state.testParams.value = v.value;
    testimate.refreshDataAndTestResults();
}
```
Then the handler calls `refreshDataAndTestResults()`, where, if 
we find that there IS a working test, we save the current `testParams`
in the dictionary:

```javascript
    if (this.theTest && this.theTest.testID) {
        //  remember the test parameters for this type of test
        testimate.state.testParamDictionary[testimate.theTest.testID] = testimate.state.testParams;
... etc ...
```


## Communicating with CODAP

* User drops attributes into drop-target objects in the UI. 
This lets them specify what variables they are testing. 
This requires working with drop notifications.
* User can ask for test/estimate results to be emitted into a 
CODAP file. 
* In the case of multiple, repeated sampling and testing,
this requires interacting with `rerandomize`. 

## Emitting data into CODAP

The user can emit test results into CODAP.
This creates a new dataset with attributes that contain 
test or estimate results such as `P` or `CIMax`. 
The user chooses an `emitMode` (a member of `ui`, i.e., it's `ui.emitMode` in `ui.js`)
with one of three values: `single`, `random`, or `hierarchy`.

`single` is self-explanatory: you get one case.

With `random`, you choose a number of iterations.
The plugin re-randomizes the source collection that many times, 
performing the tests and emitting the results.

With `hierarchy`, the plugin performs the test once 
for every case in the top level of the hierarchy. 
This option does not appear if the dataset is flat or of there is only one case at the top.

## Getting and using CODAP data

CODAP data is case-based. 
If you get a set of CODAP *items*, they come as an array of objects,
where each object has a `values` member, an `Object` of key-value pairs 
that correspond to an attribute name and its value.

But to use the stat library we use for computation, we need an attribute-based
data structure, that is, for each attribute we're using, an array 
that contains the values. 
Of course, if we're using two attributes, the cases are connected by having
the indices correspond;
that is, the two arrays have to stay in order.

So here is the process, most of which is the responsibility of the `data` singleton,
located in `src/data.js`.

### Get data from CODAP

We get the whole source dataset at once in the form of items. 
This get triggered in `ui.redraw()`:

```javascript
await data.updateData();        //  make sure we have the current data
```
That method, `data.updateData()`, contains these lines:

```javascript
this.sourceDatasetInfo = await connect.getSourceDatasetInfo(testimate.state.dataset.name);
this.hasRandom = this.sourceDSHasRandomness();
this.isGrouped = this.sourceDSisHierarchical();

this.topCases = (this.isGrouped) ? await connect.retrieveTopLevelCases() : [];

await this.retrieveAllItemsFromCODAP();
```
`this.sourceDatasetInfo` comes from a get-dataContext call, and contains information
on the structure of the dataset, that is, collections and attributes---but no data.
We use that to find whether the dataset is hierarchical,
and (three lines later) to get the top-level cases.

`this.hasRandom` is `true` if any of the attributes has a formula with `"random"` in it.

`this.isGrouped` is true if there is more than one collection.

`this.topCases` is a case-based array of objects containing attributes and values 
of the top-level collection (empty if `isGrouped` is false).

Then, finally, we retrieve all the items, the actual data.
Here is the method, which is full of important side effects:

```javascript
    retrieveAllItemsFromCODAP: async function () {
        if (testimate.state.x) {
            this.dataset = await connect.getAllItems();      //  this.dataset is now set as array of objects (result.values)
            if (this.dataset) {
                this.xAttData = new AttData(testimate.state.x, this.dataset);
                this.yAttData = new AttData(testimate.state.y, this.dataset);
            }
        } else {
            console.log(`no x variable`);
        }
    },
```

If an `x` variable has been specified, we set `this.dataset` to that case-based array of items.
Each item has a `values` member, which is the key-value object with the data.
This has *all* of the attributes.

Then we create these two new objects, `this.xAttData` and `this.yAttData`,
which are attribute-based arrays extracted from `data.dataset`. 

**Key takeaway**: 
The method `data.retrieveAllItemsFromCODAP()` is a model for how to convert
an array of case-based objects into the attribute-based arrays
that you need to perform tests.

### Aside: the AttData class

The class `AttData` is defined in `data.js`, down at the bottom.
Its members are declared in the constructor like this:

```javascript
this.name = iAtt ? iAtt.name : null;
this.theRawArray = [];
this.theArray = [];     //  stays empty in constructor
this.valueSet = new Set();
this.missingCount = 0;
this.numericCount = 0;
this.nonNumericCount = 0;
this.defaultType = "";
```

You can see that an `AttData` has a bunch of useful stuff in it. 
The constructor goes on to process the information from `data.dataset`,
cleaning things up and making numbers out of numeric strings.
At the same time, it creates a `valueSet` that lets us see
the set of values, important for a categorical attribute
that we might use for grouping.
The constructor also counts up missing and numeric values,
and stuffs the clean values into `this.rawArray`. 

Later, we process `this.rawArray` into `this.theArray`, which is what gets used 
when calculating test results. 

### Making AttData.theArray

In the "update" method, `testimate.refreshDataAndTestResults()`,
we call `data.makeXandYArrays(data.allCODAPitems)`.
This is where `data.XattDataX` and `data.YattData` get created.
After some additional, processingwe call `data.removeInappropriateCases()`.
This method populates the `.theArray` members of the x and y `AttData`s.

This involves several nitty-gritty steps such as, 
if the test requires numeric attributes (e.g., difference of means),
it replaces any non-numeric values with `null`.

### Performing the tests

Every test has an `updateTestResults()` method (also called by `testimate.refreshDataAndTestResults()`).
Those methods use the `theArray` members to get the data. 

Here is a snippet from `regression.js`:

```javascript
for (let i = 0; i < N; i++) {
    //  Note how these definitions are REVERSED.
    //  we want to look at the var in the first position (xAttData) as the dependent variable (Y)
    const X = data.yAttData.theArray[i];
    const Y = data.xAttData.theArray[i];
```

Notice how we use the same indices to enforce the underlying case identities.

(Also, because this is linear regression, the attribute on the LEFT, 
which we call `xAttData`, 
is the one to be predicted, that is, `Y` in the regression.)

## Localization
We use `POEditor` to help with localization. 