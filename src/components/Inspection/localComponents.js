import React from 'react'
import { useTheme } from '@material-ui/core/styles'

const styles = {
  labelStyle: { fontWeight: 800, fontSize: '11px', color: '#a1a1a1' },
  OkNotOKAttr: { width: '50%', padding: '8px', fontSize: '10px', fontWeight: 800, borderRadius: '2px' },
}

export const OkNotOkAttControl = ({ label, value, enable, onChange, disabled }) => {
  const theme = useTheme()
  const OKStyle = value === 'OK' ? { color: '#fff', background: theme.palette.primary.main } : {}
  const notOKStyle = value === 'NOT_OK' ? { color: '#fff', background: disabled ? '#f44336aa' : '#f44336' } : {}
  const handleClick = val => {
    if (!enable || disabled) return
    onChange(val)
  }

  return (
    <div className='d-flex flex-column justify-content-between'>
      <div style={styles.labelStyle}>{label}</div>
      <div className='d-flex bg-white' style={{ padding: '6px', borderRadius: '4px', width: '125px', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <div onClick={() => handleClick('Ok')} className='d-flex justify-content-center align-items-center' style={{ ...styles.OkNotOKAttr, ...OKStyle }}>
          OK
        </div>
        <div onClick={() => handleClick('Not Ok')} className='d-flex justify-content-center align-items-center' style={{ ...styles.OkNotOKAttr, ...notOKStyle }}>
          NOT OK
        </div>
      </div>
    </div>
  )
}

export const LRCAttControl = ({ label, value, enable, onChange }) => {
  const theme = useTheme()
  const Style = { color: '#fff', background: theme.palette.primary.main, cursor: 'pointer' }
  const handleClick = () => {
    if (!enable) return
    onChange()
  }
  return (
    <div className='d-flex flex-column justify-content-between'>
      <div style={styles.labelStyle}>{label}</div>
      <div className='d-flex bg-white' style={{ padding: '6px', borderRadius: '4px', width: '185px' }}>
        <div onClick={handleClick} className='d-flex justify-content-center align-items-center' style={value === 'LEFT' ? { ...styles.OkNotOKAttr, ...Style } : styles.OkNotOKAttr}>
          LEFT
        </div>
        <div onClick={handleClick} className='d-flex justify-content-center align-items-center' style={value === 'CENTER' ? { ...styles.OkNotOKAttr, ...Style } : styles.OkNotOKAttr}>
          CENTER
        </div>
        <div onClick={handleClick} className='d-flex justify-content-center align-items-center' style={value === 'RIGHT' ? { ...styles.OkNotOKAttr, ...Style } : styles.OkNotOKAttr}>
          RIGHT
        </div>
      </div>
    </div>
  )
}
