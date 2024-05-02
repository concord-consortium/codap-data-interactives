#### Updates on 10/02/2023

1. Nothing happens when I click on a “circle i” icon. Similarly for the “…” icon for number of stations. - Hovering text is already there, made it quicker and changed the pointer while hoverin on i icons
2. Though I can now change the search radius to less than 10 miles, the resulting data comes from a much wider radius, possibly only restricted in the latitude direction? - There was a small formula mistake in the previous one, should give the correct ones now.
3. Important: The unit for Temperature should not be included as part of the values because then the attribute is treated as categorical rather than numeric. Instead, the attribute properties should specify °F as the unit. (The plugin can do this through the API.) - removed this " °F" added to the temperature data and added it to the labels in the top of the tabular structure.
4. Provide defaults for both the averaging time period and the maximum number of sensors. I would suggest 5 for the latter. - Average minutes are set to 30 minutes by default and maximum sensors to 5.
5. If the user has not changed the averaging time period, adjust it dynamically based on their date range; e.g. if the time period is 1 day, the averaging time period might be 10 minutes, and if the user changes the date range to more than a week, it might be 1 hour. - Done, also added case if nothing was in the defined range.
6. Add units for Temperature. Added in the fix for point #3.
7. Since many location names have multiple locations, use type ahead to allow user to disambiguate. See the NOAA Weather plugin and its code base for this. - Added autofill to the city input field and auto populate needed details


### Testing results from 10/02/2023
- Update the version number to ‘0002’ - Done.
- Adjust the vertical dimension of the plugin so that it is just tall enough to encompass the controls without very much extra space. - Done.
- The hover tips for the “circle i” are just the same as the text prompts. They should contain additional information. For example, The City Name hover tip could be “The name of the city where sensors are to be located. The sensors nearest this city will be the ones chosen.” - Done.
- Bug: When a city is not found, “Searching” appears and does not go away. There should be a timeout after which a message should appear indicating that the city could not be found. This could be a modal alert. - Done.
- The “Clear Location” and “Search Location” buttons do not seem to be necessary now. - Done.
- “Radius Miles” should be “Radius in Miles”. - Done.
- UX question: Is the Reset Form Data button necessary/useful? (Not to me.) - Done.
- The case table created by the plugin should be the default size, not the vertically large size it currently is. - Done.
- There should be information about the plugin and its data available in the plugin, perhaps as a separate “About” tab or, alternatively as is done in the NOAA Weather plugin with an overlay accessible through an info button. - Done.
- I’ve never gotten any elevation data. Is that a bug or is there really none. If none, don’t add the attribute. - Removed the attribute, as the purple air API's don't give this data.
- The Location attribute values should include the state name. - Done.
- Isn’t AQI the most germane attribute? If so, place it before the two PM attributes. Consider placing all three of the air quality attributes before humidity and temperature. - Done.
- Consider renaming “created at” to “Date and Time.” And the description should explain that it is (I think) the time at the beginning of the period of averaging. - Done.
- The “created at” values are not sorted. They should be! - Done.
- Put the sensor name attribute ahead of the sensor index attribute so that points will be more informatively labeled. - Done.
- It is not possible to close the plugin. Is that a deliberate design decision? It can be frustrating to users who are creating a document that they want to distribute, perhaps to students, without the plugin. - Done.
- The Temperature attribute should be named simply “Temperature” and the units (°F) should be placed in the units field of the attribute description. (The plugin API allows for this.) - Done.
- Feature: When the Get Purple Air Data has been pressed, it should change say “Stop” and allow the user to stop the data gathering process. - Done.

- When a list of cities appears, arrow keys should allow navigation up and down the list with <return> or <enter> to select the city. - keyboard navigation not done yet.
- sensor_index should be categorical, not numeric.