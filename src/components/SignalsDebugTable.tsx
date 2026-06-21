import type { BacktestSignalTimelineRowResponse } from '../types/backtesting'
import { formatDateTime } from '../utils/format'

type SignalsDebugTableProps = {
  rows: BacktestSignalTimelineRowResponse[]
}

export function SignalsDebugTable({ rows }: SignalsDebugTableProps) {
  const showAdx = rows.some((row) => row.adx !== undefined && row.adx !== null)

  return (
    <section className="panel">
      <div className="section-title-row compact">
        <h2>Signals debug table</h2>
        <span className="muted">{rows.length} rows</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Idx</th>
              <th>Date</th>
              <th>Close</th>
              <th>EMA10</th>
              <th>EMA55</th>
              <th>Gap%</th>
              <th>Slope%</th>
              {showAdx ? <th>ADX</th> : null}
              {showAdx ? <th>+DI</th> : null}
              {showAdx ? <th>-DI</th> : null}
              <th>P{'>'}EMA10</th>
              <th>E10{'>'}E55</th>
              <th>Gap{'>'}=min</th>
              <th>Slope{'>'}=min</th>
              {showAdx ? <th>ADX{'>'}23</th> : null}
              {showAdx ? <th>+DI{'>'}-DI</th> : null}
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.timestamp}-${row.index}`}>
                <td>{row.index}</td>
                <td>{formatDateTime(row.timestamp)}</td>
                <td>{row.close_price.toFixed(2)}</td>
                <td>{row.ema10.toFixed(2)}</td>
                <td>{row.ema55.toFixed(2)}</td>
                <td>{row.gap_pct.toFixed(4)}</td>
                <td>{row.slope_pct.toFixed(4)}</td>
                {showAdx ? (
                  <>
                    <td>{row.adx?.toFixed(2) ?? '-'}</td>
                    <td>{row.plus_di?.toFixed(2) ?? '-'}</td>
                    <td>{row.minus_di?.toFixed(2) ?? '-'}</td>
                  </>
                ) : null}

                <td className="signal-td">
                  {row.cond_price_gt_ema10 ? (
                    <span className="icon-yes">✓</span>
                  ) : (
                    <span className="icon-no">✕</span>
                  )}
                </td>

                <td className="signal-td">
                  {row.cond_ema10_gt_ema55 ? (
                    <span className="icon-yes">✓</span>
                  ) : (
                    <span className="icon-no">✕</span>
                  )}
                </td>
                <td className="signal-td">
                  {row.cond_gap_ge_min ? (
                    <span className="icon-yes">✓</span>
                  ) : (
                    <span className="icon-no">✕</span>
                  )}
                </td>
                <td className="signal-td">
                  {row.cond_slope_ge_min ? (
                    <span className="icon-yes">✓</span>
                  ) : (
                    <span className="icon-no">✕</span>
                  )}
                </td>

                {showAdx ? (
                  <>
                    <td className="signal-td">
                      {row.adx !== undefined && row.adx !== null && row.adx > 23 ? (
                        <span className="icon-yes">✓</span>
                      ) : (
                        <span className="icon-no">✕</span>
                      )}
                    </td>
                    <td className="signal-td">
                      {row.plus_di != null && row.minus_di != null && row.plus_di > row.minus_di ? (
                        <span className="icon-yes">✓</span>
                      ) : (
                        <span className="icon-no">✕</span>
                      )}
                    </td>
                  </>
                ) : null}
                <td>{row.event ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
