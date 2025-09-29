// ==========================================================================
//
//  Author:   jsandoe
//
//  Copyright (c) 2024 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

// Import base URL helper if needed for asset loading
import { getBaseURL } from './app.js';
import { nameToDescription } from './attributeDescriptions.js';
import { attributeGroups, attributes } from './attributeConfig.js';

/**
 * Manages the attribute selector UI component
 */

// Build a grouped attribute map for UI rendering
const NON_SELECTABLE_ATTRIBUTES = ['boundary', 'State', 'County'];
const groupedAttributes = {};
attributeGroups.forEach(group => {
  groupedAttributes[group.id] = attributes.filter(attr => attr.group === group.id && !NON_SELECTABLE_ATTRIBUTES.includes(attr.name));
});

// State management for attribute selector
const attributeSelectorState = {
  categories: {}
};
attributeGroups.forEach(group => {
  attributeSelectorState.categories[group.id] = {
    expanded: false,
    enabled: true,
    allSelected: group.id === 'demographics',
    attributes: group.id === 'demographics'
      ? new Set(groupedAttributes[group.id].map(attr => attr.name))
      : new Set()
  };
});

/**
 * Initialize the attribute selector component
 */
function initializeAttributeSelector() {
  console.log('[DEBUG] initializeAttributeSelector called');
  // Initialize only Demographics attributes as selected
  attributeGroups.forEach(group => {
    attributeSelectorState.categories[group.id].attributes = group.id === 'demographics'
      ? new Set(groupedAttributes[group.id].map(attr => attr.name))
      : new Set();
    attributeSelectorState.categories[group.id].allSelected = group.id === 'demographics';
  });
  console.log('[DEBUG] attributeSelectorState after initialize:', JSON.stringify(attributeSelectorState));
  // Generate checkboxes
  generateAttributeCheckboxes();
  // Add dropdown header click handlers
  const headers = document.querySelectorAll('.wx-dropdown-header');
  console.log('[DEBUG] Found', headers.length, 'dropdown headers');
  headers.forEach(header => {
    header.addEventListener('click', handleDropdownHeaderClick);
    console.log('[DEBUG] Attached click handler to header:', header);
  });
  // Initialize selection summaries and counts
  attributeGroups.forEach(group => {
    updateCategorySelectionSummary(group.id);
    updateCategorySelectionCount(group.id);
  });
  
  // Initialize Select All link
  const selectAllLink = document.getElementById('select-all-link');
  if (selectAllLink) {
    selectAllLink.addEventListener('click', (event) => {
      event.preventDefault();
      toggleSelectAll();
    });
    updateSelectAllLinkText();
  }
}

/**
 * Generate attribute checkboxes for all categories (new UI)
 */
function generateAttributeCheckboxes() {
  console.log('[DEBUG] generateAttributeCheckboxes called');
  attributeGroups.forEach(group => {
    const container = document.getElementById(`${group.id}-attributes`);
    console.log(`[DEBUG] For category '${group.id}', found container:`, container);
    const groupAttrs = groupedAttributes[group.id];
    // Clear any existing rows
    container.innerHTML = '';

    // --- Header row with Select All and Clear all ---
    const headerRow = document.createElement('tr');
    headerRow.className = 'wx-select-all-row';
    const thSelectAll = document.createElement('th');
    thSelectAll.colSpan = 2;
    thSelectAll.style.padding = '0';

    // Flex container for right-justified links/text
    const linkFlex = document.createElement('div');
    linkFlex.className = 'wx-select-all-flex';

    // Determine if all attributes are selected
    const allSelected = attributeSelectorState.categories[group.id].attributes.size === groupAttrs.length;

    // Select all or all-selected text/link
    const categoryState = attributeSelectorState.categories[group.id];
    if (allSelected) {
      const allSelectedText = document.createElement('span');
      allSelectedText.className = 'wx-all-selected-text';
      allSelectedText.textContent = `All ${group.title} attributes selected`;
      linkFlex.appendChild(allSelectedText);
    } else {
      const selectAllLink = document.createElement('a');
      selectAllLink.href = '#';
      selectAllLink.textContent = `Select all ${group.title} attributes`;
      selectAllLink.className = 'wx-select-all-link';
      selectAllLink.addEventListener('click', (event) => {
        event.preventDefault();
        groupAttrs.forEach(attr => categoryState.attributes.add(attr.name));
        categoryState.allSelected = true;
        generateAttributeCheckboxes();
        updateCategorySelectionSummary(group.id);
        updateCategorySelectionCount(group.id);
        updateSelectAllLinkText();
        notifyAttributeSelectionChanged();
      });
      linkFlex.appendChild(selectAllLink);
    }

    // Clear all link (always shown)
    const clearAllLink = document.createElement('a');
    clearAllLink.href = '#';
    clearAllLink.textContent = 'Clear';
    clearAllLink.className = 'wx-clear-all-link';
    clearAllLink.addEventListener('click', (event) => {
      event.preventDefault();
      categoryState.attributes.clear();
      categoryState.allSelected = false;
      generateAttributeCheckboxes();
      updateCategorySelectionSummary(group.id);
      updateCategorySelectionCount(group.id);
      updateSelectAllLinkText();
      notifyAttributeSelectionChanged();
    });
    linkFlex.appendChild(clearAllLink);

    thSelectAll.appendChild(linkFlex);
    headerRow.appendChild(thSelectAll);
    container.appendChild(headerRow);
    // --- End header row ---

    groupAttrs.forEach(attr => {
      const row = document.createElement('tr');
      // Checkbox cell
      const tdCheckbox = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `attr-${attr.name}`;
      checkbox.checked = attributeSelectorState.categories[group.id].attributes.has(attr.name);
      checkbox.addEventListener('change', (event) => handleAttributeCheckboxChange(event, group.id, attr.name));
      tdCheckbox.appendChild(checkbox);
      // Label and description cell
      const tdLabel = document.createElement('td');
      const label = document.createElement('label');
      label.htmlFor = `attr-${attr.name}`;
      label.textContent = attr.unit ? `${attr.name} (${attr.unit})` : attr.name;
      // Always show description below name
      if (attr.description) {
        const desc = document.createElement('div');
        desc.className = 'attr-description';
        desc.textContent = attr.description;
        tdLabel.appendChild(label);
        tdLabel.appendChild(desc);
      } else {
        tdLabel.appendChild(label);
      }
      row.appendChild(tdCheckbox);
      row.appendChild(tdLabel);
      container.appendChild(row);
      console.log(`[DEBUG] Rendered checkbox for '${attr.name}' in category '${group.id}'`);
    });
  });
}

