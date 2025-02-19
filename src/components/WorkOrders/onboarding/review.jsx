import React, { useState, useEffect } from 'react'
import enums from 'Constants/enums'

import Drawer from '@material-ui/core/Drawer'
import { FormTitle } from 'components/Maintainance/components'
import { TableComponent } from 'components/common/table-components'
import SearchComponent from 'components/common/search'
import { ActionButton } from 'components/common/buttons'

import { isEmpty } from 'lodash'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'

import Edit from 'components/WorkOrders/onboarding/edit'

const Review = ({ open, onClose, data = [], workOrderID, afterSubmit, classCodeOptions, buildingOptions }) => {
  const [selectedRowObj, setSelectedRowObj] = useState({})
  const [searchString, setSearchString] = useState('')
  const [rows, setRows] = useState([])
  const [loadingId, setLoadingId] = useState()
  const [openReview, setOpen] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [lineObj, setLineObj] = useState({})
  const [rowsToBeRemoved, setRowsToBeRemoved] = useState([])
  //
  useEffect(() => {
    if (!isEmpty(data)) {
      let dataPostFilter = [...data].filter(d => d.status === enums.woTaskStatus.ReadyForReview).filter(d => !rowsToBeRemoved.includes(d.woonboardingassetsId))
      if (!isEmpty(searchString)) dataPostFilter = dataPostFilter.filter(x => (x.assetName !== null && x.assetName.toLowerCase().includes(searchString.toLowerCase())) || (x.assetClassName !== null && x.assetClassName.toLowerCase().includes(searchString.toLowerCase())))
      setRows(dataPostFilter)
      if (!isEmpty(dataPostFilter)) handleRowClick(dataPostFilter[0])
      else {
        if (!isEmpty(rowsToBeRemoved)) handleClose()
      }
    }
  }, [searchString, rowsToBeRemoved, data])
  //
  const handleRowClick = async data => {
    setLoadingId(data['woonboardingassetsId'])
    setSelectedRowObj(data['woonboardingassetsId'])
    const formData = await fetchObData(data)
    setAnchorObj(formData.data)
    setLineObj(data)
    setOpen(true)
    setLoadingId('')
  }
  const fetchObData = async ({ woonboardingassetsId }) => {
    try {
      const res = await onBoardingWorkorder.getAssetDetail({ id: woonboardingassetsId })
      if (res.success) return res
      else return null
    } catch (error) {
      console.log(error)
      return null
    }
  }
  const afterDataSubmit = data => {
    const toBeRemoved = [...rowsToBeRemoved, data.woonboardingassetsId]
    setRowsToBeRemoved(toBeRemoved)
  }
  const handleClose = () => {
    afterSubmit()
    onClose()
  }
  //
  const columns = [
    { name: 'Asset Name', accessor: 'assetName' },
    { name: 'Asset Class', accessor: 'assetClassName' },
    {
      name: '',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton isLoading={loadingId === d.woonboardingassetsId} tooltip='' hide={isEmpty(loadingId)} />
        </div>
      ),
    },
  ]
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title='Review' closeFunc={handleClose} style={{ width: '100%', minWidth: '450px' }} />
      <div style={{ height: 'calc(100vh - 64px)', padding: '18px 16px', width: '80vw' }}>
        <div className='d-flex flex-row-reverse align-items-center'>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `80%`, marginTop: '10px' }}>
          <TableComponent columns={columns} data={rows} onRowClick={handleRowClick} selectedRow={selectedRowObj} isForViewAction={true} setSelectedRow={setSelectedRowObj} selectedRowKey='woonboardingassetsId' enabledRowSelection rowStyle={{ cursor: 'pointer' }} />
        </div>
      </div>
      {openReview && <Edit isOnboarding={true} viewObj={anchorObj} open={openReview} onClose={() => setOpen(false)} afterSubmit={afterDataSubmit} classCodeOptions={classCodeOptions} workOrderID={workOrderID} lineObj={lineObj} isInReview={true} buildingOptions={buildingOptions} />}
    </Drawer>
  )
}

export default Review
