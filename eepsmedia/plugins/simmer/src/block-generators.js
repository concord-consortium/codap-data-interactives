
/*  global Blockly, Blockly.JavaScript      */



Blockly.JavaScript['codap_emit'] = function (block) {

    const theVariables = Blockly.getMainWorkspace().getAllVariables();  //  gets variables AND VALUES

    //  initialize with the "count" attribute, `simmerRun`
    const simmerRunVar = {
        "name": "simmerRun",
        "value": simmer.state.simmerRun,
    };
    let code = `\n//  codap emit \n\nlet theValues = { "simmerRun" : ${simmer.state.simmerRun}}; // 'run' value \n`;
    //  code += "let oneVar = {}; let oneVal;\n";
    theVariables.forEach(v => {
        const vName = v.name;

        code += `if ((typeof ${vName} !== 'undefined')  &&  (typeof ${vName} !== 'object'))`;
        try {
            const thisValueCode = `(eval("${vName}"))`;
            const thisJSONCode = `JSON.stringify(${vName})`;

            code += "{\n";
            code += `  theValues["${vName}"] = ${thisValueCode};\n`;
            //  code += `  const theJSON = ${thisJSONCode};\n`;
            //  code += `  theValues["${vName}"] = ${thisJSONCode};\n`;
            code += "}\n";
        } catch (msg) {
            console.log(`${vName} threw an error...${msg}`);
        }
    })

    code += `simmer.connect.codap_emit(theValues);\n\n//  end codap emit\n\n`;

    return code;
};

Blockly.JavaScript['math_number_fraction'] = function(block) {

    function findNumberEvenIfPercentage(inString) {
        let isPercentage = false;
        if (inString.includes("%")) {
            isPercentage = true;
            inString = inString.replaceAll("%","");
        }

        let theNumber = Number(inString);
        if (isPercentage) theNumber /= 100;
        return theNumber;
    }

    const inString = String(block.getFieldValue('NUM')).trim();
    inString.replaceAll(" ","");    //  strip all interior spaces

    let numerator;
    let denominator = "1";
    let err = "";

    const fracArray = inString.split('/');

    switch(fracArray.length) {
        case 0:
            numerator = "NaN";
            denominator = "NaN";
        case 1:
            numerator = fracArray[0];
            break;
        case 2:
            numerator = fracArray[0];
            denominator = fracArray[1];
            break;
        default:
            err = "more than one slash";
            break;
    }

    try {
        const numNum = findNumberEvenIfPercentage(numerator);
        const numDenom = findNumberEvenIfPercentage(denominator);
        const code = `${numNum / numDenom}`;
        const order = code >= 0 ? Blockly.JavaScript.ORDER_ATOMIC : Blockly.JavaScript.ORDER_UNARY_NEGATION;
        return [code, order];
    } catch (msg) {
        console.log(`simmer: number parse error ${err} (${msg})`);
        return ["NaN",Blockly.JavaScript.ORDER_ATOMIC];
    }
};

