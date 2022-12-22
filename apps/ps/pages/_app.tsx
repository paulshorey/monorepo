import AppProvider from 'components/utils/AppProvider';
import { AppProps } from 'next/app';
import Head from 'next/head';
import 'styles/html.css';
import 'typeface-quicksand';
import 'styles/fontAwesomeMinimal.css';
import 'styles/colors.css'; // colors and fonts -- all other variables in theme.ts
import { config } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;
const MyApp = ({ Component, pageProps }: AppProps): any => {
  return (
    <AppProvider>
      <Head>
        <title>Web Software Development by Paul Shorey</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Component {...pageProps} />
    </AppProvider>
  );
};

export default MyApp;
