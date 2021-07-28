/**
 * Event Class. 
 * Extend this class to have Events with your own
 * custom variables and methods. 
 */

/**
 * Constructor
 * 
 * @param {String} type 
 *    The event type. When this event is dispatched,
 *    all event listeners that are listening to that
 *    type will be triggered.
 */
function Event(type)
{
  this.type = type;
}


/**
 * Event Dispatcher Class.
 * This is an event manager - you can add and remove
 * listeners, and dispatch events. When you dispatch an event,
 * all listeners listening to that type of event will be triggered.
 * This is inspired by the event system in Adobe Flex SDK
 */

/**
 * Constructor
 */
function EventDispatcher()
{
  // associative array: string=>array of functions
  this.eventListeners = [];
}

/**
 * Adds an Event Listener
 * @param {String} type
 *    The type of event to listen for
 * @param {Function} listener
 *    The listener that will be called. It will be called like, listener(e:Event)
 */
EventDispatcher.prototype.addEventListener = function(type, listener, instance)
{
  if (typeof type === "string"
    && listener !== null)
  {
    // add the listener
    var listenerArr = this.eventListeners[type];
    if (!listenerArr)
    {
      listenerArr = [];
      this.eventListeners[type] = listenerArr;
    }
    
    if (listenerArr.indexOf(listener) === -1)
    {
      listenerArr.push({instance:instance, listener:listener});
    }
  }
};

/**
 * Removes the Event Listener
 * @param {String} type
 *    The type of event listener to remove
 * @param {Function} function
 *    The listener to remove
 */
EventDispatcher.prototype.removeEventListener = function(type, listener)
{
  if (type instanceof String
    && listener !== null)
  {
    // remove the listener
    var listenerArr = this.eventListeners[type];
    for (var i=0; i<listenerArr.length; i++)
    {
      if (listenerArr[i].listener === listener)
      {
        listenerArr.splice(i, 1);
        break;
      }
    }
  }
};

/**
 * Dispatch an Event
 * @param {Event} e
 *    The Event to be dispatched. All listeners listening for the
 *    event's type will be called, with the event as the single argument.
 */
EventDispatcher.prototype.dispatchEvent = function(e)
{
  if (e instanceof Event)
  {
    var listenerArr = this.eventListeners[e.type];
    if (listenerArr)
    {
      for (var i=0; i<listenerArr.length; i++)
      {
        listenerArr[i].listener.call(
          listenerArr[i].instance, e);
      }
    }
  } 
};
