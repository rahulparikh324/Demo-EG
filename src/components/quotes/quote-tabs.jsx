import React, { useState } from 'react'

import { AppBar } from '@material-ui/core'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import QuotesList from 'components/quotes/index'
import QuoteBacklogs from './quote-backlogs'

const QuoteTabs = () => {
  const [mainTab, setMainTab] = useState('LISTVIEW')

  return (
    <>
      <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
              <Tab eventKey='LISTVIEW' title='List View' tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='COLUMN-VIEW' title='Column View' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
        {mainTab === 'LISTVIEW' && <QuotesList />}
        {mainTab === 'COLUMN-VIEW' && <QuoteBacklogs />}
      </div>
    </>
  )
}

export default QuoteTabs
