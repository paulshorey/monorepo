/**
 * This uses Fetch API to scrape the text content a website (only source code, no JavaScript execution)
 * @param {object} options
 * @param {string} options.url - URL to scrape
 * @param {string} options.selector - CSS selector to scrape
 * @param {string} options.attr - Alternative to options.selector
 * @param {boolean} options.spacer - Adds spaces between tags (default is one space)
 * @returns {Promise<string>} - text content from website body source code
 */
export default async function ({ url, selector, attr, spacer = " " }) {
  if (!selector) {
    selector = "body";
  }
  const response = await fetchResponse(url);
  if (!attr) {
    return await getText({ response, selector, spacer });
  } else {
    return await getAttribute({ response, selector, attr });
  }
}

/*
 * LIB
 */
const cleanText = (s) => s.trim().replace(/\s\s+/g, " ");

const fetchResponse = async function (url) {
  const response = await fetch(url);

  const server = response.headers.get("server");

  const isThisWorkerErrorNotErrorWithinScrapedSite =
    [530, 503, 502, 403, 400].includes(response.status) &&
    (server === "cloudflare" || !server); /* Workers preview editor */

  if (isThisWorkerErrorNotErrorWithinScrapedSite) {
    throw new Error(`Status ${response.status} requesting ${url}`);
  }

  return response;
};

const getText = async function ({ response, selector, spacer }) {
  const rewriter = new HTMLRewriter();
  const matches = {};
  global.cconsole.warn("selector", selector);
  const selectors = new Set(selector.split(",").map((s) => s.trim()));

  selectors.forEach((selector) => {
    matches[selector] = [];

    let nextText = "";

    rewriter.on(selector, {
      element() {
        matches[selector].push(true);
        nextText = "";
      },

      text(text) {
        nextText += text.text;

        if (text.lastInTextNode) {
          nextText += spacer || "";
          matches[selector].push(nextText);
          nextText = "";
        }
      }
    });
  });

  const transformed = rewriter.transform(response);

  await transformed.arrayBuffer();

  selectors.forEach((selector) => {
    const nodeCompleteTexts = [];

    let nextText = "";

    matches[selector].forEach((text) => {
      if (text === true) {
        if (nextText.trim() !== "") {
          nodeCompleteTexts.push(cleanText(nextText));
          nextText = "";
        }
      } else {
        nextText += text;
      }
    });

    const lastText = cleanText(nextText);
    if (lastText !== "") nodeCompleteTexts.push(lastText);
    matches[selector] = nodeCompleteTexts;
  });

  return selectors.length === 1 ? matches[selectors[0]] : matches;
};

const getAttribute = async function ({ response, selector, attr }) {
  class AttributeScraper {
    element(element) {
      if (this.value) return;
      this.value = element.getAttribute(attr);
    }
  }
  const scraper = new AttributeScraper(attr);

  await new HTMLRewriter().on(selector, scraper).transform(response).arrayBuffer();

  return scraper.value || "";
};
