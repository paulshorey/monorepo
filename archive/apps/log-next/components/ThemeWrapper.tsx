'use client'

import { useEffect } from 'react'
import { MantineProvider } from '@mantine/core'
import { theme } from '@lib/common/fe/styles/theme'
import { ErrorBoundary } from '@lib/common/fe/components/wrappers/ErrorBoundary'

// Import all the styles that were in Providers
import '@/styles/tailwind.css'
import '@lib/common/fe/styles/global.scss'
import '@mantine/core/styles.css'
import '@lib/common/fe/styles/mantine.scss'

export function ThemeWrapper({
  children,
  colorScheme = 'dark',
}: {
  children: React.ReactNode
  colorScheme?: 'dark' | 'light'
}) {
  // Update the HTML element's data attribute when color scheme changes
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-mantine-color-scheme',
      colorScheme
    )
  }, [colorScheme])

  return (
    <MantineProvider forceColorScheme={colorScheme} theme={theme}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </MantineProvider>
  )
}
