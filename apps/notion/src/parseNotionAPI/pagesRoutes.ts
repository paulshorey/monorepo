import {
  get_page_fromCache_byUrl,
  get_pagesUrls_fromCache,
  set_page_toCache_byUrl,
  set_pagesUrls_toCache,
} from 'src/parseNotionAPI/pagesCache';
import pagesTree from 'src/parseNotionAPI/pagesTree';
import pageFlatten from 'src/parseNotionAPI/pageFlatten';
import page_integrations from 'src/parseNotionAPI/pageIntegrations';

/*
 * BUILD ALL PAGES (this must be done first, before attempting to SSG any Next pages)
 */
export const buildPages = async function ({ pageId }) {
  /*
   * build all pages (as tree structure, starting with initial page)
   */
  let pageTree = {
    id: pageId,
    url: '/',
  };
  let pagesDict = {};
  await pagesTree(pageTree, pagesDict);
  /*
   * process each page
   */
  let pagesIdToUrl = {};
  let pagesUrls = {};
  for (let url in pagesDict) {
    let page = pagesDict[url];
    pagesIdToUrl[page.id] = page.url;
    pagesUrls[page.url] = page.id;
    page = pageFlatten(page);
  }
  for (let url in pagesDict) {
    let page = pagesDict[url];
    // add integrations
    await page_integrations(page, pagesIdToUrl);
    // cache flat list of pages for getStaticProps()
    set_page_toCache_byUrl(page.url, page);
  }
  // cache flat list of page urls for getStaticPaths()
  set_pagesUrls_toCache(pagesUrls);
};

/*
 * NextJS getStaticPaths (build list of urls to render as pages)
 */
export const getStaticPaths_fromNotionPages = async function ({
  pageId,
  depth,
}: {
  pageId: string;
  depth: number;
}) {
  // get pages
  let pagesUrls = get_pagesUrls_fromCache();
  // cconsole.error('1st get_pagesUrls_fromCache');
  if (!pagesUrls) {
    await buildPages({ pageId });
    pagesUrls = get_pagesUrls_fromCache();
  }
  // make paths
  let paths = [];
  if (pagesUrls) {
    for (let page_url in pagesUrls) {
      let page_route_str = page_url.replace(/^\/|\/$/g, '');
      let page_route_arr = page_route_str.split('/');
      if (page_route_arr.length !== depth || (depth > 0 && !page_route_arr[depth - 1])) {
        continue;
      }
      paths.push({
        params: {
          page_path1: page_route_arr[0],
          page_path2: page_route_arr[1],
          page_path3: page_route_arr[2],
          page_path4: page_route_arr[3],
          page_path5: page_route_arr[4],
        },
      });
    }
  }
  return paths;
};

/*
 * NextJS getStaticProps (get data to pass to page component)
 */
export const getStaticProps_fromNotionPages = async function (context: {
  params: Record<any, any>;
}) {
  const { params } = context;
  const paths = Object.values(params);
  let page_url = '/' + paths.join('/');
  if (page_url !== '/') {
    // don't add trailing slash to root "/"
    page_url = page_url + '/'; // all pages built and saved with trailing slash
  }
  const page = get_page_fromCache_byUrl(page_url) || {};
  /*
   * unpack integrations
   */
  if (page?.blocks) {
    for (let block of page.blocks) {
      if (block.pageMentions) {
        for (let id in block.pageMentions) {
          let page_url = block.pageMentions[id];
          let page_mentioned = get_page_fromCache_byUrl(page_url);
          block.pageMentions[id] = page_mentioned;
        }
      }
    }
  }
  return {
    props: { page }, // will be passed to the page component as props
  };
};
