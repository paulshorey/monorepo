import React from 'react';
import Notion from 'src/components/templates/Notion';
import {
  getStaticPaths_fromNotionPages,
  getStaticProps_fromNotionPages,
} from 'src/parseNotionAPI/pagesRoutes';

/**
 * For each path, get data, pass to component as props:
 */
export async function getStaticProps() {
  await getStaticPaths_fromNotionPages({ pageId: '2c377bf61ba6454fb607e52b07171015', depth: 0 });
  let context = {
    params: {
      page_path1: '',
    },
  };
  const obj = await getStaticProps_fromNotionPages(context);
  obj.props.page.url = '/blog';
  obj.props.page.title = 'Blog';
  return obj;
}

/*
 * Render page
 */
export default Notion;
