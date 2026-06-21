import type { BacktestConfigResponse } from './backtesting'

export interface StrategyRecordResponse {
  id: string
  name?: string | null
  description?: string | null
  symbol?: string | null
  interval?: string | null
  config: BacktestConfigResponse
  created_at?: string | null
}

export interface SaveStrategyRequest {
  name?: string | null
  description?: string | null
  symbol?: string | null
  interval?: string | null
  config: BacktestConfigResponse
}

export interface StrategyFilters {
  symbol?: string
  interval?: string
  limit?: number
}