import React, { useState } from 'react'
import { get } from 'lodash'
import usePostData from 'hooks/post-data'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalInput } from 'components/Assets/components'
import { locations } from 'components/locations/utils'
import { MinimalButton } from 'components/common/buttons'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'
import locationsUpdate from 'Services/locations'

const AddColumn = ({ open, onClose, title, mode, ancherObj, floorRefetch, roomRefetch, buildingRefetch }) => {
  const [locationInfo, setLocationInfo] = useState({ building: get(ancherObj, 'formioBuildingName', ''), floor: get(ancherObj, 'formioFloorName', ''), room: '', selectedBuildingId: get(ancherObj, 'formiobuildingId', null), selectedFloorId: get(ancherObj, 'formiofloorId', null) })
  const [error, setError] = useState({})
  const location = mode.isBuilding ? locations.BUILDING : mode.isFloor ? locations.FLOOR : locations.ROOM

  const handleInputChange = (name, value) => setLocationInfo({ ...locationInfo, [name]: value })

  const validateForm = async () => {
    const schemaObj = {}

    if (mode.isBuilding) {
      schemaObj.locationName = yup.string().required('Building is required !')
    } else if (mode.isFloor) {
      schemaObj.locationName = yup.string().required('Floor is required !')
    } else if (mode.isRoom) {
      schemaObj.locationName = yup.string().required('Room is required !')
    }

    const payload = {}

    payload.formiobuildingId = mode.isBuilding ? null : get(locationInfo, 'selectedBuildingId', null)
    payload.formiofloorId = mode.isRoom ? get(locationInfo, 'selectedFloorId', null) : null
    payload.locationName = mode.isBuilding ? locationInfo.building : mode.isFloor ? locationInfo.floor : locationInfo.room
    payload.locationType = location
    payload.buildingName = mode.isBuilding ? locationInfo.building : get(locationInfo, 'building', '')
    payload.floorName = mode.isFloor ? locationInfo.floor : get(locationInfo, 'floor', '')
    payload.roomName = mode.isRoom ? locationInfo.room : get(locationInfo, 'room', '')

    const schema = yup.object().shape(schemaObj)
    const isValid = await validateSchema(payload, schema)
    setError(isValid)
    if (isValid === true) addLocationData(payload)
  }

  const postSuccess = () => {
    if (mode.isBuilding) {
      buildingRefetch()
    } else if (mode.isFloor) {
      floorRefetch()
    } else {
      roomRefetch()
    }
    onClose()
  }

  const { loading: isAddLoading, mutate: addLocation } = usePostData({ executer: locationsUpdate.addAssetLocationData, postSuccess, message: { success: 'Location Added Successfully!', error: 'Something went wrong' } })
  const addLocationData = async addLocationPayload => addLocation(addLocationPayload)

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title={title} style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            <MinimalInput value={get(locationInfo, 'building', '') || ''} onChange={value => handleInputChange('building', value)} label='Building' error={mode.isBuilding && error.locationName} placeholder='Add building' baseStyles={{ marginRight: 0 }} onFocus={() => setError({ ...error, locationName: null })} disabled={!mode.isBuilding} />
            {(mode.isFloor || mode.isRoom) && (
              <MinimalInput value={get(locationInfo, 'floor', '') || ''} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add floor' baseStyles={{ marginRight: 0 }} error={mode.isFloor && error.locationName} onFocus={() => setError({ ...error, locationName: null })} disabled={mode.isRoom} />
            )}
            {mode.isRoom && <MinimalInput value={get(locationInfo, 'room', '') || ''} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add room' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton variant='contained' color='primary' text='Add' loadingText='Adding...' onClick={() => validateForm()} disabled={isAddLoading} loading={isAddLoading} />
      </div>
    </Drawer>
  )
}

export default AddColumn