Blockly.JavaScript['random_integer'] = function (block) {
    // when it was fields, was:   let lower = block.getFieldValue('LOWER');
    let lower = Blockly.JavaScript.valueToCode(block, 'LOWER',
        Blockly.JavaScript.ORDER_ADDITION) || 1;
    let upper = Blockly.JavaScript.valueToCode(block, 'UPPER',
        Blockly.JavaScript.ORDER_ADDITION) || 6;

    return [`random_functions.integer(${lower}, ${upper})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_float'] = function (block) {
    // when it was fields, was:   let lower = block.getFieldValue('LOWER');
    let lower = Blockly.JavaScript.valueToCode(block, 'LOWER',
        Blockly.JavaScript.ORDER_ADDITION) || 1;
    let upper = Blockly.JavaScript.valueToCode(block, 'UPPER',
        Blockly.JavaScript.ORDER_ADDITION) || 6;

    return [`random_functions.float(${lower}, ${upper})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_normal'] = function (block) {
    let mu = Blockly.JavaScript.valueToCode(block, 'MU',
        Blockly.JavaScript.ORDER_ADDITION) || 0;
    let sigma = Blockly.JavaScript.valueToCode(block, 'SIGMA',
        Blockly.JavaScript.ORDER_ADDITION) || 1;
    /*
        let mu = block.getFieldValue('MU');
        let sigma = block.getFieldValue('SIGMA');
    */

    return [`random_functions.randomNormal(${mu}, ${sigma})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_binomial'] = function (block) {
    let N = Blockly.JavaScript.valueToCode(block, 'SAMPLE_SIZE',
        Blockly.JavaScript.ORDER_ADDITION) || 0;
    let p = Blockly.JavaScript.valueToCode(block, 'PROB',
        Blockly.JavaScript.ORDER_ADDITION) || 1;

    return [`random_functions.randomBinomial(${N}, ${p})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick_from_two'] = function (block) {
    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');
    const code = `Math.random() < 0.5 ? "${one}" : "${two}"`;
    return [code, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick_from_two_advanced'] = function (block) {

    /*
        let prop = Blockly.JavaScript.valueToCode(block, 'PROP',
            Blockly.JavaScript.ORDER_ATOMIC) || "0.5";
        //  this yields something like prop = "'1/2'", which is bad. No idea how that started happening!

        prop = prop.replaceAll("'", "");  //  strip single quotes
        prop = prop.replaceAll('"', '');  //  strip double quotes
    */

    let prop = Blockly.JavaScript.valueToCode(block, 'PROP',  Blockly.JavaScript.ORDER_ATOMIC);

    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');
    let propNum = {};
    let code;

    code = `Math.random() < ${prop} ? "${one}" : "${two}"`;

    /*
        if (typeof prop === 'string') {
            propNum = utilities.stringFractionDecimalOrPercentToNumber(prop);
            if (propNum.theString) {
                code = `Math.random() < ${propNum.theNumber} ? "${one}" : "${two}"`;
            } else {
                code = `"bad input string [${prop}]"`;
            }
        } else if (typeof prop === 'number') {
            code = `Math.random() < ${prop} ? "${one}" : "${two}"`;
        } else {
            code = `"bad input ${typeof prop} [${prop}]"`;
        }
    */

    return [code, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick'] = function (block) {
    const value_list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_ATOMIC);
    const code = `random_functions.pickFrom(${value_list})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['text_print'] = function (block) {
    const msg = Blockly.JavaScript.valueToCode(
        block, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || "''";

    return `console.log(${msg});\n`;
};

Blockly.JavaScript['lists_push'] = function (block) {
    const value_newItem = Blockly.JavaScript.valueToCode(block, 'NEWITEM', Blockly.JavaScript.ORDER_ATOMIC);
    let value_array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_ATOMIC);

    const code = `${value_array}.push(${value_newItem});\n`;
    return code;
};


const utilities = {
    stringFractionDecimalOrPercentToNumber: function (iString) {
        let theNumber;
        let theString;

        const wherePercent = iString.indexOf("%");
        const whereSlash = iString.indexOf("/");
        if (wherePercent !== -1) {
            const thePercentage = parseFloat(iString.substring(0, wherePercent));
            theString = `${thePercentage}%`;
            theNumber = thePercentage / 100.0;
        } else if (whereSlash !== -1) {
            const beforeSlash = iString.substring(0, whereSlash);
            const afterSlash = iString.substring(whereSlash + 1);
            const theNumerator = parseFloat(beforeSlash);
            const theDenominator = parseFloat(afterSlash);
            theNumber = theNumerator / theDenominator;
            theString = `${theNumerator}/${theDenominator}`;
        } else {
            theNumber = parseFloat(iString);
            theString = `${theNumber}`;
        }

        if (!isNaN(theNumber)) {
            return {theNumber: theNumber, theString: theString};
        } else {
            return {theNumber: 0, theString: ""};
        }
    },
};
