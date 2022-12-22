import { createClient } from "contentful";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_API_KEY
});

/**
 * Get entries from Contentful
 * @param {Object} options
 * @param {String} opt.contentType
 * @resolves {Array} - returns array of entries
 */
export default function (options) {
  return new Promise((resolve, reject) => {
    client
      .getEntries({
        ...options
      })
      .then((response) => {
        if (response?.items) {
          resolve(response.items);
        } else {
          console.info("getEntries failed", "did not find any items");
          reject();
        }
      })
      .catch((error) => {
        console.error("getEntries error", error);
        reject();
      });
  });
}
