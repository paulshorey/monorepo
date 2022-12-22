/**
 * Generates a generic Contentful entry from object, based on property types. Format locale assuming "en-US"
 * Properties can be the following types:
 *     string = short text
 *     array of strings = rich text, paragraph from each array item
 *     object {name, ext} = Cloudinary image object
 *     boolean = boolean
 *     number = number
 * Needs better documentation
 */
export default function (obj) {
  let data = {
    metadata: {
      tags: []
    },
    fields: {}
  };
  // fix/aggregate properties
  if (!obj.urlSlug) {
    obj.urlSlug = (obj.displayName || obj.name || obj.title || obj.id || "")
      .trim()
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  // build fields from properties
  for (let key in obj) {
    let value = obj[key];
    if (typeof value === "string") {
      data.fields[key] = {
        "en-US": value.trim()
      };
    } else if (typeof value === "object" && value.name && value.ext) {
      data.fields[key] = {
        "en-US": [
          {
            url: `https://res.cloudinary.com/fixMe/image/upload/${value.name}.${value.ext}`,
            tags: [],
            type: "upload",
            format: value.ext.trim(),
            duration: null,
            metadata: [],
            public_id: value.name.trim(),
            created_at: new Date().toISOString(),
            secure_url: `https://res.cloudinary.com/fixMe/image/upload/${value.name}.${value.ext}`,
            original_url: `https://res.cloudinary.com/fixMe/image/upload/${value.name}.${value.ext}`,
            resource_type: "image",
            raw_transformation: "f_auto/q_auto",
            original_secure_url: `https://res.cloudinary.com/fixMe/image/upload/${value.name}.${value.ext}`
          }
        ]
      };
    } else if (typeof value === "object" && value.length) {
      data.fields[key] = {
        "en-US": {
          data: {},
          content: value.map((item) => {
            return {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: item.trim(),
                  nodeType: "text"
                }
              ],
              nodeType: "paragraph"
            };
          }),
          nodeType: "document"
        }
      };
    } else if (typeof value === "boolean") {
      data.fields[key] = {
        "en-US": value
      };
    } else if (typeof value === "number") {
      data.fields[key] = {
        "en-US": value
      };
    }
  }
  // ok
  return data;
}
