# Data Moves Recorder
This plugin records and replays some of the common operations in CODAP for data-science exploration. 

## The types of Data move
- Select
- Move
- Map
- Sort
- Formula

## User Interface
### Record
When this option is enabled, all the actions listed above will be recorded into either the Data Moves table or the invisible memory space (see Update Table option).

### Update Table
Sometimes, dynamically adding moves to the Data Moves table can slow down CODAP (e.g., with a continuously changing selections on the graph). Or you might want to record the data-inquiry session by a student, but do not want them to interact with the recorded data. Either way, you can toggle this option off to store all the data moves into a memory instead of writing into the Data Moves table, and enable the option later to flush the memory content into the table.

### Replay
Enable this option when you want to recreate the recorded action. You can replay individual data moves in any order by clicking a timeline item in the Data Moves table. Be careful about selecting multiple timeline items or fewer items in the child collection (named Moves), as it can cause unexpected behaviors.

### Interpolate

### Duplicate Selection

### Delete Selection