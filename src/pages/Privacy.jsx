import { Doc } from '../components/Doc.jsx'

export const Privacy = () => (
  <Doc t="Privacy policy">
    <p>Last updated 11 October 2026.</p>
    <h3>What we collect</h3>
    <p>
      Runway does not ask for your name, phone number, bank details or any account. Everything you
      enter, such as expenses, goals and subscriptions, is stored only in your browser using
      localStorage.
    </p>
    <h3>What we do not do</h3>
    <p>
      We do not send your data to a server, sell it, share it or use it for advertising. There are
      no tracking cookies and no third party analytics in this build.
    </p>
    <h3>Fonts</h3>
    <p>
      The site loads typefaces from Google Fonts, which may receive your IP address as part of that
      request.
    </p>
    <h3>Your control</h3>
    <p>Use Reset on the dashboard or clear your browser storage to delete all data at any time.</p>
    <h3>Children</h3>
    <p>Runway is a planning simulator and is not directed at children under 13.</p>
    <h3>Changes</h3>
    <p>
      If a future version adds a backend, this policy will be updated before any data leaves your
      device.
    </p>
  </Doc>
)

export default Privacy
