import { useState, useEffect, useRef, useCallback } from 'react'
import { inr } from '../utils/format.js'
import { calc, apply } from '../engine/finance.js'
import { clamp } from '../utils/math.js'
import { Tilt } from '../components/Tilt.jsx'
import { Rev } from '../components/Rev.jsx'
import { Foot } from '../components/Foot.jsx'

const RING_PARTS = [
  {
    num: '01',
    title: 'Income and balance',
    desc: 'Your Rs 10,000 budget minus every logged expense, updated live with each decision.',
    tag: 'Foundation',
    badge: 'Rs 10,000 Pool',
  },
  {
    num: '02',
    title: 'Daily allowance',
    desc: 'Free money divided across days left, after fixed bills and commitments are set aside.',
    tag: 'Rhythm',
    badge: 'Dynamic Pace',
  },
  {
    num: '03',
    title: 'Commitments',
    desc: 'Rent share and phone recharges are ring-fenced before you can spend a single rupee.',
    tag: 'Fixed Outflows',
    badge: 'Locked First',
  },
  {
    num: '04',
    title: 'Subscriptions',
    desc: 'Quiet recurring leaks. Switch one off and watch your daily allowance rise in real time.',
    tag: 'Quiet Leaks',
    badge: 'Monthly Billed',
  },
  {
    num: '05',
    title: 'Shocks',
    desc: 'Simulate broken screens, urgent travel or health shocks and see risk level jump instantly.',
    tag: 'Stress Test',
    badge: 'Shockproof',
  },
  {
    num: '06',
    title: 'Health score',
    desc: 'One 0 to 100 score built from runway duration, savings pace and subscription load.',
    tag: 'Vitality',
    badge: 'Composite Health',
  },
]

const PURCHASE_PRESETS = [
  { n: 'Weekend food feast', a: 650, c: 'Food' },
  { n: 'Live concert ticket', a: 2500, c: 'Fun' },
  { n: 'New training sneakers', a: 3200, c: 'Fun' },
  { n: 'Late night emergency cab', a: 420, c: 'Transport' },
  { n: 'Quarterly streaming sub', a: 499, c: 'Bills' },
]

