import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined'
import FilterListOutlinedIcon from '@material-ui/icons/FilterListOutlined'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import assetListAction from '../../Actions/Assets/assetListAction'
import { connect } from 'react-redux'
import enums from '../../Constants/enums'
import URL from '../../Constants/apiUrls'
import _, { get } from 'lodash'
import $ from 'jquery'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import generateBarcodeAction from '../../Actions/Assets/generateBarcodeAction'
import assetFilterStateAction from '../../Actions/Assets/assetFilter.action'
import assetSearchListAction from '../../Actions/Search/assetSearchAction'
import TablePagination from '@material-ui/core/TablePagination'
import debounce from 'lodash.debounce'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getAllAssetAndFilter from '../../Services/Asset/getAllAssetAndFilter'
import { history } from '../../helpers/history'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import assetTabFilterOptions from '../../Services/Asset/assetNameFilterOptions'
import { AssetTypeIcon, StatusComponent, DropDownMenu, Menu } from 'components/common/others'
import { conditionOptions, criticalityOptions, codeComplianceOptions, physicalConditionOptions, thermalClassificationOptions, AppendRandomValueToS3Url, assetStatus } from 'components/WorkOrders/onboarding/utils'
import assetClass from 'Services/WorkOrder/asset-class'
import { ActionButton, MinimalButton } from 'components/common/buttons'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { Toast } from 'Snackbar/useToast'
import preventativeMaintenance from 'Services/preventative-maintenance'
import { exportClassData } from 'components/Assets/export-class-data'
import { exportDetailsLocation } from 'components/Assets/export-details-location'
import { MinimalAutoComplete } from './components'
import PublishOutlinedIcon from '@material-ui/icons/PublishOutlined'
import AddIcon from '@material-ui/icons/Add'
import EditAssetForm from 'components/Assets/AssetDetail/edit-asset/index'
import XLSX from 'xlsx'
import getAllAssetForTree from 'Services/Asset/getAllAssetTree'
import * as yup from 'yup'
import asset from 'Services/assets/index'
import { snakifyKeys } from 'helpers/formatters'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import DialogPrompt from 'components/DialogPrompt'
import updateAssetStatus from 'Services/Asset/updateAssetStatusService'
import './assets.css'
import { MenuItem, Popover, IconButton } from '@material-ui/core'
import { AddCircleOutlineOutlined } from '@material-ui/icons'
import Publish from '@material-ui/icons/Publish'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import getFilterAssetOptimized from 'Services/Asset/getFilterAssetOptimized'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import settings from 'Services/settings'
import { MainContext } from 'components/Main/provider'

var self

const styles = theme => ({
  root: { padding: ' 20px', flexGrow: 1, background: '#fff' },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px', fontWeight: 400 },
  warning: { color: '#d50000' },
  fab: { marginRight: theme.spacing(1) },
  buttonText: { fontSize: '12px', textTransform: 'none' },
  searchInput: { fontSize: '8px' },
  backgroundColor: theme.palette.background.paper,
  headRoot: { cursor: 'pointer', '&:hover': { background: '#e0e0e0 !important' } },
  headFilter: { paddingRight: 0 },
  listbox: {
    fontSize: 12,
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
    },
  },
  LoadingWrapper: { fontSize: 12 },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  badgeRoot: { fontSize: '10px', fontWeight: 800, padding: 0, width: '16px', height: '16px', minWidth: '16px' },
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
      fontSize: '12px',
    },
  },
  autoInput: { width: '100%' },
})

