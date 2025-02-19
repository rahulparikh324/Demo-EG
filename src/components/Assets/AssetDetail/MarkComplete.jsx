import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import $ from 'jquery'
import markComplete from '../../../Services/Asset/markComplete'
import { history } from '../../../helpers/history'

function MarkComplete({ open, handleClose, obj, setToastMsg, afterSubmit, isFromList }) {
  const [dueDate, setDueDate] = useState(new Date())
  const [compAt, setCompAt] = useState(0)
  const [compHrs, setCompHrs] = useState(0)
  const [compMins, setCompMins] = useState(0)
  const [comment, setComment] = useState('')
  //
  useEffect(() => {
    // console.log(obj)
    setCompHrs(obj.active_PMTrigger.total_est_time_hours)
    setCompMins(obj.active_PMTrigger.total_est_time_minutes)
  }, [])
  //
  const closeFunction = () => {
    handleClose()
    if (isFromList) history.push({ pathname: `../../preventative-maintenance-list` })
  }
  //
  const markAsComplete = async () => {
    const req = {
      pm_trigger_id: obj.active_PMTrigger.pm_trigger_id,
      asset_pm_id: obj.asset_pm_id,
      comments: comment,
      completed_on: dueDate.toISOString().split('T')[0],
      completed_at_meter_hours: Number(compAt),
      completed_in_hours: Number(compHrs),
      completed_in_minutes: Number(compMins),
    }
    // console.log(req)
    closeFunction()
    $('#pageLoading').show()
    try {
      const res = await markComplete(req)
      // console.log(res)
      if (res.success > 0) setToastMsg.success('PM marked as completed')
      else setToastMsg.error(res.message)
      afterSubmit()
    } catch (error) {
      console.log(error)
      setToastMsg.error(error)
    }
    $('#pageLoading').hide()
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>{obj.title}</span>
        <IconButton aria-label='close' size='small' onClick={closeFunction}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className='content-bar create-content' style={{ height: '300px' }}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker margin='normal' inputVariant='outlined' label='Completed On' format='MM/dd/yyyy' value={dueDate} onChange={setDueDate} KeyboardButtonProps={{ 'aria-label': 'change date' }} TextFieldComponent={props => <TextField {...props} />} className='date-picker-schedule' />
        </MuiPickersUtilsProvider>
        <TextField label='Completed at' value={compAt} onChange={e => setCompAt(e.target.value)} variant='outlined' InputProps={{ inputProps: { min: 0 } }} placeholder='500' type='number' />
        <TextField label='Completed In' value={compHrs} onChange={e => setCompHrs(e.target.value)} variant='outlined' InputProps={{ inputProps: { min: 0 } }} type='number' placeholder='1 Hours' />
        <TextField label='Minutes' value={compMins} onChange={e => setCompMins(e.target.value)} variant='outlined' InputProps={{ inputProps: { min: 0, max: 59 } }} type='number' placeholder='Minutes' />
        <TextField label='Comment' value={comment} onChange={e => setComment(e.target.value)} variant='outlined' placeholder='Add comment' multiline rows={4} style={{ gridColumn: '1/3' }} />
      </div>
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={closeFunction}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' disableElevation onClick={markAsComplete}>
          Mark Completed
        </Button>
      </div>
    </div>
  )
  return (
    <Modal open={open} onClose={closeFunction} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      {body}
    </Modal>
  )
}
//
const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '30%',
}

export default MarkComplete
