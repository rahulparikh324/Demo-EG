import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'

import { TableComponent } from 'components/common/table-components'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'
import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { StatusComponent, FilterPopup } from 'components/common/others'
import { MinimalButton } from 'components/common/buttons'

import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'
import issues from 'Services/issues'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { getChip, statusChipOptions } from './utlis'
import { history } from 'helpers/history'

const AddIssueToWorkorder = ({ open, onClose, workOrderId }) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [statusFilter, setStatusFilter] = useState([enums.ISSUE.STATUS.OPEN])
  const [selected, setSelected] = useState([])
  const [type, setType] = useState({})
  const [typeContext, setTypeContext] = useState({})

  const postSuccess = () => {
    history.push({ pathname: `workorders/details/${workOrderId}`, state: { tab: 'NEW_ISSUES' } })
  }

  const { loading: isLoading, mutate: assignIssue } = usePostData({ executer: issues.linkIssueToWOFromIssueListTab, postSuccess, message: { success: 'Assign Issue Successfully!', error: 'Something went wrong' } })
  const handleAssignIssue = async () => {
    const list = selected.map(d => ({ woId: workOrderId, assetIssueId: d, woType: isEmpty(typeContext[d]) ? get(type[d], 'value', '') : get(typeContext[d], 'value', '') }))
    assignIssue({ linkIssueList: list })
  }
  const formateIssueList = data => {
    const labelObj = {}
    data.list.forEach(d => {
      labelObj[d.assetIssueId] = Object.keys(typeContext).includes(d.assetIssueId) ? typeContext[d.assetIssueId] : inspectionTypes[0]
    })
    setType(labelObj)
    return data
  }
  const { loading, data } = useFetchData({ fetch: issues.getListOptimized, payload: { page_index: pageIndex, page_size: pageSize, searchString, status: statusFilter }, formatter: d => formateIssueList(get(d, 'data', [])) })
  const columns = [
    { name: 'Select', render: d => <RenderCheckBox data={d} accessor='assetIssueId' selected={selected} handleChange={handleCheckBoxChange} /> },
    { name: 'Issue Title', render: d => <div style={{ padding: '3px' }}>{d.issueTitle.split('_').join(' - ')}</div> },
    {
      name: 'Asset Name',
      render: d => {
        if (!d.assetName) return
        return (
          <span className='text-bold' style={{ color: '#778899', fontStyle: 'bold' }}>
            {d.assetName}
          </span>
        )
      },
    },
    { name: 'WO Line Type', render: d => <FilterPopup selected={type[d.assetIssueId]} onChange={v => handleSelectChange(d, v)} options={inspectionTypes} placeholder={d.issueType} closeIcon={false} /> },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.issueStatus, statusChipOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
  ]

  const inspectionTypes = [
    { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR },
    { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE },
    { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK },
    { label: 'Inspection', value: enums.MWO_INSPECTION_TYPES.INSPECTION },
  ]

  const handleCheckBoxChange = data => {
    if (selected.includes(data.assetIssueId)) setSelected(p => p.filter(d => d !== data.assetIssueId))
    else {
      setSelected(p => [...p, data.assetIssueId])
      setTypeContext(p => ({ ...p, [data.assetIssueId]: type[data.assetIssueId] }))
    }
  }
  const handleSelectChange = (data, val) => {
    setType(p => ({ ...p, [data.assetIssueId]: val }))
    setTypeContext(p => ({ ...p, [data.assetIssueId]: val }))
  }
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
      <FormTitle title='Add Issue to Work Order' closeFunc={onClose} style={{ width: '100%', minWidth: '640px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '10px' }}>
        <div className='d-flex justify-content-end align-items-center my-3 ' style={{ width: '100%' }}>
          <SearchComponent placeholder='Search' postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} isForViewAction={true} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Assign' loadingText='Assigning...' disabled={isEmpty(selected) || isLoading} loading={isLoading} onClick={handleAssignIssue} />
      </div>
    </Drawer>
  )
}

export default AddIssueToWorkorder
