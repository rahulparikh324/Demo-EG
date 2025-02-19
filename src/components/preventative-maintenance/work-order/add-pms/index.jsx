import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import { AppBar } from '@material-ui/core'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import { FormTitle } from 'components/Maintainance/components'
import PlannedPMs from 'components/preventative-maintenance/work-order/add-pms/planned'
import AssetList from 'components/preventative-maintenance/work-order/add-pms/asset-list'
import TempAssets from 'components/preventative-maintenance/work-order/add-pms/temp-assets'

const AddPM = ({ open, onClose, workOrderID, afterSubmit, classCodeOptions }) => {
  const [selected, setTab] = useState('PLANNED')
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add PM to Workorder' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      {/* <div className='assets-box-wraps customtab px-2 mb-2'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={selected} onSelect={k => setTab(k)}>
            <Tab eventKey='PLANNED' title='Planned' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='ANY' title='Any' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='TEMP_ASSETS' title='Temp Assets' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div> */}
      {selected === 'PLANNED' && <PlannedPMs onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} />}
      {selected === 'ANY' && <AssetList classCodeOptions={classCodeOptions} onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} />}
      {selected === 'TEMP_ASSETS' && <TempAssets onClose={onClose} workOrderID={workOrderID} afterSubmit={afterSubmit} />}
    </Drawer>
  )
}

export default AddPM
