import React, { useState, useEffect, useRef } from 'react'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { MinimalInput } from 'components/Assets/components'
import Radio from '@material-ui/core/Radio'
import { useTheme } from '@material-ui/core/styles'

import './components.css'
import { get, isEmpty } from 'lodash'

const RadioDropdown = ({ title, searchPlaceholder = 'Search', list = [], selected, onChange, valueKey, header, hasDefaultButton = true, defaultButtonValue, handleDefaultButtonClick, noSearch = false }) => {
  const [open, setOpen] = useState(false)
  const [ddList, setDdList] = useState(list)
  const ref = useRef(null)
  const theme = useTheme()
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])
  useEffect(() => {
    setDdList(list)
  }, [list, open])

  const handleSearchOnChange = v => {
    const l = list.filter(d => d[valueKey].toLowerCase().includes(v.toLowerCase()))
    setDdList(l)
  }
  return (
    <div style={{ position: 'relative' }}>
      <div className='rd-title-container d-flex'>
        <span>{title}</span>
        <ArrowDropDownIcon aria-controls='simple-menu-site' aria-haspopup='true' onClick={() => setOpen(true)} style={{ cursor: 'pointer' }} />
      </div>
      {open && (
        <div ref={ref} className='rd-pop-up-container'>
          <div className='rd-pop-up-title' style={{ background: '#eee' }}>
            {header}
          </div>
          {!noSearch && (
            <div className='p-2'>
              <MinimalInput onChange={handleSearchOnChange} placeholder={searchPlaceholder} baseStyles={{ margin: 0 }} />
            </div>
          )}
          <div className='table-responsive flex-column dashboardtblScroll d-flex' id='style-1' style={{ maxHeight: '350px', height: 'auto' }}>
            {isEmpty(ddList) ? (
              <div className='py-2 d-flex align-items-center'>
                <span className=' mr-2' style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#00000092', minWidth: '325px', width: 'max-content' }}>
                  No results found !
                </span>
              </div>
            ) : (
              ddList
                .slice()
                .sort((a, b) => {
                  const labelA = get(a, valueKey, '').toLowerCase()
                  const labelB = get(b, valueKey, '').toLowerCase()
                  return labelA < labelB ? -1 : labelA > labelB ? 1 : 0
                })
                .map((value, key) => {
                  return (
                    <div key={key} className='d-flex align-items-center justify-content-between'>
                      <div className='d-flex align-items-center'>
                        <Radio checked={selected === value[valueKey]} onChange={() => onChange(value)} value={value[valueKey]} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                        <span className=' mr-2' style={{ fontSize: '14px', fontWeight: 800, color: '#000', minWidth: '225px', width: 'max-content' }}>
                          {value[valueKey]}
                        </span>
                      </div>
                      {hasDefaultButton && (
                        <button
                          onClick={() => handleDefaultButtonClick(value)}
                          className='dont-send-button rounded px-2 py-1'
                          style={{ color: defaultButtonValue === value[valueKey] ? '#fff' : '#a3a3a3', background: defaultButtonValue === value[valueKey] ? theme.palette.primary.main : '#eee', fontSize: '9px', width: 'max-content', marginRight: '10px' }}
                          disabled={defaultButtonValue === value[valueKey]}
                        >
                          {defaultButtonValue === value[valueKey] ? 'Default' : 'Set as Default'}
                        </button>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RadioDropdown
