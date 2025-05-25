import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
* Combines multiple class names into a single string, merging Tailwind CSS classes
* to ensure no conflicting styles. Utilizes `clsx` for conditional class name logic
* and `twMerge` for resolving Tailwind CSS class conflicts.
*
* @param {...ClassValue[]} inputs - An array of class values that can be strings,
* arrays, or objects representing conditional class names.
* @returns {string} A single string of merged class names.
*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * A mapping of bin types to their respective short names and image paths.
 * Each key in the map represents a specific bin type, and the value is an
 * object containing a `shortName` for the bin and the path to its `image`.
 */
export const binMap: Record<string, { shortName: string; image: string }> = {
  "Green Food Waste Caddy": {
    shortName: "Food Waste",
    image: "/binImages/green-food-waste-caddy.svg",
  },
  "Green Food Waste Caddy (T)": {
    shortName: "Food Waste",
    image: "/binImages/green-food-waste-caddy.svg",
  },
  "Blue Box (Paper)": {
    shortName: "Blue Box",
    image: "/binImages/blue-box.svg",
  },
  "Green Box (Glass)": {
    shortName: "Green Box",
    image: "/binImages/green-box.svg",
  },
  "3 x Black/Grey Bag (Residual Waste)": {
    shortName: "3 x Black/Grey Bags",
    image: "/binImages/black-grey-bags.svg",
  },
  "1 x Black/Grey Bag (Residual Waste)": {
    shortName: "1 x Black/Grey Bags",
    image: "/binImages/black-grey-bags.svg",
  },
  "Blue Bag (Card and Cardboard)": {
    shortName: "Blue Bag",
    image: "/binImages/blue-bag.svg",
  },
  "Red Bag (Metal Packaging, Plastic packaging and cartons)": {
    shortName: "Red Bag",
    image: "/binImages/red-bag.svg",
  },
  "Orange Bags (T)": {
    shortName: "Orange Bags",
    image: "/binImages/orange-bag.svg",
  },
};
