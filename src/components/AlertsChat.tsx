import type { BacktestAlertResponse } from '../types/backtesting'
import { formatDateTime } from '../utils/format'

type AlertsChatProps = {
  alerts: BacktestAlertResponse[]
}

export function AlertsChat({ alerts }: AlertsChatProps) {
  return (
    <section className="panel alerts-panel">
      <div className="section-title-row compact">
        <h2>Bot alerts</h2>
        <span className="muted">Total: {alerts.length}</span>
      </div>

      <div className="chat-list">
        {alerts.length === 0 ? <p className="muted">No alerts</p> : null}
        {alerts.map((alert) => {
          const isPositive = alert.action.includes('entry')
          const cls = isPositive ? 'chat-bubble in' : 'chat-bubble out'

          return (
            <article className={cls} key={`${alert.timestamp}-${alert.index}`}>
              <header>
                <strong>{alert.event_type}</strong>
                <span>{formatDateTime(alert.timestamp)}</span>
              </header>
              <p>{alert.message}</p>
              <footer>
                <span>Price: {alert.price}</span>
                {alert.trade_number ? <span>Trade #{alert.trade_number}</span> : null}
                {alert.exit_reason_label ? <span>{alert.exit_reason_label}</span> : null}
              </footer>
            </article>
          )
        })}
      </div>
    </section>
  )
}
