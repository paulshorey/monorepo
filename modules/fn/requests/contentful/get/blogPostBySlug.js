import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntriesToStrings from 'src/fetch/contentful/lib/decodeEntriesToStrings';

export default async (slug) => {
  let posts =
    (await getEntries({
      'content_type': 'blogPost',
      'fields.slug': slug,
      'include': 10,
    })) || [];
  posts = decodeEntriesToStrings(posts);
  return posts[0];
};
