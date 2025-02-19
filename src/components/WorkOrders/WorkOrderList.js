import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
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
import _, { isEmpty } from 'lodash'
import TableLoader from '../TableLoader'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import TablePagination from '@material-ui/core/TablePagination'
import getAllWOs from 'Services/WorkOrder/getAllWOs'
import deleteWO from 'Services/WorkOrder/deleteWO'
import enums from 'Constants/enums'
import { history } from 'helpers/history'
import CreateAccWO from './CreateAccWO'
import { MinimalFilterSelector } from '../Assets/components'
import DialogPrompt from 'components/DialogPrompt'
import { StatusComponent, DropDownMenu, StatusSelectPopup } from 'components/common/others'
import { Toast } from 'Snackbar/useToast'
import { getFormatedDate } from 'helpers/getDateTime'
import { workOrderTypesPath } from './utils'
import { ActionButton, MinimalButton } from 'components/common/buttons'
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined'
import { getDueInColor } from 'components/preventative-maintenance/common/utils'
import { get } from 'lodash'
import { exportSpreadSheet } from 'helpers/export-spread-sheet'
import AccessTimeOutlinedIcon from '@material-ui/icons/AccessTimeOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined'
import FindInPageOutlinedIcon from '@material-ui/icons/FindInPageOutlined'
import BeenhereOutlinedIcon from '@material-ui/icons/BeenhereOutlined'
import watchWO from 'Services/WorkOrder/watchWO'
import CircularProgress from '@material-ui/core/CircularProgress'
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined'
import getAllWOsOptimized from 'Services/WorkOrder/getAllWOsOptimized'
import { MainContext } from 'components/Main/provider'
import { changeActiveSite } from 'components/common/change-active-site'

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
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white' },
})

export class WorkOrderList extends Component {
  static contextType = MainContext

