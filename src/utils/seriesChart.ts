import type { CandlestickData, SeriesMarker, UTCTimestamp } from 'lightweight-charts'
import type { BacktestResponse, TradeMarkerResponse } from '../types/backtesting'
import type { SeriesDataResponse } from '../types/series'

type ChartPoint = {
  time: UTCTimestamp
  value: number
}

type CandleTime = {
  open_time: string
  close_time: string
}

function trimChartPoints<T extends { time: UTCTimestamp }>(points: T[], cutoff: UTCTimestamp | null): T[] {
  if (cutoff == null) {
    return points
  }

  return points.filter((point) => point.time <= cutoff)
}

function getLastTimestampFromChartPoints(points: Array<{ time: UTCTimestamp }>): UTCTimestamp | null {
  if (!points.length) {
    return null
  }

  return points[points.length - 1].time
}

function buildCloseToOpenTimeMap(candles: CandleTime[]): Map<string, UTCTimestamp> {
  return new Map(
    candles.map((candle) => [
      candle.close_time,
      toUtcTimestamp(candle.open_time),
    ]),
  )
}

function alignSnapshotTime(timestamp: string, closeToOpenTime: Map<string, UTCTimestamp>): UTCTimestamp {
  return closeToOpenTime.get(timestamp) ?? toUtcTimestamp(timestamp)
}

export type BacktestChartData = {
  candles: CandlestickData<UTCTimestamp>[]
  candleMarkers: SeriesMarker<UTCTimestamp>[]
  emaSeries: Array<{
    span: number
    data: ChartPoint[]
    color: string
  }>
  adxData: ChartPoint[]
  plusDiData: ChartPoint[]
  minusDiData: ChartPoint[]
  thresholdData: ChartPoint[]
}

export function toUtcTimestamp(value: string): UTCTimestamp {
  return Math.floor(new Date(value).getTime() / 1000) as UTCTimestamp
}

export function isShortSide(side: string): boolean {
  const normalized = side.toLowerCase()
  return normalized.includes('sell') || normalized.includes('short') || normalized === 'down'
}

function isWinMarker(marker: TradeMarkerResponse): boolean | null {
  if (marker.is_win != null) {
    return marker.is_win
  }

  if (marker.pnl != null) {
    return marker.pnl >= 0
  }

  return null
}

function getEmaColor(span: number): string | null {
  if (span === 10) {
    return '#ff6fae'
  }

  if (span === 55) {
    return '#ff9b4d'
  }

  return null
}

