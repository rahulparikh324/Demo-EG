import React, { useState, useEffect, useContext, useRef } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import TablePagination from '@material-ui/core/TablePagination'
import { getDateTime } from '../../helpers/getDateTime'
import getAssetForm from '../../Services/FormIO/getAssetForm'
import _ from 'lodash'
import ViewForm from './ViewForm'
import enums from '../../Constants/enums'
import { makeStyles } from '@material-ui/core/styles'
import updateWOCategoryTaskStatus from '../../Services/WorkOrder/updateWOCategoryTaskStatus'
import { Toast } from '../../Snackbar/useToast'
import exportPDF from '../WorkOrders/exportPDF.js'
import generateAssetInspectionFormioPdf from '../../Services/FormIO/generateAssetInspectionFormioPdf'
import $ from 'jquery'
import getPdfGenerationStatus from '../../Services/FormIO/getPdfGenerationStatus'
import RejectCategoryTask from '../WorkOrders/RejectCategoryTask'
import getUserRole from 'helpers/getUserRole'
import updateStatusToReady from 'Services/FormIO/update-submitted'
import FilterListIcon from '@material-ui/icons/FilterList'
import 'react-modern-calendar-datepicker/lib/DatePicker.css'
import DatePicker, { utils } from 'react-modern-calendar-datepicker'
import CloseIcon from '@material-ui/icons/Close'
import useFetchData from 'hooks/fetch-data'
import getAssetsToAssign from 'Services/WorkOrder/get-assets-options'
import getWoOptions from 'Services/WorkOrder/get-wo-options'
import getInspectedByOptions from 'Services/WorkOrder/get-inspected-by-options'
import { nanoid } from 'nanoid'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import Input from '@material-ui/core/Input'
import { MinimalFilterSelector } from 'components/Assets/components'
import { StatusComponent, Menu, DropDownMenu } from 'components/common/others'
import getFormJson from 'Services/FormIO/get-form-json'
import { useParams } from 'react-router-dom'
import Checkbox from '@material-ui/core/Checkbox'
import DoneIcon from '@material-ui/icons/Done'
import { ActionButton, MinimalCircularButtonGroup, MinimalButton } from 'components/common/buttons'
import updateMultiWOCategoryTaskStatus from '../../Services/WorkOrder/updateMultiWOCategoryTaskStatus'
import changeAssetFormIOStatusFormultiple from '../../Services/FormIO/changeAssetFormIOStatusFormultiple'
import getAssetformByIDForBulkReport from '../../Services/FormIO/getAssetformByIDForBulkReport'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { BulkPdfGenrator } from '../WorkOrders/exportPDF.js'
import Tooltip from '@material-ui/core/Tooltip'
import equipments from 'Services/equipments'
import { MainContext } from 'components/Main/provider'
import reviews from 'Services/reviews'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import CheckCircleOutlineOutlined from '@material-ui/icons/CheckCircleOutlineOutlined'
import Publish from '@material-ui/icons/Publish'
import { Popover } from '@material-ui/core'
import MenuItem from '@material-ui/core/MenuItem'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import generateBulkNetaReport from 'Services/FormIO/generate-bulk-neta-report'
import { PublishOutlined } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  menu: { padding: 0, fontSize: 13, boxShadow: '0px 0px 2px #8080800a' },
  tableCell: {
    fontSize: '12px',
    fontWeight: 400,
    '&:hover': { cursor: 'pointer' },
  },
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white' },
  headRoot: { cursor: 'pointer', '&:hover': { background: '#e0e0e0 !important' } },
}))

