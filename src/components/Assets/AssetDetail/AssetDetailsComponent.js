import React from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import { AppBar, Box } from '@material-ui/core'
import TextField from '@material-ui/core/TextField'
import InspectionList from './InspectionListComponent'
import WorkOrderList from './workOrderListComponent'
import noImageAvailable from '../../../Content/images/noImageAvailable.png'
import assetDetailAction from '../../../Actions/Assets/assetDetailAction'
import inspectionSearchListAction from '../../../Actions/Search/inspectionSearchByAssetIdAction'
import workOrderSearchListAction from '../../../Actions/Search/workOrderSearchByAssetIdAction'
import inspectionListAction from '../../../Actions/Assets/getInspectionListByAssetIdAction'
import workOrderListAction from '../../../Actions/Assets/getWorkOrderListByAssetIdAction'
import updateMeterHourAction from '../../../Actions/Assets/updateAssetMeterHourAction'
import { connect } from 'react-redux'
import enums from '../../../Constants/enums'
import _ from 'lodash'
import $ from 'jquery'
import { withStyles } from '@material-ui/styles'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import moment from 'moment'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import updateAssetStatusAction from '../../../Actions/Assets/updateAssetStatusAction'
import { history } from '../../../helpers/history'
import assetDetail from '../../../Services/Asset/assetDetailService'

const styles = theme => ({
  root: { paddingTop: '10px', flexGrow: 1 },
  paper: { borderRadius: '8px' },
  goBackButton: { border: 'none', outline: 'none', background: 'transparent' },
  infoTitle: { fontSize: '16px', fontWeight: 500, padding: '16px 18px', borderBottom: '1px solid #EEEEEE' },
  assetImage: { width: '100px', height: '100px', border: '1px solid #d1d1d1', borderRadius: '100px' },
  assetInfoLabel: { fontSize: '12px', fontWeight: 400, marginTop: '8px' },
  assetInfoValue: { color: '#7E7E7E', fontWeight: 500 },
  assetStatusLabel: { fontSize: '14px' },
  activityLog: { borderRadius: '8px', height: '50%', margin: '14px 14px 0 0' },
})
//
var self
var isSearchEnable = false
var isWorkOrderSearchEnable = false
var insepectionSearchString = ''
var workOrderSearchString = ''
class AssetDetails extends React.Component {
  constructor() {
    super()
    self = this

    this.state = {
      loginData: JSON.parse(localStorage.getItem('loginData')),
      selecttab: 'inspections',
      workOrderList: [],
      inspectionList: [],
      inspectionPageSize: 20,
      inspectionPageIndex: 1,
      workorderPageSize: 20,
      workorderPageIndex: 1,
      isInspectionDataNotFound: false,
      isWorkOrderDataNotFound: false,
      inspectionPage: 0,
      inspectionRowsPerPage: 20,
      workorderPage: 0,
      workorderRowsPerPage: 20,
      currentTimeZone: '',
      meterHours: null,
      formError: {},
      errorMessage: {},
      tostMsg: {},
      assetDetails: {},
    }
    this.handleSearchOnKeyDown = this.handleSearchOnKeyDown.bind(this)
    this.handleSearchLoadMore = this.handleSearchLoadMore.bind(this)
    this.handleSearchWorkOrderLoadMore = this.handleSearchWorkOrderLoadMore.bind(this)
    this.handleInspectionlistChangePage = this.handleInspectionlistChangePage.bind(this)
    this.handleInspectionlistChangeRowsPerPage = this.handleInspectionlistChangeRowsPerPage.bind(this)

    this.handleWorkOrderlistChangePage = this.handleWorkOrderlistChangePage.bind(this)
    this.handleWorkOrderlistChangeRowsPerPage = this.handleWorkOrderlistChangeRowsPerPage.bind(this)
    this.handleOnChnage = this.handleOnChnage.bind(this)
    this.clearSearchInspectionList = this.clearSearchInspectionList.bind(this)
    this.clearSearchWorkorderList = this.clearSearchWorkorderList.bind(this)
  }
  async componentDidMount() {
    setTimeout(
      function () {
        isSearchEnable = false
        isWorkOrderSearchEnable = false
        $('#pageLoading').show()
        var loginData = localStorage.getItem('loginData')
        loginData = JSON.parse(loginData)
        var requestData = {
          userid: loginData.uuid,
          barcode_id: this.props.assetId,
        }
        this.props.assetDetail(requestData)
        setTimeout(() => {
          //console.log(this.props)
          //console.log('in comoponent did mount', _.get(this, ['props', 'inspectionList'], []))
          const assetIdParam = _.get(this, ['props', 'assetDetails', 'asset_id'], '').length === 0 ? '' : `${_.get(this, ['props', 'assetDetails', 'asset_id'], '')}/`
          var urlParameters = assetIdParam + this.state.inspectionPageSize + '/' + this.state.inspectionPageIndex
          this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
        }, 3000)
      }.bind(this),
      200
    )

    const assetDetailsData = await assetDetail({ userid: this.state.loginData.uuid, barcode_id: this.props.assetId })
    this.setState({ assetDetails: assetDetailsData.data.data })
    //console.log(assetDetailsData.data.data)

    // get current time zone
    var timez = moment.tz.guess(true)
    timez = timez.replace('/', '-')
    var currenttimestamp = moment().valueOf()
    // var tzAbbrivation = moment.tz.zone(timez).abbr(currenttimestamp)

    // //console.log("timezone---------",timez," ",tzAbbrivation);
    this.setState({ currentTimeZone: timez })
  }

