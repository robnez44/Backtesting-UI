import type { BacktestResponse } from '../types/backtesting'
import { boolText, formatDateTime, formatMoney, formatPct } from '../utils/format'

type BacktestCardProps = {
  backtest: BacktestResponse
}

export function BacktestCard({ backtest }: BacktestCardProps) {
  const config = backtest.config

  const entrySignals = (backtest.alerts_feed ?? []).filter(
    (item) => item.event_type === 'entry_signal',
  ).length
  const entryExec = (backtest.alerts_feed ?? []).filter(
    (item) => item.event_type === 'entry_exec',
  ).length
  const exitAlerts = (backtest.alerts_feed ?? []).filter((item) =>
    item.event_type.includes('exit'),
  ).length

  const candlesLoaded = backtest.loaded_candles_count ?? backtest.signals_timeline?.length ?? 0
  const activeFilters = [
    config?.adx_min && config.adx_min > 0 ? 'ADX' : null,
    config?.adx_require_di ? '+DI > -DI' : null,
    config?.adx_require_rising ? 'ADX rising' : null,
    config?.ema_gap_min_pct && config.ema_gap_min_pct > 0 ? 'EMA gap min' : null,
  ].filter(Boolean) as string[]

  return (
    <section className="panel">
      <div className="section-title-row">
        <h2>
          Backtest Result · {backtest.symbol} · {backtest.interval}
        </h2>
      </div>

      <div className="chips-row">
        <span className="chip">Candles loaded: {candlesLoaded}</span>
        <span className="chip">Entry base EMA: {entrySignals}</span>
        <span className="chip">Entries executed: {entryExec}</span>
        <span className="chip">Exit alerts: {exitAlerts}</span>
        <span className="chip">
          Active filters: {activeFilters.length ? activeFilters.join(', ') : 'none'}
        </span>
      </div>

      <div className="metrics-grid">
        <article>
          <h3>Performance</h3>
          <ul>
            <li>Initial capital: {formatMoney(backtest.initial_capital)}</li>
            <li>Final capital: {formatMoney(backtest.final_capital)}</li>
            <li className={backtest.total_return_pct >= 0 ? 'text-pos' : 'text-neg'}>
              Total return: {formatPct(backtest.total_return_pct)}
            </li>
            <li>Max drawdown: {backtest.max_drawdown_pct.toFixed(2)}%</li>
          </ul>
        </article>

        <article>
          <h3>Trades summary</h3>
          <ul>
            <li>Total trades: {backtest.total_trades}</li>
            <li>Win/Loss: {backtest.winning_trades} / {backtest.losing_trades}</li>
            <li>Win rate: {backtest.win_rate_pct.toFixed(2)}%</li>
            <li>Profit factor: {backtest.profit_factor.toFixed(2)}</li>
            <li>Avg return: {formatPct(backtest.avg_trade_return_pct)}</li>
          </ul>
        </article>

        <article>
          <h3>Backtest metadata</h3>
          <ul>
            <li>ID: {backtest.id}</li>
            <li>Strategy: {backtest.strategy_name}</li>
            <li>Start: {formatDateTime(backtest.start_time)}</li>
            <li>End: {formatDateTime(backtest.end_time)}</li>
            <li>Created: {formatDateTime(backtest.created_at)}</li>
          </ul>
        </article>
      </div>

      {config ? (
        <details open>
          <summary>Config and params</summary>
          <div className="config-grid">
            <span>Leverage: {config.leverage}x</span>
            <span>Stop loss manual: {config.stop_loss_pct ?? 'off'}</span>
            <span>Take profit manual: {config.take_profit_pct ?? 'off'}</span>
            <span>Breakeven trigger: {config.breakeven_trigger_pct ?? 'off'}</span>
            <span>Min slope %: {config.min_slope_pct}</span>
            <span>Exit slope periods: {config.exit_slope_periods}</span>
            <span>EMA gap min %: {config.ema_gap_min_pct}</span>
            <span>ADX min: {config.adx_min}</span>
            <span>Require +DI {'>'} -DI: {boolText(config.adx_require_di)}</span>
            <span>Require ADX rising: {boolText(config.adx_require_rising)}</span>
            <span>ATR period: {config.atr_period}</span>
            <span>ATR stop mult: {config.atr_stop_mult ?? 'off'}</span>
            <span>ATR trailing mult: {config.atr_trailing_mult ?? 'off'}</span>
            <span>
              ATR stop confirm close: {boolText(config.atr_stop_confirm_on_close)}
            </span>
          </div>
        </details>
      ) : null}
    </section>
  )
}
