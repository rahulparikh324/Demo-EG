import React from 'react'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import { useTheme } from '@material-ui/core/styles'
import './components.css'

export const MinimalButton = ({ text, baseClassName, loadingText, fitContent, loading, style, ...props }) => (
  <Button {...props} className={`nf-buttons ${baseClassName}`} disableElevation style={fitContent ? { height: `fit-content`, ...style } : { height: 'auto', ...style }}>
    {loading ? loadingText : text}
    {loading && <CircularProgress size={20} thickness={5} style={{ color: '#fff', marginLeft: '10px' }} />}
  </Button>
)

export const ActionButton = ({ isLoading, action, icon, tooltip, disabled, style = {}, tooltipPlacement = 'top', hide, btnRef }) => {
  if (isLoading) return <CircularProgress size={19} thickness={5} style={{ marginRight: '6px', marginLeft: '6px' }} />
  if (hide) return <span style={{ height: '26px', width: '26px' }}></span>
  return (
    <Tooltip title={tooltip} placement={tooltipPlacement} ref={btnRef}>
      <IconButton size='small' onClick={action} disabled={disabled} style={style}>
        {icon}
      </IconButton>
    </Tooltip>
  )
}

export const FloatingButton = ({ isLoading, onClick, icon, tooltip, style, disabled }) => {
  const theme = useTheme()
  const styles = { ...style, background: disabled ? '#0000001f' : theme.palette.primary.main, color: disabled ? '#000' : '#fff', opacity: disabled ? 0.5 : 1 }
  if (isLoading)
    return (
      <div style={{ ...style, background: theme.palette.primary.main, borderRadius: '50px', padding: '9px' }}>
        <CircularProgress size={24} thickness={5} style={{ color: '#fff' }} />
      </div>
    )
  return (
    <IconButton onClick={onClick} size='small' style={styles} disabled={disabled}>
      {icon}
    </IconButton>
  )
}

export const MinimalButtonGroup = ({ value, onChange, label, w, options, baseStyles = {}, disabled, disableCustomClass = '' }) => {
  const theme = useTheme()
  const activeStyle = { color: '#fff', background: theme.palette.primary.main, opacity: disabled ? 0.75 : 1 }
  const inActiveStyle = { color: '#606060', background: '#fff', opacity: disabled ? 0.75 : 1 }
  return (
    <div className='minimal-input' style={w ? { width: `${w}%`, ...baseStyles } : { width: 'auto', ...baseStyles }}>
      <div className={`minimal-input-label ${disabled ? 'disabled-label' : ''}`}>{label}</div>
      <div className='d-flex'>
        {options.map(opt => (
          <button key={opt.label} style={value === opt.value ? { ...activeStyle, background: opt.color ? opt.color : theme.palette.primary.main } : inActiveStyle} className={`minimal-input-base ${opt.isDisable ? disableCustomClass : ''}`} disabled={disabled || opt.isDisable} onClick={() => onChange(opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const MinimalCircularButtonGroup = ({ value, onChange, label, w, options, baseStyles = {}, disabled, disableCustomClass = '' }) => {
  const theme = useTheme()
  const activeStyle = { color: '#fff', background: theme.palette.primary.main, opacity: disabled ? 0.75 : 1 }
  const inActiveStyle = { color: '#606060', background: '#fff', opacity: disabled ? 0.75 : 1 }
  return (
    <div className='minimal-input circular-tab-input' style={w ? { width: `${w}%`, ...baseStyles } : { width: 'auto', ...baseStyles }}>
      <div className={`minimal-input-label ${disabled ? 'disabled-label' : ''}`}>{label}</div>
      <div className='d-flex circular-tab'>
        {options.map(opt => (
          <button key={opt.label} style={value === opt.value ? { ...activeStyle, background: opt.color ? opt.color : theme.palette.primary.main } : inActiveStyle} className={`minimal-input-base ${opt.isDisable ? disableCustomClass : ''}`} disabled={disabled || opt.isDisable} onClick={() => onChange(opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
