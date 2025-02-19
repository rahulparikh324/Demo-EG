import React, { useState } from 'react'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import Skeleton from '@material-ui/lab/Skeleton'
import { getDateTime } from '../../helpers/getDateTime'
import { useTheme } from '@material-ui/core/styles'
import enums from 'Constants/enums'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'

export function TaskItem({ noDelete, code, id, title, time, onDelete, onTimeSpent, status, changeTaskStatus, isViewEdit, task, readOnly, isCreate }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [anchorElStatus, setAnchorElStatus] = useState(null)
  const [taskStatus, setTaskStatus] = useState(status)
  const deleteItem = () => {
    setAnchorEl(null)
    onDelete()
  }
  const changeTimeSpent = () => {
    setAnchorEl(null)
    onTimeSpent()
  }
  const getColor = () => {
    if (taskStatus === 12) return '#ffba00'
    if (taskStatus === 13) return '#1a5cff'
    if (taskStatus === 14) return '#ff4757'
    if (taskStatus === 15) return '#46c93a'
  }
  const getLabel = () => {
    if (taskStatus === 12) return 'Open'
    if (taskStatus === 13) return 'In Progress'
    if (taskStatus === 14) return 'Waiting'
    if (taskStatus === 15) return 'Completed'
  }
  //
  const changeStatus = status => {
    setAnchorElStatus(null)
    setTaskStatus(status)
    changeTaskStatus(id, status)
  }
  const Div = ({ label, value }) => (
    <div>
      <div style={{ marginTop: '6px' }}>{label}:</div>
      <div style={{ color: '#727272' }}>{value}</div>
    </div>
  )
  const getTimeSpentAndEst = (hrs, mins) => {
    if (!task[hrs] && !task[mins]) return
    else if (!task[hrs]) return `${task[mins]} mins`
    else if (!task[mins]) return `${task[hrs]} hrs`
    else return `${task[hrs]} hrs ${task[mins]} mins`
  }
  //
  return (
    <div className='wo-tasks-style'>
      <div className='task-item-detail' style={{ width: '90%' }}>
        <div>
          {code} - {title}
        </div>
        {isViewEdit ? (
          <div className='d-flex justify-content-between'>
            <Div label='Time Spent' value={getTimeSpentAndEst('time_spent_hours', 'time_spent_minutes')} />
            <Div label='Est Time' value={getTimeSpentAndEst('task_est_hours', 'task_est_minutes')} />
            <Div label='Hourly Rate ($)' value={task.hourly_rate !== 0 ? task.hourly_rate : ''} />
          </div>
        ) : (
          <Div label='Est Time' value={getTimeSpentAndEst('task_est_hours', 'task_est_minutes')} />
        )}
      </div>
      <div className='task-item-time'>
        <span onClick={e => setAnchorElStatus(e.currentTarget)} style={{ padding: '2px 10px', cursor: 'pointer', fontSize: '11px', marginLeft: '4px', borderRadius: '8px', color: 'white', background: getColor() }}>
          {getLabel()}
        </span>
        {!noDelete && (
          <IconButton aria-label='more' aria-controls='long-menu' aria-haspopup='true' onClick={e => setAnchorEl(e.currentTarget)} size='small'>
            <MoreVertIcon fontSize='small' />
          </IconButton>
        )}
        {!readOnly && (
          <Menu id='schedule-list-menu' anchorEl={anchorElStatus} keepMounted open={Boolean(anchorElStatus)} onClose={() => setAnchorElStatus(null)}>
            <MenuItem onClick={() => changeStatus(12)} disabled={taskStatus === 12}>
              Open
            </MenuItem>
            <MenuItem onClick={() => changeStatus(13)} disabled={taskStatus === 13}>
              In Progress
            </MenuItem>
            <MenuItem onClick={() => changeStatus(14)} disabled={taskStatus === 14}>
              Waiting
            </MenuItem>
            <MenuItem onClick={() => changeStatus(15)} disabled={taskStatus === 15}>
              Completed
            </MenuItem>
          </Menu>
        )}
        <Menu id='schedule-list-menu' anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {!isCreate && <MenuItem onClick={() => changeTimeSpent()}>Time Spent</MenuItem>}
          <MenuItem onClick={() => deleteItem()}>Delete</MenuItem>
        </Menu>
      </div>
    </div>
  )
}

