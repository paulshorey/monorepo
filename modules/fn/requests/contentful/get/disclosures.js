import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntriesToStrings from 'src/fetch/contentful/lib/decodeEntriesToStrings';

/**
 * Get all partners, sorted
 */
export default async () => {
  let items = await getEntries({
    content_type: 'disclosure',
  });
  if (!items || !items.length) {
    return [];
  }
  items = decodeEntriesToStrings(items);
  return items;
};
