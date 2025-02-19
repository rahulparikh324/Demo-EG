import { useState, useEffect } from 'react'

import Drawer from '@material-ui/core/Drawer'

import { FormTitle } from 'components/Maintainance/components'
import { MinimalButton } from 'components/common/buttons'
import { MinimalInput } from 'components/Assets/components'

import { get, isEmpty } from 'lodash'

import { Toast } from 'Snackbar/useToast'
import { snakifyKeys } from 'helpers/formatters'
import locations from 'Services/locations'

const EditLocation = ({ woId, open, onClose, isEdit, editFields, reFetch }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({})
  const [locationInfo, setLocationInfo] = useState({ building: '', floor: '', room: '' })
  const [preTxt, setPreTxt] = useState('')

  const handleInputChange = (name, value) => setLocationInfo({ ...locationInfo, [name]: value })

  const validateForm = () => {
    let error = {}

    if (editFields && editFields.type == 1) {
      if (isEmpty(locationInfo.building)) error = { ...error, locationName: 'Building is required !' }
    } else if (editFields && editFields.type == 2) {
      if (isEmpty(locationInfo.floor)) error = { ...error, locationName: 'Floor is required !' }
    } else if (editFields && editFields.type == 3) {
      if (isEmpty(locationInfo.room)) error = { ...error, locationName: 'Room is required !' }
    }

    if (!isEmpty(error)) {
      setError({ locationName: { error: true, msg: error.locationName } })
      return
    }

    let payload = { editing_location_flag: editFields.type, wo_id: woId }
    if (editFields && editFields.type == 1) {
      payload = { ...payload, location_name: locationInfo.building, temp_master_building_id: editFields?.locationData.tempMasterBuildingId }
    } else if (editFields && editFields.type == 2) {
      payload = { ...payload, location_name: locationInfo.floor, temp_master_building_id: editFields.locationData.tempMasterBuildingId, temp_master_floor_id: editFields.locationData.tempMasterFloorId }
    } else if (editFields && editFields.type == 3) {
      payload = { ...payload, location_name: locationInfo.room, temp_master_building_id: editFields.locationData.tempMasterBuildingId, temp_master_floor_id: editFields.locationData.tempMasterFloorId, temp_master_room_id: editFields.locationData.tempMasterRoomId }
    }

    submitData(payload)
  }

  const submitData = async payload => {
    setIsLoading(true)
    try {
      const res = await locations.workOrder.editLocation(snakifyKeys(payload))
      if (res.success > 0) {
        Toast.success('Location updated successfully !')
      } else Toast.error(res.message)
    } catch (error) {
      console.log(error)
      Toast.error('Something went wrong !')
    }
    setIsLoading(false)
    onClose()
    reFetch()
  }

  useEffect(() => {
    if (editFields && editFields.type === 1) {
      setPreTxt(editFields?.locationData.buildingName)
      setLocationInfo({ ...locationInfo, ['building']: editFields?.locationData.buildingName })
    } else if (editFields && editFields.type === 2) {
      setPreTxt(editFields?.locationData.floorName)
      setLocationInfo({ ...locationInfo, ['floor']: editFields?.locationData.floorName })
    } else if (editFields && editFields.type === 3) {
      setPreTxt(editFields?.locationData.roomName)
      setLocationInfo({ ...locationInfo, ['room']: editFields?.locationData.roomName })
    }
  }, [editFields])

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <FormTitle title='Edit Location' style={{ width: '100%', minWidth: '450px' }} closeFunc={onClose} />
      <div className='table-responsive dashboardtblScroll' id='style-1' style={{ maxHeight: 'calc(100vh - 65px)', height: 'calc(100vh - 65px)', background: '#efefef' }}>
        <div style={{ padding: '10px' }}>
          <div style={{ padding: '16px', background: '#fff', borderRadius: '4px' }}>
            {editFields && editFields.type == 1 && <MinimalInput value={get(locationInfo, 'building', '')} onChange={value => handleInputChange('building', value)} label='Building' error={error.locationName} placeholder='Add building' baseStyles={{ marginRight: 0 }} onFocus={() => setError({ ...error, locationName: null })} />}
            {editFields && editFields.type == 2 && <MinimalInput value={get(locationInfo, 'floor', '')} onChange={value => handleInputChange('floor', value)} label='Floor' placeholder='Add floor' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
            {editFields && editFields.type == 3 && <MinimalInput value={get(locationInfo, 'room', '')} onChange={value => handleInputChange('room', value)} label='Room' placeholder='Add room' baseStyles={{ marginRight: 0 }} error={error.locationName} onFocus={() => setError({ ...error, locationName: null })} />}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center' style={{ borderTop: '1px solid #A6A6A660', borderBottom: 'none', background: '#fff', marginTop: 'auto', padding: '12px' }}>
        <MinimalButton variant='contained' color='default' text='Cancel' onClick={onClose} />
        <MinimalButton
          variant='contained'
          color='primary'
          text={isEdit ? 'Save' : 'Add'}
          loadingText={isEdit ? 'Saving...' : 'Adding...'}
          onClick={() => validateForm(locationInfo)}
          disabled={isLoading || preTxt === (editFields?.type === 1 ? locationInfo.building : editFields?.type === 2 ? locationInfo.floor : locationInfo.room)}
          loading={isLoading}
        />
      </div>
    </Drawer>
  )
}

export default EditLocation
