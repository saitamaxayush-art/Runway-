import { useState } from 'react'
import { COL } from '../data/constants.js'
import { inr } from '../utils/format.js'

export function Bars3D({ items, total = 10000 }) {
  const [activeItem, setActiveItem] = useState(null)

  const maxVal = Math.max(1000, ...items.map((it) => it.v || 0))

  return (
    <div className="bars-3d-stage">
      <div className="bars-3d-grid">
        {items.map((it) => {
          const pct = Math.min(100, Math.round(((it.v || 0) / maxVal) * 100))
          const share = Math.round(((it.v || 0) / (total || 1)) * 100)
          const isSelected = activeItem === it.l

          return (
            <div
              key={it.l}
              className={`bar-3d-col ${isSelected ? 'bar-selected' : ''}`}
              onMouseEnter={() => setActiveItem(it.l)}
              onMouseLeave={() => setActiveItem(null)}
              role="button"
              tabIndex={0}
              aria-label={`${it.l}: ${inr(it.v)} (${share}% of total)`}
            >
              <div className="bar-3d-meta">
                <span className="bar-val">{inr(it.v)}</span>
                <span className="bar-share">{share}%</span>
              </div>

              {/* 3D Prism Column */}
              <div className="bar-prism-track">
                <div
                  className="bar-prism-pillar"
                  style={{
                    height: `${Math.max(8, pct)}%`,
                    '--bar-col': COL[it.l] || '#064E3B',
                  }}
                >
                  <div className="prism-face prism-top" />
                  <div className="prism-face prism-front" />
                  <div className="prism-face prism-side" />
                </div>
              </div>

              <span className="bar-label">{it.l}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Bars3D
