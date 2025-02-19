import React, { useState } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Toast } from '../../Snackbar/useToast'
import resolveMR from '../../Services/Requests/resolveMR'
import '../Maintainance/maintainance.css'
import _ from 'lodash'
import { MinimalTextArea } from '../Assets/components'
import enums from '../../Constants/enums'
import updateWOCategoryTaskStatus from '../../Services/WorkOrder/updateWOCategoryTaskStatus'

const styles = {
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

function RejectCategoryTask({ open, onClose, woTaskCategoryMappingId, afterSubmit }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  //
  const handleSubmit = () => {
    createRequestBody()
  }
  const createRequestBody = async () => {
    const payload = {
      wOcategorytoTaskMapping_id: woTaskCategoryMappingId,
      status: enums.woTaskStatus.Reject,
      task_rejected_notes: reason,
    }
    // submitData(req)
    // console.log(payload)
    submitData(payload)
  }
  const submitData = async data => {
    setLoading(true)
    try {
      const res = await updateWOCategoryTaskStatus(data)
      if (res.success > 0) Toast.success('Task rejected successfully!')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    closeModal()
    afterSubmit()
  }
  const closeModal = () => {
    setReason('')
    setLoading(false)
    onClose(false)
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Review Notes</div>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div style={{ padding: '16px' }}>
        <MinimalTextArea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder='Please enter review notes here..' w={100} />
      </div>

      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={onClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' disableElevation disabled={loading} style={{ marginLeft: '10px' }} onClick={handleSubmit}>
          {loading ? 'Saving...' : 'Save'}
          {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
      </div>
    </div>
  )
  return (
    <>
      <Modal open={open} onClose={onClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
        {body}
      </Modal>
    </>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '30%',
}

export default RejectCategoryTask
