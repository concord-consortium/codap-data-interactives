# County Health Data - NetAppDE

A CODAP Data Interactive Plugin for exploring county-level health, demographic, and socioeconomic data across the United States.

## Description

This plugin enables users to:
- Select U.S. states and import county-level data into CODAP
- Choose from multiple attribute categories: Demographics, Health, Education/Youth, and Wealth/Infrastructure  
- Filter and select specific attributes for analysis
- Visualize relationships between health outcomes and social determinants

## Features

- **State Selection**: Choose from all 50 U.S. states
- **Attribute Categories**: 
  - Demographics (Rural/Urban classification, race/ethnicity, population)
  - Health (Life expectancy, physical/mental health, mortality rates)
  - Education/Youth (High school graduation, teen birth rates, youth employment)
  - Wealth/Infrastructure (Income, housing, broadband access)
- **Flexible Selection**: Global "Select All" or category-specific attribute selection
- **Data Integration**: Seamless import into CODAP for analysis and visualization

## Data Source

County health data sourced from County Health Rankings & Roadmaps, a collaboration between the Robert Wood Johnson Foundation and the University of Wisconsin Population Health Institute.

## Usage

1. Open the plugin in CODAP
2. Select a U.S. state from the dropdown
3. Choose desired attributes using the category selectors
4. Click "Add State Data" to import into CODAP
5. Use CODAP's tools to analyze and visualize the data

## Technical Requirements

- Modern web browser with JavaScript enabled
- CODAP environment for data analysis
- Internet connection for data loading

## Files Structure

```
CountyHealthData-NetAppDE/
├── index.html              # Main plugin interface
├── css/style.css           # Plugin styling
├── js/                     # JavaScript modules
│   ├── app.js             # Main application logic
│   ├── attributeConfig.js # Attribute definitions
│   ├── attributeSelector.js # Selection UI logic
│   ├── data.js            # Population data constants
│   ├── ui.js              # UI helper functions
│   └── [other utilities]
├── lib/                   # External libraries
└── assets/data/2025/csv/  # County health data files
```

## Version

Current data reflects 2025 County Health Rankings.

## License

Licensed under the MIT License.

## Contact

Built for educational use with CODAP (Common Online Data Analysis Platform).
