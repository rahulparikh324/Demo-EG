import React, { useState, useEffect, useRef } from 'react'
import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import { snakifyKeys } from 'helpers/formatters'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'

import { ElipsisWithTootip, MinimalCheckbox } from 'components/common/others'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import { Toast } from 'Snackbar/useToast'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const AddExistingAsset = ({ open, onClose, workOrderID, afterSubmit, locations: { buildingName = '', building = null, floorName = '', floor = null, room = null, roomName = '' }, setAddingAssetLocation }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const [selected, setSelected] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAllSelected, setAllSelected] = useState(false)
  const isFirstRender = useRef(true)
  const payload = snakifyKeys({ pagesize: pageSize, pageindex: pageIndex, searchString, woId: workOrderID, tempFormioBuildingName: buildingName, tempFormioFloorName: floorName, tempFormioRoomName: roomName })
  const { loading, data } = useFetchData({ fetch: onBoardingWorkorder.existingAsset.get, payload, formatter: d => get(d, 'data', []), defaultValue: [] })

  const selectAndDeSelectAll = () => {
    const listIds = new Set(get(data, 'list', []).map(d => d.assetId))

    if (!isAllSelected) {
      setSelected(prevSelected => {
        const prevSelectedSet = new Set(prevSelected)
        listIds.forEach(id => prevSelectedSet.add(id))
        return Array.from(prevSelectedSet)
      })
    } else {
      setSelected(prevSelected => prevSelected.filter(id => !listIds.has(id)))
    }
    setAllSelected(prev => !prev)
  }

  const columns = [
    { name: 'Asset Name', render: d => <ElipsisWithTootip title={d.assetName ? d.assetName : ''} size={40} /> },
    { name: 'Asset Class', render: d => <ElipsisWithTootip title={d.assetClassName ? d.assetClassName : ''} size={40} /> },
    { name: 'Building', accessor: 'building' },
    { name: 'Floor', accessor: 'floor' },
    { name: 'Room', accessor: 'room' },
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isAllSelected} onClick={selectAndDeSelectAll} />, render: d => <RenderCheckBox data={d} accessor='assetId' selected={selected} handleChange={handleCheckBoxChange} /> },
  ]

  //console.log(locations)
  // handle pagination & filter
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (get(data, 'list', []).every(d => selected.includes(d.assetId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }, [page, selected, data])

  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  //
  const assign = async () => {
    const loginData = JSON.parse(localStorage.getItem('loginData'))
    const payload = snakifyKeys({ woId: workOrderID, assetId: selected, siteId: getApplicationStorageItem('siteId'), requestedBy: loginData.uuid, tempFormiobuildingId: building, tempFormiofloorId: floor, tempFormioroomId: room })
    setIsProcessing(true)
    try {
      const res = await onBoardingWorkorder.existingAsset.add(payload)
      if (res.success > 0) Toast.success(`Assets Assigned Successfully !`)
      else Toast.error(res.message || `Error Assigning Assets. Please try again !`)
    } catch (error) {
      Toast.error(`Error Assigning Assets. Please try again !`)
    }
    setIsProcessing(false)
    setAddingAssetLocation({})
    handleClose()
    afterSubmit()
  }
  const handleCheckBoxChange = list => {
    let updatedMarkedRows

    if (selected.includes(list.assetId)) {
      setSelected(p => p.filter(d => d !== list.assetId))
      updatedMarkedRows = selected.filter(d => d !== list.assetId)
    } else {
      setSelected(p => [...p, list.assetId])
      updatedMarkedRows = [...selected, list.assetId]
    }

    if (updatedMarkedRows.length === 0) {
      setAllSelected(false)
    } else if (get(data, 'list', []).every(d => updatedMarkedRows.includes(d.assetId))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }
  const handleClose = () => {
    setAddingAssetLocation({})
    onClose()
  }
  return (
    <Drawer anchor='right' open={open} onClose={handleClose}>
      <FormTitle title='Add Existing Assets' style={{ width: '100%', minWidth: '450px' }} closeFunc={handleClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '16px', width: '80vw' }}>
        <div className='d-flex flex-row-reverse align-items-center mb-3' style={{ width: '100%' }}>
          <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search Assets' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={handleClose} />
        <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' loading={isProcessing} disabled={isProcessing || isEmpty(selected)} onClick={assign} />
      </div>
    </Drawer>
  )
}

export default AddExistingAsset
