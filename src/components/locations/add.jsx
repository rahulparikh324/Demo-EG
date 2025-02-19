import React, { useMemo, useState, useEffect } from 'react'

import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { MinimalButtonGroup } from 'components/common/buttons'
import { MinimalInput, MinimalAutoComplete } from 'components/Assets/components'

import { locationOptions, locations, validate } from 'components/locations/utils'
import { get, isEmpty, orderBy } from 'lodash'

import locationsUpdate from 'Services/locations'
import useFetchData from 'hooks/fetch-data'

const AddEditLocation = ({ open, onClose, isEdit, editFields = {}, option, isChange = false, reFetch, selectedAsset, showTopLevel, resetSelection = () => {}, setEditMode = () => {} }) => {
  //
  const title = isEdit ? 'Edit Location' : isChange ? 'Change Location' : 'Add Location'
  const [location, setLocation] = useState(locations.BUILDING)
  const [locationInfo, setLocationInfo] = useState({ building: '', floor: '', room: '', selectedBuilding: '', selectedFloor: '', selectedRoom: '', selectedTopLevel: '' })
  const mode = { isBuilding: location === locations.BUILDING, isFloor: location === locations.FLOOR, isRoom: location === locations.ROOM }
  const [error, setError] = useState({})
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])
  const [topAsset, setTopAsset] = useState([])
  const [isTopLevelAssetOptionsLoading, setTopLevelAssetOptionsLoading] = useState(false)
  const [buildingOptions, setBuildingOptions] = useState([])
  //
  const handleInputChange = (name, value) => setLocationInfo({ ...locationInfo, [name]: value })
  // const buildingOptions = useMemo(() => {
  //   const buildings = option.map(d => ({
  //     ...d,
  //     label: d.formioBuildingName,
  //     value: d.formiobuildingId,
  //   }))
  //   return buildings
  // }, [option])

  const formatBuildings = list => {
    const newbuildings = orderBy(
      [...list].map(d => ({ ...d, name: d.formioBuildingName })),
      [d => d.name && d.name.toLowerCase()],
      ['asc']
    )

    const buildings = newbuildings.map(d => ({
      ...d,
      label: d.formioBuildingName,
      value: d.formiobuildingId,
    }))
    setBuildingOptions(buildings)
    return buildings
  }

  const {} = useFetchData({ fetch: locationsUpdate.formOptions, formatter: d => formatBuildings(get(d, 'data.buildings', [])), defaultValue: [] })

  const handleBuildingChange = selectedBuilding => {
    const floorOpts = get(selectedBuilding, 'floors', []).map(d => ({ ...d, label: d.formioFloorName, value: d.formioFloorName, actualID: d.formiofloorId }))
    setFloorOptions(floorOpts)
    setRoomOptions([])
    setTopAsset([])
    setLocationInfo({ ...locationInfo, selectedBuilding, selectedTopLevel: null, selectedFloor: null, selectedRoom: null })
  }

  const handleFloorChange = selectedFloor => {
    const roomOpts = get(selectedFloor, 'rooms', [])?.map(d => ({ ...d, label: d.formioRoomName, value: d.formioRoomName, formiobuildingId: selectedFloor.formiobuildingId, actualID: d.formioroomId }))
    setRoomOptions(roomOpts)
    setTopAsset([])
    setLocationInfo({ ...locationInfo, selectedFloor, selectedRoom: null, selectedTopLevel: null })
  }
  const handleRoomChange = async room => {
    setLocationInfo({ ...locationInfo, selectedRoom: room, selectedTopLevel: null })
    if (isEmpty(room)) return setTopAsset([])
    setTopLevelAssetOptionsLoading(true)
    try {
      const res = await locationsUpdate.getAssetsbyLocationHierarchy({ woId: null, pagesize: 0, pageindex: 0, searchString: '', formiobuildingId: room.formiobuildingId, formiofloorId: room.formiofloorId, formioroomId: room.formioroomId })
      const topLevelAssetsOpts = get(res, 'data.list', []).map(d => ({ ...d, label: d.assetName, value: d.assetId }))
      setTopAsset(topLevelAssetsOpts)
      setTopLevelAssetOptionsLoading(false)
    } catch (error) {
      console.log(error)
      setTopAsset([])
      setTopLevelAssetOptionsLoading(false)
    }
  }

  const validateForm = async (mode, isChange, showTopLevel, isEdit, locationInfo, location, selectedAsset) => {
    const isValid = await validate(mode, isChange, showTopLevel, isEdit, locationInfo, location, selectedAsset, editFields)
    const { isValided, payload } = isValid
    setError(isValided)
    if (isValided === true) isEdit ? submitData(payload) : isChange ? handleChangeLocation(payload) : addLocationData(payload)
  }

  const updatePostSuccess = () => {
    onClose()
    reFetch()
  }
  const { loading: isLoading, mutate: updateLocation } = usePostData({ executer: locationsUpdate.updateLocationDetails, postSuccess: updatePostSuccess, message: { success: 'Location Edited Successfully!', error: 'Something went wrong' } })
  const submitData = async updateLocationpayload => updateLocation(updateLocationpayload)

  const changePostSuccess = () => {
    onClose()
    reFetch()
    resetSelection()
    setEditMode(false)
  }
  const { loading: isChangeLoading, mutate: changeLocation } = usePostData({ executer: locationsUpdate.changeSelectedAssetsLocation, postSuccess: changePostSuccess, message: { success: 'Location Changed Successfully!', error: 'Something went wrong' } })
  const handleChangeLocation = async changeLocationPayload => changeLocation(changeLocationPayload)

  const addPostSuccess = () => {
    onClose()
    reFetch()
  }
  const { loading: isAddLoading, mutate: addLocation } = usePostData({ executer: locationsUpdate.addAssetLocationData, postSuccess: addPostSuccess, message: { success: 'Location Added Successfully!', error: 'Something went wrong' } })
  const addLocationData = async addLocationPayload => addLocation(addLocationPayload)

  useEffect(() => {
    if (isEdit) {
      if (!editFields.formioroomId && !editFields.formiofloorId) {
        setLocation(locations.BUILDING)
        const selectedBuilding = { label: '', value: editFields.formiobuildingId }
        setLocationInfo({
          building: editFields.name,
          selectedBuilding,
        })
      } else if (!editFields.formioroomId) {
        setLocation(locations.FLOOR)
        const building = buildingOptions.find(d => d.value === editFields.formiobuildingId)
        const selectedFloor = { label: '', value: editFields.formiofloorId }
        setLocationInfo({
          selectedBuilding: building,
          selectedFloor,
          floor: editFields.name,
        })
      } else {
        setLocation(locations.ROOM)
        const building = buildingOptions.find(d => d.value === editFields.formiobuildingId)
        const floors = buildingOptions.find(d => d.formiobuildingId === building?.value)
        const selectFloor = get(floors, 'floors', []).map(d => ({ label: d.formioFloorName, value: d.formiofloorId }))
        const floor = selectFloor.find(d => d.value === editFields.formiofloorId)
        const selectedRoom = { label: '', value: editFields.formioroomId }
        setFloorOptions(selectFloor)
        setLocationInfo({
          selectedBuilding: building,
          selectedFloor: floor,
          selectedRoom,
          room: editFields.name,
        })
      }
    }
  }, [isEdit, editFields, buildingOptions])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={title} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            {!isChange && !isEdit && <MinimalButtonGroup label='Select location' value={location} onChange={value => setLocation(value)} options={locationOptions} w={100} />}
            {mode.isBuilding && !isChange && <MinimalInput value={get(locationInfo, 'building', '') || ''} onChange={value => handleInputChange('building', value)} label='Building' error={error.locationName} placeholder='Add building' baseStyles={{ marginRight: 0 }} onFocus={() => setError({ ...error, locationName: null })} />}
            {(mode.isFloor || mode.isRoom || isChange) && (
              <MinimalAutoComplete value={get(locationInfo, 'selectedBuilding', '')} onChange={value => handleBuildingChange(value)} placeholder='Select building' options={buildingOptions} label='Building' isClearable w={100} error={error.formiobuildingId} onFocus={() => setError({ ...error, formiobuildingId: null })} />
            )}
            {mode.isFloor && <MinimalInput value={get(locationInfo, 'floor', '') || ''} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add floor' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
            {(mode.isRoom || isChange) && <MinimalAutoComplete value={get(locationInfo, 'selectedFloor', '') || ''} onChange={value => handleFloorChange(value)} label='Floor' placeholder='Select floor' options={floorOptions} isClearable w={100} error={error.formiofloorId} onFocus={() => setError({ ...error, formiofloorId: null })} />}
            {mode.isRoom && <MinimalInput value={get(locationInfo, 'room', '') || ''} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add room' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
            {isChange && <MinimalAutoComplete value={get(locationInfo, 'selectedRoom', '') || ''} onChange={value => handleRoomChange(value)} label='Room' placeholder='Select room' options={roomOptions} isClearable w={100} error={error.formioroomId} onFocus={() => setError({ ...error, formioroomId: null })} />}
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
                isLoading={isTopLevelAssetOptionsLoading}
              />
            )}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton
          variant='contained'
          color='primary'
          text={isEdit ? 'Save' : isChange ? 'Change' : 'Add'}
          loadingText={isEdit ? 'Saving...' : isChange ? 'Changing...' : 'Adding...'}
          onClick={() => validateForm(mode, isChange, showTopLevel, isEdit, locationInfo, location, selectedAsset)}
          disabled={isLoading || isChangeLoading || isAddLoading}
          loading={isLoading || isChangeLoading || isAddLoading}
        />
      </div>
    </Drawer>
  )
}

export default AddEditLocation
