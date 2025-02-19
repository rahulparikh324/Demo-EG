import React from 'react'

import Drawer from '@material-ui/core/Drawer'

import { LabelVal } from 'components/common/others'
import { FormTitle } from 'components/Maintainance/components'

import { get } from 'lodash'

const ViewComapny = ({ open, onClose, anchorObj }) => {
  const statusView = () => {
    if (anchorObj.status === 1) return 'Active'
    else if (anchorObj.status === 2) return 'In Active'
    else return 'N/A'
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} style={{ width: '100%' }}>
      <FormTitle title='View Client Comapany' closeFunc={onClose} style={{ width: '100%' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef', width: '450px' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <div className='d-flex align-items-center'>
              <LabelVal label='Client Company Name' value={get(anchorObj, 'clientCompanyName', 'N/A')} w={50} />
              <LabelVal label='Status' value={statusView()} />
            </div>
            <div className='d-flex align-items-center'>
              <LabelVal label='Client Company Code' value={get(anchorObj, 'clientCompanyCode', 'N/A')} w={50} />
              <LabelVal label='Owner Name' value={get(anchorObj, 'owner', 'N/A')} />
            </div>
          </div>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px', marginTop: '10px' }}>
            <LabelVal label='Owner Address' value={get(anchorObj, 'ownerAddress', 'N/A')} />
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default ViewComapny