  handleTabSelect(key, assetDetails) {
    this.setState({ selecttab: key })
    this.setState({ workOrderList: assetDetails.workOrders, inspectionPageIndex: 1 })

    if (key == 'inspections') {
      isSearchEnable = true
      isWorkOrderSearchEnable = false
      //console.log('in tab-------', this.props.inspectionList)
      $('#pageLoading').show()
      var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.inspectionPageSize + '/' + this.state.inspectionPageIndex
      this.props.inspectionListAction(urlParameters, 1)
    } else {
      isSearchEnable = false
      isWorkOrderSearchEnable = true
      $('#pageLoading').show()
      var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.workorderPageSize + '/' + this.state.workorderPageIndex
      this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
    }
  }

  handleSearchOnKeyDown = (e, searchString) => {
    searchString = searchString.trim()
    insepectionSearchString = searchString

    if (e.key === 'Enter') {
      if (searchString) {
        this.setState({ inspectionPageIndex: 1, inspectionPage: 0 }, () => {
          isSearchEnable = true
          var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(searchString) + '/' + this.state.currentTimeZone + '/' + this.state.inspectionRowsPerPage + '/' + this.state.inspectionPageIndex
          $('#pageLoading').show()
          this.props.inspectionSearchList(urlParameters, this.state.inspectionPageIndex)
        })
      } else {
        this.setState({ inspectionPageIndex: 1, inspectionPage: 0 }, () => {
          isSearchEnable = true
          var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.inspectionRowsPerPage + '/' + this.state.inspectionPageIndex
          $('#pageLoading').show()
          this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
        })
      }
    }
  }

  handleSearchLoadMore = (e, searchString) => {
    searchString = searchString.trim()
    insepectionSearchString = searchString

    if (searchString) {
      this.setState({ inspectionPageIndex: this.state.inspectionPageIndex + 1 }, () => {
        isSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(searchString) + '/' + this.state.currentTimeZone + '/' + this.state.inspectionPageSize + '/' + this.state.inspectionPageIndex
        if (this.state.isInspectionDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.inspectionSearchList(urlParameters, this.state.inspectionPageIndex)
        }
      })
    } else {
      this.setState({ inspectionPageIndex: this.state.inspectionPageIndex + 1 }, () => {
        isSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.inspectionPageSize + '/' + this.state.inspectionPageIndex
        if (this.state.isInspectionDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
        }
      })
    }
  }

