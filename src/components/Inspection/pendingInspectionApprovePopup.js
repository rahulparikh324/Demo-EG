import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import enums from '../../Constants/enums'
import { alert } from '../alertMessage'
import $ from 'jquery'

class PendingInspectionApprovePopup extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {}
  closeModal = () => {
    this.props.closePopUp()
  }

  handleOkBtn = () => {
    this.props.closePopUp()
  }

  render() {
    return (
      <Grid>
        <div id='workOrderModal' className='modal' style={{ display: 'block' }}>
          {/* <!-- Modal content --> */}
          <div className='modal-content inspection-modal'>
            <div className='modal-header'>
              {/* <span className="close" onClick={this.closeModal}>&times;</span> */}
              <div className='modallheader'>Pending Inspection</div>
            </div>
            <div className='modal-body'>
              <p style={{ fontSize: '16px' }}>{enums.resMessages.pendingInspectionApprove}</p>
              <Grid className='assets-buttons-part text_c'>
                <Button variant='contained' color='primary' className='assets-bottons ' style={{ marginRight: '10px', fontSize: '12px' }} onClick={this.handleOkBtn}>
                  Ok
                </Button>
              </Grid>
            </div>
          </div>
        </div>
      </Grid>
    )
  }
}
export default PendingInspectionApprovePopup
