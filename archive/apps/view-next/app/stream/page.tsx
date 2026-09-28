import nextDynamic from 'next/dynamic'
import { ThemeWrapper } from '../../components/ThemeWrapper'

export const dynamic = 'force-dynamic'

// Dynamic import with no SSR - lightweight-charts requires window
const StreamChartWrapper = nextDynamic(
  () =>
    import('../../features/stream/Wrapper').then(
      (mod) => mod.StreamChartWrapper
    ),
  { ssr: false }
)

export default function Page() {
  return (
    <ThemeWrapper colorScheme="dark">
      <StreamChartWrapper />
    </ThemeWrapper>
  )
}
