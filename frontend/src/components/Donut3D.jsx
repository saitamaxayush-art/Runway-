import { useState } from 'react'
import { COL } from '../data/constants.js'
import { inr } from '../utils/format.js'

export function Donut3D({ parts, total, label, interactive = true }) {
  const [hovered, setHovered] = useState(null)
  const [tilt, setTilt] = useState({ rx: 36, ry: -10 })

  const R = 72
  const C = 2 * Math.PI * R
  let off = 0

  const handleMouseMove = (e) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({
      rx: 36 - y * 24,
      ry: -10 + x * 24,
    })
  }

  const handleMouseLeave = () => {
    setHovered(null)
    setTilt({ rx: 36, ry: -10 })
  }

  const activePart = hovered ? parts.find((p) => p.l === hovered) : null

  return (
    <div
      className="donut-3d-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="donut-3d-wrapper"
        style={{
          transform: `perspective(750px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        }}
      >
        {/* Underneath 3D Extrusion Shadow Layer */}
        <svg
          viewBox="0 0 220 220"
          className="donut-3d-shadow"
          aria-hidden="true"
        >
          <circle
            cx="110"
            cy="120"
            r={R}
            fill="none"
            stroke="rgba(6, 78, 59, 0.22)"
            strokeWidth="32"
          />
        </svg>

        {/* Mid-Depth Extrusion Rim Layer */}
        <svg
          viewBox="0 0 220 220"
          className="donut-3d-rim"
          aria-hidden="true"
        >
          {parts
            .filter((p) => p.v > 0)
            .map((p) => {
              const len = (p.v / total) * C
              const el = (
                <circle
                  key={'rim-' + p.l}
                  cx="110"
                  cy="114"
                  r={R}
                  fill="none"
                  stroke={COL[p.l] || '#064E3B'}
                  strokeWidth="28"
                  strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
                  strokeDashoffset={-off}
                  transform="rotate(-90 110 114)"
                  opacity="0.65"
                />
              )
              off += len
              return el
            })}
        </svg>

        {/* Top 3D Face Ring */}
        <svg
          viewBox="0 0 220 220"
          className="donut-3d-top"
          role="img"
          aria-label={`3D Allocation chart: ${label[0]} ${label[1]}`}
        >
          {(() => {
            let offsetAcc = 0
            return parts
              .filter((p) => p.v > 0)
              .map((p) => {
                const len = (p.v / total) * C
                const isHovered = hovered === p.l
                const el = (
                  <circle
                    key={p.l}
                    cx="110"
                    cy="108"
                    r={R}
                    fill="none"
                    stroke={COL[p.l] || '#064E3B'}
                    strokeWidth={isHovered ? '32' : '26'}
                    strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
                    strokeDashoffset={-offsetAcc}
                    transform="rotate(-90 110 108)"
                    className={`seg-3d ${isHovered ? 'seg-active' : ''}`}
                    onMouseEnter={() => setHovered(p.l)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${p.l}: ${inr(p.v)} (${Math.round((p.v / total) * 100)}%)`}
                    style={{
                      cursor: 'pointer',
                      transition: 'stroke-width 0.3s ease, filter 0.3s ease',
                      filter: isHovered
                        ? 'brightness(1.15) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        : 'none',
                    }}
                  />
                )
                offsetAcc += len
                return el
              })
          })()}

          {/* Central Label */}
          <text x="110" y="104" textAnchor="middle" className="dl-3d">
            {activePart ? inr(activePart.v) : label[0]}
          </text>
          <text x="110" y="124" textAnchor="middle" className="ds-3d">
            {activePart ? activePart.l : label[1]}
          </text>
        </svg>
      </div>

      {/* Floating 3D Tooltip when slice is hovered */}
      {activePart && (
        <div className="donut-3d-tooltip" role="tooltip">
          <b>{activePart.l}</b>
          <span>
            {inr(activePart.v)} ({Math.round((activePart.v / total) * 100)}%)
          </span>
        </div>
      )}
    </div>
  )
}

export default Donut3D
