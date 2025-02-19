import post from '../postService'
import get from '../getService'
import URL from 'Constants/apiUrls'
import { camelizeKeys } from 'helpers/formatters'

const apiCall = async (url, reqData, isPost) => {
  try {
    const res = isPost ? await post(url, reqData) : await get(url)
    return camelizeKeys(res.data)
  } catch (error) {
    return error
  }
}

const onBoardingWorkorder = {
  uploadAsset: payload => apiCall(`${URL.onBoardingWorkorder.uploadAsset}`, payload, true),
  uploadPhoto: payload => apiCall(`${URL.onBoardingWorkorder.uploadPhoto}`, payload, true),
  uploadIrPhoto: payload => apiCall(`${URL.onBoardingWorkorder.uploadIRPhotos}`, payload, true),
  deleteAsset: payload => apiCall(`${URL.onBoardingWorkorder.deleteAsset}`, payload, true),
  updateAssetStatus: payload => apiCall(`${URL.onBoardingWorkorder.updateAssetStatus}`, payload, true),
  updateAssetDetails: payload => apiCall(`${URL.onBoardingWorkorder.updateAssetDetails}`, payload, true),
  updateWorkorderStatus: payload => apiCall(`${URL.onBoardingWorkorder.updateWOStatus}`, payload, true),
  getWorkOrderDetail: ({ id }) => apiCall(`${URL.onBoardingWorkorder.getDetails}/${id}`),
  getAssetDetail: ({ id }) => apiCall(`${URL.onBoardingWorkorder.getAssetDetails}/${id}`),
  getAssetDetails_V2: ({ id }) => apiCall(`${URL.onBoardingWorkorder.getAssetDetails_V2}/${id}`),
  getIrPhotos: ({ id }) => apiCall(`${URL.onBoardingWorkorder.getIRPhotos}?wo_id=${id}`),
  getIRPhotosV2: payload => apiCall(`${URL.onBoardingWorkorder.getIRPhotosV2}`, payload, true),
  updateImageLabel: payload => apiCall(`${URL.issues.updateImageLabel}`, payload, true),
  textRact: payload => apiCall(`${URL.onBoardingWorkorder.textRact}`, payload, true),
  namePlateJsonForm: payload => apiCall(`${URL.onBoardingWorkorder.namePlateJsonForm}`, payload, true),
  responsibleParty: () => apiCall(`${URL.onBoardingWorkorder.responsibleParty}`),
  namePlateJsonForm: payload => apiCall(`${URL.onBoardingWorkorder.namePlateJsonForm}`, payload, true),
  changeQuoteStatus: payload => apiCall(`${URL.onBoardingWorkorder.changeQuoteStatus}`, payload, true),
  downloadReport: payload => apiCall(`${URL.onBoardingWorkorder.downloadReport}`, payload, true),
  downloadMaintenanceReport: payload => apiCall(`${URL.onBoardingWorkorder.downloadMaintenanceReport}`, payload, true),
  fedBy: {
    getList: payload => apiCall(`${URL.onBoardingWorkorder.fedBy.getList}`, payload, true),
    create: payload => apiCall(`${URL.onBoardingWorkorder.fedBy.create}`, payload, true),
    topSubHiararchy: ({ id }) => apiCall(`${URL.onBoardingWorkorder.fedBy.topSubHiararchy}/${id}`),
    topSubHiararchyAssetList: () => apiCall(`${URL.onBoardingWorkorder.fedBy.topSubHiararchy}`),
  },
  pdf: {
    generate: payload => apiCall(`${URL.onBoardingWorkorder.pdf.generate}`, payload, true),
    getStatus: ({ id }) => apiCall(`${URL.onBoardingWorkorder.pdf.getStatus}?wo_id=${id}`),
  },
  existingAsset: {
    get: payload => apiCall(`${URL.onBoardingWorkorder.existingAsset.get}`, payload, true),
    add: payload => apiCall(`${URL.onBoardingWorkorder.existingAsset.add}`, payload, true),
  },
  component: {
    uploadPhoto: payload => apiCall(`${URL.onBoardingWorkorder.component.uploadPhoto}`, payload, true),
    getAssetsByLevel: payload => apiCall(`${URL.onBoardingWorkorder.component.getAssetsByLevel}`, payload, true),
  },
}

export default onBoardingWorkorder
