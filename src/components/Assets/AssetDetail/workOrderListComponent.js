import React from 'react'
import { Link } from 'react-router-dom'
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
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { connect } from 'react-redux'
import $ from 'jquery'
import _ from 'lodash'
import workOrderListAction from '../../../Actions/WorkOrder/workOrderListAction'
import workOrderFilterStateAction from '../../../Actions/WorkOrder/workOrderFilter.action'
import workOrderSearchAction from '../../../Actions/Search/workOrderSearchAction'
import assetNameListAction from '../../../Actions/Assets/assetNameListAction'
import enums from '../../../Constants/enums'
import moment from 'moment'
import debounce from 'lodash.debounce'
import TablePagination from '@material-ui/core/TablePagination'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import FilterListIcon from '@material-ui/icons/FilterList'
import { Typography } from '@material-ui/core'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getAllWorkOrderAndFilter from '../../../Services/WorkOrder/getAllWorkOrderAndFilter'
import { history } from '../../../helpers/history'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Fab from '@material-ui/core/Fab'
import getUserRole from '../../../helpers/getUserRole'
import getUserSitesData from '../../../helpers/getUserSitesData'
import TableLoader from '../../TableLoader'
import URL from '../../../Constants/apiUrls'
import issueFilterOptions from '../../../Services/WorkOrder/issueFilterOptions.service'

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