export function IssueItem({ noDelete, code, title, onDelete, status, inspectionID, meters }) {
  const getColor = () => {
    if (status === 12) return '#ffba00'
    if (status === 13) return '#1a5cff'
    if (status === 15) return '#46c93a'
    if (status === 14) return '#46c93a'
  }
  const getLabel = () => {
    if (status === 12) return 'Open'
    if (status === 13) return 'In Progress'
    if (status === 15) return 'Completed'
    if (status === 14) return 'Waiting'
  }

  return (
    <div className='wo-tasks-style'>
      <div className='task-item-detail'>
        <div>
          {code} - {title} {status && '-'} <span style={{ padding: '2px 10px', fontSize: '11px', marginLeft: '4px', borderRadius: '4px', color: 'white', background: getColor() }}>{getLabel()}</span>
          <div onClick={() => window.open(`../../inspections/details/${inspectionID}`, '_blank')} style={{ color: '#146481', cursor: 'pointer', textDecoration: 'underline' }}>
            <i>
              Inspection Info - Meter at Inspection: <strong>{meters}</strong>
            </i>
          </div>
        </div>
      </div>
      <div className='task-item-time'>
        {!noDelete && (
          <button className='ghost-button' onClick={onDelete}>
            Unlink Issue
          </button>
        )}
      </div>
    </div>
  )
}

