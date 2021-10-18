import React from "react";
import { Card } from "../card/card";

import "./card-list.css";

export const CardList = props => {
  let { plugins, categorySelected, url, tabIndex } = props;
  let cardlistWrapperClassNames = `cardlistWrapper theme${tabIndex%4+1}`
  let pluginsToShow = plugins.filter(plugin =>
          plugin.visible &&
          plugin.visible!=='false' &&
          (plugin.categories.find(cat => cat.replace(/\..*/, '') === categorySelected))
      ).sort(function (a, b) {
        let aLow = a.title.toLowerCase();
        let bLow = b.title.toLowerCase();
        if (aLow < bLow) return -1;
        if (aLow > bLow) return 1;
        return 0;
      });
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
