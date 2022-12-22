var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export const get_pageMeta = (pageId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get page...", pageId);
    let data = yield get(`https://api.notion.com/v1/pages/${pageId}`, {
        headers: HEADERS,
        ttl: CACHE_SECONDS
    });
    if (!data || !data.id) {
        data = null;
    }
    return data;
});
export const get_pageBlocks = (blockId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("get blocks...", blockId);
    let data = yield get(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
        headers: {
            "Notion-Version": "2021-05-13",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${NOTION_SECRET}`
        },
        ttl: CACHE_SECONDS
    });
    if (!data || !data.results) {
        data = [];
    }
    else {
        data = data.results;
    }
    return data;
});
