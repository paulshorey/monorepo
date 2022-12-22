import AppProvider from 'components/utils/AppProvider';
import { AppProps } from 'next/app';
import 'styles/html.css';
import 'typeface-quicksand';
import 'horizontal_carousel/css/default.css';
import 'styles/colors.css'; // colors and fonts -- all other variables in theme.ts
import { config } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;
const MyApp = ({ Component, pageProps }: AppProps): any => {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
};

export default MyApp;
