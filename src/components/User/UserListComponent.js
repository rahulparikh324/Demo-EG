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
import Fab from '@material-ui/core/Fab'
import Typography from '@material-ui/core/Typography'
import AddOutlined from '@material-ui/icons/AddOutlined'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { connect } from 'react-redux'
import $ from 'jquery'
import _ from 'lodash'
import userListAction from '../../Actions/User/userListAction'
import enums from '../../Constants/enums'
import URL from '../../Constants/apiUrls'
import getUserRolesAction from '../../Actions/User/getUserRolesAction'
import getAllCompanyAction from '../../Actions/getAllCompanyAction'
import TablePagination from '@material-ui/core/TablePagination'
import updateUserStatusAction from '../../Actions/User/updateUserStatusAction'
import searchInuserListAction from '../../Actions/Search/searchInuserListAction'
import userActive from '../../Content/images/userActive.svg'
import userDective from '../../Content/images/userInActive.svg'
import ArrowDownwardOutlinedIcon from '@material-ui/icons/ArrowDownwardOutlined'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import generateBarcodeUserAction from '../../Actions/User/generateBarcodeUserAction'
import userFilterStateAction from '../../Actions/User/userFilter.action'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import { Toast } from '../../Snackbar/useToast'
import RotateLeftIcon from '@material-ui/icons/RotateLeft'
import resendTemporaryPassword from '../../Services/User/resendTemporaryPassword'
import updateUserStatus from '../../Services/User/updateUserStatusService'
import Autocomplete from '@material-ui/lab/Autocomplete'
import FilterListIcon from '@material-ui/icons/FilterList'
import getUserRole from '../../helpers/getUserRole'
import getAndFilterUsers from '../../Services/User/getAndFilterUsers'
import companyList from '../../Services/getAllCompany'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import { history } from '../../helpers/history'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import userFilterOptions from '../../Services/User/userFilterOptions.service'
import { handleNewRole } from '../../helpers/handleNewRole'
import { StatusComponent } from 'components/common/others'
import { getApplicationStorageItem } from 'helpers/getStorageItem'
import getFilterUsersOptimized from 'Services/User/getFilterUsersOptimized'

var self
let classes
const styles = theme => ({
  root: { padding: 20, flexGrow: 1, background: '#fff' },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px' },
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
  autoInput: { width: '100%' },
})

var currentpage = 0
var isDataNotFound = false

