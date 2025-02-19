import React, { useState } from 'react'

import { history } from 'helpers/history'
import { get, isEmpty } from 'lodash'

import { ActionButton } from 'components/common/buttons'
import { AppBar } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import AssociatedForms from 'components/Assets/asset-class/associated-forms'
import CoreAttributes from 'components/Assets/asset-class/core-attributes'
import MasterPM from 'components/preventative-maintenance/master'

import { useLocation } from 'react-router-dom/cjs/react-router-dom'

const ClassDetails = ({ classId }) => {
  //
  const [selected, setTab] = useState('AF')
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const classCode = queryParams.get('asset-class-code')
  const pmCategoryId = queryParams.get('pm-category-id')

  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <div className='d-flex align-items-center'>
        <div className='mr-2'>
          <ActionButton action={() => history.goBack()} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
        </div>
        <div className='text-bold text-md mr-2'>{classCode}</div>
      </div>
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={selected} onSelect={k => setTab(k)}>
            <Tab eventKey='CA' title='Core Attributes' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='AF' title='Associated Forms' tabClassName='font-weight-bolder small-tab'></Tab>
            {/* <Tab eventKey='CE' title='Condition Equations' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='VZ' title='Visualizations' tabClassName='font-weight-bolder small-tab'></Tab> */}
            <Tab eventKey='PM' title='PMs' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>
      <div style={{ height: `calc(100% - 64px)`, padding: selected !== 'PM' && '12px', position: 'relative' }}>
        {selected === 'AF' && <AssociatedForms classId={classId} />}
        {selected === 'CA' && <CoreAttributes classId={classId} />}
        {selected === 'PM' && <MasterPM classId={classId} pmCategoryId={isEmpty(pmCategoryId) ? '' : pmCategoryId} />}
      </div>
    </div>
  )
}

export default ClassDetails
