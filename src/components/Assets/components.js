import { useState, useEffect, useRef } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import 'react-modern-calendar-datepicker/lib/DatePicker.css'
import { Calendar, utils } from 'react-modern-calendar-datepicker'
import '../Notification/notification.css'
import './assets.css'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import EventOutlinedIcon from '@material-ui/icons/EventOutlined'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { useTheme } from '@material-ui/core/styles'
import { history } from 'helpers/history'
import TimePicker from 'react-time-picker' // Time Picker package
import 'react-time-picker/dist/TimePicker.css'
import { get, isEmpty } from 'lodash'
import { MinimalButton } from 'components/common/buttons'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { withStyles } from '@material-ui/core/styles'
import { Box, Divider, Typography } from '@material-ui/core'

export const AssetTab = ({ active, text, onClick }) => (
  <button className={`assets-buttons ${active && 'ass-acc'}`} onClick={onClick}>
    {text}
  </button>
)

export const DetailedDiv = ({ children, title, caption, addON }) => (
  <div className='asset-form-div'>
    <div className='tc_'>
      <h4>{title}</h4>
      <span>{caption}</span>
      {addON && (
        <div className='add-ons' onClick={addON.action}>
          {addON.text}
        </div>
      )}
    </div>
    <div className='p-3'>{children}</div>
  </div>
)

export const MinimalInput = ({ error, value, onChange = () => {}, label, w, baseStyles, labelStyles, InputStyles, isRequired, isExtraOnChange = false, hasSuffix, suffix, ...props }) => (
  <div className='minimal-input' style={w ? { ...baseStyles, width: `${w}%` } : { ...baseStyles, width: 'auto' }}>
    <div className={`minimal-input-label ${error ? 'error-label' : ''} ${props.disabled ? 'disabled-label' : ''}`} style={labelStyles}>
      {label}
      {isRequired && <span style={{ color: 'red' }}>*</span>}
    </div>
    <div className='d-flex'>
      <input className={`minimal-input-base ${error ? 'error-input' : ''}`} style={InputStyles} {...props} value={value} onChange={isExtraOnChange ? e => onChange(e) : e => onChange(e.target.value)} />
      {hasSuffix && <span className='minimal-input-suffix'>{suffix}</span>}
    </div>
    {error && error.error === true && <span className='error-msg'>{error.msg}</span>}
  </div>
)

export const MinimalTextArea = ({ error, value, onChange = () => {}, label, w, baseStyles, labelStyles, InputStyles, isRequired, ...props }) => (
  <div className='minimal-input' style={w ? { ...baseStyles, width: `${w}%` } : { ...baseStyles, width: 'auto' }}>
    <div className={`minimal-input-label ${error ? 'error-label' : ''}  ${props.disabled ? 'disabled-label' : ''}`} style={labelStyles}>
      {label}
      {isRequired && <span style={{ color: 'red' }}>*</span>}
    </div>
    <textarea className={`minimal-input-base ${error ? 'error-input' : ''}`} style={{ ...InputStyles }} {...props} value={value} onChange={onChange} />
    {error && error.error && <span className='error-msg'>{error.msg}</span>}
  </div>
)

export const MinimalSelect = ({ error, value, onChange, label, w, options, valueKey, labelKey, mainKey, ...props }) => (
  <div className='minimal-input' style={w ? { width: `${w}%` } : { width: 'auto' }}>
    <div className={`minimal-input-label ${error ? 'error-label' : ''}`}>{label}</div>
    <select className={`minimal-input-base  ${error.error && 'error-input'}`} {...props} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(op => (
        <option value={op[valueKey]} key={op[mainKey]}>
          {op[labelKey]}
        </option>
      ))}
    </select>
    {error.error && <span className='error-msg'>{error.msg}</span>}
  </div>
)

