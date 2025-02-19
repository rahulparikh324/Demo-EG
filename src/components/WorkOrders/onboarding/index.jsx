import { useState, useRef, useEffect, useContext } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import { getFormatedDate } from 'helpers/getDateTime'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'
import { get, isEmpty, orderBy, uniqBy, uniq, chunk, set } from 'lodash'
import { getStatus, conditionOptions, criticalityOptions, thermalClassificationOptions, addedAssetTypeOptions, AppendRandomValueToS3Url, getQuoteStatus, OverviewIcons, physicalConditionOptions, fedByTypeOptions, conductorTypesOptions, racewayTypesOptions, getDuplicateQRs } from './utils'
import { Toast } from 'Snackbar/useToast'
import enums from 'Constants/enums'
import URL from 'Constants/apiUrls'
import { nanoid } from 'nanoid'
import TablePagination from '@material-ui/core/TablePagination'

import SearchComponent from 'components/common/search'
import { StatusComponent, LabelVal, Menu, PopupModal, FilterPopup, DropDownMenu, ToggleButton, AssetTypeIcon, MinimalCheckbox } from 'components/common/others'
import { MinimalButton, ActionButton, MinimalButtonGroup } from 'components/common/buttons'
import { MinimalTextArea } from 'components/Assets/components'
import { TableComponent } from 'components/common/table-components'
import { TopSubTableComponent } from 'components/common/top-sub-table-component'
import View from 'components/WorkOrders/onboarding/view'
import Edit from 'components/WorkOrders/onboarding/edit'
import DialogPrompt from 'components/DialogPrompt'
import EditWO from 'components/WorkOrders/EditWO'
import { CompletionStatus, StatusMetricButton } from 'components/WorkOrders/components'
import Review from 'components/WorkOrders/onboarding/review'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'
import { RenderCheckBox } from 'components/WorkOrders/onboarding/utils'
import TimeMaterials from 'components/WorkOrders/time-materials/timeMaterials'

import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined'
import AddIcon from '@material-ui/icons/Add'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import { AppBar, Box, IconButton, Typography } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'
import CloseIcon from '@material-ui/icons/Close'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'

import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import NewIssues from 'components/WorkOrders/issues'
import AddExistingAsset from 'components/WorkOrders/onboarding/add-existing-asset'
import Locations from 'components/WorkOrders/locations'
import UploadIrPhotos from 'components/WorkOrders/onboarding/upload-ir-photos'

import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import assetClass from 'Services/WorkOrder/asset-class'
import workorder from 'Services/WorkOrder/common'
import locations from 'Services/locations'
import watchWO from 'Services/WorkOrder/watchWO'
import preventativeMaintenance from 'Services/preventative-maintenance'
import asset from 'Services/assets'
import uploadWOAttachment from 'Services/WorkOrder/uploadWOAttachment'
import mapWOAttachment from 'Services/WorkOrder/mapWOAttachment'
import deleteWOAttachment from 'Services/WorkOrder/deleteWOAttachment'
import FilterListIcon from '@material-ui/icons/FilterList'

import XLSX from 'xlsx'
import * as yup from 'yup'
import $ from 'jquery'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { history } from 'helpers/history'
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined'
import StatusChangeRadioDropdown from 'components/common/statuschange-radio-dropdown'
import updateWOStatus from 'Services/WorkOrder/updateWOStatus'
import Cluster from 'components/WorkOrders/one-line/cluster'
import { quotesType } from 'components/quotes/utils'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import PictureAsPdfOutlinedIcon from '@material-ui/icons/PictureAsPdfOutlined'
import ReportOutlinedIcon from '@material-ui/icons/ReportOutlined'
import { MainContext } from 'components/Main/provider'
import { exportMultitabSpreadSheet } from 'helpers/export-multitab-spread-sheet'
import BulkOperationsTool from '../BulkOperationsTool'
import { changeActiveSite } from 'components/common/change-active-site'

