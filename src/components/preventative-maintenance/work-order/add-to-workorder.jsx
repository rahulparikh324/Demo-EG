import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import { getFormatedDate } from 'helpers/getDateTime'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'
import { RenderCheckBox } from 'components/WorkOrders/issues/utils'

import { StatusComponent, ElipsisWithTootip } from 'components/common/others'
import { pmStatusOptions, getChip } from 'components/preventative-maintenance/common/utils'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { Toast } from 'Snackbar/useToast'

const AddPMToWorkorder = ({ open, onClose, obj, afterSubmit }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const payload = { pagesize: pageSize, pageindex: pageIndex, searchString, assetId: get(obj, 'assignedAssetId', null), status: [], Is_requested_for_assign: true }
  const { loading, data } = useFetchData({ fetch: preventativeMaintenance.asset.getAssignedPMs, payload, formatter: d => get(d, 'data', []), defaultValue: [] })
  const [selected, setSelected] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const columns = [
    { name: 'Select', render: d => <RenderCheckBox data={d} accessor='assetPmId' selected={selected} handleChange={handleCheckBoxChange} /> },
    { name: 'Title', render: d => <ElipsisWithTootip title={d.title} /> },
    { name: 'Last Completed Date', render: d => getFormatedDate(d.lastCompletedDate) },
    {
      name: 'Frequency',
      render: d => (
        <div className='d-flex align-items-center' style={{ height: '24px' }}>
          {d.frequency}
        </div>
      ),
    },
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
  //
  const handleCheckBoxChange = data => {
    if (selected.includes(data.assetPmId)) setSelected(p => p.filter(d => d !== data.assetPmId))
    else setSelected(p => [...p, data.assetPmId])
  }
  const assign = async () => {
    const payload = { woId: obj.woId, assetPmId: selected, assetFormId: obj.assetFormId }
    setIsProcessing(true)
    try {
      const res = await preventativeMaintenance.workOrder.linkToLine(payload)
      if (res.success > 0) Toast.success(`PM Assigned Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error Assigning PM. Please try again !`)
    }
    setIsProcessing(false)
    onClose()
    afterSubmit()
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add PM to Workorder' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '16px', width: '80vw' }}>
        <div className='d-flex flex-row-reverse align-items-center mb-3' style={{ width: '100%' }}>
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
export default AddPMToWorkorder
