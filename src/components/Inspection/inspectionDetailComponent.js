import React from 'react'
import { Link } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import $ from 'jquery'
import _ from 'lodash'
import enums from '../../Constants/enums'
import { history } from '../../helpers/history'
import { Toast } from '../../Snackbar/useToast'
import approveInspection from '../../Services/Inspection/approveInspectionService'
import inspectionDetail from '../../Services/Inspection/inspectionDetailService'
import { MinimalInput, MinimalTextArea } from '../Assets/components'
import { OkNotOkAttControl, LRCAttControl } from './localComponents'
import momenttimezone from 'moment-timezone'
import { getApplicationStorageItem } from 'helpers/getStorageItem'

const styles = {
  labelStyle: { fontWeight: 800, color: '#a1a1a1' },
  labelError: { fontWeight: 800, color: 'red' },
  labelEnable: { fontWeight: 800 },
  inputEnable: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1', color: '#a1a1a1' },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

class InspectionDetails extends React.Component {
  constructor() {
    super()
    this.state = {
      managerNotes: '',
      meterHours: null,
      formError: {},
      errorMessage: {},
      loginData: JSON.parse(localStorage.getItem('loginData')),
      tostMsg: {},
      details: {},
    }
  }
  //
  async componentDidMount() {
    $('#pageLoading').show()
    try {
      const details = await inspectionDetail(this.props.inspectionId)
      // console.log(details.data.data)
      this.setState({ details: details.data.data, managerNotes: details.data.data.manager_notes })
    } catch (error) {
      console.log(error)
    }
    $('#pageLoading').hide()
  }
  //
  approveInspection = async () => {
    const requestData = {
      inspection_id: this.state.details.inspection_id,
      asset_id: this.state.details.asset_id,
      manager_id: this.state.loginData.uuid,
      status: enums.inspectionStatus[2].id,
      meter_hours: parseInt(this.state.details.meter_hours),
      manager_notes: this.state.managerNotes,
    }
    // console.log(requestData)
    const formvalid = this.formValidation(this.state.details.meter_hours)
    // console.log(formvalid)
    if (formvalid) {
      $('#pageLoading').show()
      try {
        const res = await approveInspection(requestData)
        if (res.data.success > 0) {
          Toast.success('Checklist approved successfully !')
          history.push('../../inspections')
        } else Toast.error(res.data.message)
      } catch (error) {
        Toast.error('Something went wrong !')
      }
      $('#pageLoading').hide()
    }
  }
  formValidation(meterHours) {
    const { formError, errorMessage } = this.state

    // if (meterHours === '' || meterHours === null) {
    //   formError['meterHours'] = true
    //   errorMessage['meterHours'] = 'Meter hours is required'
    // } else {
    //   delete formError['meterHours']
    //   delete errorMessage['meterHours']
    // }

    if (this.state.details.sites.isManagerNotes === true) {
      if (this.state.managerNotes === '' || this.state.managerNotes === null) {
        formError['managerNotes'] = true
        errorMessage['managerNotes'] = 'Manager note is required !'
        window.scrollTo(0, 0)
      } else {
        delete formError['managerNotes']
        delete errorMessage['managerNotes']
      }
    }

    if (!_.isEmpty(formError)) {
      this.setState({ formError, errorMessage })
      return false
    } else {
      return true
    }
  }
  getDate = (date, tz) => {
    if (!date) return
    const dt = momenttimezone.utc(date).tz(tz).format('MM-DD-YYYY LT')
    return dt
  }

  render() {
    const imageList = _.get(this, 'state.details.image_list.image_names', [])
    const name = _.get(this, 'state.details.asset_name', '')
    const internalID = _.get(this, 'state.details.asset.internal_asset_id', '')
    const meterHours = _.get(this, 'state.details.meter_hours', '')
    const shift = _.get(this, 'state.details.shift', '')
    const requestor = `${_.get(this, 'state.details.operator_firstname', '')} ${_.get(this, 'state.details.operator_lastname', '')}`
    const supervisor = _.get(this, 'state.details.manager_name', '')
    const req_date = _.get(this, 'state.details.datetime_requested', '') ? this.getDate(this.state.details.datetime_requested, this.state.details.sites.timezone) : '-'
    const app_date = _.get(this, 'state.details.approval_date', '') ? this.getDate(this.state.details.approval_date, this.state.details.sites.timezone) : '-'
    const op_notes = _.get(this, 'state.details.operator_notes', '')
    const op_notes_error = this.state.details.is_comment_important ? { error: true, msg: 'Note marked as important !' } : null
    const mgr_notes_error = this.state.formError.managerNotes ? { error: true, msg: 'Manager note is required !!' } : null

    return (
      <Box style={{ padding: '0 20px', background: '#fff' }}>
        <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Checklist Details</div>
          <Box className='inspection-breadcrum'>
            <ul className='bread-crum'>
              <li>
                <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, outline: 'none', background: 'transparent' }}>
                  Checklists
                </button>
              </li>
              <li> {'>'} </li>
              <li>{this.props.inspectionId}</li>
            </ul>
          </Box>
        </Box>
        <Box className='assets-info-container'>
          <div style={{ padding: '18px 24px', background: '#fafafa', borderRadius: '8px', marginBottom: '18px' }}>
            <div className='d-flex flex-row justify-content-between align-items-center' style={{ marginBottom: '14px' }}>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>Asset Info</div>
              <div>
                <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ fontSize: '13px', margin: ' 0 6px' }} component={Link} to={`../../assets/details/${this.state.details.asset_id}`}>
                  Asset Details
                </Button>
                {/* <Button disabled={!imageList.length} variant='contained' color='primary' className='nf-buttons mr-2' disableElevation style={{ fontSize: '13px', margin: '0 6px' }} component={Link} to={'../photo/' + this.props.inspectionId}>
                  {!imageList.length ? 'No Photos' : 'Checklist Photos'}
                  {imageList.length !== 0 && <span style={{ background: 'red', width: '20px', height: ' 20px', fontWeight: 'bolder', textAlign: 'center', borderRadius: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', top: '4px', right: '-20px' }}>{imageList.length}</span>}
                </Button> */}
              </div>
            </div>
            <div className='d-flex'>
              <MinimalInput value={name} label='Asset Name' w={50} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
              <MinimalInput value={internalID} label='Asset #' w={16} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
              {/* <MinimalInput value={meterHours} label='Meter Hours' w={16} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled /> */}
              {/* <MinimalInput value={shift} label='Shift' w={16} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled /> */}
            </div>
            <div className='d-flex'>
              <MinimalInput value={requestor} label='Requestor' w={50} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
              <MinimalInput value={req_date} label='Datetime Requested' w={50} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
            </div>
            <div className='d-flex'>
              <MinimalInput value={supervisor} label='Supervisor' w={50} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
              <MinimalInput value={app_date} label='Approved On' w={50} labelStyles={styles.labelStyle} InputStyles={styles.inputStyle} disabled />
            </div>
            <div className='d-flex'>
              {/* <MinimalTextArea rows={3} value={op_notes} error={op_notes_error} label='Operator Notes' w={50} labelStyles={op_notes_error ? styles.labelError : styles.labelStyle} InputStyles={op_notes_error ? styles.inputError : styles.inputStyle} disabled /> */}
              <MinimalTextArea
                disabled={this.state.details.status !== 8}
                rows={3}
                value={this.state.managerNotes}
                error={mgr_notes_error}
                placeholder='Add manager notes here...'
                label='Manager Notes'
                w={50}
                onFocus={e => this.setState({ formError: _.omit(this.state.formError, 'managerNotes') })}
                onChange={e => this.setState({ managerNotes: e.target.value })}
              />
            </div>
          </div>

          <div style={{ padding: '18px 24px', background: '#fafafa', borderRadius: '8px', marginBottom: '18px' }}>
            {_.get(this, 'state.details.attributes', []).map((attr, key) => (
              <div key={key}>
                <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '14px' }}>{attr.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '32px' }}>
                  {attr.attribute_values.map((val, k) => {
                    if ([0, 1].includes(val.values_type)) return <OkNotOkAttControl key={val.id} label={val.name} value={val.value === 'Ok' ? 'OK' : 'NOT_OK'} />
                    if (val.values_type === 3) return <LRCAttControl key={val.id} label={val.name} value={val.value === 'Left' ? 'LEFT' : val.value === 'Right' ? 'RIGHT' : 'CENTER'} />
                  })}
                </div>
              </div>
            ))}
            {this.state.details.status === 8 && (
              <Button variant='contained' color='primary' className='nf-buttons' disableElevation style={{ fontSize: '13px' }} onClick={this.approveInspection} disabled={getApplicationStorageItem('roleName') === enums.userRoles[4].role}>
                Accept
              </Button>
            )}
          </div>
        </Box>
      </Box>
    )
  }
}

export default InspectionDetails
