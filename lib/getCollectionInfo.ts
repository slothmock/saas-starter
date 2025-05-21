// lib/getCollectionInfo.ts

import { scrapeCollectionData } from "./scraper";

export async function getCollectionInfo(uprn: string) {
  try {
    const result = await scrapeCollectionData(uprn);
    if (!result) return null;

    return {
      day: result.collectionDay,
      bins: result.bins
    };
  } catch (err) {
    console.error('Error fetching bin data:', err);
    return null;
  }
}
