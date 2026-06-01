import axios from 'axios'
import { API_BASE } from '../config/api'
import type { SaveStrategyRequest, StrategyFilters, StrategyRecordResponse } from '../types/strategies'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const listStrategies = (params?: StrategyFilters): Promise<StrategyRecordResponse[]> =>
  api.get<StrategyRecordResponse[]>('/api/strategies', { params }).then((response) => response.data)

export const getStrategy = (id: string): Promise<StrategyRecordResponse> =>
  api.get<StrategyRecordResponse>(`/api/strategies/${id}`).then((response) => response.data)

export const saveStrategy = (payload: SaveStrategyRequest): Promise<{ id: string }> =>
  api.post<{ id: string }>('/api/strategies', payload).then((response) => response.data)

export const deleteStrategy = (id: string): Promise<{ deleted: boolean }> =>
  api.delete<{ deleted: boolean }>(`/api/strategies/${id}`).then((response) => response.data)

export default api