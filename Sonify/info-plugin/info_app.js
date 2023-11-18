//let showdown = require("showdown");
const converter = new showdown.Converter({
  openLinksInNewWindow: true,
});
let client = new XMLHttpRequest();
let target = document.getElementById("renderTarget");
let urlParams = new URL(window.location.href).searchParams;
let dir = urlParams.get("dir");
let file = urlParams.get("file");
if (target && dir && file) {
  client.open("GET", `../${dir}/${file}`);
  client.onreadystatechange = () => {
    let text = client.responseText;
    target.innerHTML = converter.makeHtml(text);
  };
  client.send();
}
