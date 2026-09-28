import SyncedChartsWrapper from '../../features/tradingview/SyncedChartsWrapper'
import { ThemeWrapper } from '../../components/ThemeWrapper'

export default function Page() {
  return (
    <ThemeWrapper colorScheme="dark">
      <SyncedChartsWrapper />
    </ThemeWrapper>
  )
}
