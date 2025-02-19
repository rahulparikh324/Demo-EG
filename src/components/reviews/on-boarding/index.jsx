import React from 'react'
import Reviews from '../index'
import enums from 'Constants/enums'

const OnBoarding = () => {
  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
      <Reviews woType={enums.WO_TYPE_LIST[2].value} />
    </div>
  )
}

export default OnBoarding
