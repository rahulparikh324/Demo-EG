import React, { useState } from 'react'
import AssignmentTurnedInOutlined from '@material-ui/icons/AssignmentTurnedInOutlined'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import RecentActorsOutlinedIcon from '@material-ui/icons/RecentActorsOutlined'
import CircularProgress from '@material-ui/core/CircularProgress'
import { history } from '../../helpers/history'
import markNotificationAsRead from '../../Services/markNotificationAsRead'
import dontSendNotification from '../../Services/dontSendNotification'
import Tooltip from '@material-ui/core/Tooltip'
import { useTheme } from '@material-ui/core/styles'

function NotificationCard({ value }) {
  const [readState, setReadState] = useState(value.notification_status)
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  //
  const clickOnNotification = notif => {
    const { notification_type, ref_id } = notif
    if ([9, 10, 11, 12, 13, 14].includes(notification_type)) return
    const redirectionURL = notification_type < 4 ? `/inspections/details/${ref_id}` : `/issues/details/${ref_id}`
    history.push(redirectionURL)
    // console.log('click on notif')
  }
  //
  const clickOnReadUnread = async (e, value) => {
    e.stopPropagation()
    const req = { notification_id: value.notification_id, status: readState === 1 ? 2 : 1 }
    setLoading(true)
    try {
      await markNotificationAsRead(req)
      setReadState(readState === 1 ? 2 : 1)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const doNotSendNotification = async (e, value) => {
    e.stopPropagation()
    setLoading(true)
    // console.log(value)
    try {
      await dontSendNotification(value.ref_id)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }
  //
  const getTimeElapsed = date => {
    const startDate = new Date(date.split('.')[0])
    const _endDate = new Date().toISOString()
    const endDate = new Date(_endDate.split('.')[0])
    const timeDiff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
    if (Math.floor(timeDiff / (86400 * 30 * 365)) >= 1) return `${Math.floor(timeDiff / (86400 * 30 * 365))} ${Math.floor(timeDiff / (86400 * 30 * 365)) === 1 ? 'year' : 'years'} ago`
    if (Math.floor(timeDiff / (86400 * 30)) >= 1) return `${Math.floor(timeDiff / (86400 * 30))} ${Math.floor(timeDiff / (86400 * 30)) === 1 ? 'month' : 'months'} ago`
    if (timeDiff >= 86400) return `${Math.floor(timeDiff / 86400)} ${Math.floor(timeDiff / 86400) === 1 ? 'day' : 'days'} ago`
    if (timeDiff >= 3600) return `${Math.floor(timeDiff / 3600)} ${Math.floor(timeDiff / 3600) === 1 ? 'hour' : 'hours'} ago`
    if (timeDiff >= 60) return `${Math.floor(timeDiff / 60)} ${Math.floor(timeDiff / 60) === 1 ? 'min' : 'mins'} ago`
    else return `${Math.floor(timeDiff)} secs ago`
  }
  //
  const Icons = ({ type }) => {
    return (
      <>
        {[1, 2, 3].includes(type) && <AssignmentTurnedInOutlined fontSize='small' className='notification-card-icon' />}
        {[4, 5, 6, 7, 8].includes(type) && <ReportProblemOutlinedIcon fontSize='small' className='notification-card-icon' />}
        {[9, 10, 11, 12, 13, 14].includes(type) && <RecentActorsOutlinedIcon fontSize='small' className='notification-card-icon' />}
      </>
    )
  }

  return (
    <div className='notification-card' onClick={() => clickOnNotification(value)}>
      <Icons type={value.notification_type} />
      <div className='notification-card-col-2'>
        <div className='notification-card-title'>{value.heading}</div>
        <div className='notification-card-desc'>{value.message}</div>
        {[9, 10, 11, 12, 13, 14].includes(value.notification_type) && (
          <button className='dont-send-button' onClick={e => doNotSendNotification(e, value)} style={{ color: theme.palette.primary.main }}>
            Do not send this notification again
          </button>
        )}
      </div>
      <div className='notification-card-col-3'>
        {loading ? (
          <CircularProgress size={12} thickness={5} />
        ) : (
          <Tooltip title={`Mark as ${readState === 2 ? 'unread' : 'read'}`} placement='left'>
            {readState === 2 ? <button onClick={e => clickOnReadUnread(e, value)} className={`notification-read-unread-button read`}></button> : <button style={{ background: theme.palette.primary.main }} onClick={e => clickOnReadUnread(e, value)} className={`notification-read-unread-button unread `}></button>}
          </Tooltip>
        )}
        <div className='notification-card-desc'>{getTimeElapsed(value.createdDate)}</div>
      </div>
    </div>
  )
}

export default NotificationCard
