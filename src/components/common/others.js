import React, { useState, useEffect, useRef, useCallback } from 'react'

import { ActionButton } from 'components/common/buttons'
import { MinimalButton } from 'components/common/buttons'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Modal from '@material-ui/core/Modal'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import { useTheme } from '@material-ui/core/styles'
import './components.css'
import { isEmpty, get, isEqual } from 'lodash'
import FilterListIcon from '@material-ui/icons/FilterList'
import CircularProgress from '@material-ui/core/CircularProgress'
import Tooltip from '@material-ui/core/Tooltip'
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import { AssetImage, AssetImageUploadButton } from 'components/WorkOrders/onboarding/utils'
import enums from 'Constants/enums'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined'
import ArrowRightOutlinedIcon from '@material-ui/icons/ArrowRightOutlined'

export const StatusComponent = ({ color, label, size, filled, hasDarkContrast = false, icon, action }) => {
  const padding = size === 'small' ? '2px 10px' : '2px 12px'
  const fontSize = size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px'
  if (filled) return <span style={{ padding, fontWeight: 800, borderRadius: size === 'small' ? '12px' : '12px', fontSize, background: `${color}`, color: hasDarkContrast ? '#000' : '#fff', whiteSpace: 'nowrap' }}>{label}</span>
  return (
    <span style={{ padding, fontWeight: 800, borderRadius: size === 'small' ? '12px' : '12px', fontSize, background: `${color}21`, color, border: `1px solid ${color}`, whiteSpace: 'nowrap' }} onClick={action}>
      {label}
      {icon}
    </span>
  )
}
export const LabelVal = ({ label, value, w, inline, lableMinWidth, top = '8px' }) => (
  <div style={{ width: w ? `${w}%` : 'auto', display: inline ? 'flex' : 'block', marginTop: top }}>
    <div style={{ fontWeight: 600, minWidth: lableMinWidth ? `${lableMinWidth}px` : 'auto' }}>{label} : </div>
    <div style={{ wordWrap: 'break-word', marginLeft: inline ? '4px' : 0 }}>{value}</div>
  </div>
)

