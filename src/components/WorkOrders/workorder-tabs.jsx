import React, { useState } from 'react'

import { AppBar } from '@material-ui/core'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import WorkOrderList from './WorkOrderList'
import Backlogs from './Backlogs'
import WorkOrderCalendar from 'components/WorkOrders/calendar/index'

const WorkorderTabs = () => {
  const [mainTab, setMainTab] = useState('LISTVIEW')

  return (
    <>
      <div style={{ height: 'calc(100vh - 128px)', padding: '20px', background: '#fff' }}>
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
              <Tab eventKey='LISTVIEW' title='List View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='COLUMN-VIEW' title='Column View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='CALENDAR-VIEW' title='Calendar View' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
        {mainTab === 'LISTVIEW' && <WorkOrderList />}
        {mainTab === 'COLUMN-VIEW' && <Backlogs />}
        {mainTab === 'CALENDAR-VIEW' && <WorkOrderCalendar />}
      </div>
    </>
  )
}

export default WorkorderTabs