/**
 * Handle attribute checkbox change
 */
function handleAttributeCheckboxChange(event, categoryId, attributeId) {
  const checked = event.target.checked;
  const categoryState = attributeSelectorState.categories[categoryId];
  if (checked) {
    categoryState.attributes.add(attributeId);
  } else {
    categoryState.attributes.delete(attributeId);
  }
  // Update allSelected flag
  const groupAttrs = groupedAttributes[categoryId];
  categoryState.allSelected = (categoryState.attributes.size === groupAttrs.length);

  // Always re-render the checkboxes and header to ensure correct Select all/All attributes selected logic
  generateAttributeCheckboxes();
  updateCategorySelectionSummary(categoryId);
  updateCategorySelectionCount(categoryId);
  updateSelectAllLinkText();
  notifyAttributeSelectionChanged();
}

/**
 * Update the selection summary for a category
 */
function updateCategorySelectionSummary(categoryId) {
  const userSelection = document.querySelector(`#${categoryId}-section .wx-user-selection`);
  const selected = Array.from(attributeSelectorState.categories[categoryId].attributes);
  const names = selected.map(id => {
    const attr = groupedAttributes[categoryId].find(a => a.name === id);
    return attr ? attr.name : id;
  });
  userSelection.textContent = names.join(', ');
}

/**
 * Update the selection count for a category
 */
function updateCategorySelectionCount(categoryId) {
  const countSpan = document.querySelector(`#${categoryId}-section .wx-selection-count`);
  const selectedCount = attributeSelectorState.categories[categoryId].attributes.size;
  // Only show the selected count, not 'selected/total'
  countSpan.textContent = `${selectedCount}`;
}

/**
 * Handle dropdown header click (expand/collapse)
 */
function handleDropdownHeaderClick(event) {
  event.stopPropagation();
  console.log('[DEBUG] Dropdown header clicked!', event.target);
  const dropdown = event.target.closest('.wx-dropdown');
  console.log('[DEBUG] Closest .wx-dropdown:', dropdown);
  if (dropdown.classList.contains('wx-up')) {
    dropdown.classList.remove('wx-up');
    dropdown.classList.add('wx-down');
    console.log('[DEBUG] Toggled to wx-down:', dropdown.classList.value);
  } else {
    dropdown.classList.remove('wx-down');
    dropdown.classList.add('wx-up');
    console.log('[DEBUG] Toggled to wx-up:', dropdown.classList.value);
  }
}

/**
 * Notify that attribute selection has changed
 */
function notifyAttributeSelectionChanged() {
  // Create and dispatch a custom event
  const event = new CustomEvent('attribute-selection-changed', {
    bubbles: true,
    detail: { hasSelectedAttributes: hasSelectedAttributes() }
  });
  document.dispatchEvent(event);
}

/**
 * Get all selected attribute names across all categories
 * @returns {string[]} Array of selected attribute names
 */
function getSelectedAttributes() {
  const selectedAttributes = [];
  // Iterate through all categories
  for (const categoryId in attributeSelectorState.categories) {
    // Skip disabled categories
    if (!attributeSelectorState.categories[categoryId].enabled) {
      console.log(`Category ${categoryId} is disabled, skipping`);
      continue;
    }
    // Get attributes for this category
    const categoryAttributes = getSelectedAttributesForCategory(categoryId);
    console.log(`Category ${categoryId}: selected ${categoryAttributes.length} attributes`);
    selectedAttributes.push(...categoryAttributes);
  }
  // Add core attributes that should always be included
  const coreAttributes = [
    'State',
    'County',
    'boundary'
  ];
  // Combine core and selected attributes (avoiding duplicates)
  const finalAttributes = [...new Set([...coreAttributes, ...selectedAttributes])];
  console.log(`[DEBUG] getSelectedAttributes called. Returning:`, finalAttributes);
  return finalAttributes;
}

