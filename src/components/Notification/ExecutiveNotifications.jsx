import React, { useState } from 'react'
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined'
import { NotificationSettingConfig } from './components'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import updateEmailNotification from '../../Services/User/updateEmailNotification'
import updateExecutivePMNotification from '../../Services/updateExecutivePMNotification'
import { Toast } from '../../Snackbar/useToast'
import SettingsOutlined from '@material-ui/icons/SettingsOutlined'
import Button from '@material-ui/core/Button'
import _ from 'lodash'

export function ExecutiveEmailNotifications() {
  const en = JSON.parse(localStorage.getItem('progressReportForExecutiveUser'))
  const val = localStorage.getItem('valueForProgressReportEmail')
  const [enabled, setEnabled] = useState(en)
  const [value, setValue] = useState(val)
  const handleEmailRadioChange = async e => {
    try {
      const res = await updateEmailNotification(e)
      if (res.type === 1) Toast.success(res.msg)
      else Toast.error(res.msg)
      localStorage.setItem('valueForProgressReportEmail', e)
      localStorage.setItem('progressReportForExecutiveUser', true)
      setValue(e)
    } catch (error) {
      Toast.error(error.msg)
    }
  }
  const onEnableChange = async e => {
    try {
      if (!e) {
        const res = await updateEmailNotification(0)
        if (res.type === 1) Toast.success(res.msg)
        else Toast.error(res.msg)
      }
      setEnabled(e)
      localStorage.setItem('progressReportForExecutiveUser', e)
    } catch (error) {
      Toast.error(error.msg)
    }
  }
  return (
    <div>
      <div className='pm-setting-title d-flex'>
        <EmailOutlinedIcon />
        <div className='title'> Configure Email Notifications</div>
      </div>
      <NotificationSettingConfig checked={enabled} setchecked={onEnableChange} title='Email Notification for Progress Report' desc='Select the time interval on which do you want the notification to be sent'>
        {enabled && (
          <>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Select the time when to receive Email</div>
              <div className='d-flex flex-row justify-content-between align-items-center'>
                <RadioGroup row aria-label='position' name='email-report' value={value} onChange={e => handleEmailRadioChange(e.target.value)}>
                  <FormControlLabel value='22' control={<Radio color='primary' />} label='Daily' className='radio-label-rep' />
                  <FormControlLabel value='23' control={<Radio color='primary' />} label='Weekly' className='radio-label-rep' />
                </RadioGroup>
              </div>
            </div>
          </>
        )}
      </NotificationSettingConfig>
    </div>
  )
}

export function ExecutivePMNotifications() {
  const exeSettings = JSON.parse(localStorage.getItem('userEmailNotificationConfigurationSettings'))
  const [enabled, setEnabled] = useState(_.isEmpty(exeSettings) ? false : exeSettings.executive_pm_due_not_resolved_email_notification === false ? false : true)
  const [time, setTime] = useState(_.isEmpty(exeSettings) ? 1 : exeSettings.disable_till || 1)
  const [span, setSpan] = useState(_.isEmpty(exeSettings) ? 39 : exeSettings.disable_till_by || 39)
  const [updating, setUpdating] = useState(false)
  //Disbale untill date
  const getDisableUntillDate = () => {
    if (_.isEmpty(exeSettings)) {
      // console.log('date not present')
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toISOString().split('T')[0]
    } else {
      const date = exeSettings.disabled_till_date.split('T')[0]
      return date
    }
  }
  const [disabledUntillDate, setDisabledUntillDate] = useState(getDisableUntillDate())
  //
  const onTimeChange = _time => {
    const date = new Date(new Date())
    span === 39 ? date.setDate(date.getDate() + 7 * _time) : date.setMonth(date.getMonth() + _time)
    setTime(_time)
    setDisabledUntillDate(date.toISOString().split('T')[0])
  }
  const onSpanChange = _span => {
    const date = new Date(new Date())
    _span === 39 ? date.setDate(date.getDate() + 7 * time) : date.setMonth(date.getMonth() + time)
    setSpan(_span)
    setDisabledUntillDate(date.toISOString().split('T')[0])
  }
  //
  const onStatusChange = e => {
    setEnabled(e)
    if (!e) return
    const payload = {
      executive_pm_due_not_resolved_email_notification: true,
      disable_till: null,
      disable_till_by: null,
    }
    update(payload)
  }
  //
  const updateSettings = () => {
    const payload = {
      executive_pm_due_not_resolved_email_notification: false,
      disable_till: time,
      disable_till_by: span,
    }
    update(payload)
  }
  //
  const update = async payload => {
    setUpdating(true)
    try {
      const res = await updateExecutivePMNotification(payload)
      console.log(res)
      if (res.success === 1) {
        Toast.success('Notification settings updated !')
        const newSettings = { ...exeSettings, ...payload, disabled_till_date: `${disabledUntillDate}T00:00:00` }
        localStorage.setItem('userEmailNotificationConfigurationSettings', JSON.stringify(newSettings))
      } else Toast.error(res.message)
      setUpdating(false)
    } catch (error) {
      setUpdating(false)
      Toast.error('Something went wrong !')
    }
  }

  return (
    <div>
      <div className='pm-setting-title d-flex'>
        <SettingsOutlined />
        <div className='title'> Configure PM Notifications</div>
      </div>
      <NotificationSettingConfig checked={enabled} setchecked={onStatusChange} title='PM Notifications' desc='Notification will be sent when the PM will become due as per its time/meter hour duration'>
        {!enabled && (
          <>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Select the time for which you want to disable the notification</div>
              <div className='d-flex flex-row justify-content-between align-items-center'>
                <input type='number' className={`minimal-input-base`} style={{ width: '75px', marginRight: '12px' }} min={0} value={time} onChange={e => onTimeChange(Number(e.target.value))} />
                <select value={span} onChange={e => onSpanChange(Number(e.target.value))} className='minimal-select-base'>
                  <option value={39}>Week(s)</option>
                  <option value={29}>Month(s)</option>
                </select>
              </div>
            </div>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Disabled till, {disabledUntillDate}</div>
              <Button size='small' variant='contained' color='primary' className='nf-buttons' onClick={() => updateSettings()} disableElevation>
                Update Settings
              </Button>
            </div>
          </>
        )}
      </NotificationSettingConfig>
      {updating && (
        <div className='disabled-settings d-flex flex-row justify-content-center align-items-center'>
          <div className='title'> Updating ....</div>
        </div>
      )}
    </div>
  )
}