export function AttachmentItem({ noDelete, name, onDelete, url }) {
  return (
    <div className='wo-tasks-style'>
      <a className='task-item-detail' href={url} target='_blank' rel='noopener noreferrer'>
        {name}
      </a>
      <div className='task-item-time'>
        {!noDelete && (
          <IconButton size='small' onClick={onDelete}>
            <DeleteOutlineOutlinedIcon fontSize='small' style={{ color: '#FF0000' }} />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export function HistoryStatus({ obj }) {
  const getColor = () => {
    if (obj.activity_type === 6) return '#003DDA'
    if (obj.activity_type === 7) return '#00B407'
  }
  const getLabel = () => {
    if (obj.activity_type === 6) return 'Open'
    if (obj.activity_type === 7) return 'Completed'
  }
  const LabelVal = ({ label, value }) => (
    <div style={{ marginRight: '50px' }}>
      <div style={{ marginTop: '6px' }}>{label}</div>
      <div style={{ color: '#727272' }}>{value}</div>
    </div>
  )
  return (
    <div className='schedule-task-item bg-white mb-2'>
      <div className='task-item-detail' style={{ width: '100%' }}>
        <div className='d-flex flex-row justify-content-between'>
          <div>{obj.activity_header}</div>
          <div style={{ padding: '2px 10px', fontSize: '11px', marginLeft: '4px', borderRadius: '4px', color: 'white', background: getColor() }}>{getLabel()}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#7b727b' }}>{obj.activity_message}</div>
        <div className='d-flex'>
          <LabelVal label='Created Date :' value={getDateTime(obj.created_at, obj.timezone)} />
          <LabelVal label='Updated By :' value={obj.updated_by_name} />
        </div>
      </div>
    </div>
  )
}

export function HistoryLoader() {
  return (
    <>
      {[...Array(8)].map((x, index) => (
        <div key={index} className='schedule-task-item bg-white mb-2'>
          <div className='task-item-detail' style={{ width: '100%' }}>
            <div className='d-flex flex-row justify-content-between'>
              <Skeleton variant='text' animation='wave' width={200} height={24} />
              <Skeleton variant='text' animation='wave' width={85} height={24} />
            </div>
            <div className='d-flex'>
              <div>
                <Skeleton variant='text' animation='wave' width={100} height={24} />
                <Skeleton variant='text' animation='wave' width={175} height={24} />
              </div>
              <div style={{ marginLeft: '29px' }}>
                <Skeleton variant='text' animation='wave' width={100} height={24} />
                <Skeleton variant='text' animation='wave' width={175} height={24} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
export const TaskProgress = ({ val, overspent }) => {
  const theme = useTheme()
  return (
    <span style={{ width: '100%', margin: '5px' }}>
      <div style={{ width: '98%', height: '100%', background: !overspent ? '#d0d0d0' : '#ffba00', borderRadius: '8px' }}>
        <div style={{ width: `${val}%`, height: '100%', background: theme.palette.primary.main, borderRadius: '8px' }}></div>
      </div>
    </span>
  )
}
export const TaskProgressDetail = ({ totalEstTime, totalSpentTime }) => {
  const theme = useTheme()

  return (
    <div style={{ fontSize: '13px', fontWeight: 400 }}>
      <i>
        Total estimate time:<strong style={{ color: theme.palette.primary.main }}>{totalEstTime}</strong> ,Spent Time: <strong style={{ color: theme.palette.primary.main }}>{totalSpentTime}</strong>
      </i>
    </div>
  )
}

export const CompletionStatus = ({ status, text, inProgress }) => {
  if (status !== inProgress) return <></>
  return (
    <div className='p-2 d-flex justify-content-between align-items-center mb-2' style={{ background: '#3291DD', borderRadius: '2px' }}>
      <div></div>
      <div className='text-bold d-flex align-items-center' style={{ color: '#fff' }}>
        <CircularProgress size={16} thickness={5} style={{ color: '#fff', marginRight: '10px' }} />
        <div style={{ textTransform: 'uppercase' }}>{text}</div>
      </div>
      <div></div>
    </div>
  )
}
export const StatusMetric = ({ count, loading, icon: Icon, color, toolTip = '' }) => (
  <Tooltip title={toolTip} placement='top'>
    <div className='d-flex justify-content-start align-items-center mr-1' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', minWidth: '56px', padding: '2px' }}>
      <div className='mr-2 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${count === 0 ? '#00000020' : `${color}35`}`, width: 27, height: 27 }}>
        <Icon fontSize='small' style={{ color: count === 0 ? '#00000050' : color }} />
      </div>
      <div>
        {loading ? (
          <CircularProgress size={15} thickness={5} style={{ marginTop: '5px' }} />
        ) : (
          <div style={{ fontSize: 13, opacity: count === 0 ? 0.4 : 1 }} className='text-bold'>
            {count}
          </div>
        )}
      </div>
    </div>
  </Tooltip>
)
export const StatusMetricButton = ({ count, loading, icon: Icon, color, toolTip = '', action }) => (
  <Tooltip title={toolTip} placement='top'>
    <div className='d-flex justify-content-start align-items-center mr-1' style={{ border: '1px solid #e0e0e0', borderRadius: '4px', minWidth: '56px', padding: '2px' }} onClick={count !== 0 ? action : null}>
      <div className='mr-2 d-flex justify-content-center align-items-center' style={{ borderRadius: '4px', padding: '8px', background: `${count === 0 ? '#00000020' : `${color}35`}`, width: 27, height: 27 }}>
        <Icon fontSize='small' style={{ color: count === 0 ? '#00000050' : color }} />
      </div>
      <div>
        {loading ? (
          <CircularProgress size={15} thickness={5} style={{ marginTop: '5px' }} />
        ) : (
          <div style={{ fontSize: 13, opacity: count === 0 ? 0.4 : 1 }} className='text-bold'>
            {count}
          </div>
        )}
      </div>
    </div>
  </Tooltip>
)
