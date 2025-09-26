// ==========================================================================
// Attribute configuration: single source of truth for all attribute metadata
// ==========================================================================

import { extractNameAndUnit } from './attributeUtils.js';

// Updated groupings per user specification
export const attributeGroups = [
  { id: 'demographics', title: 'Demographics' },
  { id: 'health', title: 'Health' },
  { id: 'education_youth', title: 'Education / Youth' },
  { id: 'wealth_infrastructure', title: 'Wealth / Infrastructure' },
];

// Attribute definitions rearranged and regrouped per user specification
const rawAttributes = [
  // Demographics
  { name: 'State', group: 'demographics', type: 'categorical' },
  { name: 'County', group: 'demographics', type: 'categorical' },
  { name: 'boundary', group: 'demographics', type: 'boundary', formula: 'lookupBoundary(US_county_boundaries, County + ", " + State)', description: 'Boundary for the county, used for mapping.', hidden: true },
  { name: 'Rural Living', dataKey: 'Rural Living (%)', group: 'demographics', description: 'Percentage of population living in a rural area. A town with less than 2,500 residents is considered rural.', type: 'numerical' },
  { name: 'Rural / Urban', group: 'demographics', description: 'Rural classification for the county. Categorized as Rural if the county\'s Rural Living value is greater than 50% and Urban if is equal to or less than 50%.', type: 'categorical' },
  { name: 'Not proficient in English', dataKey: 'Not Proficient in English (%)', group: 'demographics', description: 'Percentage of the population that is not proficient in the English language.', type: 'numerical' },
  { name: 'Non-Hispanic Black', dataKey: 'Non-Hispanic Black (%)', group: 'demographics', description: 'Percentage of population identifying as non-Hispanic Black or African American.', type: 'numerical' },
  { name: 'Asian', dataKey: 'Asian (%)', group: 'demographics', description: 'Percentage of population identifying as Asian.', type: 'numerical' },
  { name: 'Hispanic', dataKey: 'Hispanic (%)', group: 'demographics', description: 'Percentage of population identifying as Hispanic.', type: 'numerical' },
  { name: 'American Indian & Alaska Native', dataKey: '% American Indian or Alaska Native', group: 'demographics', description: 'Percentage of the population that identifies as American Indian or Alaska Native. Source: County Health Rankings 2025.', type: 'numerical' },
  { name: 'Native Hawaiian / Other Pacific Islander', dataKey: '% Native Hawaiian or Other Pacific Islander', group: 'demographics', description: 'Percentage of the population that identifies as Native Hawaiian or Other Pacific Islander. Source: County Health Rankings 2025.', type: 'numerical' },
  { name: 'Non-Hispanic White', dataKey: 'Non-Hispanic White (%)', group: 'demographics', description: 'Percentage of population identifying as non-Hispanic white.', type: 'numerical' },
  { name: 'Population', group: 'demographics', description: 'Total number of residents.', type: 'numerical' },

  // Health
  { name: 'Average Life Expectancy (years)', dataKey: 'Average Life Expectancy (years)', group: 'health', description: 'Average number of years from birth a person is expected to live', type: 'numerical' },
  { name: 'Days of Poor Physical Health (days/month)', dataKey: 'Days of Poor Physical Health (days/month)', group: 'health', description: 'Adults were asked the following question: "Thinking about your physical health, which includes physical illness and injury, for how many days during the past 30 days was your physical health not good?" The value represents the average number of days reported.', type: 'numerical' },
  { name: 'Days of Poor Mental Health (days/month)', dataKey: 'Days of Poor Mental Health (days/month)', group: 'health', description: 'Adults were asked the following question: "Thinking about your mental health, which includes stress, depression, and problems with emotions, for how many days during the past 30 days was your mental health not good?" The value represents the average number of days reported.', type: 'numerical' },
  { name: 'Limited Access to Healthy Foods', dataKey: 'Limited Access to Healthy Foods (%)', group: 'health', description: 'Percentage of the population who are low-income and have no local grocery stores.', type: 'numerical' },
  { name: 'Physically Inactive', dataKey: 'Physically Inactive (%)', group: 'health', description: 'Percentage of adults that responded "no" to the question: "During the past month, other than your regular job, did you participate in any physical activities or exercises such as running, calisthenics, golf, gardening, or walking for exercise?"', type: 'numerical' },
  { name: 'Smokers', dataKey: 'Smokers (%)', group: 'health', description: 'Percentage of the adults who said they have smoked at least 100 cigarettes in their lifetime AND that they currently smoke every day or most days. The survey does not ask specifically about e-cigarettes.', type: 'numerical' },
  { name: 'Insufficient Sleep', dataKey: 'Insufficient Sleep (%)', group: 'health', description: 'Percentage of adults who report that they sleep less than 7 hours per night on average.', type: 'numerical' },
  { name: 'Primary Care Doctor Rate', dataKey: 'Primary Care Doctor Rate (doctors/100,000)', group: 'health', description: 'Number of primary care physicians per 100,000 people.', type: 'numerical' },
  { name: 'Mental Health Providers', dataKey: 'Mental Health Providers (providers/ 100,000)', group: 'health', description: 'Number of mental health care providers per 100,000 people.', type: 'numerical' },
  { name: 'Air Pollution', dataKey: 'Air Pollution (fine particulate matter in micrograms/cubic meter of air)', group: 'health', description: 'The average density of fine particulate matter (diameter less than 2.5 micrometers) in micrograms per cubic meter. The higher the number the worse the pollution.', type: 'numerical' },
  { name: 'Motor Vehicle Death Rate', dataKey: 'Motor Vehicle Death Rate (deaths/100,000 people)', group: 'health', description: 'Number of deaths caused by motor vehicle crashes per 100,000 people.', type: 'numerical' },
  { name: 'Drug Overdose Death Rate', dataKey: 'Drug Overdose Death Rate (deaths/100,000 people)', group: 'health', description: 'Number of drug poisoning deaths per 100,000 people.', type: 'numerical' },
  { name: 'Firearm Death Rate', dataKey: 'Firearm Death Rate (deaths/ 100,000 people)', group: 'health', description: 'Number of deaths due to firearms per 100,000 people.', type: 'numerical' },

  // Education / Youth
  { name: 'Students Graduating from High School (%)', dataKey: 'Students Graduating from High School (%)', group: 'education_youth', description: 'Percentage of students that graduate from high school in 4 years.', type: 'numerical' },
  { name: 'Some College (%)', dataKey: 'Some College (%)', group: 'education_youth', description: 'Percentage of people ages 25-44 with at least some education beyond high school.', type: 'numerical' },
  { name: 'Teen Birth Rate', dataKey: 'Teen Birth Rate (births/per teens)', group: 'education_youth', description: 'Births per 1,000 females ages 15-19.', type: 'numerical' },
  { name: 'Youth Not in School or Employment', dataKey: 'Youth Not in School or Employment (%)', group: 'education_youth', description: 'Percentage of teens and young adults ages 16-19 who are neither working nor in school.', type: 'numerical' },

  // Wealth / Infrastructure
  { name: 'Children in Poverty', dataKey: 'Children in Poverty (%)', group: 'wealth_infrastructure', description: 'Percentage of people under age 18 living in a household whose income is below the poverty level.', type: 'numerical' },
  { name: 'Median Household Income', dataKey: 'Median Household Income ($)', group: 'wealth_infrastructure', description: 'Median household income for adults.', type: 'numerical' },
  { name: 'Income Level', dataKey: 'Income Level', group: 'wealth_infrastructure', description: 'Income level classification for the county. Categorized as High if the county\'s Median Household Income is greater than or equal to the median value for the state and Low if less than.', type: 'categorical' },
  { name: 'Homeowners', dataKey: 'Homeowners (%)', group: 'wealth_infrastructure', description: 'Percentage of housing units that are owned by the occupants.', type: 'numerical' },
  { name: 'Broadband Access', dataKey: 'Broadband Access (%)', group: 'wealth_infrastructure', description: 'Percentage of households with broadband internet connection.', type: 'numerical' },
  { name: 'Severe Housing Problems', dataKey: 'Severe Housing Problems (%)', group: 'wealth_infrastructure', description: 'Percentage of households with at least one of these problems: overcrowding, high housing costs, lack of kitchen facilities, or lack of plumbing facilities.', type: 'numerical' },
];

export const attributes = rawAttributes.map(attr => {
  // Extract unit from dataKey if present, otherwise from name
  const headerToParse = attr.dataKey || attr.name;
  const { name: cleanName, unit } = extractNameAndUnit(headerToParse);
  return unit ? { ...attr, name: cleanName, unit } : { ...attr };
});

export { rawAttributes }; 