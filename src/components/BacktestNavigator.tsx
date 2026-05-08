import type { BacktestResponse } from '../types/backtesting'
import { formatDateTime, formatPct } from '../utils/format'

type BacktestNavigatorProps = {
  items: BacktestResponse[]
  selectedIndex: number
  onSelect: (index: number) => void
  onPrev: () => void
  onNext: () => void
}

export function BacktestNavigator({
  items,
  selectedIndex,
  onSelect,
  onPrev,
  onNext,
}: BacktestNavigatorProps) {
  const selected = items[selectedIndex]

  return (
    <aside className="panel navigator-panel">
      <div className="section-title-row compact">
        <h2>Backtests</h2>
        <div className="inline-actions">
          <button onClick={onPrev} disabled={selectedIndex <= 0} className="btn-ghost">
            Prev
          </button>
          <button
            onClick={onNext}
            disabled={selectedIndex >= items.length - 1}
            className="btn-ghost"
          >
            Next
          </button>
        </div>
      </div>

      {selected ? (
        <div className="selected-glance">
          <strong>{selected.symbol} · {selected.interval}</strong>
          <span>{formatDateTime(selected.created_at)}</span>
          <span className={selected.total_return_pct >= 0 ? 'text-pos' : 'text-neg'}>
            {formatPct(selected.total_return_pct)}
          </span>
        </div>
      ) : (
        <p className="muted">No backtests found.</p>
      )}

      <div className="backtest-list">
        {items.map((item, index) => {
          const isActive = index === selectedIndex
          return (
            <button
              key={item.id}
              className={`backtest-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <div>
                <strong>{item.symbol}</strong>
                <span>{item.interval}</span>
              </div>
              <div>
                <span>{formatDateTime(item.created_at)}</span>
                <span className={item.total_return_pct >= 0 ? 'text-pos' : 'text-neg'}>
                  {formatPct(item.total_return_pct)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
