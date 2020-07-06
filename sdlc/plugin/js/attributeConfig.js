// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
/**
 *
 * Configuration properties.
 */

  /*
   * The following declarations are specific to the data set.
   * Should consider moving to separate json.
   */
let attributeGroups = [
    {
      number: 1,
      open: false,
      title: 'Basic demographics',
      tooltip: 'Choose characteristics like age, sex, and marital status'
    },
    {
      number: 2,
      open: false,
      title: 'Race, ancestry, origins',
      tooltip: "Choose characteristics relating to person's place of birth and ethnicity"
    },
    {
      number: 3,
      open: false,
      title: 'Work & employment',
      tooltip: "Choose characteristics relating to person's work"
    },
    {
      number: 4,
      open: false,
      title: 'Income',
      tooltip: "Choose characteristics relating to person's income"
    },
    {
      number: 5,
      open: false,
      title: 'Geography',
      tooltip: "Choose characteristics relating to where the person resides"
    },
    {
      number: 6,
      open: false,
      title: 'Other',
      tooltip: "Choose other characteristics"
    }];

let attributeAssignment = [{
      ipumsName: 'AGE',
      title: 'Age',
      group: 1,
      defCheck: true,
      description: 'The individual\'s age in years as of the ' +
      'last birthday. Values range from 0 (less than 1 year old) to 90 ' +
      'and above.  See codebook for special codes.'
    },
    {
      title: 'Age_recode',
      group: 1,
      originalAttr: 'Age',
      format: 'categorical',
      defCheck: false,
      description: 'The individual’s age in years as of the ' +
      'last birthday. Recodes the Age variable into 8 age categories.',
      rangeMap: [
        {from: 0, to: 17, recodeTo: 0},
        {from: 18, to: 24, recodeTo: 1},
        {from: 25, to: 34, recodeTo: 2},
        {from: 35, to: 44, recodeTo: 3},
        {from: 45, to: 54, recodeTo: 4},
        {from: 55, to: 64, recodeTo: 5},
        {from: 65, to: 74, recodeTo: 6},
        {from: 75, to: 999, recodeTo: 7},
      ],
      categories: [
        'under 18',
        '18-24',
        '25-34',
        '35-44',
        '45-54',
        '55-64',
        '65-74',
        '75 and older'
      ]
    },
    {
      ipumsName: 'SEX',
      title: 'Sex',
      group: 1,
      defCheck: true,
      description: 'Each individual\'s biological sex as male or female.'
    },
    {
      ipumsName: 'MARST',
      title: 'Marital_status',
      group: 1,
      defCheck: false,
      description: 'Each individual’s current marital status, with ' +
      '6 possible categories.'
    },
    {
      ipumsName: 'NCHILD',
      title: 'Number_of_children',
      group: 1,
      defCheck: false,
      description: 'Counts the number of own children (of any age or ' +
      'marital status) residing with each individual. Values range from ' +
      '0 to a top code of 9+.'
    },
    {
      ipumsName: 'FAMSIZE',
      title: 'Family_size',
      group: 1,
      defCheck: false,
      description: 'The number of own family members residing ' +
      'with each individual, including the person her/himself.  Values ' +
      'range from 1 to as high as 26 or higher in some years.'
    },
    {
      ipumsName: 'EDUC',
      title: 'Education-years',
      hasCategoryMap: true,
      displayMe: false,
      group: 1,
      defCheck: false,
      description: 'The individual’s level of educational ' +
      'attainment based on the highest level or year of school completed.',
      categories: [
          "N/A or no schooling",
          "Nursery school to grade 4",
          "Grade 5, 6, 7, or 8",
          "Grade 9",
          "Grade 10",
          "Grade 11",
          "Grade 12",
          "1 year of college",
          "2 years of college",
          "3 years of college",
          "4 years of college",
          "5+ years of college",
      ]
    },
    {
      ipumsName: 'EDUCD',
      title: 'Education-degree_recode',
      group: 1,
      format: 'categorical',
      hasCategoryMap: true,
      defCheck: false,
      description: 'The individual’s level of educational ' +
      'attainment based on the highest degree completed, in years for which ' +
      'this information is available.',
      rangeMap: [
        {from: 0, to: 2, recodeTo: 0},
        {from: 3, to: 50, recodeTo: 1},
        {from: 51, to: 59, recodeTo: 11},
        {from: 60, to: 60, recodeTo: 2},
        {from: 61, to: 61, recodeTo: 1},
        {from: 62, to: 64, recodeTo: 3},
        {from: 65, to: 71, recodeTo: 4},
        {from: 72, to: 79, recodeTo: 11},
        {from: 80, to: 80, recodeTo: 5},
        {from: 81, to: 83, recodeTo: 7},
        {from: 84, to: 89, recodeTo: 11},
        {from: 90, to: 90, recodeTo: 5},
        {from: 91, to: 99, recodeTo: 11},
        {from: 100, to: 100, recodeTo: 5},
        {from: 101, to: 101, recodeTo: 8},
        {from: 102, to: 109, recodeTo: 11},
        {from: 110, to: 113, recodeTo: 6},
        {from: 114, to: 115, recodeTo: 9},
        {from: 116, to: 116, recodeTo: 10},
      ],
      categories: [
        'N/A or no schooling completed',
        'Some schooling, no high school diploma',
        'Completed Grade 12, diploma not identified',
        'High school diploma or GED',
        '1 or more years of college, no degree',
        '2-4 years of college, degree not identified',
        '5+ years of college, degree not identified',
        'Associate’s degree',
        'Bachelor’s degree',
        'Master’s or professional degree',
        'Doctoral degree',
        'unknown'
      ]
    },
    {
      ipumsName: 'RACE',
      title: 'Race-multi',
      displayMe: false,
      group: 2,
      defCheck: false,
      description: 'Each individual’s race according to 9 categories, ' +
      'including categories for mixed-race individuals. Caution needed when ' +
      'making comparisons over time.'
    },
    {
      ipumsName: 'RACESING',
      title: 'Race-single',
      group: 2,
      displayMe: false,
      defCheck: false,
      description: 'Assigns individuals to one of 5 race categories and ' +
      'assigns a single race to multiple-race people. Comparable over time, ' +
      'but not available after 2014.'
    },
    {
      originalAttr: ['Race-multi','Hispanic'],
      title: 'Race_ethnicity-multi_recode',
      group: 2,
      format: 'categorical',
      defCheck: false,
      description: 'Each respondent’s combined race and Hispanic ' +
      'ethnicity status, grouped into 7 primary categories. Caution needed ' +
      'when making comparisons over time.',
      // formula: "(Hispanic!='Not Hispanic')?" +
      //     "'Hispanic':(`Race-multi`='White')?'Non-Hispanic White':" +
      //     "(`Race-multi`='Black/African American/Negro')?'Non-Hispanic Black':" +
      //     "(`Race-multi`='Other Asian or Pacific Islander')?'Non-Hispanic Asian or Pacific Islander':" +
      //     "(`Race-multi`='Chinese')?'Non-Hispanic Asian or Pacific Islander':" +
      //     "(`Race-multi`='Japanese')?'Non-Hispanic Asian or Pacific Islander':" +
      //     "(`Race-multi`='American Indian or Alaska Native')?'Non-Hispanic American Indian/Alaska Native':" +
      //     "(`Race-multi`='Three or more major races')?'Non-Hispanic two or more major races':" +
      //     "(`Race-multi`='Two major races')?'Non-Hispanic two or more major races':" +
      //     "'Non-Hispanic Other race'",
      // formulaDependents: 'Hispanic,Race-multi',
      multirangeMap: [
        {range:{Hispanic:{from:1, to:4}}, recodeTo: 0},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 1, to: 1}}, recodeTo: 1},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 2, to: 2}}, recodeTo: 2},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 3, to: 3}}, recodeTo: 3},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 4, to: 6}}, recodeTo: 4},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 7, to: 7}}, recodeTo: 6},
        {range:{Hispanic:{from:0, to:0}, 'Race-multi':{from: 8, to: 9}}, recodeTo: 5}
      ],
      categories: [
/*0*/   'Hispanic',
/*1*/   'Non-Hispanic White',
/*2*/   'Non-Hispanic Black',
/*3*/   'Non-Hispanic American Indian/Alaska Native',
/*4*/   'Non-Hispanic Asian and/or Pacific Islander',
/*5*/   'Non-Hispanic two or more major races',
/*6*/   'Non-Hispanic Other race'
      ]
    },
    {
      originalAttr: ['Race-single', 'Hispanic'],
      title: 'Race_ethnicity-single_recode',
      group: 2,
      format: 'categorical',
      defCheck: false,
      description: 'Each respondent’s combined race and Hispanic ' +
      'ethnicity status, grouped into 6 primary categories. Comparable over ' +
      'time, but not available after 2014.',
      // formula: "(Hispanic!='Not Hispanic')?'Hispanic':" +
      //     "(`Race-single`='')?'Non-Hispanic':" +
      //     "(`Race-single`='White')?'Non-Hispanic White':" +
      //     "(`Race-single`='Black')?'Non-Hispanic Black':" +
      //     "(`Race-single`='American Indian/Alaska Native')?'Non-Hispanic American Indian/Alaska Native':" +
      //     "(`Race-single`='Asian and/or Pacific Islander')?'Non-Hispanic Asian or Pacific Islander':" +
      //     "(`Race-single`='Other race, non-Hispanic')?'Non-Hispanic Other race':" +
      //     "'Non-Hispanic Other'",
      // formulaDependents: 'Hispanic,Race-single',
      multirangeMap: [
        {range:{Hispanic:{from:1, to:4}}, recodeTo: 0},
        {range:{Hispanic:{from:0, to:0}, 'Race-single':{from: 1, to: 1}}, recodeTo: 1},
        {range:{Hispanic:{from:0, to:0}, 'Race-single':{from: 2, to: 2}}, recodeTo: 2},
        {range:{Hispanic:{from:0, to:0}, 'Race-single':{from: 3, to: 3}}, recodeTo: 3},
        {range:{Hispanic:{from:0, to:0}, 'Race-single':{from: 4, to: 4}}, recodeTo: 4},
        {range:{Hispanic:{from:0, to:0}, 'Race-single':{from: 5, to: 5}}, recodeTo: 5}
      ],
      categories: [
        'Hispanic',
        'Non-Hispanic White',
        'Non-Hispanic Black',
        'Non-Hispanic American Indian/Alaska Native',
        'Non-Hispanic Asian and/or Pacific Islander',
        'Non-Hispanic Other race'
      ]
    },

    {
      ipumsName: 'HISPAN',
      title: 'Hispanic',
      group: 2,
      defCheck: false,
      description: 'Identifies individuals of Hispanic, Spanish, or Latino ' +
      'origin and classifies them according to their country of origin. ' +
      'The U.S. Census considers Hispanic origin to be an ethnic rather than a ' +
      'racial classification; individuals of Hispanic origin can therefore ' +
      'be of any race.'
    },
    {
      title: 'Hispanic_recode',
      originalAttr: 'Hispanic',
      group: 2,
      defCheck: false,
      description: 'Identifies whether individuals are ' +
      'of Hispanic, Spanish, or Latino origin. Recodes the Hispanic variable ' +
      'into two codes.',
      format: 'categorical',
      rangeMap: [
        {from: 0, to: 0, recodeTo: 0},
        {from: 1, to: 4, recodeTo: 1}
      ],
      categories: [
          'Not of Hispanic, Spanish, or Latino origin',
          'Hispanic, Spanish, or Latino origin'
      ]
    },
    {
      title: 'Hispanic-detailed_recode',
      ipumsName: 'HISPAND',
      group: 2,
      defCheck: false,
      format: 'categorical',
      description: 'Identifies individuals of Hispanic, Spanish, or Latino ' +
      'origin and classifies them according to their country of origin. ' +
      'Recodes a detailed version of Hispanic into 15 categories.',
      rangeMap: [
        {from: 0, to: 99, recodeTo: 0},
        {from: 100, to: 107, recodeTo: 1},
        {from: 108, to: 199, recodeTo: 15},
        {from: 200, to: 200, recodeTo: 2},
        {from: 201, to: 299, recodeTo: 15},
        {from: 300, to: 300, recodeTo: 4},
        {from: 301, to: 399, recodeTo: 15},
        {from: 401, to: 411, recodeTo: 8},
        {from: 412, to: 412, recodeTo: 5},
        {from: 413, to: 413, recodeTo: 6},
        {from: 414, to: 415, recodeTo: 8},
        {from: 416, to: 416, recodeTo: 7},
        {from: 417, to: 417, recodeTo: 8},
        {from: 418, to: 419, recodeTo: 15},
        {from: 420, to: 422, recodeTo: 12},
        {from: 423, to: 423, recodeTo: 9},
        {from: 424, to: 424, recodeTo: 10},
        {from: 425, to: 425, recodeTo: 12},
        {from: 426, to: 426, recodeTo: 11},
        {from: 427, to: 431, recodeTo: 12},
        {from: 432, to: 449, recodeTo: 15},
        {from: 450, to: 459, recodeTo: 13},
        {from: 460, to: 460, recodeTo: 3},
        {from: 461, to: 464, recodeTo: 15},
        {from: 465, to: 499, recodeTo: 14},
        {from: 500, to: 999, recodeTo: 15}
      ],
      categories: [
        'Not of Hispanic, Spanish, or Latino origin',
        'Mexican',
        'Puerto Rican',
        'Dominican',
        'Cuban',
        'Guatemalan',
        'Honduran',
        'Salvadoran',
        'Other Central American (Costa Rican, Nicaraguan, Panamanian, and others)',
        'Columbian',
        'Equadoran',
        'Peruvian',
        'Other South American (Argentinean, Bolivian, Chilean, Paraguayan, ' +
            'Uruguayan, Venezuelan, and others)',
        'Spaniard',
        'Other Hispanic'
      ]
    },
    {
      ipumsName: 'CITIZEN',
      title: 'Citizen',
      group: 2,
      defCheck: false,
      description: 'Identifies the citizenship status of individuals, with ' +
      '6 categories.'
    },
    {
      originalAttr: 'Citizen',
      title: 'Citizen_recode',
      group: 2,
      defCheck: false,
      format: 'categorical',
      description: 'Individual is a U.S. citizen. Recodes the Citizen ' +
      'variable into two primary codes for almost all years available.',
      rangeMap: [
        {from: 0, to: 2, recodeTo: 1},
        {from: 3, to: 4, recodeTo: 0},
        {from: 5, to: 9, recodeTo: 2}
      ],
      categories: [
        'Not a U.S. citizen',
        'U.S. citizen',
        'Foreign born, citizenship status not reported'
      ]
    },
    {
      ipumsName: 'YRIMMIG',
      title: 'Immigrate-year',
      group: 2,
      defCheck: false,
      description: 'The year in which a foreign-born person entered the U.S.'
    },
    {
      ipumsName: 'BPL',
      title: 'Birthplace',
      group: 2,
      displayMe: false,
      defCheck: false,
      description: 'Where in the world the respondent was born. ' +
      'Includes up to 188 location categories. Consider working instead ' +
      'with a recoded and simplified version of this variable, called ' +
      'Birth region.'
    },
    {
      originalAttr: 'Birthplace',
      title: 'Birthplace_recode',
      group: 2,
      format: 'categorical',
      defCheck: false,
      description: 'Where in the world the person was born. Recodes ' +
      'the Birthplace variable into 9 categories.',
      rangeMap: [
        {from: 1,   to: 120, recodeTo: 0},
        {from: 150, to: 199, recodeTo: 1},
        {from: 200, to: 300, recodeTo: 2},
        {from: 400, to: 429, recodeTo: 3},
        {from: 430, to: 499, recodeTo: 4},
        {from: 500, to: 524, recodeTo: 5},
        {from: 530, to: 549, recodeTo: 6},
        {from: 550, to: 550, recodeTo: 5},
        {from: 599, to: 599, recodeTo: 5},
        {from: 600, to: 600, recodeTo: 7},
        {from: 700, to: 800, recodeTo: 1},
        {from: 900, to: 999, recodeTo: 8}
      ],
      categories: [
          'U.S. state, territory, or outlying region',
          'Canada, Australia, New Zealand, or Pacific Islands',
          'Mexico, Central America, South America, or the Caribbean',
          'Northern or Western Europe',
          'Southern Europe, Central/Eastern Europe, or Russia',
          'East, Southeast, or South Asia',
          'Middle East or Southwest Asia',
          'Africa',
          'Unknown'
      ]
    },
    {
      ipumsName: 'SPEAKENG',
      title: 'Speaks_English',
      group: 2,
      defCheck: false,
      description: 'Whether the individual speaks English, ' +
      'speaks only English at home, or how well the individual speaks ' +
      'English. There have been up to 8 codes over time.'
    },
    {
      ipumsName: 'EMPSTAT',
      title: 'Employment_status',
      group: 3,
      defCheck: false,
      description: 'Whether the individual was a part of the ' +
      'labor force, i.e., working or seeking work, and if yes, whether ' +
      'the person was currently unemployed.'
    },
    {
      ipumsName: 'LABFORCE',
      title: 'Labor_force_status',
      group: 3,
      defCheck: false,
      description: 'Whether a person participated in the labor force.'
    },
    {
      ipumsName: 'CLASSWKR',
      title: 'Class_of_worker',
      group: 3,
      defCheck: false,
      description: 'Class of worker indicates whether individuals were ' +
      'self-employed or worked for wages as an employee.'
    }, {
      ipumsName: 'UHRSWORK',
      title: 'Usual_hours_worked',
      group: 3,
      defCheck: false,
      description: 'The number of hours per week that the ' +
      'individual usually worked, if the person worked during the ' +
      'previous year. Values range from 0 (or N/A) to 99 (the top code).'
    },
    {
      ipumsName: 'WKSWORK2',
      title: 'Weeks_worked',
      group: 3,
      defCheck: false,
      description: 'The number of weeks that the individual ' +
      'worked the previous year, with six primary categories.'
    }, {
      ipumsName: 'WORKEDYR',
      title: 'Worked_last_year',
      group: 3,
      defCheck: false,
      description: 'Indicates whether the person worked during the previous year.'
    },
    {
      ipumsName: 'OCC1950',
      title: 'Occupation_1950_basis',
      displayMe: false,
      group: 3,
      defCheck: false,
      description: 'The person’s primary occupation, using ' +
      'the Census Bureau’s 1950 occupational classification system. ' +
      'There are several hundred occupation categories.'
    },
    {
      originalAttr: 'Occupation_1950_basis',
      title: 'Occupation_1950_basis_recode',
      group: 3,
      format: 'categorical',
      defCheck: false,
      description: 'The person’s primary occupation, using a ' +
      'simplified version of the Census Bureau’s 1950 occupational ' +
      'classification system. There are 8 primary categories.',
      rangeMap: [
        {from: 0, to: 99, recodeTo: 1},
        {from: 100, to: 100, recodeTo: 6},
        {from: 123, to: 123, recodeTo: 6},
        {from: 200, to: 290, recodeTo: 2},
        {from: 300, to: 490, recodeTo: 3},
        {from: 500, to: 594, recodeTo: 4},
        {from: 595, to: 595, recodeTo: 7},
        {from: 600, to: 690, recodeTo: 4},
        {from: 700, to: 790, recodeTo: 5},
        {from: 810, to: 970, recodeTo: 6},
        {from: 980, to: 995, recodeTo: 8},
        {from: 997, to: 997, recodeTo: 9},
        {from: 999, to: 999, recodeTo: 10}
      ],
      categories: [
        '',
        'Professional, technical',
        'Managers, officials, and proprietors',
        'Sales and clerical',
        'Craftsmen and operatives',
        'Service workers',
        'Farmers and laborers',
        'Members of the armed services',
        'Non-occupational response',
        'Occupation missing/unknown',
        'N/A (blank)'
      ]
    },
    {
      ipumsName: 'OCC1990',
      title: 'Occupation_1990_basis',
      group: 3,
      displayMe: false,
      defCheck: false,
      description: 'The person’s primary occupation, using a ' +
      'modified version of the 1990 Census Bureau occupational ' +
      'classification scheme, from 1950 forward. There are several hundred ' +
      'occupation categories. This attribute is not available for data ' +
      'collected prior to 1950.'
    },
    {
      originalAttr: 'Occupation_1990_basis',
      title: 'Occupation_1990_basis_recode',
      group: 3,
      format: 'categorical',
      defCheck: false,
      description: 'The person’s primary occupation, using a ' +
      'simplified version of the Census Bureau’s 1990 occupational ' +
      'classification system. There are 7 primary categories. This ' +
      'attribute is not available for data collected prior to 1950.',
      rangeMap: [
        {from: 3, to: 200, recodeTo: 1},
        {from: 203, to: 389, recodeTo: 2},
        {from: 405, to: 469, recodeTo: 3},
        {from: 473, to: 498, recodeTo: 4},
        {from: 503, to: 699, recodeTo: 5},
        {from: 703, to: 889, recodeTo: 6},
        {from: 905, to: 905, recodeTo: 7},
        {from: 991, to: 991, recodeTo: 8},
        {from: 999, to: 999, recodeTo: 9}
      ],
      categories: [
        '',
        'Managerial and professional   ',
        'Technical, sales, and administrative  ',
        'Service  ',
        'Farming, forestry, and fishing  ',
        'Precision production, craft, and repairers  ',
        'Operators and laborers  ',
        'Military occupations  ',
        'Unemployed',
        'N/A and unknown'
      ]
    },
    {
      ipumsName: 'IND1950',
      title: 'Industry_1950',
      group: 3,
      displayMe: false,
      defCheck: false,
      description: 'The industry of the individual, using the 1950 Census Bureau industrial classification system.'
    },
    {
      originalAttr: 'Industry_1950',
      title: 'Industry_1950_recode',
      group: 3,
      format: 'categorical',
      defCheck: false,
      description: 'The person’s primary occupation, using a simplified version of the Census Bureau’s 1950 industry classification system. There are 9 primary categories.',
      rangeMap: [
        {from: 100, to: 126, recodeTo: 1},
        {from: 206, to: 499, recodeTo: 2},
        {from: 506, to: 598, recodeTo: 3},
        {from: 606, to: 699, recodeTo: 4},
        {from: 716, to: 817, recodeTo: 5},
        {from: 826, to: 859, recodeTo: 6},
        {from: 868, to: 899, recodeTo: 7},
        {from: 906, to: 946, recodeTo: 8},
        {from: 976, to: 995, recodeTo: 9},
        {from: 0, to: 0, recodeTo: 10},
        {from: 997, to: 999, recodeTo: 10}
      ],
      categories: [
        '',
        'Agriculture, forestry, and fishing',
        'Construction, Mining, and Manufacturing',
          'Transportation, Communication, and Other Utilities',
          'Wholesale and Retail Trade',
          'Finance, Business, and Repair Services',
          'Entertainment, Recreation, and Personal Services',
          'Professional and Related Services',
          'Public Administration',
          'Other',
          'Non-classifiable, not reported, or blank, N/A, etc.'
      ]
    },
    {
      ipumsName: 'IND1990',
      title: 'Industry_1990',
      displayMe: false,
      group: 3,
      defCheck: false,
      description: 'The industry of the individual, using the 1990 Census Bureau industrial classification system. There are several hundred industry categories. This attribute is not available for data collected prior to 1950.'
    },
    {
      originalAttr: 'Industry_1990',
      title: 'Industry_1990_recode',
      group: 3,
      format: 'categorical',
      defCheck: false,
      description: 'The industry of the individual, using a simplified version of the 1990 Census Bureau industrial classification system, from 1950 forward. There are 9 primary categories.  This attribute is not available for data collected prior to 1950.',
      rangeMap: [
        {from: 10, to: 32, recodeTo: 1},
        {from: 40, to: 392, recodeTo: 2},
        {from: 400, to: 472, recodeTo: 3},
        {from: 500, to: 691, recodeTo: 4},
        {from: 700, to: 760, recodeTo: 5},
        {from: 761, to: 810, recodeTo: 6},
        {from: 812, to: 893, recodeTo: 7},
        {from: 900, to: 932, recodeTo: 8},
        {from: 940, to: 960, recodeTo: 9},
        {from: 992, to: 992, recodeTo: 10},
        {from: 999, to: 999, recodeTo: 10},
        {from: 0, to: 0, recodeTo: 11},
      ],
      categories: [
          '',
        'Agriculture, forestry, and fishing',
        'Construction, Mining, and Manufacturing',
        'Transportation, Communications, and Other Utilities',
        'Wholesale and Retail Trade',
        'Finance, Business, and Repair Services',
        'Entertainment, Recreation, and Personal Services',
        'Professional and Related Services',
        'Public Administration',
        'Military',
        'Unemployed not classified by industry, or did not respond',
        'Not applicable'
      ]
    },
    {
      ipumsName: 'VETSTAT',
      title: 'Veteran_status',
      group: 3,
      defCheck: false,
      description: 'Indicates whether individuals served in the military forces of the U.S. (Army, Navy, Air Force, Marine Corps, or Coast Guard) in time of war or peace. Service includes active duty for any length of time and at any place at home or abroad.'
    },
    {
      ipumsName: 'INCTOT',
      title: 'Income-total',
      group: 4,
      defCheck: false,
      description: 'Each respondent’s total pre-tax income. Total income is the sum of the amounts reported for multiple types of income.'
    },
    {
      ipumsName: 'INCWAGE',
      title: 'Income-wages',
      group: 4,
      defCheck: false,
      description: 'Each respondent’s pre-tax wage or salary income received for work performed as an employee. Amounts are expressed in contemporary dollars.'
    },
    {
      ipumsName: 'FTOTINC',
      title: 'Income-family_total',
      group: 4,
      defCheck: false,
      description: 'Total reports the sum of the pre-tax incomes of all respondents 15 years old and over related to Person 1 in the questionnaire. Amounts are expressed in contemporary dollars.'
    },
    // {
    //   ipumsName: 'INCEARN',
    //   title: 'Income-earnings',
    //   group: 4,
    //   defCheck: false,
    //   description: 'Income earned from wages or a person\'s own business or farm for the previous year. Amounts are expressed in contemporary dollars.'
    // },
    {
      ipumsName: 'CPI99',
      title: 'CPI99',
      group: 4,
      defCheck: false,
      description: 'The adjustment factor that converts contemporary dollars to constant 1999 dollars. It is a 5-digit numeric variable that has three implied decimals. For example, a CPI99 value of 15423 should be interpreted as 15.423.'
    },
    {
      ipumsName: 'INCWELFR',
      title: 'Income-welfare',
      group: 4,
      defCheck: false,
      description: 'How much pre-tax income (if any) the respondent received during the previous year from various public assistance programs commonly referred to as "welfare." Assistance from private charities is not included. Amounts are expressed in contemporary dollars.'
    },
    {
      ipumsName: 'POVERTY',
      title: 'Poverty',
      group: 4,
      defCheck: false,
      description: 'Each family\'s total income for the previous year as a percentage of the official U.S. poverty threshold, adjusted for inflation.'
    },
    {
      ipumsName: 'REGION',
      title: 'Region',
      group: 5,
      displayMe: false,
      defCheck: false,
      description: 'Identifies the U.S. Census region and division where the individual lives. There are four primary regions and nine primary divisions of the U.S., with additional categories for mixed divisions. Consider using Region_recode or Region-division_recode for less detailed versions of this variable.'
    },
    {
      originalAttr: 'Region',
      title: 'Region_recode',
      group: 5,
      format: 'categorical',
      defCheck: false,
      description: 'The U.S. Census region where the person lives, with 4 region categories.',
      rangeMap: [
        {from: 11, to: 13, recodeTo: 1},
        {from: 21, to: 23, recodeTo: 2},
        {from: 31, to: 34, recodeTo: 3},
        {from: 41, to: 43, recodeTo: 4},
        {from: 91, to: 99, recodeTo: 5}
      ],
      categories: [
        '',
        'Northeast',
        'Midwest',
        'South',
        'West',
        'Other/not identified',
      ]
    },
    {
      originalAttr: 'Region',
      title: 'Region-division_recode',
      group: 5,
      format: 'categorical',
      defCheck: false,
      description: 'The U.S. Census division where the person lives, with 9 division categories.',
      rangeMap: [
        {from: 11, to: 11, recodeTo: 1},
        {from: 12, to: 12, recodeTo: 2},
        {from: 13, to: 13, recodeTo: 10},
        {from: 21, to: 21, recodeTo: 3},
        {from: 22, to: 22, recodeTo: 4},
        {from: 23, to: 23, recodeTo: 10},
        {from: 31, to: 31, recodeTo: 5},
        {from: 32, to: 32, recodeTo: 6},
        {from: 33, to: 33, recodeTo: 7},
        {from: 34, to: 34, recodeTo: 10},
        {from: 41, to: 41, recodeTo: 8},
        {from: 42, to: 42, recodeTo: 9},
        {from: 43, to: 43, recodeTo: 10},
        {from: 91, to: 99, recodeTo: 11}
      ],
      categories: [
        '',
        'New England',
        'Middle Atlantic',
        'East North Central',
        'West North Central',
        'South Atlantic',
        'East South Central',
        'West South Central',
        'Mountain',
        'Pacific',
        'Mixed divisions ',
        'Other/not identified',
      ]
    },
    {
      ipumsName: 'STATEFIP',
      title: 'State',
      group: 5,
      defCheck: true,
      displayMe: true,
      readonly: true,
      description: 'The state in which the individual lives, using a federal coding scheme that lists states alphabetically. Note that you must select this attribute if you want to display state names in your case table or graphs.'
    },
    {
      ipumsName: 'STATEFIP',
      title: 'Boundaries',
      group: 5,
      defCheck: true,
      displayMe: true,
      readonly: true,
      description: 'State boundaries. Requires that the State attribute also be selected.',
      formula: 'lookupBoundary(US_state_boundaries, State)',
      formulaDependents: 'State'
    },
    {
      ipumsName: 'MIGRATE1',
      title: 'Moved',
      group: 5,
      defCheck: false,
      description: 'Whether the person had moved to a different house within the past year, with several categories.'
    },
    {
      ipumsName: 'YEAR',
      title: 'Year',
      group: 6,
      format: 'categorical',
      defCheck: true,
      displayMe: true,
      readonly: true,
      description: 'The four-digit year of the decennial census or ACS for each person\'s questionnaire responses. Note that you must select this attribute if you want to display year indicators in your case table or graphs.'
  }]

export {attributeGroups, attributeAssignment};
