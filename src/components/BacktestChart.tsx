import { useEffect, useMemo, useRef } from 'react'
import {
  CandlestickSeries,
  LineSeries,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type LineData,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useBacktestSeries } from '../hooks/useBacktests'
import type { BacktestResponse } from '../types/backtesting'
import { buildBacktestChartData, buildTradeMarkers } from '../utils/seriesChart'

type BacktestChartProps = {
  backtest: BacktestResponse | null
}

type BacktestDebugWindow = Window & {
  __BACKTEST_DEBUG__?: boolean | string
}

const CANDLE_BULL = '#2ed6a1'
const CANDLE_BEAR = '#ff6f6f'
const TEXT_COLOR = '#d9e5eb'
const GRID_COLOR = 'rgba(159, 179, 189, 0.12)'
const INITIAL_VISIBLE_BARS = 120

function createChartOptions(timeScaleVisible: boolean) {
  return {
    layout: {
      background: { color: 'transparent' },
      textColor: TEXT_COLOR,
      fontFamily: 'Ubuntu, sans-serif',
    },
    grid: {
      vertLines: { color: GRID_COLOR },
      horzLines: { color: GRID_COLOR },
    },
    crosshair: {
      mode: 1,
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: timeScaleVisible,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      timeVisible: true,
      secondsVisible: false,
      barSpacing: 2,
      minBarSpacing: 1,
      rightOffset: 0,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  }
}

function createPane(container: HTMLDivElement, height: number, timeScaleVisible: boolean) {
  return createChart(container, {
    width: container.clientWidth,
    height,
    autoSize: false,
    ...createChartOptions(timeScaleVisible),
  })
}

export function BacktestChart({ backtest }: BacktestChartProps) {
  const { data, loading, error } = useBacktestSeries(backtest?.id)
  const priceChartRef = useRef<HTMLDivElement | null>(null)
  const adxChartRef = useRef<HTMLDivElement | null>(null)
  const syncLockRef = useRef(false)

  const normalized = useMemo(() => (data ? buildBacktestChartData(data) : null), [data])
  const showAdxPane = Boolean(normalized?.adxData.length)
  const hasTradeMarkers = Boolean(backtest?.trade_markers?.length)
  const chartTitle = backtest ? `${backtest.symbol} · ${backtest.interval}` : 'Backtest chart'

  useEffect(() => {
    // Diagnostic logs: print raw payload vs normalized series when debugging
    if (!data) return
    const win = window as BacktestDebugWindow
    if (win.__BACKTEST_DEBUG__) {
      try {
        console.groupCollapsed('Backtest series diagnostics')
        console.log('raw.candles.count', data.candles?.length ?? 0)
        console.log('raw.candles.last', data.candles?.slice(-1)[0]?.open_time)
        console.log('raw.adx.count', data.adx_points?.length ?? 0)
        console.log('raw.adx.last', data.adx_points?.slice(-1)[0]?.timestamp)
        console.log('raw.ema.keys', Object.keys(data.ema_points ?? {}))
        if (normalized) {
          console.log('normalized.candles.count', normalized.candles.length)
          console.log('normalized.candles.last', new Date((normalized.candles.slice(-1)[0]?.time ?? 0) * 1000).toISOString())
          console.log('normalized.adx.count', normalized.adxData.length)
          console.log('normalized.adx.last', new Date((normalized.adxData.slice(-1)[0]?.time ?? 0) * 1000).toISOString())
        }
        console.groupEnd()
      } catch {
        // no-op
      }
    }
  }, [data, normalized])

  useEffect(() => {
    if (!priceChartRef.current || !normalized || !backtest) {
      return
    }

    const priceContainer = priceChartRef.current
    const priceHeight = showAdxPane ? 380 : 520
    const priceChart = createPane(priceContainer, priceHeight, !showAdxPane)

    const candleSeries = priceChart.addSeries(CandlestickSeries, {
      upColor: CANDLE_BULL,
      downColor: CANDLE_BEAR,
      borderVisible: false,
      wickUpColor: CANDLE_BULL,
      wickDownColor: CANDLE_BEAR,
    })

    candleSeries.setData(normalized.candles)
    const tradeMarkers = createSeriesMarkers(candleSeries, buildTradeMarkers(backtest), {
      zOrder: 'top',
    })

    normalized.emaSeries.forEach(({ data: emaData, color, span }) => {
      const emaSeries = priceChart.addSeries(LineSeries, {
        color,
        lineWidth: span === 10 ? 3 : 2,
        priceLineVisible: false,
      })
      emaSeries.setData(emaData)
    })

    const visibleFrom = Math.max(0, normalized.candles.length - INITIAL_VISIBLE_BARS)
    priceChart.timeScale().setVisibleLogicalRange({
      from: visibleFrom,
      to: normalized.candles.length - 1,
    })

    const priceResizeObserver = new ResizeObserver(() => {
      priceChart.resize(priceContainer.clientWidth, priceHeight)
    })
    priceResizeObserver.observe(priceContainer)

    const bindVisibleRangeSync = (source: IChartApi, target: IChartApi | null) => {
      source.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range || !target || syncLockRef.current) {
          return
        }

        syncLockRef.current = true
        target.timeScale().setVisibleLogicalRange(range)
        syncLockRef.current = false
      })
    }

    let adxChart: IChartApi | null = null
    let adxResizeObserver: ResizeObserver | null = null

    if (showAdxPane && adxChartRef.current) {
      const adxContainer = adxChartRef.current
      adxChart = createPane(adxContainer, 180, true)

      const adxSeries = adxChart.addSeries(LineSeries, {
        color: '#9a5cff',
        lineWidth: 2,
        priceLineVisible: false,
      })
      const plusDiSeries = adxChart.addSeries(LineSeries, {
        color: '#76d26a',
        lineWidth: 1,
        priceLineVisible: false,
      })
      const minusDiSeries = adxChart.addSeries(LineSeries, {
        color: '#ff6f6f',
        lineWidth: 1,
        priceLineVisible: false,
      })

      adxSeries.setData(normalized.adxData)
      plusDiSeries.setData(normalized.plusDiData)
      minusDiSeries.setData(normalized.minusDiData)

      if (backtest.config?.adx_min != null && backtest.config.adx_min > 0 && normalized.thresholdData.length) {
        const thresholdSeries = adxChart.addSeries(LineSeries, {
          color: 'rgba(249, 174, 61, 0.8)',
          lineWidth: 1,
          priceLineVisible: false,
        })
        thresholdSeries.setData(
          normalized.thresholdData.map<LineData<UTCTimestamp>>((point) => ({
            time: point.time,
            value: backtest.config?.adx_min ?? point.value,
          })),
        )
      }

      adxChart.timeScale().setVisibleLogicalRange({
        from: visibleFrom,
        to: normalized.candles.length - 1,
      })
      bindVisibleRangeSync(priceChart, adxChart)
      bindVisibleRangeSync(adxChart, priceChart)
      adxResizeObserver = new ResizeObserver(() => {
        adxChart?.resize(adxContainer.clientWidth, 180)
      })
      adxResizeObserver.observe(adxContainer)
    }

    return () => {
      priceResizeObserver.disconnect()
      if (tradeMarkers) {
        tradeMarkers.detach()
      }
      priceChart.remove()
      adxResizeObserver?.disconnect()
      adxChart?.remove()
    }
  }, [backtest, normalized, showAdxPane])

  if (!backtest) {
    return null
  }

  return (
    <section className="panel backtest-chart-panel">
      <div className="section-title-row compact">
        <div>
          <h2>Price and indicator chart</h2>
          <p className="muted">{chartTitle}</p>
        </div>
        <div className="chart-legend-inline">
          <span className="chip chart-chip">Candles</span>
          <span className="chip chart-chip chart-chip-ema10">EMA 10</span>
          <span className="chip chart-chip chart-chip-ema55">EMA 55</span>
          {showAdxPane ? <span className="chip chart-chip chart-chip-adx">ADX / DI</span> : null}
        </div>
      </div>

      {loading ? <p className="status-line">Loading chart data...</p> : null}
      {error ? <p className="status-line error-text">{error}</p> : null}
      {!loading && backtest && !hasTradeMarkers ? (
        <p className="chart-warning-banner" role="status">
          Este backtest no trae <strong>trade_markers</strong>. Es probable que sea un resultado viejo y por eso no se
          puedan pintar los markers en la vela correcta.
        </p>
      ) : null}

      {normalized?.candles.length ? (
        <div className="chart-stack">
          <div className="chart-pane chart-pane-price" ref={priceChartRef} />
          {showAdxPane ? <div className="chart-pane chart-pane-adx" ref={adxChartRef} /> : null}
        </div>
      ) : loading ? null : (
        <p className="status-line">No chart series available for this backtest.</p>
      )}
    </section>
  )
}