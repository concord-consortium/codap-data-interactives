simmer.toolbox = {
    "kind": "categoryToolbox", "contents": [

        //      CODAP

        {
            "kind": "category", "name": "CODAP", "contents": [{
                "kind": "block", "type": "codap_emit"
            }]
        },

//      magical variables
        {
            "kind":"category",
            "name":"Variables",
            //  "categorystyle":"variable_category",
            "custom":"VARIABLE"
        },

        //      Math: numbers and values

        {
            "kind": "category", "name": "Math", "contents": [
                {
                    "kind": "block", "type": "math_number"
                },
                {
                    "kind": "block", "type": "math_number_fraction"
                },
                {
                    "kind": "block", "type": "math_arithmetic"
                },
                {
                    "kind": "block",
                    "type": "math_single",
                    "fields": {
                        "OP": "ROOT"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_trig",
                    "fields": {
                        "OP": "SIN"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_constant",
                    "fields": {
                        "CONSTANT": "PI"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_number_property",
                    "extraState": "<mutation divisor_input=\"false\"></mutation>",
                    "fields": {
                        "PROPERTY": "EVEN"
                    }
                },
                {
                    "kind": "block",
                    "type": "math_round",
                    "fields": {
                        "OP": "ROUND"
                    }
                },

            ]
        },

        //      random

        {
            "kind": "category", "name": "Random", "contents": [
                {
                    'kind': 'block',
                    'type': 'random_integer',
                    "inputs": {
                        "LOWER": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 1
                                }
                            }
                        },
                        "UPPER": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 6
                                }
                            }
                        }
                    }
                },
                {
                    "kind":"block",
                    "type":"random_float",
                    "inputs": {
                        "LOWER": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 0.0
                                }
                            }
                        },
                        "UPPER": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 1.0
                                }
                            }
                        }
                    }
                },
                {
                    'kind': 'block',
                    'type': 'random_pick'
                },
                {
                    'kind': 'block',
                    'type': 'random_take'
                },

                {
                    'kind': 'block',
                    'type': 'random_pick_from_two_advanced',
                    "inputs": {
                        "PROP": {
                            "shadow": {
                                //  "type": "math_number",
                                "type": "math_number_fraction",
                                "fields": {
                                    //  "NUM": 0.50
                                    "NUM": "1/2"
                                }
                            }
                        }
                    }
                },

/*
                {
                    "disabled" : true,
                    'kind': 'block',
                    'type': 'random_pick_from_two_advanced',
                    "inputs": {
                        "PROP": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "1/2"
                                }
                            }
                        }
                    }
                },
*/

                {
                    'kind': 'block',
                    'type': 'random_normal',
                    "inputs": {
                        "MU": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 0
                                }
                            }
                        },
                        "SIGMA": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 1.0
                                }
                            }
                        }
                    }
                },

                {
                    'kind': 'block',
                    'type': 'random_binomial',
                    "inputs": {
                        "SAMPLE_SIZE": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 10
                                }
                            }
                        },
                        "PROB": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 0.5
                                }
                            }
                        }
                    }
                }
            ]
        },

        //      Logic & Boolean

        {
            "kind": "category", "name": "Logic (Booleans)", "contents": [
                {
                    "kind": "block", "type": "logic_boolean"
                },
                {
                    "kind": "block", "type": "logic_compare"
                },
                {
                    "kind": "block", "type": "logic_operation",
                },
                {
                    "kind": "block",
                    "type": "logic_negate"
                },
                {
                    "kind": "block",
                    "type": "logic_ternary"
                },

            ]
        },

        //      loops & control (if)

        {
            "kind": "category", "name": "Control and Loops", "contents": [

                {
                    "kind": "block", "type": "controls_if"
                },


                {
                    "kind": "block",
                    "type": "controls_repeat_ext",
                    "inputs": {
                        "TIMES": {
                            "shadow": {
                                "type": "math_number",
                                "fields": {
                                    "NUM": 10
                                }

                            }
                        }
                    }
                },
                {
                    "kind": "block",
                    "type": "controls_whileUntil"
                }
            ]
        },


        //  functions

        {
            "kind": "category",
            "name": "Functions",
            "custom": "PROCEDURE"
        },

        /*
                {
                    "kind": "category", "name": "Functions", "contents": [
                        {
                            "kind": "block",
                            "type": "procedures_defnoreturn"
                        },
                        {
                            "kind": "block",
                            "type": "procedures_callnoreturn"
                        },

                    ]
                },
        */

        //  arrays and lists

        {
            "kind": "category", "name": "Arrays and lists", "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "message0": "empty list",
                    "extraState": {
                        "itemCount": 0 // or whatever the count is
                    }
                },

                {
                    "kind": "block",
                    "type": "lists_create_with",
                    "extraState": {
                        "itemCount": 2 // or whatever the count is
                    }
                },

                //  make a list from a string

                {
                    "kind": "block",
                    "type": "lists_split",
                    "fields": {
                        "MODE": "SPLIT"
                    },
                    "inputs": {

                        //  this way of specifying INPUT doesn't work!

                        "INPUT" : {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": "a,b,c,c"
                                }
                            }
                        },

                        //  this DELIM shadow does work!
                        "DELIM": {
                            "shadow": {
                                "type": "text",
                                "fields": {
                                    "TEXT": ","
                                }
                            }
                        }
                    }
                },

                {
                    'kind': 'block', 'type': 'lists_push',
                },
                {
                    'kind': 'block', 'type': 'lists_pop',
                },

                {
                    "kind":"block",
                    "type":"lists_length"
                },
                {
                    "kind":"block",
                    "type":"lists_isEmpty"
                },

                {
                    "kind":"block",
                    "type":"lists_getIndex",
                    "fields":{
                        "MODE":"GET",
                        "WHERE":"FROM_START"
                    }
                },


            ]
        },

        //      other

        {
            "kind": "category", "name": "Text", "contents": [
                {
                    "kind": "block", "type": "text"
                },

                {
                    "kind": "block", "type": "text_print"
                },

            ]
        },

    ]
}