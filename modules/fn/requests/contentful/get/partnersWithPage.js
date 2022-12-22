import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntriesToStrings from 'src/fetch/contentful/lib/decodeEntriesToStrings';

/**
 * Get all partners, sorted
 */
export default async () => {
  let pages = await getEntries({
    content_type: 'partnerPage',
    include: 10,
  });
  if (!pages || !pages.length) {
    return [];
  }
  pages = decodeEntriesToStrings(pages);
  /*
   * Extract partner from each page
   */
  let partners = [];
  for (let page of pages) {
    if (!page?.partner) return;
    partners.push(page.partner);
  }
  return partners;
};
