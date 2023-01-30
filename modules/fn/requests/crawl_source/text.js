/**
 * This uses Fetch API to scrape the text content a website (only source code, no JavaScript execution)
 * @param {string} options.url - URL to scrape (required, include protocol)
 * @param {string} options.selector - CSS selector to scrape (default is "body")
 * @returns {Promise<string>} - text content from website body source code
 */
export default async function ({ url, selector }) {
  if (!selector) {
    selector = "body";
  }
  const response = await fetchResponse(url);
  return await getText({ response, selector });
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

const getText = async function ({ response, selector }) {
  const rewriter = new HTMLRewriter();
  const readTexts = [];
  global.cconsole.warn("selector", selector);

  {
    let nextText = "";

    rewriter.on(selector, {
      element() {
        readTexts.push(true);
        nextText = "";
      },

      text(text) {
        nextText += text.text;

        if (text.lastInTextNode) {
          nextText += " ";
          readTexts.push(nextText);
          nextText = "";
        }
      }
    });
  }
  const transformed = rewriter.transform(response);

  await transformed.arrayBuffer();

  const nodeCompleteTexts = [];
  let nextText = "";

  readTexts.forEach((text) => {
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

  return nodeCompleteTexts;
};
