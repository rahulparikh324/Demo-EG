import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import enums from '../../Constants/enums'
import { alert } from '../alertMessage'
import $ from 'jquery'
import workOrderCreate from '../../Actions/WorkOrder/workOrderCreateAction'
class WorkOrderPopup extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {}
  closeModal = () => {
    this.props.closePopUp()
  }

  Approve = () => {
    this.props.approveAndCreateWorkOrder()
  }
  render() {
    return (
      <Grid>
        <div id='workOrderModal' className='modal' style={{ display: 'block' }}>
          {/* <!-- Modal content --> */}
          <div className='modal-content'>
            <div className='modal-header'>
              <span className='close' onClick={this.closeModal}>
                &times;
              </span>
              <div className='modallheader'>Create Issue</div>
            </div>
            <div className='modal-body'>
              <h5>Would you still like to approve the inspection.</h5>
            </div>
            <div className='modal-footer'>
              <Grid className='assets-buttons-part float_r'>
                <Button variant='contained' color='primary' className='assets-bottons float_r' style={{ marginRight: '10px', fontSize: '12px' }} onClick={this.Approve}>
                  Approve
                </Button>
              </Grid>
              <Grid className='assets-buttons-part float_r'>
                <Button variant='contained' color='primary' className='assets-bottons float_r' style={{ marginRight: '10px', fontSize: '12px' }} onClick={this.closeModal}>
                  Cancel
                </Button>
              </Grid>
            </div>
          </div>
        </div>
      </Grid>
    )
  }
}
export default WorkOrderPopup
