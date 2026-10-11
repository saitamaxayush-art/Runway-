import { Privacy } from '../pages/Privacy.jsx'
import { Terms } from '../pages/Terms.jsx'

export function Foot() {
  return (
    <footer>
      <div>
        <b className="brand">Runway</b>
        <p>A budgeting simulator for a 30 day, ₹10,000 month. Not financial advice.</p>
      </div>
      <div className="fl">
        <a href="#/privacy">Privacy policy</a>
        <a href="#/terms">Terms and conditions</a>
      </div>
    </footer>
  )
}
