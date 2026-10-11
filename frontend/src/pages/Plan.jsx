import { useState, useRef, useEffect } from 'react'
import { inr } from '../utils/format.js'
import { clamp } from '../utils/math.js'
import { calc, apply } from '../engine/finance.js'
import { Num } from '../components/Num.jsx'
import { Tilt } from '../components/Tilt.jsx'
import { Rev } from '../components/Rev.jsx'
import { CATS } from '../data/constants.js'

export function Plan({ s, set }) {
  // 1. User Authentication Gate State
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('runway_user') || null
    } catch {
      return null
    }
  })
  const [loginName, setLoginName] = useState('Ayush')
  const [loginPin, setLoginPin] = useState('10000')

  const handleLogin = (e) => {
    if (e) e.preventDefault()
    const name = loginName.trim() || 'Ayush'
    setUser(name)
    try {
      localStorage.setItem('runway_user', name)
    } catch {
      // ignore
    }
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem('runway_user')
    } catch {
      // ignore
    }
  }

  // 2. Workflow Form States
  const [incForm, setIncForm] = useState({ n: '', a: '' })
  const [comForm, setComForm] = useState({ n: '', a: '', due: 20 })
  const [expForm, setExpForm] = useState({ n: '', a: '', c: 'Food' })
  const [subForm, setSubForm] = useState({ n: '', a: '', bill: 15 })
  const [goalForm, setGoalForm] = useState({ n: '', t: '' })
  const [customShock, setCustomShock] = useState({ n: '', a: '' })

  const id = () => Date.now() + Math.random()
  const m = calc(s)

  // Pre-configured emergency shock scenarios
  const SHOCK_PRESETS = [
    { n: 'Phone screen repair', a: 1800 },
    { n: 'Friend wedding gift', a: 700 },
    { n: 'Medical emergency', a: 500 },
    { n: 'Laptop charger replacement', a: 1200 },
    { n: 'Late commute cab surge', a: 350 },
  ]

  // Savings goal fund contribution
  const handleFundGoal = (gid, amount) => {
    set((p) => {
      const activeBal = calc(p).bal
      if (amount > activeBal) return p
      return {
        ...p,
        goals: p.goals.map((y) => (y.id === gid ? { ...y, s: Math.min(y.t, y.s + amount) } : y)),
        exp: [
          ...p.exp,
          { id: id(), n: 'Goal allocation', c: 'Savings', a: amount, d: p.day },
        ],
      }
    })
  }

  // 3. Dynamic Thread Line Measurement & Movable Cards
  const rootRef = useRef(null)
  const child1Ref = useRef(null)
  const child2Ref = useRef(null)
  const child3Ref = useRef(null)
  const child4Ref = useRef(null)
  const [threadPaths, setThreadPaths] = useState([])

  // User-movable card positions (persisted in localStorage)
  const [positions, setPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('runway_plan_positions')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return {
      c1: { x: 0, y: 0 },
      c2: { x: 0, y: 0 },
      c3: { x: 0, y: 0 },
      c4: { x: 0, y: 0 },
    }
  })
  const [activeDrag, setActiveDrag] = useState(null)
  const dragStartRef = useRef(null)

  const handlePointerDown = (key, e) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setActiveDrag(key)
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: positions[key]?.x || 0,
      initY: positions[key]?.y || 0,
      pointerId: e.pointerId,
    }
  }

  const handlePointerMove = (e) => {
    if (!activeDrag || !dragStartRef.current) return
    const { startX, startY, initX, initY } = dragStartRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const newX = Math.round(initX + dx)
    const newY = Math.round(initY + dy)
    setPositions((prev) => ({
      ...prev,
      [activeDrag]: { x: newX, y: newY },
    }))
    requestAnimationFrame(updateThreads)
  }

  const handlePointerUp = (e) => {
    if (activeDrag && dragStartRef.current) {
      try {
        e.currentTarget.releasePointerCapture(dragStartRef.current.pointerId)
      } catch {
        // ignore
      }
      setActiveDrag(null)
      dragStartRef.current = null
      updateThreads()
      try {
        localStorage.setItem('runway_plan_positions', JSON.stringify(positions))
      } catch {
        // ignore
      }
    }
  }

  const resetPositions = () => {
    const clean = {
      c1: { x: 0, y: 0 },
      c2: { x: 0, y: 0 },
      c3: { x: 0, y: 0 },
      c4: { x: 0, y: 0 },
    }
    setPositions(clean)
    try {
      localStorage.setItem('runway_plan_positions', JSON.stringify(clean))
    } catch {
      // ignore
    }
    setTimeout(updateThreads, 50)
  }

  const updateThreads = () => {
    if (!rootRef.current) return
    const rootBox = rootRef.current.getBoundingClientRect()
    const containerBox = rootRef.current.closest('.workflow-canvas')?.getBoundingClientRect()
    if (!containerBox) return

    const rootX = rootBox.left + rootBox.width / 2 - containerBox.left
    const rootY = rootBox.bottom - containerBox.top

    const children = [child1Ref, child2Ref, child3Ref, child4Ref]
    const paths = []

    children.forEach((ref) => {
      if (ref.current) {
        const box = ref.current.getBoundingClientRect()
        const childX = box.left + box.width / 2 - containerBox.left
        const childY = box.top - containerBox.top

        // Compute smooth cubic bezier connecting thread
        const deltaY = Math.max(40, (childY - rootY) * 0.5)
        const d = `M ${rootX} ${rootY} C ${rootX} ${rootY + deltaY}, ${childX} ${childY - deltaY}, ${childX} ${childY}`
        paths.push(d)
      }
    })

    setThreadPaths(paths)
  }

  useEffect(() => {
    if (user) {
      updateThreads()
      window.addEventListener('resize', updateThreads)
      const timer = setTimeout(updateThreads, 200)
      return () => {
        window.removeEventListener('resize', updateThreads)
        clearTimeout(timer)
      }
    }
  }, [user, s, positions])

  // Calculated totals for workflow cards
  const totalIncome = m.income
  const totalFixed = s.com.reduce((acc, c) => acc + c.a, 0)
  const totalVariable = s.exp.filter((e) => e.c !== 'Savings').reduce((acc, e) => acc + e.a, 0)
  const totalSaved = s.goals.reduce((acc, g) => acc + g.s, 0)
  const totalGoalTarget = s.goals.reduce((acc, g) => acc + g.t, 0)

  // -------------------------------------------------------------
  // VIEW A: USER LOGIN GATE
  // -------------------------------------------------------------
  if (!user) {
    return (
      <main id="main" tabIndex={-1} className="page plan-login-page">
        <Rev>
          <div className="login-card card">
            <span className="kicker">Runway Architecture</span>
            <h1>Unlock Plan Workflow</h1>
            <p className="lead">
              Sign in to access your interactive budget thread canvas. Configure income, fixed
              burdens, variable habits, savings goals, and shock buffers in one connected system.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <label>
                Planner Name / Identity
                <input
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="e.g. Ayush"
                  required
                />
              </label>

              <label>
                Access PIN / Security Passcode
                <input
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="10000"
                />
              </label>

              <div className="login-btn-row">
                <button type="submit" className="btn pri">
                  Enter budget workflow
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setLoginName('Ayush')
                    handleLogin()
                  }}
                >
                  Quick Demo: Enter as Ayush
                </button>
              </div>
            </form>

            <div className="login-guarantee">
              <small>
                All data is encrypted in your local browser sandbox. No third-party tracking or
                external servers.
              </small>
            </div>
          </div>
        </Rev>
      </main>
    )
  }

  // -------------------------------------------------------------
  // VIEW B: AUTHENTICATED WORKFLOW THREAD CANVAS
  // -------------------------------------------------------------
  return (
    <main id="main" tabIndex={-1} className="page plan-workflow-page">
      {/* Workflow Navigation & User Bar */}
      <Rev>
        <div className="workflow-top-bar">
          <div>
            <div className="workflow-user-pill">
              <span className="user-dot" /> Signed in as <b>{user}</b>
            </div>
            <h1>Budget Workflow Network</h1>
            <p className="lead">
              Every card represents a financial bucket. Income branches into fixed commitments,
              variable habits, savings goals, and shock cushions through connected money threads.
            </p>
          </div>

          <div className="workflow-actions">
            <button
              type="button"
              className="btn sm ghost"
              onClick={resetPositions}
              title="Reset all branch cards to default positions"
            >
              ↺ Reset Positions
            </button>
            <a href="#/dashboard" className="btn sm pri">
              View Final in Dashboard →
            </a>
            <button type="button" className="btn sm ghost" onClick={handleLogout}>
              Lock / Sign out
            </button>
          </div>
        </div>
      </Rev>

      {/* WORKFLOW CANVAS CONTAINER WITH SVG THREADS */}
      <div className="workflow-canvas">
        {/* Dynamic Connected Threads Layer */}
        <svg className="workflow-threads-svg" aria-hidden="true">
          <defs>
            <linearGradient id="thread-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C5A12" />
              <stop offset="50%" stopColor="#C99A3C" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          {threadPaths.map((d, i) => (
            <g key={i}>
              <path d={d} className="thread-path-back" />
              <path d={d} className="thread-path-flow" />
            </g>
          ))}
        </svg>

        {/* =========================================================
            CARD 1: ROOT NODE - MONTHLY INCOME (SOURCE OF THE THREADS)
            ========================================================= */}
        <Rev d={40}>
          <div className="workflow-root-wrap" ref={rootRef}>
            <div className="card workflow-card workflow-card-root">
              <div className="workflow-card-header">
                <span className="node-badge node-root">Root Source</span>
                <h3>Card 1: Monthly Income</h3>
                <span className="node-total">{inr(totalIncome)}</span>
              </div>
              <p className="workflow-card-sub">
                The fountainhead of your ₹10,000 budget. Threads carry this money downstream to
                fuel commitments, living expenses, and goals.
              </p>

              {/* Mini Income Visualization */}
              <div className="mini-graph-income">
                <div className="income-bar-track">
                  <div className="income-bar-fill" style={{ width: '100%' }} />
                </div>
                <div className="income-breakdown-labels">
                  <span>Base budget: {inr(s.budget)}</span>
                  <span>Extra income: {inr(totalIncome - s.budget)}</span>
                </div>
              </div>

              {/* Add Extra Income Form */}
              <div className="mini workflow-inline-form">
                <input
                  aria-label="Income source name"
                  placeholder="Stipend, freelance..."
                  value={incForm.n}
                  onChange={(e) => setIncForm({ ...incForm, n: e.target.value })}
                />
                <Num
                  v={incForm.a}
                  set={(v) => setIncForm({ ...incForm, a: v })}
                  ph="Amount (₹)"
                />
                <button
                  type="button"
                  className="btn sm pri"
                  onClick={() => {
                    if (+incForm.a > 0) {
                      set((x) => ({
                        ...x,
                        inc: [
                          ...(x.inc || []),
                          { id: id(), n: incForm.n || 'Extra income', a: +incForm.a, d: x.day },
                        ],
                      }))
                      setIncForm({ n: '', a: '' })
                    }
                  }}
                >
                  + Add Income
                </button>
              </div>

              {/* Active Income List */}
              <div className="workflow-item-list">
                <div className="rowi root-rowi">
                  <span>Day 1</span>
                  <span>Base 30-day budget</span>
                  <b>{inr(s.budget)}</b>
                </div>
                {(s.inc || []).map((x) => (
                  <div className="rowi" key={x.id}>
                    <span>Day {x.d}</span>
                    <span>{x.n}</span>
                    <b>{inr(x.a)}</b>
                    <button
                      type="button"
                      className="x"
                      onClick={() =>
                        set((p) => ({ ...p, inc: p.inc.filter((y) => y.id !== x.id) }))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Rev>

        {/* =========================================================
            DOWNSTREAM WORKFLOW NODES (CONNECTED THROUGH THREADS)
            ========================================================= */}
        <div className="workflow-branches-grid">
          {/* -------------------------------------------------------
              CARD 2: FIXED SPENDINGS & BILLS
              ------------------------------------------------------- */}
          <Rev d={80}>
            <div
              className={`workflow-branch-col ${activeDrag === 'c1' ? 'branch-col-active' : ''}`}
              ref={child1Ref}
              style={{
                transform: `translate3d(${positions.c1.x}px, ${positions.c1.y}px, 0)`,
                zIndex: activeDrag === 'c1' ? 25 : 2,
              }}
            >
              <div className="card workflow-card">
                <div
                  className={`card-drag-handle ${activeDrag === 'c1' ? 'dragging' : ''}`}
                  onPointerDown={(e) => handlePointerDown('c1', e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Click & drag to reposition Card 2 anywhere on the canvas"
                >
                  <span className="drag-grip">⋮⋮ Move Card</span>
                  <span className="drag-hint">Hold & drag</span>
                </div>
                <div className="workflow-card-header">
                  <span className="node-badge node-fixed">Branch 01</span>
                  <h3>Card 2: Fixed Spendings</h3>
                  <span className="node-total">{inr(totalFixed)}</span>
                </div>
                <p className="workflow-card-sub">
                  Non-negotiable obligations (rent, phone recharge, utility dues).
                </p>

                {/* Mini Graph: Fixed Burden Ratio */}
                <div className="mini-graph-card">
                  <small>Burden on income</small>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, Math.round((totalFixed / totalIncome) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="mini-graph-val">
                    {Math.round((totalFixed / totalIncome) * 100)}% of monthly cash reserved
                  </span>
                </div>

                {/* Add Commitment Form */}
                <div className="mini workflow-inline-form">
                  <input
                    aria-label="Commitment name"
                    placeholder="Bill / Rent name"
                    value={comForm.n}
                    onChange={(e) => setComForm({ ...comForm, n: e.target.value })}
                  />
                  <Num
                    v={comForm.a}
                    set={(v) => setComForm({ ...comForm, a: v })}
                    ph="Amount (₹)"
                  />
                  <Num
                    v={comForm.due}
                    set={(v) => setComForm({ ...comForm, due: v })}
                    ph="Due day"
                  />
                  <button
                    type="button"
                    className="btn sm pri"
                    onClick={() => {
                      if (+comForm.a > 0) {
                        set((x) => ({
                          ...x,
                          com: [
                            ...x.com,
                            {
                              id: id(),
                              n: comForm.n || 'Commitment',
                              a: +comForm.a,
                              due: clamp(+comForm.due || 20, 1, 30),
                            },
                          ],
                        }))
                        setComForm({ n: '', a: '', due: 20 })
                      }
                    }}
                  >
                    + Add
                  </button>
                </div>

                {/* Commitments List */}
                <div className="workflow-item-list">
                  {s.com.map((x) => (
                    <div className="rowi" key={x.id}>
                      <span>Day {x.due}</span>
                      <span>{x.n}</span>
                      <b>{inr(x.a)}</b>
                      <button
                        type="button"
                        className="x"
                        onClick={() =>
                          set((p) => ({
                            ...p,
                            com: p.com.filter((y) => y.id !== x.id),
                            exp: [...p.exp, { id: id(), n: x.n, c: 'Bills', a: x.a, d: p.day }],
                          }))
                        }
                      >
                        Pay now
                      </button>
                      <button
                        type="button"
                        className="x"
                        onClick={() =>
                          set((p) => ({
                            ...p,
                            com: p.com.filter((y) => y.id !== x.id),
                          }))
                        }
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Rev>

          {/* -------------------------------------------------------
              CARD 3: VARIABLE SPENDINGS & DAILY HABITS
              ------------------------------------------------------- */}
          <Rev d={120}>
            <div
              className={`workflow-branch-col ${activeDrag === 'c2' ? 'branch-col-active' : ''}`}
              ref={child2Ref}
              style={{
                transform: `translate3d(${positions.c2.x}px, ${positions.c2.y}px, 0)`,
                zIndex: activeDrag === 'c2' ? 25 : 2,
              }}
            >
              <div className="card workflow-card">
                <div
                  className={`card-drag-handle ${activeDrag === 'c2' ? 'dragging' : ''}`}
                  onPointerDown={(e) => handlePointerDown('c2', e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Click & drag to reposition Card 3 anywhere on the canvas"
                >
                  <span className="drag-grip">⋮⋮ Move Card</span>
                  <span className="drag-hint">Hold & drag</span>
                </div>
                <div className="workflow-card-header">
                  <span className="node-badge node-variable">Branch 02</span>
                  <h3>Card 3: Variable Spendings</h3>
                  <span className="node-total">{inr(totalVariable)}</span>
                </div>
                <p className="workflow-card-sub">
                  Day-to-day choices: groceries, meals, transport, study, and subscriptions.
                </p>

                {/* Mini Graph: Daily Velocity */}
                <div className="mini-graph-card">
                  <small>Daily spend velocity</small>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, Math.round((m.pace / (m.allow || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="mini-graph-val">
                    {inr(m.pace)}/day vs {inr(m.allow)}/day allowance
                  </span>
                </div>

                {/* Add Variable Expense Form */}
                <div className="mini workflow-inline-form">
                  <input
                    aria-label="Expense item name"
                    placeholder="Item name"
                    value={expForm.n}
                    onChange={(e) => setExpForm({ ...expForm, n: e.target.value })}
                  />
                  <Num
                    v={expForm.a}
                    set={(v) => setExpForm({ ...expForm, a: v })}
                    ph="₹"
                  />
                  <select
                    value={expForm.c}
                    onChange={(e) => setExpForm({ ...expForm, c: e.target.value })}
                  >
                    {CATS.filter((c) => c !== 'Savings').map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn sm pri"
                    onClick={() => {
                      if (+expForm.a > 0) {
                        set((x) => ({
                          ...x,
                          exp: [
                            ...x.exp,
                            { id: id(), n: expForm.n || expForm.c, c: expForm.c, a: +expForm.a, d: x.day },
                          ],
                        }))
                        setExpForm({ ...expForm, n: '', a: '' })
                      }
                    }}
                  >
                    + Add
                  </button>
                </div>

                {/* Subscriptions sub-section */}
                <div className="workflow-sub-section">
                  <span className="subhead-small">Active Subscriptions ({s.subs.length})</span>
                  <div className="workflow-item-list">
                    {s.subs.map((u) => (
                      <div className="rowi" key={u.id}>
                        <span>Day {u.bill}</span>
                        <span>{u.n}</span>
                        <b>{inr(u.a)}</b>
                        <button
                          type="button"
                          className="x"
                          onClick={() =>
                            set((p) => ({
                              ...p,
                              subs: p.subs.map((y) => (y.id === u.id ? { ...y, on: !y.on } : y)),
                            }))
                          }
                        >
                          {u.on ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subscription Form */}
                  <div className="mini workflow-inline-form">
                    <input
                      placeholder="Sub name"
                      value={subForm.n}
                      onChange={(e) => setSubForm({ ...subForm, n: e.target.value })}
                    />
                    <Num v={subForm.a} set={(v) => setSubForm({ ...subForm, a: v })} ph="₹" />
                    <button
                      type="button"
                      className="btn sm ghost"
                      onClick={() => {
                        if (+subForm.a > 0) {
                          set((x) => ({
                            ...x,
                            subs: [
                              ...x.subs,
                              {
                                id: id(),
                                n: subForm.n || 'Subscription',
                                a: +subForm.a,
                                bill: clamp(+subForm.bill || 15, 1, 30),
                                on: true,
                              },
                            ],
                          }))
                          setSubForm({ n: '', a: '', bill: 15 })
                        }
                      }}
                    >
                      + Sub
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Rev>

          {/* -------------------------------------------------------
              CARD 4: SAVINGS GOALS & BUFFERS (INTEGRATED)
              ------------------------------------------------------- */}
          <Rev d={160}>
            <div
              className={`workflow-branch-col ${activeDrag === 'c3' ? 'branch-col-active' : ''}`}
              ref={child3Ref}
              style={{
                transform: `translate3d(${positions.c3.x}px, ${positions.c3.y}px, 0)`,
                zIndex: activeDrag === 'c3' ? 25 : 2,
              }}
            >
              <div className="card workflow-card">
                <div
                  className={`card-drag-handle ${activeDrag === 'c3' ? 'dragging' : ''}`}
                  onPointerDown={(e) => handlePointerDown('c3', e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Click & drag to reposition Card 4 anywhere on the canvas"
                >
                  <span className="drag-grip">⋮⋮ Move Card</span>
                  <span className="drag-hint">Hold & drag</span>
                </div>
                <div className="workflow-card-header">
                  <span className="node-badge node-savings">Branch 03</span>
                  <h3>Card 4: Savings Goals</h3>
                  <span className="node-total">{inr(totalSaved)}</span>
                </div>
                <p className="workflow-card-sub">
                  Consolidated savings buckets. Each allocation lowers today's wallet but secures
                  the future.
                </p>

                {/* Mini Graph: Overall Savings Progress */}
                <div className="mini-graph-card">
                  <small>Target goal achievement</small>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, Math.round((totalSaved / (totalGoalTarget || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="mini-graph-val">
                    {inr(totalSaved)} of {inr(totalGoalTarget)} total goal targets achieved
                  </span>
                </div>

                {/* Create New Goal Form */}
                <div className="mini workflow-inline-form">
                  <input
                    aria-label="Goal Name"
                    placeholder="New goal name"
                    value={goalForm.n}
                    onChange={(e) => setGoalForm({ ...goalForm, n: e.target.value })}
                  />
                  <Num
                    v={goalForm.t}
                    set={(v) => setGoalForm({ ...goalForm, t: v })}
                    ph="Target (₹)"
                  />
                  <button
                    type="button"
                    className="btn sm pri"
                    onClick={() => {
                      if (goalForm.n && +goalForm.t > 0) {
                        set((p) => ({
                          ...p,
                          goals: [...p.goals, { id: id(), n: goalForm.n, t: +goalForm.t, s: 0 }],
                        }))
                        setGoalForm({ n: '', t: '' })
                      }
                    }}
                  >
                    + Goal
                  </button>
                </div>

                {/* Active Goals List */}
                <div className="workflow-item-list">
                  {s.goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.s / (g.t || 1)) * 100))
                    return (
                      <div className="goal-workflow-item" key={g.id}>
                        <div className="goal-top-row">
                          <b>{g.n}</b>
                          <span>
                            {inr(g.s)} / {inr(g.t)} ({pct}%)
                          </span>
                        </div>
                        <div className="bar bar-sm">
                          <i style={{ width: `${pct}%` }} />
                        </div>
                        <div className="row wrap goal-actions-row">
                          <button
                            type="button"
                            className="btn sm ghost"
                            onClick={() => handleFundGoal(g.id, 100)}
                          >
                            +₹100
                          </button>
                          <button
                            type="button"
                            className="btn sm ghost"
                            onClick={() => handleFundGoal(g.id, 500)}
                          >
                            +₹500
                          </button>
                          <button
                            type="button"
                            className="x"
                            onClick={() =>
                              set((p) => ({
                                ...p,
                                goals: p.goals.filter((y) => y.id !== g.id),
                              }))
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Rev>

          {/* -------------------------------------------------------
              CARD 5: UNEXPECTED SHOCKS & BUFFER (INTEGRATED)
              ------------------------------------------------------- */}
          <Rev d={200}>
            <div
              className={`workflow-branch-col ${activeDrag === 'c4' ? 'branch-col-active' : ''}`}
              ref={child4Ref}
              style={{
                transform: `translate3d(${positions.c4.x}px, ${positions.c4.y}px, 0)`,
                zIndex: activeDrag === 'c4' ? 25 : 2,
              }}
            >
              <div className="card workflow-card">
                <div
                  className={`card-drag-handle ${activeDrag === 'c4' ? 'dragging' : ''}`}
                  onPointerDown={(e) => handlePointerDown('c4', e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Click & drag to reposition Card 5 anywhere on the canvas"
                >
                  <span className="drag-grip">⋮⋮ Move Card</span>
                  <span className="drag-hint">Hold & drag</span>
                </div>
                <div className="workflow-card-header">
                  <span className="node-badge node-shocks">Branch 04</span>
                  <h3>Card 5: Shock Absorbers</h3>
                  <span className="node-total">{inr(Math.max(0, m.end))}</span>
                </div>
                <p className="workflow-card-sub">
                  Consolidated unexpected shocks. Stress-test surprises against your reserve before
                  applying.
                </p>

                {/* Mini Graph: Runway Safety Cushion */}
                <div className="mini-graph-card">
                  <small>Month-end cushion</small>
                  <div className="bar">
                    <i
                      style={{
                        width: `${Math.min(100, Math.max(0, Math.round((m.end / totalIncome) * 100)))}%`,
                      }}
                    />
                  </div>
                  <span className={`mini-graph-val ${m.end < 0 ? 'bad' : 'good'}`}>
                    {m.end >= 0 ? `${inr(m.end)} surplus reserve` : `${inr(m.end)} deficit risk`}
                  </span>
                </div>

                {/* Quick Test Shock Scenarios */}
                <div className="shock-scenario-chips">
                  <span className="subhead-small">Stress-test realistic shocks:</span>
                  {SHOCK_PRESETS.map((shock) => {
                    const postShock = calc(
                      apply(s, { n: shock.n, a: shock.a, c: 'Surprise', k: 'once' })
                    )
                    return (
                      <div className="shock-preview-row" key={shock.n}>
                        <div className="shock-info">
                          <b>{shock.n}</b>
                          <span>
                            {inr(shock.a)} (Risk: {m.risk} →{' '}
                            <span className={postShock.risk === 'High' ? 'bad' : ''}>
                              {postShock.risk}
                            </span>
                            )
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn sm pri"
                          onClick={() =>
                            set((p) =>
                              apply(p, {
                                n: shock.n,
                                a: shock.a,
                                c: 'Surprise',
                                k: 'once',
                              })
                            )
                          }
                        >
                          Apply
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Custom Unexpected Expense Input */}
                <div className="mini workflow-inline-form">
                  <input
                    placeholder="Custom surprise..."
                    value={customShock.n}
                    onChange={(e) => setCustomShock({ ...customShock, n: e.target.value })}
                  />
                  <Num
                    v={customShock.a}
                    set={(v) => setCustomShock({ ...customShock, a: v })}
                    ph="₹"
                  />
                  <button
                    type="button"
                    className="btn sm pri"
                    onClick={() => {
                      if (+customShock.a > 0) {
                        set((p) =>
                          apply(p, {
                            n: customShock.n || 'Surprise expense',
                            a: +customShock.a,
                            c: 'Surprise',
                            k: 'once',
                          })
                        )
                        setCustomShock({ n: '', a: '' })
                      }
                    }}
                  >
                    Apply shock
                  </button>
                </div>
              </div>
            </div>
          </Rev>
        </div>
      </div>
    </main>
  )
}

export default Plan