  handleWorkOrderSearchOnKeyDown = (e, searchString) => {
    searchString = searchString.trim()
    workOrderSearchString = searchString

    if (e.key === 'Enter') {
      if (searchString) {
        this.setState({ workorderPageIndex: 1, workorderPage: 0 }, () => {
          isWorkOrderSearchEnable = true
          var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(searchString) + '/' + this.state.workorderRowsPerPage + '/' + this.state.workorderPageIndex
          $('#pageLoading').show()
          this.props.workOrderSearchList(urlParameters, this.state.workorderPageIndex)
        })
      } else {
        this.setState({ workorderPageIndex: 1, workorderPage: 0 }, () => {
          isWorkOrderSearchEnable = true
          var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.workorderRowsPerPage + '/' + this.state.workorderPageIndex
          $('#pageLoading').show()
          this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
        })
      }
    }
  }

  handleSearchWorkOrderLoadMore = (e, searchString) => {
    searchString = searchString.trim()
    workOrderSearchString = searchString

    if (searchString) {
      this.setState({ workorderPageIndex: this.state.workorderPageIndex + 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(searchString) + '/' + this.state.workorderPageSize + '/' + this.state.workorderPageIndex
        if (this.state.isWorkOrderDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.workOrderSearchList(urlParameters, this.state.workorderPageIndex)
        }
      })
    } else {
      this.setState({ workorderPageIndex: this.state.workorderPageIndex + 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.workorderPageSize + '/' + this.state.workorderPageIndex
        if (this.state.isWorkOrderDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
        }
      })
    }
  }
  // InspectionList Pagination Code Start
  handleInspectionlistChangePage = (event, newPage) => {
    this.setState({ inspectionPage: newPage })

    if (insepectionSearchString) {
      this.setState({ inspectionPageIndex: this.state.inspectionPageIndex + 1 }, () => {
        isSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(insepectionSearchString) + '/' + this.state.currentTimeZone + '/' + this.state.inspectionRowsPerPage + '/' + this.state.inspectionPageIndex
        if (this.state.isInspectionDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.inspectionSearchList(urlParameters, this.state.inspectionPageIndex)
        }
      })
    } else {
      this.setState({ inspectionPageIndex: this.state.inspectionPageIndex + 1 }, () => {
        isSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.inspectionRowsPerPage + '/' + this.state.inspectionPageIndex
        if (this.state.isInspectionDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
        }
      })
    }
  }
  handleInspectionlistChangeRowsPerPage = rowPerPage => {
    this.setState({ inspectionRowsPerPage: rowPerPage, inspectionPage: 0 })

    //console.log('rowPerPage', rowPerPage)
    //console.log('this.props.inspectionList.length', this.props.inspectionList.length)

    let totalInspectionListCnt = insepectionSearchString == '' ? _.get(this, ['props', 'assetDetails', 'inspectionlistsize'], '') : _.get(this, ['props', 'totalInspectionListCnt'], '')
    //console.log('totalInspectionListCnt', totalInspectionListCnt)
    if (this.props.inspectionList.length <= rowPerPage) {
      if (this.props.inspectionList.length != totalInspectionListCnt) {
        if (insepectionSearchString) {
          this.setState({ inspectionPageIndex: 1 }, () => {
            isSearchEnable = true
            var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(insepectionSearchString) + '/' + this.state.currentTimeZone + '/' + rowPerPage + '/' + this.state.inspectionPageIndex
            $('#pageLoading').show()
            this.props.inspectionSearchList(urlParameters, this.state.inspectionPageIndex)
          })
        } else {
          this.setState({ inspectionPageIndex: 1 }, () => {
            isSearchEnable = true
            var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + rowPerPage + '/' + this.state.inspectionPageIndex
            $('#pageLoading').show()
            this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
          })
        }
      }
    }
  }
  // InspectionList Pagination Code End

