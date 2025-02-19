import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'
import AddIcon from '@material-ui/icons/Add'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import { getFormatedDate } from 'helpers/getDateTime'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton } from 'components/common/buttons'

import { StatusComponent, ElipsisWithTootip } from 'components/common/others'
import { pmStatusOptions, getChip } from 'components/preventative-maintenance/common/utils'

import AddPMToWorkorder from 'components/preventative-maintenance/work-order/add-to-workorder'

import preventativeMaintenance from 'Services/preventative-maintenance'

const AssignPM = ({ open, onClose, obj }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const [isAddToPmOpen, setAddToPmOpen] = useState(false)
  const payload = { pagesize: pageSize, pageindex: pageIndex, searchString, assetId: get(obj, 'assignedAssetId', null), status: [], Is_requested_for_assign: false, assetFormId: get(obj, 'assetFormId', null) }
  const { loading, data } = useFetchData({ fetch: preventativeMaintenance.asset.getAssignedPMs, payload, formatter: d => get(d, 'data', []), defaultValue: [] })
  const columns = [
    { name: 'Title', render: d => <ElipsisWithTootip title={d.title} size={25} /> },
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
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add PM to Workorder' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '16px', width: '80vw' }}>
        <div className='d-flex justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
          <MinimalButton onClick={() => setAddToPmOpen(true)} text='Add PM' startIcon={<AddIcon fontSize='small' />} size='small' variant='contained' color='primary' />
          <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search PMs' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      {isAddToPmOpen && <AddPMToWorkorder open={isAddToPmOpen} afterSubmit={onClose} onClose={() => setAddToPmOpen(false)} obj={obj} />}
    </Drawer>
  )
}
export default AssignPM
