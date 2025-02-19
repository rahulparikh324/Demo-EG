import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import { connect } from 'react-redux'
import inspectionListAction from '../../Actions/Inspection/inspectionListAction'
import inspectionFilterStateAction from '../../Actions/Inspection/inspectionFilter.action'
import inspectionSearchListAction from '../../Actions/Search/inspectionSearchAction'
import approveInspectionAction from '../../Actions/Inspection/approveInspectionAction'
import approveInspection from '../../Services/Inspection/approveInspectionService'
import inspectionStateUpdate from '../../Actions/Inspection/inspectionStateUpdate'
import CheckCircleOutlinedIcon from '@material-ui/icons/CheckCircleOutlined'
import TablePagination from '@material-ui/core/TablePagination'
import $ from 'jquery'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import moment from 'moment'
import debounce from 'lodash.debounce'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'
import PendingInspectionApprovePopup from './pendingInspectionApprovePopup'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { Toast } from '../../Snackbar/useToast'
import FilterListIcon from '@material-ui/icons/FilterList'
import Badge from '@material-ui/core/Badge'
import ImageIcon from '@material-ui/icons/Image'
import WarningIcon from '@material-ui/icons/Warning'
import Chip from '@material-ui/core/Chip'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getAllInspectionAndFilter from '../../Services/Inspection/getAllInspectionAndFilter'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Button from '@material-ui/core/Button'
import momenttimezone from 'moment-timezone'
import companyList from '../../Services/getAllCompany'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import inspectionFilterOptions from '../../Services/Inspection/inspectionFilterOptions'
import URL from '../../Constants/apiUrls'

var self

const styles = theme => ({
  root: { padding: 20, flexGrow: 1, background: '#fff' },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px', fontWeight: 400 },
  warning: { color: '#d50000' },
  fab: { marginRight: theme.spacing(1) },
  buttonText: { fontSize: '12px', textTransform: 'none' },
  searchInput: { fontSize: '8px' },
  badge: { transform: 'scale(0.8) translate(50%, -50%)' },
  badgeRoot: { fontSize: '10px', fontWeight: 800, padding: 0, width: '16px', height: '16px', minWidth: '16px' },
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
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
      fontSize: '12px',
    },
  },
})

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 500,
    maxHeight: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    overflowY: 'scroll',
  },
}))(Tooltip)

