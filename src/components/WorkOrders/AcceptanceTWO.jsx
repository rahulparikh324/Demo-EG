import React, { useState, useEffect, useRef, useContext } from 'react'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import _, { chunk, isObject, orderBy, size } from 'lodash'
import viewWorkOrderDetailsById from '../../Services/WorkOrder/viewWorkOrderDetailsById'
import $ from 'jquery'
import AssignTechinican from './AssignTechinican'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import uploadWOAttachment from '../../Services/WorkOrder/uploadWOAttachment'
import mapWOAttachment from '../../Services/WorkOrder/mapWOAttachment'
import deleteWOAttachment from '../../Services/WorkOrder/deleteWOAttachment'
import deleteWOCategory from '../../Services/WorkOrder/deleteWOCategory'
import updateCategoryStatus from '../../Services/WorkOrder/updateCategoryStatus'
import updateWOStatus from '../../Services/WorkOrder/updateWOStatus'
import uploadQuote from '../../Services/WorkOrder/uploadQuote'
import { Toast } from '../../Snackbar/useToast'
import DialogPrompt from '../DialogPrompt'
import { getDateTime, getFormatedDate } from 'helpers/getDateTime'
import EditWO from './EditWO'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import Checkbox from '@material-ui/core/Checkbox'
import CircularProgress from '@material-ui/core/CircularProgress'
import enums from '../../Constants/enums'
import WOCategoryView from './WOCategoryView'
import XLSX from 'xlsx'
import * as yup from 'yup'
import exportPDF from './exportPDF.js'
import GridView from './grid-view'
import getFormJson from 'Services/FormIO/get-form-json'
import TaskList from './view-tasks/task-list'
import URL from 'Constants/apiUrls'
import { AppBar, Box, IconButton, Typography } from '@material-ui/core'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import SearchComponent from 'components/common/search'
import AddAssetClass from 'components/WorkOrders/add-asset-class'
import AssignAsset from 'components/WorkOrders/assign-asset'
import { StatusComponent, LabelVal, Menu, PopupModal, MinimalRadio, DropDownMenu, ToggleButton, ElipsisWithTootip, AssetTypeIcon, MinimalCheckbox } from 'components/common/others'
import { MinimalTextArea, MinimalInput } from 'components/Assets/components'

import { getStatus, AppendRandomValueToS3Url, getQuoteStatus, OverviewIcons, getDuplicateQRs } from 'components/WorkOrders/onboarding/utils'
import { MinimalButton, ActionButton } from 'components/common/buttons'
import { TableComponent } from 'components/common/table-components'
import workorder from 'Services/WorkOrder/common'
import exportWorkOrderPDF from 'Services/WorkOrder/exportWorkOrderPDF'
import Repair from 'components/WorkOrders/maintenance-forms/repair'
import Issue from 'components/WorkOrders/maintenance-forms/Issue'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'
import updateWOCategoryTaskStatus from 'Services/WorkOrder/updateWOCategoryTaskStatus'
import View from 'components/WorkOrders/maintenance-forms/view'
import { camelizeKeys, snakifyKeys } from 'helpers/formatters'
import Edit from 'components/WorkOrders/onboarding/edit'
import useFetchData from 'hooks/fetch-data'
import assetClass from 'Services/WorkOrder/asset-class'
import * as assetFormClass from 'Services/FormIO/asset-class'
import { isEmpty, get } from 'lodash'
import ViewOB from 'components/WorkOrders/onboarding/view'
import AssetWise from 'components/WorkOrders/maintenance-forms/asset-wise'
import CreateNewAsset from 'components/WorkOrders/maintenance-forms/create-new-asset'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import PlayForWorkOutlinedIcon from '@material-ui/icons/PlayForWorkOutlined'
import NewIssues from 'components/WorkOrders/issues'
import LinkFixIssues from 'components/WorkOrders/issues/link-fix-issues'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { history } from 'helpers/history'
import LinkPMs from 'components/preventative-maintenance/work-order/link-pms'
import { CompletionStatus, StatusMetric, StatusMetricButton } from 'components/WorkOrders/components'
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined'
import { bulkExport } from 'components/WorkOrders/spreadsheet/export-bulk'
import { bulkImport } from 'components/WorkOrders/spreadsheet/import-bulk'
import ReviewLines from 'components/WorkOrders/maintenance-forms/review-lines'
import equipments from 'Services/equipments'
import preventativeMaintenance from 'Services/preventative-maintenance'
import AddPM from 'components/preventative-maintenance/work-order/add-pms'
import ViewForm from 'components/preventative-maintenance/forms/view-form'
import EditForm from 'components/preventative-maintenance/forms/edit-form'
import ThermographyForm from 'components/preventative-maintenance/forms/thermography-form'
import UploadIrPhotos from 'components/WorkOrders/onboarding/upload-ir-photos'
import Install from 'components/WorkOrders/maintenance-forms/install'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'
import TimeMaterials from 'components/WorkOrders/time-materials/timeMaterials'
import CloseIcon from '@material-ui/icons/Close'
import SubjectIcon from '@material-ui/icons/Subject'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import TablePagination from '@material-ui/core/TablePagination'

//
import Locations from 'components/WorkOrders/locations'
import locations from 'Services/locations'
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined'
import StatusChangeRadioDropdown from 'components/common/statuschange-radio-dropdown'
import ViewIssue from './maintenance-forms/multi-step-forms/issue/view'
import watchWO from 'Services/WorkOrder/watchWO'
import usePostData from 'hooks/post-data'
import AddIssueLine from './maintenance-forms/multi-step-forms/issue'
import IssueProvider from './maintenance-forms/multi-step-forms/issue/provider'
import Cluster from 'components/WorkOrders/one-line/cluster'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import { quotesType } from 'components/quotes/utils'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'
import asset from 'Services/assets'
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import ReportOutlinedIcon from '@material-ui/icons/ReportOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import { RenderCheckBox } from 'components/WorkOrders/onboarding/utils'
import { handleCompanyAccess } from 'Services/getCompanyAccess'
import { MainContext } from 'components/Main/provider'
import SelectWOAttachments from './SelectWOAttachments'
import { changeActiveSite } from 'components/common/change-active-site'

