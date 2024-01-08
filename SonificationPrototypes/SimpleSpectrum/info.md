# Simple Spectrum
This sonification plugin creates a static timbre from user-selected data points.

## Usage
0. To avoid sudden blast of sound, lower the speaker / headphones volume first.
1. Turn on the "Play" button. You should not hear anything yet.
2. Assign numeric attributes to the **Pitch** and **Loudness** parameters. You can either use the dropdown menus or drag & drop an attribute from CODAP (if your version of CODAP supports it).
3. Try selecting various data points in the CODAP table (e.g., individuals, by groups, or everything).

## Concepts
You could think like this plugin takes a 2D visual plot as an audio [spectrum](https://en.wikipedia.org/wiki/Spectrometer). Typically, an audio spectrum gives us the sound components each consisting of a pitch (frequency) and loudness (magnitude). The horizontal axis of a visual plot (going from the left to the right) corresponds to the pitch (going from low to high). The vertical axis (from the bottom to the top) corresponds to the loudness (from soft to loud).

If you are a first-time user, having a corresponding visualization would be helpful for learning the data-to-sound relationships and altering the active sounds. However, once you get used to it, we recommend hiding the visualization and interacting with the table or case card instead.

## Things to try
### The sound of clusters
Try selecting a few data points that are very close to each other in pitch. Does this selection have a noticeable pattern in the sound compared to a combination with far-apart data points? How does a cluster of points (a lot of points being close together) sounds in comparison to sparse data points?

### Memorizing the sound of groups
You can create groups in CODAP by dragging an attribute to the left side in CODAP. Once you have groups in the table, try selecting different ones to compare their collective timbres. Can you differentiate their ranges (minimum and maximum values), rough average, and their brightness or dullness of the sound color? The brightness / dullness are often the result of how the overall distribution are skewed to either the high or low direction.

---

Please contact Takahiko Tsuchiya at <takahiko@gatech.edu> if you have questions or find bugs.