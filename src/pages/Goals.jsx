import { useState } from 'react'
import { inr } from '../utils/format.js'
import { calc } from '../engine/finance.js'
import { Tilt } from '../components/Tilt.jsx'
import { Num } from '../components/Num.jsx'
import { Rev } from '../components/Rev.jsx'

export function Goals({ s, set }) {
  const m = calc(s),
    [g, setG] = useState({ n: '', t: '' })
  const put = (gid, a) =>
    set((p) => {
      if (a > calc(p).bal) return p
      return {
        ...p,
        goals: p.goals.map((y) => (y.id === gid ? { ...y, s: Math.min(y.t, y.s + a) } : y)),
        exp: [
          ...p.exp,
          { id: Date.now() + Math.random(), n: 'Goal transfer', c: 'Savings', a, d: p.day },
        ],
      }
    })
  return (
    <main id="main" tabIndex={-1} className="page">
      <Rev>
        <h1>Savings goals</h1>
        <p className="lead">Each transfer leaves your balance and lowers today's allowance.</p>
      </Rev>
      <Rev d={80}>
        <div className="grid2">
        {s.goals.map((x) => {
          const rem = x.t - x.s,
            need = rem / m.left,
            fit = need <= m.allow
          return (
            <Tilt className="card" key={x.id}>
              <h3>{x.n}</h3>
              <div className="bar">
                <i style={{ width: (x.s / x.t) * 100 + '%' }} />
              </div>
              <p>
                {inr(x.s)} of {inr(x.t)}
              </p>
              <p className={fit ? 'good' : 'bad'}>
                {rem <= 0
                  ? 'Goal reached.'
                  : `Needs ${inr(need)} a day. ${fit ? 'Fits' : 'Exceeds'} your allowance of ${inr(m.allow)}.`}
              </p>
              <div className="row wrap">
                <button type="button" className="btn sm" onClick={() => put(x.id, 100)}>
                  Add 100
                </button>
                <button type="button" className="btn sm" onClick={() => put(x.id, 500)}>
                  Add 500
                </button>
                <button
                  type="button"
                  className="x"
                  onClick={() =>
                    set((p) => ({ ...p, goals: p.goals.filter((y) => y.id !== x.id) }))
                  }
                >
                  Delete
                </button>
              </div>
            </Tilt>
          )
        })}
        <div className="card">
          <h3>New goal</h3>
          <label>
            Name
            <input value={g.n} onChange={(e) => setG({ ...g, n: e.target.value })} />
          </label>
          <label>
            Target in rupees
            <Num v={g.t} set={(v) => setG({ ...g, t: v })} ph="0" />
          </label>
          <button
            type="button"
            className="btn pri"
            onClick={() => {
              if (g.n && +g.t > 0) {
                set((p) => ({
                  ...p,
                  goals: [...p.goals, { id: Date.now(), n: g.n, t: +g.t, s: 0 }],
                }))
                setG({ n: '', t: '' })
              }
            }}
          >
            Create goal
          </button>
        </div>
      </div>
      </Rev>
    </main>
  )
}

export default Goals
