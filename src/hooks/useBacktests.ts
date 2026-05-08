import { useCallback, useEffect, useState } from 'react'
import type { BacktestRequest, BacktestResponse } from '../types/backtesting'
import { listBacktests as apiList, getBacktest as apiGet, runBacktest as apiRun } from '../api/backtests'

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
