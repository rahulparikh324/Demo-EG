import React from 'react'
import Grid from '@material-ui/core/Grid'
import Modal from 'react-modal'
import Button from '@material-ui/core/Button'
import enums from '../../Constants/enums'
import { alert } from '../alertMessage'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}
class WorkOrderPopup extends React.Component {
  constructor() {
    super()

    this.state = {
      modalIsOpen: false,
    }

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }
  componentDidMount() {
    this.setState({
      modalIsOpen: this.props.showModel,
    })
  }

  openModal() {
    this.setState({ modalIsOpen: true })
  }
  closeModal() {
    this.setState({ modalIsOpen: false })
    window.location.replace('../../workorders')
  }
  Approve() {
    alert.successMessage(enums.resMessages.ApproveInspection)
    setTimeout(() => {
      window.location.replace('../../inspections')
    }, 1000)
  }
  render() {
    return (
      <div>
        <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} style={customStyles} contentLabel='Example Modal'>
          <h5>Would you still like to approve the inspection.</h5>
          <Button variant='contained' color='primary' className='assets-bottons float_r' style={{ marginRight: '10px', fontSize: '12px' }} onClick={this.Approve}>
            Approve
          </Button>
          <Button variant='contained' color='primary' className='assets-bottons float_r' style={{ marginRight: '10px', fontSize: '12px' }} onClick={this.closeModal}>
            Cancel
          </Button>
        </Modal>
      </div>
    )
  }
}
export default WorkOrderPopup
