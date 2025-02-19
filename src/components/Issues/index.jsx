import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom/cjs/react-router-dom.min'

import useFetchData from 'hooks/fetch-data'
import { snakifyKeys } from 'helpers/formatters'
import { get, isEmpty } from 'lodash'
import _ from 'lodash'
import enums from 'Constants/enums'

import AddIcon from '@material-ui/icons/Add'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'

import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { AssetTypeIcon, DropDownMenu, StatusComponent, StatusSelectPopup } from 'components/common/others'
import DialogPrompt from 'components/DialogPrompt'

import TablePagination from '@material-ui/core/TablePagination'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import PictureAsPdfOutlinedIcon from '@material-ui/icons/PictureAsPdfOutlined'
import AssignmentReturnedOutlinedIcon from '@material-ui/icons/AssignmentReturnedOutlined'

import issues from 'Services/issues'
import { Toast } from 'Snackbar/useToast'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'

import { statusOptions, priorityOptions, getChip, typeOptions, statusChipOptions } from './utlis'
import { history } from 'helpers/history'
import Edit from 'components/Issues/edit'
import WorkOrderListIssue from 'components/Issues/workorder-list'

import getUserRole from 'helpers/getUserRole'
import { conditionOptions, criticalityOptions, physicalConditionOptions } from 'components/WorkOrders/onboarding/utils'

