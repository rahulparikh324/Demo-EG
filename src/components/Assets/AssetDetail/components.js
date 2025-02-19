import React, { useState } from 'react'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Paper from '@material-ui/core/Paper'
import Settings from '../../../Content/images/settings.svg'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import VisibilityIcon from '@material-ui/icons/Visibility'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import Button from '@material-ui/core/Button'
import _ from 'lodash'
import CircularProgress from '@material-ui/core/CircularProgress'
import updateTaskStatus from '../../../Services/Asset/updateTaskStatus'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import AssignmentTurnedInOutlined from '@material-ui/icons/AssignmentTurnedInOutlined'
import RecentActorsOutlinedIcon from '@material-ui/icons/RecentActorsOutlined'
import BuildOutlinedIcon from '@material-ui/icons/BuildOutlined'
import Skeleton from '@material-ui/lab/Skeleton'
import { getDateTime } from '../../../helpers/getDateTime'

export function PlanList({ item, title, count, addPlan }) {
  const [expand, setExpand] = useState(false)

  const PlanItem = ({ name, count, plan }) => (
    <Paper elevation={0} onClick={() => addPlan(plan)} id='plan-list-title-paper' className='plan-list-title d-flex align-items-center font-weight-bold justify-content-between py-2 px-3 mb-2'>
      <div className='plan-list-title-name' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '300px' }}>
        {name}
      </div>
      <div className='plan-list-count'>{count}</div>
    </Paper>
  )

  return (
    <div className='plan-list '>
      <div className='plan-list-title d-flex align-items-center px-3 pt-3 font-weight-bold' onClick={() => setExpand(!expand)}>
        {expand ? <ExpandLessIcon fontSize='small' onClick={() => setExpand(!expand)} /> : <ExpandMoreIcon fontSize='small' onClick={() => setExpand(!expand)} />}
        <div className='plan-list-title-name ' style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '300px' }}>
          {title}
        </div>
        <div className='plan-list-count'>{count}</div>
      </div>
      <div className={`accordion-panel active-${expand}`}>{item.pmPlans.map(plan => plan.pmCount !== 0 && <PlanItem plan={plan} key={plan.pm_plan_id} name={plan.plan_name} count={plan.pmCount} />)}</div>
    </div>
  )
}

