import React, { useState, useEffect } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Settings from '../../Content/images/settings.svg'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Toast } from '../../Snackbar/useToast'
import AddEditPM from './AddEditPM'
import momenttimezone from 'moment-timezone'
import $ from 'jquery'
import deletePM from '../../Services/Maintainance/deletePM.service'
import movePM from '../../Services/Maintainance/movePM.service'
import Drawer from '@material-ui/core/Drawer'
import { FormTitle, BottomBar, DeleteDailog, ContainerDiv, FormControlVariant } from './components'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import DialogPrompt from '../DialogPrompt'

function Accordian({ item, plan, afterSubmit, plans }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [expand, setExpand] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDuplicate, setOpenDuplicate] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openMove, setOpenMove] = useState(false)
  const [totalHours, setHours] = useState(0)
  const [totalMins, setMins] = useState(0)
  const [moveToPlan, setMoveToPlan] = useState('')
  //
  const handleEdit = () => {
    setOpenEdit(true)
    setAnchorEl(null)
  }
  const handleDuplicate = () => {
    setOpenDuplicate(true)
    setAnchorEl(null)
  }
  const handleDelete = () => {
    setOpenDelete(true)
    setAnchorEl(null)
  }
  const handleMove = () => {
    setOpenMove(true)
    setAnchorEl(null)
    setMoveToPlan(plan.pm_plan_id)
  }
  const deletePMItem = async () => {
    setOpenDelete(false)
    $('#pageLoading').show()
    try {
      const res = await deletePM(item.pm_id)
      if (res.success > 0) Toast.success('PM Deleted successfully')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    afterSubmit()
    $('#pageLoading').hide()
  }
  const movePMToPlan = async () => {
    const req = {
      new_pm_plan_id: moveToPlan,
      pm_id: item.pm_id,
    }
    setOpenMove(false)
    $('#pageLoading').show()
    try {
      const res = await movePM(req)
      if (res.success > 0) Toast.success('PM moved successfully')
      else Toast.error(res.message)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
    afterSubmit()
    $('#pageLoading').hide()
  }
  //
  const getTriggerByFT = id => {
    if (id === 26) return <span>{`Due on ${momenttimezone.utc(item.datetime_due_at).format('MM-DD-YYYY hh:mm:ss a')}`}</span>
    if (id === 27) return <span>{`Due on ${item.meter_hours_due_at} Hours`}</span>
    if (id === 28) return <span>{`Due on ${item.meter_hours_due_at} Hours OR ${momenttimezone.utc(item.datetime_due_at).tz('America/Los_Angeles').format('MM-DD-YYYY hh:mm:ss a')}`}</span>
  }
  const getTriggerByRC = id => {
    if (id === 26) return <span>{`Repeats every ${item.datetime_repeates_every} ${item.datetime_repeat_time_period_type === 29 ? 'Months' : 'Years'}`}</span>
    if (id === 27 || id === 28) return <span>{`Repeats every ${item.meter_hours_repeates_every} Hours`}</span>
  }
  //
  useEffect(() => {
    let hours = 0
    let mins = 0
    item.pmTasks.forEach(taskItem => {
      hours += taskItem.tasks.task_est_hours
      mins += taskItem.tasks.task_est_minutes
    })
    setHours(hours + Math.floor(mins / 60))
    setMins(Math.floor(mins % 60))
  }, [item.pmTasks])
  //
  return (
    <div className='schedule-list-accordian'>
      <div className={`accordion-title border-${expand}`}>
        <div style={{ width: '94%' }} onClick={() => setExpand(!expand)}>
          <img src={Settings} alt='settings-icon' />
          <span className='accordion-title-name'>{item.title}</span>
        </div>
        <div className='d-flex align-items-center'>
          <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
            <MoreVertIcon fontSize='small' />
          </IconButton>
          <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
            <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
            <MenuItem onClick={handleMove}>Move</MenuItem>
          </Menu>
          {expand ? <ExpandLessIcon fontSize='small' onClick={() => setExpand(!expand)} /> : <ExpandMoreIcon fontSize='small' onClick={() => setExpand(!expand)} />}
        </div>
      </div>
      <div className={`accordion-panel active-${expand}`}>
        <div className='accordion-panel-desc'>{item.description}</div>
        <div className='accordion-panel-sub-title'>Schedule Triggers</div>
        <div className='accordion-panel-time'>
          {item.pm_trigger_type === 24 && getTriggerByFT(item.pm_trigger_by)}
          {item.pm_trigger_type === 25 && getTriggerByRC(item.pm_trigger_by)}
        </div>
        <div className='accordion-panel-sub-title'>
          <span>Tasks</span>
          <span style={{ fontSize: '14px' }}>
            Total Est Time: {totalHours} hrs {totalMins} mins
          </span>
        </div>
        {item.pmTasks.map(taskItem => (
          <div className='accordion-panel-time mb-2' key={taskItem.pm_task_id}>
            <span>{taskItem.tasks.task_title}</span>
            <div>
              <span>
                Est Time: {taskItem.tasks.task_est_hours} hrs {taskItem.tasks.task_est_minutes} mins
              </span>
            </div>
          </div>
        ))}
      </div>
      {openEdit && <AddEditPM afterSubmit={afterSubmit} plan={plan} open={openEdit} onClose={() => setOpenEdit(false)} onEditObject={item} setToastMsg={Toast} />}
      {openDuplicate && <AddEditPM afterSubmit={afterSubmit} plan={plan} open={openDuplicate} onClose={() => setOpenDuplicate(false)} setToastMsg={Toast} onDuplicateObject={item} />}
      <DialogPrompt title='Delete PM' text='Are you sure you want to delete this PM ?' ctaText='Delete' open={openDelete} action={deletePMItem} handleClose={() => setOpenDelete(false)} />
      <Drawer anchor='right' open={openMove} onClose={() => setOpenMove(false)}>
        <FormTitle title='Move PM' closeFunc={() => setOpenMove(false)} />
        <ContainerDiv>
          <FormControlVariant>
            <InputLabel htmlFor='outlined-age-native-simple'>Select Plan</InputLabel>
            <Select native value={moveToPlan} onChange={e => setMoveToPlan(e.target.value)} label='Schedule type'>
              {plans.map(item => (
                <option key={item.pm_plan_id} value={item.pm_plan_id}>
                  {item.plan_name}
                </option>
              ))}
            </Select>
          </FormControlVariant>
          <BottomBar buttonText='Move' onClose={() => setOpenMove(false)} submitFunc={movePMToPlan} />
        </ContainerDiv>
      </Drawer>
    </div>
  )
}

export default Accordian