class WorkOrderList extends React.Component {
  constructor() {
    super()
    self = this
    this.checkUserRole = new getUserRole()
    this.getUserSitesData = new getUserSitesData()
    var loginData = JSON.parse(localStorage.getItem('loginData'))
    this.filterEnums = {
      TITLE: 'TITLE',
      ASSET_NAME: 'ASSET_NAME',
      PRIORITY: 'PRIORITY',
      STATUS: 'STATUS',
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
      tostMsg: {},
      anchorEl2: null,
      selectedSiteFilter: [],
      siteFilterName: [],
      allSites: loginData.usersites.map(({ site_id, site_name, status }) => ({ site_id, site_name, status })),
      workOrderList: [],
      filterForColumn: false,
      filterForAssetNameVal: [],
      filterForPriority: [],
      filterForStatus: [],
      filterForTitle: [],
      allTitles: [],
      allAssetsLists: [],
      selectedAssetNameVal: [],
      selectedTitleVal: [],
      priorityVal: null,
      statusVal: [],
      size: 0,
      clearFilterButton: true,
      companyAndSiteFilter: {},
      allPriorities: [],
      allStausLists: [],
      primaryFilterName: '',
      isDataLoading: true,
      isAssetNameListLoading: false,
      isTitleListLoading: false,
      isSiteListLoading: false,
      assetNameOptionsPageIndex: 1,
      titleOptionsPageIndex: 1,
      siteOptionsPageIndex: 1,
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
  }

  async componentDidMount() {
    this.setState({ isDataLoading: true })

    if (history.location.state) {
      this.setState(
        {
          filterForAssetNameVal: [history.location.state.asset_id],
          selectedAssetNameVal: [history.location.state],
          filterForStatus: [],
          statusVal: [],
        },
        () => this.filterBasedOnColumn()
      )
    } else {
      //console.log(this.props.workOrderFilterStateReducer)
      if (history.action === 'POP') {
        const { workOrderFilters } = this.props.workOrderFilterStateReducer
        if (!_.isEmpty(workOrderFilters)) {
          const { selectedTitleVal, selectedAssetNameVal, statusVal, priorityVal, siteFilterName } = workOrderFilters
          this.setState(
            {
              filterForAssetNameVal: selectedAssetNameVal.map(asset => asset.asset_id),
              selectedAssetNameVal,
              filterForTitle: selectedTitleVal.map(asset => asset.name),
              selectedTitleVal,
              filterForStatus: statusVal ? statusVal.map(asset => asset.id) : [],
              statusVal,
              filterForPriority: priorityVal ? [priorityVal.id] : [],
              priorityVal,
              siteFilterName,
              selectedSiteFilter: siteFilterName.map(m => m.site_id),
            },
            () => this.filterBasedOnColumn()
          )
        } else {
          this.filterBasedOnColumn()
        }
      } else {
        //  console.log('First')
        this.filterBasedOnColumn()
      }
    }
  }

  handleSearchOnKeyDown = e => {
    if (e.key === 'Enter') {
      var searchString = $('#workOrderSearchInput').val().trim()
      this.setState({ searchString: searchString, searchStringOnEnter: true }, () => this.filterBasedOnColumn())
    }
  }

  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.filterBasedOnColumn())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.filterBasedOnColumn())

  clearSearch = e => this.setState({ searchString: '', searchStringOnEnter: false, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  clickOnHeaderCell = () => this.setState({ filterForColumn: !this.state.filterForColumn })
  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)
  makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))

  //*------------------Column Filter----------------------------
  handleSiteFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE_NAME), siteFilterName: this.makeUniqueArray(val), selectedSiteFilter: val.length !== 0 ? val.map(m => m.site_id) : [] }, () => this.filterBasedOnColumn())
  handleAssetNameFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.ASSET_NAME), filterForAssetNameVal: val.map(asset => asset.asset_id), selectedAssetNameVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handleTitleFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.TITLE), filterForTitle: val.map(asset => asset.name), selectedTitleVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())
  handlePriorityFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.PRIORITY), filterForPriority: val ? [val.id] : [], priorityVal: val }, () => this.filterBasedOnColumn())
  handleStatusFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: val.length !== 0 ? this.checkAndSetPrimaryFilter(this.filterEnums.STATUS) : '', filterForStatus: val.length ? val.map(asset => asset.id) : [], statusVal: this.makeUniqueArray(val) }, () => this.filterBasedOnColumn())

  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const { pageSize, selectedTitleVal, selectedAssetNameVal, siteFilterName, statusVal, priorityVal, pageIndex, loginData, filterForAssetNameVal, searchString, selectedSiteFilter, filterForStatus, filterForPriority, filterForTitle } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      user_id: loginData.uuid,
      site_id: selectedSiteFilter,
      status: filterForStatus,
      asset_id: [this.props.assetId],
      search_string: searchString,
      priority: filterForPriority,
      issue_title: filterForTitle,
      timezone: moment.tz.guess(true).replace('/', '-'),
    }
    this.props.workOrderFilterStateAction({ selectedTitleVal, selectedAssetNameVal, statusVal, priorityVal, siteFilterName })
    const data = await getAllWorkOrderAndFilter(payload)
    //console.log(data)
    if (data.success === false) {
      this.setState({ workOrderList: data.list, size: data.listsize, isDataLoading: false }, () => this.checkClearFilterDisablity())
      this.fetchInitialOptions()
    } else {
      this.setState({ workOrderList: [], isDataLoading: false })
      this.fetchInitialOptions()
    }
  }

  clearFilters = () => {
    this.setState(
      {
        pagesize: 20,
        pageIndex: 1,
        page: 0,
        selectedSiteFilter: [],
        filterForStatus: [],
        filterForAssetNameVal: [],
        filterForPriority: [],
        filterForTitle: [],
        siteFilterName: [],
        selectedTitleVal: [],
        selectedAssetNameVal: [],
        priorityVal: null,
        statusVal: [],
        filterForColumn: false,
        primaryFilterName: '',
      },
      () => this.filterBasedOnColumn()
    )
  }

  checkClearFilterDisablity = () => {
    if (this.state.selectedAssetNameVal.length !== 0 || this.state.selectedTitleVal.length !== 0 || this.state.statusVal.length !== 0 || this.state.priorityVal !== null || this.state.siteFilterName.length !== 0) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', assetNameOptionsPageIndex: 1, titleOptionsPageIndex: 1, siteOptionsPageIndex: 1 })
    }
  }

  //*----- Fetch initial Options
  fetchInitialOptions = async () => {
    this.setState({ isDataLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const titleOpts = await issueFilterOptions(URL.filterIssuesTitleOptions, payload)

    this.setState({
      allTitles: this.state.primaryFilterName !== this.filterEnums.TITLE ? titleOpts.list : this.state.allTitles,
      allPriorities: enums.priority,
      allStausLists: enums.workOrderStatus,
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
    option_search_string: val,
    search_string: this.state.searchString,
    priority: this.state.filterForPriority,
    issue_title: this.state.filterForTitle,
  })

  //*------ Fetching More options on scroll
  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }

  fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = this.getFilterOptionsPayload(val)
    switch (id) {
      case 'assetIdFilter':
        this.setState({ assetNameOptionsPageIndex: this.state.assetNameOptionsPageIndex + 1 }, async () => {
          const data = await issueFilterOptions(URL.filterIssuesAssetOptions, { ...payload, asset_id: [], pageindex: this.state.assetNameOptionsPageIndex })
          this.setState({ allAssetsLists: [...this.state.allAssetsLists, ...data.list] })
        })
        break
      case 'titleIdFilter':
        this.setState({ titleOptionsPageIndex: this.state.titleOptionsPageIndex + 1 }, async () => {
          const data = await issueFilterOptions(URL.filterIssuesTitleOptions, { ...payload, issue_title: [], pageindex: this.state.titleOptionsPageIndex })
          this.setState({ allTitles: [...this.state.allTitles, ...data.list] })
        })
        break
      case 'siteIdFilter':
        this.setState({ siteOptionsPageIndex: this.state.siteOptionsPageIndex + 1 }, async () => {
          const data = await issueFilterOptions(URL.filterIssuesSitesOptions, { ...payload, site_id: [], pageindex: this.state.siteOptionsPageIndex })
          this.setState({ allSites: [...this.state.allSites, ...data.list] })
        })
        break

      default:
        break
    }
  }

  handleAssetNameFilterInputChange = async (e, val) => {
    this.setState({ isAssetNameListLoading: true, assetNameOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await issueFilterOptions(URL.filterIssuesAssetOptions, { ...payload, asset_id: [] })
        this.setState({ allAssetsLists: data.list, isAssetNameListLoading: false })
      }
    }, 700)
  }
  handleTitleFilterInputChange = async (e, val) => {
    this.setState({ isTitleListLoading: true, titleOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await issueFilterOptions(URL.filterIssuesTitleOptions, { ...payload, issue_title: [] })
        this.setState({ allTitles: data.list, isTitleListLoading: false })
      }
    }, 700)
  }
  handleSiteFilterInputChange = async (e, val) => {
    this.setState({ isSiteListLoading: true, siteOptionsPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await issueFilterOptions(URL.filterIssuesSitesOptions, { ...payload, site_id: [] })
        this.setState({ allSites: data.list, isSiteListLoading: false })
      }
    }, 700)
  }

  handleOnClick = tableRow => {
    if (this.isAccesibleByUser()) {
      history.push(`../../issues/details/${tableRow.id}`)
    }
  }

  isAccesibleByUser = () => {
    console.log(this.checkUserRole.isManager() || this.checkUserRole.isExecutive())
    if (this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) {
      return true
    }
    return false
  }

  render() {
    const active = this.getUserSitesData.getActiveSite()
    let workderdata = this.state.workOrderList
    let searchString = this.state.searchString !== null ? this.state.searchString : decodeURI(_.get(this, ['props', 'searchString'], ''))
    var rows = []
    const filterOptions = createFilterOptions({
      matchFrom: 'any',
      stringify: option => option.name.trim() + option.internal_asset_id,
      trim: true,
    })
    const { classes } = this.props
    const createData = (id, workOrderName, assetName, status, priority, timeElapsed, siteName) => ({ id, workOrderName, assetName, status, priority, timeElapsed, siteName })

    if (workderdata.length > 0) {
      rows = []
      workderdata.forEach(value => {
        var priority = ''
        enums.priority.forEach(value1 => {
          if (value1.id === value.priority) {
            priority = value1.priority
          }
        })
        var result = createData(value.issue_uuid, value.name, value.asset_name, value.status_name, priority, value.timeelapsed, value.site_name)
        rows.push(result)
      })
    }
    return (
      <div className={classes.paper + ' tableminheight'}>
        <div className='d-flex flex-row-reverse justify-content-start mb-2'>
          <TextField
            className={classes.searchInput}
            id='workOrderSearchInput'
            placeholder='Search Issues'
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
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vj - 420px)', height: 'calc(100vh - 420px)' }}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => this.clickOnHeaderCell()} classes={{ root: classes.headRoot }} style={this.state.selectedTitleVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='title' align='left' padding='default'>
                  {'Issue Title'}
                  <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                </TableCell>

                <TableCell onClick={() => this.clickOnHeaderCell()} classes={{ root: classes.headRoot }} style={this.state.statusVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='status' align='left' padding='default'>
                  {'Status'}
                  <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                </TableCell>
                <TableCell onClick={() => this.clickOnHeaderCell()} classes={{ root: classes.headRoot }} style={this.state.priorityVal !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='priority' align='left' padding='default'>
                  {'Priority'}
                  <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                </TableCell>

                {/* {(this.checkUserRole.isManager() || this.checkUserRole.isExecutive()) && (
                  <TableCell onClick={() => this.clickOnHeaderCell('Actions')} id='name' align='left' padding='default' style={{ fontWeight: 800 }}>
                    {'Actions'}
                  </TableCell>
                )} */}
              </TableRow>
              {this.state.filterForColumn && (
                <TableRow>
                  <TableCell classes={{ root: classes.headFilter }}>
                    <Autocomplete
                      multiple
                      size='small'
                      ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                      loading={this.state.isTitleListLoading}
                      onClose={() => this.setState({ isTitleListLoading: false })}
                      onInputChange={(e, val) => this.handleTitleFilterInputChange(e, val)}
                      classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                      value={this.state.selectedTitleVal}
                      id='titleIdFilter'
                      options={this.state.allTitles}
                      getOptionLabel={option => option.name}
                      name='reqId'
                      onChange={(e, val) => this.handleTitleFilterChange(e, val)}
                      noOptionsText='No title found'
                      renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Issue Title' name='reqId' />}
                    />
                  </TableCell>
                  <TableCell classes={{ root: classes.headFilter }}>
                    <Autocomplete
                      size='small'
                      multiple
                      classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                      value={this.state.statusVal}
                      id='statusIdFilter'
                      options={this.state.allStausLists}
                      getOptionLabel={option => option.status}
                      name='statusId'
                      onChange={(e, val) => this.handleStatusFilterChange(e, val)}
                      noOptionsText='No status found'
                      renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Status' name='statusId' />}
                    />
                  </TableCell>
                  <TableCell classes={{ root: classes.headFilter }}>
                    <Autocomplete
                      size='small'
                      classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                      value={this.state.priorityVal}
                      id='shiftIdFilter'
                      options={this.state.allPriorities}
                      getOptionLabel={option => option.priority}
                      name='shiftId'
                      onChange={(e, val) => this.handlePriorityFilterChange(e, val)}
                      noOptionsText='No priority found'
                      renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Priority' name='shiftId' />}
                    />
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableHead>
            {this.state.isDataLoading ? (
              <TableLoader cols={3} rows={10} />
            ) : _.isEmpty(rows) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='6' className='Pendingtbl-no-datafound'>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {rows.map((tableRow, key) => {
                  return (
                    <TableRow key={key} onClick={() => this.handleOnClick(tableRow)} className={this.isAccesibleByUser() ? 'table-with-row-click' : ''}>
                      <TableCell className={classes.tableCell}>{tableRow.workOrderName ? tableRow.workOrderName : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.status ? tableRow.status : '-'}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.priority ? tableRow.priority : '-'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>
        {_.isEmpty(rows) ? '' : <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onChangePage={this.handleChangePage} onChangeRowsPerPage={this.handleChangeRowsPerPage} />}
      </div>
    )
  }
}
function mapState(state) {
  if (state.workOrderListReducer) {
    if (self) {
      //console('state.workOrderListReducer.isDataNoFound ---------', state.workOrderListReducer.isDataNoFound)
      self.setState({ isDataNotFound: state.workOrderListReducer.isDataNoFound })

      if (!_.isEmpty(state.workOrderListReducer.tostMsg)) {
        self.setState({ tostMsg: state.workOrderListReducer.tostMsg })
      }
    }
  }
  if (state.assetNameListReducer) {
    if (self) self.setState({ allAssetsLists: [] })
  }
  return state
}

const actionCreators = {
  workOrderList: workOrderListAction,
  workOrderSearchList: workOrderSearchAction,
  assetNameListAction: assetNameListAction,
  workOrderFilterStateAction,
}

WorkOrderList.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(WorkOrderList))
