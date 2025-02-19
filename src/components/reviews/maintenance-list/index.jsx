import React, { useContext, useState } from 'react'

import { ToggleButton } from 'components/common/others'

import enums from 'Constants/enums'
import useFetchData from 'hooks/fetch-data'

import Submitted from 'components/Submitted/Submitted'
import Reviews from '../index'
import reviews from 'Services/reviews'
import { get } from 'lodash'
import { MainContext } from 'components/Main/provider'

const MaintenanceList = () => {
  const { setCounter } = useContext(MainContext)

  const handleCount = data => {
    setCounter(data)
    return data
  }

  const [tab, setTab] = useState('RAGULAR-INSPECTION')
  const { data, reFetch } = useFetchData({ fetch: reviews.submittedAssetsCount, formatter: d => handleCount(get(d, 'data', {})) })
  const ragularCount = parseInt(get(data, 'maintenanceWoOtherInspectionCount', 0)) + parseInt(get(data, 'irWoSubmittedAssetsCount', 0)) + parseInt(get(data, 'obWoSubmittedAssetsCount', 0))

  const TitleCount = ({ title, count, bg, color }) => (
    <div className='d-flex align-items-center'>
      {title}
      {count !== 0 && (
        <span className='ml-2 d-flex align-items-center justify-content-center' style={{ height: '21px', width: '21px', padding: '4px', background: bg || '#a6a6a6', color: color || '#fff', borderRadius: '16px', fontSize: '9px' }}>
          {count}
        </span>
      )}
    </div>
  )

  return (
    <div style={{ height: 'calc(100vh - 128px)', paddingTop: '20px', background: '#fff' }}>
      <div className='d-flex mb-3'>
        <ToggleButton label={<TitleCount title='Regular Inspections' count={ragularCount} bg={tab === 'RAGULAR-INSPECTION' ? '#fff' : ''} color={tab === 'RAGULAR-INSPECTION' ? '#a6a6a6' : ''} />} value='RAGULAR-INSPECTION' selected={tab} onChange={setTab} />
        <ToggleButton label={<TitleCount title='Neta Inspection' count={get(data, 'maintenanceWoNetaInspectionCount', 0)} bg={tab === 'NETA-INSPECTION' ? '#fff' : ''} color={tab === 'NETA-INSPECTION' ? '#a6a6a6' : ''} />} value='NETA-INSPECTION' selected={tab} onChange={setTab} />
      </div>
      {tab === 'RAGULAR-INSPECTION' && <Reviews woType={[enums.WO_TYPE_LIST[1].value, enums.WO_TYPE_LIST[2].value, enums.WO_TYPE_LIST[3].value]} reFetch={() => reFetch()} />}
      {tab === 'NETA-INSPECTION' && <Submitted woType={true} reFetch={reFetch} />}
    </div>
  )
}

export default MaintenanceList
