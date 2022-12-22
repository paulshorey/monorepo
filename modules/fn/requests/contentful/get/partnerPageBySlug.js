import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntryToStrings from 'src/fetch/contentful/lib/decodeEntryToStrings';

/**
 * Get partner page + partner, aggregated
 * @param {string} slug - the url slug of the partner
 * @returns {object} - the "partner" content type object, parsed to strings. One of the properties is "page", which is the content type "partner page", also parsed to strings.
 */
export default async (slug) => {
  let partners = await getEntries({
    'content_type': 'partner',
    'fields.urlSlug': slug,
    'order': '-fields.sortOrder',
    'include': 10,
  });
  if (!partners || !partners.length) {
    return null;
  }
  let partner = partners?.[0];
  if (!partner) {
    return null;
  }
  partner = decodeEntryToStrings(partner);
  let pages = await getEntries({
    content_type: 'partnerPage',
    links_to_entry: partner.id,
    include: 10,
  });
  if (!pages || !pages.length) {
    return null;
  }
  let page = pages?.[0];
  page = decodeEntryToStrings(page);
  return page;
};
