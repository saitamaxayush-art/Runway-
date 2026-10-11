import { useState } from 'react'
import { CATS } from '../data/constants.js'
import { inr } from '../utils/format.js'
import { calc, apply, allocParts } from '../engine/finance.js'
import { Donut3D } from '../components/Donut3D.jsx'
import { Line3D } from '../components/Line3D.jsx'
import { Legend } from '../components/Legend.jsx'
import { Delta } from '../components/Delta.jsx'
import { Tilt } from '../components/Tilt.jsx'
import { Stat } from '../components/Stat.jsx'
import { Rev } from '../components/Rev.jsx'

export function Sim({ s, set }) {
  const [f, setF] = useState({ n: '', a: '', c: 'Fun', k: 'once' })
  const [committedNotice, setCommittedNotice] = useState(null)

  const b = calc(s)
  const n = apply(s, f)
  const a = calc(n)
  const has = +f.a > 0

  const PRESETS = [
    { n: 'Weekend Dinner', a: 650, c: 'Food', k: 'once' },
    { n: 'Concert Ticket', a: 2500, c: 'Fun', k: 'once' },
    { n: 'New Sneakers', a: 3200, c: 'Fun', k: 'once' },
    { n: 'Weekly Cab Commute', a: 450, c: 'Transport', k: 'weekly' },
    { n: 'Gym Membership', a: 999, c: 'Bills', k: 'sub' },
    { n: 'Laptop Repair', a: 1800, c: 'Study', k: 'once' },
  ]

  const verdict = !has
    ? 'Enter a purchase amount or pick a preset to preview its consequence.'
    : a.end < 0
      ? `This pushes you into a projected shortfall of ${inr(-a.end)} by day 30. Reconsider or cut back on other categories.`
      : a.risk !== b.risk
        ? `This raises your risk rating from ${b.risk} to ${a.risk}. Your daily allowance drops by ${inr(b.allow - a.allow)} every day.`
        : `You can absorb this spend. Your daily allowance settles at ${inr(a.allow)} and your runway remains in the ${a.risk.toLowerCase()} risk tier.`

  const handleCommit = () => {
    if (!has) return
    const spendTitle = f.n || 'Simulated Spend'
    const spendAmount = inr(+f.a)
    set(n)
    setF({ n: '', a: '', c: 'Fun', k: 'once' })
    setCommittedNotice(`Successfully committed "${spendTitle}" (${spendAmount}) into your active budget!`)
    setTimeout(() => setCommittedNotice(null), 5000)
  }

  const handleClear = () => {
    setF({ n: '', a: '', c: 'Fun', k: 'once' })
  }

  const simParts = allocParts(n, a)

  return (
    <main id="main" tabIndex={-1} className="page sim-page">
      {/* 1. HEADER */}
      <Rev>
        <div className="sim-header">
          <div>
            <span className="kicker">Risk-Free Financial Sandbox</span>
            <h1>Decision Simulator</h1>
            <p className="lead">
              Test impulsive or planned purchases against your live runway. Nothing alters your
              actual budget until you choose to commit.
            </p>
          </div>
          <div className="sim-top-nav-row">
            <a href="#/dashboard" className="btn ghost sm">
              ← Return to Dashboard
            </a>
          </div>
        </div>
      </Rev>

      {/* SUCCESS NOTICE */}
      {committedNotice && (
        <Rev>
          <div className="sim-success-toast" role="status">
            <span>✓ {committedNotice}</span>
            <a href="#/dashboard" className="btn sm pri">
              View on Dashboard →
            </a>
          </div>
        </Rev>
      )}

      {/* 2. DYNAMIC SIMULATOR STATS HUD */}
      <Rev d={60}>
        <div className="grid5">
          <Tilt className="card stat">
            <small>Live Balance</small>
            <b>{inr(b.bal)}</b>
            {has && (
              <span className="hud-delta bad">
                After: {inr(a.bal)} (-{inr(b.bal - a.bal)})
              </span>
            )}
          </Tilt>

          <Tilt className="card stat">
            <small>Daily Allowance</small>
            <b>{inr(b.allow)}</b>
            {has && (
              <span className={`hud-delta ${a.allow < b.allow ? 'bad' : 'good'}`}>
                After: {inr(a.allow)} ({inr(a.allow - b.allow)}/day)
              </span>
            )}
          </Tilt>

          <Tilt className="card stat">
            <small>Day 30 Forecast</small>
            <b className={b.end < 0 ? 'bad' : ''}>{inr(b.end)}</b>
            {has && (
              <span className={`hud-delta ${a.end < 0 ? 'bad' : 'good'}`}>
                After: {inr(a.end)}
              </span>
            )}
          </Tilt>

          <Tilt className="card stat">
            <small>Risk Level</small>
            <b className={b.risk === 'High' ? 'bad' : ''}>{b.risk}</b>
            {has && (
              <span className={`hud-delta ${a.risk === 'High' ? 'bad' : ''}`}>
                After: {a.risk}
              </span>
            )}
          </Tilt>

          <Stat
            l="Health Score"
            v={b.health}
            f={(n) => (has ? `${n} → ${a.health} / 100` : `${n} / 100`)}
          />
        </div>
      </Rev>

      {/* 3. SIMULATOR CONTROLS & SIDE-BY-SIDE IMPACT */}
      <div className="grid2 sim-workspace-grid">
        {/* LEFT COLUMN: CONFIGURE THE SPEND */}
        <Rev d={100}>
          <div className="card sim-card">
            <h3>Configure the Decision</h3>
            <p className="sim-subhead">Pick a quick preset or customize the amount below:</p>

            {/* Quick preset chips */}
            <div className="preset-chips">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.n}
                  className={`preset-chip ${f.n === p.n && +f.a === p.a ? 'active' : ''}`}
                  onClick={() => setF({ n: p.n, a: p.a, c: p.c, k: p.k })}
                >
                  <span>{p.n}</span>
                  <b>{inr(p.a)}</b>
                </button>
              ))}
            </div>

            {/* Spend inputs */}
            <div className="sim-form-fields">
              <label>
                Description / Purpose
                <input
                  value={f.n}
                  onChange={(e) => setF({ ...f, n: e.target.value })}
                  placeholder="e.g. Headphones, Jacket, Dinner"
                />
              </label>

              {/* Amount slider and highlight */}
              <div className="purchase-slider-wrap">
                <div className="purchase-slider-label">
                  <label htmlFor="sim-slider">Amount in rupees</label>
                  <b className="purchase-amount-highlight">{inr(+f.a || 0)}</b>
                </div>
                <input
                  id="sim-slider"
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={+f.a || 0}
                  onChange={(e) => setF({ ...f, a: e.target.value })}
                />
                <div className="purchase-slider-ticks">
                  <span>₹0</span>
                  <span>₹1,500</span>
                  <span>₹3,000</span>
                  <span>₹5,000</span>
                </div>
              </div>

              {/* Steppers */}
              <div className="stepper-row">
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setF((v) => ({ ...v, a: Math.max(0, (+v.a || 0) - 100) }))}
                >
                  -₹100
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setF((v) => ({ ...v, a: (+v.a || 0) + 100 }))}
                >
                  +₹100
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setF((v) => ({ ...v, a: (+v.a || 0) + 500 }))}
                >
                  +₹500
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setF((v) => ({ ...v, a: (+v.a || 0) + 1000 }))}
                >
                  +₹1,000
                </button>
                {has && (
                  <button type="button" className="btn sm ghost" onClick={handleClear}>
                    Clear
                  </button>
                )}
              </div>

              {/* Category and Schedule */}
              <div className="grid2 sim-sub-grid">
                <label>
                  Category
                  <select value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })}>
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Frequency
                  <select value={f.k} onChange={(e) => setF({ ...f, k: e.target.value })}>
                    <option value="once">One time, today</option>
                    <option value="weekly">Every week until day 30</option>
                    <option value="sub">Monthly subscription</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Commit Button */}
            <div className="sim-commit-box">
              <button
                type="button"
                className="btn pri"
                disabled={!has}
                onClick={handleCommit}
              >
                Commit this decision to my budget
              </button>
            </div>
          </div>
        </Rev>

        {/* RIGHT COLUMN: BEFORE AND AFTER ANALYSIS */}
        <Rev d={140}>
          <div className="card sim-card">
            <div className="chart-header-row">
              <div>
                <h3>Consequence Analysis</h3>
                <p className="sim-subhead">Side-by-side metric shift before vs after committing.</p>
              </div>
              <span
                className={`risk-badge ${a.risk === 'High' ? 'risk-high' : a.risk === 'Medium' ? 'risk-med' : 'risk-low'}`}
              >
                {a.risk} Risk
              </span>
            </div>

            {/* Before and After Table */}
            <div className="sim-table-wrap">
              <table className="sim-compare-table">
                <thead>
                  <tr>
                    <th scope="col">Metric</th>
                    <th scope="col">Now</th>
                    <th scope="col">Simulated</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Balance</td>
                    <td>{inr(b.bal)}</td>
                    <td>{inr(a.bal)}</td>
                    <td>
                      <Delta a={b.bal} b={a.bal} />
                    </td>
                  </tr>
                  <tr>
                    <td>Daily Allowance</td>
                    <td>{inr(b.allow)}</td>
                    <td>{inr(a.allow)}</td>
                    <td>
                      <Delta a={b.allow} b={a.allow} />
                    </td>
                  </tr>
                  <tr>
                    <td>Day 30 Forecast</td>
                    <td>{inr(b.end)}</td>
                    <td>{inr(a.end)}</td>
                    <td>
                      <Delta a={b.end} b={a.end} />
                    </td>
                  </tr>
                  <tr>
                    <td>Risk Level</td>
                    <td>{b.risk}</td>
                    <td>{a.risk}</td>
                    <td className={b.risk === a.risk ? '' : 'bad'}>
                      {b.risk === a.risk ? 'Same' : `Shifts to ${a.risk}`}
                    </td>
                  </tr>
                  <tr>
                    <td>Health Score</td>
                    <td>{b.health}</td>
                    <td>{a.health}</td>
                    <td>
                      <Delta a={b.health} b={a.health} f={(x) => `${x} pts`} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actionable Feedback Banner */}
            <div
              className={`impact-alert-banner ${has && a.end < 0 ? 'banner-alert' : 'banner-safe'}`}
            >
              <p>
                <b>Verdict:</b> {verdict}
              </p>
            </div>

            {/* 3D Allocation Result */}
            <div className="sim-donut-preview">
              <span className="subhead-small">Resulting 3D Fund Distribution:</span>
              <div className="dwrap dwrap-3d">
                <Donut3D
                  parts={simParts}
                  total={a.income}
                  label={[inr(a.spent), 'simulated spent']}
                />
                <Legend parts={simParts} />
              </div>
            </div>
          </div>
        </Rev>
      </div>

      {/* 4. 3D TRAJECTORY COMPARISON ROW */}
      <Rev d={180}>
        <div className="card sim-trajectory-card">
          <div className="chart-header-row">
            <div>
              <h3>3D Runway Trajectory (Live Baseline vs Simulated Decision)</h3>
              <p className="chart-subhead">
                Compare your current trajectory in emerald with the simulated spending curve in
                brass deep.
              </p>
            </div>
          </div>
          <Line3D s={s} simState={has ? n : null} />
          <div className="chart-legend-row">
            <span className="legend-item">
              <i className="legend-dot act-dot" /> Live actual balance
            </span>
            <span className="legend-item">
              <i className="legend-dot proj-dot" /> Baseline pace projection
            </span>
            {has && (
              <span className="legend-item">
                <i className="legend-dot sim-dot" /> Decision trajectory projection
              </span>
            )}
          </div>
        </div>
      </Rev>
    </main>
  )
}

export default Sim
