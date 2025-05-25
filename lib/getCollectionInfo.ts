// lib/getCollectionInfo.ts

import { scrapeCollectionData } from "./scraper";

/**
 * Retrieves collection information for a given UPRN (Unique Property Reference Number).
 *
 * @param {string} uprn - The unique property reference number for which to fetch collection data.
 * @returns {Promise<{ day: string, bins: { name: string, date: string }[] } | null>} 
 *          A promise that resolves to an object containing the collection day and bins information,
 *          or null if an error occurs during data retrieval.
 */
export async function getCollectionInfo(uprn: string) {
  try {
    const result = await scrapeCollectionData(uprn);
    return result ? { day: result.collectionDay, bins: result.bins } : null;
  } catch (err) {
    console.error('Error fetching bin data:', err);
    return null;
  }
}
