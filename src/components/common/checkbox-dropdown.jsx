import React, { useState, useEffect, useRef } from 'react'
import { MinimalInput } from 'components/Assets/components'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import BusinessOutlined from '@material-ui/icons/BusinessOutlined'
import RotateLeftSharpIcon from '@material-ui/icons/RotateLeftSharp'
import Radio from '@material-ui/core/Radio'
import { Checkbox, CircularProgress, Divider } from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import { get, isEmpty } from 'lodash'
import { MinimalButton } from './buttons'

const CheckboxDropdown = ({ title, subTitle, IsDropDownOpen = false, setIsDropDownOpen = () => {}, startIcon, menuOptions, selectedMenu, onFilterBtnClick = () => {}, loading = false, keyId, ...props }) => {
  const theme = useTheme()
  const [selectedSiteMenu, setSelectedSiteMenu] = React.useState([...selectedMenu])
  const [ddList, setDdList] = useState(menuOptions)
  const dropDownRef = useRef(null)

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])

  useEffect(() => {
    if (selectedSiteMenu.length !== selectedMenu.length) {
      setSelectedSiteMenu([...selectedMenu])
    }
    return () => {}
  }, [selectedMenu])

  useEffect(() => {
    if (IsDropDownOpen) {
      onFilterBtnClick(selectedSiteMenu)
    }
    return () => {}
  }, [selectedSiteMenu])

  useEffect(() => {
    setDdList(menuOptions)
  }, [menuOptions])

  useEffect(() => {
    if (menuOptions.length !== ddList.length) {
      let searchList = []
      selectedSiteMenu.forEach(siteId => {
        if (!isEmpty(ddList) && ddList.find(e => e.site_id === siteId)) {
          searchList = [...searchList, siteId]
        }
      })
      onFilterBtnClick(searchList)
    }
    return () => {}
  }, [ddList])

  const numSelected = selectedSiteMenu?.length

  const handleClickOutside = event => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
      setIsDropDownOpen(false)
    }
  }

  const isMenuSelected = id => selectedSiteMenu.indexOf(id) !== -1

  const onMenuClick = id => {
    const selectedIndex = selectedSiteMenu.indexOf(id)
    let newSelected = []
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedSiteMenu, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedSiteMenu.slice(1))
    } else if (selectedIndex === selectedSiteMenu.length - 1) {
      newSelected = newSelected.concat(selectedSiteMenu.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selectedSiteMenu.slice(0, selectedIndex), selectedSiteMenu.slice(selectedIndex + 1))
    }

    setSelectedSiteMenu(newSelected)
  }

  const onChange = value => {
    if (value === 2) {
      const newSelecteds = menuOptions
        .map(row => {
          return get(row, keyId, null)
        })
        .filter(siteId => siteId !== null)
      setSelectedSiteMenu(newSelecteds)
    } else {
      setSelectedSiteMenu([])
    }
  }

  const handleSearchOnChange = v => {
    const l = menuOptions.filter(d => d.label.toLowerCase().includes(v.toLowerCase()))
    setDdList(l)
  }

  const CustomCheckbox = ({ label, selected, onClick, style, checkBoxColor, indeterminate, isSelectAllLable = false, isDisbled = false }) => {
    const color = theme.palette.primary.main
    const cursorStyle = isDisbled ? '' : 'pointer'
    return (
      <div className='d-flex align-items-center' style={{ cursor: cursorStyle, opacity: isDisbled ? 0.6 : 1, ...style }} onClick={isDisbled ? null : onClick}>
        <Checkbox size='small' style={{ margin: 0, padding: 5, color: checkBoxColor && selected ? checkBoxColor : color }} indeterminate={indeterminate} checked={selected} onChange={isDisbled ? null : onClick} disabled={isDisbled} />
        <div>
          {isSelectAllLable ? (
            <div id='_menu-item' className='text-xs' style={{ padding: '0px 5px', fontSize: '14px', fontWeight: 800, color: '#000' }}>
              {label}
            </div>
          ) : (
            <div id='_menu-item' style={{ padding: '0px 5px' }}>
              {label}
            </div>
          )}
        </div>
      </div>
    )
  }

  const resetFilter = () => {
    setSelectedSiteMenu([])
  }

  return (
    <div style={{ position: 'relative' }} {...props}>
      <div className='rd-title-container d-flex align-items-center' onClick={() => setIsDropDownOpen(!IsDropDownOpen)}>
        <BusinessOutlined />
        <div className='d-flex flex-column align-items-end mr-2 ml-2'>
          {selectedSiteMenu.length === 1 && !IsDropDownOpen ? (
            <>
              <div className={IsDropDownOpen ? '' : 'rd-text'} style={{ fontSize: '12px', display: 'none' }}>
                Facility
              </div>
              <div style={{ fontSize: '10px' }}>{title}</div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{subTitle}</div>
            </>
          ) : (
            <div className='d-flex flex-column align-items-end' style={{ padding: '6px 0px' }}>
              <div className={IsDropDownOpen ? '' : 'rd-text'} style={{ fontSize: '12px', display: 'none' }}>
                Facility
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{title}</div>
            </div>
          )}
        </div>
        <ArrowDropDownIcon aria-controls='simple-menu-site' aria-haspopup='true' style={{ cursor: 'pointer' }} />
      </div>
      {IsDropDownOpen && (
        <div ref={dropDownRef} className='rd-pop-up-container'>
          <div className='rd-pop-up-title' style={{ background: '#eee' }}>
            <div className='d-flex justify-content-between align-items-center'>
              Accessible Facilities
              {loading && <CircularProgress size={18} thickness={5} />}
            </div>
          </div>
          <div className='table-responsive flex-column dashboardtblScroll d-flex' id='style-1' style={{ maxHeight: '500px', height: 'auto' }}>
            {isEmpty(menuOptions) ? (
              <div className='py-2 d-flex align-items-center'>
                <span className=' mr-2' style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#00000092', minWidth: '325px', width: 'max-content' }}>
                  No results found !
                </span>
              </div>
            ) : (
              <>
                <div style={{ padding: '5px', minWidth: '330px' }}>
                  <div className='d-flex align-items-center'>
                    <Radio checked={numSelected === menuOptions.length} onChange={() => onChange(2)} value={2} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>All Facilities</span>
                  </div>
                  <div className='d-flex align-items-center'>
                    <Radio checked={numSelected !== menuOptions.length} onChange={() => onChange(1)} value={1} name='radio-button-demo' inputProps={{ 'aria-label': 'A' }} color={'primary'} size='small' />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#000' }}>Custom Facilities</span>
                  </div>
                  {numSelected !== menuOptions.length && (
                    <>
                      <Divider />
                      <div className='d-flex align-items-center' style={{ width: '100%', padding: '12px 10px 0px 10px' }}>
                        <MinimalInput onChange={handleSearchOnChange} placeholder='Search...' baseStyles={{ flex: 1, margin: 0, height: '40px' }} />
                        <MinimalButton text='Reset' size='small' onClick={resetFilter} variant='contained' color='primary' baseClassName='ml-2' startIcon={<RotateLeftSharpIcon fontSize='small' />} disabled={isEmpty(selectedSiteMenu)} style={{ height: '40px' }} />
                      </div>
                    </>
                  )}
                </div>
                {isEmpty(ddList) && (
                  <div className='py-2 d-flex align-items-center'>
                    <span className=' mr-2' style={{ textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#00000092', minWidth: '325px', width: 'max-content' }}>
                      No results found !
                    </span>
                  </div>
                )}
                {numSelected !== menuOptions.length && (
                  <div id='style-1' style={{ padding: '5px 10px', minWidth: '330px', overflow: 'auto', maxHeight: '350px' }}>
                    {ddList.map(item => {
                      const isItemSelected = isMenuSelected(get(item, keyId, null))
                      return <CustomCheckbox key={get(item, keyId, null)} label={get(item, 'label', '')} onClick={() => onMenuClick(get(item, keyId, null))} selected={isItemSelected} />
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckboxDropdown
