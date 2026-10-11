import { lazy, Suspense, useEffect } from 'react'
import { Nav } from './components/Nav.jsx'
import { Foot } from './components/Foot.jsx'
import { useHash } from './hooks/useHash.js'
import { useStore } from './hooks/useStore.js'
import { useRouteTransition } from './hooks/useRouteTransition.js'
import { useSpotlight } from './hooks/useSpotlight.js'

const Story = lazy(() => import('./pages/Story.jsx'))
const DashPage = lazy(() => import('./pages/Dash.jsx'))
const SimPage = lazy(() => import('./pages/Sim.jsx'))
const PlanPage = lazy(() => import('./pages/Plan.jsx'))
const PAGES = {
  '/': Story,
  '/overview': lazy(() => import('./pages/Home.jsx')),
  '/dashboard': DashPage,
  '/dash': DashPage,
  '/simulate': SimPage,
  '/simulator': SimPage,
  '/sim': SimPage,
  '/plan': PlanPage,
  '/goals': PlanPage,
  '/shocks': PlanPage,
  '/privacy': lazy(() => import('./pages/Privacy.jsx')),
  '/terms': lazy(() => import('./pages/Terms.jsx')),
}
const TITLES = {
  '/': 'Runway | ₹10,000 for 30 days',
  '/overview': 'Overview | Runway',
  '/dashboard': 'Dashboard | Runway',
  '/dash': 'Dashboard | Runway',
  '/simulate': 'Decision Simulator | Runway',
  '/simulator': 'Decision Simulator | Runway',
  '/sim': 'Decision Simulator | Runway',
  '/plan': 'Budget Workflow | Runway',
  '/goals': 'Budget Workflow | Runway',
  '/shocks': 'Budget Workflow | Runway',
  '/privacy': 'Privacy policy | Runway',
  '/terms': 'Terms and conditions | Runway',
}
const NO_FOOTER = ['/', '/overview', '/privacy', '/terms']

export default function App() {
  const route = useHash(),
    [s, set] = useStore(),
    phase = useRouteTransition()
  useSpotlight()
  useEffect(() => {
    document.title = TITLES[route] || TITLES['/']
  }, [route])
  const Page = PAGES[route] || Story
  return (
    <>
      <a
        className="skiplink"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>
      {route !== '/' && <Nav route={route} />}
      <div key={route} className="view">
        <Suspense
          fallback={
            <p className="page" role="status">
              Loading
            </p>
          }
        >
          <Page s={s} set={set} />
        </Suspense>
      </div>
      {PAGES[route] && !NO_FOOTER.includes(route) && <Foot />}
      <div className={'wipe ' + phase} aria-hidden="true">
        <b className="brand">Runway</b>
      </div>
    </>
  )
}
