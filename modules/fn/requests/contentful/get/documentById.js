import getEntryById from 'src/fetch/contentful/api/getEntryById';
import decodeEntryToStrings from 'src/fetch/contentful/lib/decodeEntryToStrings';

export default async (id) => {
  let document = (await getEntryById(id)) || null;
  document = decodeEntryToStrings(document);
  return document;
};