class InspectionList extends React.Component {
  constructor() {
    super()
    self = this
    this.checkUserRole = new getUserRole()
    this.getUserSitesData = new getUserSitesData()
    var loginData = JSON.parse(localStorage.getItem('loginData'))
    this.filterEnums = {
      ASSET_NAME: 'ASSET_NAME',
      COMPANY: 'COMPANY',
      STATUS: 'STATUS',
      SHIFT: 'SHIFT',
      REQUESTOR: 'REQUESTOR',
      SITE_NAME: 'SITE_NAME',
      SUPERVISOR: 'SUPERVISOR',
    }
    this.state = {
      loginData: loginData,
      searchString: '',
      searchStringOnEnter: false,
      pageIndex: 1,
      pageSize: 20,
      isDataNotFound: false,
      page: 0,
      rowsPerPage: 20,
      currentTimeZone: '',
      showInspectionPopUp: false,
      tostMsg: {},
      anchorEl2: null,
      selectedSiteFilter: [],
      siteFilterName: [],
      allSites: loginData.usersites.map(({ site_id, site_name }) => ({ site_id, site_name })),
      filterForColumn: false,
      filterForAssetNameVal: [],
      selectedAssetNameVal: [],
      filterForAssetInternalId: [],
      filterForStatus: 0,
      selectedStatus: null,
      filterForShift: [],
      selectedShift: [],
      filterForRequestor: [],
      selectedReq: [],
      allAssetsLists: [],
      allStausLists: [],
      filterNewAttribute: false,
      filterNewAttributeVal: null,
      allShiftLists: [],
      allIssue: [
        { name: 'All issues', id: false },
        { name: 'New Issues', id: true },
      ],
      allRequestorLists: [],
      inspectionList: [],
      size: 0,
      clearFilterButton: true,
      allCompanies: [],
      availableCompanies: [],
      selectedCompany: [],
      selectedCompanyVal: [],
      allSitesForAdmin: [],
      companyAndSiteFilter: {},
      allStausLists: [],
      primaryFilterName: '',
      isDataLoading: true,
      isAssetNameListLoading: false,
      isCompanyListLoading: false,
      isShiftListLoading: false,
      isRequestorListLoading: false,
      isStatusListLoading: false,
      isSiteListLoading: false,
      isSupListLoading: false,
      assetNameOptionsPageIndex: 1,
      companyOptionsPageIndex: 1,
      siteOptionsPageIndex: 1,
      shiftOptionsPageIndex: 1,
      reqOptionsPageIndex: 1,
      supOptionsPageIndex: 1,
      filterForSup: [],
      selectedSup: [],
      allSupLists: [],
      timeZone: null,
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleViewInspection = this.handleViewInspection.bind(this)
    this.closePopUp = this.closePopUp.bind(this)
  }

  async componentDidMount() {
    const allSites = []
    this.setState({ isDataLoading: true })
    if (this.checkUserRole.isSuperAdmin()) {
      const allCompaniesList = await companyList()
      const allCompanies = allCompaniesList.data.data
      const isCompanyAndSiteFilterAvailableForAdmin = this.checkForCompanyAndSiteFilterAvailabilityForAdmin()
      const { company_id: allCompanyID } = this.state.loginData.usersites[0]
      if (localStorage.getItem('companyId') === allCompanyID) {
        allCompanies.forEach(comp => comp.sites.forEach(site => allSites.push(site)))
      } else {
        allCompanies.forEach(comp => comp.company_id === localStorage.getItem('companyId') && comp.sites.forEach(site => allSites.push(site)))
      }
      this.setState({ allCompanies, availableCompanies: allCompanies, companyAndSiteFilter: isCompanyAndSiteFilterAvailableForAdmin })
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
    this.setState({ allSites, allSitesForAdmin: allSites })
    //console.log(this.props.inspectionFilterStateReducer)
    if (history.action === 'POP') {
      const { inspectionFilters } = this.props.inspectionFilterStateReducer
      //console.log('From Details', this.props.assetFilterStateReducer)
      if (!_.isEmpty(inspectionFilters)) {
        const { selectedAssetNameVal, filterNewAttributeVal, selectedStatus, selectedShift, selectedReq, siteFilterName } = inspectionFilters
        this.setState(
          {
            filterForAssetNameVal: selectedAssetNameVal.map(asset => asset.asset_id),
            filterForAssetInternalId: selectedAssetNameVal.map(asset => asset.internal_asset_id),
            selectedAssetNameVal,
            filterNewAttribute: filterNewAttributeVal ? filterNewAttributeVal.id : false,
            filterNewAttributeVal,
            filterForStatus: selectedStatus ? selectedStatus.id : 0,
            selectedStatus,
            filterForShift: selectedShift.map(x => x.id),
            selectedShift,
            filterForRequestor: selectedReq.map(asset => asset.uuid),
            selectedReq,
            siteFilterName,
            selectedSiteFilter: siteFilterName.map(m => m.site_id),
          },
          () => this.filterBasedOnColumn()
        )
      } else {
        this.filterBasedOnColumn()
      }
    } else {
      //console.log('First')
      this.filterBasedOnColumn()
    }
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = debounce(() => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight || $(window).height() > $('body').height()) {
    }
  }, 1000)

  handleSearchOnKeyDown = e => {
    var searchString = $('#inspectionSearchInput').val().trim()
    if (e.key === 'Enter') {
      this.setState({ searchString: searchString, searchStringOnEnter: true, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
    }
  }

  handleApproveInspection = async (e, selctedRow, rows) => {
    var result = this.checkPreviosInspectionPending(selctedRow, rows)
    if (result) {
      this.setState({ showInspectionPopUp: true })
    } else {
      var inspectionDetail = this.state.inspectionList.filter(x => x.inspection_id === selctedRow.id)
      $('#pageLoading').show()
      try {
        var requestData = {
          inspection_id: selctedRow.id,
          asset_id: _.get(inspectionDetail[0], ['asset', 'asset_id'], ''),
          manager_id: this.state.loginData.uuid,
          status: enums.inspectionStatus[2].id,
          manager_notes: null,
          meter_hours: parseInt(selctedRow.hourMeter),
        }
        const res = await approveInspection(requestData)
        if (res.data.success > 0) Toast.success('Inspection approved successfully !')
        else Toast.error(res.data.message)
      } catch (error) {
        Toast.error('Something went wrong !')
      }
      $('#pageLoading').hide()
      this.filterBasedOnColumn()
    }
  }

  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.filterBasedOnColumn())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.filterBasedOnColumn())

  checkPreviosInspectionPending(selctedRow, rows) {
    var result = _.filter(rows, function (inspection) {
      return selctedRow.status == enums.inspectionStatus[0].status && inspection.status === enums.inspectionStatus[0].status && inspection.internalAssetId === selctedRow.internalAssetId && selctedRow.checkoutRequestDateTime > inspection.checkoutRequestDateTime
    })
    if (result) {
      if (result.length > 0) return true
      return false
    } else {
      return false
    }
  }
  handleViewInspection(e, selctedRow, rows) {
    var result = this.checkPreviosInspectionPending(selctedRow, rows)
    if (result) this.setState({ showInspectionPopUp: true })
    else history.push({ pathname: `inspections/details/${selctedRow.id}`, state: selctedRow })
  }

  closePopUp = () => this.setState({ showInspectionPopUp: false })
  checkForCompanyAndSiteFilterAvailabilityForAdmin = () => {
    const { company_id: allCompanyID, site_id: allSiteID } = this.state.loginData.usersites.filter(site => site.status === 20)[0] || {}
    const companyFilter = localStorage.getItem('companyId') === allCompanyID && localStorage.getItem('siteId') === allSiteID
    const siteFilter = localStorage.getItem('siteId') === allSiteID
    return { companyFilter, siteFilter }
  }
  clearSearch = e => this.setState({ searchString: '', searchStringOnEnter: false, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))

  handleOnClickOnPhotos = data => {
    const { id, imageCount } = data
    if (imageCount === 0) return
    history.push(`/inspections/photo/${id}`)
  }
  handleOnClickOnIssue = data => {
    const { id } = data
    history.push(`/inspections/details/${id}`)
  }
  //*------------------Column Filter----------------------------
  clickOnHeaderCell = () => this.setState({ filterForColumn: !this.state.filterForColumn })
  filterNewAttribute = (e, val) => this.setState({ filterNewAttribute: val ? val.id : false, filterNewAttributeVal: val, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleSiteFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE_NAME), siteFilterName: this.makeUniqueArray(val), selectedSiteFilter: val.length !== 0 ? val.map(m => m.site_id) : [] }, () => this.filterBasedOnColumn())
  handleAssetNameFilterChange = (e, val) =>
    this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.ASSET_NAME), filterForAssetNameVal: val.map(asset => asset.asset_id), page: 0, pageIndex: 1, filterForAssetInternalId: val.map(asset => asset.internal_asset_id), selectedAssetNameVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handleShiftNoFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SHIFT), filterForShift: val.map(x => x.id), selectedShift: this.makeUniqueArray(val), page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleStatusFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.STATUS), filterForStatus: val ? val.id : 0, selectedStatus: val, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleRequetorFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.REQUESTOR), filterForRequestor: val.map(asset => asset.uuid), selectedReq: this.makeUniqueArray(val), page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleCompanyFilterChange = (e, val) =>
    this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.COMPANY), selectedCompany: val.length !== 0 ? val.map(m => m.company_id) : [], selectedCompanyVal: this.makeUniqueArray(val), siteFilterName: [], selectedSiteFilter: [] }, () => this.filterBasedOnColumn())
  handleSupervisorFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SUPERVISOR), filterForSup: val.map(sup => sup.uuid), selectedSup: this.makeUniqueArray(val), page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())

  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const { pageSize, pageIndex, selectedCompany, loginData, searchString, filterForSup, filterForAssetNameVal, siteFilterName, filterNewAttributeVal, selectedStatus, selectedReq, selectedShift, selectedAssetNameVal, filterForRequestor, selectedSiteFilter, filterForAssetInternalId, filterForStatus, filterForShift, filterNewAttribute } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      user_id: loginData.uuid,
      site_id: selectedSiteFilter,
      status: filterForStatus,
      asset_id: filterForAssetNameVal,
      shift_number: filterForShift,
      internal_asset_id: filterForAssetInternalId,
      requestor_id: filterForRequestor,
      new_not_ok_attribute: Number(filterNewAttribute),
      search_string: searchString,
      timezone: moment.tz.guess(true).replace('/', '-'),
      company_id: selectedCompany,
      manager_id: filterForSup,
    }
    this.props.inspectionFilterStateAction({ selectedAssetNameVal, filterNewAttributeVal, selectedStatus, selectedShift, selectedReq, siteFilterName })
    const data = await getAllInspectionAndFilter(payload)
    // console.log(data)

    if (data.success === false) {
      const x = data.list.map(d => d.sites.timezone)
      const tz = [...new Set(x.filter(Boolean))][0]
      if (!this.state.timeZone) this.setState({ timeZone: tz })
      this.setState({ inspectionList: data.list, size: data.listsize, isDataLoading: false }, () => this.checkClearFilterDisablity())
      this.fetchInitialOptions()
    } else {
      this.setState({ inspectionList: [], isDataLoading: false })
      this.fetchInitialOptions()
    }

    if (selectedSiteFilter.length !== 0) {
      this.state.primaryFilterName === this.filterEnums.COMPANY ? this.setState({ companyAndSiteFilter: { companyFilter: true, siteFilter: true } }) : this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: true } })
    } else {
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) {
        this.setState({ companyAndSiteFilter: this.checkForCompanyAndSiteFilterAvailabilityForAdmin() })
      }
    }
  }

  clearFilters = () => {
    this.setState(
      {
        pagesize: 20,
        pageIndex: 1,
        page: 0,
        selectedSiteFilter: [],
        filterForStatus: 0,
        filterForAssetNameVal: [],
        filterForShift: [],
        filterForRequestor: [],
        filterForAssetInternalId: [],
        filterNewAttribute: 0,
        siteFilterName: [],
        selectedShift: [],
        selectedAssetNameVal: [],
        selectedReq: [],
        selectedStatus: null,
        filterNewAttributeVal: null,
        selectedCompany: [],
        selectedCompanyVal: [],
        primaryFilterName: '',
        filterForSup: [],
        selectedSup: [],
      },
      () => this.filterBasedOnColumn()
    )
  }

  checkClearFilterDisablity = () => {
    if (this.state.selectedAssetNameVal.length !== 0 || this.state.filterNewAttributeVal !== null || this.state.selectedReq.length !== 0 || this.state.selectedShift.length !== 0 || this.state.selectedStatus !== null || this.state.siteFilterName.length !== 0 || this.state.selectedCompanyVal.length !== 0 || this.state.selectedSup.length !== 0) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', assetNameOptionsPageIndex: 1, companyOptionsPageIndex: 1, siteOptionsPageIndex: 1, shiftOptionsPageIndex: 1, reqOptionsPageIndex: 1, supOptionsPageIndex: 1 })
    }
  }

  //*----- Fetch initial Options
  fetchInitialOptions = async () => {
    this.setState({ isDataLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const assetNameOpts = await inspectionFilterOptions(URL.filterInspectionAssetNameOptions, payload)
    const companyNameOpts = await inspectionFilterOptions(URL.filterInspectionCompanyOptions, payload)
    const shiftsOpts = await inspectionFilterOptions(URL.filterInspectionShiftNumberOptions, payload)
    const reqOpts = await inspectionFilterOptions(URL.filterInspectionOperatorsOptions, payload)
    const siteNameOpts = await inspectionFilterOptions(URL.filterInspectionSitesOptions, payload)
    const supOpts = await inspectionFilterOptions(URL.filterInspectionSupervisorOptions, payload)

    this.setState({
      allAssetsLists: this.state.primaryFilterName === this.filterEnums.ASSET_NAME ? this.state.allAssetsLists : assetNameOpts.list,
      allCompanies: this.state.primaryFilterName === this.filterEnums.COMPANY ? this.state.allCompanies : companyNameOpts.list,
      allShiftLists: this.state.primaryFilterName === this.filterEnums.SHIFT ? this.state.allShiftLists : shiftsOpts.list.map(x => ({ id: x, name: `${x}` })),
      allRequestorLists: this.state.primaryFilterName === this.filterEnums.REQUESTOR ? this.state.allRequestorLists : reqOpts.list,
      allSupLists: this.state.primaryFilterName === this.filterEnums.SUPERVISOR ? this.state.allSupLists : supOpts.list,
      allSites: this.state.primaryFilterName === this.filterEnums.SITE_NAME ? this.state.allSites : siteNameOpts.list,
      allStausLists: enums.inspectionStatus,
      isDataLoading: false,
    })
  }

  getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: this.state.selectedSiteFilter,
    company_id: this.state.selectedCompany,
    status: this.state.filterForStatus,
    asset_id: this.state.filterForAssetNameVal,
    internal_asset_id: [],
    shift_number: this.state.filterForShift,
    requestor_id: this.state.filterForRequestor,
    new_not_ok_attribute: Number(this.state.filterNewAttribute),
    search_string: this.state.searchString,
    option_search_string: val,
    timezone: moment.tz.guess(true).replace('/', '-'),
  })

  handleAssetNameFilterInputChange = async (e, val) => {
    this.setState({ isAssetNameListLoading: true, assetNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionAssetNameOptions, { ...payload, asset_id: [] })
        this.setState({ allAssetsLists: data.list, isAssetNameListLoading: false })
      }
    }, 700)
  }
  handleCompanyFilterInputChange = async (e, val) => {
    this.setState({ isCompanyListLoading: true, companyOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionCompanyOptions, { ...payload, company_id: [] })
        this.setState({ allCompanies: data.list, isCompanyListLoading: false })
      }
    }, 700)
  }
  handleSiteFilterInputChange = async (e, val) => {
    this.setState({ isSiteListLoading: true, siteOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionSitesOptions, { ...payload, site_id: [] })
        this.setState({ allSites: data.list, isSiteListLoading: false })
      }
    }, 700)
  }
  handleShiftFilterInputChange = async (e, val) => {
    this.setState({ isShiftListLoading: true, shiftOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionShiftNumberOptions, { ...payload, shift_number: [] })
        this.setState({ allShiftLists: data.list.map(x => ({ id: x, name: `${x}` })), isShiftListLoading: false })
      }
    }, 700)
  }
  handleReqFilterInputChange = async (e, val) => {
    this.setState({ isRequestorListLoading: true, reqOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionOperatorsOptions, { ...payload, requestor_id: [] })
        this.setState({ allRequestorLists: data.list, isRequestorListLoading: false })
      }
    }, 700)
  }
  handleSupFilterInputChange = async (e, val) => {
    this.setState({ isSupListLoading: true, supOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await inspectionFilterOptions(URL.filterInspectionSupervisorOptions, { ...payload, manager_id: [] })
        this.setState({ allSupLists: data.list, isSupListLoading: false })
      }
    }, 700)
  }
  //*------ Fetching More options on scroll
  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }

  getOptionsURL = id => {
    if (id === 'assetIdFilter') return URL.filterInspectionAssetNameOptions
    if (id === 'company') return URL.filterInspectionCompanyOptions
    if (id === 'siteIdFilter') return URL.filterInspectionSitesOptions
    if (id === 'shiftIdFilter') return URL.filterInspectionShiftNumberOptions
    if (id === 'reqIdFilter') return URL.filterInspectionOperatorsOptions
    if (id === 'supIdFilter') return URL.filterInspectionSupervisorOptions
  }

  fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = this.getFilterOptionsPayload(val)
    switch (id) {
      case 'assetIdFilter':
        this.setState({ assetNameOptionsPageIndex: this.state.assetNameOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, asset_id: [], pageindex: this.state.assetNameOptionsPageIndex })
          this.setState({ allAssetsLists: [...this.state.allAssetsLists, ...data.list] })
        })
        break
      case 'company':
        this.setState({ companyOptionsPageIndex: this.state.companyOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, company_id: [], pageindex: this.state.companyOptionsPageIndex })
          this.setState({ allCompanies: [...this.state.allCompanies, ...data.list] })
        })
        break
      case 'shiftIdFilter':
        this.setState({ shiftOptionsPageIndex: this.state.shiftOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, shift_number: [], pageindex: this.state.shiftOptionsPageIndex })
          this.setState({ allShiftLists: [...this.state.allShiftLists, ...data.list.map(x => ({ id: x, name: `${x}` }))] })
        })
        break
      case 'reqIdFilter':
        this.setState({ reqOptionsPageIndex: this.state.reqOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, requestor_id: [], pageindex: this.state.reqOptionsPageIndex })
          this.setState({ allRequestorLists: [...this.state.allRequestorLists, ...data.list] })
        })
        break
      case 'siteIdFilter':
        this.setState({ siteOptionsPageIndex: this.state.siteOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, site_id: [], pageindex: this.state.siteOptionsPageIndex })
          this.setState({ allSites: [...this.state.allSites, ...data.list] })
        })
        break

      case 'supIdFilter':
        this.setState({ supOptionsPageIndex: this.state.supOptionsPageIndex + 1 }, async () => {
          const data = await inspectionFilterOptions(this.getOptionsURL(id), { ...payload, site_id: [], pageindex: this.state.supOptionsPageIndex })
          this.setState({ allSupLists: [...this.state.allSupLists, ...data.list] })
        })
        break

      default:
        break
    }
  }

  getDate = date => {
    const dt = momenttimezone.utc(date).tz(this.state.timeZone).format('MM-DD-YYYY LT')
    return dt
  }

  render() {
    let searchString = this.state.searchString != null ? this.state.searchString : decodeURI(_.get(this, ['props', 'inspectionListReducer', 'searchString'], ''))
    //console.log(this.state)
    var rows = []
    const { classes } = this.props

    const createData = (id, site, sites, company, notOkAttr, imageCount, newNotOkAttrCount, name, status, timeElapsed, shift, requestingOperator, internalAssetId, hourMeter, supervisor, approvedDate) => {
      return { id, site, sites, company, notOkAttr, imageCount, name, newNotOkAttrCount, status, timeElapsed, shift, requestingOperator, internalAssetId, hourMeter, supervisor, approvedDate }
    }

    if (this.state.inspectionList.length) {
      rows = []
      this.state.inspectionList.map((value, key) => {
        const imageCount = value.image_list !== null ? value.image_list.image_names.length : 0
        const notOkCount = value.new_notok_attributes.length
        const notOkAttr = value.new_notok_attributes
        var result = createData(
          value.inspection_id,
          value.sites.site_name,
          value.sites,
          value.sites.company_name,
          notOkAttr,
          imageCount,
          notOkCount,
          value.asset.name,
          value.status_name,
          value.time_elapsed,
          value.shift,
          `${value.operator_firstname} ${value.operator_lastname}`,
          value.asset.internal_asset_id,
          value.meter_hours,
          value.manager_name,
          value.approval_date
        )
        rows.push(result)
        return
      })
    }
    const filterOptions = createFilterOptions({
      matchFrom: 'any',
      stringify: option => option.name.trim() + option.internal_asset_id,
      trim: true,
    })

    return (
      <div>
        <Grid container className={classes.root}>
          <Grid item xs={12}>
            <Paper className={classes.paper + ' tableminheight'} elevation={0}>
              <Grid container spacing={2}>
                <Grid item xs={4}></Grid>
                <Grid item xs={5}></Grid>

                <Grid className='text_r' item xs={3}>
                  <TextField
                    className={classes.searchInput}
                    id='inspectionSearchInput'
                    fullWidth={true}
                    placeholder='Search Checklist'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchOutlined color='primary' />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment className='pointerCursor' position='end' onClick={e => this.clearSearch(e)}>
                          {this.state.searchString ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                        </InputAdornment>
                      ),
                    }}
                    value={searchString}
                    onChange={e => this.setState({ searchString: e.target.value })}
                    onKeyDown={e => this.handleSearchOnKeyDown(e)}
                  />
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={6} />
                <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={() => this.clearFilters()} disabled={this.state.clearFilterButton} startIcon={<RotateLeftSharpIcon />} variant='contained' color='primary' className='nf-buttons' disableElevation>
                    Reset Filters
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '650px', height: '650px' }}>
                    <Table onWheel={e => this.handleScroll()} size='small' stickyHeader={true}>
                      <TableHead>
                        <TableRow>
                          <TableCell onClick={() => this.clickOnHeaderCell('Asset Name')} classes={{ root: classes.headRoot }} style={this.state.selectedAssetNameVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                            {'Asset Name'}
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                          {localStorage.getItem('roleName') === enums.userRoles[1].role &&
                            (this.state.companyAndSiteFilter.companyFilter ? (
                              <TableCell onClick={() => this.clickOnHeaderCell('Company')} classes={{ root: classes.headRoot }} style={this.state.selectedCompanyVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                                {'Company'}
                                <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                              </TableCell>
                            ) : (
                              <TableCell>Company</TableCell>
                            ))}
                          <TableCell onClick={() => this.clickOnHeaderCell('Issues')} classes={{ root: classes.headRoot }} style={this.state.filterNewAttributeVal !== null ? { background: '#eeeeee', width: '9%' } : { background: '#fafafa', width: '9%' }} id='issues' align='left' padding='normal'>
                            New Issues
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                          <TableCell onClick={() => this.clickOnHeaderCell('Status')} classes={{ root: classes.headRoot }} style={this.state.selectedStatus !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='status' align='left' padding='normal'>
                            {'Status'}
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                          <TableCell id='time' align='left' padding='normal'>
                            {'Time Elapsed'}
                          </TableCell>
                          <TableCell onClick={() => this.clickOnHeaderCell('Requestor')} classes={{ root: classes.headRoot }} style={this.state.selectedReq.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='Requestor' align='left' padding='normal'>
                            {'Requestor'}
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                          <TableCell onClick={() => this.clickOnHeaderCell('Supervisor')} classes={{ root: classes.headRoot }} style={this.state.selectedSup.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='Supervisor' align='left' padding='normal'>
                            {'Supervisor'}
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                          <TableCell id='time' align='left' padding='normal'>
                            {'Approved On'}
                          </TableCell>
                          {(localStorage.getItem('roleName') === enums.userRoles[0].role || localStorage.getItem('roleName') === enums.userRoles[4].role) && (
                            <TableCell onClick={() => this.clickOnHeaderCell('Actions')} id='name' align='left' padding='normal'>
                              {'Actions'}
                            </TableCell>
                          )}
                        </TableRow>
                        {this.state.filterForColumn && (
                          <TableRow>
                            <TableCell classes={{ root: classes.headFilter }}>
                              <Autocomplete
                                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                size='small'
                                multiple
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                value={this.state.selectedAssetNameVal}
                                filterOptions={filterOptions}
                                id='assetIdFilter'
                                options={this.state.allAssetsLists}
                                getOptionLabel={option => option.name}
                                name='assetId'
                                loading={this.state.isAssetNameListLoading}
                                onClose={() => this.setState({ isAssetNameListLoading: false })}
                                onChange={(e, val) => this.handleAssetNameFilterChange(e, val)}
                                onInputChange={(e, val) => this.handleAssetNameFilterInputChange(e, val)}
                                noOptionsText='No asset found'
                                renderInput={params => <TextField {...params} className='filter-input-disable-lastpass' variant='outlined' margin='normal' fullWidth placeholder='Select Asset' name='assetId' />}
                              />
                            </TableCell>
                            {localStorage.getItem('roleName') === enums.userRoles[1].role && (
                              <TableCell>
                                {this.state.companyAndSiteFilter.companyFilter ? (
                                  <Autocomplete
                                    ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                    loading={this.state.isCompanyListLoading}
                                    onClose={() => this.setState({ isCompanyListLoading: false })}
                                    onInputChange={(e, val) => this.handleCompanyFilterInputChange(e, val)}
                                    multiple
                                    size='small'
                                    classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                    id='company'
                                    value={this.state.selectedCompanyVal}
                                    options={this.state.allCompanies}
                                    getOptionLabel={option => option.company_name}
                                    name='companyId'
                                    onChange={(e, val) => this.handleCompanyFilterChange(e, val)}
                                    noOptionsText='No company found'
                                    renderInput={params => <TextField className='filter-input-disable-lastpass' {...params} variant='outlined' margin='normal' fullWidth placeholder='Select company' name='companyId' />}
                                  />
                                ) : (
                                  ''
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <Autocomplete
                                size='small'
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                value={this.state.filterNewAttributeVal}
                                id='issueIdFilter'
                                options={this.state.allIssue}
                                getOptionLabel={option => option.name}
                                name='IssueId'
                                onChange={(e, val) => this.filterNewAttribute(e, val)}
                                renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select New Issues' name='issuesID' className='filter-input-disable-lastpass' />}
                              />
                            </TableCell>
                            <TableCell classes={{ root: classes.headFilter }}>
                              <Autocomplete
                                size='small'
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                id='statusIdFilter'
                                value={this.state.selectedStatus}
                                options={this.state.allStausLists}
                                getOptionLabel={option => option.status}
                                name='statusId'
                                onChange={(e, val) => this.handleStatusFilterChange(e, val)}
                                noOptionsText='No status found'
                                renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Status' name='statusId' className='filter-input-disable-lastpass' />}
                              />
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell classes={{ root: classes.headFilter }}>
                              <Autocomplete
                                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                size='small'
                                multiple
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                id='reqIdFilter'
                                loading={this.state.isRequestorListLoading}
                                onClose={() => this.setState({ isRequestorListLoading: false })}
                                onInputChange={(e, val) => this.handleReqFilterInputChange(e, val)}
                                value={this.state.selectedReq}
                                options={this.state.allRequestorLists}
                                getOptionLabel={option => `${option.firstname} ${option.lastname}`}
                                name='reqId'
                                onChange={(e, val) => this.handleRequetorFilterChange(e, val)}
                                noOptionsText='No operator found'
                                renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Requestor' name='reqId' className='filter-input-disable-lastpass' />}
                              />
                            </TableCell>
                            <TableCell>
                              <Autocomplete
                                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                size='small'
                                multiple
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                id='supIdFilter'
                                loading={this.state.isSupListLoading}
                                onClose={() => this.setState({ isSupListLoading: false })}
                                onInputChange={(e, val) => this.handleSupFilterInputChange(e, val)}
                                value={this.state.selectedSup}
                                options={this.state.allSupLists}
                                getOptionLabel={option => option.username}
                                name='supId'
                                onChange={(e, val) => this.handleSupervisorFilterChange(e, val)}
                                noOptionsText='No supervisor found'
                                renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Suprvisor' name='supId' className='filter-input-disable-lastpass' />}
                              />
                            </TableCell>
                            <TableCell></TableCell>
                            {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && <TableCell></TableCell>}
                          </TableRow>
                        )}
                      </TableHead>
                      {this.state.isDataLoading ? (
                        <TableLoader cols={this.checkUserRole.isCompanyAdmin() ? 7 : 8} />
                      ) : _.isEmpty(rows) ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan='7' className='Pendingtbl-no-datafound'>
                              No data found
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody>
                          {rows.map((tableRow, key) => {
                            return (
                              <TableRow key={key}>
                                <TableCell className={classes.tableCell}>{tableRow.name ? tableRow.name : '-'}</TableCell>
                                {localStorage.getItem('roleName') === enums.userRoles[1].role && <TableCell className={classes.tableCell}>{tableRow.company ? tableRow.company : '-'}</TableCell>}
                                <TableCell className={classes.tableCell}>
                                  {tableRow.newNotOkAttrCount ? (
                                    <>
                                      <HtmlTooltip placement='right' title={tableRow.newNotOkAttrCount ? tableRow.notOkAttr.map(attr => <Chip size='small' key={attr.id} label={attr.name} style={{ marginRight: '5px', marginBottom: '5px' }} />) : ''}>
                                        <Badge onClick={() => this.handleOnClickOnIssue(tableRow)} badgeContent={tableRow.newNotOkAttrCount} color='error' max={99} style={{ marginTop: '10px', cursor: 'pointer' }} classes={{ badge: classes.badgeRoot, anchorOriginTopRightRectangular: classes.badge }}>
                                          <WarningIcon fontSize='small' />
                                        </Badge>
                                      </HtmlTooltip>
                                    </>
                                  ) : (
                                    ''
                                  )}
                                </TableCell>
                                <TableCell className={classes.tableCell}>{tableRow.status ? tableRow.status : '-'}</TableCell>
                                <TableCell className={classes.tableCell}>{tableRow.timeElapsed}</TableCell>
                                <TableCell className={classes.tableCell}>{tableRow.requestingOperator ? tableRow.requestingOperator : '-'}</TableCell>
                                <TableCell className={classes.tableCell}>{tableRow.supervisor ? tableRow.supervisor : '-'}</TableCell>
                                <TableCell className={classes.tableCell}>{tableRow.approvedDate ? this.getDate(tableRow.approvedDate) : '-'}</TableCell>
                                {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && (
                                  <TableCell className={classes.tableCell} style={{ width: '8%' }}>
                                    <Tooltip title='View' placement='top'>
                                      <IconButton size='small' onClick={e => this.handleViewInspection(e, tableRow, rows)}>
                                        <VisibilityOutlinedIcon fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
                                    {this.checkUserRole.isManager() && tableRow.sites.showHideApprove && (
                                      <Tooltip title='Accept' placement='top'>
                                        <span>
                                          <IconButton size='small' onClick={e => this.handleApproveInspection(e, tableRow, rows)} disabled={tableRow.status !== enums.inspectionStatus[0].status}>
                                            <CheckCircleOutlinedIcon fontSize='small' />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    )}
                                  </TableCell>
                                )}
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      )}
                    </Table>
                  </div>

                  {_.isEmpty(rows) ? '' : <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        {this.state.showInspectionPopUp ? <PendingInspectionApprovePopup closePopUp={this.closePopUp} /> : ''}
      </div>
    )
  }
}
function mapState(state) {
  if (state.inspectionListReducer) {
    if (self) {
      self.setState({ isDataNotFound: state.inspectionListReducer.isDataNoFound })
      if (state.inspectionListReducer.isReturnFromInspectionList) {
        self.setState({ tostMsg: state.inspectionListReducer.tostMsg })
        self.props.inspectionStateUpdate()
      }
    }
  }
  return state
}

const actionCreators = {
  inspectionList: inspectionListAction,
  inspectionSearchList: inspectionSearchListAction,
  approveInspection: approveInspectionAction,
  inspectionStateUpdate: inspectionStateUpdate,
  inspectionFilterStateAction,
}

InspectionList.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(InspectionList))
