import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import type { BacktestRequest, BacktestResponse } from '../types/backtesting';

const config: CreateAxiosDefaults = {
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

const api: AxiosInstance = axios.create(config)

export const runBacktest = (req: BacktestRequest): Promise<BacktestResponse> =>
  api.post<BacktestResponse>('/api/backtests/run', req).then(r => r.data)

export const listBacktests = (params?: {
  symbol?: string
  interval?: string
  limit?: number
}): Promise<BacktestResponse[]> =>
  api.get<BacktestResponse[]>('/api/backtests', { params }).then(r => r.data)

export const getBacktest = (id: string): Promise<BacktestResponse> =>
  api.get<BacktestResponse>(`/api/backtests/${id}`).then(r => r.data)

export default api;