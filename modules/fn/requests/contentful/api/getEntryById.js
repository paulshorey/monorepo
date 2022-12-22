import { createClient } from "contentful";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_API_KEY
});

/**
 * Get entry by id
 * @param {Object} options
 * @param {String} opt.entryId - id of the entry to retrieve
 * @resolves {Object} - the entry
 */
export default function (entryId) {
  return new Promise((resolve, reject) => {
    client
      .getEntry(entryId)
      .then((item) => {
        if (item) {
          resolve(item);
        } else {
          reject();
        }
      })
      .catch((error) => {
        console.error("error", error);
        reject();
      });
  });
}
