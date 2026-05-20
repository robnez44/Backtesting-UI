import { useState } from 'react'
import { BacktestCard } from '../components/BacktestCard'
import { BacktestChart } from '../components/BacktestChart'
import { BacktestForm } from '../components/BacktestForm'
import { TradesTable } from '../components/TradesTable'
import { AlertsChat } from '../components/AlertsChat'
import { SignalsDebugTable } from '../components/SignalsDebugTable'
import type { BacktestResponse } from '../types/backtesting'

export function RunBacktestPage() {
  const [result, setResult] = useState<BacktestResponse | null>(null)

  return (
    <div className="view-grid">
      <div className="stack">
        <BacktestForm onCreated={setResult} />
        {result ? <BacktestCard backtest={result} /> : null}
        {result ? <TradesTable trades={result.trades} /> : null}
        {result ? <BacktestChart backtest={result} /> : null}
        {result?.signals_timeline?.length ? (
          <SignalsDebugTable rows={result.signals_timeline} />
        ) : null}
      </div>

      <div>
        <AlertsChat alerts={result?.alerts_feed ?? []} />
      </div>
    </div>
  )
}
