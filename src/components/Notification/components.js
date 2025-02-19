import React from 'react'
import Switch from 'react-switch'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined'
import { useTheme } from '@material-ui/core/styles'

export const NotificationSettingItem = ({ title, desc, checked, setchecked, OnClick, active, noSwitch }) => (
  <div onClick={OnClick} className={`notf-settings-list-item ${active ? 'active-item' : ''}`}>
    <div className='d-flex flex-row justify-content-between align-items-center mb-2 '>
      <div className='notification-card-title ni-settings-title'>{title}</div>
      {!noSwitch && <CustomSwitch checked={checked} setchecked={setchecked} />}
    </div>
    <div className='notification-card-desc desc ni-settings-title-desc'>{desc} </div>
  </div>
)
export const NotificationSettingConfig = ({ title, desc, checked, setchecked, disabled, children }) => (
  <div className='notf-settings-list-item pm-setting-title'>
    <div className='d-flex flex-row justify-content-between align-items-center mb-2 '>
      <div className='notification-card-title ni-settings-title'>{title}</div>
      <CustomSwitch checked={checked} setchecked={setchecked} disabled={disabled} />
    </div>
    <div className='notification-card-desc desc ni-settings-title-desc'>{desc}</div>
    {children}
  </div>
)

export const CustomSwitch = ({ checked, setchecked, disabled }) => {
  const theme = useTheme()
  return <Switch onChange={setchecked} disabled={disabled} offColor='#929292' onColor={theme.palette.primary.main} height={20} width={30} checked={checked} checkedIcon={false} uncheckedIcon={false} />
}

export const ErrorDiv = ({ msg, w }) => (
  <div className='d-flex flex-row align-items-center error' style={w ? { width: `${w}%` } : { width: 'auto' }}>
    <ReportProblemOutlinedIcon fontSize='small' />
    <div className='notification-card-desc ni-settings-title-desc error-msg'>{msg}</div>
  </div>
)