  constructor(props) {
    super(props)
    this.STATUS_ENUMS = [
      { value: [], label: 'All' },
      { value: [72], label: 'Planned' },
      { value: [73, 13, 69], label: 'Active' },
      { value: [15], label: 'Completed' },
    ]
    this.PRIORITY_ENUMS = [
      { id: 45, value: 'Low' },
      { id: 46, value: 'Medium' },
      { id: 47, value: 'High' },
    ]
    this.state = {
      loading: true,
      rows: [],
      pageSize: 20,
      pageIndex: 1,
      rowsPerPage: 20,
      page: 0,
      searchString: '',
      size: 0,
      filterForColumn: false,
      clearFilterButton: true,
      statusFilter: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
      typeFilter: null,
      accWOOpen: false,
      type: 66,
      workorderToDelete: {},
      isDeleteWorkorderOpen: false,
      deleteLoading: false,
      resetBtnClicked: false,
      isExportLoading: false,
      userId: '',
      isWatchingLoading: false,
      loginSiteData: null,
    }
    this.dropDownMenuOptions = [
      {
        id: 1,
        type: 'button',
        text: 'Acceptance Test',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.Acceptance }),
        show: true,
      },
      {
        id: 2,
        type: 'button',
        text: 'Maintenance',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.Maintainance }),
        show: true,
      },
      {
        id: 3,
        type: 'button',
        text: 'Onboarding',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.OnBoarding }),
        show: true,
      },
      {
        id: 4,
        type: 'button',
        text: 'Infrared Scan',
        onClick: () => this.setState({ accWOOpen: true, type: enums.woType.InfraredScan }),
        show: true,
      },
    ]
  }
  //
  async componentDidMount() {
    const { loginSiteData } = this.context

    if (history.action === 'PUSH') {
      this.setState({
        statusFilter: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
        rowsPerPage: _.get(history, 'location.state.pageRows', 20),
        searchString: _.get(history, 'location.state.search', ''),
        pageIndex: _.get(history, 'location.state.pageIndex', 1),
        page: _.get(history, 'location.state.pageIndex', 1) - 1,
      })
    }
    const payload = {
      pageindex: history.action === 'PUSH' ? _.get(history, 'location.state.pageIndex', 1) : 1,
      pagesize: history.action === 'PUSH' ? _.get(history, 'location.state.pageRows', 20) : 20,
      search_string: history.action === 'PUSH' ? _.get(history, 'location.state.search', '') : ' ',
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: _.get(history, 'location.state.filter', this.STATUS_ENUMS[2].value),
      wo_type: [],
      site_id: JSON.parse(localStorage.getItem('siteListForWO')),
    }
    this.filterRequests(payload)
    const userInfo = JSON.parse(localStorage.getItem('loginData'))

    this.setState({
      userId: get(userInfo, 'uuid', ''),
      loginSiteData: loginSiteData,
    })
  }
  //
  SearchControl = () => (
    <div>
      <TextField
        placeholder='Search Work Orders'
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
    <TableCell align='left' padding='normal' style={{ background: '#fafafa' }}>
      {text}
      {filter && <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />}
    </TableCell>
  )
  HearderControl = ({ classes, filterOptions }) => (
    <TableHead>
      <TableRow>
        {this.HeaderTab({ classes, text: 'WO Number' })}
        {this.HeaderTab({ classes, text: 'Work Type' })}
        {this.HeaderTab({ classes, text: 'Facility' })}
        {this.HeaderTab({ classes, text: 'Start Date' })}
        {this.HeaderTab({ classes, text: 'Status Count' })}
        {this.HeaderTab({ classes, text: 'Due In' })}
        {this.HeaderTab({ classes, text: 'Status' })}
        {this.HeaderTab({ classes, text: 'Actions' })}
      </TableRow>
    </TableHead>
  )
  getWorkOrderStatus = status => {
    const { color, label } = enums.WO_STATUS.find(d => d.value === status)
    return <StatusComponent label={label} color={color} size='small' />
  }
  getWorkOrderDueIn = d => {
    if (_.isEmpty(d.due_in) || _.isNull(d.wo_due_overdue_flag)) return
    if (!d.due_date && enums.PM.STATUS.COMPLETED !== d.wo_status_id) return 'NA'
    const d1 = new Date()
    const d2 = new Date(d.due_date)
    const isOverdue = d.wo_due_overdue_flag === enums.WO_DUE_FLAG.OVERDUE ? true : false
    const isDue = d.wo_due_overdue_flag === enums.WO_DUE_FLAG.DUE ? true : false //if only due then show orange
    const diffInDays = isOverdue ? -1 : isDue ? 35 : Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24))
    const label = enums.PM.STATUS.COMPLETED !== d.wo_status_id ? d.due_in : 'Completed'
    if (enums.PM.STATUS.COMPLETED === d.wo_status_id) return ''
    return <StatusComponent color={getDueInColor(diffInDays)} label={label} size='small' filled />
  }
  //
  // checkClearFilterDisablity = () => (this.state.statusFilter !== null || this.state.typeFilter !== null ? this.setState({ clearFilterButton: false, filterForColumn: true }) : this.setState({ clearFilterButton: true, filterForColumn: false }))
  checkClearFilterDisablity = () => (this.state.statusFilter.length === 0 ? this.setState({ clearFilterButton: true }) : this.setState({ clearFilterButton: false }))
  clearFilters = () => this.setState({ typeFilter: null, resetBtnClicked: true, statusFilter: [], page: 0, pageIndex: 1, rowsPerPage: 20 }, () => this.constructRequestPayload())

  constructRequestPayload = () => {
    const payload = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      search_string: this.state.searchString,
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: this.state.statusFilter,
      wo_type: this.state.typeFilter ? [this.state.typeFilter.value] : [],
      site_id: JSON.parse(localStorage.getItem('siteListForWO')),
      is_requested_from_workorders_tab: true,
    }
    this.filterRequests(payload)
    this.setState({ resetBtnClicked: false })
  }

  filterRequests = async payload => {
    this.setState({ loading: true })
    try {
      const res = await getAllWOsOptimized(payload)
      // console.log(res.data.list)
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

  deleteWorkOrder = async () => {
    this.setState({ deleteLoading: true })
    try {
      const res = await deleteWO({ wo_id: [this.state.workorderToDelete.wo_id] })
      if (res.success > 0) Toast.success(`Work Order deleted successfully !`)
      else Toast.error(res.message)
      this.setState({ deleteLoading: false, isDeleteWorkorderOpen: false }, () => this.constructRequestPayload())
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong')
      this.setState({ deleteLoading: false, isDeleteWorkorderOpen: false })
    }
  }

  handleStatusFilterChange = v => this.setState({ statusFilter: v, page: 0, pageIndex: 1 }, () => this.constructRequestPayload())

  getWorkOrderDueInExel = d => {
    if (!d.due_date && enums.PM.STATUS.COMPLETED !== d.wo_status_id) return 'NA'
    const label = enums.PM.STATUS.COMPLETED !== d.wo_status_id ? d.due_in : 'Completed'
    if (enums.PM.STATUS.COMPLETED === d.wo_status_id) return ''
    return label
  }

  handleExportList = async () => {
    const payload = {
      pageIndex: 0,
      pageSize: 0,
      search_string: '',
      technician_user_id: null,
      from_date: null,
      to_date: null,
      wo_status: [],
      wo_type: [],
      site_id: JSON.parse(localStorage.getItem('siteListForWO')),
    }
    try {
      this.setState({ isExportLoading: true })
      const res = await getAllWOs(payload)
      if (res.success > 0) {
        const excelData = []
        const list = get(res, 'data.list', [])
        list.forEach(d => excelData.push({ 'WO Number': d.manual_wo_number, 'Work Type': d.wo_type_name, Facility: d.site_name, 'Start Date': getFormatedDate(d.start_date?.split('T')[0]), 'Due Date': getFormatedDate(d.due_date?.split('T')[0]), 'Due In': this.getWorkOrderDueInExel(d), Status: d.wo_status }))
        exportSpreadSheet({ data: excelData, fileName: 'work-order-list' })
      } else Toast.error(res.message || 'Error exporting data. Please try again !')
      this.setState({ isExportLoading: false })
    } catch (error) {
      Toast.error('Error Exporting data. PLease try again !')
      this.setState({ isExportLoading: true })
    }
  }
  StatusMetric = ({ count = 0, toolTip, icon: Icon, color }) => (
    <Tooltip title={toolTip} placement='top'>
      <div className='d-flex justify-content-start align-items-center mr-1' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', minWidth: '42px', padding: '2px' }}>
        <div className='mr-1 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${count === 0 ? '#00000020' : `${color}35`}`, width: 20, height: 20 }}>
          <Icon fontSize='small' style={{ color: count === 0 ? '#00000050' : color, fontSize: 12 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, opacity: count === 0 ? 0.4 : 1 }} className='text-bold'>
            {count}
          </div>
        </div>
      </div>
    </Tooltip>
  )

  handleWatching = async (e, wo_id, is_watcher) => {
    e.stopPropagation()
    this.setState({ isWatchingLoading: wo_id })
    try {
      const res = await watchWO({ ref_id: wo_id, user_id: this.state.userId, is_deleted: is_watcher ? true : false })
      if (res.success > 0) Toast.success(`WorkOrder Watching Status Change Successfully!`)
      else Toast.error(res.message)
      this.setState({ isWatchingLoading: false }, () => this.constructRequestPayload())
    } catch (error) {
      console.log(error)
      Toast.error('Something Went Wrong')
      this.setState({ isWatchingLoading: false })
    }
  }

  handleGetWatcher = list => {
    const currentUser = JSON.parse(localStorage.getItem('loginData'))
    if (list.length === 0) {
      return 'Start Watch'
    }
    if (list.length === 1 && list[0].user_id === currentUser.uuid) {
      return 'Stop Watch'
    }
    if (!_.isEmpty(list) && list.some(e => e.user_id === currentUser.uuid)) {
      list = list.map(user => (user.user_id === currentUser.uuid ? { ...user, username: 'You' } : user))
    }
    return list.map(d => <div className='d-block'>{d.username}</div>)
  }

  handleViewQuote = tableRow => {
    const siteData = changeActiveSite(tableRow.site_id)
    this.context.setLoginSiteData(prevState => ({
      ...prevState,
      siteName: siteData.site_name,
      activeSiteId: siteData.site_id,
      siteId: siteData.site_id,
      activeClientCompanyId: siteData.client_company_id,
      clientCompanyName: siteData.client_company_name,
    }))

    localStorage.setItem('selectedSiteId', tableRow.site_id)
    history.push({
      pathname: `${workOrderTypesPath[tableRow.wo_type]['path']}/${tableRow.wo_id}`,
      state: { filter: this.state.statusFilter, pageRows: this.state.rowsPerPage, search: this.state.searchString, pageIndex: this.state.pageIndex, wo_status_id: tableRow.wo_status_id, wo_type: tableRow.wo_type },
    })
  }

  render() {
    const { classes } = this.props
    return (
      <div style={{ height: 'calc(100vh - 155px)', background: '#fff', paddingTop: '20px' }}>
        <div className='d-flex flex-row justify-content-between align-items-center mb-3' style={{ width: '100%' }}>
          <div className='d-flex flex-row align-items-center' style={{ gap: '5px' }}>
            <StatusSelectPopup options={this.STATUS_ENUMS} statusFilterValues={this.state.statusFilter} onChange={this.handleStatusFilterChange} style={{ marginRight: '10px' }} />
            <DropDownMenu dropDownMenuOptions={this.dropDownMenuOptions} btnText={'Create Work Order'} />
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
              {/* <ActionButton tooltipPlacement='top' icon={<GetAppOutlinedIcon size='small' />} tooltip='Export Work Orders' action={this.handleExportList} isLoading={this.state.isExportLoading} /> */}
              <MinimalButton
                onClick={this.handleExportList}
                text='Export Work Orders'
                size='small'
                startIcon={<GetAppOutlinedIcon fontSize='small' />}
                variant='contained'
                color='primary'
                baseClassName='nf-buttons'
                style={{ marginLeft: '5px' }}
                loadingText='Exporting...'
                loading={this.state.isExportLoading}
                disabled={this.state.isExportLoading || _.isEmpty(this.state.rows)}
              />
            </div>
          </div>
          <div className='d-flex flex-row align-items-center'>
            {this.SearchControl()}
            <Button size='small' startIcon={<RotateLeftSharpIcon />} onClick={this.clearFilters} disabled={this.state.clearFilterButton} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
              Reset Filters
            </Button>
          </div>
          {/* {this.SearchControl()} */}
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100% - 100px)' }}>
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
                    <TableRow key={key} onClick={() => this.handleViewQuote(tableRow)} className='table-with-row-click'>
                      <TableCell className={classes.tableCell}>{tableRow.manual_wo_number}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.wo_type_name}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.site_name}</TableCell>
                      <TableCell className={classes.tableCell}>{getFormatedDate(tableRow.start_date.split('T')[0])}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <div className='d-flex align-items-center'>
                          {this.StatusMetric({ toolTip: 'OPEN', count: _.get(tableRow, 'status_wise_asset_count_obj.open_obwo_asset', 0), icon: AccessTimeOutlinedIcon, color: '#3941F1' })}
                          {this.StatusMetric({ toolTip: 'IN PROGRESS', count: _.get(tableRow, 'status_wise_asset_count_obj.inprogress_obwo_asset', 0), icon: UpdateOutlinedIcon, color: '#3291DD' })}
                          {this.StatusMetric({ toolTip: 'READY FOR REVIEW', count: _.get(tableRow, 'status_wise_asset_count_obj.ready_for_review_obwo_asset', 0), icon: FindInPageOutlinedIcon, color: '#FA0B0B' })}
                          {this.StatusMetric({ toolTip: 'COMPLETED', count: _.get(tableRow, 'status_wise_asset_count_obj.completed_obwo_asset', 0), icon: CheckCircleOutlineOutlinedIcon, color: '#41BE73' })}
                          {tableRow.wo_type === enums.woType.Acceptance && this.StatusMetric({ toolTip: 'SUBMITTED', count: _.get(tableRow, 'status_wise_asset_count_obj.submitted_obwo_asset', 0), icon: BeenhereOutlinedIcon, color: '#7d07ff' })}
                        </div>
                      </TableCell>
                      <TableCell className={classes.tableCell}>{this.getWorkOrderDueIn(tableRow)}</TableCell>
                      <TableCell className={classes.tableCell}>{this.getWorkOrderStatus(tableRow.wo_status_id)}</TableCell>
                      <TableCell className={classes.tableCell} style={tableRow.wo_status_id === 15 ? { pointerEvents: 'none' } : {}}>
                        <div className='d-flex align-items-center'>
                          {tableRow.wo_status_id === 15 && tableRow.watcher_users_list.length === 0 ? (
                            <IconButton size='small'>{this.state.isWatchingLoading !== tableRow.wo_id && (!tableRow.is_watcher ? <VisibilityOffOutlinedIcon fontSize='small' style={{ opacity: 1 }} /> : <VisibilityOutlinedIcon fontSize='small' style={{ opacity: 1 }} />)}</IconButton>
                          ) : (
                            <Tooltip title={this.handleGetWatcher(tableRow.watcher_users_list)} placement='top' style={tableRow.wo_status_id === 15 ? { pointerEvents: 'auto' } : {}}>
                              <IconButton size='small' onClick={e => tableRow.wo_status_id !== 15 && this.handleWatching(e, tableRow.wo_id, tableRow.is_watcher)}>
                                {this.state.isWatchingLoading !== tableRow.wo_id && (!tableRow.is_watcher ? <VisibilityOffOutlinedIcon fontSize='small' style={{ opacity: 1 }} /> : <VisibilityOutlinedIcon fontSize='small' style={{ opacity: 1 }} />)}
                                {this.state.isWatchingLoading === tableRow.wo_id ? <CircularProgress size={15} thickness={5} style={{ marginRight: '6px', marginTop: '6px' }} /> : ''}
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='Delete' placement='top'>
                            <IconButton
                              size='small'
                              onClick={e => {
                                e.stopPropagation()
                                this.setState({ workorderToDelete: tableRow, isDeleteWorkorderOpen: true })
                              }}
                            >
                              <DeleteOutlineOutlinedIcon fontSize='small' style={tableRow.wo_status_id === 15 ? { opacity: 0 } : { color: '#FF0000' }} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>
        {!_.isEmpty(this.state.rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
        <CreateAccWO open={this.state.accWOOpen} type={this.state.type} handleClose={() => this.setState({ accWOOpen: false })} />
        <DialogPrompt title='Delete Work Order' text='Are you sure you want to delete the Work Order ?' open={this.state.isDeleteWorkorderOpen} ctaText='Delete' actionLoader={this.state.deleteLoading} action={this.deleteWorkOrder} handleClose={() => this.setState({ isDeleteWorkorderOpen: false })} />
      </div>
    )
  }
}

export default withStyles(styles)(WorkOrderList)
