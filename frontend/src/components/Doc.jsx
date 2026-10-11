import { Foot } from './Foot.jsx'

export const Doc = ({ t, children }) => (
  <main id="main" tabIndex={-1} className="page doc">
    <h1>{t}</h1>
    {children}
    <Foot />
  </main>
)
