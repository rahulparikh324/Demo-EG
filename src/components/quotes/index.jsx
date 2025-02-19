import React, { useContext, useState } from 'react'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { statusOptions, statusChipOptions, quotesType, quoteTypesPath } from './utils'
import { isEmpty, get, orderBy } from 'lodash'
import enums from 'Constants/enums'

import { StatusComponent, StatusSelectPopup, DropDownMenu } from 'components/common/others'
import SearchComponent from 'components/common/search'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { TableComponent } from 'components/common/table-components'
import CreateAccWO from 'components/WorkOrders/CreateAccWO'
import { getChip } from 'components/preventative-maintenance/common/utils'
import DialogPrompt from 'components/DialogPrompt'

import deleteWO from 'Services/WorkOrder/deleteWO'

import { getFormatedDate } from 'helpers/getDateTime'
import { history } from 'helpers/history'

import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import TablePagination from '@material-ui/core/TablePagination'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import getAllWOsOptimized from 'Services/WorkOrder/getAllWOsOptimized'
import { changeActiveSite } from 'components/common/change-active-site'
import { MainContext } from 'components/Main/provider'

const QuotesList = () => {
  const [page, setPage] = useState(get(history, 'location.state.pageIndex', 1) - 1)
  const [pageIndex, setPageIndex] = useState(get(history, 'location.state.pageIndex', 1))
  const [pageSize, setPageSize] = useState(get(history, 'location.state.pageRows', 20))
  const [statusFilter, setStatusFilter] = useState(get(history, 'location.state.filter', []))
  const [searchString, setSearchString] = useState(get(history, 'location.state.search', ''))
  const [isOpenCreateQuotes, setOpenCreateQuotes] = useState({ quotesOpen: false, type: enums.QUOTES.quotesType.Maintainance })
  const [anchorObj, setAnchorObj] = useState({})
  const [isDeleteQuoteOpen, setDeleteQuoteOpen] = useState(false)
  const { setLoginSiteData } = useContext(MainContext)

  const payload = {
    pageIndex,
    pageSize,
    search_string: searchString,
    technician_user_id: null,
    from_date: null,
    to_date: null,
    wo_status: [],
    wo_type: [enums.woType.InfraredScan, enums.woType.Maintainance, enums.woType.OnBoarding],
    site_id: JSON.parse(localStorage.getItem('siteListForWO')),
    quote_status: statusFilter,
    is_requested_from_workorders_tab: false,
  }

  const { initialLoading, data, reFetch } = useFetchData({ fetch: getAllWOsOptimized, payload, formatter: d => get(d, 'data', []), defaultValue: [] })

  const columns = [
    { name: 'Quote Number', accessor: 'manual_wo_number' },
    {
      name: 'Quote Type',
      render: d => {
        const quoteType = quotesType.find(v => v.value === d.wo_type)
        return get(quoteType, 'label', 'N/A')
      },
    },
    { name: 'Facility', accessor: 'site_name' },
    { name: 'Quote Date', render: d => getFormatedDate(d.start_date?.split('T')[0]) },
    {
      name: 'Expired in',
      render: d => {
        if (isEmpty(d.due_in)) return
        if (!d.due_date && enums.PM.STATUS.COMPLETED !== d.wo_status_id) return 'NA'
        const isOverdue = d.wo_due_overdue_flag === enums.WO_DUE_FLAG.OVERDUE ? true : false
        const isDue = d.wo_due_overdue_flag === enums.WO_DUE_FLAG.DUE ? true : false //if only due then show orange
        const color = isDue ? '#E46007' : isOverdue ? '#FF0000' : '#CAA500'
        const label = isOverdue ? 'Expired' : isDue ? 'Expire Today' : d.due_in.replace('Due in ', '')
        return <StatusComponent color={color} label={label} size='small' filled />
      },
    },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getChip(d.quote_status_id, statusChipOptions)
        if (!color) return 'NA'
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={e => handleAction(e, 'DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} tooltip='DELETE' />
        </div>
      ),
    },
  ]

  const handleAction = async (event, type, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    if (type === 'DELETE') setDeleteQuoteOpen(true)
  }

  const dropDownMenuOptions = [
    {
      id: 1,
      type: 'button',
      text: 'Maintenance',
      onClick: () => setOpenCreateQuotes({ quotesOpen: true, type: enums.woType.Maintainance }),
      show: true,
    },
    {
      id: 2,
      type: 'button',
      text: 'Infrared Thermography',
      onClick: () => setOpenCreateQuotes({ quotesOpen: true, type: enums.woType.InfraredScan }),
      show: true,
    },
    {
      id: 3,
      type: 'button',
      text: 'Audit',
      onClick: () => setOpenCreateQuotes({ quotesOpen: true, type: enums.woType.OnBoarding }),
      show: true,
    },
  ]
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  const resetFilter = () => {
    setPageSize(20)
    setPage(0)
    setPageIndex(1)
    setStatusFilter([])
  }
  const handleChangePage = (e, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
    setPageIndex(1)
  }

  const postSuccess = () => {
    reFetch()
    setDeleteQuoteOpen(false)
  }

  const handleViewQuote = d => {
    const siteData = changeActiveSite(d.site_id)
    setLoginSiteData(prevState => ({
      ...prevState,
      siteName: siteData.site_name,
      activeSiteId: siteData.site_id,
      siteId: siteData.site_id,
      activeClientCompanyId: siteData.client_company_id,
      clientCompanyName: siteData.client_company_name,
    }))

    localStorage.setItem('selectedSiteId', d.site_id)
    history.push({ pathname: `${quoteTypesPath[d.wo_type]['path']}/${d.wo_id}`, state: { filter: statusFilter, pageRows: pageSize, search: searchString, pageIndex } })
  }

  const { loading: deleteLoading, mutate: deleteQuote } = usePostData({ executer: deleteWO, postSuccess, message: { success: 'Quote deleted successfully !', error: 'Something went wrong !' } })
  const handleDeleteQuote = () => deleteQuote({ wo_id: [anchorObj.wo_id] })

  return (
    <div style={{ height: 'calc(100vh - 128px)', padding: '20px', background: '#fff' }}>
      <div className='d-flex flex-row justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
        <div className='d-flex flex-row align-items-center' style={{ gap: '5px' }}>
          <StatusSelectPopup options={statusOptions} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} style={{ marginRight: '10px' }} />
          <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} btnText='Create Quote' />
        </div>
        <div className='d-flex align-items-center'>
          <SearchComponent setSearchString={setSearchString} searchString={searchString} postClear={postSearch} postSearch={postSearch} />
          <MinimalButton text='Reset Filter' size='small' onClick={resetFilter} startIcon={<RotateLeftSharpIcon fontSize='small' />} disabled={isEmpty(statusFilter)} variant='contained' color='primary' baseClassName='nf-buttons ml-2' />
        </div>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 260px)', height: 'calc(100vh - 260px)' }}>
        <TableComponent loading={initialLoading} columns={columns} data={get(data, 'list', [])} onRowClick={d => handleViewQuote(d)} isForViewAction={true} />
      </div>
      <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={pageSize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      {isOpenCreateQuotes.quotesOpen && <CreateAccWO open={isOpenCreateQuotes.quotesOpen} type={isOpenCreateQuotes.type} handleClose={() => setOpenCreateQuotes({ quotesOpen: false })} isQuotes />}
      <DialogPrompt title='Delete Quote' text='Are you sure you want to delete this Quote?' open={isDeleteQuoteOpen} ctaText='Delete' actionLoader={deleteLoading} action={handleDeleteQuote} handleClose={() => setDeleteQuoteOpen(false)} />
    </div>
  )
}

export default QuotesList
