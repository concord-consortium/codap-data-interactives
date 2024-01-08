# Sonify

This plugin creates microtonal and microrhythmic melodies from data.

## Basic usage

0. Before turning on, lower the volume of the speaker / headphones to avoid a sudden blast of sound.
1. Assign CODAP attributes to the Pitch and Time dimensions using the drop-down menu or drag and drop.
    - The plugin accepts numeric as well as date values. If the attribute is in a date format, check that the "DateTime" box is ticked.
    - You may want to create an accompanying visual graph with the Time attribute mapped to X axis, and the Pitch attribute to Y axis. You can do this manually or you can press the "create graph" button.
2. Toggle the Play switch to play sounds.
    - Data points thar are selected in CODAP have a more prominent sound.
3. You can make the melodic pattern repeat endlessly by toggling the "Loop" switch.
4. Toggle Click to hear the starting (i.e., ending) location in time.
    - For the attribute mapped to Time, you should hear sounds with the earlier in time, the lower the mapped value.
    - For the Pitch attribute, the higher the pitch, the higher the value (unless you tick the Descending mode).

## Concepts

Unlike the melodies or rhythms in traditional Western music that have distinct
beats (e.g., quarter notes) and familiar musical scales (e.g., major scale),
this sonification creates continuous and more granular melodies / sounds.
In audio-synthesis technologies, this micro-timing synthesis technique is
usually called the [granular synthesis](http://granularsynthesis.com/guide.php).
Each data point is represented by a very short sound with a unique pitch,
placed in a timeline. Depending on the data mapped to the time,
you might hear a smooth line of melody, a rhythmic pattern, a harmonic texture,
or a random noise.

## Things to try

### Time series vs non time series

Since the plugin sequence streams over time similar to time series data,
it might make sense to map the time/date to the Time parameter
You then have the time-stretched or compressed melody that evolves over time.

What would happen if you flip the mappings between Time and Pitch?
Now the pitch goes higher as the original time/date progresses,
but the timestamped event happens sooner in the melody if it has a low
measurement mapped to Time, and later if it has a high value.

### Correlated variables

When you map the same attribute to Pitch and Time, what should it sound like?
Try finding attributes that have rising or falling patterns.
You can also try calculating the linear-regression line with attribute formula,
and hear what kind of slope / correlation it produces.

### Sorted sequence (by case index)

Create a new attribute with the formula `caseIndex`.
Map this attribute to Time.
Now, try sorting the cases by various attributes / sorting rules.

### Random sampling

Create a new attribute with the formula `random()`.
Map this attribute to Time. By default,
this creates a complex rhythm with fractional time intervals.
However, if you combine this with the above "Sort by case index" technique,
you can hear the values at a steady rate.
You can also try rounding (binning) the fractional time values into fixed
intervals by a formula `floor(attr*resolution)`.
