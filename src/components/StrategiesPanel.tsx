import { useMemo, useState } from 'react'
import { deleteStrategy as apiDeleteStrategy } from '../api/strategies'
import { useStrategies } from '../hooks/useStrategies'
import type { StrategyRecordResponse } from '../types/strategies'
import { formatDateTime } from '../utils/format'

type StrategiesPanelProps = {
  onApplyStrategy: (strategy: StrategyRecordResponse) => void
  reloadToken?: number
}

export function StrategiesPanel({ onApplyStrategy, reloadToken = 0 }: StrategiesPanelProps) {
  const [symbol, setSymbol] = useState('')
  const [interval, setInterval] = useState('')
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { items, loading, error, refresh } = useStrategies(reloadToken)

  const filteredItems = useMemo(() => {
    const symbolQuery = symbol.trim().toLowerCase()
    const intervalQuery = interval.trim().toLowerCase()

    return items.filter((strategy) => {
      const symbolValue = (strategy.symbol ?? '').toLowerCase()
      const intervalValue = (strategy.interval ?? '').toLowerCase()

      const symbolMatches = symbolQuery ? symbolValue.includes(symbolQuery) : true
      const intervalMatches = intervalQuery ? intervalValue.includes(intervalQuery) : true

      return symbolMatches && intervalMatches
    })
  }, [interval, items, symbol])

  const handleDelete = async (strategyId: string) => {
    const confirmed = window.confirm('Delete this strategy?')
    if (!confirmed) {
      return
    }

    try {
      setDeletingId(strategyId)
      await apiDeleteStrategy(strategyId)
      if (expandedStrategyId === strategyId) {
        setExpandedStrategyId(null)
      }
      await refresh()
    } catch (deleteError: unknown) {
      window.alert(deleteError instanceof Error ? deleteError.message : 'Could not delete strategy')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="panel strategies-panel">
      <div className="section-title-row compact">
        <h2>Strategies</h2>
        <button type="button" className="btn-ghost" onClick={() => void refresh()}>
          Refresh
        </button>
      </div>

      <div className="grid-two strategies-filters">
        <label>
          Symbol
          <input
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            placeholder="BTCUSDT"
          />
        </label>

        <label>
          Interval
          <input
            value={interval}
            onChange={(event) => setInterval(event.target.value)}
            placeholder="4h"
          />
        </label>
      </div>

      <p className="muted strategies-hint">
        Search by substring on symbol or interval, then load one into the run form.
      </p>

      {loading ? <p className="muted">Loading strategies...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="strategy-list">
        {filteredItems.length === 0 && !loading ? <p className="muted">No strategies found.</p> : null}

        {filteredItems.map((strategy) => {
          const config = strategy.config
          const isExpanded = expandedStrategyId === strategy.id
          return (
            <article
              key={strategy.id}
              className="strategy-item"
              onClick={() => onApplyStrategy(strategy)}
            >
              <div className="strategy-item-head">
                <div className="strategy-item-title-group">
                  <strong>{strategy.name ?? 'Unnamed strategy'}</strong>
                  <span>{formatDateTime(strategy.created_at)}</span>
                </div>

                <div className="strategy-item-actions">
                  <button
                    type="button"
                    className="strategy-icon-btn"
                    title="Delete strategy"
                    aria-label="Delete strategy"
                    disabled={deletingId === strategy.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleDelete(strategy.id)
                    }}
                  >
                    ×
                  </button>

                </div>
              </div>

              <div className="strategy-item-meta">
                <span>{strategy.symbol ?? 'Any symbol'}</span>
                <span>{strategy.interval ?? 'Any interval'}</span>
              </div>

              <div className="strategy-item-config">
                <span>EMA Gap: {config.ema_gap_min_pct}%</span>
                <span>EMA Slope: {config.min_slope_pct}%</span>
                <span>ADX: {config.adx_min}</span>
              </div>

              <div className="strategy-item-footer">
                <button
                  type="button"
                  className="strategy-expand-btn"
                  title={isExpanded ? 'Hide details' : 'Show more'}
                  aria-label={isExpanded ? 'Hide details' : 'Show more'}
                  onClick={(event) => {
                    event.stopPropagation()
                    setExpandedStrategyId(isExpanded ? null : strategy.id)
                  }}
                >
                  <span className={`strategy-chevron ${isExpanded ? 'open' : ''}`}>⌄</span>
                </button>
              </div>

              {isExpanded ? (
                <div className="strategy-item-details">
                  <div className="strategy-detail-grid">
                    <span>Initial capital: {config.initial_capital}</span>
                    <span>Leverage: {config.leverage}x</span>
                    <span>Stop loss: {config.stop_loss_pct ?? 'off'}</span>
                    <span>Take profit: {config.take_profit_pct ?? 'off'}</span>
                    <span>Breakeven trigger: {config.breakeven_trigger_pct ?? 'off'}</span>
                    <span>Exit slope periods: {config.exit_slope_periods}</span>
                    <span>Require +DI &gt; -DI: {config.adx_require_di ? 'yes' : 'no'}</span>
                    <span>ATR period: {config.atr_period}</span>
                    <span>ATR stop mult: {config.atr_stop_mult ?? 'off'}</span>
                    <span>ATR trailing mult: {config.atr_trailing_mult ?? 'off'}</span>
                    <span>ATR stop confirm close: {config.atr_stop_confirm_on_close ? 'yes' : 'no'}</span>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}