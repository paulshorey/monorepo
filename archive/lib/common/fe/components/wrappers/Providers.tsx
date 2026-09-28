'use client'

import { MantineProvider } from '@mantine/core'
import { theme } from '../../styles/theme'

// Note: tailwind.css should be imported by each app locally for proper @source paths
import '../../styles/global.scss'
import '@mantine/core/styles.css'
import '../../styles/mantine.scss'
import { ErrorBoundary } from './ErrorBoundary'

export function Providers({ children, defaultColorScheme }: any) {
  return (
    <MantineProvider forceColorScheme={defaultColorScheme} theme={theme}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </MantineProvider>
  )
}
