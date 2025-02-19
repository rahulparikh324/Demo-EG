import React, { useState } from 'react'
import Metrics from './Metrics'
import PMListTable from './PMListTable'
import './maintainance.css'

function PMList() {
  const [state, setstate] = useState(0)
  const [render, setRender] = useState(0)

  return (
    <div style={{ height: '93vh', background: '#fff' }}>
      <div className='row mx-0 px-5 py-2' style={{ background: '#fff' }}>
        <Metrics setState={setstate} render={render} />
      </div>
      <div className='row mx-0 px-5 py-2' style={{ background: '#fff' }}>
        <PMListTable metricValue={state} setRender={() => setRender(p => p + 1)} />
      </div>
    </div>
  )
}

export default PMList
