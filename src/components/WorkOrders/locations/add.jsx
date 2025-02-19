import React, { useState } from 'react'

import useFetchData from 'hooks/fetch-data'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { MinimalButtonGroup } from 'components/common/buttons'
import { MinimalInput, MinimalAutoComplete } from 'components/Assets/components'

import { locationOptions, locations } from 'components/locations/utils'
import { get, isEmpty } from 'lodash'
import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

import locationService from 'Services/locations'

const Add = ({ open, onClose, isNew, options, reFetch, woId }) => {
  const [location, setLocation] = useState(locations.BUILDING)
  const mode = { isBuilding: location === locations.BUILDING, isFloor: location === locations.FLOOR, isRoom: location === locations.ROOM }
  const [locationInfo, setLocationInfo] = useState({ building: '', floor: '', room: '', selectedBuilding: null, selectedFloor: null, selectedRoom: null })
  const [error, setError] = useState({})
  const [buildingOptions, setBuildingOptions] = useState([])
  const formatWOBuildings = list => {
    const buildings = [...list].map(d => ({ ...d, label: d.buildingName, value: d.tempMasterBuildingId }))
    setBuildingOptions(buildings)
  }
  const { loading: buildingLoading } = useFetchData({ fetch: locationService.workOrderV2.getDropdownList, payload: { wo_id: woId, is_100_floors_required: false }, formatter: d => formatWOBuildings(get(d, 'data.tempMasterBuildings', [])), defaultValue: [], condition: isNew })
  const [floorOptions, setFloorOptions] = useState([])
  const [roomOptions, setRoomOptions] = useState([])
  const showBuildingDropdown = mode.isFloor || mode.isRoom || !isNew
  // fetcher
  const formatBuildings = list => {
    const buildings = [...list].map(d => ({ ...d, label: d.formioBuildingName, value: d.formioBuildingName }))
    return buildings
  }
  const { loading, data } = useFetchData({ fetch: locationService.get, formatter: d => formatBuildings(get(d, 'data.buildings', [])), defaultValue: [], condition: !isNew })
  // change handlers
  const handleInputChange = (name, value) => setLocationInfo({ ...locationInfo, [name]: value })
  const handleBuildingChange = building => {
    if (isEmpty(building)) {
      setFloorOptions([])
      setRoomOptions([])
      setLocationInfo({ ...locationInfo, selectedBuilding: building, selectedFloor: null, selectedRoom: null })
      return
    }
    const buildings = isNew ? buildingOptions : data
    const current = buildings.find(d => d.label === building.label)
    const floors = isNew ? current.tempMasterFloor : current.floors
    const floorOpts = []
    floors.forEach(d => {
      floorOpts.push({
        label: isNew ? d.floorName : d.formioFloorName,
        value: isNew ? Math.random() : d.formiofloorId,
        rooms: isNew ? d.tempMasterRooms : d.rooms,
        actualId: isNew ? d.tempMasterFloorId : d.formiofloorId,
      })
    })
    setFloorOptions(floorOpts)
    setLocationInfo({ ...locationInfo, selectedBuilding: building, selectedFloor: null, selectedRoom: null })
  }
  const handleFloorChange = floor => {
    const roomOpts = []
    get(floor, 'rooms', [])?.forEach(d => {
      roomOpts.push({
        label: isNew ? d.roomName : d.formioRoomName,
        value: isNew ? d.tempMasterRoomId : d.formioroomId,
      })
    })
    setRoomOptions(roomOpts)
    setLocationInfo({ ...locationInfo, selectedFloor: floor, selectedRoom: null })
  }
  //
  const postSuccess = () => {
    reFetch()
    onClose()
  }
  const { loading: isLoading, mutate: addTempLocation } = usePostData({ executer: locationService.workOrderV2.addTemp, postSuccess, postError: onClose, message: { success: 'Location Added Successfully!', error: 'Error adding location ! Please try again' } })
  const { loading: isAddExistingLoading, mutate: addExistingLocation } = usePostData({ executer: locationService.workOrderV2.addExisting, postSuccess, postError: onClose, message: { success: 'Location Added Successfully!', error: 'Error adding location ! Please try again' } })
  const validate = async () => {
    const schemaObj = { building: yup.string().required('Building is required !') }
    if (mode.isFloor || mode.isRoom || !isNew) schemaObj.floor = yup.string().required('Floor is required !')
    if (mode.isRoom || !isNew) schemaObj.room = yup.string().required('Room is required !')
    const schema = yup.object().shape(schemaObj)
    const payload = {
      building: mode.isBuilding && isNew ? get(locationInfo, 'building', '') : get(locationInfo, 'selectedBuilding.label', ''),
      floor: mode.isFloor && isNew ? get(locationInfo, 'floor', '') : get(locationInfo, 'selectedFloor.label', ''),
      room: mode.isRoom && isNew ? get(locationInfo, 'room', '') : get(locationInfo, 'selectedRoom.label', ''),
    }
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) submit()
  }
  const submit = async () => {
    const payload = { woId }
    if (isNew) {
      payload.locationName = mode.isBuilding ? get(locationInfo, 'building', '') : mode.isFloor ? get(locationInfo, 'floor', '') : get(locationInfo, 'room', '')
      payload.locationType = location
      if (mode.isFloor || mode.isRoom) payload.tempMasterBuildingId = get(locationInfo, 'selectedBuilding.value', '')
      if (mode.isRoom) payload.tempMasterFloorId = get(locationInfo, 'selectedFloor.actualId', '')
      payload.buildingName = mode.isBuilding ? get(locationInfo, 'building', '') : get(locationInfo, 'selectedBuilding.label', '')
      payload.floorName = mode.isFloor ? get(locationInfo, 'floor', '') : get(locationInfo, 'selectedFloor.label', '')
      payload.roomName = mode.isRoom ? get(locationInfo, 'room', '') : get(locationInfo, 'selectedRoom.label', '')
      addTempLocation(payload)
    } else {
      payload.formiobuildingId = get(locationInfo, 'selectedBuilding.formiobuildingId', '')
      payload.formiofloorId = get(locationInfo, 'selectedFloor.value', '')
      payload.formioroomId = get(locationInfo, 'selectedRoom.value', '')
      payload.formioBuildingName = get(locationInfo, 'selectedBuilding.label', '')
      payload.formioFloorName = get(locationInfo, 'selectedFloor.label', '')
      payload.formioRoomName = get(locationInfo, 'selectedRoom.label', '')
      addExistingLocation(payload)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Add Location' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            {isNew && <MinimalButtonGroup label='Select location' value={location} onChange={value => setLocation(value)} options={locationOptions} w={100} />}
            {mode.isBuilding && isNew && <MinimalInput value={get(locationInfo, 'building', '')} onChange={value => handleInputChange('building', value)} label='Building' error={error.building} placeholder='Add building' baseStyles={{ marginRight: 0 }} onFocus={() => setError({ ...error, building: null })} />}
            {showBuildingDropdown && (
              <MinimalAutoComplete
                isLoading={isNew ? buildingLoading : loading}
                value={get(locationInfo, 'selectedBuilding', null)}
                onChange={value => handleBuildingChange(value)}
                placeholder='Select building'
                options={isNew ? buildingOptions : data}
                label='Building'
                isClearable
                w={100}
                error={error.building}
                onFocus={() => setError({ ...error, building: null })}
              />
            )}
            {mode.isFloor && <MinimalInput value={get(locationInfo, 'floor', '')} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add floor' baseStyles={{ marginRight: 0 }} error={error.floor} onFocus={() => setError({ ...error, floor: null })} />}
            {(mode.isRoom || !isNew) && <MinimalAutoComplete value={get(locationInfo, 'selectedFloor', null)} onChange={value => handleFloorChange(value)} label='Floor' placeholder='Select floor' options={floorOptions} isClearable w={100} error={error.floor} onFocus={() => setError({ ...error, floor: null })} />}
            {mode.isRoom && <MinimalInput value={get(locationInfo, 'room', '')} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add room' baseStyles={{ marginRight: 0 }} error={error.room} onFocus={() => setError({ ...error, room: null })} />}
            {!isNew && <MinimalAutoComplete value={get(locationInfo, 'selectedRoom', null)} onChange={value => handleInputChange('selectedRoom', value)} label='Room' placeholder='Select room' options={roomOptions} isClearable w={100} error={error.room} onFocus={() => setError({ ...error, room: null })} />}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' onClick={validate} disabled={isLoading || isAddExistingLoading} loading={isLoading || isAddExistingLoading} />
      </div>
    </Drawer>
  )
}

export default Add
