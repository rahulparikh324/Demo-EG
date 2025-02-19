import URL from 'Constants/apiUrls'
import api from 'Services/api-call'

const settings = {
  featuresFlagByCompany: () => api(`${URL.featuresFlagByCompany}`),
  updateFlagForCompany: payload => api(`${URL.updateFlagForCompany}`, payload, true),
}

export default settings
