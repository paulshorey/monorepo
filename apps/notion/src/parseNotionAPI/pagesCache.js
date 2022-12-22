import cconsole from '@ps/cconsole';
import import_localstorage from 'node-localstorage';

let { LocalStorage } = import_localstorage;
let cacheNotion = new LocalStorage('tmp/cacheNotion');

/*
 * page
 */
export const set_page_toCache_byUrl = function (url, page) {
  cacheNotion.setItem(url, JSON.stringify(page));
};
export const get_page_fromCache_byUrl = function (url) {
  let page = cacheNotion.getItem(url);
  if (page) {
    return JSON.parse(page);
  }
  return null;
};

/*
 * allPageUrls
 */
export const set_pagesUrls_toCache = function (pagesUrls) {
  cacheNotion.setItem('pagesUrls', JSON.stringify(pagesUrls));
};
export const get_pagesUrls_fromCache = function () {
  let pagesUrls = cacheNotion['pagesUrls'];
  if (pagesUrls) {
    return JSON.parse(pagesUrls);
  }
  return null;
};
