import React from 'react'
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
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined'
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined'
import { history } from '../../helpers/history'
import filterPMtems from '../../Services/Maintainance/filterPMItems.service'
import TablePagination from '@material-ui/core/TablePagination'
import Button from '@material-ui/core/Button'
import FilterListIcon from '@material-ui/icons/FilterList'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import filterPMAssetNameOptions from '../../Services/Maintainance/filterPMAssetNameOptions'
import filterPMTitleOptions from '../../Services/Maintainance/filterPMTitleOptions'
import filterPMPlanOptions from '../../Services/Maintainance/filterPMPlanOptions'
import filterPMSiteNameOptions from '../../Services/Maintainance/filterPMSiteNameOptions'
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import getUserSitesData from '../../helpers/getUserSitesData'
import getPlanForAsset from '../../Services/Asset/getPlanForAsset.service'
import deleteAssetPM from '../../Services/Asset/deleteAssetPM'
import getAssetPMByID from '../../Services/Asset/getAssetPMByID'
import $ from 'jquery'
import ViewPlan from '../Assets/AssetDetail/ViewPlan'
import MarkComplete from '../Assets/AssetDetail/MarkComplete'
import DialogPrompt from '../DialogPrompt'
import { Toast } from '../../Snackbar/useToast'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

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
  autoInput: { width: '100%' },
  workOrderStatus: { padding: '2px 12px', borderRadius: '4px', color: 'white', fontSize: '10px', fontWeight: 800 },
})

export class PMListTable extends React.Component {
  constructor(props) {
    super(props)
    this.filterEnums = {
      ASSET: 'ASSET',
      PLAN: 'PLAN',
      TITLE: 'TITLE',
      SITE: 'SITE',
    }
    this.getUserSitesData = new getUserSitesData()
    this.state = {
      loading: true,
      rows: [],
      pageSize: 20,
      pageIndex: 1,
      rowsPerPage: 20,
      page: 0,
      pmID: [],
      internalAssetID: [],
      pmPlanID: [],
      searchString: '',
      size: 0,
      filterForColumn: false,
      filterForAssetName: [],
      selectedAssetNameForFilter: [],
      optionsForAssetNameFilter: [],
      filterForPMTitle: [],
      selectedPMTitleForFilter: [],
      optionsForPMTitleFilter: [],
      filterForPMPlan: [],
      selectedPMPlanForFilter: [],
      optionsForPMPlanFilter: [],
      filterForSiteName: [],
      selectedSiteNameForFilter: [],
      optionsForSiteNameFilter: [],
      primaryFilterName: '',
      listLoadingForAssetFilter: false,
      pageIndexForAssetFilter: 1,
      listLoadingForTitleFilter: false,
      pageIndexForTitleFilter: 1,
      listLoadingForPlanFilter: false,
      pageIndexForPlanFilter: 1,
      listLoadingForSiteFilter: false,
      pageIndexForSiteFilter: 1,
      clearFilterButton: true,
      siteFilterEnabled: false,
      viewObj: {},
      openViewPlan: false,
      editObj: {},
      openEditPlan: false,
      isDuplicatePMOpen: false,
      pmToDuplicate: {},
      isMarkCompletePMOpen: false,
      pmToMarkComplete: {},
      isDeletePMOpen: false,
      pmToDelete: {},
      anchorEl: null,
      status: this.props.metricValue,
      filter_type: 0,
    }
  }

  async componentDidMount() {
    const active = this.getUserSitesData.getActiveSite()
    if (this.getUserSitesData.isActiveSiteAllSite(active)) this.setState({ siteFilterEnabled: true })
    else this.setState({ siteFilterEnabled: false })
    const payload = {
      pageIndex: 1,
      pageSize: 20,
      pm_id: [],
      internal_asset_id: [],
      pm_plan_id: [],
      search_string: '',
      site_id: [],
      pm_filter_type: this.state.filter_type,
      pm_status: this.state.status,
    }
    if (_.get(history, 'location.state.fromDashboard')) {
      payload.pm_filter_type = 1
      this.setState({ filter_type: 1 })
    }
    this.filterPMList(payload)
  }

