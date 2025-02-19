import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import AddIcon from '@material-ui/icons/Add'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import { withStyles } from '@material-ui/styles'
import _ from 'lodash'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import Menu from '@material-ui/core/Menu'
import TablePagination from '@material-ui/core/TablePagination'
import MenuItem from '@material-ui/core/MenuItem'
import AddRequest from './AddRequest'
import ViewRequest from './ViewRequest'
import EditRequest from './EditRequest'
import ResolveIssue from './ResolveIssue'
import getAllMR from '../../Services/Requests/getAllMR'
import getAllRequestor from '../../Services/Requests/getAllRequestor'
import CreateWorkorder from '../WorkOrders/CreateWorkorder'
import MoreVertIcon from '@material-ui/icons/MoreVert'

const styles = theme => ({
  tableCell: { fontSize: '12px', fontWeight: 400 },
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
  inputRoot: {
    display: 'flex',
    flexDirection: 'Column',
    alignItems: 'flex-start',
    '&[class*="MuiOutlinedInput-root"] .MuiAutocomplete-input': {
      width: '100%',
      fontSize: '12px',
    },
  },
  input: { fontSize: '12px !important' },
  autoInput: { width: '100%' },
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white', marginLeft: '5px' },
  menu: { padding: 0, fontSize: 13, boxShadow: '1px 2px 4px 1px #8080800a' },
})

