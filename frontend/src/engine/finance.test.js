import { describe, it, expect } from 'vitest'
import { calc, series, apply } from './finance.js'
import { INIT } from '../data/initialState.js'

describe('calc', () => {
  it('balance is budget minus spending', () => expect(calc(INIT).bal).toBe(7000))
  it('income raises the balance', () => {
    const s = { ...INIT, inc: [{ id: 9, n: 'Gig', a: 1000, d: 5 }] }
    expect(calc(s).income).toBe(11000)
    expect(calc(s).bal).toBe(8000)
  })
  it('daily allowance is never negative', () =>
    expect(calc(apply(INIT, { a: 9000, c: 'Fun', k: 'once' })).allow).toBe(0))
  it('flags high risk when the forecast is negative', () =>
    expect(calc(apply(INIT, { a: 6000, c: 'Fun', k: 'once' })).risk).toBe('High'))
  it('keeps health within 0 to 100', () => {
    const h = calc(INIT).health
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(100)
  })
})
describe('apply', () => {
  it('ignores a zero amount', () => expect(apply(INIT, { a: 0 })).toBe(INIT))
  it('adds a one-time expense without mutating', () => {
    const n = apply(INIT, { a: 100, c: 'Fun', k: 'once' })
    expect(n.exp).toHaveLength(INIT.exp.length + 1)
    expect(INIT.exp).toHaveLength(6)
  })
  it('adds a subscription', () =>
    expect(apply(INIT, { a: 99, k: 'sub' }).subs).toHaveLength(INIT.subs.length + 1))
  it('reserves a weekly habit until day 30', () =>
    expect(apply(INIT, { a: 100, k: 'weekly' }).com.at(-1).a).toBe(300))
})
describe('series', () => {
  it('returns 30 daily points', () => expect(series(INIT)).toHaveLength(30))
  it('starts from actuals and ends at the forecast', () =>
    expect(Math.round(series(INIT)[29])).toBe(calc(INIT).end))
})
