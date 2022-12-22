import { createClient } from "contentful";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_API_KEY
});

/**
 * Get entry by property
 * @param {Object} options
 * @param {String} opt.contentType - the content type
 * @param {String} opt.entryKey - which field to search
 * @param {String} opt.entryValue - what value to match
 * @resolves {Object} - the entry
 */
export default function ({ contentType, entryKey, entryValue }) {
  return new Promise((resolve) => {
    client
      .getEntries({
        locale: "en-US",
        content_type: contentType,
        [`fields.${entryKey}`]: entryValue
      })
      .then((response) => {
        if (response.items.length > 0) {
          let item = response.items[0];
          resolve(item);
        } else {
          resolve();
        }
      })
      .catch((error) => {
        console.error("error", error);
        resolve();
      });
  });
}
