import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import createEmotionCache from '../src/createEmotionCache';
import { getTheme } from '../src/theme';

import { DefaultSeo } from 'next-seo';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { Web3ReactProvider } from '@web3-react/core';
import { Provider } from 'jotai';
import { hooks as metaMaskHooks, metaMask } from '../src/connectors/metamask';
import {
  hooks as walletConnectHooks,
  walletConnect,
} from '../src/connectors/walletConnect';

import { SnackbarProvider } from 'notistack';
import AppIntlProvider from '../src/components/AppIntlProvider';
import { Updater } from '../src/components/transactions/Updater';
import { getAppConfig } from '../src/services/app';

import SEO from '../next-seo.config';

import dynamic from 'next/dynamic';

const Web3ProviderNoSSR = dynamic(
  () => import('../src/components/Web3Provider').then(mod => mod.Web3Provider),
  { ssr: false }
);

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const appConfig = getAppConfig();

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const theme = React.useMemo(() => {
    const tempTheme = getTheme(appConfig.theme);
    return responsiveFontSizes(tempTheme);
  }, []);

  const [queryClient] = React.useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          suspense: false,
        },
      },
    })
  );

  const getLayout = React.useMemo(
    () => (Component as any).getLayout || ((page: React.ReactNode) => page),
    [Component]
  );

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <Provider>
              <SnackbarProvider maxSnack={3}>
                <AppIntlProvider>
                  <DefaultSeo {...SEO} />
                  <CssBaseline />
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <Web3ProviderNoSSR>
                      <Updater />
                      {getLayout(<Component {...pageProps} />)}
                    </Web3ProviderNoSSR>
                  </LocalizationProvider>
                </AppIntlProvider>
              </SnackbarProvider>
            </Provider>
          </Hydrate>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
