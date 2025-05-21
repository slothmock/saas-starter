import * as cheerio from 'cheerio';

export async function scrapeCollectionData(uprn: string) {
  const url = `https://nearest.pembrokeshire.gov.uk/property/${uprn}`;
  const res = await fetch(url);
  const html = await res.text();

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
