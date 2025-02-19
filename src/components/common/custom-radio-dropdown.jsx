import { useState, useEffect, useRef } from 'react'

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import BusinessOutlined from '@material-ui/icons/BusinessOutlined'
import { MinimalInput } from 'components/Assets/components'
import Radio from '@material-ui/core/Radio'
import { useTheme } from '@material-ui/core/styles'

import './components.css'
import { isEmpty } from 'lodash'

import { CircularProgress } from '@material-ui/core'

const RadioDropdown = ({ title, subTitle, searchPlaceholder = 'Search', list = [], selected, onChange, valueKey, header, hasDefaultButton = true, defaultButtonValue, handleDefaultButtonClick, getUserFacilitiesData, noSearch = false, loading = false, isFromSuperAdmin = false, isFormDetails = true }) => {
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
    if (open && !isFromSuperAdmin) {
      getUserFacilitiesData()
    }
    return () => {}
  }, [open])

  useEffect(() => {
    setDdList(list)
  }, [list, open])

  const handleSearchOnChange = v => {
    const l = list.filter(d => d[valueKey].toLowerCase().includes(v.toLowerCase()))
    setDdList(l)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className='rd-title-container d-flex align-items-center'>
        <BusinessOutlined />
        <div className='d-flex flex-column align-items-end mr-2 ml-2'>
          <div className={open ? '' : 'rd-text'} style={{ fontSize: '12px', display: 'none' }}>
            Facility
          </div>
          <div style={{ fontSize: '10px' }}>{title}</div>
          <div style={{ fontSize: '12px', fontWeight: 600 }}>{subTitle}</div>
        </div>
        {isFormDetails && <ArrowDropDownIcon aria-controls='simple-menu-site' aria-haspopup='true' onClick={() => setOpen(true)} style={{ cursor: 'pointer' }} />}
      </div>
      {open && isFormDetails && (
        <div ref={ref} className='rd-pop-up-container'>
          <div className='rd-pop-up-title' style={{ background: '#eee' }}>
            <div className='d-flex justify-content-between align-items-center'>
              {header}
              {loading && <CircularProgress size={18} thickness={5} />}
            </div>
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
              ddList.slice().map((value, key) => {
                return (
                  <div key={key} className='d-flex align-items-center justify-content-between' style={{ minWidth: '205px' }}>
                    <div className='d-flex align-items-center'>
                      <Radio checked={selected === value[valueKey]} onChange={() => onChange(value)} value={value[valueKey]} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                      <span className='mr-2' style={{ fontSize: '14px', fontWeight: 800, color: '#646464', minWidth: '205px', width: 'max-content' }}>
                        {value[valueKey].split('->')[0]}
                        <span style={{ fontSize: '12px', marginLeft: '4px', paddingRight: '10px' }}>
                          {'-> '}
                          {value[valueKey].split('->')[1]}
                        </span>
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
