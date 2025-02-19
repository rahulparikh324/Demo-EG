import React, { useState } from 'react'

import { MinimalAutoComplete, MinimalInput, MinimalToggleButton } from 'components/Assets/components'
import { PopupModal } from 'components/common/others'
import { FloatingButton } from 'components/common/buttons'

import { components } from 'react-select'

import { snakifyKeys } from 'helpers/formatters'
import onBoardingWorkorder from 'Services/WorkOrder/on-boarding-wo'

import { validate } from './utils'
import { filter, get, isEmpty } from 'lodash'
import { Toast } from 'Snackbar/useToast'

import RemoveIcon from '@material-ui/icons/Remove'
import { useTheme } from '@material-ui/core/styles'
import enums from 'Constants/enums'
import DialogPrompt from 'components/DialogPrompt'

const CreateFedBy = ({ open, onClose, classCodeOptions, woId, afterSubmit, asset, isInstalling, issueAsset = false }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [assetName, setAssetName] = useState('')
  const [assetClassCode, setClassCode] = useState(null)
  const [error, setError] = useState({})
  const theme = useTheme()
  const [subComponentList, setSubComponentList] = useState([])
  const [changeLineSide, setChangeLineSide] = useState([false, null, false])

  const CustomOptions = ({ children, ...props }) => {
    return (
      <components.Option {...props}>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='text-bold'>{props.data.className} </div>
          <div className='text-bold text-accent'>{props.data.label}</div>
        </div>
      </components.Option>
    )
  }
  // console.log(asset)
  //
  const validateForm = async () => {
    const isValid = await validate({ assetName, assetClassCode: get(assetClassCode, 'label', ''), subComponentList }, true)
    setError(isValid)
    const subComponentErrors = []
    const subCompList = [...subComponentList]
    if (!isEmpty(subComponentList)) {
      subCompList.forEach(d => {
        const err = {}
        if (isEmpty(d.name)) err['name'] = { error: true, msg: 'Asset Name is required !' }
        if (isEmpty(d.classData)) err['classData'] = { error: true, msg: 'Asset Class Code is required !' }
        if (!isEmpty(err)) {
          d.error = err
          subComponentErrors.push(true)
        }
      })
      setSubComponentList(subCompList)
    }
    if (isValid === true) submitData()
  }
  //
  const submitData = async () => {
    const payload = snakifyKeys({
      woId,
      assetName,
      inspectiontemplateAssetClassId: get(assetClassCode, 'id', ''),
      formioBuildingName: isInstalling ? get(asset, 'building', '') : get(asset, 'building.label', ''),
      formioFloorName: isInstalling ? get(asset, 'floor', '') : get(asset, 'floor.label', ''),
      formioRoomName: isInstalling ? get(asset, 'room', '') : get(asset, 'room.label', ''),
      formioSectionName: get(asset, 'section', ''),
      subcomponentsList: !isEmpty(subComponentList) ? subComponentList.map(val => ({ assetName: val.name, inspectiontemplateAssetClassId: val.classData.id, lineLoadSideId: get(val, 'lineLoadSideId', null) })) : null,
    })
    setIsCreating(true)
    try {
      const res = await onBoardingWorkorder.fedBy.create(payload)
      if (res.success > 0) {
        Toast.success(`New Asset Created Successfully !`)
        onClose()
        afterSubmit(get(res, 'data.woonboardingassetsId', ''))
      } else Toast.error(res.message)
    } catch (error) {
      Toast.error(`Error create Asset. Please try again !`)
    }
    setIsCreating(false)
  }

  // sub Component handling
  const handleAddSubComponent = () => {
    const subComponent = { name: '', classData: null, error: { name: null, classData: null }, id: subComponentList.length + 1, lineLoadSideId: null }
    setSubComponentList([...subComponentList, subComponent])
  }
  const handleComponentRowChange = (name, value, id) => {
    const list = [...subComponentList]
    const current = list.find(d => d.id === id)
    current[name] = value
    if (name === 'classData') {
      if (get(value, 'is_line_load_side_allowed', false) === true) {
        current['lineLoadSideId'] = enums.SUB_COMPONENT_TYPE.LOAD_SIDE
      }
    }
    setSubComponentList(list)
  }
  const handleErrorSubComponent = (name, id) => {
    const list = [...subComponentList]
    const current = list.find(d => d.id === id)
    current['error'][name] = null
    setSubComponentList(list)
  }
  const handleRemoveComponentRow = id => {
    let list = [...subComponentList]
    list = list.filter(component => component.id !== id).map((d, i) => ({ ...d, id: i }))
    setSubComponentList(list)
  }

  const handleCheckLine = (id, lineLoadSideId) => {
    const checkLineSide = subComponentList.some(item => item.lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE)
    if (checkLineSide) {
      setChangeLineSide([true, id, lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE ? true : false])
    } else {
      const updatedList = subComponentList.map(item => (item.id === id ? { ...item, lineLoadSideId: item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE ? enums.SUB_COMPONENT_TYPE.LINE_SIDE : enums.SUB_COMPONENT_TYPE.LOAD_SIDE } : { ...item, lineLoadSideId: enums.SUB_COMPONENT_TYPE.LOAD_SIDE }))
      setSubComponentList(updatedList)
    }
  }

  const handleChangeLineSide = id => {
    const updatedList = subComponentList.map(item => (item.id === id ? { ...item, lineLoadSideId: item.lineLoadSideId !== enums.SUB_COMPONENT_TYPE.LINE_SIDE ? enums.SUB_COMPONENT_TYPE.LINE_SIDE : enums.SUB_COMPONENT_TYPE.LOAD_SIDE } : { ...item, lineLoadSideId: enums.SUB_COMPONENT_TYPE.LOAD_SIDE }))
    setSubComponentList(updatedList)
    setChangeLineSide([false, null, false])
  }
  return (
    <PopupModal width={40} open={open} onClose={onClose} title={`Create New ${issueAsset ? 'Asset' : 'Fed-By'}`} loading={isCreating} handleSubmit={validateForm} cta='Create' loadingText='Creating...' tblResponsive={issueAsset ? false : true}>
      <div className='text-bold mb-2'>Top Component</div>
      <div className='p-2' style={{ border: '1px solid #EAEAEA', borderRadius: '4px' }}>
        <div className='d-flex justify-content-between' style={{ width: '100%' }}>
          <MinimalInput value={assetName} onChange={setAssetName} label='Asset Name' placeholder='Add Asset Name' w={50} error={error.assetName} onFocus={() => setError({ ...error, assetName: null })} />
          <MinimalAutoComplete placeholder='Select Class' value={assetClassCode} onChange={v => setClassCode(v)} options={filter(classCodeOptions, { is_allowed_toplevel: true })} label='Asset Class' isClearable w={50} error={error.assetClassCode} onFocus={() => setError({ ...error, assetClassCode: null })} components={{ Option: CustomOptions }} />
        </div>
      </div>
      {!issueAsset && (
        <>
          <div className='text-bold mt-3 mb-2'>OCP(S)</div>
          <div className='' style={{ border: '1px solid #EAEAEA', borderRadius: '4px' }}>
            <div className='d-flex align-items-center p-2' style={{ borderBottom: '1px solid #EAEAEA' }}>
              <div className='text-bold' style={{ width: '45%' }}>
                Asset Name
              </div>
              <div className='text-bold pl-3' style={{ width: '45%' }}>
                Asset Class
              </div>
              <div className='text-bold' style={{ width: '10%' }}>
                Line Side
              </div>
              <div className='text-bold'>Action</div>
            </div>
            {get(assetClassCode, 'is_allowed_subcomponent', false) === true ? (
              <>
                {subComponentList.map(({ name, classData, id, error, lineLoadSideId }, index) => (
                  <div className='d-flex align-items-start pb-0 px-2 pt-2' key={index}>
                    <MinimalInput value={name} onChange={value => handleComponentRowChange('name', value, id)} placeholder='Add Asset Name' w={45} error={error.name} onFocus={() => handleErrorSubComponent('name', id)} />
                    <MinimalAutoComplete
                      placeholder='Select Class'
                      value={classData}
                      onChange={v => handleComponentRowChange('classData', v, id)}
                      options={filter(classCodeOptions, { is_allowed_to_create_subcomponent: true })}
                      isClearable
                      w={45}
                      error={error.classData}
                      onFocus={() => handleErrorSubComponent('classData', id)}
                      components={{ Option: CustomOptions }}
                    />
                    {get(classData, 'is_line_load_side_allowed', false) === true ? <MinimalToggleButton isCheck={lineLoadSideId === enums.SUB_COMPONENT_TYPE.LINE_SIDE} onChange={() => handleCheckLine(id, lineLoadSideId)} /> : <span style={{ width: '55px' }}></span>}
                    <FloatingButton onClick={() => handleRemoveComponentRow(id)} icon={<RemoveIcon fontSize='small' />} style={{ background: theme.palette.primary.main, color: '#fff', width: '42px', height: '42px', marginLeft: '8px', borderRadius: '4px' }} />
                  </div>
                ))}

                <div onClick={handleAddSubComponent} className='p-2 m-2 text-bold' style={{ borderRadius: '4px', cursor: 'pointer', border: '1px dashed #a1a1a1', background: 'none', textAlign: 'center' }}>
                  Add New OCP
                </div>
              </>
            ) : (
              <div className='p-2 m-2 text-bold' style={{ borderRadius: '4px', background: '#00000014', textAlign: 'center' }}>
                Can't Add OCP(S) in this Asset Class
              </div>
            )}
          </div>
        </>
      )}
      {/* Line/load side */}
      <DialogPrompt
        title={`${changeLineSide[2] ? 'Remove' : 'Assign'} Line-Side Component`}
        text={changeLineSide[2] ? 'Are you sure you want to Remove this sub-component (OCP) as a Line-Side component?' : 'Are you sure you want to Assign this sub-component (OCP) as a Line-Side component? The current Line-Side component will be converted to a Load-Side component. Please confirm!'}
        open={changeLineSide[0]}
        ctaText={`${changeLineSide[2] ? 'Remove' : 'Confirm'}`}
        action={() => handleChangeLineSide(changeLineSide[1])}
        handleClose={() => setChangeLineSide([false, null, false])}
      />
    </PopupModal>
  )
}

export default CreateFedBy
