import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const location = {
  get: payload => api(`${URL.locations.get}`, payload, true),
  formOptions: payload => api(`${URL.locations.formOptions}`, payload, true),
  addUpdate: payload => api(`${URL.locations.addUpdate}`, payload, true),
  getAssets: payload => api(`${URL.locations.getAssets}`, payload, true),
  getAssetsbyLocationHierarchy: payload => api(`${URL.locations.getAssetsbyLocationHierarchy}`, payload, true),
  deleteLocationDetails: payload => api(`${URL.locations.deleteLocationDetails}`, payload, true),
  updateLocationDetails: payload => api(`${URL.locations.updateLocationDetails}`, payload, true),
  changeSelectedAssetsLocation: payload => api(`${URL.locations.changeSelectedAssetsLocation}`, payload, true),
  addAssetLocationData: payload => api(`${URL.locations.addAssetLocationData}`, payload, true),
  workOrder: {
    get: ({ id }) => api(`${URL.locations.workOrder.get}?wo_id=${id}`),
    getV2: ({ id }) => api(`${URL.locations.workOrder.getV2}?wo_id=${id}`),
    getAssets: payload => api(`${URL.locations.workOrder.getAssets}`, payload, true),
    addTemp: payload => api(`${URL.locations.workOrder.addTemp}`, payload, true),
    addExisting: payload => api(`${URL.locations.workOrder.addExisting}`, payload, true),
    delete: payload => api(`${URL.locations.workOrder.delete}`, payload, true),
    getActive: ({ id }) => api(`${URL.locations.workOrder.getActive}?wo_id=${id}`),
    editLocation: payload => api(`${URL.locations.workOrder.editLocation}`, payload, true),
  },
  workOrderV2: {
    get: payload => api(`${URL.locations.workOrderV2.get}`, payload, true),
    addTemp: payload => api(`${URL.locations.workOrderV2.addTemp}`, payload, true),
    addExisting: payload => api(`${URL.locations.workOrderV2.addExisting}`, payload, true),
    getDropdownList: payload => api(`${URL.locations.workOrderV2.getDropdownList}`, payload, true),
    getAssets: payload => api(`${URL.locations.workOrderV2.getAssets}`, payload, true),
  },
  columns: {
    getBuilding: () => api(`${URL.locations.columns.getBuilding}`),
    getFloor: id => api(`${URL.locations.columns.getFloor}/${id}`),
    getFloorDropdown: id => api(`${URL.locations.columns.getFloorDropdown}/${id}`),
    getRoom: id => api(`${URL.locations.columns.getRoom}/${id}`),
  },
}

export default location
