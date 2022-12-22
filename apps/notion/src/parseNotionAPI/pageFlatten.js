// import { get_sitePreviews_from_blockString, pageIds_from_blockString } from 'src/functions/notionAPI';
// import { obj_first_value } from '@ps/fn/pure/obj';
import cconsole from '@ps/cconsole';

export default function (page) {
  // flatten page, cut off children of its children
  const page_flat = { ...page, blocks: [] };
  if (page.blocks) {
    for (const block of page.blocks) {
      /*
       * for only the first paragraph block, record it in the page as a "summary"
       */
      if (block.paragraph && !page.paragraph) {
        // only use first paragraph which does not have any links!
        let is_only_text_p = true;

        if (block.paragraph.text) {
          for (const text of block.paragraph.text) {
            if (text.href) {
              is_only_text_p = false;
              break;
            }
          }
        }
        if (is_only_text_p) {
          page.paragraph = {
            type: 'paragraph',
            paragraph: block.paragraph,
          };
        }
      }
      /*
       * if block is a child_page, then remove circular references
       */
      if (block.child_page) {
        const page2 = block.child_page;
        if (page2.blocks) {
          for (const block2 of page2.blocks) {
            if (block2.child_page) {
              // replace recursive child_page object with simplified object
              block2.child_page = {
                id: block2.child_page.id,
                url: block2.child_page.url,
                title: block2.child_page.title,
              };
            }
          }
        }
      }
      page_flat.blocks.push(block);
    }
  }
  return page_flat;
}