const IssueList = () => {
  const filter = statusOptions.find(d => d.label === get(history, 'location.state.filter', ''))
  const [pageIndex, setPageIndex] = useState(get(history, 'location.state.pageIndex', 1))
  const [page, setPage] = useState(get(history, 'location.state.page', 0))
  const [rowsPerPage, setRowsPerPage] = useState(get(history, 'location.state.pageRows', 20))
  const [searchString, setSearchString] = useState(get(history, 'location.state.search', ''))
  const [statusFilter, setStatusFilter] = useState(get(filter, 'value', []))
  const { loading, data, reFetch } = useFetchData({ fetch: issues.getListOptimized, payload: { page_index: pageIndex, page_size: rowsPerPage, searchString, status: statusFilter }, formatter: d => get(d, 'data', {}) })
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [anchorObj, setAnchorObj] = useState({})
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isWorkorderList, setWorkorderList] = useState(false)
  const isResetFilterDisabled = isEmpty(statusFilter)
  const [loadingId, setLoadingId] = useState('')
  const [isExportLoading, setExportLoading] = useState(false)
  const [downReportLoading, setDownReportLoading] = useState(false)

  const userRole = new getUserRole()

  const location = useLocation()
  //
  const columns = [
    { name: 'Issue#', accessor: 'issueNumber', isHidden: false },
    { name: 'Issue Title', render: d => d.issueTitle?.split('_').join(' - '), isHidden: false },
    {
      name: 'Asset Name',
      render: d => {
        if (!d.assetName) return
        return (
          <>
            {/* {userRole.isExecutive() ? (
              <div className='d-flex align-items-center'>
                <AssetTypeIcon type={d.assetClassType} />
                {d.assetName}
              </div>
            ) : ( */}
            <div className='d-flex align-items-center'>
              <AssetTypeIcon type={d.assetClassType} />
              <span onClick={e => handleAction(e, 'ASSET_CLICK', d)} className='text-bold' style={{ color: '#778899', textDecoration: 'underline', fontStyle: 'italic' }}>
                {d.assetName}
              </span>
            </div>
            {/* )} */}
          </>
        )
      },
      isHidden: false,
    },
    {
      name: 'WO #',
      render: d => {
        if (!d.manualWoNumber) return
        return (
          <>
            {/* {userRole.isExecutive() ? (
              d.manualWoNumber
            ) : ( */}
            <span onClick={e => handleAction(e, 'WO_CLICK', d)} className='text-bold' style={{ color: '#778899', textDecoration: 'underline', fontStyle: 'italic' }}>
              {d.manualWoNumber}
            </span>
            {/* )} */}
          </>
        )
      },
      isHidden: false,
    },
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
    { name: 'Time Elapsed', accessor: 'issueTimeElapsed', isHidden: false },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton isLoading={loadingId === d.assetIssueId} hide={d.issueStatus === enums.ISSUE.STATUS.RESOLVED} tooltip='EDIT' action={e => handleAction(e, 'EDIT', d)} icon={<EditOutlinedIcon fontSize='small' />} />
          <ActionButton hide={d.issueStatus === enums.ISSUE.STATUS.RESOLVED || !isEmpty(d.manualWoNumber)} tooltip='DELETE' action={e => handleAction(e, 'DELETE', d)} icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />} />
        </div>
      ),
      isHidden: false,
    },
  ]

  const exportObReport = async type => {
    setDownReportLoading(true)
    try {
      const document = await issues.getSiteIssueReport(type)
      if (document.success > 0) {
        Toast.success(`Your report is being generated and will be emailed to you shortly. You’ll receive an email with the download link for the report once it's ready. Thank you for your patience!`)
      } else {
        Toast.error('Failed to send the report. Please try again later.')
      }
    } catch (err) {
      Toast.error('Failed to send the report. Please try again later.')
    }
    setDownReportLoading(false)
  }

  const dropDownMenuOptions = [
    { id: 1, type: 'button', text: 'Docx', onClick: () => exportObReport('docx'), icon: <DescriptionOutlinedIcon fontSize='small' />, disabled: downReportLoading || isEmpty(get(data, 'list', [])), show: true },
    { id: 2, type: 'button', text: 'PDF', onClick: () => exportObReport('pdf'), icon: <PictureAsPdfOutlinedIcon fontSize='small' />, disabled: downReportLoading || isEmpty(get(data, 'list', [])), show: true },
    { id: 2, type: 'button', text: 'Excel', onClick: () => handleExportList(), icon: <AssignmentReturnedOutlinedIcon fontSize='small' />, disabled: isExportLoading || isEmpty(get(data, 'list', [])), show: true },
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
  const handleAction = async (event, type, data) => {
    event.stopPropagation()
    setAnchorObj(data)
    if (type === 'NEW') setIsAddOpen(true)
    if (type === 'EDIT') {
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
    if (type === 'DELETE') setIsDeleteOpen(true)
    if (type === 'WO_CLICK') window.open(`../workorders/details/${data.woId}`)
    if (type === 'ASSET_CLICK') window.open(`../assets/details/${data.assetId}`, '_blank')
  }
  const resetFilter = () => {
    setStatusFilter([])
  }
  const deleteIssue = async () => {
    setDeleteLoading(true)
    try {
      const res = await issues.delete(snakifyKeys({ assetIssueId: anchorObj.assetIssueId }))
      if (res.success > 0) Toast.success(`Issue Deleted Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error deleting Issue. Please try again !`)
    }
    setDeleteLoading(false)
    setIsDeleteOpen(false)
    reFetch()
  }
  const handleExportList = async () => {
    try {
      setExportLoading(true)
      const res = await issues.getListOptimized({ payload: { page_size: 0, page_index: 0, status: [], search_string: '' } })
      if (res.success > 0) {
        const excelData = []
        const list = get(res, 'data.list', [])
        list.forEach(d => {
          const priority = getChip(d.priority, priorityOptions)
          const type = typeOptions.find(q => q.value === d.issueType)

          const criticalityOption = criticalityOptions.find(c => c.value === d.assetCriticalityIndexType)
          const conditionOption = conditionOptions.find(c => c.value === d.assetConditionIndexType)
          const assetCondition = physicalConditionOptions.find(a => a.value === d.assetOperatingConditionState)

          excelData.push({
            'Issue Number': d.issueNumber,
            Name: d.assetName,
            'Asset Class Name': d.assetClassName,
            'Operating Condition': get(conditionOption, 'label', ''),
            Criticality: get(criticalityOption, 'label', ''),
            'Asset Condition': get(assetCondition, 'label', ''),
            'Issue Title': d.issueTitle,
            Description: d.issueDescription,
            'Issue Type': get(type, 'label', 'N/A'),
            Priority: get(priority, 'label', ''),
            'Corrective Action': d.thermalAnomalyCorrectiveAction,
            Status: d.issueStatusName.replace('Completed', 'Resolved'),
            'Site Name': d.siteName,
            'Client Company Name': d.clientCompanyName,
            'Company Name': d.companyName,
            Comments: d.comments,
          })
        })
        exportSpreadSheet({ data: excelData, fileName: 'issues-list' })
      } else Toast.error(res.message || 'Error exporting data. Please try again !')
      setExportLoading(false)
    } catch (error) {
      Toast.error('Error Exporting data. PLease try again !')
      setExportLoading(true)
    }
  }
  const postSearch = () => {
    setPage(0)
    setPageIndex(1)
  }
  //
  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '20px' }}>
      <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
        <div className='d-flex align-items-center'>
          <StatusSelectPopup options={statusOptions} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} style={{ marginRight: '10px' }} />
          <MinimalButton onClick={e => handleAction(e, 'NEW', '')} text='Create Issue' size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginRight: '10px' }} />
          <MinimalButton onClick={() => setWorkorderList(true)} text='Add to Work Order' size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' />
          {/* <MinimalButton onClick={handleExportList} text='Export Issues' size='small' startIcon={<GetAppOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '10px' }} loadingText='Exporting...' loading={isExportLoading} disabled={isExportLoading} /> */}
          <DropDownMenu btnText={downReportLoading || isExportLoading ? 'Generating...' : 'Generate Report'} dropDownMenuOptions={dropDownMenuOptions} style={{ marginLeft: '10px' }} minWidth='140px' />
          {/* <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
            <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Export Issues' action={handleExportList} isLoading={isExportLoading} />
            {isExportLoading && <div className='ml-1 text-bold'>Exporting ...</div>}
          </div> */}
        </div>
        <div className='d-flex align-items-center'>
          <SearchComponent placeholder='Search Issues' setSearchString={setSearchString} searchString={searchString} postClear={postSearch} postSearch={postSearch} />
          <MinimalButton text='Reset Filter' size='small' onClick={resetFilter} startIcon={<RotateLeftSharpIcon fontSize='small' />} disabled={isResetFilterDisabled} variant='contained' color='primary' baseClassName='nf-buttons ml-2' />
        </div>
      </div>
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 200px)', height: 'calc(100vh - 200px)' }}>
        <TableComponent loading={loading} columns={columns.filter(e => e.isHidden === false)} data={get(data, 'list', [])} onRowClick={d => history.push({ pathname: `/issues/details/${d.assetIssueId}`, state: { filter: statusFilter, search: searchString, pageRows: rowsPerPage, pageIndex: pageIndex, page: page } })} isForViewAction={true} />
      </div>
      {!isEmpty(get(data, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(data, 'listsize', 0)} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {isAddOpen && <Edit open={isAddOpen} afterSubmit={reFetch} onClose={() => setIsAddOpen(false)} />}
      {isEditOpen && <Edit obj={anchorObj} isEdit open={isEditOpen} afterSubmit={reFetch} onClose={() => setIsEditOpen(false)} />}
      <DialogPrompt title='Delete Issue' text='Are you sure you want to delete the issue ?' actionLoader={deleteLoading} open={isDeleteOpen} ctaText='Delete' action={deleteIssue} handleClose={() => setIsDeleteOpen(false)} />
      {isWorkorderList && <WorkOrderListIssue open={isWorkorderList} onClose={() => setWorkorderList(false)} />}
    </div>
  )
}

export default IssueList
