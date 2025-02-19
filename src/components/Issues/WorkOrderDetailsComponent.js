import React from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import updateWorkorder from '../../Services/WorkOrder/workOrderUpdateService'
import { Toast } from '../../Snackbar/useToast'
import $ from 'jquery'
import enums from '../../Constants/enums'
import { Link } from 'react-router-dom'
import momenttimezone from 'moment-timezone'
import { history } from '../../helpers/history'
import getUserRole from '../../helpers/getUserRole'
import workorderDetail from '../../Services/WorkOrder/workOrderDetailService'
import { MinimalInput, MinimalTextArea, MinimalAutoComplete } from '../Assets/components'
import * as yup from 'yup'
import { validateSchema } from '../../helpers/schemaValidation'
import _ from 'lodash'
import { MinimalButton } from 'components/common/buttons'

const _styles = {
  labelStyle: { fontWeight: 800, color: '#a1a1a1' },
  labelError: { fontWeight: 800, color: 'red' },
  labelEnable: { fontWeight: 800 },
  inputEnable: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1', color: '#000' },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1', color: '#a1a1a1' },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

class WorkOrderDetails extends React.Component {
  constructor() {
    super()
    var loginData = localStorage.getItem('loginData')
    this.checkUserRole = new getUserRole()
    this.state = {
      loginData: JSON.parse(loginData),
      title: '',
      notes: '',
      priority: null,
      priorityOpts: enums.priority.map(pr => ({ ...pr, label: pr.priority, value: pr.id })),
      status: null,
      statusOpts: enums.workOrderStatus.map(pr => ({ ...pr, label: pr.status, value: pr.id })),
      formError: {},
      workOrderDetail: {},
    }
  }

  async componentDidMount() {
    $('#pageLoading').show()
    try {
      const res = await workorderDetail(this.state.loginData.uuid, this.props.parameters.workOrderId)
      const workOrderDetail = res.data.data
      const priority = this.state.priorityOpts.find(p => p.id === workOrderDetail.priority)
      const status = this.state.statusOpts.find(p => p.id === workOrderDetail.status)
      this.setState({ workOrderDetail, title: workOrderDetail.name, priority, status, notes: workOrderDetail.notes || '' })
      // console.log(workOrderDetail)
      $('#pageLoading').hide()
    } catch (error) {
      console.log(error)
      $('#pageLoading').hide()
      Toast.error('Something went wrong !')
    }
  }

  async formValidation() {
    const schema = yup.object().shape({
      title: yup.string().required('Title is required !'),
      priority: yup.number().required('Priority is required !'),
      status: yup.number().required('Status is required !'),
    })
    const payload = {
      title: this.state.title,
      priority: this.state.priority.id,
      status: this.state.status.id,
    }
    const isValid = await validateSchema(payload, schema)
    this.setState({ formError: isValid })
    if (isValid === true) this.submitData(payload)
  }

  submitData = async () => {
    const requestData = {
      issue_uuid: this.state.workOrderDetail.issue_uuid,
      title: this.state.title,
      notes: this.state.notes,
      priority: parseInt(this.state.priority.id),
      status: parseInt(this.state.status.id),
      userid: this.state.loginData.uuid,
      updated_at: momenttimezone.utc().tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm:ss'),
    }
    $('#pageLoading').show()
    try {
      const res = await updateWorkorder(requestData)
      if (res.data.success > 0) Toast.success('Issue updated successfully !')
      else Toast.error(res.data.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    $('#pageLoading').hide()
  }

  render() {
    const isDisabled = this.state.workOrderDetail.status === 15 || this.checkUserRole.isExecutive()
    //
    return (
      <div style={{ padding: '0 20px', background: '#fff', height: '92vh' }}>
        <Box className='inspection-title bottom-lines' style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>Issue Details</div>
          <Box className='inspection-breadcrum'>
            <ul className='bread-crum'>
              <li>
                <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, outline: 'none', background: 'transparent' }}>
                  Issue
                </button>
              </li>
              <li> {'>'} </li>
              <li>{this.props.parameters.workOrderId}</li>
            </ul>
          </Box>
        </Box>

        <Box className='assets-info-container'>
          <div>
            <div className='d-flex'>
              <div style={{ width: '50%', padding: '18px 24px', background: '#fafafa', borderRadius: '8px' }}>
                <MinimalInput
                  placeholder='Add title'
                  onFocus={e => this.setState({ formError: {} })}
                  error={this.state.formError.title}
                  value={this.state.title}
                  onChange={v => this.setState({ title: v })}
                  label='Issue Title'
                  w={100}
                  labelStyles={isDisabled ? _styles.labelStyle : _styles.labelEnable}
                  InputStyles={isDisabled ? _styles.inputStyle : _styles.inputEnable}
                  disabled={isDisabled}
                />
                <MinimalAutoComplete
                  value={this.state.priority}
                  onChange={v => this.setState({ priority: v })}
                  options={this.state.priorityOpts}
                  label='Select Priority'
                  w={100}
                  labelStyles={isDisabled ? _styles.labelStyle : _styles.labelEnable}
                  inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }}
                  errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }}
                  isDisabled={isDisabled}
                />
                <MinimalAutoComplete
                  value={this.state.status}
                  onChange={v => this.setState({ status: v })}
                  options={this.state.statusOpts}
                  label='Select Status'
                  w={100}
                  labelStyles={isDisabled ? _styles.labelStyle : _styles.labelEnable}
                  inputStyles={{ background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }}
                  errorStyles={{ background: '#ff000021', border: '1px solid red', color: 'red' }}
                  isDisabled={isDisabled}
                />
                <MinimalInput value={this.state.workOrderDetail.internal_asset_id || ''} label='Asset No' w={100} labelStyles={_styles.labelStyle} InputStyles={_styles.inputStyle} disabled />
                <MinimalTextArea
                  rows={3}
                  value={this.state.notes}
                  placeholder='Add your notes here...'
                  label='Notes'
                  w={100}
                  labelStyles={this.state.formError.notes ? _styles.labelError : isDisabled ? _styles.labelStyle : _styles.labelEnable}
                  InputStyles={this.state.formError.notes ? _styles.inputError : isDisabled ? _styles.inputStyle : _styles.inputEnable}
                  onChange={e => this.setState({ notes: e.target.value })}
                  disabled={isDisabled}
                />
                <div className='d-flex'>
                  <MinimalButton text='Update Issue' variant='contained' color='primary' baseClassName='mr-2' style={{ fontSize: '13px', width: '32%' }} onClick={() => this.formValidation()} disabled={this.state.workOrderDetail.status === 15 || this.checkUserRole.isExecutive()} />
                  <MinimalButton text='Asset Details' variant='contained' color='primary' style={{ fontSize: '13px', width: '32%' }} onClick={() => history.push(`../../assets/details/${this.state.workOrderDetail.asset_id}`)} />
                </div>
              </div>
              <div style={{ width: '50%', padding: '18px 24px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800 }}>Comments</div>
                <div>
                  {_.isEmpty(this.state.workOrderDetail.comments) ? (
                    <div className='d-flex justify-content-center align-items-center bg-white' style={{ fontWeight: 800, fontSize: '12px', height: '75px', borderRadius: '4px' }}>
                      No comments to show !
                    </div>
                  ) : (
                    this.state.workOrderDetail.comments.map((comment, key) => (
                      <div key={key} style={{ background: '#fff', borderRadius: '4px', padding: '10px' }}>
                        <div className='d-flex align-items-center justify-content-between'>
                          <div>
                            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'>
                              <path fill='none' d='M0 0h24v24H0z' />
                              <path d='M10 3h4a8 8 0 1 1 0 16v3.5c-5-2-12-5-12-11.5a8 8 0 0 1 8-8zm2 14h2a6 6 0 1 0 0-12h-4a6 6 0 0 0-6 6c0 3.61 2.462 5.966 8 8.48V17z' />
                            </svg>
                            <span style={{ marginLeft: '10px', fontWeight: 800, fontSize: '14px' }}>{comment.created_by_name}</span>
                          </div>
                          <div style={{ marginLeft: '34px', fontSize: '12px' }}>{momenttimezone.utc(comment.created_at).tz(this.state.workOrderDetail.timezone).format('MM-DD-YYYY LT')}</div>
                        </div>
                        <div style={{ marginLeft: '34px', fontSize: '12px' }}>{comment.comment}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </div>
    )
  }
}

export default WorkOrderDetails
