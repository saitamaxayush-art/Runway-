export const clamp = (x, a, b) => Math.max(a, Math.min(b, x))

export const sum = (a, f) => a.reduce((x, y) => x + f(y), 0)
