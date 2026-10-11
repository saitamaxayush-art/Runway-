import { useState, useEffect, useRef, useCallback } from 'react'
import { inr } from '../utils/format.js'
import { clamp, sum } from '../utils/math.js'
import { SEG, CH } from '../data/story.js'
import { Ladder } from '../components/Ladder.jsx'
import { useNum } from '../hooks/useNum.js'

const CHAPTER_TIMES = [
  [0.0, 1.5], // chapter 0 = 0.0s to 1.5s (whole slab)
  [1.5, 3.8], // chapter 1 = 1.5s to 3.8s (rent section slides out)
  [3.8, 5.0], // chapter 2 = 3.8s to 5.0s (thin slivers peel away)
  [5.0, 6.5], // chapter 3 = 5.0s to 6.5s (the black block drops and breaks the slab)
  [6.5, 8.5], // chapter 4 = 6.5s to 8.5s (daily spending and goals slide out)
  [8.5, 10.0], // chapter 5 = 8.5s to 10.0s (overhead view, what remains)
]

function getTargetTime(progress) {
  const c = Math.min(5, Math.floor(progress * 6))
  const localFraction = clamp(progress * 6 - c, 0, 1)
  const [start, end] = CHAPTER_TIMES[c]
  return start + (end - start) * localFraction
}

export function Story() {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const [p, setP] = useState(0)
  const [m, setM] = useState({ x: 0.5, y: 0.5 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [posterVisible, setPosterVisible] = useState(true)

  const targetTimeRef = useRef(0)
  const currentTimeRef = useRef(0)
  const readyRef = useRef(false)
  const isIntersectingRef = useRef(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e) => setReducedMotion(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const updateScroll = () => {
      const maxScroll = el.offsetHeight - window.innerHeight
      if (maxScroll <= 0) return
      const progress = clamp(-el.getBoundingClientRect().top / maxScroll, 0, 1)
      setP(progress)
      targetTimeRef.current = getTargetTime(progress)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      isIntersectingRef.current = entry.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion || videoError) return
    let rafId
    const loop = () => {
      if (isIntersectingRef.current) {
        const target = targetTimeRef.current
        currentTimeRef.current += (target - currentTimeRef.current) * 0.08
        const vid = videoRef.current
        if (vid && readyRef.current) {
          if (Math.abs(vid.currentTime - currentTimeRef.current) > 1 / 48) {
            try {
              vid.currentTime = currentTimeRef.current
            } catch {
              // ignore seek interruptions
            }
          }
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [reducedMotion, videoError])

  const handleLoadedMetadata = () => {
    readyRef.current = true
    const vid = videoRef.current
    if (vid) {
      vid.pause()
      try {
        vid.currentTime = targetTimeRef.current
      } catch {
        // ignore
      }
    }
  }

  const handleSeeked = () => {
    setPosterVisible(false)
  }

  const handleVideoError = () => {
    setVideoError(true)
  }

  const jump = useCallback((i) => {
    const el = ref.current
    if (!el) return
    const maxScroll = el.offsetHeight - window.innerHeight
    const top = el.offsetTop + ((i + 0.5) / 6) * maxScroll
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const c = Math.min(5, Math.floor(p * 6))
  const shown = SEG.filter((x) => x.ch <= c)
  const free = 10000 - sum(shown, (x) => x.a)
  const animatedFree = useNum(free)

  if (reducedMotion || videoError) {
    return (
      <div id="main" tabIndex={-1} className="story-fallback page">
        <div className="story-fallback-hero">
          <img
            src="/runway-poster.jpg"
            alt="Runway budget slab overview"
            className="story-fallback-poster"
          />
          <div className="story-fallback-lead">
            <b className="brand">Runway</b>
            <h1>Ten thousand rupees. Thirty days.</h1>
            <p className="lead">
              Every commitment and spending choice is linked directly to your runway forecast.
            </p>
            <a className="btn pri" href="#/overview">
              Enter Runway
            </a>
          </div>
        </div>
        <div className="story-fallback-chapters">
          {CH.map((h, i) => (
            <section key={i} className="card story-fallback-chapter">
              <small>{h[0]}</small>
              <h2>{h[1]}</h2>
              <p className="lead">{h[2]}</p>
              <div className="story-fallback-chips">
                {SEG.filter((x) => x.ch <= i).map((x) => (
                  <span key={x.k} className="story-chip on">
                    {x.k} {inr(x.a)}
                  </span>
                ))}
              </div>
              {i === 5 && (
                <div style={{ marginTop: 24 }}>
                  <a className="btn pri" href="#/overview">
                    Enter Runway
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    )
  }

  const parallaxX = (m.x - 0.5) * 28
  const parallaxY = (m.y - 0.5) * 28
  const rotX = -(m.y - 0.5) * 4
  const rotY = (m.x - 0.5) * 4

  const parallaxStyle = {
    transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`,
    transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  }

  return (
    <div
      ref={ref}
      id="main"
      tabIndex={-1}
      role="main"
      className="story"
      onMouseMove={(e) =>
        setM({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
      }
    >
      <div className="stage">
        <b className="sbrand brand">Runway</b>
        <a className="skip btn sm" href="#/overview">
          Skip story
        </a>

        <div className="story-video-perspective">
          <div className="story-video-wrap" style={parallaxStyle}>
            <video
              ref={videoRef}
              src="/runway-scrub.mp4"
              poster="/runway-poster.jpg"
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="story-video"
              onLoadedMetadata={handleLoadedMetadata}
              onSeeked={handleSeeked}
              onError={handleVideoError}
              onPlay={(e) => e.target.pause()}
            />
            {posterVisible && (
              <img
                src="/runway-poster.jpg"
                alt=""
                aria-hidden="true"
                className="story-poster-overlay"
              />
            )}
          </div>
        </div>

        <div className="chs">
          {CH.map((h, i) => (
            <div key={i} className={'ch ' + (i === c ? 'on' : i < c ? 'past' : '')}>
              <small>{h[0]}</small>
              <h1>{h[1]}</h1>
              <p className="lead">{h[2]}</p>
              {i === 5 && (
                <a className="btn pri" href="#/overview">
                  Enter Runway
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="story-hud" role="region" aria-label="Month status">
          <div className="story-hud-left">
            <small>Free runway</small>
            <b className="story-hud-amount">{inr(animatedFree)}</b>
          </div>
          <div className="story-hud-chips">
            {SEG.map((x) => {
              const active = x.ch <= c
              return (
                <span key={x.k} className={'story-chip' + (active ? ' on' : '')}>
                  {x.k} {inr(x.a)}
                </span>
              )
            })}
          </div>
        </div>

        <div className="cnt">
          0{c + 1} / 06{c === 0 && <span className="hint">Scroll</span>}
        </div>
        <Ladder p={p} my={m.y} jump={jump} />
      </div>
    </div>
  )
}

export default Story
