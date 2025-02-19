import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import addUpdateTask from '../../Services/Maintainance/addUpdateTask.service'
import { Toast } from '../../Snackbar/useToast'
import CircularProgress from '@material-ui/core/CircularProgress'
import _ from 'lodash'

function CreateNewTaskModal({ open, handleClose, prevClose, prevTask, addTask, editObj }) {
  //
  const [titleError, setTitleError] = useState({ error: false, msg: '' })
  const [hourError, setHourError] = useState({ error: false, msg: '' })
  const [minError, setMinError] = useState({ error: false, msg: '' })
  const [title, setTitle] = useState('')
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)
  //
  useEffect(() => {
    if (!_.isEmpty(editObj)) {
      setTitle(editObj.task_title)
      setHours(editObj.task_est_hours)
      setMins(editObj.task_est_minutes)
    }
  }, [])
  //
  const validation = createAndAdd => {
    if (title.length !== 0 && hours.length !== 0 && mins.length !== 0 && Number(mins) < 60) {
      setTitleError({ error: false, msg: '' })
      createTask(createAndAdd)
    } else {
      if (title.length === 0) setTitleError({ error: true, msg: 'Title is required' })
      else setTitleError({ error: false, msg: '' })
      if (hours.length === 0) setHourError({ error: true, msg: 'Hours are required' })
      else setHourError({ error: false, msg: '' })
      if (mins.length === 0) setMinError({ error: true, msg: 'Minutes are required' })
      else setMinError({ error: false, msg: '' })
      if (Number(mins) > 59) setMinError({ error: true, msg: 'Minutes can not be more than 59' })
      else setMinError({ error: false, msg: '' })
    }
  }
  //
  const createTask = async createAndAdd => {
    createAndAdd ? setLoading2(true) : setLoading(true)
    try {
      const reqData = _.isEmpty(editObj) ? { task_title: title, task_est_minutes: Number(mins), task_est_hours: Number(hours) } : { task_title: title, task_est_minutes: Number(mins), task_est_hours: Number(hours), task_id: editObj.task_id }
      const res = await addUpdateTask(reqData)
      if (res.success > 0) {
        Toast.success(_.isEmpty(editObj) ? 'New Task created !' : 'Task Updated !')
        createAndAdd ? addToTasks(res.data) : handleClose()
      }
    } catch (error) {
      Toast.error('Something went wrong !')
      handleClose()
    }
    createAndAdd ? setLoading2(false) : setLoading(false)
  }
  //
  const addToTasks = task => {
    task.status = 12
    task.time_spent_hours = 0
    task.time_spent_minutes = 0
    task.hourly_rate = 0
    // console.log('created data', task)
    addTask([...prevTask, task])
    prevClose()
  }
  //
  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>{_.isEmpty(editObj) ? 'Create Task' : 'Update Task'} </div>
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div className='content-bar create-content'>
        <TextField value={title} onChange={e => setTitle(e.target.value)} onFocus={() => setTitleError({ error: false, msg: '' })} error={titleError.error} helperText={titleError.msg} label='Title' variant='outlined' placeholder='Title' style={{ gridColumn: '1/3' }} />
        <TextField value={hours} onChange={e => setHours(e.target.value)} onFocus={() => setHourError({ error: false, msg: '' })} error={hourError.error} helperText={hourError.msg} label='Hours' variant='outlined' placeholder='Hours' type='number' InputProps={{ inputProps: { min: 0 } }} />
        <TextField value={mins} onChange={e => setMins(e.target.value)} onFocus={() => setMinError({ error: false, msg: '' })} error={minError.error} helperText={minError.msg} label='Minutes' variant='outlined' placeholder='Minutes' type='number' InputProps={{ inputProps: { min: 0, max: 59 } }} />
      </div>
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons mr-2' disableElevation style={{ marginLeft: '10px' }} onClick={() => validation(false)} disabled={loading}>
          {_.isEmpty(editObj) ? 'Create' : 'Update'} {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
        </Button>
        {_.isEmpty(editObj) && (
          <Button variant='contained' color='primary' className='nf-buttons ' disableElevation style={{ marginLeft: '10px' }} onClick={() => validation(true)} disabled={loading2}>
            Create & Add {loading2 && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
          </Button>
        )}
      </div>
    </div>
  )
  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      {body}
    </Modal>
  )
}

const modalStyle = {
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  position: 'absolute',
  background: '#fff',
  width: '45%',
}

export default CreateNewTaskModal
