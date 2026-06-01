import { type FormEvent, useMemo, useState } from 'react'
import { useRunBacktest } from '../hooks/useBacktests'
import type { BacktestRequest, BacktestResponse } from '../types/backtesting'
import type { StrategyRecordResponse } from '../types/strategies'

type BacktestFormProps = {
  onCreated: (result: BacktestResponse) => void
  presetStrategy?: StrategyRecordResponse | null
  onClearPreset?: () => void
}

type FormState = {
  symbol: string
  interval: string
  start_time: string
  end_time: string
  initial_capital: string
  leverage: string
  min_slope_pct: string
  exit_slope_periods: string
  ema_gap_min_pct: string
  adx_min: string
  adx_require_di: boolean
  adx_require_rising: boolean
  atr_period: string
  atr_stop_mult: string
  atr_trailing_mult: string
}

const defaultState: FormState = {
  symbol: 'BTCUSDT',
  interval: '4h',
  start_time: '2026-03-01',
  end_time: '',
  initial_capital: '100000',
  leverage: '1',
  min_slope_pct: '0.11',
  exit_slope_periods: '2',
  ema_gap_min_pct: '0',
  adx_min: '0',
  adx_require_di: true,
  adx_require_rising: false,
  atr_period: '14',
  atr_stop_mult: '1.8',
  atr_trailing_mult: '2.2',
}

function strategyToFormPatch(strategy: StrategyRecordResponse): Partial<FormState> {
  const config = strategy.config
  return {
    symbol: strategy.symbol ?? 'BTCUSDT',
    interval: strategy.interval ?? '4h',
    initial_capital: String(config.initial_capital),
    leverage: String(config.leverage),
    min_slope_pct: String(config.min_slope_pct),
    exit_slope_periods: String(config.exit_slope_periods),
    ema_gap_min_pct: String(config.ema_gap_min_pct),
    adx_min: String(config.adx_min),
    adx_require_di: config.adx_require_di,
    adx_require_rising: config.adx_require_rising,
    atr_period: String(config.atr_period),
    atr_stop_mult: config.atr_stop_mult === null ? '' : String(config.atr_stop_mult),
    atr_trailing_mult:
      config.atr_trailing_mult === null ? '' : String(config.atr_trailing_mult),
  }
}

export function BacktestForm({ onCreated, presetStrategy, onClearPreset }: BacktestFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    presetStrategy ? { ...defaultState, ...strategyToFormPatch(presetStrategy) } : defaultState,
  )
  const [error, setError] = useState<string | null>(null)
  const { run, loading: isSubmitting } = useRunBacktest()

  const payload: BacktestRequest = useMemo(
    () => ({
      symbol: form.symbol,
      interval: form.interval,
      start_time: form.start_time,
      end_time: form.end_time || null,
      initial_capital: Number(form.initial_capital),
      leverage: Number(form.leverage),
      min_slope_pct: Number(form.min_slope_pct),
      exit_slope_periods: Number(form.exit_slope_periods),
      ema_gap_min_pct: Number(form.ema_gap_min_pct),
      adx_min: Number(form.adx_min),
      adx_require_di: form.adx_require_di,
      adx_require_rising: form.adx_require_rising,
      atr_period: Number(form.atr_period),
      atr_stop_mult: form.atr_stop_mult ? Number(form.atr_stop_mult) : null,
      atr_trailing_mult: form.atr_trailing_mult
        ? Number(form.atr_trailing_mult)
        : null,
    }),
    [form],
  )

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!payload.start_time) {
      setError('start_time is required')
      return
    }

    try {
      setError(null)
      const result = await run(payload)
      onCreated(result)
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not run backtest. Check API server.'
      setError(message)
    } finally {
      /* loading handled by hook */
    }
  }

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="section-title-row">
        <h2>Run Backtest</h2>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Running...' : 'Run'}
        </button>
      </div>

      {presetStrategy ? (
        <div className="preset-banner">
          <div>
            <strong>Loaded strategy:</strong> {presetStrategy.name ?? 'Unnamed strategy'}
          </div>
          <button type="button" className="btn-ghost" onClick={onClearPreset}>
            Clear
          </button>
        </div>
      ) : null}

      <div className="grid-two">
        <label>
          Symbol
          <input
            value={form.symbol}
            onChange={(event) => setForm({ ...form, symbol: event.target.value })}
          />
        </label>

        <label>
          Interval
          <input
            value={form.interval}
            onChange={(event) => setForm({ ...form, interval: event.target.value })}
          />
        </label>

        <label>
          Start time
          <input
            value={form.start_time}
            onChange={(event) =>
              setForm({ ...form, start_time: event.target.value })
            }
            placeholder="YYYY-MM-DD"
          />
        </label>

        <label>
          End time (optional)
          <input
            value={form.end_time}
            onChange={(event) => setForm({ ...form, end_time: event.target.value })}
            placeholder="YYYY-MM-DD"
          />
        </label>

        <label>
          Initial capital
          <input
            type="number"
            value={form.initial_capital}
            onChange={(event) =>
              setForm({ ...form, initial_capital: event.target.value })
            }
          />
        </label>

        <label>
          Leverage
          <input
            type="number"
            step="0.1"
            value={form.leverage}
            onChange={(event) =>
              setForm({ ...form, leverage: event.target.value })
            }
          />
        </label>
      </div>

      <details>
        <summary>Advanced params</summary>
        <div className="grid-three">
          <label>
            Min slope %
            <input
              type="number"
              step="0.0001"
              value={form.min_slope_pct}
              onChange={(event) =>
                setForm({ ...form, min_slope_pct: event.target.value })
              }
            />
          </label>

          <label>
            Exit slope periods
            <input
              type="number"
              value={form.exit_slope_periods}
              onChange={(event) =>
                setForm({ ...form, exit_slope_periods: event.target.value })
              }
            />
          </label>

          <label>
            EMA gap min %
            <input
              type="number"
              step="0.0001"
              value={form.ema_gap_min_pct}
              onChange={(event) =>
                setForm({ ...form, ema_gap_min_pct: event.target.value })
              }
            />
          </label>

          <label>
            ADX min
            <input
              type="number"
              step="0.01"
              value={form.adx_min}
              onChange={(event) => setForm({ ...form, adx_min: event.target.value })}
            />
          </label>

          <label>
            ATR period
            <input
              type="number"
              value={form.atr_period}
              onChange={(event) =>
                setForm({ ...form, atr_period: event.target.value })
              }
            />
          </label>

          <label>
            ATR stop mult
            <input
              type="number"
              step="0.1"
              value={form.atr_stop_mult}
              onChange={(event) =>
                setForm({ ...form, atr_stop_mult: event.target.value })
              }
            />
          </label>

          <label>
            ATR trailing mult
            <input
              type="number"
              step="0.1"
              value={form.atr_trailing_mult}
              onChange={(event) =>
                setForm({ ...form, atr_trailing_mult: event.target.value })
              }
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.adx_require_di}
              onChange={(event) =>
                setForm({ ...form, adx_require_di: event.target.checked })
              }
            />
            Require +DI {'>'} -DI
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.adx_require_rising}
              onChange={(event) =>
                setForm({ ...form, adx_require_rising: event.target.checked })
              }
            />
            Require ADX rising
          </label>
        </div>
      </details>

      {error ? <p className="error-text">{error}</p> : null}
    </form>
  )
}
