import React from 'react'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button'
import { useParams } from 'react-router-dom'
import Checkbox from '@material-ui/core/Checkbox'
import workOrderDetail from '../../Actions/WorkOrder/workOrderDetailAction'
import workOrderCreate from '../../Actions/WorkOrder/workOrderCreateAction'
import { connect } from 'react-redux'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'
import { alert } from '../alertMessage'
import WorkOrderPopup from './workOrderPopup'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/styles'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import truck from '../../Content/images/truck.jpeg'
import validateAssetIdAtcion from '../../Actions/Assets/validateAssetIdAction'
import { Link } from 'react-router-dom'
import { history } from '../../helpers/history'
import noImageAvailable from '../../Content/images/noImageAvailable.png'

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
})
class WorkOrderCreate extends React.Component {
  constructor(props) {
    super(props)
    var logindata = localStorage.getItem('loginData')
    logindata = JSON.parse(logindata)
    this.state = {
      loginData: logindata,
      showPopUp: false,
      title: '',
      priority: '',
      notes: '',
      asseetNo: '',
      isAttachInspection: false,
      formError: {},
      errorMessage: {},
      inspectionDetail: {},
      requestData: {},
    }
    this.createWorkOrder = this.createWorkOrder.bind(this)
    this.handleOnchnage = this.handleOnchnage.bind(this)
    this.handleValidateAssetId = this.handleValidateAssetId.bind(this)
  }
  componentDidMount() {
    if (this.props.parameters.type == '1') {
      this.setState({ inspectionDetail: JSON.parse(localStorage.getItem('inspectionDetail')) })
    }
  }
  createWorkOrder() {
    var loginData = localStorage.getItem('loginData')
    loginData = JSON.parse(loginData)

    var formvalid = this.formValidation(this.state.title, this.state.priority, this.state.notes, this.props.parameters.type != '1' ? this.state.asseetNo : '')
    if (formvalid) {
      var requestData = {
        name: this.state.title,
        description: null,
        notes: this.state.notes,
        status: enums.workOrderStatus[1].id,
        priority: parseInt(this.state.priority),
        internal_asset_id: this.props.parameters.type == '1' ? this.state.inspectionDetail.asset.internal_asset_id : this.state.asseetNo,
        attachtoinspection: this.state.isAttachInspection,
        // "attachtoinspection":(this.props.parameters.type == "1"?true: this.state.isAttachInspection),
        inspection_id: this.props.parameters.type == '1' ? this.state.inspectionDetail.inspection_id : null,
        isapprove: false,
        userid: loginData.uuid,
      }

      if (this.props.parameters.type == '1') {
        this.setState({ showPopUp: true, requestData: requestData })
      } else {
        $('#pageLoading').show()
        this.props.workOrderCreate(requestData, enums.createWorkOrderType[1].id)
      }
    } else {
    }
  }
  handleValidateAssetId(e) {
    if (e.target.value != '' && e.target.value != null) {
      $('#pageLoading').show()
      var urlPrameters = this.state.loginData.uuid + '/' + e.target.value
      this.props.validateAssetId(urlPrameters)
    } else {
      this.setState({ isAttachInspection: false })
    }
  }
  handleOnchnage = e => {
    const { formError, errorMessage } = this.state
    const { name, value } = e.target
    this.setState({ [name]: value })
    if (value != '' || value != null) {
      delete formError[name]
      delete errorMessage[name]
    }
    this.setState({ formError, errorMessage })
    if (name == 'asseetNo') {
      if (value == '' || value == null) {
        this.setState({ isAttachInspection: false })
      }
    }
  }
  handleChkboxChange = e => {
    this.setState({ isAttachInspection: e.target.checked })
  }
  formValidation(title, priority, notes, aasetNo) {
    const { formError, errorMessage } = this.state

    if (title == '' || title == null) {
      formError['title'] = true
      errorMessage['title'] = 'Title is required'
    } else {
      delete formError['title']
      delete errorMessage['title']
    }

    if (priority == '' || priority == null) {
      formError['priority'] = true
      errorMessage['priority'] = 'Please select priority'
    } else {
      delete formError['priority']
      delete errorMessage['priority']
    }

    if (notes == '' || notes == null) {
      formError['notes'] = true
      errorMessage['notes'] = 'Notes is required'
    } else {
      delete formError['notes']
      delete errorMessage['notes']
    }
    if (this.props.parameters.type != '1') {
      if (aasetNo == '' || aasetNo == null) {
        formError['asseetNo'] = true
        errorMessage['asseetNo'] = 'Asset no is required'
      } else {
        delete formError['asseetNo']
        delete errorMessage['asseetNo']
      }
    }

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })

      return false
    } else {
      return true
    }
  }
  closePopUp = () => {
    this.setState({ showPopUp: false })
    this.props.workOrderCreate(this.state.requestData, enums.createWorkOrderType[1].id)
  }
  handleApproveInspectionAndCreateWorkOrder = () => {
    var reqData = this.state.requestData
    reqData.isapprove = true
    reqData['meter_hours'] = this.state.inspectionDetail.meter_hours
    //console.log("request data----------------",reqData);

    $('#pageLoading').show()
    this.props.workOrderCreate(reqData, enums.createWorkOrderType[0].id)
    this.setState({ showPopUp: false })
  }
  handleCancelClick = () => {
    if (this.props.parameters.type == '1') {
      history.push('../../inspections/details/' + this.state.inspectionDetail.inspection_id)
    } else {
      history.push('../../workorders')
    }
  }
  render() {
    //console.log("inspection detail---------------",this.state.inspectionDetail)
    const { formError, errorMessage } = this.state
    const { classes } = this.props

    return (
      <div>
        <Grid className='div_center'>
          <Grid className='row'>
            <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-6'>
              <Grid className='inspection-title bottom-lines'>
                <h5>Issue Info</h5>
              </Grid>
              <Grid className='assets-wrap-container padding-sections'>
                <Grid>
                  <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
                    <Grid className='assets-info-container '>
                      <Grid className='row'>
                        <form>
                          <Grid className='assent-info-form-part1'>
                            <Grid className='row'>
                              <Grid className='col-md-12'>
                                <Grid className='assets-info-devider'>
                                  <TextField
                                    error={formError.title}
                                    variant='outlined'
                                    margin='normal'
                                    fullWidth
                                    id='title'
                                    label='Title'
                                    name='title'
                                    onChange={e => {
                                      this.handleOnchnage(e)
                                    }}
                                    helperText={errorMessage.title}
                                  />
                                </Grid>
                              </Grid>
                              <Grid className='col-md-12'>
                                <div className='drp-priority'>
                                  <Grid className='assets-info-devider'>
                                    <FormControl fullWidth variant='outlined' className={classes.formControl}>
                                      <InputLabel
                                        style={{
                                          background: '#eee',
                                          paddingLeft: '5px',
                                          paddingRight: '5px',
                                        }}
                                        htmlFor='outlined-age-native-simple'
                                        className='input-lbl-drp'
                                      >
                                        Select a Priority{' '}
                                      </InputLabel>
                                      <Select
                                        native
                                        fullWidth
                                        name='priority'
                                        inputProps={{
                                          name: 'priority',
                                          id: 'outlined-age-native-simple',
                                        }}
                                        onChange={e => {
                                          this.handleOnchnage(e)
                                        }}
                                        error={formError.priority}
                                        helperText={errorMessage.priority}
                                      >
                                        <option value=''>Select a Priority</option>
                                        {enums.priority.map((value, key) => {
                                          return (
                                            <option value={value.id} key={key}>
                                              {value.priority}
                                            </option>
                                          )
                                        })}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                </div>
                              </Grid>
                              <Grid className='col-md-12'>
                                <Grid className='assets-info-devider'>
                                  <TextField
                                    variant='outlined'
                                    margin='normal'
                                    fullWidth
                                    id='notes'
                                    label='Notes'
                                    name='notes'
                                    multiline
                                    rows='2'
                                    onChange={e => {
                                      this.handleOnchnage(e)
                                    }}
                                    error={formError.notes}
                                    helperText={errorMessage.notes}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            {this.props.parameters.type == '1' ? (
                              ''
                            ) : (
                              <Grid className='row'>
                                <Grid className='col-md-12'>
                                  <Grid className='assets-info-devider'>
                                    <TextField
                                      variant='outlined'
                                      margin='normal'
                                      fullWidth
                                      id='asset'
                                      label='Asset #'
                                      name='asseetNo'
                                      onChange={e => {
                                        this.handleOnchnage(e)
                                      }}
                                      onBlur={e => this.handleValidateAssetId(e)}
                                      error={formError.asseetNo}
                                      helperText={errorMessage.asseetNo}
                                      autocomplete='off'
                                    />
                                  </Grid>
                                </Grid>
                                <Grid className='col-md-12'>
                                  <Grid className='assets-info-devider tick-pd'>
                                    <Checkbox
                                      style={{ position: 'absolute', marginTop: '-15px', marginLeft: '-10px' }}
                                      id='latestInspection'
                                      name='latestInspection'
                                      color='primary'
                                      value='chkBox'
                                      checked={this.state.isAttachInspection}
                                      disabled={_.get(this, ['props', 'isValidAssetId'], false) && this.state.asseetNo != '' ? false : true}
                                      onChange={e => this.handleChkboxChange(e)}
                                    />
                                    <div style={{ paddingLeft: '30px', marginTop: '-5px' }}>Attach latest inspection to asset</div>
                                  </Grid>
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                          <Grid className='assets-buttons-part'>
                            <Button variant='contained' color='primary' className='assets-bottons txt-normal float_r' style={{ fontSize: '13px' }} onClick={this.createWorkOrder}>
                              Create Issue
                            </Button>
                            <Button variant='contained' color='primary' className='assets-bottons txt-normal float_r' style={{ fontSize: '13px' }} onClick={this.handleCancelClick}>
                              Cancel
                            </Button>
                          </Grid>
                        </form>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {this.props.parameters.type == '1' ? (
              <Grid className='col-md-12 col-lg-12 col-xs-12 col-xl-6'>
                <Grid className='inspection-title bottom-lines'>
                  <h5>Asset Info</h5>
                </Grid>
                <Grid className='assets-wrap-container padding-sections'>
                  <Grid>
                    <Grid className='col-sm-12 col-xs-12 col-lg-12 col-md-12 col-xl-12'>
                      <Grid className='assets-info-container '>
                        <Grid className='row'>
                          <form>
                            <Grid className='assent-info-form-part1'>
                              <Grid className='row'>
                                <Grid className='col-md-10 col-sm-9 col-9'>
                                  <Grid className='assets-info-devider'>
                                    <TextField variant='outlined' margin='normal' fullWidth value={_.get(this.state.inspectionDetail, ['asset', 'name'], '')} id='name' label='Name' name='Name' disabled='true' />
                                  </Grid>
                                </Grid>
                                <Grid className='col-md-2 col-sm-3 col-3'>
                                  <Grid className='assets-info-devider asset-info-img'>
                                    {_.get(this.state.inspectionDetail, ['asset', 'asset_photo'], '') ? (
                                      <Grid className='user-profile'>
                                        <img alt='eG logo' src={_.get(this.state.inspectionDetail, ['asset', 'asset_photo'], '')} style={{ border: '1px solid #212128' }} className='MuiAvatar-img' />
                                      </Grid>
                                    ) : (
                                      <Grid className='user-profile'>
                                        <img alt='eG logo' src={noImageAvailable} style={{ border: '1px solid #212128' }} className='MuiAvatar-img' />
                                      </Grid>
                                    )}
                                  </Grid>
                                </Grid>
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField variant='outlined' margin='normal' fullWidth value={_.get(this.state.inspectionDetail, ['asset', 'internal_asset_id'], '')} id='asset' label='Asset #' name='asset' disabled='true' />
                                  </Grid>
                                </Grid>
                                <Grid className='col-md-6'>
                                  <Grid className='assets-info-devider'>
                                    <TextField variant='outlined' margin='normal' fullWidth value={_.get(this.state.inspectionDetail, ['operator_name'], '')} id='inspection' label='Operator' name='inspection' disabled='true' />
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </form>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              ''
            )}
          </Grid>
        </Grid>
        {this.state.showPopUp ? <WorkOrderPopup ref='workOrderPopUp' closePopUp={this.closePopUp} approveAndCreateWorkOrder={this.handleApproveInspectionAndCreateWorkOrder} /> : ''}
      </div>
    )
  }
}
function mapState(state) {
  //console.log("state----------------",state);
  var isValidAssetId = false

  if (state.ValidateAssetIdReducer) {
    if (state.ValidateAssetIdReducer.isValidAsset) {
      isValidAssetId = state.ValidateAssetIdReducer.isValidAsset
      return { isValidAssetId }
    }
    return { isValidAssetId }
  }
  return state
}

const actionCreators = {
  workOrderDetail: workOrderDetail,
  workOrderCreate: workOrderCreate,
  validateAssetId: validateAssetIdAtcion,
}

WorkOrderCreate.propTypes = {
  classes: PropTypes.object.isRequired,
}
export default connect(mapState, actionCreators)(withStyles(styles)(WorkOrderCreate))