class UserList extends React.Component {
  constructor() {
    super()
    self = this
    var loginData = localStorage.getItem('loginData')
    const availableUserRoles = localStorage.getItem('UserRoles')
    this.checkUserRole = new getUserRole()
    this.getUserSitesData = new getUserSitesData()
    this.filterEnums = {
      COMPANY: 'COMPANY',
      STATUS: 'STATUS',
      SITE_NAME: 'SITE_NAME',
      ROLE: 'ROLE',
    }
    this.state = {
      loginData: JSON.parse(loginData),
      availableUserRoles: JSON.parse(availableUserRoles),
      searchString: null,
      searchStringOnEnter: false,
      pageIndex: 1,
      pageSize: 20,
      isDataNotFound: false,
      page: 0,
      rowsPerPage: 20,
      size: 0,
      userList: [],
      isDownloadBarcode: false,
      selectAll: false,
      chkbox: {},
      tostMsg: {},
      filterForColumn: false,
      allSitesForAdmin: [],
      allCompanies: [],
      selectedCompany: [],
      selectedCompanyVal: [],
      selectedSiteFilter: [],
      siteFilterName: [],
      allSites: [],
      filterForStatus: 0,
      selectedStatus: null,
      selectedRole: [],
      selectedRoleVal: [],
      allRolesForFilter: [],
      clearFilterButton: true,
      companyAndSiteFilter: {},
      allStatus: [],
      primaryFilterName: '',
      availableCompanies: [],
      isDataLoading: true,
      rolePageIndex: 1,
      companyPageIndex: 1,
      sitePageIndex: 1,
      roleListLoading: false,
      companyListLoading: false,
      siteListLoading: false,
      isDropdownOptionLoading: false,
      isFilterDropdownDataLoaded: false,
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChkboxChange = this.handleChkboxChange.bind(this)
    this.handlePrintBarcode = this.handlePrintBarcode.bind(this)
  }

  async componentDidMount() {
    this.setState({ isDataLoading: true })
    const allSites = []
    if (this.checkUserRole.isSuperAdmin()) {
      const allCompaniesList = await companyList()
      const allCompanies = allCompaniesList.data.data
      const isCompanyAndSiteFilterAvailableForAdmin = this.checkForCompanyAndSiteFilterAvailabilityForAdmin()
      // const { company_id: allCompanyID } = this.state.loginData.usersites[0]
      // if (localStorage.getItem('companyId') === allCompanyID) {
      //   allCompanies.forEach(comp => comp.sites.forEach(site => allSites.push(site)))
      // } else {
      allCompanies.forEach(comp => comp.company_id === getApplicationStorageItem('companyId') && comp.sites.forEach(site => allSites.push(site)))
      //}
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
    if (history.action === 'POP') {
      const { userFilters } = this.props.userFilterStateReducer
      if (!_.isEmpty(userFilters)) {
        const { selectedSiteFilter, siteFilterName, selectedCompany, selectedCompanyVal, filterForStatus, selectedStatus, selectedRole, selectedRoleVal } = userFilters
        this.setState({ selectedSiteFilter, siteFilterName, selectedCompany, selectedCompanyVal, filterForStatus, selectedStatus, selectedRole, selectedRoleVal }, () => this.filterBasedOnColumn())
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

  hanndleUpdateUserStatus = async (e, userData) => {
    //console.log('userData------', userData)
    $('#pageLoading').show()
    var requestData = {
      userid: userData.uuid,
      status: userData.status === enums.userStatus[0].id ? parseInt(enums.userStatus[1].id) : parseInt(enums.userStatus[0].id),
    }
    try {
      const res = await updateUserStatus(requestData)
      if (res.data.success > 0) {
        Toast.success('User status updated !')
        this.filterBasedOnColumn()
      } else Toast.error(res.data.message)
      $('#pageLoading').hide()
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
      $('#pageLoading').hide()
    }
  }

  // download user barcode code start
  handleDownloadBarcode = () => {
    this.setState({ isDownloadBarcode: !this.state.isDownloadBarcode })
  }
  handleSelectAllChkboxChange = userList => {
    if (!this.state.selectAll) {
      var allChkBox = {}
      userList.map((value, key) => {
        if (this.isBarcodeAvailable(value.userroles)) {
          allChkBox[value.uuid] = 'true'
        }
      })

      this.setState({ selectAll: 'true' })
    } else {
      var allChkBox = {}
      userList.map((value, key) => {
        allChkBox[value.uuid] = false
      })

      this.setState({ selectAll: false })
    }

    this.setState({ chkbox: allChkBox })
  }
  handleChkboxChange = (e, userList) => {
    var chkBoxObj = this.state.chkbox
    if (e.target.checked) {
      chkBoxObj[e.target.id] = 'true'
    } else {
      chkBoxObj[e.target.id] = false
    }
    this.setState({ chkbox: chkBoxObj })

    var chkBoxArr = _.toArray(chkBoxObj)

    var selectUserCnt = _.filter(chkBoxArr, function (value) {
      if (value == 'true') return value
    }).length

    if (selectUserCnt == userList.length) {
      this.setState({ selectAll: 'true' })
    } else {
      this.setState({ selectAll: false })
    }
  }
  handlePrintBarcode = () => {
    this.setState({ tostMsg: {} })
    setTimeout(() => {
      var selecteUserList = []
      _.map(this.state.chkbox, function (value, key) {
        if (value == 'true') {
          selecteUserList.push(key)
        }
      })
      if (selecteUserList.length == 0) {
        var tostMsg = this.state.tostMsg
        tostMsg.msg = enums.resMessages.selectUser
        tostMsg.type = enums.toastMsgType[1].id
        this.setState({ tostMsg: tostMsg })
        // alert.errorMessage(enums.resMessages.selectUser);
      } else {
        $('#pageLoading').show()
        var requestData = {
          userid: selecteUserList,
        }
        //console.log('request data----------------------')
        //console.log(requestData)
        this.props.generateBarcodeUserAction(requestData)
      }
    }, 100)
  }
  // download user barcode code end
  // handle column filters
  makeUniqueArray = val => [...new Set(val.map(s => JSON.stringify(s)))].map(k => JSON.parse(k))
  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ searchString: $('#userSearchInput').val().trim(), searchStringOnEnter: true, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.filterBasedOnColumn())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.filterBasedOnColumn())
  clearSearch = e => this.setState({ searchString: '', page: 0, pageIndex: 1, searchStringOnEnter: false }, () => this.filterBasedOnColumn())
  handleRoleFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.ROLE), selectedRole: val ? val.map(m => m.role_id) : [], selectedRoleVal: val }, () => this.filterBasedOnColumn())
  handleSiteFilterChange = (e, val) => this.setState({ page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE_NAME), siteFilterName: this.makeUniqueArray(val), selectedSiteFilter: val.length !== 0 ? val.map(m => m.site_id) : [] }, () => this.filterBasedOnColumn())
  handleStatusFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.STATUS), page: 0, pageIndex: 1, filterForStatus: val ? val.id : 0, selectedStatus: val }, () => this.filterBasedOnColumn())
  handleCompanyFilterChange = (e, val) =>
    this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.COMPANY), page: 0, pageIndex: 1, selectedCompany: val.length !== 0 ? val.map(m => m.company_id) : [], selectedCompanyVal: this.makeUniqueArray(val), siteFilterName: [], selectedSiteFilter: [] }, () => this.filterBasedOnColumn())

  checkForCompanyAndSiteFilterAvailabilityForAdmin = () => {
    const { company_id: allCompanyID, site_id: allSiteID } = this.state.loginData.usersites.filter(site => site.status === 20)[0] || {}
    const companyFilter = localStorage.getItem('companyId') === allCompanyID && localStorage.getItem('siteId') === allSiteID
    const siteFilter = localStorage.getItem('siteId') === allSiteID
    return { companyFilter, siteFilter }
  }

  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  // filter user function ---------------------------
  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })
    const { pageSize, pageIndex, selectedCompany, filterForStatus, selectedSiteFilter, selectedRole, searchString, siteFilterName, selectedCompanyVal, selectedStatus, selectedRoleVal } = this.state
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      site_id: selectedSiteFilter,
      company_id: selectedCompany,
      status: filterForStatus,
      role_id: selectedRole,
      search_string: searchString,
    }
    this.props.userFilterStateAction({ selectedSiteFilter, siteFilterName, selectedCompany, selectedCompanyVal, filterForStatus, selectedStatus, selectedRole, selectedRoleVal })
    const data = await getFilterUsersOptimized(payload)

    if (selectedSiteFilter.length !== 0) {
      this.state.primaryFilterName === this.filterEnums.COMPANY ? this.setState({ companyAndSiteFilter: { companyFilter: true, siteFilter: true } }) : this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: true } })
    } else {
      if (this.checkUserRole.isSuperAdmin() || this.checkUserRole.isCompanyAdmin()) {
        this.setState({ companyAndSiteFilter: this.checkForCompanyAndSiteFilterAvailabilityForAdmin() })
      }
    }

    //console.log(data)
    if (data.success === false) {
      this.setState({ userList: data.list, size: data.listsize, isDataLoading: false }, () => this.checkClearFilterDisablity())
      if (this.state.isFilterDropdownDataLoaded === false) {
        this.fetchInitialOptions()
      }
    } else {
      this.setState({ userList: [], isDataLoading: false })
      if (this.state.isFilterDropdownDataLoaded === false) {
        this.fetchInitialOptions()
      }
    }
  }

  checkClearFilterDisablity = () => {
    if (this.state.selectedCompanyVal.length !== 0 || this.state.selectedRoleVal.length !== 0 || this.state.selectedStatus !== null || this.state.siteFilterName.length !== 0) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', rolePageIndex: 1, companyPageIndex: 1, sitePageIndex: 1 })
    }
  }

  clearFilters = () => {
    this.setState(
      {
        pagesize: 20,
        pageIndex: 1,
        page: 0,
        selectedSiteFilter: [],
        siteFilterName: [],
        filterForStatus: 0,
        selectedStatus: null,
        selectedCompany: [],
        selectedCompanyVal: [],
        selectedRole: [],
        selectedRoleVal: [],
        primaryFilterName: '',
      },
      () => this.filterBasedOnColumn()
    )
  }

  //*----- Fetch initial Options
  fetchInitialOptions = async () => {
    this.setState({ isDropdownOptionLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const roleOpts = await userFilterOptions(URL.filterUsersRoleOptions, payload)
    // const companyNameOpts = await userFilterOptions(URL.filterUsersCompanyOptions, payload)
    // const siteNameOpts = await userFilterOptions(URL.filterUsersSitesOptions, payload)
    this.setState({
      //allCompanies: this.state.primaryFilterName === this.filterEnums.COMPANY ? this.state.allCompanies : companyNameOpts.list,
      allRolesForFilter: this.state.primaryFilterName === this.filterEnums.ROLE ? this.state.allRolesForFilter : roleOpts.list.map(r => ({ ...r, name: handleNewRole(r.name) })),
      //allSites: this.state.primaryFilterName === this.filterEnums.SITE_NAME ? this.state.allSites : siteNameOpts.list,
      allStatus: enums.userStatus,
      isDropdownOptionLoading: false,
    })
  }

  getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: this.state.selectedSiteFilter,
    company_id: this.state.selectedCompany,
    status: this.state.filterForStatus,
    role_id: [],
    search_string: this.state.searchString,
    option_search_string: val,
  })

  handleResendTemporaryPassword = async id => {
    const load = document.querySelector('#pageLoading')
    load.style.display = 'block'
    try {
      const res = await resendTemporaryPassword(id)
      if (res.type === 1) Toast.success('Temporary password sent !')
      else Toast.error(res.msg)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    load.style.display = 'none'
  }

  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }

  fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = this.getFilterOptionsPayload(val)
    switch (id) {
      case 'roleIdFilter':
        this.setState({ rolePageIndex: this.state.rolePageIndex + 1 }, async () => {
          const data = await userFilterOptions(URL.filterUsersRoleOptions, { ...payload, role_id: [], pageindex: this.state.rolePageIndex })
          this.setState({ allRolesForFilter: [...this.state.allRolesForFilter, ...data.list.map(r => ({ ...r, name: handleNewRole(r.name) }))] })
        })
        break
      case 'company':
        this.setState({ companyPageIndex: this.state.companyPageIndex + 1 }, async () => {
          const data = await userFilterOptions(URL.filterUsersCompanyOptions, { ...payload, company_id: [], pageindex: this.state.companyPageIndex })
          this.setState({ allCompanies: [...this.state.allCompanies, ...data.list] })
        })
        break
      case 'siteIdFilter':
        this.setState({ sitePageIndex: this.state.sitePageIndex + 1 }, async () => {
          const data = await userFilterOptions(URL.filterUsersSitesOptions, { ...payload, site_id: [], pageindex: this.state.sitePageIndex })
          this.setState({ allSites: [...this.state.allSites, ...data.list] })
        })
        break
      default:
        break
    }
  }

  handleRoleFilterInputChange = async (e, val) => {
    this.setState({ roleListLoading: true, rolePageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await userFilterOptions(URL.filterUsersRoleOptions, { ...payload, role_id: [] })
        this.setState({ allRolesForFilter: data.list.map(r => ({ ...r, name: handleNewRole(r.name) })), roleListLoading: false })
      }
    }, 700)
  }
  handleSiteFilterInputChange = async (e, val) => {
    this.setState({ siteListLoading: true, sitePageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await userFilterOptions(URL.filterUsersSitesOptions, { ...payload, site_id: [] })
        this.setState({ allSites: data.list, siteListLoading: false })
      }
    }, 700)
  }
  handleCompanyFilterInputChange = async (e, val) => {
    this.setState({ companyListLoading: true, companyPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await userFilterOptions(URL.filterUsersCompanyOptions, { ...payload, company_id: [] })
        this.setState({ allCompanies: data.list, companyListLoading: false })
      }
    }, 700)
  }

  displayEmail = user =>
    user.default_rolename_app_name === 'Operator' ? (
      '-'
    ) : (
      <Tooltip title={user?.email} placement='top'>
        <div style={{ padding: '4px 0' }}>
          {user?.email?.slice(0, 50)}
          {user?.email?.length > 50 && <span>...</span>}
        </div>
      </Tooltip>
    )
  displayUserSites = status => (status ? <StatusComponent color={'#009AFF'} label={'Verified'} size='small' /> : '')
  renderChip = value => {
    if (!value) return
    const { color, label } = enums.USER_STATUS_CHIPS.find(d => d.value === value)
    if (!color) return label
    return <StatusComponent color={color} label={label} size='small' />
  }

  displayUserRoles = roles => {
    const rolePriorities = {
      'Company Admin': 1,
      Manager: 2,
      Technician: 3,
      Executive: 4,
    }

    const list = _.orderBy(roles, [role => rolePriorities[role.role_name] || 999], ['asc'])
    return (
      <div className='d-flex'>
        {list.map(role => (
          <div className={`role-chip role-${role.role_name}`} key={role.role_id}>
            {role.role_name
              ? handleNewRole(role.role_name)
                  .split(' ')
                  .map(n => n[0])
                  .join('')
              : '-'}
          </div>
        ))}
      </div>
    )
  }

  checkIsUserManager = roles => {
    if (this.checkUserRole.isCompanyAdmin() || this.checkUserRole.isSuperAdmin()) return
    const roleNames = roles.map(r => r.role_name)
    return roleNames.includes('Manager') || roleNames.includes('Executive') || roleNames.includes('Company Admin') || roleNames.includes('Maintenance staff')
  }
  isBarcodeAvailable = roles => {
    const roleNames = roles.map(r => r.role_name)
    return roleNames.includes('Operator') || roleNames.includes('Maintenance staff')
  }

  handleOnClick = tableRow => {
    if (!this.isDisabled(tableRow)) {
      history.push('users/details/' + tableRow.uuid)
    }
  }

  isDisabled = tableRow => {
    return this.checkUserRole.isExecutive() || tableRow.uuid === this.state.loginData.uuid || this.checkIsUserManager(tableRow.userroles)
  }

  render() {
    const { classes } = this.props
    let searchString = this.state.searchString !== null ? this.state.searchString : decodeURI(_.get(this, ['props', 'userReducer', 'searchString'], ''))
    var rows = []

    return (
      <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '20px' }}>
        <div className='d-flex justify-content-between align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
          <div className='d-flex align-items-center'>
            {!this.checkUserRole.isExecutive() && (
              <Button size='small' onClick={() => history.push('../../users/createnew/')} startIcon={<AddOutlined />} variant='contained' color='primary' className='nf-buttons mr-2' disableElevation>
                Create User
              </Button>
            )}
          </div>
          <div className='d-flex align-items-center'>
            <TextField
              className={classes.searchInput}
              id='userSearchInput'
              placeholder='Search Users '
              fullWidth={true}
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
            <Button style={{ width: '200px' }} size='small' onClick={() => this.clearFilters()} startIcon={<RotateLeftSharpIcon />} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation disabled={this.state.clearFilterButton}>
              Reset Filters
            </Button>
          </div>
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 200px)' }}>
          <Table size='small' stickyHeader={true}>
            <TableHead>
              <TableRow>
                {this.state.isDownloadBarcode && (
                  <TableCell id='selectAllChkbox' align='left' padding='normal'>
                    <Checkbox color='primary' id='selectAll' name='selectAll' checked={this.state.selectAll == 'true' ? true : false} onChange={e => this.handleSelectAllChkboxChange(this.state.userList)} />
                  </TableCell>
                )}
                <TableCell id='th-username' align='left' padding='normal'>
                  Email
                </TableCell>
                <TableCell id='th-name' align='left' padding='normal'>
                  Name
                </TableCell>
                {this.checkUserRole.isSuperAdmin() &&
                  (this.state.companyAndSiteFilter.companyFilter ? (
                    <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.selectedCompanyVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='name' align='left' padding='normal'>
                      {'Company'}
                      <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                    </TableCell>
                  ) : (
                    <TableCell>Company</TableCell>
                  ))}
                <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.selectedStatus !== null ? { background: '#eeeeee' } : { background: '#fafafa' }} id='th-status' align='left' padding='normal'>
                  Status
                  <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                </TableCell>
                <TableCell>Email Verified</TableCell>
                <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.selectedRoleVal.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} id='th-role' align='left' padding='normal'>
                  Role
                  <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
                </TableCell>
                {!this.checkUserRole.isExecutive() && (
                  <TableCell id='th-action' align='left' padding='normal'>
                    Actions
                  </TableCell>
                )}
              </TableRow>
              {this.state.filterForColumn && (
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  {this.checkUserRole.isSuperAdmin() &&
                    (this.state.companyAndSiteFilter.companyFilter ? (
                      <TableCell>
                        <Autocomplete
                          ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                          multiple
                          size='small'
                          loading={this.state.companyListLoading}
                          onClose={() => this.setState({ companyListLoading: false })}
                          onInputChange={(e, val) => this.handleCompanyFilterInputChange(e, val)}
                          classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                          id='company'
                          value={this.state.selectedCompanyVal}
                          options={this.state.allCompanies}
                          getOptionLabel={option => option.company_name}
                          name='companyId'
                          onChange={(e, val) => this.handleCompanyFilterChange(e, val)}
                          noOptionsText='No company found'
                          renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select company' name='companyId' />}
                        />
                      </TableCell>
                    ) : (
                      <TableCell></TableCell>
                    ))}
                  <TableCell>
                    <Autocomplete
                      ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                      size='small'
                      classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                      id='statusIdFilter'
                      value={this.state.selectedStatus}
                      options={this.state.allStatus}
                      getOptionLabel={option => option.status}
                      name='modelId'
                      onChange={(e, val) => this.handleStatusFilterChange(e, val)}
                      noOptionsText='No status found'
                      renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Status' name='statusId' />}
                      loading={this.state.isDropdownOptionLoading}
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
                        loading={this.state.siteListLoading}
                        onClose={() => this.setState({ siteListLoading: false })}
                        onInputChange={(e, val) => this.handleSiteFilterInputChange(e, val)}
                        classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                        id='siteIdFilter'
                        value={this.state.siteFilterName}
                        options={this.state.allSites}
                        getOptionLabel={option => option.site_name}
                        name='modelId'
                        onChange={(e, val) => this.handleSiteFilterChange(e, val)}
                        noOptionsText='No site found'
                        renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select site' name='siteId' />}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <Autocomplete
                      ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                      multiple
                      size='small'
                      loading={this.state.roleListLoading}
                      onClose={() => this.setState({ roleListLoading: false })}
                      onInputChange={(e, val) => this.handleRoleFilterInputChange(e, val)}
                      classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                      id='roleIdFilter'
                      value={this.state.selectedRoleVal}
                      options={this.state.allRolesForFilter}
                      getOptionLabel={option => option.name}
                      name='modelId'
                      onChange={(e, val) => this.handleRoleFilterChange(e, val)}
                      noOptionsText='No role found'
                      renderInput={params => <TextField {...params} variant='outlined' margin='normal' fullWidth placeholder='Select Role' name='roleId' />}
                    />
                  </TableCell>
                  {!this.checkUserRole.isExecutive() && <TableCell></TableCell>}
                </TableRow>
              )}
            </TableHead>
            {this.state.isDataLoading ? (
              <TableLoader cols={this.checkUserRole.isSuperAdmin() ? 7 : this.checkUserRole.isExecutive() ? 5 : 6} />
            ) : _.isEmpty(this.state.userList) ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan='5' className={classes.tableCell + ' Pendingtbl-no-datafound'}>
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {this.state.userList.map((tableRow, key) => {
                  return (
                    <TableRow key={key} onClick={() => this.handleOnClick(tableRow)} className='table-with-row-click-not-important' style={{ cursor: this.isDisabled(tableRow) ? 'inherit' : 'pointer' }}>
                      {this.state.isDownloadBarcode && (
                        <TableCell className={classes.tableCell}>
                          {this.isBarcodeAvailable(tableRow.userroles) ? (
                            <Checkbox id={tableRow.uuid} name={tableRow.uuid} color='primary' value='chkBox' checked={this.state.chkbox[tableRow.uuid] === 'true' ? true : false} onChange={e => this.handleChkboxChange(e, rows.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage))} />
                          ) : (
                            ''
                          )}
                        </TableCell>
                      )}
                      <TableCell style={{ height: 32 }} className={classes.tableCell}>
                        {this.displayEmail(tableRow)}
                      </TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.firstname ? `${tableRow.firstname} ${tableRow.lastname}` : '-'}</TableCell>
                      {this.checkUserRole.isSuperAdmin() && <TableCell className={classes.tableCell}>{!_.isEmpty(tableRow.usersites) ? tableRow.usersites[0].comapny_name : '-'}</TableCell>}
                      <TableCell className={classes.tableCell}>{this.renderChip(tableRow.status)}</TableCell>
                      <TableCell className={classes.tableCell}>{this.displayUserSites(tableRow.is_registration_succeed)}</TableCell>
                      <TableCell className={classes.tableCell}>{this.displayUserRoles(tableRow.userroles)}</TableCell>
                      {!this.checkUserRole.isExecutive() && (
                        <TableCell>
                          <Grid container alignItems='center'>
                            <Tooltip title={tableRow.uuid === this.state.loginData.uuid ? '' : tableRow.status === enums.userStatus[0].id ? 'Make Inactive' : 'Make Active'} placement='top'>
                              <span>
                                <IconButton
                                  size='small'
                                  onClick={e => {
                                    e.stopPropagation()
                                    this.hanndleUpdateUserStatus(e, tableRow)
                                  }}
                                  disabled={tableRow.uuid === this.state.loginData.uuid || this.checkIsUserManager(tableRow.userroles)}
                                >
                                  <div style={{ width: '13px', height: '13px', background: tableRow.status === enums.userStatus[0].id ? enums.USER_STATUS_CHIPS[0].color : enums.USER_STATUS_CHIPS[1].color, borderRadius: '50%' }}></div>
                                </IconButton>
                              </span>
                            </Tooltip>
                            {!tableRow.is_registration_succeed && (
                              <Tooltip title='Resend Temporary Password' placement='top'>
                                <IconButton
                                  size='small'
                                  onClick={e => {
                                    e.stopPropagation()
                                    this.handleResendTemporaryPassword(tableRow.uuid)
                                  }}
                                >
                                  <RotateLeftIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Grid>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </div>
        {_.isEmpty(this.state.userList) ? '' : <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
      </div>
    )
  }
}
function mapState(state) {
  if (state.userReducer) {
    isDataNotFound = state.userReducer.isDataNoFound

    if (self) {
      if (!_.isEmpty(state.userReducer.tostMsg)) {
        //self.setState({ tostMsg: state.userReducer.tostMsg })
      }
      if (!_.isEmpty(state.generateBarcodeUserReducer.tostMsg)) {
        self.setState({ tostMsg: state.generateBarcodeUserReducer.tostMsg })
      }
      // self.setState({ isDataNotFound: state.userReducer.isDataNoFound })
    }
  }
  if (state.generateBarcodeUserReducer) {
    if (state.generateBarcodeUserReducer.loading) {
    } else {
      if (self) {
        self.setState({ selectAll: false, chkbox: {} })

        if (!_.isEmpty(state.generateBarcodeUserReducer.tostMsg)) {
          self.setState({ tostMsg: state.generateBarcodeUserReducer.tostMsg })
        }
      }
    }
  }
  if (state.userFilterStateReducer) {
    if (self) {
      self.setState({ userFilterState: state.userFilterStateReducer.userFilters })
    }
  }
  return state
}

const actionCreators = {
  userListAction: userListAction,
  getUserRolesAction: getUserRolesAction,
  getAllCompany: getAllCompanyAction,
  updateUserStatusAction: updateUserStatusAction,
  searchInuserListAction: searchInuserListAction,
  generateBarcodeUserAction: generateBarcodeUserAction,
  userFilterStateAction,
}

UserList.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(mapState, actionCreators)(withStyles(styles)(UserList))
