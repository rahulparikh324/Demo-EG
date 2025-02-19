import React, { useState } from 'react'
import Drawer from '@material-ui/core/Drawer'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import { camelizeKeys } from 'helpers/formatters'
import { getFormatedDate } from 'helpers/getDateTime'
import enums from 'Constants/enums'

import { FormTitle } from 'components/Maintainance/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { StatusComponent } from 'components/common/others'
import { MinimalButton } from 'components/common/buttons'
import CreateAccWO from 'components/WorkOrders/CreateAccWO'

import getAllWOs from 'Services/WorkOrder/getAllWOs'

import TablePagination from '@material-ui/core/TablePagination'

const AddToWorkorder = ({ open, onClose, selectWorkorder }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [searchString, setSearchString] = useState('')
  const [noReDirect, setNoReFirect] = useState(true)
  const [accWOOpen, setAccWOOpen] = useState(false)

  const payload = { pageSize, pageIndex, search_string: searchString, wo_status: [enums.woTaskStatus.ReleasedOpen, enums.woTaskStatus.InProgress, enums.woTaskStatus.Hold], wo_type: [enums.woType.Maintainance] }
  const { loading, data, reFetch } = useFetchData({ fetch: getAllWOs, payload, formatter: d => camelizeKeys(get(d, 'data', {})), defaultValue: [] })
  const columns = [
    { name: 'WO#', accessor: 'manualWoNumber' },
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
          <MinimalButton text='Create New Work Order' onClick={() => setAccWOOpen(true)} size='small' variant='contained' color='primary' baseClassName='nf-buttons' />
          <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search PMs' setSearchString={setSearchString} />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
          <TableComponent loading={loading} columns={columns} data={get(data, 'list', [])} onRowClick={d => selectWorkorder(d)} isForViewAction={true} />
        </div>
        {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      </div>
      <CreateAccWO open={accWOOpen} type={enums.woType.Maintainance} noReDirect={noReDirect} handleClose={() => setAccWOOpen(false)} reFetch={() => reFetch()} />
    </Drawer>
  )
}

export default AddToWorkorder
