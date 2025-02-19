import React, { useRef, useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { get, isEmpty } from 'lodash'
import _ from 'lodash'
import enums from 'Constants/enums'

import { PmMetric } from 'components/preventative-maintenance/common/components'
import SearchComponent from 'components/common/search'
import { TableComponent } from 'components/common/table-components'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { StatusSelectPopup, StatusComponent, ElipsisWithTootip, PopupModal, DropDownMenu, AssetTypeIcon } from 'components/common/others'
import { backlogPMFilterOptions, getDueInColor, customSort } from 'components/preventative-maintenance/common/utils'
import { MinimalTextArea, MinimalDatePicker } from 'components/Assets/components'

import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined'
import AddIcon from '@material-ui/icons/Add'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import RefreshOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import TablePagination from '@material-ui/core/TablePagination'
import { AppBar } from '@material-ui/core'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import Modal from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import EditAssetPM from 'components/preventative-maintenance/asset/edit-asset-pm'
import ViewPM from 'components/preventative-maintenance/common/view-pm'
import { pmStatusOptions, getChip } from 'components/preventative-maintenance/common/utils'
import AddToWorkorder from 'components/preventative-maintenance/list/add-to-workorder'
import AssignPM from 'components/preventative-maintenance/list/assign-pm'
import AssetWisePM from 'components/preventative-maintenance/list/asset-wise-pm'
import { criticalityOptions, physicalConditionOptions } from 'components/WorkOrders/onboarding/utils'

import preventativeMaintenance from 'Services/preventative-maintenance'
import { getFormatedDate } from 'helpers/getDateTime'

import { Toast } from 'Snackbar/useToast'
import { useLocation } from 'react-router-dom/cjs/react-router-dom'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'
import { utils } from 'react-modern-calendar-datepicker'

import XLSX from 'xlsx'
import * as yup from 'yup'
import moment from 'moment'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const PreventativeMaintenance = () => {
  // metrics
  const { initialLoading: loading, data, reFetch } = useFetchData({ fetch: preventativeMaintenance.asset.getMetrics, formatter: d => get(d, 'data', {}) })
  // pms
  const location = useLocation()

  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [statusFilter, setStatusFilter] = useState(get(location, 'state', []) || [])
  const [searchString, setSearchString] = useState('')
  const [loadingId, setLoadingId] = useState('')
  const [viewingId, setViewingId] = useState('')
  const [anchorObj, setAnchorObj] = useState({})
  const [isViewPMOpen, setViewPMOpen] = useState(false)
  const [isEditPMOpen, setEditPMOpen] = useState(false)
  const [isCompleteOpen, setCompleteOpen] = useState(false)
  const [isAddToWoOpen, setAddToWoOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [completeLoading, setCompleteLoading] = useState(false)
  const [selectedWorkorder, setSelectedWorkorder] = useState({})
  const [isAddToPmOpen, setAddToPmOpen] = useState(false)
  const [isExportLoading, setExportLoading] = useState(false)
  const [date, setDate] = useState(null)
  const [openModel, setOpenModel] = useState(false)

  const uploadPMsRef = useRef()
  const [uploadError, setUploadError] = useState('')
  // Tabs
  const [tab, setTab] = useState('DEFAULT')

  const payload = { pagesize: rowsPerPage, pageindex: pageIndex, assetId: null, searchString, status: statusFilter.filter(d => d !== enums.PM.STATUS.OVERDUE), IsRequestedForAssign: false, isRequestedForOverduePm: statusFilter.includes(enums.PM.STATUS.OVERDUE) }
  const { loading: loadingPMs, data: pms, reFetch: refetchPMs } = useFetchData({ fetch: preventativeMaintenance.asset.getAssignedPMsOptimized, payload, formatter: d => get(d, 'data', {}) })
  const columns = [
    {
      name: 'Asset Name',
      render: d => (
        <div className='d-flex align-items-center'>
          <AssetTypeIcon type={d.assetClassType} />
          {d.assetName}
        </div>
      ),
    },
    { name: 'Asset Class', accessor: 'assetClassName' },
    { name: 'PM Item', render: d => <ElipsisWithTootip title={d.title} size={25} /> },
    { name: 'PM Plan', accessor: 'assetPlanName' },
    {
      name: 'Due In',
      render: d => {
        if (!d.dueDate && enums.PM.STATUS.COMPLETED !== d.status) return 'NA'
        const d1 = new Date()
        const d2 = new Date(d.dueDate)
        const isOverdue = d.pmDueOverdueFlag === enums.WO_DUE_FLAG.OVERDUE ? true : false
        const isDue = d.pmDueOverdueFlag === enums.WO_DUE_FLAG.DUE ? true : false //if only due then show orange
        const diffInDays = isOverdue ? -1 : isDue ? 35 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        // const diffInDays = d.isOverdue ? -1 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
        const color = enums.PM.STATUS.COMPLETED !== d.status ? getDueInColor(diffInDays) : '#37d482'
        const label = enums.PM.STATUS.COMPLETED !== d.status ? d.dueIn : 'Completed'
        if (enums.PM.STATUS.COMPLETED === d.status) return ''
        if (!color) return 'N/A'
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
    {
      name: 'Actions',
      render: d => {
        return (
          d.isCurrentAssetpm && (
            <div className='d-flex align-items-center'>
              <ActionButton hide={enums.PM.STATUS.COMPLETED === d.status} isLoading={loadingId === d.assetPmId} tooltip='EDIT' action={e => onEdit(e, d)} icon={<EditOutlinedIcon fontSize='small' />} />
              <ActionButton hide={enums.PM.STATUS.COMPLETED === d.status} tooltip='MARK COMPLETE' action={e => onComplete(e, d)} icon={<CheckOutlinedIcon fontSize='small' />} />
              <ActionButton hide={viewingId !== d.assetPmId} isLoading={viewingId === d.assetPmId} />
            </div>
          )
        )
      },
    },
  ]

  //
  const onView = async ({ assetPmId: id }) => {
    setViewingId(id)
    const dataFetched = await fetchPM(id)
    setViewingId('')
    if (dataFetched) setViewPMOpen(true)
  }
  const onEdit = async (e, { assetPmId: id }) => {
    e.stopPropagation()
    setLoadingId(id)
    const dataFetched = await fetchPM(id)
    setLoadingId('')
    if (dataFetched) setEditPMOpen(true)
  }
  const onComplete = async (e, { assetPmId }) => {
    e.stopPropagation()
    setAnchorObj({ assetPmId })
    setComment('')
    setCompleteOpen(true)
  }
  const completePM = async () => {
    setCompleteLoading(true)
    try {
      const res = await preventativeMaintenance.asset.markComplete({ assetPmId: anchorObj.assetPmId })
      if (res.success > 0) Toast.success(`PM Completed Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error completing PM. Please try again !`)
    }
    setCompleteLoading(false)
    setCompleteOpen(false)
    afterSubmit()
  }
  const fetchPM = async id => {
    try {
      const res = await preventativeMaintenance.asset.getPM({ id })
      if (res.success > 0) {
        setAnchorObj(res.data)
        return true
      } else throw new Error()
    } catch (error) {
      Toast.error(`Error fetching PM. Please try again !`)
      return false
    }
  }
  const afterSubmit = () => {
    reFetch()
    refetchPMs()
  }
  const selectWorkorder = wo => {
    setSelectedWorkorder(wo)
    setAddToPmOpen(true)
    setAddToWoOpen(false)
  }
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
  //console.log(get(pms, 'list', []))
  //

  const handleCheck = (value, type) => {
    const options = type === 'PHYSICAL' ? physicalConditionOptions : criticalityOptions
    const x = options.find(d => d.value === value)
    if (!x) return ''
    return x.label
  }
  const handleExportList = async () => {
    const listPayload = {
      ...payload,
      pagesize: 0,
      pageindex: 0,
      searchString: '',
      status: [],
      endDueDate: !isEmpty(date) ? new Date(date?.year, date?.month - 1, date?.day, 12)?.toISOString() : null,
      isRequestForPmReport: true,
    }

    try {
      setExportLoading(true)
      const res = await preventativeMaintenance.asset.getAssignedPMs(listPayload)
      if (res.success > 0) {
        const excelData = []
        const list = get(res, 'data.list', [])
        const sortedRows = _.orderBy(
          list,
          [
            d => {
              const matchResult = d?.frequency?.match(/(\d+)\s+(\w+)/)
              if (matchResult) {
                return customSort(matchResult[1], matchResult[2])
              }
              return 0 // Default value if frequency is not in expected format
            },
            d => (d.room && d.room.toLowerCase()) || '\uffff',
            d => (d.assetName && d.assetName.toLowerCase()) || '\uffff',
            d => (d.title && d.title.toLowerCase()) || '\uffff',
          ],
          ['asc', 'asc', 'asc', 'asc']
        )
        sortedRows.forEach(d =>
          excelData.push({
            'Asset ID': d.assetId,
            'Asset Name': d.assetName,
            'Asset Class Code': d.assetClassCode,
            'Asset Class Name': d.assetClassName,
            Building: d.building,
            Floor: d.floor,
            Room: d.room,
            'Top-Level Component': d.topLevelAssetName,
            'PM Plan': d.assetPlanName,
            'PM Item ID': d.assetPmId,
            'PM Item': d.title,
            Frequency: d.frequency,
            // 'Asset Condition': handleCheck(d?.criticalityIndexType, 'PHYSICAL'),
            // Criticality: handleCheck(d?.assetOperatingConditionState, ''),
            'Due Date': getFormatedDate(d.dueDate?.split('T')[0]),
            Status: d.statusName.replace('Active', 'Open'),
          })
        )
        exportSpreadSheet({ data: excelData, fileName: 'Due PMs' })
        Toast.success('Report Downloaded Successfully!')
      } else Toast.error(res.message || 'Error exporting data. Please try again !')
      setExportLoading(false)
      handleModelClose()
    } catch (error) {
      Toast.error('Error Exporting data. Please try again !')
      setExportLoading(false)
      handleModelClose()
    }
  }

  const exportDuePMsReportSuccess = res => {
    if (res.success > 0) {
      const excelData = []
      const list = get(res, 'data.list', [])
      const sortedRows = _.orderBy(
        list,
        [
          d => {
            const matchResult = d?.pmIntervalFrequency?.match(/(\d+)\s+(\w+)/)
            if (matchResult) {
              return customSort(matchResult[1], matchResult[2])
            }
            return 0 // Default value if frequency is not in expected format
          },
          d => (d.room && d?.room?.toLowerCase()) || '\uffff',
          d => (d.assetName && d?.assetName?.toLowerCase()) || '\uffff',
          d => (d.pmTitle && d?.pmTitle?.toLowerCase()) || '\uffff',
        ],
        ['asc', 'asc', 'asc', 'asc']
      )

      sortedRows.forEach(d =>
        excelData.push({
          'Asset ID': d.assetId,
          'Asset Name': d.assetName,
          'Asset Class Code': d.assetClassCode,
          'Asset Class Name': d.assetClassName,
          Building: d.building,
          Floor: d.floor,
          Room: d.room,
          'Top-Level Component': d.topLevelAssetName,
          'PM Plan': d.pmPlanTitle,
          'PM Item ID': d.assetPmId,
          'PM Item': d.pmTitle,
          Frequency: d?.pmIntervalFrequency || '', // Added a null check here
          'Last Inspected Date': getFormatedDate(d.pmLastCompletedDate?.split('T')[0]),
          'Asset PM Active Status': d.isAssetpmEnabled,
        })
      )
      exportSpreadSheet({ data: excelData, fileName: 'Last Inspected PMs' })
    }
  }

  const postError = err => {
    console.log(err)
  }

  const { loading: reportLoading, mutate: completedDate } = usePostData({ executer: preventativeMaintenance.report.exportDuePMsReport, postSuccess: exportDuePMsReportSuccess, postError, message: { success: 'Report Downloaded Successfully!', error: 'Something went wrong' } })
  const handleCompletedDateReport = async () => completedDate({ siteId: getApplicationStorageItem('siteId') })

  const handleModelClose = () => {
    setOpenModel(false)
    setDate(null)
  }

  const handleUploadPMs = () => {
    setUploadError('')
    uploadPMsRef.current && uploadPMsRef.current.click()
  }

  const addInspectedPMs = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setUploadError(enums.errorMessages.error_msg_file_format)
      else {
        setUploadError('')
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { raw: false })
        validateSheet(data)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }

  const validateSheet = async data => {
    try {
      const schema = yup.object().shape({
        assetPmId: yup.string().required('Asset PM Id is required'),
        lastCompletedDate: yup.string().required('Last Completed Date is required'),
      })

      const errors = []
      let shouldCallAPI = true

      const payload = await Promise.all(
        data.map(async (d, index) => {
          const assetPmId = get(d, 'PM Item ID', '').toString().trim()
          const lastCompletedDate = get(d, 'Last Inspected Date', '').toString().trim()

          if (!isEmpty(lastCompletedDate)) {
            const parsedDate = moment(lastCompletedDate)

            if (parsedDate.isValid()) {
              const validatedData = {
                assetPmId,
                lastCompletedDate: parsedDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                isAssetpmEnabled: get(d, 'Asset PM Active Status', 'true')?.toLowerCase() === 'true' ? true : false,
              }

              await schema.validate(validatedData, { abortEarly: false })

              return validatedData
            } else {
              // Handle invalid date
              errors.push(`${index + 2},`)
              return null
            }
          }
          return null
        })
      )

      const filteredPayload = payload.filter(val => val !== null)
      const invalidSheet = payload.every(val => val === null)

      if (invalidSheet) {
        setUploadError('Invalid excel sheet, Please upload the valid excel sheet..')
        shouldCallAPI = false
      }
      if (errors.length > 0) {
        setUploadError(`Invalid Date on Line [${errors.join('\n')}]`)
        uploadPMs(filteredPayload)
      }
      if (errors.length === 0 && shouldCallAPI) {
        uploadPMs(filteredPayload)
      }
    } catch (error) {
      Toast.error(`Error reading file!`)
    }
  }

  const { loading: uploadLoading, mutate: uploadPMsData } = usePostData({ executer: preventativeMaintenance.report.bulkUploadLastCompletedPMs, message: { error: 'Something went wrong' } })
  const uploadPMs = async payload => uploadPMsData({ assetPmIdWithLastCompletedDateList: payload })

  const dropDownMenuOptions = [
    { id: 1, type: 'button', text: 'Add To WorkOrder', onClick: () => setAddToWoOpen(true), icon: <AddIcon fontSize='small' />, show: true },
    { id: 2, type: 'button', text: 'Export Due PMs', onClick: () => setOpenModel(true), icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    { id: 3, type: 'button', text: 'Bulk Export', onClick: handleCompletedDateReport, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    { id: 4, type: 'button', text: 'Bulk Upload', onClick: handleUploadPMs, icon: <PublishOutlinedIcon fontSize='small' />, show: true },
    { id: 5, type: 'input', show: true, onChange: addInspectedPMs, ref: uploadPMsRef },
  ]

  return (
    <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '20px' }}>
      <div className='d-flex' style={{ gap: '20px' }}>
        <PmMetric title='Open' count={get(data, 'openAssetPmCount', 0)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' w={12} />
        <PmMetric title='Scheduled' count={get(data, 'scheduledAssetPmCount', 0)} loading={loading} icon={RefreshOutlinedIcon} color='#FF9D33' w={12} />
        <PmMetric title='Overdue' count={get(data, 'overdueAssetPmCount', 0)} loading={loading} icon={ErrorOutlineOutlinedIcon} color='#F64949' w={12} />
        <PmMetric title='Completed' count={get(data, 'completedAssetPmCount', 0)} loading={loading} icon={CheckCircleOutlineOutlinedIcon} color='#41BE73' w={12} />
      </div>
      <div className='d-flex justify-content-between align-items-center my-3' style={{ width: '100%' }}>
        <div className='d-flex align-items-center'>
          <StatusSelectPopup options={backlogPMFilterOptions} statusFilterValues={statusFilter} onChange={d => setStatusFilter(d)} style={{ marginRight: '10px' }} controlClassName='xs-button' />
          {/* <MinimalButton onClick={() => setAddToWoOpen(true)} text='Add To WorkOrder' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='xs-button' /> */}
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
            {/* <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Export PMs' action={handleExportList} isLoading={isExportLoading} /> */}
            <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} />
            {reportLoading && <div className='ml-2 text-bold'>Exporting ...</div>}
            {uploadLoading && <div className='ml-2 text-bold'>Uploading ...</div>}
            {!isEmpty(uploadError) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{uploadError}</span>}
          </div>
        </div>
        <SearchComponent placeholder='Search PMs' postClear={postSearch} postSearch={postSearch} setSearchString={setSearchString} searchString={searchString} />
      </div>

      {/* tabs */}
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={tab} onSelect={k => setTab(k)}>
            <Tab eventKey='DEFAULT' title='Default' tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='ASSET_WISE' title='Asset Wise' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>
      {tab === 'DEFAULT' && (
        <>
          <div className='table-responsive dashboardtblScroll my-2' id='style-1' style={{ height: 'calc(100% - 230px)' }}>
            <TableComponent loading={loadingPMs} columns={columns} data={get(pms, 'list', [])} onRowClick={d => onView(d)} isForViewAction={true} />
          </div>
          {!isEmpty(get(pms, 'list', [])) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={get(pms, 'listsize', 0)} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
        </>
      )}

      {tab === 'ASSET_WISE' && <AssetWisePM searchString={searchString} statusFilter={statusFilter} />}

      {isViewPMOpen && <ViewPM open={isViewPMOpen} onClose={() => setViewPMOpen(false)} obj={anchorObj} isAssetPM />}
      {isEditPMOpen && <EditAssetPM obj={anchorObj} open={isEditPMOpen} afterSubmit={afterSubmit} onClose={() => setEditPMOpen(false)} />}
      {isCompleteOpen && (
        <PopupModal cta='Complete' loadingText='Completing' open={isCompleteOpen} onClose={() => setCompleteOpen(false)} title='Mark Completed' loading={completeLoading} handleSubmit={completePM}>
          <MinimalTextArea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder='Please enter comment here..' w={100} />
        </PopupModal>
      )}
      {isAddToWoOpen && <AddToWorkorder open={isAddToWoOpen} onClose={() => setAddToWoOpen(false)} selectWorkorder={selectWorkorder} />}
      {isAddToPmOpen && <AssignPM open={isAddToPmOpen} onClose={() => setAddToPmOpen(false)} afterSubmit={afterSubmit} selectedWorkorder={selectedWorkorder} />}

      {/* select date modal */}
      <Modal open={openModel} onClose={handleModelClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
        <div style={modalStyle} className='add-task-modal'>
          <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Export Report</div>
            <IconButton onClick={handleModelClose} size='small'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </div>
          <div className='px-3 py-2'>
            <MinimalDatePicker date={date} setDate={d => setDate(d)} label='Select Date' w={100} minimumDate={utils().getToday()} />
          </div>
          <div className='content-bar bottom-bar mx-2'>
            <MinimalButton variant='contained' color='default' text='Cancel' onClick={handleModelClose} />
            <MinimalButton variant='contained' color='primary' text='Export' loadingText='Exporting...' onClick={handleExportList} disabled={isExportLoading} loading={isExportLoading} style={{ marginLeft: '10px' }} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '25%',
}

export default PreventativeMaintenance
