/**
 * useAggregationWorker - React hook for managing the aggregation Web Worker
 *
 * This hook:
 * 1. Creates and manages a Web Worker for data aggregation
 * 2. Converts data to serializable format before sending to worker
 * 3. Handles responses and updates state
 * 4. Uses request versioning to handle race conditions
 * 5. Cleans up worker on unmount
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { LineData, Time } from 'lightweight-charts'
import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import type {
  WorkerStrengthRow,
  WorkerLineData,
  AggregationWorkerRequest,
  AggregationWorkerResponse,
  WorkerMessage,
} from './types'
import { strengthIntervalsAll } from '../../state/useChartControlsStore'

export interface AggregationResult {
  strengthAverage: LineData<Time>[] | null
  priceAverage: LineData<Time>[] | null
  strengthIntervals: Record<string, LineData<Time>[]>
  priceTickers: Record<string, LineData<Time>[]>
}

/**
 * Convert WorkerLineData[] to LineData<Time>[]
 * Worker uses plain numbers for time, we need to cast to Time type
 */
function convertToLineData(
  data: WorkerLineData[] | null
): LineData<Time>[] | null {
  if (!data) return null
  return data.map((item) => ({
    time: item.time as Time,
    value: item.value,
  }))
}

/**
 * Convert record of WorkerLineData[] to record of LineData<Time>[]
 */
function convertRecordToLineData(
  record: Record<string, WorkerLineData[]>
): Record<string, LineData<Time>[]> {
  const result: Record<string, LineData<Time>[]> = {}
  for (const [key, data] of Object.entries(record)) {
    result[key] = data.map((item) => ({
      time: item.time as Time,
      value: item.value,
    }))
  }
  return result
}

export interface UseAggregationWorkerOptions {
  /** Whether to enable the worker (disable during SSR) */
  enabled?: boolean
  /** Callback when aggregation completes */
  onResult?: (
    result: AggregationResult,
    processingTimeMs: number,
    dataVersion: number
  ) => void
  /** Callback on error */
  onError?: (error: string) => void
}

export interface UseAggregationWorkerReturn {
  /** Trigger aggregation with new data */
  aggregate: (
    rawData: (StrengthRowGet[] | null)[],
    intervals: string[],
    tickers: string[],
    dataVersion: number
  ) => void
  /** Whether the worker is currently processing */
  isProcessing: boolean
  /** Last processing time in milliseconds */
  lastProcessingTimeMs: number | null
  /** Whether the worker is ready */
  isReady: boolean
  /** Set the valid data version (results with older versions are ignored) */
  setValidDataVersion: (version: number) => void
}

/**
 * Convert StrengthRowGet to WorkerStrengthRow (serializable)
 */
function toWorkerRow(row: StrengthRowGet): WorkerStrengthRow {
  const result: WorkerStrengthRow = {
    id: row.id,
    ticker: row.ticker,
    timenow: row.timenow.toISOString(),
    price: row.price,
    volume: row.volume,
    average: row.average,
  }

  // Copy all interval values
  for (const interval of strengthIntervalsAll) {
    result[interval] = row[interval as keyof StrengthRowGet] as number | null
  }

  return result
}

/**
 * Convert raw data array to serializable format
 */
function serializeRawData(
  rawData: (StrengthRowGet[] | null)[]
): (WorkerStrengthRow[] | null)[] {
  return rawData.map((tickerData) => {
    if (!tickerData) return null
    return tickerData.map(toWorkerRow)
  })
}

export function useAggregationWorker(
  options: UseAggregationWorkerOptions = {}
): UseAggregationWorkerReturn {
  const { enabled = true, onResult, onError } = options

  const workerRef = useRef<Worker | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessingTimeMs, setLastProcessingTimeMs] = useState<
    number | null
  >(null)
  const [isReady, setIsReady] = useState(false)

  // Track the valid dataVersion - results with older versions are ignored
  const validDataVersionRef = useRef(0)
  const requestIdRef = useRef(0)

  // Store callbacks in refs to avoid recreating worker on callback changes
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  // Initialize worker on mount
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    // Create worker using Next.js compatible syntax
    const worker = new Worker(
      new URL('./aggregation.worker.ts', import.meta.url)
    )

    // Handle messages from worker
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data

      if (message.type === 'result') {
        const response = message as AggregationWorkerResponse
        const { dataVersion, payload } = response

        // Check if this result is stale (from an older data version)
        if (dataVersion < validDataVersionRef.current) {
          return
        }

        setIsProcessing(false)
        setLastProcessingTimeMs(payload.processingTimeMs)

        // Convert WorkerLineData to LineData<Time> for lightweight-charts
        onResultRef.current?.(
          {
            strengthAverage: convertToLineData(payload.strengthAverage),
            priceAverage: convertToLineData(payload.priceAverage),
            strengthIntervals: convertRecordToLineData(
              payload.strengthIntervals
            ),
            priceTickers: convertRecordToLineData(payload.priceTickers),
          },
          payload.processingTimeMs,
          dataVersion
        )
      } else if (message.type === 'error') {
        setIsProcessing(false)
        onErrorRef.current?.(message.error)
      }
    }

    worker.onerror = (error) => {
      console.error('Aggregation worker error:', error)
      setIsProcessing(false)
      onErrorRef.current?.(error.message)
    }

    workerRef.current = worker
    setIsReady(true)

    // Cleanup on unmount
    return () => {
      worker.terminate()
      workerRef.current = null
      setIsReady(false)
    }
  }, [enabled])

  // Function to set the valid data version (results with older versions are ignored)
  const setValidDataVersion = useCallback((version: number) => {
    validDataVersionRef.current = version
    setIsProcessing(false)
  }, [])

  // Function to trigger aggregation
  const aggregate = useCallback(
    (
      rawData: (StrengthRowGet[] | null)[],
      intervals: string[],
      tickers: string[],
      dataVersion: number
    ): void => {
      if (!workerRef.current || !isReady) {
        console.warn('Worker not ready, skipping aggregation')
        return
      }

      // Update valid version to this version
      validDataVersionRef.current = dataVersion

      // Increment request ID for internal tracking
      requestIdRef.current += 1
      const requestId = requestIdRef.current

      setIsProcessing(true)

      // Serialize data and send to worker
      const serializedData = serializeRawData(rawData)

      const request: AggregationWorkerRequest = {
        type: 'aggregate',
        requestId,
        dataVersion,
        payload: {
          rawData: serializedData,
          intervals,
          tickers,
          strengthIntervals: [...strengthIntervalsAll],
        },
      }

      workerRef.current.postMessage(request)
    },
    [isReady]
  )

  return {
    aggregate,
    isProcessing,
    lastProcessingTimeMs,
    isReady,
    setValidDataVersion,
  }
}
