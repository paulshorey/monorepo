import React from 'react';
import usePage from 'src/components/notion/usePage';
import Main from 'src/components/html/Main';
import Header from 'src/components/html/Header';

const TemplateNotion = ({ page }) => {
  const parsedPage = usePage({ data: page });

  if (!page || !page.blocks || !page.id || !page.title) {
    return (
      <pre key={page.id + 'TemplateNotion'}>
        <code>{JSON.stringify(page, null, ' ')}</code>
      </pre>
    );
  }

  return (
    <div className={'templatesNotion'}>
      <Header>
        {page.url !== '/' && (
          <>
            <a href="/">TECHY.TOOLS</a> /{' '}
          </>
        )}
        {page.parent_page_url && (
          <>
            <a href={(page.parent_page_url !== '/blog' ? '/blog' : '') + page.parent_page_url}>
              {page.parent_page_title}s
            </a>{' '}
            /{' '}
          </>
        )}
        {page.title}
        <sup>{page.id}</sup>
      </Header>

      <Main variant="full">
        {parsedPage.children?.map((Child, i) => (
          <Child key={page.id + 'TemplateNotion_' + i} />
        ))}
      </Main>
    </div>
  );
};
export default TemplateNotion;
