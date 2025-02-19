import React, { useState, useEffect } from 'react'
import { get, orderBy } from 'lodash'
import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { MinimalInput, MinimalAutoComplete } from 'components/Assets/components'
import { locations } from 'components/locations/utils'

import locationsUpdate from 'Services/locations'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

const MoveColumn = ({ open, onClose, reFetch, isChange, selectedAsset, resetSelection, showTopLevel, setEditMode, editFields = {}, isEdit = false, buildingRefetch, floorRefetch, roomRefetch }) => {
  const [locationInfo, setLocationInfo] = useState({ building: '', floor: '', room: '', selectedBuilding: '', selectedFloor: '', selectedRoom: '', selectedTopLevel: '' })
  const [buildingOptions, setBuildingOptions] = useState([])
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])
  const [topAsset, setTopAsset] = useState([])
  const [error, setError] = useState({})
  const [isLoading, setLoading] = useState({ floor: false, room: false, asset: false })

  const [location, setLocation] = useState(locations.BUILDING)
  const mode = { isBuilding: location === locations.BUILDING, isFloor: location === locations.FLOOR, isRoom: location === locations.ROOM }

  const validateForm = async () => {
    const schemaObj = {}

    if (mode.isBuilding && !isChange) {
      schemaObj.locationName = yup.string().required('Building is required !')
    } else if (mode.isFloor) {
      schemaObj.formiobuildingId = yup.string().required('Building is required !')
      schemaObj.locationName = yup.string().required('Floor is required !')
    } else if (mode.isRoom) {
      schemaObj.formiobuildingId = yup.string().required('Building is required !')
      schemaObj.formiofloorId = yup.string().required('Floor is required !')
      schemaObj.locationName = yup.string().required('Room is required !')
    } else if (isChange) {
      schemaObj.formiobuildingId = yup.string().required('Building is required !')
      schemaObj.formiofloorId = yup.string().required('Floor is required !')
      schemaObj.formioroomId = yup.string().required('Room is required !')
      schemaObj.toplevelcomponentAssetId = showTopLevel ? yup.string().required('Top-level is required !') : null
    }

    const payload = {}
    if (isChange) {
      payload.formiobuildingId = get(locationInfo, 'selectedBuilding.value', '')
      payload.formiofloorId = get(locationInfo, 'selectedFloor.actualID', '')
      payload.formioroomId = get(locationInfo, 'selectedRoom.value', '')
      payload.assetId = selectedAsset
      payload.toplevelcomponentAssetId = showTopLevel ? get(locationInfo, 'selectedTopLevel.value', '') : null
    } else if (isEdit) {
      payload.formiobuildingId = get(locationInfo, 'selectedBuilding.value', '')
      payload.formiofloorId = mode.isBuilding ? 0 : mode.isFloor ? get(editFields, 'formiofloorId', '') : get(locationInfo, 'selectedFloor.actualID', '')
      payload.formioroomId = mode.isRoom ? get(editFields, 'formioroomId', 0) : 0
      payload.formiosectionId = 0
      payload.locationName = mode.isBuilding ? locationInfo.building : mode.isFloor ? locationInfo.floor : locationInfo.room
      payload.editingLocationFlag = location
      payload.buildingName = mode.isBuilding ? locationInfo.building : get(locationInfo, 'selectedBuilding.label', '')
      payload.floorName = mode.isFloor ? locationInfo.floor : get(locationInfo, 'selectedFloor.label', '')
      payload.roomName = mode.isRoom ? locationInfo.room : get(locationInfo, 'selectedRoom.label', '')
    }

    const schema = yup.object().shape(schemaObj)
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) isChange ? handleChangeLocation(payload) : submitData(payload)
  }
  const updatePostSuccess = () => {
    onClose()
    if (mode.isBuilding) buildingRefetch()
    if (mode.isFloor) floorRefetch()
    if (mode.isRoom) roomRefetch()
  }
  const { loading: isEditLoading, mutate: updateLocation } = usePostData({ executer: locationsUpdate.updateLocationDetails, postSuccess: updatePostSuccess, message: { success: 'Location Edited Successfully!', error: 'Something went wrong' } })
  const submitData = async updateLocationpayload => updateLocation(updateLocationpayload)

  const changePostSuccess = () => {
    onClose()
    reFetch()
    resetSelection()
    setEditMode(false)
  }
  const { loading: isChangeLoading, mutate: changeLocation } = usePostData({ executer: locationsUpdate.changeSelectedAssetsLocation, postSuccess: changePostSuccess, message: { success: 'Location Changed Successfully!', error: 'Something went wrong' } })
  const handleChangeLocation = async changeLocationPayload => changeLocation(changeLocationPayload)

  const handleBuildingFormater = building => {
    const data = get(building, 'buildingList', []).map(d => ({ ...d, label: d.formioBuildingName, value: d.formiobuildingId }))
    const sorted = orderBy(data, [d => d.label && d.label.toLowerCase()], ['asc'])
    setBuildingOptions(sorted)
    return building
  }
  const { loading: buildingLoading } = useFetchData({ fetch: locationsUpdate.columns.getBuilding, formatter: d => handleBuildingFormater(get(d, 'data', {})), defaultValue: {} })

  const handleBuildingChange = async selectedBuilding => {
    setLocationInfo({ ...locationInfo, selectedBuilding, selectedTopLevel: null, selectedFloor: null, selectedRoom: null })
    setTopAsset([])
    setFloorOptions([])
    setRoomOptions([])
    if (get(selectedBuilding, 'value', null) !== null) {
      setLoading({ ...isLoading, floor: true })
      const res = await locationsUpdate.columns.getFloorDropdown(get(selectedBuilding, 'value', null))
      if (res.success > 0) {
        const floor = get(res, 'data.floorList', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formioFloorName, actualID: d.formiofloorId }))
        // const sorted = orderBy(floor, [d => d.label && d.label.toLowerCase()], ['asc'])
        setFloorOptions(floor)
      }
      setLoading({ ...isLoading, floor: false })
    }
  }

  const handleFloorChange = async selectedFloor => {
    setLocationInfo({ ...locationInfo, selectedFloor, selectedRoom: null, selectedTopLevel: null })
    setTopAsset([])
    setRoomOptions([])
    if (get(selectedFloor, 'value', null) !== null) {
      setLoading({ ...isLoading, room: true })
      const res = await locationsUpdate.columns.getRoom(get(selectedFloor, 'actualID', null))
      if (res.success > 0) {
        const room = get(res, 'data.roomList', []).map(d => ({ ...d, label: d.formioRoomName, value: d.formioroomId }))
        // const sorted = orderBy(room, [d => d.label && d.label.toLowerCase()], ['asc'])
        setRoomOptions(room)
      }
      setLoading({ ...isLoading, room: false })
    }
  }

  const handleRoomChange = async selectedRoom => {
    setLocationInfo({ ...locationInfo, selectedRoom, selectedTopLevel: null })
    setTopAsset([])
    if (get(selectedRoom, 'value', null) !== null) {
      setLoading({ ...isLoading, asset: true })
      const res = await locationsUpdate.getAssetsbyLocationHierarchy({ woId: null, pagesize: 0, pageindex: 0, searchString: '', formiobuildingId: get(locationInfo, 'selectedBuilding.value', null), formiofloorId: get(locationInfo, 'selectedFloor.actualID', null), formioroomId: get(selectedRoom, 'value', null) })
      if (res.success > 0) {
        const topLevelAssetsOpts = get(res, 'data.list', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
        setTopAsset(topLevelAssetsOpts)
      }
      setLoading({ ...isLoading, asset: false })
    }
  }

  const handleInputChange = (name, value) => setLocationInfo({ ...locationInfo, [name]: value })

  useEffect(() => {
    if (isEdit) {
      if (!editFields.formioroomId && !editFields.formiofloorId) {
        setLocation(locations.BUILDING)
        const selectedBuilding = { label: '', value: editFields.formiobuildingId }
        setLocationInfo({
          building: editFields.formioBuildingName,
          selectedBuilding,
        })
      } else if (!editFields.formioroomId) {
        setLocation(locations.FLOOR)
        const building = buildingOptions.find(d => d.value === editFields.formiobuildingId)
        const selectedFloor = { label: '', value: editFields.formiofloorId }
        setLocationInfo({
          selectedBuilding: building,
          selectedFloor,
          floor: editFields.formioFloorName,
        })
      } else {
        setLocation(locations.ROOM)
        const building = buildingOptions.find(d => d.value === editFields.formiobuildingId)
        setLoading({ ...isLoading, floor: true })
        if (get(building, 'value', null) !== null) {
          ;(async () => {
            try {
              const res = await locationsUpdate.columns.getFloorDropdown(get(editFields, 'formiobuildingId', null))
              if (res.success > 0) {
                const selectFloor = get(res, 'data.floorList', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formioFloorName, actualID: d.formiofloorId }))
                const floor = selectFloor.find(d => d.actualID === editFields.formiofloorId)
                setFloorOptions(selectFloor)
                const selectedRoom = { label: '', value: editFields.formioroomId }
                setLocationInfo({
                  selectedBuilding: building,
                  selectedFloor: floor,
                  selectedRoom,
                  room: editFields.formioRoomName,
                })
              }
              setLoading({ ...isLoading, floor: false })
            } catch (error) {
              console.log(error)
            }
          })()
        }
      }
    }
  }, [isEdit, editFields, buildingOptions])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={isChange ? 'Change Location' : `Edit Location`} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            {(mode.isFloor || mode.isRoom || isChange) && (
              <MinimalAutoComplete value={get(locationInfo, 'selectedBuilding', '')} onChange={value => handleBuildingChange(value)} placeholder='Select building' options={buildingOptions} label='Building' isClearable w={100} error={error.formiobuildingId} onFocus={() => setError({ ...error, formiobuildingId: null })} isLoading={buildingLoading} />
            )}
            {mode.isBuilding && !isChange && <MinimalInput value={get(locationInfo, 'building', '') || ''} onChange={value => handleInputChange('building', value)} label='Building' error={error.locationName} placeholder='Add building' baseStyles={{ marginRight: 0 }} onFocus={() => setError({ ...error, locationName: null })} />}
            {(mode.isRoom || isChange) && (
              <MinimalAutoComplete value={get(locationInfo, 'selectedFloor', '') || ''} onChange={value => handleFloorChange(value)} label='Floor' placeholder='Select floor' options={floorOptions} isClearable w={100} error={error.formiofloorId} onFocus={() => setError({ ...error, formiofloorId: null })} isLoading={isLoading.floor} />
            )}
            {mode.isFloor && <MinimalInput value={get(locationInfo, 'floor', '') || ''} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add floor' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
            {mode.isRoom && <MinimalInput value={get(locationInfo, 'room', '') || ''} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add room' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
            {isChange && <MinimalAutoComplete value={get(locationInfo, 'selectedRoom', '') || ''} onChange={value => handleRoomChange(value)} label='Room' placeholder='Select room' options={roomOptions} isClearable w={100} error={error.formioroomId} onFocus={() => setError({ ...error, formioroomId: null })} isLoading={isLoading.room} />}
            {isChange && showTopLevel && (
              <MinimalAutoComplete
                value={get(locationInfo, 'selectedTopLevel', '') || ''}
                onChange={value => handleInputChange('selectedTopLevel', value)}
                label='Top-Level Component'
                placeholder='Select Top-Level Component'
                options={topAsset}
                isClearable
                w={100}
                error={error.toplevelcomponentAssetId}
                onFocus={() => setError({ ...error, toplevelcomponentAssetId: null })}
                isLoading={isLoading.asset}
              />
            )}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text={isEdit ? 'Save' : 'Change'} loadingText={isEdit ? 'Saving...' : 'Changing...'} onClick={() => validateForm()} disabled={isChangeLoading || isEditLoading} loading={isChangeLoading || isEditLoading} />
      </div>
    </Drawer>
  )
}

export default MoveColumn
