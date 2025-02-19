import React, { useState, useEffect } from 'react'
import { NotificationSettingConfig, ErrorDiv } from '../../Notification/components'
import Button from '@material-ui/core/Button'
import addUpdateAssetPMNotification from '../../../Services/Asset/updateAssetPMNotifications'
import getAssetPMNotifications from '../../../Services/Asset/getAssetPMNotifications'
import { Toast } from '../../../Snackbar/useToast'
import DialogPrompt from '../../DialogPrompt'

function PMNotifications({ assetId }) {
  const [firstNotification, setFirstNotification] = useState(false)
  const [firstNotificationError, setFirstNotificationError] = useState(false)
  const [firstNotificationErrorMsg, setFirstNotificationErrorMsg] = useState('')
  const [firstNotificationTimeError, setFirstNotificationTimeError] = useState(false)
  const [firstNotificationMHError, setFirstNotificationMHError] = useState(false)
  const [secondNotification, setSecondNotification] = useState(false)
  const [secondNotificationError, setSecondNotificationError] = useState(false)
  const [secondNotificationErrorMsg, setSecondNotificationErrorMsg] = useState('')
  const [secondNotificationTimeError, setSecondNotificationTimeError] = useState(false)
  const [secondNotificationMHError, setSecondNotificationMHError] = useState(false)
  const [onDueNotification, setOnDueNotification] = useState(true)
  const [firstNotificationTime, setFirstNotificationTime] = useState(1)
  const [firstNotificationSpan, setFirstNotificationSpan] = useState(2)
  const [secondNotificationSpan, setSecondNotificationSpan] = useState(1)
  const [firstNotificationMH, setFirstNotificationMH] = useState(100)
  const [secondNotificationMH, setSecondNotificationMH] = useState(150)
  const [secondNotificationMHMAX, setSecondNotificationMHMAX] = useState(0)
  const [secondNotificationTime, setSecondNotificationTime] = useState(2)
  const [secondNotificationTimeMax, setSecondNotificationTimeMax] = useState(0)
  const optionsForFirtsNF = [
    { value: 2, label: 'Months' },
    { value: 1, label: 'Weeks' },
    { value: 0, label: 'Days' },
  ]
  const [optionsForSecondNF, setOptionsForSecondNF] = useState(optionsForFirtsNF.filter(d => d.value <= firstNotificationSpan))
  const [openReset, setOpenReset] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataReceived, setDataReceived] = useState(false)
  //
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const nfs = await getAssetPMNotifications(assetId)
        // console.log(nfs.data)
        setFirstNotification(nfs.data.first_reminder_before_on_status === 1)
        setFirstNotificationTime(nfs.data.first_reminder_before_on)
        const fS = nfs.data.first_reminder_before_on_type === 29 ? 2 : nfs.data.first_reminder_before_on_type === 39 ? 1 : 0
        setFirstNotificationSpan(fS)
        setFirstNotificationMH(nfs.data.first_reminder_before_on_meter_hours)
        setSecondNotification(nfs.data.second_reminder_before_on_status === 1)
        setSecondNotificationTime(nfs.data.second_reminder_before_on)
        setSecondNotificationSpan(nfs.data.second_reminder_before_on_type === 29 ? 2 : nfs.data.second_reminder_before_on_type === 39 ? 1 : 0)
        setSecondNotificationMH(nfs.data.second_reminder_before_on_meter_hours)
        setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value <= fS))
        setLoading(false)
        setDataReceived(true)
      } catch (error) {
        setLoading(false)
      }
    })()
  }, [assetId])
  //
  //
  useEffect(() => {
    if (dataReceived) {
      if (firstNotification) {
        if (Number(firstNotificationTime) === 1) {
          // console.log('time is one')
          if (firstNotificationSpan === 2) {
            setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value < firstNotificationSpan))
            if (secondNotificationSpan === 0) {
              setSecondNotificationTimeMax(29)
              setSecondNotificationTime(29)
            } else {
              setSecondNotificationTime(3)
              setSecondNotificationTimeMax(3)
            }
          }
          if (firstNotificationSpan === 1) {
            setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value < firstNotificationSpan))
            setSecondNotificationTimeMax(6)
            setSecondNotificationTime(6)
          }
          if (firstNotificationSpan === 0) {
            setSecondNotification(false)
          }
        }
        if (firstNotificationSpan === 0) {
          setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value <= firstNotificationSpan))
          setSecondNotificationSpan(optionsForFirtsNF.filter(d => d.value <= firstNotificationSpan)[0].value)
          setSecondNotificationTimeMax(Number(firstNotificationTime) - 1)
          setSecondNotificationTime(Number(firstNotificationTime) - 1)
          if (firstNotificationTime === 1) setSecondNotification(false)
        }
        if (firstNotificationSpan === 2 && Number(firstNotificationTime) !== 1) {
          setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value <= firstNotificationSpan))
          if (secondNotificationSpan === 2) {
            setSecondNotificationTimeMax(Number(firstNotificationTime) - 1)
            setSecondNotificationTime(Number(firstNotificationTime) - 1)
          }
          if (secondNotificationSpan === 1) {
            setSecondNotificationTimeMax(Number(firstNotificationTime) * 4 - 1)
            setSecondNotificationTime(Number(firstNotificationTime) * 4 - 1)
          }
          if (secondNotificationSpan === 0) {
            setSecondNotificationTimeMax(Number(firstNotificationTime) * 30 - 1)
            setSecondNotificationTime(Number(firstNotificationTime) * 30 - 1)
          }
        }
        if (firstNotificationSpan === 1 && Number(firstNotificationTime) !== 1) {
          setOptionsForSecondNF(optionsForFirtsNF.filter(d => d.value <= firstNotificationSpan))
          if (secondNotificationSpan === 1) {
            setSecondNotificationTimeMax(Number(firstNotificationTime) - 1)
            setSecondNotificationTime(Number(firstNotificationTime) - 1)
          }
          if (secondNotificationSpan === 0) {
            setSecondNotificationTimeMax(Number(firstNotificationTime) * 7 - 1)
            setSecondNotificationTime(Number(firstNotificationTime) * 7 - 1)
          }
        }
        if (firstNotificationMH) {
          setSecondNotificationMHMAX(firstNotificationMH - 1)
        }
      } else {
        setOptionsForSecondNF(optionsForFirtsNF)
        setSecondNotificationTimeMax(null)
        setSecondNotificationMHMAX(null)
      }
      if (firstNotificationError) {
        if (firstNotificationTime !== 0 && firstNotificationMH !== 0 && firstNotificationTime !== '' && firstNotificationMH !== '') setFirstNotificationError(false)
        if (Number(firstNotificationTime) !== 0 && firstNotificationTime !== '') setFirstNotificationTimeError(false)
        if (Number(firstNotificationMH) !== 0 && firstNotificationMH !== '') setFirstNotificationMHError(false)
      }
    }
  }, [firstNotificationSpan, firstNotificationTime, secondNotificationSpan, firstNotificationMH, firstNotification])

  const validateSettings = () => {
    const firstNotifError = checkFirstNotifNonEmpty()
    const secondNotifError = checkSecondNotifNonEmpty()
    if (!firstNotification && !secondNotification) generateRequestBody()
    else if (firstNotification && !secondNotification && !firstNotifError) generateRequestBody()
    else if (!firstNotification && secondNotification && !secondNotifError) generateRequestBody()
    else if (!firstNotifError && !secondNotifError && secondNotification && firstNotification) {
      const timeCompError = checkSecondNotificationTimeGreaterError()
      if (!timeCompError) generateRequestBody()
    }
  }

  const checkFirstNotifNonEmpty = () => {
    if (!firstNotification) return false
    if (Number(firstNotificationTime) < 1 || Number(firstNotificationMH) < 1 || firstNotificationTime === '' || firstNotificationMH === '') {
      setFirstNotificationError(true)
      setFirstNotificationErrorMsg('Configuration details cannot be empty or zero or negative !')
      if (Number(firstNotificationTime) < 1 || firstNotificationTime === '') setFirstNotificationTimeError(true)
      else setFirstNotificationTimeError(false)
      if (Number(firstNotificationMH) < 1 || firstNotificationMH === '') setFirstNotificationMHError(true)
      else setFirstNotificationMHError(false)
      return true
    } else {
      setFirstNotificationError(false)
      setFirstNotificationTimeError(false)
      setFirstNotificationMHError(false)
      return false
    }
  }

  const checkSecondNotifNonEmpty = () => {
    if (!secondNotification) return false
    if (Number(secondNotificationTime) < 1 || Number(secondNotificationMH) < 1 || secondNotificationTime === '' || secondNotificationMH === '') {
      setSecondNotificationError(true)
      setSecondNotificationErrorMsg('Configuration details cannot be empty or zero or negative !')
      if (Number(secondNotificationTime) < 1 || secondNotificationTime === '') setSecondNotificationTimeError(true)
      else setSecondNotificationTimeError(false)
      if (Number(secondNotificationMH) < 1 || secondNotificationMH === '') setSecondNotificationMHError(true)
      else setSecondNotificationMHError(false)
      return true
    } else {
      setSecondNotificationError(false)
      setSecondNotificationTimeError(false)
      setSecondNotificationMHError(false)
      return false
    }
  }

  const checkSecondNotificationTimeGreaterError = () => {
    const firstMultiplier = Number(firstNotificationSpan) === 2 ? 30 : Number(firstNotificationSpan) === 1 ? 7 : 1
    const firstTime = Number(firstNotificationTime) * firstMultiplier
    const secMultiplier = Number(secondNotificationSpan) === 2 ? 30 : Number(secondNotificationSpan) === 1 ? 7 : 1
    const secTime = Number(secondNotificationTime) * secMultiplier
    // console.log(firstTime, secTime)
    if (firstNotification && secTime > firstTime) {
      setSecondNotificationError(true)
      setSecondNotificationErrorMsg('Specified time cannot be greater than the time in First Notification !!')
      setSecondNotificationTimeError(true)
      return true
    } else {
      setSecondNotificationTimeError(false)
      const mHCompError = checkSecondNotificationMHGreaterError()
      return mHCompError
    }
  }

  const checkSecondNotificationMHGreaterError = () => {
    if (secondNotification && firstNotification) {
      if (Number(secondNotificationMH) > Number(firstNotificationMH)) {
        setSecondNotificationError(true)
        setSecondNotificationErrorMsg('Specified MHrs cannot be greater than the MHrs in First Notification !!')
        setSecondNotificationMHError(true)
        return true
      } else {
        setSecondNotificationError(false)
        setSecondNotificationMHError(false)
        return false
      }
    } else return false
  }

  const onChangeFirstTimeSpan = value => {
    setFirstNotificationSpan(value)
    if (Number(firstNotificationTime) === 1) {
      if (secondNotificationSpan === 0) setSecondNotificationSpan(0)
      if (secondNotificationSpan === 1) setSecondNotificationSpan(0)
      if (secondNotificationSpan === 2) setSecondNotificationSpan(1)
    } else {
      if (secondNotificationSpan === 0) setSecondNotificationSpan(0)
      if (secondNotificationSpan === 1) setSecondNotificationSpan(1)
      if (secondNotificationSpan === 2) setSecondNotificationSpan(2)
    }
  }

  const generateRequestBody = async (first = firstNotification, second = secondNotification) => {
    const fN = first
    const sN = second
    // console.log(fN, sN)
    const payload = {
      asset_id: assetId,
      first_reminder_before_on_status: fN ? 1 : 2,
      first_reminder_before_on: Number(firstNotificationTime),
      first_reminder_before_on_type: firstNotificationSpan === 2 ? 29 : firstNotificationSpan === 1 ? 39 : 40,
      second_reminder_before_on_status: sN ? 1 : 2,
      second_reminder_before_on: Number(secondNotificationTime),
      second_reminder_before_on_type: secondNotificationSpan === 2 ? 29 : secondNotificationSpan === 1 ? 39 : 40,
      due_at_reminder_status: 1,
      first_reminder_before_on_meter_hours_status: fN ? 1 : 2,
      first_reminder_before_on_meter_hours: Number(firstNotificationMH),
      second_reminder_before_on_meter_hours_status: sN ? 1 : 2,
      second_reminder_before_on_meter_hours: Number(secondNotificationMH),
      due_at_reminder_meter_hours_status: 1,
      status: 1,
      //company_pm_notification_configuration: config.company_pm_notification_configuration,
    }
    setUpdating(true)
    try {
      const res = await addUpdateAssetPMNotification(payload)
      // console.log(payload)
      setUpdating(false)
      if (res.success > 0) Toast.success('Configurations updated successfully !')
      else Toast.error('Something went wrong !')
    } catch (error) {
      console.log(error)
      setUpdating(false)
      Toast.error('Something went wrong !')
    }
  }

  const onReset = async () => {
    setFirstNotification(false)
    setSecondNotification(false)
    setOpenReset(false)
    generateRequestBody(false, false)
    //validateSettings()
  }
  //
  return (
    <div style={{ position: 'relative' }}>
      <div className='pm-setting-title d-flex' style={{ padding: '20px 16px' }}>
        <div className='title'>PM Notifications</div>
      </div>
      <NotificationSettingConfig checked={firstNotification} setchecked={setFirstNotification} title='First notification' desc='Select the time range and meter hours before which do you want the first notification to be sent'>
        {firstNotification && (
          <>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Select the time and duration before notification is to be sent </div>
              <div className='d-flex flex-row justify-content-between align-items-center'>
                <input type='number' className={`minimal-input-base  ${firstNotificationTimeError && 'error-input'}`} style={{ width: '75px', marginRight: '12px' }} min={0} value={firstNotificationTime} onChange={e => setFirstNotificationTime(e.target.value)} />
                <select value={firstNotificationSpan} onChange={e => onChangeFirstTimeSpan(Number(e.target.value))} className='minimal-select-base'>
                  {optionsForFirtsNF.map(op => (
                    <option value={op.value} key={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Enter the meter hours duration before notification is to be sent </div>
              <input type='number' className={`minimal-input-base  ${firstNotificationMHError && 'error-input'}`} style={{ width: '105px' }} min={0} value={firstNotificationMH} onChange={e => setFirstNotificationMH(e.target.value)} />
            </div>
            {firstNotificationError && <ErrorDiv msg={firstNotificationErrorMsg} />}
          </>
        )}
      </NotificationSettingConfig>
      <NotificationSettingConfig checked={secondNotification} setchecked={setSecondNotification} title='Second notification' desc='Select the time range and meter hours before which do you want the notification to be sent'>
        {secondNotification && (
          <>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Select the time and duration before notification is to be sent </div>
              <div className='d-flex flex-row justify-content-between align-items-center'>
                <input type='number' className={`minimal-input-base  ${secondNotificationTimeError && 'error-input'}`} style={{ width: '75px', marginRight: '12px' }} max={secondNotificationTimeMax} min={0} value={secondNotificationTime} onChange={e => setSecondNotificationTime(e.target.value)} />
                <select value={secondNotificationSpan} onChange={e => setSecondNotificationSpan(Number(e.target.value))} className='minimal-select-base'>
                  {optionsForSecondNF.map(op => (
                    <option value={op.value} key={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='d-flex flex-row justify-content-between align-items-center mt-4'>
              <div className='notification-card-desc desc ni-settings-title-desc'>Enter the meter hours duration before notification is to be sent </div>
              <input type='number' className={`minimal-input-base ${secondNotificationMHError && 'error-input'}`} style={{ width: '105px' }} min={0} max={secondNotificationMHMAX} value={secondNotificationMH} onChange={e => setSecondNotificationMH(e.target.value)} />
            </div>
            {secondNotificationError && <ErrorDiv msg={secondNotificationErrorMsg} />}
            {/* {secondNotificationTimeError && <ErrorDiv msg='Specified values cannot be greater than the Time in First Notification !' />} */}
          </>
        )}
      </NotificationSettingConfig>
      <NotificationSettingConfig checked={onDueNotification} setchecked={setOnDueNotification} title='On due notification' desc='Notification will be sent when the PM will become due as per its time/meter hour duration' disabled />
      <div className='pm-setting-title d-flex flex-row  align-items-center '>
        <Button variant='contained' color='primary' className='nf-buttons' onClick={() => validateSettings()} disableElevation style={{ marginRight: '15px' }}>
          Update Settings
        </Button>
        <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => setOpenReset(true)}>
          Reset
        </Button>
        <DialogPrompt title='Reset PM Configurations' text='Are you sure you want to reset the PM Configurations to default ?' ctaText='Reset' open={openReset} action={onReset} handleClose={() => setOpenReset(false)} />
      </div>
      {updating && (
        <div className='disabled-settings d-flex flex-row justify-content-center align-items-center'>
          <div className='title'> Updating ....</div>
        </div>
      )}
      {loading && (
        <div className='disabled-settings d-flex flex-row justify-content-center align-items-center'>
          <div className='title'> Loading ....</div>
        </div>
      )}
    </div>
  )
}

export default PMNotifications
