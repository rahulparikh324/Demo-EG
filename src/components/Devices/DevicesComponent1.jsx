import React, { Component } from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import FilterListIcon from '@material-ui/icons/FilterList'
import Autocomplete from '@material-ui/lab/Autocomplete'
import _ from 'lodash'
import URL from '../../Constants/apiUrls'
import filterDevice from '../../Services/Devices/filterDevice.service'
import moment from 'moment'
import TablePagination from '@material-ui/core/TablePagination'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import deviceFilterOptions from '../../Services/Devices/deviceFilterOptions.service'
import { MinimalButton } from 'components/common/buttons'

const styles = theme => ({
  root: { padding: 20, flexGrow: 1, background: '#fff' },
  container: { display: 'flex' },
  paper: { padding: theme.spacing(2), color: theme.palette.text.primary },
  tableCell: { fontSize: '12px', fontWeight: 400, height: '32px' },
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

export class DevicesComponent extends Component {
  constructor(props) {
    super(props)
    this.checkUserRole = new getUserRole()
    this.getUserSitesData = new getUserSitesData()
    this.filterEnums = {
      TYPE: 'TYPE',
      BRAND: 'BRAND',
      MODEL: 'MODEL',
      OS: 'OS',
      COMPANY: 'COMPANY',
      SITE_NAME: 'SITE_NAME',
    }

    this.state = {
      tableData: [],
      tableDataSize: 0,
      pageSize: 20,
      rowsPerPage: 20,
      pageIndex: 1,
      page: 0,
      filterForColumn: false,
      siteID: [],
      allSites: [],
      allSitesBackup: [],
      companyID: [],
      allCompanies: [],
      brand: [],
      allBrands: [],
      os: [],
      allOS: [],
      model: [],
      allModels: [],
      type: [],
      allTypes: [],
      searchString: '',
      searchStringOnEnter: false,
      clearFilterButton: true,
      companyAndSiteFilter: {},
      primaryFilterName: '',
      isDataLoading: true,
      typePageIndex: 1,
      modelPageIndex: 1,
      osPageIndex: 1,
      brandPageIndex: 1,
      companyPageIndex: 1,
      sitePageIndex: 1,
      isTypeListLoading: false,
      brandListLoading: false,
      modelListLoading: false,
      osListLoading: false,
      siteListLoading: false,
      companyListLoading: false,
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
  }

  checkForCompanyAndSiteFilterAvailabilityForAdmin = () => {
    const { company_id: allCompanyID, site_id: allSiteID } = JSON.parse(localStorage.getItem('loginData')).usersites.filter(site => site.status === 20)[0] || {}
    const companyFilter = localStorage.getItem('companyId') === allCompanyID && localStorage.getItem('siteId') === allSiteID
    const siteFilter = localStorage.getItem('siteId') === allSiteID
    return { companyFilter, siteFilter }
  }

  async componentDidMount() {
    this.setState({ isDataLoading: true })
    this.filterBasedOnColumn()
  }

  checkAndSetPrimaryFilter = filter => (this.state.primaryFilterName === '' ? filter : this.state.primaryFilterName)

  handleSearchOnKeyDown = e => e.key === 'Enter' && this.setState({ searchStringOnEnter: true, page: 0, pageIndex: 1 }, () => this.filterBasedOnColumn())
  clearSearch = e => this.setState({ searchString: '', page: 0, pageIndex: 1, searchStringOnEnter: false }, () => this.filterBasedOnColumn())

  handleChangePage = (event, newPage) => this.setState({ page: newPage, pageIndex: newPage + 1 }, () => this.filterBasedOnColumn())
  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: parseInt(event.target.value, 10), page: 0, pageIndex: 1, pageSize: parseInt(event.target.value, 10) }, () => this.filterBasedOnColumn())

  handleTypeFilter = (e, val) => this.setState({ type: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.TYPE) }, () => this.filterBasedOnColumn())
  handleModelFilter = (e, val) => this.setState({ model: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.MODEL) }, () => this.filterBasedOnColumn())
  handleBrandFilter = (e, val) => this.setState({ brand: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.BRAND) }, () => this.filterBasedOnColumn())
  handleOSFilter = (e, val) => this.setState({ os: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.OS) }, () => this.filterBasedOnColumn())
  handleSiteFilter = (e, val) => this.setState({ siteID: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.SITE_NAME) }, () => this.filterBasedOnColumn())
  handleCompanyFilter = (e, val) => this.setState({ companyID: val, page: 0, pageIndex: 1, primaryFilterName: this.checkAndSetPrimaryFilter(this.filterEnums.COMPANY) }, () => this.filterBasedOnColumn())

  filterBasedOnColumn = async () => {
    this.setState({ isDataLoading: true })

    const payload = {
      pagesize: this.state.pageSize,
      pageindex: this.state.pageIndex,
      site_id: _.isEmpty(this.state.siteID) ? [] : this.state.siteID.map(site => site.site_id),
      company_id: _.isEmpty(this.state.companyID) ? [] : this.state.companyID.map(comp => comp.company_id),
      status: 0,
      brand: this.state.brand,
      model: this.state.model,
      os: this.state.os,
      type: this.state.type,
      search_string: this.state.searchString,
    }

    const data = await filterDevice(payload)

    if (data.success === false) {
      this.setState({ tableData: data.list, tableDataSize: data.listsize, isDataLoading: false }, () => this.checkClearFilterDisablity())
      this.fetchInitialOptions()
    } else {
      this.setState({ tableData: [], isDataLoading: false })
      this.fetchInitialOptions()
    }

    if (this.state.siteID.length !== 0) {
      this.state.primaryFilterName === this.filterEnums.COMPANY ? this.setState({ companyAndSiteFilter: { companyFilter: true, siteFilter: true } }) : this.setState({ companyAndSiteFilter: { companyFilter: false, siteFilter: true } })
    } else this.setState({ companyAndSiteFilter: this.checkForCompanyAndSiteFilterAvailabilityForAdmin() })
  }

  checkClearFilterDisablity = () => {
    if (!_.isEmpty(this.state.siteID) || !_.isEmpty(this.state.companyID) || !_.isEmpty(this.state.brand) || !_.isEmpty(this.state.model) || !_.isEmpty(this.state.os) || !_.isEmpty(this.state.type)) {
      this.setState({ clearFilterButton: false, filterForColumn: true })
    } else {
      this.setState({ clearFilterButton: true, filterForColumn: false, primaryFilterName: '', typePageIndex: 1, modelPageIndex: 1, osPageIndex: 1, brandPageIndex: 1, companyPageIndex: 1, sitePageIndex: 1 })
    }
  }

  clearFilters = () => {
    this.setState(
      {
        pagesize: 20,
        pageIndex: 1,
        page: 0,
        model: [],
        brand: [],
        status: 0,
        type: [],
        os: [],
        siteID: [],
        companyID: [],
        primaryFilterName: '',
      },
      () => this.filterBasedOnColumn()
    )
  }

  getFilterOptionsPayload = val => ({
    pagesize: this.state.pageSize,
    pageindex: this.state.pageIndex,
    site_id: this.state.siteID.map(site => site.site_id),
    company_id: this.state.companyID.map(comp => comp.company_id),
    status: 0,
    brand: this.state.brand,
    model: this.state.model,
    os: this.state.os,
    type: this.state.type,
    search_string: this.state.searchString,
    option_search_string: val,
  })

  fetchInitialOptions = async () => {
    this.setState({ isDataLoading: true })
    const payload = this.getFilterOptionsPayload('')
    const typeOpts = await deviceFilterOptions(URL.filterDeviceTypeOptions, payload)
    const brandOpts = await deviceFilterOptions(URL.filterDeviceBrandOptions, payload)
    const modelOpts = await deviceFilterOptions(URL.filterDeviceModelOptions, payload)
    const osOpts = await deviceFilterOptions(URL.filterDeviceOSOptions, payload)
    const compOpts = await deviceFilterOptions(URL.filterDeviceCompanyOptions, payload)
    const siteOpts = await deviceFilterOptions(URL.filterDeviceSitesOptions, payload)
    this.setState({
      allTypes: this.state.primaryFilterName === this.filterEnums.TYPE ? this.state.allTypes : typeOpts.list,
      allBrands: this.state.primaryFilterName === this.filterEnums.BRAND ? this.state.allBrands : brandOpts.list,
      allModels: this.state.primaryFilterName === this.filterEnums.MODEL ? this.state.allModels : modelOpts.list,
      allOS: this.state.primaryFilterName === this.filterEnums.OS ? this.state.allOS : osOpts.list,
      allCompanies: this.state.primaryFilterName === this.filterEnums.COMPANY ? this.state.allCompanies : compOpts.list,
      allSites: this.state.primaryFilterName === this.filterEnums.SITE_NAME ? this.state.allSites : siteOpts.list,
      isDataLoading: false,
    })
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
      case 'typeFilter':
        this.setState({ typePageIndex: this.state.typePageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [], pageindex: this.state.typePageIndex })
          this.setState({ allTypes: [...this.state.allTypes, ...data.list] })
        })
        break
      case 'brandFilter':
        this.setState({ brandPageIndex: this.state.brandPageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceBrandOptions, { ...payload, brand: [], pageindex: this.state.brandPageIndex })
          this.setState({ allBrands: [...this.state.allBrands, ...data.list] })
        })
        break
      case 'modelFilter':
        this.setState({ modelPageIndex: this.state.modelPageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceModelOptions, { ...payload, model: [], pageindex: this.state.modelPageIndex })
          this.setState({ allModels: [...this.state.allModels, ...data.list] })
        })
        break
      case 'osFilter':
        this.setState({ osPageIndex: this.state.osPageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceOSOptions, { ...payload, os: [], pageindex: this.state.osPageIndex })
          this.setState({ allOS: [...this.state.allOS, ...data.list] })
        })
        break
      case 'siteFilter':
        this.setState({ sitePageIndex: this.state.sitePageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceSitesOptions, { ...payload, site_id: [], pageindex: this.state.sitePageIndex })
          this.setState({ allSites: [...this.state.allSites, ...data.list] })
        })
        break
      case 'companyFilter':
        this.setState({ companyPageIndex: this.state.companyPageIndex + 1 }, async () => {
          const data = await deviceFilterOptions(URL.filterDeviceCompanyOptions, { ...payload, company_id: [], pageindex: this.state.companyPageIndex })
          this.setState({ allCompanies: [...this.state.allCompanies, ...data.list] })
        })
        break

      default:
        break
    }
  }

  handleTypeFilterInputChange = async (e, val) => {
    this.setState({ isTypeListLoading: true, typePageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        this.setState({ allTypes: data.list, isTypeListLoading: false })
      }
    }, 700)
  }
  handleBrandFilterInputChange = async (e, val) => {
    this.setState({ brandListLoading: true, brandPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceBrandOptions, { ...payload, brand: [] })
        this.setState({ allBrands: data.list, brandListLoading: false })
      }
    }, 700)
  }
  handleModelFilterInputChange = async (e, val) => {
    this.setState({ modelListLoading: true, modelPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceModelOptions, { ...payload, model: [] })
        this.setState({ allModels: data.list, modelListLoading: false })
      }
    }, 700)
  }
  handleOSFilterInputChange = async (e, val) => {
    this.setState({ osListLoading: true, osPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceOSOptions, { ...payload, os: [] })
        this.setState({ allOS: data.list, osListLoading: false })
      }
    }, 700)
  }
  handleCompanyFilterInputChange = async (e, val) => {
    this.setState({ companyListLoading: true, companyPageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceCompanyOptions, { ...payload, company_id: [] })
        this.setState({ allCompanies: data.list, companyListLoading: false })
      }
    }, 700)
  }
  handleSiteFilterInputChange = async (e, val) => {
    this.setState({ siteListLoading: true, sitePageIndex: 1 })
    clearTimeout(this.typingTimer)
    this.typingTimer = setTimeout(async () => {
      if (val) {
        const payload = this.getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceSitesOptions, { ...payload, site_id: [] })
        this.setState({ allSites: data.list, siteListLoading: false })
      }
    }, 700)
  }

  render() {
    return (
      <div style={{ background: '#fff', height: 'calc(100vh - 64px)', padding: '20px' }}>
        <div className='d-flex flex-row-reverse align-items-center' style={{ width: '100%', marginBottom: '16px' }}>
          <MinimalButton text='Reset Filter' size='small' onClick={this.clearFilters} startIcon={<RotateLeftSharpIcon fontSize='small' />} disabled={this.state.clearFilterButton} variant='contained' color='primary' baseClassName='nf-buttons ml-2' />
          <TextField
            id='searchDevices'
            placeholder='Search Devices'
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
            value={this.state.searchString}
            onChange={e => this.setState({ searchString: e.target.value })}
            onKeyDown={e => this.handleSearchOnKeyDown(e)}
          />
        </div>
        <div className='table-responsive dashboardtblScroll' id='style-1' style={{ height: 'calc(100vh - 200px)' }}>
          <Table size='small' stickyHeader={true}>
            {this.TableHeaders()}
            {this.state.isDataLoading ? <TableLoader cols={9} /> : _.isEmpty(this.state.tableData) ? this.EmptyBody() : this.TableBodyData()}
          </Table>
        </div>
        {!_.isEmpty(this.state.tableData) && this.PaginationComponent()}
      </div>
    )
  }

  TableHeaders() {
    const { classes } = this.props
    return (
      <TableHead>
        <TableRow>
          <TableCell align='left' padding='normal'>
            Code
          </TableCell>
          <TableCell align='left' padding='normal'>
            Name
          </TableCell>
          <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.type.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
            Type
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.brand.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
            Brand
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.model.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
            Model
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.os.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
            OS
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          {this.state.companyAndSiteFilter.companyFilter ? (
            <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.companyID.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
              Company
              <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
            </TableCell>
          ) : (
            <TableCell>Company</TableCell>
          )}
          <TableCell align='left' padding='normal'>
            Last Sync Time
          </TableCell>
          {this.state.companyAndSiteFilter.siteFilter ? (
            <TableCell onClick={() => this.setState({ filterForColumn: !this.state.filterForColumn })} classes={{ root: classes.headRoot }} style={this.state.siteID.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='normal'>
              Last Sync Facilities
              <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
            </TableCell>
          ) : (
            <TableCell>Last Sync Facilities</TableCell>
          )}
        </TableRow>
        {this.state.filterForColumn && (
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                onInputChange={(e, val) => this.handleTypeFilterInputChange(e, val)}
                loading={this.state.isTypeListLoading}
                onClose={() => this.setState({ isTypeListLoading: false })}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={this.state.type}
                id='typeFilter'
                options={this.state.allTypes}
                getOptionLabel={option => option}
                name='typeID'
                onChange={(e, val) => this.handleTypeFilter(e, val)}
                noOptionsText='No types found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Types' name='typeID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                onInputChange={(e, val) => this.handleBrandFilterInputChange(e, val)}
                loading={this.state.brandListLoading}
                onClose={() => this.setState({ brandListLoading: false })}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={this.state.brand}
                id='brandFilter'
                options={this.state.allBrands}
                getOptionLabel={option => option}
                name='brandID'
                onChange={(e, val) => this.handleBrandFilter(e, val)}
                noOptionsText='No brands found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Brands' name='brandID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                onInputChange={(e, val) => this.handleModelFilterInputChange(e, val)}
                loading={this.state.modelListLoading}
                onClose={() => this.setState({ modelListLoading: false })}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={this.state.model}
                id='modelFilter'
                options={this.state.allModels}
                getOptionLabel={option => option}
                name='modelID'
                onChange={(e, val) => this.handleModelFilter(e, val)}
                noOptionsText='No models found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Models' name='modelID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                onInputChange={(e, val) => this.handleOSFilterInputChange(e, val)}
                loading={this.state.osListLoading}
                onClose={() => this.setState({ osListLoading: false })}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={this.state.os}
                id='osFilter'
                options={this.state.allOS}
                getOptionLabel={option => option}
                name='osID'
                onChange={(e, val) => this.handleOSFilter(e, val)}
                noOptionsText='No OS found'
                renderInput={params => <TextField {...params} variant='outlined' margin='normal' className='filter-input-disable-lastpass' fullWidth placeholder='Select OS' name='osID' />}
              />
            </TableCell>
            {this.state.companyAndSiteFilter.companyFilter ? (
              <TableCell classes={{ root: classes.headFilter }}>
                <Autocomplete
                  size='small'
                  ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                  onInputChange={(e, val) => this.handleCompanyFilterInputChange(e, val)}
                  loading={this.state.companyListLoading}
                  onClose={() => this.setState({ companyListLoading: false })}
                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                  multiple
                  value={this.state.companyID}
                  id='companyFilter'
                  options={this.state.allCompanies}
                  getOptionLabel={option => option.company_name}
                  name='compID'
                  onChange={(e, val) => this.handleCompanyFilter(e, val)}
                  noOptionsText='No Companies found'
                  renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Company' name='companyID' />}
                />
              </TableCell>
            ) : (
              <TableCell></TableCell>
            )}
            <TableCell></TableCell>
            {this.state.companyAndSiteFilter.siteFilter ? (
              <TableCell classes={{ root: classes.headFilter }}>
                <Autocomplete
                  size='small'
                  ListboxProps={{ onScroll: event => this.scrolledToBottom(event) }}
                  onInputChange={(e, val) => this.handleSiteFilterInputChange(e, val)}
                  loading={this.state.siteListLoading}
                  onClose={() => this.setState({ siteListLoading: false })}
                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                  multiple
                  value={this.state.siteID}
                  id='siteFilter'
                  options={this.state.allSites}
                  getOptionLabel={option => option.site_name}
                  name='siteID'
                  onChange={(e, val) => this.handleSiteFilter(e, val)}
                  noOptionsText='No Sites found'
                  renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Sites' name='siteID' />}
                />
              </TableCell>
            ) : (
              <TableCell></TableCell>
            )}
          </TableRow>
        )}
      </TableHead>
    )
  }

  EmptyBody() {
    const { classes } = this.props
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan='12' className='Pendingtbl-no-datafound'>
            No data found
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  TableBodyData() {
    const { classes } = this.props
    return (
      <TableBody>
        {this.state.tableData.map(row => (
          <TableRow key={row.device_uuid}>
            <TableCell className={classes.tableCell}>{row.device_code ? row.device_code : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.name ? row.name : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.type ? row.type : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.brand ? row.brand : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.model ? row.model : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.os ? row.os : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.company_name ? row.company_name : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.last_sync_time ? moment.utc(row.last_sync_time).local().format('MM-DD-YYYY hh:mm:ss a') : '-'}</TableCell>
            <TableCell className={classes.tableCell}>{row.last_sync_site_name ? row.last_sync_site_name : '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    )
  }

  PaginationComponent() {
    return <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={this.state.tableDataSize} rowsPerPage={this.state.rowsPerPage} page={this.state.page} onPageChange={this.handleChangePage} onRowsPerPageChange={this.handleChangeRowsPerPage} />
  }
}

export default withStyles(styles)(DevicesComponent)
