import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const timeMaterials = {
  getTimeMaterials: payload => api(`${URL.getTimeMaterials}`, payload, true),
  addUpdateTimeMaterial: payload => api(`${URL.addUpdateTimeMaterial}`, payload, true),
  bulkCreateTimeMaterialsWoLine: payload => api(`${URL.bulkCreateTimeMaterialsWoLine}`, payload, true),
}

export default timeMaterials
