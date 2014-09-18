// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines ProximityLevels, an array of level specifications
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

ProximityLevels = [
  {
    "levelName" : "Doc",
    "startingLevel" : true,
    "unlocked" : true,
    "dpupRange" : 0,
    "dpupMin" : 10,
    "dpupVariability" : 0,
    "roughActive" : false,
    "Description" : "A good place to start",
  },
  {
    "levelName" : "Sneezy",
    "dpupRange" : 6,
    "dpupMin" : 3,
    "dpupVariability" : 0,
    "roughActive" : false,
    "Description" : "A little more subtle",
    "prerequisite" : {
      "level" : "Doc",
      "score" : 500,
      "excuse" : "Need 500 on Doc"
    }
  },
  {
    "levelName" : "Dopey",
    "dpupRange" : 9,
    "dpupMin" : 3,
    "dpupVariability" : 20,
    "roughActive" : false,
    "Description" : "Even more subtle",
    "prerequisite" : {
      "level" : "Sneezy",
      "score" : 425,
      "excuse" : "Need 425 on Sneezy, two in a row",
      "inARow" : 2
    }
  },
  {
    "levelName" : "Bashful",
    "dpupRange" : 0,
    "dpupMin" : 8,
    "dpupVariability" : 0,
    "roughActive" : true,
    "Description" : "A rough! What does it do?",
    "prerequisite" : {
      "level" : "Dopey",
      "score" : 400,
      "excuse" : "Need 400 on Dopey, two in a row",
      "inARow" : 2
    }
  },
  {
    "levelName" : "Happy",
    "dpupRange" : 4,
    "dpupMin" : 5,
    "dpupVariability" : 0,
    "roughActive" : true,
    "Description" : "Mmmmm, rough! And additional complexity.",
    "prerequisite" : {
      "level" : "Bashful",
      "score" : 400,
      "excuse" : "Need 400 on Bashful"
    }
  },
  {
    "levelName" : "Grumpy",
    "dpupRange" : 8,
    "dpupMin" : 3,
    "dpupVariability" : 20,
    "roughActive" : true,
    "Description" : "Mmmmm, more rough!",
    "prerequisite" : {
      "level" : "Happy",
      "score" : 400,
      "excuse" : "Need 400 on Happy"
    }
  }
];