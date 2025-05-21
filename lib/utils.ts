import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