  // WorkOrderList Pagination Code Start
  handleWorkOrderlistChangePage = (event, newPage) => {
    //console.log('handleWorkOrderlistChangePage call------------')
    this.setState({ workorderPage: newPage })
    if (workOrderSearchString) {
      //console.log('in search -----------------')
      this.setState({ workorderPageIndex: this.state.workorderPageIndex + 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(workOrderSearchString) + '/' + this.state.workorderPageSize + '/' + this.state.workorderPageIndex
        if (this.state.isWorkOrderDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.workOrderSearchList(urlParameters, this.state.workorderPageIndex)
        }
      })
    } else {
      //console.log('in else -----------------')
      //console.log('this.state.isWorkOrderDataNotFound-------------------', this.state.isWorkOrderDataNotFound)
      this.setState({ workorderPageIndex: this.state.workorderPageIndex + 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.workorderPageSize + '/' + this.state.workorderPageIndex
        if (this.state.isWorkOrderDataNotFound) {
        } else {
          $('#pageLoading').show()
          this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
        }
      })
    }
  }
  handleWorkOrderlistChangeRowsPerPage = rowPerPage => {
    this.setState({ workorderRowsPerPage: rowPerPage, workorderPage: 0 })

    if (workOrderSearchString) {
      this.setState({ workorderPageIndex: 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + encodeURI(workOrderSearchString) + '/' + rowPerPage + '/' + this.state.workorderPageIndex
        //console.log('urlParameters=============', urlParameters)
        $('#pageLoading').show()
        this.props.workOrderSearchList(urlParameters, this.state.workorderPageIndex)
      })
    } else {
      this.setState({ workorderPageIndex: 1 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + rowPerPage + '/' + this.state.workorderPageIndex
        //console.log('urlParameters=============', urlParameters)
        $('#pageLoading').show()
        this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
      })
    }
  }
  // WorkOrderList Pagination Code End

