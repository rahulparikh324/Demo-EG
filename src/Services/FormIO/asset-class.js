import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const assetClass = {
  nameplateInfo: {
    get: ({ id }) => api(`${URL.assetClass.nameplateInfo.get}/${id}`),
    update: payload => api(`${URL.assetClass.nameplateInfo.update}`, payload, true),
  },
  form: {
    getEquipmentList: payload => api(`${URL.assetClass.form.getEquipmentList}`, payload, true),
    upload: payload => api(`${URL.assetClass.form.uploadAssetClassDocument}`, payload, true),
  },
  maintenanceEstimate: {
    get: payload => api(`${URL.assetClass.maintenanceEstimate.get}`, payload, true),
  },
}

export default assetClass
