export function getCategories(plugins) {
  let categoryArray = [];
  
  plugins.forEach(plugin => {
    if (plugin.visible && plugin.visible !== "false"){
      plugin.categories.forEach(category => {
        if (!categoryArray.includes(category)) {
          categoryArray.push(category)
        }
      })
    }
  })
  return categoryArray;
}

export function isDevMode() {
  let queryParam = window.location.search.substr(1);
  return queryParam.includes("dev")
}