  handleOnChnage(e) {
    const { formError, errorMessage } = this.state
    const { name, value } = e.target
    this.setState({ [name]: value })
    if (value != '' || value != null) {
      delete formError[name]
      delete errorMessage[name]
    }
    this.setState({ formError, errorMessage })
  }
  formValidation(meterHours) {
    //console.log('meterHours---', meterHours, meterHours == '')
    const { formError, errorMessage } = this.state

    if (meterHours === '') {
      formError['meterHours'] = true
      errorMessage['meterHours'] = 'Meter hours is required'
    } else {
      delete formError['meterHours']
      delete errorMessage['meterHours']
    }

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })
      return false
    } else {
      return true
    }
  }
  UpdateMeterHour = () => {
    var meterHours = this.state.meterHours != null ? this.state.meterHours : _.get(this, ['props', 'assetDetails', 'meter_hours'], '')
    var requestData = {
      asset_id: _.get(this, ['props', 'assetDetails', 'asset_id'], ''),
      meter_hours: parseInt(meterHours),
      requested_by: this.state.loginData.uuid,
    }

    var formvalid = this.formValidation(meterHours)
    //console.log('requestdata---------------', requestData)
    if (formvalid) {
      $('#pageLoading').show()
      this.props.updateMeterHourAction(requestData)
    }
  }

  // Inspection list clear search
  clearSearchInspectionList(e, searchString) {
    searchString = searchString.trim()
    if (searchString) {
      this.setState({ inspectionPageIndex: 1, inspectionPage: 0 }, () => {
        isSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.inspectionRowsPerPage + '/' + this.state.inspectionPageIndex
        $('#pageLoading').show()
        this.props.inspectionListAction(urlParameters, this.state.inspectionPageIndex)
      })
    }
  }

  //  Workorder list clear search
  clearSearchWorkorderList(e, searchString) {
    searchString = searchString.trim()
    if (searchString) {
      this.setState({ workorderPageIndex: 1, workorderPage: 0 }, () => {
        isWorkOrderSearchEnable = true
        var urlParameters = _.get(this, ['props', 'assetDetails', 'asset_id'], '') + '/' + this.state.workorderRowsPerPage + '/' + this.state.workorderPageIndex
        $('#pageLoading').show()
        this.props.workOrderListAction(urlParameters, this.state.workorderPageIndex)
      })
    }
  }

  handleRadioOnChnage = (e, status) => {
    //console.log('radio btn on change ', status)
    this.setState({ status: status })
    var requestdata = {
      asset_id: this.props.assetId,
      status: status,
      updatedby: this.state.loginData.uuid,
    }
    $('#pageLoading').show()
    this.props.updateAssetStatusAction(requestdata)
  }

  render() {
    //console.log('Asset Detail component ...........', this.props)
    const { classes } = this.props
    const { formError, errorMessage } = this.state
    let assetDetails = _.get(this, ['props', 'assetDetails'], {})
    let inspectionsList = _.get(this, ['props', 'inspectionList'], [])
    let workOrderList = _.get(this, ['props', 'workOrderList'], [])
    let totalInspectionListCnt = insepectionSearchString == '' ? _.get(assetDetails, ['inspectionlistsize'], '') : _.get(this, ['props', 'totalInspectionListCnt'], '')
    let status = _.get(this, ['props', 'assetDetails', 'status'], '')
    if (this.state.status) {
      status = this.state.status
    }
    return (
      <div style={{ padding: '0 20px' }}>
        <Grid className='inspection-title'>
          <Grid className='inspection-breadcrum d-flex align-items-center'>
            <button onClick={() => history.goBack()} className={classes.goBackButton}>
              Assets
            </button>
            <div> {'>'} </div>
            <div>{this.state.assetDetails.internal_asset_id}</div>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={4}>
            <Paper elevation={2} className={classes.paper} style={{ marginRight: '14px' }}>
              <div className={classes.infoTitle}># {assetDetails.internal_asset_id} Info</div>
              <div className='p-3'>
                <Grid container>
                  <Grid item xs={3} className='user-profile'>
                    <img alt='eG logo' src={assetDetails.asset_photo ? assetDetails.asset_photo : noImageAvailable} className={classes.assetImage} />
                  </Grid>
                  <Grid item xs={9}>
                    <Grid>
                      <div className={classes.assetInfoLabel}>Name</div>
                      <div className={classes.assetInfoValue}>{assetDetails.name}</div>
                    </Grid>
                    <Grid container>
                      <Grid item xs={4}>
                        <div className={classes.assetInfoLabel}>Make </div>
                        <div className={classes.assetInfoValue}>{assetDetails.product_name}</div>
                      </Grid>
                      <Grid item xs={4}>
                        <div className={classes.assetInfoLabel}>Model </div>
                        <div className={classes.assetInfoValue}>{assetDetails.model_name}</div>
                      </Grid>
                      <Grid item xs={4}>
                        <div className={classes.assetInfoLabel}>Year</div>
                        <div className={classes.assetInfoValue}>{assetDetails.model_year}</div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container className='pt-3'>
                  <Grid item xs={6}>
                    <div className={classes.assetInfoLabel}>Serial # </div>
                    <div className={classes.assetInfoValue}>{assetDetails.asset_serial_number}</div>
                  </Grid>
                  <Grid item xs={6}>
                    <div className={classes.assetInfoLabel}>Site Name </div>
                    <div className={classes.assetInfoValue}>{assetDetails.site_name}</div>
                  </Grid>
                </Grid>
                <RadioGroup row aria-label='position' name='position' defaultValue='top'>
                  <div className='asset-status'>Status</div>
                  <FormControlLabel
                    value='active'
                    control={<Radio color='primary' />}
                    label='Active'
                    classes={{ label: classes.assetStatusLabel }}
                    checked={status === enums.assetStatus[0].id}
                    onChange={e => this.handleRadioOnChnage(e, enums.assetStatus[0].id)}
                    style={{ height: 'auto', marginLeft: 0, marginBottom: 0 }}
                    disabled={localStorage.getItem('roleName') === enums.userRoles[4].role}
                  />
                  <FormControlLabel
                    value='Inactive'
                    control={<Radio color='primary' />}
                    label='Inactive'
                    classes={{ label: classes.assetStatusLabel }}
                    checked={status === enums.assetStatus[1].id}
                    onChange={e => this.handleRadioOnChnage(e, enums.assetStatus[1].id)}
                    style={{ height: 'auto', marginLeft: 0, marginBottom: 0 }}
                    disabled={localStorage.getItem('roleName') === enums.userRoles[4].role}
                  />
                </RadioGroup>
                <Grid className='assets-info-devider mb-0'>
                  <TextField
                    error={formError.meterHours}
                    variant='outlined'
                    margin='normal'
                    fullWidth
                    value={this.state.meterHours !== null ? this.state.meterHours : _.get(assetDetails, ['meter_hours'], '')}
                    id='meterHours'
                    label='Meter Hours'
                    name='meterHours'
                    onChange={e => this.handleOnChnage(e)}
                    helperText={errorMessage.meterHours}
                    disabled={localStorage.getItem('roleName') === enums.userRoles[4].role}
                  />
                </Grid>
                <div className='d-flex flex-row-reverse'>
                  <Button variant='contained' color='primary' className='assets-bottons txt-normal' style={{ fontSize: '12px', borderRadius: '100px' }} onClick={this.UpdateMeterHour} disabled={localStorage.getItem('roleName') === enums.userRoles[4].role}>
                    Save
                  </Button>
                </div>
              </div>
            </Paper>
            <Paper elevation={2} className={classes.activityLog}>
              Activty Log
            </Paper>
          </Grid>
          <Grid item xs={8}>
            <div className='assets-box-wraps customtab'>
              <Paper elevation={2} className={classes.paper} style={{ overflow: 'hidden' }}>
                <AppBar position='static' color='inherit'>
                  <Tabs id='controlled-tab-example' activeKey={this.state.selecttab} onSelect={k => this.handleTabSelect(k, assetDetails)}>
                    <Tab eventKey='inspections' title='Inspection'></Tab>
                    <Tab eventKey='workOrder' title='Issue' workOrderList={this.state.workOrderList} style={{ background: '#e0e0e0' }}></Tab>
                  </Tabs>
                </AppBar>
                <div style={{ height: '82vh' }}>
                  {this.state.selecttab === 'inspections' ? (
                    <InspectionList
                      inspectionList={_.get(this, ['props', 'inspectionList'], [])}
                      assetId={_.get(assetDetails, ['asset_id'], '')}
                      size={totalInspectionListCnt}
                      handleSearchOnKeyDown={this.handleSearchOnKeyDown}
                      handleSearchLoadMore={this.handleSearchLoadMore}
                      isInspectionDataNotFound={this.state.isInspectionDataNotFound}
                      handleInspectionlistChangePage={this.handleInspectionlistChangePage}
                      handleInspectionlistChangeRowsPerPage={this.handleInspectionlistChangeRowsPerPage}
                      inspectionRowPerPage={this.state.inspectionRowsPerPage}
                      inspectionPage={this.state.inspectionPage}
                      clearSearchInspectionList={this.clearSearchInspectionList}
                    />
                  ) : (
                    <WorkOrderList
                      workOrderList={workOrderList}
                      assetId={this.props.asset_id}
                      size={_.get(this, ['props', 'totalWorkOrderListCnt'], '')}
                      handleWorkOrderSearchOnKeyDown={this.handleWorkOrderSearchOnKeyDown}
                      handleSearchWorkOrderLoadMore={this.handleSearchWorkOrderLoadMore}
                      isWorkOrderDataNotFound={this.state.isWorkOrderDataNotFound}
                      handleWorkOrderlistChangePage={this.handleWorkOrderlistChangePage}
                      handleWorkOrderlistChangeRowsPerPage={this.handleWorkOrderlistChangeRowsPerPage}
                      workorderRowsPerPage={this.state.workorderRowsPerPage}
                      workorderPage={this.state.workorderPage}
                      clearSearchWorkorderList={this.clearSearchWorkorderList}
                    />
                  )}
                </div>
              </Paper>
            </div>
          </Grid>
        </Grid>
        {/* <Grid className='assets-wrap-container'>
          <Grid className='row'>
            <Grid className='col-sm-12 col-xs-12 col-md-12 col-xl-5 col-xs-12 assettable'>
              <Grid className='assets-info-container '>
                <Grid className='row'>
                  <form>
                    <Grid className='assets-info-title'>
                      <h4>Asset Info</h4>
                    </Grid>
                    <Grid className='assent-info-form-part1'>
                      <Grid className='row'>
                        <Grid className='col-md-8 order-2'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['name'], '')} id='name' label='Name' disabled='true' multiline />
                          </Grid>
                          <Grid className='assets-info-devider mb-0'>
                            <RadioGroup row aria-label='position' name='position' defaultValue='top'>
                              <div className='asset-status'>Status</div>
                              <FormControlLabel value='active' control={<Radio color='primary' />} label='Active' checked={status == enums.assetStatus[0].id ? true : false} onChange={e => this.handleRadioOnChnage(e, enums.assetStatus[0].id)} style={{ height: 'auto', marginLeft: 0, marginBottom: 0 }} disabled={localStorage.getItem('roleName') === enums.userRoles[4].role} />
                              <FormControlLabel value='Inactive' control={<Radio color='primary' />} label='Inactive' checked={status == enums.assetStatus[1].id ? true : false} onChange={e => this.handleRadioOnChnage(e, enums.assetStatus[1].id)} style={{ height: 'auto', marginLeft: 0, marginBottom: 0 }} disabled={localStorage.getItem('roleName') === enums.userRoles[4].role} />
                            </RadioGroup>
                          </Grid>
                        </Grid>
                        <Grid className='col-md-4 order-1'>
                          {_.get(assetDetails, ['asset_photo'], '') ? (
                            <Grid className='user-profile'>
                              <img alt='eG logo' src={_.get(assetDetails, ['asset_photo'], '')} style={{ width: '140px', height: '140px', border: '1px solid #212128' }} className='MuiAvatar-img' />
                            </Grid>
                          ) : (
                            <Grid className='user-profile'>
                              <img alt='eG logo' src={noImageAvailable} style={{ width: '140px', height: '140px', border: '1px solid #212128' }} className='MuiAvatar-img' />
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                      <Grid className='row'>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['internal_asset_id'], '')} id='internalAssetId' label='#' name='internalAssetId' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['asset_type'], '')} id='objectType' label='Object Type' name='objectType' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['product_name'], '')} id='product' label='Product' name='product' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['model_name'], '')} id='model' label='Model' name='model' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['asset_serial_number'], '')} id='serialnumber' label='Serial Number' name='serialNumber' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['model_year'], '')} id='modelYear' label='Model Year' name='modelYear' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['site_name'], '')} id='functionalLocation' label='Site Name' name='functionalLocation' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField variant='outlined' margin='normal' fullWidth value={_.get(assetDetails, ['current_stage'], '')} id='currentStage' label='Current stage' name='currentStage' disabled='true' />
                          </Grid>
                        </Grid>
                        <Grid className='col-md-12'>
                          <Grid className='assets-info-devider mb-0'>
                            <TextField error={formError.meterHours} variant='outlined' margin='normal' fullWidth value={this.state.meterHours != null ? this.state.meterHours : _.get(assetDetails, ['meter_hours'], '')} id='meterHours' label='Meter Hours' name='meterHours' onChange={e => this.handleOnChnage(e)} helperText={errorMessage.meterHours} disabled={localStorage.getItem('roleName') === enums.userRoles[4].role} />
                          </Grid>
                        </Grid>
                        <Box className='assets-buttons-part ' style={{ margin: '30px 165px' }}>
                          <Button variant='contained' color='primary' className='assets-bottons txt-normal' style={{ fontSize: '13px' }} onClick={this.UpdateMeterHour} disabled={localStorage.getItem('roleName') === enums.userRoles[4].role}>
                            Save
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Grid>
            </Grid>
            <Grid className='col-sm-12 col-xs-12 col-md-12 col-xl-7 col-xs-12 mangepadding'>
              <Grid className='assets-box-wraps customtab'>
                <Paper>
                  <AppBar position='static' color='inherit'>
                    <Tabs id='controlled-tab-example' activeKey={this.state.selecttab} onSelect={k => this.handleTabSelect(k, assetDetails)}>
                      <Tab eventKey='inspections' title='Inspection'></Tab>
                      <Tab eventKey='workOrder' title='Issue' workOrderList={this.state.workOrderList} style={{ background: '#e0e0e0' }}></Tab>
                    </Tabs>
                  </AppBar>
                  {this.state.selecttab == 'inspections' ? <InspectionList inspectionList={_.get(this, ['props', 'inspectionList'], [])} assetId={_.get(assetDetails, ['asset_id'], '')} size={totalInspectionListCnt} handleSearchOnKeyDown={this.handleSearchOnKeyDown} handleSearchLoadMore={this.handleSearchLoadMore} isInspectionDataNotFound={this.state.isInspectionDataNotFound} handleInspectionlistChangePage={this.handleInspectionlistChangePage} handleInspectionlistChangeRowsPerPage={this.handleInspectionlistChangeRowsPerPage} inspectionRowPerPage={this.state.inspectionRowsPerPage} inspectionPage={this.state.inspectionPage} clearSearchInspectionList={this.clearSearchInspectionList} /> : <WorkOrderList workOrderList={workOrderList} assetId={this.props.asset_id} size={_.get(this, ['props', 'totalWorkOrderListCnt'], '')} handleWorkOrderSearchOnKeyDown={this.handleWorkOrderSearchOnKeyDown} handleSearchWorkOrderLoadMore={this.handleSearchWorkOrderLoadMore} isWorkOrderDataNotFound={this.state.isWorkOrderDataNotFound} handleWorkOrderlistChangePage={this.handleWorkOrderlistChangePage} handleWorkOrderlistChangeRowsPerPage={this.handleWorkOrderlistChangeRowsPerPage} workorderRowsPerPage={this.state.workorderRowsPerPage} workorderPage={this.state.workorderPage} clearSearchWorkorderList={this.clearSearchWorkorderList} />}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid> */}
      </div>
    )
  }
}

