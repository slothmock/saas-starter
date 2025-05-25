import * as cheerio from 'cheerio';

/**
 * Scrapes waste collection data for a given UPRN from the Pembrokeshire Council website.
 *
 * @param {string} uprn - The Unique Property Reference Number used to identify the property.
 * @returns {Promise<{collectionDay: string, bins: {name: string, date: string}[]}>} 
 * An object containing the collection day and an array of bin collection details.
 * If fetching fails, returns 'Unknown' for collection day and an empty bins array.
 */
export async function scrapeCollectionData(uprn: string) {
  const url = `https://nearest.pembrokeshire.gov.uk/property/${uprn}`;
  let html;
  try {
    const res = await fetch(url);
    html = await res.text();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return {
      collectionDay: 'Unknown',
      bins: [],
    };
  }

  const $ = cheerio.load(html);

  const collectionDay = $('.row p strong').first().text().trim() || 'Unknown';

  const bins: { name: string; date: string }[] = [];

  $('.col-md-4.text-center.mb-3').each((_, el) => {
    const name = $(el).find('img').attr('title') || $(el).find('img').attr('alt') || '';
    const date = $(el).find('strong').text().trim();
    if (!(name === "" || date === "")) {
        bins.push({ name, date });
    }
  });

  return {
    collectionDay,
    bins,
  };
}
