import getSitePreview from '@ps/fn/requests/site_info/linkpreview';
// import cconsole from '@ps/cconsole';

export default async function (page, pagesIdToUrl) {
  for (let block of page.blocks) {
    let blockString = JSON.stringify(block);
    block.pageMentions = {};
    await get_pagePreviews_from_blockString(blockString, pagesIdToUrl, block.pageMentions); // {}
    // block.sitePreviews = await get_sitePreviews_from_blockString(blockString); // {}
    // console.log('\n\n\npage.pageMentions', page.pageMentions, '\n\n\n');
  }
}

export const get_pagePreviews_from_blockString = async function (text, pagesIdToUrl, aggregator) {
  let pagesIds = [];
  let matches = text.matchAll(/mention":{"type":"page","page":{"id":"([^"]+)/g);
  if (matches) {
    matches = [...matches];
    for (let match of matches) {
      if (match && match[1]) {
        pagesIds.push(match[1]);
      }
    }
  }
  for (let pageId of pagesIds) {
    if (aggregator[pageId]) continue;
    // cconsole.warn('get_pagePreviews_from_blockString() found pageId', pageId);
    aggregator[pageId] = pagesIdToUrl[pageId]; // just the id->url mapping
    // cconsole.warn('get_pagePreviews_from_blockString() found pageUrl', pagesIdToUrl[pageId]);
  }
  return aggregator || null;
};

export const get_sitePreviews_from_blockString = async function (text) {
  let sites = {};
  let output = {};
  let matches = text.matchAll(/\[{[^\]]+?"content":"([^"]+)"[^\]]+?"url":"([^"]+)/g);
  if (matches) {
    matches = [...matches];
    for (let match of matches) {
      if (match && match[2] && match[1]) {
        sites[match[2]] = match[1];
      }
    }
  }
  for (let siteUrl in sites) {
    let siteName = sites[siteUrl];
    if (output[siteUrl]) continue;
    output[siteUrl + siteName] = await getSitePreview(siteUrl, siteName);
  }
  return output || null;
};
