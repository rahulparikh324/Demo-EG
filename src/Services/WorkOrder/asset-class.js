import post from '../postService'
import get from '../getService'
import URL from 'Constants/apiUrls'

const apiCall = async (url, reqData, isPost) => {
  try {
    const res = isPost ? await post(url, reqData) : await get(url)
    return res.data
  } catch (error) {
    return error
  }
}

const assetClass = {
  getAllAssetClassToAdd: payload => apiCall(`${URL.getAssetsClassToAssign}`, payload, true),
  assignAssetClassToWorkOrder: payload => apiCall(`${URL.assignAssetClassToWO}`, payload, true),
  getAssetsToAssignInWO: ({ type }) => apiCall(`${URL.getAssetsToAssigninWO}/${type}`),
  getAllAssetClassCodes: () => apiCall(`${URL.getAllAssetClassCodes}`),
  getAssetsToAssignInMWOInspection: payload => apiCall(`${URL.getAssetsToAssigninMWOInspection}`, payload, true),
  assignMultipleAssetToInspection: payload => apiCall(`${URL.assignMultipleAssetToInspection}`, payload, true),
  updateGroupName: payload => apiCall(`${URL.updateGroupName}`, payload, true),
}

export default assetClass
