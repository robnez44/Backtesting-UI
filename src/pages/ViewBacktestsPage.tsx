import { useMemo, useState } from 'react'
import { useListBacktests } from '../hooks/useBacktests'
import { AlertsChat } from '../components/AlertsChat'
import { BacktestCard } from '../components/BacktestCard'
import { BacktestNavigator } from '../components/BacktestNavigator'
import { SignalsDebugTable } from '../components/SignalsDebugTable'
import { TradesTable } from '../components/TradesTable'

export function ViewBacktestsPage() {
  const { items, loading: isLoading, error } = useListBacktests(50)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selected = useMemo(
    () => (items.length ? items[Math.max(0, Math.min(selectedIndex, items.length - 1))] : null),
    [items, selectedIndex],
  )

  const onPrev = () => setSelectedIndex((prev) => Math.max(0, prev - 1))
  const onNext = () => setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1))

  if (isLoading) return <p className="status-line">Loading backtests...</p>
  if (error) return <p className="status-line error-text">{error}</p>

  return (
    <div className="view-grid three-col">
      <BacktestNavigator
        items={items}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onPrev={onPrev}
        onNext={onNext}
      />

      <div className="stack">
        {selected ? <BacktestCard backtest={selected} /> : <p className="status-line">No backtests found.</p>}
        {selected ? <TradesTable trades={selected.trades} /> : null}
        {selected?.signals_timeline?.length ? (
          <SignalsDebugTable rows={selected.signals_timeline} />
        ) : null}
      </div>

      <div>
        <AlertsChat alerts={selected?.alerts_feed ?? []} />
      </div>
    </div>
  )
}
