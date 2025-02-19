import React, { useState, useEffect, useRef } from 'react'
import ArrowDropDownOutlinedIcon from '@material-ui/icons/ArrowDropDownOutlined'
import Radio from '@material-ui/core/Radio'
import './components.css'
import { isEmpty } from 'lodash'

const StatusChangeRadioDropdown = ({ title, list = [], selected, onChange, valueKey, color, size, width = 160, isAlignLeft = false }) => {
  const padding = size === 'small' ? '2px 10px' : '2px 12px'
  const fontSize = size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px'
  const [open, setOpen] = useState(false)
  const [ddList, setDdList] = useState(list)
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  const handleClick = e => {
    e.stopPropagation()
    const { x, y } = e.currentTarget.getBoundingClientRect()
    setPos({ x, y })
    setOpen(true)
  }
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])
  useEffect(() => {
    setDdList(list)
  }, [list, open])

  return (
    <div id='_dropdown-menu'>
      <span style={{ padding, fontWeight: 800, borderRadius: size === 'small' ? '12px' : '15px', fontSize, background: `${color}21`, color, border: `1px solid ${color}`, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        {title}
        <span style={{ cursor: 'pointer', height: '16px', width: '12px' }} className='d-flex align-items-center'>
          <ArrowDropDownOutlinedIcon aria-haspopup='true' onClick={handleClick} />
        </span>
      </span>
      {open && (
        <div id='_menu-content' ref={ref} style={isAlignLeft ? { width: `${width}px`, left: `${pos.x + 10}px`, top: `${pos.y + 26}px` } : { width: `${width}px`, left: `${pos.x + 26 - width - 10}px`, top: `${pos.y + 26}px` }}>
          {isEmpty(ddList) ? (
            <div className='py-2 d-flex align-items-center'>
              <span className=' mr-2' style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#00000092', minWidth: '325px', width: 'max-content' }}>
                No results found !
              </span>
            </div>
          ) : (
            ddList.map((value, key) => {
              return (
                <div
                  className='d-flex align-items-center'
                  onClick={e => {
                    setOpen(false)
                  }}
                  key={key}
                >
                  <Radio checked={selected === value[valueKey]} onChange={() => onChange(value)} value={value[valueKey]} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                  <span className=' mr-2' style={{ fontSize: '14px', fontWeight: 800, color: '#000' }}>
                    {value[valueKey]}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default StatusChangeRadioDropdown
