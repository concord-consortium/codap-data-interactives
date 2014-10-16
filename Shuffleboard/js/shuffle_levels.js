ShuffleLevels = [
    {
      "levelName" : "Washington",
      "startingLevel" : true,
      "unlocked" : true,
      "firstPlateMin" : 90,
      "firstPlateMax" : 90,
      "plateWidthMin" : 60,
      "plateWidthMax" : 60,
      "plateOffset" : 70,
      "friction" : 5,
      "impulseFactorMin" : 49,
      "impulseFactorMax" : 49,
      "impulseVariability" : 0,
      "initialXMin" : 15,
      "initialXMax" : 15,
      "Description" : "A good place to start",
      "formula_intro" : "<p>In autoplay the first disk will be pushed by whatever the slider is set to.\n" +
                          "<p>For the rest of the disks, the push will be determined by a formula that you write.\n" +
                              "For example, the formula for <em>push</em> might be <em>padRight / 10</em>.</p>" +
                        "<p>For each disk <em>padRight</em> will equal the right edge of a different scoring pad.</p>" +
                        "<p>When you are ready to try out your strategy, press the <em>Autoplay</em> button" +
                        " in Shuffleboard.</p>",
      "formula_inputs" : [ 'padRight'],
      "formula_input_descriptions" : [ 'right edge of scoring pad'],
            "allow_user_variables" : false
    },
    {
      "levelName" : "Adams",
      "startingLevel" : false,
      "firstPlateMin" : 90,
      "firstPlateMax" : 90,
      "plateWidthMin" : 45,
      "plateWidthMax" : 45,
      "plateOffset" : 70,
      "friction" : 5,
      "impulseFactorMin" : 40,
      "impulseFactorMax" : 80,
      "impulseVariability" : 0,
      "initialXMin" : 15,
      "initialXMax" : 15,
      "Description" : "Not quite so easy. Be flexible.",
      "prerequisite" : {
        "level" : "Washington",
        "score" : 300,
        "excuse" : "Need 300 on Washington"
      },
      "formula_intro" : "<p>In autoplay the first disk will be pushed by whatever the slider is set to.\n" +
                              "That value will be <em>push1</em>. Where the first disk starts will be <em>start1</em>,\n" +
                              "and where it ended will be <em>end1</em>.</p>\n" +
                          "<p>For the rest of the disks, the push will be determined by a formula that you write.\n" +
                              "For example, the formula for <em>push</em> might be <em>padRight / 10</em>.</p>\n" +
                          "<p>You can also define variables that you can use in formulas. For example, you might\n" +
                              "find it useful to define <em>distance1</em> as <em>end1 – 15</em>.</p>" +
                          "<p>When you are ready to try out your strategy, press the <em>Autoplay</em> button" +
                          " in Shuffleboard.</p>",
      "formula_inputs" : [ 'end1', 'push1', 'padRight'],
      "formula_input_descriptions" : ['ending position of the first disk', 'push of the first disk',
                              'right edge of scoring pad'],
      "allow_user_variables" : true
    },
    {
      "levelName" : "Jefferson",
      "startingLevel" : false,
      "firstPlateMin" : 100,
      "firstPlateMax" : 120,
      "plateWidthMin" : 40,
      "plateWidthMax" : 60,
      "plateOffset" : 80,
      "friction" : 5,
      "impulseFactorMin" : 40,
      "impulseFactorMax" : 80,
      "impulseVariability" : 0,
      "initialXMin" : 10,
      "initialXMax" : 30,
      "Description" : "Watch the starting positions. You may need to calculate how far the disk travels.",
      "prerequisite" : {
        "level" : "Adams",
        "score" : 300,
        "excuse" : "Need 300 on Adams, 3 in a row",
        "inARow" : 3
      },
      "formula_intro" : "<p>In autoplay the first disk will be pushed by whatever the slider is set to.\n" +
                              "That value will be <em>push1</em>, where the first disk starts will be <em>start1</em>,\n" +
                              "and where it ended will be <em>end1</em>.</p>\n" +
                          "<p>For the rest of the disks, the push will be determined by a formula that you write.\n" +
                              "For example, the formula for <em>push</em> might be <em>padRight / 5</em>.</p>\n" +
                          "<p>You can also define variables that you can use in formulas. For example, you might\n" +
                              "find it useful to define <em>distance1</em> as <em>end1 – start1</em>.</p>" +
                          "<p>When you are ready to try out your strategy, press the <em>Autoplay</em> button" +
                          " in Shuffleboard.</p>",
      "formula_inputs" : [ 'curStart', 'start1', 'end1', 'push1', 'padRight'],
      "formula_input_descriptions" : ['current starting position', 'starting position of the first disk',
                              'ending position of the first disk', 'push of the first disk',
                              'right edge of scoring pad'],
      "allow_user_variables" : true
    },
    {
      "levelName" : "Polk",
      "startingLevel" : false,
      "firstPlateMin" : 90,
      "firstPlateMax" : 90,
      "plateWidthMin" : 60,
      "plateWidthMax" : 60,
      "plateOffset" : 70,
      "friction" : 5,
      "impulseFactorMin" : 49,
      "impulseFactorMax" : 49,
      "impulseVariability" : 5,
      "initialXMin" : 15,
      "initialXMax" : 15,
      "Description" : "Warning! Variability",
      "prerequisite" : {
        "level" : "Jefferson",
        "score" : 300,
        "excuse" : "Need 300 on Jefferson"
      },
      "formula_intro" : "<p>In autoplay the first disk will be pushed by whatever the slider is set to.\n" +
                              "That value will be <em>push1</em>, where the first disk starts will be <em>start1</em>,\n" +
                              "and where it ended will be <em>end1</em>.</p>\n" +
                          "<p>For the rest of the disks, the push will be determined by a formula that you write.\n" +
                              "For example, the formula for <em>push</em> might be <em>padRight / 5</em>.</p>\n" +
                          "<p>You can also define variables that you can use in formulas. For example, you might\n" +
                              "find it useful to define <em>distance1</em> as <em>end1 – start1</em>.</p>" +
                          "<p>When you are ready to try out your strategy, press the <em>Autoplay</em> button" +
                          " in Shuffleboard.</p>",
      "formula_inputs" : [ 'curStart', 'start1', 'end1', 'push1', 'padLeft', 'padRight'],
      "formula_input_descriptions" : ['current starting position', 'starting position of the first disk',
                              'ending position of the first disk', 'push of the first disk',
                              'left edge of scoring pad', 'right edge of scoring pad'],
      "allow_user_variables" : true
    },
    {
      "levelName" : "Roosevelt",
      "startingLevel" : false,
      "firstPlateMin" : 100,
      "firstPlateMax" : 120,
      "plateWidthMin" : 40,
      "plateWidthMax" : 60,
      "plateOffset" : 80,
      "friction" : 5,
      "impulseFactorMin" : 50,
      "impulseFactorMax" : 80,
      "impulseVariability" : 5,
      "initialXMin" : 10,
      "initialXMax" : 30,
      "Description" : "Kind of a mix of Polk and Jefferson.",
      "prerequisite" : {
        "level" : "Polk",
        "score" : 220,
        "excuse" : "Need 220 on Polk, 2 in a row",
        "inARow" : 2
      },
            "formula_intro" : "<p>In autoplay the first disk will be pushed by whatever the slider is set to.\n" +
                                    "That value will be <em>push1</em>, where the first disk starts will be <em>start1</em>,\n" +
                                    "and where it ended will be <em>end1</em>.</p>\n" +
                                "<p>For the rest of the disks, the push will be determined by a formula that you write.\n" +
                                    "For example, the formula for <em>push</em> might be <em>padRight / 5</em>.</p>\n" +
                                "<p>You can also define variables that you can use in formulas. For example, you might\n" +
                                    "find it useful to define <em>distance1</em> as <em>end1 – start1</em>.</p>" +
                                "<p>When you are ready to try out your strategy, press the <em>Autoplay</em> button" +
                                " in Shuffleboard.</p>",
            "formula_inputs" : [ 'curStart', 'start1', 'end1', 'push1', 'padLeft', 'padRight'],
            "formula_input_descriptions" : ['current starting position', 'starting position of the first disk',
                                    'ending position of the first disk', 'push of the first disk',
                                    'left edge of scoring pad', 'right edge of scoring pad'],
            "allow_user_variables" : true
    }
  ];