import { useMemo, useState } from 'react'
import { saveStrategy as apiSaveStrategy } from '../api/strategies'
import type { BacktestResponse } from '../types/backtesting'

type SaveStrategyPromptProps = {
  backtest: BacktestResponse
  onSaved: () => void
  onDismiss: () => void
}

function buildDefaultName(backtest: BacktestResponse) {
  return `${backtest.symbol} ${backtest.interval} ${backtest.strategy_name}`.trim()
}

export function SaveStrategyPrompt({ backtest, onSaved, onDismiss }: SaveStrategyPromptProps) {
  const defaultName = useMemo(() => buildDefaultName(backtest), [backtest])
  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSave = async () => {
    try {
      setLoading(true)
      setError(null)
      setMessage(null)
      await apiSaveStrategy({
        name: name.trim() || defaultName,
        description: description.trim() || null,
        symbol: backtest.symbol,
        interval: backtest.interval,
        config: backtest.config!,
      })
      setMessage('Strategy saved successfully.')
      onSaved()
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save strategy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel save-strategy-panel">
      <div className="section-title-row compact">
        <h2>Save this strategy?</h2>
        <span className="muted">This stores the current config and params.</span>
      </div>

      <div className="grid-two">
        <label>
          Strategy name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional note"
          />
        </label>
      </div>

      <div className="inline-actions save-strategy-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void onSave()}
          disabled={loading || !backtest.config}
        >
          {loading ? 'Saving...' : 'Yes, save'}
        </button>
        <button type="button" className="btn-ghost" onClick={onDismiss} disabled={loading}>
          No
        </button>
      </div>

      {!backtest.config ? <p className="error-text">No config found on the backtest result.</p> : null}
      {message ? <p className="text-pos">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  )
}