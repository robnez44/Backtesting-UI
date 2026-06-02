import { useState } from 'react'
import { BacktestCard } from '../components/BacktestCard'
import { BacktestChart } from '../components/BacktestChart'
import { BacktestForm } from '../components/BacktestForm'
import { TradesTable } from '../components/TradesTable'
import { AlertsChat } from '../components/AlertsChat'
import { SignalsDebugTable } from '../components/SignalsDebugTable'
import type { BacktestResponse } from '../types/backtesting'
import type { StrategyRecordResponse } from '../types/strategies'
import { StrategiesPanel } from '../components/StrategiesPanel'
import { SaveStrategyPrompt } from '../components/SaveStrategyPrompt'

export function RunBacktestPage() {
  const [result, setResult] = useState<BacktestResponse | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyRecordResponse | null>(null)
  const [savePromptVisible, setSavePromptVisible] = useState(false)
  const [strategiesReloadToken, setStrategiesReloadToken] = useState(0)

  const handleCreated = (backtest: BacktestResponse) => {
    setResult(backtest)
    setSavePromptVisible(true)
  }

  const handleApplyStrategy = (strategy: StrategyRecordResponse) => {
    setSelectedStrategy(strategy)
  }

  const handleClearPreset = () => {
    setSelectedStrategy(null)
  }

  const handleStrategySaved = () => {
    setSavePromptVisible(false)
    setStrategiesReloadToken((current) => current + 1)
  }

  const handleStrategyDismissed = () => {
    setSavePromptVisible(false)
  }

  return (
    <div className="view-grid">
      {/* Columna izquierda — stack normal con scroll de página */}
      <div className="stack">
        <BacktestForm
          key={selectedStrategy?.id ?? 'default'}
          onCreated={handleCreated}
          presetStrategy={selectedStrategy}
          onClearPreset={handleClearPreset}
        />
        {result ? <BacktestCard backtest={result} /> : null}
        {result ? <TradesTable trades={result.trades} /> : null}
        {result ? <BacktestChart backtest={result} /> : null}
        {result?.signals_timeline?.length ? (
          <SignalsDebugTable rows={result.signals_timeline} />
        ) : null}
      </div>

      {/* Columna derecha — contenedor sticky con scroll propio */}
      <div className="stack">
        <StrategiesPanel
          onApplyStrategy={handleApplyStrategy}
          reloadToken={strategiesReloadToken}
        />
        <AlertsChat alerts={result?.alerts_feed ?? []} />
        {result && savePromptVisible ? (
          <SaveStrategyPrompt
            key={result.id}
            backtest={result}
            onSaved={handleStrategySaved}
            onDismiss={handleStrategyDismissed}
          />
        ) : null}
      </div>
    </div>
  )
}