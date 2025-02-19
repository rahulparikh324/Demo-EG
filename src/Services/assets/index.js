import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const asset = {
  attachments: {
    get: payload => api(`${URL.asset.attachments.get}`, payload, true),
    upload: payload => api(`${URL.asset.attachments.upload}`, payload, true),
    delete: payload => api(`${URL.asset.attachments.delete}`, payload, true),
    UploadClusterOneLinePdf: payload => api(`${URL.asset.attachments.UploadClusterOneLinePdf}`, payload, true),
    GetUploadedOneLinePdfData: siteID => api(`${URL.asset.attachments.GetUploadedOneLinePdfData}?siteId=${siteID}`),
  },
  subComponents: {
    get: payload => api(`${URL.asset.subComponents.get}`, payload, true),
    update: payload => api(`${URL.asset.subComponents.update}`, payload, true),
    delete: payload => api(`${URL.asset.subComponents.delete}`, payload, true),
    addNew: payload => api(`${URL.asset.subComponents.addNew}`, payload, true),
    getSubComponentsToAdd: () => api(`${URL.asset.subComponents.getSubComponentsToAdd}`),
  },
  circuit: {
    get: payload => api(`${URL.asset.circuit.get}`, payload, true),
    updateFedByCircuit: payload => api(`${URL.asset.circuit.updateFedByCircuit}`, payload, true),
    updateFeedingCircuit: payload => api(`${URL.asset.circuit.updateFeedingCircuit}`, payload, true),
    getFeedingCircuit: payload => api(`${URL.asset.circuit.getFeedingCircuit}`, payload, true),
  },
  inspections: {
    maintenance: payload => api(`${URL.asset.inspections.maintenance}`, payload, true),
    updateOBWOStatus: payload => api(`${URL.asset.inspections.updateOBWOStatus}`, payload, true),
  },
  photos: {
    getAllImagesForAsset: assetId => api(`${URL.asset.photos.getAllImagesForAsset}?asset_id=${assetId}`),
    deleteOrSetAsProfile: payload => api(`${URL.asset.photos.deleteOrSetAsProfile}`, payload, true),
  },
  temp: {
    getDetails: payload => api(`${URL.asset.temp.getDetails}`, payload, true),
  },
  uploadBulkMainAssets: payload => api(`${URL.asset.uploadBulkMainAssets}`, payload, true),
}

export default asset
