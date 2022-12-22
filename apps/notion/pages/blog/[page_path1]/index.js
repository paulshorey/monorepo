import React from 'react';
import Notion from 'src/components/templates/Notion';
import {
  getStaticPaths_fromNotionPages,
  getStaticProps_fromNotionPages,
} from 'src/parseNotionAPI/pagesRoutes';

/**
 * Get all possible paths:
 */
export async function getStaticPaths() {
  let paths = await getStaticPaths_fromNotionPages({
    pageId: '7893c77c97794abf82deb18b226b4122',
    depth: 1,
  });
  return {
    paths: paths,
    fallback: false,
  };
}

/**
 * For each path, get data, pass to component  as props:
 */
export async function getStaticProps(context) {
  const obj = await getStaticProps_fromNotionPages(context);
  // console.log('obj', obj);
  // if (!obj.props.page.parent_page_url) {
  obj.props.page.parent_page_url = '/blog';
  obj.props.page.parent_page_title = 'Blog';
  // }
  return obj;
}

/*
 * Render page
 */
export default Notion;
