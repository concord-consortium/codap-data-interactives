# Sonify

This plugin creates melodies from data.

## Basic usage

1. Before turning on, lower the volume of the speaker / headphones to avoid a sudden blast of sound.
2. Assign CODAP attributes to the Pitch and Time dimensions using the drop-down menu or drag and drop.
    - The plugin accepts numeric as well as date values.
    - You will want to create an accompanying visual graph with the Time attribute mapped to X axis, and the Pitch attribute to Y axis. You can do this by pressing the "create graph" button.
3. Press the Play/Pause button to play sounds.
    - If no points are selected, all points in the dataset will play.
    - If data points are selected, only the selected points will be played.
    - A vertical green line slides across the graph while playing, to indicate where in the graph is being played.
4. While playing a graph, press the Play/Pause button to pause playback. If you press the button again, it will start playing from where you paused in the graph.
5. To stop/reset playback, press the “Reset” button. Now if you press play, it will start playing from the beginning of the graph (or from the first selected data point).
6. You can make the melodic pattern repeat endlessly by toggling the "Loop" switch.
7. You can make the melodic pattern play faster or slower by dragging the “Speed” slider to the left (slower) or to the right (faster).
8. You can hear a smooth sound (sliding between data points) by turning on the “Smooth Sound” toggle.
9. For the Pitch attribute, the higher the pitch, the higher the value.

## Things to Consider

- If you have more than one time series on the graph, you may want to [color points on a graph by attribute values](https://codap.concord.org/how-to/color-points-on-a-graph-by-attribute-values/).
- If you manually change the graph axes, this will not affect the sonification. The creation of the sounds is defined by the selection of the Time and Pitch attributes in the plugin itself.
- If you use the sonification plugin to make more than one graph it is best practice to only show the graph that currently matches the attributes chosen for the Time and Pitch in the plugin.