function AcceptanceTWO({ workOrderID, isQuote = false }) {
  const [woDetails, setWoDetails] = useState({})
  const [categories, setCategories] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isViewLineOpen, setIsViewLineOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [reload, setReload] = useState(0)
  const [anchorObj, setAnchorObj] = useState({})
  const [delObj, setDelObj] = useState({})
  const [assignAssetOpen, setIsAssignAssetOpen] = useState(false)
  const [assignTechOpen, setIsAssignTechOpen] = useState(false)
  const [isDescLarge, setIsDescLarge] = useState(false)
  const [isReadMore, setReadMore] = useState(false)
  const [isDeleteAttOpen, setDeleteAttOpen] = useState(false)
  const [isGridViewOpen, setGridViewOpen] = useState(false)
  const uploadInputRef = useRef(null)
  const uploadQuoteRef = useRef(null)
  const uploadBulkRef = useRef(null)
  const actionEditBtnRef = useRef(false)
  const [isOverride, setOverride] = useState(false)
  const [isCompleteWOEnable, setIsCompleteWOEnable] = useState(false)
  const [woCompLoading, setWOCompLoading] = useState(false)
  const [delCatOpen, setDelCatOpen] = useState(false)
  const [holdCatOpen, setHoldCatOpen] = useState(false)
  const [editWOOpen, setEditWOOpen] = useState(false)
  const [woDetailAnchorEl, setWODetailAnchorEl] = useState(null)
  const [isShowAllViewTask, setIsShowAllViewTask] = useState(false)
  const [fetchingForm, setFetchingForm] = useState(false)
  const [editActionLoader, setEditActionLoader] = useState(false)
  const [error, setError] = useState({})
  const { color, label } = getStatus(woDetails.wo_status_id)
  const { color: quoteColor, label: quoteLabel } = getQuoteStatus(woDetails.quote_status_id)
  const isAcceptanceWO = woDetails.wo_type === enums.woType.Acceptance
  const [exportLoading, setExportLoading] = useState(false)
  const [viewAllTaskLoading, setViewAllTaskLoading] = useState(false)
  const [masterForms, setMasterForms] = useState([])
  const [searchString, setSearchString] = useState('')
  const [rows, setRows] = useState([])
  const [isAddNewLineOpen, setAddNewLineOpen] = useState(false)
  const [selectedInspectionType, setSelectedInspectionType] = useState(enums.MWO_INSPECTION_TYPES.INSPECTION)
  const inspectionTypes = [
    { label: 'NETA Inspection', value: enums.MWO_INSPECTION_TYPES.INSPECTION },
    { label: 'Install / Add', value: enums.MWO_INSPECTION_TYPES.INSTALL },
    { label: 'Repair', value: enums.MWO_INSPECTION_TYPES.REPAIR, isHidden: true },
    { label: 'Replace', value: enums.MWO_INSPECTION_TYPES.REPLACE, isHidden: true },
    { label: 'General Issue Resolution', value: enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK, isHidden: true },
    { label: 'Issue', value: enums.MWO_INSPECTION_TYPES.ISSUE },
    { label: 'Preventative Maintenance', value: enums.MWO_INSPECTION_TYPES.PM },
  ]
  const [isRepairOpen, setRepairOpen] = useState(false)
  const [isIssueOpen, setIssueOpen] = useState(false)
  const [isReplaceOpen, setReplaceOpen] = useState(false)
  const [isTroblecallCheckOpen, setTroblecallCheckOpen] = useState(false)
  const [isObOpen, setObOpen] = useState(false)
  const [isViewRepairOpen, setIsViewRepairOpen] = useState(false)
  const [isViewRepairObOpen, setIsViewRepairObOpen] = useState(false)
  const [editWorkOrderLine, setEditWorkOrderLine] = useState({ open: false, isRepair: false, isInspection: false, isTroubleCall: false, isOnboarding: false })
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [inspectionTypeIsEdit, setIinspectionTypeIsEdit] = useState(false)
  const [selectedTab, setTab] = useState(get(history, 'location.state.tab', 'DEFAULT') || 'DEFAULT')
  const [isCreateNewMwAssetOpen, setCreateNewMwAssetOpen] = useState(false)
  //
  const [isUpdateGroupOpen, setUpdateGroupOpen] = useState(false)
  const [updateGroupObj, setUpdateGroupObj] = useState({})
  const [updateGroupString, setUpdateGroupString] = useState('')
  const [isUpdateGroupLoading, setUpdateGroupLoading] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [isReviewDisable, setIsReviewDisable] = useState(false)
  const [itHaveMoreType, setItHaveMoreType] = useState(false)

  const [linkFixIssueOpen, setLinkFixIssueOpen] = useState(false)
  const [issueLoading, setIssueLoading] = useState('')

  const [isSpreadSheetOpen, setSpreadSheetOpen] = useState(false)
  const [isLinkPmOpen, setLinkPmOpen] = useState(false)
  const [isCompleteOpen, setIsCompleteOpen] = useState(false)

  const [completionProcessStatus, setCompletionProcessStatus] = useState(null)
  const [bulkUploadProcessStatus, setBulkUploadProcessStatus] = useState(null)
  const [isFailedPopUpOpen, setFailedPopUpOpen] = useState(false)
  const [failedAssets, setFailedAssets] = useState([])
  const IsCompletionInProgress = completionProcessStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS
  const [isReviewLinesOpen, setReviewLinesOpen] = useState(false)
  const [originIssueOpened, setOriginIssueOpened] = useState(false)

  const [isAddPmOpen, setAddPmOpen] = useState(false)
  const [isViewPmOpen, setViewPmOpen] = useState(false)
  const [isEditPmOpen, setEditPmOpen] = useState(false)
  const [isViewThermographyOpen, setViewThermographyOpen] = useState(false)
  const [isEditThermographyOpen, setEditThermographyOpen] = useState(false)
  const [uploadPreviewOpen, setUploadPreviewOpen] = useState(false)
  const uploadIrPhotoRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [anyPmList, setAnyPmList] = useState([])
  const [currentPmIndex, setCurrentPmIndex] = useState(0)
  const [showSkipInPm, setShowSkipInPm] = useState(false)
  const [subTab, setSubTab] = useState('DEFAULT')
  const [isShowMore, setShowMore] = useState(false)
  const [tempBuildings, setTempBuildings] = useState()
  const userInfo = JSON.parse(localStorage.getItem('loginData'))
  const [isEditIssue, setIsEditIssue] = useState(false)
  const [locationData, setLocationData] = useState({
    building: '',
    floor: '',
    room: '',
    section: '',
  })
  const [editPMLineObj, setEditPMLineObj] = useState({})
  const [isShowWoDetails, setShowWoDetails] = useState(true)
  const [isShowMoreLead, setShowMoreLead] = useState(false)

  const [currentSelectedStatus, setCurrentSelectedStatus] = useState(0)
  const [markedRows, setMarkedRows] = useState([])
  const [isMarkedAll, setIsMarkedAll] = useState(false)
  const [isDeleteBulkOpen, setIsDeleteBulkOpen] = useState(false)
  const [isChunkFail, setChunkFail] = useState(false)
  const [isStatusChunkFail, setStatusChunkFail] = useState(false)

  const [visibleRowsData, setVisibleRowsData] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(enums.DEFAULT_PAGE_SIZE)
  const [pageLoading, setPageLoading] = useState(false)
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const [isAllSelected, setAllSelected] = useState(false)
  const [errorCount, setErrorCount] = useState([])
  const [errorCountFlag, setErrorCountFlag] = useState(false)

  const context = useContext(MainContext)

  const isFirstRender = useRef(true)
  const uploadPMsRef = useRef()
  //
  const sortClassCodes = d => {
    const list = _.get(d, 'data', {})
    list.forEach(d => {
      d.id = d.value
      d.value = d.className
    })
    const sortedList = _.orderBy(list, [d => d.label && d.label.toLowerCase()], 'asc')
    return sortedList
  }
  const { data: classCodeOptions } = useFetchData({ fetch: assetClass.getAllAssetClassCodes, formatter: d => sortClassCodes(d) })
  const payload = { pageSize: 0, pageIndex: 0, siteId: getApplicationStorageItem('siteId'), searchString: '', equipmentNumber: [], manufacturer: [], modelNumber: [], calibrationStatus: [] }
  const { data: equipmentListOptions } = useFetchData({ fetch: equipments.getAllEquipmentList, payload, formatter: d => _.get(d, 'data.list', []) })
  const setChildParentList = arr => {
    const result = []
    arr.forEach(item => {
      const parentIndex = result.findIndex(parent => (!isEmpty(parent.asset_id) && parent.asset_id === item.toplevelcomponent_asset_id) || (!isEmpty(parent.woonboardingassets_id) && parent.woonboardingassets_id === item.toplevelcomponent_asset_id))
      if (parentIndex !== -1) {
        result.splice(parentIndex + 1, 0, item)
      } else {
        result.push(item)
      }
    })

    return result
  }
  //
  useEffect(() => {
    ;(async () => {
      $('#pageLoading').show()
      try {
        const details = await viewWorkOrderDetailsById(workOrderID)
        // console.log(details.data)
        setWoDetails(details.data)
        // handleCompanyAccess({ companyId: get(details, 'data.client_company_id', null), siteId: get(details, 'data.site_id', null), siteName: get(details, 'data.site_name', ''), companyName: get(details, 'data.client_company_name', '') }, context, isQuote ? 'Quote' : 'Work Order')
        var arrStatus = []
        if (details.data.wo_type === enums.woType.Acceptance) {
          const rows = _.orderBy([..._.get(details, 'data.form_category_list', [])], [d => d.group_string && d.group_string.toLowerCase()], ['asc']).map(d => ({ ...d, status: d.status_id }))
          const isReviewVisible = _.isEmpty(rows) || !rows.some(row => row.status_id === enums.woTaskStatus.ReadyForReview)
          setIsReviewDisable(isReviewVisible)
          setCategories(rows)
          setRows(rows)
          arrStatus = rows
        } else if (details.data.wo_type === enums.woType.Maintainance) {
          const _tasks = _.get(details, 'data.wo_all_tasks', []).map(d => ({ ...d, status: d.status_id }))
          const ob = _.get(details, 'data.mwo_ob_assets_v2', []) || []
          const mwoba = ob.map(d => ({ ...d, wo_inspectionsTemplateFormIOAssignment_id: d.woonboardingassets_id, assigned_asset_name: d.asset_name, status_id: d.status }))
          arrStatus = [..._tasks, ...mwoba]
          if (arrStatus.length > 0) {
            const itHaveMoreType = arrStatus.filter(d => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(d.status_id) && d.inspection_type === enums.MWO_INSPECTION_TYPES.INSPECTION)
            setItHaveMoreType(_.isEmpty(itHaveMoreType))
          } else {
            setItHaveMoreType(true)
          }
          const isReviewVisible = _.isEmpty(arrStatus) || !arrStatus.some(row => row.status_id === enums.woTaskStatus.ReadyForReview) || details.data.wo_status_id === enums.woTaskStatus.Complete || IsCompletionInProgress
          setIsReviewDisable(isReviewVisible)
          const rowsData = [..._tasks, ...mwoba]
          const sortedRows = orderBy(
            rowsData,
            [
              d => (d.building && d.building.toLowerCase()) || '\uffff', // '\uffff' is a Unicode character that comes after most characters
              d => (d.floor && d.floor.toLowerCase()) || '\uffff',
              d => (d.room && d.room.toLowerCase()) || '\uffff',
              d => (d.section && d.section.toLowerCase()) || '\uffff',
              d => (d.asset_name && d.asset_name.toLowerCase()) || '\uffff',
            ],
            ['asc', 'asc', 'asc', 'asc', 'asc']
          )
          const rowList = setChildParentList(sortedRows)
          setTasks(rowList)
          setRows(rowList)
          //setTasks([..._tasks, ...mwoba])
          //setRows([..._tasks, ...mwoba])
          checkOriginWoLineId([..._tasks, ...mwoba])
          if (!isEmpty(mwoba)) {
            const openPMForms = mwoba.filter(d => d.asset_pm_id?.includes(get(history, 'location.WODetails', null)))
            if (!isEmpty(openPMForms)) handleSubAction('VIEW', openPMForms[0])
          }
        }
        if (details.data.description && details.data.description.length > 25) setIsDescLarge(true)
        const statusArr = arrStatus.map(e => e.status_id)
        const mappedStatus = [...new Set(statusArr)].map(d => [15, 75].includes(d))
        if ([...new Set(mappedStatus)].length === 1 && [...new Set(mappedStatus)][0]) setIsCompleteWOEnable(true)
        else setIsCompleteWOEnable(false)

        if (get(details.data, 'site_id', null)) {
          const siteData = changeActiveSite(get(details.data, 'site_id', null))
          context.setLoginSiteData(prevState => ({
            ...prevState,
            siteName: siteData.site_name,
            activeSiteId: siteData.site_id,
            siteId: siteData.site_id,
            activeClientCompanyId: siteData.client_company_id,
            clientCompanyName: siteData.client_company_name,
          }))
          localStorage.setItem('selectedSiteId', get(details.data, 'site_id', null))
        }
        setLoading(false)
      } catch (error) {
        console.log(error)
        setCategories([])
        setLoading(false)
      }
      $('#pageLoading').hide()
    })()
  }, [reload])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (visibleRowsData.every(d => markedRows.includes(d.woonboardingassets_id))) {
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
  }, [rows, page, rowsPerPage])

  const handleAction = async (type, obj, e) => {
    if (type === 'NEW' && isAcceptanceWO) setIsCreateOpen(true)
    if (type === 'NEW' && !isAcceptanceWO) setAddNewLineOpen(true)
    if (type === 'EXPORT') exportPDF({ wo: obj, woDetails })
    if (type === 'DELETE') {
      if (woDetails.wo_status_id === 15) return
      setDelObj(obj)
      setDeleteAttOpen(true)
    }
    if (type === 'EDIT') {
      setWODetailAnchorEl(null)
      setEditWOOpen(true)
    }
  }
  const getLineType = type => {
    return {
      isRepair: type === enums.MWO_INSPECTION_TYPES.REPAIR,
      isInspection: type === enums.MWO_INSPECTION_TYPES.INSPECTION,
      isReplace: type === enums.MWO_INSPECTION_TYPES.REPLACE,
      isTroubleCall: type === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK,
      isOnboarding: type === enums.MWO_INSPECTION_TYPES.INSTALL,
    }
  }
  const handleDeleteAssetLine = obj => {
    setAnchorObj(obj)
    setDelCatOpen(true)
  }
  const editInspectionForm = () => {
    setIinspectionTypeIsEdit(true)
    setIsViewOpen(true)
  }
  const viewInspectionForm = () => {
    setIinspectionTypeIsEdit(false)
    setIsViewOpen(true)
  }
  const handleSubAction = async (type, obj) => {
    if (type === 'DEL') return handleDeleteAssetLine(obj)
    if (type === 'LINK_PM') return linkPM(obj)
    else if (['ACCEPT_MW', 'HOLD_MW', 'REVERT_MW'].includes(type)) return updateAssetStatusAction({ wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, woonboardingassetsId: obj.wo_inspectionsTemplateFormIOAssignment_id, status: type }, obj)
    else if (type === 'REJECT_MW') return rejectAssetAction({ woonboardingassetsId: obj.woonboardingassets_id, wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id }, obj)
    else if (type === 'LINK_ISSUE') return linkFixIssue(obj)
    else {
      const isRepairReplace = [enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK, enums.MWO_INSPECTION_TYPES.INSTALL].includes(obj.inspection_type)
      type === 'EDIT_MW' ? setEditActionLoader(obj.wo_inspectionsTemplateFormIOAssignment_id) : setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const isEditIssueLine = !isNaN(obj.inspection_type) && [enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK].includes(obj.inspection_type) ? true : false
      const form_data = isAcceptanceWO ? await fetchFormJSON(obj) : isEditIssueLine ? null : isRepairReplace ? await onBoardingWorkorder.getAssetDetails_V2({ id: obj.woonboardingassets_id }) : obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM ? await fetchPmFormJSON(obj) : await fetchFormJSON(obj)
      const anchor = isAcceptanceWO || obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSPECTION ? { ...obj, form_data } : obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL ? { ...obj, ...form_data.data } : { ...obj, form_data }
      setAnchorObj(anchor)
      setFetchingForm(false)
      setEditActionLoader(false)
      if (type === 'ASSET') setIsAssignAssetOpen(true)
      if (type === 'TECH') setIsAssignTechOpen(true)
      if (type === 'GRID') setGridViewOpen(true)
      if (type === 'SPREADSHEET') setSpreadSheetOpen(true)
      if (type === 'VIEWLINE') {
        setIsViewLineOpen(true)
        setIsShowAllViewTask(false)
      }
      if (type === 'HOLD') setHoldCatOpen(true)
      //new mwo actions
      const editObjx = getLineType(obj.inspection_type)
      if (type === 'VIEW') {
        setLocationData({
          building: obj.building,
          floor: obj.floor,
          room: obj.room,
          section: obj.section,
        })
        if (isRepairReplace) {
          if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL) {
            setIsViewRepairObOpen(true)
          } else {
            setIsViewRepairOpen(true)
          }
        } else if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM) {
          if (!_.isEmpty(form_data)) {
            setShowSkipInPm(obj.can_be_skipped)
            setAnchorObj({ ...form_data, obj })
            obj.pm_inspection_type_id === 1 ? setViewThermographyOpen(true) : setViewPmOpen(true)
          }
        } else viewInspectionForm()
      }
      if (type === 'EDIT_MW') {
        setLocationData({
          building: obj.building,
          floor: obj.floor,
          room: obj.room,
          section: obj.section,
        })
        if (!isNaN(obj.inspection_type) && [enums.MWO_INSPECTION_TYPES.REPAIR, enums.MWO_INSPECTION_TYPES.REPLACE, enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK].includes(obj.inspection_type)) {
          setIsEditIssue(true)
        } else if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL) setEditWorkOrderLine({ ...editObjx, open: true })
        else if (obj.inspection_type === enums.MWO_INSPECTION_TYPES.PM) {
          if (!_.isEmpty(form_data)) {
            setShowSkipInPm(obj.can_be_skipped)
            setEditPMLineObj({ ...form_data, obj: { ...obj, manual_wo_number: woDetails.manual_wo_number } })
            obj.pm_inspection_type_id === 1 ? setEditThermographyOpen(true) : setEditPmOpen(true)
          }
        } else editInspectionForm()
      }
    }
  }
  const fetchFormJSON = async obj => {
    try {
      // setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const res = await getFormJson({ form_id: obj.form_id, asset_form_id: null })
      setFetchingForm(false)
      if (res.success) return res.data.asset_form_data
    } catch (error) {
      console.log(error)
      // setFetchingForm(false)
    }
  }
  const fetchPmFormJSON = async obj => {
    try {
      // setFetchingForm(obj.wo_inspectionsTemplateFormIOAssignment_id)
      const res = await preventativeMaintenance.forms.getLine({ asset_pm_id: _.get(obj, 'asset_pm_id', null), temp_asset_pm_id: _.get(obj, 'temp_asset_pm_id', null), woonboardingassets_id: obj.woonboardingassets_id })
      if (obj.pm_inspection_type_id === 1) {
        const submissionData = JSON.parse(_.get(res.data, 'pmFormOutputData', '{}'))
        return { submissionData }
      } else if (res.success > 0) {
        const data = JSON.parse(_.get(res.data, 'formJson', '{}'))
        const submissionData = JSON.parse(_.get(res.data, 'pmFormOutputData', '{}'))
        return { data, submissionData }
      } else Toast.error(res.message || 'Error fetching info. Please try again !')
    } catch (error) {
      console.log(error)
      Toast.error('Error fetching info. Please try again !')
      // setFetchingForm(false)
    }
  }
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
  const delCategory = async () => {
    setDelCatOpen(false)
    $('#pageLoading').show()
    const isInspection = enums.MWO_INSPECTION_TYPES.INSPECTION === anchorObj.inspection_type
    try {
      const res = isAcceptanceWO
        ? await deleteWOCategory({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id })
        : !isInspection
        ? await onBoardingWorkorder.deleteAsset({ woonboardingassets_id: anchorObj.woonboardingassets_id })
        : await deleteWOCategory({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id })
      if (res.success > 0) Toast.success(`${isAcceptanceWO ? 'Class' : 'Line'} Removed Successfully !`)
      else {
        const msg = isEmpty(res.message) ? `Error removing ${isAcceptanceWO ? 'class' : 'Line'}. Please try again !` : res.message
        Toast.error(msg)
      }
    } catch (error) {
      Toast.error(`Error removing ${isAcceptanceWO ? 'class' : 'Line'}. Please try again !`)
    }
    setReload(p => p + 1)
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
    setReload(p => p + 1)
  }
  const checkCompWOEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (woDetails.wo_status_id === 15) return true
    else if (isOverride || isCompleteWOEnable) return false
    else return true
  }
  const completeWO = async () => {
    let isDataNotExist = false
    if (woDetails.wo_type === enums.woType.Acceptance) {
      isDataNotExist = (categories != null && categories.length) > 0 ? false : true
    } else {
      isDataNotExist = tasks != null && tasks.length > 0 ? false : true
    }

    if (isDataNotExist && woDetails.wo_type === enums.woType.Acceptance) {
      Toast.error('Category should not be blank!')
    } else if (isDataNotExist && woDetails.wo_type === enums.woType.Maintainance) {
      Toast.error('Tasks should not be blank!')
    } else {
      setWOCompLoading(true)
      $('#pageLoading').show()
      try {
        const res = await updateWOStatus({ wo_id: woDetails.wo_id, status: 15 })
        if (res.success > 0) {
          Toast.success('Workorder completion started !')
          setCompletionProcessStatus(enums.WO_COMPLETION_STATUS.IN_PROGRESS)
        } else Toast.error(res.message)
      } catch (error) {
        Toast.error('Error completing workorder. Please try again !')
      }
      setWOCompLoading(false)
      setIsCompleteOpen(false)
      setReload(p => p + 1)
      checkCompletionStatus()
    }
  }
  const delAttachment = async () => {
    setDeleteAttOpen(false)
    $('#pageLoading').show()
    try {
      const res = await deleteWOAttachment({ wo_attachment_id: delObj.wo_attachment_id })
      if (res.success > 0) Toast.success('Attachment Removed Successfully !')
      else Toast.error('Error removing attachment. Please try again !')
    } catch (error) {
      Toast.error('Error removing attachment. Please try again !')
    }
    setReload(p => p + 1)
  }
  const holdCategory = async () => {
    setHoldCatOpen(false)
    $('#pageLoading').show()
    try {
      const res = await updateCategoryStatus({ wo_inspectionsTemplateFormIOAssignment_id: anchorObj.wo_inspectionsTemplateFormIOAssignment_id, status: 69 })
      if (res.success > 0) Toast.success(`${isAcceptanceWO ? 'class' : 'asset'} Put to Hold Successfully !`)
      else Toast.error(`Error putting hold ${isAcceptanceWO ? 'class' : 'asset'}. Please try again !`)
    } catch (error) {
      Toast.error(`Error putting hold ${isAcceptanceWO ? 'class' : 'asset'}. Please try again !`)
    }
    setReload(p => p + 1)
  }
  const closeViewLine = () => {
    setIsViewLineOpen(false)
    setReload(p => p + 1)
    setIsShowAllViewTask(false)
  }
  const closeReviewLine = () => {
    setIsReviewOpen(false)
    setReload(p => p + 1)
    setIsShowAllViewTask(false)
  }
  const showAllViewTask = async type => {
    try {
      setViewAllTaskLoading(true)
      const { data } = await exportWorkOrderPDF(workOrderID)
      setMasterForms(_.get(data, 'master_forms', []))
      setViewAllTaskLoading(false)
    } catch (error) {}
    setAnchorObj(woDetails)
    setWODetailAnchorEl(null)
    setIsShowAllViewTask(true)
    type === 'View' ? setIsViewLineOpen(true) : setIsReviewOpen(true)
    // setIsViewLineOpen(true)
  }
  const closeView = () => {
    setIsViewOpen(false)
    setReload(p => p + 1)
  }
  const handleUploadQuote = () => {
    setError('')
    uploadQuoteRef.current && uploadQuoteRef.current.click()
  }
  const addQuote = e => {
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
        validateSheet(data)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }
  const makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))
  const parseAsString = val => (!_.isEmpty(val) && val !== 'undefined' ? `${val}`.trim() : null)
  const parseAsEmptyString = val => (!_.isEmpty(val) && val !== 'undefined' ? `${val}`.trim() : '')

  const validateSheet = async data => {
    const schema = yup.array().of(
      yup.object().shape({
        location: yup.string().required('Location is required'),
        identification: yup.string().required('Equipment Identification is required'),
        //type: yup.string().required('Equipment Type is required'),
        asset_class_code: yup.string().required('Asset Class Code is required'),
      })
    )
    const payload = data.map(d => ({
      location: parseAsEmptyString(d['Zone (location)']),
      identification: parseAsEmptyString(d['Equipment Identification']),
      //type: parseAsEmptyString(d['Equipment Type']) || parseAsEmptyString(d['Type']),
      asset_class_code: parseAsEmptyString(d['Asset Class Code']),
      building: parseAsString(`${d['Building']}`),
      floor: parseAsString(`${d['Floor']}`),
      room: parseAsString(`${d['Room']}`),
      section: parseAsString(`${d['Section']}`),
      note: parseAsString(d['Note']),
    }))
    try {
      await schema.validate(payload, { abortEarly: false })
      const payload2 = makeUniqueArray(payload)
      const unqiFormNType = _.uniqBy(payload2, v => v.asset_class_code).map(({ asset_class_code }) => ({ asset_class_code }))
      const categoryList = []
      unqiFormNType.forEach(tf => {
        const l = payload2.filter(d => d.asset_class_code === tf.asset_class_code)
        categoryList.push({
          //category_type: tf.type,
          asset_class_code: tf.asset_class_code,
          category_task_list: l.map(({ identification, location, floor, room, building, section, note }) => ({ identification, location, floor, room, building, section, note })),
        })
      })
      // console.log(categoryList)
      uploadQuoteData({ wo_id: workOrderID, category_list: categoryList })
      // setError('')
    } catch (error) {
      const lineNo = Number(error.inner[0].path.split('.')[0].match(/\[(.*?)\]/)[1])
      setError(`${error.inner[0].message} on Line [${lineNo + 2}]`)
    }
  }
  const uploadQuoteData = async data => {
    if (isEmpty(data.category_list)) {
      setError('No Data Found')
    } else {
      try {
        const res = await uploadQuote(data)
        if (res.success > 0) Toast.success(`Quote uploaded Successfully !`)
        else Toast.error(res.message)
        setError('')
      } catch (error) {
        Toast.error(`Error uploading Quote. Please try again !`)
        setError('')
      }
      setReload(p => p + 1)
    }
  }
  const getEnableStatus = () => {
    if (woCompLoading) return true
    if (IsCompletionInProgress) return true
    else if (woDetails.wo_status_id === 15 || woDetails.wo_status_id === 75) return true
    else if (isAcceptanceWO && _.isEmpty(categories)) return true
    else if (!isAcceptanceWO && _.isEmpty(tasks)) return true
    else return false
  }
  const exportAsset = async () => {
    try {
      $('#pageLoading').show()
      setExportLoading(true)
      const res = await workorder.exportAssets({ wo_id: workOrderID })
      const list = _.get(res, 'data.assetList', [])
      setExportLoading(false)
      if (_.isEmpty(list)) {
        $('#pageLoading').hide()
        return Toast.error(`No completed assets found !`)
      }
      const excelData = []
      list.forEach(asset => excelData.push({ 'Asset Name': asset.formRetrivedAssetName, 'Inspection Date': getFormatedDate(asset.intialFormFilledDate, true) }))
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)
      XLSX.utils.book_append_sheet(wb, ws, 'Assets')
      XLSX.writeFile(wb, `${woDetails.manual_wo_number}.xlsx`)
      $('#pageLoading').hide()
    } catch (error) {
      $('#pageLoading').hide()
      setExportLoading(false)
      Toast.error(`Error exporting Asset. Please try again !`)
    }
  }
  const renderDescription = () => {
    if (_.isEmpty(woDetails)) return
    return (
      <>
        <div style={{ wordBreak: 'break-word' }}>
          {woDetails.description && woDetails.description.slice(0, 120)}
          {!isReadMore && woDetails.description.length > 120 && <span>...</span>}
          {isReadMore && woDetails.description.slice(120)}
        </div>
        {woDetails.description.length > 156 && (
          <button className='readmore-button' onClick={() => setReadMore(!isReadMore)} style={{ color: '#778899' }}>
            {!isReadMore ? 'Read More' : 'Read less'}
          </button>
        )}
      </>
    )
  }
  //
  const createNewLine = () => {
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.INSPECTION) setIsCreateOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.REPAIR) setRepairOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.ISSUE) setIssueOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.REPLACE) setReplaceOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.TROUBLE_CALL_CHECK) setTroblecallCheckOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.INSTALL) setObOpen(true)
    if (selectedInspectionType === enums.MWO_INSPECTION_TYPES.PM) setAddPmOpen(true)
    setAddNewLineOpen(false)
  }
  const updateAssetStatusAction = async (payload, obj) => {
    const status = { ACCEPT_MW: enums.woTaskStatus.Complete, HOLD_MW: enums.woTaskStatus.Hold, REVERT_MW: enums.woTaskStatus.ReadyForReview }
    const isRepairReplace = enums.MWO_INSPECTION_TYPES.INSPECTION !== obj.inspection_type
    payload.status = status[payload.status]
    const req = isRepairReplace ? snakifyKeys(payload) : { wOcategorytoTaskMapping_id: obj.wOcategorytoTaskMapping_id, status: payload.status }
    setFetchingForm(payload.woonboardingassetsId)
    try {
      const res = isRepairReplace ? await onBoardingWorkorder.updateAssetStatus(req) : await updateWOCategoryTaskStatus(req)
      if (res.success > 0) Toast.success(`Line Status Updated Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error updating status. Please try again !`)
    }
    setFetchingForm('')
    setReload(p => p + 1)
  }
  const rejectAssetAction = (obj, anchor) => {
    setIsRejectOpen(true)
    setAnchorObj({ ...obj, ...anchor })
    return
  }
  const closeRejectReasonModal = () => {
    setReason('')
    setIsRejectOpen(false)
  }
  const rejectAsset = async () => {
    const isRepairReplace = enums.MWO_INSPECTION_TYPES.INSPECTION !== anchorObj.inspection_type
    const payload = isRepairReplace ? { woonboardingassets_id: anchorObj.woonboardingassets_id, task_rejected_notes: reason, status: enums.woTaskStatus.Reject } : { wOcategorytoTaskMapping_id: anchorObj.wOcategorytoTaskMapping_id, task_rejected_notes: reason, status: enums.woTaskStatus.Reject }
    setRejectLoading(true)
    try {
      const res = isRepairReplace ? await onBoardingWorkorder.updateAssetStatus(payload) : await updateWOCategoryTaskStatus(payload)
      if (res.success > 0) Toast.success(`Line Rejected Successfully !`)
      else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error rejecting line. Please try again !`)
    }
    setRejectLoading(false)
    setIsRejectOpen(false)
    setReload(p => p + 1)
    setReason('')
  }

  const changeWatchingStatusSuccess = () => {
    setReload(p => p + 1)
  }

  const { mutate: changeWatchingStatus } = usePostData({ executer: watchWO, postSuccess: changeWatchingStatusSuccess, message: { success: 'WorkOrder Watching Status Change Successfully!', error: 'Something Went Wrong !' } })
  const handleWaching = () => changeWatchingStatus({ ref_id: workOrderID, user_id: get(userInfo, 'uuid', ''), is_deleted: woDetails.is_watcher ? true : false })

  const mainMenuOptions = [
    { id: 1, name: 'View', action: d => showAllViewTask('View'), disabled: () => _.isEmpty(categories) },
    {
      id: 2,
      name: 'Edit',
      action: d => handleAction('EDIT'),
      disabled: () =>
        IsCompletionInProgress ||
        woDetails.wo_status_id === enums.woTaskStatus.Complete ||
        woDetails.wo_status_id === enums.woTaskStatus.Submitted ||
        (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) ||
        (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED) ||
        (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED),
    },
    { id: 3, name: 'Review', action: d => (isAcceptanceWO ? showAllViewTask('Review') : reviewMaintenanceLines()), disabled: () => isReviewDisable, isHide: isQuote },
    { id: 4, name: !woDetails.is_watcher ? 'Start Watch' : 'Stop Watch', action: handleWaching, disabled: () => IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED), isHide: isQuote },
  ]
  const acceptanceMenuOptions = [
    { id: 1, name: 'View Grid', action: d => handleSubAction('GRID', d) },
    {
      id: 2,
      name: 'Delete',
      action: d => handleSubAction('DEL', d),
      color: '#FF0000',
      disabled: d => IsCompletionInProgress || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
    },
  ]
  const acceptanceColumns = [
    {
      name: 'Group',
      render: d => {
        return (
          <div style={[enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(woDetails.wo_status_id) ? { pointerEvents: 'none' } : { pointerEvents: 'all' }} className='d-flex align-items-center group-name-parent'>
            <div className='mr-2'>{!_.isEmpty(d.group_string) ? d.group_string : 'NA'}</div>
            <div className='group-name-parent'>
              <ActionButton
                action={e => {
                  e.stopPropagation()
                  openUpdateGroup(d)
                }}
                icon={<EditOutlinedIcon fontSize='small' />}
                tooltip='EDIT GROUP'
              />
            </div>
          </div>
        )
      },
    },
    { name: 'Asset Class', accessor: 'asset_class_name' },
    { name: 'Form Name', accessor: 'form_name' },
    { name: 'WP', accessor: 'wp' },
    { name: 'Progress', render: d => `${d.progress_completed}/${d.progress_total}` },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status_id)
        return <StatusComponent color={color} label={label} size='small' />
      },
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <Menu options={acceptanceMenuOptions} data={d} loading={fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id} width={165} />
        </div>
      ),
    },
  ]
  const downloadSample = () => {
    const link = document.createElement('a')
    link.href = AppendRandomValueToS3Url(URL.sampleAcceptanceQuote)
    link.click()
  }
  const bulkUpload = e => {
    $('#pageLoading').show()
    try {
      e.preventDefault()
      if (!e.target.files[0]) return
      const reader = new FileReader()
      const file = e.target.files[0]
      reader.onload = async d => {
        const extension = file.name.split('.').slice(-1).pop()
        if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) {
          setError(enums.errorMessages.error_msg_file_format)
          $('#pageLoading').hide()
          return
        } else {
          setError('')
          const binaryStr = d.target.result
          const wb = XLSX.read(binaryStr, { type: 'binary' })
          const res = await bulkImport(wb, camelizeKeys(woDetails))
          console.log('RES', res)
          $('#pageLoading').hide()
          if (!res.success) Toast.error(res.data || 'Upload data failed !')
          else processBulkUploadData(res.data)
        }
      }
      reader.readAsBinaryString(file)
      e.target.value = null
    } catch (error) {
      $('#pageLoading').hide()
      console.log(error)
      Toast.error('Upload data failed !')
    }
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
        .filter(s => s.Status.toLowerCase() === 'open')
        .map(d => ({
          assetPmId: get(d, 'PM Item ID', ''),
        }))
        .filter(val => val.assetPmId !== '')
      uploadPmWoLine(payload)
    } catch (error) {
      Toast.error(`Error reading file !`)
    }
  }

  const WoLineSuccess = () => {
    setReload(p => p + 1)
  }

  const { loading: uploadPMsLoading, mutate: uploadWOLine } = usePostData({ executer: preventativeMaintenance.asset.bulkCreateWOline, postSuccess: WoLineSuccess, message: { success: 'PMs WoLine Created Successfully!', error: 'Something went wrong' } })
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

  useEffect(() => {
    if (woDetails.workOrderAttachments) {
      if (woDetails.workOrderAttachments.every(d => selected.includes(d?.wo_attachment_id))) {
        setAllSelected(true)
      } else {
        setAllSelected(false)
      }
    }
  }, [selected, woDetails.workOrderAttachments])

  const generateMaintenanceWOReport = async e => {
    if (woDetails.workOrderAttachments) {
      const pdfItems = woDetails.workOrderAttachments.filter(item => item.user_uploaded_name?.endsWith('.pdf') || item.filename?.endsWith('.pdf')).map(item => item.filename)
      if (isEmpty(pdfItems)) {
        callGenerateReportApi(pdfItems)
      } else {
        setIsAttachmentsOpen(true)
      }
    } else {
      callGenerateReportApi([])
    }
  }

  const selectAndDeSelectAllAttachments = () => {
    const listIds = new Set(woDetails.workOrderAttachments.map(item => item.wo_attachment_id))
    if (!isAllSelected) {
      setSelected(prevSelected => {
        const prevSelectedSet = new Set(prevSelected)
        listIds.forEach(id => prevSelectedSet.add(id))
        return Array.from(prevSelectedSet)
      })
    } else {
      setSelected(prevSelected => prevSelected.filter(id => !listIds.has(id)))
    }
    setAllSelected(prev => !prev)
  }

  const handleCheckBoxChangeAttachments = list => {
    let updatedMarkedRows

    if (selected.includes(list.wo_attachment_id)) {
      setSelected(p => p.filter(d => d !== list.wo_attachment_id))
      updatedMarkedRows = selected.filter(d => d !== list.wo_attachment_id)
    } else {
      setSelected(p => [...p, list.wo_attachment_id])
      updatedMarkedRows = [...selected, list.wo_attachment_id]
    }

    if (updatedMarkedRows.length === 0) {
      setAllSelected(false)
    } else if (woDetails.workOrderAttachments.every(d => updatedMarkedRows.includes(d.wo_attachment_id))) {
      setAllSelected(true)
    } else {
      setAllSelected(false)
    }
  }

  const onSubmitAttachments = async () => {
    const pdfItems = woDetails.workOrderAttachments.filter(item => selected.includes(item.wo_attachment_id)).map(item => item.filename)
    callGenerateReportApi(pdfItems)
    setIsAttachmentsOpen(false)
  }

  const callGenerateReportApi = async pdfItems => {
    try {
      $('#pageLoading').show()
      const document = await onBoardingWorkorder.downloadMaintenanceReport(
        snakifyKeys({
          woId: workOrderID,
          reportType: 'pdf',
          isRequestedForWo: true,
          attachments: pdfItems,
        })
      )
      if (document.success > 0) {
        Toast.success(`Your report is being generated and will be emailed to you shortly. You’ll receive an email with the download link for the report once it's ready. Thank you for your patience!`)
      } else {
        Toast.error(document.message)
      }
      $('#pageLoading').hide()
    } catch (err) {
      $('#pageLoading').hide()
      Toast.error('Error exporting Report !')
    }

    setSelected([])
    setAllSelected(false)
  }

  const onClearAttachments = async () => {
    setSelected([])
    setAllSelected(false)
    setIsAttachmentsOpen(false)
  }

  const checkErrorsBtn = () => {
    let error = []
    if (!isEmpty(visibleRowsData)) {
      visibleRowsData.forEach(d => {
        if (duplicateQRs.has(d.qR_code)) {
          error = [...error, d]
        }
      })
    }

    setErrorCount(error)
    if (isEmpty(error)) {
      Toast.success('All line items verified! No Errors Found!')
    }
  }

  const dropDownMenuOptions = [
    {
      id: 1,
      type: 'button',
      text: isAcceptanceWO ? 'Add Asset Class' : 'Add Work Order Line',
      disabled: IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED),
      onClick: () => handleAction('NEW'),
      icon: <AddIcon fontSize='small' />,
      show: true,
      seperatorBelow: true,
    },
    {
      id: 15,
      type: 'button',
      text: 'Check Errors',
      disabled: false,
      onClick: checkErrorsBtn,
      icon: <ReportOutlinedIcon fontSize='small' />,
      show: !isAcceptanceWO,
      seperatorBelow: !isAcceptanceWO,
    },
    { id: 2, type: 'button', text: 'Download Sample File', onClick: downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: isAcceptanceWO },
    {
      id: 3,
      type: 'button',
      text: 'Upload Quote',
      disabled: IsCompletionInProgress || woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED),
      onClick: handleUploadQuote,
      show: isAcceptanceWO,
      icon: <PublishOutlinedIcon fontSize='small' />,
      seperatorBelow: true,
    },
    { id: 11, type: 'button', text: 'Upload IR Photo', disabled: IsCompletionInProgress, onClick: () => setUploadPreviewOpen(true), icon: <PublishOutlinedIcon fontSize='small' />, show: !isAcceptanceWO },
    {
      id: 12,
      type: 'button',
      text: 'Upload PMs',
      onClick: handleUploadPMs,
      icon: <PublishOutlinedIcon fontSize='small' />,
      show: !isAcceptanceWO,
      disabled: woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED),
    },
    { id: 14, type: 'button', text: 'Download Assets and QR Codes', onClick: handleDownloadAssetAndQrCode, show: true, disabled: isEmpty(rows), icon: <GetAppOutlinedIcon fontSize='small' /> },
    { id: 13, type: 'input', show: true, onChange: addPMsWoLine, ref: uploadPMsRef },
    { id: 4, type: 'button', text: 'Generate Engineering Letter', disabled: itHaveMoreType || _.isEmpty(rows), onClick: () => handleAction('EXPORT', woDetails), icon: <InsertDriveFileOutlinedIcon fontSize='small' />, show: !isQuote && isAcceptanceWO },
    { id: 5, type: 'button', text: 'Export Assets', disabled: exportLoading || _.isEmpty(rows) || rows.filter(task => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(task.status_id)).length === 0, onClick: exportAsset, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    { id: 6, type: 'input', show: isAcceptanceWO, onChange: addQuote, ref: uploadQuoteRef },
    { id: 7, type: 'button', text: 'Get Summary', disabled: _.isEmpty(rows) || rows.filter(task => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(task.status_id)).length === 0, onClick: () => getSummary(), icon: <PlayForWorkOutlinedIcon fontSize='small' />, show: !isAcceptanceWO },
    { id: 9, type: 'button', text: 'Bulk Export', disabled: _.isEmpty(rows), onClick: () => bulkExport(camelizeKeys(woDetails)), show: isAcceptanceWO, icon: <DescriptionOutlinedIcon fontSize='small' /> },
    {
      id: 10,
      type: 'button',
      text: 'Bulk Upload',
      disabled: woDetails.wo_status_id === enums.woTaskStatus.Complete || _.isEmpty(rows),
      onClick: () => uploadBulkRef.current && uploadBulkRef.current.click(),
      show: isAcceptanceWO,
      icon: <PublishOutlinedIcon fontSize='small' />,
    },
    { id: 8, type: 'input', show: isAcceptanceWO, onChange: bulkUpload, ref: uploadBulkRef },
    { id: 15, type: 'button', text: 'Generate Report', show: !isAcceptanceWO && !isQuote, icon: <InsertDriveFileOutlinedIcon fontSize='small' />, onClick: generateMaintenanceWOReport },
  ]
  const maintenanceMenuOptions = [
    // { id: 1, name: 'View', action: d => handleSubAction('VIEW', d) },
    // {
    //   id: 2,
    //   name: 'Edit',
    //   action: d => handleSubAction('EDIT_MW', d),
    //   disabled: d => IsCompletionInProgress || d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED),
    // },
    {
      id: 3,
      name: 'Accept',
      action: d => handleSubAction('ACCEPT_MW', d),
      disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
      isHide: isQuote,
    },
    {
      id: 4,
      name: 'Reject',
      action: d => handleSubAction('REJECT_MW', d),
      disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
      isHide: isQuote,
    },
    {
      id: 5,
      name: 'Hold',
      action: d => handleSubAction('HOLD_MW', d),
      disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.ReadyForReview || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
      isHide: isQuote,
    },
    // { id: 6, name: 'Link - Fix Issues', action: d => handleSubAction('LINK_ISSUE', d), disabled: d => IsCompletionInProgress || d.inspection_type === enums.MWO_INSPECTION_TYPES.INSTALL },
    // {
    //   id: 7,
    //   name: 'Add PM to Workorder',
    //   action: d => handleSubAction('LINK_PM', d),
    //   disabled: d => d.inspection_type !== enums.MWO_INSPECTION_TYPES.INSPECTION || d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
    // },
    {
      id: 8,
      name: 'Delete',
      action: d => handleSubAction('DEL', d),
      color: '#FF0000',
      disabled: d => d.status_id === enums.woTaskStatus.Submitted || d.status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Submitted,
    },
    { id: 9, name: 'Ready For Review', action: d => handleSubAction('REVERT_MW', d), disabled: d => IsCompletionInProgress || d.status_id !== enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete, isHide: isQuote },
  ]
  const renderText = text => (_.isEmpty(text) ? 'N/A' : text)
  const renderInspectionType = (text, d) => {
    const type = inspectionTypes.find(d => d.value === text)
    if (_.isEmpty(type)) return 'N/A'
    if (type.value === enums.MWO_INSPECTION_TYPES.PM) return _.get(d, 'asset_pm_title', 'N/A')
    return type.label
  }

  const handleCheckboxChange = list => {
    let updatedMarkedRows

    if (markedRows.includes(list.woonboardingassets_id)) {
      setMarkedRows(p => p.filter(d => d !== list.woonboardingassets_id))
      updatedMarkedRows = markedRows.filter(d => d !== list.woonboardingassets_id)
    } else {
      setMarkedRows(p => [...p, list.woonboardingassets_id])
      updatedMarkedRows = [...markedRows, list.woonboardingassets_id]
    }

    if (updatedMarkedRows.length === 0) {
      setIsMarkedAll(false)
    } else if (rows.every(d => updatedMarkedRows.includes(d.woonboardingassets_id))) {
      setIsMarkedAll(true)
    } else {
      setIsMarkedAll(false)
    }
  }

  const selectAndDeSelectAll = () => {
    if (!isMarkedAll) {
      const paginatedData = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setMarkedRows(paginatedData.map(d => d.woonboardingassets_id))
    } else setMarkedRows([])
    setIsMarkedAll(p => !p)
  }

  const maintenanceColumns = [
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isMarkedAll} onClick={selectAndDeSelectAll} />, render: d => <RenderCheckBox data={d} accessor='woonboardingassets_id' selected={markedRows} handleChange={handleCheckboxChange} />, isHidden: currentSelectedStatus === 0 ? true : false },
    {
      name: 'Identification',
      render: d => (
        <div className='d-flex align-items-center'>
          <AssetTypeIcon type={d.asset_class_type} />
          {d.assigned_asset_name}
        </div>
      ),
      isHidden: false,
    },
    { name: 'Asset Class', accessor: 'asset_class_name', isHidden: false },
    { name: 'Category', render: d => renderInspectionType(d.inspection_type, d), isHidden: false },
    { name: 'Submitted By', render: d => renderText(d.technician_name), isHidden: false },
    { name: 'Room', accessor: 'temp_master_room', isHidden: false },
    {
      name: 'Asset Details',
      render: val => <OverviewIcons val={camelizeKeys(val)} />,
      isHidden: false,
    },
    {
      name: 'Status',
      render: d => {
        const { color, label } = getStatus(d.status_id)
        return <StatusComponent color={color} label={label} size='small' />
      },
      isHidden: isQuote ? true : false,
    },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton
            isLoading={editActionLoader === d.wo_inspectionsTemplateFormIOAssignment_id}
            tooltip='EDIT'
            action={e => (e.stopPropagation(), handleSubAction('EDIT_MW', d))}
            icon={<EditOutlinedIcon fontSize='small' />}
            btnRef={actionEditBtnRef}
            disabled={
              IsCompletionInProgress ||
              d.status_id === enums.woTaskStatus.Submitted ||
              d.status_id === enums.woTaskStatus.Complete ||
              woDetails.wo_status_id === enums.woTaskStatus.Complete ||
              woDetails.wo_status_id === enums.woTaskStatus.Submitted ||
              (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) ||
              (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) ||
              (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED)
            }
          />
          {!isQuote ? (
            <Menu options={maintenanceMenuOptions} data={d} loading={fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id} width={155} />
          ) : (
            <ActionButton
              tooltip='DELETE'
              action={e => (e.stopPropagation(), handleSubAction('DEL', d))}
              isLoading={fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id}
              icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />}
              disabled={(isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED)}
            />
          )}
        </div>
      ),
      isHidden: currentSelectedStatus === 0 ? false : true,
    },
  ]
  const attachmentColumns = [
    { name: 'Attachment Name', accessor: 'user_uploaded_name' },
    {
      name: 'Actions',
      render: d => (
        <div className='d-flex align-items-center'>
          <ActionButton action={() => window.open(d.file_url, '_blank')} icon={<VisibilityOutlinedIcon fontSize='small' />} tooltip='VIEW' />
          <ActionButton
            action={() => handleAction('DELETE', d)}
            icon={<DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#ff0000' }} />}
            tooltip='DELETE'
            disabled={woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED)}
          />
        </div>
      ),
    },
  ]

  const selectAttachmentColumns = [
    { name: 'Attachment Name', render: d => <div style={{ width: '35vw', overflow: 'hidden' }}>{d.user_uploaded_name || 'N/A'}</div> },
    { name: <MinimalCheckbox style={{ marginLeft: '3px' }} selected={isAllSelected} onClick={selectAndDeSelectAllAttachments} />, render: d => <RenderCheckBox data={d} accessor='wo_attachment_id' selected={selected} handleChange={handleCheckBoxChangeAttachments} /> },
  ]

  useEffect(() => {
    let filteredRows = isAcceptanceWO ? [...categories] : [...tasks]

    if (errorCountFlag && !isAcceptanceWO) {
      filteredRows = [...tasks].filter(x => !isEmpty(errorCount) && errorCount.some(eId => eId.woonboardingassets_id === x.woonboardingassets_id))
    }

    if (!_.isEmpty(searchString)) {
      if (isAcceptanceWO) {
        const actualRows = [...categories]
        filteredRows = actualRows.filter(
          x =>
            (x.form_name !== null && x.form_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.asset_class_name !== null && x.asset_class_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.wp !== null && x.wp.toLowerCase().includes(searchString.toLowerCase())) ||
            (x.group_string !== null && x.group_string.toLowerCase().includes(searchString.toLowerCase()))
        )
      } else {
        const actualRows = errorCountFlag ? filteredRows : [...tasks]

        filteredRows = actualRows.filter(
          x =>
            (!_.isEmpty(x.form_name) && x.form_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.assigned_asset_name) && x.assigned_asset_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.asset_class_name) && x.asset_class_name.toLowerCase().includes(searchString.toLowerCase())) ||
            (!_.isEmpty(x.wp) && x.wp.toLowerCase().includes(searchString.toLowerCase()))
        )
      }
    }
    if (currentSelectedStatus !== 0) filteredRows = filteredRows.filter(x => x.status === currentSelectedStatus)
    setRows(filteredRows)
  }, [searchString, errorCountFlag])
  //
  const openUpdateGroup = data => {
    setUpdateGroupString(data.group_string)
    setUpdateGroupOpen(true)
    setUpdateGroupObj(data)
  }
  const updateTestingGroup = async () => {
    try {
      setUpdateGroupLoading(true)
      const res = await assetClass.updateGroupName({ group_string: updateGroupString, wo_inspectionsTemplateFormIOAssignment_id: [updateGroupObj.wo_inspectionsTemplateFormIOAssignment_id] })
      if (res.success > 0) {
        Toast.success('Group name updated !')
        setReload(p => p + 1)
      } else Toast.error(res.message)
      setUpdateGroupLoading(false)
      setUpdateGroupOpen(false)
    } catch (error) {
      Toast.error('Error uploading file. Please try again !')
      setUpdateGroupLoading(false)
      setUpdateGroupOpen(false)
    }
  }
  //get summary
  const getSummary = () => {
    const classNames = {}
    const summary = []

    const completedTasks = rows.filter(task => [enums.woTaskStatus.Complete, enums.woTaskStatus.Submitted].includes(task.status_id))
    completedTasks.forEach(d => (_.isEmpty(classNames[d.asset_class_name]) ? (classNames[d.asset_class_name] = d.asset_class_code) : null))
    const occurances = _.countBy(completedTasks, d => d.asset_class_name)
    Object.keys(occurances).forEach(d => summary.push({ 'Asset Class Name': d, 'Asset Class Code': classNames[d], Quantity: occurances[d] }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(wb, ws, 'Summary')
    XLSX.writeFile(wb, `${woDetails.manual_wo_number}-Summary.xlsx`)
  }
  const viewTempIssue = async d => {
    //console.log(d)
    if (_.isEmpty(d.woonboardingassetsId)) {
      const { form_id, asset_form_id, wOcategorytoTaskMapping_id } = rows.find(row => row.asset_form_id === d.assetFormId)
      try {
        setIssueLoading(d.woLineIssueId)
        const res = await getFormJson({ form_id, asset_form_id })
        setAnchorObj({ form_data: res.data.asset_form_data, wOcategorytoTaskMapping_id, issueTitle: d.issueTitle.split('_').join(' '), isIssue: true })
        setIssueLoading('')
        viewInspectionForm()
      } catch (error) {
        setIssueLoading('')
        console.log(error)
      }
    } else {
      try {
        setIssueLoading(d.woLineIssueId)
        const res = await onBoardingWorkorder.getAssetDetails_V2({ id: d.woonboardingassetsId })
        setAnchorObj(res.data)
        setIssueLoading('')
        setIsViewRepairObOpen(true)
      } catch (error) {
        setIssueLoading('')
        console.log(error)
      }
    }
  }
  const linkFixIssue = d => {
    setAnchorObj(d)
    setLinkFixIssueOpen(true)
  }
  const linkPM = d => {
    setAnchorObj(d)
    setLinkPmOpen(true)
  }
  //check completeion status
  useEffect(() => {
    if (woState.wo_status_id !== enums.woTaskStatus.Complete) {
      checkCompletionStatus()
      if (woState.wo_type === enums.woType.Acceptance) {
        checkBulkUploadStatus()
      }
    }
  }, [])
  const checkCompletionStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    try {
      const res = await workorder.checkCompletionStatus(workOrderID)
      setCompletionProcessStatus(res.data.completeWoThreadStatus)
      if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.IN_PROGRESS) setTimeout(() => checkCompletionStatus(), 5000)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.COMPLETED) setReload(p => p + 1)
      else if (res.data.completeWoThreadStatus === enums.WO_COMPLETION_STATUS.FAILED) Toast.error('Previous completion process failed !')
    } catch (error) {
      console.log(error)
    }
  }
  // bulk upload
  const processBulkUploadData = async data => {
    try {
      const res = await workorder.bulkImportAssetForm({ wo_id: workOrderID, file_name: data.key || data.Key })
      if (res.data) {
        setBulkUploadProcessStatus(enums.BULK_UPLOAD_STATUS.IN_PROGRESS)
        Toast.success('Bulk upload process started !')
        checkBulkUploadStatus()
      } else Toast.error('Bulk upload process failed !')
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
  }
  const checkBulkUploadStatus = async () => {
    if (isEmpty(window.location.pathname.split('/')[3])) return
    try {
      const res = await workorder.bulkImportAssetFormStatus(workOrderID)
      setBulkUploadProcessStatus(res.data.bulkDataImportStatus)
      if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.IN_PROGRESS) setTimeout(() => checkBulkUploadStatus(), 5000)
      else if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.COMPLETED) {
        //Toast.success('Data uploaded successfully !')
        setReload(p => p + 1)
      } else if (res.data.bulkDataImportStatus === enums.BULK_UPLOAD_STATUS.FAILED) {
        $('#pageLoading').hide()
        Toast.error('Previous bulk upload process failed !')
        const failed = JSON.parse(_.get(res.data, 'bulkDataImportFailedLogs', '[]'))
        const failedNames = []
        failed.forEach(d => failedNames.push({ sheet: d.split(' ')[0], asset: d.split(' ')[2].slice(1, -1) }))
        setFailedAssets(failedNames)
        setFailedPopUpOpen(true)
      }
    } catch (error) {
      console.log(error)
    }
  }
  //
  const reviewMaintenanceLines = () => {
    setReviewLinesOpen(true)
  }
  // open issue line
  const checkOriginWoLineId = rows => {
    const query = new URLSearchParams(window.location.search)
    if (!isEmpty(query.get('originWoLineId')) && !originIssueOpened) {
      const d = rows.find(d => d.woonboardingassets_id === query.get('originWoLineId') || d.asset_form_id === query.get('originWoLineId'))
      setOriginIssueOpened(true)
      handleSubAction('VIEW', d)
    }
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
  const uploadPhoto = async files => {
    const formData = new FormData()
    files.forEach((file, i) => {
      formData.append(`file-${i}`, file, file.name)
    })
    formData.append('manual_wo_number', woDetails.manual_wo_number)
    formData.append('wo_id', workOrderID)
    setUploading(true)
    try {
      const res = await onBoardingWorkorder.uploadIrPhoto(formData)
      if (res.success) {
        Toast.success('IR Images uploaded !')
        console.log(files)
        //showPhotos(files)
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Error uploading images !')
    }
    setUploading(false)
  }
  const closeOnUploadPopUp = () => {
    setUploadPreviewOpen(false)
    // setTab(uploadTabs.UPLOAD)
    // setUploadPreviewFiles([])
  }
  const addPmAfterSubmit = d => {
    setReload(p => p + 1)
    setAnyPmList(d)
    if (!_.isEmpty(d)) handleSubAction('EDIT_MW', d[0])
  }

  const handleSkip = () => {
    if (currentPmIndex === anyPmList.length - 1) return handleCancel()
    handleSubAction('EDIT_MW', anyPmList[currentPmIndex + 1])
    setCurrentPmIndex(p => p + 1)
  }
  const handleCancel = () => {
    setReload(p => p + 1)
    setAnyPmList([])
    setCurrentPmIndex(0)
    setShowSkipInPm(false)
  }
  //after creation of issue
  const postIssueAddSuccess = d => {
    setReload(p => p + 1)
    if (!_.isEmpty(d)) handleSubAction('EDIT_MW', d)
  }

  const editPmFromView = (type, data) => {
    switch (type) {
      case 'isViewRepairObOpen':
        setIsViewRepairObOpen(false)
        break
      case 'isViewThermographyOpen':
        setViewThermographyOpen(false)
        break
      case 'isViewPmOpen':
        setViewPmOpen(false)
        break
      case 'isViewRepairOpen':
        setIsViewRepairOpen(false)
        break
      case 'isViewOpen':
        setIsViewOpen(false)
        break
      default:
        console.warn(`Unknown type: ${type}`)
    }

    handleSubAction('EDIT_MW', data)
  }

  const woState = {
    filter: get(history, 'location.state.filter', []),
    pageRows: get(history, 'location.state.pageRows', 20),
    search: get(history, 'location.state.search', ''),
    pageIndex: get(history, 'location.state.pageIndex', 1),
    wo_status_id: get(history, 'location.state.wo_status_id', 0),
    wo_type: get(history, 'location.state.wo_type', 0),
  }
  const handleTechnician = () => {
    if (isEmpty(woDetails)) return

    const maxVisibleTechnicians = 2
    const visibleTechnicians = isShowMore ? get(woDetails, 'technician_mapping_list', []) : woDetails.technician_mapping_list.slice(0, maxVisibleTechnicians)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap' onMouseEnter={() => (woDetails.technician_mapping_list.length > 2 ? setShowMore(true) : setShowMore(false))} onMouseLeave={() => setShowMore(false)} style={{ position: 'relative' }}>
          {!isEmpty(visibleTechnicians) &&
            !isShowMore &&
            visibleTechnicians.map((d, index) => (
              <div key={d.user_id} className='ml-2 mb-2'>
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
        {woDetails.technician_mapping_list.length === 0 && 'N/A'}
      </>
    )
  }

  const handleLead = () => {
    if (isEmpty(woDetails)) return

    const maxVisibleLead = 2
    const visibleLead = isShowMoreLead ? get(woDetails, 'backoffice_mapping_list', []) : woDetails.backoffice_mapping_list.slice(0, maxVisibleLead)

    return (
      <>
        <div className='d-flex align-items-center flex-wrap' onMouseEnter={() => (woDetails.backoffice_mapping_list.length > 2 ? setShowMoreLead(true) : setShowMoreLead(false))} onMouseLeave={() => setShowMoreLead(false)} style={{ position: 'relative' }}>
          {!isEmpty(visibleLead) &&
            !isShowMoreLead &&
            visibleLead.map((d, index) => (
              <div key={d.user_id} className='ml-2 mb-2'>
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
        {woDetails.backoffice_mapping_list.length === 0 && 'N/A'}
      </>
    )
  }

  const getVendor = () => {
    return (
      <div className='d-flex align-items-center flex-wrap' style={{ position: 'relative' }}>
        {get(woDetails, 'workorder_vendor_contacts_list', []).map(d => {
          return (
            <div key={d.vendor_id} className='ml-2 mb-1'>
              <StatusComponent color='#848484' label={`${d.vendor_name}<${d.vendor_email}>`} size='small' />
            </div>
          )
        })}
      </div>
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
  const getStatusWiseCount = status => {
    return get(
      rows.filter(d => d.status === status),
      'length',
      0
    )
  }
  const handleDueDateText = () => {
    if (get(woDetails, 'wo_status_id', '') === enums.woTaskStatus.Complete) return getFormatedDate(get(woDetails, 'due_date', '')?.split(' ')[0])
    const isExpired = woDetails.wo_due_overdue_flag === enums.WO_DUE_FLAG.OVERDUE
    const dueInText = get(woDetails, 'due_in', '')?.trim()
    return !isEmpty(get(woDetails, 'due_date', '')) ? (
      <span style={{ color: woDetails.wo_due_overdue_flag === enums.WO_DUE_FLAG.DUEINDAYS ? '' : getDueInColor(woDetails.wo_due_overdue_flag === enums.WO_DUE_FLAG.DUE ? 35 : -1) }} className={woDetails.wo_due_overdue_flag !== enums.WO_DUE_FLAG.DUEINDAYS ? 'text-bold' : ''}>
        {getFormatedDate(get(woDetails, 'due_date', '')?.split(' ')[0])} {isQuote ? (isExpired ? '(Expired)' : '') : `(${dueInText})`}
      </span>
    ) : (
      'N/A'
    )
  }
  const handleSubChange = () => {
    setRows(tasks)
    setSubTab('ASSETWISE')
    setErrorCountFlag(false)
    setErrorCount([])
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
        setReload(p => p + 1)
      } else {
        Toast.error('Error while updating workorder. Please try again !')
      }
    } catch (error) {
      $('#pageLoading').hide()
      Toast.error('Error while updating workorder. Please try again !')
    }
  }

  const { loading: quoteStatusLoading, mutate: updateQuoteStatus } = usePostData({ executer: onBoardingWorkorder.changeQuoteStatus, postSuccess: () => setReload(p => p + 1), message: { success: 'Quote Status Updated successfully !', error: 'Something went wrong !' } })
  const handleQuoteStatus = status => updateQuoteStatus({ wo_id: workOrderID, quote_status: status })

  if (quoteStatusLoading) $('#pageLoading').show()

  const getQuoteName = id => {
    const name = quotesType.find(d => d.value === id)
    return name?.label
  }

  const handleStatus = status => {
    console.log('current selected status - ', status)
    // setSelectedStatus({ label: '', value: status })
    setCurrentSelectedStatus(status)
    let filteredRows = [...rows]
    filteredRows = filteredRows.filter(x => x.status === status && x.woonboardingassets_id !== null)
    setRows(filteredRows)
    setErrorCountFlag(false)
    setErrorCount([])
  }

  useEffect(() => {
    setErrorCountFlag(false)
    setErrorCount([])
  }, [subTab])

  const handleClear = () => {
    setCurrentSelectedStatus(0)
    // setSelectedStatus({})
    if (isMarkedAll) {
      selectAndDeSelectAll()
    }
    setMarkedRows([])
    // const rows = get(, 'assetDetailsV2', [])
    setRows(tasks)
  }

  const handleBulkStatusPostSccess = res => {
    if (!isDeleteBulkOpen) {
      setIsDeleteBulkOpen(false)
      if (res.success !== 1) setStatusChunkFail(true)
    } else {
      if (res.success !== 1) setChunkFail(true)
    }

    // setSelectedStatus({})
  }

  const handleBulkStatusPostError = () => {
    setIsDeleteBulkOpen(false)
    setMarkedRows([])
    setIsMarkedAll(false)
    setCurrentSelectedStatus(0)
    setStatusChunkFail(true)
    setChunkFail(true)
    // setSelectedStatus({})
  }

  const { loading: statusChangeLoading, mutate: updateStatus } = usePostData({
    executer: asset.inspections.updateOBWOStatus,
    postSuccess: handleBulkStatusPostSccess,
    postError: handleBulkStatusPostError,
    message: { success: isDeleteBulkOpen ? 'Assets Deleted Successfully !' : 'Status updated successfully !', error: 'Something went wrong !' },
    hideMessage: true,
  })

  const handleChangeStatus = async status => {
    const items = [...markedRows]
    const itemChunks = chunk(items, enums.COMMON_UPLOAD_CHUNK_SIZE)
    for (const chunk of itemChunks) {
      await updateStatus({ woonboardingassetsIdList: chunk, status: !isDeleteBulkOpen ? status : null, isRequestedForDelete: isDeleteBulkOpen ? true : false })
    }

    setMarkedRows([])
    setIsMarkedAll(false)
    setCurrentSelectedStatus(0)

    if (!isStatusChunkFail) {
      Toast.success('Status updated successfully !')
      setReload(p => p + 1)
    } else {
      Toast.error('Something went wrong !')
    }
  }

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
      Toast.error('Something went wrong !')
    } else {
      Toast.success('Assets Deleted Successfully !')
      setReload(p => p + 1)
      setIsDeleteBulkOpen(false)
      setMarkedRows([])
      setIsMarkedAll(false)
      setCurrentSelectedStatus(0)
    }
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

  const duplicateQRs = getDuplicateQRs(visibleRowsData, true)

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
        <Box className='filter-chip' style={{ background: '#ffebeb', display: 'flex', alignItems: 'center', marginLeft: '10px', minHeight: '30px', border: '1px solid red' }}>
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
    <div style={{ padding: '20px', background: '#fff', height: `calc(100vh - 64px)` }}>
      {/* Title & Status */}
      <CompletionStatus text='Workorder completion in Progress' status={completionProcessStatus} inProgress={enums.WO_COMPLETION_STATUS.IN_PROGRESS} />
      <CompletionStatus text='Uploading is in progress ...' status={bulkUploadProcessStatus} inProgress={enums.BULK_UPLOAD_STATUS.IN_PROGRESS} />
      <div className='d-flex align-items-center mb-3 justify-content-between'>
        <div className='d-flex align-items-center'>
          <div className='mr-2'>
            <ActionButton action={() => history.push({ pathname: isQuote ? '/quote' : '/workorders', state: woState })} icon={<ArrowBackIcon fontSize='small' />} tooltip='GO BACK' />
          </div>
          <div style={{ fontWeight: 800, fontSize: '16px', marginRight: '8px' }}>{woDetails.manual_wo_number}</div>
          {!isQuote ? (
            <div className='mx-2'>
              {!isEmpty(woDetails) && !isNaN(woDetails.wo_status_id) && woDetails.wo_status_id !== enums.woTaskStatus.ReleasedOpen && woDetails.wo_status_id !== enums.woTaskStatus.Planned ? (
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
          {selectedTab !== 'ONE_LINE' && (isShowWoDetails ? <ActionButton action={() => setShowWoDetails(false)} icon={<ExpandMoreIcon fontSize='medium' />} tooltip='Hide Work Order Details' /> : <ActionButton action={() => setShowWoDetails(true)} icon={<ExpandLessIcon fontSize='medium' />} tooltip='Show Work Order Details' />)}
          <Menu options={mainMenuOptions} loading={viewAllTaskLoading} noToolip />
        </div>
      </div>
      {/* Header */}
      {selectedTab !== 'ONE_LINE' && isShowWoDetails && (
        <div style={{ padding: '16px 32px', background: '#fafafa', borderRadius: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: '35px' }}>
            <LabelVal inline label={isQuote ? 'Quote Type' : 'Work Type'} value={isQuote ? getQuoteName(get(woDetails, 'wo_type', '')) : get(woDetails, 'wo_type_name', '')} />
            <LabelVal label={isQuote ? 'Quote Date' : 'Start Date'} value={woDetails.start_date ? getFormatedDate(woDetails.start_date.split(' ')[0]) : ''} inline />
            <LabelVal label={isQuote ? 'Quote Expiration Date' : 'Due Date'} value={handleDueDateText()} inline />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isQuote ? '1fr 2fr' : '1fr 1fr 1fr', height: '35px' }}>
            <LabelVal label='Assigned Leads' value={handleLead()} inline />
            {!isQuote && <LabelVal inline label='Assigned Technicians' value={handleTechnician()} lableMinWidth={85} />}
            <LabelVal inline label='Responsible Party' value={get(woDetails, 'responsible_party_name', 'N/A') || 'N/A'} lableMinWidth={85} />
            {/* {isQuote && !isAcceptanceWO && !_.isEmpty(woDetails.po_number) && (
              <div style={{ width: 'auto', display: 'flex', marginTop: '8px' }}>
                <div style={{ fontWeight: 600, minWidth: '45px' }}>PO# : </div>
                <div style={{ overflowWrap: 'break-word', marginLeft: '4px', maxWidth: 'calc(100% - 45px)' }}>{woDetails.po_number}</div>
              </div>
            )} */}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', height: '35px' }}>
            <LabelVal inline label='Vendor' value={getVendor()} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: _.isEmpty(woDetails.po_number) ? '3fr' : '1fr 2fr', height: '35px' }}>
            {!isAcceptanceWO && !_.isEmpty(woDetails.po_number) && (
              <div style={{ width: 'auto', display: 'flex', marginTop: '8px' }}>
                <div style={{ fontWeight: 600, minWidth: '45px' }}>PO# : </div>
                <div style={{ overflowWrap: 'break-word', marginLeft: '4px', maxWidth: 'calc(100% - 45px)' }}>{woDetails.po_number}</div>
              </div>
            )}
            <LabelVal inline label='Description' value={renderDescription()} lableMinWidth={85} />
          </div>
        </div>
      )}
      <div style={{ padding: '0px 32px', background: '#fafafa', borderRadius: '4px' }}></div>
      {/* Action Buttons for Acceptance */}
      {isAcceptanceWO && (
        <div className='d-flex flex-row justify-content-between align-items-center mt-3' style={{ width: '100%' }}>
          <div className='d-flex align-items-center'>
            <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} error={error} />
            <div className='d-flex align-items-center ml-2'>
              <StatusMetric toolTip='OPEN' count={get(woDetails, 'status_wise_asset_count_obj.open_obwo_asset', 0)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' />
              <StatusMetric toolTip='IN PROGRESS' count={get(woDetails, 'status_wise_asset_count_obj.inprogress_obwo_asset', 0)} loading={loading} icon={UpdateOutlinedIcon} color='#3291DD' />
              <StatusMetric toolTip='READY FOR REVIEW' count={get(woDetails, 'status_wise_asset_count_obj.ready_for_review_obwo_asset', 0)} loading={loading} icon={FindInPageOutlinedIcon} color='#FA0B0B' />
              <StatusMetric toolTip='COMPLETED' count={get(woDetails, 'status_wise_asset_count_obj.completed_obwo_asset', 0)} loading={loading} icon={CheckCircleOutlineOutlinedIcon} color='#41BE73' />
              <StatusMetric toolTip='SUBMITTED' count={get(woDetails, 'status_wise_asset_count_obj.submitted_obwo_asset', 0)} loading={loading} icon={BeenhereOutlinedIcon} color='#7d07ff' />
            </div>
            {!_.isEmpty(error) && isAcceptanceWO && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px', paddingRight: '20px' }}>{error}</span>}
            {downloadLoading && (
              <>
                <CircularProgress size={15} thickness={5} /> <span style={{ fontWeight: 800, marginLeft: '5px' }}>Downloading...</span>
              </>
            )}
          </div>
          <SearchComponent searchString={searchString} setSearchString={setSearchString} />
        </div>
      )}

      {/* Tabs */}
      {!isAcceptanceWO && (
        <div className='assets-box-wraps customtab'>
          <AppBar position='static' color='inherit'>
            <Tabs id='controlled-tab-example' activeKey={selectedTab} onSelect={k => setTab(k)}>
              <Tab eventKey='DEFAULT' title={<TitleCount title='Line Items' count={get(rows, 'length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
              {/* <Tab eventKey='LOCATIONS' title={<TitleCount title='Locations' count={get(tempBuildings, 'length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab> */}
              <Tab eventKey='TIME-MATIRIALS' title={<TitleCount title='Time & Materials' count={get(woDetails, 'time_materials_count', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='ATTACHMENTS' title={<TitleCount title='Attachments' count={get(woDetails, 'workOrderAttachments.length', '0')} />} tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='NEW_ISSUES' title={<TitleCount title='Issues' count={get(woDetails, 'issues_count', '0')} bg='red' />} tabClassName='font-weight-bolder small-tab'></Tab>
              <Tab eventKey='ONE_LINE' title='Digital One-Line' tabClassName='font-weight-bolder small-tab'></Tab>
            </Tabs>
          </AppBar>
        </div>
      )}

      {selectedTab === 'DEFAULT' && (
        <>
          {!isAcceptanceWO && (
            <div className='d-flex flex-row justify-content-between align-items-center mt-2' style={{ width: '100%' }}>
              {currentSelectedStatus === 0 ? (
                <div className='d-flex align-items-center'>
                  {/* ACTION */}
                  <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} error={error} />
                  {!_.isEmpty(error) && isAcceptanceWO && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
                  {/* COUNTS */}
                  {!isQuote && (
                    <div className='d-flex align-items-center ml-2'>
                      <StatusMetricButton toolTip='OPEN' count={get(woDetails, 'status_wise_asset_count_obj.open_obwo_asset', 0)} loading={loading} icon={AccessTimeOutlinedIcon} color='#3941F1' action={() => subTab === 'DEFAULT' && !isQuote && woDetails?.wo_status_id !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.Open)} />
                      <StatusMetricButton
                        toolTip='IN PROGRESS'
                        count={get(woDetails, 'status_wise_asset_count_obj.inprogress_obwo_asset', 0)}
                        loading={loading}
                        icon={UpdateOutlinedIcon}
                        color='#3291DD'
                        action={() => subTab === 'DEFAULT' && !isQuote && woDetails?.wo_status_id !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.InProgress)}
                      />
                      <StatusMetricButton
                        toolTip='READY FOR REVIEW'
                        count={get(woDetails, 'status_wise_asset_count_obj.ready_for_review_obwo_asset', 0)}
                        loading={loading}
                        icon={FindInPageOutlinedIcon}
                        color='#FA0B0B'
                        action={() => subTab === 'DEFAULT' && !isQuote && woDetails?.wo_status_id !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.ReadyForReview)}
                      />
                      <StatusMetricButton
                        toolTip='COMPLETED'
                        count={get(woDetails, 'status_wise_asset_count_obj.completed_obwo_asset', 0)}
                        loading={loading}
                        icon={CheckCircleOutlineOutlinedIcon}
                        color='#41BE73'
                        action={() => subTab === 'DEFAULT' && !isQuote && woDetails?.wo_status_id !== enums.woTaskStatus.Complete && handleStatus(enums.woTaskStatus.Complete)}
                      />
                      {/* <StatusMetric toolTip='SUBMITTED' count={get(data, 'statusWiseAssetCountObj.submittedObwoAsset', 0)} loading={loading} icon={BeenhereOutlinedIcon} color='#7d07ff' /> */}
                    </div>
                  )}
                  {!_.isEmpty(error) && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{error}</span>}
                  {uploadPMsLoading && <span style={{ fontWeight: 800, marginLeft: '10px' }}>Uploading...</span>}
                  {downloadLoading && (
                    <>
                      <CircularProgress size={15} thickness={5} /> <span style={{ fontWeight: 800, marginLeft: '5px' }}>Downloading...</span>
                    </>
                  )}
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
                      {/* <ActionButton tooltipPlacement='top' icon={<BeenhereOutlinedIcon fontSize='small' />} tooltip='SUBMIT' action={() => handleChangeStatus(enums.woTaskStatus.ReadyForReview)} disabled={markedRows.length === 0 ? true : false} /> */}
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
                      {/* <ActionButton tooltipPlacement='top' icon={<DeleteOutlinedIcon fontSize='small' />} tooltip='DELETE' action={() => setIsDeleteBulkOpen(true)} disabled={markedRows.length === 0 ? true : false} /> */}
                      <MinimalButton onClick={() => setIsDeleteBulkOpen(true)} text='Delete' size='small' startIcon={<DeleteOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '5px' }} disabled={markedRows.length === 0 ? true : false || statusChangeLoading} />
                    </>
                  )}
                  {statusChangeLoading && <CircularProgress size={15} thickness={5} style={{ margin: ' 0 7px' }} />}
                </div>
              )}

              {/* TOGGLE */}
              {currentSelectedStatus === 0 && (
                <div className='d-flex' style={{ padding: '2px', background: '#f6f6f6', width: 'fit-content', borderRadius: '4px' }}>
                  <ToggleButton label='Default' value='DEFAULT' selected={subTab} onChange={setSubTab} />
                  <ToggleButton label='Asset Wise' value='ASSETWISE' selected={subTab} onChange={handleSubChange} />
                </div>
              )}

              {/* SEARCH */}
              {subTab === 'DEFAULT' ? (
                <div className='d-flex flex-row align-items-center'>
                  <SearchComponent searchString={searchString} setSearchString={setSearchString} />
                  {!isEmpty(errorCount) && <ErrorCount count={errorCount.length} />}
                </div>
              ) : (
                <div style={{ width: '201px' }}></div>
              )}
            </div>
          )}
          {/* Acceptance Table */}
          {isAcceptanceWO && (
            <>
              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: `50%`, marginTop: '10px', height: isShowWoDetails ? 'calc(100% - 280px)' : 'calc(100% - 170px)' }}>
                <TableComponent loading={loading || pageLoading} columns={acceptanceColumns} data={visibleRowsData} onRowClick={d => handleSubAction('VIEWLINE', d)} isForViewAction={true} />
              </div>
              {!isEmpty(rows) && <TablePagination rowsPerPageOptions={enums.PAGE_ARRAY_LIST} component='div' count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
            </>
          )}
          {/* Maintenance Table */}
          {!isAcceptanceWO && subTab === 'DEFAULT' && (
            <>
              <div className='table-responsive dashboardtblScroll' id='style-1' style={{ minHeight: `50%`, marginTop: '10px', height: isShowWoDetails ? 'calc(100% - 320px)' : 'calc(100% - 225px)' }}>
                <TableComponent
                  loading={loading || pageLoading}
                  columns={maintenanceColumns.filter(d => d.isHidden === false)}
                  data={visibleRowsData}
                  onRowClick={d => {
                    if (editActionLoader === d.wo_inspectionsTemplateFormIOAssignment_id || fetchingForm === d.wo_inspectionsTemplateFormIOAssignment_id) return
                    handleSubAction('VIEW', d)
                  }}
                  isForViewAction={true}
                  rowStyle={row => ({
                    backgroundColor: duplicateQRs.has(row.qR_code) ? '#ffebeb' : 'transparent',
                  })}
                />
              </div>
              {!isEmpty(rows) && <TablePagination rowsPerPageOptions={enums.PAGE_ARRAY_LIST} component='div' count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />}
            </>
          )}
          {subTab === 'ASSETWISE' && !isAcceptanceWO && <AssetWise data={rows} onRowClick={handleSubAction} fetchingForm={fetchingForm} isShowWoDetails={isShowWoDetails} isQuote={isQuote} errorList={errorCount} errorFlag={errorCountFlag} />}
        </>
      )}
      {selectedTab === 'LOCATIONS' && (
        <Locations
          rows={rows}
          actionLoader={fetchingForm}
          viewAsset={d => handleSubAction('VIEW', d)}
          woId={workOrderID}
          searchString={searchString}
          data={camelizeKeys(woDetails)}
          handleAddAssetInLocation={d => handleAction('NEW', d)}
          setTempBuildings={setTempBuildings}
          isAddDisabled={woDetails.wo_status_id === enums.woTaskStatus.Complete || IsCompletionInProgress}
          addCTA='Add Work Order Line'
        />
      )}
      {/* Attachments Table */}
      {selectedTab === 'ATTACHMENTS' && !isAcceptanceWO && (
        <>
          <div className='d-flex flex-row justify-content-between align-items-center' style={{ width: '100%' }}>
            <input ref={uploadInputRef} type='file' style={{ display: 'none' }} onChange={addAttachment} />
            <MinimalButton
              size='small'
              disabled={woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED)}
              startIcon={<AddIcon />}
              text='Add Attachment'
              onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
              variant='contained'
              color='primary'
              baseClassName='my-2'
            />
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: isShowWoDetails ? `calc(100vh - 390px)` : `calc(100vh - 290px)` }}>
            <TableComponent loading={loading} columns={attachmentColumns} data={woDetails.workOrderAttachments} />
          </div>
        </>
      )}
      {selectedTab === 'NEW_ISSUES' && <NewIssues viewTempIssue={viewTempIssue} woId={workOrderID} isShowWoDetails={isShowWoDetails} />}

      {selectedTab === 'TIME-MATIRIALS' && <TimeMaterials woId={workOrderID} countUpdate={() => setReload(p => p + 1)} woStatus={woDetails.wo_status_id} allCount={get(woDetails, 'time_materials_count', 0)} isShowWoDetails={isShowWoDetails} quoteStatus={woDetails.quote_status_id} isQuote={isQuote} />}
      {selectedTab === 'ONE_LINE' && <Cluster woId={workOrderID} woType={woDetails !== null ? woDetails.wo_type : 0} woStatus={woDetails.wo_status_id} />}

      {isQuote && !loading ? (
        woDetails.quote_status_id === enums.QUOTES.STATUS.OPEN ? (
          <div className='d-flex flex-row-reverse my-2 sticky-bottom-btn'>
            <MinimalButton variant='contained' size='small' text='Send to Customer' onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.SUBMITTED)} baseClassName='mx-1' style={{ background: '#778899', color: '#FFF' }} disabled={woDetails?.wo_status_id === enums.woTaskStatus.Complete} />
          </div>
        ) : (
          woDetails.quote_status_id !== enums.QUOTES.STATUS.ACCEPTED && (
            <div className='d-flex justify-content-between my-2 sticky-bottom-btn'>
              <MinimalButton variant='contained' size='small' text='Revert & Edit' onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.OPEN)} baseClassName='mx-2' style={{ background: '#EFBD40', color: '#FFF' }} disabled={woDetails.wo_status_id === enums.woTaskStatus.Complete} />
              <div className='d-flex align-items-center'>
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Defer'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.DEFERRED)}
                  baseClassName='mx-1'
                  style={{ background: '#929292', color: '#FFF' }}
                  disabled={woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED}
                />
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Reject'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.REJECTED)}
                  baseClassName='mx-1'
                  style={{ background: '#DA3B26', color: '#FFF' }}
                  disabled={woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED || woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED}
                />
                <MinimalButton
                  variant='contained'
                  size='small'
                  text='Accept'
                  onClick={() => handleQuoteStatus(enums.QUOTES.STATUS.ACCEPTED)}
                  baseClassName='mx-1'
                  style={{ background: '#81D653', color: '#FFF' }}
                  disabled={woDetails.wo_status_id === enums.woTaskStatus.Complete || woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED || woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED}
                />
              </div>
            </div>
          )
        )
      ) : (
        !loading &&
        bulkUploadProcessStatus !== enums.BULK_UPLOAD_STATUS.IN_PROGRESS && (
          <div className='d-flex row-reverse justify-content-end my-2 sticky-bottom-btn'>
            {/* <div className='d-flex align-items-center' style={getEnableStatus() ? { cursor: 'not-allowed', color: 'grey' } : {}}>
              <div style={{ fontWeight: 800, marginRight: '5px', color: getEnableStatus() ? '#00000075' : '#000' }}>Override</div>
              <Checkbox checked={isOverride} disabled={getEnableStatus()} onChange={e => setOverride(e.target.checked)} name='checkedB' color='primary' size='small' style={{ padding: '2px' }} />
            </div> */}
            <Button variant='contained' color='primary' className='nf-buttons mx-2' onClick={() => setIsCompleteOpen(true)} disableElevation disabled={checkCompWOEnableStatus()}>
              {'Complete Workorder'}
              {/* {woCompLoading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />} */}
            </Button>
          </div>
        )
      )}
      <DialogPrompt title='Complete Work Order' text='Are you sure you want to complete Work Order ? Work order lines with Open status would be deleted' actionLoader={woCompLoading} open={isCompleteOpen} ctaText='Complete' action={completeWO} handleClose={() => setIsCompleteOpen(false)} />
      {/* {isCreateOpen && <WOAddCategory workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} />} */}
      {isCreateOpen && isAcceptanceWO && <AddAssetClass workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {isCreateOpen && !isAcceptanceWO && <AssignAsset workOrderID={workOrderID} obj={woDetails} open={isCreateOpen} onClose={() => setIsCreateOpen(false)} afterSubmit={() => setReload(p => p + 1)} openCreateNew={() => setCreateNewMwAssetOpen(true)} />}
      {assignTechOpen && <AssignTechinican obj={anchorObj} open={assignTechOpen} onClose={() => setIsAssignTechOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {isGridViewOpen && <GridView obj={anchorObj} open={isGridViewOpen} onClose={() => setGridViewOpen(false)} afterSubmit={() => setReload(p => p + 1)} woStatusId={woDetails !== null ? woDetails.wo_status_id : 0} />}
      {isViewLineOpen && (
        <TaskList
          equipmentListOptions={equipmentListOptions}
          obj={anchorObj}
          woStatusId={woDetails !== null ? woDetails.wo_status_id : 0}
          woType={woDetails !== null ? woDetails.wo_type : 0}
          open={isViewLineOpen}
          onClose={() => closeViewLine()}
          afterSubmit={() => setReload(p => p + 1)}
          showAllTask={isShowAllViewTask}
          masterForms={masterForms}
          woId={workOrderID}
        />
      )}
      {isReviewOpen && (
        <TaskList
          obj={anchorObj}
          equipmentListOptions={equipmentListOptions}
          woStatusId={woDetails !== null ? woDetails.wo_status_id : 0}
          woType={woDetails !== null ? woDetails.wo_type : 0}
          open={isReviewOpen}
          onClose={() => closeReviewLine()}
          afterSubmit={() => setReload(p => p + 1)}
          showAllTask={isShowAllViewTask}
          masterForms={masterForms}
          woId={workOrderID}
          isForReview={true}
        />
      )}
      {editWOOpen && <EditWO obj={woDetails} open={editWOOpen} onClose={() => setEditWOOpen()} afterSubmit={() => setReload(p => p + 1)} isQuote={isQuote} />}
      {isViewOpen && (
        <WOCategoryView
          equipmentListOptions={equipmentListOptions}
          isEdit={inspectionTypeIsEdit}
          open={isViewOpen}
          onClose={() => closeView()}
          obj={anchorObj}
          woStatusId={woDetails !== null ? woDetails.wo_status_id : 0}
          isQuote={isQuote}
          onEdit={() => editPmFromView('isViewOpen', anchorObj)}
          isEditData={true && !inspectionTypeIsEdit && !(anchorObj.status === enums.woTaskStatus.Complete || woDetails.wo_status_id === enums.woTaskStatus.Complete)}
        />
      )}
      <DialogPrompt title='Delete Attachment' text={`Are you sure you want to remove the attachment from  ${isQuote ? 'Quote' : 'work order'}?`} open={isDeleteAttOpen} ctaText='Remove' action={delAttachment} handleClose={() => setDeleteAttOpen(false)} />
      <DialogPrompt title={`Delete ${isAcceptanceWO ? 'Class' : 'Line'}`} text={`Are you sure you want to remove the ${isAcceptanceWO ? 'class' : 'line'} from  ${isQuote ? 'Quote' : 'work order'}?`} open={delCatOpen} ctaText='Remove' action={delCategory} handleClose={() => setDelCatOpen(false)} />
      <DialogPrompt title={`Hold ${isAcceptanceWO ? 'Class' : 'Line'}`} text={`Are you sure you want to hold the ${isAcceptanceWO ? 'class' : 'line'} from this Work Order?`} open={holdCatOpen} ctaText='Hold' action={holdCategory} handleClose={() => setHoldCatOpen(false)} />
      <DialogPrompt title='Remove Assets' text='Are you sure you want to remove the selected assets from the work order?' actionLoader={statusChangeLoading} open={isDeleteBulkOpen} ctaText='Remove' action={handleBulkDelete} handleClose={() => setIsDeleteBulkOpen(false)} />
      {isAddNewLineOpen && (
        <PopupModal open={isAddNewLineOpen} onClose={() => setAddNewLineOpen(false)} title='Category' handleSubmit={createNewLine} cta='Create' width={39}>
          <div className='text-bold mb-2'>Please select any one category from below.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {inspectionTypes
              .filter(e => e.isHidden !== true)
              .map((d, i) => (
                <div key={d.value}>
                  <MinimalRadio key={d.value} label={d.label} onClick={() => setSelectedInspectionType(d.value)} selected={d.value === selectedInspectionType} />
                </div>
              ))}
          </div>
        </PopupModal>
      )}
      {/* {isViewRepairOpen && <View obj={anchorObj} open={isViewRepairOpen} onClose={() => setIsViewRepairOpen(false)} />} */}
      {/* REPAIR FORMS */}
      {isIssueOpen && <Issue open={isIssueOpen} onClose={() => setIssueOpen(false)} workOrderID={workOrderID} afterSubmit={postIssueAddSuccess} classCodeOptions={classCodeOptions} />}
      {isRepairOpen && <Repair isRepair={true} obj={woDetails} workOrderID={workOrderID} open={isRepairOpen} onClose={() => setRepairOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isRepair && (
        <Repair isRepair={true} workOrderID={workOrderID} isEdit={true} obj={anchorObj} open={editWorkOrderLine.open && editWorkOrderLine.isRepair} onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })} afterSubmit={() => setReload(p => p + 1)} />
      )}
      {/* REPLACE FORMS */}
      {isReplaceOpen && <Repair isReplace={true} obj={woDetails} workOrderID={workOrderID} open={isReplaceOpen} onClose={() => setReplaceOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isReplace && (
        <Repair isReplace={true} workOrderID={workOrderID} isEdit={true} obj={anchorObj} open={editWorkOrderLine.open && editWorkOrderLine.isReplace} onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })} afterSubmit={() => setReload(p => p + 1)} />
      )}
      {/* TROUBLE CALL CHECK FORMS */}
      {isTroblecallCheckOpen && <Repair isTroblecall={true} obj={woDetails} workOrderID={workOrderID} open={isTroblecallCheckOpen} onClose={() => setTroblecallCheckOpen(false)} afterSubmit={() => setReload(p => p + 1)} />}
      {editWorkOrderLine.open && editWorkOrderLine.isTroubleCall && (
        <Repair
          isTroblecall={true}
          workOrderID={workOrderID}
          isEdit={true}
          obj={anchorObj}
          open={editWorkOrderLine.open && editWorkOrderLine.isTroubleCall}
          onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })}
          afterSubmit={() => setReload(p => p + 1)}
        />
      )}
      {/* OB FORMS */}
      {isObOpen && <Install isOnboarding={true} viewObj={camelizeKeys(woDetails)} open={isObOpen} onClose={() => setObOpen(false)} afterSubmit={() => setReload(p => p + 1)} isNew classCodeOptions={classCodeOptions} workOrderID={workOrderID} isInstalling buildingOptions={tempBuildings} isQuote={isQuote} />}
      {isViewRepairObOpen && <ViewOB isOnboarding={true} viewObj={camelizeKeys(anchorObj)} open={isViewRepairObOpen} onClose={() => setIsViewRepairObOpen(false)} onEdit={() => editPmFromView('isViewRepairObOpen', anchorObj)} isEdit={true && !actionEditBtnRef.current?.disabled} />}
      {editWorkOrderLine.open && editWorkOrderLine.isOnboarding && (
        <Install
          isOnboarding={true}
          viewObj={camelizeKeys(anchorObj)}
          open={editWorkOrderLine.open && editWorkOrderLine.isOnboarding}
          onClose={() => setEditWorkOrderLine({ open: false, isRepair: false, isInspection: false, isReplace: false, isTroubleCall: false, isOnboarding: false })}
          afterSubmit={() => setReload(p => p + 1)}
          classCodeOptions={classCodeOptions}
          workOrderID={workOrderID}
          isInstalling
          buildingOptions={tempBuildings}
          isQuote={isQuote}
        />
      )}
      {/* NEW ASSET INSPECTION TYPE */}
      {isCreateNewMwAssetOpen && <CreateNewAsset openForm={handleSubAction} obj={woDetails} open={isCreateNewMwAssetOpen} afterSubmit={() => setReload(p => p + 1)} onClose={() => setCreateNewMwAssetOpen(false)} />}
      {/* REJECT POPUP */}
      {isRejectOpen && (
        <PopupModal open={isRejectOpen} onClose={closeRejectReasonModal} title='Reject Asset' loading={rejectLoading} handleSubmit={rejectAsset}>
          <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
        </PopupModal>
      )}
      {/* UPDATE GROUP NAME */}
      {isUpdateGroupOpen && (
        <PopupModal open={isUpdateGroupOpen} onClose={() => setUpdateGroupOpen(false)} title='Update Testing Group' loading={isUpdateGroupLoading} handleSubmit={updateTestingGroup}>
          <MinimalInput value={updateGroupString} onChange={setUpdateGroupString} placeholder='Enter group name' w={100} />
        </PopupModal>
      )}
      {/* UPDATE GROUP NAME */}
      {isUpdateGroupOpen && (
        <PopupModal open={isUpdateGroupOpen} onClose={() => setUpdateGroupOpen(false)} title='Update Testing Group' loading={isUpdateGroupLoading} handleSubmit={updateTestingGroup}>
          <MinimalInput value={updateGroupString} onChange={setUpdateGroupString} placeholder='Enter group name' w={100} />
        </PopupModal>
      )}
      {/* LINK FIX ISSUES */}
      {linkFixIssueOpen && <LinkFixIssues loadingId={issueLoading} woId={workOrderID} open={linkFixIssueOpen} onClose={() => setLinkFixIssueOpen(false)} obj={{ ...anchorObj, woStatus: woDetails.wo_status_id }} />}
      {/* LINK PMs */}
      {isLinkPmOpen && <LinkPMs open={isLinkPmOpen} onClose={() => setLinkPmOpen(false)} obj={camelizeKeys(anchorObj)} />}
      {/* WHEN BULK UPLOAD FAILS FOR SOME ASSETS */}
      {isFailedPopUpOpen && (
        <PopupModal open={isFailedPopUpOpen} onClose={() => setFailedPopUpOpen(false)} title='Upload Failed' noActions>
          <div className='text-bold'>Last performed bulk upload opration failed for following assets !</div>
          <div className='d-flex mt-2'>
            <div className='p-2 text-bold' style={{ width: '50%', background: '#93939380' }}>
              Sheet Name
            </div>
            <div className='p-2 text-bold' style={{ width: '50%', background: '#93939380' }}>
              Identification
            </div>
          </div>
          {failedAssets.map((d, i) => (
            <div key={`failed-asset-${i}`} className='d-flex'>
              <div className='p-1' style={{ width: '50%', borderBottom: '1px dashed #93939380' }}>
                {d.sheet}
              </div>
              <div className='p-1' style={{ width: '50%', borderBottom: '1px dashed #93939380' }}>
                {d.asset}
              </div>
            </div>
          ))}
        </PopupModal>
      )}
      {/* REVIEW MWO LINES */}
      {isReviewLinesOpen && <ReviewLines equipmentListOptions={equipmentListOptions} workOrderID={workOrderID} open={isReviewLinesOpen} onClose={() => setReviewLinesOpen(false)} data={camelizeKeys(rows)} afterSubmit={() => setReload(p => p + 1)} />}
      {/* PM  */}
      {isAddPmOpen && <AddPM open={isAddPmOpen} workOrderID={workOrderID} afterSubmit={addPmAfterSubmit} onClose={() => setAddPmOpen(false)} classCodeOptions={classCodeOptions} />}
      {isViewPmOpen && <ViewForm isView open={isViewPmOpen} onClose={() => setViewPmOpen(false)} data={anchorObj.data} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} onEdit={() => editPmFromView('isViewPmOpen', anchorObj.obj)} isEdit={true && !actionEditBtnRef.current?.disabled} />}
      {isEditPmOpen && <EditForm open={isEditPmOpen} onClose={() => setEditPmOpen(false)} data={editPMLineObj.data} afterSubmit={() => setReload(p => p + 1)} submisson={editPMLineObj.submissionData} obj={camelizeKeys(editPMLineObj.obj)} isQuote={isQuote} equipmentListOptions={equipmentListOptions} />}
      {isViewThermographyOpen && <ThermographyForm isView open={isViewThermographyOpen} onClose={() => setViewThermographyOpen(false)} submisson={anchorObj.submissionData} obj={camelizeKeys(anchorObj.obj)} onEdit={() => editPmFromView('isViewThermographyOpen', anchorObj.obj)} isEdit={true && !actionEditBtnRef.current?.disabled} />}
      {isEditThermographyOpen && (
        <ThermographyForm
          open={isEditThermographyOpen}
          onClose={() => setEditThermographyOpen(false)}
          submisson={editPMLineObj.submissionData}
          obj={camelizeKeys(editPMLineObj.obj)}
          afterSubmit={() => setReload(p => p + 1)}
          canBeSkipped={showSkipInPm}
          anyPmList={anyPmList}
          currentPmIndex={currentPmIndex}
          handleSkip={handleSkip}
          handleCancel={handleCancel}
          isQuote={isQuote}
        />
      )}
      {uploadPreviewOpen && (
        <UploadIrPhotos
          open={uploadPreviewOpen}
          onClose={closeOnUploadPopUp}
          workOrderID={workOrderID}
          manualWoNumber={woDetails.manual_wo_number}
          isDisable={woDetails.wo_status_id === enums.woTaskStatus.Complete || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.ACCEPTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.REJECTED) || (isQuote && woDetails.quote_status_id === enums.QUOTES.STATUS.DEFERRED)}
        />
      )}
      {isViewRepairOpen && <ViewIssue open={isViewRepairOpen} onClose={() => setIsViewRepairOpen(false)} woOBAssetID={get(anchorObj, 'woonboardingassets_id')} onEdit={() => editPmFromView('isViewRepairOpen', anchorObj)} isEdit={true && !actionEditBtnRef.current?.disabled} />}
      {isEditIssue && (
        <IssueProvider>
          <AddIssueLine open={isEditIssue} onClose={() => setIsEditIssue(false)} workOrderID={workOrderID} woOBAssetID={get(anchorObj, 'woonboardingassets_id')} afterSubmit={postIssueAddSuccess} classCodeOptions={classCodeOptions} isQuote={isQuote} />
        </IssueProvider>
      )}
      {isAttachmentsOpen && <SelectWOAttachments open={isAttachmentsOpen} onClose={onClearAttachments} columns={selectAttachmentColumns} workOrderAttachments={woDetails.workOrderAttachments.filter(item => item.user_uploaded_name?.endsWith('.pdf') || item.filename?.endsWith('.pdf'))} afterSubmit={onSubmitAttachments} />}
    </div>
  )
}

export default AcceptanceTWO
