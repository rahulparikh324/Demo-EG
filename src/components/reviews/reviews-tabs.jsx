import React, { useState } from 'react'

import { AppBar } from '@material-ui/core'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import Submitted from 'components/Submitted/Submitted'
import MaintenanceList from 'components/reviews/maintenance-list'
import Report from 'components/reviews/reports'

const ReviewsTabs = () => {
  const [mainTab, setMainTab] = useState('ACCEPTANCE-TESTS')

  return (
    <>
      <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
              <Tab eventKey='ACCEPTANCE-TESTS' title='Acceptance Tests' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='MAINTENANCE' title='Maintenance' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='REPORTS' title='Reports' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>

        {mainTab === 'ACCEPTANCE-TESTS' && <Submitted />}
        {mainTab === 'MAINTENANCE' && <MaintenanceList />}
        {mainTab === 'REPORTS' && <Report />}
      </div>
    </>
  )
}

export default ReviewsTabs
