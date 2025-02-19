import React, { useState } from 'react'

import { ActionButton } from 'components/common/buttons'

import { AppBar } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import { history } from 'helpers/history'

import ContactList from './ContactList'
import WorkOrderList from './WorkOrderList'
import useFetchData from 'hooks/fetch-data'
import { camelizeKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'
import { TitleCount } from 'components/WorkOrders/utils'
import { LabelVal } from 'components/common/others'
import AddVendor from './AddVendor'
import jobScheduler from 'Services/jobScheduler'

const VendorDetail = ({ vendorId }) => {
  const [selected, setTab] = useState('CO')
  const { loading, data: vendorData, reFetch } = useFetchData({ fetch: jobScheduler.viewVendorDetailById, payload: vendorId, formatter: d => camelizeKeys(get(d, 'data', {})), externalLoader: true })
  const [anchorObj, setAnchorObj] = useState({})
  const [isEditOpen, setEditOpen] = useState(false)

  const woState = {
    filter: get(history, 'location.state.filter', {}),
    pageRows: get(history, 'location.state.pageRows', 20),
    search: get(history, 'location.state.search', ''),
    pageIndex: get(history, 'location.state.pageIndex', 1),
  }

  const handleAction = async (event, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    setEditOpen(true)
  }

  return (
    <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
      <div className='d-flex align-items-center'>
        <div className='mr-2'>
          <ActionButton action={() => history.push({ pathname: '/vendors', state: woState })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
        </div>
        <div className='text-bold text-md mr-2'>{get(vendorData, 'vendorName', '')}</div>
      </div>
      <div style={{ padding: '5px 5px 10px 15px', background: '#fafafa', borderRadius: '4px', position: 'relative', margin: '12px 0px' }}>
        <div className='d-flex justify-content-between align-items-center '>
          <LabelVal label='Category' value={vendorData ? get(vendorData, 'vendorCategory', 'N/A') : 'N/A'} inline lableMinWidth={58} />
          <ActionButton action={e => handleAction(e, vendorData)} icon={<EditOutlinedIcon fontSize='small' />} tooltip='EDIT' />
        </div>
        <LabelVal label='Address' value={vendorData && !isEmpty(vendorData?.vendorAddress) ? get(vendorData, 'vendorAddress', 'N/A') : 'N/A'} inline lableMinWidth={58} />
      </div>
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={selected} onSelect={k => setTab(k)}>
            <Tab eventKey='CO' title={<TitleCount title='Contacts' count={get(vendorData, 'contactsList', []).length} />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='WO' title={<TitleCount title='Work Orders' count={get(vendorData, 'workordersList', []).length} />} tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>
      <div style={{ height: `calc(100% - 64px)`, position: 'relative' }}>
        {selected === 'CO' && <ContactList vendorId={vendorId} contactList={get(vendorData, 'contactsList', [])} loading={loading} reFetch={reFetch} />}
        {selected === 'WO' && <WorkOrderList vendorId={vendorId} workOrderList={get(vendorData, 'workordersList', [])} reFetch={reFetch} />}
      </div>
      {isEditOpen && <AddVendor obj={{ ...anchorObj, vendorId: vendorId }} isEdit reFetch={reFetch} open={isEditOpen} onClose={() => setEditOpen(false)} />}
    </div>
  )
}

export default VendorDetail
