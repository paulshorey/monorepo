import getEntries from "src/fetch/contentful/api/getEntries";
import decodeEntriesToStrings from "src/fetch/contentful/lib/decodeEntriesToStrings";

/**
 * Get all partners, sorted
 */
export default async () => {
  let items = await getEntries({
    content_type: "blogPost",
    order: "-fields.publishDate"
  });
  if (!items || !items.length) {
    return [];
  }
  items = decodeEntriesToStrings(items);
  return items.map(convertContentfulToWordpress);
};

/*
INPUT FROM CONTENTFUL
{
  id: '123',
  title: 'Article Title',
  summary: '<p>...</p>\n',
  featuredImage: 'https://res.cloudinary.com/fixMe/images/wordpress-uploads/demo/demo.webp',
  categoriesText: 'Category Name',
  publishDate: '2022-05-04T17:29:00+00:00',
  body: '<p>The article text...</p>\n',
  slug: 'article_title'
},
*/

/*
OUTPUT TO PAGE (mimic Wordpress):
{
  id: 11,
  slug: 'article_title',
  title: { rendered: 'Article Title' },
  jetpack_featured_media_url: '',
  excerpt: {
    rendered:
      'This is a short description of the content. <b>It sometimes contains HTML.</b> It could just be a cut off beginning of the full text, or a custom written couple lines of text.',
  },
  content: {
    rendered:
      'This is the full text of the content. It contains HTML.',
  },
  date_gmt: '2021-04-26T14:45:00',
  featured_media: this.images[0].id,
  author: this.user.id,
  categories: this.categories_ids,
},
*/
