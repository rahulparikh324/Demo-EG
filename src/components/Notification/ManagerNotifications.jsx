import React, { useState } from 'react'
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined'
import { NotificationSettingConfig } from './components'
import updateEmailNotification from '../../Services/User/updateEmailNotificationService'
import updateOperatorUsageEmail from '../../Services/User/updateOperatorUsageEmail'
import TriggerPMNotificationStatus from '../../Services/User/triggerPMNotificationStatus'
import SettingsOutlined from '@material-ui/icons/SettingsOutlined'
import { Toast } from '../../Snackbar/useToast'

export function ManagerEmailNotifications() {
  const usageRep = JSON.parse(localStorage.getItem('emailNotificationForOperatorUsageReport')) || false
  const penRev = JSON.parse(localStorage.getItem('emailNotificationPendingReviews')) || false
  const [usageReportEnabled, setUsageReportEnabled] = useState(usageRep)
  const [pendingReviewsEnabled, setPendingReviewsEnabled] = useState(penRev)
  const onUsageReportChange = async e => {
    try {
      const loginData = JSON.parse(localStorage.getItem('loginData'))
      const res = await updateOperatorUsageEmail(`${loginData.uuid}/${e}`)
      if (res.data.success === 1) Toast.success('Notification settings updated !')
      else Toast.error(res.data.message)
      setUsageReportEnabled(e)
      localStorage.setItem('emailNotificationForOperatorUsageReport', e)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
  }
  const onEmailNotifChange = async e => {
    try {
      const res = await updateEmailNotification(e)
      if (res.data.success === 1) Toast.success('Notification settings updated !')
      else Toast.error(res.data.message)
      setPendingReviewsEnabled(e)
      localStorage.setItem('emailNotificationPendingReviews', e)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
  }
  return (
    <div>
      <div className='pm-setting-title d-flex'>
        <EmailOutlinedIcon />
        <div className='title'> Configure Email Notifications</div>
      </div>
      <NotificationSettingConfig checked={usageReportEnabled} setchecked={onUsageReportChange} title='Email Notification for Operator Usage Report' desc='Notification will be sent as email when the usage report will be generated' />
      <NotificationSettingConfig checked={pendingReviewsEnabled} setchecked={onEmailNotifChange} title='Email Notification for Operator Pending Reviews' desc='Notification will be sent as email when the pending reviews report will be generated' />
    </div>
  )
}

export function ManagerPMNotifications() {
  const [enabled, setEnabled] = useState(JSON.parse(localStorage.getItem('pmNotificationForManager')) || false)
  const onStatusChange = async e => {
    try {
      const res = await TriggerPMNotificationStatus(e)
      //console.log(res)
      if (res.success === 1) Toast.success('Notification settings updated !')
      else Toast.error(res.message)
      setEnabled(e)
      localStorage.setItem('pmNotificationForManager', e)
    } catch (error) {
      Toast.error('Something went wrong !')
    }
  }
  return (
    <div>
      <div className='pm-setting-title d-flex'>
        <SettingsOutlined />
        <div className='title'> Configure PM Notifications</div>
      </div>
      <NotificationSettingConfig checked={enabled} setchecked={onStatusChange} title='PM Notifications' desc='Notification will be sent when the PM will become due as per its time/meter hour duration' />
    </div>
  )
}
