# CODAP Plugin Drag Handler
This is a helper library for CODAP data-interactive plugins for accepting drag events from CODAP. To get started, include the library file in the plugin HTML,
```html
<script type="text/javascript" src="CodapDragHandler.js"></script>
```

and instantiate the handler object in the application JavaScript code.

```javascript
const dragHandler = new CodapDragHandler();
```

We use the `dragHandler` object to set up custom behaviors of the plugin when receiving drag events from CODAP, such that

```javascript
dragHandler.on(eventTypeString, callbackFunction);
```

The event types and their expected behaviors are similar to the native JavaScript drag-event API. These are:

- `dragstart`: Called when a drag (of an attribute view component) operations has started somewhere in CODAP.
- `dragend`: Called when a drag operation is terminated in CODAP by either releasing the mouse button, pressing the ESC key, etc.
- `dragenter`: Called once when the dragged entity enters the droppable area (an element with the reserved / user-specified class name; the default is `.drop-area`).
- `dragleave`: Called once when the dragged entity leaves the droppable area / element.
- `dragover`: Called repeatedly when the dragged entity hovers over the droppable area. This callback also reports the position of the mouse cursor relative to the plugin iframe.
- `drop`: Called once with the mouse release of dragged entity within the droppable area.
- `dragenterframe`: Called once when the dragged entity enters the boundary of the plugin iframe.
- `dragleaveframe`: Called once when the dragged entity leaves the plugin iframe.

The input arguments for the callback function are somewhat different from the native JavaScript API. They are generally provided with two input arguments, such that

```javascript
dragHandler.on(eventType, function (data, elements) {
	// Do something with the incoming data and/or drag-area HTML elements.
});
```

- `data`: An object with four properties.
	+ `text`: A string with the text displayed in the dragged view component. This is typically the title of the attribute.
	+ `attribute`, `collection`, and `context`: Objects each containing the `name` (string), `title` (the displayed name; string), and `id` (number) of the dragged entitiy. The `collection` and `context` are the parent of the dragged `attribute`.
- `elements`: An array of the HTML elements that are marked as drop target area with the class name (such as `.drop-area`). The array items could be multiple if the drop-target elements are layered on top of each other. This rule is applicable for `dragenter`, `dragleave`, `dragover`, and `drop` events.

The `dragstart`, `dragend`, `dragenterframe`, and `dragleaveframe` events also provide the `elements` array as the second argument. The array, however, contains all the droppable areas in the plugin regardless of the current pointer location.

Additionally, the `dragover` event provides the third argument: the location of the pointer (in pixels with the property name `x` and `y`, originated from the top-left corner) within the iframe window.

## Code Examples
In the plugin HTML, add elements (e.g., `div`) with the general drop-area class name (default: `.drop-area`) with optionally a unique ID.

```HTML
<style type="text/css">
	.my-drop-area {
		border: 2px solid black;
	}
</style>
<div class="my-drop-area" id="target1">Drop an attribute here.</div>
<div class="my-drop-area" id="target2">Drop another attribute here.</div>
```

In the plugin JavaScript code, add the code similar to the following.

```javascript
// Unless specified by the user (the optional first argument), the default class name is ".drop-area".
const dragHandler = new CodapDragHandler('my-drop-area');

dragHandler.on('dragenter', (data, els) => {
	// An example of highlighting the color of all the droppable area where the mouse cursor is currently over.
	els.forEach(el => {
		el.style.backgroundColor = 'rgba(255,255,0,0.5)';
	});
});

dragHandler.on('dragleave', (data, els) => {
	els.forEach(el => {
		// Remove the highlight when the curosr goes out of the droppable area.
		el.style.backgroundColor = 'transparent';
	});
});

dragHandler.on('drop', (data, els) => {
	els.forEach(el => {
		// An exmple of "assigning" the dropped data to a particular target. This assumes that the element also has a unique ID (e.g., "#target1") besides the general drop-area class name.
		if (el.id === 'target1') {
			// Handle the data accordingly.
		}
	})
});

dragHandler.on('dragstart', (data, els) => {
	els.forEach(el => {
		// An example of highlighting the boundary of all the droppable areas when the dragging begins.
		el.style.outline = '3px solid rgba(0,255,255,0.5)';
	});
});

dragHandler.on('dragend', (data, els) => {
	els.forEach(el => {
		// Remove all the highlights.
		el.style.backgroundColor = 'transparent';
		el.style.outline = '3px solid transparent';
	});
});
```

Upon instantiation, the `dragHandler` adds an event listener to the iframe window. In case you needs to remove it (which is optional), call:

```javascript
dragHandler.destroy();
```