export function PlanItem({ onEdit, onView, onMarkComplete, item, onDelete, onDuplicate }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const handleEdit = () => {
    onEdit()
    setAnchorEl(null)
  }
  const handleDelete = () => {
    onDelete()
    setAnchorEl(null)
  }
  const handleDuplicate = () => {
    onDuplicate()
    setAnchorEl(null)
  }
  const handleMarkComplete = () => {
    onMarkComplete()
    setAnchorEl(null)
  }
  const LabelValPair = ({ label, value }) => (
    <div>
      <span style={{ fontWeight: 500 }}>{label}</span> {value}
    </div>
  )
  const getTotalEstTime = () => {
    const hrs = item.active_PMTrigger.total_est_time_hours
    const mins = item.active_PMTrigger.total_est_time_minutes
    if (hrs === 0) return `${mins} Mins`
    else if (mins === 0) return `${hrs} Hrs`
    else return `${hrs} Hrs ${mins} Mins`
  }
  function datediff(dueDate) {
    let d1 = new Date(dueDate)
    let d2 = new Date()
    let now = new Date()
    let date = new Date(dueDate)
    if (d2.getTime() < d1.getTime()) {
      d1 = now
      d2 = date
    }
    let yd = d1.getYear()
    let yn = d2.getYear()
    let years = yn - yd
    let md = d1.getMonth()
    let mn = d2.getMonth()
    let months = mn - md
    if (months < 0) {
      years--
      months = 12 - md + mn
    }
    let dd = d1.getDate()
    let dn = d2.getDate()
    let days = dn - dd
    if (days < 0) {
      months--
      // figure out how many days there are in the last month
      d2.setMonth(mn, 0)
      days = d2.getDate() - dd + dn
    }
    let weeks = Math.floor(days / 7)
    days = days % 7
    if (years > 0) return years + ' years' + (months > 0 ? ' and ' + months + ' months' : '')
    if (months > 0) return months + ' months' + (weeks > 0 ? ' and ' + weeks + ' weeks' : '')
    if (weeks > 0) return weeks + ' weeks' + (days > 0 ? ' and ' + days + ' days' : '')
    return days + ' days'
  }

  return (
    <Paper elevation={0} style={{ marginBottom: '10px', background: '#fafafa', border: '1px solid #dee2e6' }}>
      <div className='accordion-title border-true d-flex align-items-center justify-content-between py-2 px-3'>
        <div>
          <img src={Settings} alt='settings-icon' />
          <span className='accordion-title-name'>{item.title}</span>
        </div>
        {!_.isEmpty(item.active_PMTrigger) && (
          <div>
            <IconButton size='small' onClick={onView}>
              <VisibilityIcon fontSize='small' />
            </IconButton>
            <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
              <MoreVertIcon fontSize='small' />
            </IconButton>
            <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={handleEdit}>Edit</MenuItem>
              <MenuItem>Export As PDF</MenuItem>
              <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
              <MenuItem onClick={handleMarkComplete}>Mark Completed</MenuItem>
              <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
          </div>
        )}
      </div>
      <div className='d-flex align-items-center justify-content-between p-3'>
        <div>{item.pm_type_status_name}</div>
        {item.pm_trigger_type === 25 && item.pm_trigger_by === 26 && (
          <>
            <LabelValPair label='Due In:' value={datediff(item.active_PMTrigger.due_datetime)} />
            <LabelValPair label='Repeats Every:' value={`${item.datetime_repeates_every} ${item.datetime_repeat_time_period_type === 29 ? 'Months' : 'Years'}`} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
        {item.pm_trigger_type === 25 && item.pm_trigger_by === 27 && (
          <>
            <LabelValPair label='Due In:' value={`${item.active_PMTrigger.due_meter_hours} meter hours`} />
            <LabelValPair label='Repeats Every:' value={`${item.meter_hours_repeates_every} meter hours`} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
        {item.pm_trigger_type === 25 && item.pm_trigger_by === 28 && (
          <>
            <LabelValPair label='Due In:' value={`${item.active_PMTrigger.due_meter_hours} meter hours`} />
            <LabelValPair label='Repeats Every:' value={`${item.meter_hours_repeates_every} meter hours`} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
        {item.pm_trigger_type === 24 && item.pm_trigger_by === 26 && !_.isEmpty(item.active_PMTrigger) && (
          <>
            <LabelValPair label='Due In:' value={datediff(item.datetime_due_at)} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
        {item.pm_trigger_type === 24 && item.pm_trigger_by === 27 && !_.isEmpty(item.active_PMTrigger) && (
          <>
            <LabelValPair label='Due In:' value={`${item.active_PMTrigger.due_meter_hours} meter hours`} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
        {item.pm_trigger_type === 24 && item.pm_trigger_by === 28 && !_.isEmpty(item.active_PMTrigger) && (
          <>
            <LabelValPair label='Due In:' value={`${datediff(item.datetime_due_at)} Or ${item.active_PMTrigger.due_meter_hours} meter hours`} />
            <LabelValPair label='Total Est Time:' value={getTotalEstTime()} />
          </>
        )}
      </div>
    </Paper>
  )
}

export function TaskItem({ code, title, time, onDelete, task, afterSubmit, allTasks, onLastStatusUpdate, isEdit }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [taskStatus, setTaskStatus] = useState(task.status)

  const getStatus = status => {
    if (status === 35) return 'New'
    if (status === 36) return 'In Progress'
    if (status === 37) return 'Waiting'
    if (status === 38) return 'Completed'
  }
  const getColor = status => {
    if (status === 35) return '#ffba00'
    if (status === 36) return '#1a5cff'
    if (status === 37) return '#ff4757'
    if (status === 38) return '#46c93a'
  }
  const style = {
    background: getColor(taskStatus),
    borderRadius: '50px',
    padding: '0 10px',
    fontWeight: 800,
    color: '#fff',
    fontSize: '12px',
  }
  const changeStatus = async status => {
    setAnchorEl(null)
    setLoading(true)
    const req = { trigger_task_id: task.trigger_task_id, status }
    try {
      const isLastTask = checkForLastNonCompleteTask()
      if (isLastTask && status === 38) {
        onLastStatusUpdate()
      } else {
        await updateTaskStatus(req)
        afterSubmit()
        setTaskStatus(status)
        setLoading(false)
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
  const checkForLastNonCompleteTask = () => {
    const nonCompletedTask = allTasks.filter(task => task.status !== 38)
    return nonCompletedTask.length === 1 ? true : false
  }
  return (
    <div className='schedule-task-item'>
      <div className='task-item-detail'>
        <div>
          {code} / {title}
        </div>
        <div>Est Time: {time}</div>
      </div>
      <div className='d-flex flex-column align-items-end'>
        <div>
          {loading ? (
            <CircularProgress size={20} thickness={5} />
          ) : (
            isEdit && (
              <Button aria-label='more' style={style} aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
                {getStatus(taskStatus)}
              </Button>
            )
          )}
          <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => changeStatus(35)} disabled={taskStatus === 35}>
              New
            </MenuItem>
            <MenuItem onClick={() => changeStatus(36)} disabled={taskStatus === 36}>
              In Progress
            </MenuItem>
            <MenuItem onClick={() => changeStatus(37)} disabled={taskStatus === 37}>
              Waiting{' '}
            </MenuItem>
            <MenuItem onClick={() => changeStatus(38)} disabled={taskStatus === 38}>
              Completed
            </MenuItem>
          </Menu>
        </div>
        <IconButton size='small' onClick={onDelete}>
          <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
        </IconButton>
      </div>
    </div>
  )
}

export function Activity({ activity, elementRef }) {
  return (
    <div className='p-2 mb-2 d-flex border' ref={elementRef} style={{ borderRadius: '4px' }}>
      <div style={{ width: '20px' }}>
        {[1, 2, 8, 9, 10, 11].includes(activity.activity_type) && <RecentActorsOutlinedIcon style={{ fontSize: '18px', color: '#474747' }} />}
        {[3, 4, 5].includes(activity.activity_type) && <AssignmentTurnedInOutlined style={{ fontSize: '18px', color: '#474747' }} />}
        {[14, 15, 16, 17, 18].includes(activity.activity_type) && <BuildOutlinedIcon style={{ fontSize: '18px', color: '#474747' }} />}
        {activity.activity_type === 6 && <ReportProblemOutlinedIcon style={{ fontSize: '18px', color: '#ff0000' }} />}
        {activity.activity_type === 7 && <ReportProblemOutlinedIcon style={{ fontSize: '18px', color: '#00B407' }} />}
      </div>
      <div className='px-2 d-flex flex-column' style={{ width: '100%' }}>
        <div className='d-flex justify-content-between'>
          <div>{activity.activity_message}</div>
          <div></div>
        </div>
        <div className='d-flex justify-content-between pt-2'>
          <div>
            {[3, 5, 8, 9, 10, 11, 12].includes(activity.activity_type) && (
              <i style={{ color: '#7E7E7E' }}>
                {activity.activity_type === 3 ? `Requested` : `Reviewed`} By: {activity.updated_by_name}
              </i>
            )}
          </div>
          <div>
            <i style={{ color: '#7E7E7E' }}>{getDateTime(activity.created_at, activity.timezone)}</i>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActivtyLoader({ n }) {
  return (
    <>
      {[...Array(n)].map((x, index) => (
        <div key={index} className='p-3 mb-2'>
          <div className='d-flex align-items-center'>
            <Skeleton variant='circle' animation='wave' width={15} height={15} style={{ borderRadius: '10px' }} />
            <Skeleton variant='text' animation='wave' width={150} height={24} style={{ marginLeft: '14px' }} />
          </div>
          <div className='d-flex align-items-center'>
            <Skeleton variant='text' animation='wave' width={150} height={24} style={{ marginRight: '14px' }} />
            <Skeleton variant='text' animation='wave' width={150} height={24} style={{ marginRight: '14px' }} />
          </div>
        </div>
      ))}
    </>
  )
}
