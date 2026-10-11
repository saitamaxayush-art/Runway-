import { useState } from 'react'
import { inr } from '../utils/format.js'
import { INIT } from '../data/initialState.js'
import { calc, allocParts } from '../engine/finance.js'
import { Tilt } from '../components/Tilt.jsx'
import { Stat } from '../components/Stat.jsx'
import { Donut3D } from '../components/Donut3D.jsx'
import { Line3D } from '../components/Line3D.jsx'
import { Bars3D } from '../components/Bars3D.jsx'
import { Legend } from '../components/Legend.jsx'
import { Rev } from '../components/Rev.jsx'
import { CATS } from '../data/constants.js'

export function Dash({ s, set }) {
  // Baseline financial state
  const m = calc(s)
  const parts = allocParts(s, m)
  const tot = m.income

  // History tab filter state
  const [historyTab, setHistoryTab] = useState('current')
  const [historyCatFilter, setHistoryCatFilter] = useState('All')

  // Workflow allocation totals from user plan
  const totalFixed = s.com.reduce((acc, c) => acc + c.a, 0)
  const totalVariable = s.exp.filter((e) => e.c !== 'Savings').reduce((acc, e) => acc + e.a, 0)
  const totalSaved = s.goals.reduce((acc, g) => acc + g.s, 0)
  const totalGoalTarget = s.goals.reduce((acc, g) => acc + g.t, 0)

  // Upcomings
  const dues = [
    ...s.com.filter((c) => c.due >= s.day).map((c) => ({ n: c.n, a: c.a, d: c.due, type: 'Bill' })),
    ...s.subs
      .filter((u) => u.on && u.bill >= s.day)
      .map((u) => ({ n: u.n, a: u.a, d: u.bill, type: 'Subscription' })),
  ].sort((a, b) => a.d - b.d)

  // System alerts
  const al = []
  if (m.end < 0) al.push(`Projected shortfall of ${inr(-m.end)} by day 30 at your current pace.`)
  if (m.pace > m.allow)
    al.push(`You spend ${inr(m.pace)} a day on average, above your ${inr(m.allow)} allowance.`)
  if (m.subTotal > 300) al.push(`Subscriptions take ${inr(m.subTotal)} this month.`)
  if (!al.length) al.push('Spending is within your allowance. Keep the pace.')

  // Category items for 3D Bar chart
  const catItems = Object.entries(m.byCat).map(([l, v]) => ({ l, v }))

  // Filtered expense transactions for history
  const allExpenses = [...s.exp].reverse()
  const filteredExpenses =
    historyCatFilter === 'All'
      ? allExpenses
      : allExpenses.filter((x) => x.c === historyCatFilter)

  return (
    <main id="main" tabIndex={-1} className="page dash-page">
      {/* 1. HEADER & CONTROLS */}
      <Rev>
        <div className="dash-header">
          <div>
            <span className="kicker">Runway 30-Day Solvency Intelligence</span>
            <h1>Financial Dashboard</h1>
            <p className="lead">
              Real-time 3D telemetry of your ₹10,000 monthly cashflow. Inspect your burn rate, fund
              allocation, commitments, and historical ledger.
            </p>
          </div>
          <div className="dash-controls-bar">
            <span className="daytag">Day {s.day} of 30</span>
            <span className="daytag">Income {inr(m.income)}</span>
            <button
              type="button"
              className="btn"
              onClick={() => set((x) => ({ ...x, day: Math.min(30, x.day + 1) }))}
            >
              Advance day
            </button>
            <button type="button" className="btn ghost" onClick={() => set(INIT)}>
              Reset
            </button>
            <a href="#/simulate" className="btn pri">
              Decision Simulator →
            </a>
          </div>
        </div>
      </Rev>

      {/* 2. DYNAMIC 3D STAT HUD */}
      <Rev d={60}>
        <div className="grid5">
          <Tilt className="card stat">
            <small>Balance</small>
            <b>{inr(m.bal)}</b>
            <span className="hud-delta good">Available cash</span>
          </Tilt>

          <Tilt className="card stat">
            <small>Daily allowance</small>
            <b>{inr(m.allow)}</b>
            <span className="hud-delta">{30 - s.day} days remaining</span>
          </Tilt>

          <Tilt className="card stat">
            <small>Day 30 forecast</small>
            <b className={m.end < 0 ? 'bad' : ''}>{inr(m.end)}</b>
            <span className={`hud-delta ${m.end < 0 ? 'bad' : 'good'}`}>
              {m.end >= 0 ? 'Surplus projected' : 'Deficit projected'}
            </span>
          </Tilt>

          <Tilt className="card stat">
            <small>Risk Level</small>
            <b className={m.risk === 'High' ? 'bad' : ''}>{m.risk}</b>
            <span className={`hud-delta ${m.risk === 'High' ? 'bad' : 'good'}`}>
              {m.risk === 'High' ? 'High burn alert' : 'Stable runway'}
            </span>
          </Tilt>

          <Stat l="Health score" v={m.health} f={(n) => `${n} / 100`} />
        </div>
      </Rev>

      {/* 3. INTERACTIVE 3D CHARTS ROW */}
      <Rev d={120}>
        <div className="grid2 dash-charts-grid">
          {/* 3D Allocation Donut */}
          <div className="card chart-3d-card">
            <div className="chart-header-row">
              <div>
                <h3>3D Fund Allocation</h3>
                <p className="chart-subhead">
                  Hover slices to inspect 3D extrusion, category shares, and remaining free cash.
                </p>
              </div>
            </div>

            <div className="dwrap dwrap-3d">
              <Donut3D parts={parts} total={tot} label={[inr(m.spent), 'spent']} />
              <Legend parts={parts} />
            </div>
          </div>

          {/* 3D Balance Forecast */}
          <div className="card chart-3d-card">
            <div className="chart-header-row">
              <div>
                <h3>3D Runway Trajectory</h3>
                <p className="chart-subhead">
                  Scrub over 30 days to view actuals, projected burn, and zero baseline.
                </p>
              </div>
            </div>

            <Line3D s={s} />

            <div className="chart-legend-row">
              <span className="legend-item">
                <i className="legend-dot act-dot" /> Actual spend
              </span>
              <span className="legend-item">
                <i className="legend-dot proj-dot" /> Pace forecast
              </span>
            </div>
          </div>
        </div>
      </Rev>

      {/* 3D CATEGORY PRISM SPEND BREAKDOWN */}
      <Rev d={160}>
        <div className="card cat-prism-card">
          <div className="chart-header-row">
            <div>
              <h3>Category Spend Distribution (3D Isometric)</h3>
              <p className="chart-subhead">
                Proportional breakdown of where your ₹10,000 has been deployed across lifestyle
                buckets.
              </p>
            </div>
          </div>
          <Bars3D items={catItems} total={m.spent || 1} />
        </div>
      </Rev>

      {/* 4. EXECUTIVE MONTHLY BUDGET SUMMARY */}
      <Rev d={200}>
        <section className="card budget-summary-card">
          <div className="chart-header-row">
            <div>
              <span className="kicker">Monthly Intelligence</span>
              <h2>Executive Budget Summary</h2>
              <p className="chart-subhead">
                Comprehensive synthesis of your ₹10,000 monthly trajectory, obligations, and safety
                margin.
              </p>
            </div>
          </div>

          <div className="budget-summary-grid">
            <div className="summary-block">
              <span className="summary-label">Fixed Commitments</span>
              <b className="summary-val">{inr(m.res)}</b>
              <p className="summary-note">
                {Math.round((m.res / tot) * 100)}% of your income is reserved for mandatory dues
                (rent, bills, active subscriptions).
              </p>
            </div>

            <div className="summary-block">
              <span className="summary-label">Discretionary Pace</span>
              <b className="summary-val">{inr(m.pace)}/day</b>
              <p className="summary-note">
                At your current spending rate of {inr(m.pace)}/day vs allowance of {inr(m.allow)}
                /day, your runway is {m.pace <= m.allow ? 'sustainable' : 'depleting too quickly'}.
              </p>
            </div>

            <div className="summary-block">
              <span className="summary-label">Available Free Cash</span>
              <b className="summary-val">{inr(Math.max(0, m.free))}</b>
              <p className="summary-note">
                Remaining liquidity uncommitted to upcoming bills or recurring liabilities across
                the final {30 - s.day} days.
              </p>
            </div>

            <div className="summary-block">
              <span className="summary-label">Month-End Verdict</span>
              <b className={`summary-val ${m.end < 0 ? 'bad' : 'good'}`}>
                {m.end >= 0 ? `+${inr(m.end)} Reserve` : `-${inr(-m.end)} Shortfall`}
              </b>
              <p className="summary-note">
                {m.end >= 0
                  ? 'On track to conclude day 30 with surplus savings.'
                  : 'Requires immediate spending deceleration to avoid cash depletion.'}
              </p>
            </div>
          </div>
        </section>
      </Rev>

      {/* 5. HISTORY SECTION (MONTHLY RETROSPECTIVE & TRANSACTION LEDGER) */}
      <Rev d={220}>
        <section className="card history-section-card">
          <div className="history-header">
            <div>
              <span className="kicker">Audit & Memory</span>
              <h2>Monthly History & Ledger</h2>
              <p className="chart-subhead">
                Review past monthly performance benchmarks and inspect every recorded transaction
                in your current ledger.
              </p>
            </div>

            <div className="history-tab-buttons">
              <button
                type="button"
                className={`btn sm ${historyTab === 'current' ? 'pri' : 'ghost'}`}
                onClick={() => setHistoryTab('current')}
              >
                Current Month (Oct)
              </button>
              <button
                type="button"
                className={`btn sm ${historyTab === 'past' ? 'pri' : 'ghost'}`}
                onClick={() => setHistoryTab('past')}
              >
                Past Months History
              </button>
            </div>
          </div>

          {historyTab === 'past' ? (
            <div className="past-months-grid">
              <div className="past-month-card">
                <div className="past-month-top">
                  <b>September 2026</b>
                  <span className="past-month-tag tag-success">Completed (Surplus)</span>
                </div>
                <div className="past-month-metrics">
                  <div>
                    <small>Total Spent</small>
                    <b>₹9,420</b>
                  </div>
                  <div>
                    <small>Closing Reserve</small>
                    <b className="good">₹580</b>
                  </div>
                  <div>
                    <small>Health Score</small>
                    <b>84 / 100</b>
                  </div>
                </div>
                <p className="past-month-note">
                  Maintained daily allowance below ₹320. Saved ₹500 into emergency buffer.
                </p>
              </div>

              <div className="past-month-card">
                <div className="past-month-top">
                  <b>August 2026</b>
                  <span className="past-month-tag tag-alert">Completed (Deficit Squeeze)</span>
                </div>
                <div className="past-month-metrics">
                  <div>
                    <small>Total Spent</small>
                    <b>₹10,180</b>
                  </div>
                  <div>
                    <small>Closing Shortfall</small>
                    <b className="bad">-₹180</b>
                  </div>
                  <div>
                    <small>Health Score</small>
                    <b>62 / 100</b>
                  </div>
                </div>
                <p className="past-month-note">
                  Unexpected repair of ₹1,200 on day 18 pushed final week into negative runway.
                </p>
              </div>
            </div>
          ) : (
            <div className="current-ledger-wrap">
              {/* Category Filter Pills */}
              <div className="ledger-filter-row">
                <span className="ledger-filter-label">Filter Category:</span>
                <button
                  type="button"
                  className={`btn sm ${historyCatFilter === 'All' ? 'pri' : 'ghost'}`}
                  onClick={() => setHistoryCatFilter('All')}
                >
                  All ({allExpenses.length})
                </button>
                {CATS.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    className={`btn sm ${historyCatFilter === cat ? 'pri' : 'ghost'}`}
                    onClick={() => setHistoryCatFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              <div className="ledger-list">
                {filteredExpenses.length ? (
                  filteredExpenses.map((x) => (
                    <div className="ledger-item" key={x.id}>
                      <div className="ledger-left">
                        <span className="ledger-day">Day {x.d}</span>
                        <div>
                          <b className="ledger-name">{x.n}</b>
                          <span className="ledger-cat-badge">{x.c}</span>
                        </div>
                      </div>
                      <div className="ledger-right">
                        <b className="ledger-amount">-{inr(x.a)}</b>
                        <button
                          type="button"
                          className="x"
                          onClick={() =>
                            set((prev) => ({
                              ...prev,
                              exp: prev.exp.filter((item) => item.id !== x.id),
                            }))
                          }
                          aria-label={`Delete ${x.n}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="ledger-empty">No transactions found under this filter.</p>
                )}
              </div>
            </div>
          )}
        </section>
      </Rev>

      {/* 6. UPCOMING SCHEDULED COMMITMENTS & ATTENTION ITEMS */}
      <Rev d={240}>
        <div className="grid2 dash-bottom-grid">
          <div className="card">
            <h3>Scheduled Obligations Remaining</h3>
            {dues.length ? (
              dues.map((d, i) => (
                <div className="rowi" key={i}>
                  <span>Day {d.d}</span>
                  <span>
                    {d.n} <small>({d.type})</small>
                  </span>
                  <b>{inr(d.a)}</b>
                </div>
              ))
            ) : (
              <p>Nothing scheduled for the remainder of this month.</p>
            )}
          </div>

          <div className="card">
            <h3>Attention & Risk Drivers</h3>
            {al.map((t, i) => (
              <p role="status" className="alert" key={i}>
                {t}
              </p>
            ))}
            <div className="bar">
              <i style={{ width: m.health + '%' }} />
            </div>
            <small>
              Health score {m.health} / 100. Computed from runway solvency, savings allocation, and
              unhedged shock capacity.
            </small>
          </div>
        </div>
      </Rev>

      {/* 7. HORIZONTAL WORKFLOW ARCHITECTURE OVERVIEW (WHAT THE USER HAS PLANNED & ALLOCATED) */}
      <Rev d={260}>
        <section className="dash-workflow-overview-card card">
          <div className="dash-workflow-header-row">
            <div>
              <span className="kicker">Planned Budget Blueprint</span>
              <h2>Capital Allocation Workflow</h2>
              <p className="lead">
                The continuous financial network configured in your plan: see how your ₹10,000 inflow branches horizontally into fixed obligations, living expenses, goals, and reserves.
              </p>
            </div>
            <div className="dash-workflow-cta">
              <a href="#/plan" className="btn pri">
                Open Plan Workflow Network →
              </a>
            </div>
          </div>

          {/* Horizontal Card Structure Pipeline */}
          <div className="workflow-horizontal-track">
            {/* Card 1: Income Inflow */}
            <div className="wf-horiz-card wf-card-root">
              <div className="wf-horiz-top">
                <span className="node-badge node-root">01. Source</span>
                <span className="wf-status-pill pill-root">Inflow</span>
              </div>
              <h4>Monthly Income</h4>
              <b className="wf-horiz-amount">{inr(m.income)}</b>
              <p className="wf-horiz-sub">Base ₹{inr(s.budget)} + extra inflows</p>
              <div className="wf-bar-track">
                <div
                  className="wf-bar-fill"
                  style={{ width: '100%', background: 'var(--brass-deep)' }}
                />
              </div>
              <span className="wf-allocation-label">100% of Total Pool</span>
            </div>

            <div className="wf-flow-connector" aria-hidden="true">
              <span className="wf-connector-line" />
              <span className="wf-connector-arrow">→</span>
            </div>

            {/* Card 2: Fixed Spendings */}
            <div className="wf-horiz-card">
              <div className="wf-horiz-top">
                <span className="node-badge node-fixed">02. Fixed</span>
                <span className="wf-status-pill pill-fixed">Ring-Fenced</span>
              </div>
              <h4>Fixed Spendings</h4>
              <b className="wf-horiz-amount">{inr(totalFixed)}</b>
              <p className="wf-horiz-sub">{s.com.length} commitments locked</p>
              <div className="wf-bar-track">
                <div
                  className="wf-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalFixed / (m.income || 1)) * 100))}%`,
                    background: 'var(--ink)',
                  }}
                />
              </div>
              <span className="wf-allocation-label">
                {Math.round((totalFixed / (m.income || 1)) * 100)}% of Income
              </span>
            </div>

            <div className="wf-flow-connector" aria-hidden="true">
              <span className="wf-connector-line" />
              <span className="wf-connector-arrow">→</span>
            </div>

            {/* Card 3: Variable Spendings */}
            <div className="wf-horiz-card">
              <div className="wf-horiz-top">
                <span className="node-badge node-variable">03. Variable</span>
                <span className="wf-status-pill pill-var">Discretionary</span>
              </div>
              <h4>Variable Living</h4>
              <b className="wf-horiz-amount">{inr(totalVariable)}</b>
              <p className="wf-horiz-sub">
                {s.exp.filter((e) => e.c !== 'Savings').length} logged purchases
              </p>
              <div className="wf-bar-track">
                <div
                  className="wf-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.round((totalVariable / (m.income || 1)) * 100))}%`,
                    background: 'var(--brass)',
                  }}
                />
              </div>
              <span className="wf-allocation-label">
                {Math.round((totalVariable / (m.income || 1)) * 100)}% of Income
              </span>
            </div>

            <div className="wf-flow-connector" aria-hidden="true">
              <span className="wf-connector-line" />
              <span className="wf-connector-arrow">→</span>
            </div>

            {/* Card 4: Savings Goals */}
            <div className="wf-horiz-card">
              <div className="wf-horiz-top">
                <span className="node-badge node-savings">04. Goals</span>
                <span className="wf-status-pill pill-goals">Target</span>
              </div>
              <h4>Savings Targets</h4>
              <b className="wf-horiz-amount">{inr(totalSaved)}</b>
              <p className="wf-horiz-sub">
                {s.goals.length} goals ({inr(totalGoalTarget)} target)
              </p>
              <div className="wf-bar-track">
                <div
                  className="wf-bar-fill"
                  style={{
                    width: `${Math.min(100, totalGoalTarget > 0 ? Math.round((totalSaved / totalGoalTarget) * 100) : 0)}%`,
                    background: '#10B981',
                  }}
                />
              </div>
              <span className="wf-allocation-label">
                {totalGoalTarget > 0 ? Math.round((totalSaved / totalGoalTarget) * 100) : 0}% Target Funded
              </span>
            </div>

            <div className="wf-flow-connector" aria-hidden="true">
              <span className="wf-connector-line" />
              <span className="wf-connector-arrow">→</span>
            </div>

            {/* Card 5: Shock Cushion */}
            <div className="wf-horiz-card">
              <div className="wf-horiz-top">
                <span className="node-badge node-shocks">05. Safety Net</span>
                <span className={`wf-status-pill ${m.end < 0 ? 'pill-alert' : 'pill-cushion'}`}>
                  {m.end < 0 ? 'Deficit' : 'Protected'}
                </span>
              </div>
              <h4>Shock Absorber</h4>
              <b className={`wf-horiz-amount ${m.end < 0 ? 'bad' : ''}`}>
                {inr(Math.max(0, m.end))}
              </b>
              <p className="wf-horiz-sub">Runway tier: {m.risk} risk</p>
              <div className="wf-bar-track">
                <div
                  className="wf-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, Math.round((m.end / (m.income || 1)) * 100)))}%`,
                    background: m.end < 0 ? '#b91c1c' : '#8C5A12',
                  }}
                />
              </div>
              <span className="wf-allocation-label">
                {Math.max(0, Math.round((m.end / (m.income || 1)) * 100))}% Reserve Buffer
              </span>
            </div>
          </div>
        </section>
      </Rev>
    </main>
  )
}

export default Dash
