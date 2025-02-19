import React, { useState } from 'react'

import Drawer from '@material-ui/core/Drawer'
import TablePagination from '@material-ui/core/TablePagination'

import { get, isEmpty } from 'lodash'
import { camelizeKeys } from 'helpers/formatters'
import { getFormatedDate } from 'helpers/getDateTime'

import getAllWOs from 'Services/WorkOrder/getAllWOs'
import useFetchData from 'hooks/fetch-data'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import SearchComponent from 'components/common/search'
import { StatusComponent } from 'components/common/others'
import { TableComponent } from 'components/common/table-components'
import CreateAccWO from 'components/WorkOrders/CreateAccWO'
import AddIssueToWorkorder from 'components/Issues/add-issue-to-workorder'

import enums from 'Constants/enums'

const WorkOrderListIssue = ({ open, onClose }) => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)
  const [searchString, setSearchString] = useState('')
  const [accWOOpen, setAccWOOpen] = useState(false)
  const [noReDirect, setNoReFirect] = useState(true)
  const [isOpenIssue, setOpenIssue] = useState(false)
  const [workOrderId, setWorkOrderId] = useState('')

  const payload = { pageSize, pageIndex, search_string: searchString, wo_status: [enums.woTaskStatus.ReleasedOpen, enums.woTaskStatus.InProgress, enums.woTaskStatus.Hold], wo_type: [enums.woType.Maintainance] }
  const { loading, data, reFetch } = useFetchData({ fetch: getAllWOs, payload, formatter: d => camelizeKeys(get(d, 'data', {})), defaultValue: [] })

  const columns = [
    { name: 'WO#', render: d => <div style={{ padding: '3px' }}>{d.manualWoNumber}</div> },
    {
      name: 'Type',
      render: d => (
        <div className='d-flex align-items-center' style={{ height: '24px' }}>
          {d.woTypeName.slice(0, -3)}
        </div>
      ),
    },
    { name: 'Customer', accessor: 'clientCompanyName' },
    { name: 'Facility', accessor: 'siteName' },
    { name: 'Start Date', render: d => getFormatedDate(d.startDate.split('T')[0]) },
    {
      name: 'Status',
      render: d => {
        const status = enums.WO_STATUS.find(x => x.value === d.woStatusId)
        if (!status) return 'NA'
        return <StatusComponent color={status.color} label={status.label} size='small' />
      },
    },
  ]

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

  const handleIssueView = data => {
    setWorkOrderId(data.woId)
    setOpenIssue(true)
  }
  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Work Order' closeFunc={onClose} style={{ width: '100%', minWidth: '450px' }} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#fff', padding: '10px', width: '80vw' }}>
        <div className='d-flex  justify-content-between align-items-center my-3 ' style={{ width: '100%' }}>
          <MinimalButton text='Create New Work Order' onClick={() => setAccWOOpen(true)} size='small' variant='contained' color='primary' baseClassName='nf-buttons' />
          <SearchComponent placeholder='Search' postClear={postSearch} postSearch={postSearch} searchString={searchString} setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 115px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} isForViewAction={true} onRowClick={d => handleIssueView(d)} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <CreateAccWO open={accWOOpen} type={enums.woType.Maintainance} noReDirect={noReDirect} handleClose={() => setAccWOOpen(false)} reFetch={() => reFetch()} />
      {isOpenIssue && <AddIssueToWorkorder open={isOpenIssue} onClose={() => setOpenIssue(false)} workOrderId={workOrderId} />}
    </Drawer>
  )
}

export default WorkOrderListIssue
