import { capitalize, get } from 'lodash'

import * as yup from 'yup'
import { validateSchema } from 'helpers/schemaValidation'

export const locations = {
  BUILDING: 1,
  FLOOR: 2,
  ROOM: 3,
}

export const locationOptions = Object.keys(locations).map(d => ({ label: capitalize(d), value: locations[d] }))

export const validate = async (mode, isChange, showTopLevel, isEdit, locationInfo = {}, location, selectedAsset, editFields) => {
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

  if (isEdit) {
    payload.formiobuildingId = get(locationInfo, 'selectedBuilding.value', '')
    payload.formiofloorId = mode.isBuilding ? 0 : mode.isFloor ? get(editFields, 'formiofloorId', '') : get(locationInfo, 'selectedFloor.actualID', '')
    payload.formioroomId = mode.isRoom ? get(editFields, 'formioroomId', 0) : 0
    payload.formiosectionId = 0
    payload.locationName = mode.isBuilding ? locationInfo.building : mode.isFloor ? locationInfo.floor : locationInfo.room
    payload.editingLocationFlag = location
    payload.buildingName = mode.isBuilding ? locationInfo.building : get(locationInfo, 'selectedBuilding.label', '')
    payload.floorName = mode.isFloor ? locationInfo.floor : get(locationInfo, 'selectedFloor.label', '')
    payload.roomName = mode.isRoom ? locationInfo.room : get(locationInfo, 'selectedRoom.label', '')
  } else if (isChange) {
    payload.formiobuildingId = get(locationInfo, 'selectedBuilding.value', '')
    payload.formiofloorId = get(locationInfo, 'selectedFloor.actualID', '')
    payload.formioroomId = get(locationInfo, 'selectedRoom.actualID', '')
    payload.assetId = selectedAsset
    payload.toplevelcomponentAssetId = showTopLevel ? get(locationInfo, 'selectedTopLevel.value', '') : null
  } else {
    payload.formiobuildingId = mode.isBuilding ? null : get(locationInfo, 'selectedBuilding.value', '')
    payload.formiofloorId = mode.isRoom ? get(locationInfo, 'selectedFloor.actualID', '') : null
    payload.locationName = mode.isBuilding ? locationInfo.building : mode.isFloor ? locationInfo.floor : locationInfo.room
    payload.locationType = location
    payload.buildingName = mode.isBuilding ? locationInfo.building : get(locationInfo, 'selectedBuilding.label', '')
    payload.floorName = mode.isFloor ? locationInfo.floor : get(locationInfo, 'selectedFloor.label', '')
    payload.roomName = mode.isRoom ? locationInfo.room : get(locationInfo, 'selectedRoom.label', '')
  }

  const schema = yup.object().shape(schemaObj)
  const isValid = await validateSchema(payload, schema)

  return { isValided: isValid, payload: payload }
}