export const MinimalStatusSelector = ({ value, onChange, label, w, _default, options }) => {
  const theme = useTheme()
  const activeStyle = { color: '#fff', background: theme.palette.primary.main }
  const inActiveStyle = { color: '#606060', background: '#fff' }
  return _default ? (
    <div className='minimal-input' style={w ? { width: `${w}%` } : { width: 'auto' }}>
      <div className='minimal-input-label'>{label}</div>
      <div className='d-flex'>
        <button className='minimal-input-base' style={value === 'ACTIVE' ? activeStyle : inActiveStyle} onClick={() => onChange('ACTIVE')}>
          Active
        </button>
        <button className='minimal-input-base' style={value === 'INACTIVE' ? activeStyle : inActiveStyle} onClick={() => onChange('INACTIVE')}>
          Inactive
        </button>
      </div>
    </div>
  ) : (
    <div className='minimal-input' style={w ? { width: `${w}%` } : { width: 'auto' }}>
      <div className='minimal-input-label'>{label}</div>
      <div className='d-flex'>
        {options.map(opt => (
          <button key={opt} className='minimal-input-base' style={value === opt.toUpperCase() ? { color: '#fff', background: theme.palette.primary.main } : {}} onClick={() => onChange(opt.toUpperCase())}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export const MinimalAutoComplete = ({ error, label, w, value, options, onChange = () => {}, placeholder, scrollToBottom, baseStyles = {}, labelStyles, inputStyles, errorStyles, isRequired, filterOption, ...props }) => {
  const basic = { border: 0, display: 'flex', fontWeight: 800, padding: 0, borderRadius: '4px', background: '#eee', fontSize: '14px' }
  const getErrorStyle = () => {
    if (!error) return
    else return (errorStyles = { background: '#ff000021', border: '1px solid red', color: 'red' })
  }
  const styles = {
    menu: (provided, state) => ({ ...provided, padding: '0 0 0 4px ', borderRadius: '4px', border: 0, outline: 0, overflowY: 'hidden' }),
    option: (provided, state) => ({ ...provided, borderRadius: '4px', background: state.isSelected ? '#efefef' : state.isFocused ? '#f7f7f7' : 'none', color: '#000' }),
    control: () => ({ ...basic, ..._inputStyles, ...getErrorStyle(), '&:hover': { cursor: props.isDisabled ? 'not-allowed' : 'pointer' } }),
    menuList: base => ({
      ...base,
      maxHeight: '200px',
      overflowY: 'auto',
      paddingRight: '4px',
      '::-webkit-scrollbar': {
        width: '4px',
        height: '1px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
      zIndex: 100,
    }),
    multiValueRemove: (base, state) => {
      return state.data.isFixed || props.isDisabled ? { ...base, display: 'none' } : base
    },
    multiValue: (base, state) => ({ ...base, padding: '1px 4px', paddingRight: state.data.isFixed || props.isDisabled ? '6px' : 0 }),
    placeholder: defaultStyles => {
      return {
        ...defaultStyles,
        color: '#BFBFBF',
      }
    },
  }
  const _labelStyles = labelStyles ? labelStyles : props.isDisabled ? { fontWeight: 800, color: '#a1a1a1' } : { fontWeight: 800 }
  const _inputStyles = inputStyles || { background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }

  return (
    <div className='minimal-input' style={w ? { width: `${w}%`, ...baseStyles } : { width: 'auto', ...baseStyles }}>
      <div className={`minimal-input-label ${error ? 'error-label' : ''}`} style={_labelStyles}>
        {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
      </div>
      {props.async ? (
        <AsyncSelect cacheOptions {...props} options={options} styles={styles} onMenuScrollToBottom={scrollToBottom} placeholder={placeholder} value={value} onChange={v => onChange(v)} className={props.isDisabled ? 'react-select-disabled' : ''} />
      ) : (
        <Select {...props} filterOption={filterOption} options={options} styles={styles} onMenuScrollToBottom={scrollToBottom} placeholder={placeholder} value={value} onChange={v => onChange(v)} className={props.isDisabled ? 'react-select-disabled' : ''} />
      )}
      {error && error.error && <span className='error-msg'>{error.msg}</span>}
    </div>
  )
}

export const MinimalDatePicker = ({ error, label, date, setDate, w, labelStyles, InputStyles, onInputFocus, maximumDate, minimumDate, isTimeRequire = false, maxTime, minTime, ...props }) => {
  const [selectedDay, setSelectedDay] = useState(date || utils().getToday())
  const [time, setTime] = useState('12:00') // Default time
  const [show, setShow] = useState(false)
  useEffect(() => {
    setSelectedDay(date)
    if (isTimeRequire && date?.time) setTime(date.time || '12:00')
  }, [date, show])

  //

  function formatTimeWithIntl(time) {
    const [hours, minutes] = time?.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date)
  }
  const getDateString = date => {
    if (!date) return <span style={{ color: '#BFBFBF' }}>MM-DD-YYYY</span>
    const dateString = `${('0' + date.month).slice(-2)}-${('0' + date.day).slice(-2)}-${date.year}`
    return isTimeRequire ? `${dateString} ${formatTimeWithIntl(time)}` : dateString
  }
  const handleOnDateChange = date => setSelectedDay(date)
  const onFocusInput = () => {
    setShow(true)
    onInputFocus && onInputFocus()
  }
  const handleClick = init => {
    if (isTimeRequire) {
      setDate({ ...selectedDay, time })
    } else {
      setDate(selectedDay)
    }
    !init && setShow(false)
  }
  const modalStyle = {
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    position: 'absolute',
  }
  const checkDisabled = selectedDay => {
    if (get(selectedDay, 'year', '') === get(minimumDate, 'year', '') && get(selectedDay, 'month', '') === get(minimumDate, 'month', '') && get(selectedDay, 'day', '') === get(minimumDate, 'day', '')) {
      return minTime > time
    }
    return false
  }

  const areDatesSame = get(selectedDay, 'year', '') === get(minimumDate, 'year', '') && get(selectedDay, 'month', '') === get(minimumDate, 'month', '') && get(selectedDay, 'day', '') === get(minimumDate, 'day', '')
  const effectiveMinTime = areDatesSame ? minTime : null
  const effectiveMaxTime = areDatesSame ? maxTime : null

  const body = (
    <div style={modalStyle} className='add-task-modal'>
      <Calendar
        colorPrimary='#146481'
        value={selectedDay}
        onChange={handleOnDateChange}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        renderFooter={() => (
          <>
            {isTimeRequire && (
              <div style={{ margin: '0px 0px 16px 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} className='react-time-picker'>
                <div style={{ width: '175px' }}>
                  <TimePicker
                    onChange={setTime}
                    value={time}
                    format='h:m a'
                    disableClock
                    className='custom-time-picker' // Custom class for additional styling
                    minTime={effectiveMinTime}
                    maxTime={effectiveMaxTime}
                  />
                  {areDatesSame && time && time < effectiveMinTime && <p style={{ color: 'red', fontSize: '13px', marginTop: '7px' }}>Time must be after {effectiveMinTime}.</p>}
                  {areDatesSame && time && time > effectiveMaxTime && <p style={{ color: 'red', fontSize: '13px', marginTop: '7px' }}>Time must be before {effectiveMaxTime}.</p>}
                </div>
              </div>
            )}
            <div style={{ padding: '0 16px 16px 16px' }} className='d-flex justify-content-between'>
              <Button variant='contained' color='default' className='nf-buttons' disableElevation onClick={() => setShow(false)} style={{ width: '48%' }}>
                Cancel
              </Button>
              <Button variant='contained' color='primary' className='nf-buttons' onClick={() => handleClick()} disableElevation disabled={isTimeRequire ? checkDisabled(selectedDay) : false} style={{ width: '48%' }}>
                OK
              </Button>
            </div>
          </>
        )}
        shouldHighlightWeekends
      />
    </div>
  )

  return (
    <>
      <div className='minimal-input' style={w ? { width: `${w}%` } : { width: 'auto' }}>
        <div className={`minimal-input-label ${error ? 'error-label' : ''}`} style={labelStyles}>
          {label}
        </div>
        <div
          className={`d-flex justify-content-between align-items-center minimal-input-base ${error ? 'error-input' : ''}`}
          onClick={() => {
            setShow(true)
            onInputFocus && onInputFocus()
          }}
          style={InputStyles}
          {...props}
        >
          {getDateString(selectedDay, time)}
          <EventOutlinedIcon fontSize='small' />
        </div>
        {error && error.error && <span className='error-msg'>{error.msg}</span>}
      </div>
      <Modal open={show} onClose={() => setShow(false)} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
        {body}
      </Modal>
    </>
  )
}

export const MinimalFilterSelector = ({ error, label, w, value, options, onChange, placeholder, scrollToBottom, labelStyles, baseStyles = {}, inputStyles, errorStyles, ...props }) => {
  const styles = {
    indicatorSeparator: styles => ({ ...styles, display: 'none' }),
    menu: (provided, state) => ({ ...provided, padding: '0 0 0 4px ', fontSize: '12px', borderRadius: '4px', border: 0, outline: 0, overflowY: 'hidden' }),
    option: (provided, state) => ({ ...provided, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: state.isSelected ? '#efefef' : state.isFocused ? '#f7f7f7' : 'none', color: '#000' }),
    control: () => ({ border: 0, display: 'flex', fontWeight: 800, padding: 0, borderRadius: '4px', background: 'none', fontSize: '12px', border: '1px solid #a1a1a1', height: '32px' }),
    menuList: base => ({
      ...base,
      maxHeight: '200px',
      overflowY: 'auto',
      paddingRight: '4px',
      '::-webkit-scrollbar': {
        width: '4px',
        height: '1px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
      zIndex: 100,
    }),
    multiValueRemove: (base, state) => (state.data.isFixed || props.isDisabled ? { ...base, display: 'none' } : base),
    multiValue: (base, state) => ({ ...base, padding: '1px 4px' }),
    valueContainer: (base, state) => ({ ...base, padding: '0 0 0 12px' }),
    placeholder: defaultStyles => {
      return {
        ...defaultStyles,
        color: '#BFBFBF',
      }
    },
  }
  return (
    <div className='minimal-input' style={{ width: '100%', ...baseStyles }}>
      {props.async ? (
        <AsyncSelect cacheOptions {...props} options={options} styles={styles} onMenuScrollToBottom={scrollToBottom} placeholder={placeholder} value={value} onChange={v => onChange(v)} className={props.isDisabled ? 'react-select-disabled' : ''} />
      ) : (
        <Select {...props} options={options} styles={styles} onMenuScrollToBottom={scrollToBottom} placeholder={placeholder} value={value} onChange={v => onChange(v)} className={props.isDisabled ? 'react-select-disabled' : ''} />
      )}
    </div>
  )
}

export const DetailPageHeaderSection = ({ title, subTitle, id }) => (
  <div className='inspection-title' style={{ paddingTop: '0' }}>
    <div style={{ fontSize: '16px', fontWeight: 800 }}>{title}</div>
    <div className='inspection-breadcrum'>
      <div className='d-flex bread-crum'>
        <button onClick={() => history.goBack()} style={{ border: 'none', padding: 0, fontWeight: 800, outline: 'none', background: 'transparent', marginRight: '12px' }}>
          {subTitle}
        </button>
        <span className='mr-2'> {'>'} </span>
        <span style={{ fontWeight: 800 }}>{id}</span>
      </div>
    </div>
  </div>
)

export const MinimalPhoneInput = ({ error, value, onChange = () => {}, label, w, baseStyles, labelStyles, InputStyles, isRequired, isExtraOnChange = false, ...props }) => {
  const handleOnChange = e => {
    const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
    const value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
    onChange(value)
  }
  return (
    <div className='minimal-input' style={w ? { ...baseStyles, width: `${w}%` } : { ...baseStyles, width: 'auto' }}>
      <div className={`minimal-input-label ${error ? 'error-label' : ''} ${props.disabled ? 'disabled-label' : ''}`} style={labelStyles}>
        {label}
        {isRequired && <span style={{ color: 'red' }}>*</span>}
      </div>
      <input className={`minimal-input-base ${error ? 'error-input' : ''}`} style={InputStyles} placeholder='(___) ___-____' {...props} value={value} onChange={handleOnChange} />
      {error && error.error === true && <span className='error-msg'>{error.msg}</span>}
    </div>
  )
}

export const MinimalCountryCodePhoneInput = ({ dropDownMenuOptions, btnText = 'Actions', startIcon, error, value, onChange = () => {}, label, w, baseStyles, labelStyles, InputStyles, isRequired, isExtraOnChange = false, hasSuffix, suffix, ...props }) => {
  const [IsDropDownOpen, setIsDropDownOpen] = useState(false)
  const dropDownRef = useRef(null)

  const handleClickOutside = event => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) setIsDropDownOpen(false)
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])

  return (
    <div className='d-flex'>
      <div className='minimal-input' style={w ? { ...baseStyles, width: `${w}%` } : { ...baseStyles, width: 'auto' }}>
        <div className={`minimal-input-label ${error ? 'error-label' : ''} ${props.disabled ? 'disabled-label' : ''}`} style={labelStyles}>
          {label}
          {isRequired && <span style={{ color: 'red' }}>*</span>}
        </div>
        <div className='d-flex'>
          <div>
            <div>
              <MinimalButton startIcon={startIcon} endIcon={<ArrowDropDownIcon size='small' />} text={btnText} variant='contained' color='primary' onClick={() => setIsDropDownOpen(!IsDropDownOpen)} baseClassName={`country-code-button ${error ? 'country-code-error' : ''}`} />
            </div>
            <div ref={dropDownRef} style={{ width: '65px', flexDirection: 'column', display: IsDropDownOpen ? 'flex' : 'none', position: 'absolute', zIndex: '1000 !important', background: 'white', border: '1px solid #eee', borderRadius: '4px', fontWeight: 800, marginTop: '4px', padding: '1px' }}>
              {dropDownMenuOptions.map(item => {
                return (
                  <div key={item.id} style={item.seperatorBelow && item.show ? { borderBottom: '1px solid #eee' } : {}}>
                    {item.type === 'button' && item.show && (
                      <button
                        style={{ background: 'white', border: 'none' }}
                        disabled={item.disabled || false}
                        onClick={() => {
                          setIsDropDownOpen(false)
                          item.onClick()
                        }}
                      >
                        <span style={{ marginLeft: '8px' }}>{item.text}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <input className={`minimal-input-base phone-input ${error ? 'error-input' : ''}`} style={InputStyles} {...props} value={value} onChange={isExtraOnChange ? e => onChange(e) : e => onChange(e.target.value)} />
          {hasSuffix && <span className='minimal-input-suffix'>{suffix}</span>}
        </div>
        {error && error.error === true && <span className='error-msg'>{error.msg}</span>}
      </div>
    </div>
  )
}

export const MinimalToggleButton = ({ onChange, isCheck, label }) => {
  const IOSSwitch = withStyles(theme => ({
    root: {
      width: 30,
      height: 20,
      padding: 0,
      // margin: theme.spacing(1),
      margin: '10px -8px 0 24px',
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#778899',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#52d869',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: 16,
      height: 18,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: '#EFEFEF',
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }))(({ classes, ...props }) => {
    return (
      <Switch
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    )
  })

  return <FormControlLabel control={<IOSSwitch checked={isCheck} onChange={onChange} />} />
}

export const CustomAutoCompleteWithAdd = ({ error, label = '', placeholder = '', isRequired = false, loading = false, options, nonOptions, value, onChange = () => {}, onSearch = () => {}, baseStyles = {}, labelStyles, inputStyles, errorStyles, w, ...props }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const handleSelectUser = (user, isSelected) => {
    setOpen(false)
    ref.current = null
    onChange(user, isSelected)
  }

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setOpen(false)
      ref.current = null
    }
  }

  const handleInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      onSearch(inputValue.trim())
      if (!open) {
        setOpen(true)
      }
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])

  useEffect(() => {
    if (open) onSearch('')
  }, [open])

  const basic = { border: 0, display: 'flex', fontWeight: 800, padding: 0, borderRadius: '4px', background: '#eee', fontSize: '14px' }
  const getErrorStyle = () => {
    if (!error) return
    else return (errorStyles = { background: '#ff000021', border: '1px solid red', color: 'red' })
  }

  const styles = {
    menu: (provided, state) => ({ ...provided, padding: '0 0 0 4px ', borderRadius: '4px', border: 0, outline: 0, overflowY: 'hidden' }),
    option: (provided, state) => ({ ...provided, borderRadius: '4px', background: state.isSelected ? '#efefef' : state.isFocused ? '#f7f7f7' : 'none', color: '#000' }),
    control: () => ({ ...basic, ..._inputStyles, ...getErrorStyle(), '&:hover': { cursor: props.isDisabled ? 'not-allowed' : 'pointer' } }),
    menuList: base => ({
      ...base,
      maxHeight: '200px',
      overflowY: 'auto',
      paddingRight: '4px',
      '::-webkit-scrollbar': {
        width: '4px',
        height: '1px',
      },
      '::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#888',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
      zIndex: 100,
    }),
    multiValueRemove: (base, state) => {
      return state.data.isFixed || props.isDisabled ? { ...base, display: 'none' } : base
    },
    multiValue: (base, state) => ({ ...base, padding: '1px 4px', paddingRight: state.data.isFixed || props.isDisabled ? '6px' : 0 }),
    placeholder: defaultStyles => {
      return {
        ...defaultStyles,
        color: '#BFBFBF',
      }
    },
  }

  const _labelStyles = { fontWeight: 800 }
  const _inputStyles = inputStyles || { background: 'none', padding: '2px 6px', border: '1px solid #a1a1a1' }

  return (
    <div className='minimal-input' style={w ? { width: `${w}%`, position: 'relative' } : { width: 'auto', position: 'relative' }}>
      <div className={`minimal-input-label ${error ? 'error-label' : ''}`} style={_labelStyles}>
        {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
      </div>
      <div
        onClick={e => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Select {...props} styles={styles} placeholder={placeholder} value={value} onChange={v => handleSelectUser(v, false)} onInputChange={handleInputChange} menuIsOpen={false} />
      </div>
      {open && (
        <div ref={ref} className='rd-pop-up-container' style={{ width: '100%', marginTop: '4px', position: 'absolute', top: '100%' }}>
          <div className='table-responsive flex-column dashboardtblScroll d-flex' id='style-1' style={{ maxHeight: '200px', height: 'auto', padding: '10px', overflowY: 'auto' }}>
            {!isEmpty(options) && (
              <>
                <Typography variant='subtitle1' style={{ fontSize: '14px', fontWeight: '400', color: '#606060' }}>
                  Facility's Existing Users
                </Typography>
                {options.map((user, index) => (
                  <Box
                    style={{
                      alignItems: 'center',
                      padding: '6px 5px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#efefef')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                    key={index}
                    onClick={() => handleSelectUser(user, true)}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.label}</div>
                    <div style={{ fontSize: '12px', fontWeight: '400', color: '#606060' }}>{user.email}</div>
                  </Box>
                ))}
              </>
            )}
            {!isEmpty(nonOptions) && (
              <>
                <Divider style={{ margin: '10px 0px', height: '1px' }} />
                <Typography variant='subtitle1' style={{ fontSize: '14px', fontWeight: '400', color: '#606060' }}>
                  Users Without Access To Facility
                </Typography>
                {nonOptions.map((user, index) => (
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 5px' }} key={index}>
                    <div>
                      <div style={{ padding: '0px', fontSize: '13px', fontWeight: '600' }}>{user.label}</div>
                      <div style={{ padding: '0px', fontSize: '12px', fontWeight: '400', color: '#606060' }}>{user.email}</div>
                    </div>
                    <Typography color='primary' style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }} onClick={() => handleSelectUser(user, true)}>
                      + Add
                    </Typography>
                  </Box>
                ))}
              </>
            )}
            {isEmpty(options) && isEmpty(nonOptions) && (
              <>
                <Typography style={{ fontSize: '12px', fontWeight: '400', color: '#606060', width: '100%', textAlign: 'center' }}>No options</Typography>
              </>
            )}
          </div>
        </div>
      )}
      {error && error.error && <span className='error-msg'>{error.msg}</span>}
    </div>
  )
}
