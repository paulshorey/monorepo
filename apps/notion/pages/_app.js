import React, { useEffect } from 'react';
import Head from 'next/head';
import AppProvider from 'src/components/utils/AppProvider';

// import theme from 'src/emotion/theme';
// import GlobalStyle from 'src/emotion/global';

function MyApp({ Component, pageProps }) {
  useEffect(() => {});

  return (
    <AppProvider>
      {/* <GlobalStyle /> */}
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon/gear.png" />
      </Head>
      <Component {...pageProps} />
    </AppProvider>
  );
}

export default MyApp;
