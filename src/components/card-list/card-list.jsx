import React from "react";
import { Card } from "../card/card";

import "./card-list.css";

export const CardList = props => {
  let { plugins, categorySelected, url } = props;
  let cardlistWrapperClassNames = `cardlistWrapper ${categorySelected}`
  let pluginsToShow = plugins.filter(plugin => plugin.categories.includes(categorySelected));
  return (
    <div className={cardlistWrapperClassNames}>
      <div className="card-list">
        {pluginsToShow.map((plugin, index) =>
          <Card key={index} plugin={plugin} url={url}/>
        )}
      </div>
    </div>
  )
}
