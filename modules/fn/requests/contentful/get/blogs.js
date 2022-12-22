import getEntries from 'src/fetch/contentful/api/getEntries';
import decodeEntriesToStrings from 'src/fetch/contentful/lib/decodeEntriesToStrings';
import getBlogCategories from 'src/fetch/contentful/get/blogCategories';

export default async ({ categorySlug, depth = 10 } = {}) => {
  let categories = await getBlogCategories({ categorySlug });
  let posts =
    (await getEntries({
      content_type: 'blogPost',
      order: '-fields.publishDate',
      include: depth,
    })) || [];
  posts = decodeEntriesToStrings(posts);
  // filter posts array by category.slug
  if (categorySlug) {
    posts = posts.filter((post) => {
      // loop through each category object to see if one matches category
      if (!post.categories) return false;
      return post.categories.find((cat) => cat.slug === categorySlug);
    });
  }
  return { posts, categories };
};
