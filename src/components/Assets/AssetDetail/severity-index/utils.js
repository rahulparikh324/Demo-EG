export const details = {
  0: ['Asymmetrical Rating (kA) : 12'],
  1: ['Interrupting Rating (Amps) : 4', 'Fault Withstand Rating (kA) : 6'],
  4: ['Contact Wear Indicators : No'],
  5: ['Phase Overcurrent at 150% 900A : 12'],
  7: ['Shunt Trip Voltage : 10', 'Frame Ampere Rating : 11', 'Tripping Voltage : 16', 'Interrupting kA Rating : 6', 'Electrically Open : No', 'Manual Charge : Yes', 'Trip With Protective Devices : NA', 'Electrically Charge : Yes'],
  10: ['Trip Module Ampere Rating : 14', 'Trip Unit Catalog Number : 19'],
}
export const indexes = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
const colors = { 0: '#37ff00', 1: '#97ff00', 2: '#d0ff00', 3: '#ffff00', 4: '#ffe300', 5: '#ffc700', 6: '#ffaa00', 7: '#ff8c00', 8: '#ff6b01', 9: '#ff4620', 10: '#ff0131' }

export const IndexContainers = ({ index }) => (
  <div style={{ fontWeight: 800, color: '#0f0f0f', borderRight: '1px dashed #121212' }} className='d-flex justify-content-center align-items-center'>
    {index}
  </div>
)

export const TierChip = ({ value, index }) => (
  <span className='mr-1 mt-1' style={{ padding: '2px 12px', fontWeight: 800, fontSize: '12px', borderRadius: '4px', background: `${colors[index]}`, color: '#fff' }}>
    {value}
  </span>
)