const OnBoardingWorkOrder = ({ workOrderID, isQuote = false }) => {
  const [isReadMore, setReadMore] = useState(false)
  const [rows, setRows] = useState([])
  const [visibleRowsData, setVisibleRowsData] = useState([])
  const [addingAssetLocation, setAddingAssetLocation] = useState({})
  const [currentSelectedStatus, setCurrentSelectedStatus] = useState(0)
  const [markedRows, setMarkedRows] = useState([])
  const [isMarkedAll, setIsMarkedAll] = useState(false)
  const [isDeleteBulkOpen, setIsDeleteBulkOpen] = useState(false)

  const [hierarchyPage, setHierarchyPage] = useState(0)
  const [hierarchyRowsPerPage, setHierarchyRowsPerPage] = useState(enums.DEFAULT_PAGE_SIZE)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(enums.DEFAULT_PAGE_SIZE)
  const [pageLoading, setPageLoading] = useState(false)
  const [errorCount, setErrorCount] = useState([])
  const [errorCountFlag, setErrorCountFlag] = useState(false)

  const context = useContext(MainContext)
  const formatDetails = async d => {
    try {
      const rows = get(d, 'data.assetDetailsV2', [])
      rows.forEach(d => {
        d.assetId = isEmpty(uniq(d.assetId).filter(d => !['0', '-'].includes(d))) ? null : d.assetId
        d.toplevelcomponentAssetId = isEmpty(uniq(d.toplevelcomponentAssetId).filter(d => !['0', '-'].includes(d))) ? null : d.toplevelcomponentAssetId
      })
      const sortedRows = orderBy(rows, [d => d.building && d.building.toLowerCase(), d => d.floor && d.floor.toLowerCase(), d => d.room && d.room.toLowerCase(), d => d.section && d.section.toLowerCase(), d => d.assetName && d.assetName.toLowerCase()], ['asc', 'asc', 'asc', 'asc', 'asc'])
      const classOpts = []
      const classCodeOpts = []
      const buildingOpts = []
      const floorOpts = []
      const roomOpts = []
      const sectionOpts = []
      const statusOpts = []
      const issueOpts = []
      if (!isEmpty(rows)) {
        rows.forEach(data => {
          classOpts.push({ label: data.assetClassName, value: data.assetClassName })
          classCodeOpts.push({ label: `${data.assetClassCode} - ${renderText(data.assetClassName)}`, value: data.assetClassCode })
          if (data.building) buildingOpts.push({ label: data.building, value: data.building })
          if (data.floor) floorOpts.push({ label: data.floor, value: data.floor })
          if (data.room) roomOpts.push({ label: data.room, value: data.room })
          if (data.section) sectionOpts.push({ label: data.section, value: data.section })
          const { label } = getStatus(data.status)
          statusOpts.push({ label, value: data.status })

          if (!isEmpty(data?.issuesTitleList)) {
            issueOpts.push({ label: 'All', value: 'All' })
            data.issuesTitleList.forEach(item => {
              if (!isEmpty(item)) {
                issueOpts.push({ label: item, value: item })
              }
            })
          }
        })
      }
      setAssetClassOptions(orderBy(uniqBy(classOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setAssetClassCodeOptions(orderBy(uniqBy(classCodeOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setBuildingOptions(orderBy(uniqBy(buildingOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setFloorOptions(orderBy(uniqBy(floorOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setRoomOptions(orderBy(uniqBy(roomOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setSectionOptions(orderBy(uniqBy(sectionOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setStatusOptions(orderBy(uniqBy(statusOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      setIssueOptions(orderBy(uniqBy(issueOpts, 'value'), [d => d.label && d.label.toLowerCase()], 'asc'))
      d.data.assetDetailsV2 = sortedRows
      checkOriginWoLineId(sortedRows)
      setAddingAssetLocation({})
      // console.log(d, 'rows')
      // handleCompanyAccess({ companyId: get(d, 'data.clientCompanyId', null), siteId: get(d, 'data.siteId', null), siteName: get(d, 'data.siteName', ''), companyName: get(d, 'data.clientCompanyName', '') }, context, isQuote ? 'Quote' : 'Work Order')
      // if (!isEmpty(woOBAssetID)) {
      //   await getWOLineDetail('EDIT', woOBAssetID)
      // }

      if (get(d, 'data.siteId', null)) {
        const siteData = changeActiveSite(get(d, 'data.siteId', null))
        context.setLoginSiteData(prevState => ({
          ...prevState,
          siteName: siteData.site_name,
          activeSiteId: siteData.site_id,
          siteId: siteData.site_id,
          activeClientCompanyId: siteData.client_company_id,
          clientCompanyName: siteData.client_company_name,
        }))
        localStorage.setItem('selectedSiteId', get(d, 'data.siteId', null))
      }

      return camelizeKeys(get(d, 'data', {}))
    } catch (error) {
      console.log(error)
    }
  }
  const sortClassCodes = d => {
    const list = get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { loading, data, reFetch } = useFetchData({ fetch: onBoardingWorkorder.getWorkOrderDetail, payload: { id: workOrderID }, formatter: d => formatDetails(d), externalLoader: true })
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const [tempBuildings, setTempBuildings] = useState([])
  const formatBuildings = list => {
    const buildings = [...list].map(d => ({ ...d, label: d.buildingName, value: d.tempMasterBuildingId }))
    setTempBuildings(buildings)
  }
  const { reFetch: reFetchLocations } = useFetchData({ fetch: locations.workOrderV2.getDropdownList, payload: { wo_id: workOrderID }, formatter: d => formatBuildings(get(d, 'data.tempMasterBuildings', [])), defaultValue: [] })
  const { color, label } = getStatus(data?.woStatusId)
  const { color: quoteColor, label: quoteLabel } = getQuoteStatus(data?.quoteStatusId)
  const uploadAssetRef = useRef(null)
  const actionEditBtnRef = useRef(false)
  const [error, setError] = useState('')
  const [isOverride, setOverride] = useState(false)
  const [woCompLoading, setWOCompLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  //
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDisabledEdit, setDisabledEdit] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [actionObj, setActionObj] = useState({})
  const [deleteObj, setDeleteObj] = useState({})
  const [actionLoader, setActionLoader] = useState(false)
  const [editActionLoader, setEditActionLoader] = useState(false)
  const [reason, setReason] = useState('')
  const isOnboarding = data?.woType === enums.woType.OnBoarding
  const [searchString, setSearchString] = useState('')
  //filter
  const [assetClassOptions, setAssetClassOptions] = useState([])
  const [selectedAssetClass, setSelectedAssetClass] = useState({})
  const [assetClassCodeOptions, setAssetClassCodeOptions] = useState([])
  const [selectedAssetClassCode, setSelectedAssetClassCode] = useState({})
  const [buildingOptions, setBuildingOptions] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState({})
  const [floorOptions, setFloorOptions] = useState([])
  const [selectedFloor, setSelectedFloor] = useState({})
  const [roomOptions, setRoomOptions] = useState([])
  const [selectedRoom, setSelectedRoom] = useState({})
  const [sectionOptions, setSectionOptions] = useState([])
  const [selectedSection, setSelectedSection] = useState({})
  const [statusOptions, setStatusOptions] = useState([])
  const [selectedStatus, setSelectedStatus] = useState({})
  const [issueOptions, setIssueOptions] = useState([])
  const [selectedIssue, setSelectedIssue] = useState({})
  const uploadIrPhotoRef = useRef(null)
  const uploadInputRef = useRef(null)
  const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false)
  const [uploadPreviewFiles, setUploadPreviewFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  //const [fetchingUploaded, setFetchingUploaded] = useState(false)
  const optionsObjects = {
    COND: conditionOptions,
    CRIT: criticalityOptions,
    TC: thermalClassificationOptions,
  }
  const [isEditWO, setIsEditWO] = useState(false)
  const uploadTabs = { UPLOAD: 'UPLOAD', UPLOADED: 'UPLOADED_PHOTOS' }
  const [selectedTab, setTab] = useState(uploadTabs.UPLOAD)
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  //tabs
  const [mainTab, setMainTab] = useState('DEFAULT')
  //
  const [completionProcessStatus, setCompletionProcessStatus] = useState(null)
  const IsCompletionInProgress = completionProcessStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS
  //add old asset
  const [isAddAssetPopupOpen, setIsAddAssetPopupOpen] = useState(false)
  const [addedAssetType, setAddedAssetType] = useState(0)
  const [isAddExistingAssetOpen, setIsAddExistingAssetOpen] = useState(false)
  //
  const [originIssueOpened, setOriginIssueOpened] = useState(false)
  const [hierarchy, setHierarchy] = useState({
    topLevel: [],
    noLevel: [],
    isExpanded: true,
  })
  const [visibleHierarchy, setVisibleHierarchy] = useState({
    topLevel: [],
    noLevel: [],
    isExpanded: true,
  })
  const [isShowMore, setShowMore] = useState(false)
  const [isShowMoreLead, setShowMoreLead] = useState(false)
  const [subTab, setSubTab] = useState('FLATLIST')
  const [hierarchyData, setHierarchyData] = useState([])
  const [disableExpand, setDisableExpand] = useState(true)
  const [isShowWoDetails, setShowWoDetails] = useState(true)
  const userInfo = JSON.parse(localStorage.getItem('loginData'))
  const uploadPMsRef = useRef()
  //locations
  const [reload, setReload] = useState(0)
  //attachment
  const [delObj, setDelObj] = useState({})
  const [isDeleteAttOpen, setDeleteAttOpen] = useState(false)
  const [isChunkFail, setChunkFail] = useState(false)
  const isFirstRender = useRef(true)
  const [isBulkOperationsOpen, setBulkOperationsOpen] = useState(false)

  //components
  const renderDescription = () => (
    <>
      <div style={{ wordBreak: 'break-word' }}>
        {data.description && data.description.slice(0, 120)}
        {!isReadMore && data.description.length > 120 && <span>...</span>}
        {isReadMore && data.description.slice(120)}
      </div>
      {data.description.length > 120 && (
        <button className='readmore-button text-xs' onClick={() => setReadMore(!isReadMore)} style={{ color: '#778899' }}>
          {!isReadMore ? 'Read More' : 'Read less'}
        </button>
      )}
    </>
  )
  //functions
  const handleUploadAsset = () => {
    setError('')
    uploadAssetRef.current && uploadAssetRef.current.click()
  }
  const addAsset = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setError(enums.errorMessages.error_msg_file_format)
      else {
        setError('')
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })

        const excelData = {}
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(ws)
          excelData[sheetName] = data
        })
        validateSheet(excelData)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }
  const getEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (data.woStatusId === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Submitted) return true
    else if (isEmpty(get(data, 'assetDetailsV2', []))) return true
    else return false
  }
  const checkCompWOEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (data.woStatusId === enums.woTaskStatus.Complete) return true
    else if (isOverride) return false
    else if ([...new Set(get(data, 'assetDetailsV2', []).map(d => d.status))].length === 1 && [...new Set(get(data, 'assetDetailsV2', []))][0].status === enums.woTaskStatus.Complete) return false
    else if ([...new Set(get(data, 'assetDetailsV2', []).map(d => d.status))].length === 1 && [...new Set(get(data, 'assetDetailsV2', []))][0].status === enums.woTaskStatus.Submitted) return false
    else return true
  }
  const handleAction = async (type, obj) => {
    if (type === 'DELETE') return deleteAssetAction({ woonboardingassetsId: obj.woonboardingassetsId })
    if (type === 'REJECT') return rejectAssetAction({ woonboardingassetsId: obj.woonboardingassetsId })
    if (['ACCEPT', 'HOLD', 'REVERT'].includes(type)) return updateAssetStatusAction({ woonboardingassetsId: obj.woonboardingassetsId, status: type })
    if (type === 'DELETE-ATTACHMENT') return setDelObj(obj), setDeleteAttOpen(true)

    await getWOLineDetail(type, obj.woonboardingassetsId)
  }

  const getWOLineDetail = async (type, woonboardingassetsId) => {
    if (mainTab === 'ONE_LINE') {
      $('#pageLoading').show()
    } else {
      if (type === 'EDIT' || type === 'VIEW') {
        setEditActionLoader(woonboardingassetsId)
      } else {
        setActionLoader(woonboardingassetsId)
      }
    }
    try {
      const res = await onBoardingWorkorder.getAssetDetails_V2({ id: woonboardingassetsId })
      if (mainTab === 'ONE_LINE') {
        $('#pageLoading').hide()
      } else {
        setActionLoader('')
        setEditActionLoader('')
      }
      if (res.success) {
        setActionObj({ ...get(res, 'data', {}), woId: workOrderID })
        if (type === 'VIEW') {
          setDisabledEdit(true)
          setIsViewOpen(true)
        }
        if (type === 'EDIT') setIsEditOpen(true)
      } else {
        Toast.error(res.message || 'Something went wrong !')
      }
    } catch (error) {
      if (mainTab === 'ONE_LINE') {
        $('#pageLoading').hide()
      } else {
        setActionLoader('')
        setEditActionLoader('')
      }
      Toast.error('Something went wrong !')
    }
  }

  const deleteAssetAction = ({ woonboardingassetsId }) => {
    setIsDeleteOpen(true)
    setDeleteObj({ woonboardingassetsId })
    return
  }
  const rejectAssetAction = ({ woonboardingassetsId }) => {
    setIsRejectOpen(true)
    setActionObj({ woonboardingassetsId })
    return
  }
  const updateAssetStatusAction = async payload => {
    const status = { ACCEPT: enums.woTaskStatus.Complete, HOLD: enums.woTaskStatus.Hold, REVERT: enums.woTaskStatus.ReadyForReview }
    payload.status = status[payload.status]
    setActionLoader(payload.woonboardingassetsId)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Status Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error updating status. Please try again !`)
    }
    setActionLoader('')
    reFetch()
  }
  const rejectAsset = async () => {
    const payload = { ...actionObj, taskRejectedNotes: reason, status: enums.woTaskStatus.Reject }
    setRejectLoading(true)
    try {
      const res = await onBoardingWorkorder.updateAssetStatus(snakifyKeys(payload))
      if (res.success > 0) Toast.success(`Asset Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting asset. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    reFetch()
    setReason('')
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const getFormattedOptions = (val, type) => {
    if (!val) return null
    const options = optionsObjects[type]
    const op = options.find(d => d.label === val)
    if (!op) return null
    return op.value
  }
  const serialDateToJSDate = serialDate => {
    if (!serialDate) return null
    const hours = Math.floor((serialDate % 1) * 24)
    const minutes = Math.floor(((serialDate % 1) * 24 - hours) * 60)
    const date = new Date(Date.UTC(0, 0, serialDate, hours - 17, minutes))
    return date.toISOString()
  }
  //
  const validateSheet = async data => {
    try {
      const schema = yup.array().of(
        yup.object().shape({
          assetName: yup.string().when('assetId', {
            is: assetId => isEmpty(assetId),
            then: yup.string().required('Asset Name is required'),
            otherwise: yup.string().notRequired(),
          }),
          assetClassCode: yup.string().when('assetId', {
            is: assetId => isEmpty(assetId),
            then: yup.string().required('Asset Class Code is required'),
            otherwise: yup.string().notRequired(),
          }),
        })
      )

      // const assetsFedbySchema = yup.array().of(
      //   yup.object().shape({
      //     assetName: yup.string().nullable().required('Asset Name is required'),
      //     fedbyAssetName: yup.string().nullable().required('Fed-By Asset Name is required'),
      //   })
      // )

      // const assetSubcomponentSchema = yup.array().of(
      //   yup.object().shape({
      //     toplevelAssetName: yup.string().nullable().required('Top Level Asset Name is required'),
      //     subcomponentAssetName: yup.string().nullable().required('Sub Component Asset Name is required'),
      //     subcomponentAssetClassCode: yup.string().nullable().required('Sub Component Asset Class Code is required'),
      //   })
      // )

      const parse = d => (isEmpty(d) ? null : d)
      const uniqueAssetIds = new Set()

      const assetData = get(data, 'Assets', []).map(d => ({
        assetName: get(d, 'Asset Name', '').toString().trim(),
        assetClassCode: get(d, 'Asset Class Code', '').toString().trim(),
        backOfficeNote: get(d, 'Back Office Note', '').toString().trim(),
        building: parse(get(d, 'Building', '').toString().trim()),
        floor: parse(get(d, 'Floor', '').toString().trim()),
        room: parse(get(d, 'Room', '').toString().trim()),
        section: parse(get(d, 'Section', '').toString().trim()),
        fieldNote: get(d, 'Field Note', '').toString().trim(),
        qrCode: get(d, 'QR Code', '').toString(),
        conditionIndexType: getFormattedOptions(get(d, 'Condition', '').toString().trim(), 'COND'),
        criticalityIndexType: getFormattedOptions(get(d, 'Criticality', '').toString().trim(), 'CRIT'),
        thermalClassificationId: getFormattedOptions(get(d, 'Thermal Classification', '').toString().trim(), 'TC'),
        commisiionDate: serialDateToJSDate(get(d, 'Commission Date', '')),
        manufacturer: parse(get(d, 'Manufacturer', '').toString().trim()),
        model: parse(get(d, 'Model #', '').toString().trim()),
        voltage: parse(get(d, 'Voltage', '').toString().trim()),
        ratedAmps: parse(get(d, 'Amperage', '').toString().trim()),
        assetId: parse(get(d, 'Asset ID', '').toString().trim()),
        woId: workOrderID,
      }))

      const uniqueAssetData = assetData.filter(item => {
        if (item.assetId === null) {
          return true
        }
        if (uniqueAssetIds.has(item.assetId)) {
          return false
        } else {
          uniqueAssetIds.add(item.assetId)
          return true
        }
      })

      const assetsFedbyMappings = get(data, 'Connections', [])
        .map(d => ({
          assetName: get(d, 'Asset Name', '').toString().trim(),
          ocpAssetName: get(d, 'OCP Main', '').toString().trim(),
          fedbyAssetName: get(d, 'Fed-by Asset Name', '').toString().trim(),
          fedbyOcpAssetName: get(d, 'OCP', '').toString().trim(),
          length: get(d, 'Conductor Length', '').toString().trim(),
          style: get(d, 'Conductor Size', '').toString().trim(),
          numberOfConductor: parseInt(get(d, 'Conductor Number', 0)),
          conductorTypeId: get(d, 'Conductor Material', '').toLowerCase() === 'copper' ? 1 : get(d, 'Conductor Material', '').toLowerCase() === 'aluminium' ? 2 : null,
          racewayTypeId: get(d, 'Raceway Type', '').toLowerCase() === 'metallic' ? 1 : get(d, 'Raceway Type', '').toLowerCase() === 'non metallic' ? 2 : null,
          fedByUsageTypeId: get(d, 'Type', '').toLowerCase() === 'n' || get(d, 'Type', '').toLowerCase() === 'normal' ? 1 : get(d, 'Type', '').toLowerCase() === 'e' || get(d, 'Type', '').toLowerCase() === 'emergency' ? 2 : 1,
        }))
        .filter(val => !isEmpty(val.assetName && val.fedbyAssetName))

      const assetSubcomponentsMappings = get(data, 'Sub-Components', [])
        .map(d => ({
          toplevelAssetName: get(d, 'Asset Name', '').toString().trim(),
          subcomponentAssetName: get(d, 'Sub-Component Name', '').toString().trim(),
          subcomponentAssetClassCode: get(d, 'Sub-Component Asset Class Code', '').toString().trim(),
        }))
        .filter(val => !isEmpty(val.toplevelAssetName && val.subcomponentAssetName && val.subcomponentAssetClassCode))

      const payload = {
        assetData: uniqueAssetData,
        assetsFedbyMappings,
        assetSubcomponentsMappings,
      }

      await schema.validate(payload.assetData, { abortEarly: false })
      // await assetsFedbySchema.validate(payload.assetsFedbyMappings, { abortEarly: false })
      // await assetSubcomponentSchema.validate(payload.assetSubcomponentsMappings, { abortEarly: false })
      await uploadAsset(payload)
    } catch (error) {
      try {
        const lineNo = Number(error.inner[0].path.split('.')[0].match(/\[(.*?)\]/)[1])
        setError(`${error.inner[0].message} on Line [${lineNo + 2}]`)
      } catch (error) {
        Toast.error(`Error reading file !`)
      }
    }
  }
  const uploadAsset = async data => {
    if (isEmpty(data)) return Toast.error(`Selected file does not have any data !`)
    $('#pageLoading').show()
    try {
      const res = await onBoardingWorkorder.uploadAsset(snakifyKeys(data))
      if (res.success > 0) Toast.success(`Asset uploaded Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error uploading Asset. Please try again !`)
    }
    $('#pageLoading').hide()
    reFetch()
    reFetchLocations()
  }
  const completeWO = async () => {
    console.log('completion started')
    if (isEmpty(get(data, 'assetDetailsV2', []))) return Toast.error('Please add atleast one Asset !')
    setWOCompLoading(true)
    try {
      const res = await onBoardingWorkorder.updateWorkorderStatus(snakifyKeys({ woId: workOrderID, status: enums.woTaskStatus.Complete }))
      if (res.success > 0) {
        Toast.success('Workorder completion started !')
        setCompletionProcessStatus(enums.WO_COMPLETION_STATUS.IN_PROGRESS)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error completing workorder. Please try again !')
    }
    setWOCompLoading(false)
    setIsCompleteOpen(false)
    reFetch()
    checkCompletionStatus()
  }
  const deleteAsset = async () => {
    setDeleteLoading(true)
    try {
      const res = await onBoardingWorkorder.deleteAsset(snakifyKeys(deleteObj))
      if (res.success > 0) Toast.success(`Asset Deleted Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error deleting Asset. Please try again !`)
    }
    setDeleteLoading(false)
    setIsDeleteOpen(false)
    reFetch()
    reFetchLocations()
  }
  //
  useEffect(() => {
    const rows = get(data, 'assetDetailsV2', [])
    // setHierarchyData(rows)
    let filteredRows = [...rows]

    if (errorCountFlag) {
      filteredRows = filteredRows.filter(x => !isEmpty(errorCount) && errorCount.some(eId => eId.assetId === x.assetId))
    }

    if (!isEmpty(searchString)) {
      filteredRows = rows.filter(
        x =>
          (x.assetName !== null && x.assetName.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.assetClassName !== null && x.assetClassName.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.assetClassCode !== null && x.assetClassCode.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.building !== null && x.building.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.floor !== null && x.floor.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.room !== null && x.room.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.section !== null && x.section.toLowerCase().includes(searchString.toLowerCase())) ||
          (x.qRCode !== null && x.qRCode.toLowerCase().includes(searchString.toLowerCase()))
      )
    }
    if (!isEmpty(selectedStatus)) filteredRows = filteredRows.filter(x => x.status === selectedStatus.value)
    if (!isEmpty(selectedAssetClassCode)) filteredRows = filteredRows.filter(x => x.assetClassCode === selectedAssetClassCode.value)
    if (!isEmpty(selectedAssetClass)) filteredRows = filteredRows.filter(x => x.assetClassName === selectedAssetClass.value)
    if (!isEmpty(selectedBuilding)) filteredRows = filteredRows.filter(x => x.building === selectedBuilding.value)
    if (!isEmpty(selectedFloor)) filteredRows = filteredRows.filter(x => x.floor === selectedFloor.value)
    if (!isEmpty(selectedRoom)) filteredRows = filteredRows.filter(x => x.room === selectedRoom.value)
    if (!isEmpty(selectedSection)) filteredRows = filteredRows.filter(x => x.section === selectedSection.value)
    if (!isEmpty(selectedIssue)) {
      if (selectedIssue.value === 'All') {
        filteredRows = filteredRows.filter(x => !isEmpty(x.issuesTitleList))
      } else {
        filteredRows = filteredRows.filter(x => Array.isArray(x.issuesTitleList) && x.issuesTitleList.includes(selectedIssue.value))
      }
    }
    setHierarchyData(filteredRows)
    setRows(filteredRows)
  }, [searchString, selectedStatus, selectedAssetClassCode, selectedAssetClass, selectedBuilding, selectedFloor, selectedRoom, selectedSection, loading, selectedIssue, errorCountFlag])
  //
  const renderText = text => (isEmpty(text) ? 'N/A' : text)
  const menuOptions = [
    // {
    //   id: 2,
    //   name: 'Edit',
    //   action: d => handleAction('EDIT', d),
    //   disabled: d => IsCompletionInProgress || [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(d.status) || [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(data.woStatusId) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED),
    // },
    { id: 3, name: 'Accept', action: d => handleAction('ACCEPT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete, isHide: isQuote },
    { id: 4, name: 'Reject', action: d => handleAction('REJECT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete, isHide: isQuote },
    { id: 5, name: 'Hold', action: d => handleAction('HOLD', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.ReadyForReview || data.woStatusId === enums.woTaskStatus.Complete, isHide: isQuote },
    { id: 6, name: 'Delete', action: d => handleAction('DELETE', d), color: '#FF0000', disabled: d => IsCompletionInProgress || d.status === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete },
    { id: 7, name: 'Ready For Review', action: d => handleAction('REVERT', d), disabled: d => IsCompletionInProgress || d.status !== enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete, isHide: isQuote },
  ]

  const handleCheckboxChange = data => {
    let updatedMarkedRows
    if (markedRows.includes(data.woonboardingassetsId)) {
      setMarkedRows(p => p.filter(d => d !== data.woonboardingassetsId))
      updatedMarkedRows = markedRows.filter(d => d !== data.woonboardingassetsId)
    } else {
      setMarkedRows(p => [...p, data.woonboardingassetsId])
      updatedMarkedRows = [...markedRows, data.woonboardingassetsId]
    }
    if (updatedMarkedRows.length === 0) {
      setIsMarkedAll(false)
    } else if (rows.every(d => updatedMarkedRows.includes(d.woonboardingassetsId))) {
      setIsMarkedAll(true)
    } else {
      setIsMarkedAll(false)
    }
  }

  const selectAndDeSelectAll = () => {
    if (!isMarkedAll) {
      const paginatedData = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setMarkedRows(paginatedData.map(d => d.woonboardingassetsId))
    } else setMarkedRows([])
    setIsMarkedAll(p => !p)
  }
  const columns = [
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isMarkedAll} onClick={selectAndDeSelectAll} />, render: d => <RenderCheckBox data={d} accessor='woonboardingassetsId' selected={markedRows} handleChange={handleCheckboxChange} />, isHidden: currentSelectedStatus === 0 ? true : false },
    {
      name: 'Asset Name',
      render: d => {
        return subTab === 'FLATLIST' ? (
          <div className='d-flex'>
            <AssetTypeIcon type={d.assetClassType} />
            {renderText(d.assetName)}
          </div>
        ) : (
          <div className='d-flex align-items-center' style={{ paddingLeft: d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL ? '' : '10px', marginLeft: d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL ? '-8px' : 0 }}>
            {d.isExpanded ? (
              <ActionButton action={e => handleSubExpand(d, e)} tooltip='COLLAPSE' icon={<ExpandMoreIcon fontSize='small' />} />
            ) : !isEmpty(d.subLevelComponent) ? (
              <ActionButton hide={isEmpty(d.subLevelComponent)} isLoading={d.loading} action={e => handleSubExpand(d, e)} tooltip='EXPAND' icon={<ChevronRightIcon fontSize='small' />} />
            ) : (
              <div style={{ marginLeft: '26px' }}></div>
            )}
            <AssetTypeIcon type={d.assetClassType} />
            {renderText(d.assetName)}
          </div>
        )
      },
      isHidden: false,
    },
    { name: 'Asset Class', render: d => `${d.assetClassCode} - ${renderText(d.assetClassName)}`, isHidden: false },
    // { name: 'Asset Class', render: d => renderText(d.assetClassName), isHidden: false },
    {
      name: 'Location',
      render: d => {
        return (
          <>
            <div>
              {renderText(d.tempMasterBuilding)} <span style={{ color: '#808080', fontSize: '18px' }}> | </span>
              {renderText(d.tempMasterFloor)}
              <span style={{ color: '#808080', fontSize: '18px' }}> | </span>
              {renderText(d.tempMasterRoom)} <span style={{ color: '#808080', fontSize: '18px' }}> | </span>
              {renderText(d.tempMasterSection)}
            </div>
            {/* {}
          {`${)}<span> |</sapn> ${renderText(d.floor)} | ${renderText(d.room)}`} */}
          </>
        )
      },

      isHidden: false,
    },
    // { name: 'Building', render: d => renderText(d.building), isHidden: false },
    // { name: 'Floor', render: d => renderText(d.floor), isHidden: false },
    // { name: 'Room', render: d => renderText(d.room), isHidden: false },
    // { name: 'Section', render: d => renderText(d.section), isHidden: false },
    {
      name: 'Overview',
      render: val => <OverviewIcons val={val} />,
      isHidden: false,
    },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status)
        return <StatusComponent color={color} label={label} size='small' />
      },
      isHidden: isQuote ? true : false,
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton
            isLoading={editActionLoader === d.woonboardingassetsId}
            tooltip='EDIT'
            action={e => (e.stopPropagation(), handleAction('EDIT', d))}
            icon={<EditOutlinedIcon fontSize='small' />}
            btnRef={actionEditBtnRef}
            disabled={
              IsCompletionInProgress ||
              [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(d.status) ||
              [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(data.woStatusId) ||
              (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) ||
              (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) ||
              (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED)
            }
          />
          {!isQuote ? (
            <Menu options={menuOptions} data={d} loading={actionLoader === d.woonboardingassetsId} width={134} />
          ) : (
            <ActionButton
              tooltip='DELETE'
              action={e => (e.stopPropagation(), handleAction('DELETE', d))}
              icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />}
              disabled={IsCompletionInProgress || d.status === enums.woTaskStatus.Complete || data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED || data.quoteStatusId === enums.QUOTES.STATUS.REJECTED}
            />
          )}
        </div>
      ),
      isHidden: currentSelectedStatus === 0 ? false : true,
    },
  ]
  //
  const checkFilterDisability = () => {
    return isEmpty(selectedStatus) && isEmpty(selectedAssetClassCode) && isEmpty(selectedAssetClass) && isEmpty(selectedBuilding) && isEmpty(selectedFloor) && isEmpty(selectedRoom) && isEmpty(selectedSection) && isEmpty(selectedIssue) && !errorCountFlag
  }
  const clearFilter = () => {
    setSelectedAssetClass({})
    setSelectedAssetClassCode({})
    setSelectedBuilding({})
    setSelectedFloor({})
    setSelectedRoom({})
    setSelectedSection({})
    setSelectedStatus({})
    setSelectedIssue({})
    setCurrentSelectedStatus(0)
    setErrorCountFlag(false)
    setErrorCount([])
    setPage(0)
    setRowsPerPage(enums.DEFAULT_PAGE_SIZE)
  }

  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = isOnboarding ? AppendRandomValueToS3Url(URL.sampleOnboardingTemplate) : AppendRandomValueToS3Url(URL.sampleInfraredScanTemplate)
    link.click()
  }
  const handleUploadIrPhotos = () => {
    setError('')
    uploadIrPhotoRef.current && uploadIrPhotoRef.current.click()
  }
  const addIrPhotos = e => {
    e.preventDefault()
    if (!e.target.files.length) return
    const files = [...e.target.files]
    const invalidExtensions = files.map(d => ['jpg', 'jpeg', 'png', 'PNG', 'gif', 'eps', 'JPEG', 'JPG', 'GIF'].includes(d.name.split('.').slice(-1).pop())).filter(d => d === false)
    if (!isEmpty(invalidExtensions)) setError('Invalid Image format !')
    else {
      setError('')
      uploadPhoto(files)
    }
    e.target.value = null
  }
  const showPhotos = photos => {
    const files = [...photos]
    files.forEach(d => {
      d.id = nanoid()
      d.url = window.URL.createObjectURL(d)
    })
    setUploadPreviewFiles(files)
    setTab(uploadTabs.UPLOADED)
  }
  const uploadPhoto = async files => {
    const formData = new FormData()
    files.forEach((file, i) => {
      formData.append(`file-${i}`, file, file.name)
    })
    formData.append('manual_wo_number', data.manualWoNumber)
    formData.append('wo_id', workOrderID)
    setUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadIrPhoto(formData)
      if (res.success) {
        Toast.success('IR Images uploaded !')
        showPhotos(files)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading images !')
    }
    setUploading(false)
  }
  const closeOnUploadPopUp = () => {
    setUploadPreviewOpen(false)
    setTab(uploadTabs.UPLOAD)
    setUploadPreviewFiles([])
  }
  const exportObReport = async type => {
    setPdfProcessing(true)
    try {
      const document = await onBoardingWorkorder.downloadReport(snakifyKeys({ woId: workOrderID, reportType: type }))
      if (document.success > 0) {
        // window.open(document.data.reportUrl, '_blank')
        Toast.success(`Your report is being generated and will be emailed to you shortly. You’ll receive an email with the download link for the report once it's ready. Thank you for your patience!`)
      } else {
        Toast.error(document.message)
      }
    } catch (err) {
      Toast.error('Error exporting Report !')
    }
    setPdfProcessing(false)
  }

  //
  const exportPDF = async () => {
    // if (data.woStatusId === enums.woTaskStatus.Complete && !isEmpty(data.irWoPdfReport)) window.open(data.irWoPdfReport, '_blank')
    if (
      !get(data, 'assetDetailsV2', [])
        .map(d => d.status)
        .includes(enums.woTaskStatus.Complete)
    )
      Toast.error('No completed workorder line to export !')
    else generatePDF()
  }
  const generatePDF = async () => {
    setPdfProcessing(true)
    try {
      const res = await onBoardingWorkorder.pdf.generate(snakifyKeys({ woId: workOrderID }))
      if (res.success) {
        if (isEmpty(res.data.pdfS3Url)) checkPdfStatus()
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error exporting PDF !')
    }
  }
  const checkPdfStatus = async (timeoutCounter = 0) => {
    try {
      const counter = timeoutCounter
      const res = await onBoardingWorkorder.pdf.getStatus({ id: workOrderID })
      if (isEmpty(res.data.pdfReportUrl)) {
        // reverce condidtion
        if (res.data.pdfReportStatus !== 19 && res.data.pdfReportStatus !== 20) setTimeout(() => checkPdfStatus(), 5000)
        else {
          if (res.data.pdfReportStatus === 20) Toast.error('Request timed out. Please try again !')
          else Toast.error('Request Failed. Please try again !')
          setPdfProcessing(false)
        }
        // setTimeout(() => checkPdfStatus(), 5000)
      } else {
        let parts = res.data.pdfReportUrl.split('/')
        let encodeUrl = encodeURIComponent(parts.at(-1))
        parts[parts.length - 1] = encodeUrl
        const newUrl = parts.join('/')

        window.open(newUrl, '_blank')
        setPdfProcessing(false)
      }
    } catch (error) {
      Toast.error('Error exporting PDF !')
    }
  }
  const viewTempIssue = async d => handleAction('VIEW', d)
  const checkIfReviewDisabled = () => {
    return isEmpty(data.assetDetailsV2) || !data.assetDetailsV2.some(row => row.status === enums.woTaskStatus.ReadyForReview) || data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress
  }
  const handleUploadPMs = () => {
    setError('')
    uploadPMsRef.current && uploadPMsRef.current.click()
  }
  const addPMsWoLine = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) setError(enums.errorMessages.error_msg_file_format)
      else {
        setError('')
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        validateSheetWOLine(data)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }

  const validateSheetWOLine = data => {
    try {
      const payload = data
        .filter(s => s['PM Item'].trim().toLowerCase() === 'infrared thermography' && s.Status.toLowerCase() === 'open')
        .map(d => ({
          assetPmId: get(d, 'PM Item ID', ''),
        }))
        .filter(val => val.assetPmId !== '')
      uploadPmWoLine(payload)
    } catch (error) {
      Toast.error(`Error reading file !`)
    }
  }

  const { loading: uploadPMsLoading, mutate: uploadWOLine } = usePostData({ executer: preventativeMaintenance.asset.bulkCreateIRPMsWOline, postSuccess: () => reFetch(), message: { success: 'PMs WoLine Created Successfully!', error: 'Something went wrong' } })
  const uploadPmWoLine = async payload => uploadWOLine({ pmList: payload, woId: workOrderID })

  const downloadPostSuccess = res => {
    if (res.success > 0) {
      const excelData = []
      const list = get(res, 'data.assetsList', [])
      list.forEach(d =>
        excelData.push({
          'Asset Name': get(d, 'assetName', ''),
          'QR Code': get(d, 'qRCode', ''),
        })
      )
      exportSpreadSheet({ data: excelData, fileName: 'Assets - QR Codes' })
    }
  }

  const { loading: downloadLoading, mutate: downloadAssetAndQrCode } = usePostData({ executer: workorder.getAssetsWithQRCode, postSuccess: downloadPostSuccess, message: { success: `Assets and QR Codes Downloaded Successfully!`, error: 'Something Went Wrong !' } })
  const handleDownloadAssetAndQrCode = () => downloadAssetAndQrCode(workOrderID)

  const findLabel = (options, value) => options.find(v => v.value === value)?.label || ''

  const exportAssetsPostSuccess = res => {
    if (res.success > 0) {
      const { assetData = [], assetsFedbyMappings = [], assetSubcomponentsMappings = [] } = res.data || {}

      const assets = assetData.map(d => ({
        'Asset Name': get(d, 'assetName', ''),
        'Asset Class Code': get(d, 'assetClassCode', ''),
        Location: get(d, 'location', '') || '',
        Building: get(d, 'building', ''),
        Floor: get(d, 'floor', ''),
        Room: get(d, 'room', ''),
        Section: get(d, 'section', ''),
        'Asset Condition': findLabel(physicalConditionOptions, get(d, 'assetOperatingConditionState', null)),
        'Operating Condition': findLabel(conditionOptions, get(d, 'conditionIndexType', null)),
        Criticality: findLabel(criticalityOptions, get(d, 'criticalityIndexType', null)),
        'QR Code': get(d, 'qRCode', '') || '',
      }))

      const connections = assetsFedbyMappings.length
        ? assetsFedbyMappings.map(d => ({
            'Asset Name': get(d, 'assetName', ''),
            'OCP Main': get(d, 'ocpAssetName', ''),
            'Fed-by Asset Name': get(d, 'fedbyAssetName', ''),
            OCP: get(d, 'fedbyOcpAssetName', ''),
            Type: findLabel(fedByTypeOptions, get(d, 'fedByUsageTypeId', null)),
            'Conductor Length': get(d, 'length', ''),
            'Conductor Material': findLabel(conductorTypesOptions, get(d, 'conductorTypeId', null)),
            'Conductor Number': get(d, 'numberOfConductor', ''),
            'Raceway Type': findLabel(racewayTypesOptions, get(d, 'racewayTypeId', null)),
            'Conductor Size': get(d, 'style', ''),
          }))
        : [
            {
              'Asset Name': '',
              'OCP Main': '',
              'Fed-by Asset Name': '',
              OCP: '',
              Type: '',
              'Conductor Length': '',
              'Conductor Material': '',
              'Conductor Number': '',
              'Raceway Type': '',
              'Conductor Size': '',
            },
          ]

      const subComponents = assetSubcomponentsMappings.length
        ? assetSubcomponentsMappings.map(d => ({
            'Asset Name': get(d, 'toplevelAssetName', ''),
            'Sub-Component Name': get(d, 'subcomponentAssetName', ''),
            'Sub-Component Asset Class Code': get(d, 'subcomponentAssetClassCode', ''),
          }))
        : [
            {
              'Asset Name': '',
              'Sub-Component Name': '',
              'Sub-Component Asset Class Code': '',
            },
          ]

      exportMultitabSpreadSheet({
        data: [
          {
            Assets: assets,
            Connections: connections,
            'Sub-Components': subComponents,
          },
        ],
        fileName: 'Temp Assets',
      })
    }
  }

  const { loading: exportAssetsLoading, mutate: exportAssets } = usePostData({ executer: workorder.exportTempAssetsExport, postSuccess: exportAssetsPostSuccess, message: { success: `Assets Downloaded Successfully!`, error: 'Something Went Wrong !' } })
  const handleExportAssets = () => exportAssets(workOrderID)

  const checkErrorsBtn = () => {
    let error = []
    if (!isEmpty(visibleRowsData)) {
      visibleRowsData.forEach(d => {
        if (duplicateQRs.has(d.qRCode)) {
          error = [...error, d]
        }
      })
    }

    setErrorCount(error)
    if (isEmpty(error)) {
      Toast.success('All line items verified! No Errors Found!')
    }
  }

  //
  const dropDownMenuOptions = [
    {
      id: 3,
      type: 'button',
      text: 'Add Asset',
      disabled: data?.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
      onClick: () => setIsAddAssetPopupOpen(true),
      icon: <AddIcon fontSize='small' />,
      show: true,
      seperatorBelow: true,
    },
    {
      id: 3,
      type: 'button',
      text: 'Check Errors',
      disabled: false,
      onClick: checkErrorsBtn,
      icon: <ReportOutlinedIcon fontSize='small' />,
      show: true,
      seperatorBelow: true,
    },
    get(userInfo, 'is_retool_bulk_operation_required', false)
      ? {
          id: 13,
          type: 'button',
          text: (
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '2px 0' }}>
              <span>Bulk Operations Tool</span>
              <span style={{ marginLeft: '15px', color: 'rgba(0, 0, 0, 0.314)', fontSize: '10px' }}>(Beta)</span>
            </span>
          ),
          // disabled: data?.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
          onClick: () => setBulkOperationsOpen(true),
          icon: <BuildOutlinedIcon fontSize='small' style={{ width: '15px', height: '15px', marginRight: '3px', marginLeft: '2px' }} />,
          show: true,
          seperatorBelow: true,
        }
      : {},
    { id: 4, type: 'input', show: true, onChange: addAsset, ref: uploadAssetRef },
    {
      id: 1,
      type: 'button',
      text: 'Upload IR Photo',
      disabled: IsCompletionInProgress || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
      onClick: () => setUploadPreviewOpen(true),
      icon: <PublishOutlinedIcon fontSize='small' />,
      show: !isOnboarding,
    },
    {
      id: 2,
      type: 'button',
      text: 'Upload Assets',
      disabled: data?.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
      onClick: handleUploadAsset,
      show: true,
      icon: <PublishOutlinedIcon fontSize='small' />,
    },
    {
      id: 8,
      type: 'button',
      text: 'Upload PMs',
      onClick: handleUploadPMs,
      icon: <PublishOutlinedIcon fontSize='small' />,
      show: !isOnboarding,
      disabled: data?.woStatusId === enums.woTaskStatus.Complete || (isQuote && data?.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
    },
    { id: 9, type: 'input', show: true, onChange: addPMsWoLine, ref: uploadPMsRef },
    { id: 5, type: 'input', show: true, onChange: addIrPhotos, ref: uploadIrPhotoRef, multiple: true },
    { id: 11, type: 'button', text: 'Export Assets', onClick: handleExportAssets, show: true, disabled: isEmpty(rows), icon: <GetAppOutlinedIcon fontSize='small' /> },
    // { id: 10, type: 'button', text: 'Download Assets and QR Codes', onClick: handleDownloadAssetAndQrCode, show: true, disabled: isEmpty(rows), icon: <GetAppOutlinedIcon fontSize='small' /> },
    { id: 6, type: 'button', text: 'Download Sample File', onClick: downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: true, seperatorBelow: true },
    { id: 7, type: 'button', text: 'Download Report', onClick: exportPDF, icon: <InsertDriveFileOutlinedIcon fontSize='small' />, show: !isQuote && !isOnboarding, disabled: IsCompletionInProgress || isEmpty(rows) },
    {
      id: 11,
      type: 'button',
      text: 'Generate Report',
      onClick: () => console.log(''),
      subOptions: [
        { id: 11.1, type: 'button', text: 'Docx', onClick: () => exportObReport('docx'), icon: <DescriptionOutlinedIcon fontSize='small' />, disabled: IsCompletionInProgress || isEmpty(rows), show: true },
        { id: 11.2, type: 'button', text: 'PDF', onClick: () => exportObReport('pdf'), icon: <PictureAsPdfOutlinedIcon fontSize='small' />, disabled: IsCompletionInProgress || isEmpty(rows), show: true },
      ],
      icon: <InsertDriveFileOutlinedIcon fontSize='small' />,
      show: !isQuote && isOnboarding,
      disabled: IsCompletionInProgress || isEmpty(rows),
    },
  ]

  const changeWatchingStatusSuccess = () => {
    reFetch()
  }

  const { mutate: changeWatchingStatus } = usePostData({ executer: watchWO, postSuccess: changeWatchingStatusSuccess, message: { success: 'WorkOrder Watching Status Change Successfully!', error: 'Something Went Wrong !' } })
  const handleWaching = () => changeWatchingStatus({ ref_id: workOrderID, user_id: get(userInfo, 'uuid', ''), is_deleted: data.isWatcher ? true : false })

  const mainMenuOptions = [
    {
      id: 1,
      name: 'Edit',
      action: () => setIsEditWO(true),
      disabled: () => data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED),
    },
    { id: 2, name: 'Review', action: () => setIsReviewOpen(true), disabled: () => checkIfReviewDisabled(), isHide: isQuote },
    { id: 3, name: !data.isWatcher ? 'Start Watch' : 'Stop Watch', action: handleWaching, disabled: () => data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress, isHide: isQuote },
  ]
  //check completeion status
  useEffect(() => {
    if (woState.wo_status_id !== enums.woTaskStatus.Complete) {
      checkCompletionStatus()
    }
  }, [])

  const checkCompletionStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    //console.log('check completion status')
    try {
      const res = await workorder.checkCompletionStatus(workOrderID)
      setCompletionProcessStatus(res.data.completeWoThreadStatus)
      //console.log(res.data)
      if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS) setTimeout(() => checkCompletionStatus(), 5000)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.COMPLETED) reFetch()
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.FAILED) Toast.error('Previous completion process failed !')
    } catch (error) {
      console.log(error)
    }
  }
  // add old/new asset
  const handleAddOldOrNewAsset = async () => {
    if (!addedAssetType) return handleAddNewAsset()
    else return handleAddExistingAsset()
  }
  const handleAddOldOrNewAssetPopupClose = () => {
    setIsAddAssetPopupOpen(false)
    setAddedAssetType(0)
  }
  const handleAddNewAsset = () => {
    setIsAddAssetPopupOpen(false)
    setIsAddOpen(true)
  }
  const handleAddExistingAsset = () => {
    setIsAddAssetPopupOpen(false)
    setIsAddExistingAssetOpen(true)
  }
  const handleCloseAdd = () => {
    setIsAddOpen(false)
    setAddedAssetType(0)
  }
  const checkOriginWoLineId = rows => {
    const query = new URLSearchParams(window.location.search)
    if (!isEmpty(query.get('originWoLineId')) && !originIssueOpened) {
      const d = rows.find(d => d.woonboardingassetsId === query.get('originWoLineId'))
      setOriginIssueOpened(true)
      handleAction('VIEW', d)
    }
  }
  const woState = {
    filter: get(history, 'location.state.filter', []),
    pageRows: get(history, 'location.state.pageRows', 20),
    search: get(history, 'location.state.search', ''),
    pageIndex: get(history, 'location.state.pageIndex', 1),
    wo_status_id: get(history, 'location.state.wo_status_id', 0),
    wo_type: get(history, 'location.state.wo_type', 0),
  }

  const handleAddAssetInLocation = data => {
    setAddingAssetLocation(data)
    setIsAddAssetPopupOpen(true)
  }
  const aftersubmit = () => {
    reFetch()
    reFetchLocations()
    if (mainTab === 'ONE_LINE') {
      setReload(p => p + 1)
    }
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (visibleRowsData.every(d => markedRows.includes(d.woonboardingassetsId))) {
      setIsMarkedAll(true)
    } else {
      setIsMarkedAll(false)
    }
  }, [page, markedRows, visibleRowsData])

  useEffect(() => {
    if (!isEmpty(rows)) {
      setVisibleRowsData([])
      setPage(0)
    }
  }, [rows])

  useEffect(() => {
    if (!isEmpty(rows)) {
      const paginatedData = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setVisibleRowsData(paginatedData)
    } else {
      setVisibleRowsData([])
    }

    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [rows, page, rowsPerPage])

  useEffect(() => {
    if (!isEmpty(rows)) {
      setVisibleHierarchy([])
      setHierarchyPage(0)
      setHierarchyRowsPerPage(enums.DEFAULT_PAGE_SIZE)
    }
  }, [hierarchy])

  useEffect(() => {
    let topPaginatedData = []
    let noPaginatedData = []
    if (!isEmpty(hierarchy.topLevel)) {
      topPaginatedData = hierarchy.topLevel.slice(hierarchyPage * hierarchyRowsPerPage, hierarchyPage * hierarchyRowsPerPage + hierarchyRowsPerPage)
    }
    if (!isEmpty(hierarchy.noLevel) && topPaginatedData.length < hierarchyRowsPerPage) {
      noPaginatedData = [...hierarchy.topLevel, ...hierarchy.noLevel].slice(hierarchyPage * hierarchyRowsPerPage, hierarchyPage * hierarchyRowsPerPage + hierarchyRowsPerPage)
      noPaginatedData = noPaginatedData.splice(topPaginatedData.length)
    }
    setVisibleHierarchy(data => ({
      ...data,
      topLevel: topPaginatedData,
      noLevel: noPaginatedData,
    }))

    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [hierarchy, hierarchyPage, hierarchyRowsPerPage])

  useEffect(() => {
    const oldHeirarchy = hierarchy
    const topLevel = hierarchyData.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL)
    const subLevel = hierarchyData.filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.SUB_COMPONENT)
    const noLevel = hierarchyData.filter(d => d.componentLevelTypeId === 0)
    const topLevelIds = []
    topLevel.forEach(d => {
      if (!isEmpty(d.assetId)) topLevelIds.push(d.assetId)
      if (!isEmpty(d.woonboardingassetsId)) topLevelIds.push(d.woonboardingassetsId)
    })
    const noTopLevelSub = subLevel.filter(sub => !topLevelIds.includes(sub.toplevelcomponentAssetId))
    setHierarchy(data => ({
      ...data,
      noLevel: [...noLevel, ...noTopLevelSub],
      isExpanded: true,
    }))
    const subLevelMapping = {}

    topLevel.forEach(top => {
      subLevelMapping[top.woonboardingassetsId] = subLevel.filter(sub => [top.woonboardingassetsId, top.assetId].includes(sub.toplevelcomponentAssetId) && !isEmpty(sub.toplevelcomponentAssetId))
    })

    const topLevelWithSubLevel = topLevel.map(top => ({
      ...top,
      subLevelComponent: subLevelMapping[top.woonboardingassetsId] || [],
      isExpanded: !isEmpty(subLevelMapping[top.woonboardingassetsId]) ? true : false,
    }))

    setDisableExpand(hierarchyData.every(q => q.toplevelcomponentAssetId === null))

    setHierarchy(data => ({
      ...data,
      topLevel: topLevelWithSubLevel,
      isExpanded: true,
    }))

    // if (!isEmpty(searchString) || !isEmpty(selectedStatus) || !isEmpty(selectedAssetClassCode) || !isEmpty(selectedAssetClass) || !isEmpty(selectedBuilding) || !isEmpty(selectedFloor) || !isEmpty(selectedRoom) || !isEmpty(selectedSection)) {
    if (!isEmpty(searchString)) {
      const allDataFilter = get(data, 'assetDetails', []).filter(d => d.componentLevelTypeId === enums.COMPONENT_TYPE.TOP_LEVEL)

      allDataFilter.forEach(top => {
        subLevelMapping[top.woonboardingassetsId] = subLevel.filter(sub => sub.toplevelcomponentAssetId === top.woonboardingassetsId)
      })

      const topLevelWithSubLevelFilter = allDataFilter.map(top => ({
        ...top,
        subLevelComponent: subLevelMapping[top.woonboardingassetsId] || [],
        isExpanded: true,
      }))

      const filterSub = topLevelWithSubLevelFilter.filter(d => d.subLevelComponent.length >= 1)

      setHierarchy(data => ({
        ...data,
        topLevel: uniqBy([...topLevelWithSubLevel, ...filterSub], 'woonboardingassetsId'),
        isExpanded: true,
      }))

      const levelWithoutTop = [...noLevel, ...noTopLevelSub]
      const filteredNoLevel = levelWithoutTop.filter(e => !Object.keys(subLevelMapping).includes(e.toplevelcomponentAssetId))
      setHierarchy(data => ({
        ...data,
        noLevel: [...filteredNoLevel],
        isExpanded: !isEmpty(filteredNoLevel) ? true : false,
      }))
    }
  }, [hierarchyData, searchString])

  const handleSubExpand = (topAsset, e) => {
    e.stopPropagation()
    const topAssetList = [...hierarchy.topLevel]
    const noAssetList = [...hierarchy.noLevel]

    topAsset.isExpanded = !topAsset.isExpanded
    setHierarchy({ topLevel: topAssetList, noLevel: noAssetList })
  }

  const handleExpandCollapse = () => {
    setHierarchy(data => ({
      ...data,
      topLevel: data.topLevel.map(item => ({
        ...item,
        isExpanded: !isEmpty(item.subLevelComponent) && !data.isExpanded,
      })),
      isExpanded: !data.isExpanded,
    }))
  }

  const allExpanded = hierarchy.topLevel.filter(val => !isEmpty(val.subLevelComponent)).every(item => item.isExpanded)

  useEffect(() => {
    if (allExpanded) {
      setHierarchy(data => ({
        ...data,
        isExpanded: true,
      }))
    }
  }, [allExpanded])

  const handleTechnician = () => {
    if (isEmpty(data)) return

    const maxVisibleTechnicians = 2
    const visibleTechnicians = isShowMore ? get(data, 'technicianMappingList', []) : data.technicianMappingList.slice(0, maxVisibleTechnicians)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap' onMouseEnter={() => (data.technicianMappingList.length > 2 ? setShowMore(true) : setShowMore(false))} onMouseLeave={() => setShowMore(false)} style={{ position: 'relative' }}>
          {!isEmpty(visibleTechnicians) &&
            !isShowMore &&
            visibleTechnicians.map((d, index) => (
              <div key={d.userId} className='ml-2 mb-2'>
                {(index < 2 || isShowMore) && <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />}
              </div>
            ))}
          {isShowMore && (
            <div style={{ position: 'absolute', top: '-100%', left: 0, backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', zIndex: '8', width: '200px' }} className='p-2 d-flex flex-wrap'>
              {visibleTechnicians.map(d => (
                <div key={d.user_id} className='ml-1 mb-1'>
                  <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />
                </div>
              ))}
            </div>
          )}
        </div>
        {data.technicianMappingList.length === 0 && 'N/A'}
      </>
    )
  }

  const getVendor = () => {
    return (
      <div className='d-flex align-items-center flex-wrap' style={{ position: 'relative' }}>
        {get(data, 'workorderVendorContactsList', []).map(d => {
          return (
            <div key={d.vendorId} className='ml-2 mb-1'>
              <StatusComponent color='#848484' label={`${d.vendorName}<${d.vendorEmail}>`} size='small' />
            </div>
          )
        })}
      </div>
    )
  }

  const handleLead = () => {
    if (isEmpty(data)) return

    const maxVisibleLead = 2
    const visibleLead = isShowMoreLead ? get(data, 'backofficeMappingList', []) : data.backofficeMappingList?.slice(0, maxVisibleLead)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap' onMouseEnter={() => (data.backofficeMappingList?.length > 2 ? setShowMoreLead(true) : setShowMoreLead(false))} onMouseLeave={() => setShowMoreLead(false)} style={{ position: 'relative' }}>
          {!isEmpty(visibleLead) &&
            !isShowMoreLead &&
            visibleLead.map((d, index) => (
              <div key={d.userId} className='ml-2 mb-2'>
                {(index < 2 || isShowMoreLead) && <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />}
              </div>
            ))}
          {isShowMoreLead && (
            <div style={{ position: 'absolute', top: '-100%', left: 0, backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', zIndex: '8', width: '200px' }} className='p-2 d-flex flex-wrap'>
              {visibleLead.map(d => (
                <div key={d.user_id} className='ml-1 mb-1'>
                  <StatusComponent color='#848484' label={`${d.firstname} ${d.lastname}`} size='small' />
                </div>
              ))}
            </div>
          )}
        </div>
        {data.backofficeMappingList?.length === 0 && 'N/A'}
      </>
    )
  }

  const handleDueDateText = () => {
    if (get(data, 'woStatusId', '') === enums.woTaskStatus.Complete) return getFormatedDate(get(data, 'dueDate', '')?.split(' ')[0])
    const isExpired = data.woDueOverdueFlag === enums.WO_DUE_FLAG.OVERDUE
    const dueInText = get(data, 'dueIn', '')?.trim()

    return !isEmpty(get(data, 'dueDate', '')) ? (
      <span style={{ color: data.woDueOverdueFlag === enums.WO_DUE_FLAG.DUEINDAYS ? '' : getDueInColor(data.woDueOverdueFlag === enums.WO_DUE_FLAG.DUE ? 35 : -1) }} className={data.woDueOverdueFlag !== enums.WO_DUE_FLAG.DUEINDAYS ? 'text-bold' : ''}>
        {getFormatedDate(get(data, 'dueDate', '')?.split(' ')[0])} {isQuote ? (isExpired ? '(Expired)' : '') : `(${dueInText})`}
      </span>
    ) : (
      'N/A'
    )
  }
  const getStatusWiseCount = status => {
    return get(
      rows.filter(d => d.status === status),
      'length',
      0
    )
  }

  const TitleCount = ({ title, count, bg }) => {
    const fontSize = count ? (count.toString().length <= 3 ? 10 : Math.max(12 - count.toString().length, 8)) : 10
    return (
      <div className='d-flex align-items-center'>
        {title}
        <span className='ml-2 text-bold d-flex align-items-center justify-content-center' style={{ width: '21px', height: '21px', background: bg || '#a6a6a6', color: '#fff', borderRadius: '16px', fontSize: `${fontSize}px` }}>
          {count}
        </span>
      </div>
    )
  }

  const changeWOStatus = async ({ label, value }) => {
    console.log({ label, value })
    $('#pageLoading').show()
    try {
      const payload = {
        wo_id: workOrderID,
        status: value,
      }
      const res = await updateWOStatus(payload)
      $('#pageLoading').hide()
      if (res.success > 0) {
        Toast.success('Workorder Status Changed Successfully!')
        reFetch()
      } else {
        Toast.error('Error while updating workorder. Please try again !')
      }
    } catch (error) {
      $('#pageLoading').hide()
      Toast.error('Error while updating workorder. Please try again !')
    }
  }

  const handleAssetNodeClick = async (type, asset_id) => {
    await getWOLineDetail(type, asset_id)
  }

  const { loading: quoteStatusLoading, mutate: updateQuoteStatus } = usePostData({ executer: onBoardingWorkorder.changeQuoteStatus, postSuccess: () => reFetch(), message: { success: 'Quote Status Updated successfully !', error: 'Something went wrong !' } })
  const handleQuoteStatus = status => updateQuoteStatus({ wo_id: workOrderID, quote_status: status })

  if (quoteStatusLoading) $('#pageLoading').show()

  const getQuoteName = id => {
    const name = quotesType.find(d => d.value === id)
    return name?.label
  }

  const handleStatus = status => {
    console.log('current selected status - ', status)
    setSelectedStatus({ label: '', value: status })
    setCurrentSelectedStatus(status)
    let filteredRows = [...rows]
    filteredRows = filteredRows.filter(x => x.status === status)
    setRows(filteredRows)
  }

  const handleClear = () => {
    setCurrentSelectedStatus(0)
    setSelectedStatus({})
    if (isMarkedAll) {
      selectAndDeSelectAll()
    }
    setMarkedRows([])
    const rows = get(data, 'assetDetailsV2', [])
    setRows(rows)
  }

  const handleBulkStatusPostSccess = res => {
    if (!isDeleteBulkOpen) {
      setIsDeleteBulkOpen(false)
      reFetch()
      setMarkedRows([])
      setIsMarkedAll(false)
      setCurrentSelectedStatus(0)
      setSelectedStatus({})
    } else {
      if (res.success !== 1) setChunkFail(true)
    }
  }

  const handleBulkStatusPostError = () => {
    setIsDeleteBulkOpen(false)
    setMarkedRows([])
    setIsMarkedAll(false)
    setCurrentSelectedStatus(0)
    setSelectedStatus({})
    setChunkFail(true)
  }

  const { loading: statusChangeLoading, mutate: updateStatus } = usePostData({
    executer: asset.inspections.updateOBWOStatus,
    postSuccess: handleBulkStatusPostSccess,
    postError: handleBulkStatusPostError,
    message: { success: isDeleteBulkOpen ? 'Assets Deleted Successfully !' : 'Status updated successfully !', error: 'Something went wrong !' },
    hideMessage: isDeleteBulkOpen ? true : false,
  })
  const handleChangeStatus = status => updateStatus({ woonboardingassetsIdList: markedRows, status: !isDeleteBulkOpen ? status : null, isRequestedForDelete: isDeleteBulkOpen ? true : false })

  const handleBulkDelete = async () => {
    const items = [...markedRows]
    const itemChunks = chunk(items, enums.DELETE_BULK_ASSET_SIZE)

    for (const chunk of itemChunks) {
      await updateStatus({ woonboardingassetsIdList: chunk, status: null, isRequestedForDelete: true })
    }
    if (isChunkFail) {
      setIsDeleteBulkOpen(false)
      setMarkedRows([])
      setIsMarkedAll(false)
      setCurrentSelectedStatus(0)
      setSelectedStatus({})
      Toast.error('Something went wrong !')
    } else {
      Toast.success('Assets Deleted Successfully !')
      setIsDeleteBulkOpen(false)
      reFetch()
      setMarkedRows([])
      setIsMarkedAll(false)
      setCurrentSelectedStatus(0)
      setSelectedStatus({})
    }
  }
  // attchment
  const addAttachment = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onloadend = () => {}
    reader.readAsDataURL(file)
    uploadAttachment(file)
    e.target.value = null
  }
  const uploadAttachment = async file => {
    $('#pageLoading').show()
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await uploadWOAttachment(formData)
      if (res.success > 0) mapAttachment(res.data)
      else Toast.error('Error uploading file. Please try again !')
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
      $('#pageLoading').hide()
    }
  }
  const mapAttachment = async data => {
    try {
      const res = await mapWOAttachment({
        wo_id: workOrderID,
        file_name: data.filename,
        user_uploaded_name: data.user_uploaded_name,
      })
      if (res.success > 0) Toast.success('File Uploaded Successfully !')
      else Toast.error('Error uploading file. Please try again !')
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
    }
    reFetch()
  }

  const delAttachment = async () => {
    setDeleteAttOpen(false)
    $('#pageLoading').show()
    try {
      const res = await deleteWOAttachment({ wo_attachment_id: delObj.woAttachmentId })
      if (res.success > 0) Toast.success('Attachment Removed Successfully !')
      else Toast.error('Error removing attachment. Please try again !')
    } catch (error) {
      Toast.error('Error removing attachment. Please try again !')
    }
    reFetch()
  }

  const attachmentColumns = [
    { name: 'Attachment Name', accessor: 'userUploadedName' },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={() => window.open(d.fileUrl, '_blank')} icon={<VisibilityOutlinedIcon fontSize='small' />} tooltip='VIEW' />
          <ActionButton
            action={() => handleAction('DELETE-ATTACHMENT', d)}
            icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#ff0000' }} />}
            tooltip='DELETE'
            disabled={data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED)}
          />
        </div>
      ),
    },
  ]

  const editPmFromView = data => {
    setIsViewOpen(false)
    setIsViewOpen(false)
    handleAction('EDIT', data)
  }

  const handleChangePage = (event, newPage) => {
    setPageLoading(true)
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setPageLoading(true)
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleHierarchyChangePage = (event, newPage) => {
    setPageLoading(true)
    setHierarchyPage(newPage)
  }

  const handleHierarchyChangeRowsPerPage = event => {
    setPageLoading(true)
    setHierarchyRowsPerPage(parseInt(event.target.value, 10))
    setHierarchyPage(0)
  }

  const duplicateQRs = getDuplicateQRs(visibleRowsData)

  const handleErrorCountClick = event => {
    setErrorCountFlag(pre => {
      if (pre) {
        setErrorCountFlag(false)
        setErrorCount([])
      }
      return !pre
    })
  }

  const ErrorCount = ({ count }) => {
    return (
      <Box className='filter-div' onClick={handleErrorCountClick}>
        <Box className='filter-chip' style={{ background: '#ffebeb', display: 'flex', alignItems: 'center', marginRight: '10px', minHeight: '30px', border: '1px solid red' }}>
          <Typography className='text-black-reguler-bold'>{count}</Typography>
          <Typography className='text-black-reguler-bold' style={{ marginLeft: '5px' }}>
            Errors Found
          </Typography>
          {errorCountFlag ? <CloseIcon fontSize='small' style={{ width: '18px', height: '18px', marginLeft: '5px' }} /> : <FilterListIcon fontSize='small' style={{ width: '18px', height: '18px', marginLeft: '5px' }} />}
        </Box>
      </Box>
    )
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', padding: '20px', background: '#fff' }}>
      <CompletionStatus text='Workorder completion in Progress' status={completionProcessStatus} inProgress={enums.WO_COMPLETION_STATUS.IN_PROGRESS} />
      <div className='d-flex align-items-center mb-3 justify-content-between'>
        <div className='d-flex align-items-center'>
          <div className='mr-2'>
            <ActionButton action={() => history.push({ pathname: isQuote ? '/quote' : '/workorders', state: woState })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
          </div>
          <div className='text-bold mr-2 text-md'>{data.manualWoNumber}</div>
          {!isQuote ? (
            <div className='mx-2'>
              {!isEmpty(data) && !isNaN(data.woStatusId) && data.woStatusId !== enums.woTaskStatus.ReleasedOpen && data.woStatusId !== enums.woTaskStatus.Planned ? (
                <StatusComponent color={color} label={label} size='medium' />
              ) : (
                <StatusChangeRadioDropdown color={color} title={label} size='medium' selected={label} list={enums.WO_STATUS.filter(e => e.value === enums.woTaskStatus.Planned || e.value === enums.woTaskStatus.ReleasedOpen)} valueKey='label' onChange={changeWOStatus} />
              )}
            </div>
          ) : (
            <StatusComponent color={quoteColor} label={quoteLabel} size='medium' />
          )}
        </div>
        <div className='d-flex'>
          {/* {isQuote && <MinimalButton onClick={console.log('download Qote')} text='Download Quote' size='small' startIcon={<SaveAltOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons ml-2' />} */}
          {mainTab !== 'ONE_LINE' && (isShowWoDetails ? <ActionButton action={() => setShowWoDetails(false)} icon={<ExpandMoreIcon fontSize='medium' />} tooltip='Hide Work Order Details' /> : <ActionButton action={() => setShowWoDetails(true)} icon={<ExpandLessIcon fontSize='medium' />} tooltip='Show Work Order Details' />)}

          <Menu options={mainMenuOptions} noToolip />
        </div>
      </div>
      {mainTab !== 'ONE_LINE' && (
        <>
          {isShowWoDetails && (
            <div style={{ padding: '16px 32px', background: '#fafafa', borderRadius: '4px', position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '35px' }}>
                {!loading && <LabelVal label={isQuote ? 'Quote Type' : 'Work Type'} value={isQuote ? getQuoteName(get(data, 'woType', '')) : get(data, 'woTypeName', '')} inline />}
                {!loading && <LabelVal label={isQuote ? 'Quote Date' : 'Start Date'} value={data.startDate ? getFormatedDate(data.startDate.split('T')[0]) : 'N/A'} inline />}
                <LabelVal label={isQuote ? 'Quote Expiration Date' : 'Due Date'} value={handleDueDateText()} inline />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '35px' }}>
                <LabelVal inline label='Assigned Leads' value={handleLead()} />
                {!isQuote && <LabelVal inline label='Assigned  Technicians' value={handleTechnician()} lableMinWidth={85} />}
                <LabelVal inline label='Responsible Party' value={get(data, 'responsiblePartyName', 'N/A') || 'N/A'} lableMinWidth={85} />
                {/* {isQuote && !loading && <LabelVal label='Description' value={renderDescription()} inline lableMinWidth={85} />} */}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', height: '35px' }}>
                <LabelVal inline label='Vendor' value={getVendor()} />
              </div>
              {!loading && <LabelVal label='Description' value={renderDescription()} inline lableMinWidth={85} />}
            </div>
          )}

          {/* <div className='d-flex flex-row justify-content-between align-items-center mt-3' style={{ width: '100%' }}>
            <div className='d-flex align-items-center'>
              <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} />
              <div className='d-flex align-items-center ml-2'>
                <StatusMetric toolTip='OPEN' count={get(data, 'statusWiseAssetCountObj.openObwoAsset', 0)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' />
                <StatusMetric toolTip='IN PROGRESS' count={get(data, 'statusWiseAssetCountObj.inprogressObwoAsset', 0)} loading={loading} icon={UpdateOutlinedIcon} color='#3291DD' />
                <StatusMetric toolTip='READY FOR REVIEW' count={get(data, 'statusWiseAssetCountObj.readyForReviewObwoAsset', 0)} loading={loading} icon={FindInPageOutlinedIcon} color='#FA0B0B' />
                <StatusMetric toolTip='COMPLETED' count={get(data, 'statusWiseAssetCountObj.completedObwoAsset', 0)} loading={loading} icon={CheckCircleOutlineOutlinedIcon} color='#41BE73' />
              </div>
              {!isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
              {pdfProcessing && (
                <div className='d-flex align-items-center ml-3'>
                  <CircularProgress size={20} thickness={5} />
                  <div className='ml-2 text-bold'>Generating PDF...</div>
                </div>
              )}
              {uploadPMsLoading && <span style={{ fontWeight: 800, marginLeft: '10px' }}>Uploading...</span>}
            </div>
          </div> */}
        </>
      )}

      {/* tabs */}
      <div className='assets-box-wraps customtab'>
        <AppBar position='static' color='inherit'>
          <Tabs id='controlled-tab-example' activeKey={mainTab} onSelect={k => setMainTab(k)}>
            <Tab eventKey='DEFAULT' title={<TitleCount title='Default' count={get(rows, 'length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='TIME-MATIRIALS' title={<TitleCount title='Time & Materials' count={get(data, 'timeMaterialsCount', 0)} />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='LOCATIONS' title={<TitleCount title='Active Locations' count={get(data, 'newLocationCount', 0)} />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='NEW_ISSUES' title={<TitleCount title='Issues' count={get(data, 'issuesCount', '0')} bg='red' />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='ATTACHMENTS' title={<TitleCount title='Attachments' count={get(data, 'workOrderAttachments.length', 0)} />} tabClassName='font-weight-bolder small-tab'></Tab>
            <Tab eventKey='ONE_LINE' title='Digital One-Line' tabClassName='font-weight-bolder small-tab'></Tab>
          </Tabs>
        </AppBar>
      </div>

      {mainTab === 'DEFAULT' && (
        <>
          <div className='d-flex flex-row justify-content-between align-items-center mt-2 filter-div' style={{ width: '100%' }}>
            {currentSelectedStatus === 0 ? (
              <div className='d-flex align-items-center'>
                <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} />
                {!isQuote && (
                  <div className='d-flex align-items-center ml-2'>
                    <StatusMetricButton toolTip='OPEN' count={get(data, 'statusWiseAssetCountObj.openObwoAsset', 0)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' action={() => subTab === 'FLATLIST' && !isQuote && data?.woStatusId !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.Open)} />
                    <StatusMetricButton toolTip='IN PROGRESS' count={get(data, 'statusWiseAssetCountObj.inprogressObwoAsset', 0)} loading={loading} icon={UpdateOutlinedIcon} color='#3291DD' action={() => subTab === 'FLATLIST' && !isQuote && data?.woStatusId !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.InProgress)} />
                    <StatusMetricButton
                      toolTip='READY FOR REVIEW'
                      count={get(data, 'statusWiseAssetCountObj.readyForReviewObwoAsset', 0)}
                      loading={loading}
                      icon={FindInPageOutlinedIcon}
                      color='#FA0B0B'
                      action={() => subTab === 'FLATLIST' && !isQuote && data?.woStatusId !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.ReadyForReview)}
                    />
                    <StatusMetricButton toolTip='COMPLETED' count={get(data, 'statusWiseAssetCountObj.completedObwoAsset', 0)} loading={loading} icon={CheckCircleOutlineOutlinedIcon} color='#41BE73' action={() => subTab === 'FLATLIST' && !isQuote && data?.woStatusId !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.Complete)} />
                    {/* <StatusMetric toolTip='SUBMITTED' count={get(data, 'statusWiseAssetCountObj.submittedObwoAsset', 0)} loading={loading} icon={BeenhereOutlinedIcon} color='#7d07ff' /> */}
                  </div>
                )}
                {!isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
                {(downloadLoading || exportAssetsLoading) && (
                  <>
                    <CircularProgress size={15} thickness={5} /> <span style={{ fontWeight: 800, marginLeft: '5px' }}>Downloading...</span>
                  </>
                )}
                {pdfProcessing && (
                  <div className='d-flex align-items-center ml-3'>
                    <CircularProgress size={20} thickness={5} />
                    {!isOnboarding ? <div className='ml-2 text-bold'>Generating PDF...</div> : <div className='ml-2 text-bold'>Generating Report...</div>}
                  </div>
                )}
                {uploadPMsLoading && <span style={{ fontWeight: 800, marginLeft: '10px' }}>Uploading...</span>}
              </div>
            ) : (
              <div className='d-flex align-items-center filter-chip w-100' style={{ padding: '2px', border: 0 }}>
                <IconButton size='small' onClick={handleClear}>
                  <CloseIcon fontSize='small' />
                </IconButton>
                <div style={{ fontSize: '13px', fontWeight: 800, display: 'inline-flex' }} className='mr-1'>{`${markedRows.length} Selected`}</div>
                <div className='separator'></div>
                {(currentSelectedStatus === enums.woTaskStatus.Open || currentSelectedStatus === enums.woTaskStatus.InProgress) && (
                  <>
                    {/* <ActionButton tooltipPlacement='top' icon={<BeenhereOutlinedIcon fontSize='small' />} tooltip='SUBMIT' action={() => handleChangeStatus(enums.woTaskStatus.ReadyForReview)} disabled={markedRows.length === 0 ? true : false} /> */}
                    <MinimalButton
                      onClick={() => handleChangeStatus(enums.woTaskStatus.ReadyForReview)}
                      text='Submit'
                      size='small'
                      startIcon={<BeenhereOutlinedIcon fontSize='small' />}
                      variant='contained'
                      color='primary'
                      baseClassName='nf-buttons'
                      style={{ marginLeft: '5px' }}
                      disabled={markedRows.length === 0 ? true : false || statusChangeLoading}
                    />
                  </>
                )}
                {currentSelectedStatus === enums.woTaskStatus.ReadyForReview && (
                  <>
                    <MinimalButton
                      onClick={() => handleChangeStatus(enums.woTaskStatus.Complete)}
                      text='Accept'
                      size='small'
                      startIcon={<CheckCircleOutlinedIcon fontSize='small' />}
                      variant='contained'
                      color='primary'
                      baseClassName='nf-buttons'
                      style={{ marginLeft: '5px' }}
                      disabled={markedRows.length === 0 ? true : false || statusChangeLoading}
                    />
                    <MinimalButton onClick={() => handleChangeStatus(enums.woTaskStatus.Recheck)} text='Reject' size='small' startIcon={<CancelOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '5px' }} disabled={markedRows.length === 0 ? true : false || statusChangeLoading} />
                    {/* <ActionButton tooltipPlacement='top' icon={<CheckCircleOutlinedIcon fontSize='small' />} tooltip='ACCEPT' action={() => handleChangeStatus(enums.woTaskStatus.Complete)} disabled={markedRows.length === 0 ? true : false} /> */}
                    {/* <ActionButton tooltipPlacement='top' icon={<CancelOutlinedIcon fontSize='small' />} tooltip='REJECT' action={() => handleChangeStatus(enums.woTaskStatus.Recheck)} disabled={markedRows.length === 0 ? true : false} /> */}
                  </>
                )}
                {currentSelectedStatus === enums.woTaskStatus.Complete && (
                  <>
                    <MinimalButton
                      onClick={() => handleChangeStatus(enums.woTaskStatus.ReadyForReview)}
                      text='Ready For Review'
                      size='small'
                      startIcon={<FindInPageOutlinedIcon fontSize='small' />}
                      variant='contained'
                      color='primary'
                      baseClassName='nf-buttons'
                      style={{ marginLeft: '5px' }}
                      disabled={markedRows.length === 0 ? true : false || statusChangeLoading}
                    />
                    {/* <ActionButton tooltipPlacement='top' icon={<FindInPageOutlinedIcon fontSize='small' />} tooltip='READY FOR REVIEW' action={() => handleChangeStatus(enums.woTaskStatus.ReadyForReview)} disabled={markedRows.length === 0 ? true : false} /> */}
                  </>
                )}
                {currentSelectedStatus !== enums.woTaskStatus.Complete && (
                  <>
                    <MinimalButton onClick={() => setIsDeleteBulkOpen(true)} text='Delete' size='small' startIcon={<DeleteOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '5px' }} disabled={markedRows.length === 0 ? true : false || statusChangeLoading} />
                    {/* <ActionButton tooltipPlacement='top' icon={<DeleteOutlinedIcon fontSize='small' />} tooltip='DELETE' action={() => setIsDeleteBulkOpen(true)} disabled={markedRows.length === 0 ? true : false} /> */}
                  </>
                )}
                {statusChangeLoading && <CircularProgress size={15} thickness={5} style={{ margin: ' 0 7px' }} />}
              </div>
            )}
            {currentSelectedStatus === 0 && (
              <>
                <div className='d-flex' style={{ padding: '2px', background: '#f6f6f6', width: 'fit-content', borderRadius: '4px' }}>
                  <ToggleButton label='Flat List' value='FLATLIST' selected={subTab} onChange={setSubTab} />
                  <ToggleButton label='Hierarchy' value='HIERARCHY' selected={subTab} onChange={setSubTab} />
                </div>
                <div style={{ width: '250px' }}></div>
              </>
            )}
            {currentSelectedStatus === 0 && subTab === 'FLATLIST' && <div className='d-flex flex-row align-items-center'>{!isEmpty(errorCount) && <ErrorCount count={errorCount.length} />}</div>}
          </div>

          {subTab === 'FLATLIST' && (
            <>
              <div className='d-flex flex-row justify-content-between align-items-center my-2' style={{ width: '100%' }}>
                <div className='d-flex flex-wrap mt-2'>
                  {currentSelectedStatus === 0 && (
                    <>
                      <FilterPopup selected={selectedAssetClassCode?.value ? { label: selectedAssetClassCode.value } : selectedAssetClassCode} onChange={d => setSelectedAssetClassCode(d)} onClear={() => setSelectedAssetClassCode({})} placeholder='Asset Class Code' options={assetClassCodeOptions} baseClassName='mr-2 mb-2' />
                      {/* <FilterPopup selected={selectedAssetClass} onChange={d => setSelectedAssetClass(d)} onClear={() => setSelectedAssetClass({})} placeholder='Asset Class' options={assetClassOptions} baseClassName='mr-2 mb-2' /> */}
                      <FilterPopup selected={selectedBuilding} onChange={d => setSelectedBuilding(d)} onClear={() => setSelectedBuilding({})} placeholder='Building' options={buildingOptions} baseClassName='mr-2 mb-2' />
                      <FilterPopup selected={selectedFloor} onChange={d => setSelectedFloor(d)} onClear={() => setSelectedFloor({})} placeholder='Floor' options={floorOptions} baseClassName='mr-2 mb-2' />
                      <FilterPopup selected={selectedRoom} onChange={d => setSelectedRoom(d)} onClear={() => setSelectedRoom({})} placeholder='Room' options={roomOptions} baseClassName='mr-2 mb-2' />
                      <FilterPopup selected={selectedSection} onChange={d => setSelectedSection(d)} onClear={() => setSelectedSection({})} placeholder='Section' options={sectionOptions} baseClassName='mr-2 mb-2' />
                      {!isEmpty(issueOptions) && <FilterPopup selected={selectedIssue} onChange={d => setSelectedIssue(d)} onClear={() => setSelectedIssue({})} placeholder='Issue' options={issueOptions} baseClassName='mb-2' />}
                      {/* <FilterPopup selected={selectedStatus} onChange={d => setSelectedStatus(d)} onClear={() => setSelectedStatus({})} placeholder='Status' options={statusOptions} baseClassName='mr-2 mb-2' /> */}
                    </>
                  )}
                </div>
                <div className='d-flex mt-2' style={{ minWidth: '330px', gap: '5px' }}>
                  <SearchComponent searchString={searchString} setSearchString={setSearchString} />
                  <MinimalButton size='small' disabled={checkFilterDisability()} startIcon={<RotateLeftSharpIcon />} text='Clear Filters' onClick={clearFilter} variant='contained' color='primary' />
                </div>
              </div>
              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: isShowWoDetails ? `calc(100% - 410px)` : 'calc(100% - 300px)' }}>
                {/* <TopSubTableHeader columns={columns} /> */}
                <TableComponent
                  data={visibleRowsData}
                  columns={columns.filter(e => e.isHidden === false)}
                  onRowClick={d => handleAction('VIEW', d)}
                  isForViewAction={true}
                  loading={loading || pageLoading}
                  rowStyle={row => ({
                    backgroundColor: duplicateQRs.has(row.qRCode) ? '#ffebeb' : 'transparent',
                  })}
                />
              </div>
              {!isEmpty(rows) && <TablePagination rowsPerPageOptions={enums.PAGE_ARRAY_LIST} component='div' count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
            </>
          )}

          {subTab === 'HIERARCHY' && (
            <>
              <div className='d-flex flex-row-reverse' style={{ position: 'relative' }}>
                <>
                  <SearchComponent searchString={searchString} setSearchString={setSearchString} />
                  <div className='d-flex flex-row align-items-center' style={{ position: 'absolute', top: '-40px' }}>
                    {!isEmpty(errorCount) && <ErrorCount count={errorCount.length} />}
                    <MinimalButton disabled={isEmpty(hierarchy.topLevel) || disableExpand} onClick={handleExpandCollapse} text={allExpanded ? 'Collapse All' : 'Expand All'} size='small' variant='contained' color='primary' baseClassName='nf-buttons m-2' />
                  </div>
                </>
              </div>
              <div className='table-responsive dashboardtblScroll mt-2' id='style-1' style={{ height: `calc(100% - 400px)` }}>
                {/* <TopSubTableHeader columns={columns} /> */}
                <TopSubTableComponent
                  data={visibleHierarchy}
                  columns={columns.filter(e => e.isHidden === false)}
                  onRowClick={d => handleAction('VIEW', d)}
                  isForViewAction={true}
                  loading={loading || pageLoading}
                  rowStyle={row => ({
                    backgroundColor: duplicateQRs.has(row.qRCode) ? '#ffebeb' : 'transparent',
                  })}
                />
              </div>
              {(!isEmpty(hierarchy.topLevel) || !isEmpty(hierarchy.noLevel)) && (
                <TablePagination rowsPerPageOptions={enums.PAGE_ARRAY_LIST} component='div' count={hierarchy.topLevel.length + hierarchy.noLevel.length} rowsPerPage={hierarchyRowsPerPage} page={hierarchyPage} onPageChange={handleHierarchyChangePage} onRowsPerPageChange={handleHierarchyChangeRowsPerPage} />
              )}
            </>
          )}
        </>
      )}
      {mainTab === 'TIME-MATIRIALS' && <TimeMaterials woId={workOrderID} countUpdate={reFetch} woStatus={data.woStatusId} allCount={get(data, 'timeMaterialsCount', 0)} isShowWoDetails={isShowWoDetails} quoteStatus={data.quoteStatusId} isQuote={isQuote} />}
      {mainTab === 'NEW_ISSUES' && <NewIssues viewTempIssue={viewTempIssue} woId={workOrderID} searchString={searchString} isShowWoDetails={isShowWoDetails} />}
      {mainTab === 'LOCATIONS' && (
        <Locations
          rows={rows}
          actionLoader={actionLoader}
          viewAsset={d => handleAction('VIEW', d)}
          woId={workOrderID}
          searchString={searchString}
          data={data}
          handleAddAssetInLocation={handleAddAssetInLocation}
          reFetchLocations={reFetchLocations}
          isAddDisabled={data.woStatusId === enums.woTaskStatus.Complete || IsCompletionInProgress || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED)}
          reFetchCount={reFetch}
          isShowWoDetails={isShowWoDetails}
          isQuote={isQuote}
        />
      )}
      {mainTab === 'ATTACHMENTS' && (
        <>
          <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%' }}>
            <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
            <MinimalButton
              size='small'
              disabled={data.woStatusId === enums.woTaskStatus.Complete || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED) || (isQuote && data.quoteStatusId === enums.QUOTES.STATUS.REJECTED)}
              startIcon={<AddIcon />}
              text='Add Attachment'
              onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
              variant='contained'
              color='primary'
              baseClassName='my-2'
            />
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: isShowWoDetails ? `calc(100vh - 390px)` : `calc(100vh - 290px)` }}>
            <TableComponent loading={loading} columns={attachmentColumns} data={data.workOrderAttachments} />
          </div>
        </>
      )}
      {mainTab === 'ONE_LINE' && <Cluster woId={workOrderID} woType={data !== null ? data.woType : 0} handleAssetNodeClick={handleAssetNodeClick} reload={reload} woStatus={data.woStatusId} />}

      {isQuote && !loading ? (
        data.quoteStatusId === enums.QUOTES.STATUS.OPEN ? (
          <div className='d-flex flex-row-reverse my-2 sticky-bottom-btn'>
            <MinimalButton variant='contained' size='small' text='Send to Customer' onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.SUBMITTED)} baseClassName='mx-1' style={{ background: '#778899', color: '#FFF' }} disabled={data?.woStatusId === enums.woTaskStatus.Complete} />
          </div>
        ) : (
          data.quoteStatusId !== enums.QUOTES.STATUS.ACCEPTED && (
            <div className='d-flex justify-content-between my-2 sticky-bottom-btn'>
              <MinimalButton variant='contained' size='small' text='Revert & Edit' onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.OPEN)} baseClassName='mx-2' style={{ background: '#EFBD40', color: '#FFF' }} disabled={data?.woStatusId === enums.woTaskStatus.Complete} />
              <div className='d-flex align-items-center'>
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Defer'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.DEFERRED)}
                  baseClassName='mx-1'
                  style={{ background: '#929292', color: '#FFF' }}
                  disabled={data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED || data?.woStatusId === enums.woTaskStatus.Complete || data.quoteStatusId === enums.QUOTES.STATUS.REJECTED}
                />
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Reject'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.REJECTED)}
                  baseClassName='mx-1'
                  style={{ background: '#DA3B26', color: '#FFF' }}
                  disabled={data.quoteStatusId === enums.QUOTES.STATUS.REJECTED || data?.woStatusId === enums.woTaskStatus.Complete || data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED}
                />
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Accept'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.ACCEPTED)}
                  baseClassName='mx-1'
                  style={{ background: '#81D653', color: '#FFF' }}
                  disabled={data?.woStatusId === enums.woTaskStatus.Complete || data.quoteStatusId === enums.QUOTES.STATUS.DEFERRED || data.quoteStatusId === enums.QUOTES.STATUS.REJECTED}
                />
              </div>
            </div>
          )
        )
      ) : (
        !loading && (
          <div className='d-flex row-reverse justify-content-end my-2 sticky-bottom-btn'>
            {/* <div className='d-flex align-items-center' style={getEnableStatus() ? { cursor: 'not-allowed', color: 'grey' } : {}}>
              <div style={{ fontWeight: 800, marginRight: '5px', color: getEnableStatus() ? '#00000075' : '#000' }}>Override</div>
              <Checkbox checked={isOverride} disabled={getEnableStatus()} onChange={e => setOverride(e.target.checked)} name='checkedB' color='primary' size='small' style={{ padding: '2px' }} />
            </div> */}
            <MinimalButton text='Complete Workorder' loadingText='Completing...' variant='contained' color='primary' baseClassName='mx-2' onClick={() => setIsCompleteOpen(true)} disabled={checkCompWOEnableStatus()} />
          </div>
        )
      )}

      {isViewOpen && <View isOnboarding={isOnboarding} viewObj={actionObj} open={isViewOpen} onClose={() => setIsViewOpen(false)} onEdit={() => editPmFromView(actionObj)} isEdit={true && !actionEditBtnRef.current?.disabled && !isDisabledEdit} />}
      {isEditOpen && (
        <Edit
          isOnboarding={isOnboarding}
          viewObj={actionObj}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          afterSubmit={aftersubmit}
          classCodeOptions={classCodeOptions}
          workOrderID={workOrderID}
          workOrderNumber={data.manualWoNumber}
          buildingOptions={tempBuildings}
          isQuote={isQuote}
          photosType={{ cameraType: data.irVisualCameraType, imageType: data.irVisualImageType }}
          irImageCount={data.irImageCount}
        />
      )}
      {isAddOpen && (
        <Edit
          isOnboarding={isOnboarding}
          viewObj={{}}
          open={isAddOpen}
          onClose={handleCloseAdd}
          afterSubmit={aftersubmit}
          isNew
          classCodeOptions={classCodeOptions}
          workOrderID={workOrderID}
          workOrderNumber={data.manualWoNumber}
          buildingOptions={tempBuildings}
          fixedLocations={addingAssetLocation}
          photosType={{ cameraType: data.irVisualCameraType, imageType: data.irVisualImageType }}
          isQuote={isQuote}
          irImageCount={data.irImageCount}
        />
      )}
      {isEditWO && <EditWO obj={snakifyKeys(data)} open={isEditWO} onClose={() => setIsEditWO(false)} afterSubmit={aftersubmit} isQuote={isQuote} />}

      <DialogPrompt title='Complete Work Order' text='Are you sure you want to complete Work Order ? Work order lines with Open status would be deleted' actionLoader={woCompLoading} open={isCompleteOpen} ctaText='Complete' action={completeWO} handleClose={() => setIsCompleteOpen(false)} />
      <DialogPrompt title='Remove Asset' text={`Are you sure you want to remove the asset from ${isQuote ? 'Quote' : 'work order'}?`} actionLoader={deleteLoading} open={isDeleteOpen} ctaText='Remove' action={deleteAsset} handleClose={() => setIsDeleteOpen(false)} />
      <DialogPrompt title='Remove Assets' text='Are you sure you want to remove the selected assets from the work order?' actionLoader={statusChangeLoading} open={isDeleteBulkOpen} ctaText='Remove' action={handleBulkDelete} handleClose={() => setIsDeleteBulkOpen(false)} />
      <DialogPrompt title='Delete Attachment' text={`Are you sure you want to remove the attachment from ${isQuote ? 'Quote' : 'work order'}?`} open={isDeleteAttOpen} ctaText='Remove' action={delAttachment} handleClose={() => setDeleteAttOpen(false)} />
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
      {uploadPreviewOpen && <UploadIrPhotos open={uploadPreviewOpen} onClose={closeOnUploadPopUp} workOrderID={workOrderID} manualWoNumber={data.manualWoNumber} cameraType={data.irVisualCameraType} imageType={data.irVisualImageType} />}
      {/* REVIEW MWO LINES */}
      {isReviewOpen && <Review workOrderID={workOrderID} open={isReviewOpen} onClose={() => setIsReviewOpen(false)} data={data.assetDetailsV2} classCodeOptions={classCodeOptions} afterSubmit={aftersubmit} buildingOptions={tempBuildings} />}
      {/* ADD OLD/NEW ASSET */}
      {isAddAssetPopupOpen && (
        <PopupModal open={isAddAssetPopupOpen} onClose={handleAddOldOrNewAssetPopupClose} cta='Add' title='Add Asset' handleSubmit={handleAddOldOrNewAsset}>
          <MinimalButtonGroup label='Select Asset Type' value={addedAssetType} onChange={value => setAddedAssetType(value)} options={addedAssetTypeOptions} w={100} baseStyles={{ marginRight: 0 }} />
        </PopupModal>
      )}
      {isAddExistingAssetOpen && <AddExistingAsset setAddingAssetLocation={setAddingAssetLocation} locations={addingAssetLocation} workOrderID={workOrderID} open={isAddExistingAssetOpen} onClose={() => setIsAddExistingAssetOpen(false)} data={data} afterSubmit={aftersubmit} />}
      {isBulkOperationsOpen && <BulkOperationsTool woId={workOrderID} open={isBulkOperationsOpen} onClose={() => setBulkOperationsOpen(false)} />}
    </div>
  )
}

export default OnBoardingWorkOrder
