import React from 'react'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import { connect } from 'react-redux'
import inspectionListAction from '../../../Actions/Inspection/inspectionListAction'
import inspectionFilterStateAction from '../../../Actions/Inspection/inspectionFilter.action'
import inspectionSearchListAction from '../../../Actions/Search/inspectionSearchAction'
import approveInspectionAction from '../../../Actions/Inspection/approveInspectionAction'
import inspectionStateUpdate from '../../../Actions/Inspection/inspectionStateUpdate'
import TablePagination from '@material-ui/core/TablePagination'
import $ from 'jquery'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import moment from 'moment'
import debounce from 'lodash.debounce'
import enums from '../../../Constants/enums'
import { history } from '../../../helpers/history'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import Badge from '@material-ui/core/Badge'
import ImageIcon from '@material-ui/icons/Image'
import WarningIcon from '@material-ui/icons/Warning'
import Chip from '@material-ui/core/Chip'
import Autocomplete from '@material-ui/lab/Autocomplete'
import getAllInspectionAndFilter from '../../../Services/Inspection/getAllInspectionAndFilter'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Fab from '@material-ui/core/Fab'
import { Typography } from '@material-ui/core'
import companyList from '../../../Services/getAllCompany'
import getUserRole from '../../../helpers/getUserRole'
import getUserSitesData from '../../../helpers/getUserSitesData'
import TableLoader from '../../TableLoader'
import inspectionFilterOptions from '../../../Services/Inspection/inspectionFilterOptions'
import URL from '../../../Constants/apiUrls'
import PerformChecklist from './PerformChecklist'

var self

