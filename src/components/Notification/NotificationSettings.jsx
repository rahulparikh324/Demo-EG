import React, { useState, useEffect } from 'react'
import PMNotificationSettings from './PMNotificationSettings'
import { ManagerEmailNotifications, ManagerPMNotifications } from './ManagerNotifications'
import { ExecutiveEmailNotifications, ExecutivePMNotifications } from './ExecutiveNotifications'
import { NotificationSettingItem } from './components'
import getUserRole from '../../helpers/getUserRole'
import getPMNotificationConfig from '../../Services/getPMNotificationConfig'
import _ from 'lodash'
import './notification.css'
import updatePMNotificationConfig from '../../Services/updatePMNotification'
import { Toast } from '../../Snackbar/useToast'
import DialogPrompt from '../DialogPrompt'

function NotificationSettings() {
  const [pmNotifications, setPMNotifications] = useState(false)
  const checkUserRole = new getUserRole()
  const [active, setActive] = useState(checkUserRole.isExecutive() ? 'PR' : 'PM')
  const [title, setTitle] = useState('loading')
  const [desc, setDesc] = useState('loading......')
  const [config, setConfig] = useState({})
  const [open, setOpen] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        if (checkUserRole.isCompanyAdmin()) {
          const configx = await getPMNotificationConfig()
          setConfig(configx.data)
          setPMNotifications(configx.data.status === 1 ? true : false)
          setTitle('PM notifications')
          setDesc('Select how the managers will be notified when the PM item will become due. This will be applicable to all the manager across company')
        }
      } catch (error) {}
    })()
  }, [])
  const onChangePMNotificationToggle = e => {
    if (!e) setOpen(true)
    else setPMNotifications(e)
  }
  const onDisable = async () => {
    try {
      const payload = { ...config, status: 2 }
      const res = await updatePMNotificationConfig(payload)
      // console.log(res)
      if (res.success > 0) {
        Toast.success('Configurations updated successfully !')
        setPMNotifications(false)
        setOpen(false)
      } else {
        setOpen(false)
        Toast.error('Something went wrong !')
      }
    } catch (error) {
      console.log(error)
      setOpen(false)
      Toast.error('Something went wrong !')
    }
  }
  return (
    <div className='row mx-0' style={{ height: '92vh', background: '#fff' }}>
      <div className='col-4 px-0 notf-settings-list-container'>
        {checkUserRole.isCompanyAdmin() && <NotificationSettingItem active={active === 'PM'} checked={pmNotifications} OnClick={() => setActive('PM')} setchecked={onChangePMNotificationToggle} title={title} desc={desc} />}
        {checkUserRole.isManager() && <NotificationSettingItem active={active === 'PM'} OnClick={() => setActive('PM')} title='PM notifications' desc='Select how the you will be notified when the PM item will become due.' noSwitch />}
        {checkUserRole.isManager() && <NotificationSettingItem active={active === 'Email'} OnClick={() => setActive('Email')} title='Email notifications' desc='Select how the you will be notified when the reports will be sent.' noSwitch />}
        {checkUserRole.isExecutive() && <NotificationSettingItem active={active === 'PR'} OnClick={() => setActive('PR')} title='Email notifications' desc='Select how the you will be notified when the reports will be sent.' noSwitch />}
        {checkUserRole.isExecutive() && <NotificationSettingItem active={active === 'PRM'} OnClick={() => setActive('PRM')} title='PM notifications' desc='Select how the you will be notified when the PM item will become due.' noSwitch />}
      </div>
      <div className='col-8 px-0'>
        {active === 'PM' && checkUserRole.isCompanyAdmin() && !_.isEmpty(config) && <PMNotificationSettings config={config} enabled={pmNotifications} />}
        {active === 'Email' && checkUserRole.isManager() && <ManagerEmailNotifications />}
        {active === 'PM' && checkUserRole.isManager() && <ManagerPMNotifications />}
        {active === 'PR' && checkUserRole.isExecutive() && <ExecutiveEmailNotifications />}
        {active === 'PRM' && checkUserRole.isExecutive() && <ExecutivePMNotifications />}
        <DialogPrompt title='Disable Notification' text='Are you sure you want to disable the PM notications for across company ?' open={open} ctaText='Disable' action={onDisable} handleClose={() => setOpen(false)} />
      </div>
    </div>
  )
}

export default NotificationSettings