export const Menu = ({ data, options, loading, width = 115, noToolip = true, MainIcon = MoreVertIcon, isAlignLeft = false, tooltipPlacement = 'top', actionToolipText = 'MORE ACTIONS', isIconInWhite = false, isPhotosTab = false, isPMsTab = false, iconSize = 'small' }) => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [tooltipText, setTooltipText] = useState('')
  const ref = useRef(null)
  const tooltipRef = useRef(null)
  //
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  const handleClick = e => {
    e.stopPropagation()
    if (isPhotosTab) {
      setPos({ x: 5, y: 0 })
    } else {
      const { x, y } = e.currentTarget.getBoundingClientRect()
      setPos({ x, y })
    }
    setOpen(true)
  }
  const handleMouseOver = (e, text) => {
    if (isEmpty(text)) return
    const { x, y } = e.currentTarget.getBoundingClientRect()
    tooltipRef.current.style.visibility = `visible`
    tooltipRef.current.style.opacity = 1
    tooltipRef.current.style.left = `${x}px`
    tooltipRef.current.style.top = `${y - 14}px`
  }
  const handleMouseOut = (e, text) => {
    if (isEmpty(text)) return
    tooltipRef.current.style.visibility = `hidden`
    tooltipRef.current.style.opacity = 0
  }
  //
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])
  return (
    <div id='_dropdown-menu'>
      <ActionButton isLoading={loading} action={handleClick} icon={<MainIcon fontSize={iconSize} style={{ color: isIconInWhite ? 'white' : 'inherit' }} />} tooltip={actionToolipText} tooltipPlacement={tooltipPlacement} />
      {open && (
        <>
          <div id='_menu-content' ref={ref} style={isPMsTab ? { width: `${width}px`, left: `${pos.x - 250 - width - 10}px`, top: `${pos.y - 126}px` } : isAlignLeft ? { width: `${width}px`, left: `${pos.x + 10}px`, top: `${pos.y + 26}px` } : { width: `${width}px`, left: `${pos.x + 26 - width - 10}px`, top: `${pos.y + 26}px` }}>
            {options.map(
              d =>
                !d.isHide && (
                  <div className='d-flex align-items-center'>
                    <button
                      key={d.id}
                      id='_menu-item'
                      onClick={e => {
                        e.stopPropagation()
                        d.action(data)
                        setOpen(false)
                      }}
                      onMouseOver={e => {
                        e.stopPropagation()
                        setTooltipText(d.tooltip)
                        handleMouseOver(e, d.tooltip)
                      }}
                      onMouseOut={e => {
                        e.stopPropagation()
                        setTooltipText('')
                        handleMouseOut(e, d.tooltip)
                      }}
                      style={d.color ? { color: d.color } : {}}
                      disabled={d.hasOwnProperty('disabled') && d.disabled(data)}
                    >
                      <span className='pr-1'> {d.icon && d.icon}</span>
                      {d.name}
                    </button>
                  </div>
                )
            )}
          </div>
          {!noToolip && (
            <div className='menu-tooltip' ref={tooltipRef}>
              <span>{tooltipText}</span>
              <i></i>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const DropDownMenu = ({ dropDownMenuOptions, btnText = 'Actions', startIcon, minWidth, ...props }) => {
  const [IsDropDownOpen, setIsDropDownOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [subOptionsPosition, setSubOptionsPosition] = useState(null)
  const dropDownRef = useRef(null)
  let hoverTimeout = useRef(null)

  const handleClickOutside = event => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target)) setIsDropDownOpen(false)
  }
  const handleMouseEnter = (event, item) => {
    event.stopPropagation()
    clearTimeout(hoverTimeout.current)
    if (item.subOptions) {
      const rect = event.target.getBoundingClientRect()
      setHoveredItem(item.id)
      setSubOptionsPosition({
        top: rect.top - dropDownRef.current.getBoundingClientRect().top,
      })
    }
  }

  const handleMouseLeave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredItem(null)
    }, 0) // Delay reset by 500ms
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      clearTimeout(hoverTimeout.current) // Clear timeout on unmount
    }
  }, [])

  return (
    <>
      <div style={{ position: 'relative' }} {...props}>
        <div className='d-flex'>
          <MinimalButton size='small' startIcon={startIcon} endIcon={<ArrowDropDownIcon size='small' />} text={btnText} variant='contained' color='primary' onClick={() => setIsDropDownOpen(!IsDropDownOpen)} />
        </div>
        <div ref={dropDownRef} style={{ width: 'max-content', flexDirection: 'column', display: IsDropDownOpen ? 'flex' : 'none', position: 'absolute', zIndex: 1000, background: 'white', border: '1px solid #eee', padding: '3px', borderRadius: '4px', fontWeight: 800, marginTop: '5px', minWidth: minWidth ? minWidth : '' }}>
          {dropDownMenuOptions.map(item => {
            return (
              <div key={item.id} style={item.seperatorBelow && item.show ? { borderBottom: '1px solid #eee' } : {}} onMouseEnter={event => handleMouseEnter(event, item)} onMouseLeave={handleMouseLeave}>
                {item.type === 'button' && item.show && (
                  <button
                    id='_menu-item'
                    disabled={item.disabled || false}
                    onClick={() => {
                      setIsDropDownOpen(false)
                      item.onClick()
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                      <span style={{ marginLeft: '4px' }}>{item.text}</span>
                    </span>
                    {!isEmpty(item.subOptions) && <ArrowRightOutlinedIcon size='small' style={{ marginLeft: 'auto' }} />}
                  </button>
                )}
                {item.type === 'input' && item.show && <input ref={item.ref} type='file' style={{ display: 'none' }} onChange={item.onChange} multiple={item.multiple} />}

                {/* Render sub-options if available */}

                {item.subOptions && hoveredItem === item.id && (
                  <div
                    style={{
                      minWidth: '150px',
                      position: 'absolute',
                      left: '100%',
                      top: subOptionsPosition.top,
                      background: 'white',
                      border: '1px solid #ddd',
                      padding: '4px',
                      borderRadius: '4px',
                      zIndex: 1001,
                    }}
                    onMouseEnter={() => clearTimeout(hoverTimeout.current)} // Clear timeout on enter
                    onMouseLeave={handleMouseLeave} // Delay reset by 500ms on leave
                  >
                    {item.subOptions.map(subItem => (
                      <button
                        id='_menu-item'
                        key={subItem.id}
                        disabled={subItem.disabled || false}
                        onClick={() => {
                          setIsDropDownOpen(false)
                          subItem.onClick()
                        }}
                      >
                        {subItem.icon} <span style={{ marginLeft: '4px' }}>{subItem.text}</span>
                        {/* {subItem.text} */}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export const PopupModal = ({ width = 30, isFixed, title, open, onClose, loading, handleSubmit, cta = 'Save', loadingText = 'Saving...', noHeader, noActions, disableCTA, tblResponsive = false, ...props }) => {
  const modalStyle = {
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
    position: 'absolute',
    background: '#fff',
    width: isFixed ? `${width}` : `${width}%`,
    maxHeight: 'calc(100vh - 130px)',
  }

  const body = (
    <div style={modalStyle} className={`add-task-modal ${tblResponsive && 'table-responsive'}`} id='style-1'>
      {!noHeader && (
        <div className='d-flex flex-row justify-content-between align-items-center px-3 py-2' style={{ background: '#e0e0e080' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'EudoxusSans-Medium' }}>{title}</div>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
      )}
      <div style={{ padding: '16px' }}>{props.children}</div>
      {!noActions && (
        <div className='content-bar bottom-bar'>
          <MinimalButton text='Cancel' variant='contained' color='default' baseClassName='mr-2' onClick={onClose} />
          <MinimalButton text={cta} loadingText={loadingText} variant='contained' color='primary' loading={loading} disabled={loading || disableCTA} onClick={handleSubmit} />
        </div>
      )}
    </div>
  )
  return (
    <Modal open={open} onClose={onClose} aria-labelledby='simple-modal-title' aria-describedby='simple-modal-description'>
      {body}
    </Modal>
  )
}

export const FilterPopup = ({ selected = {}, onChange, onClear, placeholder, options, width = 115, baseClassName, closeIcon = true }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])
  const handleClear = e => {
    e.stopPropagation()
    onClear()
  }
  return (
    <div className={`filter-div ${baseClassName}`}>
      <div className={`d-flex flex-row justify-content-between align-items-center filter-chip `} onClick={() => setOpen(true)} style={{ minHeight: '30px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800 }}>{closeIcon ? `${placeholder} ${!isEmpty(selected) ? ` : ${selected.label}` : ''}` : selected.label}</div>
        {!isEmpty(selected) ? (
          closeIcon && (
            <IconButton onClick={handleClear} size='small' className='ml-3'>
              <CloseIcon fontSize='small' />
            </IconButton>
          )
        ) : (
          <ArrowDropDownIcon fontSize='small' className='ml-3' />
        )}
        {!closeIcon && <ArrowDropDownIcon fontSize='small' className='ml-3' />}
      </div>
      {open && (
        <div id='_menu-content' ref={ref} style={{ top: '32px', left: 0, maxHeight: '150px', width: 'max-content' }}>
          {options.map(d => (
            <button
              key={d.value}
              id='_menu-item'
              onClick={() => {
                onChange(d)
                setOpen(false)
              }}
              style={selected.value === d.value ? { background: '#c5c5c5' } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const StatusSelectPopup = ({ onClear, options, baseClassName, statusFilterValues, onChange, style, controlClassName }) => {
  const [open, setOpen] = useState(false)
  const selectedObj = options.find(d => isEqual(d.value, statusFilterValues)) || options.find(d => isEmpty(d.value))
  const ref = useRef(null)
  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) setOpen(false)
  }
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [])

  return (
    <div className={`filter-div ${baseClassName}`} style={style}>
      <div onClick={() => setOpen(true)} className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
        <MinimalButton size='small' startIcon={<FilterListIcon fontSize='small' />} text={get(selectedObj, 'label', '')} variant='contained' color='primary' baseClassName={controlClassName} onClick={() => setOpen(true)} />
      </div>
      {open && (
        <div id='_menu-content' ref={ref} style={{ top: '35px', left: 0, maxHeight: '200px', width: 'max-content', display: 'flex', flexDirection: 'column', fontWeight: 700 }}>
          {options.map(d => (
            <div
              id='_menu-item'
              key={d.value}
              onClick={() => {
                onChange(d.value)
                setOpen(false)
              }}
              name={d.value}
              style={{ borderRadius: '4px', display: 'flex', padding: '5px 12px', alignItems: 'center !imporntant', height: '30px', cursor: 'pointer', background: !isEmpty(selectedObj) && selectedObj.label === d.label ? '#e9e9e9' : 'none' }}
            >
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const MinimalRadio = ({ label, selected, onClick, isRadioBtnNotVisible = false }) => {
  const theme = useTheme()
  return (
    <div className='d-flex align-items-center px-3 py-2' style={{ background: selected ? `${theme.palette.primary.main}40` : 'none', cursor: 'pointer', borderRadius: '4px', border: `1px solid ${selected ? theme.palette.primary.main : '#00000054'}`, position: 'relative' }} onClick={onClick}>
      {!isRadioBtnNotVisible && <div style={{ height: '8px', width: '8px', borderRadius: '24px', border: `1px solid ${theme.palette.primary.main}`, background: selected ? theme.palette.primary.main : 'none', position: 'absolute', top: '8px', right: '8px' }} />}
      <div className='ml-2 text-bold'>{label}</div>
    </div>
  )
}

export const MinimalCheckbox = ({ label, selected, onClick, style, type }) => {
  const theme = useTheme()
  const color = theme.palette.primary.main
  const checkIcon = type === 'radio' ? <RadioButtonCheckedIcon fontSize='small' style={{ color }} /> : <CheckBoxIcon fontSize='small' style={{ color }} />
  const unCheckIcon = type === 'radio' ? <RadioButtonUncheckedIcon fontSize='small' style={{ color }} /> : <CheckBoxOutlineBlankIcon fontSize='small' style={{ color }} />
  return (
    <div className='d-flex align-items-center' style={{ cursor: 'pointer', ...style }} onClick={onClick}>
      <Tooltip title={selected ? 'DESELECT' : 'SELECT'} placement='top'>
        {selected ? checkIcon : unCheckIcon}
      </Tooltip>
      <div className='ml-2 text-xs text-bold'>{label}</div>
    </div>
  )
}

export const FormSection = ({ title, children, style, keepOpen, baseMargin, id = null, isRemove, onRemove = () => {} }) => {
  const [expand, setExpand] = useState(keepOpen || false)
  return (
    <div style={style} id={id}>
      <div style={{ borderRadius: '4px', border: '1px solid #dee2e6', marginBottom: baseMargin ? '0' : '16px', transition: `box-shadow 1s` }}>
        <div onClick={() => setExpand(!expand)} className='d-flex justify-content-between' style={{ padding: '12px 16px ', background: 'rgba(0,0,0,0.03)', borderRadius: '4px 4px 0 0', borderBottom: expand ? '1px solid #dee2e6' : 'none', cursor: 'pointer' }}>
          <div>
            {expand ? <span style={{ borderRadius: '4px', border: '1px solid #a1a1a1', color: '#a1a1a1', fontWeight: 800, padding: '0 7px' }}>-</span> : <span style={{ borderRadius: '4px', border: '1px solid #a1a1a1', color: '#a1a1a1', fontWeight: 800, padding: '0 7px' }}>+</span>}
            <strong style={{ fontSize: '14px', marginLeft: '16px' }}>{title}</strong>
          </div>
          {isRemove && <DeleteOutlineOutlinedIcon fontSize='mediam' style={{ color: '#FF0000' }} onClick={onRemove} />}
        </div>
        <div style={{ padding: '16px' }} className={`active-${expand}`}>
          {children}
        </div>
      </div>
    </div>
  )
}

export const LoaderContainer = () => (
  <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
    <CircularProgress size={24} thickness={5} />
  </div>
)

export const EmptyState = ({ text, icon }) => (
  <div style={{ height: 'calc(100%)', fontWeight: 800, gap: '12px' }} className='d-flex flex-column justify-content-center align-items-center'>
    {icon}
    <div style={{ color: '#666', marginTop: '12px' }}>{text}</div>
  </div>
)

export const ElipsisWithTootip = ({ title, size = 20 }) => {
  return (
    <Tooltip title={title} placement='top'>
      <div>
        {title?.slice(0, size)}
        {title?.length > size && <span>...</span>}
      </div>
    </Tooltip>
  )
}

export const MiniTableEmptyState = ({ text = 'No data found !' }) => (
  <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
    {text}
  </div>
)
export const ToggleButton = ({ label, value, selected, onChange }) => {
  const theme = useTheme()
  const getBg = d => (d === selected ? theme.palette.primary.main : '#f6f6f6')
  const getColor = d => (d === selected ? '#fff' : '#00000080')
  return (
    <button className='minimal-input-base text-xs' style={{ color: getColor(value), background: getBg(value), width: 'auto', padding: '6px 14px', border: 'none' }} onClick={() => onChange(value)}>
      {label}
    </button>
  )
}

export const PhotosSection = ({ label = '', type = 0, duration = 0, isPhotoUploading, uploadingPhotoType, handleUpload, images, urlKey = 'url', onRemove = () => {} }) => {
  return (
    <>
      <div className='text-bold'>{label}</div>
      <AssetImageUploadButton loading={isPhotoUploading && uploadingPhotoType.type === type && uploadingPhotoType.duration === duration} disabled={isPhotoUploading} onClick={() => handleUpload({ type, duration })} />
      <div>
        <div className='pt-3 d-flex' style={{ overflowX: 'auto', whiteSpace: 'nowrap' }} id='style-1'>
          {images.filter(d => d.imageDurationTypeId === duration).map((d, index) => !d.isDeleted && <AssetImage onRemove={() => onRemove(d)} key={`asset-image-${d.imageFileName}`} url={d[urlKey]} randomValue />)}
        </div>
      </div>
    </>
  )
}

export const AssetTypeIcon = ({ type }) => {
  if (isEmpty(type)) return ''
  else {
    return (
      <div className='mr-2'>
        {type.toLowerCase() === enums.ASSET_TYPE.ARRESTERS.toLowerCase() && <ArresterIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.BATTERIES.toLowerCase() && <BatteriesIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.BUS.toLowerCase() && <BusIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.CABLES.toLowerCase() && <CablesIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.CAPACITORS.toLowerCase() && <CapacitorIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.CIRCUIT_BREAKERS.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.CONTACTORS.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.RECLOSER.toLowerCase()) && <CircuitBreakersIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.ELECTRICAL_PANELS_MCEQ.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.ELECTRICAL_PANELS_ALL.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.ELECTRICAL_PANELS.toLowerCase()) && <ElectricalPanelsIcon />}
        {/* {(type.toLowerCase() === enums.ASSET_TYPE.ELECTRICAL_PANELS_ALL.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.ELECTRICAL_PANELS.toLowerCase()) && <ElectricalPanelsAllIcon />} */}
        {type.toLowerCase() === enums.ASSET_TYPE.FUSES.toLowerCase() && <FusesIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.GENERATORS.toLowerCase() && <GeneratorsIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.GROUND.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.GROUNDING_BONDING.toLowerCase()) && <GroundingIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.GROUND_FAULT_SYSTEMS.toLowerCase() && <GroundFaultSystemsIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.INSTRUMENT_TRANSFORMERS.toLowerCase() && <InstrumentTransformersIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.METERS_READING.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.METERS.toLowerCase()) && <MeterReadingIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.MISCELLANEOUS.toLowerCase() && <MiscellaneousIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.MOTORS.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.DC_INSULATION.toLowerCase()) && <MotorsIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.RELAYS.toLowerCase() && <RelaysIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.SWITCHES_DISC.toLowerCase() && <SwitchesIcon />}
        {(type.toLowerCase() === enums.ASSET_TYPE.SWITCHES.toLowerCase() || type.toLowerCase() === enums.ASSET_TYPE.SWITCHES_ALL.toLowerCase()) && <SwitchesAllIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.TRANSFER_SWITCHES.toLowerCase() && <TransferSwitchesIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.TRANSFORMERS.toLowerCase() && <TransformersIcon />}
        {type.toLowerCase() === enums.ASSET_TYPE.UPS_SYSTEMS.toLowerCase() && <UpsSystemIcon />}
      </div>
    )
  }
}

export const ArresterIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M10.8229 9.70266V1.00039H10.5175V9.70266H7.99844V21.0004H13.4946V9.70266H10.8229ZM10.5175 10.7027V14.6885L9.4336 12.4604L9.15903 12.594L10.6667 15.693L12.2566 12.5969L11.9849 12.4574L10.8229 14.7204V10.7027H12.4946V20.0004H8.99844V10.7027H10.5175Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.4175 0.900391H10.9229V9.60265H13.5946V21.1004H7.89844V9.60265H10.4175V0.900391ZM10.6175 1.10039V9.80265H8.09844V20.9004H13.3946V9.80265H10.7229V1.10039H10.6175ZM8.89844 10.6026H10.6175V14.6885L10.4276 14.7322L9.38743 12.594L9.2927 12.6401L10.6691 15.4694L12.1219 12.6402L12.0282 12.5921L10.9118 14.766L10.7229 14.7204V10.6026H12.5946V20.1004H8.89844V10.6026ZM9.09844 10.8026V12.5122L9.47978 12.3267L10.4175 14.2543V10.8026H9.09844ZM9.09844 12.698V19.9004H12.3946V10.8026H10.9229V14.3067L11.9417 12.3228L12.3912 12.5536L10.6643 15.9166L9.09844 12.698Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const BatteriesIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M10.783 0.999609H11.2085V7.38259H10.783V0.999609Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M10.783 14.6166H11.2085V20.9996H10.783V14.6166Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M4.4 7.38259L4.4 6.95706L17.5915 6.95706V7.38259L4.4 7.38259Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M8.65532 14.6166V14.1911H13.3362V14.6166H8.65532Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M4.4 12.2053L4.4 11.7798L17.5915 11.7798V12.2053L4.4 12.2053Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M8.65532 9.79394V9.3684H13.3362V9.79394H8.65532Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M16.1782 4.15275V3.17743H15.2029V2.80211H16.1782V1.82934H16.5535V2.80211H17.5263V3.17743H16.5535V4.15275H16.1782Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M17.2369 17.5954H15.322V17.3117H17.2369V17.5954Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.383 0.599609H11.6085V6.55706H17.9915V7.78259L4 7.78259L4 6.55706H10.383V0.599609ZM10.783 6.95706H4.4L4.4 7.38259L17.5915 7.38259V6.95706H11.2085V0.999609H10.783V6.95706ZM11.2085 14.6166V20.9996H10.783V14.6166H8.65532V14.1911H13.3362V14.6166H11.2085ZM10.383 15.0166H8.25532V13.7911H13.7362V15.0166H11.6085V21.3996H10.383V15.0166ZM4 12.6053L4 11.3798L17.9915 11.3798V12.6053L4 12.6053ZM8.25532 10.1939V8.9684H13.7362V10.1939H8.25532ZM15.7782 4.55275V3.57743H14.8029V2.40211H15.7782V1.42934H16.9535V2.40211H17.9263V3.57743H16.9535V4.55275H15.7782ZM17.5263 3.17743V2.80211H16.5535V1.82934H16.1782V2.80211H15.2029V3.17743H16.1782V4.15275H16.5535V3.17743H17.5263ZM14.922 17.9954V16.9117H17.6369V17.9954H14.922ZM15.322 17.5954V17.3117H17.2369V17.5954H15.322ZM4.4 11.7798L17.5915 11.7798V12.2053L4.4 12.2053L4.4 11.7798ZM8.65532 9.79394H13.3362V9.3684H8.65532V9.79394Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const BusIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M14.8641 19.1611L16.4431 20.6348L16.1558 20.9426L14.5769 19.4689L14.8641 19.1611Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M13.9839 15.7359V18.2623H13.5629V15.7359H13.9839Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M13.9839 11.8412V14.3675H13.5629V11.8412H13.9839Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M13.9839 7.94647V10.6833H13.5629V7.94647H13.9839Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M13.9839 4.157V6.68331H13.5629V4.157H13.9839Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M16.4486 1.35851L14.5539 3.25324L14.2561 2.95551L16.1509 1.06078L16.4486 1.35851Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M6.93732 19.207L5.35805 20.6895L5.6454 20.9991L7.22467 19.5167L6.93732 19.207Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M7.81772 15.7615V18.3028H8.23886V15.7615H7.81772Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M7.81772 11.8436V14.3849H8.23886V11.8436H7.81772Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M7.81772 7.92572V10.6788H8.23886V7.92572H7.81772Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M7.81772 4.11372V6.65505H8.23886V4.11372H7.81772Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M5.35255 1.2986L7.24767 3.2046L7.54546 2.9051L5.65034 0.9991L5.35255 1.2986Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.65034 0.644531L7.89801 2.9051L7.24767 3.55917L5 1.2986L5.65034 0.644531ZM16.1509 0.707225L16.8022 1.35851L14.5539 3.6068L13.9026 2.95551L16.1509 0.707225ZM7.56772 3.86372H8.48886V6.90505H7.56772V3.86372ZM13.3129 3.907H14.2339V6.93331H13.3129V3.907ZM7.56772 7.67572H8.48886V10.9288H7.56772V7.67572ZM13.3129 7.69647H14.2339V10.9333H13.3129V7.69647ZM13.3129 11.5912H14.2339V14.6175H13.3129V11.5912ZM7.56772 11.5936H8.48886V14.6349H7.56772V11.5936ZM13.3129 15.4859H14.2339V18.5123H13.3129V15.4859ZM7.56772 15.5115H8.48886V18.5528H7.56772V15.5115ZM14.852 18.8078L16.7964 20.6226L16.168 21.2959L14.2235 19.4811L14.852 18.8078ZM6.94954 18.8527L7.57701 19.5288L5.63318 21.3535L5.00571 20.6773L6.94954 18.8527Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const CablesIcon = () => {
  return (
    <svg width='21' height='21' viewBox='0 0 21 21' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_15961_665)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M11.2561 0.999609H11.5535V6.94756L12.8633 7.92992L10.5797 9.25585L12.8846 10.6685L10.5742 12.01L12.8687 13.4903L10.5249 15.0024L11.5535 16.031V20.9996H11.2561V16.1541L10.0542 14.9522L12.3201 13.4903L10.0049 11.9966L12.3042 10.6616L9.99936 9.24895L12.3255 7.8983L11.2561 7.09626V0.999609Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M10.8561 0.599609H11.9535V6.74756L13.5867 7.97244L11.3603 9.26513L13.6652 10.6778L11.3399 12.028L13.6065 13.4903L11.1581 15.0699L11.9535 15.8653V21.3996H10.8561V16.3198L9.42096 14.8847L11.5823 13.4903L9.23924 11.9787L11.5236 10.6523L9.21875 9.23966L11.6021 7.85578L10.8561 7.29626V0.599609ZM11.2561 20.9996H11.5535V16.031L10.5249 15.0024L12.8687 13.4903L10.5742 12.01L12.8846 10.6685L10.5797 9.25585L12.8633 7.92992L11.5535 6.94756V0.999609H11.2561V7.09626L12.3255 7.8983L9.99936 9.24895L12.3042 10.6616L10.0049 11.9966L12.3201 13.4903L10.0542 14.9522L11.2561 16.1541V20.9996Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
      </g>
      <defs>
        <clipPath id='clip0_15961_665'>
          <rect width='21' height='21' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export const CapacitorIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M10.1992 1.19922H11.1992V9.19922H10.1992V1.19922Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M10 1H11.4V9.4H10V1ZM10.2 1.2V9.2H11.2V1.2H10.2Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M10.1992 13.1992H11.1992V21.1992H10.1992V13.1992Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M10 13H11.4V21.4H10V13ZM10.2 13.2V21.2H11.2V13.2H10.2Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M4.19922 9.19922H17.1992V10.1992H4.19922V9.19922Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M4 9H17.4V10.4H4V9ZM4.2 9.2V10.2H17.2V9.2H4.2Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M4.19922 12.1992H17.1992V13.1992H4.19922V12.1992Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M4 12H17.4V13.4H4V12ZM4.2 12.2V13.2H17.2V12.2H4.2Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
    </svg>
  )
}

export const CircuitBreakersIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8 1.64935C8 1.29072 8.29072 1 8.64935 1C9.00798 1 9.2987 1.29072 9.2987 1.64935V6.32468C9.2987 6.6833 9.00798 6.97403 8.64935 6.97403C8.29072 6.97403 8 6.6833 8 6.32468V1.64935ZM8 15.6753C8 15.3167 8.29072 15.026 8.64935 15.026C9.00798 15.026 9.2987 15.3167 9.2987 15.6753V20.3506C9.2987 20.7093 9.00798 21 8.64935 21C8.29072 21 8 20.7093 8 20.3506V15.6753ZM10.2077 6.84435C11.3332 7.0608 13.4544 8.22097 12.9349 11.1301C12.9349 13.1173 12.4154 15.0262 10.0778 15.2859C9.4544 15.9093 10.1644 16.2383 10.5973 16.3249C11.4631 16.2383 13.3506 15.3379 13.974 12.4288V9.83136C13.974 8.96556 13.3506 6.92227 10.8571 5.67552C9.4026 5.57162 9.81809 6.41145 10.2077 6.84435Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const ElectricalPanelsIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M3.52632 1.52632V20.4737H18.3383V1.52632H3.52632ZM3.30075 1C3.13465 1 3 1.13465 3 1.30075V20.6992C3 20.8653 3.13465 21 3.30075 21H18.5639C18.73 21 18.8647 20.8653 18.8647 20.6992V1.30075C18.8647 1.13465 18.73 1 18.5639 1H3.30075Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        d='M4.95489 18.594V3.40601H16.9098V6.76476C16.9718 6.68811 17.0666 6.6391 17.1729 6.6391C17.2792 6.6391 17.3741 6.68811 17.4361 6.76476V3.18045C17.4361 3.01435 17.3014 2.8797 17.1353 2.8797H4.72932C4.56322 2.8797 4.42857 3.01435 4.42857 3.18045V18.8195C4.42857 18.9856 4.56322 19.1203 4.72932 19.1203H17.1353C17.3014 19.1203 17.4361 18.9856 17.4361 18.8195V15.3856C17.3741 15.4623 17.2792 15.5113 17.1729 15.5113C17.0666 15.5113 16.9718 15.4623 16.9098 15.3856V18.594H4.95489Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M16.9098 13.5317C16.9718 13.455 17.0666 13.406 17.1729 13.406C17.2792 13.406 17.3741 13.455 17.4361 13.5317V8.6187C17.3741 8.69535 17.2792 8.74436 17.1729 8.74436C17.0666 8.74436 16.9718 8.69535 16.9098 8.6187V13.5317Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M11.1954 4.00747L14.7292 11.0375C14.8294 11.213 14.9096 11.5639 14.4284 11.5639H7.43595C7.26052 11.5764 6.96227 11.4962 7.1728 11.0751L10.7068 4.00747C10.7819 3.90722 10.9847 3.76687 11.1954 4.00747ZM7.81203 11L10.9323 4.83459L14.0526 11H7.81203Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        d='M11.0827 7.05263L10.0677 8.81955C10.0075 9.09022 10.193 9.20802 10.2932 9.23308H11.0827C10.9699 9.42105 10.6917 9.88722 10.4812 10.2481C10.4511 10.7293 10.7945 10.6742 10.9699 10.5865C11.2205 10.1604 11.7444 9.26316 11.8346 9.08271C11.9248 8.8421 11.7469 8.70677 11.6466 8.66917H10.8195C10.9825 8.38095 11.3609 7.71428 11.5714 7.35338C11.6015 6.81203 11.2581 6.92732 11.0827 7.05263Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M6.38346 13.9323C6.38346 13.7662 6.51811 13.6316 6.68421 13.6316H10.6692C10.8353 13.6316 10.9699 13.7662 10.9699 13.9323C10.9699 14.0984 10.8353 14.2331 10.6692 14.2331H6.68421C6.51811 14.2331 6.38346 14.0984 6.38346 13.9323Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M6.38346 15.3609C6.38346 15.1948 6.51811 15.0602 6.68421 15.0602H10.6692C10.8353 15.0602 10.9699 15.1948 10.9699 15.3609C10.9699 15.527 10.8353 15.6617 10.6692 15.6617H6.68421C6.51811 15.6617 6.38346 15.527 6.38346 15.3609Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M6.38346 16.7895C6.38346 16.6234 6.51811 16.4887 6.68421 16.4887H10.6692C10.8353 16.4887 10.9699 16.6234 10.9699 16.7895C10.9699 16.9556 10.8353 17.0902 10.6692 17.0902H6.68421C6.51811 17.0902 6.38346 16.9556 6.38346 16.7895Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.4135 14.609C13.6419 14.609 13.8271 14.4239 13.8271 14.1955C13.8271 13.9671 13.6419 13.782 13.4135 13.782C13.1851 13.782 13 13.9671 13 14.1955C13 14.4239 13.1851 14.609 13.4135 14.609ZM13.4135 15.1353C13.9326 15.1353 14.3534 14.7146 14.3534 14.1955C14.3534 13.6764 13.9326 13.2556 13.4135 13.2556C12.8945 13.2556 12.4737 13.6764 12.4737 14.1955C12.4737 14.7146 12.8945 15.1353 13.4135 15.1353Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.4135 16.7895C13.6419 16.7895 13.8271 16.6043 13.8271 16.3759C13.8271 16.1476 13.6419 15.9624 13.4135 15.9624C13.1851 15.9624 13 16.1476 13 16.3759C13 16.6043 13.1851 16.7895 13.4135 16.7895ZM13.4135 17.3158C13.9326 17.3158 14.3534 16.895 14.3534 16.3759C14.3534 15.8569 13.9326 15.4361 13.4135 15.4361C12.8945 15.4361 12.4737 15.8569 12.4737 16.3759C12.4737 16.895 12.8945 17.3158 13.4135 17.3158Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M18.1128 6.97744V8.40601C18.1128 8.92508 17.692 9.34586 17.1729 9.34586C16.6539 9.34586 16.2331 8.92508 16.2331 8.40601V6.97744C16.2331 6.45838 16.6539 6.03759 17.1729 6.03759C17.692 6.03759 18.1128 6.45838 18.1128 6.97744ZM17.1729 6.6391C16.9861 6.6391 16.8346 6.79058 16.8346 6.97744V8.40601C16.8346 8.59288 16.9861 8.74436 17.1729 8.74436C17.3598 8.74436 17.5113 8.59288 17.5113 8.40601V6.97744C17.5113 6.79058 17.3598 6.6391 17.1729 6.6391Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M18.1128 13.7444V15.1729C18.1128 15.692 17.692 16.1128 17.1729 16.1128C16.6539 16.1128 16.2331 15.692 16.2331 15.1729V13.7444C16.2331 13.2253 16.6539 12.8045 17.1729 12.8045C17.692 12.8045 18.1128 13.2253 18.1128 13.7444ZM17.1729 13.406C16.9861 13.406 16.8346 13.5575 16.8346 13.7444V15.1729C16.8346 15.3598 16.9861 15.5113 17.1729 15.5113C17.3598 15.5113 17.5113 15.3598 17.5113 15.1729V13.7444C17.5113 13.5575 17.3598 13.406 17.1729 13.406Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}
export const ElectricalPanelsAllIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M1.32945 5.32749V17.1032H10.5351V5.32749H1.32945ZM1.18926 5.00039C1.08603 5.00039 1.00234 5.08408 1.00234 5.18731V17.2434C1.00234 17.3466 1.08603 17.4303 1.18926 17.4303H10.6752C10.7785 17.4303 10.8622 17.3466 10.8622 17.2434V5.18731C10.8622 5.08408 10.7785 5.00039 10.6752 5.00039H1.18926Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M2.2173 15.935V6.49572H9.6472V8.58316C9.68575 8.53552 9.7447 8.50506 9.81075 8.50506C9.87681 8.50506 9.93576 8.53552 9.97431 8.58316V6.35553C9.97431 6.2523 9.89062 6.16861 9.78739 6.16861H2.07711C1.97388 6.16861 1.89019 6.2523 1.89019 6.35553V16.0752C1.89019 16.1784 1.97388 16.2621 2.07711 16.2621H9.78739C9.89062 16.2621 9.97431 16.1784 9.97431 16.0752V13.941C9.93576 13.9886 9.87681 14.0191 9.81075 14.0191C9.7447 14.0191 9.68575 13.9886 9.6472 13.941V15.935H2.2173Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M9.6472 12.7888C9.68575 12.7411 9.7447 12.7107 9.81075 12.7107C9.87681 12.7107 9.93576 12.7411 9.97431 12.7888V9.73537C9.93576 9.78302 9.87681 9.81347 9.81075 9.81347C9.7447 9.81347 9.68575 9.78302 9.6472 9.73537V12.7888Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M6.09572 6.86952L8.29198 11.2387C8.35428 11.3477 8.40413 11.5658 8.10506 11.5658H3.75927C3.65023 11.5736 3.46488 11.5237 3.59572 11.262L5.79206 6.86952C5.83874 6.80721 5.96481 6.71998 6.09572 6.86952ZM3.993 11.2153L5.93225 7.38357L7.8715 11.2153H3.993Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        d='M6.02571 8.76207L5.39487 9.8602C5.35748 10.0284 5.47275 10.1016 5.53505 10.1172H6.02571C5.95561 10.234 5.78272 10.5238 5.65187 10.7481C5.63318 11.0471 5.84658 11.0129 5.95561 10.9583C6.11138 10.6935 6.43692 10.1359 6.493 10.0238C6.54907 9.87422 6.43848 9.79011 6.37617 9.76675H5.86215C5.9634 9.58762 6.1986 9.17329 6.32944 8.94899C6.34814 8.61254 6.13474 8.68419 6.02571 8.76207Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M3.10515 13.0378C3.10515 12.9345 3.18883 12.8509 3.29206 12.8509H5.7687C5.87193 12.8509 5.95561 12.9345 5.95561 13.0378C5.95561 13.141 5.87193 13.2247 5.7687 13.2247H3.29206C3.18883 13.2247 3.10515 13.141 3.10515 13.0378Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M3.10515 13.9256C3.10515 13.8224 3.18883 13.7387 3.29206 13.7387H5.7687C5.87193 13.7387 5.95561 13.8224 5.95561 13.9256C5.95561 14.0289 5.87193 14.1125 5.7687 14.1125H3.29206C3.18883 14.1125 3.10515 14.0289 3.10515 13.9256Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M3.10515 14.8135C3.10515 14.7102 3.18883 14.6266 3.29206 14.6266H5.7687C5.87193 14.6266 5.95561 14.7102 5.95561 14.8135C5.95561 14.9167 5.87193 15.0004 5.7687 15.0004H3.29206C3.18883 15.0004 3.10515 14.9167 3.10515 14.8135Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.47431 13.4583C7.61625 13.4583 7.73132 13.3433 7.73132 13.2013C7.73132 13.0594 7.61625 12.9443 7.47431 12.9443C7.33236 12.9443 7.2173 13.0594 7.2173 13.2013C7.2173 13.3433 7.33236 13.4583 7.47431 13.4583ZM7.47431 13.7854C7.7969 13.7854 8.05842 13.5239 8.05842 13.2013C8.05842 12.8787 7.7969 12.6172 7.47431 12.6172C7.15171 12.6172 6.89019 12.8787 6.89019 13.2013C6.89019 13.5239 7.15171 13.7854 7.47431 13.7854Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.47431 14.8135C7.61625 14.8135 7.73132 14.6984 7.73132 14.5565C7.73132 14.4145 7.61625 14.2995 7.47431 14.2995C7.33236 14.2995 7.2173 14.4145 7.2173 14.5565C7.2173 14.6984 7.33236 14.8135 7.47431 14.8135ZM7.47431 15.1406C7.7969 15.1406 8.05842 14.8791 8.05842 14.5565C8.05842 14.2339 7.7969 13.9724 7.47431 13.9724C7.15171 13.9724 6.89019 14.2339 6.89019 14.5565C6.89019 14.8791 7.15171 15.1406 7.47431 15.1406Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.3949 8.71534V9.60319C10.3949 9.92579 10.1334 10.1873 9.81075 10.1873C9.48816 10.1873 9.22664 9.92579 9.22664 9.60319V8.71534C9.22664 8.39275 9.48816 8.13123 9.81075 8.13123C10.1334 8.13123 10.3949 8.39275 10.3949 8.71534ZM9.81075 8.50506C9.69462 8.50506 9.60047 8.59921 9.60047 8.71534V9.60319C9.60047 9.71933 9.69462 9.81347 9.81075 9.81347C9.92689 9.81347 10.021 9.71933 10.021 9.60319V8.71534C10.021 8.59921 9.92689 8.50506 9.81075 8.50506Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.3949 12.921V13.8088C10.3949 14.1314 10.1334 14.3929 9.81075 14.3929C9.48816 14.3929 9.22664 14.1314 9.22664 13.8088V12.921C9.22664 12.5984 9.48816 12.3368 9.81075 12.3368C10.1334 12.3368 10.3949 12.5984 10.3949 12.921ZM9.81075 12.7107C9.69462 12.7107 9.60047 12.8048 9.60047 12.921V13.8088C9.60047 13.9249 9.69462 14.0191 9.81075 14.0191C9.92689 14.0191 10.021 13.9249 10.021 13.8088V12.921C10.021 12.8048 9.92689 12.7107 9.81075 12.7107Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.4697 5.32749V17.1032H20.6753V5.32749H11.4697ZM11.3295 5.00039C11.2263 5.00039 11.1426 5.08408 11.1426 5.18731V17.2434C11.1426 17.3466 11.2263 17.4303 11.3295 17.4303H20.8155C20.9187 17.4303 21.0024 17.3466 21.0024 17.2434V5.18731C21.0024 5.08408 20.9187 5.00039 20.8155 5.00039H11.3295Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M12.3575 15.935V6.49572H19.7874V8.58316C19.826 8.53552 19.8849 8.50506 19.951 8.50506C20.017 8.50506 20.076 8.53552 20.1145 8.58316V6.35553C20.1145 6.2523 20.0309 6.16861 19.9276 6.16861H12.2173C12.1141 6.16861 12.0304 6.2523 12.0304 6.35553V16.0752C12.0304 16.1784 12.1141 16.2621 12.2173 16.2621H19.9276C20.0309 16.2621 20.1145 16.1784 20.1145 16.0752V13.941C20.076 13.9886 20.017 14.0191 19.951 14.0191C19.8849 14.0191 19.826 13.9886 19.7874 13.941V15.935H12.3575Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M19.7874 12.7888C19.826 12.7411 19.8849 12.7107 19.951 12.7107C20.017 12.7107 20.076 12.7411 20.1145 12.7888V9.73537C20.076 9.78302 20.017 9.81347 19.951 9.81347C19.8849 9.81347 19.826 9.78302 19.7874 9.73537V12.7888Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M16.236 6.86952L18.4322 11.2387C18.4945 11.3477 18.5444 11.5658 18.2453 11.5658H13.8995C13.7905 11.5736 13.6051 11.5237 13.736 11.262L15.9323 6.86952C15.979 6.80721 16.105 6.71998 16.236 6.86952ZM14.1332 11.2153L16.0725 7.38357L18.0117 11.2153H14.1332Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        d='M16.1659 8.76207L15.5351 9.8602C15.4977 10.0284 15.613 10.1016 15.6753 10.1172H16.1659C16.0958 10.234 15.923 10.5238 15.7921 10.7481C15.7734 11.0471 15.9868 11.0129 16.0958 10.9583C16.2516 10.6935 16.5772 10.1359 16.6332 10.0238C16.6893 9.87422 16.5787 9.79011 16.5164 9.76675H16.0024C16.1036 9.58762 16.3388 9.17329 16.4697 8.94899C16.4884 8.61254 16.275 8.68419 16.1659 8.76207Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path d='M13.2454 13.0378C13.2454 12.9345 13.3291 12.8509 13.4323 12.8509H15.9089C16.0122 12.8509 16.0958 12.9345 16.0958 13.0378C16.0958 13.141 16.0122 13.2247 15.9089 13.2247H13.4323C13.3291 13.2247 13.2454 13.141 13.2454 13.0378Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M13.2454 13.9256C13.2454 13.8224 13.3291 13.7387 13.4323 13.7387H15.9089C16.0122 13.7387 16.0958 13.8224 16.0958 13.9256C16.0958 14.0289 16.0122 14.1125 15.9089 14.1125H13.4323C13.3291 14.1125 13.2454 14.0289 13.2454 13.9256Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path d='M13.2454 14.8135C13.2454 14.7102 13.3291 14.6266 13.4323 14.6266H15.9089C16.0122 14.6266 16.0958 14.7102 16.0958 14.8135C16.0958 14.9167 16.0122 15.0004 15.9089 15.0004H13.4323C13.3291 15.0004 13.2454 14.9167 13.2454 14.8135Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17.6145 13.4583C17.7565 13.4583 17.8715 13.3433 17.8715 13.2013C17.8715 13.0594 17.7565 12.9443 17.6145 12.9443C17.4726 12.9443 17.3575 13.0594 17.3575 13.2013C17.3575 13.3433 17.4726 13.4583 17.6145 13.4583ZM17.6145 13.7854C17.9371 13.7854 18.1987 13.5239 18.1987 13.2013C18.1987 12.8787 17.9371 12.6172 17.6145 12.6172C17.2919 12.6172 17.0304 12.8787 17.0304 13.2013C17.0304 13.5239 17.2919 13.7854 17.6145 13.7854Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M17.6145 14.8135C17.7565 14.8135 17.8715 14.6984 17.8715 14.5565C17.8715 14.4145 17.7565 14.2995 17.6145 14.2995C17.4726 14.2995 17.3575 14.4145 17.3575 14.5565C17.3575 14.6984 17.4726 14.8135 17.6145 14.8135ZM17.6145 15.1406C17.9371 15.1406 18.1987 14.8791 18.1987 14.5565C18.1987 14.2339 17.9371 13.9724 17.6145 13.9724C17.2919 13.9724 17.0304 14.2339 17.0304 14.5565C17.0304 14.8791 17.2919 15.1406 17.6145 15.1406Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20.5351 8.71534V9.60319C20.5351 9.92579 20.2736 10.1873 19.951 10.1873C19.6284 10.1873 19.3669 9.92579 19.3669 9.60319V8.71534C19.3669 8.39275 19.6284 8.13123 19.951 8.13123C20.2736 8.13123 20.5351 8.39275 20.5351 8.71534ZM19.951 8.50506C19.8349 8.50506 19.7407 8.59921 19.7407 8.71534V9.60319C19.7407 9.71933 19.8349 9.81347 19.951 9.81347C20.0671 9.81347 20.1613 9.71933 20.1613 9.60319V8.71534C20.1613 8.59921 20.0671 8.50506 19.951 8.50506Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20.5351 12.921V13.8088C20.5351 14.1314 20.2736 14.3929 19.951 14.3929C19.6284 14.3929 19.3669 14.1314 19.3669 13.8088V12.921C19.3669 12.5984 19.6284 12.3368 19.951 12.3368C20.2736 12.3368 20.5351 12.5984 20.5351 12.921ZM19.951 12.7107C19.8349 12.7107 19.7407 12.8048 19.7407 12.921V13.8088C19.7407 13.9249 19.8349 14.0191 19.951 14.0191C20.0671 14.0191 20.1613 13.9249 20.1613 13.8088V12.921C20.1613 12.8048 20.0671 12.7107 19.951 12.7107Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.6472 6.49572H2.2173V15.935H9.6472V14.3697C9.61242 14.3596 9.57898 14.3463 9.5472 14.3302C9.35701 14.2339 9.22664 14.0366 9.22664 13.8088V12.921C9.22664 12.6932 9.35701 12.4959 9.5472 12.3995C9.57898 12.3834 9.61242 12.3702 9.6472 12.36V10.1641C9.61242 10.154 9.57898 10.1407 9.5472 10.1246C9.35701 10.0283 9.22664 9.83097 9.22664 9.60319V8.71534C9.22664 8.48757 9.35701 8.29025 9.5472 8.19393C9.57898 8.17784 9.61242 8.16456 9.6472 8.15444V6.49572ZM9.5472 8.08384V6.59572H2.3173V15.835H9.5472V14.4403C9.30021 14.3371 9.12664 14.0932 9.12664 13.8088V12.921C9.12664 12.6365 9.30021 12.3927 9.5472 12.2895V10.2347C9.30021 10.1315 9.12664 9.88761 9.12664 9.60319V8.71534C9.12664 8.43092 9.30021 8.18704 9.5472 8.08384ZM9.97431 16.0752C9.97431 16.1784 9.89062 16.2621 9.78739 16.2621H2.07711C1.97388 16.2621 1.89019 16.1784 1.89019 16.0752V6.35553C1.89019 6.2523 1.97388 6.16861 2.07711 6.16861H9.78739C9.89062 6.16861 9.97431 6.2523 9.97431 6.35553V8.15444C10.0091 8.16456 10.0425 8.17784 10.0743 8.19393C10.2645 8.29025 10.3949 8.48757 10.3949 8.71534V9.60319C10.3949 9.83097 10.2645 10.0283 10.0743 10.1246C10.0425 10.1407 10.0091 10.154 9.97431 10.1641V12.36C10.0091 12.3702 10.0425 12.3834 10.0743 12.3995C10.2645 12.4959 10.3949 12.6932 10.3949 12.921V13.8088C10.3949 14.0366 10.2645 14.2339 10.0743 14.3302C10.0425 14.3463 10.0091 14.3596 9.97431 14.3697V16.0752ZM10.0743 14.4403V16.0752C10.0743 16.2336 9.94585 16.3621 9.78739 16.3621H2.07711C1.91865 16.3621 1.79019 16.2336 1.79019 16.0752V6.35553C1.79019 6.19707 1.91865 6.06861 2.07711 6.06861H9.78739C9.94585 6.06861 10.0743 6.19707 10.0743 6.35553V8.08384C10.2346 8.15082 10.364 8.27706 10.4351 8.43518V5.42749H1.42945V17.0032H10.4351V14.089C10.364 14.2471 10.2346 14.3733 10.0743 14.4403ZM10.4351 12.6408V9.88336C10.364 10.0415 10.2346 10.1677 10.0743 10.2347V12.2895C10.2346 12.3564 10.364 12.4827 10.4351 12.6408ZM9.7472 12.7204C9.70746 12.733 9.67283 12.7571 9.6472 12.7888C9.61798 12.8249 9.60047 12.8709 9.60047 12.921V13.8088C9.60047 13.8589 9.61798 13.9049 9.6472 13.941C9.67283 13.9726 9.70746 13.9967 9.7472 14.0093C9.76725 14.0157 9.7886 14.0191 9.81075 14.0191C9.83291 14.0191 9.85426 14.0157 9.87431 14.0093C9.91405 13.9967 9.94868 13.9726 9.97431 13.941C10.0035 13.9049 10.021 13.8589 10.021 13.8088V12.921C10.021 12.8709 10.0035 12.8249 9.97431 12.7888C9.94868 12.7571 9.91405 12.733 9.87431 12.7204C9.85426 12.7141 9.83291 12.7107 9.81075 12.7107C9.7886 12.7107 9.76725 12.7141 9.7472 12.7204ZM9.89657 12.8517C9.89273 12.8469 9.88852 12.8425 9.88398 12.8385C9.86744 12.8238 9.84658 12.814 9.82354 12.8114C9.81935 12.8109 9.81508 12.8107 9.81075 12.8107C9.80481 12.8107 9.79897 12.8111 9.79328 12.812C9.77 12.8157 9.74915 12.8267 9.73306 12.8427C9.7302 12.8455 9.72749 12.8485 9.72494 12.8517C9.70964 12.8706 9.70047 12.8947 9.70047 12.921V13.8088C9.70047 13.835 9.70964 13.8591 9.72494 13.8781C9.72866 13.8827 9.73273 13.887 9.73711 13.8909C9.75371 13.9058 9.77474 13.9157 9.79797 13.9184C9.80216 13.9188 9.80643 13.9191 9.81075 13.9191C9.81642 13.9191 9.82199 13.9187 9.82743 13.9178C9.85103 13.9143 9.87217 13.9032 9.88845 13.8871C9.89131 13.8842 9.89402 13.8812 9.89657 13.8781C9.91187 13.8591 9.92103 13.835 9.92103 13.8088V12.921C9.92103 12.8947 9.91187 12.8706 9.89657 12.8517ZM9.60047 9.60319C9.60047 9.65327 9.61798 9.69926 9.6472 9.73537C9.67283 9.76704 9.70746 9.79112 9.7472 9.8037C9.76725 9.81005 9.7886 9.81347 9.81075 9.81347C9.83291 9.81347 9.85426 9.81005 9.87431 9.8037C9.91405 9.79112 9.94868 9.76704 9.97431 9.73537C10.0035 9.69926 10.021 9.65327 10.021 9.60319V8.71534C10.021 8.66527 10.0035 8.61928 9.97431 8.58316C9.94868 8.5515 9.91405 8.52742 9.87431 8.51484C9.85426 8.50849 9.83291 8.50506 9.81075 8.50506C9.7886 8.50506 9.76725 8.50849 9.7472 8.51484C9.70746 8.52742 9.67283 8.5515 9.6472 8.58316C9.61798 8.61928 9.60047 8.66527 9.60047 8.71534V9.60319ZM9.89657 8.64607C9.89269 8.64127 9.88843 8.63682 9.88384 8.63274C9.86732 8.6181 9.84651 8.60843 9.82354 8.60579C9.81935 8.60531 9.81508 8.60506 9.81075 8.60506C9.80493 8.60506 9.79921 8.60551 9.79363 8.60638C9.77021 8.61001 9.74923 8.621 9.73306 8.63707C9.7302 8.63992 9.72749 8.64292 9.72494 8.64607C9.70964 8.665 9.70047 8.6891 9.70047 8.71534V9.60319C9.70047 9.62943 9.70964 9.65354 9.72494 9.67247C9.72873 9.67715 9.73288 9.68151 9.73735 9.6855C9.75391 9.70031 9.77485 9.71009 9.79797 9.71275C9.80216 9.71323 9.80643 9.71347 9.81075 9.71347C9.81665 9.71347 9.82244 9.71302 9.82808 9.71213C9.85142 9.70846 9.87232 9.69749 9.88845 9.68146C9.89131 9.67862 9.89402 9.67562 9.89657 9.67247C9.91187 9.65354 9.92103 9.62943 9.92103 9.60319V8.71534C9.92103 8.6891 9.91187 8.665 9.89657 8.64607ZM6.09572 6.86952L8.29198 11.2387C8.35428 11.3477 8.40413 11.5658 8.10506 11.5658H3.75927C3.65023 11.5736 3.46488 11.5237 3.59572 11.262L5.79206 6.86952C5.83874 6.80721 5.96481 6.71998 6.09572 6.86952ZM3.76255 11.6658C3.69738 11.6698 3.58944 11.6593 3.51636 11.5852C3.42809 11.4957 3.43304 11.3638 3.50627 11.2173L5.70664 6.81676L5.71203 6.80956C5.74487 6.76572 5.80734 6.70934 5.89241 6.69208C5.98722 6.67283 6.08613 6.70675 6.17096 6.80365L6.17935 6.81323L8.3802 11.1915C8.41555 11.2543 8.45726 11.3631 8.43102 11.4675C8.41644 11.5255 8.38135 11.5788 8.32117 11.6154C8.26376 11.6504 8.19071 11.6658 8.10506 11.6658H3.76255ZM5.30056 9.82362L5.94985 8.69336L5.96758 8.6807C6.0008 8.65697 6.04283 8.63299 6.08841 8.61685C6.13278 8.60113 6.1895 8.58968 6.24723 8.60255C6.31046 8.61664 6.36331 8.65748 6.3952 8.72329C6.42474 8.78425 6.43442 8.8622 6.42929 8.95454L6.42796 8.97858L6.41582 8.99937C6.3143 9.17341 6.14954 9.46259 6.03372 9.66675H6.39431L6.41129 9.67311C6.45742 9.69041 6.51964 9.72865 6.56218 9.79247C6.60821 9.86151 6.62611 9.95358 6.58663 10.0589L6.58293 10.0687C6.52488 10.1848 6.19622 10.7465 6.04181 11.009L6.0268 11.0345L6.00033 11.0478C5.93755 11.0792 5.82637 11.1154 5.72363 11.0805C5.66723 11.0613 5.61797 11.0218 5.58675 10.9596C5.557 10.9004 5.54675 10.827 5.55207 10.7418L5.55355 10.7181L5.5655 10.6977C5.65602 10.5425 5.76655 10.3562 5.84941 10.2172H5.52274L5.5108 10.2142C5.4617 10.202 5.39639 10.1691 5.34848 10.1071C5.29739 10.0411 5.27246 9.95004 5.29725 9.83851L5.30056 9.82362ZM6.02571 10.1172C6.01024 10.143 5.98978 10.1772 5.96586 10.2172C5.88137 10.3587 5.75385 10.5732 5.65187 10.7481C5.63318 11.0471 5.84658 11.0129 5.95561 10.9583C6.11138 10.6935 6.43692 10.1359 6.493 10.0238C6.54907 9.87422 6.43848 9.79011 6.37617 9.76675H5.86215C5.87803 9.73865 5.89721 9.70477 5.91876 9.66675C6.03461 9.46233 6.21912 9.13811 6.32944 8.94899C6.34814 8.61254 6.13474 8.68419 6.02571 8.76207L5.39487 9.8602C5.35748 10.0284 5.47275 10.1016 5.53505 10.1172H6.02571ZM19.7874 6.49572H12.3575V15.935H19.7874V14.3697C19.7527 14.3596 19.7192 14.3463 19.6874 14.3302C19.4972 14.2339 19.3669 14.0366 19.3669 13.8088V12.921C19.3669 12.6932 19.4972 12.4959 19.6874 12.3995C19.7192 12.3834 19.7527 12.3702 19.7874 12.36V10.1641C19.7527 10.154 19.7192 10.1407 19.6874 10.1246C19.4972 10.0283 19.3669 9.83097 19.3669 9.60319V8.71534C19.3669 8.48757 19.4972 8.29025 19.6874 8.19393C19.7192 8.17784 19.7527 8.16456 19.7874 8.15444V6.49572ZM19.6874 8.08384V6.59572H12.4575V15.835H19.6874V14.4403C19.4404 14.3371 19.2669 14.0932 19.2669 13.8088V12.921C19.2669 12.6365 19.4404 12.3927 19.6874 12.2895V10.2347C19.4404 10.1315 19.2669 9.88761 19.2669 9.60319V8.71534C19.2669 8.43092 19.4404 8.18704 19.6874 8.08384ZM20.1145 16.0752C20.1145 16.1784 20.0309 16.2621 19.9276 16.2621H12.2173C12.1141 16.2621 12.0304 16.1784 12.0304 16.0752V6.35553C12.0304 6.2523 12.1141 6.16861 12.2173 6.16861H19.9276C20.0309 6.16861 20.1145 6.2523 20.1145 6.35553V8.15444C20.1493 8.16456 20.1828 8.17784 20.2145 8.19393C20.4047 8.29025 20.5351 8.48757 20.5351 8.71534V9.60319C20.5351 9.83097 20.4047 10.0283 20.2145 10.1246C20.1828 10.1407 20.1493 10.154 20.1145 10.1641V12.36C20.1493 12.3702 20.1828 12.3834 20.2145 12.3995C20.4047 12.4959 20.5351 12.6932 20.5351 12.921V13.8088C20.5351 14.0366 20.4047 14.2339 20.2145 14.3302C20.1828 14.3463 20.1493 14.3596 20.1145 14.3697V16.0752ZM20.2145 14.4403V16.0752C20.2145 16.2336 20.0861 16.3621 19.9276 16.3621H12.2173C12.0589 16.3621 11.9304 16.2336 11.9304 16.0752V6.35553C11.9304 6.19707 12.0589 6.06861 12.2173 6.06861H19.9276C20.0861 6.06861 20.2145 6.19707 20.2145 6.35553V8.08384C20.3748 8.15082 20.5042 8.27706 20.5753 8.43518V5.42749H11.5697V17.0032H20.5753V14.089C20.5042 14.2471 20.3748 14.3733 20.2145 14.4403ZM20.5753 12.6408V9.88336C20.5042 10.0415 20.3748 10.1677 20.2145 10.2347V12.2895C20.3748 12.3564 20.5042 12.4827 20.5753 12.6408ZM20.0145 12.7204C19.9945 12.7141 19.9731 12.7107 19.951 12.7107C19.9288 12.7107 19.9075 12.7141 19.8874 12.7204C19.8477 12.733 19.8131 12.7571 19.7874 12.7888C19.7582 12.8249 19.7407 12.8709 19.7407 12.921V13.8088C19.7407 13.8589 19.7582 13.9049 19.7874 13.941C19.8131 13.9726 19.8477 13.9967 19.8874 14.0093C19.9075 14.0157 19.9288 14.0191 19.951 14.0191C19.9731 14.0191 19.9945 14.0157 20.0145 14.0093C20.0543 13.9967 20.0889 13.9726 20.1145 13.941C20.1438 13.9049 20.1613 13.8589 20.1613 13.8088V12.921C20.1613 12.8709 20.1438 12.8249 20.1145 12.7888C20.0889 12.7571 20.0543 12.733 20.0145 12.7204ZM20.0368 12.8517C20.031 12.8445 20.0243 12.8381 20.0169 12.8325C20.005 12.8236 19.9911 12.817 19.9761 12.8135C19.9681 12.8117 19.9596 12.8107 19.951 12.8107C19.9418 12.8107 19.9329 12.8118 19.9244 12.8139C19.9088 12.8177 19.8945 12.8249 19.8823 12.8346C19.876 12.8397 19.8703 12.8454 19.8652 12.8517C19.8499 12.8706 19.8407 12.8947 19.8407 12.921V13.8088C19.8407 13.835 19.8499 13.8591 19.8652 13.8781C19.8706 13.8848 19.8767 13.8908 19.8835 13.896C19.8958 13.9056 19.9102 13.9126 19.9258 13.9162C19.9339 13.9181 19.9423 13.9191 19.951 13.9191C19.9602 13.9191 19.9691 13.918 19.9776 13.9159C19.9932 13.912 20.0075 13.9049 20.0197 13.8951C20.026 13.8901 20.0317 13.8844 20.0368 13.8781C20.0521 13.8591 20.0613 13.835 20.0613 13.8088V12.921C20.0613 12.8947 20.0521 12.8706 20.0368 12.8517ZM19.7407 9.60319C19.7407 9.65327 19.7582 9.69926 19.7874 9.73537C19.8131 9.76704 19.8477 9.79112 19.8874 9.8037C19.9075 9.81005 19.9288 9.81347 19.951 9.81347C19.9731 9.81347 19.9945 9.81005 20.0145 9.8037C20.0543 9.79112 20.0889 9.76704 20.1145 9.73537C20.1438 9.69926 20.1613 9.65327 20.1613 9.60319V8.71534C20.1613 8.66527 20.1438 8.61928 20.1145 8.58316C20.0889 8.5515 20.0543 8.52742 20.0145 8.51484C19.9945 8.50849 19.9731 8.50506 19.951 8.50506C19.9288 8.50506 19.9075 8.50849 19.8874 8.51484C19.8477 8.52742 19.8131 8.5515 19.7874 8.58316C19.7582 8.61928 19.7407 8.66527 19.7407 8.71534V9.60319ZM20.0368 8.64607C20.0311 8.63904 20.0246 8.63274 20.0174 8.62731C20.0053 8.61815 19.9913 8.61146 19.9761 8.60793C19.9681 8.60605 19.9596 8.60506 19.951 8.60506C19.9417 8.60506 19.9326 8.60621 19.924 8.60838C19.9086 8.61225 19.8944 8.61937 19.8823 8.62904C19.876 8.63406 19.8703 8.63977 19.8652 8.64607C19.8499 8.665 19.8407 8.6891 19.8407 8.71534V9.60319C19.8407 9.62943 19.8499 9.65354 19.8652 9.67247C19.8713 9.68 19.8783 9.68669 19.8861 9.69237C19.8978 9.70094 19.9113 9.70722 19.9258 9.71061C19.9339 9.71249 19.9423 9.71347 19.951 9.71347C19.9607 9.71347 19.9702 9.71222 19.9791 9.70986C19.9941 9.70593 20.0079 9.69892 20.0197 9.6895C20.026 9.68448 20.0317 9.67877 20.0368 9.67247C20.0521 9.65354 20.0613 9.62943 20.0613 9.60319V8.71534C20.0613 8.6891 20.0521 8.665 20.0368 8.64607ZM16.236 6.86952L18.4322 11.2387C18.4945 11.3477 18.5444 11.5658 18.2453 11.5658H13.8995C13.7905 11.5736 13.6051 11.5237 13.736 11.262L15.9323 6.86952C15.979 6.80721 16.105 6.71998 16.236 6.86952ZM13.9028 11.6658C13.8376 11.6698 13.7297 11.6593 13.6566 11.5852C13.5683 11.4957 13.5733 11.3638 13.6465 11.2173L15.8469 6.81676L15.8523 6.80956C15.8851 6.76572 15.9476 6.70934 16.0326 6.69208C16.1275 6.67283 16.2264 6.70675 16.3112 6.80365L16.3196 6.81323L18.5204 11.1915C18.5558 11.2543 18.5975 11.3631 18.5713 11.4675C18.5567 11.5255 18.5216 11.5788 18.4614 11.6154C18.404 11.6504 18.3309 11.6658 18.2453 11.6658H13.9028ZM15.4408 9.82362L16.0901 8.69336L16.1078 8.6807C16.141 8.65697 16.1831 8.63299 16.2286 8.61685C16.273 8.60113 16.3297 8.58968 16.3875 8.60255C16.4507 8.61664 16.5035 8.65748 16.5354 8.72329C16.565 8.78425 16.5747 8.8622 16.5695 8.95454L16.5682 8.97858L16.5561 8.99937C16.4545 9.17341 16.2898 9.46259 16.174 9.66675H16.5345L16.5515 9.67311C16.5977 9.69041 16.6599 9.72865 16.7024 9.79247C16.7484 9.86151 16.7663 9.95358 16.7269 10.0589L16.7232 10.0687C16.6651 10.1848 16.3365 10.7465 16.182 11.009L16.167 11.0345L16.1406 11.0478C16.0778 11.0792 15.9666 11.1154 15.8639 11.0805C15.8075 11.0613 15.7582 11.0218 15.727 10.9596C15.6972 10.9004 15.687 10.827 15.6923 10.7418L15.6938 10.7181L15.7057 10.6977C15.7963 10.5425 15.9068 10.3562 15.9896 10.2172H15.663L15.651 10.2142C15.6019 10.202 15.5366 10.1691 15.4887 10.1071C15.4376 10.0411 15.4127 9.95004 15.4375 9.83851L15.4408 9.82362ZM16.1659 10.1172C16.1505 10.143 16.13 10.1772 16.1061 10.2172C16.0216 10.3587 15.8941 10.5732 15.7921 10.7481C15.7734 11.0471 15.9868 11.0129 16.0958 10.9583C16.2516 10.6935 16.5772 10.1359 16.6332 10.0238C16.6893 9.87422 16.5787 9.79011 16.5164 9.76675H16.0024C16.0183 9.73865 16.0374 9.70477 16.059 9.66675C16.1748 9.46233 16.3594 9.13811 16.4697 8.94899C16.4884 8.61254 16.275 8.68419 16.1659 8.76207L15.5351 9.8602C15.4977 10.0284 15.613 10.1016 15.6753 10.1172H16.1659ZM0.902344 5.18731C0.902344 5.02885 1.0308 4.90039 1.18926 4.90039H10.6752C10.8337 4.90039 10.9622 5.02885 10.9622 5.18731V17.2434C10.9622 17.4018 10.8337 17.5303 10.6752 17.5303H1.18926C1.0308 17.5303 0.902344 17.4018 0.902344 17.2434V5.18731ZM5.93225 7.38357L7.8715 11.2153H3.993L5.93225 7.38357ZM4.15568 11.1153L5.93225 7.60502L7.70882 11.1153H4.15568ZM3.29206 12.7509H5.7687C5.92716 12.7509 6.05561 12.8793 6.05561 13.0378C6.05561 13.1962 5.92716 13.3247 5.7687 13.3247H3.29206C3.1336 13.3247 3.00515 13.1962 3.00515 13.0378C3.00515 12.8793 3.1336 12.7509 3.29206 12.7509ZM3.29206 13.6387H5.7687C5.92716 13.6387 6.05561 13.7672 6.05561 13.9256C6.05561 14.0841 5.92716 14.2125 5.7687 14.2125H3.29206C3.1336 14.2125 3.00515 14.0841 3.00515 13.9256C3.00515 13.7672 3.1336 13.6387 3.29206 13.6387ZM3.29206 14.5266H5.7687C5.92716 14.5266 6.05561 14.655 6.05561 14.8135C6.05561 14.9719 5.92716 15.1004 5.7687 15.1004H3.29206C3.1336 15.1004 3.00515 14.9719 3.00515 14.8135C3.00515 14.655 3.1336 14.5266 3.29206 14.5266ZM7.47431 13.3583C7.56102 13.3583 7.63132 13.288 7.63132 13.2013C7.63132 13.1146 7.56102 13.0443 7.47431 13.0443C7.38759 13.0443 7.3173 13.1146 7.3173 13.2013C7.3173 13.288 7.38759 13.3583 7.47431 13.3583ZM7.56929 13.8789C7.90216 13.8327 8.15842 13.5469 8.15842 13.2013C8.15842 12.8235 7.85213 12.5172 7.47431 12.5172C7.09648 12.5172 6.79019 12.8235 6.79019 13.2013C6.79019 13.5469 7.04645 13.8327 7.37932 13.8789C7.04645 13.9251 6.79019 14.2109 6.79019 14.5565C6.79019 14.9343 7.09648 15.2406 7.47431 15.2406C7.85213 15.2406 8.15842 14.9343 8.15842 14.5565C8.15842 14.2109 7.90216 13.9251 7.56929 13.8789ZM7.47431 14.7135C7.56102 14.7135 7.63132 14.6432 7.63132 14.5565C7.63132 14.4698 7.56102 14.3995 7.47431 14.3995C7.38759 14.3995 7.3173 14.4698 7.3173 14.5565C7.3173 14.6432 7.38759 14.7135 7.47431 14.7135ZM11.0426 5.18731C11.0426 5.02885 11.171 4.90039 11.3295 4.90039H20.8155C20.9739 4.90039 21.1024 5.02885 21.1024 5.18731V17.2434C21.1024 17.4018 20.9739 17.5303 20.8155 17.5303H11.3295C11.171 17.5303 11.0426 17.4018 11.0426 17.2434V5.18731ZM16.0725 7.38357L18.0117 11.2153H14.1332L16.0725 7.38357ZM14.2959 11.1153L16.0725 7.60502L17.849 11.1153H14.2959ZM13.4323 12.7509H15.9089C16.0674 12.7509 16.1958 12.8793 16.1958 13.0378C16.1958 13.1962 16.0674 13.3247 15.9089 13.3247H13.4323C13.2738 13.3247 13.1454 13.1962 13.1454 13.0378C13.1454 12.8793 13.2738 12.7509 13.4323 12.7509ZM13.4323 13.6387H15.9089C16.0674 13.6387 16.1958 13.7672 16.1958 13.9256C16.1958 14.0841 16.0674 14.2125 15.9089 14.2125H13.4323C13.2738 14.2125 13.1454 14.0841 13.1454 13.9256C13.1454 13.7672 13.2738 13.6387 13.4323 13.6387ZM13.4323 14.5266H15.9089C16.0674 14.5266 16.1958 14.655 16.1958 14.8135C16.1958 14.9719 16.0674 15.1004 15.9089 15.1004H13.4323C13.2738 15.1004 13.1454 14.9719 13.1454 14.8135C13.1454 14.655 13.2738 14.5266 13.4323 14.5266ZM17.6145 13.3583C17.7013 13.3583 17.7715 13.288 17.7715 13.2013C17.7715 13.1146 17.7013 13.0443 17.6145 13.0443C17.5278 13.0443 17.4575 13.1146 17.4575 13.2013C17.4575 13.288 17.5278 13.3583 17.6145 13.3583ZM17.7095 13.8789C18.0424 13.8327 18.2987 13.5469 18.2987 13.2013C18.2987 12.8235 17.9924 12.5172 17.6145 12.5172C17.2367 12.5172 16.9304 12.8235 16.9304 13.2013C16.9304 13.5469 17.1867 13.8327 17.5196 13.8789C17.1867 13.9251 16.9304 14.2109 16.9304 14.5565C16.9304 14.9343 17.2367 15.2406 17.6145 15.2406C17.9924 15.2406 18.2987 14.9343 18.2987 14.5565C18.2987 14.2109 18.0424 13.9251 17.7095 13.8789ZM17.6145 14.7135C17.7013 14.7135 17.7715 14.6432 17.7715 14.5565C17.7715 14.4698 17.7013 14.3995 17.6145 14.3995C17.5278 14.3995 17.4575 14.4698 17.4575 14.5565C17.4575 14.6432 17.5278 14.7135 17.6145 14.7135ZM1.32945 5.32749H10.5351V17.1032H1.32945V5.32749ZM1.00234 5.18731C1.00234 5.08408 1.08603 5.00039 1.18926 5.00039H10.6752C10.7785 5.00039 10.8622 5.08408 10.8622 5.18731V17.2434C10.8622 17.3466 10.7785 17.4303 10.6752 17.4303H1.18926C1.08603 17.4303 1.00234 17.3466 1.00234 17.2434V5.18731ZM3.29206 12.8509C3.18883 12.8509 3.10515 12.9345 3.10515 13.0378C3.10515 13.141 3.18883 13.2247 3.29206 13.2247H5.7687C5.87193 13.2247 5.95561 13.141 5.95561 13.0378C5.95561 12.9345 5.87193 12.8509 5.7687 12.8509H3.29206ZM3.10515 13.9256C3.10515 13.8224 3.18883 13.7387 3.29206 13.7387H5.7687C5.87193 13.7387 5.95561 13.8224 5.95561 13.9256C5.95561 14.0289 5.87193 14.1125 5.7687 14.1125H3.29206C3.18883 14.1125 3.10515 14.0289 3.10515 13.9256ZM3.29206 14.6266C3.18883 14.6266 3.10515 14.7102 3.10515 14.8135C3.10515 14.9167 3.18883 15.0004 3.29206 15.0004H5.7687C5.87193 15.0004 5.95561 14.9167 5.95561 14.8135C5.95561 14.7102 5.87193 14.6266 5.7687 14.6266H3.29206ZM7.47431 13.4583C7.61625 13.4583 7.73132 13.3433 7.73132 13.2013C7.73132 13.0594 7.61625 12.9443 7.47431 12.9443C7.33236 12.9443 7.2173 13.0594 7.2173 13.2013C7.2173 13.3433 7.33236 13.4583 7.47431 13.4583ZM7.47431 13.7854C7.7969 13.7854 8.05842 13.5239 8.05842 13.2013C8.05842 12.8787 7.7969 12.6172 7.47431 12.6172C7.15171 12.6172 6.89019 12.8787 6.89019 13.2013C6.89019 13.5239 7.15171 13.7854 7.47431 13.7854ZM7.73132 14.5565C7.73132 14.6984 7.61625 14.8135 7.47431 14.8135C7.33236 14.8135 7.2173 14.6984 7.2173 14.5565C7.2173 14.4145 7.33236 14.2995 7.47431 14.2995C7.61625 14.2995 7.73132 14.4145 7.73132 14.5565ZM8.05842 14.5565C8.05842 14.8791 7.7969 15.1406 7.47431 15.1406C7.15171 15.1406 6.89019 14.8791 6.89019 14.5565C6.89019 14.2339 7.15171 13.9724 7.47431 13.9724C7.7969 13.9724 8.05842 14.2339 8.05842 14.5565ZM20.6753 5.32749H11.4697V17.1032H20.6753V5.32749ZM11.3295 5.00039C11.2263 5.00039 11.1426 5.08408 11.1426 5.18731V17.2434C11.1426 17.3466 11.2263 17.4303 11.3295 17.4303H20.8155C20.9187 17.4303 21.0024 17.3466 21.0024 17.2434V5.18731C21.0024 5.08408 20.9187 5.00039 20.8155 5.00039H11.3295ZM13.4323 12.8509C13.3291 12.8509 13.2454 12.9345 13.2454 13.0378C13.2454 13.141 13.3291 13.2247 13.4323 13.2247H15.9089C16.0122 13.2247 16.0958 13.141 16.0958 13.0378C16.0958 12.9345 16.0122 12.8509 15.9089 12.8509H13.4323ZM13.2454 13.9256C13.2454 13.8224 13.3291 13.7387 13.4323 13.7387H15.9089C16.0122 13.7387 16.0958 13.8224 16.0958 13.9256C16.0958 14.0289 16.0122 14.1125 15.9089 14.1125H13.4323C13.3291 14.1125 13.2454 14.0289 13.2454 13.9256ZM13.4323 14.6266C13.3291 14.6266 13.2454 14.7102 13.2454 14.8135C13.2454 14.9167 13.3291 15.0004 13.4323 15.0004H15.9089C16.0122 15.0004 16.0958 14.9167 16.0958 14.8135C16.0958 14.7102 16.0122 14.6266 15.9089 14.6266H13.4323ZM17.6145 13.4583C17.7565 13.4583 17.8715 13.3433 17.8715 13.2013C17.8715 13.0594 17.7565 12.9443 17.6145 12.9443C17.4726 12.9443 17.3575 13.0594 17.3575 13.2013C17.3575 13.3433 17.4726 13.4583 17.6145 13.4583ZM17.6145 13.7854C17.9371 13.7854 18.1987 13.5239 18.1987 13.2013C18.1987 12.8787 17.9371 12.6172 17.6145 12.6172C17.2919 12.6172 17.0304 12.8787 17.0304 13.2013C17.0304 13.5239 17.2919 13.7854 17.6145 13.7854ZM17.8715 14.5565C17.8715 14.6984 17.7565 14.8135 17.6145 14.8135C17.4726 14.8135 17.3575 14.6984 17.3575 14.5565C17.3575 14.4145 17.4726 14.2995 17.6145 14.2995C17.7565 14.2995 17.8715 14.4145 17.8715 14.5565ZM18.1987 14.5565C18.1987 14.8791 17.9371 15.1406 17.6145 15.1406C17.2919 15.1406 17.0304 14.8791 17.0304 14.5565C17.0304 14.2339 17.2919 13.9724 17.6145 13.9724C17.9371 13.9724 18.1987 14.2339 18.1987 14.5565Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const FusesIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M10.3903 1.30078H10.6888V6.0769H12.7784V16.5247H10.6888V21.3008H10.3903V16.5247H8.30078V6.0769H10.3903V1.30078ZM8.59929 6.37541H12.4799V8.16645H8.59929V6.37541ZM8.59929 8.46496V14.1366H12.4799V8.46496H8.59929ZM12.4799 14.4351H8.59929V16.2262H12.4799V14.4351Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.9881 1V5.77612H13.0776V16.8239H10.9881V21.6H10.0896V16.8239H8V5.77612H10.0896V1H10.9881ZM10.3896 21.3H10.6881V16.5239H12.7776V6.07612H10.6881V1.3H10.3896V6.07612H8.3V16.5239H10.3896V21.3ZM12.4791 16.2254V14.4343H8.59851V16.2254H12.4791ZM12.1791 15.9254H8.89851V14.7343H12.1791V15.9254ZM12.4791 14.1358V8.46418H8.59851V14.1358H12.4791ZM12.1791 13.8358H8.89851V8.76418H12.1791V13.8358ZM12.4791 8.16567V6.37463H8.59851V8.16567H12.4791ZM12.1791 7.86567H8.89851V6.67463H12.1791V7.86567Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const GeneratorsIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11 19.4091C15.6442 19.4091 19.4091 15.6442 19.4091 11C19.4091 6.35579 15.6442 2.59091 11 2.59091C6.35579 2.59091 2.59091 6.35579 2.59091 11C2.59091 15.6442 6.35579 19.4091 11 19.4091ZM11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M10.985 14.1777C10.5814 14.1777 10.2132 14.1068 9.88046 13.965C9.54773 13.8232 9.26136 13.62 9.02136 13.3555C8.78136 13.0882 8.59591 12.7664 8.465 12.39C8.33682 12.0109 8.27273 11.5841 8.27273 11.1095C8.27273 10.4823 8.38455 9.93955 8.60818 9.48136C8.83182 9.02318 9.14682 8.67 9.55318 8.42182C9.95955 8.17091 10.4368 8.04545 10.985 8.04545C11.645 8.04545 12.1768 8.19954 12.5805 8.50773C12.9841 8.81318 13.2623 9.23182 13.415 9.76364L12.6786 9.915C12.5559 9.55773 12.3541 9.27273 12.0732 9.06C11.7923 8.84727 11.4418 8.74091 11.0218 8.74091C10.5827 8.73818 10.2173 8.83636 9.92545 9.03545C9.63636 9.23182 9.41818 9.50864 9.27091 9.86591C9.12364 10.2232 9.04864 10.6377 9.04591 11.1095C9.04318 11.5786 9.11545 11.9905 9.26273 12.345C9.41 12.6995 9.62955 12.9777 9.92136 13.1795C10.2159 13.3786 10.5827 13.4795 11.0218 13.4823C11.4009 13.485 11.72 13.4127 11.9791 13.2655C12.2382 13.1182 12.4386 12.9055 12.5805 12.6273C12.7223 12.3491 12.8082 12.015 12.8382 11.625H11.5864V11.0236H13.6073C13.6155 11.0782 13.6195 11.1436 13.6195 11.22C13.6223 11.2936 13.6236 11.3441 13.6236 11.3714C13.6236 11.9086 13.5227 12.39 13.3209 12.8155C13.1218 13.2382 12.8259 13.5709 12.4332 13.8136C12.0432 14.0564 11.5605 14.1777 10.985 14.1777Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const GroundFaultSystemsIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_15961_613)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M10.9992 20.2214C16.0925 20.2214 20.2214 16.0925 20.2214 10.9992C20.2214 5.90593 16.0925 1.777 10.9992 1.777C5.90593 1.777 1.777 5.90593 1.777 10.9992C1.777 16.0925 5.90593 20.2214 10.9992 20.2214ZM10.9992 20.9992C16.5221 20.9992 20.9992 16.5221 20.9992 10.9992C20.9992 5.47637 16.5221 0.999219 10.9992 0.999219C5.47637 0.999219 0.999219 5.47637 0.999219 10.9992C0.999219 16.5221 5.47637 20.9992 10.9992 20.9992ZM10.6602 12.1857V3.54159H11.3382V12.1857H17.6094V12.8636H4.55854V12.1857H10.6602ZM15.5755 15.2365L6.59244 15.2365V14.5585L15.5755 14.5585V15.2365ZM8.62634 17.4399H13.7111V16.7619H8.62634V17.4399Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M10.3602 3.24159H11.6382V11.8857H17.9094V13.1636H4.25854V11.8857H10.3602V3.24159ZM10.6602 3.54159H11.3382V12.1857H17.6094V12.8636H4.55854V12.1857H10.6602V3.54159ZM6.29244 15.5365V14.2585L15.8755 14.2585V15.5365L6.29244 15.5365ZM14.0111 17.7399H8.32634V16.4619H14.0111V17.7399ZM10.9992 19.9214C15.9268 19.9214 19.9214 15.9268 19.9214 10.9992C19.9214 6.07161 15.9268 2.077 10.9992 2.077C6.07161 2.077 2.077 6.07161 2.077 10.9992C2.077 15.9268 6.07161 19.9214 10.9992 19.9214ZM21.2992 10.9992C21.2992 16.6878 16.6878 21.2992 10.9992 21.2992C5.31069 21.2992 0.699219 16.6878 0.699219 10.9992C0.699219 5.31069 5.31069 0.699219 10.9992 0.699219C16.6878 0.699219 21.2992 5.31069 21.2992 10.9992ZM15.5755 15.2365L6.59244 15.2365V14.5585L15.5755 14.5585V15.2365ZM20.2214 10.9992C20.2214 16.0925 16.0925 20.2214 10.9992 20.2214C5.90593 20.2214 1.777 16.0925 1.777 10.9992C1.777 5.90593 5.90593 1.777 10.9992 1.777C16.0925 1.777 20.2214 5.90593 20.2214 10.9992ZM20.9992 10.9992C20.9992 16.5221 16.5221 20.9992 10.9992 20.9992C5.47637 20.9992 0.999219 16.5221 0.999219 10.9992C0.999219 5.47637 5.47637 0.999219 10.9992 0.999219C16.5221 0.999219 20.9992 5.47637 20.9992 10.9992ZM8.62634 17.4399V16.7619H13.7111V17.4399H8.62634Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
      </g>
      <defs>
        <clipPath id='clip0_15961_613'>
          <rect width='22' height='22' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export const GroundingIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M11.5 1H10V16H5V17.5H10H11.5H16.5V16H11.5V1ZM6 18H10H11.5H15.5V19.5H11.5H10H6V18ZM10 20H8V21.5H13.5V20H11.5H10Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
    </svg>
  )
}

export const InstrumentTransformersIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M8.95591 20.9996V0.999609H9.2115V20.9996H8.95591Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9.08371 13.3958C10.4247 13.3958 11.5118 12.3087 11.5118 10.9677C11.5118 9.62665 10.4247 8.53955 9.08371 8.53955C7.7427 8.53955 6.65559 9.62665 6.65559 10.9677C6.65559 12.3087 7.7427 13.3958 9.08371 13.3958ZM9.08371 13.6514C10.5659 13.6514 11.7674 12.4498 11.7674 10.9677C11.7674 9.48549 10.5659 8.28395 9.08371 8.28395C7.60154 8.28395 6.4 9.48549 6.4 10.9677C6.4 12.4498 7.60154 13.6514 9.08371 13.6514Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path fillRule='evenodd' clipRule='evenodd' d='M15.154 11.1594H11.7035V10.9038H15.154V11.1594Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8.55591 0.599609H9.6115V7.92895C10.9129 8.15339 11.9351 9.19345 12.1327 10.5038H15.554V11.5594H12.1107C11.8678 12.8091 10.8703 13.7893 9.6115 14.0064V21.3996H8.55591V14.0064C7.10428 13.756 6 12.4908 6 10.9677C6 9.44452 7.10428 8.17931 8.55591 7.92895V0.599609ZM8.95591 20.9996H9.2115V13.6484C9.25999 13.6461 9.30813 13.6425 9.35591 13.6377C9.44239 13.629 9.52765 13.6162 9.6115 13.5995C10.6489 13.3926 11.4706 12.5877 11.702 11.5594C11.7025 11.5571 11.703 11.5548 11.7035 11.5524C11.7216 11.4709 11.7361 11.3879 11.7466 11.3038C11.7525 11.256 11.7572 11.2079 11.7607 11.1594H15.154V10.9038H11.7667C11.7655 10.8553 11.7631 10.8072 11.7594 10.7594C11.7528 10.6729 11.7421 10.5877 11.7275 10.5038C11.5377 9.41476 10.6915 8.55122 9.6115 8.33584C9.52765 8.31912 9.44239 8.3063 9.35591 8.29759C9.30813 8.29278 9.25999 8.28922 9.2115 8.28694V0.999609H8.95591V8.28694C8.90743 8.28922 8.85928 8.29278 8.8115 8.29759C8.72503 8.3063 8.63976 8.31912 8.55591 8.33584C7.32648 8.58103 6.4 9.66615 6.4 10.9677C6.4 12.2692 7.32648 13.3543 8.55591 13.5995C8.63976 13.6162 8.72503 13.629 8.8115 13.6377C8.85928 13.6425 8.90743 13.6461 8.95591 13.6484V20.9996ZM8.8115 13.3807C8.85923 13.386 8.90738 13.39 8.95591 13.3925V8.54285C8.90738 8.54537 8.85923 8.54931 8.8115 8.55463C8.72485 8.5643 8.63957 8.57853 8.55591 8.59707C7.46868 8.83806 6.65559 9.80791 6.65559 10.9677C6.65559 12.1274 7.46868 13.0973 8.55591 13.3383C8.63957 13.3568 8.72485 13.371 8.8115 13.3807ZM8.55591 9.0089C7.69173 9.24119 7.05559 10.0301 7.05559 10.9677C7.05559 11.9052 7.69173 12.6941 8.55591 12.9264V9.0089ZM9.2115 13.3925C9.26003 13.39 9.30818 13.386 9.35591 13.3807C9.44257 13.371 9.52785 13.3568 9.6115 13.3383C10.5074 13.1397 11.2172 12.4462 11.4392 11.5594C11.4717 11.4298 11.4937 11.2962 11.5044 11.1594C11.5093 11.0961 11.5118 11.0322 11.5118 10.9677C11.5118 10.9463 11.5115 10.925 11.511 10.9038C11.5075 10.7673 11.4927 10.6337 11.4676 10.5038C11.2842 9.55621 10.55 8.80509 9.6115 8.59707C9.52785 8.57853 9.44257 8.5643 9.35591 8.55463C9.30818 8.54931 9.26003 8.54537 9.2115 8.54285V13.3925ZM9.6115 12.9264V9.0089C10.4757 9.24119 11.1118 10.0301 11.1118 10.9677C11.1118 11.9052 10.4757 12.6941 9.6115 12.9264Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const MeterReadingIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M18.2498 9.74987C18.2498 13.8919 14.8919 17.2498 10.7499 17.2498C6.6078 17.2498 3.24998 13.8919 3.24998 9.74987C3.24998 5.6078 6.6078 2.24998 10.7499 2.24998C14.8919 2.24998 18.2498 5.6078 18.2498 9.74987ZM16.006 16.7457C14.5426 17.847 12.7224 18.4997 10.7499 18.4997C8.81896 18.4997 7.03412 17.8743 5.58693 16.8149L6.08987 19.9583H15.235L16.006 16.7457ZM17.3881 15.4505C18.7043 13.9192 19.4997 11.9274 19.4997 9.74987C19.4997 4.91745 15.5823 1 10.7499 1C5.91745 1 2 4.91745 2 9.74987C2 12.0599 2.8952 14.1609 4.35761 15.7248L5.20163 20.9999H16.0562L17.3881 15.4505ZM6.16661 6.83325C6.16661 6.71819 6.25988 6.62492 6.37494 6.62492H15.1248C15.2399 6.62492 15.3331 6.71819 15.3331 6.83325V8.08323C15.3331 8.19829 15.2399 8.29156 15.1248 8.29156H6.37494C6.25988 8.29156 6.16661 8.19829 6.16661 8.08323V6.83325ZM5.33328 6.83325C5.33328 6.25796 5.79965 5.7916 6.37494 5.7916H15.1248C15.7001 5.7916 16.1665 6.25796 16.1665 6.83325V8.08323C16.1665 8.65852 15.7001 9.12488 15.1248 9.12488H6.37494C5.79965 9.12488 5.33328 8.65852 5.33328 8.08323V6.83325ZM7.83325 7.45824C7.83325 7.22812 7.6467 7.04158 7.41659 7.04158C7.18647 7.04158 6.99993 7.22812 6.99993 7.45824C6.99993 7.68835 7.18647 7.8749 7.41659 7.8749C7.6467 7.8749 7.83325 7.68835 7.83325 7.45824ZM9.08323 7.04158C9.31334 7.04158 9.49989 7.22812 9.49989 7.45824C9.49989 7.68835 9.31334 7.8749 9.08323 7.8749C8.85311 7.8749 8.66657 7.68835 8.66657 7.45824C8.66657 7.22812 8.85311 7.04158 9.08323 7.04158ZM11.1665 7.45824C11.1665 7.22812 10.98 7.04158 10.7499 7.04158C10.5198 7.04158 10.3332 7.22812 10.3332 7.45824C10.3332 7.68835 10.5198 7.8749 10.7499 7.8749C10.98 7.8749 11.1665 7.68835 11.1665 7.45824ZM12.4165 7.04158C12.6466 7.04158 12.8332 7.22812 12.8332 7.45824C12.8332 7.68835 12.6466 7.8749 12.4165 7.8749C12.1864 7.8749 11.9999 7.68835 11.9999 7.45824C11.9999 7.22812 12.1864 7.04158 12.4165 7.04158ZM14.4998 7.45824C14.4998 7.22812 14.3133 7.04158 14.0832 7.04158C13.853 7.04158 13.6665 7.22812 13.6665 7.45824C13.6665 7.68835 13.853 7.8749 14.0832 7.8749C14.3133 7.8749 14.4998 7.68835 14.4998 7.45824ZM10.4847 15.1586C10.5295 15.1734 10.5758 15.1809 10.6221 15.1809C10.666 15.1809 10.71 15.1743 10.7531 15.1609C10.8412 15.1332 10.9167 15.0796 10.9679 15.0114L12.7203 12.8205C12.7685 12.7555 12.7978 12.6788 12.8048 12.5999C12.8125 12.5189 12.7973 12.4374 12.7607 12.3641C12.7242 12.2913 12.6685 12.2303 12.5992 12.1875C12.53 12.145 12.4509 12.1226 12.3701 12.1226L11.281 12.1219L11.4933 10.8479C11.4952 10.836 11.4963 10.824 11.4963 10.812C11.4963 10.7196 11.4677 10.6312 11.4133 10.556C11.3595 10.4816 11.2851 10.4268 11.197 10.3973C11.1095 10.3682 11.0171 10.3674 10.9288 10.3949C10.8409 10.4224 10.765 10.476 10.7138 10.5444L8.96132 12.7353C8.9131 12.8004 8.88388 12.8772 8.87684 12.956C8.86916 13.037 8.88431 13.1185 8.921 13.1917C8.95748 13.2646 9.01316 13.3256 9.08249 13.3684C9.15161 13.4108 9.23097 13.4333 9.31182 13.4333H10.4011L10.1886 14.708C10.1867 14.72 10.1856 14.7319 10.1856 14.744C10.1856 14.836 10.214 14.9243 10.2684 14.9999C10.3221 15.0742 10.3968 15.129 10.4847 15.1586ZM10.7136 13.1252C10.6325 13.0434 10.5197 12.9964 10.404 12.9964L9.30755 13.0018L11.0555 10.8168L10.8439 12.0867C10.842 12.0986 10.8409 12.1106 10.8409 12.1227C10.8409 12.2382 10.8879 12.351 10.9683 12.4308C11.0494 12.5126 11.1622 12.5595 11.2778 12.5595L12.3741 12.5541L10.6263 14.7392L10.838 13.4693C10.8399 13.4573 10.8409 13.4454 10.8409 13.4333C10.8409 13.3176 10.794 13.2047 10.7136 13.1252Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const MiscellaneousIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19.8136 11C19.8136 15.8676 15.8676 19.8136 11 19.8136C6.13241 19.8136 2.18644 15.8676 2.18644 11C2.18644 6.13241 6.13241 2.18644 11 2.18644C15.8676 2.18644 19.8136 6.13241 19.8136 11ZM21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1C16.5228 1 21 5.47715 21 11ZM7.77959 11C7.77959 11.7489 7.17252 12.356 6.42366 12.356C5.67479 12.356 5.06772 11.7489 5.06772 11C5.06772 10.2512 5.67479 9.64411 6.42366 9.64411C7.17252 9.64411 7.77959 10.2512 7.77959 11ZM8.45755 11C8.45755 12.1233 7.54695 13.0339 6.42366 13.0339C5.30036 13.0339 4.38976 12.1233 4.38976 11C4.38976 9.87675 5.30036 8.96615 6.42366 8.96615C7.54695 8.96615 8.45755 9.87675 8.45755 11ZM11.1693 12.356C11.9182 12.356 12.5252 11.7489 12.5252 11C12.5252 10.2512 11.9182 9.64411 11.1693 9.64411C10.4205 9.64411 9.81338 10.2512 9.81338 11C9.81338 11.7489 10.4205 12.356 11.1693 12.356ZM11.1693 13.0339C12.2926 13.0339 13.2032 12.1233 13.2032 11C13.2032 9.87675 12.2926 8.96615 11.1693 8.96615C10.046 8.96615 9.13542 9.87675 9.13542 11C9.13542 12.1233 10.046 13.0339 11.1693 13.0339ZM17.2713 11C17.2713 11.7489 16.6643 12.356 15.9154 12.356C15.1665 12.356 14.5595 11.7489 14.5595 11C14.5595 10.2512 15.1665 9.64411 15.9154 9.64411C16.6643 9.64411 17.2713 10.2512 17.2713 11ZM17.9493 11C17.9493 12.1233 17.0387 13.0339 15.9154 13.0339C14.7921 13.0339 13.8815 12.1233 13.8815 11C13.8815 9.87675 14.7921 8.96615 15.9154 8.96615C17.0387 8.96615 17.9493 9.87675 17.9493 11Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const MotorsIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_15961_631)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M20.2214 10.9992C20.2214 16.0925 16.0925 20.2214 10.9992 20.2214C5.90593 20.2214 1.777 16.0925 1.777 10.9992C1.777 5.90593 5.90593 1.777 10.9992 1.777C16.0925 1.777 20.2214 5.90593 20.2214 10.9992ZM20.9992 10.9992C20.9992 16.5221 16.5221 20.9992 10.9992 20.9992C5.47637 20.9992 0.999219 16.5221 0.999219 10.9992C0.999219 5.47637 5.47637 0.999219 10.9992 0.999219C16.5221 0.999219 20.9992 5.47637 20.9992 10.9992ZM8.16275 7.83516V13.7261H8.85411V9.4347L10.8546 13.7261H11.2432L13.2437 9.4347V13.722H13.935V7.83516H13.2641L11.0509 12.5274L8.82548 7.83516H8.16275Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M7.86275 14.0261V7.53516H9.01522L11.0502 11.8258L13.0739 7.53516H14.235V14.022H12.9437V10.7883L11.4344 14.0261H10.6634L9.15411 10.7883V14.0261H7.86275ZM8.85411 9.4347L10.8546 13.7261H11.2432L13.2437 9.4347V13.722H13.935V7.83516H13.2641L11.0509 12.5274L8.82548 7.83516H8.16275V13.7261H8.85411V9.4347ZM10.9992 19.9214C15.9268 19.9214 19.9214 15.9268 19.9214 10.9992C19.9214 6.07161 15.9268 2.077 10.9992 2.077C6.07161 2.077 2.077 6.07161 2.077 10.9992C2.077 15.9268 6.07161 19.9214 10.9992 19.9214ZM21.2992 10.9992C21.2992 16.6878 16.6878 21.2992 10.9992 21.2992C5.31069 21.2992 0.699219 16.6878 0.699219 10.9992C0.699219 5.31069 5.31069 0.699219 10.9992 0.699219C16.6878 0.699219 21.2992 5.31069 21.2992 10.9992ZM10.9992 20.2214C16.0925 20.2214 20.2214 16.0925 20.2214 10.9992C20.2214 5.90593 16.0925 1.777 10.9992 1.777C5.90593 1.777 1.777 5.90593 1.777 10.9992C1.777 16.0925 5.90593 20.2214 10.9992 20.2214ZM10.9992 20.9992C16.5221 20.9992 20.9992 16.5221 20.9992 10.9992C20.9992 5.47637 16.5221 0.999219 10.9992 0.999219C5.47637 0.999219 0.999219 5.47637 0.999219 10.9992C0.999219 16.5221 5.47637 20.9992 10.9992 20.9992Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
      </g>
      <defs>
        <clipPath id='clip0_15961_631'>
          <rect width='22' height='22' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

export const RelaysIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11 19.6364C15.7697 19.6364 19.6364 15.7697 19.6364 11C19.6364 6.23027 15.7697 2.36364 11 2.36364C6.23027 2.36364 2.36364 6.23027 2.36364 11C2.36364 15.7697 6.23027 19.6364 11 19.6364ZM11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M8.95455 13.8364V8.27273H11.153C11.207 8.27273 11.2714 8.2753 11.3461 8.28046C11.4208 8.28303 11.493 8.29076 11.5625 8.30364C11.8639 8.35 12.1163 8.45303 12.3198 8.61273C12.5258 8.77242 12.6804 8.97462 12.7834 9.21932C12.8864 9.46144 12.938 9.73061 12.938 10.0268C12.938 10.457 12.8259 10.8305 12.6018 11.1473C12.3777 11.4615 12.0493 11.6586 11.6166 11.7384L11.3539 11.7809H9.64227V13.8364H8.95455ZM12.2657 13.8364L11.1684 11.5723L11.8484 11.3636L13.0539 13.8364H12.2657ZM9.64227 11.128H11.1298C11.1787 11.128 11.2341 11.1254 11.2959 11.1202C11.3603 11.1151 11.4208 11.1061 11.4775 11.0932C11.6552 11.052 11.7995 10.9773 11.9102 10.8691C12.0236 10.7583 12.106 10.6295 12.1575 10.4827C12.209 10.3333 12.2348 10.1814 12.2348 10.0268C12.2348 9.87227 12.209 9.72159 12.1575 9.57477C12.106 9.42538 12.0236 9.2953 11.9102 9.18455C11.7995 9.07379 11.6552 8.99909 11.4775 8.96045C11.4208 8.945 11.3603 8.93599 11.2959 8.93341C11.2341 8.92826 11.1787 8.92568 11.1298 8.92568H9.64227V11.128Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const SwitchesIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_15961_597)'>
        <path fillRule='evenodd' clipRule='evenodd' d='M8.40298 6.72477L13.2472 14.768L13.2472 21.0004L12.8836 21.0004L12.8836 14.8691L8.09148 6.91238L8.40298 6.72477Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path fillRule='evenodd' clipRule='evenodd' d='M7.99844 8.93776L10.1237 7.6626L13.8658 13.5156L11.5478 14.8853L7.99844 8.93776ZM11.6745 14.3881L13.3565 13.3942L10.0077 8.15626L8.4966 9.06292L11.6745 14.3881Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path fillRule='evenodd' clipRule='evenodd' d='M14.3383 7.18221L11.5201 7.18221L11.5201 6.81857L14.3383 6.81857L14.3383 7.18221Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path fillRule='evenodd' clipRule='evenodd' d='M12.7928 6.81857L12.7928 1.00039L13.1565 1.00039L13.1565 6.81857L12.7928 6.81857Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M13.3383 8.00039C13.3383 7.74935 13.1348 7.54584 12.8837 7.54584C12.6327 7.54584 12.4292 7.74935 12.4292 8.00039C12.4292 8.25143 12.6327 8.45494 12.8837 8.45494C13.1348 8.45494 13.3383 8.25143 13.3383 8.00039ZM13.7019 8.00039C13.7019 7.54852 13.3356 7.18221 12.8837 7.18221C12.4319 7.18221 12.0656 7.54852 12.0656 8.00039C12.0656 8.45226 12.4319 8.81857 12.8837 8.81857C13.3356 8.81857 13.7019 8.45226 13.7019 8.00039Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M8.45409 6.51888L9.32587 7.96637L10.1715 7.45897L14.0759 13.5657L13.0598 14.1661L13.3972 14.7264L13.3972 21.1504L12.7336 21.1504L12.7336 14.9108L12.4884 14.5037L11.4955 15.0905L7.79295 8.88612L8.7568 8.30781L7.8856 6.86127L8.45409 6.51888ZM8.96282 8.35913L7.99844 8.93776L11.5478 14.8853L12.5402 14.2989L12.8836 14.8691L12.8836 21.0004L13.2472 21.0004L13.2472 14.768L12.8533 14.1139L13.8658 13.5156L10.1237 7.6626L9.27463 8.17204L8.40298 6.72477L8.09148 6.91238L8.96282 8.35913ZM12.3526 13.9874L9.15043 8.67063L8.4966 9.06292L11.6745 14.3881L12.3526 13.9874ZM11.7268 14.183L12.146 13.9352L9.09919 8.8763L8.7021 9.11456L11.7268 14.183ZM13.3565 13.3942L10.0077 8.15626L9.46224 8.48354L12.6656 13.8024L13.3565 13.3942ZM12.7174 13.5976L13.1465 13.3441L9.95987 8.3599L9.66826 8.53486L12.7174 13.5976ZM11.3701 7.33221L11.3701 6.66857L12.6428 6.66857L12.6428 0.850389L13.3065 0.850389L13.3065 6.66857L14.4883 6.66857L14.4883 7.33221L13.5844 7.33221C13.7501 7.50597 13.8519 7.74129 13.8519 8.00039C13.8519 8.5351 13.4184 8.96857 12.8837 8.96857C12.349 8.96857 11.9156 8.5351 11.9156 8.00039C11.9156 7.74129 12.0173 7.50597 12.1831 7.33221L11.3701 7.33221ZM12.8837 7.18221C12.7078 7.18221 12.5449 7.23773 12.4114 7.33221C12.2022 7.4804 12.0656 7.72444 12.0656 8.00039C12.0656 8.45226 12.4319 8.81857 12.8837 8.81857C13.3356 8.81857 13.7019 8.45226 13.7019 8.00039C13.7019 7.72444 13.5653 7.4804 13.356 7.33221C13.2226 7.23773 13.0597 7.18221 12.8837 7.18221L14.3383 7.18221L14.3383 6.81857L13.1565 6.81857L13.1565 1.00039L12.7928 1.00039L12.7928 6.81857L11.5201 6.81857L11.5201 7.18221L12.8837 7.18221ZM13.1883 8.00039C13.1883 7.83219 13.0519 7.69585 12.8837 7.69585C12.7155 7.69585 12.5792 7.83219 12.5792 8.00039C12.5792 8.16859 12.7155 8.30494 12.8837 8.30494C13.0519 8.30494 13.1883 8.16859 13.1883 8.00039ZM12.8837 7.54584C13.1348 7.54584 13.3383 7.74935 13.3383 8.00039C13.3383 8.25143 13.1348 8.45494 12.8837 8.45494C12.6327 8.45494 12.4292 8.25143 12.4292 8.00039C12.4292 7.74935 12.6327 7.54584 12.8837 7.54584Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
      </g>
      <defs>
        <clipPath id='clip0_15961_597'>
          <rect width='22' height='22' fill='white' transform='translate(22 22) rotate(-180)' />
        </clipPath>
      </defs>
    </svg>
  )
}
export const SwitchesAllIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <g clipPath='url(#clip0_15961_603)'>
        <path fillRule='evenodd' clipRule='evenodd' d='M12.518 8.14993C12.518 8.97577 11.8485 9.64525 11.0226 9.64525C10.1968 9.64525 9.52731 8.97577 9.52731 8.14992C9.52731 7.41991 10.0504 6.81207 10.7423 6.68084L10.7423 1.00039L11.303 1.00039L11.303 6.68084C11.9948 6.81207 12.518 7.41991 12.518 8.14993Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path fillRule='evenodd' clipRule='evenodd' d='M10.3683 17.0022L10.3683 21.0004L10.929 21.0004L10.929 17.0022C11.6208 16.871 12.144 16.2631 12.144 15.5331C12.144 14.7073 11.4745 14.0378 10.6486 14.0378C9.82278 14.0378 9.1533 14.7073 9.1533 15.5331C9.1533 16.2631 9.67642 16.8709 10.3683 17.0022Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path fillRule='evenodd' clipRule='evenodd' d='M8.53147 8.29496L10.9146 15.4445L10.3827 15.6218L7.9995 8.47228L8.53147 8.29496Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M7.80976 8.37741L8.62634 8.10522L10.5547 13.8904C10.5858 13.8887 10.6171 13.8878 10.6486 13.8878C11.5573 13.8878 12.294 14.6244 12.294 15.5331C12.294 16.293 11.779 16.9323 11.079 17.1215L11.079 21.1504L10.2183 21.1504L10.2183 17.1215C9.51829 16.9323 9.0033 16.293 9.0033 15.5331C9.0033 14.9611 9.29517 14.4573 9.73811 14.1625L7.80976 8.37741ZM9.83725 14.4599C9.51286 14.7055 9.3033 15.0948 9.3033 15.5331C9.3033 16.1897 9.77386 16.7368 10.3962 16.8548L10.5183 16.878L10.5183 20.8504L10.779 20.8504L10.779 16.878L10.901 16.8548C11.5234 16.7368 11.994 16.1897 11.994 15.5331C11.994 14.7918 11.3945 14.1906 10.6539 14.1878L11.1044 15.5394L10.2878 15.8115L9.83725 14.4599ZM10.3488 14.2213C10.2629 14.2409 10.1802 14.2686 10.1014 14.3037L10.4775 15.4321L10.7249 15.3496L10.3488 14.2213ZM10.2535 13.9355C10.1683 13.9565 10.0856 13.9842 10.0062 14.0179L8.18923 8.56715L8.4366 8.48469L10.2535 13.9355ZM11.0226 9.79525C10.114 9.79525 9.37732 9.05861 9.37732 8.14992C9.37732 7.39004 9.89231 6.75073 10.5923 6.56149L10.5923 0.850391L11.453 0.850391L11.453 6.56149C12.153 6.75073 12.668 7.39004 12.668 8.14993C12.668 9.05861 11.9313 9.79525 11.0226 9.79525ZM9.67732 8.14992C9.67732 8.89293 10.2796 9.49525 11.0226 9.49525C11.7656 9.49525 12.368 8.89293 12.368 8.14993C12.368 7.4933 11.8974 6.94627 11.2751 6.82821L11.153 6.80506L11.153 1.15039L10.8923 1.15039L10.8923 6.80506L10.7702 6.82821C10.1479 6.94627 9.67732 7.4933 9.67732 8.14992Z'
          fill={enums.ASSET_TYPE_ICON_COLOR}
        />
      </g>
      <defs>
        <clipPath id='clip0_15961_603'>
          <rect width='22' height='22' fill='white' transform='translate(22 22) rotate(-180)' />
        </clipPath>
      </defs>
    </svg>
  )
}

export const TransferSwitchesIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path fillRule='evenodd' clipRule='evenodd' d='M20.8758 5.28089H1.7225V17.3926H20.8758V5.28089ZM1.44083 4.99922V17.6742H21.1575V4.99922H1.44083Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M5.66584 7.18214H1.3V6.90047H5.66584V7.18214Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M16.1557 6.90047L21.2961 6.83005L21.3 7.11169L16.1596 7.18211L16.1557 6.90047Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M10.2638 14.0862L6.46132 7.88949L6.7014 7.74217L10.5039 13.9388L10.2638 14.0862Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M10.3133 17.8151V15.7026H10.595V17.8151H10.3133Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6.51084 7.67505C6.82196 7.67505 7.07417 7.42284 7.07417 7.11172C7.07417 6.8006 6.82196 6.54839 6.51084 6.54839C6.19972 6.54839 5.9475 6.8006 5.9475 7.11172C5.9475 7.42284 6.19972 7.67505 6.51084 7.67505ZM6.51084 7.95672C6.97752 7.95672 7.35584 7.5784 7.35584 7.11172C7.35584 6.64504 6.97752 6.26672 6.51084 6.26672C6.04415 6.26672 5.66584 6.64504 5.66584 7.11172C5.66584 7.5784 6.04415 7.95672 6.51084 7.95672Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.4542 15.4209C10.7653 15.4209 11.0175 15.1687 11.0175 14.8576C11.0175 14.5464 10.7653 14.2942 10.4542 14.2942C10.1431 14.2942 9.89084 14.5464 9.89084 14.8576C9.89084 15.1687 10.1431 15.4209 10.4542 15.4209ZM10.4542 15.7026C10.9209 15.7026 11.2992 15.3242 11.2992 14.8576C11.2992 14.3909 10.9209 14.0126 10.4542 14.0126C9.98749 14.0126 9.60917 14.3909 9.60917 14.8576C9.60917 15.3242 9.98749 15.7026 10.4542 15.7026Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.3833 7.53422C15.6945 7.53422 15.9467 7.28201 15.9467 6.97089C15.9467 6.65977 15.6945 6.40755 15.3833 6.40755C15.0722 6.40755 14.82 6.65977 14.82 6.97089C14.82 7.28201 15.0722 7.53422 15.3833 7.53422ZM15.3833 7.81589C15.85 7.81589 16.2283 7.43757 16.2283 6.97089C16.2283 6.50421 15.85 6.12589 15.3833 6.12589C14.9167 6.12589 14.5383 6.50421 14.5383 6.97089C14.5383 7.43757 14.9167 7.81589 15.3833 7.81589Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M21.1575 4.99922H1.44083V6.90047L1.3 6.90047V7.18214L1.44083 7.18214V17.6742H10.3133V17.8151H10.595V17.6742H21.1575V7.11364L21.3 7.11169L21.2961 6.83005L21.1575 6.83195V4.99922ZM20.8758 5.28089H1.7225V6.90047L5.66584 6.90047V7.11172V7.18214L1.7225 7.18214V17.3926H10.3133V15.7026H10.4542H10.595V17.3926H20.8758V7.1175L16.2019 7.18153C16.2003 7.18769 16.1986 7.19383 16.1969 7.19993C16.1871 7.23475 16.1752 7.26865 16.1612 7.30149C16.1334 7.36681 16.0976 7.42791 16.0551 7.48357C15.9007 7.68558 15.6572 7.81589 15.3833 7.81589C14.9167 7.81589 14.5383 7.43757 14.5383 6.97089C14.5383 6.50421 14.9167 6.12589 15.3833 6.12589C15.7172 6.12589 16.0059 6.31952 16.1431 6.60061C16.1461 6.60674 16.149 6.61291 16.1519 6.61912C16.1891 6.70038 16.2139 6.78856 16.2236 6.8812C16.2243 6.88729 16.2249 6.89339 16.2254 6.89952L20.8758 6.83581V5.28089ZM20.5758 5.58089V6.53989L16.4656 6.5962C16.3104 6.14784 15.8845 5.82589 15.3833 5.82589C14.751 5.82589 14.2383 6.33852 14.2383 6.97089C14.2383 7.60325 14.751 8.11589 15.3833 8.11589C15.8333 8.11589 16.2227 7.8563 16.4099 7.47871L20.5758 7.42164V17.0926H10.895V15.9146C11.3085 15.742 11.5992 15.3337 11.5992 14.8576C11.5992 14.3235 11.2335 13.8748 10.7389 13.7482L7.21877 8.0117C7.48494 7.80204 7.65584 7.47684 7.65584 7.11172C7.65584 6.47935 7.1432 5.96672 6.51084 5.96672C6.06221 5.96672 5.67384 6.22473 5.48603 6.60047H2.0225V5.58089H20.5758ZM5.83799 6.60047C5.77097 6.68853 5.72085 6.79014 5.69246 6.90047C5.67508 6.96799 5.66584 7.03877 5.66584 7.11172C5.66584 7.13543 5.66681 7.15892 5.66873 7.18214C5.67755 7.28901 5.70625 7.39025 5.75114 7.48214C5.82322 7.6297 5.93704 7.75315 6.07722 7.83713C6.16579 7.89019 6.26488 7.92748 6.37063 7.94514C6.40661 7.95115 6.44337 7.95489 6.48075 7.95619C6.488 7.95645 6.49527 7.95661 6.50256 7.95668L10.2361 14.041C10.2299 14.0426 10.2238 14.0443 10.2177 14.0461C10.1254 14.073 10.0395 14.1152 9.96316 14.1698C9.74885 14.323 9.60917 14.574 9.60917 14.8576C9.60917 15.1627 9.77091 15.4301 10.0133 15.5786C10.1036 15.6339 10.2049 15.6727 10.3133 15.6909C10.3591 15.6986 10.4062 15.7026 10.4542 15.7026C10.5022 15.7026 10.5492 15.6986 10.595 15.6909C10.7034 15.6727 10.8048 15.6339 10.895 15.5786C11.1374 15.4301 11.2992 15.1627 11.2992 14.8576C11.2992 14.5224 11.104 14.2328 10.8211 14.0962C10.7382 14.0562 10.6478 14.0293 10.5526 14.0182C10.5203 14.0145 10.4875 14.0126 10.4542 14.0126C10.4286 14.0126 10.4033 14.0137 10.3783 14.0159L10.5039 13.9388L6.80155 7.90538C6.8074 7.90324 6.81321 7.90103 6.819 7.89877C6.90777 7.86398 6.98921 7.81462 7.0604 7.75362C7.24124 7.59864 7.35584 7.36856 7.35584 7.11172C7.35584 6.64504 6.97752 6.26672 6.51084 6.26672C6.2363 6.26672 5.99233 6.39765 5.83799 6.60047ZM5.96584 6.96863C5.95387 7.01432 5.9475 7.06228 5.9475 7.11172C5.9475 7.13557 5.94898 7.15907 5.95186 7.18214C5.95495 7.2069 5.95964 7.23116 5.96584 7.25481C6.01132 7.42852 6.13765 7.56951 6.3022 7.63515C6.30354 7.63569 6.30489 7.63622 6.30624 7.63675C6.36966 7.66148 6.43866 7.67505 6.51084 7.67505C6.55873 7.67505 6.60524 7.66907 6.64964 7.65782C6.74995 7.63241 6.83954 7.58007 6.91027 7.50896C7.01157 7.4071 7.07417 7.26672 7.07417 7.11172C7.07417 6.8006 6.82196 6.54839 6.51084 6.54839C6.24916 6.54839 6.02915 6.72681 5.96584 6.96863ZM10.4959 14.2957C10.4821 14.2947 10.4682 14.2942 10.4542 14.2942C10.4337 14.2942 10.4134 14.2953 10.3935 14.2975C10.2879 14.3088 10.191 14.3493 10.111 14.4108C9.97713 14.5137 9.89084 14.6756 9.89084 14.8576C9.89084 15.1192 10.0693 15.3392 10.3111 15.4026C10.3118 15.4028 10.3126 15.4029 10.3133 15.4031C10.3584 15.4147 10.4055 15.4209 10.4542 15.4209C10.5028 15.4209 10.55 15.4147 10.595 15.4031C10.5958 15.4029 10.5965 15.4028 10.5973 15.4026C10.8391 15.3392 11.0175 15.1192 11.0175 14.8576C11.0175 14.5605 10.7875 14.3171 10.4959 14.2957ZM9.80595 13.9136C9.5059 14.12 9.30917 14.4658 9.30917 14.8576C9.30917 15.3337 9.5998 15.742 10.0133 15.9146V17.0926H2.0225V7.48214H5.42708C5.56172 7.87618 5.90522 8.17341 6.32554 8.2418L9.80595 13.9136ZM15.8524 6.65878C15.7514 6.50733 15.579 6.40755 15.3833 6.40755C15.0722 6.40755 14.82 6.65977 14.82 6.97089C14.82 7.28201 15.0722 7.53422 15.3833 7.53422C15.5845 7.53422 15.7611 7.42874 15.8608 7.27005C15.8775 7.24333 15.8921 7.2151 15.9043 7.18561C15.9316 7.11943 15.9467 7.04692 15.9467 6.97089C15.9467 6.94804 15.9453 6.92552 15.9427 6.90339C15.932 6.81368 15.9002 6.73044 15.8524 6.65878ZM10.0133 17.9742V18.1151H10.895V17.9742H21.4575V7.40956L21.6041 7.40756L21.592 6.52597L21.4575 6.52781V4.69922H1.14083V6.60047H1V7.48214H1.14083V17.9742H10.0133ZM6.51084 7.37505C6.65627 7.37505 6.77417 7.25715 6.77417 7.11172C6.77417 6.96628 6.65627 6.84839 6.51084 6.84839C6.3654 6.84839 6.2475 6.96628 6.2475 7.11172C6.2475 7.25715 6.3654 7.37505 6.51084 7.37505ZM10.4542 15.1209C10.5996 15.1209 10.7175 15.003 10.7175 14.8576C10.7175 14.7121 10.5996 14.5942 10.4542 14.5942C10.3087 14.5942 10.1908 14.7121 10.1908 14.8576C10.1908 15.003 10.3087 15.1209 10.4542 15.1209ZM15.3833 7.23422C15.5288 7.23422 15.6467 7.11632 15.6467 6.97089C15.6467 6.82545 15.5288 6.70755 15.3833 6.70755C15.2379 6.70755 15.12 6.82545 15.12 6.97089C15.12 7.11632 15.2379 7.23422 15.3833 7.23422Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const TransformersIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.45039 7.41364V8.36666C7.45039 8.83631 7.34335 9.33393 7.02017 9.7139C6.39735 10.4462 5.68906 10.6432 5.04292 10.5324C4.40802 10.4236 3.85188 10.0214 3.5048 9.58887C3.2581 9.28143 3.2 8.88902 3.2 8.53375V7.48821H3.49827V8.53375C3.49827 8.86518 3.55437 9.17406 3.73744 9.4022C4.0498 9.79147 4.54569 10.1446 5.09331 10.2385C5.62968 10.3304 6.2344 10.1774 6.79297 9.52065C7.05314 9.21476 7.15211 8.7974 7.15211 8.36666V7.41364H7.45039Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.4771 7.41364V8.36666C11.4771 8.83631 11.37 9.33393 11.0469 9.7139C10.424 10.4462 9.71574 10.6432 9.0696 10.5324C8.4347 10.4236 7.87856 10.0214 7.53148 9.58887C7.28478 9.28143 7.22668 8.88902 7.22668 8.53375V7.48821H7.52495V8.53375C7.52495 8.86518 7.58105 9.17406 7.76412 9.4022C8.07648 9.79147 8.57237 10.1446 9.11999 10.2385C9.65637 10.3304 10.2611 10.1774 10.8196 9.52065C11.0798 9.21476 11.1788 8.7974 11.1788 8.36666V7.41364H11.4771Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.5037 7.41364V8.36666C15.5037 8.83631 15.3967 9.33393 15.0735 9.7139C14.4507 10.4462 13.7424 10.6432 13.0963 10.5324C12.4614 10.4236 11.9052 10.0214 11.5582 9.58887C11.3115 9.28143 11.2534 8.88902 11.2534 8.53375V7.48821H11.5516V8.53375C11.5516 8.86518 11.6077 9.17406 11.7908 9.4022C12.1032 9.79147 12.5991 10.1446 13.1467 10.2385C13.683 10.3304 14.2878 10.1774 14.8463 9.52065C15.1065 9.21476 15.2055 8.7974 15.2055 8.36666V7.41364H15.5037Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M19.5304 7.41364V8.36666C19.5304 8.83631 19.4234 9.33393 19.1002 9.7139C18.4774 10.4462 17.7691 10.6432 17.123 10.5324C16.4881 10.4236 15.9319 10.0214 15.5848 9.58887C15.3381 9.28143 15.28 8.88902 15.28 8.53375V7.48821H15.5783V8.53375C15.5783 8.86518 15.6344 9.17406 15.8175 9.4022C16.1298 9.79147 16.6257 10.1446 17.1734 10.2385C17.7097 10.3304 18.3144 10.1774 18.873 9.52065C19.1332 9.21476 19.2322 8.7974 19.2322 8.36666V7.41364H19.5304Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path fillRule='evenodd' clipRule='evenodd' d='M11.4771 1.00078V8.97958H11.1788V1.00078H11.4771Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.28 14.5879L15.28 13.6349C15.28 13.1653 15.3871 12.6676 15.7103 12.2877C16.3331 11.5554 17.0414 11.3584 17.6875 11.4691C18.3224 11.5779 18.8786 11.9802 19.2256 12.4127C19.4723 12.7201 19.5304 13.1125 19.5304 13.4678V14.5133H19.2322V13.4678C19.2322 13.1364 19.1761 12.8275 18.993 12.5994C18.6806 12.2101 18.1847 11.857 17.6371 11.7631C17.1007 11.6712 16.496 11.8242 15.9375 12.4809C15.6773 12.7868 15.5783 13.2042 15.5783 13.6349L15.5783 14.5879H15.28Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M11.2534 14.5879V13.6349C11.2534 13.1653 11.3604 12.6676 11.6836 12.2877C12.3064 11.5554 13.0147 11.3584 13.6608 11.4691C14.2957 11.5779 14.8519 11.9802 15.1989 12.4127C15.4457 12.7201 15.5037 13.1125 15.5037 13.4678L15.5037 14.5133H15.2055L15.2055 13.4678C15.2055 13.1364 15.1494 12.8275 14.9663 12.5994C14.6539 12.2101 14.1581 11.857 13.6104 11.7631C13.0741 11.6712 12.4693 11.8242 11.9108 12.4809C11.6506 12.7868 11.5516 13.2042 11.5516 13.6349V14.5879H11.2534Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7.22668 14.5879V13.6349C7.22668 13.1653 7.33372 12.6676 7.6569 12.2877C8.27972 11.5554 8.98801 11.3584 9.63415 11.4691C10.269 11.5779 10.8252 11.9802 11.1723 12.4127C11.419 12.7201 11.4771 13.1125 11.4771 13.4678V14.5133H11.1788V13.4678C11.1788 13.1364 11.1227 12.8275 10.9396 12.5994C10.6273 12.2101 10.1314 11.857 9.58376 11.7631C9.04738 11.6712 8.44267 11.8242 7.8841 12.4809C7.62393 12.7868 7.52495 13.2042 7.52495 13.6349V14.5879H7.22668Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3.2 14.5879L3.2 13.6349C3.2 13.1653 3.30704 12.6676 3.63022 12.2877C4.25304 11.5554 4.96133 11.3584 5.60747 11.4691C6.24237 11.5779 6.79851 11.9802 7.14559 12.4127C7.39229 12.7201 7.45039 13.1125 7.45039 13.4678V14.5133H7.15211V13.4678C7.15211 13.1364 7.09602 12.8275 6.91295 12.5994C6.60059 12.2101 6.10469 11.857 5.55708 11.7631C5.0207 11.6712 4.41599 11.8242 3.85742 12.4809C3.59725 12.7868 3.49827 13.2042 3.49827 13.6349L3.49827 14.5879H3.2Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path fillRule='evenodd' clipRule='evenodd' d='M11.2534 21.0008L11.2534 13.022H11.5516V21.0008H11.2534Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.9788 0.800781H11.6771V7.28821H11.7516V8.53375C11.7516 8.84917 11.8064 9.10205 11.9468 9.27703C12.2358 9.63726 12.6913 9.95751 13.1805 10.0413C13.6433 10.1207 14.1785 9.99711 14.694 9.39107C14.9119 9.13482 15.0055 8.77125 15.0055 8.36666V7.21364H15.7037V7.28821H15.7783V8.53375C15.7783 8.84917 15.8331 9.10205 15.9735 9.27703C16.2625 9.63726 16.718 9.95751 17.2071 10.0413C17.67 10.1207 18.2052 9.99711 18.7207 9.39107C18.9386 9.13482 19.0322 8.77125 19.0322 8.36666V7.21364H19.7304V8.36666C19.7304 8.86235 19.618 9.41382 19.2526 9.84347C18.5867 10.6264 17.8089 10.8529 17.0892 10.7296C16.3957 10.6107 15.7992 10.1756 15.4289 9.71404C15.4097 9.6902 15.3916 9.66597 15.3744 9.64141C15.3303 9.71113 15.281 9.77868 15.2259 9.84347C14.56 10.6264 13.7823 10.8529 13.0625 10.7296C12.369 10.6107 11.7725 10.1756 11.4022 9.71404C11.383 9.6902 11.3649 9.66597 11.3477 9.64141C11.3037 9.71112 11.2543 9.77868 11.1992 9.84347C10.5333 10.6264 9.75558 10.8529 9.03582 10.7296C8.34236 10.6107 7.74583 10.1756 7.37549 9.71404C7.35636 9.6902 7.33823 9.66597 7.32106 9.64141C7.27698 9.71113 7.22762 9.77868 7.17252 9.84347C6.50663 10.6264 5.7289 10.8529 5.00914 10.7296C4.31568 10.6107 3.71915 10.1756 3.34881 9.71404C3.05943 9.35342 3 8.905 3 8.53375V7.28821H3.69827V8.53375C3.69827 8.84917 3.75302 9.10205 3.89342 9.27703C4.18249 9.63726 4.63798 9.95751 5.12709 10.0413C5.58991 10.1207 6.12516 9.99711 6.64062 9.39107C6.85857 9.13482 6.95211 8.77125 6.95211 8.36666V7.21364H7.65039V7.28821H7.72495V8.53375C7.72495 8.84917 7.7797 9.10205 7.9201 9.27703C8.20917 9.63726 8.66466 9.95751 9.15377 10.0413C9.61659 10.1207 10.1518 9.99711 10.6673 9.39107C10.8853 9.13482 10.9788 8.77125 10.9788 8.36666V0.800781ZM3.47787 12.1581C4.14376 11.3752 4.92148 11.1486 5.64125 11.272C6.33471 11.3908 6.93123 11.826 7.30157 12.2875C7.32071 12.3114 7.33884 12.3356 7.35601 12.3602C7.40009 12.2904 7.44944 12.2229 7.50455 12.1581C8.17044 11.3752 8.94816 11.1486 9.66793 11.272C10.3614 11.3908 10.9579 11.826 11.3283 12.2875C11.3474 12.3114 11.3655 12.3356 11.3827 12.3602C11.4268 12.2904 11.4761 12.2229 11.5312 12.1581C12.1971 11.3752 12.9748 11.1486 13.6946 11.272C14.3881 11.3908 14.9846 11.826 15.3549 12.2875C15.3741 12.3114 15.3922 12.3356 15.4094 12.3602C15.4535 12.2904 15.5028 12.2229 15.5579 12.1581C16.2238 11.3752 17.0015 11.1486 17.7213 11.272C18.4148 11.3908 19.0113 11.826 19.3816 12.2875C19.671 12.6481 19.7304 13.0966 19.7304 13.4678L19.7304 14.7134H19.0322L19.0322 13.4678C19.0322 13.1524 18.9774 12.8995 18.837 12.7245C18.5479 12.3643 18.0925 12.0441 17.6033 11.9602C17.1405 11.8809 16.6053 12.0045 16.0898 12.6105C15.8719 12.8667 15.7783 13.2303 15.7783 13.6349L15.7783 14.7879H15.08V14.7134H15.0055L15.0055 13.4678C15.0055 13.1524 14.9507 12.8995 14.8103 12.7245C14.5213 12.3643 14.0658 12.0441 13.5767 11.9602C13.1138 11.8809 12.5786 12.0045 12.0631 12.6105C11.8452 12.8667 11.7516 13.2303 11.7516 13.6349V21.2008H11.0534L11.0534 14.7133H10.9788V13.4678C10.9788 13.1524 10.9241 12.8995 10.7836 12.7245C10.4946 12.3643 10.0391 12.0441 9.54998 11.9602C9.08716 11.8809 8.55191 12.0045 8.03645 12.6105C7.8185 12.8667 7.72495 13.2303 7.72495 13.6349V14.7879H7.02668V14.7133H6.95211V13.4678C6.95211 13.1524 6.89737 12.8995 6.75696 12.7245C6.4679 12.3643 6.01241 12.0441 5.5233 11.9602C5.06048 11.8809 4.52522 12.0045 4.00977 12.6105C3.79181 12.8667 3.69827 13.2303 3.69827 13.6349L3.69827 14.7879H3L3 13.6349C3 13.1392 3.11243 12.5877 3.47787 12.1581Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const UpsSystemIcon = () => {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.1312 1L15.1475 1.00112C17.0309 1.13101 18.15 1.81478 18.5075 2.20485L18.5903 2.29516V19.3066L18.5809 19.3442C18.4951 19.6874 18.2731 19.9515 18.0072 20.1506C17.7425 20.3488 17.418 20.4954 17.0888 20.6042C16.4305 20.8218 15.6939 20.9075 15.2135 20.9212L15.209 20.9213H6.38577C4.53148 20.9213 3.41457 20.0937 3.06097 19.6115L3 19.5284V2.57515C3 2.23832 3.24062 2.0022 3.46756 1.85096C3.70653 1.69171 4.01982 1.56491 4.34272 1.46362C4.99283 1.2597 5.76312 1.13463 6.27406 1.08084L6.2905 1.07911H6.30704C8.48748 1.07911 13.2948 1.06332 15.1149 1.00056L15.1312 1ZM6.32372 1.70902C5.83749 1.76115 5.12122 1.8796 4.53125 2.06466C4.2308 2.15891 3.98307 2.26439 3.81687 2.37515C3.63864 2.49392 3.62991 2.56553 3.62991 2.57515V19.3134C3.93267 19.6505 4.83609 20.2914 6.38577 20.2914H15.2C15.6383 20.2785 16.3085 20.1987 16.8911 20.0062C17.1832 19.9096 17.4385 19.7895 17.6296 19.6464C17.8064 19.514 17.9139 19.3733 17.9604 19.2248V2.55186C17.6361 2.27451 16.7118 1.74355 15.1202 1.63066C13.2793 1.69325 8.50149 1.70894 6.32372 1.70902Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path fillRule='evenodd' clipRule='evenodd' d='M6.14956 1.00031H15.4408V21H6.14956V1.00031ZM6.77947 1.63022V3.75617H14.8108V1.63022H6.77947ZM14.8108 4.38608H6.77947V10.134H14.8108V4.38608ZM14.8108 10.7639H6.77947V20.3701H14.8108V10.7639Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M12.7636 12.6537H8.82668V12.0238H12.7636V12.6537Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M12.7636 13.5985H8.82668V12.9686H12.7636V13.5985Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path fillRule='evenodd' clipRule='evenodd' d='M12.7636 14.5434H8.82668V13.9135H12.7636V14.5434Z' fill={enums.ASSET_TYPE_ICON_COLOR} />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8.6692 16.7481C8.93012 16.7481 9.14164 16.5366 9.14164 16.2757C9.14164 16.0147 8.93012 15.8032 8.6692 15.8032C8.40829 15.8032 8.19677 16.0147 8.19677 16.2757C8.19677 16.5366 8.40829 16.7481 8.6692 16.7481ZM8.6692 17.2205C9.19104 17.2205 9.61407 16.7975 9.61407 16.2757C9.61407 15.7538 9.19104 15.3308 8.6692 15.3308C8.14737 15.3308 7.72434 15.7538 7.72434 16.2757C7.72434 16.7975 8.14737 17.2205 8.6692 17.2205Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.8739 8.71672C11.6566 8.71672 12.2912 8.08218 12.2912 7.29942C12.2912 6.51667 11.6566 5.88212 10.8739 5.88212C10.0911 5.88212 9.45659 6.51667 9.45659 7.29942C9.45659 8.08218 10.0911 8.71672 10.8739 8.71672ZM10.8739 9.18916C11.9176 9.18916 12.7636 8.3431 12.7636 7.29942C12.7636 6.25575 11.9176 5.40969 10.8739 5.40969C9.83022 5.40969 8.98416 6.25575 8.98416 7.29942C8.98416 8.3431 9.83022 9.18916 10.8739 9.18916Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.8739 16.7481C11.1348 16.7481 11.3463 16.5366 11.3463 16.2757C11.3463 16.0147 11.1348 15.8032 10.8739 15.8032C10.613 15.8032 10.4015 16.0147 10.4015 16.2757C10.4015 16.5366 10.613 16.7481 10.8739 16.7481ZM10.8739 17.2205C11.3957 17.2205 11.8188 16.7975 11.8188 16.2757C11.8188 15.7538 11.3957 15.3308 10.8739 15.3308C10.3521 15.3308 9.92903 15.7538 9.92903 16.2757C9.92903 16.7975 10.3521 17.2205 10.8739 17.2205Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.0786 16.7481C13.3395 16.7481 13.551 16.5366 13.551 16.2757C13.551 16.0147 13.3395 15.8032 13.0786 15.8032C12.8177 15.8032 12.6062 16.0147 12.6062 16.2757C12.6062 16.5366 12.8177 16.7481 13.0786 16.7481ZM13.0786 17.2205C13.6004 17.2205 14.0235 16.7975 14.0235 16.2757C14.0235 15.7538 13.6004 15.3308 13.0786 15.3308C12.5567 15.3308 12.1337 15.7538 12.1337 16.2757C12.1337 16.7975 12.5567 17.2205 13.0786 17.2205Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M12.3042 19.6158C12.1918 19.6158 12.0904 19.5967 12 19.5584C11.9103 19.5202 11.8361 19.4658 11.7773 19.3953C11.7192 19.324 11.6814 19.2399 11.6637 19.1429L11.8666 19.1109C11.8923 19.2108 11.9456 19.2891 12.0264 19.3457C12.108 19.4015 12.2039 19.4295 12.3141 19.4295C12.3854 19.4295 12.4497 19.4184 12.507 19.3964C12.5651 19.3736 12.611 19.3413 12.6448 19.2994C12.6786 19.2575 12.6955 19.2079 12.6955 19.1506C12.6955 19.1153 12.6893 19.0852 12.6768 19.0602C12.665 19.0345 12.6485 19.0128 12.6272 18.9951C12.6066 18.9768 12.5831 18.9613 12.5566 18.9488C12.5302 18.9363 12.5026 18.9261 12.474 18.918L12.0694 18.7978C12.0253 18.7846 11.9827 18.7681 11.9415 18.7482C11.9004 18.7276 11.8636 18.7023 11.8313 18.6722C11.799 18.6413 11.7732 18.6045 11.7541 18.5619C11.735 18.5186 11.7255 18.4675 11.7255 18.4087C11.7255 18.3146 11.7497 18.2345 11.7982 18.1684C11.8475 18.1015 11.914 18.0504 11.9978 18.0152C12.0815 17.9799 12.176 17.9626 12.2811 17.9633C12.3876 17.9641 12.4828 17.9832 12.5666 18.0207C12.6511 18.0574 12.7209 18.1103 12.776 18.1794C12.8319 18.2485 12.8693 18.3312 12.8885 18.4274L12.6801 18.4638C12.6691 18.3991 12.6445 18.3437 12.6063 18.2974C12.5688 18.2503 12.5217 18.2143 12.4651 18.1893C12.4086 18.1636 12.3465 18.1504 12.2789 18.1496C12.2142 18.1489 12.1558 18.1592 12.1036 18.1805C12.0514 18.2018 12.0099 18.2316 11.979 18.2698C11.9481 18.3073 11.9327 18.3506 11.9327 18.3999C11.9327 18.4484 11.9467 18.4877 11.9746 18.5178C12.0025 18.5472 12.0367 18.5707 12.0771 18.5884C12.1183 18.6053 12.1583 18.6192 12.1973 18.6303L12.4993 18.7174C12.5339 18.7269 12.5735 18.7401 12.6184 18.757C12.6639 18.7739 12.708 18.7978 12.7507 18.8287C12.7933 18.8588 12.8286 18.8992 12.8565 18.9499C12.8844 18.9999 12.8984 19.0631 12.8984 19.1395C12.8984 19.216 12.8829 19.284 12.8521 19.3435C12.8219 19.403 12.7797 19.453 12.7253 19.4934C12.6709 19.5331 12.6077 19.5632 12.5357 19.5838C12.4637 19.6051 12.3865 19.6158 12.3042 19.6158Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M10.3842 19.5827V17.9953H11.0115C11.0269 17.9953 11.0453 17.996 11.0666 17.9975C11.0879 17.9982 11.1085 18.0005 11.1283 18.0041C11.2143 18.0174 11.2863 18.0468 11.3444 18.0923C11.4032 18.1379 11.4473 18.1956 11.4767 18.2654C11.5061 18.3345 11.5208 18.4113 11.5208 18.4958C11.5208 18.5796 11.5057 18.6563 11.4756 18.7262C11.4462 18.7952 11.4021 18.8529 11.3433 18.8992C11.2852 18.9448 11.2136 18.9742 11.1283 18.9874C11.1085 18.9904 11.0879 18.9926 11.0666 18.994C11.0453 18.9955 11.0269 18.9962 11.0115 18.9962H10.5805V19.5827H10.3842ZM10.5805 18.8099H11.0049C11.0188 18.8099 11.0346 18.8092 11.0523 18.8077C11.0706 18.8063 11.0879 18.8037 11.1041 18.8C11.1548 18.7883 11.1959 18.767 11.2275 18.7361C11.2599 18.7045 11.2834 18.6677 11.2981 18.6259C11.3128 18.5832 11.3201 18.5399 11.3201 18.4958C11.3201 18.4517 11.3128 18.4087 11.2981 18.3668C11.2834 18.3242 11.2599 18.2871 11.2275 18.2555C11.1959 18.2239 11.1548 18.2026 11.1041 18.1915C11.0879 18.1871 11.0706 18.1845 11.0523 18.1838C11.0346 18.1823 11.0188 18.1816 11.0049 18.1816H10.5805V18.8099Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
      <path
        d='M9.44974 19.6158C9.32701 19.6158 9.21861 19.5904 9.12455 19.5397C9.03048 19.489 8.95662 19.4181 8.90298 19.3269C8.85006 19.2351 8.82361 19.1274 8.82361 19.004V17.9964L9.02203 17.9953V18.9874C9.02203 19.0624 9.03452 19.1278 9.05951 19.1836C9.08523 19.2388 9.11903 19.2847 9.16092 19.3214C9.20281 19.3582 9.24874 19.3857 9.29872 19.4041C9.34942 19.4217 9.39977 19.4306 9.44974 19.4306C9.50045 19.4306 9.55115 19.4214 9.60186 19.403C9.65257 19.3846 9.6985 19.3574 9.73966 19.3214C9.78154 19.2847 9.81498 19.2384 9.83997 19.1825C9.86496 19.1267 9.87745 19.0616 9.87745 18.9874V17.9953H10.0759V19.004C10.0759 19.1267 10.049 19.234 9.9954 19.3258C9.94249 19.4177 9.869 19.489 9.77493 19.5397C9.68086 19.5904 9.57247 19.6158 9.44974 19.6158Z'
        fill={enums.ASSET_TYPE_ICON_COLOR}
      />
    </svg>
  )
}

export const EngineeringOutlined = () => {
  return (
    <svg class='MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeMedium svg-icon css-kry165' focusable='false' aria-hidden='true' viewBox='0 0 24 24' data-testid='EngineeringOutlinedIcon' tabindex='-1' title='EngineeringOutlined'>
      <path d='M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4m-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2zM4.74 9H5c0 2.21 1.79 4 4 4s4-1.79 4-4h.26c.27 0 .49-.22.49-.49v-.02c0-.27-.22-.49-.49-.49H13c0-1.48-.81-2.75-2-3.45v.95c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.14C9.68 4.06 9.35 4 9 4s-.68.06-1 .14V5.5c0 .28-.22.5-.5.5S7 5.78 7 5.5v-.95C5.81 5.25 5 6.52 5 8h-.26c-.27 0-.49.22-.49.49v.03c0 .26.22.48.49.48M11 9c0 1.1-.9 2-2 2s-2-.9-2-2zm10.98-2.77.93-.83-.75-1.3-1.19.39c-.14-.11-.3-.2-.47-.27L20.25 3h-1.5l-.25 1.22q-.255.105-.48.27l-1.18-.39-.75 1.3.93.83c-.02.17-.02.35 0 .52l-.93.85.75 1.3 1.2-.38c.13.1.28.18.43.25l.28 1.23h1.5l.27-1.22c.16-.07.3-.15.44-.25l1.19.38.75-1.3-.93-.85c.03-.19.02-.36.01-.53M19.5 7.75c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25m-.1 3.04-.85.28c-.1-.08-.21-.14-.33-.19l-.18-.88h-1.07l-.18.87c-.12.05-.24.12-.34.19l-.84-.28-.54.93.66.59c-.01.13-.01.25 0 .37l-.66.61.54.93.86-.27c.1.07.2.13.31.18l.18.88h1.07l.19-.87c.11-.05.22-.11.32-.18l.85.27.54-.93-.66-.61c.01-.13.01-.25 0-.37l.66-.59zm-1.9 2.6c-.49 0-.89-.4-.89-.89s.4-.89.89-.89.89.4.89.89-.4.89-.89.89'></path>
    </svg>
  )
}