const styles = theme => ({
  root: { padding: 20, flexGrow: 1 },
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
  tableContainer: {
    paddingTop: 0,
    height: '630px',
    overflowY: 'srcoll',
    '&::-webkit-scrollbar': {
      width: '0.4em',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#e0e0e0',
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
      assetNameOptionsPageIndex: 1,
      companyOptionsPageIndex: 1,
      siteOptionsPageIndex: 1,
      shiftOptionsPageIndex: 1,
      reqOptionsPageIndex: 1,
      isCheckListFormOpen: false,
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleViewInspection = this.handleViewInspection.bind(this)
    this.closePopUp = this.closePopUp.bind(this)
  }

  async componentDidMount() {
    const allSites = []
    this.setState({ isDataLoading: true })
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
  }
  handleSearchOnKeyDown = e => {
    var searchString = $('#inspectionSearchInput').val().trim()
    if (e.key === 'Enter') {
      this.setState({ searchString: searchString, searchStringOnEnter: true, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
    }
  }

  handleApproveInspection = (e, selctedRow, rows) => {
    var result = this.checkPreviosInspectionPending(selctedRow, rows)
    if (result) {
      this.setState({ showInspectionPopUp: true })
    } else {
      var inspectionDetail = this.state.inspectionList.filter(x => x.inspection_id === selctedRow.id)
      $('#pageLoading').show()
      var requestData = {
        inspection_id: selctedRow.id,
        asset_id: _.get(inspectionDetail[0], ['asset', 'asset_id'], ''),
        manager_id: this.state.loginData.uuid,
        status: enums.inspectionStatus[2].id,
        manager_notes: null,
        meter_hours: parseInt(selctedRow.hourMeter),
      }
      this.props.approveInspection(requestData, this.state.searchString, enums.approveInspectionFromType[1].id)
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
    history.push(`../../inspections/details/${selctedRow.id}`)
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

  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const { pageSize, pageIndex, selectedCompany, loginData, searchString, filterForAssetNameVal, siteFilterName, filterNewAttributeVal, selectedStatus, selectedReq, selectedShift, selectedAssetNameVal, filterForRequestor, selectedSiteFilter, filterForAssetInternalId, filterForStatus, filterForShift, filterNewAttribute } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      user_id: loginData.uuid,
      site_id: selectedSiteFilter,
      status: filterForStatus,
      asset_id: [this.props.assetId],
      shift_number: filterForShift,
      internal_asset_id: filterForAssetInternalId,
      requestor_id: filterForRequestor,
      new_not_ok_attribute: Number(filterNewAttribute),
      search_string: searchString,
      timezone: moment.tz.guess(true).replace('/', '-'),
      company_id: selectedCompany,
    }
    this.props.inspectionFilterStateAction({ selectedAssetNameVal, filterNewAttributeVal, selectedStatus, selectedShift, selectedReq, siteFilterName })
    const data = await getAllInspectionAndFilter(payload)
    //console.log(data)

    if (data.success === false) {
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
      },
      () => this.filterBasedOnColumn()
    )
  }

  checkClearFilterDisablity = () => {
    if (this.state.selectedAssetNameVal.length !== 0 || this.state.filterNewAttributeVal !== null || this.state.selectedReq.length !== 0 || this.state.selectedShift.length !== 0 || this.state.selectedStatus !== null || this.state.siteFilterName.length !== 0 || this.state.selectedCompanyVal.length !== 0) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', assetNameOptionsPageIndex: 1, companyOptionsPageIndex: 1, siteOptionsPageIndex: 1, shiftOptionsPageIndex: 1, reqOptionsPageIndex: 1 })
    }
  }

  //*----- Fetch initial Options
  fetchInitialOptions = async () => {
    this.setState({ isDataLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const reqOpts = await inspectionFilterOptions(URL.filterInspectionOperatorsOptions, payload)
    this.setState({
      allRequestorLists: this.state.primaryFilterName === this.filterEnums.REQUESTOR ? this.state.allRequestorLists : reqOpts.list,
      isDataLoading: false,
    })
  }

  getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: this.state.selectedSiteFilter,
    company_id: this.state.selectedCompany,
    status: this.state.filterForStatus,
    asset_id: [this.props.assetId],
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

      default:
        break
    }
  }

  render() {
    let searchString = this.state.searchString != null ? this.state.searchString : decodeURI(_.get(this, ['props', 'inspectionListReducer', 'searchString'], ''))
    //console.log(this.state)
    var rows = []
    const { classes } = this.props

    const createData = (id, dateTime, site, company, notOkAttr, imageCount, newNotOkAttrCount, name, status, timeElapsed, shift, requestingOperator, internalAssetId, hourMeter, tz) => {
      return { id, dateTime, site, company, notOkAttr, imageCount, name, newNotOkAttrCount, status, timeElapsed, shift, requestingOperator, internalAssetId, hourMeter, tz }
    }

    if (this.state.inspectionList.length) {
      rows = []
      this.state.inspectionList.map((value, key) => {
        const imageCount = value.image_list !== null ? value.image_list.image_names.length : 0
        const notOkCount = value.new_notok_attributes.length
        const notOkAttr = value.new_notok_attributes
        var result = createData(
          value.inspection_id,
          value.datetime_requested,
          value.sites.site_name,
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
          value.sites.timezone
        )
        rows.push(result)
        return
      })
    }

    return (
      <div>
        <div className={classes.paper + ' tableminheight'}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Button size='small' onClick={() => history.push(`../../assets/perform-checklist/${this.props.assetId}`)} variant='contained' color='primary' className='nf-buttons' disableElevation>
                Perform Checklist
              </Button>
            </Grid>
            <Grid item xs={4}></Grid>

            <Grid className='text_r' item xs={3}>
              <TextField
                className={classes.searchInput}
                id='inspectionSearchInput'
                fullWidth={true}
                placeholder='Search Checklists'
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
            {/* <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Fab variant='extended' color='primary' size='small' onClick={() => this.clearFilters()} disabled={this.state.clearFilterButton}>
                <RotateLeftSharpIcon />
                <Typography className={classes.buttonText}>Reset Filter(s)</Typography>
              </Fab>
            </Grid> */}
            <Grid item xs={12} classes={{ item: classes.tableContainer }} style={{ paddingTop: 0, overflowY: 'scroll' }}>
              <Table size='small' stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align='left' padding='normal'>
                      Datetime
                    </TableCell>
                    <TableCell onClick={() => this.clickOnHeaderCell('Requestor')} classes={{ root: classes.headRoot }} style={this.state.selectedReq.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='Requestor' align='left' padding='normal'>
                      Requestor
                      <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                    </TableCell>
                    <TableCell onClick={() => this.clickOnHeaderCell('Issues')} classes={{ root: classes.headRoot }} style={this.state.filterNewAttributeVal !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='issues' align='left' padding='normal'>
                      New Issues
                      <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                    </TableCell>
                    {/* <TableCell align='left' padding='normal' style={{ fontWeight: 500 }}>
                      Meter Reading
                    </TableCell> */}
                    <TableCell align='left' padding='normal' style={{ fontWeight: 500 }}>
                      Action
                    </TableCell>
                  </TableRow>

                  {this.state.filterForColumn && (
                    <TableRow>
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
                          getOptionLabel={option => option.username}
                          name='reqId'
                          onChange={(e, val) => this.handleRequetorFilterChange(e, val)}
                          noOptionsText='No operator found'
                          renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Requestor' name='reqId' className='filter-input-disable-lastpass' />}
                        />
                      </TableCell>
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

                      <TableCell></TableCell>
                      {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && <TableCell></TableCell>}
                    </TableRow>
                  )}
                </TableHead>
                {this.state.isDataLoading ? (
                  <TableLoader cols={5} rows={10} />
                ) : _.isEmpty(rows) ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan='7' className='Pendingtbl-no-datafound'>
                        No data found
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody id='t-body'>
                    {rows.map((tableRow, key) => {
                      return (
                        <TableRow key={key}>
                          <TableCell className={classes.tableCell}>{tableRow.dateTime ? moment.utc(tableRow.dateTime).tz(tableRow.tz).format('MM-DD-YYYY LT') : '-'}</TableCell>
                          <TableCell className={classes.tableCell}>{tableRow.requestingOperator ? tableRow.requestingOperator : '-'}</TableCell>
                          <TableCell className={classes.tableCell}>
                            {tableRow.newNotOkAttrCount ? (
                              <>
                                <HtmlTooltip placement='right' title={tableRow.newNotOkAttrCount ? tableRow.notOkAttr.map(attr => <Chip size='small' key={attr.id} label={attr.name} style={{ marginRight: '5px', marginBottom: '5px' }} />) : ''}>
                                  <Badge overlap='rectangular' onClick={() => this.handleOnClickOnIssue(tableRow)} badgeContent={tableRow.newNotOkAttrCount} color='error' max={99} style={{ marginTop: '10px', cursor: 'pointer' }} classes={{ badge: classes.badgeRoot, anchorOriginTopRightRectangular: classes.badge }}>
                                    <WarningIcon fontSize='small' />
                                  </Badge>
                                </HtmlTooltip>
                              </>
                            ) : (
                              ''
                            )}
                          </TableCell>
                          {/* <TableCell className={classes.tableCell}>{tableRow.hourMeter ? tableRow.hourMeter : '-'}</TableCell> */}

                          {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && (
                            <TableCell width='10%'>
                              <Grid container alignItems='center'>
                                <Tooltip title='View' placement='top'>
                                  <IconButton size='small' onClick={e => this.handleViewInspection(e, tableRow, rows)}>
                                    <VisibilityOutlinedIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              </Grid>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                )}
              </Table>
            </Grid>
            {_.isEmpty(rows) ? '' : <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
            {this.state.isCheckListFormOpen && <PerformChecklist open={this.state.isCheckListFormOpen} onClose={() => this.setState({ isCheckListFormOpen: false })} obj={this.props.assetDetails} afterSubmit={() => this.filterBasedOnColumn()} />}
          </Grid>
        </div>
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
