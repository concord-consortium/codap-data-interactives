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
app.config = {
  /*
   * The following declarations are specific to the data set.
   * Should consider moving to separate json.
   */
  attributeGroups: [{
      number: 1,
      open: false,
      title: "Basic demographics"
    },
    {
      number: 2,
      open: false,
      title: "Race, ancestry, origins"
    },
    {
      number: 3,
      open: false,
      title: "Work & employment"
    },
    {
      number: 4,
      open: false,
      title: "Income"
    },
    {
      number: 5,
      open: false,
      title: "Geography"
    },
    {
      number: 6,
      open: false,
      title: "Technical"
    }],

  attributeAssignment: [{
      ipumsName: 'AGE',
      title: 'Age',
      group: 1,
      defCheck: true,
      description: 'reports the Individual\'s age in years as of the last birthday. Values range from 0 (less than 1 year old) to 90 and above.  See codebook for special codes.'
    },
    {
      title: 'Age-group',
      group: 1,
      ipumsName: 'AGE',
      format: 'categorical',
      defCheck: false,
      description: 'reports the individual’s age in years as of the last birthday. Recodes the AGE variable into 8 age categories.',
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
      description: 'reports each individual\'s biological sex as male or female.'
    },
    {
      ipumsName: 'MARST',
      title: 'Marital_status',
      group: 1,
      defCheck: false,
      description: 'reports each individual’s current marital status, with 6 possible categories.'
    },
    {
      ipumsName: 'NCHILD',
      title: 'Number_of_children',
      group: 1,
      defCheck: false,
      description: 'counts the number of own children (of any age or marital status) residing with each individual. Values range from 0 to a top code of 9+.'
    },
    {
      ipumsName: 'FAMSIZE',
      title: 'Family_size',
      group: 1,
      defCheck: false,
      description: 'reports the number of own family members residing with each individual, including the person her/himself.  Values range from 1 to as high as 26 or higher in some years.'
    },
    {
      ipumsName: 'EDUC',
      title: 'Education-years',
      group: 1,
      defCheck: false,
      description: 'reports the individual’s level of educational attainment based on the highest level or year of school completed.'
    },
    {
      ipumsName: 'EDUCD',
      title: 'Education-degree_recode',
      group: 1,
      format: 'categorical',
      defCheck: false,
      description: 'reports on the individual’s level of educational attainment based on the highest degree completed, in years for which this information is available.',
      rangeMap: [
        {from: 0, to: 1, recodeTo: 0},
        {from: 2, to: 50, recodeTo: 1},
        {from: 51, to: 59, recodeTo: 11},
        {from: 60, to: 60, recodeTo: 2},
        {from: 61, to: 61, recodeTo: 1},
        {from: 62, to: 64, recodeTo: 3},
        {from: 65, to: 70, recodeTo: 4},
        {from: 71, to: 79, recodeTo: 11},
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
      group: 2,
      defCheck: false,
      description: 'reports each individual’s race according to 9 categories, including categories for mixed-race individuals. Caution needed when making comparisons over time.'
    },
    {
      ipumsName: 'RACESING',
      title: 'Race-single',
      group: 2,
      defCheck: false,
      description: 'assigns individuals to one of 5 race categories and assigns a single race to multiple-race people. Comparable over time, but not available after 2014.'
    },
    // {
    //   ipumsName: tbd,
    //   title: 'Race/ethnicity-multi: recode',
    //   group: 2,
    //   format: 'categorical',
    //   defCheck: false,
    //   description: 'reports each respondent’s combined race and Hispanic ethnicity status, grouped into 7 primary categories. Caution needed when making comparisons over time.',
    //   rangeMap: [
    //     {tbd}
    //   ]
    // },
    // {
    //   title: 'Race/ethnicity-single: recode',
    //   ipumsName: tbd
    // },

    {
      ipumsName: 'HISPAN',
      title: 'Hispanic',
      group: 2,
      defCheck: false,
      description: 'identifies individuals of Hispanic, Spanish, or Latino origin and classifies them according to their country of origin. The U.S. Census considers Hispanic origin to be an ethnic rather than a racial classification; individuals of Hispanic origin can therefore be of any race'
    },
    {
      title: 'Hispanic-dummy_recode',
      ipumsName: 'HISPAN',
      group: 2,
      defCheck: false,
      description: 'Hispanic-dummy: recode identifies whether individuals are of Hispanic, Spanish, or Latino origin. Recodes the Hispanic variable into two codes.',
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
        'Other South American (Argentinean, Bolivian, Chilean, Paraguayan, Uruguayan, Venezuelan, and others)',
        'Spaniard',
        'Other Hispanic'
      ]
    },
    {
      ipumsName: 'CITIZEN',
      title: 'Citizen',
      group: 2,
      defCheck: false,
      description: 'identifies the citizenship status of individuals, with 6 categories.'
    },
    {
      ipumsName: 'CITIZEN',
      title: 'Citizen-dummy_recode',
      group: 2,
      defCheck: false,
      format: 'categorical',
      description: 'individual is a U.S. citizen. Recodes the Citizen variable into two primary codes for almost all years available.',
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
      description: 'reports the year in which a foreign-born person entered the U.S'
    },
    {
      ipumsName: 'BPL',
      title: 'Birthplace',
      group: 2,
      defCheck: false,
      description: 'reports where in the world the respondent was born. Includes up to 188 location categories. Consider working instead with a recoded and simplified version of this variable, called Birth region'
    },
    {
      ipumsName: 'BPL',
      title: 'Birthplace_recode',
      group: 2,
      format: 'categorical',
      defCheck: false,
      description: 'reports where in the world the person was born. Recodes the Birthplace variable into 9 categories',
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
      description: 'indicates whether the individual speaks English, speaks only English at home, or how well the individual speaks English. There have been up to 8 codes over time.'
    },
    {
      ipumsName: 'EMPSTAT',
      title: 'Employment_status',
      group: 3,
      defCheck: false,
      description: 'reports whether the individual was a part of the labor force, i.e., working or seeking work, and if yes, whether the person was currently unemployed.'
    },
    {
      ipumsName: 'LABFORCE',
      title: 'Labor_force_status',
      group: 3,
      defCheck: false,
      description: 'indicates whether a person participated in the labor force.'
    },
    {
      ipumsName: 'CLASSWKR',
      title: 'Class_of_worker',
      group: 3,
      defCheck: false,
      description: 'Class of worker indicates whether individuals were self-employed or worked for wages as an employee'
    }, {
      ipumsName: 'UHRSWORK',
      title: 'Usual_hours_worked',
      group: 3,
      defCheck: false,
      description: 'reports the number of hours per week that the individual usually worked, if the person worked during the previous year. Values range from 0 (or N/A) to 99 (the top code).'
    },
    {
      ipumsName: 'WKSWORK2',
      title: 'Weeks_worked',
      group: 3,
      defCheck: false,
      description: 'reports the number of weeks that the individual worked the previous year, with six primary categories.'
    }, {
      ipumsName: 'WORKEDYR',
      title: 'Worked_last_year',
      group: 3,
      defCheck: false,
      description: 'indicates whether the person worked during the previous year.'
    },
    {
      ipumsName: 'OCC1950',
      title: 'Occupation_1950_basis',
      group: 3,
      defCheck: false,
      description: 'reports the person’s primary occupation, using the Census Bureau’s 1950 occupational classification system. There are several hundred occupation categories.'
    },
    {
      ipumsName: 'OCC1990',
      title: 'Occupation_1990_basis',
      group: 3,
      defCheck: false,
      description: 'reports the person’s primary occupation, using a modified version of the 1990 Census Bureau occupational classification scheme, from 1950 forward. There are several hundred occupation categories.'
    },
    {
      ipumsName: 'IND1950',
      title: 'Industry_1950',
      group: 3,
      defCheck: false,
      description: 'reports the industry of the individual, using the 1950 Census Bureau industrial classification system.'
    },
    {
      ipumsName: 'IND1990',
      title: 'Industry_1990',
      group: 3,
      defCheck: false,
      description: 'reports the industry of the individual, using the 1990 Census Bureau industrial classification system, from 1950 forward. There are several hundred industry categories.'
    },
    {
      ipumsName: 'VETSTAT',
      title: 'Veteran_status',
      group: 3,
      defCheck: false,
      description: 'indicates whether individuals served in the military forces of the U.S. (Army, Navy, Air Force, Marine Corps, or Coast Guard) in time of war or peace. Service includes active duty for any length of time and at any place at home or abroad.'
    },
    {
      ipumsName: 'INCTOT',
      title: 'Income-total',
      group: 4,
      defCheck: false,
      description: 'reports each respondent’s total pre-tax income. Total income is the sum of the amounts reported for multiple types of income.  '
    },
    {
      ipumsName: 'INCWAGE',
      title: 'Income-wages',
      group: 4,
      defCheck: false,
      description: 'reports each respondent’s pre-tax wage or salary income received for work performed as an employee. Amounts are expressed in contemporary dollars.  '
    },
    {
      ipumsName: 'FTOTINC',
      title: 'Income_family',
      group: 4,
      defCheck: false,
      description: 'total reports the sum of the pre-tax incomes of all respondents 15 years old and over related to Person 1 in the questionnaire. Amounts are expressed in contemporary dollars.  '
    },
    {
      ipumsName: 'INCEARN',
      title: 'Income-earnings',
      group: 4,
      defCheck: false,
      description: 'reports income earned from wages or a person\'s own business or farm for the previous year. Amounts are expressed in contemporary dollars. '
    },
    {
      ipumsName: 'CPI99',
      title: 'CPI99',
      group: 4,
      defCheck: false,
      description: 'provides the adjustment factor that converts contemporary dollars to constant 1999 dollars. It is a 5-digit numeric variable that has three implied decimals. For example, a CPI99 value of 15423 should be interpreted as 15.423. '
    },
    {
      ipumsName: 'INCWELFR',
      title: 'Income-welfare',
      group: 4,
      defCheck: false,
      description: 'reports how much pre-tax income (if any) the respondent received during the previous year from various public assistance programs commonly referred to as "welfare." Assistance from private charities is not included. Amounts are expressed in contemporary dollars. '
    },
    {
      ipumsName: 'POVERTY',
      title: 'Poverty',
      group: 4,
      defCheck: false,
      description: 'reports each family\'s total income for the previous year as a percentage of the official U.S. poverty threshold, adjusted for inflation. '
    },
    {
      ipumsName: 'REGION',
      title: 'Region',
      group: 5,
      defCheck: false,
      description: 'identifies the U.S. Census region and division where the individual lives. There are four primary regions and nine primary divisions of the U.S., with additional categories for mixed divisions. Consider using Region: recode or Region-division: recode for less detailed versions of this variable. '
    },
    {
      ipumsName: 'STATEFIP',
      title: 'State',
      group: 5,
      defCheck: true,
      description: 'reports the state in which the individual lives, using a federal coding scheme that lists states alphabetically.  '
    },
    {
      ipumsName: 'MIGRATE1',
      title: 'Moved',
      group: 5,
      defCheck: false,
      description: 'reports whether the person had moved to a different house within the past year, with several categories. '
    },
    {
      ipumsName: 'YEAR',
      title: 'Year',
      group: 6,
      format: 'categorical',
      defCheck: true
  }]
};