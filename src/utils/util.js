export function getCategories(plugins) {
  let categoryArray = [];
  
  plugins.map(plugin => {
    plugin.categories.forEach(category => {
      if (!categoryArray.includes(category)) {
        categoryArray.push(category)
      }
    })
  })
  if (!isDevMode()) {
    categoryArray.splice(categoryArray.indexOf("Utilities"),1);
  }
  return categoryArray;
}

export function isDevMode() {
  let queryParam = window.location.search.substr(1);
  return queryParam.includes("dev")
}