export function buildBacktestChartData(series: SeriesDataResponse): BacktestChartData {
  const sourceCandles = series.candles ?? []
  const closeToOpenTime = buildCloseToOpenTimeMap(sourceCandles)

  const candles: CandlestickData<UTCTimestamp>[] = sourceCandles.map((candle) => ({
    time: toUtcTimestamp(candle.open_time),
    open: candle.open_price,
    high: candle.high_price,
    low: candle.low_price,
    close: candle.close_price,
  }))

  const emaEntries = Object.entries(series.ema_points ?? {})
    .map(([span, points]) => ({
      span: Number(span),
      points,
    }))
    .filter(({ span, points }) => Number.isFinite(span) && points.length > 0)
    .map(({ span, points }) => ({
      span,
      points,
      color: getEmaColor(span),
    }))
    .filter(({ color }) => color != null)
    .sort((a, b) => a.span - b.span)

  const alignedEmaEntries = emaEntries.map(({ span, points, color }) => ({
    span,
    color,
    data: points.map<ChartPoint>((point) => ({
      time: alignSnapshotTime(point.timestamp, closeToOpenTime),
      value: point.ema_value,
    })),
  }))

  const adxPoints = series.adx_points ?? []
  const alignedAdxPoints = adxPoints.map<ChartPoint>((point) => ({
    time: alignSnapshotTime(point.timestamp, closeToOpenTime),
    value: point.adx,
  }))
  const alignedPlusDiPoints = adxPoints.map<ChartPoint>((point) => ({
    time: alignSnapshotTime(point.timestamp, closeToOpenTime),
    value: point.plus_di,
  }))
  const alignedMinusDiPoints = adxPoints.map<ChartPoint>((point) => ({
    time: alignSnapshotTime(point.timestamp, closeToOpenTime),
    value: point.minus_di,
  }))
  const alignedThresholdPoints = adxPoints.map<ChartPoint>((point) => ({
    time: alignSnapshotTime(point.timestamp, closeToOpenTime),
    value: point.adx,
  }))

  const latestCommonTime = [
    getLastTimestampFromChartPoints(candles),
    ...alignedEmaEntries.map(({ data }) => getLastTimestampFromChartPoints(data)),
    getLastTimestampFromChartPoints(alignedAdxPoints),
  ]
    .filter((time): time is UTCTimestamp => time != null)
    .reduce<UTCTimestamp | null>((current, next) => {
      if (current == null) {
        return next
      }

      return next < current ? next : current
    }, null)

  const trimmedCandles = trimChartPoints(candles, latestCommonTime)

  const candleMarkers: SeriesMarker<UTCTimestamp>[] = trimmedCandles.map((candle, index) => ({
    time: candle.time,
    position: 'inBar',
    color: 'rgba(229, 237, 242, 0.34)',
    shape: 'circle',
    text: String(index),
    size: 0.6,
    id: `candle-${index}`,
  }))

  const emaSeries = alignedEmaEntries.map(({ span, data, color }) => ({
    span,
    data: trimChartPoints(data, latestCommonTime),
    color: color as string,
  }))

  const adxData = trimChartPoints(alignedAdxPoints, latestCommonTime)

  const plusDiData = trimChartPoints(alignedPlusDiPoints, latestCommonTime)

  const minusDiData = trimChartPoints(alignedMinusDiPoints, latestCommonTime)

  const thresholdData = trimChartPoints(alignedThresholdPoints, latestCommonTime)

  return {
    candles: trimmedCandles,
    candleMarkers,
    emaSeries,
    adxData,
    plusDiData,
    minusDiData,
    thresholdData,
  }
}

export function findNearestCandleTime(
  targetTime: UTCTimestamp,
  candles: CandlestickData<UTCTimestamp>[],
): UTCTimestamp | null {
  if (!candles.length) {
    return null
  }

  let nearestTime = candles[0].time
  let nearestDistance = Math.abs(Number(candles[0].time) - Number(targetTime))

  candles.forEach((candle) => {
    const distance = Math.abs(Number(candle.time) - Number(targetTime))
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestTime = candle.time
    }
  })

  return nearestTime
}

export function buildTradeMarkers(backtest: BacktestResponse) {
  if (backtest.trade_markers?.length) {
    return backtest.trade_markers.flatMap<SeriesMarker<UTCTimestamp>>((marker) => {
      const time = toUtcTimestamp(marker.bar_time)
      const isExit = marker.marker_type === 'exit_exec'
      const isWin = isWinMarker(marker)
      const entryColor = '#1565c0'
      const winExitColor = '#2e7d32'
      const lossExitColor = '#c62828'
      const markerSize = 1.25

      return [
        {
          time,
          position: isExit ? (isShortSide(marker.side) ? 'belowBar' : 'aboveBar') : (isShortSide(marker.side) ? 'aboveBar' : 'belowBar'),
          shape: isExit ? (isShortSide(marker.side) ? 'arrowUp' : 'arrowDown') : (isShortSide(marker.side) ? 'arrowDown' : 'arrowUp'),
          color: isExit ? (isWin === false ? lossExitColor : winExitColor) : entryColor,
            size: markerSize,
          id: `trade-${marker.trade_number}-${marker.marker_type}`,
        },
      ]
    })
  }

  return []
}