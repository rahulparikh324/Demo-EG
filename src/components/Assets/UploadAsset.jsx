import React, { useState } from 'react'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import UploadAssetDetails from './UploadAssetDetails'
import UploadFile from './UploadFile'
import { AssetTab } from './components'
import '../Notification/notification.css'
import './assets.css'

function UploadAsset() {
  const [tab, setTab] = useState('DETAILS')
  return (
    <div style={{ height: '93vh', background: '#fff' }}>
      <div>
        <div className='pm-setting-title d-flex title-d'>
          <PublishOutlinedIcon />
          <div className='title'> Add Asset</div>
        </div>
        <div className='d-flex flex-row  align-items-center p-40'>
          <AssetTab active={tab === 'DETAILS'} text='Fill Details' onClick={() => setTab('DETAILS')} />
          <AssetTab active={tab === 'FILE'} text='Upload Excel' onClick={() => setTab('FILE')} />
        </div>
      </div>
      {tab === 'DETAILS' && <UploadAssetDetails />}
      {tab === 'FILE' && <UploadFile />}
    </div>
  )
}

export default UploadAsset
