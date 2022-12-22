import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntriesToStrings from 'src/fetch/contentful/lib/decodeEntriesToStrings';

/**
 * Get all partners, sorted
 */
export default async (slug) => {
  let items = await getEntries({
    'content_type': 'partner',
    'fields.urlSlug': slug,
    'order': '-fields.sortOrder',
    'include': 10,
  });
  if (!items || !items.length) {
    return null;
  }
  items = decodeEntriesToStrings(items);
  return items?.[0];
};
