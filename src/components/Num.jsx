export const Num = ({ v, set, ph }) => (
  <input
    type="number"
    min="0"
    placeholder={ph}
    aria-label={ph === '₹' ? 'Amount in rupees' : ph}
    value={v}
    onChange={(e) => set(e.target.value)}
  />
)
