import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const health = {
  addUpdateAssetGroup: payload => api(`${URL.health.createUpdateAssetGroup}`, payload, true),
  getAssetGroupsDropdownList: () => api(`${URL.health.assetGroupsDropdownList}`),
  getAllAssetGroupsList: payload => api(`${URL.health.getAllAssetGroupsList}`, payload, true),
  assetListDropdownForAssetGroup: payload => api(`${URL.health.assetListDropdownForAssetGroup}`, payload, true),
}

export default health
