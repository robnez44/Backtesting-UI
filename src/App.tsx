import { NavLink, Route, Routes } from 'react-router-dom'
import { RunBacktestPage } from './pages/RunBacktestPage'
import { ViewBacktestsPage } from './pages/ViewBacktestsPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand-top">Crypto Analysis UI</p>
          <h1>Backtesting</h1>
        </div>

        <nav className="main-nav">
          <NavLink to="/run" className={({ isActive }) => (isActive ? 'active' : '')}>
            Run Backtest
          </NavLink>
          <NavLink
            to="/backtests"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            View Backtests
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<RunBacktestPage />} />
          <Route path="/run" element={<RunBacktestPage />} />
          <Route path="/backtests" element={<ViewBacktestsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