  constructRequestPayload = () => {
    const payload = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize,
      pm_id: this.state.filterForPMTitle,
      internal_asset_id: this.state.filterForAssetName,
      pm_plan_id: this.state.filterForPMPlan,
      site_id: this.state.filterForSiteName,
      search_string: this.state.searchString,
      pm_filter_type: this.state.filter_type,
      pm_status: this.state.status,
    }
    this.filterPMList(payload)
    this.props.setRender()
  }
  filterPMList = async payload => {
    this.setState({ loading: true })
    try {
      const res = await filterPMtems(payload)
      // console.log(res.data.list)
      if (!_.isEmpty(res.data)) this.successInFetchingData(res.data)
      else this.failureInFetchingData()
    } catch (error) {
      this.failureInFetchingData()
    }
  }
  successInFetchingData = data => this.setState({ loading: false, rows: data.list, size: data.listsize }, () => this.checkClearFilterDisablity())
  failureInFetchingData = () => this.setState({ loading: false, rows: [], size: 0 }, () => this.checkClearFilterDisablity())

  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.constructRequestPayload())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.constructRequestPayload())

  checkClearFilterDisablity = () => {
    if (!_.isEmpty(this.state.selectedAssetNameForFilter) || !_.isEmpty(this.state.selectedPMPlanForFilter) || !_.isEmpty(this.state.selectedPMTitleForFilter) || !_.isEmpty(this.state.selectedSiteNameForFilter) || this.state.status !== 0) {
      this.setState({ clearFilterButton: false, filterForColumn: true }, () => this.fetchInitialOptions())
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false }, () => this.fetchInitialOptions())
    }
  }
  clearFilters = () => {
    this.setState(
      {
        pageIndex: 1,
        pageSize: 20,
        filterForAssetName: [],
        selectedAssetNameForFilter: [],
        filterForPMTitle: [],
        selectedPMTitleForFilter: [],
        filterForPMPlan: [],
        selectedPMPlanForFilter: [],
        filterForSiteName: [],
        selectedSiteNameForFilter: [],
        primaryFilterName: '',
        pageIndexForAssetFilter: 1,
        pageIndexForTitleFilter: 1,
        pageIndexForPlanFilter: 1,
        pageIndexForSiteFilter: 1,
        status: 0,
      },
      () => this.constructRequestPayload()
    )
  }
  actionOnDetails = async (obj, action) => {
    try {
      $('#pageLoading').show()
      const plan = await getPlanForAsset(obj.asset_id, 0)
      //const _pm = await getAssetPMByID(obj.asset_pm_id)
      const pm = plan.list.find(p => p.asset_pm_id === obj.asset_pm_id)
      // console.log(pm)
      if (action === 'VIEW') this.setState({ viewObj: pm, openViewPlan: true })
      if (action === 'EDIT') this.setState({ editObj: pm, openEditPlan: true })
      if (action === 'DUPLICATE') this.setState({ isDuplicatePMOpen: true, pmToDuplicate: pm })
      if (action === 'COMPLETE') this.setState({ isMarkCompletePMOpen: true, pmToMarkComplete: pm })
      if (action === 'DELETE') this.setState({ isDeletePMOpen: true, pmToDelete: pm })
      $('#pageLoading').hide()
    } catch (error) {
      $('#pageLoading').hide()
      console.log(error)
    }
  }
  editDetails = obj => history.push({ pathname: `assets/details/${obj.asset_id}`, state: { fromPMList: true, value: obj, action: 'EDIT' } })
  duplicateDetails = obj => history.push({ pathname: `assets/details/${obj.asset_id}`, state: { fromPMList: true, value: obj, action: 'DUPLICATE' } })
  markComplete = obj => history.push({ pathname: `assets/details/${obj.asset_id}`, state: { fromPMList: true, value: obj, action: 'COMPLETE' } })
  deletePM = async () => {
    this.setState({ isDeletePMOpen: false })
    $('#pageLoading').show()
    try {
      const res = await deleteAssetPM(this.state.pmToDelete.asset_pm_id)
      if (res.success > 0) {
        Toast.success('PM deleted successfully')
        this.constructRequestPayload()
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }
  lastStatusUpdate = () => this.setState({ isMarkCompletePMOpen: true, pmToMarkComplete: this.state.editObj })
  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ page: 0, pageIndex: 1 }, () => this.constructRequestPayload())
  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)
  //
  fetchInitialOptions = async () => {
    this.setState({ loading: true })
    const payload = this.getFilterOptionsPayload('')
    try {
      const assetNameOpts = await filterPMAssetNameOptions(payload)
      const pmTitleOpts = await filterPMTitleOptions(payload)
      const pmPlanOpts = await filterPMPlanOptions(payload)
      const pmSiteOpts = await filterPMSiteNameOptions(payload)
      this.setState({
        optionsForAssetNameFilter: this.state.primaryFilterName === this.filterEnums.ASSET ? this.state.optionsForAssetNameFilter : _.get(assetNameOpts, 'data.list', []),
        optionsForPMTitleFilter: this.state.primaryFilterName === this.filterEnums.TITLE ? this.state.optionsForPMTitleFilter : _.get(pmTitleOpts, 'data.list', []),
        optionsForPMPlanFilter: this.state.primaryFilterName === this.filterEnums.PLAN ? this.state.optionsForPMPlanFilter : _.get(pmPlanOpts, 'data.list', []),
        optionsForSiteNameFilter: this.state.primaryFilterName === this.filterEnums.SITE ? this.state.optionsForSiteNameFilter : _.get(pmSiteOpts, 'data.list', []),
        loading: false,
      })
    } catch (error) {
      console.log(error)
    }
  }
  getFilterOptionsPayload = val => ({
    pageIndex: 1,
    pageSize: 20,
    pm_id: this.state.filterForPMTitle,
    internal_asset_id: this.state.filterForAssetName,
    pm_plan_id: this.state.filterForPMPlan,
    search_string: this.state.searchString,
    site_id: this.state.filterForSiteName,
    site_id: this.state.filterForSiteName,
    option_search_string: val,
  })
  //--------------Input Change----------------------//
  handlePMTitleFilterInputChange = (e, val) => {
    this.setState({ listLoadingForTitleFilter: true, pageIndexForTitleFilter: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      const payload = this.getFilterOptionsPayload(val)
      const data = await filterPMTitleOptions({ ...payload, pm_id: [] })
      const list = data.success === 1 ? data.data.list : []
      this.setState({ optionsForPMTitleFilter: list, listLoadingForTitleFilter: false })
    }, 700)
  }
  handlePMAssetFilterInputChange = (e, val) => {
    this.setState({ listLoadingForAssetFilter: true, pageIndexForAssetFilter: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      const payload = this.getFilterOptionsPayload(val)
      const data = await filterPMAssetNameOptions({ ...payload, internal_asset_id: [] })
      const list = data.success === 1 ? data.data.list : []
      this.setState({ optionsForAssetNameFilter: list, listLoadingForAssetFilter: false })
    }, 700)
  }
  handlePMPlanFilterInputChange = (e, val) => {
    this.setState({ listLoadingForPlanFilter: true, pageIndexForPlanFilter: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      const payload = this.getFilterOptionsPayload(val)
      const data = await filterPMPlanOptions({ ...payload, pm_plan_id: [] })
      const list = data.success === 1 ? data.data.list : []
      this.setState({ optionsForPMPlanFilter: list, listLoadingForPlanFilter: false })
    }, 700)
  }
  handlePMSiteFilterInputChange = (e, val) => {
    this.setState({ listLoadingForSiteFilter: true, pageIndexForSiteFilter: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      const payload = this.getFilterOptionsPayload(val)
      const data = await filterPMSiteNameOptions({ ...payload, site_id: [] })
      const list = data.success === 1 ? data.data.list : []
      this.setState({ optionsForSiteNameFilter: list, listLoadingForSiteFilter: false })
    }, 700)
  }
  //--------------Scroll Bottom----------------------//
  scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) this.fetchMoreOptions(listboxNode)
  }
  fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = this.getFilterOptionsPayload(val)
    if (id === this.filterEnums.TITLE) {
      this.setState({ pageIndexForTitleFilter: this.state.pageIndexForTitleFilter + 1 }, async () => {
        const data = await filterPMTitleOptions({ ...payload, pm_id: [], pageIndex: this.state.pageIndexForTitleFilter })
        const list = data.success === 1 ? data.data.list : []
        this.setState({ optionsForPMTitleFilter: [...this.state.optionsForPMTitleFilter, ...list] })
      })
    }
    if (id === this.filterEnums.ASSET) {
      this.setState({ pageIndexForAssetFilter: this.state.pageIndexForAssetFilter + 1 }, async () => {
        const data = await filterPMAssetNameOptions({ ...payload, internal_asset_id: [], pageIndex: this.state.pageIndexForAssetFilter })
        const list = data.success === 1 ? data.data.list : []
        this.setState({ optionsForAssetNameFilter: [...this.state.optionsForAssetNameFilter, ...list] })
      })
    }
    if (id === this.filterEnums.PLAN) {
      this.setState({ pageIndexForPlanFilter: this.state.pageIndexForPlanFilter + 1 }, async () => {
        const data = await filterPMPlanOptions({ ...payload, pm_plan_id: [], pageIndex: this.state.pageIndexForPlanFilter })
        const list = data.success === 1 ? data.data.list : []
        this.setState({ optionsForPMPlanFilter: [...this.state.optionsForPMPlanFilter, ...list] })
      })
    }
    if (id === this.filterEnums.SITE) {
      this.setState({ pageIndexForSiteFilter: this.state.pageIndexForSiteFilter + 1 }, async () => {
        const data = await filterPMSiteNameOptions({ ...payload, site_id: [], pageIndex: this.state.pageIndexForSiteFilter })
        const list = data.success === 1 ? data.data.list : []
        this.setState({ optionsForSiteNameFilter: [...this.state.optionsForSiteNameFilter, ...list] })
      })
    }
  }
  //--------------Filters----------------------//
  handleAssetNameFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.ASSET), page: 0, pageIndex: 1, filterForAssetName: val.map(asset => asset.internal_asset_id), selectedAssetNameForFilter: val }, () => this.constructRequestPayload())
  handlePMTitleFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.TITLE), page: 0, pageIndex: 1, filterForPMTitle: val.map(x => x.pm_id), selectedPMTitleForFilter: val }, () => this.constructRequestPayload())
  handlePMPlanFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.PLAN), page: 0, pageIndex: 1, filterForPMPlan: val.map(x => x.pm_plan_id), selectedPMPlanForFilter: val }, () => this.constructRequestPayload())
  handlePMSiteFilterChange = (e, val) => this.setState({ primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE), page: 0, pageIndex: 1, filterForSiteName: val.map(x => x.site_id), selectedSiteNameForFilter: val }, () => this.constructRequestPayload())
  //-------COMPONENTS------------//
  SearchControl = () => (
    <div>
      <TextField
        placeholder='Search PMs '
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
      <Button size='small' onClick={() => this.clearFilters()} disabled={this.state.clearFilterButton} startIcon={<RotateLeftSharpIcon />} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
        Reset Filters
      </Button>
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
        {this.HeaderTab({ classes, text: 'Title', filter: true, cond: !_.isEmpty(this.state.selectedPMTitleForFilter) })}
        {this.HeaderTab({ classes, text: 'Asset Name', filter: true, cond: !_.isEmpty(this.state.selectedAssetNameForFilter) })}
        {this.HeaderTab({ classes, text: 'PM Plan', filter: true, cond: !_.isEmpty(this.state.selectedPMPlanForFilter) })}
        {this.HeaderTab({ classes, text: 'Status' })}
        {this.HeaderTab({ classes, text: 'Due In' })}
        {this.HeaderTab({ classes, text: 'Total Est Time' })}
        {this.HeaderTab({ classes, text: 'Site', filter: this.state.siteFilterEnabled, cond: !_.isEmpty(this.state.selectedSiteNameForFilter) })}
        {this.HeaderTab({ classes, text: 'Actions' })}
      </TableRow>
      {this.state.filterForColumn && (
        <TableRow>
          <TableCell classes={{ root: classes.headFilter }}>
            <Autocomplete
              id='TITLE'
              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
              size='small'
              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
              multiple
              value={this.state.selectedPMTitleForFilter}
              options={this.state.optionsForPMTitleFilter}
              getOptionLabel={option => option.title}
              loading={this.state.listLoadingForTitleFilter}
              onChange={(e, val) => this.handlePMTitleFilterChange(e, val)}
              onInputChange={(e, val) => this.handlePMTitleFilterInputChange(e, val)}
              onClose={() => this.setState({ listLoadingForTitleFilter: false, pageIndexForTitleFilter: 1 })}
              noOptionsText='No title found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Title' />}
            />
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}>
            <Autocomplete
              id='ASSET'
              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
              size='small'
              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
              multiple
              filterOptions={filterOptions}
              value={this.state.selectedAssetNameForFilter}
              options={this.state.optionsForAssetNameFilter}
              getOptionLabel={option => option.name}
              loading={this.state.listLoadingForAssetFilter}
              onChange={(e, val) => this.handleAssetNameFilterChange(e, val)}
              onInputChange={(e, val) => this.handlePMAssetFilterInputChange(e, val)}
              onClose={() => this.setState({ listLoadingForAssetFilter: false, pageIndexForAssetFilter: 1 })}
              noOptionsText='No asset found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Asset' id='assetNameFilterOptions' />}
            />
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}>
            <Autocomplete
              id='PLAN'
              ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
              size='small'
              classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
              multiple
              value={this.state.selectedPMPlanForFilter}
              options={this.state.optionsForPMPlanFilter}
              getOptionLabel={option => option.plan_name}
              loading={this.state.listLoadingForPlanFilter}
              onChange={(e, val) => this.handlePMPlanFilterChange(e, val)}
              onInputChange={(e, val) => this.handlePMPlanFilterInputChange(e, val)}
              onClose={() => this.setState({ listLoadingForPlanFilter: false, pageIndexForPlanFilter: 1 })}
              noOptionsText='No plan found'
              renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Plan' />}
            />
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
          <TableCell classes={{ root: classes.headFilter }}>
            {this.state.siteFilterEnabled && (
              <Autocomplete
                id='SITE'
                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                size='small'
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={this.state.selectedSiteNameForFilter}
                options={this.state.optionsForSiteNameFilter}
                getOptionLabel={option => option.site_name}
                loading={this.state.listLoadingForSiteFilter}
                onChange={(e, val) => this.handlePMSiteFilterChange(e, val)}
                onInputChange={(e, val) => this.handlePMSiteFilterInputChange(e, val)}
                onClose={() => this.setState({ listLoadingForSiteFilter: false, pageIndexForSiteFilter: 1 })}
                noOptionsText='No site found'
                renderInput={params => <TextField {...params} variant='outlined' margin='normal' autoComplete='off' name='lastpass-disable-search' className='filter-input-disable-lastpass' fullWidth placeholder='Select Site' />}
              />
            )}{' '}
          </TableCell>
          <TableCell classes={{ root: classes.headFilter }}></TableCell>
        </TableRow>
      )}
    </TableHead>
  )
  StatusFilter = () => (
    <>
      <Button onClick={e => this.setState({ anchorEl: e.currentTarget })} size='small' startIcon={<FilterListIcon />} variant='contained' color='primary' className='nf-buttons ml-2' disableElevation>
        {this.state.filter_type === 0 ? 'All' : this.state.filter_type === 1 ? 'Current/Upcoming' : 'Completed'}
      </Button>
      <Menu id='schedule-list-menu' anchorEl={this.state.anchorEl} keepMounted open={Boolean(this.state.anchorEl)} onClose={() => this.setState({ anchorEl: null })}>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 0, anchorEl: null }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 0}>
          All
        </MenuItem>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 1, anchorEl: null }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 1}>
          Current/Upcoming
        </MenuItem>
        <MenuItem onClick={() => this.setState({ page: 0, pageIndex: 1, filter_type: 2, anchorEl: null }, () => this.constructRequestPayload())} disabled={this.state.filter_type === 2}>
          Completed
        </MenuItem>
      </Menu>
    </>
  )

  componentDidUpdate(prevProps, prevState) {
    if (this.props.metricValue !== prevProps.metricValue) this.setState({ status: this.props.metricValue }, () => this.constructRequestPayload())
  }

  getStatusName = status => {
    if (status === 1) return 'Active'
    if (status === 31) return 'Overdue'
    if (status === 32) return 'Due'
    if (status === 33) return 'In Progress'
    if (status === 42) return 'Waiting'
    if (status === 43) return 'Open'
    if (status === 44) return 'Completed'
  }

  getDueIn = (dueIn, status) => {
    const { classes } = this.props
    const getColor = () => {
      if (status === 31) return '#F74949'
      if (status === 32) return '#D9B51C'
    }
    if ([31, 32].includes(status)) {
      return (
        <div className={classes.workOrderStatus} style={{ background: getColor() }}>
          {this.getStatusName(status)} - {dueIn}
        </div>
      )
    } else {
      return dueIn
    }
  }

  render() {
    const { classes } = this.props
    const filterOptions = createFilterOptions({
      matchFrom: 'any',
      stringify: option => option.name.trim() + option.internal_asset_id,
      trim: true,
    })
    //console.log(this.state, this.props.metricValue)
    return (
      <div style={{ width: '100%', position: 'relative' }}>
        <div className='d-flex flex-row justify-content-between align-items-center mb-2' style={{ width: '100%', position: 'absolute', top: '5%' }}>
          {this.StatusFilter()}
          {this.SearchControl()}
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: '595px', height: '595px', marginTop: '75px' }}>
          <Table size='small' stickyHeader={true}>
            {this.HearderControl({ classes, filterOptions })}
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
                      <TableCell className={classes.tableCell}>{tableRow.title}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.asset_name}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.pm_plan_name}</TableCell>
                      <TableCell className={classes.tableCell}>{this.getStatusName(tableRow.asset_pm_status)}</TableCell>
                      <TableCell className={classes.tableCell}>{this.getDueIn(tableRow.due_in, tableRow.status)}</TableCell>
                      <TableCell className={classes.tableCell}>{`${tableRow.total_est_time_hours} hours ${tableRow.total_est_time_minutes} mins`}</TableCell>
                      <TableCell className={classes.tableCell}>{tableRow.site_name}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <Tooltip title='View PM' placement='top'>
                          <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'VIEW')}>
                            <VisibilityOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Edit PM' placement='top'>
                          <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'EDIT')}>
                            <EditOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Duplicate PM' placement='top'>
                          <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'DUPLICATE')}>
                            <FileCopyOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Mark PM as completed' placement='top'>
                          <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'COMPLETE')}>
                            <CheckCircleOutlineOutlinedIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete PM' placement='top'>
                          <IconButton size='small' onClick={() => this.actionOnDetails(tableRow, 'DELETE')}>
                            <CancelOutlinedIcon style={{ color: '#ff0000' }} fontSize='small' />
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
        {!_.isEmpty(this.state.rows) && <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.size} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />}
        <ViewPlan open={this.state.openViewPlan} onClose={() => this.setState({ openViewPlan: false })} viewObj={this.state.viewObj} />
        {/* {this.state.openEditPlan && <AddEditPM onLastStatusUpdate={() => this.lastStatusUpdate()} afterSubmit={() => this.constructRequestPayload()} setToastMsg={Toast} onEditObject={this.state.editObj} open={this.state.openEditPlan} onClose={() => this.setState({ openEditPlan: false })} />}
        {this.state.isDuplicatePMOpen && <AddEditPM onDuplicateObject={this.state.pmToDuplicate} afterSubmit={() => this.constructRequestPayload()} setToastMsg={Toast} open={this.state.isDuplicatePMOpen} onClose={() => this.setState({ isDuplicatePMOpen: false })} />} */}
        {this.state.isMarkCompletePMOpen && (
          <MarkComplete
            afterSubmit={() => {
              this.constructRequestPayload()
              this.setState({ openEditPlan: false })
            }}
            setToastMsg={Toast}
            obj={this.state.pmToMarkComplete}
            open={this.state.isMarkCompletePMOpen}
            handleClose={() => this.setState({ isMarkCompletePMOpen: false })}
          />
        )}
        <DialogPrompt title='Delete PM' ctaText='Delete' text='Are you sure you want to delete this PM ?' open={this.state.isDeletePMOpen} action={() => this.deletePM()} handleClose={() => this.setState({ isDeletePMOpen: false })} />
      </div>
    )
  }
}

export default withStyles(styles)(PMListTable)
