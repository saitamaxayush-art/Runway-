import { inr } from '../utils/format.js'
import { useNum } from '../hooks/useNum.js'

export function FreeSeg({ v }) {
  const n = useNum(v)
  return (
    <div className="seg3 free" style={{ flexGrow: v }} title="Free to use">
      <span>Free to use</span>
      <b>{inr(n)}</b>
    </div>
  )
}