class AssetListEEE extends React.Component {
  constructor() {
    super()
    this.uploadAssetRef = React.createRef()
    self = this
    this.checkUserRole = new getUserRole()
    this.getUserSitesData = new getUserSitesData()
    this.filterEnums = {
      ASSET_NAME: 'ASSET_NAME',
      COMPANY: 'COMPANY',
      OPEN_ISSUES: 'OPEN_ISSUES',
      MODEL: 'MODEL',
      MODEL_YEAR: 'MODEL_YEAR',
      STATUS: 'STATUS',
      SITE_NAME: 'SITE_NAME',
    }
    var loginData = JSON.parse(localStorage.getItem('loginData'))
    this.state = {
      loginData: loginData,
      assetList: [],
      isDownloadBarcode: false,
      selectAll: false,
      chkbox: {},
      searchString: '',
      searchStringOnEnter: false,
      pageIndex: 1,
      pageSize: 20,
      isDataNotFound: false,
      page: 0,
      rowsPerPage: 20,
      tostMsg: {},
      status: enums.assetFilterStatus[1].id,
      selectedIndex: 1,
      selectedSiteFilter: [],
      siteFilterName: [],
      allSites: [],
      filterForColumn: false,
      filterForAssetNameVal: null,
      selectedAssetNameVal: [],
      filterForModelVal: [],
      selectedModelVal: [],
      filterForModelYearVal: [],
      selectedModelYearVal: [],
      allAssetsLists: [],
      allAssetModelLists: [],
      allAssetModelYearLists: [],
      filterForStatus: localStorage.getItem('roleName') === enums.userRoles[0].role ? 1 : 0,
      selectedStatus: null,
      size: 0,
      allIssue: [
        { name: 'All issues', id: false },
        { name: 'Open Issues', id: true },
      ],
      showOpenIssues: false,
      selectedIssueFilter: null,
      clearFilterButton: true,
      assetFilterState: {},
      allCompanies: [],
      availableCompanies: [],
      selectedCompany: [],
      selectedCompanyVal: [],
      allSitesForAdmin: [],
      companyAndSiteFilter: {},
      demoFilter: {},
      allStausLists: [],
      primaryFilterName: '',
      lastAppliedFilter: '',
      isDataLoading: true,
      isAssetNameListLoading: false,
      isCompanyListLoading: false,
      isModelListLoading: false,
      isModelYearListLoading: false,
      isStatusListLoading: false,
      isSiteListLoading: false,
      assetNameOptionsPageIndex: 1,
      companyNameOptionsPageIndex: 1,
      modelNameOptionsPageIndex: 1,
      modelYearOptionsPageIndex: 1,
      siteNameOptionsPageIndex: 1,
      criticalityFilter: null,
      conditionFilter: null,
      buildingFloorRoomSectionOptions: {
        buildings: [],
        floors: [],
        rooms: [],
        sections: [],
      },
      buildingFilter: null,
      floorFilter: null,
      roomFilter: null,
      sectionFilter: null,
      classCodeFilter: null,
      classNameFilter: null,
      classCodeLabel: null,
      assetConditionFilter: null,
      thermalClassificationFilter: null,
      codeComplianceFilter: null,
      isClassDataExporting: false,
      isLocationDataExporting: false,
      isAddAssetOpen: false,
      error: '',
      anchorEl: null,
      isDropdownOptionLoading: false,
      isFilterDropdownDataLoaded: false,
      assetStatus: assetStatus[0].value,
      isDeleteAssetOpen: false,
      isEditAssetOpen: false,
      assetDelete: null,
      assetEdit: null,
    }
    this.handleChkboxChange = this.handleChkboxChange.bind(this)
    this.handlePrintBarcode = this.handlePrintBarcode.bind(this)
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  //*----Fetching initial options
  fetchInitialOptions = async () => {
    this.setState({ isDropdownOptionLoading: true })
    const formatOptions = d => {
      const data = get(d, 'list', []) || []
      const options = data.map(d => ({ asset_id: d.asset_id, label: d.name, value: d.asset_id }))
      return options
    }
    const formatClassName = d => {
      const data = get(d, 'data', []) || []
      const options = data.map(d => ({ ...d, label: d.className, value: d.value, classCode: d.label }))
      return options
    }

    //const payload = this.getFilterOptionsPayload('')
    const payload = { pagesize: 0, pageindex: 0, site_id: [], status: 1, asset_id: [], internal_asset_id: [], model_name: [], model_year: [], show_open_issues: 0, search_string: null, option_search_string: null, company_id: [] }
    const assetNameOpts = await assetTabFilterOptions(URL.filterAssetNameOptions, payload)
    // const assetPaylod = {}
    // const assetOptions = await getAllAssetForTree(URL.getAllAssetForTree, assetPaylod)
    const classCode = await assetClass.getAllAssetClassCodes()

    this.setState({
      // allAssetsLists: this.state.primaryFilterName === this.filterEnums.ASSET_NAME ? this.state.allAssetsLists : assetNameOpts.list,
      allStausLists: enums.assetStatus.slice(0, 2),
      classCodeOptions: _.get(classCode, 'data', []),
      classNameOptions: formatClassName(classCode),
      assetListOptions: formatOptions(assetNameOpts),
      isDropdownOptionLoading: false,
      isFilterDropdownDataLoaded: true,
    })
  }
  //*-----
  async componentDidMount() {
    this.setState({ isDataLoading: true })

    const allSites = []
    if (this.checkUserRole.isSuperAdmin()) {
      const isCompanyAndSiteFilterAvailableForAdmin = this.checkForCompanyAndSiteFilterAvailabilityForAdmin()
      this.setState({ companyAndSiteFilter: isCompanyAndSiteFilterAvailableForAdmin })
    } else {
      const active = this.getUserSitesData.getActiveSite()
      if (this.getUserSitesData.isActiveSiteAllSite(active)) {
        this.state.loginData.usersites.forEach(({ site_id, site_name, status }) => status !== 20 && allSites.push({ site_id, site_name }))
        this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: true } })
      } else {
        this.state.loginData.usersites.forEach(({ site_id, site_name }) => site_id === active && allSites.push({ site_id, site_name }))
        this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: false } })
      }
    }

    if (history.action === 'POP') {
      this.setState(() => this.filterBasedOnColumn())
    } else if (history.location.state && history.location.state.filterFromPie) {
      const filter = physicalConditionOptions.find(d => d.label === history.location.state.payload)
      if (filter) this.handleAssetConditionFilterChange(filter)
      else this.filterBasedOnColumn()
    } else {
      this.setState(
        {
          pageSize: _.get(history, 'location.state.pageSize', 20),
          rowsPerPage: _.get(history, 'location.state.pageSize', 20),
          pageIndex: _.get(history, 'location.state.pageIndex', 1),
          page: _.get(history, 'location.state.pageIndex', 1) - 1,
          filterForAssetNameVal: _.get(history, 'location.state.filterForAssetNameVal', []),
          criticalityFilter: _.get(history, 'location.state.criticalityFilter', null),
          conditionFilter: _.get(history, 'location.state.conditionFilter', null),
          buildingFilter: _.get(history, 'location.state.buildingFilter', null),
          floorFilter: _.get(history, 'location.state.floorFilter', null),
          roomFilter: _.get(history, 'location.state.roomFilter', null),
          sectionFilter: _.get(history, 'location.state.sectionFilter', null),
          classCodeFilter: _.get(history, 'location.state.classCodeFilter', null),
          levelFilter: _.get(history, 'location.state.levelFilter', []),
          thermalClassificationFilter: _.get(history, 'location.state.thermalClassificationFilter', null),
          assetConditionFilter: _.get(history, 'location.state.assetConditionFilter', null),
          codeComplianceFilter: _.get(history, 'location.state.codeComplianceFilter', null),
          searchString: _.get(history, 'location.state.searchString', ''),
          assetStatus: _.get(history, 'location.state.assetStatus', null),
          status: _.get(history, 'location.state.status', 1),
        },
        () => this.filterBasedOnColumn()
      )
    }

    const res = await settings.featuresFlagByCompany()

    const flagKeys = ['egalvanic_ai', 'estimator', 'allowed_to_update_formio', 'is_required_maintenance_command_center', 'is_reactflow_required']
    const featureFlags = get(res, 'data.list', [])
      .filter(d => flagKeys.includes(d.featureName.trim()))
      .reduce((acc, curr) => {
        acc[curr.featureName.trim()] = curr.isRequired
        return acc
      }, {})

    this.context.setFeatureFlag({
      isEgalvanicAI: featureFlags.egalvanic_ai || false,
      isUpdateFormIO: featureFlags.allowed_to_update_formio || false,
      isEstimator: featureFlags.estimator || false,
      isRequiredMaintenanceCommandCenter: featureFlags.is_required_maintenance_command_center || false,
      isReactFlowSingleLine: featureFlags.is_reactflow_required || true,
    })

    window.addEventListener('scroll', this.handleScroll)
    $('#pageLoading').hide()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = debounce(() => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight || $(window).height() > $('body').height()) {
    }
  }, 1000)

  handleDownloadBarcode = () => this.setState({ isDownloadBarcode: !this.state.isDownloadBarcode })

  handleSelectAllChkboxChange = (e, assetList) => {
    const allChkBox = {}

    if (e.target.checked) {
      assetList.forEach(value => (allChkBox[value.assetID] = true))
    } else {
      assetList.forEach(value => (allChkBox[value.assetID] = false))
    }
    this.setState({ chkbox: allChkBox, selectAll: e.target.checked })
  }

  handleChkboxChange = (e, assetList) => {
    e.stopPropagation()
    var chkBoxObj = this.state.chkbox
    if (e.target.checked) {
      chkBoxObj[e.target.id] = true
    } else {
      chkBoxObj[e.target.id] = false
    }
    this.setState({ chkbox: chkBoxObj })
    var chkBoxArr = _.toArray(chkBoxObj)
    var selectAssetCnt = _.filter(chkBoxArr, function (value) {
      if (value === true) return value
    }).length

    if (selectAssetCnt === assetList.length) {
      this.setState({ selectAll: true })
    } else {
      this.setState({ selectAll: false })
    }
  }

  handlePrintBarcode = () => {
    this.setState({ tostMsg: {} })
    setTimeout(() => {
      var selectedAssetList = []
      _.map(this.state.chkbox, function (value, key) {
        if (value === true) {
          selectedAssetList.push(key)
        }
      })
      if (selectedAssetList.length == 0) {
        var tostMsg = this.state.tostMsg
        tostMsg.msg = enums.resMessages.selectAsset
        tostMsg.type = enums.toastMsgType[1].id
        this.setState({ tostMsg: tostMsg })
        this.forceUpdate()
      } else {
        var requestData = {
          assetList: selectedAssetList,
        }
        this.props.generateBarcode(requestData)
      }
    }, 100)
  }
  makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))

  checkForCompanyAndSiteFilterAvailabilityForAdmin = () => {
    const { company_id: allCompanyID, site_id: allSiteID } = this.state.loginData.usersites.filter(site => site.status === 20)[0] || {}
    const companyFilter = localStorage.getItem('companyId') === allCompanyID && localStorage.getItem('siteId') === allSiteID
    const siteFilter = localStorage.getItem('siteId') === allSiteID
    return { companyFilter, siteFilter }
  }
  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ searchString: $('#assetSearchInput').val().trim(), searchStringOnEnter: true, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.filterBasedOnColumn())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.filterBasedOnColumn())
  clearSearch = e => this.setState({ searchString: '', searchStringOnEnter: false, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  clickOnHeaderCell = () => this.setState({ filterForColumn: !this.state.filterForColumn })
  showOpenIssues = (e, val) => this.setState({ lastAppliedFilter: this.filterEnums.OPEN_ISSUES, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.OPEN_ISSUES), showOpenIssues: val ? val.id : false, selectedIssueFilter: val, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())

  handleCriticalityFilterChange = val => this.setState({ page: 0, pageIndex: 1, criticalityFilter: val }, () => this.filterBasedOnColumn())
  handleAssetConditionFilterChange = val => this.setState({ page: 0, pageIndex: 1, assetConditionFilter: val }, () => this.filterBasedOnColumn())
  handleAssetNameFilterChange = val => this.setState({ page: 0, pageIndex: 1, filterForAssetNameVal: val }, () => this.filterBasedOnColumn())
  handleCodeComplianceFilterChange = val => this.setState({ page: 0, pageIndex: 1, codeComplianceFilter: val }, () => this.filterBasedOnColumn())
  handleRoomFilterChange = val => this.setState({ page: 0, pageIndex: 1, roomFilter: val }, () => this.filterBasedOnColumn())
  handleAssetStatsChange = val => this.setState({ page: 0, pageIndex: 1, status: get(val, 'value', enums.assetStatus[0].id), assetStatus: val }, () => this.filterBasedOnColumn())
  handleClassCodeFilterChange = val => this.setState({ page: 0, pageIndex: 1, classCodeFilter: val, classNameFilter: !_.isEmpty(this.state.classNameFilter) ? null : { label: val.className }, classCodeLabel: val }, () => this.filterBasedOnColumn())
  handleClassNameFilterChange = val => this.setState({ page: 0, pageIndex: 1, classCodeFilter: val, classNameFilter: val, classCodeLabel: !_.isEmpty(this.state.classCodeLabel) ? null : { label: val.classCode } }, () => this.filterBasedOnColumn())
  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: this.state.selectedSiteFilter,
    status: this.state.filterForStatus,
    asset_id: [],
    internal_asset_id: [],
    model_name: this.state.filterForModelVal,
    model_year: this.state.filterForModelYearVal,
    show_open_issues: Number(this.state.showOpenIssues),
    search_string: this.state.searchString,
    option_search_string: val,
    company_id: this.state.selectedCompany,
  })

  //*------------------Column Filter----------------------------
  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const {
      pageSize,
      pageIndex,
      selectedCompany,
      selectedCompanyVal,
      loginData,
      filterForAssetNameVal,
      selectedAssetNameVal,
      selectedModelVal,
      selectedModelYearVal,
      siteFilterName,
      selectedStatus,
      selectedSiteFilter,
      showOpenIssues,
      selectedIssueFilter,
      filterForModelVal,
      filterForModelYearVal,
      searchString,
      criticalityFilter,
      conditionFilter,
      buildingFilter,
      floorFilter,
      roomFilter,
      sectionFilter,
      classCodeFilter,
      thermalClassificationFilter,
      assetConditionFilter,
      codeComplianceFilter,
      status,
    } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      user_id: loginData.uuid,
      site_id: selectedSiteFilter,
      status: status ? status : enums.assetStatus[0].id,
      asset_id: !_.isEmpty(filterForAssetNameVal) ? [filterForAssetNameVal.asset_id] : [],
      internal_asset_id: [],
      model_name: filterForModelVal,
      model_year: filterForModelYearVal,
      show_open_issues: Number(showOpenIssues),
      search_string: searchString,
      company_id: selectedCompany,
      criticality_index_type: criticalityFilter ? [criticalityFilter.value] : [],
      condition_index_type: conditionFilter ? [conditionFilter.value] : [],
      formiobuilding_id: buildingFilter ? [buildingFilter.value] : [],
      formiofloor_id: floorFilter ? [floorFilter.value] : [],
      formioroom_id: roomFilter ? [roomFilter.value] : [],
      formiosection_id: sectionFilter ? [sectionFilter.value] : [],
      inspectiontemplate_asset_class_id: classCodeFilter ? [classCodeFilter.value] : [],
      thermal_classification_id: thermalClassificationFilter ? [thermalClassificationFilter.value] : [],
      asset_operating_condition_state: !_.isEmpty(assetConditionFilter) ? [assetConditionFilter.value] : [],
      code_compliance: codeComplianceFilter ? [codeComplianceFilter.value] : [],
    }
    this.props.assetFilterStateAction({ selectedAssetNameVal, selectedIssueFilter, selectedModelVal, selectedModelYearVal, selectedCompanyVal, selectedStatus, siteFilterName })
    const data = await getFilterAssetOptimized(payload)
    const roomsWithBuilding = _.get(data, 'rooms_with_floor_building', []).map(d => ({
      label: `${d.room_name} (${d.building_name},${d.floor_name})`,
      value: d.room_id,
    }))
    if (data.success === false) {
      this.setState(
        {
          assetList: data.list,
          size: data.listsize,
          isDataLoading: false,
          assetNameOptionsPageIndex: 1,
          companyNameOptionsPageIndex: 1,
          modelNameOptionsPageIndex: 1,
          modelYearOptionsPageIndex: 1,
          siteNameOptionsPageIndex: 1,
          buildingFloorRoomSectionOptions: {
            buildings: _.get(data, 'filterassetbuildingbocationoptions.buildings', []),
            floors: _.get(data, 'filterassetbuildingbocationoptions.floors', []),
            rooms: roomsWithBuilding,
            sections: _.get(data, 'filterassetbuildingbocationoptions.sections', []),
          },
        },
        () => this.checkClearFilterDisablity()
      )
      if (this.state.isFilterDropdownDataLoaded === false) {
        this.fetchInitialOptions()
      }
    } else {
      this.setState(
        {
          assetList: [],
          buildingFloorRoomSectionOptions: {
            buildings: _.get(data, 'filterassetbuildingbocationoptions.buildings', []),
            floors: _.get(data, 'filterassetbuildingbocationoptions.floors', []),
            rooms: roomsWithBuilding,
            sections: _.get(data, 'filterassetbuildingbocationoptions.sections', []),
          },
          isDataLoading: false,
        },
        () => this.checkClearFilterDisablity()
      )
      if (this.state.isFilterDropdownDataLoaded === false) {
        this.fetchInitialOptions()
      }
    }

    if (!_.isEmpty(selectedSiteFilter)) {
      this.state.primaryFilterName === this.filterEnums.COMPANY ? this.setState({ companyAndSiteFilter: { companyFilter: true, siteFilter: true } }) : this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: true } })
    } else {
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) {
        this.setState({ companyAndSiteFilter: this.checkForCompanyAndSiteFilterAvailabilityForAdmin() })
      }
    }
  }
  //*-------------------------------------------------------------

  handleOnClickOnIssue = data => {
    if (this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isSuperAdmin()) return
    const state = this.state.allAssetsLists.filter(asset => asset.asset_id === data.id)[0]
    history.push({ pathname: `/issues`, state })
  }

  viewDetails = (e, id) => {
    const {
      pageSize,
      pageIndex,
      selectedCompany,
      selectedCompanyVal,
      loginData,
      assetId,
      selectedAssetNameVal,
      filterForAssetNameVal,
      selectedModelVal,
      selectedModelYearVal,
      siteFilterName,
      selectedStatus,
      filterForStatus,
      selectedSiteFilter,
      showOpenIssues,
      selectedIssueFilter,
      filterForModelVal,
      filterForModelYearVal,
      searchString,
      criticalityFilter,
      conditionFilter,
      buildingFilter,
      floorFilter,
      roomFilter,
      sectionFilter,
      classCodeFilter,
      levelFilter,
      thermalClassificationFilter,
      assetConditionFilter,
      codeComplianceFilter,
      assetStatus,
      status,
    } = this.state

    const allState = {
      pageSize,
      pageIndex,
      selectedCompany,
      selectedCompanyVal,
      loginData,
      assetId,
      selectedAssetNameVal,
      selectedModelVal,
      selectedModelYearVal,
      siteFilterName,
      selectedStatus,
      filterForStatus,
      selectedSiteFilter,
      showOpenIssues,
      selectedIssueFilter,
      filterForModelVal,
      filterForModelYearVal,
      searchString,
      criticalityFilter,
      conditionFilter,
      buildingFilter,
      floorFilter,
      roomFilter,
      sectionFilter,
      classCodeFilter,
      filterForAssetNameVal,
      levelFilter,
      thermalClassificationFilter,
      assetConditionFilter,
      codeComplianceFilter,
      assetStatus,
      status,
    }

    if (this.checkUserRole.isManager() || this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isExecutive()) history.push({ pathname: `assets/details/${id}`, state: { allState: JSON.parse(JSON.stringify(allState)) } })
  }

  checkClearFilterDisablity = () => {
    if (
      !_.isEmpty(this.state.criticalityFilter) ||
      !_.isEmpty(this.state.conditionFilter) ||
      !_.isEmpty(this.state.buildingFilter) ||
      !_.isEmpty(this.state.floorFilter) ||
      !_.isEmpty(this.state.roomFilter) ||
      !_.isEmpty(this.state.sectionFilter) ||
      !_.isEmpty(this.state.classCodeFilter) ||
      !_.isEmpty(this.state.levelFilter) ||
      !_.isEmpty(this.state.assetConditionFilter) ||
      !_.isEmpty(this.state.thermalClassificationFilter) ||
      !_.isEmpty(this.state.codeComplianceFilter) ||
      !_.isEmpty(this.state.selectedAssetNameVal) ||
      !_.isEmpty(this.state.selectedIssueFilter) ||
      !_.isEmpty(this.state.selectedModelVal) ||
      !_.isEmpty(this.state.selectedModelYearVal) ||
      !_.isEmpty(this.state.selectedStatus) ||
      !_.isEmpty(this.state.classCodeLabel) ||
      !_.isEmpty(this.state.classNameFilter) ||
      !_.isEmpty(this.state.siteFilterName) ||
      !_.isEmpty(this.state.selectedCompanyVal) ||
      !_.isEmpty(this.state.filterForAssetNameVal) ||
      !_.isEmpty(this.state.assetStatus)
    ) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', assetNameOptionsPageIndex: 1, companyNameOptionsPageIndex: 1, modelNameOptionsPageIndex: 1, modelYearOptionsPageIndex: 1, siteNameOptionsPageIndex: 1 })
    }
  }

  clearFilters = () => {
    this.setState(
      {
        pagesize: 20,
        pageIndex: 1,
        page: 0,
        selectedSiteFilter: [],
        filterForStatus: localStorage.getItem('roleName') === enums.userRoles[0].role ? 3 : 0,
        filterForAssetNameVal: [],
        filterForModelVal: [],
        filterForModelYearVal: [],
        showOpenIssues: 0,
        siteFilterName: [],
        selectedIssueFilter: null,
        selectedAssetNameVal: [],
        selectedModelVal: [],
        selectedModelYearVal: [],
        selectedStatus: null,
        selectedCompany: [],
        selectedCompanyVal: [],
        primaryFilterName: '',
        criticalityFilter: null,
        conditionFilter: null,
        buildingFilter: null,
        floorFilter: null,
        roomFilter: null,
        classNameFilter: null,
        classCodeLabel: null,
        sectionFilter: null,
        classCodeFilter: null,
        assetConditionFilter: null,
        thermalClassificationFilter: null,
        codeComplianceFilter: null,
        assetStatus: null,
        status: enums.assetStatus[0].id,
      },
      () => this.filterBasedOnColumn()
    )
  }
  renderInspectionVerdictChip = verdict => {
    if (!verdict) return '-'
    const { color, label } = enums.INSPECTION_VERDICT_CHIPS.find(d => d.value === verdict)
    return <span style={{ padding: '2px 12px', borderRadius: '12px', background: color, color: '#fff', fontWeight: 800, whiteSpace: 'nowrap' }}>{label}</span>
  }
  renderChip = (value, type) => {
    if (!value) return <div style={{ height: '25px' }}></div>
    const options = type === 'CONDITION' ? conditionOptions : type === 'CODE' ? codeComplianceOptions : type === 'PHYSICAL' ? physicalConditionOptions : type === 'THERMAL' ? thermalClassificationOptions : criticalityOptions
    const x = options.find(d => d.value === value)
    if (!x) return <div style={{ height: '25px' }}></div>
    return (
      <div style={{ padding: '4px' }}>
        <StatusComponent color={x.color} label={x.label} size='small' filled={type === 'PHYSICAL'} hasDarkContrast={type === 'PHYSICAL'} />
      </div>
    )
  }
  renderLocationDetails = (obj, name) => {
    if (!obj) return '-'
    const data = obj[name]
    if (!data) return '-'
    return (
      <Tooltip title={data} placement='top'>
        <div>
          {data.slice(0, 25)}
          {data.length > 25 && <span>...</span>}
        </div>
      </Tooltip>
    )
  }
  // export class
  exportClassWithPmConditions = async () => {
    try {
      this.setState({ isClassDataExporting: true })
      const res = await preventativeMaintenance.workOrder.getAssetPMConditionDataForExport({ siteId: getApplicationStorageItem('siteId') })
      if (res.success > 0) exportClassData(res.data)
      else Toast.error(res.message || 'Error exporting data. Please try again !')
      this.setState({ isClassDataExporting: false })
    } catch (error) {
      Toast.error('Error exporting data. Please try again !')
      this.setState({ isClassDataExporting: false })
    }
  }

  // export location details
  exportLocationDetails = async () => {
    try {
      this.setState({ isLocationDataExporting: true })
      const res = await preventativeMaintenance.asset.exportAssetsLocationDetails({ siteId: getApplicationStorageItem('siteId') })
      if (res.success > 0) exportDetailsLocation(res.data)
      else Toast.error(res.message || 'Error exporting data. Please try again !')
      this.setState({ isLocationDataExporting: false })
    } catch (error) {
      Toast.error('Error Exporting data. PLease try again !')
      this.setState({ isLocationDataExporting: true })
    }
  }

  // bulk upload
  handleUploadAsset = () => {
    this.setState({ error: '' })
    if (this.uploadAssetRef.current) {
      this.uploadAssetRef.current.click()
    }
  }

  addAsset = e => {
    e.preventDefault()
    if (!e.target.files[0]) return
    const reader = new FileReader()
    const file = e.target.files[0]
    reader.onload = d => {
      const extension = file.name.split('.').slice(-1).pop()
      if (!['csv', 'xls', 'xlsx', 'xlsm', 'xltx', 'xltm'].includes(extension)) {
        this.setState({ error: enums.errorMessages.error_msg_file_format })
      } else {
        this.setState({ error: '' })
        const binaryStr = d.target.result
        const wb = XLSX.read(binaryStr, { type: 'binary' })

        const excelData = {}
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName]
          const data = XLSX.utils.sheet_to_json(ws)
          excelData[sheetName] = data
        })
        this.validateSheet(excelData)
      }
    }
    reader.readAsBinaryString(file)
    e.target.value = null
  }

  validateSheet = async data => {
    try {
      const schema = yup.array().of(
        yup.object().shape({
          assetName: yup.string().nullable().required('Asset Name is required'),
          assetClassCode: yup.string().nullable().required('Asset Class Code is required'),
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

      const parse = d => (_.isEmpty(d) ? null : d)

      const assetData = _.get(data, 'Assets', []).map(d => ({
        assetName: _.get(d, 'Asset Name', '').toString().trim(),
        assetClassCode: _.get(d, 'Asset Class Code', '').toString().trim(),
        building: parse(_.get(d, 'Building', '').toString().trim()),
        floor: parse(_.get(d, 'Floor', '').toString().trim()),
        room: parse(_.get(d, 'Room', '').toString().trim()),
        section: parse(_.get(d, 'Section', '').toString().trim()),
        assetPlacement: parse(_.get(d, 'Location', '').toString().trim().toLowerCase()) === 'indoor' ? 1 : parse(_.get(d, 'Location', '').toString().trim().toLowerCase()) === 'outdoor' ? 2 : null,
        qrCode: _.get(d, 'QR Code', '').toString(),
        assetOperatingConditionState: this.getFormattedOptions(_.get(d, 'Asset Condition', '').toString().trim(), 'OC'),
        criticalityIndexType: this.getFormattedOptions(_.get(d, 'Criticality', '').toString().trim(), 'CRIT'),
        conditionIndexType: this.getFormattedOptions(_.get(d, 'Operating Condition', '').toString().trim(), 'COND'),
        componentLevelTypeId: 1,
        assetId: _.get(d, 'Asset ID', null)?.toString().trim() ?? null,
      }))

      const assetsFedbyMappings = _.get(data, 'Connections', [])
        .map(d => ({
          assetName: _.get(d, 'Asset Name', '').toString().trim(),
          ocpAssetName: _.get(d, 'OCP Main', '').toString().trim(),
          fedbyAssetName: _.get(d, 'Fed-by Asset Name', '').toString().trim(),
          fedbyOcpAssetName: _.get(d, 'OCP', '').toString().trim(),
          length: _.get(d, 'Conductor Length', '').toString().trim(),
          style: _.get(d, 'Conductor Size', '').toString().trim(),
          numberOfConductor: parseInt(_.get(d, 'Conductor Number', 0)),
          conductorTypeId: _.get(d, 'Conductor Material', '').toLowerCase() === 'copper' ? 1 : _.get(d, 'Conductor Material', '').toLowerCase() === 'aluminium' ? 2 : null,
          racewayTypeId: _.get(d, 'Raceway Type', '').toLowerCase() === 'metallic' ? 1 : _.get(d, 'Raceway Type', '').toLowerCase() === 'non metallic' ? 2 : null,
          fedByUsageTypeId: _.get(d, 'Type', '').toLowerCase() === 'n' || _.get(d, 'Type', '').toLowerCase() === 'normal' ? 1 : _.get(d, 'Type', '').toLowerCase() === 'e' || _.get(d, 'Type', '').toLowerCase() === 'emergency' ? 2 : 1,
        }))
        .filter(val => !_.isEmpty(val.assetName && val.fedbyAssetName))

      const assetSubcomponentsMappings = _.get(data, 'Sub-Components', [])
        .map(d => ({
          toplevelAssetName: _.get(d, 'Asset Name', '').toString().trim(),
          subcomponentAssetName: _.get(d, 'Sub-Component Name', '').toString().trim(),
          subcomponentAssetClassCode: _.get(d, 'Sub-Component Asset Class Code', '').toString().trim(),
        }))
        .filter(val => !_.isEmpty(val.toplevelAssetName && val.subcomponentAssetName && val.subcomponentAssetClassCode))
      const payload = {
        assetData,
        assetsFedbyMappings,
        assetSubcomponentsMappings,
      }
      await schema.validate(payload.assetData, { abortEarly: false })
      await this.uploadAsset(payload)
    } catch (error) {
      try {
        const lineNo = Number((error.inner[0]?.path || '').split('.')[0].match(/\[(.*?)\]/)?.[1])
        const errorMessage = error.inner[0]?.message || 'Unknown error'
        this.setState({ error: `${errorMessage} on Line [${lineNo + 2}]` })
      } catch (error) {
        this.setState({ error: 'Error reading file!' })
        console.log(error)
      }
    }
  }

  getFormattedOptions = (val, type) => {
    const optionsObjects = {
      COND: conditionOptions,
      CRIT: criticalityOptions,
      OC: physicalConditionOptions,
    }

    if (!val) return null
    const options = optionsObjects[type]
    const op = options.find(d => d.label.toLowerCase() === val.toLowerCase())
    return !_.isEmpty(op) ? op.value : null
  }

  serialDateToJSDate = serialDate => {
    if (!serialDate) return null
    const hours = Math.floor((serialDate % 1) * 24)
    const minutes = Math.floor(((serialDate % 1) * 24 - hours) * 60)
    const date = new Date(Date.UTC(0, 0, serialDate, hours - 17, minutes))
    return date.toISOString()
  }

  uploadAsset = async data => {
    if (_.isEmpty(data)) return Toast.error(`Selected file does not have any data !`)
    $('#pageLoading').show()
    try {
      const res = await asset.uploadBulkMainAssets(snakifyKeys(data))
      if (res.success > 0) {
        Toast.success(`Asset uploaded Successfully !`)
        this.filterBasedOnColumn()
      } else {
        Toast.error(res.message)
      }
    } catch (error) {
      Toast.error(`Error uploading Asset. Please try again !`)
    }
    $('#pageLoading').hide()
  }

  downloadSample = () => {
    const link = document.createElement('a')
    link.href = AppendRandomValueToS3Url(URL.sampleMainAsset)
    link.click()
  }

  deleteAsset = async () => {
    this.setState({ deleteLoading: true })
    try {
      const res = await updateAssetStatus({ asset_id: get(this.state.assetDelete, 'assetID', null), status: enums.assetStatus[3].id })
      if (res.data.success === 1) Toast.success(`Asset deleted successfully !`)
      else Toast.error(res.message)
      this.setState({ deleteLoading: false, isDeleteAssetOpen: false }, () => this.filterBasedOnColumn())
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong')
      this.setState({ deleteLoading: false, isDeleteAssetOpen: false })
    }
  }

  render() {
    const filterOptions = createFilterOptions({
      matchFrom: 'any',
      stringify: option => option.name.trim() + option.internal_asset_id,
      trim: true,
    })
    const { classes } = this.props
    var rows = []

    const createData = (id, name, openIssuesCount, company, category, modelYear, site, status, statusId, assetID, AssetObj) => ({ id, name, openIssuesCount, company, category, modelYear, site, status, statusId, assetID, AssetObj })

    if (!_.isEmpty(this.state.assetList)) {
      rows = []
      this.state.assetList.map((value, key) => {
        var result = createData(value.asset_id, value.asset_name, value.openIssuesCount, value.company_name, value.model_name, value.model_year, value.site_name, value.status_name, value.status, value.asset_id, value)
        rows.push(result)
        return
      })
    }

    const dropDownMenuOptions = [
      // {
      //   id: 1,
      //   type: 'button',
      //   text: 'Create Asset',
      //   onClick: () => this.setState({ isAddAssetOpen: true }),
      //   icon: <AddIcon fontSize='small' />,
      //   show: true,
      // },
      // {
      //   id: 2,
      //   type: 'button',
      //   text: 'Upload Assets',
      //   onClick: this.handleUploadAsset,
      //   icon: <PublishOutlinedIcon fontSize='small' />,
      //   show: true,
      // },
      { id: 3, type: 'button', text: 'Export Assets Details by Location', onClick: this.exportLocationDetails, icon: <GetAppOutlinedIcon fontSize='small' />, show: this.checkUserRole.isExecutive() ? false : true },
      { id: 4, type: 'button', text: 'Download Barcode', onClick: this.handleDownloadBarcode, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
      // { id: 5, type: 'input', show: true, onChange: this.addAsset, ref: this.uploadAssetRef },
      { id: 6, type: 'button', text: 'Download Sample File', onClick: this.downloadSample, icon: <GetAppOutlinedIcon fontSize='small' />, show: true },
    ]

    // const downloadDropDownMenuOptions = [
    //   { id: 3, text: 'Export Assets Details by Location', action: this.exportLocationDetails, isHide: this.checkUserRole.isExecutive() ? true : false },
    //   { id: 4, text: 'Download Barcode', action: this.handleDownloadBarcode, isHide: false },
    //   { id: 6, text: 'Download Sample File', action: this.downloadSample, isHide: this.checkUserRole.isExecutive() ? true : false },
    // ]

    return (
      <div style={{ height: 'calc(100vh - 128px)', padding: '20px', background: '#fff' }}>
        <div className='d-flex flex-row justify-content-between align-items-center' style={{ marginBottom: '16px' }}>
          <div className='d-flex align-items-center'>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
              <input ref={this.uploadAssetRef} type='file' style={{ display: 'none' }} onChange={this.addAsset} />
              {/* {!this.checkUserRole.isExecutive() && <ActionButton tooltipPlacement='top' icon={<AddCircleOutlineOutlined size='small' />} tooltip='Create Asset' action={() => this.setState({ isAddAssetOpen: true })} />} */}
              {!this.checkUserRole.isExecutive() && <MinimalButton onClick={() => this.setState({ isAddAssetOpen: true })} text='Create Asset' size='small' startIcon={<AddIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginRight: '10px' }} />}
              {!this.checkUserRole.isExecutive() && <DropDownMenu dropDownMenuOptions={dropDownMenuOptions} startIcon={<GetAppOutlinedIcon fontSize='small' />} btnText='Download' />}
              {/* {!this.checkUserRole.isExecutive() && <ActionButton tooltipPlacement='top' icon={<Publish size='small' />} tooltip='Upload Assets' action={this.handleUploadAsset} />} */}
              {!this.checkUserRole.isExecutive() && <MinimalButton onClick={this.handleUploadAsset} text='Upload Assets' size='small' startIcon={<PublishOutlinedIcon fontSize='small' />} variant='contained' color='primary' baseClassName='nf-buttons' style={{ marginLeft: '10px' }} />}
            </div>
            {this.state.isDownloadBarcode && (
              <Button size='small' disableElevation variant='contained' color='primary' className='nf-buttons ml-2' onClick={this.handlePrintBarcode}>
                Print Barcode
              </Button>
            )}
            {/* <Menu options={this.downloadDropDownMenuOptions} data={[]} tooltipPlacement='top' actionToolipText='Download' width={250} MainIcon={GetAppOutlinedIcon} isAlignLeft={true} iconSize='default' /> */}
            {/* <IconButton onClick={e => this.setState({ anchorEl: e.currentTarget })} size='small'>
              <GetAppOutlinedIcon />
              <ArrowDropDownIcon fontSize='small' style={{ marginLeft: '-5px' }} />
            </IconButton>
            <Popover
              id='schedule-list-menu'
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={() => this.setState({ anchorEl: null })}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={() => this.setState({ anchorEl: null }, () => this.exportLocationDetails())}>Export Assets Details by Location</MenuItem>
              <MenuItem onClick={() => this.setState({ anchorEl: null }, () => this.handleDownloadBarcode())}>Download Barcode</MenuItem>
              <MenuItem onClick={() => this.setState({ anchorEl: null }, () => this.downloadSample())}>Download Sample File</MenuItem>
            </Popover> */}
            {/* <Button size='small' onClick={this.handleDownloadBarcode} startIcon={<ArrowDownwardOutlinedIcon />} variant='contained' color='primary' className='nf-buttons mr-2' disableElevation>
              Download Barcode
            </Button> */}

            {(this.state.isClassDataExporting || this.state.isLocationDataExporting) && <div className='ml-2 text-bold'>Exporting ...</div>}
            {this.state.error && <span style={{ fontWeight: 800, color: 'red', marginLeft: '16px' }}>{this.state.error}</span>}
            {/* <div style={{ display: 'flex', alignItems: 'center' }}>
              <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Asset Count by Class, Condition' action={this.exportClassWithPmConditions} isLoading={this.state.isClassDataExporting} style={{ display: 'none' }} />
              {this.state.isClassDataExporting && <div className='ml-1 text-bold'>Exporting ...</div>}
            </div> */}
            {/* <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
              <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Asset Details by Location' action={this.exportLocationDetails} isLoading={this.state.isLocationDataExporting} />
              {this.state.isLocationDataExporting && <div className='ml-1 text-bold'>Exporting ...</div>}
            </div> */}
          </div>
          <div className='d-flex align-items-center'>
            <TextField
              className={classes.searchInput}
              id='assetSearchInput'
              fullWidth={true}
              placeholder='Search Assets '
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchOutlined color='primary' />{' '}
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment className='pointerCursor' position='end' onClick={e => this.clearSearch(e)}>
                    {this.state.searchString ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                  </InputAdornment>
                ),
              }}
              value={this.state.searchString}
              onChange={e => this.setState({ searchString: e.target.value })}
              onKeyDown={e => this.handleSearchOnKeyDown(e)}
            />
            <div className='mx-2'>
              <ActionButton action={this.clickOnHeaderCell} icon={<FilterListOutlinedIcon fontSize='small' />} tooltip='' style={{ padding: '6px', color: 'white', backgroundColor: '#778899', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '195px' }}>
              <MinimalButton text='Reset Filter' onClick={() => this.clearFilters()} disabled={this.state.clearFilterButton} size='small' startIcon={<RotateLeftSharpIcon />} variant='contained' color='primary' />
            </div>
          </div>
        </div>
        {this.state.filterForColumn && (
          <div className='d-flex flex-wrap mt-2 mb-3' style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '4px' }}>
            <MinimalAutoComplete w={19} value={this.state.filterForAssetNameVal} placeholder='Select Identification' label='Identification' isClearable baseStyles={{ zIndex: '7' }} options={_.get(this.state, 'assetListOptions', [])} onChange={val => this.handleAssetNameFilterChange(val)} isLoading={this.state.isDropdownOptionLoading} />
            <MinimalAutoComplete w={19} value={this.state.assetConditionFilter} placeholder='Select Condition' label='Asset Condition' options={physicalConditionOptions} isClearable baseStyles={{ zIndex: '6' }} onChange={val => this.handleAssetConditionFilterChange(val)} />
            <MinimalAutoComplete w={19} value={this.state.criticalityFilter} options={criticalityOptions} placeholder='Select Criticality' label='Criticality' isClearable baseStyles={{ zIndex: '6' }} onChange={val => this.handleCriticalityFilterChange(val)} />
            <MinimalAutoComplete w={19} value={this.state.codeComplianceFilter} options={codeComplianceOptions} placeholder='Select Code Compliance' label='Code Compliance' isClearable baseStyles={{ zIndex: '6' }} onChange={val => this.handleCodeComplianceFilterChange(val)} />
            <MinimalAutoComplete w={19} value={this.state.classCodeLabel} options={_.get(this.state, 'classCodeOptions', [])} placeholder='Select Class Code' label='Class Code' isClearable baseStyles={{ zIndex: '6' }} onChange={val => this.handleClassCodeFilterChange(val)} isLoading={this.state.isDropdownOptionLoading} />
            <MinimalAutoComplete w={19} value={this.state.classNameFilter} options={_.get(this.state, 'classNameOptions', [])} placeholder='Select Class Name' label='Class Name' isClearable baseStyles={{ zIndex: '5' }} onChange={val => this.handleClassNameFilterChange(val)} isLoading={this.state.isDropdownOptionLoading} />
            <MinimalAutoComplete w={19} value={this.state.roomFilter} options={_.get(this.state, 'buildingFloorRoomSectionOptions.rooms', [])} placeholder='Select Room' label='Room' baseStyles={{ zIndex: '5' }} isClearable onChange={val => this.handleRoomFilterChange(val)} />
            <MinimalAutoComplete w={19} value={this.state.assetStatus} options={assetStatus} placeholder='Select Status' label='Status' baseStyles={{ zIndex: '5' }} onChange={val => this.handleAssetStatsChange(val)} isClearable />
          </div>
        )}
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: `calc(100vh - ${this.state.filterForColumn ? '385px' : '190px'})` }}>
          <Table onWheel={e => this.handleScroll()} size='small' stickyHeader={true}>
            <TableHead>
              <TableRow>
                {this.state.isDownloadBarcode && (
                  <TableCell id='selectAllChkbox' align='left' padding='normal'>
                    <Checkbox color='primary' size='small' id='selectAll' name='selectAll' checked={this.state.selectAll} onChange={e => this.handleSelectAllChkboxChange(e, rows)} style={{ padding: 0 }} />
                  </TableCell>
                )}
                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(_.get(this.state, 'filterForAssetNameVal', [])) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                  <div className='d-flex align-items-center'>{'Identification'}</div>
                </TableCell>
                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(this.state.assetConditionFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='category' align='left' padding='normal'>
                  <div className='d-flex  align-items-center'>{'Asset Condition'}</div>
                </TableCell>

                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(this.state.criticalityFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='category' align='left' padding='normal'>
                  <div className='d-flex align-items-center'>{'Criticality'}</div>
                </TableCell>

                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(this.state.codeComplianceFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='modelYear' align='left' padding='normal'>
                  <div className='d-flex align-items-center'>{'Code Compliance'}</div>
                </TableCell>

                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(this.state.classCodeFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='modelYear' align='left' padding='normal'>
                  <div className='d-flex align-items-center'>{'Class Code'}</div>
                </TableCell>
                <TableCell classes={{ root: classes.headRoot }} style={!_.isEmpty(this.state.classCodeFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }} id='modelYear' align='left' padding='normal'>
                  <div className='d-flex align-items-center'>{'Class Name'}</div>
                </TableCell>

                <TableCell classes={{ root: classes.headRoot }} align='left' padding='normal' style={!_.isEmpty(this.state.roomFilter) ? { background: '#eeeeee' } : { background: '#fafafa' }}>
                  <div className='d-flex align-items-center'>{'Room'}</div>
                </TableCell>
                <TableCell classes={{ root: classes.headRoot }} align='left' padding='normal' style={!_.isEmpty(this.state.assetStatus) ? { background: '#eeeeee' } : { background: '#fafafa' }}>
                  <div className='d-flex align-items-center'>Actions</div>
                </TableCell>
              </TableRow>
            </TableHead>
            {this.state.isDataLoading ? (
              <TableLoader cols={8} />
            ) : _.isEmpty(rows) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='10' className='Pendingtbl-no-datafound'>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {rows.map((tableRow, key) => {
                  return (
                    <TableRow onClick={e => this.viewDetails(e, tableRow.AssetObj.asset_id)} key={key} className='table-with-row-click'>
                      {this.state.isDownloadBarcode && (
                        <TableCell className={classes.tableCell}>
                          <Checkbox
                            style={{ padding: 0 }}
                            id={tableRow.assetID}
                            name={tableRow.assetID}
                            color='primary'
                            value='chkBox'
                            size='small'
                            checked={this.state.chkbox[tableRow.assetID] || false}
                            onClick={event => event.stopPropagation()}
                            onChange={e => this.handleChkboxChange(e, rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage))}
                          />
                        </TableCell>
                      )}
                      <TableCell className={classes.tableCell}>
                        <div className='d-flex align-items-center'>
                          <AssetTypeIcon type={tableRow.AssetObj.asset_class_type} />
                          {tableRow.name ? (
                            <Tooltip title={tableRow.name} placement='top'>
                              <div>
                                {tableRow.name.slice(0, 30)}
                                {tableRow.name.length > 30 && <span>...</span>}
                              </div>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.AssetObj ? this.renderChip(tableRow.AssetObj.asset_operating_condition_state, 'PHYSICAL') : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.AssetObj ? this.renderChip(tableRow.AssetObj.criticality_index_type, '') : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.AssetObj ? this.renderChip(tableRow.AssetObj.code_compliance, 'CODE') : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>
                        {tableRow.AssetObj ? (
                          <Tooltip title={_.get(tableRow, 'AssetObj.asset_class_code', '') || ''} placement='top'>
                            <div>
                              {(_.get(tableRow, 'AssetObj.asset_class_code', '') || '').slice(0, 25)}
                              {(_.get(tableRow, 'AssetObj.asset_class_code', '') || '').length > 25 && <span>...</span>}
                            </div>
                          </Tooltip>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.AssetObj ? this.renderLocationDetails(tableRow.AssetObj, 'asset_class_name') : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.AssetObj ? this.renderLocationDetails(tableRow.AssetObj, 'room') : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <ActionButton tooltip='EDIT' action={e => (e.stopPropagation(), this.setState({ assetEdit: tableRow, isEditAssetOpen: true }))} icon={<EditOutlinedIcon fontSize='small' />} />
                        <Tooltip title='Delete' placement='top'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              this.setState({ assetDelete: tableRow, isDeleteAssetOpen: true })
                            }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>
        <DialogPrompt title='Delete Asset' text='Are you sure you want to delete this Asset ?' open={this.state.isDeleteAssetOpen} ctaText='Delete' actionLoader={this.state.deleteLoading} action={this.deleteAsset} handleClose={() => this.setState({ isDeleteAssetOpen: false })} />
        {_.isEmpty(rows) ? '' : <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
        {this.state.isAddAssetOpen && <EditAssetForm open={this.state.isAddAssetOpen} editType='ASSET' onClose={() => this.setState({ isAddAssetOpen: false })} classCodeOptions={_.get(this.state, 'classCodeOptions', [])} isNew status={3} refetch={() => this.filterBasedOnColumn()} />}
        {this.state.isEditAssetOpen && (
          <EditAssetForm
            refetch={() => this.filterBasedOnColumn()}
            assetId={this.state.assetEdit.id}
            status={this.state.assetEdit.statusId}
            name={this.state.assetEdit.name}
            open={this.state.isEditAssetOpen}
            indexes={{ conditionIndex: { value: this.state.assetEdit.AssetObj.condition_index_type }, criticalIndex: { value: this.state.assetEdit.AssetObj.criticality_index_type } }}
            editType='ASSET'
            onClose={() => this.setState({ isEditAssetOpen: false })}
            mainListEdit
          />
        )}
      </div>
    )
  }
}
function mapState(state) {
  if (state.assetListReducer) {
    if (self) {
      self.setState({ isDataNotFound: state.assetListReducer.isDataNoFound, tostMsg: state.assetListReducer.tostMsg })
      if (!_.isEmpty(state.assetListReducer.tostMsg)) {
        self.setState({ tostMsg: state.assetListReducer.tostMsg })
      }
    }
  }

  if (state.generateBarcodeReducer) {
    if (state.generateBarcodeReducer.loading) {
    } else {
      if (self) {
        self.setState({ selectAll: false, chkbox: {} })
        if (!_.isEmpty(state.generateBarcodeReducer.tostMsg)) {
          self.setState({ tostMsg: state.generateBarcodeReducer.tostMsg })
        }
      }
    }
  }
  if (state.assetFilterStateReducer) {
    if (self) {
      self.setState({ assetFilterState: state.assetFilterStateReducer.assetFilters })
    }
  }

  return state
}

const actionCreators = {
  assetList: assetListAction,
  generateBarcode: generateBarcodeAction,
  assetSearchList: assetSearchListAction,
  assetFilterStateAction,
}

AssetListEEE.propTypes = {
  classes: PropTypes.object.isRequired,
}
AssetListEEE.contextType = MainContext
export default connect(mapState, actionCreators)(withStyles(styles)(AssetListEEE))
