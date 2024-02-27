
function loadScriptsInOrder(scripts, callback) {
    const loadScript = (index) => {
      if (index < scripts.length) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = scripts[index];
        script.onload = () => loadScript(index + 1); // Load next script
        document.getElementsByTagName("head")[0].appendChild(script);
      } else {
        if (callback) callback(); // All scripts loaded
      }
    };
  
    loadScript(0);
  }
  
  init().then(() => {
    loadScriptsInOrder([
      "task_descriptions_2.js",
      "onboarding.js"
    ], function() {
      console.log("All scripts loaded in order.");
    });
  });