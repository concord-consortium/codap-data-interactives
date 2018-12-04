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
  attributeGroups : [
    {number : 1, open : false, title : "Basic demographics"},
    {number : 2, open : false, title : "Race, ancestry, origins"},
    {number : 3, open : false, title : "Work & employment"},
    {number : 4, open : false, title : "Income"},
    {number : 5, open : false, title : "Geography"},
    {number : 6, open : false, title : "Technical"}
  ],

  attributeAssignment: [
    {ipumsName: 'AGE', title: 'Age', group: 1, defCheck: true,
      description: 'Age reports the Individual\'s age in years as of the last birthday. Values range from 0 (less than 1 year old) to 90 and above.  See codebook for special codes.'
    },
    {ipumsName: 'SEX', title: 'Sex', group: 1, defCheck: true,
      description: 'Sex reports each individual\'s biological sex as male or female.'
    },
    {ipumsName: 'MARST', title: 'Marital status', group: 1, defCheck: false,
      description: 'Marital status reports each individual’s current marital status, with 6 possible categories.'
    },
    {ipumsName: 'NCHILD', title: 'Number of children', group: 1, defCheck: false,
      description: 'Number of children counts the number of own children (of any age or marital status) residing with each individual. Values range from 0 to a top code of 9+.'
    },
    {ipumsName: 'FAMSIZE', title: 'Family size', group: 1, defCheck: false,
      description: 'Family size reports the number of own family members residing with each individual, including the person her/himself.  Values range from 1 to as high as 26 or higher in some years.'
    },
    {ipumsName: 'EDUC', title: 'Education-year', group: 1, defCheck: false,
      description: 'Education-years reports the individual’s level of educational attainment based on the highest level or year of school completed.'
    },
    {ipumsName: 'RACE', title: 'Race-multi', group: 2, defCheck: false,
      description: 'Race-multi reports each individual’s race according to 9 categories, including categories for mixed-race individuals. Caution needed when making comparisons over time.'
    },
    {ipumsName: 'RACESING', title: 'Race-single', group: 2, defCheck: false,
      description: 'Race-single assigns individuals to one of 5 race categories and assigns a single race to multiple-race people. Comparable over time, but not available after 2014.'
    },
    {ipumsName: 'HISPAN', title: 'Hispanic', group: 2, defCheck: false,
      description: 'Hispanic identifies individuals of Hispanic, Spanish, or Latino origin and classifies them according to their country of origin. The U.S. Census considers Hispanic origin to be an ethnic rather than a racial classification; individuals of Hispanic origin can therefore be of any race'
    },
    {ipumsName: 'CITIZEN', title: 'Citizen', group: 2, defCheck: false,
      description: 'Citizen identifies the citizenship status of individuals, with 6 categories.'
    },
    {ipumsName: 'YRIMMIG', title: 'Immigrate-year', group: 2, defCheck: false,
      description: 'Immigrate-year reports the year in which a foreign-born person entered the U.S'
    },
    {ipumsName: 'BPL', title: 'Birthplace', group: 2, defCheck: false,
      description: 'Birthplace reports where in the world the respondent was born. Includes up to 188 location categories. Consider working instead with a recoded and simplified version of this variable, called Birthplace (recode)'
    },
    {ipumsName: 'SPEAKENG', title: 'Speaks English', group: 2, defCheck: false,
      description: 'Speaks English indicates whether the individual speaks English, speaks only English at home, or how well the individual speaks English. There have been up to 8 codes over time.'
    },
    {ipumsName: 'EMPSTAT', title: 'Employment status', group: 3, defCheck: false,
      description: 'Employment status reports whether the individual was a part of the labor force, i.e., working or seeking work, and if yes, whether the person was currently unemployed.'
    },
    {ipumsName: 'LABFORCE', title: 'Labor force status', group: 3, defCheck: false,
      description: 'Labor force status indicates whether a person participated in the labor force.'},
    {ipumsName: 'CLASSWKR', title: 'Class of worker', group: 3, defCheck: false,
      description: 'Class of worker indicates whether individuals were self-employed or worked for wages as an employee'
    },
    {ipumsName: 'UHRSWORK', title: 'Usual hours worked', group: 3, defCheck: false,
      description: 'Usual hours worked reports the number of hours per week that the individual usually worked, if the person worked during the previous year. Values range from 0 (or N/A) to 99 (the top code).'
    },
    {ipumsName: 'WKSWORK2', title: 'Weeks worked', group: 3, defCheck: false,
      description: 'Weeks worked reports the number of weeks that the individual worked the previous year, with six primary categories.'
    },
    {ipumsName: 'WORKEDYR', title: 'Worked last year', group: 3, defCheck: false,
      description: 'Worked last year indicates whether the person worked during the previous year.'
    },
    {ipumsName: 'OCC1950', title: 'Occupation 1950 basis', group: 3, defCheck: false,
      description: 'Occupation-1950 basis reports the person’s primary occupation, using the Census Bureau’s 1950 occupational classification system. There are several hundred occupation categories.'
    },
    {ipumsName: 'OCC1990', title: 'Occupation 1990 basis', group: 3, defCheck: false,
      description: 'Occupation-1990 basis reports the person’s primary occupation, using a modified version of the 1990 Census Bureau occupational classification scheme, from 1950 forward. There are several hundred occupation categories.'
    },
    {ipumsName: 'IND1950', title: 'Industry 1950', group: 3, defCheck: false,
      description: 'Industry-1950 basis reports the industry of the individual, using the 1950 Census Bureau industrial classification system.'
    },
    {ipumsName: 'IND1990', title: 'Industry 1990', group: 3, defCheck: false,
      description: 'Industry-1990 basis reports the industry of the individual, using the 1990 Census Bureau industrial classification system, from 1950 forward. There are several hundred industry categories.'
    },
    {ipumsName: 'VETSTAT', title: 'Veteran status', group: 3, defCheck: false,
      description: 'Veteran status indicates whether individuals served in the military forces of the U.S. (Army, Navy, Air Force, Marine Corps, or Coast Guard) in time of war or peace. Service includes active duty for any length of time and at any place at home or abroad.'
    },
    {ipumsName: 'INCTOT', title: 'Income-total', group: 4, defCheck: false,
      description: 'Income-total reports each respondent’s total pre-tax income. Total income is the sum of the amounts reported for multiple types of income.  '
    },
    {ipumsName: 'INCWAGE', title: 'Income-wages', group: 4, defCheck: false,
      description: 'Income-wages reports each respondent’s pre-tax wage or salary income received for work performed as an employee. Amounts are expressed in contemporary dollars.  '
    },
    {ipumsName: 'FTOTINC', title: 'Income family', group: 4, defCheck: false,
      description: 'Income-family total reports the sum of the pre-tax incomes of all respondents 15 years old and over related to Person 1 in the questionnaire. Amounts are expressed in contemporary dollars.  '
    },
    {ipumsName: 'INCEARN', title: 'Income-earnings', group: 4, defCheck: false,
      description: 'Income-earnings reports income earned from wages or a person\'s own business or farm for the previous year. Amounts are expressed in contemporary dollars. '
    },
    {ipumsName: 'CPI99', title: 'CPI99', group: 4, defCheck: false,
      description: 'CPI99 provides the adjustment factor that converts contemporary dollars to constant 1999 dollars. It is a 5-digit numeric variable that has three implied decimals. For example, a CPI99 value of 15423 should be interpreted as 15.423. '
    },
    {ipumsName: 'INCWELFR', title: 'Income-welfare', group: 4, defCheck: false,
      description: 'Income-welfare reports how much pre-tax income (if any) the respondent received during the previous year from various public assistance programs commonly referred to as "welfare." Assistance from private charities is not included. Amounts are expressed in contemporary dollars. '
    },
    {ipumsName: 'POVERTY', title: 'Poverty', group: 4, defCheck: false,
      description: 'Poverty reports each family\'s total income for the previous year as a percentage of the official U.S. poverty threshold, adjusted for inflation. '
    },
    {ipumsName: 'REGION', title: 'Region', group: 5, defCheck: false,
      description: 'Region identifies the U.S. Census region and division where the individual lives. There are four primary regions and nine primary divisions of the U.S., with additional categories for mixed divisions. Consider using Region (recode) or Region-division (recode) for less detailed versions of this variable. '
    },
    {ipumsName: 'STATEFIP', title: 'State', group: 5, defCheck: true,
      description: 'State reports the state in which the individual lives, using a federal coding scheme that lists states alphabetically.  '
    },
    {ipumsName: 'MIGRATE1', title: 'Moved', group: 5, defCheck: false,
      description: 'Moved reports whether the person had moved to a different house within the past year, with several categories. '
    },
    {ipumsName: 'YEAR', title: 'year', group: 6, format: 'categorical', defCheck: true}
  ]
};