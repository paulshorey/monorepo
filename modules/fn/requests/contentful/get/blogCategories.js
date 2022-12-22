import getEntries from "./api/getEntries";
import decodeEntriesToStrings from "./lib/decodeEntriesToStrings";

// type Props = {
//   /**
//    * slug property of the blog category
//    */
//   slug?: string;
// };

export default async ({ slug } = {}) => {
  let categories =
    (await getEntries({
      "content_type": "blogCategory",
      "fields.slug": slug,
      "include": 10
    })) || [];
  categories = decodeEntriesToStrings(categories);
  return categories;
};
