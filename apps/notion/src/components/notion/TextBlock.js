import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import TextInline from 'src/components/notion/TextInline';
import SitePreview from 'src/components/notion/SitePreview';
import PageMention from 'src/components/notion/PageMention';
import cconsole from '@ps/cconsole';

export default ({ block }) => {
  if (!block) return null;
  let data_id = block.id;
  let data_type = block.type;
  let data_mentioned_page = false;
  let data_mentioned_site = false;
  let el_tagName = tag(block);
  let el_className = 'notionBlockText';
  let text = block[block.type].text || block[block.type].rich_text;
  let Texts = [];

  /*
   * Parse inline text
   */
  text.forEach((text, ti) => {
    // the text
    Texts.push(<TextInline key={ti} text={text} />);
    // page/site/mentions
    if (
      text.mention &&
      text.mention.type === 'page' &&
      block.pageMentions &&
      block.pageMentions[text.mention.page.id]
    ) {
      data_mentioned_page = 'mentioned-page';
      Texts.push(
        <PageMention key={ti} page={block.pageMentions[text.mention.page.id]} />
      );
    }
    if (
      text.text &&
      text.text.content &&
      text.text.link &&
      text.text.link.url &&
      block.sitePreviews &&
      block.sitePreviews[text.text.link.url + text.text.content]
    ) {
      data_mentioned_site = 'mentioned-site';
      Texts.push(
        <SitePreview
          key={ti}
          sitePreview={
            block.sitePreviews[text.text.link.url + text.text.content]
          }
        />
      );
    }
  });

  /*
   * Render
   */
  if (!Texts.length) {
    // empty paragraph
    if (text && !text.length) {
      Texts.push(<span key={0}>&nbsp;</span>);
    } else {
      console.log('unfinished textblock', block);
      Texts.push(<code>[UNFINISHED BLOCK "{block.type}"]</code>);
    }
  }

  let Styled = styled[el_tagName]``;
  return (
    <Styled
      key={el_tagName + data_id}
      className={el_className}
      data-id={data_id}
      data-type={data_type}
      data-mentioned_page={data_mentioned_page}
      data-mentioned_site={data_mentioned_site}
    >
      {Texts}
    </Styled>
  );
};

function tag(block) {
  switch (block.type) {
    case 'paragraph':
      return 'p';
    case 'heading_1':
      return 'h2';
    case 'heading_2':
      return 'h3';
    case 'heading_3':
      return 'h4';
    case 'heading_4':
      return 'h5';
    case 'heading_5':
      return 'h6';
    case 'heading_6':
      return 'h6';
    case 'bulleted_list_item':
      return 'li';
    case 'numbered_list_item':
      return 'li';
    case 'quote':
      return 'blockquote';
    case 'unsupported':
      console.warn('TextBlock: UNSUPPORTED BLOCK TYPE:', block);
      return 'h1';
    default:
      console.log('TextBlock: UNFINISHED BLOCK (div):', block);
      return 'div';
  }
}
