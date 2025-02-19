import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import { get, isEmpty } from 'lodash'
import enums from 'Constants/enums'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import TablePagination from '@material-ui/core/TablePagination'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { ActionButton } from 'components/common/buttons'
import { StatusComponent } from 'components/common/others'
import { priorityOptions, getChip, typeOptions, statusChipOptions } from 'components/Issues/utlis'

import issues from 'Services/issues'
import { Toast } from 'Snackbar/useToast'

import Edit from 'components/Issues/edit'
import getUserRole from 'helpers/getUserRole'

const AssetIssueList = ({ assetId }) => {
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchString, setSearchString] = useState('')
  const { loading, data, reFetch } = useFetchData({ fetch: issues.getListOptimized, payload: { page_index: pageIndex, page_size: rowsPerPage, searchString, assetId }, formatter: d => get(d, 'data', {}) })
  const [loadingId, setLoadingId] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const checkUserRole = new getUserRole()
  const columns = [
    { name: 'Issue Title', render: d => d.issueTitle?.split('_').join(' - '), isHidden: false },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.issueStatus, statusChipOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
      isHidden: false,
    },
    {
      name: 'Priority',
      render: d => {
        const { color, label } = getChip(d.priority, priorityOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
      isHidden: false,
    },
    {
      name: 'Type',
      render: d => {
        const type = typeOptions.find(q => q.value === d.issueType)
        return <div className='py-1'>{get(type, 'label', 'NA')}</div>
      },
      isHidden: false,
    },
    { name: 'Time Elapsed', accessor: 'issueTimeElapsed', isHidden: true },
    {
      name: 'Actions',
      render: d => <ActionButton isLoading={loadingId === d.assetIssueId} hide={d.issueStatus === enums.ISSUE.STATUS.RESOLVED} tooltip='EDIT' action={e => handleAction(e, d)} icon={<EditOutlinedIcon fontSize='small' />} />,
      isHidden: checkUserRole.isCompanyAdmin() ? true : false,
    },
  ]
  // handle pagination & filter
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  const handleAction = async (event, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    try {
      setLoadingId(data.assetIssueId)
      const res = await issues.getDetailById(data.assetIssueId)
      if (res.success > 0) {
        setAnchorObj(res.data)
        setIsEditOpen(true)
      } else Toast.error(res.message)
      setLoadingId('')
    } catch (error) {
      Toast.error(`Error fetching Issue. Please try again !`)
      setLoadingId('')
    }
  }
  return (
    <div style={{ height: 'calc(100% - 42px)', padding: '16px', minHeight: '400px' }}>
      <div className='d-flex mb-3 align-items-center flex-row-reverse'>
        <SearchComponent postClear={postSearch} postSearch={postSearch} placeholder='Search Issues' setSearchString={setSearchString} />
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 75px)' }}>
        <TableComponent loading={loading} columns={columns.filter(e => e.isHidden === false)} data={get(data, 'list', [])} onRowClick={d => window.open(`../../issues/details/${d.assetIssueId}`, '_blank')} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isEditOpen && <Edit obj={anchorObj} isEdit open={isEditOpen} afterSubmit={reFetch} onClose={() => setIsEditOpen(false)} />}
    </div>
  )
}

export default AssetIssueList
