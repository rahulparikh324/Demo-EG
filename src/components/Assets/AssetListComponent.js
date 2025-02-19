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
import Fab from '@material-ui/core/Fab'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import AddOutlined from '@material-ui/icons/AddOutlined'
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import { Typography } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import assetListAction from '../../Actions/Assets/assetListAction'
import { connect } from 'react-redux'
import enums from '../../Constants/enums'
import URL from '../../Constants/apiUrls'
import _ from 'lodash'
import $ from 'jquery'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import generateBarcodeAction from '../../Actions/Assets/generateBarcodeAction'
import assetFilterStateAction from '../../Actions/Assets/assetFilter.action'
import assetSearchListAction from '../../Actions/Search/assetSearchAction'
import TablePagination from '@material-ui/core/TablePagination'
import debounce from 'lodash.debounce'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getAllAssetAndFilter from '../../Services/Asset/getAllAssetAndFilter'
import Badge from '@material-ui/core/Badge'
import { history } from '../../helpers/history'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import assetTabFilterOptions from '../../Services/Asset/assetNameFilterOptions'

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

class AssetList extends React.Component {
  constructor() {
    super()
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
      filterForAssetNameVal: [],
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
    }
    this.handleChkboxChange = this.handleChkboxChange.bind(this)
    this.handlePrintBarcode = this.handlePrintBarcode.bind(this)
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  //*----Fetching initial options
  fetchInitialOptions = async () => {
    this.setState({ isDataLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const assetNameOpts = await assetTabFilterOptions(URL.filterAssetNameOptions, payload)
    const companyNameOpts = await assetTabFilterOptions(URL.filterAssetCompanyOptions, payload)
    const modelNameOpts = await assetTabFilterOptions(URL.filterAssetModelOptions, payload)
    const modelYearOpts = await assetTabFilterOptions(URL.filterAssetModelYearOptions, payload)
    const siteNameOpts = await assetTabFilterOptions(URL.filterAssetSitesOptions, payload)

    this.setState({
      allAssetsLists: this.state.primaryFilterName === this.filterEnums.ASSET_NAME ? this.state.allAssetsLists : assetNameOpts.list,
      allCompanies: this.state.primaryFilterName === this.filterEnums.COMPANY ? this.state.allCompanies : companyNameOpts.list,
      allAssetModelLists: this.state.primaryFilterName === this.filterEnums.MODEL ? this.state.allAssetModelLists : modelNameOpts.list.map(x => ({ name: x })),
      allAssetModelYearLists: this.state.primaryFilterName === this.filterEnums.MODEL_YEAR ? this.state.allAssetModelYearLists : modelYearOpts.list.map(x => ({ name: x })),
      allSites: this.state.primaryFilterName === this.filterEnums.SITE_NAME ? this.state.allSites : siteNameOpts.list,
      allStausLists: enums.assetStatus.slice(0, 2),
      isDataLoading: false,
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
      const { assetFilters } = this.props.assetFilterStateReducer
      //console.log('From Details', this.props.assetFilterStateReducer)
      if (!_.isEmpty(assetFilters)) {
        const { selectedAssetNameVal, selectedCompanyVal, selectedIssueFilter, selectedModelVal, selectedModelYearVal, selectedStatus, siteFilterName } = assetFilters
        this.setState(
          {
            filterForAssetNameVal: selectedAssetNameVal.map(asset => asset.asset_id),
            selectedAssetNameVal,
            showOpenIssues: selectedIssueFilter ? selectedIssueFilter.id : false,
            selectedIssueFilter,
            filterForModelVal: selectedModelVal.map(m => m.name),
            selectedModelVal,
            filterForModelYearVal: selectedModelYearVal.map(m => m.name),
            selectedModelYearVal,
            filterForStatus: selectedStatus ? selectedStatus.id : localStorage.getItem('roleName') === enums.userRoles[0].role ? 1 : 0,
            selectedStatus,
            siteFilterName,
            selectedSiteFilter: siteFilterName.map(m => m.site_id),
            selectedCompanyVal,
            selectedCompany: selectedCompanyVal.company_id,
          },
          () => this.filterBasedOnColumn()
        )
      } else {
        this.filterBasedOnColumn()
      }
    } else {
      this.filterBasedOnColumn()
    }
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
    // console.log('selecting all', e.target.checked, assetList)
    //this.setState({ assetList: assetList })
    const allChkBox = {}

    if (e.target.checked) {
      assetList.forEach(value => (allChkBox[value.assetID] = true))
    } else {
      assetList.forEach(value => (allChkBox[value.assetID] = false))
    }
    // console.log(allChkBox)
    this.setState({ chkbox: allChkBox, selectAll: e.target.checked })
  }

  handleChkboxChange = (e, assetList) => {
    var chkBoxObj = this.state.chkbox
    if (e.target.checked) {
      chkBoxObj[e.target.id] = true
    } else {
      chkBoxObj[e.target.id] = false
    }
    this.setState({ chkbox: chkBoxObj })
    // console.log(chkBoxObj)
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
        // alert.errorMessage();
      } else {
        var requestData = {
          assetList: selectedAssetList,
        }
        //console('requestData--------------', requestData)
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
  handleSiteFilterChange = (e, val) => this.setState({ lastAppliedFilter: this.filterEnums.SITE_NAME, page: 0, pageIndex: 1, siteFilterName: this.makeUniqueArray(val), selectedSiteFilter: val.length !== 0 ? val.map(m => m.site_id) : [], primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE_NAME) }, () => this.filterBasedOnColumn())
  clickOnHeaderCell = () => this.setState({ filterForColumn: !this.state.filterForColumn })
  showOpenIssues = (e, val) => this.setState({ lastAppliedFilter: this.filterEnums.OPEN_ISSUES, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.OPEN_ISSUES), showOpenIssues: val ? val.id : false, selectedIssueFilter: val, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleAssetNameFilterChange = (e, val) =>
    this.setState({ lastAppliedFilter: this.filterEnums.ASSET_NAME, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.ASSET_NAME), page: 0, pageIndex: 1, filterForAssetNameVal: val.map(asset => asset.asset_id), selectedAssetNameVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handleModelFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.MODEL), page: 0, pageIndex: 1, filterForModelVal: val.map(m => m.name), selectedModelVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handleModelYearFilterChange = (e, val) => this.setState({ lastAppliedFilter: this.filterEnums.MODEL_YEAR, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.MODEL_YEAR), page: 0, pageIndex: 1, filterForModelYearVal: val.map(m => m.name), selectedModelYearVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handleStatusFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.STATUS), page: 0, pageIndex: 1, filterForStatus: val ? val.id : localStorage.getItem('roleName') === enums.userRoles[0].role ? 3 : 4, selectedStatus: val }, () => this.filterBasedOnColumn())
  handleCompanyFilterChange = (e, val) =>
    this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.COMPANY), page: 0, pageIndex: 1, selectedCompany: val.length !== 0 ? val.map(m => m.company_id) : [], selectedCompanyVal: this.makeUniqueArray(val), siteFilterName: [], selectedSiteFilter: [] }, () => this.filterBasedOnColumn())

  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: this.state.selectedSiteFilter,
    status: this.state.filterForStatus,
    asset_id: this.state.filterForAssetNameVal,
    internal_asset_id: [],
    model_name: this.state.filterForModelVal,
    model_year: this.state.filterForModelYearVal,
    show_open_issues: Number(this.state.showOpenIssues),
    search_string: this.state.searchString,
    option_search_string: val,
    company_id: this.state.selectedCompany,
  })

  handleAssetNameFilterInputChange = async (e, val) => {
    this.setState({ isAssetNameListLoading: true, assetNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetNameOptions, { ...payload, asset_id: [] })
        this.setState({ allAssetsLists: data.list, isAssetNameListLoading: false })
      }
    }, 700)
  }
  handleCompanyFilterInputChange = async (e, val) => {
    this.setState({ isCompanyListLoading: true, companyNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetCompanyOptions, { ...payload, company_id: [] })
        this.setState({ allCompanies: data.list, isCompanyListLoading: false })
      }
    }, 700)
  }
  handleModelFilterInputChange = async (e, val) => {
    this.setState({ isModelListLoading: true, modelNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetModelOptions, { ...payload, model_name: [] })
        this.setState({ allAssetModelLists: data.list.map(x => ({ name: x })), isModelListLoading: false })
      }
    }, 700)
  }
  handleModelYearFilterInputChange = async (e, val) => {
    this.setState({ isModelYearListLoading: true, modelYearOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetModelYearOptions, { ...payload, model_year: [] })
        this.setState({ allAssetModelYearLists: data.list.map(x => ({ name: x })), isModelYearListLoading: false })
      }
    }, 700)
  }
  handleStatusFilterInputChange = async (e, val) => {
    this.setState({ isStatusListLoading: true })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetStatusOptions, { ...payload, status: 0 })
        // console.log(data.list)
        this.setState({ allStausLists: data.list.map(x => ({ status: x === 1 ? 'Active' : 'Inactive', id: x })), isStatusListLoading: false })
      }
    }, 700)
  }
  handleSiteFilterInputChange = async (e, val) => {
    this.setState({ isSiteListLoading: true, siteNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await assetTabFilterOptions(URL.filterAssetSitesOptions, { ...payload, site_id: [] })
        // console.log(data.list)
        this.setState({ allSites: data.list, isSiteListLoading: false })
      }
    }, 700)
  }

  //*------ Fetching More options on scroll
  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }

  getOptionsURL = id => {
    if (id === 'assetIdFilter') return URL.filterAssetNameOptions
    if (id === 'company') return URL.filterAssetCompanyOptions
    if (id === 'modelIdFilter') return URL.filterAssetModelOptions
    if (id === 'modelYearIdFilter') return URL.filterAssetModelYearOptions
    if (id === 'siteIdFilter') return URL.filterAssetSitesOptions
  }

  fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = this.getFilterOptionsPayload(val)
    switch (id) {
      case 'assetIdFilter':
        this.setState({ assetNameOptionsPageIndex: this.state.assetNameOptionsPageIndex + 1 }, async () => {
          const data = await assetTabFilterOptions(this.getOptionsURL(id), { ...payload, asset_id: [], pageindex: this.state.assetNameOptionsPageIndex })
          this.setState({ allAssetsLists: [...this.state.allAssetsLists, ...data.list] })
        })
        break
      case 'company':
        this.setState({ companyNameOptionsPageIndex: this.state.companyNameOptionsPageIndex + 1 }, async () => {
          const data = await assetTabFilterOptions(this.getOptionsURL(id), { ...payload, company_id: [], pageindex: this.state.companyNameOptionsPageIndex })
          this.setState({ allCompanies: [...this.state.allCompanies, ...data.list] })
        })
        break
      case 'modelIdFilter':
        this.setState({ modelNameOptionsPageIndex: this.state.modelNameOptionsPageIndex + 1 }, async () => {
          const data = await assetTabFilterOptions(this.getOptionsURL(id), { ...payload, model_name: [], pageindex: this.state.modelNameOptionsPageIndex })
          this.setState({ allAssetModelLists: [...this.state.allAssetModelLists, ...data.list.map(x => ({ name: x }))] })
        })
        break
      case 'modelYearIdFilter':
        this.setState({ modelYearOptionsPageIndex: this.state.modelYearOptionsPageIndex + 1 }, async () => {
          const data = await assetTabFilterOptions(this.getOptionsURL(id), { ...payload, model_year: [], pageindex: this.state.modelYearOptionsPageIndex })
          this.setState({ allAssetModelYearLists: [...this.state.allAssetModelYearLists, ...data.list.map(x => ({ name: x }))] })
        })
        break
      case 'siteIdFilter':
        this.setState({ siteNameOptionsPageIndex: this.state.siteNameOptionsPageIndex + 1 }, async () => {
          const data = await assetTabFilterOptions(this.getOptionsURL(id), { ...payload, site_id: [], pageindex: this.state.siteNameOptionsPageIndex })
          this.setState({ allSites: [...this.state.allSites, ...data.list] })
        })
        break

      default:
        break
    }
  }

  //*------------------Column Filter----------------------------
  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const { pageSize, pageIndex, selectedCompany, selectedCompanyVal, loginData, filterForAssetNameVal, selectedAssetNameVal, selectedModelVal, selectedModelYearVal, siteFilterName, selectedStatus, filterForStatus, selectedSiteFilter, showOpenIssues, selectedIssueFilter, filterForModelVal, filterForModelYearVal, searchString } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      user_id: loginData.uuid,
      site_id: selectedSiteFilter,
      status: filterForStatus,
      asset_id: filterForAssetNameVal,
      internal_asset_id: [],
      model_name: filterForModelVal,
      model_year: filterForModelYearVal,
      show_open_issues: Number(showOpenIssues),
      search_string: searchString,
      company_id: selectedCompany,
    }
    this.props.assetFilterStateAction({ selectedAssetNameVal, selectedIssueFilter, selectedModelVal, selectedModelYearVal, selectedCompanyVal, selectedStatus, siteFilterName })
    const data = await getAllAssetAndFilter(payload)
    if (data.success === false) {
      this.setState({ assetList: data.list, size: data.listsize, isDataLoading: false, assetNameOptionsPageIndex: 1, companyNameOptionsPageIndex: 1, modelNameOptionsPageIndex: 1, modelYearOptionsPageIndex: 1, siteNameOptionsPageIndex: 1 }, () => this.checkClearFilterDisablity())
      this.fetchInitialOptions()
    } else {
      this.setState({ assetList: [], isDataLoading: false })
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
  //*-------------------------------------------------------------

  handleOnClickOnIssue = data => {
    if (this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isSuperAdmin()) return
    const state = this.state.allAssetsLists.filter(asset => asset.asset_id === data.id)[0]
    history.push({ pathname: `/issues`, state })
  }

  viewDetails = id => {
    history.push({ pathname: `assets/details/${id}` })
  }

  checkClearFilterDisablity = () => {
    if (this.state.selectedAssetNameVal.length !== 0 || this.state.selectedIssueFilter !== null || this.state.selectedModelVal.length !== 0 || this.state.selectedModelYearVal.length !== 0 || this.state.selectedStatus !== null || this.state.siteFilterName.length !== 0 || this.state.selectedCompanyVal.length !== 0) {
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
        filterForStatus: localStorage.getItem('roleName') === enums.userRoles[0].role ? 3 : 4,
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
      },
      () => this.filterBasedOnColumn()
    )
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
        var result = createData(value.asset_id, value.name, value.openIssuesCount, value.company_name, value.model_name, value.model_year, value.site_name, value.status_name, value.status, value.asset_id, value)
        rows.push(result)
        return
      })
    }

    return (
      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Paper className={classes.paper + ' tableminheight'} elevation={0}>
            <Grid container spacing={2} style={{ position: 'relative' }}>
              <Grid item xs={6}>
                <Button onClick={this.handleDownloadBarcode} startIcon={<ArrowDownwardOutlinedIcon />} variant='contained' color='primary' className='nf-buttons mr-2' disableElevation>
                  Download Barcode
                </Button>
                {(this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) && (
                  <Button onClick={() => history.push('/assets/upload')} startIcon={<AddOutlined />} variant='contained' color='primary' className='nf-buttons' disableElevation>
                    Upload Asset
                  </Button>
                )}
              </Grid>
              <Grid item xs={3}></Grid>
              <Grid className='text_r' item xs={3}>
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
                        {this.state.isDownloadBarcode && (
                          <TableCell id='selectAllChkbox' align='left' padding='normal'>
                            <Checkbox color='primary' id='selectAll' name='selectAll' checked={this.state.selectAll} onChange={e => this.handleSelectAllChkboxChange(e, rows)} />
                          </TableCell>
                        )}
                        <TableCell onClick={() => this.clickOnHeaderCell('Asset Name')} classes={{ root: classes.headRoot }} style={this.state.selectedAssetNameVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                          {'Asset Name'}
                          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                        </TableCell>
                        {this.checkUserRole.isSuperAdmin() &&
                          (this.state.companyAndSiteFilter.companyFilter ? (
                            <TableCell onClick={() => this.clickOnHeaderCell('Company')} classes={{ root: classes.headRoot }} style={this.state.selectedCompanyVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                              {'Company'}
                              <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                            </TableCell>
                          ) : (
                            <TableCell>Company</TableCell>
                          ))}

                        <TableCell onClick={() => this.clickOnHeaderCell('Issues')} classes={{ root: classes.headRoot }} style={this.state.selectedIssueFilter !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='issues' align='left' padding='normal'>
                          Open Issues
                          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                        </TableCell>
                        <TableCell onClick={() => this.clickOnHeaderCell('Model')} classes={{ root: classes.headRoot }} style={this.state.selectedModelVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='category' align='left' padding='normal'>
                          {'Model'}
                          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                        </TableCell>
                        <TableCell onClick={() => this.clickOnHeaderCell('Model Year')} classes={{ root: classes.headRoot }} style={this.state.selectedModelYearVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='modelYear' align='left' padding='normal'>
                          {'Model Year'}
                          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                        </TableCell>
                        <TableCell onClick={() => this.clickOnHeaderCell('Status')} classes={{ root: classes.headRoot }} style={this.state.selectedStatus !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='status' align='left' padding='normal'>
                          {'Status'}
                          <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                        </TableCell>
                        {!this.state.companyAndSiteFilter.siteFilter ? (
                          <TableCell>Site Name</TableCell>
                        ) : (
                          <TableCell onClick={() => this.clickOnHeaderCell('Site Name')} classes={{ root: classes.headRoot }} style={this.state.siteFilterName.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='site' align='left' padding='normal'>
                            {'Site Name'}
                            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                          </TableCell>
                        )}
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
                              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                              multiple
                              filterOptions={filterOptions}
                              value={this.state.selectedAssetNameVal}
                              id='assetIdFilter'
                              options={this.state.allAssetsLists}
                              getOptionLabel={option => option.name}
                              name='assetId'
                              loading={this.state.isAssetNameListLoading}
                              onChange={(e, val) => this.handleAssetNameFilterChange(e, val)}
                              onInputChange={(e, val) => this.handleAssetNameFilterInputChange(e, val)}
                              onClose={() => this.setState({ isAssetNameListLoading: false })}
                              noOptionsText='No asset found'
                              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Asset' id='assetNameFilterOptions' />}
                            />
                          </TableCell>
                          {localStorage.getItem('roleName') === enums.userRoles[1].role && (
                            <TableCell>
                              {this.state.companyAndSiteFilter.companyFilter ? (
                                <Autocomplete
                                  multiple
                                  size='small'
                                  ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, noOptions: classes.LoadingWrapper, loading: classes.LoadingWrapper }}
                                  id='company'
                                  value={this.state.selectedCompanyVal}
                                  options={this.state.allCompanies}
                                  loading={this.state.isCompanyListLoading}
                                  onClose={() => this.setState({ isCompanyListLoading: false })}
                                  onInputChange={(e, val) => this.handleCompanyFilterInputChange(e, val)}
                                  getOptionLabel={option => option.company_name}
                                  name='companyId'
                                  onChange={(e, val) => this.handleCompanyFilterChange(e, val)}
                                  noOptionsText='No company found'
                                  renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select company' name='companyId' />}
                                />
                              ) : (
                                ''
                              )}
                            </TableCell>
                          )}
                          {
                            <TableCell>
                              <Autocomplete
                                size='small'
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                value={this.state.selectedIssueFilter}
                                id='issueIdFilter'
                                options={this.state.allIssue}
                                getOptionLabel={option => option.name}
                                name='IssueId'
                                onChange={(e, val) => this.showOpenIssues(e, val)}
                                renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Issue' className='filter-input-disable-lastpass' name='issuesID' />}
                              />
                            </TableCell>
                          }
                          <TableCell classes={{ root: classes.headFilter }}>
                            <Autocomplete
                              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                              size='small'
                              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                              loading={this.state.isModelListLoading}
                              onClose={() => this.setState({ isModelListLoading: false })}
                              onInputChange={(e, val) => this.handleModelFilterInputChange(e, val)}
                              multiple
                              id='modelIdFilter'
                              value={this.state.selectedModelVal}
                              options={this.state.allAssetModelLists}
                              getOptionLabel={option => option.name}
                              name='modelId'
                              onChange={(e, val) => this.handleModelFilterChange(e, val)}
                              noOptionsText='No model found'
                              renderInput={params => <TextField {...params} className='filter-input-disable-lastpass' variant='outlined' margin='normal' fullWidth placeholder='Select Model' name='modelId' />}
                            />
                          </TableCell>
                          <TableCell classes={{ root: classes.headFilter }}>
                            <Autocomplete
                              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                              size='small'
                              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                              loading={this.state.isModelYearListLoading}
                              onClose={() => this.setState({ isModelYearListLoading: false })}
                              onInputChange={(e, val) => this.handleModelYearFilterInputChange(e, val)}
                              multiple
                              id='modelYearIdFilter'
                              value={this.state.selectedModelYearVal}
                              options={this.state.allAssetModelYearLists}
                              getOptionLabel={option => option.name}
                              name='modelId'
                              onChange={(e, val) => this.handleModelYearFilterChange(e, val)}
                              noOptionsText='No year found'
                              renderInput={params => <TextField className='filter-input-disable-lastpass' {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Model Year' name='modelId' />}
                            />
                          </TableCell>
                          <TableCell>
                            <Autocomplete
                              size='small'
                              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                              id='statusIdFilter'
                              value={this.state.selectedStatus}
                              options={this.state.allStausLists}
                              getOptionLabel={option => option.status}
                              name='modelId'
                              onChange={(e, val) => this.handleStatusFilterChange(e, val)}
                              noOptionsText='No status found'
                              renderInput={params => <TextField {...params} className='filter-input-disable-lastpass' variant='outlined' margin='normal' fullWidth placeholder='Select Status' name='statusId' />}
                            />
                          </TableCell>
                          {!this.state.companyAndSiteFilter.siteFilter ? (
                            <TableCell></TableCell>
                          ) : (
                            <TableCell>
                              <Autocomplete
                                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                                multiple
                                size='small'
                                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                                loading={this.state.isSiteListLoading}
                                onClose={() => this.setState({ isSiteListLoading: false })}
                                onInputChange={(e, val) => this.handleSiteFilterInputChange(e, val)}
                                id='siteIdFilter'
                                value={this.state.siteFilterName}
                                options={this.state.allSites}
                                getOptionLabel={option => option.site_name}
                                name='modelId'
                                onChange={(e, val) => this.handleSiteFilterChange(e, val)}
                                noOptionsText='No site found'
                                renderInput={params => <TextField className='filter-input-disable-lastpass' {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Site Name' name='siteId' />}
                              />
                            </TableCell>
                          )}
                          {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && <TableCell></TableCell>}
                        </TableRow>
                      )}
                    </TableHead>
                    {this.state.isDataLoading ? (
                      <TableLoader cols={this.checkUserRole.isCompanyAdmin() ? 6 : 7} />
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
                            <TableRow key={key} className={tableRow.status === enums.assetStatus[0].status ? '' : 'inactive-bg'}>
                              {this.state.isDownloadBarcode && (
                                <TableCell className={classes.tableCell}>
                                  <Checkbox id={tableRow.assetID} name={tableRow.assetID} color='primary' value='chkBox' checked={this.state.chkbox[tableRow.assetID] || false} onChange={e => this.handleChkboxChange(e, rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage))} />
                                </TableCell>
                              )}
                              <TableCell className={classes.tableCell}>{tableRow.name ? tableRow.name : '-'}</TableCell>
                              {localStorage.getItem('roleName') === enums.userRoles[1].role && <TableCell className={classes.tableCell}>{tableRow.company ? tableRow.company : '-'}</TableCell>}
                              <TableCell className={classes.tableCell}>
                                {tableRow.openIssuesCount ? (
                                  <Badge onClick={() => this.handleOnClickOnIssue(tableRow)} badgeContent={tableRow.openIssuesCount} color='error' max={99} style={{ marginTop: '10px', cursor: 'pointer' }} classes={{ badge: classes.badgeRoot, anchorOriginTopRightRectangular: classes.badge }}>
                                    <ErrorOutlineIcon fontSize='small' />
                                  </Badge>
                                ) : (
                                  ''
                                )}
                              </TableCell>
                              <TableCell className={classes.tableCell}>{tableRow.category ? tableRow.category : '-'}</TableCell>
                              <TableCell className={classes.tableCell}>{tableRow.modelYear ? tableRow.modelYear : '-'}</TableCell>
                              <TableCell className={classes.tableCell}>{tableRow.status ? tableRow.status : '-'}</TableCell>
                              <TableCell className={classes.tableCell}>{tableRow.site ? tableRow.site : '-'}</TableCell>
                              {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && (
                                <TableCell>
                                  <Tooltip title='View' placement='top'>
                                    <IconButton size='small' onClick={() => this.viewDetails(tableRow.AssetObj.asset_id)}>
                                      <VisibilityOutlinedIcon fontSize='small' />
                                    </IconButton>
                                  </Tooltip>
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
              {this.state.isDownloadBarcode && (
                <Button variant='contained' color='primary' className='nf-buttons' onClick={this.handlePrintBarcode} style={{ position: 'absolute', left: 8, bottom: 10 }}>
                  Print Barcode
                </Button>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
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

AssetList.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(AssetList))