export class MaintainanceRequests extends Component {
  //
  constructor(props) {
    super(props)
    this.payloadForOptions = {
      pageIndex: 1,
      pageSize: 20,
      mr_id: [],
      type: 0,
      requested_by: '',
      search_string: '',
      option_search_string: '',
      mr_filter_type: 0,
    }
    this.state = {
      loading: true,
      rows: [],
      pageSize: 20,
      pageIndex: 1,
      rowsPerPage: 20,
      page: 0,
      searchString: '',
      size: 1,
      filter_type: 0,
      filterForColumn: false,
      status_filter_text: 'All',
      isAddRequestFormOpen: false,
      isEditRequestFormOpen: false,
      isViewRequestFormOpen: false,
      isResolveIssueFormOpen: false,
      isCreateWOFormOpen: false,
      anchorEl: null,
      anchorData: {},
      anchorElFil: null,
      viewObj: {},
      resolveObj: {},
      workOrderObj: {},
      filterOptionsForType: [
        { id: 52, value: 'Manual' },
        { id: 53, value: 'Inspection' },
      ],
      selectedTypeForFilter: null,
      filterOptionsForReq: [],
      selectedReqForFilter: null,
      clearFilterButton: true,
      pageIndexForReqFilter: 1,
      listLoadingForReqFilter: false,
    }
  }
  //
  async componentDidMount() {
    const payload = {
      pageIndex: 0,
      pageSize: 0,
      mr_id: [],
      type: 0,
      requested_by: '',
      search_string: '',
      mr_filter_type: 0,
    }
    this.fetchInitialOptions()
    this.filterRequests(payload)
  }
  fetchInitialOptions = async () => {
    try {
      const res = await getAllRequestor(this.payloadForOptions)
      // console.log(res.data.list)
      this.setState({ filterOptionsForReq: res.data.list })
    } catch (error) {
      console.log(error)
    }
  }
  //--------------Scroll Bottom----------------------//
  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }
  fetchMoreOptions = async target => {
    this.setState({ pageIndexForReqFilter: this.state.pageIndexForReqFilter + 1 }, async () => {
      const data = await getAllRequestor({ ...this.payloadForOptions, pageIndex: this.state.pageIndexForReqFilter })
      const list = data.success === 1 ? data.data.list : []
      this.setState({ filterOptionsForReq: [...this.state.filterOptionsForReq, ...list] })
    })
  }
  handleReqFilterInputChange = (e, val) => {
    if (e && e.target.nodeName === 'INPUT') {
      this.setState({ listLoadingForReqFilter: true, pageIndexForReqFilter: 1 })
      clearTimeout(this.typingTimer)
      this.typingTimer = setTimeout(async () => {
        const data = await getAllRequestor({ ...this.payloadForOptions, option_search_string: val })
        const list = data.success === 1 ? data.data.list : []
        this.setState({ filterOptionsForReq: list, listLoadingForReqFilter: false })
      }, 700)
    }
  }
  //filter methods
  handleTypeFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, selectedTypeForFilter: val }, () => this.constructRequestPayload())
  handleReqFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, selectedReqForFilter: val }, () => this.constructRequestPayload())

  checkClearFilterDisablity = () => {
    if (this.state.selectedTypeForFilter !== null || this.state.selectedReqForFilter !== null) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false })
    }
  }
  clearFilters = () => this.setState({ selectedTypeForFilter: null, selectedReqForFilter: null }, () => this.constructRequestPayload())
  //
  SearchControl = () => (
    <div>
      <TextField
        placeholder='Search Requests '
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchOutlined color='primary' />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment className='pointerCursor' position='end' onClick={e => this.setState({ searchString: '', page: 0, pageIndex: 1 }, () => this.constructRequestPayload())}>
              {this.state.searchString ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
            </InputAdornment>
          ),
        }}
        value={this.state.searchString}
        onChange={e => this.setState({ searchString: e.target.value })}
        onKeyDown={e => this.handleSearchOnKeyDown(e)}
      />
    </div>
  )
  HeaderTab = ({ classes, text, filter, cond }) => (
    <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} align='left' padding='normal' classes={{ root: classes.headRoot }} style={cond ? { background: '#eeeeee' } : { background: '#fafafa' }}>
      {text}
      {filter && <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />}
    </TableCell>
  )
  HearderControl = ({ classes, filterOptions }) => (
    <TableHead>
      <TableRow>
        {this.HeaderTab({ classes, text: 'Title' })}
        {this.HeaderTab({ classes, text: 'Type', filter: true })}
        {this.HeaderTab({ classes, text: 'Requested By', filter: true })}
        {this.HeaderTab({ classes, text: 'Status' })}
        {this.HeaderTab({ classes, text: 'Work Order' })}
        {this.HeaderTab({ classes, text: 'Time Elapsed' })}
        {this.HeaderTab({ classes, text: 'Priority' })}
        {this.HeaderTab({ classes, text: 'Actions' })}
      </TableRow>
      {this.state.filterForColumn && (
        <TableRow>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}>
            <Autocomplete
              size='small'
              style={{ width: '150px' }}
              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, input: classes.input, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
              value={this.state.selectedTypeForFilter}
              options={this.state.filterOptionsForType}
              getOptionLabel={option => option.value}
              onChange={(e, val) => this.handleTypeFilterChange(e, val)}
              noOptionsText='No type found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Type' id='assetNameFilterOptions' />}
            />
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}>
            <Autocomplete
              style={{ width: '150px' }}
              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
              size='small'
              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, input: classes.input, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
              value={this.state.selectedReqForFilter}
              options={this.state.filterOptionsForReq}
              getOptionLabel={option => option.requested_by_name}
              loading={this.state.listLoadingForReqFilter}
              onChange={(e, val) => this.handleReqFilterChange(e, val)}
              onInputChange={(e, val) => this.handleReqFilterInputChange(e, val)}
              onClose={() => this.setState({ listLoadingForReqFilter: false, pageIndexForReqFilter: 1 })}
              noOptionsText='No requestor found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Requestor' />}
            />
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
        </TableRow>
      )}
    </TableHead>
  )
  StatusFilter = () => (
    <>
      <Button onClick={e => this.setState({ anchorElFil: e.currentTarget })} startIcon={<FilterListIcon />} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
        {this.state.status_filter_text}
      </Button>
      <Menu id='schedule-list-menu' anchorEl={this.state.anchorElFil} keepMounted open={Boolean(this.state.anchorElFil)} onClose={() => this.setState({ anchorElFil: null })}>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 0, anchorElFil: null, status_filter_text: 'All' }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 0}>
          All
        </MenuItem>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 48, anchorElFil: null, status_filter_text: 'Open' }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 48}>
          Open
        </MenuItem>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 50, anchorElFil: null, status_filter_text: 'Completed' }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 50}>
          Completed
        </MenuItem>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 51, anchorElFil: null, status_filter_text: 'Workorder Created' }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 51}>
          Workorder Created
        </MenuItem>
      </Menu>
    </>
  )
  getWorkOrderStatus = (status, no) => {
    const { classes } = this.props
    const getColor = () => {
      if (status === 54) return '#003DDA'
      if (status === 55) return '#FF5C00'
      if (status === 56) return '#00B407'
      if (status === 57) return '#8F8F8F'
      if (status === 58) return '#D9B51C'
    }
    const getLabel = () => {
      if (status === 54) return 'New'
      if (status === 55) return 'In Progress'
      if (status === 56) return 'Completed'
      if (status === 57) return 'Cancelled'
      if (status === 58) return 'Reopened'
    }
    return (
      <span>
        {no ? `#${no} - ` : ``}
        <span className={classes.workOrderStatus} style={{ background: getColor() }}>
          {getLabel()}
        </span>
      </span>
    )
  }
  getStatus = status => {
    if (status === 48) return 'Open'
    if (status === 49) return 'Cancelled'
    if (status === 50) return 'Completed'
    if (status === 51) return 'Work Order Created'
  }
  getPriority = pr => {
    const { classes } = this.props
    const getColor = () => {
      if (pr === 45) return '#519839'
      if (pr === 46) return '#d9b51c'
      if (pr === 47) return '#cd8313'
    }
    const getLabel = () => {
      if (pr === 45) return 'Low'
      if (pr === 46) return 'Medium'
      if (pr === 47) return 'High'
    }
    return (
      <span className={classes.workOrderStatus} style={{ background: getColor() }}>
        {getLabel()}
      </span>
    )
  }
  //
  constructRequestPayload = () => {
    const payload = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      mr_id: [],
      search_string: this.state.searchString,
      mr_filter_type: this.state.filter_type,
      type: _.get(this.state, 'selectedTypeForFilter.id', 0),
      requested_by: _.get(this.state, 'selectedReqForFilter.requested_by', ''),
    }
    this.filterRequests(payload)
  }
  filterRequests = async payload => {
    this.setState({ loading: true })
    try {
      const res = await getAllMR(payload)
      //console.log(res.data.list)
      if (!_.isEmpty(res.data)) this.successInFetchingData(res.data)
      else this.failureInFetchingData()
    } catch (error) {
      this.failureInFetchingData()
    }
  }
  successInFetchingData = data => this.setState({ loading: false, rows: data.list, size: data.listsize }, () => this.checkClearFilterDisablity())
  failureInFetchingData = () => this.setState({ loading: false, rows: [], size: 0 }, () => this.checkClearFilterDisablity())
  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ page: 0, pageIndex: 1 }, () => this.constructRequestPayload())
  //
  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.constructRequestPayload())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.constructRequestPayload())
  //
  actionOnDetails = async (obj, action) => {
    if (action === 'EDIT') this.setState({ editObj: obj, isEditRequestFormOpen: true })
    if (action === 'VIEW') this.setState({ viewObj: obj, isViewRequestFormOpen: true })
    if (action === 'ADD') this.createWorkOrderForRequest()
    if (action === 'RESOLVE') this.setState({ isResolveIssueFormOpen: true, resolveObj: this.state.anchorData })
    this.setState({ anchorEl: null, anchorData: {} })
  }
  //
  createWorkOrderForRequest = async () => {
    const obj = { ...this.state.anchorData }
    const req = {
      title: obj.title,
      asset_id: obj.asset_id,
      priority: obj.priority,
      wo_type: obj.mr_type === 53 ? 60 : 61,
      asset: obj.asset,
    }
    this.setState({ isCreateWOFormOpen: true, workOrderObj: obj })
  }
  //
  createWorkOrderForRequestFromEdit = obj => {
    this.setState({ isCreateWOFormOpen: true, workOrderObj: obj })
  }
  //
  handleClickListItem = (event, data) => {
    this.setState({ anchorEl: event.currentTarget, anchorData: data })
  }
  //
  render() {
    const { classes } = this.props
    return (
      <div style={{ height: '93vh', padding: '20px', background: '#fff' }}>
        <div className='bg-white' style={{ height: '100%', borderRadius: '4px', padding: '16px' }}>
          <div className='d-flex flex-row justify-content-between align-items-center mb-2' style={{ width: '100%' }}>
            <Button startIcon={<AddIcon />} onClick={() => this.setState({ isAddRequestFormOpen: true })} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
              New Request
            </Button>
            {this.SearchControl()}
          </div>
          <div className='d-flex flex-row justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
            {this.StatusFilter()}
            <Button startIcon={<RotateLeftSharpIcon />} onClick={this.clearFilters} disabled={this.state.clearFilterButton} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
              Reset Filters
            </Button>
          </div>
          <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '650px', height: '650px' }}>
            <Table size='small' stickyHeader={true}>
              {this.HearderControl({ classes })}
              {this.state.loading ? (
                <TableLoader cols={8} />
              ) : _.isEmpty(this.state.rows) ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan='8' className={' Pendingtbl-no-datafound'}>
                      No data found
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {this.state.rows.map((tableRow, key) => {
                    return (
                      <TableRow key={key}>
                        <TableCell className={classes.tableCell} style={{ width: '25%' }}>
                          {tableRow.title}
                        </TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.mr_type_name}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.requested_by_name}</TableCell>
                        <TableCell className={classes.tableCell} style={{ width: '13%' }}>
                          {this.getStatus(tableRow.status)}
                        </TableCell>
                        <TableCell className={classes.tableCell}>{this.getWorkOrderStatus(tableRow.work_order_status, tableRow.work_order_number)}</TableCell>
                        <TableCell className={classes.tableCell}>{tableRow.time_elapsed}</TableCell>
                        <TableCell className={classes.tableCell}>{this.getPriority(tableRow.priority)}</TableCell>
                        <TableCell className={classes.tableCell}>
                          {tableRow.status === 48 && (
                            <span>
                              <IconButton onClick={e => this.handleClickListItem(e, tableRow)} size='small'>
                                <MoreVertIcon fontSize='small' />
                              </IconButton>
                              <Menu classes={{ paper: classes.menu }} anchorEl={this.state.anchorEl} keepMounted open={Boolean(this.state.anchorEl)} onClose={() => this.setState({ anchorEl: null })}>
                                <MenuItem className={classes.tableCell} onClick={() => this.actionOnDetails(tableRow, 'RESOLVE')}>
                                  Resolve This Issue
                                </MenuItem>
                                <MenuItem className={classes.tableCell} onClick={() => this.actionOnDetails(tableRow, 'ADD')}>
                                  Create Work Order
                                </MenuItem>
                              </Menu>
                            </span>
                          )}
                          {tableRow.status !== 50 && (
                            <Tooltip title='Edit' placement='top'>
                              <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'EDIT')}>
                                <EditOutlinedIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='View' placement='top'>
                            <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'VIEW')}>
                              <VisibilityOutlinedIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          {/*<Tooltip title='Mark PM as completed' placement='top'>
                            <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'COMPLETE')}>
                              <CheckCircleOutlineOutlinedIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete PM' placement='top'>
                            <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'DELETE')}>
                              <CancelOutlinedIcon style={{ color: '#ff0000' }} fontSize='small' />
                            </IconButton>
                          </Tooltip> */}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              )}
            </Table>
          </div>
          {!_.isEmpty(this.state.rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
        </div>
        <AddRequest open={this.state.isAddRequestFormOpen} onClose={() => this.setState({ isAddRequestFormOpen: false })} afterSubmit={() => this.constructRequestPayload()} />
        {this.state.isViewRequestFormOpen && <ViewRequest viewObj={this.state.viewObj} open={this.state.isViewRequestFormOpen} onClose={() => this.setState({ isViewRequestFormOpen: false })} />}
        {this.state.isEditRequestFormOpen && <EditRequest createWO={this.createWorkOrderForRequestFromEdit} editObj={this.state.editObj} open={this.state.isEditRequestFormOpen} afterSubmit={() => this.constructRequestPayload()} onClose={() => this.setState({ isEditRequestFormOpen: false })} />}
        {this.state.isResolveIssueFormOpen && <ResolveIssue resolveObj={this.state.resolveObj} open={this.state.isResolveIssueFormOpen} afterSubmit={() => this.constructRequestPayload()} onClose={() => this.setState({ isResolveIssueFormOpen: false })} />}
        {this.state.isCreateWOFormOpen && <CreateWorkorder woObj={this.state.workOrderObj} fromMR open={this.state.isCreateWOFormOpen} onClose={() => this.setState({ isCreateWOFormOpen: false })} afterSubmit={() => this.constructRequestPayload()} />}
      </div>
    )
  }
}

export default withStyles(styles)(MaintainanceRequests)
