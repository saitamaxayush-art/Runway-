import { useState } from 'react'
import { series } from '../engine/finance.js'
import { inr } from '../utils/format.js'

export function Line3D({ s, simState = null }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const ys = series(s)
  const simYs = simState ? series(simState) : null

  const allVals = simYs ? [...ys, ...simYs] : ys
  const mx = Math.max(s.budget, ...allVals)
  const mn = Math.min(0, ...allVals)

  const W = 620
  const H = 220
  const padLeft = 32
  const padRight = 32
  const padTop = 30
  const padBottom = 40

  const plotW = W - padLeft - padRight
  const plotH = H - padTop - padBottom

  const X = (i) => padLeft + i * (plotW / 29)
  const Y = (v) => padTop + plotH - ((v - mn) / (mx - mn || 1)) * plotH

  // Main actual points up to current day
  const actualPoints = ys
    .slice(0, s.day)
    .map((v, i) => `${X(i)},${Y(v)}`)
    .join(' ')

  // Main projected points from current day to day 30
  const projPoints = ys
    .slice(s.day - 1)
    .map((v, i) => `${X(i + s.day - 1)},${Y(v)}`)
    .join(' ')

  // 3D Shadow Ribbon path
  const shadowPoints = ys
    .map((v, i) => `${X(i)},${Y(v) + 12}`)
    .join(' ')

  // Area under curve for depth
  const areaPoints = `${X(0)},${Y(0)} ${actualPoints} ${projPoints} ${X(29)},${Y(0)}`

  // Simulated projected line if simulator preview is on
  const simProjPoints = simYs
    ? simYs
        .slice(s.day - 1)
        .map((v, i) => `${X(i + s.day - 1)},${Y(v)}`)
        .join(' ')
    : null

  const hoveredDay = hoverIndex !== null ? hoverIndex + 1 : s.day
  const hoveredVal = hoverIndex !== null ? ys[hoverIndex] : ys[s.day - 1]
  const simHoveredVal = simYs && hoverIndex !== null ? simYs[hoverIndex] : null

  return (
    <div className="line-3d-stage">
      <div className="line-3d-hud">
        <div className="line-hud-badge">
          <span>Day {hoveredDay} balance:</span>
          <b>{inr(hoveredVal)}</b>
          {simHoveredVal !== null && (
            <span className="line-hud-sim-preview">
              (Preview: <b>{inr(simHoveredVal)}</b>)
            </span>
          )}
        </div>
      </div>

      <div className="line-3d-viewport">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="line-3d-svg"
          role="img"
          aria-label="3D Balance forecast across 30 days"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="line3d-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#064E3B" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="line3d-sim-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C5A12" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8C5A12" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 3D Depth Isometric Grid Planes */}
          <line
            x1={padLeft}
            x2={W - padRight}
            y1={Y(0)}
            y2={Y(0)}
            className="zero-3d"
          />

          {/* 3D Depth Area */}
          <polygon points={areaPoints} fill="url(#line3d-area-grad)" />

          {/* Extruded Depth Shadow Ribbon */}
          <polyline
            points={shadowPoints}
            className="line-3d-shadow-ribbon"
            fill="none"
          />

          {/* Actual spent trajectory */}
          <polyline
            points={actualPoints}
            className="act-3d"
            fill="none"
          />

          {/* Standard Projection */}
          <polyline
            points={projPoints}
            className="proj-3d"
            fill="none"
          />

          {/* Simulated Preview Projection (if preview active) */}
          {simProjPoints && (
            <polyline
              points={simProjPoints}
              className="sim-proj-3d"
              fill="none"
            />
          )}

          {/* Day markers / interactive scrub targets */}
          {ys.map((v, i) => {
            const x = X(i)
            const y = Y(v)
            const isToday = i === s.day - 1
            const isHovered = i === hoverIndex
            return (
              <g
                key={i}
                className="day-node-group"
                onMouseEnter={() => setHoverIndex(i)}
                style={{ cursor: 'pointer' }}
              >
                {/* Transparent hit target */}
                <rect
                  x={x - 10}
                  y={padTop}
                  width="20"
                  height={plotH}
                  fill="transparent"
                />

                {(isToday || isHovered) && (
                  <line
                    x1={x}
                    x2={x}
                    y1={padTop}
                    y2={padTop + plotH}
                    className="scrub-line-3d"
                  />
                )}

                {isToday && (
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    className="today-node-3d"
                  />
                )}

                {isHovered && !isToday && (
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="hover-node-3d"
                  />
                )}
              </g>
            )
          })}

          {/* Axis Labels */}
          <text x={padLeft} y={H - 12} className="ax-3d">
            Day 1
          </text>
          <text x={W - padRight} y={H - 12} textAnchor="end" className="ax-3d">
            Day 30
          </text>
          <text x={padLeft} y={Y(0) - 8} className="ax-3d zero-label">
            Zero baseline
          </text>
        </svg>
      </div>
    </div>
  )
}

export default Line3D
