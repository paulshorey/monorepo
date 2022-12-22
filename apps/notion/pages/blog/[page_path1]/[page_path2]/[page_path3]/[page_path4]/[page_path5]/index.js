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
    depth: 5,
  });
  return {
    paths: paths,
    fallback: false,
  };
}

/**
 * For each path, get data, pass to component as props:
 */
export async function getStaticProps(context) {
  return getStaticProps_fromNotionPages(context);
}

/*
 * Render page
 */
export default Notion;
