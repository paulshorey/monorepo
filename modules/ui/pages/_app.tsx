import ThemeProvider from '@techytools/ui/components/ThemeProvider';
import { AppProps } from 'next/app';
import '@techytools/ui/styles/colors.css';

const MyApp = ({ Component, pageProps }: AppProps): any => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp;
