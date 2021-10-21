import React from "react";
import PropTypes from 'prop-types';
import { getCategories } from "../../utils/util";
import "./navigation.css"

export const NavigationTabs = (props) => {
  const categoryDefinitions = props.categories;
  const categoriesInUse = getCategories(props.plugins);
  const categories = categoryDefinitions.map(e => e.category)
      .filter(category=>categoriesInUse.includes(category));

  return (
    <>
      { categories && <div className="navigationTabs">
          {categories.map((category, index) => {
            const tip = (categoryDefinitions.filter(c => c.category === category))[0];
            return (
              <div key={`${index}`} className={`tab theme${(index%4)+1} ${props.categorySelected === category ? "selected" : ""}`} value={category}
                onClick={() => props.handleCategorySelect(category)} title={tip? tip.tooltip : "" }>
                {category}
              </div>
            )
          }
          )}
        </div>
      }
    </>
  );
}

NavigationTabs.propTypes = {
  handleCategorySelect: PropTypes.func,
  plugins: PropTypes.array,
  categories: PropTypes.any,
  categorySelected: PropTypes.string,
}
