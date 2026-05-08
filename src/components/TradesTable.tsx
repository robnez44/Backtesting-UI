import type { TradeResponse } from '../types/backtesting'
import { formatDateTime, formatMoney, formatPct } from '../utils/format'

type TradesTableProps = {
  trades: TradeResponse[]
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <section className="panel">
      <div className="section-title-row compact">
        <h2>Trades</h2>
        <span className="muted">{trades.length} rows</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Entry</th>
              <th>Exit</th>
              <th>Side</th>
              <th>Entry Px</th>
              <th>Exit Px</th>
              <th>PnL</th>
              <th>Return %</th>
              <th>Candles</th>
              <th>Exit reason</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={`${trade.entry_time}-${index}`}>
                <td>{formatDateTime(trade.entry_time)}</td>
                <td>{formatDateTime(trade.exit_time)}</td>
                <td>{trade.side}</td>
                <td>{formatMoney(trade.entry_price)}</td>
                <td>{formatMoney(trade.exit_price)}</td>
                <td className={trade.pnl >= 0 ? 'text-pos' : 'text-neg'}>
                  {formatMoney(trade.pnl)}
                </td>
                <td className={trade.return_pct >= 0 ? 'text-pos' : 'text-neg'}>
                  {formatPct(trade.return_pct)}
                </td>
                <td>{trade.candles_held}</td>
                <td>{trade.exit_reason_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
