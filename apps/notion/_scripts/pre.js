import fs from 'fs';

let CACHE_SECONDS = process.env.NOTION_CACHE;
if (CACHE_SECONDS) {
  CACHE_SECONDS = Number(CACHE_SECONDS);
}

console.log('\n\n\n\nNOTIONAPI.JS');
if (!CACHE_SECONDS) {
  console.log('CLEAR CACHE');
  fs.rmdirSync('tmp', { recursive: true });
  fs.mkdirSync('tmp');
  fs.mkdirSync('tmp/notionCache');
}
console.log('\n\n\n\n');
