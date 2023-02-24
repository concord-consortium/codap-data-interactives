/*  global Blockly      */

Blockly.common.defineBlocksWithJsonArray([

    //      CODAP emit

    {
        "type": "codap_emit",
        "message0": "send variables to CODAP",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "emits any variables you have defined into CODAP!",
        "helpUrl": ""
    },

    //  with input...
/*
    {
        "type": "codap_emit",
        "message0": "emit in CODAP: %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VARIABLES",
                "check": [
                    "Array",
                    "String"
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "plug in a list of variables to emit",
        "helpUrl": ""
    },
*/

    //      random integer

    {
        "type": "random_integer",
        "message0": "random integer in [%1, %2]",
        "args0": [
            {
                "type": "field_number",
                "name": "LOWER",
                "check" : "Number",
                "value" : 1,
                "precision" : 1,
            },
            {
                "type": "field_number",
                "name": "UPPER",
                "check" : "Number",
                "value" : 6,
                "precision" : 1,
            },

        ],
        "output" : "String",
        "tooltip" : "random integer between the two values, inclusive",
        "colour": 888
    },

    //      random Normal

    {
        "type": "random_normal",
        "message0": "random Normal µ = %1 σ = %2",
        "args0": [
            {
                "type": "field_number",
                "name": "MU",
                "check" : "Number",
                "value" : 0,
            },
            {
                "type": "field_number",
                "name": "SIGMA",
                "check" : "Number",
                "value" : 1,
            },

        ],
        "output" : "String",
        "tooltip" : "random value, normally distributed, mean = μ, SD = σ.",
        "colour": 888
    },

    //      pick from two

    {
        "type": "random_pick_from_two",
        "message0": "pick %1 or %2",
        "args0": [
            {
                "type": "field_input",
                "name": "ONE",
                "text" : "heads",
            },
            {
                "type": "field_input",
                "name": "TWO",
                "text" : "tails",
            },

        ],
        "output" : "String",
        "tooltip" : "gives you a 50-50 choice",
        "colour": 888
    },

    //      list push

    {
        "type": "lists_push",
        "message0": "push %1 onto %2",
        "args0": [
            {
                "type": "input_value",
                "name": "NEWITEM"
            },
            {
                "type": "input_value",
                "name": "ARRAY",
                "check": "Array"
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    },

    //      pick from two, not 50-50

    {
        "type": "random_pick_from_two_advanced",
        "message0": "P = %1 to pick %2, otherwise %3",
        "args0": [
            {
                "type": "field_input",
                "name": "PROP",
                "text": "1/2",
            },
            {
                "type": "field_input",
                "name": "ONE",
                "text" : "heads",
            },
            {
                "type": "field_input",
                "name": "TWO",
                "text" : "tails",
            },

        ],
        "output" : "String",
        "tooltip" : "Pick between 2 options; enter a probability as a fraction, decimal, or percentage.",
        "colour": 888
    },

    //      random pick

    {
        "type": "random_pick",
        "message0": "pick from %1",
        "args0": [
            {
                "type": "input_value",
                "name": "LIST",
                "check": "Array"
            }
        ],
        "output": null,
        "colour": 888,
        "tooltip": "plug in an array to pick from",
        "helpUrl": ""
    }
]);

Blockly.JavaScript['codap_emit'] = function(block) {

    const theVariables = Blockly.getMainWorkspace().getAllVariables();  //  gets variables AND VALUES

    //  initialize with the "count" attribute, `simmerRun`
    const simmerRunVar = {
        "name" : "simmerRun",
        "value" : simmer.state.simmerRun,
    };
    let code = `\n//  codap emit \n\nlet theValues = { "simmerRun" : ${simmer.state.simmerRun}}; // 'run' value \n`;
    code += "let oneVar = {}; let oneVal;\n";
    theVariables.forEach( v => {
        const vName = v.name;

        code += `if (typeof ${vName} !== 'undefined') `;
        try {
            //  const functionVersion = `Function("'use strict'; return (${vName})" )()`;
            //  code += ` { theValues["${vName}"] = ${functionVersion}  };\n`;
            code += ` { theValues["${vName}"] = eval("${vName}") };\n`;
        } catch (msg) {
            console.log(`${vName} threw an error...${msg}`);
        }
    })

    code += `simmer.connect.codap_emit(theValues);\n\n//  end codap emit\n\n`;

    return code;
};

Blockly.JavaScript['random_integer'] = function(block) {
    let lower = block.getFieldValue('LOWER');
    let upper = block.getFieldValue('UPPER');

    return [`random_functions.integer(${lower}, ${upper})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_normal'] = function(block) {
    let mu = block.getFieldValue('MU');
    let sigma = block.getFieldValue('SIGMA');

    return [`random_functions.randomNormal(${mu}, ${sigma})`, Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick_from_two'] = function(block) {
    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');
    const code = `Math.random() < 0.5 ? "${one}" : "${two}"`;
    return [code , Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick_from_two_advanced'] = function(block) {
    let prop = block.getFieldValue('PROP');
    let one = block.getFieldValue('ONE');
    let two = block.getFieldValue('TWO');


    const propNum = utilities.stringFractionDecimalOrPercentToNumber(prop);

    let code;
    if (propNum.theString) {
        code = `Math.random() < ${propNum.theNumber} ? "${one}" : "${two}"`;
    } else {
        code = `"bad input [${prop}]"`;
        console.log("Your entry [${prop}] doesn't look like a number.");
    }
    return [code , Blockly.JavaScript.ORDER_ADDITION];
};

Blockly.JavaScript['random_pick'] = function(block) {
    const value_list = Blockly.JavaScript.valueToCode(block, 'LIST', Blockly.JavaScript.ORDER_ATOMIC);
    const code = `random_functions.pickFrom(${value_list})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['text_print'] = function(block) {
    const msg = Blockly.JavaScript.valueToCode(
        block, 'TEXT',
        Blockly.JavaScript.ORDER_NONE) || "''";

    return `console.log(${msg});\n`;
};

Blockly.JavaScript['lists_push'] = function(block) {
    const value_newItem = Blockly.JavaScript.valueToCode(block, 'NEWITEM', Blockly.JavaScript.ORDER_ATOMIC);
    let value_array = Blockly.JavaScript.valueToCode(block, 'ARRAY', Blockly.JavaScript.ORDER_ATOMIC);

    var code = `${value_array}.push(${value_newItem});\n`;
    return code;
};


const utilities =  {
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


