import { useCallback, useEffect, useState } from 'react'
import type { BacktestRequest, BacktestResponse } from '../types/backtesting'
import type { SeriesDataResponse } from '../types/series'
import {
  getBacktest as apiGet,
  getBacktestSeries as apiGetSeries,
  listBacktests as apiList,
  runBacktest as apiRun,
} from '../api/backtests'

export function useListBacktests(limit = 50) {
  const [items, setItems] = useState<BacktestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const result = await apiList({ limit })
      const sorted = [...result].sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
        return bDate - aDate
      })
      setItems(sorted)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load backtests')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  return { items, loading, error, refresh: load, setItems }
}

export function useRunBacktest() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (req: BacktestRequest) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiRun(req)
      return result
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not run backtest'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const result = await apiGet(id)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, get, loading, error }
}

export function useBacktestSeries(backtestId: string | null | undefined) {
  const [data, setData] = useState<SeriesDataResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedData = backtestId ? data : null
  const resolvedLoading = backtestId ? loading : false
  const resolvedError = backtestId ? error : null

  useEffect(() => {
    if (!backtestId) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiGetSeries(backtestId)
        if (!cancelled) {
          setData(result)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setData(null)
          setError(err instanceof Error ? err.message : 'Could not load backtest series')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [backtestId])

  return { data: resolvedData, loading: resolvedLoading, error: resolvedError }
}
