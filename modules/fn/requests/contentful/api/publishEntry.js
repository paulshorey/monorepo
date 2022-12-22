import { createClient } from "contentful-management";

const client = createClient({
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_MANAGEMENT_API_KEY
});

/**
 * Attempt to change status of an entry to "published"
 * @param {Object} options
 * @param {String} opt.entryId - the entry id
 * @resolves {String} - entry id if successful
 */
export default function ({ entryId }) {
  return new Promise((resolve, reject) => {
    client
      .getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
      .then((space) => space.getEnvironment(process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT_ID))
      .then((environment) => environment.getEntry(entryId))
      .then((entry) => entry.publish())
      .then((entry) => {
        console.info("publishEntry published", entry.sys.id);
        resolve(entryId);
      })
      .catch((error) => {
        console.error("publishEntry error", error);
        reject();
      });
  });
}