function mapState(state) {
  if (self) {
    if (!_.isEmpty(state.assetDetailReducer.tostMsg)) {
      self.setState({ tostMsg: state.assetDetailReducer.tostMsg })
    }
  }
  if (state.assetDetailReducer && !isSearchEnable && !isWorkOrderSearchEnable) {
    //console.log('if 1-')
    //console.log(state.assetDetailReducer)
    if (self) {
      if (!_.isEmpty(state.assetDetailReducer.tostMsg)) {
        self.setState({ tostMsg: state.assetDetailReducer.tostMsg })
      }
    }
    return {
      assetDetails: state.assetDetailReducer.assetDetail,
      inspectionList: state.assetDetailReducer.inspectionList,
      workOrderList: state.assetDetailReducer.workOrderList,
      tostMsg: state.assetDetailReducer.tostMsg,
    }
  } else if (state.assetInspectionListReducer && isSearchEnable) {
    if (self) {
      self.setState({ isInspectionDataNotFound: state.assetInspectionListReducer.isDataNoFound })
      //console.log('if 2')
      //console.log(state.assetInspectionListReducer)

      if (!_.isEmpty(state.assetInspectionListReducer.tostMsg)) {
        // self.setState({tostMsg:state.assetInspectionListReducer.tostMsg})
      }
      return {
        assetDetails: state.assetDetailReducer.assetDetail,
        inspectionList: state.assetInspectionListReducer.inspectionList,
        totalInspectionListCnt: state.assetInspectionListReducer.totalInspectionListCnt,
      }
    }
  } else if (state.assetWorkOrderListReducer && isWorkOrderSearchEnable) {
    //console.log('if 3--')
    //console.log(state.assetWorkOrderListReducer)
    if (self) {
      self.setState({ isWorkOrderDataNotFound: state.assetWorkOrderListReducer.isDataNoFound })

      if (!_.isEmpty(state.assetWorkOrderListReducer.tostMsg)) {
        // self.setState({tostMsg:state.assetWorkOrderListReducer.tostMsg})
      }

      return {
        assetDetails: state.assetDetailReducer.assetDetail,
        workOrderList: state.assetWorkOrderListReducer.workOrderList,
        totalWorkOrderListCnt: state.assetWorkOrderListReducer.totalWorkOrderListCnt,
      }
    }
  }

  return state
}

const actionCreators = {
  assetDetail: assetDetailAction,
  inspectionSearchList: inspectionSearchListAction,
  workOrderSearchList: workOrderSearchListAction,
  inspectionListAction: inspectionListAction,
  workOrderListAction: workOrderListAction,
  updateMeterHourAction: updateMeterHourAction,
  updateAssetStatusAction: updateAssetStatusAction,
}
export default connect(mapState, actionCreators)(withStyles(styles)(AssetDetails))
