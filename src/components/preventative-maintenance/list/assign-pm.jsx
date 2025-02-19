import React, { useState, useEffect, useRef } from 'react'
import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'

import { StatusComponent, ElipsisWithTootip, MinimalCheckbox } from 'components/common/others'
import { pmStatusOptions, getChip, getDueInColor } from 'components/preventative-maintenance/common/utils'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'
import { MinimalAutoComplete } from 'components/Assets/components'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { Toast } from 'Snackbar/useToast'
import { history } from 'helpers/history'

const AssignPM = ({ open, onClose, selectedWorkorder, afterSubmit }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const [selectdAssetClass, setSelectedAssetClass] = useState([])
  const [selectedPmItems, setSelectedPmItems] = useState([])
  const isFirstRender = useRef(true)
  const assignedPMsPayload = {
    pagesize: pageSize,
    pageindex: pageIndex,
    searchString,
    assetId: null,
    status: [enums.PM.STATUS.OPEN],
    Is_requested_for_assign: true,
    isRequestedForOverduePm: false,
    inspectiontemplateAssetClassId: !isEmpty(selectdAssetClass) ? [selectdAssetClass.value] : [],
    title: !isEmpty(selectedPmItems) ? [selectedPmItems.value] : [],
  }
  const filterDropdownPayload = { pagesize: pageSize, pageindex: pageIndex, searchString, assetId: null, status: [], Is_requested_for_assign: true }
  const { loading, data } = useFetchData({ fetch: preventativeMaintenance.asset.getAssignedPMs, payload: assignedPMsPayload, formatter: d => get(d, 'data', []), defaultValue: [] })

  const formateOptions = data => {
    const assetClassList = get(data, 'assetClassList', []).map(d => ({ label: d.assetClassName, value: d.inspectiontemplateAssetClassId }))
    const pmTitleList = get(data, 'pmTitleList', []).map(d => ({ label: d, value: d }))
    return { assetClassList, pmTitleList }
  }
  const { data: filterdata } = useFetchData({ fetch: preventativeMaintenance.asset.getFilterDropdown, payload: filterDropdownPayload, formatter: d => formateOptions(get(d, 'data', {})), defaultValue: {} })
  const [selected, setSelected] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMarkedAll, setIsMarkedAll] = useState(false)

  const selectAndDeSelectAll = () => {
    const listIds = new Set(get(data, 'list', []).map(d => d.assetPmId))

    if (!isMarkedAll) {
      setSelected(prevSelected => {
        const prevSelectedSet = new Set(prevSelected)
        listIds.forEach(id => prevSelectedSet.add(id))
        return Array.from(prevSelectedSet)
      })
    } else {
      setSelected(prevSelected => prevSelected.filter(id => !listIds.has(id)))
    }
    setIsMarkedAll(prev => !prev)
  }

  const columns = [
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isMarkedAll} onClick={selectAndDeSelectAll} />, render: d => <RenderCheckBox data={d} accessor='assetPmId' selected={selected} handleChange={handleCheckBoxChange} /> },
    { name: 'Asset Name', accessor: 'assetName' },
    { name: 'Asset Class', accessor: 'assetClassName' },
    { name: 'PM Item', render: d => <ElipsisWithTootip title={d.title} size={35} /> },
    { name: 'PM Plan', render: d => <ElipsisWithTootip title={d.assetPlanName} size={35} /> },
    {
      name: 'Due In',
      render: d => {
        if (!d.dueDate && enums.PM.STATUS.COMPLETED !== d.status) return 'NA'
        const d1 = new Date()
        const d2 = new Date(d.dueDate)
        const diffInDays = d.isOverdue ? -1 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        const color = enums.PM.STATUS.COMPLETED !== d.status ? getDueInColor(diffInDays) : '#37d482'
        const label = enums.PM.STATUS.COMPLETED !== d.status ? d.dueIn : 'Completed'
        if (enums.PM.STATUS.COMPLETED === d.status) return ''
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' filled />
      },
    },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.status, pmStatusOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
  ]
  const handleCheckBoxChange = list => {
    let updatedMarkedRows

    if (selected.includes(list.assetPmId)) {
      setSelected(p => p.filter(d => d !== list.assetPmId))
      updatedMarkedRows = selected.filter(d => d !== list.assetPmId)
    } else {
      setSelected(p => [...p, list.assetPmId])
      updatedMarkedRows = [...selected, list.assetPmId]
    }

    if (updatedMarkedRows.length === 0) {
      setIsMarkedAll(false)
    } else if (get(data, 'list', []).every(d => updatedMarkedRows.includes(d.assetPmId))) {
      setIsMarkedAll(true)
    } else {
      setIsMarkedAll(false)
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (get(data, 'list', []).every(d => selected.includes(d.assetPmId))) {
      setIsMarkedAll(true)
    } else {
      setIsMarkedAll(false)
    }
  }, [page, selected, data])

  const assign = async () => {
    const payload = { woId: selectedWorkorder.woId, assetPmId: selected }
    setIsProcessing(true)
    try {
      const res = await preventativeMaintenance.workOrder.link(payload)
      if (res.success > 0) {
        Toast.success(`PM Assigned Successfully !`)
        history.push({ pathname: `workorders/details/${selectedWorkorder.woId}`, WODetails: selected.length === 1 ? selected : null })
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error Assigning PM. Please try again !`)
    }
    setIsProcessing(false)
    afterSubmit()
    onClose()
  }
  // handle pagination & filter
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add PM to Workorder' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 150px)', background: '#fff', padding: '16px', width: '80vw' }}>
        <div className='d-flex justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
          <div className='d-flex' style={{ width: '80%' }}>
            <MinimalAutoComplete value={selectdAssetClass} placeholder='Select Asset Class' label='Asset Class' isClearable baseStyles={{ zIndex: '7' }} options={get(filterdata, 'assetClassList', [])} onChange={d => setSelectedAssetClass(d)} />
            <MinimalAutoComplete w={20} value={selectedPmItems} placeholder='Select PM Item' label='PM Item' isClearable baseStyles={{ zIndex: '7' }} options={get(filterdata, 'pmTitleList', [])} onChange={d => setSelectedPmItems(d)} />
          </div>
          <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search PMs' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Save' loadingText='Saving...' loading={isProcessing} disabled={isProcessing || isEmpty(selected)} onClick={assign} />
      </div>
    </Drawer>
  )
}
export default AssignPM
