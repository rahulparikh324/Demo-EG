import React from 'react'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'

export const PriorityControl = ({ value, onChange }) => {
  const getClass = key => (key === 'low' ? (value === 45 ? 'priority-button active-priority pr-low' : 'priority-button') : key === 'mid' ? (value === 46 ? 'priority-button active-priority pr-mid' : 'priority-button') : value === 47 ? 'priority-button active-priority pr-high' : 'priority-button')

  return (
    <div style={{ margin: '8px 0' }}>
      <div style={{ marginBottom: '2px', fontSize: '13px', fontWeight: 800 }}>Priority</div>
      <div className='d-flex priority-controls'>
        <button className={getClass('low')} onClick={() => onChange(45)}>
          Low
        </button>
        <button className={getClass('mid')} onClick={() => onChange(46)}>
          Medium
        </button>
        <button className={getClass('high')} onClick={() => onChange(47)}>
          High
        </button>
      </div>
    </div>
  )
}

export const NavigatLinkToNewTab = ({ title, func, children, style }) => (
  <div className='px-3 py-2 my-2 d-flex flex-row justify-content-between align-items-center bg-white hover' style={{ cursor: 'pointer', borderRadius: '4px', border: '1px solid #e5e5e5', ...style }} onClick={func}>
    <div>
      <span className='form-acc-title acc-cont-title' style={{ background: 'transparent' }}>
        {title}
      </span>
      <div className=''>{children}</div>
    </div>
    <span>
      <ArrowForwardIosIcon fontSize='small' />
    </span>
  </div>
)
