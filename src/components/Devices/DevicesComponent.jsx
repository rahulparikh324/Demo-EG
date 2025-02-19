import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
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
import companyList from '../../Services/getAllCompany'
import moment from 'moment'
import TablePagination from '@material-ui/core/TablePagination'
import InputAdornment from '@material-ui/core/InputAdornment'
import SearchOutlined from '@material-ui/icons/SearchOutlined'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined'
import Fab from '@material-ui/core/Fab'
import { Typography } from '@material-ui/core'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import getUserRole from '../../helpers/getUserRole'
import getUserSitesData from '../../helpers/getUserSitesData'
import TableLoader from '../TableLoader'
import deviceFilterOptions from '../../Services/Devices/deviceFilterOptions.service'

const styles = theme => ({
  root: { padding: 20, flexGrow: 1 },
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

function DevicesComponent(props) {
  const { classes } = props
  const checkUserRole = new getUserRole()
  const userSitesData = new getUserSitesData()
  const [tableData, setTableData] = useState([])
  const [tableDataSize, setTableDataSize] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [pageIndex, setPageIndex] = useState(1)
  const [page, setPage] = useState(0)
  const [siteID, setSiteID] = useState([])
  const [allSites, setAllSites] = useState([])
  const [allSitesBackup, setAllSitesBackup] = useState([])
  const [companyID, setCompanyID] = useState([])
  const [allCompanies, setAllCompanies] = useState([])
  const [brand, setBrand] = useState([])
  const [allBrands, setAllBrands] = useState([])
  const [os, setOS] = useState([])
  const [allOS, setAllOS] = useState([])
  const [model, setModel] = useState([])
  const [allModels, setAllModels] = useState([])
  const [type, setType] = useState([])
  const [allTypes, setAllTypes] = useState([])
  const [searchString, setSearchString] = useState('')
  const [searched, setSearched] = useState(false)
  const [filterForColumn, setFilterForColumn] = useState(false)
  const [initialRender, setInitialRender] = useState(true)
  const [clearFilterButton, setClearFilterButton] = useState(true)
  const [companyAndSiteFilter, setCompanyAndSiteFilter] = useState({})
  const filterEnums = {
    TYPE: 'TYPE',
    BRAND: 'BRAND',
    MODEL: 'MODEL',
    OS: 'OS',
    COMPANY: 'COMPANY',
    SITE_NAME: 'SITE_NAME',
  }
  const [primaryFilterName, setPrimaryFilterName] = useState('')
  const [isDataLoading, setDataLoading] = useState(true)
  const [typePageIndex, setTypePageIndex] = useState(1)
  const [modelPageIndex, setModelPageIndex] = useState(1)
  const [osPageIndex, setOsPageIndex] = useState(1)
  const [brandPageIndex, setBrandPageIndex] = useState(1)
  const [companyPageIndex, setCompanyPageIndex] = useState(1)
  const [sitePageIndex, setSitePageIndex] = useState(1)
  const [isTypeListLoading, setTypeListLoading] = useState(false)
  const [brandListLoading, setBrandListLoading] = useState(false)
  const [modelListLoading, setModelListLoading] = useState(false)
  const [osListLoading, setOsListLoading] = useState(false)
  const [siteListLoading, setSiteListLoading] = useState(false)
  const [companyListLoading, setCompanyListLoading] = useState(false)
  let typingTimer

  const checkAndSetPrimaryFilter = filter => (primaryFilterName === '' ? filter : primaryFilterName)

  const checkClearFilterDisablity = () => {
    if (!_.isEmpty(siteID) || !_.isEmpty(companyID) || !_.isEmpty(brand) || !_.isEmpty(model) || !_.isEmpty(os) || !_.isEmpty(type)) setClearFilterButton(false)
    else {
      setClearFilterButton(true)
      setPrimaryFilterName('')
    }
  }

  const filterDevicesForData = async () => {
    setDataLoading(true)
    const payload = {
      pagesize: pageSize,
      pageindex: pageIndex,
      site_id: _.isEmpty(siteID) ? [] : siteID.map(site => site.site_id),
      company_id: _.isEmpty(companyID) ? [] : companyID.map(comp => comp.company_id),
      status: 0,
      brand,
      model,
      os,
      type,
      search_string: searchString,
    }

    const data = await filterDevice(payload)
    // console.log(data)

    if (siteID.length !== 0) {
      primaryFilterName === filterEnums.COMPANY ? setCompanyAndSiteFilter({ companyFilter: true, siteFilter: true }) : setCompanyAndSiteFilter({ companyFilter: false, siteFilter: true })
    } else checkForCompanyAndSiteFilterAvailabilityForAdmin()

    if (data.success === false) {
      setTableData(data.list)
      setTableDataSize(data.listsize)
      setDataLoading(false)
    } else {
      setTableData([])
      setDataLoading(false)
    }

    checkClearFilterDisablity()
    fetchInitialOptions()
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    setPageIndex(newPage + 1)
  }

  const handleChangeRowsPerPage = event => {
    const size = parseInt(event.target.value, 10)
    setPageSize(size)
    setRowsPerPage(size)
    setPage(0)
    setPageIndex(1)
  }

  const checkForCompanyAndSiteFilterAvailabilityForAdmin = () => {
    const { company_id: allCompanyID, site_id: allSiteID } = JSON.parse(localStorage.getItem('loginData')).usersites.filter(site => site.status === 20)[0] || {}
    const companyFilter = localStorage.getItem('companyId') === allCompanyID && localStorage.getItem('siteId') === allSiteID
    const siteFilter = localStorage.getItem('siteId') === allSiteID
    setCompanyAndSiteFilter({ companyFilter, siteFilter })
  }

  const handleBrandFilter = (e, val) => {
    setBrand(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.BRAND))
  }

  const handleTypeFilter = (e, val) => {
    setType(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.TYPE))
  }

  const handleModelFilter = (e, val) => {
    setModel(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.MODEL))
  }

  const handleOSFilter = (e, val) => {
    setOS(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.OS))
  }

  const handleSiteFilter = (e, val) => {
    setSiteID(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.SITE_NAME))
  }

  const handleCompanyFilter = (e, val) => {
    setCompanyID(val)
    setPage(0)
    setPageIndex(1)
    setPrimaryFilterName(checkAndSetPrimaryFilter(filterEnums.COMPANY))
    const allSites = []
    if (_.isEmpty(val)) {
      setAllSites(allSitesBackup)
    } else {
      val.forEach(c => c.sites.forEach(s => allSites.push(s)))
      setAllSites(allSites)
    }
  }

  const handleSearchOnKeyDown = e => {
    if (e.key === 'Enter') {
      setSearched(true)
      setPage(0)
      setPageIndex(1)
    }
  }

  const clearSearch = e => {
    setSearchString('')
    setSearched(false)
    setPage(0)
    setPageIndex(1)
  }

  const clearFilters = () => {
    setPage(0)
    setPageIndex(1)
    setModel([])
    setBrand([])
    setType([])
    setOS([])
    setCompanyID([])
    setSiteID([])
    setPrimaryFilterName('')
  }

  const getFilterOptionsPayload = val => ({
    pagesize: 20,
    pageindex: 1,
    site_id: siteID.map(site => site.site_id),
    company_id: companyID.map(comp => comp.company_id),
    status: 0,
    brand,
    model,
    os,
    type,
    search_string: searchString,
    option_search_string: val,
  })

  const fetchInitialOptions = async () => {
    setDataLoading(true)
    const payload = getFilterOptionsPayload('')
    const typeOpts = await deviceFilterOptions(URL.filterDeviceTypeOptions, payload)
    const brandOpts = await deviceFilterOptions(URL.filterDeviceBrandOptions, payload)
    const modelOpts = await deviceFilterOptions(URL.filterDeviceModelOptions, payload)
    const osOpts = await deviceFilterOptions(URL.filterDeviceOSOptions, payload)
    const compOpts = await deviceFilterOptions(URL.filterDeviceCompanyOptions, payload)
    const siteOpts = await deviceFilterOptions(URL.filterDeviceSitesOptions, payload)
    primaryFilterName === filterEnums.TYPE ? setAllTypes(allTypes) : setAllTypes(typeOpts.list)
    primaryFilterName === filterEnums.BRAND ? setAllBrands(allBrands) : setAllBrands(brandOpts.list)
    primaryFilterName === filterEnums.MODEL ? setAllModels(allModels) : setAllModels(modelOpts.list)
    primaryFilterName === filterEnums.OS ? setAllOS(allOS) : setAllOS(osOpts.list)
    primaryFilterName === filterEnums.COMPANY ? setAllCompanies(allCompanies) : setAllCompanies(compOpts.list)
    primaryFilterName === filterEnums.SITE_NAME ? setAllSites(allSites) : setAllSites(siteOpts.list)
    setDataLoading(false)
  }

  const scrolledToBottom = event => {
    const listboxNode = event.currentTarget
    if (listboxNode.scrollTop + listboxNode.clientHeight === listboxNode.scrollHeight) fetchMoreOptions(listboxNode)
  }

  const fetchMoreOptions = async target => {
    const id = target.id.split('-')[0]
    const val = document.querySelector(`#${id}`).value
    const payload = getFilterOptionsPayload(val)
    switch (id) {
      case 'typeFilter':
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [], pageindex: typePageIndex })
        setAllTypes([...allTypes, ...data.list])
        setTypePageIndex(prev => prev + 1)
        break
      case 'modelFilter':
        const model = await deviceFilterOptions(URL.filterDeviceModelOptions, { ...payload, model: [], pageindex: modelPageIndex + 1 })
        setAllModels([...allModels, ...model.list])
        setModelPageIndex(prev => prev + 1)
        break
      case 'osFilter':
        const os = await deviceFilterOptions(URL.filterDeviceOSOptions, { ...payload, os: [], pageindex: osPageIndex + 1 })
        setAllOS([...allOS, ...os.list])
        setOsPageIndex(prev => prev + 1)
        break
      case 'companyFilter':
        const comp = await deviceFilterOptions(URL.filterDeviceCompanyOptions, { ...payload, company_id: [], pageindex: companyPageIndex + 1 })
        setAllCompanies([...allCompanies, ...comp.list])
        setCompanyPageIndex(prev => prev + 1)
        break
      case 'siteFilter':
        const site = await deviceFilterOptions(URL.filterDeviceSitesOptions, { ...payload, site_id: [], pageindex: sitePageIndex + 1 })
        setAllSites([...allSites, ...site.list])
        setSitePageIndex(prev => prev + 1)
        break

      default:
        break
    }
  }

  const handleTypeFilterInputChange = async (e, val) => {
    setTypeListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        setAllTypes(data.list)
        setTypeListLoading(false)
      }
    }, 700)
  }
  const handleModelFilterInputChange = async (e, val) => {
    setModelListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        // console.log(data.list)
      }
    }, 700)
  }
  const handleBrandFilterInputChange = async (e, val) => {
    setModelListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        // console.log(data.list)
      }
    }, 700)
  }
  const handleOSFilterInputChange = async (e, val) => {
    setModelListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        // console.log(data.list)
      }
    }, 700)
  }
  const handleCompanyFilterInputChange = async (e, val) => {
    setModelListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        // console.log(data.list)
      }
    }, 700)
  }
  const handleSiteFilterInputChange = async (e, val) => {
    setModelListLoading(true)
    clearTimeout(typingTimer)
    typingTimer = setTimeout(async () => {
      if (val) {
        const payload = getFilterOptionsPayload(val)
        const data = await deviceFilterOptions(URL.filterDeviceTypeOptions, { ...payload, type: [] })
        // console.log(data.list)
      }
    }, 700)
  }

  useEffect(() => {
    setDataLoading(true)
    if (initialRender) {
      ;(async () => {
        const activeCompanyID = localStorage.getItem('companyId')
        const { company_id: allCompanyID } = JSON.parse(localStorage.getItem('loginData')).usersites.filter(site => site.status === 20)[0]

        if (checkUserRole.isSuperAdmin()) {
          const allCompaniesList = await companyList()
          const allSites = []
          if (activeCompanyID === allCompanyID) {
            allCompaniesList.data.data.forEach(comp => comp.sites.forEach(site => allSites.push(site)))
          } else {
            allCompaniesList.data.data.forEach(comp => comp.company_id === activeCompanyID && comp.sites.forEach(site => allSites.push(site)))
          }
          setAllSites(allSites)
          setAllSitesBackup(allSites)
        } else {
          const allSites = []
          const active = userSitesData.getActiveSite()
          if (userSitesData.isActiveSiteAllSite(active)) {
            JSON.parse(localStorage.getItem('loginData')).usersites.forEach(site => site.status !== 20 && allSites.push(site))
          }
          setAllSites(allSites)
          setAllSitesBackup(allSites)
        }
        checkForCompanyAndSiteFilterAvailabilityForAdmin()
        await filterDevicesForData()
        await fetchInitialOptions()
      })()
      setInitialRender(false)
    } else {
      filterDevicesForData()
    }
  }, [page, pageIndex, pageSize, rowsPerPage, brand, model, type, os, siteID, companyID, searched])

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12}>
        <Paper className={classes.paper + ' tableminheight'}>
          <Grid container spacing={2}>
            <Grid item xs={9}></Grid>
            <Grid className='text_r' item xs={3}>
              <TextField
                className={classes.searchInput}
                id='searchDevices'
                fullWidth={true}
                placeholder='Search Devices'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchOutlined color='primary' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment className='pointerCursor' position='end' onClick={e => clearSearch(e)}>
                      {searchString ? <CloseOutlinedIcon color='primary' fontSize='small' /> : ''}
                    </InputAdornment>
                  ),
                }}
                value={searchString}
                onChange={e => setSearchString(e.target.value)}
                onKeyDown={e => handleSearchOnKeyDown(e)}
              />
            </Grid>
            <Grid item xs={10} />
            <Grid item xs={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Fab variant='extended' color='primary' size='small' onClick={() => clearFilters()} disabled={clearFilterButton}>
                <RotateLeftSharpIcon />
                <Typography className={classes.buttonText}>Reset Filter(s)</Typography>
              </Fab>
            </Grid>
            <Grid item xs={12}>
              <Table size='small' stickyHeader={true}>
                <TableHeaders />
                {isDataLoading ? <TableLoader cols={9} /> : _.isEmpty(tableData) ? <EmptyBody /> : <TableBodyData />}
              </Table>
              {!_.isEmpty(tableData) && <PaginationComponent />}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )

  function TableHeaders() {
    return (
      <TableHead>
        <TableRow>
          <TableCell align='left' padding='default'>
            Code
          </TableCell>
          <TableCell align='left' padding='default'>
            Name
          </TableCell>
          <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={type.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
            Type
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={brand.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
            Brand
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={model.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
            Model
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={os.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
            OS
            <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
          </TableCell>
          {companyAndSiteFilter.companyFilter ? (
            <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={companyID.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
              Company
              <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
            </TableCell>
          ) : (
            <TableCell>Company</TableCell>
          )}
          <TableCell align='left' padding='default'>
            Last Sync Time
          </TableCell>
          {companyAndSiteFilter.siteFilter ? (
            <TableCell onClick={() => setFilterForColumn(!filterForColumn)} classes={{ root: classes.headRoot }} style={siteID.length !== 0 ? { background: '#eeeeee' } : { background: '#fafafa' }} align='left' padding='default'>
              Last Sync Facilities
              <FilterListIcon fontSize='small' style={{ marginLeft: '10px' }} />
            </TableCell>
          ) : (
            <TableCell>Last Sync Facilities</TableCell>
          )}
        </TableRow>
        {filterForColumn && (
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                onInputChange={(e, val) => handleTypeFilterInputChange(e, val)}
                loading={isTypeListLoading}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={type}
                id='typeFilter'
                options={allTypes}
                getOptionLabel={option => option}
                name='typeID'
                onChange={(e, val) => handleTypeFilter(e, val)}
                noOptionsText='No types found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Types' name='typeID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                onInputChange={(e, val) => handleBrandFilterInputChange(e, val)}
                loading={brandListLoading}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={brand}
                id='brandFilter'
                options={allBrands}
                getOptionLabel={option => option}
                name='brandID'
                onChange={(e, val) => handleBrandFilter(e, val)}
                noOptionsText='No brands found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Brands' name='brandID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                onInputChange={(e, val) => handleModelFilterInputChange(e, val)}
                loading={modelListLoading}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={model}
                id='modelFilter'
                options={allModels}
                getOptionLabel={option => option}
                name='modelID'
                onChange={(e, val) => handleModelFilter(e, val)}
                noOptionsText='No models found'
                renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Models' name='modelID' />}
              />
            </TableCell>
            <TableCell classes={{ root: classes.headFilter }}>
              <Autocomplete
                size='small'
                ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                onInputChange={(e, val) => handleOSFilterInputChange(e, val)}
                loading={osListLoading}
                classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                multiple
                value={os}
                id='osFilter'
                options={allOS}
                getOptionLabel={option => option}
                name='osID'
                onChange={(e, val) => handleOSFilter(e, val)}
                noOptionsText='No OS found'
                renderInput={params => <TextField {...params} variant='outlined' margin='normal' className='filter-input-disable-lastpass' fullWidth placeholder='Select OS' name='osID' />}
              />
            </TableCell>
            {companyAndSiteFilter.companyFilter ? (
              <TableCell classes={{ root: classes.headFilter }}>
                <Autocomplete
                  size='small'
                  ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                  onInputChange={(e, val) => handleCompanyFilterInputChange(e, val)}
                  loading={companyListLoading}
                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                  multiple
                  value={companyID}
                  id='companyFilter'
                  options={allCompanies}
                  getOptionLabel={option => option.company_name}
                  name='compID'
                  onChange={(e, val) => handleCompanyFilter(e, val)}
                  noOptionsText='No Companies found'
                  renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Company' name='companyID' />}
                />
              </TableCell>
            ) : (
              <TableCell></TableCell>
            )}
            <TableCell></TableCell>
            {companyAndSiteFilter.siteFilter ? (
              <TableCell classes={{ root: classes.headFilter }}>
                <Autocomplete
                  size='small'
                  ListboxProps={{ onScroll: event => scrolledToBottom(event) }}
                  onInputChange={(e, val) => handleSiteFilterInputChange(e, val)}
                  loading={siteListLoading}
                  classes={{ listbox: classes.listbox, inputRoot: classes.inputRoot, loading: classes.LoadingWrapper, noOptions: classes.LoadingWrapper }}
                  multiple
                  value={siteID}
                  id='siteFilter'
                  options={allSites}
                  getOptionLabel={option => option.site_name}
                  name='siteID'
                  onChange={(e, val) => handleSiteFilter(e, val)}
                  noOptionsText='No Facilities found'
                  renderInput={params => <TextField {...params} variant='outlined' className='filter-input-disable-lastpass' margin='normal' fullWidth placeholder='Select Facilities' name='siteID' />}
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

  function EmptyBody() {
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

  function TableBodyData() {
    return (
      <TableBody>
        {tableData.map(row => (
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

  function PaginationComponent() {
    return <TablePagination rowsPerPageOptions={[20, 40, 60, 80, 100]} component='div' count={tableDataSize} rowsPerPage={rowsPerPage} page={page} onChangePage={handleChangePage} onChangeRowsPerPage={handleChangeRowsPerPage} />
  }
}

export default withStyles(styles)(DevicesComponent)
