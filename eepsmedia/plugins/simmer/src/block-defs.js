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

    //      math fraction

    {
        'type': 'math_number_fraction',
        'message0': '%1 (fraction)',

        'args0': [
            {
                'type': 'field_input',     //      'field_number'
                'name': 'NUM',
                'text': "1/2",
            },
        ],
        'output': 'Number',
        'tooltip' : `enter a number, fraction, or percentage`,
        //  'helpUrl': '%{BKY_MATH_NUMBER_HELPURL}',
        'style': 'math_blocks',
        //  'tooltip': '%{BKY_MATH_NUMBER_TOOLTIP}',
        //  'extensions': ['parent_tooltip_when_inline'],
    },

    //      random integer

    {
        "type": "random_integer",
        "message0": "random integer in [%1, %2]",
        "args0": [
            {
                "type": "input_value",
                "name": "LOWER",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "UPPER",
                "check": "Number"
            },

        ],
        "output": "String",
        "tooltip": "random integer between the two values, inclusive",
        "colour": 888
    },

    //      random float

    {
        "type": "random_float",
        "message0": "random float in [%1, %2)",
        "args0": [
            {
                "type": "input_value",
                "name": "LOWER",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "UPPER",
                "check": "Number"
            },

        ],
        "output": "String",
        "tooltip": "random decimal number between the two values, including the lower but not the upper.",
        "colour": 888
    },


    //      random Normal

    {
        "type": "random_normal",
        "message0": "random Normal (µ, σ) = (%1, %2)",
        "args0": [
            {
                "type": "input_value",
                "name": "MU",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "SIGMA",
                "check": "Number"
            },

        ],
        "output": "String",
        "tooltip": "random value, normally distributed, mean = μ, SD = σ.",
        "colour": 888
    },

    //      random Binomial

    {
        "type": "random_binomial",
        "message0": "random Binomial (N, p) = (%1, %2)",
        "args0": [
            {
                "type": "input_value",
                "name": "SAMPLE_SIZE",
                "check": "Number"
            },
            {
                "type": "input_value",
                "name": "PROB",
                "check": "Number"
            },

        ],
        "output": "String",
        "tooltip": "random value, binomially distributed, sample size = N, probability = p.",
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
                "text": "heads",
            },
            {
                "type": "field_input",
                "name": "TWO",
                "text": "tails",
            },

        ],
        "output": "String",
        "tooltip": "gives you a 50-50 choice",
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
                "type": "input_value",
                "name": "PROP",
                "check": "Number",      //      "String"
            },

/*
            {
                "type": "field_input",
                "name": "PROP",
                "text": "1/2",
            },
*/
            {
                "type": "field_input",
                "name": "ONE",
                "text": "heads",
            },
            {
                "type": "field_input",
                "name": "TWO",
                "text": "tails",
            },

        ],
        "output": "String",
        "tooltip": "Pick between 2 options; enter a number, fraction, or percentage for the probability.",
        "colour": 888
    },

    //      random pick

    {
        "type": "random_pick",
        "message0": "pick from list %1",
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


