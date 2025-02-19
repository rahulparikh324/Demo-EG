import React, { useState, useEffect } from 'react'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import '../Maintainance/maintainance.css'
import { MinimalInput } from '../Assets/components'

function TimeSpent({ open, handleClose, tasks, setTasks, taskID }) {
  const [hrs, setHrs] = useState(0)
  const [mins, setMins] = useState(0)
  //
  useEffect(() => {
    setHrs(taskID.time_spent_hours)
    setMins(taskID.time_spent_minutes)
  }, [taskID])
  //
  const submit = () => {
    const _tasks = [...tasks]
    const task = _tasks.find(t => t.task_id === taskID.task_id)
    task.time_spent_hours = Number(hrs)
    task.time_spent_minutes = Number(mins)
    setTasks(_tasks)
    handleClose()
  }

  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>Time Spent</div>
        <IconButton onClick={handleClose} size='small'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          Add the total time spent on the task <strong style={{ color: '#146481' }}>Oil Filter</strong>
        </div>
        <MinimalInput value={hrs} onChange={setHrs} label='Hours spent' type='number' min={0} placeholder='Add Hours' w={100} labelStyles={{ fontWeight: 800 }} InputStyles={{ padding: '10px 16px' }} />
        <MinimalInput value={mins} onChange={setMins} label='Minutes spent' type='number' min={0} max={59} placeholder='Add Mins' w={100} labelStyles={{ fontWeight: 800 }} InputStyles={{ padding: '10px 16px' }} />
      </div>
      <div className='content-bar bottom-bar'>
        <Button variant='contained' color='default' className='nf-buttons mr-2' disableElevation onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={submit} disableElevation style={{ marginLeft: '10px' }}>
          Save
        </Button>
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
  width: '25%',
}

export default TimeSpent
