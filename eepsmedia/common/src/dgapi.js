// This wraps the KCP Data Games API.
// If you use this class rather than directly
// accessing the DG game controller, it will
// prevent the script from stopping if the
// DG game controller doesn't exist.

function DataGamesAPI()
{
  // DGTODO: Eliminate this if there are no other clients of this.controller.
  try
  {
    this.controller = 
      window.parent.DG.currGameController;
  } catch(e)
  {
    this.controller = null;
  }
}

DataGamesAPI.prototype.doCommand = function(command, args)
{
  if (window.parent.DG && window.parent.DG.doCommand)
  {
    return window.parent.DG.doCommand(
      {
        action: command,
        args: args
      }
    );
  }
  else
    return { success: false };
};
