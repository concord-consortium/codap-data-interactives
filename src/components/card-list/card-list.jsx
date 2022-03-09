import React from "react";
import PropTypes from 'prop-types';
import { Card } from "../card/card";

import "./card-list.css";

export const CardList = props => {
  let { plugins, categorySelected, url, tabIndex } = props;
  let cardListWrapperClassNames = `card-list-wrapper theme${(tabIndex % 4) + 1}`
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
    <div className={cardListWrapperClassNames}>
      <div className="card-list">
        {pluginsToShow.map((plugin, index) =>
          <Card key={index} plugin={plugin} url={url}/>
        )}
      </div>
    </div>
  )
}

CardList.propTypes = {
  plugins: PropTypes.array,
  categorySelected: PropTypes.string,
  url: PropTypes.string,
  tabIndex: PropTypes.number
}