export function Home({ s }) {
  const m = calc(s)
  const [mx, setMx] = useState(0)

  // Interactive purchase simulator state
  const [purchaseAmount, setPurchaseAmount] = useState(1500)
  const [purchaseName, setPurchaseName] = useState('New jacket')
  const [purchaseCat, setPurchaseCat] = useState('Fun')

  const simulatedState = apply(s, {
    a: purchaseAmount,
    n: purchaseName || 'Purchase',
    c: purchaseCat,
    k: 'once',
  })
  const mm = calc(simulatedState)

  // 3D Circular Ring Scroll State with 60 FPS Lerp Engine
  const ringRef = useRef(null)
  const targetProgRef = useRef(0)
  const currentProgRef = useRef(0)
  const rafRef = useRef(null)

  const [smoothProg, setSmoothProg] = useState(0)
  const [bgDarkOpacity, setBgDarkOpacity] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  // 60 FPS RAF Loop with silky smooth damping
  const startRafLoop = useCallback(() => {
    if (rafRef.current) return
    const step = () => {
      const diff = targetProgRef.current - currentProgRef.current
      if (Math.abs(diff) > 0.0001) {
        currentProgRef.current += diff * 0.14 // 60 FPS damping
        const p = currentProgRef.current
        setSmoothProg(p)

        // Calculate active card index
        const rotationProg = clamp((p - 0.12) / 0.76, 0, 1)
        const idx = Math.min(5, Math.floor(rotationProg * 5.99))
        setActiveIndex(idx)

        rafRef.current = requestAnimationFrame(step)
      } else {
        currentProgRef.current = targetProgRef.current
        const p = currentProgRef.current
        setSmoothProg(p)
        const rotationProg = clamp((p - 0.12) / 0.76, 0, 1)
        const idx = Math.min(5, Math.floor(rotationProg * 5.99))
        setActiveIndex(idx)
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [])

  const handleRingScroll = useCallback(() => {
    const el = ringRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const winH = window.innerHeight
    const maxScroll = el.offsetHeight - winH
    if (maxScroll <= 0) return

    // Overall track progress
    const rawProg = clamp(-rect.top / maxScroll, 0, 1)
    targetProgRef.current = rawProg

    // Background opacity calculated instantly for zero latency
    let bgOpacity = 0
    if (rect.top > 0) {
      bgOpacity = clamp((winH - rect.top) / winH, 0, 1)
    } else if (rawProg < 0.88) {
      bgOpacity = 1
    } else {
      bgOpacity = clamp((1 - rawProg) / 0.12, 0, 1)
    }
    setBgDarkOpacity(bgOpacity)

    startRafLoop()
  }, [startRafLoop])

  useEffect(() => {
    window.addEventListener('scroll', handleRingScroll, { passive: true })
    window.addEventListener('resize', handleRingScroll)
    handleRingScroll()
    return () => {
      window.removeEventListener('scroll', handleRingScroll)
      window.removeEventListener('resize', handleRingScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleRingScroll])

  const jumpToRingCard = (index) => {
    const el = ringRef.current
    if (!el) return
    const maxScroll = el.offsetHeight - window.innerHeight
    const targetProg = 0.12 + (index / 5) * 0.76
    const targetScroll = el.offsetTop + targetProg * maxScroll
    targetProgRef.current = targetProg
    startRafLoop()
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  // Ring rotation & multi-quadrant spatial coordinates derived from smoothProg
  const rotationProgress = clamp((smoothProg - 0.12) / 0.76, 0, 1)
  const currentRotIndex = rotationProgress * 5

  const allowanceDiff = m.allow - mm.allow
  const forecastDiff = m.end - mm.end
  const balancePercentSpent = Math.min(100, Math.round((purchaseAmount / (m.bal || 1)) * 100))

  return (
    <div className="overview-page">
      {/* SECTION 1: HERO (CHAMPAGNE BACKGROUND) */}
      <section id="main" tabIndex={-1} className="hero overview-hero">
        <div className="ht">
          <p className="kicker">Personal finance for a 30 day month</p>
          <h1>Ten thousand rupees. Thirty days. See what each choice costs before you make it.</h1>
          <p className="lead">
            Runway connects your balance, bills, subscriptions, goals and surprise expenses into one
            forecast. Simulate a purchase, read the damage, then decide.
          </p>
          <div className="row wrap">
            <a className="btn pri" href="#/dashboard">
              Open dashboard
            </a>
            <a className="btn" href="#/simulate">
              Try the simulator
            </a>
          </div>
        </div>
        <div
          className="scene"
          onMouseMove={(e) => {
            const b = e.currentTarget.getBoundingClientRect()
            setMx((e.clientX - b.left) / b.width - 0.5)
          }}
          onMouseLeave={() => setMx(0)}
        >
          <div
            className="stack"
            style={{ transform: `rotateX(58deg) rotateZ(${-30 + mx * 30}deg)` }}
          >
            <div className="layer l1">
              <small>Balance</small>
              <b>{inr(m.bal)}</b>
            </div>
            <div className="layer l2">
              <small>Daily allowance</small>
              <b>{inr(m.allow)}</b>
            </div>
            <div className="layer l3">
              <small>Risk</small>
              <b>{m.risk}</b>
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} aria-hidden="true" className={'coin c' + i}>
              <span>₹</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: ONE LOOP SIX CONNECTED PARTS (FULL-PAGE 3D CIRCULAR RING WITH SMOOTH BACKGROUND REVEAL) */}
      <section className="ring-section" ref={ringRef}>
        {/* Full Viewport Smooth Background Reveal Layer */}
        <div
          className="ring-backdrop-layer"
          style={{ opacity: bgDarkOpacity }}
          aria-hidden="true"
        />

        <div className="ring-sticky-stage">
          {/* Ambient Background Animation Behind the Cards */}
          <div className="ring-ambient-backdrop" aria-hidden="true">
            <div className="ring-ambient-orb ring-ambient-orb-1" />
            <div className="ring-ambient-orb ring-ambient-orb-2" />
            <svg className="ring-orbital-mesh" viewBox="0 0 800 800">
              <circle cx="400" cy="400" r="320" className="mesh-ring mesh-ring-1" />
              <circle cx="400" cy="400" r="260" className="mesh-ring mesh-ring-2" />
              <circle cx="400" cy="400" r="200" className="mesh-ring mesh-ring-3" />
              <line x1="80" y1="400" x2="720" y2="400" className="mesh-axis" />
            </svg>
          </div>

          <div className="ring-stage-content">
            <div className="ring-header">
              <span className="ring-kicker">Interactive Architecture</span>
              <h2>One loop, six connected parts</h2>
              <p className="ring-lead">
                Every rupee flows through one connected loop. Scroll through to rotate the 3D ring and
                reveal each part in focus.
              </p>
            </div>

            <div className="ring-viewport">
              <div className="ring-carousel">
                {RING_PARTS.map((part, i) => {
                  const diff = i - currentRotIndex
                  const absDiff = Math.abs(diff)
                  const isFocused = absDiff <= 0.45
                  const isNear = absDiff <= 1.35

                  // Multi-quadrant spatial coordinates:
                  // Center stage (diff ~ 0): (0, 0, 110px) - Center, elevated, 100% crisp focus
                  // Past cards (diff < 0): float upward & to the left
                  // Upcoming cards (diff > 0): glide up from bottom-right into center focus
                  const tx = Math.max(-620, Math.min(620, diff * 350))
                  const ty = Math.max(-85, Math.min(85, diff * 42))
                  const tz = Math.max(-460, 110 - absDiff * 180)
                  const rotY = Math.max(-40, Math.min(40, -diff * 22))
                  const scale = Math.max(0.72, 1.06 - absDiff * 0.12)
                  const opacity = Math.max(0.25, 1 - absDiff * 0.35)

                  return (
                    <div
                      key={part.title}
                      className={`ring-card ${isFocused ? 'ring-card-focus' : isNear ? 'ring-card-near' : 'ring-card-far'}`}
                      style={{
                        transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${rotY}deg) scale(${scale})`,
                        opacity,
                        zIndex: Math.round(30 - absDiff * 8),
                      }}
                      onClick={() => jumpToRingCard(i)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect part ${part.num}: ${part.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          jumpToRingCard(i)
                        }
                      }}
                    >
                      <div className="ring-card-top">
                        <span className="ring-card-num">{part.num}</span>
                        <span className="ring-card-tag">{part.tag}</span>
                      </div>
                      <h3>{part.title}</h3>
                      <p>{part.desc}</p>
                      <div className="ring-card-footer">
                        <span className="ring-card-badge">{part.badge}</span>
                        <span className="ring-card-inspect">
                          {isFocused ? 'Active focus' : 'Click to inspect'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="ring-controls">
              <div className="ring-dots">
                {RING_PARTS.map((p, i) => (
                  <button
                    type="button"
                    key={p.num}
                    className={`ring-dot ${activeIndex === i ? 'on' : ''}`}
                    onClick={() => jumpToRingCard(i)}
                    aria-label={`Jump to part ${p.num}`}
                  >
                    <span>{p.num}</span>
                  </button>
                ))}
              </div>
              <div className="ring-status">
                <b>
                  0{activeIndex + 1} / 0{RING_PARTS.length}
                </b>
                <span>{RING_PARTS[activeIndex].title}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRY ONE PURCHASE, RIGHT HERE (INTERACTIVE EXPERIENCE) */}
      <section className="sec purchase-sim-sec">
        <Rev>
          <div className="purchase-sim-header">
            <span className="kicker">Live Decision Lab</span>
            <h2>Try one purchase, right here</h2>
            <p className="lead">
              Test an impulsive buy or planned expense against the live financial engine. Watch how
              every single rupee ripples into your daily allowance, monthly forecast, and risk
              rating before you commit.
            </p>
          </div>
        </Rev>

        <div className="purchase-sim-grid">
          {/* INTERACTIVE CONTROLS PANEL */}
          <Rev d={60}>
            <div className="card purchase-controls-card">
              <h3>Configure the spend</h3>
              <p className="purchase-subtext">Click any preset or adjust the amount manually:</p>

              {/* Quick Preset Buttons */}
              <div className="preset-chips">
                {PURCHASE_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.n}
                    className={`preset-chip ${purchaseAmount === preset.a && purchaseName === preset.n ? 'active' : ''}`}
                    onClick={() => {
                      setPurchaseName(preset.n)
                      setPurchaseAmount(preset.a)
                      setPurchaseCat(preset.c)
                    }}
                  >
                    <span>{preset.n}</span>
                    <b>{inr(preset.a)}</b>
                  </button>
                ))}
              </div>

              {/* Amount Range Slider */}
              <div className="purchase-slider-wrap">
                <div className="purchase-slider-label">
                  <label htmlFor="purchase-amount-slider">Spend amount</label>
                  <b className="purchase-amount-highlight">{inr(purchaseAmount)}</b>
                </div>
                <input
                  id="purchase-amount-slider"
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(+e.target.value)}
                />
                <div className="purchase-slider-ticks">
                  <span>₹0</span>
                  <span>₹1,500</span>
                  <span>₹3,000</span>
                  <span>₹5,000</span>
                </div>
              </div>

              {/* Quick Stepper Nudges */}
              <div className="stepper-row">
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setPurchaseAmount((v) => Math.max(0, v - 100))}
                >
                  -₹100
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setPurchaseAmount((v) => Math.min(5000, v + 100))}
                >
                  +₹100
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setPurchaseAmount((v) => Math.min(5000, v + 500))}
                >
                  +₹500
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setPurchaseAmount((v) => Math.min(5000, v + 1000))}
                >
                  +₹1,000
                </button>
                <button
                  type="button"
                  className="btn sm ghost"
                  onClick={() => setPurchaseAmount(0)}
                >
                  Clear
                </button>
              </div>

              {/* Category selector */}
              <div className="purchase-cat-row">
                <label>
                  Category
                  <select value={purchaseCat} onChange={(e) => setPurchaseCat(e.target.value)}>
                    <option value="Food">Food</option>
                    <option value="Fun">Fun</option>
                    <option value="Transport">Transport</option>
                    <option value="Study">Study</option>
                    <option value="Bills">Bills</option>
                  </select>
                </label>
              </div>
            </div>
          </Rev>

          {/* LIVE IMPACT DASHBOARD PANEL */}
          <Rev d={120}>
            <div className="card purchase-impact-card">
              <div className="impact-card-top">
                <h3>Consequence forecast</h3>
                <span
                  className={`risk-badge ${mm.risk === 'High' ? 'risk-high' : mm.risk === 'Medium' ? 'risk-med' : 'risk-low'}`}
                >
                  {mm.risk} Risk
                </span>
              </div>

              <div className="impact-metrics-grid">
                <div className="impact-metric-box">
                  <small>Daily allowance</small>
                  <div className="metric-flow">
                    <span className="metric-prev">{inr(m.allow)}</span>
                    <span className="metric-arrow">→</span>
                    <b className="metric-curr">{inr(mm.allow)}</b>
                  </div>
                  {allowanceDiff > 0 && (
                    <span className="metric-delta delta-bad">
                      -{inr(allowanceDiff)}/day for {30 - s.day} days
                    </span>
                  )}
                </div>

                <div className="impact-metric-box">
                  <small>Day 30 forecast</small>
                  <div className="metric-flow">
                    <span className="metric-prev">{inr(m.end)}</span>
                    <span className="metric-arrow">→</span>
                    <b className="metric-curr">{inr(mm.end)}</b>
                  </div>
                  {forecastDiff > 0 && (
                    <span className="metric-delta delta-bad">-{inr(forecastDiff)} reserve</span>
                  )}
                </div>

                <div className="impact-metric-box">
                  <small>Financial health score</small>
                  <div className="metric-flow">
                    <span className="metric-prev">{m.health}</span>
                    <span className="metric-arrow">→</span>
                    <b className="metric-curr">{mm.health}</b>
                  </div>
                  <span className="metric-delta delta-neutral">out of 100 points</span>
                </div>

                <div className="impact-metric-box">
                  <small>Balance bite</small>
                  <div className="metric-flow">
                    <b className="metric-curr">{balancePercentSpent}%</b>
                  </div>
                  <span className="metric-delta delta-neutral">of remaining cash</span>
                </div>
              </div>

              {/* Actionable Feedback Banner */}
              <div className={`impact-alert-banner ${mm.end < 0 ? 'banner-alert' : 'banner-safe'}`}>
                {mm.end < 0 ? (
                  <p>
                    <b>Deficit Alert:</b> This spend causes a projected shortfall of{' '}
                    {inr(-mm.end)} by day 30. You will run out of money before month end.
                  </p>
                ) : allowanceDiff > 100 ? (
                  <p>
                    <b>Substantial Squeeze:</b> Absorbing this cuts your daily lunch budget by{' '}
                    {inr(allowanceDiff)} every day.
                  </p>
                ) : (
                  <p>
                    <b>Absorbable:</b> Your daily allowance remains at {inr(mm.allow)} and your
                    runway stays stable in the {mm.risk.toLowerCase()} risk tier.
                  </p>
                )}
              </div>

              <div className="impact-actions">
                <a className="btn pri" href="#/simulate">
                  Test full simulator
                </a>
                <a className="btn ghost" href="#/dashboard">
                  View live dashboard
                </a>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      <Foot />
    </div>
  )
}

export default Home
