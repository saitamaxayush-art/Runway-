import { inr } from '../utils/format.js'
import { calc, apply } from '../engine/finance.js'
import { Tilt } from '../components/Tilt.jsx'

export function Shocks({ s, set }) {
  const b = calc(s),
    E = [
      ['Phone screen repair', 1800],
      ['Friend wedding gift', 700],
      ['Medical visit', 500],
      ['Missed last bus, cab home', 350],
      ['Laptop charger replacement', 1200],
    ]
  return (
    <main id="main" tabIndex={-1} className="page">
      <h1>Unexpected expenses</h1>
      <p className="lead">
        Preview how a surprise changes your risk, then apply it to see the month adjust.
      </p>
      <div className="grid3">
        {E.map(([n, a]) => {
          const x = calc(apply(s, { n, a, c: 'Surprise', k: 'once' }))
          return (
            <Tilt className="card" key={n}>
              <h3>{n}</h3>
              <p className="big">{inr(a)}</p>
              <p>
                Risk {b.risk} to <b className={x.risk === 'High' ? 'bad' : ''}>{x.risk}</b>
              </p>
              <p>
                Forecast {inr(b.end)} to {inr(x.end)}
              </p>
              <button
                type="button"
                className="btn sm pri"
                onClick={() => set((p) => apply(p, { n, a, c: 'Surprise', k: 'once' }))}
              >
                Apply to my month
              </button>
            </Tilt>
          )
        })}
      </div>
    </main>
  )
}

export default Shocks
