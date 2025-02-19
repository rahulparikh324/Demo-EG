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

const styles = {
  labelStyle: { fontWeight: 800 },
  inputStyle: { background: 'none', padding: '10px 16px', border: '1px solid #a1a1a1' },
  labelError: { color: 'red', fontWeight: 800 },
  inputError: { background: '#ff000021', padding: '10px 16px', border: '1px solid red', color: 'red', marginBottom: '-5px' },
}

function ResolveIssue({ open, onClose, resolveObj, afterSubmit }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  //
  const handleSubmit = () => {
    if (_.isEmpty(reason.trim())) {
      setError({ error: true, msg: 'Reason is required !' })
    } else createRequestBody()
  }
  const createRequestBody = async () => {
    const req = {
      mr_id: resolveObj.mr_id,
      resolve_reason: reason,
    }
    setLoading(true)
    submitData(req)
  }
  const submitData = async data => {
    try {
      const res = await resolveMR(data)
      if (res.success > 0) Toast.success('Request resolved successfully !')
      else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setLoading(false)
    closeForm()
    afterSubmit()
  }
  const closeForm = () => {
    setReason('')
    setLoading(false)
    onClose(false)
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Resolve Issue</div>
        <IconButton onClick={onClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div style={{ padding: '16px' }}>
        <MinimalTextArea
          //
          onFocus={e => setError(null)}
          rows={3}
          value={reason}
          error={error}
          onChange={e => setReason(e.target.value)}
          placeholder='Add Reason ..'
          label='Add the reason below to resolve this issue'
          w={100}
          labelStyles={error ? styles.labelError : styles.labelStyle}
          InputStyles={error ? styles.inputError : styles.inputStyle}
        />
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

export default ResolveIssue
