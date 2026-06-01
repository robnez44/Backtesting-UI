import { useCallback, useEffect, useState } from 'react'
import { listStrategies as apiListStrategies } from '../api/strategies'
import type { StrategyRecordResponse } from '../types/strategies'

export function useStrategies(reloadToken = 0, limit = 50) {
  const [items, setItems] = useState<StrategyRecordResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const result = await apiListStrategies({ limit })
      const sorted = [...result].sort((a, b) => {
        const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
        const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
        return bDate - aDate
      })
      setItems(sorted)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load strategies')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [load, reloadToken])

  return { items, loading, error, refresh: load, setItems }
}