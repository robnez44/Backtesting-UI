export interface CandleResponse {
  symbol: string,
  interval: string,
  open_time: string,
  open_price: number,
  high_price: number,
  low_price: number,
  close_price: number,
  volume: number,
  close_time: string,
  quote_asset_volume: number,
  number_of_trades: number,
  taker_buy_base_asset_volume: number,
  taker_buy_quote_asset_volume: number,
}

export interface EMASnapshotResponse {
  symbol: string,
  interval: string,
  timestamp: string,
  span: number,
  price: number,
  ema_value: number,
  abs_slope: number,
  pct_slope: number,
  distance: number,
  distance_pct: number,
}

export interface ADXSnapshotResponse {
  symbol: string,
  interval: string,
  timestamp: string,
  plus_di: number,
  minus_di: number,
  dx: number,
  adx: number,
}

export interface SMISnapshotResponse {
  symbol: string,
  interval: string,
  timestamp: string,
  smi: number,
}

export interface SRLevelResponse {
  symbol: string,
  interval: string,
  idx: number,
  timestamp: string,
  price: number,
  level_type: string,
  touches?: number | null,
}

export interface SegmentMetricsResponse {
  symbol: string,
  interval: string,
  start_idx: number,
  end_idx: number,
  length: number,
  a: number,
  b: number,
  r2: number,
  pct_slope: number,
  mean_price: number,
  regime: string,
  start_time: string,
  end_time: string,
  start_price: number,
  end_price: number,
}

export interface SeriesDataResponse {
  symbol: string,
  interval: string,
  start_time: string,
  end_time: string,
  start_price: number,
  end_price: number,
  total_candles: number,
  trends?: SegmentMetricsResponse[] | null,
  candles?: CandleResponse[] | null,
  ema_points?: Record<string, EMASnapshotResponse[]> | null,
  adx_points?: ADXSnapshotResponse[] | null,
  smi_points?: SMISnapshotResponse[] | null,
  sr_levels?: SRLevelResponse[] | null,
}