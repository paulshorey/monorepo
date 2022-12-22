export default function convertContentfulToWordpress(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: { rendered: post.title },
    jetpack_featured_media_url: post.featuredImage,
    excerpt: {
      rendered: post.summary,
    },
    content: {
      rendered: post.body,
    },
    date_gmt: post.publishDate,
    featured_media: post.featuredImage,
    author: post.author,
    categories: post.categories,
  };
}