/**
 * Get selected attribute names for a specific category
 * @param {string} categoryId - The category identifier
 * @returns {string[]} Array of selected attribute names for the category
 */
function getSelectedAttributesForCategory(categoryId) {
  // If category is disabled, return empty array
  if (!isCategoryEnabled(categoryId)) {
    return [];
  }
  
  // If "All" is selected for this category, return all attribute names
  if (attributeSelectorState.categories[categoryId].allSelected) {
    return groupedAttributes[categoryId].map(attr => attr.name);
  }
  
  // Otherwise, map the selected IDs to names
  const selectedAttributeIds = Array.from(attributeSelectorState.categories[categoryId].attributes);
  const attributes = groupedAttributes[categoryId];
  
  console.log(`Category ${categoryId}: has ${selectedAttributeIds.length} IDs selected out of ${attributes.length} total`);
  
  // Map IDs to actual attribute names
  const result = selectedAttributeIds.map(id => {
    const attribute = attributes.find(attr => attr.name === id);
    if (!attribute) {
      console.warn(`Warning: No attribute found with ID "${id}" in category "${categoryId}"`);
      return null;
    }
    return attribute.name;
  }).filter(name => name !== null);
  
  console.log(`Category ${categoryId}: mapped ${result.length} names from ${selectedAttributeIds.length} IDs`);
  return result;
}

/**
 * Check if a category is enabled
 * @param {string} categoryId - The category identifier
 * @returns {boolean} True if the category is enabled
 */
function isCategoryEnabled(categoryId) {
  return attributeSelectorState.categories[categoryId]?.enabled || false;
}

/**
 * Check if there are any selected attributes across all categories
 * @returns {boolean} True if at least one attribute is selected
 */
function hasSelectedAttributes() {
  for (const categoryId in attributeSelectorState.categories) {
    if (isCategoryEnabled(categoryId) && attributeSelectorState.categories[categoryId].attributes.size > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Check if all selectable attributes are currently selected
 * @returns {boolean} True if all attributes are selected
 */
function allAttributesSelected() {
  for (const categoryId in attributeSelectorState.categories) {
    if (isCategoryEnabled(categoryId)) {
      const categoryState = attributeSelectorState.categories[categoryId];
      const totalAttributes = groupedAttributes[categoryId].length;
      if (categoryState.attributes.size !== totalAttributes) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Select all attributes across all categories
 */
function selectAllAttributes() {
  attributeGroups.forEach(group => {
    if (attributeSelectorState.categories[group.id].enabled) {
      // Select all attributes for this category
      attributeSelectorState.categories[group.id].attributes = new Set(groupedAttributes[group.id].map(attr => attr.name));
      attributeSelectorState.categories[group.id].allSelected = true;
    }
  });
  
  // Update UI
  generateAttributeCheckboxes();
  attributeGroups.forEach(group => {
    updateCategorySelectionSummary(group.id);
    updateCategorySelectionCount(group.id);
  });
  
  // Update Select All link text
  updateSelectAllLinkText();
  
  // Notify of changes
  notifyAttributeSelectionChanged();
}

/**
 * Deselect all attributes across all categories
 */
function deselectAllAttributes() {
  attributeGroups.forEach(group => {
    if (attributeSelectorState.categories[group.id].enabled) {
      // Clear all attributes for this category
      attributeSelectorState.categories[group.id].attributes = new Set();
      attributeSelectorState.categories[group.id].allSelected = false;
    }
  });
  
  // Update UI
  generateAttributeCheckboxes();
  attributeGroups.forEach(group => {
    updateCategorySelectionSummary(group.id);
    updateCategorySelectionCount(group.id);
  });
  
  // Update Select All link text
  updateSelectAllLinkText();
  
  // Notify of changes
  notifyAttributeSelectionChanged();
}

/**
 * Toggle between select all and deselect all
 */
function toggleSelectAll() {
  if (allAttributesSelected()) {
    deselectAllAttributes();
  } else {
    selectAllAttributes();
  }
}

/**
 * Update the Select All link text based on current selection state
 */
function updateSelectAllLinkText() {
  const selectAllLink = document.getElementById('select-all-link');
  if (selectAllLink) {
    if (allAttributesSelected()) {
      selectAllLink.textContent = 'Deselect All';
      selectAllLink.title = 'Deselect all attributes';
    } else {
      selectAllLink.textContent = 'Select All';
      selectAllLink.title = 'Select all attributes';
    }
  }
}

// TEMP: Expose state and getter for debugging in browser console
window.attributeSelectorState = attributeSelectorState;
window.getSelectedAttributes = getSelectedAttributes;

// Export the public interface
export {
  initializeAttributeSelector,
  attributeSelectorState,
  getSelectedAttributes,
  getSelectedAttributesForCategory,
  isCategoryEnabled,
  hasSelectedAttributes,
  toggleSelectAll,
  updateSelectAllLinkText
}; 