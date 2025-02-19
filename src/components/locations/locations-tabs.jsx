import React, { useState } from 'react'

import { AppBar } from '@material-ui/core'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import Locations from 'components/locations/index'
import ColumnView from 'components/locations/column-view'
import LocationWise from 'components/one-line/location-wise'

const LocationsTabs = () => {
  const [mainTab, setMainTab] = useState('HIERARCHY-VIEW')

  return (
    <>
      <div style={{ height: 'calc(100vh - 160px)', padding: mainTab === 'HIERARCHY-VIEW' ? '20px' : '20px 0 0 0', background: '#fff' }}>
        <div className='assets-box-wraps customtab' style={{ marginLeft: mainTab === 'COLUMN-VIEW' && '20px' }}>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
              <Tab eventKey='HIERARCHY-VIEW' title='Hierarchy View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='COLUMN-VIEW' title='Column View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='LOCATION' title='Tree View' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
        {mainTab === 'HIERARCHY-VIEW' && <Locations />}
        {mainTab === 'COLUMN-VIEW' && <ColumnView />}
        {mainTab === 'LOCATION' && <LocationWise />}
      </div>
    </>
  )
}

export default LocationsTabs