function Submitted({ woType = false, reFetch }) {
  const { setCounter } = useContext(MainContext)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [viewFormOpen, setViewFormOpen] = useState(false)
  const [formToView, setFormToView] = useState({})
  const [pagesize, setPageSize] = useState(20)
  const [size, setSize] = useState(0)
  const [page, setPage] = useState(0)
  const [pageindex, setPageIndex] = useState(1)
  const [rowLoading, setRowLoading] = useState(false)
  const [anchorSelectedObject, setAnchorSelectedObject] = useState({})
  const classes = useStyles()
  const [reload, setReload] = useState(0)
  const [isRejectReasonModalOpen, setRejectReasonModalOpen] = useState(false)
  const checkUserRole = new getUserRole()
  const [date, setDate] = useState(null)
  const [filterForColumn, setFilterForColumn] = useState(false)
  const [assetNameForFilter, setAssetNameForFilter] = useState([])
  const [woForFilter, setWoForFilter] = useState([])
  const [inspectedByFilter, setInspectedByFilter] = useState([])
  const defaultStatus = enums.WO_STATUS.find(e => e.value === enums.woTaskStatus.ReadyForReview)
  const [statusFilter, setStatusFilter] = useState(defaultStatus)
  const [typeFilter, setTypeFilter] = useState([])
  const [searchString, setSearchString] = useState('')
  const [searchStringValue, setSearchStringValue] = useState('')
  const [isStatusChanging, setisStatusChanging] = useState(false)
  const [currentMenuStatus, setCurrentMenuStatus] = useState(enums.woTaskStatus.ReadyForReview)
  const { loading: assetLoading, data: assetOptions } = useFetchData({
    fetch: reviews.getAssetsForSubmittedFilterOptionsByStatus,
    payload: { wo_type: woType ? [enums.woType.Maintainance] : [enums.woType.Acceptance], status: currentMenuStatus === 0 ? [] : [currentMenuStatus] },
    formatter: d => d.data.map(x => ({ label: x.assetName, value: nanoid() })),
  })
  const { loading: woLoading, data: woOptions } = useFetchData({ fetch: reviews.getWorkOrdersForSubmittedFilterOptionsByStatus, payload: { wo_type: woType ? [enums.woType.Maintainance] : [enums.woType.Acceptance], status: currentMenuStatus === 0 ? [] : [currentMenuStatus] }, formatter: d => d.data })
  // const { loading: inspectedByLoading, data: inspectedByOptions } = useFetchData({ fetch: getInspectedByOptions, payload: {}, formatter: d => d.data })
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload: { pageSize: 0, pageIndex: 0, siteId: getApplicationStorageItem('siteId'), searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }, formatter: d => _.get(d, 'data.list', []) })
  const { id: sortByid } = useParams()
  const [isOptionVisible, setIsOptionVisible] = useState(false)
  const [AllChecked, setAllChecked] = useState(false)
  const [markedRows, setMarkedRows] = useState([])
  const [prevMenuStatus, setPrevMenuStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bulkRecordsForPdf, setbulkRecordsForPdf] = useState([])
  const [isActionPerforming, setIsActionPerforming] = useState(false)
  const [isGeneratingXML, setGeneratingXML] = useState(false)
  const [rowLoadingIds, setRowLoadingIds] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const isFirstRender = useRef(true)

  const buttonTypeOption = [
    { label: 'All', value: 0 },
    { label: 'Ready For Review', value: enums.woTaskStatus.ReadyForReview },
    { label: 'Completed', value: enums.woTaskStatus.Complete },
    { label: 'Submitted', value: enums.woTaskStatus.Submitted },
  ]

  const updateRowMarks = rows => {
    let tempMarkedRows = markedRows
    let tempBulkRecordsForPdf = bulkRecordsForPdf

    if (prevMenuStatus !== currentMenuStatus && currentMenuStatus === enums.woTaskStatus.Complete) {
      rows.forEach(row => {
        if (tempMarkedRows.includes(row.asset_form_id)) return
        tempMarkedRows.push(row.asset_form_id)
        tempBulkRecordsForPdf.push({
          form_category_name: row.form_category_name,
          asset_form_name: row.asset_form_name,
          asset_form_description: row.asset_form_description,
          asset_form_data: row.asset_form_data,
          form_id: row.form_id,
          asset_form_id: row.asset_form_id,
          workOrderCompleted: row.workOrderStatus === enums.woTaskStatus.Complete,
        })
      })
      setAllChecked(true)
    } else if (prevMenuStatus !== currentMenuStatus && currentMenuStatus === enums.woTaskStatus.ReadyForReview) {
      rows.forEach(row => {
        // if (tempMarkedRows.includes(row.wOcategorytoTaskMapping_id)) return
        tempMarkedRows.push(row.wOcategorytoTaskMapping_id)
        tempBulkRecordsForPdf.push({
          form_category_name: row.form_category_name,
          asset_form_name: row.asset_form_name,
          asset_form_description: row.asset_form_description,
          asset_form_data: row.asset_form_data,
          form_id: row.form_id,
          wOcategorytoTaskMapping_id: row.wOcategorytoTaskMapping_id,
        })
      })
      setAllChecked(true)
    }
    // console.log(tempMarkedRows)
    setMarkedRows([...tempMarkedRows])
    setbulkRecordsForPdf([...tempBulkRecordsForPdf])
    const currentRows = rows.map(row => {
      if (currentMenuStatus === enums.woTaskStatus.Complete) {
        return row.asset_form_id
      }
      return row.wOcategorytoTaskMapping_id
    })
    const isCoverdAll = tempMarkedRows.filter(val => currentRows.includes(val)).length === currentRows.length
    setAllChecked(isCoverdAll)
  }

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const initial_start_date_time = date ? `${date.year}-${date.month < 10 ? `0${date.month}` : date.month}-${date.day < 10 ? `0${date.day}` : date.day}` : null
        const status = sortByid && !isStatusChanging ? (parseInt(sortByid) === 70 ? [70] : [15]) : sortByid && !isStatusChanging ? (parseInt(sortByid) === 70 ? [70] : [15]) : _.get(statusFilter, 'value', '') ? [_.get(statusFilter, 'value', '')] : []
        const actualStatusValue = enums.WO_STATUS.find(d => d.value === status[0])
        if (sortByid && !isStatusChanging) {
          setStatusFilter(actualStatusValue)
          setFilterForColumn(true)
        }
        const service_type = _.get(typeFilter, 'value', '') ? [_.get(typeFilter, 'value', '')] : []
        const res = await getAssetForm({
          assetid: null,
          pagesize,
          pageindex,
          initial_start_date_time,
          initial_end_date_time: null,
          filter_asset_name: assetNameForFilter.map(d => d.label),
          wO_ids: woForFilter.map(d => d.value),
          inspected_by: inspectedByFilter.map(d => d.value),
          accepted_by: [],
          status,
          service_type,
          search_string: searchString,
          is_wo_completed: currentMenuStatus === 0,
          wo_type: woType ? [enums.woType.Maintainance] : [enums.woType.Acceptance],
        })
        setSize(res.data.listsize)
        setRows(res.data.list)
        setCounter(prev => ({ ...prev, acceptanceWoSubmittedAssetsCount: !woType ? res.data.listsize : prev.acceptanceWoSubmittedAssetsCount }))
        //updateRowMarks(res.data.list)
        setLoading(false)
      } catch (error) {
        setRows([])
        setLoading(false)
      }
    })()
  }, [pageindex, pagesize, date, reload, statusFilter, typeFilter, assetNameForFilter, inspectedByFilter, woForFilter, searchString])

  const handleChangePage = (event, newPage) => {
    setPrevMenuStatus(currentMenuStatus)
    // setAllChecked(false)
    setPage(newPage)
    setPageIndex(newPage + 1)
  }
  const handleSearchOnKeyDown = e => {
    setPage(0)
    setPageIndex(1)
    setSearchString(searchStringValue)
  }
  const clearSearch = () => {
    setSearchString('')
    setSearchStringValue('')
    setPage(0)
    setPageIndex(1)
  }
  //filters
  const handleAssetFilterChange = value => {
    setPage(0)
    setPageIndex(1)
    setAssetNameForFilter(value)
  }
  const handleWoFilterChange = value => {
    setPage(0)
    setPageIndex(1)
    setWoForFilter(value)
  }
  const handleInspectedFilterChange = value => {
    setPage(0)
    setPageIndex(1)
    setInspectedByFilter(value)
  }
  const handleStatusFilterChange = value => {
    setisStatusChanging(true)
    setPage(0)
    setPageIndex(1)
    setStatusFilter(value)
    setAllChecked(false)
  }
  const handleTypeFilterChange = value => {
    setPage(0)
    setPageIndex(1)
    setTypeFilter(value)
  }
  const handleDateFilterChange = value => {
    setPage(0)
    setPageIndex(1)
    setDate(value)
  }

  const handleChangeRowsPerPage = event => {
    setPage(0)
    setPageIndex(1)
    setPageSize(parseInt(event.target.value, 10))
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (rows.every(d => markedRows.includes(d.wOcategorytoTaskMapping_id))) {
      setAllChecked(true)
    } else {
      setAllChecked(false)
    }
  }, [page, markedRows, rows])

  const getWOTaskStatus = (status, status_name) => {
    const { color } = enums.WO_STATUS.find(d => d.value === status)
    return <StatusComponent label={status_name} color={color} size='small' />
  }

  const handleAction = async (type, obj) => {
    setAnchorSelectedObject(obj)
    if (type === 'VIEW') fetchFormJSON('VIEW', obj)
    if (type === 'EXPORT_REPORT') onExportPdf(obj)
    if (type === 'ACCEPT') await updateViewTaskStatus(obj, enums.woTaskStatus.Complete)
    if (type === 'REJECT') setRejectReasonModalOpen(true)
    if (type === 'GENERATE_PDF') await onExportPdf(obj)
    if (type === 'READY_FOR_REVIEW') await changeStatus(obj, enums.woTaskStatus.ReadyForReview)
    if (type === 'SUBMIT_TO_CUSTOMER') await changeStatus(obj, enums.woTaskStatus.Submitted)
    if (type === 'DOWNLOAD_JSON') await downloadFormData(obj, true)
    if (type === 'DOWNLOAD_XML') await downloadFormData(obj)
  }

  const downloadFormData = async (obj, isJson = false) => {
    try {
      setRowLoading(true)
      const payload = { asset_form_ids: [obj.asset_form_id] }
      const res = await getAssetformByIDForBulkReport(payload)
      if (res.success === 1) {
        try {
          const masterFormData = res.data.master_form_data ? res.data.master_form_data[0].form_data : null
          const assetFormData = res.data.asset_form_data ? res.data.asset_form_data[0].asset_form_data : null
          const new_data = { ...JSON.parse(masterFormData), ...JSON.parse(assetFormData) }
          obj.asset_form_data = JSON.stringify(new_data)
          const jsonData = new_data

          if (isJson) {
            const fileContent = JSON.stringify(_.get(jsonData, 'data', null), null, 2)
            const blob = new Blob([fileContent], {
              type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = constructXmlFileName(obj, 'json')
            a.click()
          } else {
            const xmlContent = `<root>${convertObjectToXml(_.get(jsonData, 'data', null))}</root>`
            const fileContent = xmlContent
            const blob = new Blob([fileContent], {
              type: 'text/xml',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = constructXmlFileName(obj, 'xml')
            a.click()
          }
        } catch (error) {
          console.error('Error generating XML/JSON:', error)
          Toast.error(`Error generating file for ${obj.asset_form_name}.`)
        }
      }
      setRowLoading(false)
    } catch (error) {
      console.error(error)
      Toast.error('Something went wrong while generating XML/JSON.')
      setRowLoading(false)
    }
  }

  const updateViewTaskStatus = async (request, status) => {
    try {
      setRowLoading(true)
      let payload = {
        wOcategorytoTaskMapping_id: request.wOcategorytoTaskMapping_id,
        status: status,
      }
      const res = await updateWOCategoryTaskStatus(payload)
      if (res.success === 1) {
        Toast.success('Status updated successfully!')
        setRowLoading(false)
        setReload(p => p + 1)
        if (woType) reFetch()
      } else {
        setRowLoading(false)
        Toast.error(res.message)
      }
    } catch (error) {
      Toast.error('Something went wrong !')
      setRowLoading(false)
    }
  }

  // Define a map to store interval IDs associated with asset_form_id
  const intervalMapRef = useRef({})

  // Function to start interval for a specific asset_form_id
  const startIntervalForAsset = asset_form_id => {
    const intervalId = setInterval(async () => {
      console.log('Checking PDF generation status for asset_form_id:', asset_form_id)
      await checkPdfGenerationStatus(asset_form_id)
    }, 3000)
    intervalMapRef.current[asset_form_id] = intervalId
  }

  // Function to handle PDF generation status check
  const checkPdfGenerationStatus = async asset_form_id => {
    try {
      const api_res = await getPdfGenerationStatus(asset_form_id)
      if (api_res.success > 0) {
        const res = api_res.data
        console.log('PDF status response for asset_form_id', asset_form_id + ':', res.pdf_report_status)
        if (res.pdf_report_status === enums.PDF_REPORT_STATUS.Completed) {
          console.log('PDF generation completed for asset_form_id:', asset_form_id)
          // Remove the completed asset_form_id from rowLoadingIds
          setRowLoadingIds(prevIds => prevIds.filter(id => id !== asset_form_id))
          // Clear the interval for this asset_form_id
          console.log('completed status interval - ', intervalMapRef.current[asset_form_id])
          clearInterval(intervalMapRef.current[asset_form_id])
          delete intervalMapRef.current[asset_form_id]
          // Open the PDF report in a new tab
          window.open(res.pdf_report_url, '_blank')
        } else if (res.pdf_report_status === enums.PDF_REPORT_STATUS.Failed) {
          console.log('PDF generation failed for asset_form_id:', asset_form_id)
          // Handle PDF generation failure
          setRowLoadingIds(prevIds => prevIds.filter(id => id !== asset_form_id))
          clearInterval(intervalMapRef.current[asset_form_id])
          delete intervalMapRef.current[asset_form_id]
          Toast.error(api_res.message)
        }
      } else {
        setRowLoadingIds(prevIds => prevIds.filter(id => id !== asset_form_id))
        clearInterval(intervalMapRef.current[asset_form_id])
        delete intervalMapRef.current[asset_form_id]
        Toast.error(api_res.message)
        console.error('Error fetching PDF generation status for asset_form_id:', asset_form_id, api_res.message)
        // Handle API error
      }
    } catch (error) {
      console.error('Error fetching PDF generation status for asset_form_id:', asset_form_id, error)
      // Handle error
    }
  }

  const onExportPdf = async payload => {
    try {
      let request = {
        asset_form_id: payload.asset_form_id,
      }
      $('#pageLoading').show()
      const res = await generateAssetInspectionFormioPdf(request)
      if (res.success > 0) {
        $('#pageLoading').hide()
        // Add the newly exported asset_form_id to rowLoadingIds
        const updatedIds = [...rowLoadingIds, payload.asset_form_id]
        setRowLoadingIds(updatedIds)
        // Start interval for the newly added asset_form_id
        startIntervalForAsset(payload.asset_form_id)
      } else {
        $('#pageLoading').hide()
        Toast.error(res.message)
      }
    } catch (error) {
      console.log(error)
      $('#pageLoading').hide()
    }
  }
  const fetchFormJSON = async (type, obj) => {
    try {
      setRowLoading(true)
      const res = await getFormJson({ form_id: obj.form_id, asset_form_id: obj.asset_form_id })
      setRowLoading(false)
      if (type === 'VIEW') {
        setFormToView({ ...res.data, asset_form_description: obj.asset_form_description })
        setViewFormOpen(true)
      }
      if (type === 'EXPORT_REPORT') exportPDF({ wo: { ...res.data, form_category_name: obj.form_category_name, asset_form_name: obj.asset_form_name, asset_form_description: obj.asset_form_description }, isFromSubmitted: true })
    } catch (error) {
      console.log(error)
    }
  }

  const changeStatus = async (data, status) => {
    try {
      setRowLoading(true)
      const res = await updateStatusToReady({ status, asset_form_id: data.asset_form_id })
      setRowLoading(false)
      if (res.success === 1) {
        setReload(p => p + 1)
        if (woType) reFetch()
        Toast.success('Status updated successfully!')
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
      setRowLoading(false)
    }
  }
  const HeaderTab = ({ classes, text, filter, cond }) => (
    <TableCell onClick={() => setFilterForColumn(!filterForColumn)} align='left' padding='normal' classes={{ root: classes.headRoot }} style={cond ? { background: '#eeeeee' } : { background: '#fafafa' }}>
      {text}
      {filter && <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />}
    </TableCell>
  )
  const formatInputValue = () => {
    if (!date) return ''
    return `${date.month < 10 ? `0${date.month}` : date.month}-${date.day < 10 ? `0${date.day}` : date.day}-${date.year}`
  }
  const getFormatedDate = date => {
    if (!date) return '-'
    return `${date.slice(5, 7)}-${date.slice(8, 10)}-${date.slice(0, 4)}`
  }
  const renderCustomInput = ({ ref }) => (
    <div className='d-flex align-items-center' style={{ border: '1px solid #a1a1a1', borderRadius: '4px' }}>
      <input readOnly ref={ref} placeholder='MM-DD-YYYY' value={date ? formatInputValue() : ''} className='minimal-input-base base-date-input' style={{ border: 'none' }} />
      <IconButton aria-label='close' size='small' onClick={() => handleDateFilterChange(null)}>
        <CloseIcon size='small' />
      </IconButton>
    </div>
  )
  const renderInspectionVerdictChip = verdict => {
    if (!verdict) return '-'
    const verd = enums.INSPECTION_VERDICT_CHIPS.find(d => d.value === verdict)
    if (!verd) return '-'
    const { color, label } = verd
    return <StatusComponent color={color} label={label} size='small' filled />
  }
  const menuOptions = [
    // { id: 1, name: 'View', action: d => handleAction('VIEW', d) },
    { id: 2, name: 'Accept', action: d => handleAction('ACCEPT', d), disabled: d => d.status !== enums.woTaskStatus.ReadyForReview || d.workOrderStatus === enums.woTaskStatus.Complete },
    { id: 3, name: 'Reject', action: d => handleAction('REJECT', d), disabled: d => d.status !== enums.woTaskStatus.ReadyForReview || d.workOrderStatus === enums.woTaskStatus.Complete },
    { id: 4, name: 'Download Report', action: d => handleAction('EXPORT_REPORT', d) },
    { id: 5, name: 'Download Json', action: d => handleAction('DOWNLOAD_JSON', d) },
    { id: 6, name: 'Download XML', action: d => handleAction('DOWNLOAD_XML', d) },
    { id: 7, name: 'Submit to Customer', action: d => handleAction('SUBMIT_TO_CUSTOMER', d), disabled: d => d.status !== enums.woTaskStatus.Complete || d.workOrderStatus === enums.woTaskStatus.Complete, isHide: woType ? true : false },
    { id: 8, name: 'Ready For Review', action: d => handleAction('READY_FOR_REVIEW', d), disabled: d => checkDisabled(d) },
  ]
  const checkDisabled = d => {
    if (!checkUserRole.isCompanyAdmin()) return true
    else if (d.status !== enums.woTaskStatus.Complete && d.status !== enums.woTaskStatus.Submitted) return true
    else if (d.workOrderStatus === enums.woTaskStatus.Complete) return true
    else return false
  }

  const checkBoxMenuOptions = [
    {
      id: 1,
      name: 'All',
      action: () => {
        setIsOptionVisible(false)
        handleStatusFilterChange()
        setCurrentMenuStatus(0)
      },
      show: true,
    },
    {
      id: 2,
      name: 'Ready For Review',
      action: () => {
        setMarkedRows([])
        setbulkRecordsForPdf([])
        setIsOptionVisible(true)
        setPrevMenuStatus(currentMenuStatus)
        setCurrentMenuStatus(enums.woTaskStatus.ReadyForReview)
        handleStatusFilterChange(enums.WO_STATUS[3])
      },
      show: true,
    },
    {
      id: 3,
      name: 'Completed',
      action: () => {
        setMarkedRows([])
        setbulkRecordsForPdf([])
        setIsOptionVisible(true)
        setPrevMenuStatus(currentMenuStatus)
        setCurrentMenuStatus(enums.woTaskStatus.Complete)
        handleStatusFilterChange(enums.WO_STATUS[4])
      },
      show: true,
    },
    {
      id: 4,
      name: 'Select & Download',
      action: () => {
        setMarkedRows([])
        setbulkRecordsForPdf([])
        setIsOptionVisible(true)
        setPrevMenuStatus(currentMenuStatus)
        setCurrentMenuStatus('X')
      },
      show: true,
    },
  ]

  const downloadMenuOptions = [
    {
      id: 1,
      type: 'button',
      text: 'Download Report & Mark Submitted',
      icon: <GetAppOutlinedIcon fontSize='small' />,
      onClick: () => {
        getFormJSonFunc(true)
      },
      show: currentMenuStatus === enums.woTaskStatus.Complete,
    },
    {
      id: 2,
      type: 'button',
      text: 'Download Report',
      icon: <GetAppOutlinedIcon fontSize='small' />,
      onClick: () => {
        getFormJSonFunc(false)
      },
      show: true,
    },
    {
      id: 3,
      type: 'button',
      text: 'Download Json',
      icon: <GetAppOutlinedIcon fontSize='small' />,
      onClick: () => {
        getFormJsonToXML('isJson')
      },
      show: true,
    },
    {
      id: 4,
      type: 'button',
      text: 'Download XML',
      icon: <GetAppOutlinedIcon fontSize='small' />,
      onClick: () => {
        getFormJsonToXML()
      },
      show: true,
    },
  ]

  const handleCheckAll = e => {
    let tempMarkedRow = markedRows
    let tempBulkRecordsForPdf = bulkRecordsForPdf
    setAllChecked(e.target.checked)
    if (e.target.checked) {
      if (currentMenuStatus === enums.woTaskStatus.Complete) {
        rows.forEach(row => {
          if (!tempMarkedRow.includes(row.asset_form_id)) {
            tempMarkedRow.push(row.asset_form_id)
            tempBulkRecordsForPdf.push({
              form_category_name: row.form_category_name,
              asset_form_name: row.asset_form_name,
              asset_form_description: row.asset_form_description,
              asset_form_data: row.asset_form_data,
              form_id: row.form_id,
              asset_form_id: row.asset_form_id,
              workOrderCompleted: row.workOrderStatus === enums.woTaskStatus.Complete,
            })
          }
        })
      } else {
        rows.forEach(row => {
          if (!tempMarkedRow.includes(row.wOcategorytoTaskMapping_id)) {
            tempMarkedRow.push(row.wOcategorytoTaskMapping_id)
            tempBulkRecordsForPdf.push({
              form_category_name: row.form_category_name,
              asset_form_name: row.asset_form_name,
              asset_form_description: row.asset_form_description,
              asset_form_data: row.asset_form_data,
              form_id: row.form_id,
              wOcategorytoTaskMapping_id: row.wOcategorytoTaskMapping_id,
              asset_form_id: row.asset_form_id,
            })
          }
        })
      }
    } else {
      if (currentMenuStatus === enums.woTaskStatus.Complete) {
        rows.forEach(row => {
          if (tempMarkedRow.includes(row.asset_form_id)) {
            tempMarkedRow = tempMarkedRow.filter(val => val !== row.asset_form_id)
            tempBulkRecordsForPdf = tempBulkRecordsForPdf.filter(record => record.asset_form_id !== row.asset_form_id)
          }
        })
      } else {
        rows.forEach(row => {
          if (tempMarkedRow.includes(row.wOcategorytoTaskMapping_id)) {
            tempMarkedRow = tempMarkedRow.filter(val => val !== row.wOcategorytoTaskMapping_id)
            tempBulkRecordsForPdf = tempBulkRecordsForPdf.filter(record => record.wOcategorytoTaskMapping_id !== row.wOcategorytoTaskMapping_id)
          }
        })
      }
    }

    setMarkedRows([...tempMarkedRow])
    setbulkRecordsForPdf([...tempBulkRecordsForPdf])
  }

  const handleChkboxChange = (e, tablerow) => {
    let tempmMarkedRows = markedRows
    let tempBulkRecordsForPdf = bulkRecordsForPdf
    if (currentMenuStatus === enums.woTaskStatus.Complete) {
      if (e.target.checked) {
        if (!tempmMarkedRows.includes(tablerow.asset_form_id)) {
          tempmMarkedRows.push(tablerow.asset_form_id)
          tempBulkRecordsForPdf.push({
            form_category_name: tablerow.form_category_name,
            asset_form_name: tablerow.asset_form_name,
            asset_form_description: tablerow.asset_form_description,
            asset_form_data: tablerow.asset_form_data,
            form_id: tablerow.form_id,
            asset_form_id: tablerow.asset_form_id,
            workOrderCompleted: tablerow.workOrderStatus === enums.woTaskStatus.Complete,
            asset_name: tablerow.asset_name,
          })
        }
      } else {
        if (tempmMarkedRows.includes(tablerow.asset_form_id)) {
          tempmMarkedRows = tempmMarkedRows.filter(val => val !== tablerow.asset_form_id)
          tempBulkRecordsForPdf = tempBulkRecordsForPdf.filter(record => record.asset_form_id !== tablerow.asset_form_id)
        }
      }
    } else {
      if (e.target.checked) {
        if (!tempmMarkedRows.includes(tablerow.wOcategorytoTaskMapping_id)) {
          tempmMarkedRows.push(tablerow.wOcategorytoTaskMapping_id)
          tempBulkRecordsForPdf.push({
            form_category_name: tablerow.form_category_name,
            asset_form_name: tablerow.asset_form_name,
            asset_form_description: tablerow.asset_form_description,
            asset_form_data: tablerow.asset_form_data,
            form_id: tablerow.form_id,
            wOcategorytoTaskMapping_id: tablerow.wOcategorytoTaskMapping_id,
            asset_name: tablerow.asset_name,
            asset_form_id: tablerow.asset_form_id,
          })
        }
      } else {
        if (tempmMarkedRows.includes(tablerow.wOcategorytoTaskMapping_id)) {
          tempmMarkedRows = tempmMarkedRows.filter(val => val !== tablerow.wOcategorytoTaskMapping_id)
          tempBulkRecordsForPdf = tempBulkRecordsForPdf.filter(record => record.wOcategorytoTaskMapping_id !== tablerow.wOcategorytoTaskMapping_id)
        }
      }
    }

    setMarkedRows([...tempmMarkedRows])
    setbulkRecordsForPdf([...tempBulkRecordsForPdf])

    const currentRows = rows.map(row => {
      if (currentMenuStatus === enums.woTaskStatus.Complete) return row.asset_form_id
      return row.wOcategorytoTaskMapping_id
    })
    const isCoverdAll = tempmMarkedRows.filter(val => currentRows.includes(val)).length === currentRows.length
    setAllChecked(isCoverdAll)
  }

  const changeStatusToCompleted = async () => {
    try {
      setbulkRecordsForPdf([])
      if (markedRows.length === 0) return Toast.error('Please select atleast one record')
      else {
        setIsActionPerforming(true)
        setIsLoading(true)
        let payload = {
          wOcategorytoTaskMapping_id: markedRows,
          status: 15,
          task_rejected_notes: 'string',
        }
        const res = await updateMultiWOCategoryTaskStatus(payload)
        if (res.success === 1) {
          setIsLoading(false)
          setIsActionPerforming(false)
          setReload(p => p + 1)
          if (woType) reFetch()
          Toast.success('Status updated successfully')
        } else {
          setIsLoading(false)
          setIsActionPerforming(false)
          Toast.error(res.message)
        }
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      setIsLoading(false)
      setIsActionPerforming(false)

      // setRowLoading(false)
    }
  }

  const changeStatusToSubmmited = async failed => {
    try {
      const withoutCompltedWorkOrderRows = []
      const failedIds = failed.map(d => d.asset_form_id)
      const failedAssetNames = failed.map(d => d.asset_name)
      bulkRecordsForPdf.forEach(record => {
        if (!record.workOrderCompleted && !failedIds.includes(record.asset_form_id)) {
          withoutCompltedWorkOrderRows.push(record.asset_form_id)
        }
      })
      if (withoutCompltedWorkOrderRows.length === 0) {
        if (!_.isEmpty(failedAssetNames)) {
          const bolds = failedAssetNames.map(d => <b key={d}>{d},</b>)
          const msg = <div>PDF generation failed for this assets {bolds} & for the rest Report downloaded Successfully</div>
          Toast.info(msg)
        } else Toast.success('Report Download Successfully')
        setMarkedRows([])
        setbulkRecordsForPdf([])
        setAllChecked(false)
        setIsLoading(false)
      } else {
        setIsLoading(true)
        const payload = { asset_form_id: withoutCompltedWorkOrderRows, status: 75 }
        const res = await changeAssetFormIOStatusFormultiple(payload)
        if (res.success === 1) {
          if (!_.isEmpty(failedAssetNames)) {
            const bolds = failedAssetNames.map(d => <b key={d}>{d},</b>)
            const msg = <div>PDF generation failed for this assets {bolds} & for the rest Report downloaded and Submitted successfully</div>
            Toast.info(msg)
          } else Toast.success('Report downloaded and submitted successfully')
          setIsLoading(false)
          setMarkedRows([])
          setbulkRecordsForPdf([])
          setAllChecked(false)
          setReload(p => p + 1)
          if (woType) reFetch()
        } else {
          setIsLoading(false)
          Toast.error(res.message)
        }
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      setIsLoading(false)
    }
  }

  const getFormJSonFunc = async isMarkSubmitNeeded => {
    try {
      setAnchorEl(null)
      if (markedRows.length === 0) return Toast.error('Please select atleast one record')
      else if (markedRows.length > 60) return Toast.error('You can select a maximum of 60 records to generate the report')
      else {
        // setIsActionPerforming(true)
        // const payload = { asset_form_ids: bulkRecordsForPdf.map(d => d.asset_form_id) }
        // const res = await getAssetformByIDForBulkReport(payload)

        // if (res.success === 1) {
        //   const masterFormData = res.data.master_form_data
        //   const assetFormData = res.data.asset_form_data

        //   bulkRecordsForPdf.forEach(row => {
        //     assetFormData.forEach(assetRow => {
        //       if (assetRow.asset_form_id === row.asset_form_id) row.asset_form_data = assetRow.asset_form_data
        //     })
        //   })

        //   bulkRecordsForPdf.forEach(row => {
        //     masterFormData.forEach(masRow => {
        //       if (masRow.form_id === row.form_id) {
        //         const new_data = { ...JSON.parse(masRow.form_data), ...JSON.parse(row.asset_form_data) }
        //         row.asset_form_data = JSON.stringify(new_data)
        //       }
        //     })
        //   })
        //   const promiseList = []
        //   for (let row = 0; row < bulkRecordsForPdf.length; row++) {
        //     const promise = new Promise((resolve, reject) => {
        //       setTimeout(async () => {
        //         try {
        //           const err = await exportPDF({ wo: { ...bulkRecordsForPdf[row], isCalibrationDateEnabled: res.data.isCalibrationDateEnabled }, isFromSubmitted: true, isForBulkPdf: true })
        //           if (!_.isEmpty(err)) reject('error-generating')
        //           else resolve('done')
        //         } catch (e) {
        //           reject('Something went wrong while genrating multiple pfds !')
        //         }
        //       }, (row + 1) * 1000)
        //     })
        //     promiseList.push(promise)
        //   }
        //   Promise.allSettled(promiseList).then(d => {
        //     const failedPdfs = []
        //     d.forEach((x, i) => {
        //       if (x.status === 'rejected') failedPdfs.push(bulkRecordsForPdf[i])
        //     })
        //     setTimeout(async () => {
        //       const data = await BulkPdfGenrator()
        //       if (data) {
        //         setIsActionPerforming(false)
        //         if (isMarkSubmitNeeded) changeStatusToSubmmited(failedPdfs)
        //         else {
        //           // setMarkedRows([])
        //           // setbulkRecordsForPdf([])
        //           // setAllChecked(false)
        //           // setIsLoading(false)
        //           // setIsOptionVisible(false)
        //           // setCurrentMenuStatus(0)
        //           //handleStatusChange(currentMenuStatus)
        //         }
        //       } else {
        //         setIsActionPerforming(false)
        //         setIsLoading(false)
        //       }
        //     }, 1000)
        //   })
        // } else {
        //   setIsLoading(false)
        //   Toast.error(res.message)
        //   setIsActionPerforming(false)
        // }
        if (isMarkSubmitNeeded) {
          setIsActionPerforming(true)
          let payload = {
            asset_form_id: bulkRecordsForPdf.map(d => d.asset_form_id),
            status: enums.woTaskStatus.Submitted,
          }
          const res = await changeAssetFormIOStatusFormultiple(payload)
          if (res.success === 1) {
            setReload(p => p + 1)
            if (woType) reFetch()
            Toast.success('Status updated successfully')
            await exportBulkNetaReport()
          } else {
            setIsLoading(false)
            setIsActionPerforming(false)
            Toast.error(res.message)
          }
        } else {
          setIsActionPerforming(true)
          await exportBulkNetaReport()
        }
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      setIsActionPerforming(false)
    }
  }

  const getFormJsonToXML = async isJson => {
    try {
      setAnchorEl(null)
      if (markedRows.length === 0) return Toast.error('Please select at least one record')
      setGeneratingXML(true)
      const payload = { asset_form_ids: bulkRecordsForPdf.map(d => d.asset_form_id) }
      const res = await getAssetformByIDForBulkReport(payload)

      if (res.success === 1) {
        const masterFormData = res.data.master_form_data
        const assetFormData = res.data.asset_form_data

        // Merge asset form data into XML reports
        bulkRecordsForPdf.forEach(row => {
          assetFormData.forEach(assetRow => {
            if (assetRow.asset_form_id === row.asset_form_id) row.asset_form_data = assetRow.asset_form_data
          })
        })

        // Merge master form data into XML reports
        bulkRecordsForPdf.forEach(row => {
          masterFormData.forEach(masRow => {
            if (masRow.form_id === row.form_id) {
              const new_data = { ...JSON.parse(masRow.form_data), ...JSON.parse(row.asset_form_data) }
              row.asset_form_data = JSON.stringify(new_data)
            }
          })
        })

        // Create a zip folder
        const zip = new JSZip()

        // Generate each XML or JSON file and add to zip folder
        const FileNameMap = new Map()
        bulkRecordsForPdf.forEach((jsonObj, index) => {
          try {
            const jsonData = JSON.parse(jsonObj.asset_form_data)
            let fileContent, fileName

            if (isJson) {
              fileContent = JSON.stringify(_.get(jsonData, 'data', null), null, 2)
              fileName = constructXmlFileName(jsonObj, 'json')
            } else {
              const xmlContent = `<root>${convertObjectToXml(_.get(jsonData, 'data', null))}</root>`
              fileContent = xmlContent
              fileName = constructXmlFileName(jsonObj, 'xml')
            }

            zip.file(fileName, fileContent)
          } catch (error) {
            console.error('Error generating XML/JSON:', error)
            Toast.error(`Error generating file for ${jsonObj.asset_form_name}.`)
          }
        })

        // Generate the zip file
        zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
          // Trigger download
          saveAs(zipBlob, 'reports.zip')
          setGeneratingXML(false)
          // setIsOptionVisible(false)
          // setCurrentMenuStatus(0)
          handleStatusChange(currentMenuStatus)
        })
      }
    } catch (error) {
      console.error(error)
      Toast.error('Something went wrong while generating XML/JSON.')
      setGeneratingXML(false)
    }
  }
  // Function to check if a string is JSON
  function isJSONObject(str) {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  // Function to construct XML file name
  function constructXmlFileName(jsonObj, key) {
    const specialCharsRegex = /[\/\\:*?"<>|&%]/g
    let fileName = ''

    const formatHeaderData = data => {
      const d = { ...data }
      Object.keys(d).forEach(k => {
        d[k] = _.isEmpty(d[k]) ? '' : d[k]
      })
      return d
    }
    const differentFilename = [JSON.parse(jsonObj.asset_form_data)].map(v => v.data.header)
    const headerData = formatHeaderData(differentFilename[0])

    if (!_.isEmpty(headerData.location) || !_.isEmpty(headerData.parent)) fileName += headerData.location || headerData.parent
    if (!_.isEmpty(headerData.identification)) fileName += `_${headerData.identification}`
    if (!_.isEmpty(jsonObj.asset_form_name)) fileName += `_${jsonObj.asset_form_name}`

    let xmlFilename = fileName.replace(specialCharsRegex, '_')

    return xmlFilename + `.${key}`
  }

  // Function to construct file name and handle duplicates
  function constructFileName(fileName, FileNameMap) {
    if (FileNameMap.has(fileName)) {
      let count = FileNameMap.get(fileName)
      FileNameMap.set(fileName, count + 1)
      return `${fileName}_${count + 1}`
    } else {
      FileNameMap.set(fileName, 0)
      return fileName
    }
  }
  const convertObjectToXml = json => {
    let xml = ''

    for (let key in json) {
      if (json.hasOwnProperty(key) && key.trim() !== '') {
        // Check if key is not empty
        key = key.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '_') // check space and special character both

        // Check if key starts with a number
        if (/^\d/.test(key)) {
          key = `_${key}` // Prepend underscore
        }
        const value = json[key]

        if (Array.isArray(value)) {
          xml += `<${key}>`
          value.forEach(item => {
            if (Array.isArray(item)) {
              item.forEach(innerItem => {
                xml += `<item>${convertObjectToXml(innerItem)}</item>`
              })
            } else if (typeof item === 'object') {
              xml += `<item>${convertObjectToXml(item)}</item>`
            } else {
              const escapedValue = typeof value === 'string' ? escapeXml(value) : value
              xml += `<item>${escapedValue}</item>`
            }
          })
          xml += `</${key}>`
        } else if (typeof value === 'object') {
          xml += `<${key}>${convertObjectToXml(value)}</${key}>`
        } else {
          const escapedValue = typeof value === 'string' ? escapeXml(value) : value
          xml += `<${key}>${escapedValue}</${key}>`
        }
      }
    }
    return xml
  }

  const escapeXml = value => {
    // Basic XML escaping for special characters
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  }
  const isChecked = tableRow => {
    if (currentMenuStatus === enums.woTaskStatus.Complete) {
      return markedRows.includes(tableRow.asset_form_id)
    } else {
      return markedRows.includes(tableRow.wOcategorytoTaskMapping_id)
    }
  }

  const handleStatusChange = status => {
    if (!_.isEmpty(enums.WO_STATUS.find(e => e.value === status))) {
      handleStatusFilterChange(enums.WO_STATUS.find(e => e.value === status))
    } else {
      handleStatusFilterChange()
    }
    setMarkedRows([])
    setbulkRecordsForPdf([])
    setAllChecked(false)
    setIsLoading(false)
    setCurrentMenuStatus(status)
  }

  const markStatusToSubmitted = async () => {
    try {
      setbulkRecordsForPdf([])
      if (markedRows.length === 0) return Toast.error('Please select atleast one record')
      else {
        setIsActionPerforming(true)
        let payload = {
          asset_form_id: markedRows,
          status: enums.woTaskStatus.Submitted,
        }
        const res = await changeAssetFormIOStatusFormultiple(payload)
        if (res.success === 1) {
          setIsActionPerforming(false)
          setReload(p => p + 1)
          if (woType) reFetch()
          Toast.success('Status updated successfully')
        } else {
          setIsLoading(false)
          setIsActionPerforming(false)
          Toast.error(res.message)
        }
      }
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      setIsActionPerforming(false)
    }
  }

  const exportBulkNetaReport = async () => {
    const payload = { asset_form_ids: bulkRecordsForPdf.map(d => d.asset_form_id), report_inspection_type: woType ? enums.REPORT_INSPECTION_TYPE.MAINTENANCE : enums.REPORT_INSPECTION_TYPE.ACCEPTANCE_TEST }
    const res = await generateBulkNetaReport(payload)
    if (res.success === 1) {
      setIsActionPerforming(false)
      Toast.success(res.message)
      setMarkedRows([])
      setbulkRecordsForPdf([])
      setAllChecked(false)
    } else {
      setIsActionPerforming(false)
      Toast.error(res.message)
    }
  }
  return (
    <div style={{ height: woType ? 'calc(100vh - 195px)' : 'calc(100vh - 128px)', background: '#fff' }}>
      <div className='d-flex justify-content-between align-content-center'>
        <div style={{ paddingLeft: '8px', display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tooltip title='SELECT' placement='bottom'>
            <Checkbox color='primary' inputProps={{ 'aria-label': 'checkbox with default color' }} size='small' disableTouchRipple checked={AllChecked} onChange={e => handleCheckAll(e)} style={{ padding: '9px 0 9px 9px' }} />
          </Tooltip>
          <MinimalCircularButtonGroup value={currentMenuStatus} onChange={value => handleStatusChange(value)} options={buttonTypeOption} baseStyles={{ marginLeft: '10px' }} />
          {markedRows.length > 0 && (
            <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
              {/* {currentMenuStatus === enums.woTaskStatus.ReadyForReview && <ActionButton icon={<CheckCircleOutlineOutlined size='small' />} tooltipPlacement='bottom' tooltip='Mark Completed' action={changeStatusToCompleted} />} */}
              {currentMenuStatus === enums.woTaskStatus.ReadyForReview && <MinimalButton onClick={changeStatusToCompleted} text='Mark Completed' size='small' startIcon={<CheckCircleOutlineOutlined fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginRight: '10px' }} disabled={isActionPerforming} />}
              {/* {currentMenuStatus === enums.woTaskStatus.Complete && <ActionButton icon={<Publish size='small' />} tooltipPlacement='bottom' tooltip='Mark Submitted' action={markStatusToSubmitted} />} */}
              {currentMenuStatus === enums.woTaskStatus.Complete && <MinimalButton onClick={markStatusToSubmitted} text='Mark Submitted' size='small' startIcon={<PublishOutlined fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginRight: '10px' }} disabled={isActionPerforming} />}
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {/* <Menu options={downloadMenuOptions.filter(e => e.show === true)} data={[]} noToolip actionToolipText='' width={250} MainIcon={GetAppOutlinedIcon} isAlignLeft={true} tooltipPlacement='bottom' iconSize='default' /> */}
                <DropDownMenu dropDownMenuOptions={downloadMenuOptions.filter(e => e.show === true)} startIcon={<GetAppOutlinedIcon fontSize='small' />} btnText='Download' />
                {/* <IconButton onClick={e => setAnchorEl(e.currentTarget)} size='small'>
                <GetAppOutlinedIcon />
              </IconButton> */}
                {/* <Popover
                id='schedule-list-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                {currentMenuStatus === enums.woTaskStatus.Complete && <MenuItem onClick={() => getFormJSonFunc(true)}>Download Report & Mark Submitted</MenuItem>}
                <MenuItem onClick={() => getFormJSonFunc(false)}>Download Report</MenuItem>
                <MenuItem onClick={() => getFormJsonToXML('isJson')}>Download Json</MenuItem>
                <MenuItem onClick={() => getFormJsonToXML()}>Download XML</MenuItem>
              </Popover> */}
              </div>
              <div className='d-flex'>
                {(isActionPerforming || isGeneratingXML) && <CircularProgress size={15} thickness={5} style={{ margin: '3px 16px' }} />}
                {isActionPerforming && bulkRecordsForPdf.length > 0 && <div className='text-bold'>Generating {bulkRecordsForPdf.length} Report...</div>}
                {isGeneratingXML && bulkRecordsForPdf.length > 0 && <div className='text-bold'>Generating {bulkRecordsForPdf.length} Report</div>}
              </div>
            </div>
          )}
          {/* {isOptionVisible && currentMenuStatus !== 0 && (
            <div style={{ marginLeft: '10px' }}>
              {currentMenuStatus === enums.woTaskStatus.ReadyForReview ? (
                <ActionButton icon={<DoneIcon size='small' />} tooltipPlacement='bottom' tooltip='Mark Completed' action={changeStatusToCompleted} isLoading={isActionPerforming} />
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ActionButton tooltipPlacement='bottom' icon={<GetAppOutlinedIcon size='small' />} tooltip={currentMenuStatus === enums.woTaskStatus.Complete ? `Download Report & Mark Submitted` : `Download Reports`} action={() => getFormJSonFunc(currentMenuStatus === enums.woTaskStatus.Complete)} isLoading={isActionPerforming} />
                    <ActionButton tooltipPlacement='bottom' icon={<GetAppOutlinedIcon size='small' />} tooltip={`Download XML`} action={() => getFormJsonToXML()} isLoading={isGeneratingXML} />
                    <ActionButton tooltipPlacement='bottom' icon={<GetAppOutlinedIcon size='small' />} tooltip='Download Json' action={() => getFormJsonToXML('isJson')} hide={isGeneratingXML} />
                    {isActionPerforming && <div className='ml-1 text-bold'>Generating {bulkRecordsForPdf.length} PDF...</div>}
                    {isGeneratingXML && <div className='ml-1 text-bold'>Generating {bulkRecordsForPdf.length} Report</div>}
                  </div>
                </>
              )}
            </div>
          )} */}
        </div>
        <div className='d-flex flex-row-reverse align-items-center' style={{ height: '6vh' }}>
          <div>
            <Input
              placeholder='Search'
              startAdornment={
                <InputAdornment position='start'>
                  <SearchOutlined color='primary' />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment className='pointerCursor' position='end' onClick={clearSearch}>
                  {searchStringValue ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                </InputAdornment>
              }
              value={searchStringValue}
              onChange={e => setSearchStringValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchOnKeyDown()}
            />
          </div>
        </div>
      </div>

      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 135px)' }}>
        <Table size='small' stickyHeader={true}>
          <TableHead>
            <TableRow>
              {HeaderTab({ classes, text: '' })}
              {HeaderTab({ classes, text: 'Asset Name', filter: true })}
              {HeaderTab({ classes, text: 'Work Order #', filter: true })}
              {HeaderTab({ classes, text: 'Inspected At' })}
              {HeaderTab({ classes, text: 'Location' })}
              {HeaderTab({ classes, text: 'Class Code' })}
              {/* {HeaderTab({ classes, text: 'Inspected By', filter: true })} */}
              {/* {HeaderTab({ classes, text: 'Accepted By' })} */}
              {HeaderTab({ classes, text: 'Inspection Verdict' })}
              {HeaderTab({ classes, text: 'Status', filter: true })}
              {/* {HeaderTab({ classes, text: 'Service Type', filter: true })} */}
              {HeaderTab({ classes, text: 'Action' })}
            </TableRow>
            {filterForColumn && (
              <TableRow>
                {<TableCell classes={{ root: classes.headFilter }}></TableCell>}
                <TableCell classes={{ root: classes.headFilter }}>
                  <MinimalFilterSelector loading={assetLoading} isClearable isMulti placeholder='Select Asset' value={assetNameForFilter} onChange={v => handleAssetFilterChange(v)} options={assetOptions} label='Select Asset' baseStyles={{ margin: '10px 0 10px 0' }} />
                </TableCell>
                <TableCell classes={{ root: classes.headFilter }}>
                  <MinimalFilterSelector loading={woLoading} isClearable isMulti placeholder='Select WO' value={woForFilter} onChange={v => handleWoFilterChange(v)} options={woOptions} label='Select WO' baseStyles={{ margin: '10px 0 10px 0' }} />
                </TableCell>
                <TableCell classes={{ root: classes.headFilter }}></TableCell>
                {/* <TableCell classes={{ root: classes.headFilter }}>
                  <MinimalFilterSelector loading={inspectedByLoading} isClearable isMulti placeholder='Select Inspector' value={inspectedByFilter} onChange={v => handleInspectedFilterChange(v)} options={inspectedByOptions} />
                </TableCell> */}
                <TableCell classes={{ root: classes.headFilter }}></TableCell>
                <TableCell classes={{ root: classes.headFilter }}></TableCell>
                <TableCell classes={{ root: classes.headFilter }}></TableCell>
                <TableCell classes={{ root: classes.headFilter }}>
                  <MinimalFilterSelector
                    placeholder='Select Status'
                    value={statusFilter}
                    onChange={v => handleStatusFilterChange(v)}
                    options={[enums.WO_STATUS[3], enums.WO_STATUS[4], !woType ? enums.WO_STATUS[9] : undefined].filter(item => item !== undefined)}
                    isClearable
                    isDisabled={currentMenuStatus !== 0}
                    baseStyles={{ margin: '10px 0 10px 0' }}
                  />
                </TableCell>
                {/* <TableCell classes={{ root: classes.headFilter }}>
                  <MinimalFilterSelector placeholder='Select Type' value={typeFilter} onChange={v => handleTypeFilterChange(v)} options={enums.WO_TYPE_LIST} isClearable />
                </TableCell> */}
                <TableCell classes={{ root: classes.headFilter }}></TableCell>
              </TableRow>
            )}
          </TableHead>
          {loading || isLoading ? (
            <TableLoader cols={9} />
          ) : _.isEmpty(rows) ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan='9' className={' Pendingtbl-no-datafound'}>
                  No data found
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((tableRow, key) => {
                return (
                  <TableRow key={key} onClick={() => handleAction('VIEW', tableRow)} className='table-with-row-click'>
                    {
                      <TableCell>
                        <Checkbox color='primary' size='small' checked={isChecked(tableRow)} style={{ padding: 0 }} onClick={e => e.stopPropagation()} onChange={e => handleChkboxChange(e, tableRow)} />
                      </TableCell>
                    }
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.asset_name ? tableRow.asset_name : '-'}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.manual_wo_number ? tableRow.manual_wo_number : '-'}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{getFormatedDate(tableRow.intial_form_filled_date)}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.form_retrived_location ? tableRow.form_retrived_location : '-'}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.asset_form_name ? tableRow.asset_form_name : '-'}</TableCell>
                    {/* <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.requested_by}</TableCell> */}
                    {/* <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.accepted_by ? tableRow.accepted_by : '-'}</TableCell> */}
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.inspection_verdict ? renderInspectionVerdictChip(tableRow.inspection_verdict) : '-'}</TableCell>
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{getWOTaskStatus(tableRow.status, tableRow.status_name)}</TableCell>
                    {/* <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>{tableRow.form_retrived_workOrderType ? tableRow.form_retrived_workOrderType : '-'}</TableCell> */}
                    <TableCell style={{ fontSize: '12px', fontWeight: 400 }}>
                      {rowLoadingIds != null && rowLoadingIds.includes(tableRow.asset_form_id) ? <CircularProgress size={20} thickness={5} /> : <Menu options={menuOptions} data={tableRow} loading={rowLoading && anchorSelectedObject.wOcategorytoTaskMapping_id === tableRow.wOcategorytoTaskMapping_id} noToolip width={160} />}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          )}
        </Table>
      </div>

      {!_.isEmpty(rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={size} rowsPerPage={pagesize} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
      {viewFormOpen && <ViewForm equipmentListOptions={equipmentListOptions} viewObj={formToView} open={viewFormOpen} onClose={() => setViewFormOpen(false)} />}
      {isRejectReasonModalOpen && <RejectCategoryTask woTaskCategoryMappingId={anchorSelectedObject.wOcategorytoTaskMapping_id} open={isRejectReasonModalOpen} afterSubmit={() => setReload(p => p + 1)} onClose={() => setRejectReasonModalOpen(false)} />}
    </div>
  )
}

export default Submitted
