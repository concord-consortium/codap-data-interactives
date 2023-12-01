/*  global Blockly, Blockly.JavaScript, javascript, javascript.javascriptGenerator.forBlock     */

const generator = javascript.javascriptGenerator;
const order = javascript.Order;

generator.forBlock['codap_emit'] = function (block, generator) {

    const theVariables = Blockly.getMainWorkspace().getAllVariables();  //  gets variables AND VALUES

    //  initialize with the "count" attribute, `simmerRun`
    const simmerRunVar = {
        "name": "simmerRun",
        "value": simmer.state.simmerRun,
    };
    let code = `\n//  codap emit \n\n`;

    code += `theValues = { "simmerRun" : ${simmer.state.simmerRun}}; // 'run' value \n`;
    //  code += "let oneVar = {}; let oneVal;\n";
    theVariables.forEach(v => {
        const vName = v.name;

        code += `if (typeof ${vName} !== 'undefined') {\n`

        //  if it's of type object, JSON.stringify it....
        code += `    if (typeof ${vName} === 'object') {\n`;
        code += `        theValues["${vName}"] = JSON.stringify(${vName});\n`;

        //  otherwise, eval it.
        code += `    } else {\n`;
        code += `        theValues["${vName}"] = eval("${vName}");\n`;
        code += `    }\n`;

        code += `}  //  close undefined \n`;      //      close if it's not undefined.
    })


    code += `simmer.connect.codap_emit(theValues);\n\n//  end codap emit\n\n`;

    return code;
};

javascript.javascriptGenerator.forBlock['math_number_fraction'] = function (block, generator) {

    function findNumberEvenIfPercentage(inString) {
        let isPercentage = false;
        if (inString.includes("%")) {
            isPercentage = true;
            inString = inString.replaceAll("%", "");
        }

        let theNumber = Number(inString);
        if (isPercentage) theNumber /= 100;
        return theNumber;
    }

    const inString = String(block.getFieldValue('NUM')).trim();
    inString.replaceAll(" ", "");    //  strip all interior spaces

    let numerator;
    let denominator = "1";
    let err = "";

    const fracArray = inString.split('/');

    switch (fracArray.length) {
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
        const theQuotient = numNum / numDenom;
        const code = `${theQuotient}`;
        const oorder = theQuotient >= 0 ? order.ATOMIC : order.UNARY_NEGATION;
        return [code, oorder];
    } catch (msg) {
        console.log(`simmer: number parse error ${err} (${msg})`);
        return ["NaN", order.ATOMIC];
    }
};

javascript.javascriptGenerator.forBlock['random_integer'] = function (block, generator) {
    // when it was fields, was:   let lower = block.getFieldValue('LOWER');
    let lower = Blockly.JavaScript.valueToCode(block, 'LOWER',
        order.ADDITION) || 1;
    let upper = Blockly.JavaScript.valueToCode(block, 'UPPER',
        order.ADDITION) || 6;

    return [`random_functions.integer(${lower}, ${upper})`, order.ADDITION];
};

javascript.javascriptGenerator.forBlock['random_float'] = function (block, generator) {
    // when it was fields, was:   let lower = block.getFieldValue('LOWER');
    let lower = Blockly.JavaScript.valueToCode(block, 'LOWER',
        order.ADDITION) || 1;
    let upper = Blockly.JavaScript.valueToCode(block, 'UPPER',
        order.ADDITION) || 6;

    return [`random_functions.float(${lower}, ${upper})`, order.ADDITION];
};

javascript.javascriptGenerator.forBlock['random_normal'] = function (block, generator) {
    let mu = Blockly.JavaScript.valueToCode(block, 'MU',
        order.ADDITION) || 0;
    let sigma = Blockly.JavaScript.valueToCode(block, 'SIGMA',
        order.ADDITION) || 1;
    /*
        let mu = block.getFieldValue('MU');
        let sigma = block.getFieldValue('SIGMA');
    */

    return [`random_functions.randomNormal(${mu}, ${sigma})`, order.ADDITION];
};

generator.forBlock['random_binomial'] = function (block, generator) {
    let N = Blockly.JavaScript.valueToCode(block, 'SAMPLE_SIZE',
        order.ADDITION) || 0;
    let p = Blockly.JavaScript.valueToCode(block, 'PROB',
        order.ADDITION) || 1;

    return [`random_functions.randomBinomial(${N}, ${p})`, order.ADDITION];
};

javascript.javascriptGenerator.forBlock['random_pick_from_two'] = function (block, generator) {
    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');
    const code = `Math.random() < 0.5 ? "${one}" : "${two}"`;
    return [code, order.ADDITION];
};

javascript.javascriptGenerator.forBlock['random_pick_from_two_advanced'] = function (block, generator) {

    let prop = Blockly.JavaScript.valueToCode(block, 'PROP', order.ATOMIC);

    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');
    let propNum = {};
    let code;

    code = `Math.random() < ${prop} ? "${one}" : "${two}"`;

    return [code, order.ADDITION];
};

javascript.javascriptGenerator.forBlock['random_pick'] = function (block, generator) {
    const value_list = Blockly.JavaScript.valueToCode(block, 'LIST', order.ATOMIC);
    const code = `random_functions.pickFrom(${value_list})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, order.NONE];
};

javascript.javascriptGenerator.forBlock['text_print'] = function (block, generator) {
    const msg = Blockly.JavaScript.valueToCode(
        block, 'TEXT',
        order.NONE) || "''";

    return `console.log(${msg});\n`;
};

javascript.javascriptGenerator.forBlock['lists_push'] = function (block, generator) {
    const value_newItem = Blockly.JavaScript.valueToCode(block, 'NEWITEM', order.ATOMIC);
    let value_array = Blockly.JavaScript.valueToCode(block, 'ARRAY', order.ATOMIC);

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
