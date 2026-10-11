import { clamp, sum } from '../utils/math.js'

/** Derives balance, reserved bills, daily allowance, forecast, risk and health from the month state. */
export const calc = (s) => {
  const spent = sum(s.exp, (e) => e.a),
    income = s.budget + sum(s.inc || [], (i) => i.a),
    bal = income - spent
  const cs = s.com.filter((c) => c.due >= s.day),
    ss = s.subs.filter((u) => u.on && u.bill >= s.day)
  const res = sum(cs, (c) => c.a) + sum(ss, (u) => u.a),
    left = Math.max(1, 31 - s.day),
    free = bal - res
  const allow = Math.max(0, Math.floor(free / left))
  const vs = sum(
      s.exp.filter((e) => !['Savings', 'Bills'].includes(e.c)),
      (e) => e.a,
    ),
    pace = vs / Math.max(1, s.day)
  const end = Math.round(free - pace * (30 - s.day)),
    saved = sum(s.goals, (g) => g.s),
    subTotal = sum(
      s.subs.filter((u) => u.on),
      (u) => u.a,
    )
  const risk = end < 0 ? 'High' : end < 800 ? 'Medium' : 'Low'
  const health = clamp(
    Math.round(55 + Math.min(25, end / 60) + Math.min(15, saved / 100) - subTotal / 20),
    0,
    100,
  )
  const byCat = {}
  s.exp.forEach((e) => (byCat[e.c] = (byCat[e.c] || 0) + e.a))
  return {
    income,
    spent,
    bal,
    res,
    free,
    allow,
    pace,
    end,
    saved,
    subTotal,
    risk,
    health,
    byCat,
    left,
  }
}

/** Returns 30 daily balances: actuals up to today, then a projection from the spending pace plus upcoming bills. */
export const series = (s) => {
  const m = calc(s),
    o = []
  for (let d = 1; d <= 30; d++) {
    if (d <= s.day)
      o.push(
        s.budget +
          sum(
            (s.inc || []).filter((i) => i.d <= d),
            (i) => i.a,
          ) -
          sum(
            s.exp.filter((e) => e.d <= d),
            (e) => e.a,
          ),
      )
    else {
      const f =
        sum(
          s.com.filter((c) => c.due >= s.day && c.due <= d),
          (c) => c.a,
        ) +
        sum(
          s.subs.filter((u) => u.on && u.bill >= s.day && u.bill <= d),
          (u) => u.a,
        )
      o.push(m.bal - m.pace * (d - s.day) - f)
    }
  }
  return o
}

/** Returns a new state with a simulated decision (one-time, weekly or subscription) applied. Never mutates. */
export const apply = (s, f) => {
  const a = +f.a || 0
  if (!a) return s
  const n = f.n || 'Planned decision',
    id = Date.now()
  if (f.k === 'sub') return { ...s, subs: [...s.subs, { id, n, a, bill: s.day, on: true }] }
  if (f.k === 'weekly')
    return {
      ...s,
      com: [
        ...s.com,
        { id, n: n + ' (weekly)', a: a * (Math.floor((30 - s.day) / 7) + 1), due: 30 },
      ],
    }
  return { ...s, exp: [...s.exp, { id, n, c: f.c, a, d: s.day }] }
}

/** Builds the donut chart segments: spent per category, upcoming bills and free money. */
export const allocParts = (s, m) => [
  ...Object.entries(m.byCat).map(([l, v]) => ({ l, v })),
  { l: 'Upcoming', v: m.res },
  { l: 'Free', v: Math.max(0, m.free) },
]
