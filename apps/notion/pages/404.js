import React from 'react';

const NotFoundPage = () => {
  let page = {
    socialTitle: `Page Not found (404 Error)`,
    path: ``,
  };
  page.title = `${page.socialTitle} · Spiral`;

  return (
    <>
      <div className="content contentWidth-article">
        <h1>404: Not Found</h1>
      </div>
    </>
  );
};
export default NotFoundPage;
