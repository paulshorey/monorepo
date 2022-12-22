import { get } from "../fetcher";

const NOTION_SECRET = process.env.NOTION_TOKEN;

let CACHE_SECONDS = process.env.NOTION_CACHE || 0;
if (CACHE_SECONDS) {
  CACHE_SECONDS = Number(CACHE_SECONDS);
}

const HEADERS = {
  "Notion-Version": "2021-05-13",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${NOTION_SECRET}`
};

export const get_pageMeta = async (pageId) => {
  console.log("get page...", pageId);
  let data = await get(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: HEADERS,
    ttl: CACHE_SECONDS
  });
  if (!data || !data.id) {
    data = null;
  }
  return data;
};

export const get_pageBlocks = async (blockId) => {
  console.log("get blocks...", blockId);
  let data = await get(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
    headers: {
      "Notion-Version": "2021-05-13",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${NOTION_SECRET}`
    },
    ttl: CACHE_SECONDS
  });
  if (!data || !data.results) {
    data = [];
  } else {
    data = data.results;
  }
  return data;
};
