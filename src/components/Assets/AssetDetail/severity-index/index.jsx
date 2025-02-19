import React from 'react'
import { isEmpty } from 'lodash'

import { indexes, details, IndexContainers, TierChip } from './utils'

function SeverityIndex() {
  return (
    <div style={{ height: 'calc(100% - 50px)', padding: '12px 12px 12px 0', display: 'grid', gridTemplateColumns: '10% 90%', gridTemplateRows: 'repeat(11,1fr)' }}>
      {indexes.map(d => (
        <>
          <IndexContainers key={d} index={d} />
          <div key={`tier-contaner-${d}`} style={{ flexWrap: 'wrap' }} className='d-flex align-items-center'>
            {!isEmpty(details[d]) && details[d].map(field => <TierChip key={d} value={field} index={d} />)}
          </div>
        </>
      ))}
    </div>
  )
}

export default SeverityIndex
