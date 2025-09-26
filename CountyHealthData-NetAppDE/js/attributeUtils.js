/**
 * Extracts the unit from an attribute name in the format 'Name (unit)'.
 * If no unit is present, returns the original name and undefined unit.
 *
 * @param {string} attributeName - The attribute name, possibly with a unit in parentheses.
 * @returns {{ name: string, unit?: string }} An object with the cleaned name and the extracted unit (if any).
 */
export function extractNameAndUnit(attributeName) {
  const match = attributeName.match(/^(.*)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return {
      name: match[1].trim(),
      unit: match[2].trim(),
    };
  }
  return { name: attributeName.trim() };
} 