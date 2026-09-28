import { ErrorBoundary } from '@lib/common/fe/components/wrappers/ErrorBoundary'
import { Providers } from '@lib/common/fe/components/wrappers/Providers'

export const metadata = {
  title: 'Log',
}
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function RootLayout({ children }: { children: any }) {
  const defaultColorScheme = 'dark'
  return (
    <html
      lang="en"
      data-mantine-color-scheme={defaultColorScheme}
      suppressHydrationWarning
    >
      <head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Providers defaultColorScheme={defaultColorScheme}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
