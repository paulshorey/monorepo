import React from 'react';
// import CopyButton from 'src/components/atoms/CopyButton';

const UIPage = () => {
  let page: Record<string, any> = {
    socialTitle: `Trying some things out`,
    path: ``,
  };
  page.title = `${page.socialTitle} · PS`;

  return (
    <>
      <div className="content contentWidth-article">
        <h1>UI Tests</h1>
        <p>Trying some things out</p>
      </div>
    </>
  );
};
export default UIPage;
