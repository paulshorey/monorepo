import {
  get_pageBlocks,
  get_pageMeta,
} from '@ps/fn/requests/notion/2022-06-28';
// import cconsole from '@ps/cconsole';

// does not return anything, only modifies passed in objects
const pagesTree = async (page, pages) => {
  // invalid? already encountered?
  if (!page.url || !page.id || pages[page.url]) return;
  // meta
  if (!page.title) {
    let pageMeta = await get_pageMeta(page.id);
    page.title = pageMeta.properties.title.title[0].plain_text;
  }
  // blocks
  if (!page.blocks) {
    page.blocks = await get_pageBlocks(page.id);
    for (let block of page.blocks) {
      if (block.child_page) {
        // prefill id,url,title
        block.child_page = {
          id: block.id,
          title: block.child_page.title,
          url:
            page.url +
            block.child_page.title
              .replace(/[^a-z0-9\-_]+/gi, '-')
              .toLowerCase() +
            '/',
        };
        await pagesTree(block.child_page, pages);
        block.child_page.parent_page_url = page.url;
        block.child_page.parent_page_title = page.title;
      }
    }
  }
  // save flat list of references to full tree of nested pages
  // before caching, will have to remove circular references
  // cconsole.info('builtPage', page.url, page.id);
  pages[page.url] = page;
};
export default pagesTree;
