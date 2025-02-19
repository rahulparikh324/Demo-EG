import React, { useState } from 'react'
import { useTheme } from '@material-ui/core/styles'

import Maintenance from 'components/Assets/AssetDetail/inspections/maintenance'
import Forms from 'components/Assets/AssetDetail/inspections/forms'

const Inspections = ({ assetId }) => {
  const theme = useTheme()
  const [type, setType] = useState('MT')
  const getBg = d => (d === type ? theme.palette.primary.main : 'none')
  const getColor = d => (d === type ? '#fff' : '#000')
  const ToggleButton = ({ label, value }) => (
    <button className='minimal-input-base text-xs' style={{ color: getColor(value), background: getBg(value), width: 'auto', padding: '2px 14px', border: 'none' }} onClick={() => setType(value)}>
      {label}
    </button>
  )
  return (
    <div style={{ height: 'calc(100% - 42px)', padding: '10px', minHeight: '400px' }}>
      <div className='d-flex' style={{ padding: '2px', background: '#f6f6f6', width: 'fit-content', borderRadius: '4px' }}>
        <ToggleButton label='Maintenance' value='MT' />
        <ToggleButton label='AT/MT Forms' value='AT' />
      </div>
      {type === 'MT' && <Maintenance assetId={assetId} />}
      {type === 'AT' && <Forms assetId={assetId} />}
    </div>
  )
}

export default Inspections
